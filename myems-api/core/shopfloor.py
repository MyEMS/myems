import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class ShopfloorCollection:
    """
    Shopfloor Collection Resource

    This class handles CRUD operations for shopfloor collection.
    It provides endpoints for listing all shopfloors and creating new ones.
    Shopfloors represent manufacturing or production areas within facilities,
    containing equipment, sensors, meters, and other operational components
    for monitoring and managing industrial processes.
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
        resp.status = falcon.HTTP_200
        _ = req

    @staticmethod
    def on_get(req, resp):
        """
        Handle GET requests to retrieve all shopfloors

        Returns a list of all shopfloors with their complete information including:
        - Shopfloor ID, name, and UUID
        - Associated contact and cost center information
        - Shopfloor specifications and parameters
        - Related equipment, sensors, and meter associations
        - Working calendar and command configurations

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
                 "        area, is_input_counted, "
                 "        contact_id, cost_center_id, description "
                 " FROM tbl_shopfloors "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_shopfloors = cursor.fetchall()

        result = list()
        if rows_shopfloors is not None and len(rows_shopfloors) > 0:
            for row in rows_shopfloors:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "area": row[3],
                               "is_input_counted": bool(row[4]),
                               "contact": contact_dict.get(row[5], None),
                               "cost_center": cost_center_dict.get(row[6], None),
                               "description": row[7],
                               "qrcode": "shopfloor:" + row[2]}
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
                                   description='API.INVALID_SHOPFLOOR_NAME')
        name = str.strip(new_values['data']['name'])

        if 'area' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['area'], float) or
                     isinstance(new_values['data']['area'], int)) or \
                new_values['data']['area'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_AREA_VALUE')
        area = new_values['data']['area']

        if 'is_input_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['data']['is_input_counted']

        if 'contact_id' in new_values['data'].keys():
            if new_values['data']['contact_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_CONTACT_ID')
            contact_id = new_values['data']['contact_id']
        else:
            contact_id = None

        if 'cost_center_id' in new_values['data'].keys():
            if new_values['data']['cost_center_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_COST_CENTER_ID')
            cost_center_id = new_values['data']['cost_center_id']
        else:
            cost_center_id = None

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SHOPFLOOR_NAME_IS_ALREADY_IN_USE')

        if contact_id is not None:
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

        add_values = (" INSERT INTO tbl_shopfloors "
                      "    (name, uuid, area, is_input_counted, "
                      "     contact_id, cost_center_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    area,
                                    is_input_counted,
                                    contact_id,
                                    cost_center_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/shopfloors/' + str(new_id)


class ShopfloorItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200
        _ = req
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
                                   description='API.INVALID_SHOPFLOOR_ID')

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
                 "        area, is_input_counted, contact_id, cost_center_id, description "
                 " FROM tbl_shopfloors "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "area": row[3],
                           "is_input_counted": bool(row[4]),
                           "contact": contact_dict.get(row[5], None),
                           "cost_center": cost_center_dict.get(row[6], None),
                           "description": row[7],
                           "qrcode": "shopfloor:" + row[2]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        # check relation with spaces
        cursor.execute(" SELECT space_id "
                       " FROM tbl_spaces_shopfloors "
                       " WHERE shopfloor_id = %s ",
                       (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # delete relation with equipments
        cursor.execute(" DELETE FROM tbl_shopfloors_equipments WHERE shopfloor_id = %s ", (id_,))

        # delete relation with meters
        cursor.execute(" DELETE FROM tbl_shopfloors_meters WHERE shopfloor_id = %s ", (id_,))

        # delete relation with offline meters
        cursor.execute(" DELETE FROM tbl_shopfloors_offline_meters WHERE shopfloor_id = %s ", (id_,))

        # delete relation with points
        cursor.execute(" DELETE FROM tbl_shopfloors_points WHERE shopfloor_id = %s ", (id_,))

        # delete relation with sensor
        cursor.execute(" DELETE FROM tbl_shopfloors_sensors WHERE shopfloor_id = %s ", (id_,))

        # delete relation with virtual meter
        cursor.execute(" DELETE FROM tbl_shopfloors_virtual_meters WHERE shopfloor_id = %s ", (id_,))

        # delete relation with command
        cursor.execute(" DELETE FROM tbl_shopfloors_commands WHERE shopfloor_id = %s ", (id_,))

        # delete relation with working calendar
        cursor.execute(" DELETE FROM tbl_shopfloors_working_calendars WHERE shopfloor_id = %s ", (id_,))

        cursor.execute(" DELETE FROM tbl_shopfloors WHERE id = %s ", (id_,))
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
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_NAME')
        name = str.strip(new_values['data']['name'])

        if 'area' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['area'], float) or
                     isinstance(new_values['data']['area'], int)) or \
                new_values['data']['area'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_AREA_VALUE')
        area = new_values['data']['area']

        if 'is_input_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['data']['is_input_counted']

        if 'contact_id' in new_values['data'].keys():
            if new_values['data']['contact_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_CONTACT_ID')
            contact_id = new_values['data']['contact_id']
        else:
            contact_id = None

        if 'cost_center_id' in new_values['data'].keys():
            if new_values['data']['cost_center_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_COST_CENTER_ID')
            cost_center_id = new_values['data']['cost_center_id']
        else:
            cost_center_id = None

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SHOPFLOOR_NAME_IS_ALREADY_IN_USE')

        if contact_id is not None:
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

        update_row = (" UPDATE tbl_shopfloors "
                      " SET name = %s, area = %s, is_input_counted = %s, contact_id = %s, cost_center_id = %s, "
                      "     description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    area,
                                    is_input_counted,
                                    contact_id,
                                    cost_center_id,
                                    description,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class ShopfloorEquipmentCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200
        _ = req
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        query = (" SELECT e.id, e.name, e.uuid "
                 " FROM tbl_shopfloors s, tbl_shopfloors_equipments se, tbl_equipments e "
                 " WHERE se.shopfloor_id = s.id AND e.id = se.equipment_id AND s.id = %s "
                 " ORDER BY e.id ")
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
                                   description='API.INVALID_SHOPFLOOR_ID')

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
                       " from tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_equipments "
                       " WHERE id = %s ", (equipment_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EQUIPMENT_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_shopfloors_equipments "
                 " WHERE shopfloor_id = %s AND equipment_id = %s")
        cursor.execute(query, (id_, equipment_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SHOPFLOOR_EQUIPMENT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_shopfloors_equipments (shopfloor_id, equipment_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, equipment_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/shopfloors/' + str(id_) + '/equipments/' + str(equipment_id)


class ShopfloorEquipmentItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, eid):
        resp.status = falcon.HTTP_200
        _ = req
        _ = id_
        _ = eid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, eid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_equipments "
                       " WHERE id = %s ", (eid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_shopfloors_equipments "
                       " WHERE shopfloor_id = %s AND equipment_id = %s ", (id_, eid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_EQUIPMENT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_shopfloors_equipments "
                       " WHERE shopfloor_id = %s AND equipment_id = %s ", (id_, eid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class ShopfloorMeterCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200
        _ = req
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

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

        query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                 " FROM tbl_shopfloors s, tbl_shopfloors_meters sm, tbl_meters m "
                 " WHERE sm.shopfloor_id = s.id AND m.id = sm.meter_id AND s.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "energy_category": energy_category_dict.get(row[3], None)}
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        new_values = json.loads(raw_json)

        if 'meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['meter_id'], int) or \
                new_values['data']['meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        meter_id = new_values['data']['meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_shopfloors_meters "
                 " WHERE shopfloor_id = %s AND meter_id = %s")
        cursor.execute(query, (id_, meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SHOPFLOOR_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_shopfloors_meters (shopfloor_id, meter_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, meter_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/shopfloors/' + str(id_) + '/meters/' + str(meter_id)


class ShopfloorMeterItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        resp.status = falcon.HTTP_200
        _ = req
        _ = id_
        _ = mid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_shopfloors_meters "
                       " WHERE shopfloor_id = %s AND meter_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_shopfloors_meters WHERE shopfloor_id = %s AND meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class ShopfloorOfflineMeterCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200
        _ = req
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

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

        query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                 " FROM tbl_shopfloors s, tbl_shopfloors_offline_meters sm, tbl_offline_meters m "
                 " WHERE sm.shopfloor_id = s.id AND m.id = sm.offline_meter_id AND s.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "energy_category": energy_category_dict.get(row[3], None)}
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        new_values = json.loads(raw_json)

        if 'offline_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['offline_meter_id'], int) or \
                new_values['data']['offline_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')
        offline_meter_id = new_values['data']['offline_meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (offline_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_shopfloors_offline_meters "
                 " WHERE shopfloor_id = %s AND offline_meter_id = %s")
        cursor.execute(query, (id_, offline_meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SHOPFLOOR_OFFLINE_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_shopfloors_offline_meters (shopfloor_id, offline_meter_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, offline_meter_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/shopfloors/' + str(id_) + '/offlinemeters/' + str(offline_meter_id)


class ShopfloorOfflineMeterItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        resp.status = falcon.HTTP_200
        _ = req
        _ = id_
        _ = mid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_shopfloors_offline_meters "
                       " WHERE shopfloor_id = %s AND offline_meter_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_OFFLINE_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_shopfloors_offline_meters "
                       " WHERE shopfloor_id = %s AND offline_meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class ShopfloorPointCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200
        _ = req
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_data_sources ")
        cursor.execute(query)
        rows_data_sources = cursor.fetchall()

        data_source_dict = dict()
        if rows_data_sources is not None and len(rows_data_sources) > 0:
            for row in rows_data_sources:
                data_source_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT p.id, p.name, p.data_source_id "
                 " FROM tbl_shopfloors s, tbl_shopfloors_points sp, tbl_points p "
                 " WHERE sp.shopfloor_id = s.id AND p.id = sp.point_id AND s.id = %s "
                 " ORDER BY p.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "data_source": data_source_dict.get(row[2], None)}
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        new_values = json.loads(raw_json)

        if 'point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['point_id'], int) or \
                new_values['data']['point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')
        point_id = new_values['data']['point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_shopfloors_points "
                 " WHERE shopfloor_id = %s AND point_id = %s")
        cursor.execute(query, (id_, point_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SHOPFLOOR_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_shopfloors_points (shopfloor_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, point_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/shopfloors/' + str(id_) + '/points/' + str(point_id)


class ShopfloorPointItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, pid):
        resp.status = falcon.HTTP_200
        _ = req
        _ = id_
        _ = pid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_shopfloors_points "
                       " WHERE shopfloor_id = %s AND point_id = %s ", (id_, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_shopfloors_points "
                       " WHERE shopfloor_id = %s AND point_id = %s ", (id_, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class ShopfloorSensorCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200
        _ = req
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        query = (" SELECT se.id, se.name, se.uuid "
                 " FROM tbl_shopfloors sp, tbl_shopfloors_sensors ss, tbl_sensors se "
                 " WHERE ss.shopfloor_id = sp.id AND se.id = ss.sensor_id AND sp.id = %s "
                 " ORDER BY se.id ")
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
                                   description='API.INVALID_SHOPFLOOR_ID')

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
                       " from tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_sensors "
                       " WHERE id = %s ", (sensor_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SENSOR_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_shopfloors_sensors "
                 " WHERE shopfloor_id = %s AND sensor_id = %s")
        cursor.execute(query, (id_, sensor_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SHOPFLOOR_SENSOR_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_shopfloors_sensors (shopfloor_id, sensor_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, sensor_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/shopfloors/' + str(id_) + '/sensors/' + str(sensor_id)


class ShopfloorSensorItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, sid):
        resp.status = falcon.HTTP_200
        _ = req
        _ = id_
        _ = sid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, sid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SENSOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_sensors "
                       " WHERE id = %s ", (sid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SENSOR_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_shopfloors_sensors "
                       " WHERE shopfloor_id = %s AND sensor_id = %s ", (id_, sid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_SENSOR_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_shopfloors_sensors WHERE shopfloor_id = %s AND sensor_id = %s ", (id_, sid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class ShopfloorVirtualMeterCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200
        _ = req
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

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

        query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                 " FROM tbl_shopfloors s, tbl_shopfloors_virtual_meters sm, tbl_virtual_meters m "
                 " WHERE sm.shopfloor_id = s.id AND m.id = sm.virtual_meter_id AND s.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "energy_category": energy_category_dict.get(row[3], None)}
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        new_values = json.loads(raw_json)

        if 'virtual_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['virtual_meter_id'], int) or \
                new_values['data']['virtual_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')
        virtual_meter_id = new_values['data']['virtual_meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (virtual_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_shopfloors_virtual_meters "
                 " WHERE shopfloor_id = %s AND virtual_meter_id = %s")
        cursor.execute(query, (id_, virtual_meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SHOPFLOOR_VIRTUAL_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_shopfloors_virtual_meters (shopfloor_id, virtual_meter_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, virtual_meter_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/shopfloors/' + str(id_) + '/virtualmeters/' + str(virtual_meter_id)


class ShopfloorVirtualMeterItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        resp.status = falcon.HTTP_200
        _ = req
        _ = id_
        _ = mid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_shopfloors_virtual_meters "
                       " WHERE shopfloor_id = %s AND virtual_meter_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_VIRTUAL_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_shopfloors_virtual_meters "
                       " WHERE shopfloor_id = %s AND virtual_meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class ShopfloorWorkingCalendarCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200
        _ = req
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        query = (" SELECT wc.id, wc.name, wc.description "
                 " FROM tbl_shopfloors s, tbl_shopfloors_working_calendars swc, tbl_working_calendars wc "
                 " WHERE swc.shopfloor_id = s.id AND wc.id = swc.working_calendar_id AND s.id = %s "
                 " ORDER BY wc.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "description": row[2]}
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
                                   description='API.INVALID_SHOPFLOOR_ID')

        new_values = json.loads(raw_json)

        if 'working_calendar_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['working_calendar_id'], int) or \
                new_values['data']['working_calendar_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORKING_CALENDAR_ID')
        working_calendar_id = new_values['data']['working_calendar_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_working_calendars "
                       " WHERE id = %s ", (working_calendar_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WORKING_CALENDAR_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_shopfloors_working_calendars "
                 " WHERE shopfloor_id = %s AND working_calendar_id = %s")
        cursor.execute(query, (id_, working_calendar_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SHOPFLOOR_WORKING_CALENDAR_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_shopfloors_working_calendars (shopfloor_id, working_calendar_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, working_calendar_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/shopfloors/' + str(id_) + '/workingcalendars/' + str(working_calendar_id)


class ShopfloorWorkingCalendarItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, wcid):
        resp.status = falcon.HTTP_200
        _ = req
        _ = id_
        _ = wcid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, wcid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

        if not wcid.isdigit() or int(wcid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORKING_CALENDAR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_working_calendars "
                       " WHERE id = %s ", (wcid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WORKING_CALENDAR_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_shopfloors_working_calendars "
                       " WHERE shopfloor_id = %s AND working_calendar_id = %s ", (id_, wcid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_WORKING_CALENDAR_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_shopfloors_working_calendars "
                       " WHERE shopfloor_id = %s AND working_calendar_id = %s ", (id_, wcid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class ShopfloorCommandCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200
        _ = req
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
                                   description='API.INVALID_STORE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        query = (" SELECT c.id, c.name, c.uuid "
                 " FROM tbl_shopfloors s, tbl_shopfloors_commands sc, tbl_commands c "
                 " WHERE sc.shopfloor_id = s.id AND c.id = sc.command_id AND s.id = %s "
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
                                   description='API.INVALID_SHOPFLOOR_ID')

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
                       " from tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (command_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        query = (" SELECT id "
                 " FROM tbl_shopfloors_commands "
                 " WHERE shopfloor_id = %s AND command_id = %s")
        cursor.execute(query, (id_, command_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SHOPFLOOR_COMMAND_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_shopfloors_commands (shopfloor_id, command_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, command_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/shopfloors/' + str(id_) + '/commands/' + str(command_id)


class ShopfloorCommandItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, cid):
        resp.status = falcon.HTTP_200
        _ = req
        _ = id_
        _ = cid

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, cid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

        if not cid.isdigit() or int(cid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (cid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_shopfloors_commands "
                       " WHERE shopfloor_id = %s AND command_id = %s ", (id_, cid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_COMMAND_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_shopfloors_commands WHERE shopfloor_id = %s AND command_id = %s ", (id_, cid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class ShopfloorExport:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200
        _ = req
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
                                   description='API.INVALID_SHOPFLOOR_ID')

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
                 "        area, is_input_counted, contact_id, cost_center_id, description "
                 " FROM tbl_shopfloors "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "area": row[3],
                           "is_input_counted": bool(row[4]),
                           "contact": contact_dict.get(row[5], None),
                           "cost_center": cost_center_dict.get(row[6], None),
                           "description": row[7],
                           "equipments": None,
                           "commands": None,
                           "meters": None,
                           "offline_meters": None,
                           "virtual_meters": None,
                           "points": None,
                           "sensors": None,
                           "working_calendars": None
                           }
            query = (" SELECT e.id, e.name, e.uuid "
                     " FROM tbl_shopfloors s, tbl_shopfloors_equipments se, tbl_equipments e "
                     " WHERE se.shopfloor_id = s.id AND e.id = se.equipment_id AND s.id = %s "
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
                     " FROM tbl_shopfloors s, tbl_shopfloors_commands sc, tbl_commands c "
                     " WHERE sc.shopfloor_id = s.id AND c.id = sc.command_id AND s.id = %s "
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

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                     " FROM tbl_shopfloors s, tbl_shopfloors_meters sm, tbl_meters m "
                     " WHERE sm.shopfloor_id = s.id AND m.id = sm.meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            meter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None)}
                    meter_result.append(result)
                meta_result['meters'] = meter_result
            cursor.execute(" SELECT name "
                           " FROM tbl_shopfloors "
                           " WHERE id = %s ", (id_,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.SHOPFLOOR_NOT_FOUND')

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

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                     " FROM tbl_shopfloors s, tbl_shopfloors_offline_meters sm, tbl_offline_meters m "
                     " WHERE sm.shopfloor_id = s.id AND m.id = sm.offline_meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            offlinemeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None)}
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

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                     " FROM tbl_shopfloors s, tbl_shopfloors_virtual_meters sm, tbl_virtual_meters m "
                     " WHERE sm.shopfloor_id = s.id AND m.id = sm.virtual_meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            virtualmeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None)}
                    virtualmeter_result.append(result)
                meta_result['virtual_meters'] = virtualmeter_result
            query = (" SELECT id, name, uuid "
                     " FROM tbl_data_sources ")
            cursor.execute(query)
            rows_data_sources = cursor.fetchall()

            data_source_dict = dict()
            if rows_data_sources is not None and len(rows_data_sources) > 0:
                for row in rows_data_sources:
                    data_source_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

            query = (" SELECT p.id, p.name, p.data_source_id "
                     " FROM tbl_shopfloors s, tbl_shopfloors_points sp, tbl_points p "
                     " WHERE sp.shopfloor_id = s.id AND p.id = sp.point_id AND s.id = %s "
                     " ORDER BY p.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            point_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "data_source": data_source_dict.get(row[2], None)}
                    point_result.append(result)
                meta_result['points'] = point_result
            query = (" SELECT se.id, se.name, se.uuid "
                     " FROM tbl_shopfloors sp, tbl_shopfloors_sensors ss, tbl_sensors se "
                     " WHERE ss.shopfloor_id = sp.id AND se.id = ss.sensor_id AND sp.id = %s "
                     " ORDER BY se.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            sensor_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    sensor_result.append(result)
                meta_result['sensors'] = sensor_result
            query = (" SELECT wc.id, wc.name, wc.description "
                     " FROM tbl_shopfloors s, tbl_shopfloors_working_calendars swc, tbl_working_calendars wc "
                     " WHERE swc.shopfloor_id = s.id AND wc.id = swc.working_calendar_id AND s.id = %s "
                     " ORDER BY wc.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            workingcalendar_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "description": row[2]}
                    workingcalendar_result.append(result)
                meta_result['working_calendars'] = workingcalendar_result

        cursor.close()
        cnx.close()
        resp.text = json.dumps(meta_result)


class ShopfloorImport:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200
        _ = req

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
                                   description='API.INVALID_SHOPFLOOR_NAME')
        name = str.strip(new_values['name'])

        if 'area' not in new_values.keys() or \
                not (isinstance(new_values['area'], float) or
                     isinstance(new_values['area'], int)) or \
                new_values['area'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_AREA_VALUE')
        area = new_values['area']

        if 'is_input_counted' not in new_values.keys() or \
                not isinstance(new_values['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['is_input_counted']

        if 'id' in new_values['contact'].keys():
            if new_values['contact']['id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_CONTACT_ID')
            contact_id = new_values['contact']['id']
        else:
            contact_id = None

        if 'id' in new_values['cost_center'].keys():
            if new_values['cost_center']['id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_COST_CENTER_ID')
            cost_center_id = new_values['cost_center']['id']
        else:
            cost_center_id = None

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SHOPFLOOR_NAME_IS_ALREADY_IN_USE')

        if contact_id is not None:
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

        add_values = (" INSERT INTO tbl_shopfloors "
                      "    (name, uuid, area, is_input_counted, "
                      "     contact_id, cost_center_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    area,
                                    is_input_counted,
                                    contact_id,
                                    cost_center_id,
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
                         " FROM tbl_shopfloors_equipments "
                         " WHERE shopfloor_id = %s AND equipment_id = %s")
                cursor.execute(query, (new_id, equipment['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SHOPFLOOR_EQUIPMENT_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_shopfloors_equipments (shopfloor_id, equipment_id) "
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
                         " FROM tbl_shopfloors_commands "
                         " WHERE shopfloor_id = %s AND command_id = %s")
                cursor.execute(query, (new_id, command['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SHOPFLOOR_COMMAND_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_shopfloors_commands (shopfloor_id, command_id) "
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
                         " FROM tbl_shopfloors_meters "
                         " WHERE shopfloor_id = %s AND meter_id = %s")
                cursor.execute(query, (new_id, meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SHOPFLOOR_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_shopfloors_meters (shopfloor_id, meter_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, meter['id'],))
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
                         " FROM tbl_shopfloors_offline_meters "
                         " WHERE shopfloor_id = %s AND offline_meter_id = %s")
                cursor.execute(query, (new_id, offline_meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SHOPFLOOR_OFFLINE_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_shopfloors_offline_meters (shopfloor_id, offline_meter_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, offline_meter['id'],))
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
                         " FROM tbl_shopfloors_virtual_meters "
                         " WHERE shopfloor_id = %s AND virtual_meter_id = %s")
                cursor.execute(query, (new_id, virtual_meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SHOPFLOOR_VIRTUAL_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_shopfloors_virtual_meters (shopfloor_id, virtual_meter_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, virtual_meter['id'],))
        if new_values['points'] is not None and len(new_values['points']) > 0:
            for point in new_values['points']:
                cursor.execute(" SELECT name "
                               " FROM tbl_points "
                               " WHERE id = %s ", (point['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.POINT_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_shopfloors_points "
                         " WHERE shopfloor_id = %s AND point_id = %s")
                cursor.execute(query, (new_id, point['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SHOPFLOOR_POINT_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_shopfloors_points (shopfloor_id, point_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, point['id'],))
        if new_values['sensors'] is not None and len(new_values['sensors']) > 0:
            for sensor in new_values['sensors']:
                cursor.execute(" SELECT name "
                               " FROM tbl_sensors "
                               " WHERE id = %s ", (sensor['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.SENSOR_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_shopfloors_sensors "
                         " WHERE shopfloor_id = %s AND sensor_id = %s")
                cursor.execute(query, (new_id, sensor['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SHOPFLOOR_SENSOR_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_shopfloors_sensors (shopfloor_id, sensor_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, sensor['id'],))
        if new_values['working_calendars'] is not None and len(new_values['workingcalendars']) > 0:
            for working_calendar in new_values['working_calendars']:
                cursor.execute(" SELECT name "
                               " FROM tbl_working_calendars "
                               " WHERE id = %s ", (working_calendar['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.WORKING_CALENDAR_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_shopfloors_working_calendars "
                         " WHERE shopfloor_id = %s AND working_calendar_id = %s")
                cursor.execute(query, (new_id, working_calendar['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SHOPFLOOR_WORKING_CALENDAR_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_shopfloors_working_calendars (shopfloor_id, working_calendar_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, working_calendar['id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/shopfloors/' + str(new_id)


class ShopfloorClone:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200
        _ = req
        _ = id_

    @staticmethod
    def on_post(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

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
                 "        area, is_input_counted, contact_id, cost_center_id, description "
                 " FROM tbl_shopfloors "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "area": row[3],
                           "is_input_counted": bool(row[4]),
                           "contact": contact_dict.get(row[5], None),
                           "cost_center": cost_center_dict.get(row[6], None),
                           "description": row[7],
                           "equipments": None,
                           "commands": None,
                           "meters": None,
                           "offline_meters": None,
                           "virtual_meters": None,
                           "points": None,
                           "sensors": None,
                           "working_calendars": None
                           }
            query = (" SELECT e.id, e.name, e.uuid "
                     " FROM tbl_shopfloors s, tbl_shopfloors_equipments se, tbl_equipments e "
                     " WHERE se.shopfloor_id = s.id AND e.id = se.equipment_id AND s.id = %s "
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
                     " FROM tbl_shopfloors s, tbl_shopfloors_commands sc, tbl_commands c "
                     " WHERE sc.shopfloor_id = s.id AND c.id = sc.command_id AND s.id = %s "
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

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                     " FROM tbl_shopfloors s, tbl_shopfloors_meters sm, tbl_meters m "
                     " WHERE sm.shopfloor_id = s.id AND m.id = sm.meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            meter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None)}
                    meter_result.append(result)
                meta_result['meters'] = meter_result
            cursor.execute(" SELECT name "
                           " FROM tbl_shopfloors "
                           " WHERE id = %s ", (id_,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.SHOPFLOOR_NOT_FOUND')

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

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                     " FROM tbl_shopfloors s, tbl_shopfloors_offline_meters sm, tbl_offline_meters m "
                     " WHERE sm.shopfloor_id = s.id AND m.id = sm.offline_meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            offlinemeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None)}
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

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                     " FROM tbl_shopfloors s, tbl_shopfloors_virtual_meters sm, tbl_virtual_meters m "
                     " WHERE sm.shopfloor_id = s.id AND m.id = sm.virtual_meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            virtualmeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None)}
                    virtualmeter_result.append(result)
                meta_result['virtual_meters'] = virtualmeter_result
            query = (" SELECT id, name, uuid "
                     " FROM tbl_data_sources ")
            cursor.execute(query)
            rows_data_sources = cursor.fetchall()

            data_source_dict = dict()
            if rows_data_sources is not None and len(rows_data_sources) > 0:
                for row in rows_data_sources:
                    data_source_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

            query = (" SELECT p.id, p.name, p.data_source_id "
                     " FROM tbl_shopfloors s, tbl_shopfloors_points sp, tbl_points p "
                     " WHERE sp.shopfloor_id = s.id AND p.id = sp.point_id AND s.id = %s "
                     " ORDER BY p.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            point_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "data_source": data_source_dict.get(row[2], None)}
                    point_result.append(result)
                meta_result['points'] = point_result
            query = (" SELECT se.id, se.name, se.uuid "
                     " FROM tbl_shopfloors sp, tbl_shopfloors_sensors ss, tbl_sensors se "
                     " WHERE ss.shopfloor_id = sp.id AND se.id = ss.sensor_id AND sp.id = %s "
                     " ORDER BY se.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            sensor_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    sensor_result.append(result)
                meta_result['sensors'] = sensor_result
            query = (" SELECT wc.id, wc.name, wc.description "
                     " FROM tbl_shopfloors s, tbl_shopfloors_working_calendars swc, tbl_working_calendars wc "
                     " WHERE swc.shopfloor_id = s.id AND wc.id = swc.working_calendar_id AND s.id = %s "
                     " ORDER BY wc.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            workingcalendar_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "description": row[2]}
                    workingcalendar_result.append(result)
                meta_result['working_calendars'] = workingcalendar_result
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = (str.strip(meta_result['name']) +
                        (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
            add_values = (" INSERT INTO tbl_shopfloors "
                          "    (name, uuid, area, is_input_counted, "
                          "     contact_id, cost_center_id, description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['area'],
                                        meta_result['is_input_counted'],
                                        meta_result['contact']['id'],
                                        meta_result['cost_center']['id'],
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
                             " FROM tbl_shopfloors_equipments "
                             " WHERE shopfloor_id = %s AND equipment_id = %s")
                    cursor.execute(query, (new_id, equipment['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SHOPFLOOR_EQUIPMENT_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_shopfloors_equipments (shopfloor_id, equipment_id) "
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
                             " FROM tbl_shopfloors_commands "
                             " WHERE shopfloor_id = %s AND command_id = %s")
                    cursor.execute(query, (new_id, command['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SHOPFLOOR_COMMAND_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_shopfloors_commands (shopfloor_id, command_id) "
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
                             " FROM tbl_shopfloors_meters "
                             " WHERE shopfloor_id = %s AND meter_id = %s")
                    cursor.execute(query, (new_id, meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SHOPFLOOR_METER_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_shopfloors_meters (shopfloor_id, meter_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, meter['id'],))
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
                             " FROM tbl_shopfloors_offline_meters "
                             " WHERE shopfloor_id = %s AND offline_meter_id = %s")
                    cursor.execute(query, (new_id, offline_meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SHOPFLOOR_OFFLINE_METER_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_shopfloors_offline_meters (shopfloor_id, offline_meter_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, offline_meter['id'],))
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
                             " FROM tbl_shopfloors_virtual_meters "
                             " WHERE shopfloor_id = %s AND virtual_meter_id = %s")
                    cursor.execute(query, (new_id, virtual_meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SHOPFLOOR_VIRTUAL_METER_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_shopfloors_virtual_meters (shopfloor_id, virtual_meter_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, virtual_meter['id'],))
            if meta_result['points'] is not None and len(meta_result['points']) > 0:
                for point in meta_result['points']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_points "
                                   " WHERE id = %s ", (point['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.POINT_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_shopfloors_points "
                             " WHERE shopfloor_id = %s AND point_id = %s")
                    cursor.execute(query, (new_id, point['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SHOPFLOOR_POINT_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_shopfloors_points (shopfloor_id, point_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, point['id'],))
            if meta_result['sensors'] is not None and len(meta_result['sensors']) > 0:
                for sensor in meta_result['sensors']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_sensors "
                                   " WHERE id = %s ", (sensor['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.SENSOR_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_shopfloors_sensors "
                             " WHERE shopfloor_id = %s AND sensor_id = %s")
                    cursor.execute(query, (new_id, sensor['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SHOPFLOOR_SENSOR_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_shopfloors_sensors (shopfloor_id, sensor_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, sensor['id'],))
            if meta_result['working_calendars'] is not None and len(meta_result['workingcalendars']) > 0:
                for working_calendar in meta_result['working_calendars']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_working_calendars "
                                   " WHERE id = %s ", (working_calendar['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.WORKING_CALENDAR_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_shopfloors_working_calendars "
                             " WHERE shopfloor_id = %s AND working_calendar_id = %s")
                    cursor.execute(query, (new_id, working_calendar['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SHOPFLOOR_WORKING_CALENDAR_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_shopfloors_working_calendars (shopfloor_id, working_calendar_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, working_calendar['id'],))
            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/shopfloors/' + str(new_id)
