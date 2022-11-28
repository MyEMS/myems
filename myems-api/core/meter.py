import uuid

import falcon
import mysql.connector
import simplejson as json

import config
from core.useractivity import user_logger, access_control


class MeterCollection:
    @staticmethod
    def __init__():
        """Initializes MeterCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

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
                 " FROM tbl_energy_items ")
        cursor.execute(query)
        rows_energy_items = cursor.fetchall()

        energy_item_dict = dict()
        if rows_energy_items is not None and len(rows_energy_items) > 0:
            for row in rows_energy_items:
                energy_item_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_master_meters = cursor.fetchall()

        master_meter_dict = dict()
        if rows_master_meters is not None and len(rows_master_meters) > 0:
            for row in rows_master_meters:
                master_meter_dict[row[0]] = {"id": row[0],
                                             "name": row[1],
                                             "uuid": row[2]}

        query = (" SELECT id, name, uuid, energy_category_id, "
                 "        is_counted, hourly_low_limit, hourly_high_limit, "
                 "        cost_center_id, energy_item_id, master_meter_id, description "
                 " FROM tbl_meters "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        result = list()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                energy_category = energy_category_dict.get(row[3], None)
                cost_center = cost_center_dict.get(row[7], None)
                energy_item = energy_item_dict.get(row[8], None)
                master_meter = master_meter_dict.get(row[9], None)
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "energy_category": energy_category,
                               "is_counted": True if row[4] else False,
                               "hourly_low_limit": row[5],
                               "hourly_high_limit": row[6],
                               "cost_center": cost_center,
                               "energy_item": energy_item,
                               "master_meter": master_meter,
                               "description": row[10],
                               "qrcode": "meter:" + row[2]}
                result.append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        access_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=str(ex))

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['energy_category_id'], int) or \
                new_values['data']['energy_category_id'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category_id']

        if 'is_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_counted'], bool):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COUNTED_VALUE')
        is_counted = new_values['data']['is_counted']

        if 'hourly_low_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['hourly_low_limit'], float) or
                     isinstance(new_values['data']['hourly_low_limit'], int)):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HOURLY_LOW_LIMIT_VALUE')
        hourly_low_limit = new_values['data']['hourly_low_limit']

        if 'hourly_high_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['hourly_high_limit'], float) or
                     isinstance(new_values['data']['hourly_high_limit'], int)):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HOURLY_HIGH_LIMIT_VALUE')
        hourly_high_limit = new_values['data']['hourly_high_limit']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')
        cost_center_id = new_values['data']['cost_center_id']

        if 'energy_item_id' in new_values['data'].keys() and \
                new_values['data']['energy_item_id'] is not None:
            if not isinstance(new_values['data']['energy_item_id'], int) or \
                    new_values['data']['energy_item_id'] <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_ITEM_ID')
            energy_item_id = new_values['data']['energy_item_id']
        else:
            energy_item_id = None

        if 'master_meter_id' in new_values['data'].keys():
            if not isinstance(new_values['data']['master_meter_id'], int) or \
                    new_values['data']['master_meter_id'] <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_MASTER_METER_ID')
            master_meter_id = new_values['data']['master_meter_id']
        else:
            master_meter_id = None

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (new_values['data']['energy_category_id'],))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['data']['cost_center_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        if energy_item_id is not None:
            cursor.execute(" SELECT name, energy_category_id "
                           " FROM tbl_energy_items "
                           " WHERE id = %s ",
                           (new_values['data']['energy_item_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.ENERGY_ITEM_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                           description='API.ENERGY_ITEM_DOES_NOT_BELONG_TO_ENERGY_CATEGORY')

        if master_meter_id is not None:
            cursor.execute(" SELECT name, energy_category_id "
                           " FROM tbl_meters "
                           " WHERE id = %s ",
                           (new_values['data']['master_meter_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.MASTER_METER_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                           description='API.MASTER_METER_DOES_NOT_BELONG_TO_SAME_ENERGY_CATEGORY')

        add_values = (" INSERT INTO tbl_meters "
                      "    (name, uuid, energy_category_id, is_counted, hourly_low_limit, hourly_high_limit,"
                      "     cost_center_id, energy_item_id, master_meter_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    energy_category_id,
                                    is_counted,
                                    hourly_low_limit,
                                    hourly_high_limit,
                                    cost_center_id,
                                    energy_item_id,
                                    master_meter_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/meters/' + str(new_id)


class MeterItem:
    @staticmethod
    def __init__():
        """Initializes MeterItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

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
                 " FROM tbl_energy_items ")
        cursor.execute(query)
        rows_energy_items = cursor.fetchall()

        energy_item_dict = dict()
        if rows_energy_items is not None and len(rows_energy_items) > 0:
            for row in rows_energy_items:
                energy_item_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_master_meters = cursor.fetchall()

        master_meter_dict = dict()
        if rows_master_meters is not None and len(rows_master_meters) > 0:
            for row in rows_master_meters:
                master_meter_dict[row[0]] = {"id": row[0],
                                             "name": row[1],
                                             "uuid": row[2]}

        query = (" SELECT id, name, uuid, energy_category_id, "
                 "        is_counted, hourly_low_limit, hourly_high_limit, "
                 "        cost_center_id, energy_item_id, master_meter_id, description "
                 " FROM tbl_meters "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')
        else:
            energy_category = energy_category_dict.get(row[3], None)
            cost_center = cost_center_dict.get(row[7], None)
            energy_item = energy_item_dict.get(row[8], None)
            master_meter = master_meter_dict.get(row[9], None)
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "energy_category": energy_category,
                           "is_counted": True if row[4] else False,
                           "hourly_low_limit": row[5],
                           "hourly_high_limit": row[6],
                           "cost_center": cost_center,
                           "energy_item": energy_item,
                           "master_meter": master_meter,
                           "description": row[10],
                           "qrcode": "meter:"+row[2]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT uuid "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')
        else:
            meter_uuid = row[0]

        # check if this meter is being used by virtual meters
        cursor.execute(" SELECT vm.name "
                       " FROM tbl_variables va, tbl_virtual_meters vm "
                       " WHERE va.meter_id = %s AND va.meter_type = 'meter' AND va.virtual_meter_id = vm.id ",
                       (id_,))
        row_virtual_meter = cursor.fetchone()
        if row_virtual_meter is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THIS_METER_IS_BEING_USED_BY_A_VIRTUAL_METER')

        # check relation with child meters
        cursor.execute(" SELECT id "
                       " FROM tbl_meters "
                       " WHERE master_meter_id = %s ", (id_,))
        rows_child_meters = cursor.fetchall()
        if rows_child_meters is not None and len(rows_child_meters) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_CHILD_METERS')

        # check relation with spaces
        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_meters "
                       " WHERE meter_id = %s ", (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # check relation with tenants
        cursor.execute(" SELECT tenant_id "
                       " FROM tbl_tenants_meters "
                       " WHERE meter_id = %s ", (id_,))
        rows_tenants = cursor.fetchall()
        if rows_tenants is not None and len(rows_tenants) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_TENANTS')

        # check relation with stores
        cursor.execute(" SELECT store_id "
                       " FROM tbl_stores_meters "
                       " WHERE meter_id = %s ", (id_,))
        rows_stores = cursor.fetchall()
        if rows_stores is not None and len(rows_stores) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_STORES')

        # check relation with shopfloors
        cursor.execute(" SELECT shopfloor_id "
                       " FROM tbl_shopfloors_meters "
                       " WHERE meter_id = %s ", (id_,))
        rows_shopfloors = cursor.fetchall()
        if rows_shopfloors is not None and len(rows_shopfloors) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SHOPFLOORS')

        # check relation with combined equipments
        cursor.execute(" SELECT combined_equipment_id "
                       " FROM tbl_combined_equipments_meters "
                       " WHERE meter_id = %s ",
                       (id_,))
        rows_combined_equipments = cursor.fetchall()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENTS')

        # check relation with combined equipment parameters
        cursor.execute(" SELECT combined_equipment_id "
                       " FROM tbl_combined_equipments_parameters "
                       " WHERE numerator_meter_uuid = %s OR denominator_meter_uuid = %s", (meter_uuid, meter_uuid,))
        rows_combined_equipments = cursor.fetchall()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENT_PARAMETERS')

        # check relation with equipments
        cursor.execute(" SELECT equipment_id "
                       " FROM tbl_equipments_meters "
                       " WHERE meter_id = %s ", (id_,))
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENTS')

        # check relation with equipment parameters
        cursor.execute(" SELECT equipment_id "
                       " FROM tbl_equipments_parameters "
                       " WHERE numerator_meter_uuid = %s OR denominator_meter_uuid = %s", (meter_uuid, meter_uuid, ))
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENT_PARAMETERS')

        # check relation with points
        cursor.execute(" SELECT id "
                       " FROM tbl_meters_points "
                       " WHERE meter_id = %s ", (id_,))
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_POINTS')

        # check relation with energy flow diagram links
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE meter_uuid = %s ", (meter_uuid,))
        rows_links = cursor.fetchall()
        if rows_links is not None and len(rows_links) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_FLOW_DIAGRAM_LINKS')

        cursor.execute(" DELETE FROM tbl_meters WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        access_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=str(ex))

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['energy_category_id'], int) or \
                new_values['data']['energy_category_id'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category_id']

        if 'is_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_counted'], bool):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COUNTED_VALUE')
        is_counted = new_values['data']['is_counted']

        if 'hourly_low_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['hourly_low_limit'], float) or
                     isinstance(new_values['data']['hourly_low_limit'], int)):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HOURLY_LOW_LIMIT_VALUE')
        hourly_low_limit = new_values['data']['hourly_low_limit']

        if 'hourly_high_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['hourly_high_limit'], float) or
                     isinstance(new_values['data']['hourly_high_limit'], int)):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HOURLY_HIGH_LIMIT_VALUE')
        hourly_high_limit = new_values['data']['hourly_high_limit']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')

        cost_center_id = new_values['data']['cost_center_id']

        if 'energy_item_id' in new_values['data'].keys() and \
                new_values['data']['energy_item_id'] is not None:
            if not isinstance(new_values['data']['energy_item_id'], int) or \
                    new_values['data']['energy_item_id'] <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_ITEM_ID')
            energy_item_id = new_values['data']['energy_item_id']
        else:
            energy_item_id = None

        if 'master_meter_id' in new_values['data'].keys():
            if not isinstance(new_values['data']['master_meter_id'], int) or \
                    new_values['data']['master_meter_id'] <= 0 or \
                    new_values['data']['master_meter_id'] == int(id_):
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_MASTER_METER_ID')
            master_meter_id = new_values['data']['master_meter_id']
        else:
            master_meter_id = None

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (new_values['data']['energy_category_id'],))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['data']['cost_center_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        if energy_item_id is not None:
            cursor.execute(" SELECT name, energy_category_id "
                           " FROM tbl_energy_items "
                           " WHERE id = %s ",
                           (new_values['data']['energy_item_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.ENERGY_ITEM_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                           description='API.ENERGY_ITEM_DOES_NOT_BELONG_TO_ENERGY_CATEGORY')

        if master_meter_id is not None:
            cursor.execute(" SELECT name, energy_category_id "
                           " FROM tbl_meters "
                           " WHERE id = %s ",
                           (new_values['data']['master_meter_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.MASTER_METER_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                           description='API.MASTER_METER_DOES_NOT_BELONG_TO_SAME_ENERGY_CATEGORY')

        # todo: check all descendants against new_values['data']['master_meter_id']
        if master_meter_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_meters "
                           " WHERE id = %s AND master_meter_id = %s ",
                           (new_values['data']['master_meter_id'], id_))
            row = cursor.fetchone()
            if row is not None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.CANNOT_SET_EXISTING_SUBMETER_AS_MASTER_METER')

        update_row = (" UPDATE tbl_meters "
                      " SET name = %s, energy_category_id = %s, is_counted = %s, "
                      "     hourly_low_limit = %s, hourly_high_limit = %s, "
                      "     cost_center_id = %s, energy_item_id = %s, master_meter_id = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    energy_category_id,
                                    is_counted,
                                    hourly_low_limit,
                                    hourly_high_limit,
                                    cost_center_id,
                                    energy_item_id,
                                    master_meter_id,
                                    description,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class MeterSubmeterCollection:
    @staticmethod
    def __init__():
        """Initializes MeterSubmeterCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name, uuid "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')
        else:
            master_meter = {"id": id_,
                            "name": row[0],
                            "uuid": row[1]}

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
                 " FROM tbl_energy_items ")
        cursor.execute(query)
        rows_energy_items = cursor.fetchall()

        energy_item_dict = dict()
        if rows_energy_items is not None and len(rows_energy_items) > 0:
            for row in rows_energy_items:
                energy_item_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, energy_category_id, "
                 "        is_counted, hourly_low_limit, hourly_high_limit, "
                 "        cost_center_id, energy_item_id, master_meter_id, description "
                 " FROM tbl_meters "
                 " WHERE master_meter_id = %s "
                 " ORDER BY id ")
        cursor.execute(query, (id_, ))
        rows_meters = cursor.fetchall()

        result = list()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                energy_category = energy_category_dict.get(row[3], None)
                cost_center = cost_center_dict.get(row[7], None)
                energy_item = energy_item_dict.get(row[8], None)
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "energy_category": energy_category,
                               "is_counted": True if row[4] else False,
                               "hourly_low_limit": row[5],
                               "hourly_high_limit": row[6],
                               "cost_center": cost_center,
                               "energy_item": energy_item,
                               "master_meter": master_meter,
                               "description": row[10]}
                result.append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)


class MeterPointCollection:
    @staticmethod
    def __init__():
        """Initializes MeterPointCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_meters_points mp, tbl_data_sources ds "
                 " WHERE mp.meter_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (id_,))
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
    def on_post(req, resp, id_):
        """Handles POST requests"""
        access_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=str(ex))

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_meters "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')
        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')
        elif row[1] == 'ENERGY_VALUE':
            query = (" SELECT p.id "
                     " FROM tbl_meters_points mp, tbl_points p "
                     " WHERE mp.meter_id = %s AND mp.point_id = p.id AND p.object_type = 'ENERGY_VALUE' ")
            cursor.execute(query, (id_,))
            rows_points = cursor.fetchall()
            if rows_points is not None and len(rows_points) > 0:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR',
                                       description='API.METER_CANNOT_HAVE_MORE_THAN_ONE_ENERGY_VALUE_POINTS')

        query = (" SELECT id " 
                 " FROM tbl_meters_points "
                 " WHERE meter_id = %s AND point_id = %s")
        cursor.execute(query, (id_, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR',
                                   description='API.METER_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_meters_points (meter_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/meters/' + str(id_) + '/points/' + str(new_values['data']['point_id'])


class MeterPointItem:
    @staticmethod
    def __init__():
        """Initializes MeterPointItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pid):
        """Handles DELETE requests"""
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_meters_points "
                       " WHERE meter_id = %s AND point_id = %s ", (id_, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_meters_points WHERE meter_id = %s AND point_id = %s ", (id_, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

