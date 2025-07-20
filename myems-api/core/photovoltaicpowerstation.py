import uuid
from datetime import datetime, timedelta
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control
import config


class PhotovoltaicPowerStationCollection:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        access_control(req)
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

        query = (" SELECT id, name, uuid, "
                 "        station_code, address, latitude, longitude, rated_capacity, rated_power, "
                 "        contact_id, cost_center_id, svg_id, is_cost_data_displayed, phase_of_lifecycle, description "
                 " FROM tbl_photovoltaic_power_stations "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_photovoltaic_power_stations = cursor.fetchall()

        result = list()
        if rows_photovoltaic_power_stations is not None and len(rows_photovoltaic_power_stations) > 0:
            for row in rows_photovoltaic_power_stations:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "station_code": row[3],
                               "address": row[4],
                               "latitude": row[5],
                               "longitude": row[6],
                               "rated_capacity": row[7],
                               "rated_power": row[8],
                               "contact": contact_dict.get(row[9], None),
                               "cost_center": cost_center_dict.get(row[10], None),
                               "svg": svg_dict.get(row[11], None),
                               "is_cost_data_displayed": bool(row[12]),
                               "phase_of_lifecycle": row[13],
                               "description": row[14],
                               "qrcode": 'photovoltaicpowerstation:' + row[2]}
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
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_NAME')
        name = str.strip(new_values['data']['name'])

        if 'address' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['address'], str) or \
                len(str.strip(new_values['data']['address'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADDRESS_VALUE')
        address = str.strip(new_values['data']['address'])

        if 'station_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['station_code'], str) or \
                len(str.strip(new_values['data']['station_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STATION_CODE')
        station_code = str.strip(new_values['data']['station_code'])

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
                new_values['data']['rated_capacity'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['data']['rated_capacity']

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)) or \
                new_values['data']['rated_power'] <= 0.0:
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

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NAME_IS_ALREADY_IN_USE')

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

        add_values = (" INSERT INTO tbl_photovoltaic_power_stations "
                      " (name, uuid, station_code, address, latitude, longitude, "
                      "  rated_capacity, rated_power, contact_id, cost_center_id, svg_id, is_cost_data_displayed, "
                      "  phase_of_lifecycle, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    station_code,
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
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/photovoltaicpowerstations/' + str(new_id)


class PhotovoltaicPowerStationItem:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

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

        query = (" SELECT id, name, uuid, "
                 "        station_code, address, latitude, longitude, rated_capacity, rated_power, "
                 "        contact_id, cost_center_id, svg_id, is_cost_data_displayed, phase_of_lifecycle, description "
                 " FROM tbl_photovoltaic_power_stations "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "station_code": row[3],
                           "address": row[4],
                           "latitude": row[5],
                           "longitude": row[6],
                           "rated_capacity": row[7],
                           "rated_power": row[8],
                           "contact": contact_dict.get(row[9], None),
                           "cost_center": cost_center_dict.get(row[10], None),
                           "svg": svg_dict.get(row[11], None),
                           "is_cost_data_displayed": bool(row[12]),
                           "phase_of_lifecycle": row[13],
                           "description": row[14],
                           "qrcode": 'photovoltaicpowerstation:' + row[2]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        # check relation with spaces
        cursor.execute(" SELECT id "
                       " FROM  tbl_spaces_photovoltaic_power_stations "
                       " WHERE photovoltaic_power_station_id = %s ", (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        cursor.execute(" DELETE FROM tbl_photovoltaic_power_stations "
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
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_NAME')
        name = str.strip(new_values['data']['name'])

        if 'station_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['station_code'], str) or \
                len(str.strip(new_values['data']['station_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STATION_CODE')
        station_code = str.strip(new_values['data']['station_code'])

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
                new_values['data']['rated_capacity'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['data']['rated_capacity']

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)) or \
                new_values['data']['rated_power'] <= 0.0:
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

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NAME_IS_ALREADY_IN_USE')

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

        update_row = (" UPDATE tbl_photovoltaic_power_stations "
                      " SET name = %s, station_code = %s, address = %s, "
                      "     latitude = %s, longitude = %s, "
                      "     rated_capacity = %s, rated_power = %s, "
                      "     contact_id = %s, cost_center_id = %s, "
                      "     svg_id = %s, is_cost_data_displayed = %s, phase_of_lifecycle = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    station_code,
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
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class PhotovoltaicPowerStationExport:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

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

        query = (" SELECT id, name, uuid "
                 " FROM tbl_svgs ")
        cursor.execute(query)
        rows_svgs = cursor.fetchall()

        svg_dict = dict()
        if rows_svgs is not None and len(rows_svgs) > 0:
            for row in rows_svgs:
                svg_dict[row[0]] = {"id": row[0],
                                    "name": row[1],
                                    "uuid": row[2]}

        query = (" SELECT id, name, uuid, "
                 "        station_code, address, latitude, longitude, rated_capacity, rated_power, "
                 "        contact_id, cost_center_id, svg_id, is_cost_data_displayed, phase_of_lifecycle, description "
                 " FROM tbl_photovoltaic_power_stations "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')
        else:
            meta_result = {"name": row[1],
                           "uuid": row[2],
                           "station_code": row[3],
                           "address": row[4],
                           "latitude": row[5],
                           "longitude": row[6],
                           "rated_capacity": row[7],
                           "rated_power": row[8],
                           "contact": contact_dict.get(row[9], None),
                           "cost_center": cost_center_dict.get(row[10], None),
                           "svg": svg_dict.get(row[11], None),
                           "is_cost_data_displayed": bool(row[12]),
                           "phase_of_lifecycle": row[13],
                           "description": row[14]}

        resp.text = json.dumps(meta_result)


class PhotovoltaicPowerStationImport:
    def __init__(self):
        """"Initializes PhotovoltaicPowerStationImport"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_NAME')
        name = str.strip(new_values['name'])

        if 'station_code' not in new_values.keys() or \
                not isinstance(new_values['station_code'], str) or \
                len(str.strip(new_values['station_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STATION_CODE')
        station_code = str.strip(new_values['station_code'])

        if 'address' not in new_values.keys() or \
                not isinstance(new_values['address'], str) or \
                len(str.strip(new_values['address'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADDRESS_VALUE')
        address = str.strip(new_values['address'])

        if 'latitude' not in new_values.keys() or \
                not (isinstance(new_values['latitude'], float) or
                     isinstance(new_values['latitude'], int)) or \
                new_values['latitude'] < -90.0 or \
                new_values['latitude'] > 90.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LATITUDE_VALUE')
        latitude = new_values['latitude']

        if 'longitude' not in new_values.keys() or \
                not (isinstance(new_values['longitude'], float) or
                     isinstance(new_values['longitude'], int)) or \
                new_values['longitude'] < -180.0 or \
                new_values['longitude'] > 180.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LONGITUDE_VALUE')
        longitude = new_values['longitude']

        if 'rated_capacity' not in new_values.keys() or \
                not (isinstance(new_values['rated_capacity'], float) or
                     isinstance(new_values['rated_capacity'], int)) or \
                new_values['rated_capacity'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['rated_capacity']

        if 'rated_power' not in new_values.keys() or \
                not (isinstance(new_values['rated_power'], float) or
                     isinstance(new_values['rated_power'], int)) or \
                new_values['rated_power'] <= 0.0:
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

        if 'svg' not in new_values.keys() or \
                'id' not in new_values['svg'].keys() or \
                not isinstance(new_values['svg']['id'], int) or \
                new_values['svg']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_ID')
        svg_id = new_values['svg']['id']

        if 'is_cost_data_displayed' not in new_values.keys() or \
                not isinstance(new_values['is_cost_data_displayed'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COST_DATA_DISPLAYED')
        is_cost_data_displayed = new_values['is_cost_data_displayed']

        if 'phase_of_lifecycle' not in new_values.keys() or \
                not isinstance(new_values['phase_of_lifecycle'], str) or \
                len(str.strip(new_values['phase_of_lifecycle'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHASE_OF_LIFECYCLE')
        phase_of_lifecycle = str.strip(new_values['phase_of_lifecycle'])

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NAME_IS_ALREADY_IN_USE')

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

        add_values = (" INSERT INTO tbl_photovoltaic_power_stations "
                      "    (name, uuid, station_code, address, latitude, longitude, "
                      "     rated_capacity, rated_power, "
                      "     contact_id, cost_center_id, svg_id, is_cost_data_displayed, phase_of_lifecycle,"
                      "     description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    station_code,
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
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/photovoltaicpowerstations/' + str(new_id)


class PhotovoltaicPowerStationClone:
    def __init__(self):
        """"Initializes PhotovoltaicPowerStationClone"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        station_code, address, latitude, longitude, rated_capacity, rated_power, "
                 "        contact_id, cost_center_id, svg_id, is_cost_data_displayed, phase_of_lifecycle, description "
                 " FROM tbl_photovoltaic_power_stations "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')
        else:
            meta_result = {"name": row[1],
                           "uuid": row[2],
                           "station_code": row[3],
                           "address": row[4],
                           "latitude": row[5],
                           "longitude": row[6],
                           "rated_capacity": row[7],
                           "rated_power": row[8],
                           "contact_id": row[9],
                           "cost_center_id": row[10],
                           "svg_id": row[11],
                           "is_cost_data_displayed": row[12],
                           "phase_of_lifecycle": row[13],
                           "description": row[14]}

            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = str.strip(meta_result['name']) + \
                (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds')

            add_values = (" INSERT INTO tbl_photovoltaic_power_stations "
                          "    (name, uuid, station_code, address, latitude, longitude, "
                          "     rated_capacity, rated_power, "
                          "     contact_id, cost_center_id, svg_id, is_cost_data_displayed, phase_of_lifecycle, "
                          "     description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['station_code'],
                                        meta_result['address'],
                                        meta_result['latitude'],
                                        meta_result['longitude'],
                                        meta_result['rated_capacity'],
                                        meta_result['rated_power'],
                                        meta_result['contact_id'],
                                        meta_result['cost_center_id'],
                                        meta_result['svg_id'],
                                        meta_result['is_cost_data_displayed'],
                                        meta_result['phase_of_lifecycle'],
                                        meta_result['description']))
            new_id = cursor.lastrowid
            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/photovoltaicpowerstations/' + str(new_id)


class PhotovoltaicPowerStationGridCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

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
                 "        power_point_id, buy_meter_id, sell_meter_id, capacity, "
                 "        total_active_power_point_id, "
                 "        active_power_a_point_id, "
                 "        active_power_b_point_id, "
                 "        active_power_c_point_id, "
                 "        total_reactive_power_point_id, "
                 "        reactive_power_a_point_id, "
                 "        reactive_power_b_point_id, "
                 "        reactive_power_c_point_id, "
                 "        total_apparent_power_point_id, "
                 "        apparent_power_a_point_id, "
                 "        apparent_power_b_point_id, "
                 "        apparent_power_c_point_id, "
                 "        total_power_factor_point_id, "
                 "        active_energy_import_point_id, "
                 "        active_energy_export_point_id, "
                 "        active_energy_net_point_id "
                 " FROM tbl_photovoltaic_power_stations_grids "
                 " WHERE photovoltaic_power_station_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "power_point": point_dict.get(row[3]),
                               "buy_meter": meter_dict.get(row[4]),
                               "sell_meter": meter_dict.get(row[5]),
                               "capacity": row[6],
                               "total_active_power_point": point_dict.get(row[7]),
                               "active_power_a_point": point_dict.get(row[8]),
                               "active_power_b_point": point_dict.get(row[9]),
                               "active_power_c_point": point_dict.get(row[10]),
                               "total_reactive_power_point": point_dict.get(row[11]),
                               "reactive_power_a_point": point_dict.get(row[12]),
                               "reactive_power_b_point": point_dict.get(row[13]),
                               "reactive_power_c_point": point_dict.get(row[14]),
                               "total_apparent_power_point": point_dict.get(row[15]),
                               "apparent_power_a_point": point_dict.get(row[16]),
                               "apparent_power_b_point": point_dict.get(row[17]),
                               "apparent_power_c_point": point_dict.get(row[19]),
                               "total_power_factor_point": point_dict.get(row[19]),
                               "active_energy_import_point": point_dict.get(row[20]),
                               "active_energy_export_point": point_dict.get(row[21]),
                               "active_energy_net_point_id": point_dict.get(row[22]),
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
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_GRID_NAME')
        name = str.strip(new_values['data']['name'])

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

        if 'buy_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['buy_meter_id'], int) or \
                new_values['data']['buy_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BUY_METER_ID')
        buy_meter_id = new_values['data']['buy_meter_id']

        if 'sell_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['sell_meter_id'], int) or \
                new_values['data']['sell_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SELL_METER_ID')
        sell_meter_id = new_values['data']['sell_meter_id']

        if 'capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['capacity'], float) or
                     isinstance(new_values['data']['capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CAPACITY')
        capacity = Decimal(new_values['data']['capacity'])

        total_active_power_point_id = None
        active_power_a_point_id = None
        active_power_b_point_id = None
        active_power_c_point_id = None
        total_reactive_power_point_id = None
        reactive_power_a_point_id = None
        reactive_power_b_point_id = None
        reactive_power_c_point_id = None
        total_apparent_power_point_id = None
        apparent_power_a_point_id = None
        apparent_power_b_point_id = None
        apparent_power_c_point_id = None
        total_power_factor_point_id = None
        active_energy_import_point_id = None
        active_energy_export_point_id = None
        active_energy_net_point_id = None

        if 'total_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_active_power_point_id'], int) and \
                new_values['data']['total_active_power_point_id'] > 0:
            total_active_power_point_id = new_values['data']['total_active_power_point_id']

        if 'active_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_a_point_id'], int) and \
                new_values['data']['active_power_a_point_id'] > 0:
            active_power_a_point_id = new_values['data']['active_power_a_point_id']

        if 'active_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_b_point_id'], int) and \
                new_values['data']['active_power_b_point_id'] > 0:
            active_power_b_point_id = new_values['data']['active_power_b_point_id']

        if 'active_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_c_point_id'], int) and \
                new_values['data']['active_power_c_point_id'] > 0:
            active_power_c_point_id = new_values['data']['active_power_c_point_id']

        if 'total_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_reactive_power_point_id'], int) and \
                new_values['data']['total_reactive_power_point_id'] > 0:
            total_reactive_power_point_id = new_values['data']['total_reactive_power_point_id']

        if 'reactive_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_a_point_id'], int) and \
                new_values['data']['reactive_power_a_point_id'] > 0:
            reactive_power_a_point_id = new_values['data']['reactive_power_a_point_id']

        if 'reactive_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_b_point_id'], int) and \
                new_values['data']['reactive_power_b_point_id'] > 0:
            reactive_power_b_point_id = new_values['data']['reactive_power_b_point_id']

        if 'reactive_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_c_point_id'], int) and \
                new_values['data']['reactive_power_c_point_id'] > 0:
            reactive_power_c_point_id = new_values['data']['reactive_power_c_point_id']

        if 'total_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_apparent_power_point_id'], int) and \
                new_values['data']['total_apparent_power_point_id'] > 0:
            total_apparent_power_point_id = new_values['data']['total_apparent_power_point_id']

        if 'apparent_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_a_point_id'], int) and \
                new_values['data']['apparent_power_a_point_id'] > 0:
            apparent_power_a_point_id = new_values['data']['apparent_power_a_point_id']

        if 'apparent_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_b_point_id'], int) and \
                new_values['data']['apparent_power_b_point_id'] > 0:
            apparent_power_b_point_id = new_values['data']['apparent_power_b_point_id']

        if 'apparent_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_c_point_id'], int) and \
                new_values['data']['apparent_power_c_point_id'] > 0:
            apparent_power_c_point_id = new_values['data']['apparent_power_c_point_id']

        if 'total_power_factor_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_power_factor_point_id'], int) and \
                new_values['data']['total_power_factor_point_id'] > 0:
            total_power_factor_point_id = new_values['data']['total_power_factor_point_id']

        if 'active_energy_import_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_import_point_id'], int) and \
                new_values['data']['active_energy_import_point_id'] > 0:
            active_energy_import_point_id = new_values['data']['active_energy_import_point_id']

        if 'active_energy_export_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_export_point_id'], int) and \
                new_values['data']['active_energy_export_point_id'] > 0:
            active_energy_export_point_id = new_values['data']['active_energy_export_point_id']

        if 'active_energy_net_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_net_point_id'], int) and \
                new_values['data']['active_energy_net_point_id'] > 0:
            active_energy_net_point_id = new_values['data']['active_energy_net_point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_grids "
                       " WHERE photovoltaic_power_station_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_GRID_NAME_IS_ALREADY_IN_USE')

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
                       (buy_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.BUY_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (sell_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SELL_METER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_photovoltaic_power_stations_grids "
                      "    (name, uuid, photovoltaic_power_station_id, power_point_id, "
                      "     buy_meter_id, sell_meter_id, capacity, "
                      "     total_active_power_point_id, "
                      "     active_power_a_point_id, "
                      "     active_power_b_point_id, "
                      "     active_power_c_point_id, "
                      "     total_reactive_power_point_id, "
                      "     reactive_power_a_point_id, "
                      "     reactive_power_b_point_id, "
                      "     reactive_power_c_point_id, "
                      "     total_apparent_power_point_id, "
                      "     apparent_power_a_point_id, "
                      "     apparent_power_b_point_id, "
                      "     apparent_power_c_point_id, "
                      "     total_power_factor_point_id, "
                      "     active_energy_import_point_id, "
                      "     active_energy_export_point_id, "
                      "     active_energy_net_point_id) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    power_point_id,
                                    buy_meter_id,
                                    sell_meter_id,
                                    capacity,
                                    total_active_power_point_id,
                                    active_power_a_point_id,
                                    active_power_b_point_id,
                                    active_power_c_point_id,
                                    total_reactive_power_point_id,
                                    reactive_power_a_point_id,
                                    reactive_power_b_point_id,
                                    reactive_power_c_point_id,
                                    total_apparent_power_point_id,
                                    apparent_power_a_point_id,
                                    apparent_power_b_point_id,
                                    apparent_power_c_point_id,
                                    total_power_factor_point_id,
                                    active_energy_import_point_id,
                                    active_energy_export_point_id,
                                    active_energy_net_point_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/photovoltaics/' + str(id_) + '/grids/' + str(new_id)


class PhotovoltaicPowerStationGridItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, gid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, gid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_GRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_photovoltaic_power_stations ")
        cursor.execute(query)
        rows_photovoltaic_power_stations = cursor.fetchall()

        photovoltaic_power_station_dict = dict()
        if rows_photovoltaic_power_stations is not None and len(rows_photovoltaic_power_stations) > 0:
            for row in rows_photovoltaic_power_stations:
                photovoltaic_power_station_dict[row[0]] = {"id": row[0],
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
                 "        photovoltaic_power_station_id, "
                 "        power_point_id, "
                 "        buy_meter_id, "
                 "        sell_meter_id, "
                 "        capacity, "
                 "        total_active_power_point_id, "
                 "        active_power_a_point_id, "
                 "        active_power_b_point_id, "
                 "        active_power_c_point_id, "
                 "        total_reactive_power_point_id, "
                 "        reactive_power_a_point_id, "
                 "        reactive_power_b_point_id, "
                 "        reactive_power_c_point_id, "
                 "        total_apparent_power_point_id, "
                 "        apparent_power_a_point_id, "
                 "        apparent_power_b_point_id, "
                 "        apparent_power_c_point_id, "
                 "        total_power_factor_point_id, "
                 "        active_energy_import_point_id, "
                 "        active_energy_export_point_id, "
                 "        active_energy_net_point_id "
                 " FROM tbl_photovoltaic_power_stations_grids "
                 " WHERE id = %s ")
        cursor.execute(query, (gid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_GRID_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "photovoltaic_power_station": photovoltaic_power_station_dict.get(row[3]),
                           "power_point": point_dict.get(row[4]),
                           "buy_meter": meter_dict.get(row[5]),
                           "sell_meter": meter_dict.get(row[6]),
                           "capacity": row[7],
                           "total_active_power_point": point_dict.get(row[8]),
                           "active_power_a_point": point_dict.get(row[9]),
                           "active_power_b_point": point_dict.get(row[10]),
                           "active_power_c_point": point_dict.get(row[11]),
                           "total_reactive_power_point": point_dict.get(row[12]),
                           "reactive_power_a_point": point_dict.get(row[13]),
                           "reactive_power_b_point": point_dict.get(row[14]),
                           "reactive_power_c_point": point_dict.get(row[15]),
                           "total_apparent_power_point": point_dict.get(row[16]),
                           "apparent_power_a_point": point_dict.get(row[17]),
                           "apparent_power_b_point": point_dict.get(row[18]),
                           "apparent_power_c_point": point_dict.get(row[19]),
                           "total_power_factor_point": point_dict.get(row[20]),
                           "active_energy_import_point": point_dict.get(row[21]),
                           "active_energy_export_point": point_dict.get(row[22]),
                           "active_energy_net_point_id": point_dict.get(row[23]),
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, gid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_GRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_grids "
                       " WHERE id = %s ", (gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_GRID_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_photovoltaic_power_stations_grids "
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
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_GRID_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_GRID_NAME')
        name = str.strip(new_values['data']['name'])

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

        if 'buy_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['buy_meter_id'], int) or \
                new_values['data']['buy_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BUY_METER_ID')
        buy_meter_id = new_values['data']['buy_meter_id']

        if 'sell_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['sell_meter_id'], int) or \
                new_values['data']['sell_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        sell_meter_id = new_values['data']['sell_meter_id']

        if 'capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['capacity'], float) or
                     isinstance(new_values['data']['capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CAPACITY')
        capacity = Decimal(new_values['data']['capacity'])
        total_active_power_point_id = None
        active_power_a_point_id = None
        active_power_b_point_id = None
        active_power_c_point_id = None
        total_reactive_power_point_id = None
        reactive_power_a_point_id = None
        reactive_power_b_point_id = None
        reactive_power_c_point_id = None
        total_apparent_power_point_id = None
        apparent_power_a_point_id = None
        apparent_power_b_point_id = None
        apparent_power_c_point_id = None
        total_power_factor_point_id = None
        active_energy_import_point_id = None
        active_energy_export_point_id = None
        active_energy_net_point_id = None

        if 'total_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_active_power_point_id'], int) and \
                new_values['data']['total_active_power_point_id'] > 0:
            total_active_power_point_id = new_values['data']['total_active_power_point_id']

        if 'active_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_a_point_id'], int) and \
                new_values['data']['active_power_a_point_id'] > 0:
            active_power_a_point_id = new_values['data']['active_power_a_point_id']

        if 'active_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_b_point_id'], int) and \
                new_values['data']['active_power_b_point_id'] > 0:
            active_power_b_point_id = new_values['data']['active_power_b_point_id']

        if 'active_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_c_point_id'], int) and \
                new_values['data']['active_power_c_point_id'] > 0:
            active_power_c_point_id = new_values['data']['active_power_c_point_id']

        if 'total_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_reactive_power_point_id'], int) and \
                new_values['data']['total_reactive_power_point_id'] > 0:
            total_reactive_power_point_id = new_values['data']['total_reactive_power_point_id']

        if 'reactive_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_a_point_id'], int) and \
                new_values['data']['reactive_power_a_point_id'] > 0:
            reactive_power_a_point_id = new_values['data']['reactive_power_a_point_id']

        if 'reactive_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_b_point_id'], int) and \
                new_values['data']['reactive_power_b_point_id'] > 0:
            reactive_power_b_point_id = new_values['data']['reactive_power_b_point_id']

        if 'reactive_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_c_point_id'], int) and \
                new_values['data']['reactive_power_c_point_id'] > 0:
            reactive_power_c_point_id = new_values['data']['reactive_power_c_point_id']

        if 'total_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_apparent_power_point_id'], int) and \
                new_values['data']['total_apparent_power_point_id'] > 0:
            total_apparent_power_point_id = new_values['data']['total_apparent_power_point_id']

        if 'apparent_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_a_point_id'], int) and \
                new_values['data']['apparent_power_a_point_id'] > 0:
            apparent_power_a_point_id = new_values['data']['apparent_power_a_point_id']

        if 'apparent_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_b_point_id'], int) and \
                new_values['data']['apparent_power_b_point_id'] > 0:
            apparent_power_b_point_id = new_values['data']['apparent_power_b_point_id']

        if 'apparent_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_c_point_id'], int) and \
                new_values['data']['apparent_power_c_point_id'] > 0:
            apparent_power_c_point_id = new_values['data']['apparent_power_c_point_id']

        if 'total_power_factor_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_power_factor_point_id'], int) and \
                new_values['data']['total_power_factor_point_id'] > 0:
            total_power_factor_point_id = new_values['data']['total_power_factor_point_id']

        if 'active_energy_import_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_import_point_id'], int) and \
                new_values['data']['active_energy_import_point_id'] > 0:
            active_energy_import_point_id = new_values['data']['active_energy_import_point_id']

        if 'active_energy_export_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_export_point_id'], int) and \
                new_values['data']['active_energy_export_point_id'] > 0:
            active_energy_export_point_id = new_values['data']['active_energy_export_point_id']

        if 'active_energy_net_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_net_point_id'], int) and \
                new_values['data']['active_energy_net_point_id'] > 0:
            active_energy_net_point_id = new_values['data']['active_energy_net_point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_grids "
                       " WHERE id = %s ", (gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_GRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_grids "
                       " WHERE photovoltaic_power_station_id = %s AND name = %s AND id != %s ",
                       (id_, name, gid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_GRID_NAME_IS_ALREADY_IN_USE')

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
                       (buy_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.BUY_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (sell_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SELL_METER_NOT_FOUND')

        update_row = (" UPDATE tbl_photovoltaic_power_stations_grids "
                      " SET name = %s, photovoltaic_power_station_id = %s, "
                      "     power_point_id = %s, buy_meter_id = %s, sell_meter_id = %s, capacity = %s, "
                      "     total_active_power_point_id = %s, "
                      "     active_power_a_point_id = %s, "
                      "     active_power_b_point_id = %s, "
                      "     active_power_c_point_id = %s, "
                      "     total_reactive_power_point_id = %s, "
                      "     reactive_power_a_point_id = %s, "
                      "     reactive_power_b_point_id = %s, "
                      "     reactive_power_c_point_id = %s, "
                      "     total_apparent_power_point_id = %s, "
                      "     apparent_power_a_point_id = %s, "
                      "     apparent_power_b_point_id = %s, "
                      "     apparent_power_c_point_id = %s, "
                      "     total_power_factor_point_id = %s, "
                      "     active_energy_import_point_id = %s, "
                      "     active_energy_export_point_id = %s, "
                      "     active_energy_net_point_id = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    power_point_id,
                                    buy_meter_id,
                                    sell_meter_id,
                                    capacity,
                                    total_active_power_point_id,
                                    active_power_a_point_id,
                                    active_power_b_point_id,
                                    active_power_c_point_id,
                                    total_reactive_power_point_id,
                                    reactive_power_a_point_id,
                                    reactive_power_b_point_id,
                                    reactive_power_c_point_id,
                                    total_apparent_power_point_id,
                                    apparent_power_a_point_id,
                                    apparent_power_b_point_id,
                                    apparent_power_c_point_id,
                                    total_power_factor_point_id,
                                    active_energy_import_point_id,
                                    active_energy_export_point_id,
                                    active_energy_net_point_id,
                                    gid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class PhotovoltaicPowerStationInvertorCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

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

        # query meter dict
        query = (" SELECT id, name "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        model, "
                 "        serial_number, "
                 "        invertor_state_point_id, "
                 "        communication_state_point_id, "
                 "        total_energy_point_id, "
                 "        generation_meter_id, "
                 "        today_energy_point_id, "
                 "        efficiency_point_id, "
                 "        temperature_point_id, "
                 "        power_factor_point_id, "
                 "        active_power_point_id, "
                 "        reactive_power_point_id, "
                 "        frequency_point_id, "
                 "        uab_point_id, "
                 "        ubc_point_id, "
                 "        uca_point_id, "
                 "        ua_point_id, "
                 "        ub_point_id, "
                 "        uc_point_id, "
                 "        ia_point_id, "
                 "        ib_point_id, "
                 "        ic_point_id, "
                 "        pv1_u_point_id, "
                 "        pv1_i_point_id, "
                 "        pv2_u_point_id, "
                 "        pv2_i_point_id, "
                 "        pv3_u_point_id, "
                 "        pv3_i_point_id, "
                 "        pv4_u_point_id, "
                 "        pv4_i_point_id, "
                 "        pv5_u_point_id, "
                 "        pv5_i_point_id, "
                 "        pv6_u_point_id, "
                 "        pv6_i_point_id, "
                 "        pv7_u_point_id, "
                 "        pv7_i_point_id, "
                 "        pv8_u_point_id, "
                 "        pv8_i_point_id, "
                 "        pv9_u_point_id, "
                 "        pv9_i_point_id, "
                 "        pv10_u_point_id, "
                 "        pv10_i_point_id, "
                 "        pv11_u_point_id, "
                 "        pv11_i_point_id, "
                 "        pv12_u_point_id, "
                 "        pv12_i_point_id, "
                 "        pv13_u_point_id, "
                 "        pv13_i_point_id, "
                 "        pv14_u_point_id, "
                 "        pv14_i_point_id, "
                 "        pv15_u_point_id, "
                 "        pv15_i_point_id, "
                 "        pv16_u_point_id, "
                 "        pv16_i_point_id, "
                 "        pv17_u_point_id, "
                 "        pv17_i_point_id, "
                 "        pv18_u_point_id, "
                 "        pv18_i_point_id, "
                 "        pv19_u_point_id, "
                 "        pv19_i_point_id, "
                 "        pv20_u_point_id, "
                 "        pv20_i_point_id, "
                 "        pv21_u_point_id, "
                 "        pv21_i_point_id, "
                 "        pv22_u_point_id, "
                 "        pv22_i_point_id, "
                 "        pv23_u_point_id, "
                 "        pv23_i_point_id, "
                 "        pv24_u_point_id, "
                 "        pv24_i_point_id, "
                 "        pv25_u_point_id, "
                 "        pv25_i_point_id, "
                 "        pv26_u_point_id, "
                 "        pv26_i_point_id, "
                 "        pv27_u_point_id, "
                 "        pv27_i_point_id, "
                 "        pv28_u_point_id, "
                 "        pv28_i_point_id, "
                 "        mppt_total_energy_point_id, "
                 "        mppt_power_point_id, "
                 "        mppt_1_energy_point_id, "
                 "        mppt_2_energy_point_id, "
                 "        mppt_3_energy_point_id, "
                 "        mppt_4_energy_point_id, "
                 "        mppt_5_energy_point_id, "
                 "        mppt_6_energy_point_id, "
                 "        mppt_7_energy_point_id, "
                 "        mppt_8_energy_point_id, "
                 "        mppt_9_energy_point_id, "
                 "        mppt_10_energy_point_id "
                 " FROM tbl_photovoltaic_power_stations_invertors "
                 " WHERE photovoltaic_power_station_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "model": row[3],
                               "serial_number": row[4],
                               "invertor_state_point": point_dict.get(row[5]),
                               "communication_state_point": point_dict.get(row[6]),
                               "total_energy_point": point_dict.get(row[7]),
                               "generation_meter": meter_dict.get(row[8]),
                               "today_energy_point": point_dict.get(row[9]),
                               "efficiency_point": point_dict.get(row[10]),
                               "temperature_point": point_dict.get(row[11]),
                               "power_factor_point": point_dict.get(row[12]),
                               "active_power_point": point_dict.get(row[13]),
                               "reactive_power_point": point_dict.get(row[14]),
                               "frequency_point": point_dict.get(row[15]),
                               "uab_point": point_dict.get(row[16]),
                               "ubc_point": point_dict.get(row[17]),
                               "uca_point": point_dict.get(row[18]),
                               "ua_point": point_dict.get(row[19]),
                               "ub_point": point_dict.get(row[20]),
                               "uc_point": point_dict.get(row[21]),
                               "ia_point": point_dict.get(row[22]),
                               "ib_point": point_dict.get(row[23]),
                               "ic_point": point_dict.get(row[24]),
                               "pv1_u_point": point_dict.get(row[25]),
                               "pv1_i_point": point_dict.get(row[26]),
                               "pv2_u_point": point_dict.get(row[27]),
                               "pv2_i_point": point_dict.get(row[28]),
                               "pv3_u_point": point_dict.get(row[29]),
                               "pv3_i_point": point_dict.get(row[30]),
                               "pv4_u_point": point_dict.get(row[31]),
                               "pv4_i_point": point_dict.get(row[32]),
                               "pv5_u_point": point_dict.get(row[33]),
                               "pv5_i_point": point_dict.get(row[34]),
                               "pv6_u_point": point_dict.get(row[35]),
                               "pv6_i_point": point_dict.get(row[36]),
                               "pv7_u_point": point_dict.get(row[37]),
                               "pv7_i_point": point_dict.get(row[38]),
                               "pv8_u_point": point_dict.get(row[39]),
                               "pv8_i_point": point_dict.get(row[40]),
                               "pv9_u_point": point_dict.get(row[41]),
                               "pv9_i_point": point_dict.get(row[42]),
                               "pv10_u_point": point_dict.get(row[43]),
                               "pv10_i_point": point_dict.get(row[44]),
                               "pv11_u_point": point_dict.get(row[45]),
                               "pv11_i_point": point_dict.get(row[46]),
                               "pv12_u_point": point_dict.get(row[47]),
                               "pv12_i_point": point_dict.get(row[48]),
                               "pv13_u_point": point_dict.get(row[49]),
                               "pv13_i_point": point_dict.get(row[50]),
                               "pv14_u_point": point_dict.get(row[51]),
                               "pv14_i_point": point_dict.get(row[52]),
                               "pv15_u_point": point_dict.get(row[53]),
                               "pv15_i_point": point_dict.get(row[54]),
                               "pv16_u_point": point_dict.get(row[55]),
                               "pv16_i_point": point_dict.get(row[56]),
                               "pv17_u_point": point_dict.get(row[57]),
                               "pv17_i_point": point_dict.get(row[58]),
                               "pv18_u_point": point_dict.get(row[59]),
                               "pv18_i_point": point_dict.get(row[60]),
                               "pv19_u_point": point_dict.get(row[61]),
                               "pv19_i_point": point_dict.get(row[62]),
                               "pv20_u_point": point_dict.get(row[63]),
                               "pv20_i_point": point_dict.get(row[64]),
                               "pv21_u_point": point_dict.get(row[65]),
                               "pv21_i_point": point_dict.get(row[66]),
                               "pv22_u_point": point_dict.get(row[67]),
                               "pv22_i_point": point_dict.get(row[68]),
                               "pv23_u_point": point_dict.get(row[69]),
                               "pv23_i_point": point_dict.get(row[70]),
                               "pv24_u_point": point_dict.get(row[71]),
                               "pv24_i_point": point_dict.get(row[72]),
                               "pv25_u_point": point_dict.get(row[73]),
                               "pv25_i_point": point_dict.get(row[74]),
                               "pv26_u_point": point_dict.get(row[75]),
                               "pv26_i_point": point_dict.get(row[76]),
                               "pv27_u_point": point_dict.get(row[77]),
                               "pv27_i_point": point_dict.get(row[78]),
                               "pv28_u_point": point_dict.get(row[79]),
                               "pv28_i_point": point_dict.get(row[80]),
                               "mppt_total_energy_point": point_dict.get(row[81]),
                               "mppt_power_point": point_dict.get(row[82]),
                               "mppt_1_energy_point": point_dict.get(row[83]),
                               "mppt_2_energy_point": point_dict.get(row[84]),
                               "mppt_3_energy_point": point_dict.get(row[85]),
                               "mppt_4_energy_point": point_dict.get(row[85]),
                               "mppt_5_energy_point": point_dict.get(row[87]),
                               "mppt_6_energy_point": point_dict.get(row[88]),
                               "mppt_7_energy_point": point_dict.get(row[89]),
                               "mppt_8_energy_point": point_dict.get(row[90]),
                               "mppt_9_energy_point": point_dict.get(row[91]),
                               "mppt_10_energy_point": point_dict.get(row[92]),
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
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NAME')
        name = str.strip(new_values['data']['name'])

        if 'model' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['model'], str) or \
                len(str.strip(new_values['data']['model'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MODEL')
        model = str.strip(new_values['data']['model'])

        if 'serial_number' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['serial_number'], str) or \
                len(str.strip(new_values['data']['serial_number'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SERIAL_NUMBER')
        serial_number = str.strip(new_values['data']['serial_number'])

        if 'invertor_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['invertor_state_point_id'], int) or \
                new_values['data']['invertor_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_INVERTOR_STATE_POINT_ID')
        invertor_state_point_id = new_values['data']['invertor_state_point_id']

        if 'communication_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['communication_state_point_id'], int) or \
                new_values['data']['communication_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMUNICATION_STATE_POINT_ID')
        communication_state_point_id = new_values['data']['communication_state_point_id']

        if 'total_energy_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['total_energy_point_id'], int) or \
                new_values['data']['total_energy_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOTAL_ENERGY_POINT_ID')
        total_energy_point_id = new_values['data']['total_energy_point_id']

        if 'generation_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['generation_meter_id'], int) or \
                new_values['data']['generation_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GENERATION_METER_ID')
        generation_meter_id = new_values['data']['generation_meter_id']

        today_energy_point_id = None
        efficiency_point_id = None
        temperature_point_id = None
        power_factor_point_id = None
        active_power_point_id = None
        reactive_power_point_id = None
        frequency_point_id = None
        uab_point_id = None
        ubc_point_id = None
        uca_point_id = None
        ua_point_id = None
        ub_point_id = None
        uc_point_id = None
        ia_point_id = None
        ib_point_id = None
        ic_point_id = None
        pv1_u_point_id = None
        pv1_i_point_id = None
        pv2_u_point_id = None
        pv2_i_point_id = None
        pv3_u_point_id = None
        pv3_i_point_id = None
        pv4_u_point_id = None
        pv4_i_point_id = None
        pv5_u_point_id = None
        pv5_i_point_id = None
        pv6_u_point_id = None
        pv6_i_point_id = None
        pv7_u_point_id = None
        pv7_i_point_id = None
        pv8_u_point_id = None
        pv8_i_point_id = None
        pv9_u_point_id = None
        pv9_i_point_id = None
        pv10_u_point_id = None
        pv10_i_point_id = None
        pv11_u_point_id = None
        pv11_i_point_id = None
        pv12_u_point_id = None
        pv12_i_point_id = None
        pv13_u_point_id = None
        pv13_i_point_id = None
        pv14_u_point_id = None
        pv14_i_point_id = None
        pv15_u_point_id = None
        pv15_i_point_id = None
        pv16_u_point_id = None
        pv16_i_point_id = None
        pv17_u_point_id = None
        pv17_i_point_id = None
        pv18_u_point_id = None
        pv18_i_point_id = None
        pv19_u_point_id = None
        pv19_i_point_id = None
        pv20_u_point_id = None
        pv20_i_point_id = None
        pv21_u_point_id = None
        pv21_i_point_id = None
        pv22_u_point_id = None
        pv22_i_point_id = None
        pv23_u_point_id = None
        pv23_i_point_id = None
        pv24_u_point_id = None
        pv24_i_point_id = None
        pv25_u_point_id = None
        pv25_i_point_id = None
        pv26_u_point_id = None
        pv26_i_point_id = None
        pv27_u_point_id = None
        pv27_i_point_id = None
        pv28_u_point_id = None
        pv28_i_point_id = None
        mppt_total_energy_point_id = None
        mppt_power_point_id = None
        mppt_1_energy_point_id = None
        mppt_2_energy_point_id = None
        mppt_3_energy_point_id = None
        mppt_4_energy_point_id = None
        mppt_5_energy_point_id = None
        mppt_6_energy_point_id = None
        mppt_7_energy_point_id = None
        mppt_8_energy_point_id = None
        mppt_9_energy_point_id = None
        mppt_10_energy_point_id = None

        if 'today_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['today_energy_point_id'], int) and \
                new_values['data']['today_energy_point_id'] > 0:
            today_energy_point_id = new_values['data']['today_energy_point_id']

        if 'efficiency_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['efficiency_point_id'], int) and \
                new_values['data']['efficiency_point_id'] > 0:
            efficiency_point_id = new_values['data']['efficiency_point_id']

        if 'temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['temperature_point_id'], int) and \
                new_values['data']['temperature_point_id'] > 0:
            temperature_point_id = new_values['data']['temperature_point_id']

        if 'power_factor_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['power_factor_point_id'], int) and \
                new_values['data']['power_factor_point_id'] > 0:
            power_factor_point_id = new_values['data']['power_factor_point_id']

        if 'active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_point_id'], int) and \
                new_values['data']['active_power_point_id'] > 0:
            active_power_point_id = new_values['data']['active_power_point_id']

        if 'reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_point_id'], int) and \
                new_values['data']['reactive_power_point_id'] > 0:
            reactive_power_point_id = new_values['data']['reactive_power_point_id']

        if 'frequency_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['frequency_point_id'], int) and \
                new_values['data']['frequency_point_id'] > 0:
            frequency_point_id = new_values['data']['frequency_point_id']

        if 'uab_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['uab_point_id'], int) and \
                new_values['data']['uab_point_id'] > 0:
            uab_point_id = new_values['data']['uab_point_id']

        if 'ubc_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ubc_point_id'], int) and \
                new_values['data']['ubc_point_id'] > 0:
            ubc_point_id = new_values['data']['ubc_point_id']

        if 'uca_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['uca_point_id'], int) and \
                new_values['data']['uca_point_id'] > 0:
            uca_point_id = new_values['data']['uca_point_id']

        if 'ua_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ua_point_id'], int) and \
                new_values['data']['ua_point_id'] > 0:
            ua_point_id = new_values['data']['ua_point_id']

        if 'ub_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ub_point_id'], int) and \
                new_values['data']['ub_point_id'] > 0:
            ub_point_id = new_values['data']['ub_point_id']

        if 'uc_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['uc_point_id'], int) and \
                new_values['data']['uc_point_id'] > 0:
            uc_point_id = new_values['data']['uc_point_id']

        if 'ia_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ia_point_id'], int) and \
                new_values['data']['ia_point_id'] > 0:
            ia_point_id = new_values['data']['ia_point_id']

        if 'ib_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ib_point_id'], int) and \
                new_values['data']['ib_point_id'] > 0:
            ib_point_id = new_values['data']['ib_point_id']

        if 'ic_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ic_point_id'], int) and \
                new_values['data']['ic_point_id'] > 0:
            ic_point_id = new_values['data']['ic_point_id']

        if 'pv1_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv1_u_point_id'], int) and \
                new_values['data']['pv1_u_point_id'] > 0:
            pv1_u_point_id = new_values['data']['pv1_u_point_id']

        if 'pv1_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv1_i_point_id'], int) and \
                new_values['data']['pv1_i_point_id'] > 0:
            pv1_i_point_id = new_values['data']['pv1_i_point_id']

        if 'pv2_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv2_u_point_id'], int) and \
                new_values['data']['pv2_u_point_id'] > 0:
            pv2_u_point_id = new_values['data']['pv2_u_point_id']

        if 'pv2_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv2_i_point_id'], int) and \
                new_values['data']['pv2_i_point_id'] > 0:
            pv2_i_point_id = new_values['data']['pv2_i_point_id']

        if 'pv3_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv3_u_point_id'], int) and \
                new_values['data']['pv3_u_point_id'] > 0:
            pv3_u_point_id = new_values['data']['pv3_u_point_id']

        if 'pv3_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv3_i_point_id'], int) and \
                new_values['data']['pv3_i_point_id'] > 0:
            pv3_i_point_id = new_values['data']['pv3_i_point_id']

        if 'pv4_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv4_u_point_id'], int) and \
                new_values['data']['pv4_u_point_id'] > 0:
            pv4_u_point_id = new_values['data']['pv4_u_point_id']

        if 'pv4_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv4_i_point_id'], int) and \
                new_values['data']['pv4_i_point_id'] > 0:
            pv4_i_point_id = new_values['data']['pv4_i_point_id']

        if 'pv5_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv5_u_point_id'], int) and \
                new_values['data']['pv5_u_point_id'] > 0:
            pv5_u_point_id = new_values['data']['pv5_u_point_id']

        if 'pv5_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv5_i_point_id'], int) and \
                new_values['data']['pv5_i_point_id'] > 0:
            pv5_i_point_id = new_values['data']['pv5_i_point_id']

        if 'pv6_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv6_u_point_id'], int) and \
                new_values['data']['pv6_u_point_id'] > 0:
            pv6_u_point_id = new_values['data']['pv6_u_point_id']

        if 'pv6_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv6_i_point_id'], int) and \
                new_values['data']['pv6_i_point_id'] > 0:
            pv6_i_point_id = new_values['data']['pv6_i_point_id']

        if 'pv7_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv7_u_point_id'], int) and \
                new_values['data']['pv7_u_point_id'] > 0:
            pv7_u_point_id = new_values['data']['pv7_u_point_id']

        if 'pv7_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv7_i_point_id'], int) and \
                new_values['data']['pv7_i_point_id'] > 0:
            pv7_i_point_id = new_values['data']['pv7_i_point_id']

        if 'pv8_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv8_u_point_id'], int) and \
                new_values['data']['pv8_u_point_id'] > 0:
            pv8_u_point_id = new_values['data']['pv8_u_point_id']

        if 'pv8_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv8_i_point_id'], int) and \
                new_values['data']['pv8_i_point_id'] > 0:
            pv8_i_point_id = new_values['data']['pv8_i_point_id']

        if 'pv9_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv9_u_point_id'], int) and \
                new_values['data']['pv9_u_point_id'] > 0:
            pv9_u_point_id = new_values['data']['pv9_u_point_id']

        if 'pv9_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv9_i_point_id'], int) and \
                new_values['data']['pv9_i_point_id'] > 0:
            pv9_i_point_id = new_values['data']['pv9_i_point_id']

        if 'pv10_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv10_u_point_id'], int) and \
                new_values['data']['pv10_u_point_id'] > 0:
            pv10_u_point_id = new_values['data']['pv10_u_point_id']

        if 'pv10_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv10_i_point_id'], int) and \
                new_values['data']['pv10_i_point_id'] > 0:
            pv10_i_point_id = new_values['data']['pv10_i_point_id']

        if 'pv11_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv11_u_point_id'], int) and \
                new_values['data']['pv11_u_point_id'] > 0:
            pv11_u_point_id = new_values['data']['pv11_u_point_id']

        if 'pv11_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv11_i_point_id'], int) and \
                new_values['data']['pv11_i_point_id'] > 0:
            pv11_i_point_id = new_values['data']['pv11_i_point_id']

        if 'pv12_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv12_u_point_id'], int) and \
                new_values['data']['pv12_u_point_id'] > 0:
            pv12_u_point_id = new_values['data']['pv12_u_point_id']

        if 'pv12_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv12_i_point_id'], int) and \
                new_values['data']['pv12_i_point_id'] > 0:
            pv12_i_point_id = new_values['data']['pv12_i_point_id']

        if 'pv13_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv13_u_point_id'], int) and \
                new_values['data']['pv13_u_point_id'] > 0:
            pv13_u_point_id = new_values['data']['pv13_u_point_id']

        if 'pv13_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv13_i_point_id'], int) and \
                new_values['data']['pv13_i_point_id'] > 0:
            pv13_i_point_id = new_values['data']['pv13_i_point_id']

        if 'pv14_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv14_u_point_id'], int) and \
                new_values['data']['pv14_u_point_id'] > 0:
            pv14_u_point_id = new_values['data']['pv14_u_point_id']

        if 'pv14_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv14_i_point_id'], int) and \
                new_values['data']['pv14_i_point_id'] > 0:
            pv14_i_point_id = new_values['data']['pv14_i_point_id']

        if 'pv15_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv15_u_point_id'], int) and \
                new_values['data']['pv15_u_point_id'] > 0:
            pv15_u_point_id = new_values['data']['pv15_u_point_id']

        if 'pv15_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv15_i_point_id'], int) and \
                new_values['data']['pv15_i_point_id'] > 0:
            pv15_i_point_id = new_values['data']['pv15_i_point_id']

        if 'pv16_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv16_u_point_id'], int) and \
                new_values['data']['pv16_u_point_id'] > 0:
            pv16_u_point_id = new_values['data']['pv16_u_point_id']

        if 'pv16_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv16_i_point_id'], int) and \
                new_values['data']['pv16_i_point_id'] > 0:
            pv16_i_point_id = new_values['data']['pv16_i_point_id']

        if 'pv17_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv17_u_point_id'], int) and \
                new_values['data']['pv17_u_point_id'] > 0:
            pv17_u_point_id = new_values['data']['pv17_u_point_id']

        if 'pv17_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv17_i_point_id'], int) and \
                new_values['data']['pv17_i_point_id'] > 0:
            pv17_i_point_id = new_values['data']['pv17_i_point_id']

        if 'pv18_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv18_u_point_id'], int) and \
                new_values['data']['pv18_u_point_id'] > 0:
            pv18_u_point_id = new_values['data']['pv18_u_point_id']

        if 'pv18_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv18_i_point_id'], int) and \
                new_values['data']['pv18_i_point_id'] > 0:
            pv18_i_point_id = new_values['data']['pv18_i_point_id']

        if 'pv19_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv19_u_point_id'], int) and \
                new_values['data']['pv19_u_point_id'] > 0:
            pv19_u_point_id = new_values['data']['pv19_u_point_id']

        if 'pv19_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv19_i_point_id'], int) and \
                new_values['data']['pv19_i_point_id'] > 0:
            pv19_i_point_id = new_values['data']['pv19_i_point_id']

        if 'pv20_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv20_u_point_id'], int) and \
                new_values['data']['pv20_u_point_id'] > 0:
            pv20_u_point_id = new_values['data']['pv20_u_point_id']

        if 'pv20_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv20_i_point_id'], int) and \
                new_values['data']['pv20_i_point_id'] > 0:
            pv20_i_point_id = new_values['data']['pv20_i_point_id']

        if 'pv21_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv21_u_point_id'], int) and \
                new_values['data']['pv21_u_point_id'] > 0:
            pv21_u_point_id = new_values['data']['pv21_u_point_id']

        if 'pv21_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv21_i_point_id'], int) and \
                new_values['data']['pv21_i_point_id'] > 0:
            pv21_i_point_id = new_values['data']['pv21_i_point_id']

        if 'pv22_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv22_u_point_id'], int) and \
                new_values['data']['pv22_u_point_id'] > 0:
            pv22_u_point_id = new_values['data']['pv22_u_point_id']

        if 'pv22_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv22_i_point_id'], int) and \
                new_values['data']['pv22_i_point_id'] > 0:
            pv22_i_point_id = new_values['data']['pv22_i_point_id']

        if 'pv23_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv23_u_point_id'], int) and \
                new_values['data']['pv23_u_point_id'] > 0:
            pv23_u_point_id = new_values['data']['pv23_u_point_id']

        if 'pv23_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv23_i_point_id'], int) and \
                new_values['data']['pv23_i_point_id'] > 0:
            pv23_i_point_id = new_values['data']['pv23_i_point_id']

        if 'pv24_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv24_u_point_id'], int) and \
                new_values['data']['pv24_u_point_id'] > 0:
            pv24_u_point_id = new_values['data']['pv24_u_point_id']

        if 'pv24_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv24_i_point_id'], int) and \
                new_values['data']['pv24_i_point_id'] > 0:
            pv24_i_point_id = new_values['data']['pv24_i_point_id']

        if 'pv25_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv25_u_point_id'], int) and \
                new_values['data']['pv25_u_point_id'] > 0:
            pv25_u_point_id = new_values['data']['pv25_u_point_id']

        if 'pv25_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv25_i_point_id'], int) and \
                new_values['data']['pv25_i_point_id'] > 0:
            pv25_i_point_id = new_values['data']['pv25_i_point_id']

        if 'pv26_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv26_u_point_id'], int) and \
                new_values['data']['pv26_u_point_id'] > 0:
            pv26_u_point_id = new_values['data']['pv26_u_point_id']

        if 'pv26_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv26_i_point_id'], int) and \
                new_values['data']['pv26_i_point_id'] > 0:
            pv26_i_point_id = new_values['data']['pv26_i_point_id']

        if 'pv27_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv27_u_point_id'], int) and \
                new_values['data']['pv27_u_point_id'] > 0:
            pv27_u_point_id = new_values['data']['pv27_u_point_id']

        if 'pv27_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv27_i_point_id'], int) and \
                new_values['data']['pv27_i_point_id'] > 0:
            pv27_i_point_id = new_values['data']['pv27_i_point_id']

        if 'pv28_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv28_u_point_id'], int) and \
                new_values['data']['pv28_u_point_id'] > 0:
            pv28_u_point_id = new_values['data']['pv28_u_point_id']

        if 'pv28_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv28_i_point_id'], int) and \
                new_values['data']['pv28_i_point_id'] > 0:
            pv28_i_point_id = new_values['data']['pv28_i_point_id']

        if 'mppt_total_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_total_energy_point_id'], int) and \
                new_values['data']['mppt_total_energy_point_id'] > 0:
            mppt_total_energy_point_id = new_values['data']['mppt_total_energy_point_id']

        if 'mppt_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_power_point_id'], int) and \
                new_values['data']['mppt_power_point_id'] > 0:
            mppt_power_point_id = new_values['data']['mppt_power_point_id']

        if 'mppt_1_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_1_energy_point_id'], int) and \
                new_values['data']['mppt_1_energy_point_id'] > 0:
            mppt_1_energy_point_id = new_values['data']['mppt_1_energy_point_id']

        if 'mppt_2_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_2_energy_point_id'], int) and \
                new_values['data']['mppt_2_energy_point_id'] > 0:
            mppt_2_energy_point_id = new_values['data']['mppt_2_energy_point_id']

        if 'mppt_3_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_3_energy_point_id'], int) and \
                new_values['data']['mppt_3_energy_point_id'] > 0:
            mppt_3_energy_point_id = new_values['data']['mppt_3_energy_point_id']

        if 'mppt_4_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_4_energy_point_id'], int) and \
                new_values['data']['mppt_4_energy_point_id'] > 0:
            mppt_4_energy_point_id = new_values['data']['mppt_4_energy_point_id']

        if 'mppt_5_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_5_energy_point_id'], int) and \
                new_values['data']['mppt_5_energy_point_id'] > 0:
            mppt_5_energy_point_id = new_values['data']['mppt_5_energy_point_id']

        if 'mppt_6_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_6_energy_point_id'], int) and \
                new_values['data']['mppt_6_energy_point_id'] > 0:
            mppt_6_energy_point_id = new_values['data']['mppt_6_energy_point_id']

        if 'mppt_7_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_7_energy_point_id'], int) and \
                new_values['data']['mppt_7_energy_point_id'] > 0:
            mppt_7_energy_point_id = new_values['data']['mppt_7_energy_point_id']

        if 'mppt_8_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_8_energy_point_id'], int) and \
                new_values['data']['mppt_8_energy_point_id'] > 0:
            mppt_8_energy_point_id = new_values['data']['mppt_8_energy_point_id']

        if 'mppt_9_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_9_energy_point_id'], int) and \
                new_values['data']['mppt_9_energy_point_id'] > 0:
            mppt_9_energy_point_id = new_values['data']['mppt_9_energy_point_id']

        if 'mppt_10_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_10_energy_point_id'], int) and \
                new_values['data']['mppt_10_energy_point_id'] > 0:
            mppt_10_energy_point_id = new_values['data']['mppt_10_energy_point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_invertors "
                       " WHERE photovoltaic_power_station_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_INVERTOR_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (invertor_state_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.INVERTOR_STATE_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (communication_state_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMUNICATION_STATE_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (total_energy_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TOTAL_ENERGY_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (generation_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GENERATION_METER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_photovoltaic_power_stations_invertors "
                      "    (name, uuid, "
                      "     photovoltaic_power_station_id, "
                      "     model, "
                      "     serial_number, "
                      "     invertor_state_point_id, "
                      "     communication_state_point_id, "
                      "     total_energy_point_id, "
                      "     generation_meter_id, "
                      "     today_energy_point_id, "
                      "     efficiency_point_id, "
                      "     temperature_point_id, "
                      "     power_factor_point_id, "
                      "     active_power_point_id, "
                      "     reactive_power_point_id, "
                      "     frequency_point_id, "
                      "     uab_point_id, "
                      "     ubc_point_id, "
                      "     uca_point_id, "
                      "     ua_point_id, "
                      "     ub_point_id, "
                      "     uc_point_id, "
                      "     ia_point_id, "
                      "     ib_point_id, "
                      "     ic_point_id, "
                      "     pv1_u_point_id, "
                      "     pv1_i_point_id, "
                      "     pv2_u_point_id, "
                      "     pv2_i_point_id, "
                      "     pv3_u_point_id, "
                      "     pv3_i_point_id, "
                      "     pv4_u_point_id, "
                      "     pv4_i_point_id, "
                      "     pv5_u_point_id, "
                      "     pv5_i_point_id, "
                      "     pv6_u_point_id, "
                      "     pv6_i_point_id, "
                      "     pv7_u_point_id, "
                      "     pv7_i_point_id, "
                      "     pv8_u_point_id, "
                      "     pv8_i_point_id, "
                      "     pv9_u_point_id, "
                      "     pv9_i_point_id, "
                      "     pv10_u_point_id, "
                      "     pv10_i_point_id, "
                      "     pv11_u_point_id, "
                      "     pv11_i_point_id, "
                      "     pv12_u_point_id, "
                      "     pv12_i_point_id, "
                      "     pv13_u_point_id, "
                      "     pv13_i_point_id, "
                      "     pv14_u_point_id, "
                      "     pv14_i_point_id, "
                      "     pv15_u_point_id, "
                      "     pv15_i_point_id, "
                      "     pv16_u_point_id, "
                      "     pv16_i_point_id, "
                      "     pv17_u_point_id, "
                      "     pv17_i_point_id, "
                      "     pv18_u_point_id, "
                      "     pv18_i_point_id, "
                      "     pv19_u_point_id, "
                      "     pv19_i_point_id, "
                      "     pv20_u_point_id, "
                      "     pv20_i_point_id, "
                      "     pv21_u_point_id, "
                      "     pv21_i_point_id, "
                      "     pv22_u_point_id, "
                      "     pv22_i_point_id, "
                      "     pv23_u_point_id, "
                      "     pv23_i_point_id, "
                      "     pv24_u_point_id, "
                      "     pv24_i_point_id, "
                      "     pv25_u_point_id, "
                      "     pv25_i_point_id, "
                      "     pv26_u_point_id, "
                      "     pv26_i_point_id, "
                      "     pv27_u_point_id, "
                      "     pv27_i_point_id, "
                      "     pv28_u_point_id, "
                      "     pv28_i_point_id, "
                      "     mppt_total_energy_point_id, "
                      "     mppt_power_point_id, "
                      "     mppt_1_energy_point_id, "
                      "     mppt_2_energy_point_id, "
                      "     mppt_3_energy_point_id, "
                      "     mppt_4_energy_point_id, "
                      "     mppt_5_energy_point_id, "
                      "     mppt_6_energy_point_id, "
                      "     mppt_7_energy_point_id, "
                      "     mppt_8_energy_point_id, "
                      "     mppt_9_energy_point_id, "
                      "     mppt_10_energy_point_id) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    model,
                                    serial_number,
                                    invertor_state_point_id,
                                    communication_state_point_id,
                                    total_energy_point_id,
                                    generation_meter_id,
                                    today_energy_point_id,
                                    efficiency_point_id,
                                    temperature_point_id,
                                    power_factor_point_id,
                                    active_power_point_id,
                                    reactive_power_point_id,
                                    frequency_point_id,
                                    uab_point_id,
                                    ubc_point_id,
                                    uca_point_id,
                                    ua_point_id,
                                    ub_point_id,
                                    uc_point_id,
                                    ia_point_id,
                                    ib_point_id,
                                    ic_point_id,
                                    pv1_u_point_id,
                                    pv1_i_point_id,
                                    pv2_u_point_id,
                                    pv2_i_point_id,
                                    pv3_u_point_id,
                                    pv3_i_point_id,
                                    pv4_u_point_id,
                                    pv4_i_point_id,
                                    pv5_u_point_id,
                                    pv5_i_point_id,
                                    pv6_u_point_id,
                                    pv6_i_point_id,
                                    pv7_u_point_id,
                                    pv7_i_point_id,
                                    pv8_u_point_id,
                                    pv8_i_point_id,
                                    pv9_u_point_id,
                                    pv9_i_point_id,
                                    pv10_u_point_id,
                                    pv10_i_point_id,
                                    pv11_u_point_id,
                                    pv11_i_point_id,
                                    pv12_u_point_id,
                                    pv12_i_point_id,
                                    pv13_u_point_id,
                                    pv13_i_point_id,
                                    pv14_u_point_id,
                                    pv14_i_point_id,
                                    pv15_u_point_id,
                                    pv15_i_point_id,
                                    pv16_u_point_id,
                                    pv16_i_point_id,
                                    pv17_u_point_id,
                                    pv17_i_point_id,
                                    pv18_u_point_id,
                                    pv18_i_point_id,
                                    pv19_u_point_id,
                                    pv19_i_point_id,
                                    pv20_u_point_id,
                                    pv20_i_point_id,
                                    pv21_u_point_id,
                                    pv21_i_point_id,
                                    pv22_u_point_id,
                                    pv22_i_point_id,
                                    pv23_u_point_id,
                                    pv23_i_point_id,
                                    pv24_u_point_id,
                                    pv24_i_point_id,
                                    pv25_u_point_id,
                                    pv25_i_point_id,
                                    pv26_u_point_id,
                                    pv26_i_point_id,
                                    pv27_u_point_id,
                                    pv27_i_point_id,
                                    pv28_u_point_id,
                                    pv28_i_point_id,
                                    mppt_total_energy_point_id,
                                    mppt_power_point_id,
                                    mppt_1_energy_point_id,
                                    mppt_2_energy_point_id,
                                    mppt_3_energy_point_id,
                                    mppt_4_energy_point_id,
                                    mppt_5_energy_point_id,
                                    mppt_6_energy_point_id,
                                    mppt_7_energy_point_id,
                                    mppt_8_energy_point_id,
                                    mppt_9_energy_point_id,
                                    mppt_10_energy_point_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/photovoltaicpowerstations/' + str(id_) + '/grids/' + str(new_id)


class PhotovoltaicPowerStationInvertorItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, iid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, iid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')
        if not iid.isdigit() or int(iid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_INVERTOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

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

        # query meter dict
        query = (" SELECT id, name "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        model, "
                 "        serial_number, "
                 "        invertor_state_point_id, "
                 "        communication_state_point_id, "
                 "        total_energy_point_id, "
                 "        generation_meter_id, "
                 "        today_energy_point_id, "
                 "        efficiency_point_id, "
                 "        temperature_point_id, "
                 "        power_factor_point_id, "
                 "        active_power_point_id, "
                 "        reactive_power_point_id, "
                 "        frequency_point_id, "
                 "        uab_point_id, "
                 "        ubc_point_id, "
                 "        uca_point_id, "
                 "        ua_point_id, "
                 "        ub_point_id, "
                 "        uc_point_id, "
                 "        ia_point_id, "
                 "        ib_point_id, "
                 "        ic_point_id, "
                 "        pv1_u_point_id, "
                 "        pv1_i_point_id, "
                 "        pv2_u_point_id, "
                 "        pv2_i_point_id, "
                 "        pv3_u_point_id, "
                 "        pv3_i_point_id, "
                 "        pv4_u_point_id, "
                 "        pv4_i_point_id, "
                 "        pv5_u_point_id, "
                 "        pv5_i_point_id, "
                 "        pv6_u_point_id, "
                 "        pv6_i_point_id, "
                 "        pv7_u_point_id, "
                 "        pv7_i_point_id, "
                 "        pv8_u_point_id, "
                 "        pv8_i_point_id, "
                 "        pv9_u_point_id, "
                 "        pv9_i_point_id, "
                 "        pv10_u_point_id, "
                 "        pv10_i_point_id, "
                 "        pv11_u_point_id, "
                 "        pv11_i_point_id, "
                 "        pv12_u_point_id, "
                 "        pv12_i_point_id, "
                 "        pv13_u_point_id, "
                 "        pv13_i_point_id, "
                 "        pv14_u_point_id, "
                 "        pv14_i_point_id, "
                 "        pv15_u_point_id, "
                 "        pv15_i_point_id, "
                 "        pv16_u_point_id, "
                 "        pv16_i_point_id, "
                 "        pv17_u_point_id, "
                 "        pv17_i_point_id, "
                 "        pv18_u_point_id, "
                 "        pv18_i_point_id, "
                 "        pv19_u_point_id, "
                 "        pv19_i_point_id, "
                 "        pv20_u_point_id, "
                 "        pv20_i_point_id, "
                 "        pv21_u_point_id, "
                 "        pv21_i_point_id, "
                 "        pv22_u_point_id, "
                 "        pv22_i_point_id, "
                 "        pv23_u_point_id, "
                 "        pv23_i_point_id, "
                 "        pv24_u_point_id, "
                 "        pv24_i_point_id, "
                 "        pv25_u_point_id, "
                 "        pv25_i_point_id, "
                 "        pv26_u_point_id, "
                 "        pv26_i_point_id, "
                 "        pv27_u_point_id, "
                 "        pv27_i_point_id, "
                 "        pv28_u_point_id, "
                 "        pv28_i_point_id, "
                 "        mppt_total_energy_point_id, "
                 "        mppt_power_point_id, "
                 "        mppt_1_energy_point_id, "
                 "        mppt_2_energy_point_id, "
                 "        mppt_3_energy_point_id, "
                 "        mppt_4_energy_point_id, "
                 "        mppt_5_energy_point_id, "
                 "        mppt_6_energy_point_id, "
                 "        mppt_7_energy_point_id, "
                 "        mppt_8_energy_point_id, "
                 "        mppt_9_energy_point_id, "
                 "        mppt_10_energy_point_id "
                 " FROM tbl_photovoltaic_power_stations_invertors "
                 " WHERE id = %s ")
        cursor.execute(query, (iid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_INVERTOR_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "model": row[3],
                           "serial_number": row[4],
                           "invertor_state_point": point_dict.get(row[5]),
                           "communication_state_point": point_dict.get(row[6]),
                           "total_energy_point": point_dict.get(row[7]),
                           "generation_mter": meter_dict.get(row[8]),
                           "today_energy_point": point_dict.get(row[9]),
                           "efficiency_point": point_dict.get(row[10]),
                           "temperature_point": point_dict.get(row[11]),
                           "power_factor_point": point_dict.get(row[12]),
                           "active_power_point": point_dict.get(row[13]),
                           "reactive_power_point": point_dict.get(row[14]),
                           "frequency_point": point_dict.get(row[15]),
                           "uab_point": point_dict.get(row[16]),
                           "ubc_point": point_dict.get(row[17]),
                           "uca_point": point_dict.get(row[18]),
                           "ua_point": point_dict.get(row[19]),
                           "ub_point": point_dict.get(row[20]),
                           "uc_point": point_dict.get(row[21]),
                           "ia_point": point_dict.get(row[22]),
                           "ib_point": point_dict.get(row[23]),
                           "ic_point": point_dict.get(row[24]),
                           "pv1_u_point": point_dict.get(row[25]),
                           "pv1_i_point": point_dict.get(row[26]),
                           "pv2_u_point": point_dict.get(row[27]),
                           "pv2_i_point": point_dict.get(row[28]),
                           "pv3_u_point": point_dict.get(row[29]),
                           "pv3_i_point": point_dict.get(row[30]),
                           "pv4_u_point": point_dict.get(row[31]),
                           "pv4_i_point": point_dict.get(row[32]),
                           "pv5_u_point": point_dict.get(row[33]),
                           "pv5_i_point": point_dict.get(row[34]),
                           "pv6_u_point": point_dict.get(row[35]),
                           "pv6_i_point": point_dict.get(row[36]),
                           "pv7_u_point": point_dict.get(row[37]),
                           "pv7_i_point": point_dict.get(row[38]),
                           "pv8_u_point": point_dict.get(row[39]),
                           "pv8_i_point": point_dict.get(row[40]),
                           "pv9_u_point": point_dict.get(row[41]),
                           "pv9_i_point": point_dict.get(row[42]),
                           "pv10_u_point": point_dict.get(row[43]),
                           "pv10_i_point": point_dict.get(row[44]),
                           "pv11_u_point": point_dict.get(row[45]),
                           "pv11_i_point": point_dict.get(row[46]),
                           "pv12_u_point": point_dict.get(row[47]),
                           "pv12_i_point": point_dict.get(row[48]),
                           "pv13_u_point": point_dict.get(row[49]),
                           "pv13_i_point": point_dict.get(row[50]),
                           "pv14_u_point": point_dict.get(row[51]),
                           "pv14_i_point": point_dict.get(row[52]),
                           "pv15_u_point": point_dict.get(row[53]),
                           "pv15_i_point": point_dict.get(row[54]),
                           "pv16_u_point": point_dict.get(row[55]),
                           "pv16_i_point": point_dict.get(row[56]),
                           "pv17_u_point": point_dict.get(row[57]),
                           "pv17_i_point": point_dict.get(row[58]),
                           "pv18_u_point": point_dict.get(row[59]),
                           "pv18_i_point": point_dict.get(row[60]),
                           "pv19_u_point": point_dict.get(row[61]),
                           "pv19_i_point": point_dict.get(row[62]),
                           "pv20_u_point": point_dict.get(row[63]),
                           "pv20_i_point": point_dict.get(row[64]),
                           "pv21_u_point": point_dict.get(row[65]),
                           "pv21_i_point": point_dict.get(row[66]),
                           "pv22_u_point": point_dict.get(row[67]),
                           "pv22_i_point": point_dict.get(row[68]),
                           "pv23_u_point": point_dict.get(row[69]),
                           "pv23_i_point": point_dict.get(row[70]),
                           "pv24_u_point": point_dict.get(row[71]),
                           "pv24_i_point": point_dict.get(row[72]),
                           "pv25_u_point": point_dict.get(row[73]),
                           "pv25_i_point": point_dict.get(row[74]),
                           "pv26_u_point": point_dict.get(row[75]),
                           "pv26_i_point": point_dict.get(row[76]),
                           "pv27_u_point": point_dict.get(row[77]),
                           "pv27_i_point": point_dict.get(row[78]),
                           "pv28_u_point": point_dict.get(row[79]),
                           "pv28_i_point": point_dict.get(row[80]),
                           "mppt_total_energy_point": point_dict.get(row[81]),
                           "mppt_power_point": point_dict.get(row[82]),
                           "mppt_1_energy_point": point_dict.get(row[83]),
                           "mppt_2_energy_point": point_dict.get(row[84]),
                           "mppt_3_energy_point": point_dict.get(row[85]),
                           "mppt_4_energy_point": point_dict.get(row[85]),
                           "mppt_5_energy_point": point_dict.get(row[87]),
                           "mppt_6_energy_point": point_dict.get(row[88]),
                           "mppt_7_energy_point": point_dict.get(row[89]),
                           "mppt_8_energy_point": point_dict.get(row[90]),
                           "mppt_9_energy_point": point_dict.get(row[91]),
                           "mppt_10_energy_point": point_dict.get(row[92]),
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, iid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')
        if not iid.isdigit() or int(iid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_INVERTOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_invertors "
                       " WHERE id = %s ", (iid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_INVERTOR_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_photovoltaic_power_stations_invertors "
                       " WHERE id = %s ", (iid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, iid):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        if not iid.isdigit() or int(iid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_INVERTOR_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NAME')
        name = str.strip(new_values['data']['name'])

        if 'model' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['model'], str) or \
                len(str.strip(new_values['data']['model'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MODEL')
        model = str.strip(new_values['data']['model'])

        if 'serial_number' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['serial_number'], str) or \
                len(str.strip(new_values['data']['serial_number'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SERIAL_NUMBER')
        serial_number = str.strip(new_values['data']['serial_number'])

        if 'invertor_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['invertor_state_point_id'], int) or \
                new_values['data']['invertor_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_INVERTOR_STATE_POINT_ID')
        invertor_state_point_id = new_values['data']['invertor_state_point_id']

        if 'communication_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['communication_state_point_id'], int) or \
                new_values['data']['communication_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMUNICATION_STATE_POINT_ID')
        communication_state_point_id = new_values['data']['communication_state_point_id']

        if 'total_energy_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['total_energy_point_id'], int) or \
                new_values['data']['total_energy_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOTAL_ENERGY_POINT_ID')
        total_energy_point_id = new_values['data']['total_energy_point_id']

        if 'generation_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['generation_meter_id'], int) or \
                new_values['data']['generation_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GENERATION_METER_ID')
        generation_meter_id = new_values['data']['generation_meter_id']

        today_energy_point_id = None
        efficiency_point_id = None
        temperature_point_id = None
        power_factor_point_id = None
        active_power_point_id = None
        reactive_power_point_id = None
        frequency_point_id = None
        uab_point_id = None
        ubc_point_id = None
        uca_point_id = None
        ua_point_id = None
        ub_point_id = None
        uc_point_id = None
        ia_point_id = None
        ib_point_id = None
        ic_point_id = None
        pv1_u_point_id = None
        pv1_i_point_id = None
        pv2_u_point_id = None
        pv2_i_point_id = None
        pv3_u_point_id = None
        pv3_i_point_id = None
        pv4_u_point_id = None
        pv4_i_point_id = None
        pv5_u_point_id = None
        pv5_i_point_id = None
        pv6_u_point_id = None
        pv6_i_point_id = None
        pv7_u_point_id = None
        pv7_i_point_id = None
        pv8_u_point_id = None
        pv8_i_point_id = None
        pv9_u_point_id = None
        pv9_i_point_id = None
        pv10_u_point_id = None
        pv10_i_point_id = None
        pv11_u_point_id = None
        pv11_i_point_id = None
        pv12_u_point_id = None
        pv12_i_point_id = None
        pv13_u_point_id = None
        pv13_i_point_id = None
        pv14_u_point_id = None
        pv14_i_point_id = None
        pv15_u_point_id = None
        pv15_i_point_id = None
        pv16_u_point_id = None
        pv16_i_point_id = None
        pv17_u_point_id = None
        pv17_i_point_id = None
        pv18_u_point_id = None
        pv18_i_point_id = None
        pv19_u_point_id = None
        pv19_i_point_id = None
        pv20_u_point_id = None
        pv20_i_point_id = None
        pv21_u_point_id = None
        pv21_i_point_id = None
        pv22_u_point_id = None
        pv22_i_point_id = None
        pv23_u_point_id = None
        pv23_i_point_id = None
        pv24_u_point_id = None
        pv24_i_point_id = None
        pv25_u_point_id = None
        pv25_i_point_id = None
        pv26_u_point_id = None
        pv26_i_point_id = None
        pv27_u_point_id = None
        pv27_i_point_id = None
        pv28_u_point_id = None
        pv28_i_point_id = None
        mppt_total_energy_point_id = None
        mppt_power_point_id = None
        mppt_1_energy_point_id = None
        mppt_2_energy_point_id = None
        mppt_3_energy_point_id = None
        mppt_4_energy_point_id = None
        mppt_5_energy_point_id = None
        mppt_6_energy_point_id = None
        mppt_7_energy_point_id = None
        mppt_8_energy_point_id = None
        mppt_9_energy_point_id = None
        mppt_10_energy_point_id = None

        if 'today_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['today_energy_point_id'], int) and \
                new_values['data']['today_energy_point_id'] > 0:
            today_energy_point_id = new_values['data']['today_energy_point_id']

        if 'efficiency_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['efficiency_point_id'], int) and \
                new_values['data']['efficiency_point_id'] > 0:
            efficiency_point_id = new_values['data']['efficiency_point_id']

        if 'temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['temperature_point_id'], int) and \
                new_values['data']['temperature_point_id'] > 0:
            temperature_point_id = new_values['data']['temperature_point_id']

        if 'power_factor_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['power_factor_point_id'], int) and \
                new_values['data']['power_factor_point_id'] > 0:
            power_factor_point_id = new_values['data']['power_factor_point_id']

        if 'active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_point_id'], int) and \
                new_values['data']['active_power_point_id'] > 0:
            active_power_point_id = new_values['data']['active_power_point_id']

        if 'reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_point_id'], int) and \
                new_values['data']['reactive_power_point_id'] > 0:
            reactive_power_point_id = new_values['data']['reactive_power_point_id']

        if 'frequency_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['frequency_point_id'], int) and \
                new_values['data']['frequency_point_id'] > 0:
            frequency_point_id = new_values['data']['frequency_point_id']

        if 'uab_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['uab_point_id'], int) and \
                new_values['data']['uab_point_id'] > 0:
            uab_point_id = new_values['data']['uab_point_id']

        if 'ubc_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ubc_point_id'], int) and \
                new_values['data']['ubc_point_id'] > 0:
            ubc_point_id = new_values['data']['ubc_point_id']

        if 'uca_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['uca_point_id'], int) and \
                new_values['data']['uca_point_id'] > 0:
            uca_point_id = new_values['data']['uca_point_id']

        if 'ua_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ua_point_id'], int) and \
                new_values['data']['ua_point_id'] > 0:
            ua_point_id = new_values['data']['ua_point_id']

        if 'ub_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ub_point_id'], int) and \
                new_values['data']['ub_point_id'] > 0:
            ub_point_id = new_values['data']['ub_point_id']

        if 'uc_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['uc_point_id'], int) and \
                new_values['data']['uc_point_id'] > 0:
            uc_point_id = new_values['data']['uc_point_id']

        if 'ia_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ia_point_id'], int) and \
                new_values['data']['ia_point_id'] > 0:
            ia_point_id = new_values['data']['ia_point_id']

        if 'ib_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ib_point_id'], int) and \
                new_values['data']['ib_point_id'] > 0:
            ib_point_id = new_values['data']['ib_point_id']

        if 'ic_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ic_point_id'], int) and \
                new_values['data']['ic_point_id'] > 0:
            ic_point_id = new_values['data']['ic_point_id']

        if 'pv1_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv1_u_point_id'], int) and \
                new_values['data']['pv1_u_point_id'] > 0:
            pv1_u_point_id = new_values['data']['pv1_u_point_id']

        if 'pv1_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv1_i_point_id'], int) and \
                new_values['data']['pv1_i_point_id'] > 0:
            pv1_i_point_id = new_values['data']['pv1_i_point_id']

        if 'pv2_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv2_u_point_id'], int) and \
                new_values['data']['pv2_u_point_id'] > 0:
            pv2_u_point_id = new_values['data']['pv2_u_point_id']

        if 'pv2_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv2_i_point_id'], int) and \
                new_values['data']['pv2_i_point_id'] > 0:
            pv2_i_point_id = new_values['data']['pv2_i_point_id']

        if 'pv3_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv3_u_point_id'], int) and \
                new_values['data']['pv3_u_point_id'] > 0:
            pv3_u_point_id = new_values['data']['pv3_u_point_id']

        if 'pv3_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv3_i_point_id'], int) and \
                new_values['data']['pv3_i_point_id'] > 0:
            pv3_i_point_id = new_values['data']['pv3_i_point_id']

        if 'pv4_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv4_u_point_id'], int) and \
                new_values['data']['pv4_u_point_id'] > 0:
            pv4_u_point_id = new_values['data']['pv4_u_point_id']

        if 'pv4_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv4_i_point_id'], int) and \
                new_values['data']['pv4_i_point_id'] > 0:
            pv4_i_point_id = new_values['data']['pv4_i_point_id']

        if 'pv5_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv5_u_point_id'], int) and \
                new_values['data']['pv5_u_point_id'] > 0:
            pv5_u_point_id = new_values['data']['pv5_u_point_id']

        if 'pv5_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv5_i_point_id'], int) and \
                new_values['data']['pv5_i_point_id'] > 0:
            pv5_i_point_id = new_values['data']['pv5_i_point_id']

        if 'pv6_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv6_u_point_id'], int) and \
                new_values['data']['pv6_u_point_id'] > 0:
            pv6_u_point_id = new_values['data']['pv6_u_point_id']

        if 'pv6_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv6_i_point_id'], int) and \
                new_values['data']['pv6_i_point_id'] > 0:
            pv6_i_point_id = new_values['data']['pv6_i_point_id']

        if 'pv7_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv7_u_point_id'], int) and \
                new_values['data']['pv7_u_point_id'] > 0:
            pv7_u_point_id = new_values['data']['pv7_u_point_id']

        if 'pv7_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv7_i_point_id'], int) and \
                new_values['data']['pv7_i_point_id'] > 0:
            pv7_i_point_id = new_values['data']['pv7_i_point_id']

        if 'pv8_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv8_u_point_id'], int) and \
                new_values['data']['pv8_u_point_id'] > 0:
            pv8_u_point_id = new_values['data']['pv8_u_point_id']

        if 'pv8_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv8_i_point_id'], int) and \
                new_values['data']['pv8_i_point_id'] > 0:
            pv8_i_point_id = new_values['data']['pv8_i_point_id']

        if 'pv9_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv9_u_point_id'], int) and \
                new_values['data']['pv9_u_point_id'] > 0:
            pv9_u_point_id = new_values['data']['pv9_u_point_id']

        if 'pv9_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv9_i_point_id'], int) and \
                new_values['data']['pv9_i_point_id'] > 0:
            pv9_i_point_id = new_values['data']['pv9_i_point_id']

        if 'pv10_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv10_u_point_id'], int) and \
                new_values['data']['pv10_u_point_id'] > 0:
            pv10_u_point_id = new_values['data']['pv10_u_point_id']

        if 'pv10_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv10_i_point_id'], int) and \
                new_values['data']['pv10_i_point_id'] > 0:
            pv10_i_point_id = new_values['data']['pv10_i_point_id']

        if 'pv11_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv11_u_point_id'], int) and \
                new_values['data']['pv11_u_point_id'] > 0:
            pv11_u_point_id = new_values['data']['pv11_u_point_id']

        if 'pv11_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv11_i_point_id'], int) and \
                new_values['data']['pv11_i_point_id'] > 0:
            pv11_i_point_id = new_values['data']['pv11_i_point_id']

        if 'pv12_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv12_u_point_id'], int) and \
                new_values['data']['pv12_u_point_id'] > 0:
            pv12_u_point_id = new_values['data']['pv12_u_point_id']

        if 'pv12_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv12_i_point_id'], int) and \
                new_values['data']['pv12_i_point_id'] > 0:
            pv12_i_point_id = new_values['data']['pv12_i_point_id']

        if 'pv13_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv13_u_point_id'], int) and \
                new_values['data']['pv13_u_point_id'] > 0:
            pv13_u_point_id = new_values['data']['pv13_u_point_id']

        if 'pv13_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv13_i_point_id'], int) and \
                new_values['data']['pv13_i_point_id'] > 0:
            pv13_i_point_id = new_values['data']['pv13_i_point_id']

        if 'pv14_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv14_u_point_id'], int) and \
                new_values['data']['pv14_u_point_id'] > 0:
            pv14_u_point_id = new_values['data']['pv14_u_point_id']

        if 'pv14_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv14_i_point_id'], int) and \
                new_values['data']['pv14_i_point_id'] > 0:
            pv14_i_point_id = new_values['data']['pv14_i_point_id']

        if 'pv15_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv15_u_point_id'], int) and \
                new_values['data']['pv15_u_point_id'] > 0:
            pv15_u_point_id = new_values['data']['pv15_u_point_id']

        if 'pv15_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv15_i_point_id'], int) and \
                new_values['data']['pv15_i_point_id'] > 0:
            pv15_i_point_id = new_values['data']['pv15_i_point_id']

        if 'pv16_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv16_u_point_id'], int) and \
                new_values['data']['pv16_u_point_id'] > 0:
            pv16_u_point_id = new_values['data']['pv16_u_point_id']

        if 'pv16_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv16_i_point_id'], int) and \
                new_values['data']['pv16_i_point_id'] > 0:
            pv16_i_point_id = new_values['data']['pv16_i_point_id']

        if 'pv17_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv17_u_point_id'], int) and \
                new_values['data']['pv17_u_point_id'] > 0:
            pv17_u_point_id = new_values['data']['pv17_u_point_id']

        if 'pv17_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv17_i_point_id'], int) and \
                new_values['data']['pv17_i_point_id'] > 0:
            pv17_i_point_id = new_values['data']['pv17_i_point_id']

        if 'pv18_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv18_u_point_id'], int) and \
                new_values['data']['pv18_u_point_id'] > 0:
            pv18_u_point_id = new_values['data']['pv18_u_point_id']

        if 'pv18_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv18_i_point_id'], int) and \
                new_values['data']['pv18_i_point_id'] > 0:
            pv18_i_point_id = new_values['data']['pv18_i_point_id']

        if 'pv19_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv19_u_point_id'], int) and \
                new_values['data']['pv19_u_point_id'] > 0:
            pv19_u_point_id = new_values['data']['pv19_u_point_id']

        if 'pv19_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv19_i_point_id'], int) and \
                new_values['data']['pv19_i_point_id'] > 0:
            pv19_i_point_id = new_values['data']['pv19_i_point_id']

        if 'pv20_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv20_u_point_id'], int) and \
                new_values['data']['pv20_u_point_id'] > 0:
            pv20_u_point_id = new_values['data']['pv20_u_point_id']

        if 'pv20_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv20_i_point_id'], int) and \
                new_values['data']['pv20_i_point_id'] > 0:
            pv20_i_point_id = new_values['data']['pv20_i_point_id']

        if 'pv21_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv21_u_point_id'], int) and \
                new_values['data']['pv21_u_point_id'] > 0:
            pv21_u_point_id = new_values['data']['pv21_u_point_id']

        if 'pv21_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv21_i_point_id'], int) and \
                new_values['data']['pv21_i_point_id'] > 0:
            pv21_i_point_id = new_values['data']['pv21_i_point_id']

        if 'pv22_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv22_u_point_id'], int) and \
                new_values['data']['pv22_u_point_id'] > 0:
            pv22_u_point_id = new_values['data']['pv22_u_point_id']

        if 'pv22_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv22_i_point_id'], int) and \
                new_values['data']['pv22_i_point_id'] > 0:
            pv22_i_point_id = new_values['data']['pv22_i_point_id']

        if 'pv23_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv23_u_point_id'], int) and \
                new_values['data']['pv23_u_point_id'] > 0:
            pv23_u_point_id = new_values['data']['pv23_u_point_id']

        if 'pv23_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv23_i_point_id'], int) and \
                new_values['data']['pv23_i_point_id'] > 0:
            pv23_i_point_id = new_values['data']['pv23_i_point_id']

        if 'pv24_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv24_u_point_id'], int) and \
                new_values['data']['pv24_u_point_id'] > 0:
            pv24_u_point_id = new_values['data']['pv24_u_point_id']

        if 'pv24_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv24_i_point_id'], int) and \
                new_values['data']['pv24_i_point_id'] > 0:
            pv24_i_point_id = new_values['data']['pv24_i_point_id']

        if 'pv25_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv25_u_point_id'], int) and \
                new_values['data']['pv25_u_point_id'] > 0:
            pv25_u_point_id = new_values['data']['pv25_u_point_id']

        if 'pv25_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv25_i_point_id'], int) and \
                new_values['data']['pv25_i_point_id'] > 0:
            pv25_i_point_id = new_values['data']['pv25_i_point_id']

        if 'pv26_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv26_u_point_id'], int) and \
                new_values['data']['pv26_u_point_id'] > 0:
            pv26_u_point_id = new_values['data']['pv26_u_point_id']

        if 'pv26_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv26_i_point_id'], int) and \
                new_values['data']['pv26_i_point_id'] > 0:
            pv26_i_point_id = new_values['data']['pv26_i_point_id']

        if 'pv27_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv27_u_point_id'], int) and \
                new_values['data']['pv27_u_point_id'] > 0:
            pv27_u_point_id = new_values['data']['pv27_u_point_id']

        if 'pv27_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv27_i_point_id'], int) and \
                new_values['data']['pv27_i_point_id'] > 0:
            pv27_i_point_id = new_values['data']['pv27_i_point_id']

        if 'pv28_u_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv28_u_point_id'], int) and \
                new_values['data']['pv28_u_point_id'] > 0:
            pv28_u_point_id = new_values['data']['pv28_u_point_id']

        if 'pv28_i_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pv28_i_point_id'], int) and \
                new_values['data']['pv28_i_point_id'] > 0:
            pv28_i_point_id = new_values['data']['pv28_i_point_id']

        if 'mppt_total_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_total_energy_point_id'], int) and \
                new_values['data']['mppt_total_energy_point_id'] > 0:
            mppt_total_energy_point_id = new_values['data']['mppt_total_energy_point_id']

        if 'mppt_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_power_point_id'], int) and \
                new_values['data']['mppt_power_point_id'] > 0:
            mppt_power_point_id = new_values['data']['mppt_power_point_id']

        if 'mppt_1_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_1_energy_point_id'], int) and \
                new_values['data']['mppt_1_energy_point_id'] > 0:
            mppt_1_energy_point_id = new_values['data']['mppt_1_energy_point_id']

        if 'mppt_2_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_2_energy_point_id'], int) and \
                new_values['data']['mppt_2_energy_point_id'] > 0:
            mppt_2_energy_point_id = new_values['data']['mppt_2_energy_point_id']

        if 'mppt_3_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_3_energy_point_id'], int) and \
                new_values['data']['mppt_3_energy_point_id'] > 0:
            mppt_3_energy_point_id = new_values['data']['mppt_3_energy_point_id']

        if 'mppt_4_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_4_energy_point_id'], int) and \
                new_values['data']['mppt_4_energy_point_id'] > 0:
            mppt_4_energy_point_id = new_values['data']['mppt_4_energy_point_id']

        if 'mppt_5_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_5_energy_point_id'], int) and \
                new_values['data']['mppt_5_energy_point_id'] > 0:
            mppt_5_energy_point_id = new_values['data']['mppt_5_energy_point_id']

        if 'mppt_6_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_6_energy_point_id'], int) and \
                new_values['data']['mppt_6_energy_point_id'] > 0:
            mppt_6_energy_point_id = new_values['data']['mppt_6_energy_point_id']

        if 'mppt_7_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_7_energy_point_id'], int) and \
                new_values['data']['mppt_7_energy_point_id'] > 0:
            mppt_7_energy_point_id = new_values['data']['mppt_7_energy_point_id']

        if 'mppt_8_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_8_energy_point_id'], int) and \
                new_values['data']['mppt_8_energy_point_id'] > 0:
            mppt_8_energy_point_id = new_values['data']['mppt_8_energy_point_id']

        if 'mppt_9_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_9_energy_point_id'], int) and \
                new_values['data']['mppt_9_energy_point_id'] > 0:
            mppt_9_energy_point_id = new_values['data']['mppt_9_energy_point_id']

        if 'mppt_10_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['mppt_10_energy_point_id'], int) and \
                new_values['data']['mppt_10_energy_point_id'] > 0:
            mppt_10_energy_point_id = new_values['data']['mppt_10_energy_point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_invertors "
                       " WHERE id = %s ",
                       (iid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_INVERTOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_invertors "
                       " WHERE photovoltaic_power_station_id = %s AND id != %s AND name = %s ",
                       (id_, iid, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_INVERTOR_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (invertor_state_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.INVERTOR_STATE_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (communication_state_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMUNICATION_STATE_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (total_energy_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TOTAL_ENERGY_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (generation_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GENERATION_METER_NOT_FOUND')

        update_row = (" UPDATE tbl_photovoltaic_power_stations_invertors "
                      " SET name = %s, "
                      "     model = %s, "
                      "     serial_number = %s, "
                      "     invertor_state_point_id = %s, "
                      "     communication_state_point_id = %s, "
                      "     total_energy_point_id = %s, "
                      "     generation_meter_id = %s, "
                      "     today_energy_point_id = %s, "
                      "     efficiency_point_id = %s, "
                      "     temperature_point_id = %s, "
                      "     power_factor_point_id = %s, "
                      "     active_power_point_id = %s, "
                      "     reactive_power_point_id = %s, "
                      "     frequency_point_id = %s, "
                      "     uab_point_id = %s, "
                      "     ubc_point_id = %s, "
                      "     uca_point_id = %s, "
                      "     ua_point_id = %s, "
                      "     ub_point_id = %s, "
                      "     uc_point_id = %s, "
                      "     ia_point_id = %s, "
                      "     ib_point_id = %s, "
                      "     ic_point_id = %s, "
                      "     pv1_u_point_id = %s, "
                      "     pv1_i_point_id = %s, "
                      "     pv2_u_point_id = %s, "
                      "     pv2_i_point_id = %s, "
                      "     pv3_u_point_id = %s, "
                      "     pv3_i_point_id = %s, "
                      "     pv4_u_point_id = %s, "
                      "     pv4_i_point_id = %s, "
                      "     pv5_u_point_id = %s, "
                      "     pv5_i_point_id = %s, "
                      "     pv6_u_point_id = %s, "
                      "     pv6_i_point_id = %s, "
                      "     pv7_u_point_id = %s, "
                      "     pv7_i_point_id = %s, "
                      "     pv8_u_point_id = %s, "
                      "     pv8_i_point_id = %s, "
                      "     pv9_u_point_id = %s, "
                      "     pv9_i_point_id = %s, "
                      "     pv10_u_point_id = %s, "
                      "     pv10_i_point_id = %s, "
                      "     pv11_u_point_id = %s, "
                      "     pv11_i_point_id = %s, "
                      "     pv12_u_point_id = %s, "
                      "     pv12_i_point_id = %s, "
                      "     pv13_u_point_id = %s, "
                      "     pv13_i_point_id = %s, "
                      "     pv14_u_point_id = %s, "
                      "     pv14_i_point_id = %s, "
                      "     pv15_u_point_id = %s, "
                      "     pv15_i_point_id = %s, "
                      "     pv16_u_point_id = %s, "
                      "     pv16_i_point_id = %s, "
                      "     pv17_u_point_id = %s, "
                      "     pv17_i_point_id = %s, "
                      "     pv18_u_point_id = %s, "
                      "     pv18_i_point_id = %s, "
                      "     pv19_u_point_id = %s, "
                      "     pv19_i_point_id = %s, "
                      "     pv20_u_point_id = %s, "
                      "     pv20_i_point_id = %s, "
                      "     pv21_u_point_id = %s, "
                      "     pv21_i_point_id = %s, "
                      "     pv22_u_point_id = %s, "
                      "     pv22_i_point_id = %s, "
                      "     pv23_u_point_id = %s, "
                      "     pv23_i_point_id = %s, "
                      "     pv24_u_point_id = %s, "
                      "     pv24_i_point_id = %s, "
                      "     pv25_u_point_id = %s, "
                      "     pv25_i_point_id = %s, "
                      "     pv26_u_point_id = %s, "
                      "     pv26_i_point_id = %s, "
                      "     pv27_u_point_id = %s, "
                      "     pv27_i_point_id = %s, "
                      "     pv28_u_point_id = %s, "
                      "     pv28_i_point_id = %s, "
                      "     mppt_total_energy_point_id = %s, "
                      "     mppt_power_point_id = %s, "
                      "     mppt_1_energy_point_id = %s, "
                      "     mppt_2_energy_point_id = %s, "
                      "     mppt_3_energy_point_id = %s, "
                      "     mppt_4_energy_point_id = %s, "
                      "     mppt_5_energy_point_id = %s, "
                      "     mppt_6_energy_point_id = %s, "
                      "     mppt_7_energy_point_id = %s, "
                      "     mppt_8_energy_point_id = %s, "
                      "     mppt_9_energy_point_id = %s, "
                      "     mppt_10_energy_point_id = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    model,
                                    serial_number,
                                    invertor_state_point_id,
                                    communication_state_point_id,
                                    total_energy_point_id,
                                    generation_meter_id,
                                    today_energy_point_id,
                                    efficiency_point_id,
                                    temperature_point_id,
                                    power_factor_point_id,
                                    active_power_point_id,
                                    reactive_power_point_id,
                                    frequency_point_id,
                                    uab_point_id,
                                    ubc_point_id,
                                    uca_point_id,
                                    ua_point_id,
                                    ub_point_id,
                                    uc_point_id,
                                    ia_point_id,
                                    ib_point_id,
                                    ic_point_id,
                                    pv1_u_point_id,
                                    pv1_i_point_id,
                                    pv2_u_point_id,
                                    pv2_i_point_id,
                                    pv3_u_point_id,
                                    pv3_i_point_id,
                                    pv4_u_point_id,
                                    pv4_i_point_id,
                                    pv5_u_point_id,
                                    pv5_i_point_id,
                                    pv6_u_point_id,
                                    pv6_i_point_id,
                                    pv7_u_point_id,
                                    pv7_i_point_id,
                                    pv8_u_point_id,
                                    pv8_i_point_id,
                                    pv9_u_point_id,
                                    pv9_i_point_id,
                                    pv10_u_point_id,
                                    pv10_i_point_id,
                                    pv11_u_point_id,
                                    pv11_i_point_id,
                                    pv12_u_point_id,
                                    pv12_i_point_id,
                                    pv13_u_point_id,
                                    pv13_i_point_id,
                                    pv14_u_point_id,
                                    pv14_i_point_id,
                                    pv15_u_point_id,
                                    pv15_i_point_id,
                                    pv16_u_point_id,
                                    pv16_i_point_id,
                                    pv17_u_point_id,
                                    pv17_i_point_id,
                                    pv18_u_point_id,
                                    pv18_i_point_id,
                                    pv19_u_point_id,
                                    pv19_i_point_id,
                                    pv20_u_point_id,
                                    pv20_i_point_id,
                                    pv21_u_point_id,
                                    pv21_i_point_id,
                                    pv22_u_point_id,
                                    pv22_i_point_id,
                                    pv23_u_point_id,
                                    pv23_i_point_id,
                                    pv24_u_point_id,
                                    pv24_i_point_id,
                                    pv25_u_point_id,
                                    pv25_i_point_id,
                                    pv26_u_point_id,
                                    pv26_i_point_id,
                                    pv27_u_point_id,
                                    pv27_i_point_id,
                                    pv28_u_point_id,
                                    pv28_i_point_id,
                                    mppt_total_energy_point_id,
                                    mppt_power_point_id,
                                    mppt_1_energy_point_id,
                                    mppt_2_energy_point_id,
                                    mppt_3_energy_point_id,
                                    mppt_4_energy_point_id,
                                    mppt_5_energy_point_id,
                                    mppt_6_energy_point_id,
                                    mppt_7_energy_point_id,
                                    mppt_8_energy_point_id,
                                    mppt_9_energy_point_id,
                                    mppt_10_energy_point_id,
                                    iid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class PhotovoltaicPowerStationLoadCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

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
                 "        power_point_id, meter_id, rated_input_power, "
                 "        total_active_power_point_id, "
                 "        active_power_a_point_id, "
                 "        active_power_b_point_id, "
                 "        active_power_c_point_id, "
                 "        total_reactive_power_point_id, "
                 "        reactive_power_a_point_id, "
                 "        reactive_power_b_point_id, "
                 "        reactive_power_c_point_id, "
                 "        total_apparent_power_point_id, "
                 "        apparent_power_a_point_id, "
                 "        apparent_power_b_point_id, "
                 "        apparent_power_c_point_id, "
                 "        total_power_factor_point_id, "
                 "        active_energy_import_point_id, "
                 "        active_energy_export_point_id, "
                 "        active_energy_net_point_id "
                 " FROM tbl_photovoltaic_power_stations_loads "
                 " WHERE photovoltaic_power_station_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "power_point": point_dict.get(row[3]),
                               "meter": meter_dict.get(row[4]),
                               "rated_input_power": row[5],
                               "total_active_power_point": point_dict.get(row[6]),
                               "active_power_a_point": point_dict.get(row[7]),
                               "active_power_b_point": point_dict.get(row[8]),
                               "active_power_c_point": point_dict.get(row[9]),
                               "total_reactive_power_point": point_dict.get(row[10]),
                               "reactive_power_a_point": point_dict.get(row[11]),
                               "reactive_power_b_point": point_dict.get(row[12]),
                               "reactive_power_c_point": point_dict.get(row[13]),
                               "total_apparent_power_point": point_dict.get(row[14]),
                               "apparent_power_a_point": point_dict.get(row[15]),
                               "apparent_power_b_point": point_dict.get(row[16]),
                               "apparent_power_c_point": point_dict.get(row[17]),
                               "total_power_factor_point": point_dict.get(row[18]),
                               "active_energy_import_point": point_dict.get(row[19]),
                               "active_energy_export_point": point_dict.get(row[20]),
                               "active_energy_net_point": point_dict.get(row[21])}
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
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_LOAD_NAME')
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

        total_active_power_point_id = None
        active_power_a_point_id = None
        active_power_b_point_id = None
        active_power_c_point_id = None
        total_reactive_power_point_id = None
        reactive_power_a_point_id = None
        reactive_power_b_point_id = None
        reactive_power_c_point_id = None
        total_apparent_power_point_id = None
        apparent_power_a_point_id = None
        apparent_power_b_point_id = None
        apparent_power_c_point_id = None
        total_power_factor_point_id = None
        active_energy_import_point_id = None
        active_energy_export_point_id = None
        active_energy_net_point_id = None

        if 'total_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_active_power_point_id'], int) and \
                new_values['data']['total_active_power_point_id'] > 0:
            total_active_power_point_id = new_values['data']['total_active_power_point_id']

        if 'active_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_a_point_id'], int) and \
                new_values['data']['active_power_a_point_id'] > 0:
            active_power_a_point_id = new_values['data']['active_power_a_point_id']

        if 'active_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_b_point_id'], int) and \
                new_values['data']['active_power_b_point_id'] > 0:
            active_power_b_point_id = new_values['data']['active_power_b_point_id']

        if 'active_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_c_point_id'], int) and \
                new_values['data']['active_power_c_point_id'] > 0:
            active_power_c_point_id = new_values['data']['active_power_c_point_id']

        if 'total_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_reactive_power_point_id'], int) and \
                new_values['data']['total_reactive_power_point_id'] > 0:
            total_reactive_power_point_id = new_values['data']['total_reactive_power_point_id']

        if 'reactive_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_a_point_id'], int) and \
                new_values['data']['reactive_power_a_point_id'] > 0:
            reactive_power_a_point_id = new_values['data']['reactive_power_a_point_id']

        if 'reactive_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_b_point_id'], int) and \
                new_values['data']['reactive_power_b_point_id'] > 0:
            reactive_power_b_point_id = new_values['data']['reactive_power_b_point_id']

        if 'reactive_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_c_point_id'], int) and \
                new_values['data']['reactive_power_c_point_id'] > 0:
            reactive_power_c_point_id = new_values['data']['reactive_power_c_point_id']

        if 'total_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_apparent_power_point_id'], int) and \
                new_values['data']['total_apparent_power_point_id'] > 0:
            total_apparent_power_point_id = new_values['data']['total_apparent_power_point_id']

        if 'apparent_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_a_point_id'], int) and \
                new_values['data']['apparent_power_a_point_id'] > 0:
            apparent_power_a_point_id = new_values['data']['apparent_power_a_point_id']

        if 'apparent_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_b_point_id'], int) and \
                new_values['data']['apparent_power_b_point_id'] > 0:
            apparent_power_b_point_id = new_values['data']['apparent_power_b_point_id']

        if 'apparent_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_c_point_id'], int) and \
                new_values['data']['apparent_power_c_point_id'] > 0:
            apparent_power_c_point_id = new_values['data']['apparent_power_c_point_id']

        if 'total_power_factor_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_power_factor_point_id'], int) and \
                new_values['data']['total_power_factor_point_id'] > 0:
            total_power_factor_point_id = new_values['data']['total_power_factor_point_id']

        if 'active_energy_import_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_import_point_id'], int) and \
                new_values['data']['active_energy_import_point_id'] > 0:
            active_energy_import_point_id = new_values['data']['active_energy_import_point_id']

        if 'active_energy_export_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_export_point_id'], int) and \
                new_values['data']['active_energy_export_point_id'] > 0:
            active_energy_export_point_id = new_values['data']['active_energy_export_point_id']

        if 'active_energy_net_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_net_point_id'], int) and \
                new_values['data']['active_energy_net_point_id'] > 0:
            active_energy_net_point_id = new_values['data']['active_energy_net_point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_loads "
                       " WHERE photovoltaic_power_station_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_LOAD_NAME_IS_ALREADY_IN_USE')

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

        add_values = (" INSERT INTO tbl_photovoltaic_power_stations_loads "
                      "    (name, uuid, photovoltaic_power_station_id, power_point_id, meter_id, rated_input_power,"
                      "     total_active_power_point_id,"
                      "     active_power_a_point_id,"
                      "     active_power_b_point_id,"
                      "     active_power_c_point_id,"
                      "     total_reactive_power_point_id,"
                      "     reactive_power_a_point_id,"
                      "     reactive_power_b_point_id,"
                      "     reactive_power_c_point_id,"
                      "     total_apparent_power_point_id,"
                      "     apparent_power_a_point_id,"
                      "     apparent_power_b_point_id,"
                      "     apparent_power_c_point_id,"
                      "     total_power_factor_point_id,"
                      "     active_energy_import_point_id,"
                      "     active_energy_export_point_id,"
                      "     active_energy_net_point_id) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s,"
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,"
                      "         %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_input_power,
                                    total_active_power_point_id,
                                    active_power_a_point_id,
                                    active_power_b_point_id,
                                    active_power_c_point_id,
                                    total_reactive_power_point_id,
                                    reactive_power_a_point_id,
                                    reactive_power_b_point_id,
                                    reactive_power_c_point_id,
                                    total_apparent_power_point_id,
                                    apparent_power_a_point_id,
                                    apparent_power_b_point_id,
                                    apparent_power_c_point_id,
                                    total_power_factor_point_id,
                                    active_energy_import_point_id,
                                    active_energy_export_point_id,
                                    active_energy_net_point_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/photovoltaicpowerstations/' + str(id_) + '/loads/' + str(new_id)


class PhotovoltaicPowerStationLoadItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, lid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, lid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_LOAD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_photovoltaic_power_stations ")
        cursor.execute(query)
        rows_photovoltaic_power_stations = cursor.fetchall()

        photovoltaic_power_station_dict = dict()
        if rows_photovoltaic_power_stations is not None and len(rows_photovoltaic_power_stations) > 0:
            for row in rows_photovoltaic_power_stations:
                photovoltaic_power_station_dict[row[0]] = {"id": row[0],
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
                 "        photovoltaic_power_station_id, "
                 "        power_point_id, meter_id, "
                 "        rated_input_power, "
                 "        total_active_power_point_id, "
                 "        active_power_a_point_id, "
                 "        active_power_b_point_id, "
                 "        active_power_c_point_id, "
                 "        total_reactive_power_point_id, "
                 "        reactive_power_a_point_id, "
                 "        reactive_power_b_point_id, "
                 "        reactive_power_c_point_id, "
                 "        total_apparent_power_point_id, "
                 "        apparent_power_a_point_id, "
                 "        apparent_power_b_point_id, "
                 "        apparent_power_c_point_id, "
                 "        total_power_factor_point_id, "
                 "        active_energy_import_point_id, "
                 "        active_energy_export_point_id, "
                 "        active_energy_net_point_id "
                 " FROM tbl_photovoltaic_power_stations_loads "
                 " WHERE id = %s ")
        cursor.execute(query, (lid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_LOAD_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "photovoltaic_power_station": photovoltaic_power_station_dict.get(row[3]),
                           "power_point": point_dict.get(row[4]),
                           "meter": meter_dict.get(row[5]),
                           "rated_input_power": row[6],
                           "total_active_power_point": point_dict.get(row[7]),
                           "active_power_a_point": point_dict.get(row[8]),
                           "active_power_b_point": point_dict.get(row[9]),
                           "active_power_c_point": point_dict.get(row[10]),
                           "total_reactive_power_point": point_dict.get(row[11]),
                           "reactive_power_a_point": point_dict.get(row[12]),
                           "reactive_power_b_point": point_dict.get(row[13]),
                           "reactive_power_c_point": point_dict.get(row[14]),
                           "total_apparent_power_point": point_dict.get(row[15]),
                           "apparent_power_a_point": point_dict.get(row[16]),
                           "apparent_power_b_point": point_dict.get(row[17]),
                           "apparent_power_c_point": point_dict.get(row[18]),
                           "total_power_factor_point": point_dict.get(row[19]),
                           "active_energy_import_point": point_dict.get(row[20]),
                           "active_energy_export_point": point_dict.get(row[21]),
                           "active_energy_net_point": point_dict.get(row[22])}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, lid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_LOAD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_loads "
                       " WHERE id = %s ", (lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_LOAD_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_photovoltaic_power_stations_loads "
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
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_LOAD_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_LOAD_NAME')
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

        total_active_power_point_id = None
        active_power_a_point_id = None
        active_power_b_point_id = None
        active_power_c_point_id = None
        total_reactive_power_point_id = None
        reactive_power_a_point_id = None
        reactive_power_b_point_id = None
        reactive_power_c_point_id = None
        total_apparent_power_point_id = None
        apparent_power_a_point_id = None
        apparent_power_b_point_id = None
        apparent_power_c_point_id = None
        total_power_factor_point_id = None
        active_energy_import_point_id = None
        active_energy_export_point_id = None
        active_energy_net_point_id = None

        if 'total_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_active_power_point_id'], int) and \
                new_values['data']['total_active_power_point_id'] > 0:
            total_active_power_point_id = new_values['data']['total_active_power_point_id']

        if 'active_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_a_point_id'], int) and \
                new_values['data']['active_power_a_point_id'] > 0:
            active_power_a_point_id = new_values['data']['active_power_a_point_id']

        if 'active_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_b_point_id'], int) and \
                new_values['data']['active_power_b_point_id'] > 0:
            active_power_b_point_id = new_values['data']['active_power_b_point_id']

        if 'active_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_power_c_point_id'], int) and \
                new_values['data']['active_power_c_point_id'] > 0:
            active_power_c_point_id = new_values['data']['active_power_c_point_id']

        if 'total_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_reactive_power_point_id'], int) and \
                new_values['data']['total_reactive_power_point_id'] > 0:
            total_reactive_power_point_id = new_values['data']['total_reactive_power_point_id']

        if 'reactive_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_a_point_id'], int) and \
                new_values['data']['reactive_power_a_point_id'] > 0:
            reactive_power_a_point_id = new_values['data']['reactive_power_a_point_id']

        if 'reactive_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_b_point_id'], int) and \
                new_values['data']['reactive_power_b_point_id'] > 0:
            reactive_power_b_point_id = new_values['data']['reactive_power_b_point_id']

        if 'reactive_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['reactive_power_c_point_id'], int) and \
                new_values['data']['reactive_power_c_point_id'] > 0:
            reactive_power_c_point_id = new_values['data']['reactive_power_c_point_id']

        if 'total_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_apparent_power_point_id'], int) and \
                new_values['data']['total_apparent_power_point_id'] > 0:
            total_apparent_power_point_id = new_values['data']['total_apparent_power_point_id']

        if 'apparent_power_a_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_a_point_id'], int) and \
                new_values['data']['apparent_power_a_point_id'] > 0:
            apparent_power_a_point_id = new_values['data']['apparent_power_a_point_id']

        if 'apparent_power_b_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_b_point_id'], int) and \
                new_values['data']['apparent_power_b_point_id'] > 0:
            apparent_power_b_point_id = new_values['data']['apparent_power_b_point_id']

        if 'apparent_power_c_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['apparent_power_c_point_id'], int) and \
                new_values['data']['apparent_power_c_point_id'] > 0:
            apparent_power_c_point_id = new_values['data']['apparent_power_c_point_id']

        if 'total_power_factor_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_power_factor_point_id'], int) and \
                new_values['data']['total_power_factor_point_id'] > 0:
            total_power_factor_point_id = new_values['data']['total_power_factor_point_id']

        if 'active_energy_import_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_import_point_id'], int) and \
                new_values['data']['active_energy_import_point_id'] > 0:
            active_energy_import_point_id = new_values['data']['active_energy_import_point_id']

        if 'active_energy_export_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_export_point_id'], int) and \
                new_values['data']['active_energy_export_point_id'] > 0:
            active_energy_export_point_id = new_values['data']['active_energy_export_point_id']

        if 'active_energy_net_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['active_energy_net_point_id'], int) and \
                new_values['data']['active_energy_net_point_id'] > 0:
            active_energy_net_point_id = new_values['data']['active_energy_net_point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_loads "
                       " WHERE id = %s ", (lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_LOAD_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations_loads "
                       " WHERE photovoltaic_power_station_id = %s AND name = %s AND id != %s ",
                       (id_, name, lid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_LOAD_NAME_IS_ALREADY_IN_USE')

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

        update_row = (" UPDATE tbl_photovoltaic_power_stations_loads "
                      " SET name = %s, photovoltaic_power_station_id = %s, power_point_id = %s, "
                      "     meter_id = %s, rated_input_power = %s, "
                      "     total_active_power_point_id = %s, "
                      "     active_power_a_point_id = %s, "
                      "     active_power_b_point_id = %s, "
                      "     active_power_c_point_id = %s, "
                      "     total_reactive_power_point_id = %s, "
                      "     reactive_power_a_point_id = %s, "
                      "     reactive_power_b_point_id = %s, "
                      "     reactive_power_c_point_id = %s, "
                      "     total_apparent_power_point_id = %s, "
                      "     apparent_power_a_point_id = %s, "
                      "     apparent_power_b_point_id = %s, "
                      "     apparent_power_c_point_id = %s, "
                      "     total_power_factor_point_id = %s, "
                      "     active_energy_import_point_id = %s, "
                      "     active_energy_export_point_id = %s, "
                      "     active_energy_net_point_id = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_input_power,
                                    total_active_power_point_id,
                                    active_power_a_point_id,
                                    active_power_b_point_id,
                                    active_power_c_point_id,
                                    total_reactive_power_point_id,
                                    reactive_power_a_point_id,
                                    reactive_power_b_point_id,
                                    reactive_power_c_point_id,
                                    total_apparent_power_point_id,
                                    apparent_power_a_point_id,
                                    apparent_power_b_point_id,
                                    apparent_power_c_point_id,
                                    total_power_factor_point_id,
                                    active_energy_import_point_id,
                                    active_energy_export_point_id,
                                    active_energy_net_point_id,
                                    lid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class PhotovoltaicPowerStationUserCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        query = (" SELECT u.id, u.name, u.uuid "
                 " FROM tbl_photovoltaic_power_stations m, tbl_photovoltaic_power_stations_users mu, "
                 + config.myems_user_db['database'] + ".tbl_users u "
                 " WHERE mu.photovoltaic_power_station_id = m.id AND u.id = mu.user_id AND m.id = %s "
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
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

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
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

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
                 " FROM tbl_photovoltaic_power_stations_users "
                 " WHERE photovoltaic_power_station_id = %s AND user_id = %s")
        cursor.execute(query, (id_, user_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_USER_RELATION_EXISTS')
        add_row = (" INSERT INTO tbl_photovoltaic_power_stations_users (photovoltaic_power_station_id, user_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, user_id,))
        cnx.commit()
        cursor.close()
        cnx.close()
        cursor_user.close()
        cnx_user.close()

        resp.status = falcon.HTTP_201
        resp.location = '/photovoltaicpowerstations/' + str(id_) + '/users/' + str(user_id)


class PhotovoltaicPowerStationUserItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, uid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, uid):
        # todo Verify if the user is bound when deleting it
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')

        if not uid.isdigit() or int(uid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT name "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        cnx_user = mysql.connector.connect(**config.myems_user_db)
        cursor_user = cnx_user.cursor()
        cursor_user.execute(" SELECT name FROM tbl_users WHERE id = %s ", (uid,))
        if cursor_user.fetchone() is None:
            cursor_user.close()
            cnx_user.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_photovoltaic_power_stations_users "
                       " WHERE photovoltaic_power_station_id = %s AND user_id = %s ", (id_, uid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_USER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_photovoltaic_power_stations_users "
                       " WHERE photovoltaic_power_station_id = %s AND user_id = %s ", (id_, uid))
        cnx.commit()

        cursor.close()
        cnx.close()
        cursor_user.close()
        cnx_user.close()

        resp.status = falcon.HTTP_204
