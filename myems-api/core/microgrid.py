import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control
import config


class MicrogridCollection:
    """
    Microgrid Collection Resource

    This class handles CRUD operations for microgrid collection.
    It provides endpoints for listing all microgrids and creating new ones.
    Microgrids represent localized energy systems that can operate independently
    or in conjunction with the main electrical grid, typically including
    distributed generation, energy storage, and load management capabilities.
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
        Handle GET requests to retrieve all microgrids

        Returns a list of all microgrids with their complete information including:
        - Microgrid ID, name, and UUID
        - Associated contact and cost center information
        - Microgrid specifications and parameters
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

        # Connect to database
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Query to retrieve all contacts for reference
        query = (" SELECT id, name, uuid "
                 " FROM tbl_contacts ")
        cursor.execute(query)
        rows_contacts = cursor.fetchall()

        # Build contact dictionary for quick lookup by ID
        contact_dict = dict()
        if rows_contacts is not None and len(rows_contacts) > 0:
            for row in rows_contacts:
                contact_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}

        # Query to retrieve all cost centers for reference
        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        # Build cost center dictionary for quick lookup by ID
        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        # Initialize SVG dictionary for diagram references
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
                 "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                 "        contact_id, cost_center_id, serial_number, svg_id, is_cost_data_displayed, "
                 "        phase_of_lifecycle, description "
                 " FROM tbl_microgrids ")
        params = []
        if search_query:
            query += " WHERE name LIKE %s OR address LIKE %s OR description LIKE %s "
            params = [f'%{search_query}%', f'%{search_query}%', f'%{search_query}%']
        query += " ORDER BY id "
        cursor.execute(query, params)
        rows_microgrids = cursor.fetchall()

        result = list()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "address": row[3],
                               "postal_code": row[4],
                               "latitude": row[5],
                               "longitude": row[6],
                               "rated_capacity": row[7],
                               "rated_power": row[8],
                               "contact": contact_dict.get(row[9], None),
                               "cost_center": cost_center_dict.get(row[10], None),
                               "serial_number": row[11],
                               "svg": svg_dict.get(row[12], None),
                               "is_cost_data_displayed": bool(row[13]),
                               "phase_of_lifecycle": row[14],
                               "description": row[15],
                               "qrcode": 'microgrid:' + row[2]}
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
                                   description='API.INVALID_MICROGRID_NAME')
        name = str.strip(new_values['data']['name'])

        if 'address' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['address'], str) or \
                len(str.strip(new_values['data']['address'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADDRESS_VALUE')
        address = str.strip(new_values['data']['address'])

        if 'postal_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['postal_code'], str) or \
                len(str.strip(new_values['data']['postal_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POSTAL_CODE_VALUE')
        postal_code = str.strip(new_values['data']['postal_code'])

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
                                   description='API.INVALID_RATED_POWER_VALUE')
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

        if 'serial_number' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['serial_number'], str) or \
                len(str.strip(new_values['data']['serial_number'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SERIAL_NUMBER')
        serial_number = str.strip(new_values['data']['serial_number'])

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
                       " FROM tbl_microgrids "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_NAME_IS_ALREADY_IN_USE')

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
                       (svg_id,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SVG_NOT_FOUND')

        add_values = (" INSERT INTO tbl_microgrids "
                      "    (name, uuid, address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                      "     contact_id, cost_center_id, serial_number, svg_id, is_cost_data_displayed, "
                      "     phase_of_lifecycle, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    address,
                                    postal_code,
                                    latitude,
                                    longitude,
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    serial_number,
                                    svg_id,
                                    is_cost_data_displayed,
                                    phase_of_lifecycle,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(new_id)


class MicrogridItem:
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
                                   description='API.INVALID_MICROGRID_ID')

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
                 "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                 "        contact_id, cost_center_id, serial_number, svg_id, is_cost_data_displayed, "
                 "        phase_of_lifecycle, description "
                 " FROM tbl_microgrids "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "address": row[3],
                           "postal_code": row[4],
                           "latitude": row[5],
                           "longitude": row[6],
                           "rated_capacity": row[7],
                           "rated_power": row[8],
                           "contact": contact_dict.get(row[9], None),
                           "cost_center": cost_center_dict.get(row[10], None),
                           "serial_number": row[11],
                           "svg": svg_dict.get(row[12], None),
                           "is_cost_data_displayed": bool(row[13]),
                           "phase_of_lifecycle": row[14],
                           "description": row[15],
                           "qrcode": 'microgrid:' + row[2]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        # check relation with spaces
        cursor.execute(" SELECT id "
                       " FROM  tbl_spaces_microgrids "
                       " WHERE microgrid_id = %s ", (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # check relation with power plants
        cursor.execute(" SELECT id "
                       " FROM tbl_virtual_power_plants_microgrids "
                       " WHERE microgrid_id = %s ",
                       (id_,))
        rows_power_plants = cursor.fetchall()
        if rows_power_plants is not None and len(rows_power_plants) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_VIRTUAL_POWER_PLANTS')

        cursor.execute(" DELETE FROM tbl_microgrids_batteries WHERE microgrid_id = %s ", (id_,))
        cnx.commit()
        cursor.execute(" DELETE FROM tbl_microgrids_commands WHERE microgrid_id = %s ", (id_,))
        cnx.commit()
        cursor.execute(" DELETE FROM tbl_microgrids_power_conversion_systems WHERE microgrid_id = %s ", (id_,))
        cnx.commit()
        cursor.execute(" DELETE FROM tbl_microgrids_evchargers WHERE microgrid_id = %s ", (id_,))
        cnx.commit()
        cursor.execute(" DELETE FROM tbl_microgrids_generators WHERE microgrid_id = %s ", (id_,))
        cnx.commit()
        cursor.execute(" DELETE FROM tbl_microgrids_grids WHERE microgrid_id = %s ", (id_,))
        cnx.commit()
        cursor.execute(" DELETE FROM tbl_microgrids_heatpumps WHERE microgrid_id = %s ", (id_,))
        cnx.commit()
        cursor.execute(" DELETE FROM tbl_microgrids_loads WHERE microgrid_id = %s ", (id_,))
        cnx.commit()
        cursor.execute(" DELETE FROM tbl_microgrids_photovoltaics WHERE microgrid_id = %s ", (id_,))
        cnx.commit()
        cursor.execute(" DELETE FROM tbl_microgrids_sensors WHERE microgrid_id = %s ", (id_,))
        cnx.commit()
        cursor.execute(" DELETE FROM tbl_microgrids_users WHERE microgrid_id = %s ", (id_,))
        cnx.commit()
        cursor.execute(" DELETE FROM tbl_microgrids WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_MICROGRID_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_NAME')
        name = str.strip(new_values['data']['name'])

        if 'address' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['address'], str) or \
                len(str.strip(new_values['data']['address'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADDRESS_VALUE')
        address = str.strip(new_values['data']['address'])

        if 'postal_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['postal_code'], str) or \
                len(str.strip(new_values['data']['postal_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POSTAL_CODE_VALUE')
        postal_code = str.strip(new_values['data']['postal_code'])

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
                                   description='API.INVALID_RATED_POWER_VALUE')
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

        if 'serial_number' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['serial_number'], str) or \
                len(str.strip(new_values['data']['serial_number'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SERIAL_NUMBER')
        serial_number = str.strip(new_values['data']['serial_number'])

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
                                   description='API.INVALID_MICROGRID_PHASE_OF_LIFECYCLE')
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
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_NAME_IS_ALREADY_IN_USE')

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

        update_row = (" UPDATE tbl_microgrids "
                      " SET name = %s, address = %s, postal_code = %s, latitude = %s, longitude = %s, "
                      "     rated_capacity = %s, rated_power = %s, "
                      "     contact_id = %s, cost_center_id = %s, "
                      "     serial_number = %s, svg_id = %s, is_cost_data_displayed = %s, phase_of_lifecycle = %s, "
                      "     description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    address,
                                    postal_code,
                                    latitude,
                                    longitude,
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    serial_number,
                                    svg_id,
                                    is_cost_data_displayed,
                                    phase_of_lifecycle,
                                    description,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class MicrogridBatteryCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

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
                 "        battery_state_point_id, soc_point_id, power_point_id, "
                 "        charge_meter_id, discharge_meter_id, rated_capacity, rated_power, nominal_voltage "
                 " FROM tbl_microgrids_batteries "
                 " WHERE microgrid_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "battery_state_point": point_dict.get(row[3]),
                               "soc_point": point_dict.get(row[4]),
                               "power_point": point_dict.get(row[5]),
                               "charge_meter": meter_dict.get(row[6]),
                               "discharge_meter": meter_dict.get(row[7]),
                               "rated_capacity": row[8],
                               "rated_power": row[9],
                               "nominal_voltage": row[10]}
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_BATTERY_NAME')
        name = str.strip(new_values['data']['name'])

        if 'battery_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['battery_state_point_id'], int) or \
                new_values['data']['battery_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BATTERY_STATE_POINT_ID')
        battery_state_point_id = new_values['data']['battery_state_point_id']

        if 'soc_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['soc_point_id'], int) or \
                new_values['data']['soc_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SOC_POINT_ID')
        soc_point_id = new_values['data']['soc_point_id']

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

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

        if 'rated_capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_capacity'], float) or
                     isinstance(new_values['data']['rated_capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = float(new_values['data']['rated_capacity'])

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = float(new_values['data']['rated_power'])

        if 'nominal_voltage' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['nominal_voltage'], float) or
                     isinstance(new_values['data']['nominal_voltage'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NOMINAL_VOLTAGE')
        nominal_voltage = float(new_values['data']['nominal_voltage'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_batteries "
                       " WHERE microgrid_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_BATTERY_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (battery_state_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.BATTERY_STATE_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (soc_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SOC_POINT_NOT_FOUND')

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
                       (charge_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CHARGE_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (discharge_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISCHARGE_METER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_microgrids_batteries "
                      "    (name, uuid, microgrid_id, "
                      "     battery_state_point_id, soc_point_id, power_point_id, "
                      "     charge_meter_id, discharge_meter_id, rated_capacity, rated_power, nominal_voltage) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    battery_state_point_id,
                                    soc_point_id,
                                    power_point_id,
                                    charge_meter_id,
                                    discharge_meter_id,
                                    rated_capacity,
                                    rated_power,
                                    nominal_voltage))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/batteries/' + str(new_id)


class MicrogridBatteryItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, bid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, bid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_BATTERY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        # query microgrid dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrids ")
        cursor.execute(query)
        rows_microgrids = cursor.fetchall()

        microgrid_dict = dict()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                microgrid_dict[row[0]] = {"id": row[0],
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

        query = (" SELECT id, name, uuid, microgrid_id, "
                 "       battery_state_point_id, soc_point_id, power_point_id, "
                 "       charge_meter_id, discharge_meter_id, rated_capacity, rated_power, nominal_voltage "
                 " FROM tbl_microgrids_batteries "
                 " WHERE id = %s ")
        cursor.execute(query, (bid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_BATTERY_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "microgrid": microgrid_dict.get(row[3]),
                           "battery_state_point": point_dict.get(row[4]),
                           "soc_point": point_dict.get(row[5]),
                           "power_point": point_dict.get(row[6]),
                           "charge_meter": meter_dict.get(row[7]),
                           "discharge_meter": meter_dict.get(row[8]),
                           "rated_capacity": row[9],
                           "rated_power": row[10],
                           "nominal_voltage": row[11]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, bid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_BATTERY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_batteries "
                       " WHERE id = %s ", (bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_BATTERY_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_batteries "
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
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_BATTERY_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_BATTERY_NAME')
        name = str.strip(new_values['data']['name'])

        if 'battery_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['battery_state_point_id'], int) or \
                new_values['data']['battery_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BATTERY_STATE_POINT_ID')
        battery_state_point_id = new_values['data']['battery_state_point_id']

        if 'soc_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['soc_point_id'], int) or \
                new_values['data']['soc_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SOC_POINT_ID')
        soc_point_id = new_values['data']['soc_point_id']

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

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

        if 'rated_capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_capacity'], float) or
                     isinstance(new_values['data']['rated_capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = float(new_values['data']['rated_capacity'])

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = float(new_values['data']['rated_power'])

        if 'nominal_voltage' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['nominal_voltage'], float) or
                     isinstance(new_values['data']['nominal_voltage'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NOMINAL_VOLTAGE')
        nominal_voltage = float(new_values['data']['nominal_voltage'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_batteries "
                       " WHERE id = %s ", (bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_BATTERY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_batteries "
                       " WHERE microgrid_id = %s AND name = %s AND id != %s ",
                       (id_, name, bid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_BATTERY_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (battery_state_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.BATTERY_STATE_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (soc_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SOC_POINT_NOT_FOUND')

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
                       (charge_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CHARGE_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (discharge_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISCHARGE_METER_NOT_FOUND')

        update_row = (" UPDATE tbl_microgrids_batteries "
                      " SET name = %s, microgrid_id = %s, "
                      "     battery_state_point_id = %s, soc_point_id = %s, power_point_id = %s, "
                      "     charge_meter_id = %s, discharge_meter_id = %s, rated_capacity = %s, rated_power = %s,"
                      "     nominal_voltage = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    battery_state_point_id,
                                    soc_point_id,
                                    power_point_id,
                                    charge_meter_id,
                                    discharge_meter_id,
                                    rated_capacity,
                                    rated_power,
                                    nominal_voltage,
                                    bid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class MicrogridCommandCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        query = (" SELECT c.id, c.name, c.uuid "
                 " FROM tbl_microgrids m, tbl_microgrids_commands mc, tbl_commands c "
                 " WHERE mc.microgrid_id = m.id AND c.id = mc.command_id AND m.id = %s "
                 " ORDER BY c.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2]}
                result.append(meta_result)

        resp.text = json.dumps(result)


class MicrogridEVChargerCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

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
                 "       power_point_id, meter_id, rated_output_power "
                 " FROM tbl_microgrids_evchargers "
                 " WHERE microgrid_id = %s "
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
                               "rated_output_power": row[5]}
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_EVCHARGER_NAME')
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

        if 'rated_output_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_output_power'], float) or
                     isinstance(new_values['data']['rated_output_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_OUTPUT_POWER')
        rated_output_power = float(new_values['data']['rated_output_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_evchargers "
                       " WHERE microgrid_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_EVCHARGER_NAME_IS_ALREADY_IN_USE')

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

        add_values = (" INSERT INTO tbl_microgrids_evchargers "
                      "    (name, uuid, microgrid_id, power_point_id, meter_id, rated_output_power) "
                      " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_output_power))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + id_ + '/evchargers/' + str(new_id)


class MicrogridEVChargerItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, eid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, eid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_EVCHARGER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        # query microgrid dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrids ")
        cursor.execute(query)
        rows_microgrids = cursor.fetchall()

        microgrid_dict = dict()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                microgrid_dict[row[0]] = {"id": row[0],
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

        query = (" SELECT id, name, uuid, microgrid_id, power_point_id, meter_id, rated_output_power "
                 " FROM tbl_microgrids_evchargers "
                 " WHERE id = %s ")
        cursor.execute(query, (eid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_EVCHARGER_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "microgrid": microgrid_dict.get(row[3]),
                           "power_point": point_dict.get(row[4]),
                           "meter": meter_dict.get(row[5]),
                           "rated_output_power": row[6]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, eid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_EVCHARGER_ID')
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_evchargers "
                       " WHERE id = %s ", (eid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_EVCHARGER_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_evchargers "
                       " WHERE id = %s ", (eid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, eid):
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
                                   description='API.INVALID_MICROGRID_ID')
        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_EVCHARGER_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_EVCHARGER_NAME')
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

        if 'rated_output_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_output_power'], float) or
                     isinstance(new_values['data']['rated_output_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_OUTPUT_POWER')
        rated_output_power = float(new_values['data']['rated_output_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_evchargers "
                       " WHERE id = %s ", (eid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_EVCHARGER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_evchargers "
                       " WHERE microgrid_id = %s AND name = %s AND id != %s ",
                       (id_, name, eid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_EVCHARGER_NAME_IS_ALREADY_IN_USE')

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

        update_row = (" UPDATE tbl_microgrids_evchargers "
                      " SET name = %s, microgrid_id = %s, power_point_id = %s, meter_id = %s, rated_output_power = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_output_power,
                                    eid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class MicrogridGeneratorCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

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
                 "        power_point_id, meter_id, rated_output_power "
                 " FROM tbl_microgrids_generators "
                 " WHERE microgrid_id = %s "
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
                               "rated_output_power": row[5]}
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_GENERATOR_NAME')
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

        if 'rated_output_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_output_power'], float) or
                     isinstance(new_values['data']['rated_output_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_OUTPUT_POWER')
        rated_output_power = float(new_values['data']['rated_output_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_generators "
                       " WHERE microgrid_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_GENERATOR_NAME_IS_ALREADY_IN_USE')

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

        add_values = (" INSERT INTO tbl_microgrids_generators "
                      "    (name, uuid, microgrid_id, power_point_id, meter_id, rated_output_power) "
                      " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_output_power))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/generators/' + str(new_id)


class MicrogridGeneratorItem:
    def __init__(self):
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
                                   description='API.INVALID_MICROGRID_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_GENERATOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        # query microgrid dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrids ")
        cursor.execute(query)
        rows_microgrids = cursor.fetchall()

        microgrid_dict = dict()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                microgrid_dict[row[0]] = {"id": row[0],
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

        query = (" SELECT id, name, uuid, microgrid_id, power_point_id, meter_id, rated_output_power "
                 " FROM tbl_microgrids_generators "
                 " WHERE id = %s ")
        cursor.execute(query, (gid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GENERATOR_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "microgrid": microgrid_dict.get(row[3]),
                           "power_point": point_dict.get(row[4]),
                           "meter": meter_dict.get(row[5]),
                           "rated_output_power": row[6]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, gid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_GENERATOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_generators "
                       " WHERE id = %s ", (gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GENERATOR_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_generators "
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
                                   description='API.INVALID_MICROGRID_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_GENERATOR_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_GENERATOR_NAME')
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

        if 'rated_output_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_output_power'], float) or
                     isinstance(new_values['data']['rated_output_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_OUTPUT_POWER')
        rated_output_power = float(new_values['data']['rated_output_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_generators "
                       " WHERE id = %s ", (gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GENERATOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_generators "
                       " WHERE microgrid_id = %s AND name = %s AND id != %s ",
                       (id_, name, gid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_GENERATOR_NAME_IS_ALREADY_IN_USE')

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

        update_row = (" UPDATE tbl_microgrids_generators "
                      " SET name = %s, microgrid_id = %s, power_point_id = %s, meter_id = %s, rated_output_power = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_output_power,
                                    gid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class MicrogridGridCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

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
                 "        power_point_id, buy_meter_id, sell_meter_id, capacity "
                 " FROM tbl_microgrids_grids "
                 " WHERE microgrid_id = %s "
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
                               "capacity": row[6]}
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_GRID_NAME')
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
        capacity = float(new_values['data']['capacity'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_grids "
                       " WHERE microgrid_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_GRID_NAME_IS_ALREADY_IN_USE')

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

        add_values = (" INSERT INTO tbl_microgrids_grids "
                      "    (name, uuid, microgrid_id, power_point_id, buy_meter_id, sell_meter_id, capacity) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    power_point_id,
                                    buy_meter_id,
                                    sell_meter_id,
                                    capacity))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/grids/' + str(new_id)


class MicrogridGridItem:
    def __init__(self):
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
                                   description='API.INVALID_MICROGRID_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_GRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        # query microgrid dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrids ")
        cursor.execute(query)
        rows_microgrids = cursor.fetchall()

        microgrid_dict = dict()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                microgrid_dict[row[0]] = {"id": row[0],
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

        query = (" SELECT id, name, uuid, microgrid_id, power_point_id, buy_meter_id, sell_meter_id, capacity "
                 " FROM tbl_microgrids_grids "
                 " WHERE id = %s ")
        cursor.execute(query, (gid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GRID_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "microgrid": microgrid_dict.get(row[3]),
                           "power_point": point_dict.get(row[4]),
                           "buy_meter": meter_dict.get(row[5]),
                           "sell_meter": meter_dict.get(row[6]),
                           "capacity": row[7]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, gid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_GRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_grids "
                       " WHERE id = %s ", (gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GRID_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_grids "
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
                                   description='API.INVALID_MICROGRID_ID')

        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_GRID_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_GRID_NAME')
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
        capacity = float(new_values['data']['capacity'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_grids "
                       " WHERE id = %s ", (gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_grids "
                       " WHERE microgrid_id = %s AND name = %s AND id != %s ",
                       (id_, name, gid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_GRID_NAME_IS_ALREADY_IN_USE')

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

        update_row = (" UPDATE tbl_microgrids_grids "
                      " SET name = %s, microgrid_id = %s, "
                      "     power_point_id = %s, buy_meter_id = %s, sell_meter_id = %s, capacity = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    power_point_id,
                                    buy_meter_id,
                                    sell_meter_id,
                                    capacity,
                                    gid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class MicrogridHeatpumpCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

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
                 "        power_point_id, electricity_meter_id, heat_meter_id, cooling_meter_id, rated_input_power "
                 " FROM tbl_microgrids_heatpumps "
                 " WHERE microgrid_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "power_point": point_dict.get(row[3], None),
                               "electricity_meter": meter_dict.get(row[4], None),
                               "heat_meter": meter_dict.get(row[5], None),
                               "cooling_meter": meter_dict.get(row[6], None),
                               "rated_input_power": row[7]}
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_HEATPUMP_NAME')
        name = str.strip(new_values['data']['name'])

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

        if 'electricity_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['electricity_meter_id'], int) or \
                new_values['data']['electricity_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ELECTRICITY_METER_ID')
        electricity_meter_id = new_values['data']['electricity_meter_id']

        if 'heat_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['heat_meter_id'], int) or \
                new_values['data']['heat_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SELL_METER_ID')
        heat_meter_id = new_values['data']['heat_meter_id']

        if 'cooling_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cooling_meter_id'], int) or \
                new_values['data']['cooling_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COOLING_METER_ID')
        cooling_meter_id = new_values['data']['cooling_meter_id']

        if 'rated_input_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_input_power'], float) or
                     isinstance(new_values['data']['rated_input_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_INPUT_POWER')
        rated_input_power = float(new_values['data']['rated_input_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_heatpumps "
                       " WHERE microgrid_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_HEATPUMP_NAME_IS_ALREADY_IN_USE')

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
                       (electricity_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ELECTRICITY_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (heat_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HEAT_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (cooling_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COOLING_METER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_microgrids_heatpumps "
                      "    (name, uuid, microgrid_id, "
                      "     power_point_id, electricity_meter_id, heat_meter_id, cooling_meter_id, rated_input_power) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    power_point_id,
                                    electricity_meter_id,
                                    heat_meter_id,
                                    cooling_meter_id,
                                    rated_input_power))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/heatpumps/' + str(new_id)


class MicrogridHeatpumpItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, hid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, hid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_HEATPUMP_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        # query microgrid dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrids ")
        cursor.execute(query)
        rows_microgrids = cursor.fetchall()

        microgrid_dict = dict()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                microgrid_dict[row[0]] = {"id": row[0],
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

        query = (" SELECT id, name, uuid, microgrid_id, "
                 "        power_point_id, electricity_meter_id, heat_meter_id, cooling_meter_id, rated_input_power "
                 " FROM tbl_microgrids_heatpumps "
                 " WHERE id = %s ")
        cursor.execute(query, (hid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_HEATPUMP_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "microgrid": microgrid_dict.get(row[3], None),
                           "power_point": point_dict.get(row[4], None),
                           "electricity_meter": meter_dict.get(row[5], None),
                           "heat_meter": meter_dict.get(row[6], None),
                           "cooling_meter": meter_dict.get(row[7], None),
                           "rated_input_power": row[8]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, hid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_HEATPUMP_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_heatpumps "
                       " WHERE id = %s ", (hid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_HEATPUMP_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_heatpumps "
                       " WHERE id = %s ", (hid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, hid):
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
                                   description='API.INVALID_MICROGRID_ID')
        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_HEATPUMP_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_HEATPUMP_NAME')
        name = str.strip(new_values['data']['name'])

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

        if 'electricity_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['electricity_meter_id'], int) or \
                new_values['data']['electricity_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ELECTRICITY_METER_ID')
        electricity_meter_id = new_values['data']['electricity_meter_id']

        if 'heat_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['heat_meter_id'], int) or \
                new_values['data']['heat_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HEAT_METER_ID')
        heat_meter_id = new_values['data']['heat_meter_id']

        if 'cooling_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cooling_meter_id'], int) or \
                new_values['data']['cooling_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COOLING_METER_ID')
        cooling_meter_id = new_values['data']['cooling_meter_id']

        if 'rated_input_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_input_power'], float) or
                     isinstance(new_values['data']['rated_input_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_INPUT_POWER')
        rated_input_power = float(new_values['data']['rated_input_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_heatpumps "
                       " WHERE id = %s ", (hid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_HEATPUMP_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_heatpumps "
                       " WHERE microgrid_id = %s AND name = %s AND id != %s ",
                       (id_, name, hid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_HEATPUMP_NAME_IS_ALREADY_IN_USE')

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
                       (electricity_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ELECTRICITY_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (heat_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HEAT_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (cooling_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COOLING_METER_NOT_FOUND')

        update_row = (" UPDATE tbl_microgrids_heatpumps "
                      " SET name = %s, microgrid_id = %s, "
                      "     power_point_id = %s, electricity_meter_id = %s, heat_meter_id = %s, cooling_meter_id = %s, "
                      "     rated_input_power = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    power_point_id,
                                    electricity_meter_id,
                                    heat_meter_id,
                                    heat_meter_id,
                                    rated_input_power,
                                    hid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class MicrogridLoadCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

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
                 "        power_point_id, meter_id, rated_input_power "
                 " FROM tbl_microgrids_loads "
                 " WHERE microgrid_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "power_point": point_dict.get(row[3], None),
                               "meter": meter_dict.get(row[4], None),
                               "rated_input_power": row[5]}
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_LOAD_NAME')
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
        rated_input_power = float(new_values['data']['rated_input_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_loads "
                       " WHERE microgrid_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_LOAD_NAME_IS_ALREADY_IN_USE')

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

        add_values = (" INSERT INTO tbl_microgrids_loads "
                      "    (name, uuid, microgrid_id, power_point_id, meter_id, rated_input_power) "
                      " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_input_power))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/loads/' + str(new_id)


class MicrogridLoadItem:
    def __init__(self):
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
                                   description='API.INVALID_MICROGRID_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_LOAD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        # query microgrid dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrids ")
        cursor.execute(query)
        rows_microgrids = cursor.fetchall()

        microgrid_dict = dict()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                microgrid_dict[row[0]] = {"id": row[0],
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

        query = (" SELECT id, name, uuid, microgrid_id, power_point_id, meter_id, rated_input_power "
                 " FROM tbl_microgrids_loads "
                 " WHERE id = %s ")
        cursor.execute(query, (lid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_LOAD_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "microgrid": microgrid_dict.get(row[3], None),
                           "power_point": point_dict.get(row[4], None),
                           "meter": meter_dict.get(row[5], None),
                           "rated_input_power": row[6]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, lid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_LOAD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_loads "
                       " WHERE id = %s ", (lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_LOAD_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_loads "
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
                                   description='API.INVALID_MICROGRID_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_LOAD_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_LOAD_NAME')
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
        rated_input_power = float(new_values['data']['rated_input_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_loads "
                       " WHERE id = %s ", (lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_LOAD_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_loads "
                       " WHERE microgrid_id = %s AND name = %s AND id != %s ",
                       (id_, name, lid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_LOAD_NAME_IS_ALREADY_IN_USE')

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

        update_row = (" UPDATE tbl_microgrids_loads "
                      " SET name = %s, microgrid_id = %s, power_point_id = %s, meter_id = %s, rated_input_power = %s "
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


class MicrogridPhotovoltaicCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

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
                 "        power_point_id, meter_id, rated_power "
                 " FROM tbl_microgrids_photovoltaics "
                 " WHERE microgrid_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "power_point": point_dict.get(row[3], None),
                               "meter": meter_dict.get(row[4], None),
                               "rated_power": row[5],
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_PHOTOVOLTAIC_NAME')
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

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = float(new_values['data']['rated_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_photovoltaics "
                       " WHERE microgrid_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_PHOTOVOLTAIC_NAME_IS_ALREADY_IN_USE')

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

        add_values = (" INSERT INTO tbl_microgrids_photovoltaics "
                      "    (name, uuid, microgrid_id, power_point_id, meter_id, rated_power) "
                      " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_power))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids' + str(id_) + '/photovoltaics/' + str(new_id)


class MicrogridPhotovoltaicItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, pid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_PHOTOVOLTAIC_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        # query microgrid dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrids ")
        cursor.execute(query)
        rows_microgrids = cursor.fetchall()

        microgrid_dict = dict()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                microgrid_dict[row[0]] = {"id": row[0],
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

        query = (" SELECT id, name, uuid, microgrid_id, power_point_id, meter_id, rated_power "
                 " FROM tbl_microgrids_photovoltaics "
                 " WHERE id = %s ")
        cursor.execute(query, (pid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_PHOTOVOLTAIC_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "microgrid": microgrid_dict.get(row[3], None),
                           "power_point": point_dict.get(row[4], None),
                           "meter": meter_dict.get(row[5], None),
                           "rated_power": row[6]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_PHOTOVOLTAIC_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_photovoltaics "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_PHOTOVOLTAIC_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_photovoltaics "
                       " WHERE id = %s ", (pid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, pid):
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
                                   description='API.INVALID_MICROGRID_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_PHOTOVOLTAIC_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_PHOTOVOLTAIC_NAME')
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

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = float(new_values['data']['rated_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_photovoltaics "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_PHOTOVOLTAIC_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_photovoltaics "
                       " WHERE microgrid_id = %s AND name = %s AND id != %s ",
                       (id_, name, pid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_PHOTOVOLTAIC_NAME_IS_ALREADY_IN_USE')

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

        update_row = (" UPDATE tbl_microgrids_photovoltaics "
                      " SET name = %s, microgrid_id = %s, power_point_id = %s, meter_id = %s, rated_power = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_power,
                                    pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class MicrogridPowerconversionsystemCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

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
        # query command dict
        query = (" SELECT id, name "
                 " FROM tbl_commands ")
        cursor.execute(query)
        rows_commands = cursor.fetchall()

        command_dict = dict()
        if rows_commands is not None and len(rows_commands) > 0:
            for row in rows_commands:
                command_dict[row[0]] = {"id": row[0],
                                        "name": row[1]}

        query = (" SELECT id, name, uuid, run_state_point_id, rated_output_power, "
                 "        today_charge_energy_point_id, today_discharge_energy_point_id, "
                 "        total_charge_energy_point_id, total_discharge_energy_point_id "
                 " FROM tbl_microgrids_power_conversion_systems "
                 " WHERE microgrid_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "run_state_point": point_dict.get(row[3]),
                               "rated_output_power": row[4],
                               "today_charge_energy_point": point_dict.get(row[5]),
                               "today_discharge_energy_point": point_dict.get(row[6]),
                               "total_charge_energy_point": point_dict.get(row[7]),
                               "total_discharge_energy_point": point_dict.get(row[8])}
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_POWER_CONVERSION_SYSTEM_NAME')
        name = str.strip(new_values['data']['name'])

        if 'run_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['run_state_point_id'], int) or \
                new_values['data']['run_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RUN_STATE_POINT_ID')
        run_state_point_id = new_values['data']['run_state_point_id']

        if 'rated_output_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_output_power'], float) or
                     isinstance(new_values['data']['rated_output_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_OUTPUT_POWER')
        rated_output_power = float(new_values['data']['rated_output_power'])

        if 'today_charge_energy_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['today_charge_energy_point_id'], int) or \
                new_values['data']['today_charge_energy_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TODAY_CHARGE_ENERGY_POINT_ID')
        today_charge_energy_point_id = new_values['data']['today_charge_energy_point_id']

        if 'today_discharge_energy_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['today_discharge_energy_point_id'], int) or \
                new_values['data']['today_discharge_energy_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TODAY_DISCHARGE_ENERGY_POINT_ID')
        today_discharge_energy_point_id = new_values['data']['today_discharge_energy_point_id']

        if 'total_charge_energy_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['total_charge_energy_point_id'], int) or \
                new_values['data']['total_charge_energy_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOTAL_CHARGE_POINT_ID')
        total_charge_energy_point_id = new_values['data']['total_charge_energy_point_id']

        if 'total_discharge_energy_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['total_discharge_energy_point_id'], int) or \
                new_values['data']['total_discharge_energy_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOTAL_DISCHARGE_POINT_ID')
        total_discharge_energy_point_id = new_values['data']['total_discharge_energy_point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_power_conversion_systems "
                       " WHERE microgrid_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_microgrids_power_conversion_systems "
                      "     (name, uuid, microgrid_id, run_state_point_id, rated_output_power, "
                      "      today_charge_energy_point_id, today_discharge_energy_point_id, "
                      "      total_charge_energy_point_id, total_discharge_energy_point_id) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    run_state_point_id,
                                    rated_output_power,
                                    today_charge_energy_point_id,
                                    today_discharge_energy_point_id,
                                    total_charge_energy_point_id,
                                    total_discharge_energy_point_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgridpowerconversionsystems/' + str(new_id)


class MicrogridPowerconversionsystemItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, pid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_POWER_CONVERSION_SYSTEM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        # query microgrid dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrids ")
        cursor.execute(query)
        rows_microgrids = cursor.fetchall()

        microgrid_dict = dict()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                microgrid_dict[row[0]] = {"id": row[0],
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

        # query command dict
        query = (" SELECT id, name "
                 " FROM tbl_commands ")
        cursor.execute(query)
        rows_commands = cursor.fetchall()

        command_dict = dict()
        if rows_commands is not None and len(rows_commands) > 0:
            for row in rows_commands:
                command_dict[row[0]] = {"id": row[0],
                                        "name": row[1]}

        query = (" SELECT id, name, uuid, microgrid_id, run_state_point_id, rated_output_power, "
                 "        today_charge_energy_point_id, today_discharge_energy_point_id, "
                 "        total_charge_energy_point_id, total_discharge_energy_point_id "
                 " FROM tbl_microgrids_power_conversion_systems "
                 " WHERE id = %s ")
        cursor.execute(query, (pid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "microgrid": microgrid_dict.get(row[3]),
                           "run_state_point": point_dict.get(row[4]),
                           "rated_output_power": row[5],
                           "today_charge_energy_point": point_dict.get(row[6]),
                           "today_discharge_energy_point": point_dict.get(row[7]),
                           "total_charge_energy_point": point_dict.get(row[8]),
                           "total_discharge_energy_point": point_dict.get(row[9])}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_POWER_CONVERSION_SYSTEM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_power_conversion_systems "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_power_conversion_systems "
                       " WHERE id = %s ", (pid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, pid):
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
                                   description='API.INVALID_MICROGRID_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_POWER_CONVERSION_SYSTEM_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_POWER_CONVERSION_SYSTEM_NAME')
        name = str.strip(new_values['data']['name'])

        if 'run_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['run_state_point_id'], int) or \
                new_values['data']['run_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RUN_STATE_POINT_ID')
        run_state_point_id = new_values['data']['run_state_point_id']

        if 'rated_output_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_output_power'], float) or
                     isinstance(new_values['data']['rated_output_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_OUTPUT_POWER')
        rated_output_power = float(new_values['data']['rated_output_power'])

        if 'today_charge_energy_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['today_charge_energy_point_id'], int) or \
                new_values['data']['today_charge_energy_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TODAY_CHARGE_ENERGY_POINT_ID')
        today_charge_energy_point_id = new_values['data']['today_charge_energy_point_id']

        if 'today_discharge_energy_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['today_discharge_energy_point_id'], int) or \
                new_values['data']['today_discharge_energy_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TODAY_DISCHARGE_ENERGY_POINT_ID')
        today_discharge_energy_point_id = new_values['data']['today_discharge_energy_point_id']

        if 'total_charge_energy_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['total_charge_energy_point_id'], int) or \
                new_values['data']['total_charge_energy_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOTAL_CHARGE_POINT_ID')
        total_charge_energy_point_id = new_values['data']['total_charge_energy_point_id']

        if 'total_discharge_energy_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['total_discharge_energy_point_id'], int) or \
                new_values['data']['total_discharge_energy_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOTAL_DISCHARGE_POINT_ID')
        total_discharge_energy_point_id = new_values['data']['total_discharge_energy_point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_power_conversion_systems "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_power_conversion_systems "
                       " WHERE microgrid_id = %s AND name = %s AND id != %s ",
                       (id_, name, pid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_microgrids_power_conversion_systems "
                      " SET name = %s, microgrid_id = %s, run_state_point_id = %s, rated_output_power = %s, "
                      "     today_charge_energy_point_id = %s, today_discharge_energy_point_id = %s, "
                      "     total_charge_energy_point_id = %s, total_discharge_energy_point_id = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    run_state_point_id,
                                    rated_output_power,
                                    today_charge_energy_point_id,
                                    today_discharge_energy_point_id,
                                    total_charge_energy_point_id,
                                    total_discharge_energy_point_id,
                                    pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class MicrogridScheduleCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        query = (" SELECT id, start_time_of_day, end_time_of_day, peak_type, power "
                 " FROM tbl_microgrids_schedules "
                 " WHERE microgrid_id = %s "
                 " ORDER BY start_time_of_day ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "start_time_of_day": str(row[1]),
                               "end_time_of_day": str(row[2]),
                               "peak_type": row[3],
                               "power": row[4],
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        new_values = json.loads(raw_json)

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        add_schedule = (" INSERT INTO tbl_microgrids_schedules "
                        "     (microgrid_id, start_time_of_day, end_time_of_day, peak_type, power) "
                        " VALUES (%s, %s, %s, %s, %s) ")
        cursor.execute(add_schedule, (id_,
                                      new_values['data']['start_time_of_day'],
                                      new_values['data']['end_time_of_day'],
                                      new_values['data']['peak_type'],
                                      new_values['data']['power']))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()
        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainerschedules/' + str(new_id)


class MicrogridScheduleItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, sid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, sid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_SCHEDULE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrids ")
        cursor.execute(query)
        rows_energystoragecontainers = cursor.fetchall()

        microgrid_dict = dict()
        if rows_energystoragecontainers is not None and len(rows_energystoragecontainers) > 0:
            for row in rows_energystoragecontainers:
                microgrid_dict[row[0]] = {"id": row[0],
                                          "name": row[1],
                                          "uuid": row[2]}

        query = (" SELECT id, start_time_of_day, end_time_of_day, peak_type, power "
                 " FROM tbl_microgrids_schedules "
                 " WHERE id = %s ")
        cursor.execute(query, (sid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_SCHEDULE_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "start_time_of_day": str(row[1]),
                           "end_time_of_day": str(row[2]),
                           "peak_type": row[3],
                           "power": row[4]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, sid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_SCHEDULE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_schedules "
                       " WHERE id = %s ", (sid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_SCHEDULE_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_schedules "
                       " WHERE id = %s ", (sid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, sid):
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
                                   description='API.INVALID_MICROGRID_ID')
        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_SCHEDULE_ID')

        new_values = json.loads(raw_json)

        if 'start_time_of_day' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['start_time_of_day'], str) or \
                len(str.strip(new_values['data']['start_time_of_day'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_START_TIME_OF_DAY')
        start_time_of_day = str.strip(new_values['data']['start_time_of_day'])

        if 'end_time_of_day' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['end_time_of_day'], str) or \
                len(str.strip(new_values['data']['end_time_of_day'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_END_TIME_OF_DAY')
        end_time_of_day = str.strip(new_values['data']['end_time_of_day'])

        if 'peak_type' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['peak_type'], str) or \
                len(str.strip(new_values['data']['peak_type'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PEAK_TYPE')
        peak_type = str.strip(new_values['data']['peak_type'])

        if 'power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['power'], float) or
                     isinstance(new_values['data']['power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER')
        power = float(new_values['data']['power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_schedules "
                       " WHERE id = %s ", (sid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_SCHEDULE_NOT_FOUND')

        update_row = (" UPDATE tbl_microgrids_schedules "
                      " SET start_time_of_day = %s, end_time_of_day = %s, peak_type = %s, power = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (start_time_of_day,
                                    end_time_of_day,
                                    peak_type,
                                    power,
                                    sid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class MicrogridSensorCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        query = (" SELECT s.id, s.name, s.uuid "
                 " FROM tbl_microgrids m, tbl_microgrids_sensors ms, tbl_sensors s "
                 " WHERE ms.microgrid_id = m.id AND s.id = ms.sensor_id AND m.id = %s "
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
                                   description='API.INVALID_MICROGRID_ID')

        new_values = json.loads(raw_json)

        if 'sensor_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['sensor_id'], int) or \
                new_values['data']['sensor_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SENSOR_ID')
        sensor_id = new_values['data']['sensor_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_sensors "
                       " WHERE id = %s ", (sensor_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SENSOR_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_microgrids_sensors "
                 " WHERE microgrid_id = %s AND sensor_id = %s")
        cursor.execute(query, (id_, sensor_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.MICROGRID_SENSOR_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_microgrids_sensors (microgrid_id, sensor_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, sensor_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/sensors/' + str(sensor_id)


class MicrogridSensorItem:
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
                                   description='API.INVALID_MICROGRID_ID')

        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SENSOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_sensors "
                       " WHERE id = %s ", (sid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SENSOR_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_sensors "
                       " WHERE microgrid_id = %s AND sensor_id = %s ", (id_, sid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_SENSOR_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_sensors "
                       " WHERE microgrid_id = %s AND sensor_id = %s ", (id_, sid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class MicrogridUserCollection:
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        query = (" SELECT u.id, u.name, u.uuid "
                 " FROM tbl_microgrids m, tbl_microgrids_users mu, "
                 + config.myems_user_db['database'] + ".tbl_users u "
                 " WHERE mu.microgrid_id = m.id AND u.id = mu.user_id AND m.id = %s "
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
                                   description='API.INVALID_MICROGRID_ID')

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
                       " from tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

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
                 " FROM tbl_microgrids_users "
                 " WHERE microgrid_id = %s AND user_id = %s")
        cursor.execute(query, (id_, user_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.MICROGRID_USER_RELATION_EXISTS')
        add_row = (" INSERT INTO tbl_microgrids_users (microgrid_id, user_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, user_id,))
        cnx.commit()
        cursor.close()
        cnx.close()
        cursor_user.close()
        cnx_user.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/users/' + str(user_id)


class MicrogridUserItem:
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
                                   description='API.INVALID_MICROGRID_ID')

        if not uid.isdigit() or int(uid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cnx_user = mysql.connector.connect(**config.myems_user_db)
        cursor_user = cnx_user.cursor()
        cursor_user.execute(" SELECT name FROM tbl_users WHERE id = %s ", (uid,))
        if cursor_user.fetchone() is None:
            cursor_user.close()
            cnx_user.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_users "
                       " WHERE microgrid_id = %s AND user_id = %s ", (id_, uid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_USER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_users WHERE microgrid_id = %s AND user_id = %s ", (id_, uid))
        cnx.commit()

        cursor.close()
        cnx.close()
        cursor_user.close()
        cnx_user.close()

        resp.status = falcon.HTTP_204


class MicrogridExport:
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
                                   description='API.INVALID_MICROGRID_ID')

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
                 "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                 "        contact_id, cost_center_id, serial_number, svg_id, is_cost_data_displayed, phase_of_lifecycle, description "
                 " FROM tbl_microgrids "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "address": row[3],
                           "postal_code": row[4],
                           "latitude": row[5],
                           "longitude": row[6],
                           "rated_capacity": row[7],
                           "rated_power": row[8],
                           "contact": contact_dict.get(row[9], None),
                           "cost_center": cost_center_dict.get(row[10], None),
                           "serial_number": row[11],
                           "svg_id": row[12],
                           "is_cost_data_displayed": bool(row[13]),
                           "phase_of_lifecycle": row[14],
                           "description": row[15]}

        resp.text = json.dumps(meta_result)


class MicrogridImport:
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

        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_NAME')
        name = str.strip(new_values['name'])

        if 'address' not in new_values.keys() or \
                not isinstance(new_values['address'], str) or \
                len(str.strip(new_values['address'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADDRESS_VALUE')
        address = str.strip(new_values['address'])

        if 'postal_code' not in new_values.keys() or \
                not isinstance(new_values['postal_code'], str) or \
                len(str.strip(new_values['postal_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POSTAL_CODE_VALUE')
        postal_code = str.strip(new_values['postal_code'])

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

        if 'id' not in new_values['contact'].keys() or \
                not isinstance(new_values['contact']['id'], int) or \
                new_values['contact']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTACT_ID')
        contact_id = new_values['contact']['id']

        if 'id' not in new_values['cost_center'].keys() or \
                not isinstance(new_values['cost_center']['id'], int) or \
                new_values['cost_center']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')
        cost_center_id = new_values['cost_center']['id']

        if 'serial_number' not in new_values.keys() or \
                not isinstance(new_values['serial_number'], str) or \
                len(str.strip(new_values['serial_number'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SERIAL_NUMBER')
        serial_number = str.strip(new_values['serial_number'])

        if 'svg_id' not in new_values.keys() or \
                not isinstance(new_values['svg_id'], int) or \
                new_values['svg_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_ID')
        svg_id = new_values['svg_id']

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

        original_name = name
        while True:
            cursor.execute(" SELECT name "
                           " FROM tbl_microgrids "
                           " WHERE name = %s ", (name,))
            if cursor.fetchone() is None:
                break
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            name = (str.strip(original_name) +
                    (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))

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

        add_values = (" INSERT INTO tbl_microgrids "
                      "    (name, uuid, address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                      "     contact_id, cost_center_id, serial_number, svg_id, is_cost_data_displayed, phase_of_lifecycle, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    address,
                                    postal_code,
                                    latitude,
                                    longitude,
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    serial_number,
                                    svg_id,
                                    is_cost_data_displayed,
                                    phase_of_lifecycle,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(new_id)


class MicrogridClone:
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
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')

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
                    "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                    "        contact_id, cost_center_id, serial_number, svg_id, is_cost_data_displayed, phase_of_lifecycle, description "
                    " FROM tbl_microgrids "
                    " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "address": row[3],
                           "postal_code": row[4],
                           "latitude": row[5],
                           "longitude": row[6],
                           "rated_capacity": row[7],
                           "rated_power": row[8],
                           "contact": contact_dict.get(row[9], None),
                           "cost_center": cost_center_dict.get(row[10], None),
                           "serial_number": row[11],
                           "svg_id": row[12],
                           "is_cost_data_displayed": row[13],
                           "phase_of_lifecycle": row[14],
                           "description": row[15]}
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = (str.strip(meta_result['name']) +
                        (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
            add_values = (" INSERT INTO tbl_microgrids "
                          "    (name, uuid, address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                          "     contact_id, cost_center_id, serial_number, svg_id, is_cost_data_displayed, phase_of_lifecycle, description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['address'],
                                        meta_result['postal_code'],
                                        meta_result['latitude'],
                                        meta_result['longitude'],
                                        meta_result['rated_capacity'],
                                        meta_result['rated_power'],
                                        meta_result['contact']['id'],
                                        meta_result['cost_center']['id'],
                                        meta_result['serial_number'],
                                        meta_result['svg_id'],
                                        meta_result['is_cost_data_displayed'],
                                        meta_result['phase_of_lifecycle'],
                                        meta_result['description']))
            new_id = cursor.lastrowid
            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/microgrids/' + str(new_id)

class MicrogridDataSourceCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        _ = id_
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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name FROM tbl_microgrids WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        query = (" SELECT ds.id, ds.name, ds.uuid "
                 " FROM tbl_microgrids mg, tbl_microgrids_data_sources mgds, tbl_data_sources ds "
                 " WHERE mgds.microgrid_id = mg.id AND ds.id = mgds.data_source_id AND mg.id = %s "
                 " ORDER BY ds.id ")
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
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')

        new_values = json.loads(raw_json)

        if 'data_source_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['data_source_id'], int) or \
                new_values['data']['data_source_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        data_source_id = new_values['data']['data_source_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name FROM tbl_microgrids WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name FROM tbl_data_sources WHERE id = %s ", (data_source_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_data_sources "
                       " WHERE microgrid_id = %s AND data_source_id = %s", (id_, data_source_id))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.MICROGRID_DATA_SOURCE_RELATION_EXISTS')

        cursor.execute(" INSERT INTO tbl_microgrids_data_sources (microgrid_id, data_source_id) "
                       " VALUES (%s, %s) ", (id_, data_source_id))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/datasources/' + str(data_source_id)

class MicrogridDataSourceItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, dsid):
        _ = req
        _ = id_
        _ = dsid
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, dsid):
        admin_control(req)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')

        if not dsid.isdigit() or int(dsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name FROM tbl_microgrids WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name FROM tbl_data_sources WHERE id = %s ", (dsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_data_sources "
                       " WHERE microgrid_id = %s AND data_source_id = %s ", (id_, dsid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_DATA_SOURCE_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_data_sources "
                       " WHERE microgrid_id = %s AND data_source_id = %s ", (id_, dsid))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

class MicrogridDataSourcePointCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

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
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT p.id, p.name "
                 " FROM tbl_points p, tbl_microgrids_data_sources mds, tbl_data_sources ds "
                 " WHERE mds.microgrid_id = %s "
                 "       AND mds.data_source_id = ds.id "
                 "       AND p.data_source_id = ds.id "
                 " ORDER BY p.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1]}
                result.append(meta_result)

        cursor.close()
        cnx.close()

        resp.text = json.dumps(result)

class MicrogridBatteryPointCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, bid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = bid

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
                                   description='API.INVALID_MICROGRID_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BATTERY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_batteries "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_BATTERY_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_microgrids_bmses_points mp, tbl_data_sources ds "
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
                                   description='API.INVALID_MICROGRID_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BATTERY_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_batteries "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_BATTERY_NOT_FOUND')

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
                 " FROM tbl_microgrids_bmses_points "
                 " WHERE bms_id = %s AND point_id = %s")
        cursor.execute(query, (bid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.BATTERY_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_microgrids_bmses_points (bms_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (bid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/batteries/' + str(bid) + '/points/' + \
                        str(new_values['data']['point_id'])


class MicrogridBatteryPointItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, bid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = bid
        _ = pid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, bid, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BATTERY_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_batteries "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_BATTERY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_bmses_points "
                       " WHERE bms_id = %s AND point_id = %s ", (bid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.BATTERY_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_bmses_points "
                       " WHERE bms_id = %s AND point_id = %s ", (bid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

class MicrogridEVChargerPointCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, eid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = eid

    @staticmethod
    def on_get(req, resp, id_, eid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EVCHARGER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_evchargers "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, eid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_EV_CHARGER_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_microgrids_evchargers_points mp, tbl_data_sources ds "
                 " WHERE mp.evcharger_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (eid,))
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
    def on_post(req, resp, id_, eid):
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
                                   description='API.INVALID_MICROGRID_ID')
        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EVCHARGER_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_evchargers "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, eid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_EVCHARGER_NOT_FOUND')

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
                 " FROM tbl_microgrids_evchargers_points "
                 " WHERE evcharger_id = %s AND point_id = %s")
        cursor.execute(query, (eid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.EVCHARGER_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_microgrids_evchargers_points (evcharger_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (eid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/evchargers/' + str(eid) + '/points/' + \
                        str(new_values['data']['point_id'])


class MicrogridEVChargerPointItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, eid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = eid
        _ = pid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, eid, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EVCHARGER_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_evchargers "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, eid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_EVCHARGER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_evchargers_points "
                       " WHERE evcharger_id = %s AND point_id = %s ", (eid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EVCHARGER_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_evchargers_points "
                       " WHERE evcharger_id = %s AND point_id = %s ", (eid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

class MicrogridGeneratorPointCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, gid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = gid

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
                                   description='API.INVALID_MICROGRID_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GENERATOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_generators "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GENERATOR_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_microgrids_generators_points mp, tbl_data_sources ds "
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
                                   description='API.INVALID_MICROGRID_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GENERATOR_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_generators "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GENERATOR_NOT_FOUND')

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
                 " FROM tbl_microgrids_generators_points "
                 " WHERE generator_id = %s AND point_id = %s")
        cursor.execute(query, (gid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.GENERATOR_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_microgrids_generators_points (generator_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (gid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/generators/' + str(gid) + '/points/' + \
                        str(new_values['data']['point_id'])


class MicrogridGeneratorPointItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, gid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = gid
        _ = pid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, gid, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GENERATOR_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_generators "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GENERATOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_generators_points "
                       " WHERE generator_id = %s AND point_id = %s ", (gid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GENERATOR_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_generators_points "
                       " WHERE generator_id = %s AND point_id = %s ", (gid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

class MicrogridGridPointCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, gid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = gid

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
                                   description='API.INVALID_MICROGRID_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_grids "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GRID_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_microgrids_grids_points mp, tbl_data_sources ds "
                 " WHERE mp.grid_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
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
                                   description='API.INVALID_MICROGRID_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GRID_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_grids "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GRID_NOT_FOUND')

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
                 " FROM tbl_microgrids_grids_points "
                 " WHERE grid_id = %s AND point_id = %s")
        cursor.execute(query, (gid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.GRID_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_microgrids_grids_points (grid_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (gid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/grids/' + str(gid) + '/points/' + \
                        str(new_values['data']['point_id'])


class MicrogridGridPointItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, gid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = gid
        _ = pid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, gid, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GRID_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_grids "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_GRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_grids_points "
                       " WHERE grid_id = %s AND point_id = %s ", (gid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GRID_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_grids_points "
                       " WHERE grid_id = %s AND point_id = %s ", (gid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

class MicrogridHeatPumpPointCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, hid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = hid

    @staticmethod
    def on_get(req, resp, id_, hid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HEATPUMP_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_heatpumps "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, hid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_HEATPUMP_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_microgrids_heatpumps_points mp, tbl_data_sources ds "
                 " WHERE mp.heatpump_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (hid,))
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
    def on_post(req, resp, id_, hid):
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
                                   description='API.INVALID_MICROGRID_ID')
        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HEATPUMP_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_heatpumps "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, hid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_HEATPUMP_NOT_FOUND')

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
                 " FROM tbl_microgrids_heatpumps_points "
                 " WHERE heatpump_id = %s AND point_id = %s")
        cursor.execute(query, (hid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.HEATPUMP_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_microgrids_heatpumps_points (heatpump_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (hid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/heatpumps/' + str(hid) + '/points/' + \
                        str(new_values['data']['point_id'])


class MicrogridHeatPumpPointItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, hid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = hid
        _ = pid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, hid, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HEATPUMP_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_heatpumps "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, hid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_HEATPUMP_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_heatpumps_points "
                       " WHERE heatpump_id = %s AND point_id = %s ", (hid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HEATPUMP_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_heatpumps_points "
                       " WHERE heatpump_id = %s AND point_id = %s ", (hid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

class MicrogridLoadPointCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, lid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = lid

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
                                   description='API.INVALID_MICROGRID_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOAD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_loads "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_LOAD_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_microgrids_loads_points mp, tbl_data_sources ds "
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
                                   description='API.INVALID_MICROGRID_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOAD_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_loads "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_LOAD_NOT_FOUND')

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
                 " FROM tbl_microgrids_loads_points "
                 " WHERE load_id = %s AND point_id = %s")
        cursor.execute(query, (lid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.LOAD_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_microgrids_loads_points (load_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (lid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/loads/' + str(lid) + '/points/' + \
                        str(new_values['data']['point_id'])


class MicrogridLoadPointItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, lid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = lid
        _ = pid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, lid, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOAD_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_loads "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_LOAD_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_loads_points "
                       " WHERE load_id = %s AND point_id = %s ", (lid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.LOAD_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_loads_points "
                       " WHERE load_id = %s AND point_id = %s ", (lid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

class MicrogridPhotovoltaicPointCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, pvid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = pvid

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
                                   description='API.INVALID_MICROGRID_ID')
        if not pvid.isdigit() or int(pvid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_photovoltaics "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, pvid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_PHOTOVOLTAIC_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_microgrids_pvs_points mp, tbl_data_sources ds "
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
                                   description='API.INVALID_MICROGRID_ID')
        if not pvid.isdigit() or int(pvid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_photovoltaics "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, pvid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_PHOTOVOLTAIC_NOT_FOUND')

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
                 " FROM tbl_microgrids_pvs_points "
                 " WHERE pv_id = %s AND point_id = %s")
        cursor.execute(query, (pvid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.PHOTOVOLTAIC_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_microgrids_pvs_points (pv_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (pvid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/photovoltaics/' + str(pvid) + '/points/' + \
                        str(new_values['data']['point_id'])


class MicrogridPhotovoltaicPointItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, pvid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = pvid
        _ = pid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pvid, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not pvid.isdigit() or int(pvid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_photovoltaics "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, pvid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_PHOTOVOLTAIC_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_pvs_points "
                       " WHERE pv_id = %s AND point_id = %s ", (pvid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_pvs_points "
                       " WHERE pv_id = %s AND point_id = %s ", (pvid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

class MicrogridPowerConversionSystemPointCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, pcsid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = pcsid

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
                                   description='API.INVALID_MICROGRID_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_CONVERSION_SYSTEM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_power_conversion_systems "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, pcsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_microgrids_pcses_points mp, tbl_data_sources ds "
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
                                   description='API.INVALID_MICROGRID_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_CONVERSION_SYSTEM_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_power_conversion_systems "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, pcsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NOT_FOUND')

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
                 " FROM tbl_microgrids_pcses_points "
                 " WHERE pcs_id = %s AND point_id = %s")
        cursor.execute(query, (pcsid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.POWER_CONVERSION_SYSTEM_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_microgrids_pcses_points (pcs_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (pcsid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgrids/' + str(id_) + '/powerconversionsystems/' + str(pcsid) + '/points/' + \
                        str(new_values['data']['point_id'])


class MicrogridPowerConversionSystemPointItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, pcsid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_
        _ = pcsid
        _ = pid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pcsid, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_CONVERSION_SYSTEM_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_power_conversion_systems "
                       " WHERE microgrid_id = %s AND id = %s ", (id_, pcsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids_pcses_points "
                       " WHERE pcs_id = %s AND point_id = %s ", (pcsid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POWER_CONVERSION_SYSTEM_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_pcses_points "
                       " WHERE pcs_id = %s AND point_id = %s ", (pcsid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204
