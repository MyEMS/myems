import uuid
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config
from datetime import datetime, timedelta
from decimal import Decimal


class HybridPowerStationCollection:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        access_control(req)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # query contact dict
        contact_dict = dict()
        query = (" SELECT id, name, uuid "
                 " FROM tbl_contacts ")
        cursor.execute(query)
        rows_contacts = cursor.fetchall()
        if rows_contacts is not None and len(rows_contacts) > 0:
            for row in rows_contacts:
                contact_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}
        # query cost center dict
        cost_center_dict = dict()
        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        # query svg dict
        svg_dict = dict()
        query = (" SELECT id, name, uuid "
                 " FROM tbl_svgs ")
        cursor.execute(query)
        rows_svgs = cursor.fetchall()
        if rows_svgs is not None and len(rows_svgs) > 0:
            for row in rows_svgs:
                svg_dict[row[0]] = {"id": row[0],
                                    "name": row[1],
                                    "uuid": row[2]}

        # query point dict
        point_dict = dict()
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        address, latitude, longitude, rated_capacity, rated_power, "
                 "        contact_id, cost_center_id, svg_id, is_cost_data_displayed, phase_of_lifecycle, description, "
                 "        latitude_point_id, longitude_point_id, svg2_id, svg3_id, svg4_id, svg5_id "
                 " FROM tbl_hybrid_power_stations "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_hybrid_power_stations = cursor.fetchall()

        result = list()
        if rows_hybrid_power_stations is not None and len(rows_hybrid_power_stations) > 0:
            for row in rows_hybrid_power_stations:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "address": row[3],
                               "latitude": row[4],
                               "longitude": row[5],
                               "rated_capacity": row[6],
                               "rated_power": row[7],
                               "contact": contact_dict.get(row[8], None),
                               "cost_center": cost_center_dict.get(row[9], None),
                               "svg": svg_dict.get(row[10], None),
                               "is_cost_data_displayed": bool(row[11]),
                               "phase_of_lifecycle": row[12],
                               "description": row[13],
                               "latitude_point": point_dict.get(row[14], None),
                               "longitude_point": point_dict.get(row[15], None),
                               "svg2": svg_dict.get(row[16], None),
                               "svg3": svg_dict.get(row[17], None),
                               "svg4": svg_dict.get(row[18], None),
                               "svg5": svg_dict.get(row[19], None),
                               "qrcode": 'hybridpowerstation:' + row[2]}
                result.append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_NAME')
        name = str.strip(new_values['data']['name'])

        if 'address' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['address'], str) or \
                len(str.strip(new_values['data']['address'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADDRESS_VALUE')
        address = str.strip(new_values['data']['address'])

        if 'latitude' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['latitude'], float) or
                     isinstance(new_values['data']['latitude'], int)) or \
                new_values['data']['latitude'] < -90.0 or \
                new_values['data']['latitude'] > 90.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LATITUDE_VALUE')
        latitude = new_values['data']['latitude']

        if 'longitude' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['longitude'], float) or
                     isinstance(new_values['data']['longitude'], int)) or \
                new_values['data']['longitude'] < -180.0 or \
                new_values['data']['longitude'] > 180.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LONGITUDE_VALUE')
        longitude = new_values['data']['longitude']

        if 'rated_capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_capacity'], float) or
                     isinstance(new_values['data']['rated_capacity'], int)) or \
                new_values['data']['rated_capacity'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['data']['rated_capacity']

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)) or \
                new_values['data']['rated_power'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = new_values['data']['rated_power']

        if 'contact_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['contact_id'], int) or \
                new_values['data']['contact_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTACT_ID')
        contact_id = new_values['data']['contact_id']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')
        cost_center_id = new_values['data']['cost_center_id']

        if 'svg_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['svg_id'], int) or \
                new_values['data']['svg_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_ID')
        svg_id = new_values['data']['svg_id']

        if 'is_cost_data_displayed' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_cost_data_displayed'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COST_DATA_DISPLAYED')
        is_cost_data_displayed = new_values['data']['is_cost_data_displayed']

        if 'phase_of_lifecycle' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['phase_of_lifecycle'], str) or \
                len(str.strip(new_values['data']['phase_of_lifecycle'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHASE_OF_LIFECYCLE')
        phase_of_lifecycle = str.strip(new_values['data']['phase_of_lifecycle'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        if 'latitude_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['latitude_point_id'], int) and \
                new_values['data']['latitude_point_id'] > 0:
            latitude_point_id = new_values['data']['latitude_point_id']
        else:
            latitude_point_id = None

        if 'longitude_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['longitude_point_id'], int) and \
                new_values['data']['longitude_point_id'] > 0:
            longitude_point_id = new_values['data']['longitude_point_id']
        else:
            longitude_point_id = None

        if 'svg2_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg2_id'], int) and \
                new_values['data']['svg2_id'] > 0:
            svg2_id = new_values['data']['svg2_id']
        else:
            svg2_id = None

        if 'svg3_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg3_id'], int) and \
                new_values['data']['svg3_id'] > 0:
            svg3_id = new_values['data']['svg3_id']
        else:
            svg3_id = None

        if 'svg4_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg4_id'], int) and \
                new_values['data']['svg4_id'] > 0:
            svg4_id = new_values['data']['svg4_id']
        else:
            svg4_id = None

        if 'svg5_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg5_id'], int) and \
                new_values['data']['svg5_id'] > 0:
            svg5_id = new_values['data']['svg5_id']
        else:
            svg5_id = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_contacts "
                       " WHERE id = %s ",
                       (contact_id,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTACT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (cost_center_id,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_svgs "
                       " WHERE id = %s ",
                       (svg_id,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SVG_NOT_FOUND')

        add_values = (" INSERT INTO tbl_hybrid_power_stations "
                      " (name, uuid, address, latitude, longitude, rated_capacity, rated_power, "
                      "  contact_id, cost_center_id, svg_id, is_cost_data_displayed, phase_of_lifecycle, description, "
                      "  latitude_point_id, longitude_point_id, svg2_id, svg3_id, svg4_id, svg5_id ) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    address,
                                    latitude,
                                    longitude,
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    svg_id,
                                    is_cost_data_displayed,
                                    phase_of_lifecycle,
                                    description,
                                    latitude_point_id,
                                    longitude_point_id,
                                    svg2_id,
                                    svg3_id,
                                    svg4_id,
                                    svg5_id))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(new_id)


class HybridPowerStationItem:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        contact_dict = dict()
        query = (" SELECT id, name, uuid "
                 " FROM tbl_contacts ")
        cursor.execute(query)
        rows_contacts = cursor.fetchall()
        if rows_contacts is not None and len(rows_contacts) > 0:
            for row in rows_contacts:
                contact_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}

        cost_center_dict = dict()
        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        svg_dict = dict()
        query = (" SELECT id, name, uuid "
                 " FROM tbl_svgs ")
        cursor.execute(query)
        rows_svgs = cursor.fetchall()
        if rows_svgs is not None and len(rows_svgs) > 0:
            for row in rows_svgs:
                svg_dict[row[0]] = {"id": row[0],
                                    "name": row[1],
                                    "uuid": row[2]}

        # query point dict
        point_dict = dict()
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        address, latitude, longitude, rated_capacity, rated_power, "
                 "        contact_id, cost_center_id, svg_id, is_cost_data_displayed, phase_of_lifecycle, description, "
                 "        latitude_point_id, longitude_point_id, svg2_id, svg3_id, svg4_id, svg5_id "
                 " FROM tbl_hybrid_power_stations "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "address": row[3],
                           "latitude": row[4],
                           "longitude": row[5],
                           "rated_capacity": row[6],
                           "rated_power": row[7],
                           "contact": contact_dict.get(row[8], None),
                           "cost_center": cost_center_dict.get(row[9], None),
                           "svg": svg_dict.get(row[10], None),
                           "is_cost_data_displayed": bool(row[11]),
                           "phase_of_lifecycle": row[12],
                           "description": row[13],
                           "latitude_point": point_dict.get(row[14], None),
                           "longitude_point": point_dict.get(row[15], None),
                           "svg2": svg_dict.get(row[16], None),
                           "svg3": svg_dict.get(row[17], None),
                           "svg4": svg_dict.get(row[18], None),
                           "svg5": svg_dict.get(row[19], None),
                           "qrcode": 'hybridpowerstation:' + row[2]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')
        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_containers "
                       " WHERE hybrid_power_station_id = %s ", (id_,))

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_NAME')
        name = str.strip(new_values['data']['name'])

        if 'address' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['address'], str) or \
                len(str.strip(new_values['data']['address'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADDRESS_VALUE')
        address = str.strip(new_values['data']['address'])

        if 'latitude' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['latitude'], float) or
                     isinstance(new_values['data']['latitude'], int)) or \
                new_values['data']['latitude'] < -90.0 or \
                new_values['data']['latitude'] > 90.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LATITUDE_VALUE')
        latitude = new_values['data']['latitude']

        if 'longitude' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['longitude'], float) or
                     isinstance(new_values['data']['longitude'], int)) or \
                new_values['data']['longitude'] < -180.0 or \
                new_values['data']['longitude'] > 180.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LONGITUDE_VALUE')
        longitude = new_values['data']['longitude']

        if 'rated_capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_capacity'], float) or
                     isinstance(new_values['data']['rated_capacity'], int)) or \
                new_values['data']['rated_capacity'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['data']['rated_capacity']

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)) or \
                new_values['data']['rated_power'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = new_values['data']['rated_power']

        if 'contact_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['contact_id'], int) or \
                new_values['data']['contact_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTACT_ID')
        contact_id = new_values['data']['contact_id']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')
        cost_center_id = new_values['data']['cost_center_id']

        if 'svg_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['svg_id'], int) or \
                new_values['data']['svg_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_ID')
        svg_id = new_values['data']['svg_id']

        if 'is_cost_data_displayed' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_cost_data_displayed'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COST_DATA_DISPLAYED_VALUE')
        is_cost_data_displayed = new_values['data']['is_cost_data_displayed']

        if 'phase_of_lifecycle' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['phase_of_lifecycle'], str) or \
                len(str.strip(new_values['data']['phase_of_lifecycle'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHASE_OF_LIFECYCLE')
        phase_of_lifecycle = str.strip(new_values['data']['phase_of_lifecycle'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        if 'latitude_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['latitude_point_id'], int) and \
                new_values['data']['latitude_point_id'] > 0:
            latitude_point_id = new_values['data']['latitude_point_id']
        else:
            latitude_point_id = None

        if 'longitude_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['longitude_point_id'], int) and \
                new_values['data']['longitude_point_id'] > 0:
            longitude_point_id = new_values['data']['longitude_point_id']
        else:
            longitude_point_id = None

        if 'svg2_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg2_id'], int) and \
                new_values['data']['svg2_id'] > 0:
            svg2_id = new_values['data']['svg2_id']
        else:
            svg2_id = None

        if 'svg3_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg3_id'], int) and \
                new_values['data']['svg3_id'] > 0:
            svg3_id = new_values['data']['svg3_id']
        else:
            svg3_id = None

        if 'svg4_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg4_id'], int) and \
                new_values['data']['svg4_id'] > 0:
            svg4_id = new_values['data']['svg4_id']
        else:
            svg4_id = None

        if 'svg5_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg5_id'], int) and \
                new_values['data']['svg5_id'] > 0:
            svg5_id = new_values['data']['svg5_id']
        else:
            svg5_id = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_contacts "
                       " WHERE id = %s ",
                       (new_values['data']['contact_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTACT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['data']['cost_center_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_svgs "
                       " WHERE id = %s ",
                       (new_values['data']['svg_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SVG_NOT_FOUND')

        update_row = (" UPDATE tbl_hybrid_power_stations "
                      " SET name = %s, address = %s, latitude = %s, longitude = %s, "
                      "     rated_capacity = %s, rated_power = %s, "
                      "     contact_id = %s, cost_center_id = %s, "
                      "     svg_id = %s, is_cost_data_displayed = %s, phase_of_lifecycle = %s, description = %s, "
                      "     latitude_point_id = %s, longitude_point_id = %s, "
                      "     svg2_id = %s, svg3_id = %s, svg4_id = %s, svg5_id = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    address,
                                    latitude,
                                    longitude,
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    svg_id,
                                    is_cost_data_displayed,
                                    phase_of_lifecycle,
                                    description,
                                    latitude_point_id,
                                    longitude_point_id,
                                    svg2_id,
                                    svg3_id,
                                    svg4_id,
                                    svg5_id,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class HybridPowerStationBMSCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        operating_status_point_id, soc_point_id "
                 " FROM tbl_hybrid_power_stations_bmses "
                 " WHERE hybrid_power_station_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "operating_status_point": point_dict.get(row[3]),
                               "soc_point": point_dict.get(row[4])
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_BATTERY_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        if 'soc_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['soc_point_id'], int) or \
                new_values['data']['soc_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SOC_POINT_ID')
        soc_point_id = new_values['data']['soc_point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_bmses "
                       " WHERE hybrid_power_station_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_BATTERY_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (operating_status_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OPERATING_STATUS_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (soc_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SOC_POINT_NOT_FOUND')

        add_values = (" INSERT INTO tbl_hybrid_power_stations_bmses "
                      "    (name, uuid, hybrid_power_station_id, "
                      "     operating_status_point_id, soc_point_id) "
                      " VALUES (%s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    operating_status_point_id,
                                    soc_point_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(id_) + '/bmses/' + str(new_id)


class HybridPowerStationBMSItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, bid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, bid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_BATTERY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        # query hybrid power station dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_hybrid_power_stations ")
        cursor.execute(query)
        rows_hybridpowerstations = cursor.fetchall()

        hybrid_power_station_dict = dict()
        if rows_hybridpowerstations is not None and len(rows_hybridpowerstations) > 0:
            for row in rows_hybridpowerstations:
                hybrid_power_station_dict[row[0]] = {"id": row[0],
                                                     "name": row[1],
                                                     "uuid": row[2]}
        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, hybrid_power_station_id, "
                 "       operating_status_point_id, soc_point_id "
                 " FROM tbl_hybrid_power_stations_bmses "
                 " WHERE id = %s ")
        cursor.execute(query, (bid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_BATTERY_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "hybrid_power_station": hybrid_power_station_dict.get(row[3]),
                           "operating_status_point": point_dict.get(row[4]),
                           "soc_point": point_dict.get(row[5])
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, bid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_BATTERY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_bmses "
                       " WHERE id = %s ", (bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_BATTERY_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_bmses "
                       " WHERE id = %s ", (bid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, bid):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_BATTERY_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_BATTERY_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        if 'soc_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['soc_point_id'], int) or \
                new_values['data']['soc_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SOC_POINT_ID')
        soc_point_id = new_values['data']['soc_point_id']

        print(new_values)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_bmses "
                       " WHERE id = %s ", (bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_BATTERY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_bmses "
                       " WHERE hybrid_power_station_id = %s AND name = %s AND id != %s ",
                       (id_, name, bid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_BATTERY_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (operating_status_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OPERATING_STATUS_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (soc_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SOC_POINT_NOT_FOUND')

        update_row = (" UPDATE tbl_hybrid_power_stations_bmses "
                      " SET name = %s, hybrid_power_station_id = %s, "
                      "     operating_status_point_id = %s, soc_point_id = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    operating_status_point_id,
                                    soc_point_id,
                                    bid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class HybridPowerStationBMSPointCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, bid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, bid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BMS_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_bmses "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, bid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_BMS_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_hybrid_power_stations_bmses_points mp, tbl_data_sources ds "
                 " WHERE mp.bms_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (bid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, bid):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BMS_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_bmses "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_BMS_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_hybrid_power_stations_bmses_points "
                 " WHERE bms_id = %s AND point_id = %s")
        cursor.execute(query, (bid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.BMS_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_hybrid_power_stations_bmses_points (bms_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (bid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(id_) + '/bmses/' + str(bid) + '/points/' + \
                        str(new_values['data']['point_id'])


class HybridPowerStationBMSPointItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, bid, pid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, bid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BMS_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_bmses "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_BMS_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_hybrid_power_stations_bmses_points "
                       " WHERE bms_id = %s AND point_id = %s ", (bid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.BMS_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_bmses_points "
                       " WHERE bms_id = %s AND point_id = %s ", (bid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class HybridPowerStationCommandCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        query = (" SELECT c.id, c.name, c.uuid "
                 " FROM tbl_hybrid_power_stations ce, tbl_hybrid_power_stations_commands cec, tbl_commands c "
                 " WHERE cec.hybrid_power_station_id = ce.id AND c.id = cec.command_id AND ce.id = %s "
                 " ORDER BY c.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        new_values = json.loads(raw_json)

        if 'command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['command_id'], int) or \
                new_values['data']['command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')
        command_id = new_values['data']['command_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (command_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_hybrid_power_stations_commands "
                 " WHERE hybrid_power_station_id = %s AND command_id = %s")
        cursor.execute(query, (id_, command_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.HYBRID_POWER_STATION_COMMAND_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_hybrid_power_stations_commands (hybrid_power_station_id, command_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, command_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/combinedequipments/' + str(id_) + '/commands/' + str(command_id)


class HybridPowerStationCommandItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, cid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, cid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        if not cid.isdigit() or int(cid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (cid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_hybrid_power_stations_commands "
                       " WHERE hybrid_power_station_id = %s AND command_id = %s ", (id_, cid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_COMMAND_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_commands "
                       " WHERE hybrid_power_station_id = %s AND command_id = %s ", (id_, cid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class HybridPowerStationCMCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')
        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, operating_status_point_id, meter_id "
                 "        FROM tbl_hybrid_power_stations_cms "
                 " WHERE hybrid_power_station_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "operating_status_point": point_dict.get(row[3]),
                               "meter": meter_dict.get(row[4])
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_PCS_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        if 'meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['meter_id'], int) or \
                new_values['data']['meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        meter_id = new_values['data']['meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_cms "
                       " WHERE hybrid_power_station_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_CM_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_hybrid_power_stations_pcses "
                      "     (name, uuid, hybrid_power_station_id, operating_status_point_id, meter_id) "
                      " VALUES (%s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    operating_status_point_id,
                                    meter_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstation/' + str(id_) + '/cms/' + str(new_id)


class HybridPowerStationCMItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, cid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, cid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not cid.isdigit() or int(cid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_CM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_hybrid_power_stations ")
        cursor.execute(query)
        rows_hybridpowerstations = cursor.fetchall()

        hybrid_power_station_dict = dict()
        if rows_hybridpowerstations is not None and len(rows_hybridpowerstations) > 0:
            for row in rows_hybridpowerstations:
                hybrid_power_station_dict[row[0]] = {"id": row[0],
                                                     "name": row[1],
                                                     "uuid": row[2]}
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, hybrid_power_station_id, operating_status_point_id, meter_id "
                 " FROM tbl_hybrid_power_stations_cms "
                 " WHERE id = %s ")
        cursor.execute(query, (cid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_CM_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "hybrid_power_station": hybrid_power_station_dict.get(row[3]),
                           "operating_status_point": point_dict.get(row[4]),
                           "meter": meter_dict.get(row[5])
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, cid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not cid.isdigit() or int(cid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_CM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_cms "
                       " WHERE id = %s ", (cid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_CM_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_cms "
                       " WHERE id = %s ", (cid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, cid):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not cid.isdigit() or int(cid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_CM_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_CM_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        if 'meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['meter_id'], int) or \
                new_values['data']['meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        meter_id = new_values['data']['meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_cms "
                       " WHERE id = %s ", (cid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_CM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_cms "
                       " WHERE hybrid_power_station_id = %s AND name = %s AND id != %s ",
                       (id_, name, cid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_CM_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_hybrid_power_stations_cms "
                      " SET name = %s, hybrid_power_station_id = %s, operating_status_point_id = %s, "
                      "     meter_id = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    operating_status_point_id,
                                    meter_id,
                                    cid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class HybridPowerStationCMPointCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, did):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, did):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not did.isdigit() or int(did) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_cms "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, did, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_CM_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_hybrid_power_stations_cms_points mp, tbl_data_sources ds "
                 " WHERE mp.cm_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (did,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, did):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not did.isdigit() or int(did) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CM_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_cms "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, did,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_CM_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_hybrid_power_stations_cms_points "
                 " WHERE cm_id = %s AND point_id = %s")
        cursor.execute(query, (did, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.CM_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_hybrid_power_stations_cms_points (cm_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (did, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(id_) + '/cms/' + str(did) + '/points/' + \
                        str(new_values['data']['point_id'])


class HybridPowerStationCMPointItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, cid, pid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, cid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not cid.isdigit() or int(cid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CM_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_cms "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, cid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_CM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_hybrid_power_stations_cms_points "
                       " WHERE cm_id = %s AND point_id = %s ", (cid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CM_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_cms_points "
                       " WHERE cm_id = %s AND point_id = %s ", (cid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class HybridPowerStationGeneratorCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')
        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, operating_status_point_id, "
                 "        fuel_consumption_meter_id, power_generation_meter_id "
                 "        FROM tbl_hybrid_power_stations_generators "
                 " WHERE hybrid_power_station_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "operating_status_point": point_dict.get(row[3]),
                               "fuel_consumption_meter": meter_dict.get(row[4]),
                               "power_generation_meter": meter_dict.get(row[5])
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_GENERATOR_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        if 'fuel_consumption_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['fuel_consumption_meter_id'], int) or \
                new_values['data']['fuel_consumption_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FUEL_CONSUMPTION_METER_ID')
        fuel_consumption_meter_id = new_values['data']['fuel_consumption_meter_id']

        if 'power_generation_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_generation_meter_id'], int) or \
                new_values['data']['power_generation_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_GENERATION_METER_ID')
        power_generation_meter_id = new_values['data']['power_generation_meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_generators "
                       " WHERE hybrid_power_station_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_GENERATOR_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_hybrid_power_stations_generators "
                      "     (name, uuid, hybrid_power_station_id, operating_status_point_id, "
                      "      fule_consumption_meter_id, power_generatoion_meter_id) "
                      " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    operating_status_point_id,
                                    fuel_consumption_meter_id,
                                    power_generation_meter_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstation/' + str(id_) + '/generators/' + str(new_id)


class HybridPowerStationGeneratorItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, gid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, gid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_GENERATOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_hybrid_power_stations ")
        cursor.execute(query)
        rows_hybridpowerstations = cursor.fetchall()

        hybrid_power_station_dict = dict()
        if rows_hybridpowerstations is not None and len(rows_hybridpowerstations) > 0:
            for row in rows_hybridpowerstations:
                hybrid_power_station_dict[row[0]] = {"id": row[0],
                                                     "name": row[1],
                                                     "uuid": row[2]}
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, hybrid_power_station_id, operating_status_point_id, "
                 "        fuel_consumption_meter_id, "
                 "        power_generation_meter_id "
                 " FROM tbl_hybrid_power_stations_generators "
                 " WHERE id = %s ")
        cursor.execute(query, (gid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_GENERATOR_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "hybrid_power_station": hybrid_power_station_dict.get(row[3]),
                           "operating_status_point": point_dict.get(row[4]),
                           "fuel_consumption_meter": meter_dict.get(row[5]),
                           "power_generation_meter": meter_dict.get(row[6]),
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, gid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_GENERATOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_generators "
                       " WHERE id = %s ", (gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_GENERATOR_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_generators "
                       " WHERE id = %s ", (gid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, gid):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_GENERATOR_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_GENERATOR_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        if 'fuel_consumption_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['fuel_consumption_meter_id'], int) or \
                new_values['data']['fuel_consumption_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FUELCONSUMPTION_METER_ID')
        fuel_consumption_meter_id = new_values['data']['fuel_consumption_meter_id']

        if 'power_generation_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_generation_meter_id'], int) or \
                new_values['data']['power_generation_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_GENERATION_METER_ID')
        power_generation_meter_id = new_values['data']['power_generation_meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_generators "
                       " WHERE id = %s ", (gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_GENERATOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_generators "
                       " WHERE hybrid_power_station_id = %s AND name = %s AND id != %s ",
                       (id_, name, gid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_GENERATOR_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_hybrid_power_stations_generators "
                      " SET name = %s, hybrid_power_station_id = %s, operating_status_point_id = %s, "
                      "     fuel_consumption_meter_id = %s, power_generation_meter_id = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    operating_status_point_id,
                                    fuel_consumption_meter_id,
                                    power_generation_meter_id,
                                    gid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class HybridPowerStationGeneratorPointCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, gid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, gid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GENERATOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_generators "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, gid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_GENERATOR_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_hybrid_power_stations_generators_points mp, tbl_data_sources ds "
                 " WHERE mp.generator_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (gid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, gid):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GENERATOR_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_generators "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_GENERATOR_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_hybrid_power_stations_generators_points "
                 " WHERE generator_id = %s AND point_id = %s")
        cursor.execute(query, (gid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.GENERATOR_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_hybrid_power_stations_generators_points (generator_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (gid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(id_) + '/generators/' + str(gid) + '/points/' + \
                        str(new_values['data']['point_id'])


class HybridPowerStationGeneratorPointItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, gid, pid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, gid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GENERATOR_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_generators "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_GENERATOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_hybrid_power_stations_generators_points "
                       " WHERE generator_id = %s AND point_id = %s ", (gid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GENERATOR_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_generators_points "
                       " WHERE generator_id = %s AND point_id = %s ", (gid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class HybridPowerStationLoadCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        meter_id "
                 " FROM tbl_hybrid_power_stations_loads "
                 " WHERE hybrid_power_station_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "meter": meter_dict.get(row[3])
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_LOAD_NAME')
        name = str.strip(new_values['data']['name'])

        if 'meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['meter_id'], int) or \
                new_values['data']['meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        meter_id = new_values['data']['meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_loads "
                       " WHERE hybrid_power_station_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_LOAD_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_hybrid_power_stations_loads "
                      "    (name, uuid, hybrid_power_station_id, meter_id) "
                      " VALUES (%s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    meter_id,
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(id_) + '/loads/' + str(new_id)


class HybridPowerStationLoadItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, lid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, lid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_LOAD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_hybrid_power_stations ")
        cursor.execute(query)
        rows_hybridpowerstations = cursor.fetchall()

        hybrid_power_station_dict = dict()
        if rows_hybridpowerstations is not None and len(rows_hybridpowerstations) > 0:
            for row in rows_hybridpowerstations:
                hybrid_power_station_dict[row[0]] = {"id": row[0],
                                                     "name": row[1],
                                                     "uuid": row[2]}
        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        hybrid_power_station_id, meter_id "
                 " FROM tbl_hybrid_power_stations_loads "
                 " WHERE id = %s ")
        cursor.execute(query, (lid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_LOAD_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "hybrid_power_station": hybrid_power_station_dict.get(row[3]),
                           "power_point": point_dict.get(row[4]),
                           "meter": meter_dict.get(row[5]),
                           "rated_input_power": row[6]
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, lid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_LOAD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_loads "
                       " WHERE id = %s ", (lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_LOAD_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_loads "
                       " WHERE id = %s ", (lid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, lid):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_LOAD_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_LOAD_NAME')
        name = str.strip(new_values['data']['name'])

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

        if 'meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['meter_id'], int) or \
                new_values['data']['meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        meter_id = new_values['data']['meter_id']

        if 'rated_input_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_input_power'], float) or
                     isinstance(new_values['data']['rated_input_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_INPUT_POWER')
        rated_input_power = Decimal(new_values['data']['rated_input_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_loads "
                       " WHERE id = %s ", (lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_LOAD_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_loads "
                       " WHERE hybrid_power_station_id = %s AND name = %s AND id != %s ",
                       (id_, name, lid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_LOAD_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (power_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POWER_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        update_row = (" UPDATE tbl_hybrid_power_stations_loads "
                      " SET name = %s, hybrid_power_station_id = %s, power_point_id = %s, "
                      "     meter_id = %s, rated_input_power = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_input_power,
                                    lid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class HybridPowerStationLoadPointCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, lid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, lid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOAD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_loads "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, lid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_LOAD_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_hybrid_power_stations_loads_points mp, tbl_data_sources ds "
                 " WHERE mp.load_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (lid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, lid):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOAD_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_loads "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_LOAD_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_hybrid_power_stations_loads_points "
                 " WHERE load_id = %s AND point_id = %s")
        cursor.execute(query, (lid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.LOAD_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_hybrid_power_stations_loads_points (load_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (lid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(id_) + '/loads/' + str(lid) + '/points/' + \
                        str(new_values['data']['point_id'])


class HybridPowerStationLoadPointItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, lid, pid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, lid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOAD_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_loads "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_LOAD_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_hybrid_power_stations_loads_points "
                       " WHERE load_id = %s AND point_id = %s ", (lid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.LOAD_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_loads_points "
                       " WHERE load_id = %s AND point_id = %s ", (lid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class HybridPowerStationMCUCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        operating_status_point_id "
                 " FROM tbl_hybrid_power_stations_mcus "
                 " WHERE hybrid_power_station_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "operating_status_point": point_dict.get(row[3])
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_MCU_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_mcus "
                       " WHERE hybrid_power_station_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_MCU_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (operating_status_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OPERATING_STATUS_POINT_NOT_FOUND')

        add_values = (" INSERT INTO tbl_hybrid_power_stations_mcus "
                      "    (name, uuid, hybrid_power_station_id, operating_status_point) "
                      " VALUES (%s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    operating_status_point_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(id_) + '/mcus/' + str(new_id)


class HybridPowerStationMCUItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, mid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_MCU_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_hybrid_power_stations ")
        cursor.execute(query)
        rows_hybridpowerstations = cursor.fetchall()

        hybrid_power_station_dict = dict()
        if rows_hybridpowerstations is not None and len(rows_hybridpowerstations) > 0:
            for row in rows_hybridpowerstations:
                hybrid_power_station_dict[row[0]] = {"id": row[0],
                                                     "name": row[1],
                                                     "uuid": row[2]}
        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, hybrid_power_station_id, operating_status_point_id "
                 " FROM tbl_hybrid_power_stations_mcus "
                 " WHERE id = %s ")
        cursor.execute(query, (mid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_MCU_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "hybrid_power_station": hybrid_power_station_dict.get(row[3]),
                           "operating_status_point": point_dict.get(row[4])
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_MCU_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_mcus "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_MCU_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_mcus "
                       " WHERE id = %s ", (mid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, mid):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_MCU_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_MCU_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_mcus "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_MCU_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_mcus "
                       " WHERE hybrid_power_station_id = %s AND name = %s AND id != %s ",
                       (id_, name, mid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_MCU_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (operating_status_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OPERATING_STATUS_POINT_NOT_FOUND')

        update_row = (" UPDATE tbl_hybrid_power_stations_mcus "
                      " SET name = %s, hybrid_power_station_id = %s, "
                      "     operating_status_point_id = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    operating_status_point_id,
                                    mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class HybridPowerStationMCUPointCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, mid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MCU_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_mcus "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, mid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_MCU_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_hybrid_power_stations_mcus_points mp, tbl_data_sources ds "
                 " WHERE mp.mcu_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (mid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, mid):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MCU_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_mcus "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_MCU_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_hybrid_power_stations_mcus_points "
                 " WHERE mcu_id = %s AND point_id = %s")
        cursor.execute(query, (mid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.MCU_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_hybrid_power_stations_mcus_points (mcu_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (mid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(id_) + '/mcus/' + str(mid) + '/points/' + \
                        str(new_values['data']['point_id'])


class HybridPowerStationMCUPointItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, gid, pid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MCU_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_mcus "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_MCU_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_hybrid_power_stations_mcus_points "
                       " WHERE mcu_id = %s AND point_id = %s ", (mid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MCU_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_mcus_points "
                       " WHERE mcu_id = %s AND point_id = %s ", (mid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class HybridPowerStationPCSCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')
        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, operating_status_point_id, charge_meter_id, discharge_meter_id "
                 "        FROM tbl_hybrid_power_stations_pcses "
                 " WHERE hybrid_power_station_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "operating_status_point": point_dict.get(row[3]),
                               "charge_meter": meter_dict.get(row[4]),
                               "discharge_meter": meter_dict.get(row[5])
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_PCS_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        if 'charge_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_meter_id'], int) or \
                new_values['data']['charge_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_METER_ID')
        charge_meter_id = new_values['data']['charge_meter_id']

        if 'discharge_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_meter_id'], int) or \
                new_values['data']['discharge_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_METER_ID')
        discharge_meter_id = new_values['data']['discharge_meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pcses "
                       " WHERE hybrid_power_station_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_PCS_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_hybrid_power_stations_pcses "
                      "     (name, uuid, hybrid_power_station_id, operating_status_point_id, charge_meter_id, "
                      "      discharge_meter_id) "
                      " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    operating_status_point_id,
                                    charge_meter_id,
                                    discharge_meter_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstation/' + str(id_) + '/pcses/' + str(new_id)


class HybridPowerStationPCSItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pcsid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, pcsid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_PCS_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_hybrid_power_stations ")
        cursor.execute(query)
        rows_hybridpowerstations = cursor.fetchall()

        hybrid_power_station_dict = dict()
        if rows_hybridpowerstations is not None and len(rows_hybridpowerstations) > 0:
            for row in rows_hybridpowerstations:
                hybrid_power_station_dict[row[0]] = {"id": row[0],
                                                     "name": row[1],
                                                     "uuid": row[2]}
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, hybrid_power_station_id, operating_status_point_id, charge_meter_id, "
                 "        discharge_meter_id "
                 " FROM tbl_hybrid_power_stations_pcses "
                 " WHERE id = %s ")
        cursor.execute(query, (pcsid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PCS_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "hybrid_power_station": hybrid_power_station_dict.get(row[3]),
                           "operating_status_point": point_dict.get(row[4]),
                           "charge_meter": meter_dict.get(row[5]),
                           "discharge_meter": meter_dict.get(row[6]),
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pcsid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_PCS_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pcses "
                       " WHERE id = %s ", (pcsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PCS_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_pcses "
                       " WHERE id = %s ", (pcsid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, pcsid):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_PCS_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_PCS_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        if 'charge_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_meter_id'], int) or \
                new_values['data']['charge_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_METER_ID')
        charge_meter_id = new_values['data']['charge_meter_id']

        if 'discharge_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_meter_id'], int) or \
                new_values['data']['discharge_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_METER_ID')
        discharge_meter_id = new_values['data']['discharge_meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pcses "
                       " WHERE id = %s ", (pcsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PCS_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pcses "
                       " WHERE hybrid_power_station_id = %s AND name = %s AND id != %s ",
                       (id_, name, pcsid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_PCS_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_hybrid_power_stations_pcses "
                      " SET name = %s, hybrid_power_station_id = %s, operating_status_point_id = %s, "
                      "     charge_meter_id = %s, discharge_meter_id = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    operating_status_point_id,
                                    charge_meter_id,
                                    discharge_meter_id,
                                    pcsid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class HybridPowerStationPCSPointCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pcsid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, pcsid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PCS_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pcses "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, pcsid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PCS_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_hybrid_power_stations_pcses_points mp, tbl_data_sources ds "
                 " WHERE mp.pcs_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (pcsid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, pcsid):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PCS_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pcses "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, pcsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PCS_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_hybrid_power_stations_pcses_points "
                 " WHERE pcs_id = %s AND point_id = %s")
        cursor.execute(query, (pcsid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.PCS_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_hybrid_power_stations_pcses_points (pcs_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (pcsid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(id_) + '/pcses/' + str(pcsid) + '/points/' + \
                        str(new_values['data']['point_id'])


class HybridPowerStationPCSPointItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pcsid, pid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pcsid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PCS_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pcses "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, pcsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PCS_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_hybrid_power_stations_pcses_points "
                       " WHERE pcs_id = %s AND point_id = %s ", (pcsid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PCS_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_pcses_points "
                       " WHERE pcs_id = %s AND point_id = %s ", (pcsid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class HybridPowerStationPVCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')
        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, operating_status_point_id, meter_id "
                 "        FROM tbl_hybrid_power_stations_pvs "
                 " WHERE hybrid_power_station_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "operating_status_point": point_dict.get(row[3]),
                               "meter": meter_dict.get(row[4])
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_PCS_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        if 'meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['meter_id'], int) or \
                new_values['data']['meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        meter_id = new_values['data']['meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pvs "
                       " WHERE hybrid_power_station_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_PV_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_hybrid_power_stations_pcses "
                      "     (name, uuid, hybrid_power_station_id, operating_status_point_id, meter_id) "
                      " VALUES (%s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    operating_status_point_id,
                                    meter_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstation/' + str(id_) + '/pvs/' + str(new_id)


class HybridPowerStationPVItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pvid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, pvid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pvid.isdigit() or int(pvid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_PV_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_hybrid_power_stations ")
        cursor.execute(query)
        rows_hybridpowerstations = cursor.fetchall()

        hybrid_power_station_dict = dict()
        if rows_hybridpowerstations is not None and len(rows_hybridpowerstations) > 0:
            for row in rows_hybridpowerstations:
                hybrid_power_station_dict[row[0]] = {"id": row[0],
                                                     "name": row[1],
                                                     "uuid": row[2]}
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, hybrid_power_station_id, operating_status_point_id, meter_id "
                 " FROM tbl_hybrid_power_stations_pvs "
                 " WHERE id = %s ")
        cursor.execute(query, (pvid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PV_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "hybrid_power_station": hybrid_power_station_dict.get(row[3]),
                           "operating_status_point": point_dict.get(row[4]),
                           "meter": meter_dict.get(row[5])
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pvid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pvid.isdigit() or int(pvid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_PV_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pvs "
                       " WHERE id = %s ", (pvid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PV_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_pvs "
                       " WHERE id = %s ", (pvid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, pvid):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pvid.isdigit() or int(pvid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_PV_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_PV_NAME')
        name = str.strip(new_values['data']['name'])

        if 'operating_status_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['operating_status_point_id'], int) or \
                new_values['data']['operating_status_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OPERATING_STATUS_POINT_ID')
        operating_status_point_id = new_values['data']['operating_status_point_id']

        if 'meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['meter_id'], int) or \
                new_values['data']['meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        meter_id = new_values['data']['meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pvs "
                       " WHERE id = %s ", (pvid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PV_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pvs "
                       " WHERE hybrid_power_station_id = %s AND name = %s AND id != %s ",
                       (id_, name, pvid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_PV_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_hybrid_power_stations_pvs "
                      " SET name = %s, hybrid_power_station_id = %s, operating_status_point_id = %s, "
                      "     meter_id = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    operating_status_point_id,
                                    meter_id,
                                    pvid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class HybridPowerStationPVPointCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pvid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, pvid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pvid.isdigit() or int(pvid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PV_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pvs "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, pvid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PV_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_hybrid_power_stations_pvs_points mp, tbl_data_sources ds "
                 " WHERE mp.pv_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (pvid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, pvid):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pvid.isdigit() or int(pvid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PV_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pvs "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, pvid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PV_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_hybrid_power_stations_pvs_points "
                 " WHERE pv_id = %s AND point_id = %s")
        cursor.execute(query, (pvid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.PV_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_hybrid_power_stations_pvs_points (pv_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (pvid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(id_) + '/pvs/' + str(pvid) + '/points/' + \
                        str(new_values['data']['point_id'])


class HybridPowerStationPVPointItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pvid, pid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pvid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        if not pvid.isdigit() or int(pvid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PV_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations_pvs "
                       " WHERE hybrid_power_station_id = %s AND id = %s ", (id_, pvid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_PV_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_hybrid_power_stations_pvs_points "
                       " WHERE pv_id = %s AND point_id = %s ", (pvid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PV_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_pvs_points "
                       " WHERE pv_id = %s AND point_id = %s ", (pvid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class HybridPowerStationUserCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        query = (" SELECT u.id, u.name, u.uuid "
                 " FROM tbl_hybrid_power_stations m, tbl_hybrid_power_stations_users mu, "
                 + config.myems_user_db['database'] + ".tbl_users u "
                 " WHERE mu.hybrid_power_station_id = m.id AND u.id = mu.user_id AND m.id = %s "
                 " ORDER BY u.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()
        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2]}
                result.append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        new_values = json.loads(raw_json)
        if 'user_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['user_id'], int) or \
                new_values['data']['user_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')
        user_id = new_values['data']['user_id']
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cnx_user = mysql.connector.connect(**config.myems_user_db)
        cursor_user = cnx_user.cursor()
        cursor_user.execute(" SELECT name"
                            " FROM tbl_users "
                            " WHERE id = %s ", (user_id,))
        if cursor_user.fetchone() is None:
            cursor_user.close()
            cnx_user.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')
        query = (" SELECT id "
                 " FROM tbl_hybrid_power_stations_users "
                 " WHERE hybrid_power_station_id = %s AND user_id = %s")
        cursor.execute(query, (id_, user_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.HYBRID_POWER_STATION_USER_RELATION_EXISTS')
        add_row = (" INSERT INTO tbl_hybrid_power_stations_users (hybrid_power_station_id, user_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, user_id,))
        cnx.commit()
        cursor.close()
        cnx.close()
        cursor_user.close()
        cnx_user.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(id_) + '/users/' + str(user_id)


class HybridPowerStationUserItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, uid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, uid):
        # todo Verify if the user is bound when deleting it
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        if not uid.isdigit() or int(uid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

        cnx_user = mysql.connector.connect(**config.myems_user_db)
        cursor_user = cnx_user.cursor()
        cursor_user.execute(" SELECT name FROM tbl_users WHERE id = %s ", (uid,))
        if cursor_user.fetchone() is None:
            cursor_user.close()
            cnx_user.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_hybrid_power_stations_users "
                       " WHERE hybrid_power_station_id = %s AND user_id = %s ", (id_, uid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_USER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_hybrid_power_stations_users "
                       " WHERE hybrid_power_station_id = %s AND user_id = %s ", (id_, uid))
        cnx.commit()

        cursor.close()
        cnx.close()
        cursor_user.close()
        cnx_user.close()

        resp.status = falcon.HTTP_204


class HybridPowerStationClone:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, description "
                 " FROM tbl_hybrid_power_stations "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "rated_capacity": row[3],
                           "rated_power": row[4],
                           "contact_id": row[5],
                           "cost_center_id": row[6],
                           "description": row[7]}
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = str.strip(meta_result['name']) + \
                (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds')
            add_values = (" INSERT INTO tbl_hybrid_power_stations "
                          "    (name, uuid, rated_capacity, rated_power, contact_id, "
                          "     cost_center_id, description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['rated_capacity'],
                                        meta_result['rated_power'],
                                        meta_result['contact_id'],
                                        meta_result['cost_center_id'],
                                        meta_result['description']))
            new_id = cursor.lastrowid
            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/hybridpowerstations/' + str(new_id)


class HybridPowerStationExport:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_contacts ")
        cursor.execute(query)
        rows_contacts = cursor.fetchall()

        contact_dict = dict()
        if rows_contacts is not None and len(rows_contacts) > 0:
            for row in rows_contacts:
                contact_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, description "
                 " FROM tbl_hybrid_power_stations "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "rated_capacity": row[3],
                           "rated_power": row[4],
                           "contact": contact_dict.get(row[5], None),
                           "cost_center": cost_center_dict.get(row[6], None),
                           "description": row[7]}

        resp.text = json.dumps(meta_result)


class HybridPowerStationImport:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_NAME')
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        name = str.strip(new_values['name']) + \
            (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds')

        if 'rated_capacity' not in new_values.keys() or \
                not (isinstance(new_values['rated_capacity'], float) or
                     isinstance(new_values['rated_capacity'], int)) or \
                new_values['rated_capacity'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['rated_capacity']

        if 'rated_power' not in new_values.keys() or \
                not (isinstance(new_values['rated_power'], float) or
                     isinstance(new_values['rated_power'], int)) or \
                new_values['rated_power'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = new_values['rated_power']

        if 'contact' not in new_values.keys() or \
                'id' not in new_values['contact'].keys() or \
                not isinstance(new_values['contact']['id'], int) or \
                new_values['contact']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTACT_ID')
        contact_id = new_values['contact']['id']

        if 'cost_center' not in new_values.keys() or \
                'id' not in new_values['cost_center'].keys() or \
                not isinstance(new_values['cost_center']['id'], int) or \
                new_values['cost_center']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')
        cost_center_id = new_values['cost_center']['id']

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_hybrid_power_stations "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.HYBRID_POWER_STATION_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_contacts "
                       " WHERE id = %s ",
                       (new_values['contact']['id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTACT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['cost_center']['id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_hybrid_power_stations "
                      "    (name, uuid, rated_capacity, rated_power, contact_id, cost_center_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/hybridpowerstations/' + str(new_id)
