import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class EnergyStoragePowerStationCollection:
    """
    Energy Storage Power Station Collection Resource

    This class handles CRUD operations for energy storage power station collection.
    It provides endpoints for listing all energy storage power stations and creating new ones.
    Energy storage power stations represent large-scale energy storage facilities
    that can store and discharge significant amounts of energy for grid applications.
    """
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """
        Handle GET requests to retrieve all energy storage power stations

        Returns a list of all energy storage power stations with their complete information including:
        - Station ID, name, and UUID
        - Associated contact and cost center information
        - Station specifications and parameters
        - Related equipment and meter associations
        - SVG diagram information for visualization

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        access_control(req)
        search_query = req.get_param('q', default=None)
        if search_query is not None and len(search_query.strip()) > 0:
            search_query = search_query.strip()
        else:
            search_query = ''

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
                 "        address, latitude, longitude, latitude_point_id, longitude_point_id, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, "
                 "        svg_id, svg2_id, svg3_id, svg4_id, svg5_id, "
                 "        is_cost_data_displayed, phase_of_lifecycle, commissioning_date, description "
                 " FROM tbl_energy_storage_power_stations ")
        params = []
        if search_query:
            query += " WHERE name LIKE %s OR address LIKE %s OR description LIKE %s "
            params = [f'%{search_query}%', f'%{search_query}%', f'%{search_query}%']
        query += " ORDER BY id "

        cursor.execute(query, params)
        rows_energy_storage_power_stations = cursor.fetchall()

        result = list()
        if rows_energy_storage_power_stations is not None and len(rows_energy_storage_power_stations) > 0:
            for row in rows_energy_storage_power_stations:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "address": row[3],
                               "latitude": row[4],
                               "longitude": row[5],
                               "latitude_point": point_dict.get(row[6], None),
                               "longitude_point": point_dict.get(row[7], None),
                               "rated_capacity": row[8],
                               "rated_power": row[9],
                               "contact": contact_dict.get(row[10], None),
                               "cost_center": cost_center_dict.get(row[11], None),
                               "svg": svg_dict.get(row[12], None),
                               "svg2": svg_dict.get(row[13], None),
                               "svg3": svg_dict.get(row[14], None),
                               "svg4": svg_dict.get(row[15], None),
                               "svg5": svg_dict.get(row[16], None),
                               "is_cost_data_displayed": bool(row[17]),
                               "phase_of_lifecycle": row[18],
                               "commissioning_date": row[19].isoformat() if row[19] else None,
                               "description": row[20],
                               "qrcode": 'energystoragepowerstation:' + row[2]}
                result.append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """
        Handle POST requests to create a new energy storage power station

        Creates a new energy storage power station with the provided specifications.
        The station will be empty initially and equipment/meters can be added separately.

        Args:
            req: Falcon request object containing station data
            resp: Falcon response object
        """
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
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_NAME')
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

        if 'commissioning_date' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['commissioning_date'], str) or \
                len(str.strip(new_values['data']['commissioning_date'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMISSIONING_DATE')
        commissioning_date = datetime.strptime(new_values['data']['commissioning_date'], '%Y-%m-%d')

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NAME_IS_ALREADY_IN_USE')

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

        add_values = (" INSERT INTO tbl_energy_storage_power_stations "
                      " (name, uuid, address, latitude, longitude, latitude_point_id, longitude_point_id, "
                      "  rated_capacity, rated_power, contact_id, cost_center_id, "
                      "  svg_id, svg2_id, svg3_id, svg4_id, svg5_id, "
                      "  is_cost_data_displayed, phase_of_lifecycle, commissioning_date, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    address,
                                    latitude,
                                    longitude,
                                    latitude_point_id,
                                    longitude_point_id,
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    svg_id,
                                    svg2_id,
                                    svg3_id,
                                    svg4_id,
                                    svg5_id,
                                    is_cost_data_displayed,
                                    phase_of_lifecycle,
                                    commissioning_date,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragepowerstations/' + str(new_id)


class EnergyStoragePowerStationItem:
    """
    Energy Storage Power Station Item Resource

    This class handles CRUD operations for individual energy storage power stations.
    It provides endpoints for retrieving, updating, and deleting specific
    energy storage power stations by their ID.
    """
    def __init__(self):
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
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

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
                 "        address, latitude, longitude, latitude_point_id, longitude_point_id, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, "
                 "        svg_id, svg2_id, svg3_id, svg4_id, svg5_id, "
                 "        is_cost_data_displayed, phase_of_lifecycle, commissioning_date, description "
                 " FROM tbl_energy_storage_power_stations "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "address": row[3],
                           "latitude": row[4],
                           "longitude": row[5],
                           "latitude_point": point_dict.get(row[6], None),
                           "longitude_point": point_dict.get(row[7], None),
                           "rated_capacity": row[8],
                           "rated_power": row[9],
                           "contact": contact_dict.get(row[10], None),
                           "cost_center": cost_center_dict.get(row[11], None),
                           "svg": svg_dict.get(row[12], None),
                           "svg2": svg_dict.get(row[13], None),
                           "svg3": svg_dict.get(row[14], None),
                           "svg4": svg_dict.get(row[15], None),
                           "svg5": svg_dict.get(row[16], None),
                           "is_cost_data_displayed": bool(row[17]),
                           "phase_of_lifecycle": row[18],
                           "commissioning_date": row[19].isoformat() if row[19] else None,
                           "description": row[20],
                           "qrcode": 'energystoragepowerstation:' + row[2]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')

        # check relation with spaces
        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_energy_storage_power_stations "
                       " WHERE energy_storage_power_station_id = %s ", (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        cursor.execute(" DELETE FROM tbl_energy_storage_power_stations_containers "
                       " WHERE energy_storage_power_station_id = %s ", (id_,))

        cursor.execute(" DELETE FROM tbl_energy_storage_power_stations "
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
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_NAME')
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

        if 'commissioning_date' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['commissioning_date'], str) or \
                len(str.strip(new_values['data']['commissioning_date'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMISSIONING_DATE')
        commissioning_date = datetime.strptime(new_values['data']['commissioning_date'], '%Y-%m-%d')

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NAME_IS_ALREADY_IN_USE')

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

        update_row = (" UPDATE tbl_energy_storage_power_stations "
                      " SET name = %s, address = %s, latitude = %s, longitude = %s, "
                      "     latitude_point_id = %s, longitude_point_id = %s, "
                      "     rated_capacity = %s, rated_power = %s, "
                      "     contact_id = %s, cost_center_id = %s, "
                      "     svg_id = %s, svg2_id = %s, svg3_id = %s, svg4_id = %s, svg5_id = %s, "
                      "     is_cost_data_displayed = %s, phase_of_lifecycle = %s, commissioning_date = %s, "
                      "     description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    address,
                                    latitude,
                                    longitude,
                                    latitude_point_id,
                                    longitude_point_id,
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    svg_id,
                                    svg2_id,
                                    svg3_id,
                                    svg4_id,
                                    svg5_id,
                                    is_cost_data_displayed,
                                    phase_of_lifecycle,
                                    commissioning_date,
                                    description,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStoragePowerStationContainerCollection:
    def __init__(self):
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
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')

        query = (" SELECT s.id, s.name, s.uuid "
                 " FROM tbl_energy_storage_power_stations e, "
                 "      tbl_energy_storage_power_stations_containers es, tbl_energy_storage_containers s "
                 " WHERE es.energy_storage_power_station_id = e.id "
                 "       AND s.id = es.energy_storage_container_id "
                 "       AND e.id = %s "
                 " ORDER BY s.id ")
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
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        new_values = json.loads(raw_json)

        if 'energy_storage_container_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['energy_storage_container_id'], int) or \
                new_values['data']['energy_storage_container_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        energy_storage_container_id = new_values['data']['energy_storage_container_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (energy_storage_container_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_energy_storage_power_stations_containers "
                 " WHERE energy_storage_power_station_id = %s AND energy_storage_container_id = %s")
        cursor.execute(query, (id_, energy_storage_container_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.ENERGY_STORAGE_CONTAINER_SENSOR_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_energy_storage_power_stations_containers "
                   "        (energy_storage_power_station_id, energy_storage_container_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, energy_storage_container_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragepowerstationss/' + str(id_) + '/containers/' + str(energy_storage_container_id)


class EnergyStoragePowerStationContainerItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, sid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, sid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (sid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_power_stations_containers "
                       " WHERE energy_storage_power_station_id = %s AND energy_storage_container_id = %s ", (id_, sid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_CONTAINER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_power_stations_containers "
                       " WHERE energy_storage_power_station_id = %s AND energy_storage_container_id = %s ", (id_, sid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStoragePowerStationDataSourcePointCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_,):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_,):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT p.id, p.name "
                 " FROM tbl_points p, tbl_energy_storage_power_stations_containers espsc, "
                 "      tbl_energy_storage_containers_data_sources ecds, tbl_data_sources ds "
                 " WHERE espsc.energy_storage_power_station_id = %s "
                 "       AND espsc.energy_storage_container_id = ecds.energy_storage_container_id "
                 "       AND ecds.data_source_id = ds.id  "
                 "       AND p.data_source_id = ds.id "
                 " ORDER BY p.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1]}
                result.append(meta_result)

        resp.text = json.dumps(result)


class EnergyStoragePowerStationUserCollection:
    def __init__(self):
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
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')

        query = (" SELECT u.id, u.name, u.uuid "
                 " FROM tbl_energy_storage_power_stations m, tbl_energy_storage_power_stations_users mu, "
                 + config.myems_user_db['database'] + ".tbl_users u "
                 " WHERE mu.energy_storage_power_station_id = m.id AND u.id = mu.user_id AND m.id = %s "
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
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

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
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')

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
                 " FROM tbl_energy_storage_power_stations_users "
                 " WHERE energy_storage_power_station_id = %s AND user_id = %s")
        cursor.execute(query, (id_, user_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.ENERGY_STORAGE_POWER_STATION_USER_RELATION_EXISTS')
        add_row = (" INSERT INTO tbl_energy_storage_power_stations_users (energy_storage_power_station_id, user_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, user_id,))
        cnx.commit()
        cursor.close()
        cnx.close()
        cursor_user.close()
        cnx_user.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragepowerstations/' + str(id_) + '/users/' + str(user_id)


class EnergyStoragePowerStationUserItem:
    def __init__(self):
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
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        if not uid.isdigit() or int(uid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')

        cnx_user = mysql.connector.connect(**config.myems_user_db)
        cursor_user = cnx_user.cursor()
        cursor_user.execute(" SELECT name FROM tbl_users WHERE id = %s ", (uid,))
        if cursor_user.fetchone() is None:
            cursor_user.close()
            cnx_user.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_power_stations_users "
                       " WHERE energy_storage_power_station_id = %s AND user_id = %s ", (id_, uid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_USER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_power_stations_users "
                       " WHERE energy_storage_power_station_id = %s AND user_id = %s ", (id_, uid))
        cnx.commit()

        cursor.close()
        cnx.close()
        cursor_user.close()
        cnx_user.close()

        resp.status = falcon.HTTP_204


class EnergyStoragePowerStationExport:
    def __init__(self):
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
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

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
                 "        address, latitude, longitude, latitude_point_id, longitude_point_id, rated_capacity, "
                 "        rated_power, contact_id, cost_center_id, svg_id, svg2_id, svg3_id, svg4_id, svg5_id, "
                 "        is_cost_data_displayed, phase_of_lifecycle, commissioning_date, description "
                 " FROM tbl_energy_storage_power_stations "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "address": row[3],
                           "latitude": row[4],
                           "longitude": row[5],
                           "latitude_point_id": row[6],
                           "longitude_point_id": row[7],
                           "rated_capacity": row[8],
                           "rated_power": row[9],
                           "contact": contact_dict.get(row[10], None),
                           "cost_center": cost_center_dict.get(row[11], None),
                           "svg": svg_dict.get(row[12], None),
                           "svg2": svg_dict.get(row[13], None),
                           "svg3": svg_dict.get(row[14], None),
                           "svg4": svg_dict.get(row[15], None),
                           "svg5": svg_dict.get(row[16], None),
                           "is_cost_data_displayed": bool(row[17]),
                           "phase_of_lifecycle": row[18],
                           "commissioning_date": row[19].isoformat() if row[19] else None,
                           "description": row[20]}

        resp.text = json.dumps(meta_result)


class EnergyStoragePowerStationImport:
    def __init__(self):
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

        print(new_values)
        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_NAME')
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        name = str.strip(new_values['name']) + \
            (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds')

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

        latitude_point_id = None
        longitude_point_id = None

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

        if 'svg' not in new_values.keys() or \
                'id' not in new_values['svg'].keys() or \
                not isinstance(new_values['svg']['id'], int) or \
                new_values['svg']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_ID')
        svg_id = new_values['svg']['id']

        if 'svg2' in new_values.keys() and \
            new_values['svg2'] is not None and \
                'id' in new_values['svg2'].keys() and \
                new_values['svg2']['id'] is not None:
            if not isinstance(new_values['svg2']['id'], int) or \
                    new_values['svg2']['id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_SVG2_ID')
            svg2_id = new_values['svg2']['id']
        else:
            svg2_id = None

        if 'svg3' in new_values.keys() and \
                new_values['svg3'] is not None and \
                'id' in new_values['svg3'].keys() and \
                new_values['svg3']['id'] is not None:
            if not isinstance(new_values['svg3']['id'], int) or \
                    new_values['svg3']['id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_SVG3_ID')
            svg3_id = new_values['svg3']['id']
        else:
            svg3_id = None

        if 'svg4' in new_values.keys() and \
                new_values['svg4'] is not None and \
                'id' in new_values['svg4'].keys() and \
                new_values['svg4']['id'] is not None:
            if not isinstance(new_values['svg4']['id'], int) or \
                    new_values['svg4']['id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_SVG4_ID')
            svg4_id = new_values['svg4']['id']
        else:
            svg4_id = None

        if 'svg5' in new_values.keys() and \
                new_values['svg5'] is not None and \
                'id' in new_values['svg5'].keys() and \
                new_values['svg5']['id'] is not None:
            if not isinstance(new_values['svg5']['id'], int) or \
                    new_values['svg5']['id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_SVG5_ID')
            svg5_id = new_values['svg5']['id']
        else:
            svg5_id = None

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

        if 'commissioning_date' not in new_values.keys() or \
                not isinstance(new_values['commissioning_date'], str) or \
                len(str.strip(new_values['commissioning_date'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMISSIONING_DATE')
        commissioning_date = datetime.strptime(new_values['commissioning_date'], '%Y-%m-%d')

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NAME_IS_ALREADY_IN_USE')

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

        add_values = (" INSERT INTO tbl_energy_storage_power_stations "
                      "    (name, uuid, address, latitude, longitude, latitude_point_id, longitude_point_id, "
                      "     rated_capacity, rated_power, contact_id, cost_center_id, svg_id, svg2_id, svg3_id, "
                      "     svg4_id, svg5_id, is_cost_data_displayed, phase_of_lifecycle, commissioning_date, "
                      "     description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")

        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    address,
                                    latitude,
                                    longitude,
                                    latitude_point_id,
                                    longitude_point_id,
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    svg_id,
                                    svg2_id,
                                    svg3_id,
                                    svg4_id,
                                    svg5_id,
                                    is_cost_data_displayed,
                                    phase_of_lifecycle,
                                    commissioning_date,
                                    description))

        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragepowerstations/' + str(new_id)


class EnergyStoragePowerStationClone:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        address, latitude, longitude, latitude_point_id, longitude_point_id, rated_capacity, "
                 "        rated_power, contact_id, cost_center_id, svg_id, svg2_id, svg3_id, svg4_id, svg5_id, "
                 "        is_cost_data_displayed, phase_of_lifecycle, commissioning_date, description "
                 " FROM tbl_energy_storage_power_stations "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')
        else:
            meta_result = {"name": row[1],
                           "uuid": row[2],
                           "address": row[3],
                           "latitude": row[4],
                           "longitude": row[5],
                           "latitude_point_id": row[6],
                           "longitude_point_id": row[7],
                           "rated_capacity": row[8],
                           "rated_power": row[9],
                           "contact_id": row[10],
                           "cost_center_id": row[11],
                           "svg_id": row[12],
                           "svg2_id": row[13],
                           "svg3_id": row[14],
                           "svg4_id": row[15],
                           "svg5_id": row[16],
                           "is_cost_data_displayed": row[17],
                           "phase_of_lifecycle": row[18],
                           "commissioning_date": row[19],
                           "description": row[20]}

            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = str.strip(meta_result['name']) + \
                (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds')

            add_values = (" INSERT INTO tbl_energy_storage_power_stations "
                          "    (name, uuid, address, latitude, longitude, latitude_point_id, longitude_point_id, "
                          "     rated_capacity, rated_power, contact_id, cost_center_id, svg_id, svg2_id, svg3_id, "
                          "     svg4_id, svg5_id, is_cost_data_displayed, phase_of_lifecycle, commissioning_date, "
                          "     description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['address'],
                                        meta_result['latitude'],
                                        meta_result['longitude'],
                                        meta_result['latitude_point_id'],
                                        meta_result['longitude_point_id'],
                                        meta_result['rated_capacity'],
                                        meta_result['rated_power'],
                                        meta_result['contact_id'],
                                        meta_result['cost_center_id'],
                                        meta_result['svg_id'],
                                        meta_result['svg2_id'],
                                        meta_result['svg3_id'],
                                        meta_result['svg4_id'],
                                        meta_result['svg5_id'],
                                        meta_result['is_cost_data_displayed'],
                                        meta_result['phase_of_lifecycle'],
                                        meta_result['commissioning_date'],
                                        meta_result['description']))
            new_id = cursor.lastrowid
            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/energystoragepowerstations/' + str(new_id)
