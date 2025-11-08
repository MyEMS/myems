import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class CombinedEquipmentCollection:
    """
    Combined Equipment Collection Resource

    This class handles CRUD operations for combined equipment collection.
    It provides endpoints for listing all combined equipments and creating new ones.
    Combined equipments represent groups of related equipment that work together
    in the energy management system, such as HVAC systems, lighting groups, etc.
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
        Handle GET requests to retrieve all combined equipments

        Returns a list of all combined equipments with their metadata including:
        - Equipment ID, name, and UUID
        - Input/output counting status
        - Cost center information
        - SVG diagram reference
        - Camera URL for monitoring
        - Description and QR code

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        # Check authentication method (API key or session)
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        search_query = req.get_param('q', default=None)
        if search_query is not None:
            search_query = search_query.strip()
        else:
            search_query = ''

        # Connect to database and retrieve cost centers
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Query to retrieve all cost centers for reference
        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        # Build cost center dictionary for quick lookup
        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        # Query to retrieve all SVG diagrams for reference
        query = (" SELECT id, name, uuid "
                 " FROM tbl_svgs ")
        cursor.execute(query)
        rows_svgs = cursor.fetchall()

        # Build SVG dictionary for quick lookup
        svg_dict = dict()
        if rows_svgs is not None and len(rows_svgs) > 0:
            for row in rows_svgs:
                svg_dict[row[0]] = {"id": row[0],
                                    "name": row[1],
                                    "uuid": row[2]}

        # Query to retrieve all combined equipments
        query = (" SELECT id, name, uuid, "
                 "        is_input_counted, is_output_counted, "
                 "        cost_center_id, svg_id, camera_url, description "
                 " FROM tbl_combined_equipments ")
        params = []
        if search_query:
            query += " WHERE name LIKE %s OR   description LIKE %s "
            params = [f'%{search_query}%', f'%{search_query}%']
        query += " ORDER BY id "
        cursor.execute(query, params)
        rows_combined_equipments = cursor.fetchall()

        # Build result list with all combined equipment data
        result = list()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            for row in rows_combined_equipments:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "is_input_counted": bool(row[3]),
                               "is_output_counted": bool(row[4]),
                               "cost_center": cost_center_dict.get(row[5], None),
                               "svg": svg_dict.get(row[6], None),
                               "camera_url": row[7],
                               "description": row[8],
                               "qrcode": 'combinedequipment:' + row[2]}
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
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_NAME')
        name = str.strip(new_values['data']['name'])

        if 'is_input_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['data']['is_input_counted']

        if 'is_output_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_output_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_OUTPUT_COUNTED_VALUE')
        is_output_counted = new_values['data']['is_output_counted']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')
        cost_center_id = new_values['data']['cost_center_id']

        if 'svg_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg_id'], int) and \
                new_values['data']['svg_id'] > 0:
            svg_id = new_values['data']['svg_id']
        else:
            svg_id = None

        if 'camera_url' in new_values['data'].keys() and \
                new_values['data']['camera_url'] is not None and \
                len(str(new_values['data']['camera_url'])) > 0:
            camera_url = str.strip(new_values['data']['camera_url'])
        else:
            camera_url = None

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.COMBINED_EQUIPMENT_NAME_IS_ALREADY_IN_USE')

        if cost_center_id is not None:
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

        if svg_id is not None:
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

        add_values = (" INSERT INTO tbl_combined_equipments "
                      "    (name, uuid, is_input_counted, is_output_counted, "
                      "     cost_center_id, svg_id, camera_url, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    is_input_counted,
                                    is_output_counted,
                                    cost_center_id,
                                    svg_id,
                                    camera_url,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/combinedequipments/' + str(new_id)


class CombinedEquipmentItem:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

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
                 "        is_input_counted, is_output_counted, "
                 "        cost_center_id, svg_id, camera_url, description "
                 " FROM tbl_combined_equipments "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "is_input_counted": bool(row[3]),
                           "is_output_counted": bool(row[4]),
                           "cost_center": cost_center_dict.get(row[5], None),
                           "svg": svg_dict.get(row[6], None),
                           "camera_url": row[7],
                           "description": row[8],
                           "qrcode": 'combinedequipment:' + row[2]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # check relation with space
        cursor.execute(" SELECT space_id "
                       " FROM tbl_spaces_combined_equipments "
                       " WHERE combined_equipment_id = %s ",
                       (id_,))
        rows_combined_equipments = cursor.fetchall()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # delete relation with commands
        cursor.execute(" DELETE FROM tbl_combined_equipments_commands WHERE combined_equipment_id = %s ", (id_,))

        # delete relation with equipments
        cursor.execute(" DELETE FROM tbl_combined_equipments_equipments WHERE combined_equipment_id = %s ", (id_,))

        # delete relation with meters
        cursor.execute(" DELETE FROM tbl_combined_equipments_meters WHERE combined_equipment_id = %s ", (id_,))

        # delete relation with offline meters
        cursor.execute(" DELETE FROM tbl_combined_equipments_offline_meters WHERE combined_equipment_id = %s ", (id_,))

        # delete all associated parameters
        cursor.execute(" DELETE FROM tbl_combined_equipments_parameters WHERE combined_equipment_id = %s ", (id_,))

        # delete relation with virtual meter
        cursor.execute(" DELETE FROM tbl_combined_equipments_virtual_meters WHERE combined_equipment_id = %s ", (id_,))
        cnx.commit()

        cursor.execute(" DELETE FROM tbl_combined_equipments WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_NAME')
        name = str.strip(new_values['data']['name'])

        if 'is_input_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['data']['is_input_counted']

        if 'is_output_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_output_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_OUTPUT_COUNTED_VALUE')
        is_output_counted = new_values['data']['is_output_counted']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')
        cost_center_id = new_values['data']['cost_center_id']

        if 'svg_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg_id'], int) and \
                new_values['data']['svg_id'] > 0:
            svg_id = new_values['data']['svg_id']
        else:
            svg_id = None

        if 'camera_url' in new_values['data'].keys() and \
                new_values['data']['camera_url'] is not None and \
                len(str(new_values['data']['camera_url'])) > 0:
            camera_url = str.strip(new_values['data']['camera_url'])
        else:
            camera_url = None

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.COMBINED_EQUIPMENT_NAME_IS_ALREADY_IN_USE')

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

        if svg_id is not None:
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

        update_row = (" UPDATE tbl_combined_equipments "
                      " SET name = %s, is_input_counted = %s, is_output_counted = %s, "
                      "     cost_center_id = %s, svg_id = %s, camera_url = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    is_input_counted,
                                    is_output_counted,
                                    cost_center_id,
                                    svg_id,
                                    camera_url,
                                    description,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200

    # Clone a Combined Equipment
    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        query = (" SELECT name, is_input_counted, is_output_counted, "
                 "        cost_center_id, svg_id, camera_url, description "
                 " FROM tbl_combined_equipments "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')
        else:
            add_values = (" INSERT INTO tbl_combined_equipments "
                          "    (name, uuid, is_input_counted, is_output_counted, "
                          "     cost_center_id, svg_id, camera_url, description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (row[0] + ' Copy',
                                        str(uuid.uuid4()),
                                        row[1],
                                        row[2],
                                        row[3],
                                        row[4],
                                        row[5],
                                        row[6]))
            new_id = cursor.lastrowid
            cnx.commit()

        # clone relation with meter
        cursor.execute(" SELECT meter_id, is_output "
                       " FROM tbl_combined_equipments_meters "
                       " WHERE combined_equipment_id = %s ",
                       (id_,))
        rows_meters = cursor.fetchall()
        if rows_meters is not None and len(rows_meters) > 0:
            add_values = (" INSERT INTO tbl_combined_equipments_meters (combined_equipment_id, meter_id, is_output) "
                          " VALUES  ")
            for row in rows_meters:
                add_values += " (" + str(new_id) + ","
                add_values += str(row[0]) + ","
                add_values += str(bool(row[1])) + "), "
            # trim ", " at the end of string and then execute
            cursor.execute(add_values[:-2])
            cnx.commit()

        # clone relation with offline meter
        cursor.execute(" SELECT offline_meter_id, is_output "
                       " FROM tbl_combined_equipments_offline_meters "
                       " WHERE combined_equipment_id = %s ",
                       (id_,))
        rows_offline_meters = cursor.fetchall()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            add_values = (" INSERT INTO tbl_combined_equipments_offline_meters "
                          " (combined_equipment_id, offline_meter_id, is_output) "
                          " VALUES  ")
            for row in rows_offline_meters:
                add_values += " (" + str(new_id) + ","
                add_values += "'" + str(row[0]) + "',"
                add_values += str(bool(row[1])) + "), "
            # trim ", " at the end of string and then execute
            cursor.execute(add_values[:-2])
            cnx.commit()

        # clone relation with virtual meter
        cursor.execute(" SELECT virtual_meter_id, is_output "
                       " FROM tbl_combined_equipments_virtual_meters "
                       " WHERE combined_equipment_id = %s ",
                       (id_,))
        rows_virtual_meters = cursor.fetchall()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            add_values = (" INSERT INTO tbl_combined_equipments_virtual_meters "
                          " (combined_equipment_id, virtual_meter_id, is_output) "
                          " VALUES  ")
            for row in rows_virtual_meters:
                add_values += " (" + str(new_id) + ","
                add_values += str(row[0]) + ","
                add_values += str(bool(row[1])) + "), "
            # trim ", " at the end of string and then execute
            cursor.execute(add_values[:-2])
            cnx.commit()

        # clone parameters
        cursor.execute(" SELECT name, parameter_type, constant, point_id, numerator_meter_uuid, denominator_meter_uuid "
                       " FROM tbl_combined_equipments_parameters "
                       " WHERE combined_equipment_id = %s ",
                       (id_,))
        rows_parameters = cursor.fetchall()
        if rows_parameters is not None and len(rows_parameters) > 0:
            add_values = (" INSERT INTO tbl_combined_equipments_parameters"
                          "     (combined_equipment_id, name, parameter_type, constant, point_id, "
                          "      numerator_meter_uuid, denominator_meter_uuid) "
                          " VALUES  ")
            for row in rows_parameters:
                add_values += " (" + str(new_id) + ","
                add_values += "'" + str(row[0]) + "',"
                add_values += "'" + str(row[1]) + "',"
                if row[2] is not None:
                    add_values += "'" + str(row[2]) + "',"
                else:
                    add_values += "null, "

                if row[3] is not None:
                    add_values += str(row[2]) + ","
                else:
                    add_values += "null, "

                if row[4] is not None:
                    add_values += "'" + row[4] + "',"
                else:
                    add_values += "null, "
                if row[5] is not None:
                    add_values += "'" + row[5] + "'), "
                else:
                    add_values += "null), "

            # trim ", " at the end of string and then execute
            cursor.execute(add_values[:-2])
            cnx.commit()

        cursor.close()
        cnx.close()
        resp.status = falcon.HTTP_201
        resp.location = '/combinedequipments/' + str(new_id)


class CombinedEquipmentEquipmentCollection:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        query = (" SELECT e.id, e.name, e.uuid "
                 " FROM tbl_combined_equipments c, tbl_combined_equipments_equipments ce, tbl_equipments e "
                 " WHERE ce.combined_equipment_id = c.id AND e.id = ce.equipment_id AND c.id = %s "
                 " ORDER BY e.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

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
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        new_values = json.loads(raw_json)

        if 'equipment_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['equipment_id'], int) or \
                new_values['data']['equipment_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUIPMENT_ID')
        equipment_id = new_values['data']['equipment_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_equipments "
                       " WHERE id = %s ", (equipment_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EQUIPMENT_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_combined_equipments_equipments "
                 " WHERE combined_equipment_id = %s AND equipment_id = %s")
        cursor.execute(query, (id_, equipment_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.COMBINED_EQUIPMENT_EQUIPMENT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_combined_equipments_equipments (combined_equipment_id, equipment_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, equipment_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/combinedequipments/' + str(id_) + '/equipments/' + str(equipment_id)


class CombinedEquipmentEquipmentItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, eid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, eid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_equipments "
                       " WHERE id = %s ", (eid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_combined_equipments_equipments "
                       " WHERE combined_equipment_id = %s AND equipment_id = %s ", (id_, eid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_EQUIPMENT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_combined_equipments_equipments "
                       " WHERE combined_equipment_id = %s AND equipment_id = %s ", (id_, eid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class CombinedEquipmentParameterCollection:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[2]] = {"type": 'meter',
                                      "id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, parameter_type, "
                 "        constant, point_id, numerator_meter_uuid, denominator_meter_uuid "
                 " FROM tbl_combined_equipments_parameters "
                 " WHERE combined_equipment_id = %s "
                 " ORDER BY id ")
        cursor.execute(query, (id_,))
        rows_parameters = cursor.fetchall()

        result = list()
        if rows_parameters is not None and len(rows_parameters) > 0:
            for row in rows_parameters:
                constant = None
                point = None
                numerator_meter = None
                denominator_meter = None
                if row[2] == 'point':
                    point = point_dict.get(row[4], None)
                    constant = None
                    numerator_meter = None
                    denominator_meter = None
                elif row[2] == 'constant':
                    constant = row[3]
                    point = None
                    numerator_meter = None
                    denominator_meter = None
                elif row[2] == 'fraction':
                    constant = None
                    point = None
                    # find numerator meter by uuid
                    numerator_meter = meter_dict.get(row[5], None)
                    if numerator_meter is None:
                        numerator_meter = virtual_meter_dict.get(row[5], None)
                    if numerator_meter is None:
                        numerator_meter = offline_meter_dict.get(row[5], None)
                    # find denominator meter by uuid
                    denominator_meter = meter_dict.get(row[6], None)
                    if denominator_meter is None:
                        denominator_meter = virtual_meter_dict.get(row[6], None)
                    if denominator_meter is None:
                        denominator_meter = offline_meter_dict.get(row[6], None)

                meta_result = {"id": row[0],
                               "name": row[1],
                               "parameter_type": row[2],
                               "constant": constant,
                               "point": point,
                               "numerator_meter": numerator_meter,
                               "denominator_meter": denominator_meter}
                result.append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_PARAMETER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'parameter_type' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['parameter_type'], str) or \
                len(str.strip(new_values['data']['parameter_type'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_PARAMETER_TYPE')

        parameter_type = str.strip(new_values['data']['parameter_type'])

        if parameter_type not in ('constant', 'point', 'fraction'):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_PARAMETER_TYPE')

        constant = None
        if 'constant' in new_values['data'].keys():
            if new_values['data']['constant'] is not None and \
                    isinstance(new_values['data']['constant'], str) and \
                    len(str.strip(new_values['data']['constant'])) > 0:
                constant = str.strip(new_values['data']['constant'])

        point_id = None
        if 'point_id' in new_values['data'].keys():
            if new_values['data']['point_id'] is not None and \
                    new_values['data']['point_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_POINT_ID')
            point_id = new_values['data']['point_id']

        numerator_meter_uuid = None
        if 'numerator_meter_uuid' in new_values['data'].keys():
            if new_values['data']['numerator_meter_uuid'] is not None and \
                    isinstance(new_values['data']['numerator_meter_uuid'], str) and \
                    len(str.strip(new_values['data']['numerator_meter_uuid'])) > 0:
                numerator_meter_uuid = str.strip(new_values['data']['numerator_meter_uuid'])

        denominator_meter_uuid = None
        if 'denominator_meter_uuid' in new_values['data'].keys():
            if new_values['data']['denominator_meter_uuid'] is not None and \
                    isinstance(new_values['data']['denominator_meter_uuid'], str) and \
                    len(str.strip(new_values['data']['denominator_meter_uuid'])) > 0:
                denominator_meter_uuid = str.strip(new_values['data']['denominator_meter_uuid'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments_parameters "
                       " WHERE name = %s AND combined_equipment_id = %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.COMBINED_EQUIPMENT_PARAMETER_NAME_IS_ALREADY_IN_USE')

        # validate by parameter type
        if parameter_type == 'point':
            if point_id is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_POINT_ID')

            query = (" SELECT id, name "
                     " FROM tbl_points "
                     " WHERE id = %s ")
            cursor.execute(query, (point_id,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.POINT_NOT_FOUND')

        elif parameter_type == 'constant':
            if constant is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_CONSTANT_VALUE')

        elif parameter_type == 'fraction':

            query = (" SELECT id, name, uuid "
                     " FROM tbl_meters ")
            cursor.execute(query)
            rows_meters = cursor.fetchall()

            meter_dict = dict()
            if rows_meters is not None and len(rows_meters) > 0:
                for row in rows_meters:
                    meter_dict[row[2]] = {"type": 'meter',
                                          "id": row[0],
                                          "name": row[1],
                                          "uuid": row[2]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_offline_meters ")
            cursor.execute(query)
            rows_offline_meters = cursor.fetchall()

            offline_meter_dict = dict()
            if rows_offline_meters is not None and len(rows_offline_meters) > 0:
                for row in rows_offline_meters:
                    offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                                  "id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_virtual_meters ")
            cursor.execute(query)
            rows_virtual_meters = cursor.fetchall()

            virtual_meter_dict = dict()
            if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
                for row in rows_virtual_meters:
                    virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                                  "id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}

            # validate numerator meter uuid
            if meter_dict.get(numerator_meter_uuid) is None and \
                    virtual_meter_dict.get(numerator_meter_uuid) is None and \
                    offline_meter_dict.get(numerator_meter_uuid) is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_NUMERATOR_METER_UUID')

            # validate denominator meter uuid
            if denominator_meter_uuid == numerator_meter_uuid:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_DENOMINATOR_METER_UUID')

            if denominator_meter_uuid not in meter_dict and \
                    denominator_meter_uuid not in virtual_meter_dict and \
                    denominator_meter_uuid not in offline_meter_dict:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_DENOMINATOR_METER_UUID')

        add_values = (" INSERT INTO tbl_combined_equipments_parameters "
                      "    (combined_equipment_id, name, parameter_type, constant, "
                      "     point_id, numerator_meter_uuid, denominator_meter_uuid) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (id_,
                                    name,
                                    parameter_type,
                                    constant,
                                    point_id,
                                    numerator_meter_uuid,
                                    denominator_meter_uuid))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/combinedequipments/' + str(id_) + 'parameters/' + str(new_id)


class CombinedEquipmentParameterItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, pid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_PARAMETER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[2]] = {"type": 'meter',
                                      "id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, parameter_type, "
                 "        constant, point_id, numerator_meter_uuid, denominator_meter_uuid "
                 " FROM tbl_combined_equipments_parameters "
                 " WHERE combined_equipment_id = %s AND id = %s ")
        cursor.execute(query, (id_, pid))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_PARAMETER_NOT_FOUND_OR_NOT_MATCH')
        else:
            constant = None
            point = None
            numerator_meter = None
            denominator_meter = None
            if row[2] == 'point':
                point = point_dict.get(row[4], None)
                constant = None
                numerator_meter = None
                denominator_meter = None
            elif row[2] == 'constant':
                constant = row[3]
                point = None
                numerator_meter = None
                denominator_meter = None
            elif row[2] == 'fraction':
                constant = None
                point = None
                # find numerator meter by uuid
                numerator_meter = meter_dict.get(row[5], None)
                if numerator_meter is None:
                    numerator_meter = virtual_meter_dict.get(row[5], None)
                if numerator_meter is None:
                    numerator_meter = offline_meter_dict.get(row[5], None)
                # find denominator meter by uuid
                denominator_meter = meter_dict.get(row[6], None)
                if denominator_meter is None:
                    denominator_meter = virtual_meter_dict.get(row[6], None)
                if denominator_meter is None:
                    denominator_meter = offline_meter_dict.get(row[6], None)

            meta_result = {"id": row[0],
                           "name": row[1],
                           "parameter_type": row[2],
                           "constant": constant,
                           "point": point,
                           "numerator_meter": numerator_meter,
                           "denominator_meter": denominator_meter}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_PARAMETER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ",
                       (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments_parameters "
                       " WHERE combined_equipment_id = %s AND id = %s ",
                       (id_, pid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_PARAMETER_NOT_FOUND_OR_NOT_MATCH')

        cursor.execute(" DELETE FROM tbl_combined_equipments_parameters "
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
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_PARAMETER_ID')

        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_PARAMETER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'parameter_type' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['parameter_type'], str) or \
                len(str.strip(new_values['data']['parameter_type'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_PARAMETER_TYPE')

        parameter_type = str.strip(new_values['data']['parameter_type'])

        if parameter_type not in ('constant', 'point', 'fraction'):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_PARAMETER_TYPE')

        constant = None
        if 'constant' in new_values['data'].keys():
            if new_values['data']['constant'] is not None and \
                    isinstance(new_values['data']['constant'], str) and \
                    len(str.strip(new_values['data']['constant'])) > 0:
                constant = str.strip(new_values['data']['constant'])

        point_id = None
        if 'point_id' in new_values['data'].keys():
            if new_values['data']['point_id'] is not None and \
                    new_values['data']['point_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_POINT_ID')
            point_id = new_values['data']['point_id']

        numerator_meter_uuid = None
        if 'numerator_meter_uuid' in new_values['data'].keys():
            if new_values['data']['numerator_meter_uuid'] is not None and \
                    isinstance(new_values['data']['numerator_meter_uuid'], str) and \
                    len(str.strip(new_values['data']['numerator_meter_uuid'])) > 0:
                numerator_meter_uuid = str.strip(new_values['data']['numerator_meter_uuid'])

        denominator_meter_uuid = None
        if 'denominator_meter_uuid' in new_values['data'].keys():
            if new_values['data']['denominator_meter_uuid'] is not None and \
                    isinstance(new_values['data']['denominator_meter_uuid'], str) and \
                    len(str.strip(new_values['data']['denominator_meter_uuid'])) > 0:
                denominator_meter_uuid = str.strip(new_values['data']['denominator_meter_uuid'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments_parameters "
                       " WHERE combined_equipment_id = %s AND id = %s ",
                       (id_, pid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_PARAMETER_NOT_FOUND_OR_NOT_MATCH')

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments_parameters "
                       " WHERE name = %s AND combined_equipment_id = %s  AND id != %s ", (name, id_, pid))
        row = cursor.fetchone()
        if row is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.COMBINED_EQUIPMENT_PARAMETER_NAME_IS_ALREADY_IN_USE')

        # validate by parameter type
        if parameter_type == 'point':
            if point_id is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_POINT_ID')

            query = (" SELECT id, name "
                     " FROM tbl_points "
                     " WHERE id = %s ")
            cursor.execute(query, (point_id,))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.POINT_NOT_FOUND')

        elif parameter_type == 'constant':
            if constant is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_CONSTANT_VALUE')

        elif parameter_type == 'fraction':

            query = (" SELECT id, name, uuid "
                     " FROM tbl_meters ")
            cursor.execute(query)
            rows_meters = cursor.fetchall()

            meter_dict = dict()
            if rows_meters is not None and len(rows_meters) > 0:
                for row in rows_meters:
                    meter_dict[row[2]] = {"type": 'meter',
                                          "id": row[0],
                                          "name": row[1],
                                          "uuid": row[2]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_offline_meters ")
            cursor.execute(query)
            rows_offline_meters = cursor.fetchall()

            offline_meter_dict = dict()
            if rows_offline_meters is not None and len(rows_offline_meters) > 0:
                for row in rows_offline_meters:
                    offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                                  "id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_virtual_meters ")
            cursor.execute(query)
            rows_virtual_meters = cursor.fetchall()

            virtual_meter_dict = dict()
            if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
                for row in rows_virtual_meters:
                    virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                                  "id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}

            # validate numerator meter uuid
            if meter_dict.get(numerator_meter_uuid) is None and \
                    virtual_meter_dict.get(numerator_meter_uuid) is None and \
                    offline_meter_dict.get(numerator_meter_uuid) is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_NUMERATOR_METER_UUID')

            # validate denominator meter uuid
            if denominator_meter_uuid == numerator_meter_uuid:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_DENOMINATOR_METER_UUID')

            if denominator_meter_uuid not in meter_dict and \
                    denominator_meter_uuid not in virtual_meter_dict and \
                    denominator_meter_uuid not in offline_meter_dict:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_DENOMINATOR_METER_UUID')

        add_values = (" UPDATE tbl_combined_equipments_parameters "
                      " SET name = %s , parameter_type = %s, constant = %s, "
                      "     point_id = %s, numerator_meter_uuid = %s, denominator_meter_uuid = %s "
                      " WHERE id = %s ")
        cursor.execute(add_values, (name,
                                    parameter_type,
                                    constant,
                                    point_id,
                                    numerator_meter_uuid,
                                    denominator_meter_uuid,
                                    pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class CombinedEquipmentDataSourceCollection:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name FROM tbl_combined_equipments WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        query = (" SELECT ds.id, ds.name, ds.uuid "
                 " FROM tbl_combined_equipments ce, tbl_combined_equipments_data_sources ceds, tbl_data_sources ds "
                 " WHERE ceds.combined_equipment_id = ce.id AND ds.id = ceds.data_source_id AND ce.id = %s "
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        new_values = json.loads(raw_json)

        if 'data_source_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['data_source_id'], int) or \
                new_values['data']['data_source_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        data_source_id = new_values['data']['data_source_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name FROM tbl_combined_equipments WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name FROM tbl_data_sources WHERE id = %s ", (data_source_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_combined_equipments_data_sources "
                       " WHERE combined_equipment_id = %s AND data_source_id = %s", (id_, data_source_id))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.COMBINED_EQUIPMENT_DATA_SOURCE_RELATION_EXISTS')

        cursor.execute(" INSERT INTO tbl_combined_equipments_data_sources (combined_equipment_id, data_source_id) "
                       " VALUES (%s, %s) ", (id_, data_source_id))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/combinedequipments/' + str(id_) + '/datasources/' + str(data_source_id)


class CombinedEquipmentDataSourceItem:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if not dsid.isdigit() or int(dsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name FROM tbl_combined_equipments WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name FROM tbl_data_sources WHERE id = %s ", (dsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_combined_equipments_data_sources "
                       " WHERE combined_equipment_id = %s AND data_source_id = %s ", (id_, dsid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_DATA_SOURCE_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_combined_equipments_data_sources "
                       " WHERE combined_equipment_id = %s AND data_source_id = %s ", (id_, dsid))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class CombinedEquipmentDataSourcePointCollection:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name FROM tbl_combined_equipments WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        query = (" SELECT p.id, p.name "
                 " FROM tbl_points p, tbl_combined_equipments_data_sources ceds, tbl_data_sources ds "
                 " WHERE ceds.combined_equipment_id = %s "
                 "       AND ceds.data_source_id = ds.id "
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


class CombinedEquipmentMeterCollection:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

        query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id, em.is_output "
                 " FROM tbl_combined_equipments e, tbl_combined_equipments_meters em, tbl_meters m "
                 " WHERE em.combined_equipment_id = e.id AND m.id = em.meter_id AND e.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "energy_category": energy_category_dict.get(row[3], None),
                               "is_output": bool(row[4])}
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
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        new_values = json.loads(raw_json)

        if 'meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['meter_id'], int) or \
                new_values['data']['meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        meter_id = new_values['data']['meter_id']

        if 'is_output' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_output'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_OUTPUT_VALUE')
        is_output = new_values['data']['is_output']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_combined_equipments_meters "
                 " WHERE combined_equipment_id = %s AND meter_id = %s")
        cursor.execute(query, (id_, meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.COMBINED_EQUIPMENT_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_combined_equipments_meters (combined_equipment_id, meter_id, is_output ) "
                   " VALUES (%s, %s, %s) ")
        cursor.execute(add_row, (id_, meter_id, is_output))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/combinedequipments/' + str(id_) + '/meters/' + str(meter_id)


class CombinedEquipmentMeterItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_combined_equipments_meters "
                       " WHERE combined_equipment_id = %s AND meter_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_combined_equipments_meters "
                       " WHERE combined_equipment_id = %s AND meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class CombinedEquipmentOfflineMeterCollection:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

        query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id, em.is_output "
                 " FROM tbl_combined_equipments e, tbl_combined_equipments_offline_meters em, tbl_offline_meters m "
                 " WHERE em.combined_equipment_id = e.id AND m.id = em.offline_meter_id AND e.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "energy_category": energy_category_dict.get(row[3], None),
                               "is_output": bool(row[4])}
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
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        new_values = json.loads(raw_json)

        if 'offline_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['offline_meter_id'], int) or \
                new_values['data']['offline_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')
        offline_meter_id = new_values['data']['offline_meter_id']

        if 'is_output' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_output'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_OUTPUT_VALUE')
        is_output = new_values['data']['is_output']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (offline_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_combined_equipments_offline_meters "
                 " WHERE combined_equipment_id = %s AND offline_meter_id = %s")
        cursor.execute(query, (id_, offline_meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.COMBINED_EQUIPMENT_OFFLINE_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_combined_equipments_offline_meters "
                   " (combined_equipment_id, offline_meter_id, is_output ) "
                   " VALUES (%s, %s, %s) ")
        cursor.execute(add_row, (id_, offline_meter_id, is_output))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/combinedequipments/' + str(id_) + '/offlinemeters/' + str(offline_meter_id)


class CombinedEquipmentOfflineMeterItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_combined_equipments_offline_meters "
                       " WHERE combined_equipment_id = %s AND offline_meter_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_OFFLINE_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_combined_equipments_offline_meters "
                       " WHERE combined_equipment_id = %s AND offline_meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class CombinedEquipmentVirtualMeterCollection:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

        query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id, em.is_output "
                 " FROM tbl_combined_equipments e, tbl_combined_equipments_virtual_meters em, tbl_virtual_meters m "
                 " WHERE em.combined_equipment_id = e.id AND m.id = em.virtual_meter_id AND e.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "energy_category": energy_category_dict.get(row[3], None),
                               "is_output": bool(row[4])}
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
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        new_values = json.loads(raw_json)

        if 'virtual_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['virtual_meter_id'], int) or \
                new_values['data']['virtual_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')
        virtual_meter_id = new_values['data']['virtual_meter_id']

        if 'is_output' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_output'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_OUTPUT_VALUE')
        is_output = new_values['data']['is_output']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (virtual_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_combined_equipments_virtual_meters "
                 " WHERE combined_equipment_id = %s AND virtual_meter_id = %s")
        cursor.execute(query, (id_, virtual_meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.COMBINED_EQUIPMENT_VIRTUAL_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_combined_equipments_virtual_meters "
                   " (combined_equipment_id, virtual_meter_id, is_output ) "
                   " VALUES (%s, %s, %s) ")
        cursor.execute(add_row, (id_, virtual_meter_id, is_output))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/combinedequipments/' + str(id_) + '/virtualmeters/' + str(virtual_meter_id)


class CombinedEquipmentVirtualMeterItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_combined_equipments_virtual_meters "
                       " WHERE combined_equipment_id = %s AND virtual_meter_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_VIRTUAL_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_combined_equipments_virtual_meters "
                       " WHERE combined_equipment_id = %s AND virtual_meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class CombinedEquipmentCommandCollection:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        query = (" SELECT c.id, c.name, c.uuid "
                 " FROM tbl_combined_equipments ce, tbl_combined_equipments_commands cec, tbl_commands c "
                 " WHERE cec.combined_equipment_id = ce.id AND c.id = cec.command_id AND ce.id = %s "
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
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

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
                       " from tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (command_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_combined_equipments_commands "
                 " WHERE combined_equipment_id = %s AND command_id = %s")
        cursor.execute(query, (id_, command_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.COMBINED_EQUIPMENT_COMMAND_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_combined_equipments_commands (combined_equipment_id, command_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, command_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/combinedequipments/' + str(id_) + '/commands/' + str(command_id)


class CombinedEquipmentCommandItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, cid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, cid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if not cid.isdigit() or int(cid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (cid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_combined_equipments_commands "
                       " WHERE combined_equipment_id = %s AND command_id = %s ", (id_, cid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_COMMAND_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_combined_equipments_commands "
                       " WHERE combined_equipment_id = %s AND command_id = %s ", (id_, cid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class CombinedEquipmentExport:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

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
                 "        is_input_counted, is_output_counted, "
                 "        cost_center_id, svg_id, camera_url, description "
                 " FROM tbl_combined_equipments "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "is_input_counted": bool(row[3]),
                           "is_output_counted": bool(row[4]),
                           "cost_center": cost_center_dict.get(row[5], None),
                           "svg": svg_dict.get(row[6], None),
                           "camera_url": row[7],
                           "description": row[8],
                           "equipments": None,
                           "commands": None,
                           "meters": None,
                           "offline_meters": None,
                           "virtual_meters": None,
                           "parameters": None}
            query = (" SELECT e.id, e.name, e.uuid "
                     " FROM tbl_combined_equipments c, tbl_combined_equipments_equipments ce, tbl_equipments e "
                     " WHERE ce.combined_equipment_id = c.id AND e.id = ce.equipment_id AND c.id = %s "
                     " ORDER BY e.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            equipment_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    equipment_result.append(result)
                meta_result['equipments'] = equipment_result

            query = (" SELECT c.id, c.name, c.uuid "
                     " FROM tbl_combined_equipments ce, tbl_combined_equipments_commands cec, tbl_commands c "
                     " WHERE cec.combined_equipment_id = ce.id AND c.id = cec.command_id AND ce.id = %s "
                     " ORDER BY c.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            command_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    command_result.append(result)
                meta_result['commands'] = command_result

            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_categories ")
            cursor.execute(query)
            rows_energy_categories = cursor.fetchall()

            energy_category_dict = dict()
            if rows_energy_categories is not None and len(rows_energy_categories) > 0:
                for row in rows_energy_categories:
                    energy_category_dict[row[0]] = {"id": row[0],
                                                    "name": row[1],
                                                    "uuid": row[2]}

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id, em.is_output "
                     " FROM tbl_combined_equipments e, tbl_combined_equipments_meters em, tbl_meters m "
                     " WHERE em.combined_equipment_id = e.id AND m.id = em.meter_id AND e.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            meter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None),
                              "is_output": bool(row[4])}
                    meter_result.append(result)
                meta_result['meters'] = meter_result

            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_categories ")
            cursor.execute(query)
            rows_energy_categories = cursor.fetchall()

            energy_category_dict = dict()
            if rows_energy_categories is not None and len(rows_energy_categories) > 0:
                for row in rows_energy_categories:
                    energy_category_dict[row[0]] = {"id": row[0],
                                                    "name": row[1],
                                                    "uuid": row[2]}

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id, em.is_output "
                     " FROM tbl_combined_equipments e, tbl_combined_equipments_offline_meters em, tbl_offline_meters m "
                     " WHERE em.combined_equipment_id = e.id AND m.id = em.offline_meter_id AND e.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            offlinemeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None),
                              "is_output": bool(row[4])}
                    offlinemeter_result.append(result)
                meta_result['offline_meters'] = offlinemeter_result

            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_categories ")
            cursor.execute(query)
            rows_energy_categories = cursor.fetchall()

            energy_category_dict = dict()
            if rows_energy_categories is not None and len(rows_energy_categories) > 0:
                for row in rows_energy_categories:
                    energy_category_dict[row[0]] = {"id": row[0],
                                                    "name": row[1],
                                                    "uuid": row[2]}

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id, em.is_output "
                     " FROM tbl_combined_equipments e, tbl_combined_equipments_virtual_meters em, tbl_virtual_meters m "
                     " WHERE em.combined_equipment_id = e.id AND m.id = em.virtual_meter_id AND e.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            virtualmeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None),
                              "is_output": bool(row[4])}
                    virtualmeter_result.append(result)
                meta_result['virtual_meters'] = virtualmeter_result

            query = (" SELECT id, name "
                     " FROM tbl_points ")
            cursor.execute(query)
            rows_points = cursor.fetchall()

            point_dict = dict()
            if rows_points is not None and len(rows_points) > 0:
                for row in rows_points:
                    point_dict[row[0]] = {"id": row[0],
                                          "name": row[1]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_meters ")
            cursor.execute(query)
            rows_meters = cursor.fetchall()

            meter_dict = dict()
            if rows_meters is not None and len(rows_meters) > 0:
                for row in rows_meters:
                    meter_dict[row[2]] = {"type": 'meter',
                                          "id": row[0],
                                          "name": row[1],
                                          "uuid": row[2]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_offline_meters ")
            cursor.execute(query)
            rows_offline_meters = cursor.fetchall()

            offline_meter_dict = dict()
            if rows_offline_meters is not None and len(rows_offline_meters) > 0:
                for row in rows_offline_meters:
                    offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                                  "id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_virtual_meters ")
            cursor.execute(query)
            rows_virtual_meters = cursor.fetchall()

            virtual_meter_dict = dict()
            if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
                for row in rows_virtual_meters:
                    virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                                  "id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}

            query = (" SELECT id, name, parameter_type, "
                     "        constant, point_id, numerator_meter_uuid, denominator_meter_uuid "
                     " FROM tbl_combined_equipments_parameters "
                     " WHERE combined_equipment_id = %s "
                     " ORDER BY id ")
            cursor.execute(query, (id_,))
            rows_parameters = cursor.fetchall()

            parameter_result = list()
            if rows_parameters is not None and len(rows_parameters) > 0:
                for row in rows_parameters:
                    constant = None
                    point = None
                    numerator_meter = None
                    denominator_meter = None
                    if row[2] == 'point':
                        point = point_dict.get(row[4], None)
                        constant = None
                        numerator_meter = None
                        denominator_meter = None
                    elif row[2] == 'constant':
                        constant = row[3]
                        point = None
                        numerator_meter = None
                        denominator_meter = None
                    elif row[2] == 'fraction':
                        constant = None
                        point = None
                        # find numerator meter by uuid
                        numerator_meter = meter_dict.get(row[5], None)
                        if numerator_meter is None:
                            numerator_meter = virtual_meter_dict.get(row[5], None)
                        if numerator_meter is None:
                            numerator_meter = offline_meter_dict.get(row[5], None)
                        # find denominator meter by uuid
                        denominator_meter = meter_dict.get(row[6], None)
                        if denominator_meter is None:
                            denominator_meter = virtual_meter_dict.get(row[6], None)
                        if denominator_meter is None:
                            denominator_meter = offline_meter_dict.get(row[6], None)

                    result = {"id": row[0],
                              "name": row[1],
                              "parameter_type": row[2],
                              "constant": constant,
                              "point": point,
                              "numerator_meter": numerator_meter,
                              "denominator_meter": denominator_meter}
                    parameter_result.append(result)
                meta_result['parameters'] = parameter_result

        cursor.close()
        cnx.close()
        resp.text = json.dumps(meta_result)


class CombinedEquipmentImport:
    def __init__(self):
        """ Initializes CombinedEquipmentImport"""
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
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_NAME')
        name = str.strip(new_values['name'])

        if 'is_input_counted' not in new_values.keys() or \
                not isinstance(new_values['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['is_input_counted']

        if 'is_output_counted' not in new_values.keys() or \
                not isinstance(new_values['is_output_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_OUTPUT_COUNTED_VALUE')
        is_output_counted = new_values['is_output_counted']

        if 'id' not in new_values['cost_center'].keys() or \
                not isinstance(new_values['cost_center']['id'], int) or \
                new_values['cost_center']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')
        cost_center_id = new_values['cost_center']['id']

        if 'svg' in new_values.keys() and \
                'id' in new_values['svg'].keys() and \
                isinstance(new_values['svg']['id'], int) and \
                new_values['svg']['id'] > 0:
            svg_id = new_values['svg']['id']
        else:
            svg_id = None

        if 'camera_url' in new_values.keys() and \
                new_values['camera_url'] is not None and \
                len(str(new_values['camera_url'])) > 0:
            camera_url = str.strip(new_values['camera_url'])
        else:
            camera_url = None

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.COMBINED_EQUIPMENT_NAME_IS_ALREADY_IN_USE')

        if cost_center_id is not None:
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
        if svg_id is not None:
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

        add_values = (" INSERT INTO tbl_combined_equipments "
                      "    (name, uuid, is_input_counted, is_output_counted, "
                      "     cost_center_id, svg_id, camera_url, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    is_input_counted,
                                    is_output_counted,
                                    cost_center_id,
                                    svg_id,
                                    camera_url,
                                    description))
        new_id = cursor.lastrowid
        if new_values['equipments'] is not None and len(new_values['equipments']) > 0:
            for equipment in new_values['equipments']:
                cursor.execute(" SELECT name "
                               " FROM tbl_equipments "
                               " WHERE id = %s ", (equipment['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.EQUIPMENT_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_combined_equipments_equipments "
                         " WHERE combined_equipment_id = %s AND equipment_id = %s")
                cursor.execute(query, (new_id, equipment['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.COMBINED_EQUIPMENT_EQUIPMENT_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_combined_equipments_equipments (combined_equipment_id, equipment_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, equipment['id'],))
        if new_values['commands'] is not None and len(new_values['commands']) > 0:
            for command in new_values['commands']:
                cursor.execute(" SELECT name "
                               " FROM tbl_commands "
                               " WHERE id = %s ", (command['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.COMMAND_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_combined_equipments_commands "
                         " WHERE combined_equipment_id = %s AND command_id = %s")
                cursor.execute(query, (new_id, command['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.COMBINED_EQUIPMENT_COMMAND_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_combined_equipments_commands (combined_equipment_id, command_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, command['id'],))
        if new_values['meters'] is not None and len(new_values['meters']) > 0:
            for meter in new_values['meters']:
                cursor.execute(" SELECT name "
                               " FROM tbl_meters "
                               " WHERE id = %s ", (meter['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.METER_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_combined_equipments_meters "
                         " WHERE combined_equipment_id = %s AND meter_id = %s")
                cursor.execute(query, (new_id, meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.COMBINED_EQUIPMENT_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_combined_equipments_meters (combined_equipment_id, meter_id, is_output ) "
                           " VALUES (%s, %s, %s) ")
                cursor.execute(add_row, (new_id, meter['id'], meter['is_output']))
        if new_values['offline_meters'] is not None and len(new_values['offline_meters']) > 0:
            for offline_meter in new_values['offline_meters']:
                cursor.execute(" SELECT name "
                               " FROM tbl_offline_meters "
                               " WHERE id = %s ", (offline_meter['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.OFFLINE_METER_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_combined_equipments_offline_meters "
                         " WHERE combined_equipment_id = %s AND offline_meter_id = %s")
                cursor.execute(query, (new_id, offline_meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.COMBINED_EQUIPMENT_OFFLINE_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_combined_equipments_offline_meters "
                           " (combined_equipment_id, offline_meter_id, is_output ) "
                           " VALUES (%s, %s, %s) ")
                cursor.execute(add_row, (new_id, offline_meter['id'], offline_meter['is_output']))
        if new_values['virtual_meters'] is not None and len(new_values['virtual_meters']) > 0:
            for virtual_meter in new_values['virtual_meters']:
                cursor.execute(" SELECT name "
                               " FROM tbl_virtual_meters "
                               " WHERE id = %s ", (virtual_meter['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.VIRTUAL_METER_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_combined_equipments_virtual_meters "
                         " WHERE combined_equipment_id = %s AND virtual_meter_id = %s")
                cursor.execute(query, (new_id, virtual_meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.COMBINED_EQUIPMENT_VIRTUAL_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_combined_equipments_virtual_meters "
                           " (combined_equipment_id, virtual_meter_id, is_output ) "
                           " VALUES (%s, %s, %s) ")
                cursor.execute(add_row, (new_id, virtual_meter['id'], virtual_meter['is_output']))
        if new_values['parameters'] is not None and len(new_values['parameters']) > 0:
            for parameters in new_values['parameters']:
                cursor.execute(" SELECT name "
                               " FROM tbl_combined_equipments_parameters "
                               " WHERE name = %s AND combined_equipment_id = %s ", (parameters['name'], new_id))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.COMBINED_EQUIPMENT_PARAMETER_NAME_IS_ALREADY_IN_USE')
                if 'point' in parameters:
                    if parameters['point'] is None:
                        point_id = None
                    elif parameters['point']['id'] is not None and \
                            parameters['point']['id'] <= 0:
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_POINT_ID')
                    else:
                        point_id = parameters['point']['id']
                else:
                    point_id = None
                numerator_meter_uuid = None
                if 'numerator_meter' in parameters:
                    if parameters['numerator_meter'] is not None and \
                            isinstance(parameters['numerator_meter']['uuid'], str) and \
                            len(str.strip(parameters['numerator_meter']['uuid'])) > 0:
                        numerator_meter_uuid = str.strip(parameters['numerator_meter']['uuid'])

                denominator_meter_uuid = None
                if 'denominator_meter' in parameters:
                    if parameters['denominator_meter'] is not None and \
                            isinstance(parameters['denominator_meter']['uuid'], str) and \
                            len(str.strip(parameters['denominator_meter']['uuid'])) > 0:
                        denominator_meter_uuid = str.strip(parameters['denominator_meter']['uuid'])

                # validate by parameter type
                if parameters['parameter_type'] == 'point':
                    if point_id is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_POINT_ID')

                    query = (" SELECT id, name "
                             " FROM tbl_points "
                             " WHERE id = %s ")
                    cursor.execute(query, (point_id,))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.POINT_NOT_FOUND')

                elif parameters['parameter_type'] == 'constant':
                    if parameters['constant'] is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_CONSTANT_VALUE')

                elif parameters['parameter_type'] == 'fraction':

                    query = (" SELECT id, name, uuid "
                             " FROM tbl_meters ")
                    cursor.execute(query)
                    rows_meters = cursor.fetchall()

                    meter_dict = dict()
                    if rows_meters is not None and len(rows_meters) > 0:
                        for row in rows_meters:
                            meter_dict[row[2]] = {"type": 'meter',
                                                  "id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}

                    query = (" SELECT id, name, uuid "
                             " FROM tbl_offline_meters ")
                    cursor.execute(query)
                    rows_offline_meters = cursor.fetchall()

                    offline_meter_dict = dict()
                    if rows_offline_meters is not None and len(rows_offline_meters) > 0:
                        for row in rows_offline_meters:
                            offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                                          "id": row[0],
                                                          "name": row[1],
                                                          "uuid": row[2]}

                    query = (" SELECT id, name, uuid "
                             " FROM tbl_virtual_meters ")
                    cursor.execute(query)
                    rows_virtual_meters = cursor.fetchall()

                    virtual_meter_dict = dict()
                    if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
                        for row in rows_virtual_meters:
                            virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                                          "id": row[0],
                                                          "name": row[1],
                                                          "uuid": row[2]}

                    # validate numerator meter uuid
                    if meter_dict.get(numerator_meter_uuid) is None and \
                            virtual_meter_dict.get(numerator_meter_uuid) is None and \
                            offline_meter_dict.get(numerator_meter_uuid) is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_NUMERATOR_METER_UUID')

                    # validate denominator meter uuid
                    if denominator_meter_uuid is None:
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_DENOMINATOR_METER_UUID')

                    if denominator_meter_uuid == numerator_meter_uuid:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_DENOMINATOR_METER_UUID')

                    if denominator_meter_uuid not in meter_dict and \
                            denominator_meter_uuid not in virtual_meter_dict and \
                            denominator_meter_uuid not in offline_meter_dict:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_DENOMINATOR_METER_UUID')

                add_values = (" INSERT INTO tbl_combined_equipments_parameters "
                              "    (combined_equipment_id, name, parameter_type, constant, "
                              "     point_id, numerator_meter_uuid, denominator_meter_uuid) "
                              " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
                cursor.execute(add_values, (new_id,
                                            parameters['name'],
                                            parameters['parameter_type'],
                                            parameters['constant'],
                                            point_id,
                                            numerator_meter_uuid,
                                            denominator_meter_uuid))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/combinedequipments/' + str(new_id)


class CombinedEquipmentClone:
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
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

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
                 "        is_input_counted, is_output_counted, "
                 "        cost_center_id, svg_id, camera_url, description "
                 " FROM tbl_combined_equipments "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "is_input_counted": bool(row[3]),
                           "is_output_counted": bool(row[4]),
                           "cost_center": cost_center_dict.get(row[5], None),
                           "svg_id": row[6],
                           "camera_url": row[7],
                           "description": row[8],
                           "equipments": None,
                           "commands": None,
                           "meters": None,
                           "offline_meters": None,
                           "virtual_meters": None,
                           "parameters": None
                           }
            query = (" SELECT e.id, e.name, e.uuid "
                     " FROM tbl_combined_equipments c, tbl_combined_equipments_equipments ce, tbl_equipments e "
                     " WHERE ce.combined_equipment_id = c.id AND e.id = ce.equipment_id AND c.id = %s "
                     " ORDER BY e.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            equipment_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    equipment_result.append(result)
                meta_result['equipments'] = equipment_result

            query = (" SELECT c.id, c.name, c.uuid "
                     " FROM tbl_combined_equipments ce, tbl_combined_equipments_commands cec, tbl_commands c "
                     " WHERE cec.combined_equipment_id = ce.id AND c.id = cec.command_id AND ce.id = %s "
                     " ORDER BY c.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            command_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    command_result.append(result)
                meta_result['commands'] = command_result

            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_categories ")
            cursor.execute(query)
            rows_energy_categories = cursor.fetchall()

            energy_category_dict = dict()
            if rows_energy_categories is not None and len(rows_energy_categories) > 0:
                for row in rows_energy_categories:
                    energy_category_dict[row[0]] = {"id": row[0],
                                                    "name": row[1],
                                                    "uuid": row[2]}

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id, em.is_output "
                     " FROM tbl_combined_equipments e, tbl_combined_equipments_meters em, tbl_meters m "
                     " WHERE em.combined_equipment_id = e.id AND m.id = em.meter_id AND e.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            meter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None),
                              "is_output": bool(row[4])}
                    meter_result.append(result)
                meta_result['meters'] = meter_result

            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_categories ")
            cursor.execute(query)
            rows_energy_categories = cursor.fetchall()

            energy_category_dict = dict()
            if rows_energy_categories is not None and len(rows_energy_categories) > 0:
                for row in rows_energy_categories:
                    energy_category_dict[row[0]] = {"id": row[0],
                                                    "name": row[1],
                                                    "uuid": row[2]}

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id, em.is_output "
                     " FROM tbl_combined_equipments e, tbl_combined_equipments_offline_meters em, tbl_offline_meters m "
                     " WHERE em.combined_equipment_id = e.id AND m.id = em.offline_meter_id AND e.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            offlinemeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None),
                              "is_output": bool(row[4])}
                    offlinemeter_result.append(result)
                meta_result['offline_meters'] = offlinemeter_result

            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_categories ")
            cursor.execute(query)
            rows_energy_categories = cursor.fetchall()

            energy_category_dict = dict()
            if rows_energy_categories is not None and len(rows_energy_categories) > 0:
                for row in rows_energy_categories:
                    energy_category_dict[row[0]] = {"id": row[0],
                                                    "name": row[1],
                                                    "uuid": row[2]}

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id, em.is_output "
                     " FROM tbl_combined_equipments e, tbl_combined_equipments_virtual_meters em, tbl_virtual_meters m "
                     " WHERE em.combined_equipment_id = e.id AND m.id = em.virtual_meter_id AND e.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            virtualmeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None),
                              "is_output": bool(row[4])}
                    virtualmeter_result.append(result)
                meta_result['virtual_meters'] = virtualmeter_result

            query = (" SELECT id, name "
                     " FROM tbl_points ")
            cursor.execute(query)
            rows_points = cursor.fetchall()

            point_dict = dict()
            if rows_points is not None and len(rows_points) > 0:
                for row in rows_points:
                    point_dict[row[0]] = {"id": row[0],
                                          "name": row[1]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_meters ")
            cursor.execute(query)
            rows_meters = cursor.fetchall()

            meter_dict = dict()
            if rows_meters is not None and len(rows_meters) > 0:
                for row in rows_meters:
                    meter_dict[row[2]] = {"type": 'meter',
                                          "id": row[0],
                                          "name": row[1],
                                          "uuid": row[2]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_offline_meters ")
            cursor.execute(query)
            rows_offline_meters = cursor.fetchall()

            offline_meter_dict = dict()
            if rows_offline_meters is not None and len(rows_offline_meters) > 0:
                for row in rows_offline_meters:
                    offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                                  "id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_virtual_meters ")
            cursor.execute(query)
            rows_virtual_meters = cursor.fetchall()

            virtual_meter_dict = dict()
            if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
                for row in rows_virtual_meters:
                    virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                                  "id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}

            query = (" SELECT id, name, parameter_type, "
                     "        constant, point_id, numerator_meter_uuid, denominator_meter_uuid "
                     " FROM tbl_combined_equipments_parameters "
                     " WHERE combined_equipment_id = %s "
                     " ORDER BY id ")
            cursor.execute(query, (id_,))
            rows_parameters = cursor.fetchall()

            parameter_result = list()
            if rows_parameters is not None and len(rows_parameters) > 0:
                for row in rows_parameters:
                    constant = None
                    point = None
                    numerator_meter = None
                    denominator_meter = None
                    if row[2] == 'point':
                        point = point_dict.get(row[4], None)
                        constant = None
                        numerator_meter = None
                        denominator_meter = None
                    elif row[2] == 'constant':
                        constant = row[3]
                        point = None
                        numerator_meter = None
                        denominator_meter = None
                    elif row[2] == 'fraction':
                        constant = None
                        point = None
                        # find numerator meter by uuid
                        numerator_meter = meter_dict.get(row[5], None)
                        if numerator_meter is None:
                            numerator_meter = virtual_meter_dict.get(row[5], None)
                        if numerator_meter is None:
                            numerator_meter = offline_meter_dict.get(row[5], None)
                        # find denominator meter by uuid
                        denominator_meter = meter_dict.get(row[6], None)
                        if denominator_meter is None:
                            denominator_meter = virtual_meter_dict.get(row[6], None)
                        if denominator_meter is None:
                            denominator_meter = offline_meter_dict.get(row[6], None)

                    result = {"id": row[0],
                              "name": row[1],
                              "parameter_type": row[2],
                              "constant": constant,
                              "point": point,
                              "numerator_meter": numerator_meter,
                              "denominator_meter": denominator_meter}
                    parameter_result.append(result)
                meta_result['parameters'] = parameter_result
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = (str.strip(meta_result['name']) +
                        (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
            add_values = (" INSERT INTO tbl_combined_equipments "
                          "    (name, uuid, is_input_counted, is_output_counted, "
                          "     cost_center_id, svg_id, camera_url, description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['is_input_counted'],
                                        meta_result['is_output_counted'],
                                        meta_result['cost_center']['id'],
                                        meta_result['svg_id'],
                                        meta_result['camera_url'],
                                        meta_result['description']))
            new_id = cursor.lastrowid
            if meta_result['equipments'] is not None and len(meta_result['equipments']) > 0:
                for equipment in meta_result['equipments']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_equipments "
                                   " WHERE id = %s ", (equipment['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.EQUIPMENT_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_combined_equipments_equipments "
                             " WHERE combined_equipment_id = %s AND equipment_id = %s")
                    cursor.execute(query, (new_id, equipment['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.COMBINED_EQUIPMENT_EQUIPMENT_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_combined_equipments_equipments (combined_equipment_id, equipment_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, equipment['id'],))
            if meta_result['commands'] is not None and len(meta_result['commands']) > 0:
                for command in meta_result['commands']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_commands "
                                   " WHERE id = %s ", (command['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.COMMAND_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_combined_equipments_commands "
                             " WHERE combined_equipment_id = %s AND command_id = %s")
                    cursor.execute(query, (new_id, command['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.COMBINED_EQUIPMENT_COMMAND_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_combined_equipments_commands (combined_equipment_id, command_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, command['id'],))
            if meta_result['meters'] is not None and len(meta_result['meters']) > 0:
                for meter in meta_result['meters']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_meters "
                                   " WHERE id = %s ", (meter['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.METER_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_combined_equipments_meters "
                             " WHERE combined_equipment_id = %s AND meter_id = %s")
                    cursor.execute(query, (new_id, meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.COMBINED_EQUIPMENT_METER_RELATION_EXISTS')

                    add_row = (
                        " INSERT INTO tbl_combined_equipments_meters (combined_equipment_id, meter_id, is_output ) "
                        " VALUES (%s, %s, %s) ")
                    cursor.execute(add_row, (new_id, meter['id'], meter['is_output']))
            if meta_result['offline_meters'] is not None and len(meta_result['offline_meters']) > 0:
                for offline_meter in meta_result['offline_meters']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_offline_meters "
                                   " WHERE id = %s ", (offline_meter['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.OFFLINE_METER_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_combined_equipments_offline_meters "
                             " WHERE combined_equipment_id = %s AND offline_meter_id = %s")
                    cursor.execute(query, (new_id, offline_meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.COMBINED_EQUIPMENT_OFFLINE_METER_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_combined_equipments_offline_meters "
                               " (combined_equipment_id, offline_meter_id, is_output ) "
                               " VALUES (%s, %s, %s) ")
                    cursor.execute(add_row, (new_id, offline_meter['id'], offline_meter['is_output']))
            if meta_result['virtual_meters'] is not None and len(meta_result['virtual_meters']) > 0:
                for virtual_meter in meta_result['virtual_meters']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_virtual_meters "
                                   " WHERE id = %s ", (virtual_meter['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.VIRTUAL_METER_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_combined_equipments_virtual_meters "
                             " WHERE combined_equipment_id = %s AND virtual_meter_id = %s")
                    cursor.execute(query, (new_id, virtual_meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.COMBINED_EQUIPMENT_VIRTUAL_METER_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_combined_equipments_virtual_meters "
                               " (combined_equipment_id, virtual_meter_id, is_output ) "
                               " VALUES (%s, %s, %s) ")
                    cursor.execute(add_row, (new_id, virtual_meter['id'], virtual_meter['is_output']))
            if meta_result['parameters'] is not None and len(meta_result['parameters']) > 0:
                for parameters in meta_result['parameters']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_combined_equipments_parameters "
                                   " WHERE name = %s AND combined_equipment_id = %s ", (parameters['name'], new_id))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.COMBINED_EQUIPMENT_PARAMETER_NAME_IS_ALREADY_IN_USE')
                    if 'point' in parameters:
                        if parameters['point'] is None:
                            point_id = None
                        elif parameters['point']['id'] is not None and \
                                parameters['point']['id'] <= 0:
                            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                                   description='API.INVALID_POINT_ID')
                        else:
                            point_id = parameters['point']['id']
                    else:
                        point_id = None
                    numerator_meter_uuid = None
                    if 'numerator_meter' in parameters:
                        if parameters['numerator_meter'] is not None and \
                                isinstance(parameters['numerator_meter']['uuid'], str) and \
                                len(str.strip(parameters['numerator_meter']['uuid'])) > 0:
                            numerator_meter_uuid = str.strip(parameters['numerator_meter']['uuid'])

                    denominator_meter_uuid = None
                    if 'denominator_meter' in parameters:
                        if parameters['denominator_meter'] is not None and \
                                isinstance(parameters['denominator_meter']['uuid'], str) and \
                                len(str.strip(parameters['denominator_meter']['uuid'])) > 0:
                            denominator_meter_uuid = str.strip(parameters['denominator_meter']['uuid'])

                    # validate by parameter type
                    if parameters['parameter_type'] == 'point':
                        if point_id is None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                                   description='API.INVALID_POINT_ID')

                        query = (" SELECT id, name "
                                 " FROM tbl_points "
                                 " WHERE id = %s ")
                        cursor.execute(query, (point_id,))
                        if cursor.fetchone() is None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                                   description='API.POINT_NOT_FOUND')

                    elif parameters['parameter_type'] == 'constant':
                        if parameters['constant'] is None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                                   description='API.INVALID_CONSTANT_VALUE')

                    elif parameters['parameter_type'] == 'fraction':

                        query = (" SELECT id, name, uuid "
                                 " FROM tbl_meters ")
                        cursor.execute(query)
                        rows_meters = cursor.fetchall()

                        meter_dict = dict()
                        if rows_meters is not None and len(rows_meters) > 0:
                            for row in rows_meters:
                                meter_dict[row[2]] = {"type": 'meter',
                                                      "id": row[0],
                                                      "name": row[1],
                                                      "uuid": row[2]}

                        query = (" SELECT id, name, uuid "
                                 " FROM tbl_offline_meters ")
                        cursor.execute(query)
                        rows_offline_meters = cursor.fetchall()

                        offline_meter_dict = dict()
                        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
                            for row in rows_offline_meters:
                                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                                              "id": row[0],
                                                              "name": row[1],
                                                              "uuid": row[2]}

                        query = (" SELECT id, name, uuid "
                                 " FROM tbl_virtual_meters ")
                        cursor.execute(query)
                        rows_virtual_meters = cursor.fetchall()

                        virtual_meter_dict = dict()
                        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
                            for row in rows_virtual_meters:
                                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                                              "id": row[0],
                                                              "name": row[1],
                                                              "uuid": row[2]}

                        # validate numerator meter uuid
                        if meter_dict.get(numerator_meter_uuid) is None and \
                                virtual_meter_dict.get(numerator_meter_uuid) is None and \
                                offline_meter_dict.get(numerator_meter_uuid) is None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                                   description='API.INVALID_NUMERATOR_METER_UUID')

                        # validate denominator meter uuid
                        if denominator_meter_uuid is None:
                            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                                   description='API.INVALID_DENOMINATOR_METER_UUID')

                        if denominator_meter_uuid == numerator_meter_uuid:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                                   description='API.INVALID_DENOMINATOR_METER_UUID')

                        if denominator_meter_uuid not in meter_dict and \
                                denominator_meter_uuid not in virtual_meter_dict and \
                                denominator_meter_uuid not in offline_meter_dict:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                                   description='API.INVALID_DENOMINATOR_METER_UUID')

                    add_values = (" INSERT INTO tbl_combined_equipments_parameters "
                                  "    (combined_equipment_id, name, parameter_type, constant, "
                                  "     point_id, numerator_meter_uuid, denominator_meter_uuid) "
                                  " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
                    cursor.execute(add_values, (new_id,
                                                parameters['name'],
                                                parameters['parameter_type'],
                                                parameters['constant'],
                                                point_id,
                                                numerator_meter_uuid,
                                                denominator_meter_uuid))
            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/combinedequipments/' + str(new_id)
