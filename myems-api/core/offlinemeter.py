import falcon
import simplejson as json
import mysql.connector
import config
import uuid


class OfflineMeterCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row['id']] = {"id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_items ")
        cursor.execute(query)
        rows_energy_items = cursor.fetchall()

        energy_item_dict = dict()
        if rows_energy_items is not None and len(rows_energy_items) > 0:
            for row in rows_energy_items:
                energy_item_dict[row['id']] = {"id": row['id'],
                                               "name": row['name'],
                                               "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row['id']] = {"id": row['id'],
                                               "name": row['name'],
                                               "uuid": row['uuid']}

        query = (" SELECT id, name, uuid, energy_category_id, "
                 "        is_counted, hourly_low_limit, hourly_high_limit, "
                 "        energy_item_id, cost_center_id, description "
                 " FROM tbl_offline_meters "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        result = list()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                energy_category = energy_category_dict.get(row['energy_category_id'], None)
                energy_item = energy_item_dict.get(row['energy_item_id'], None)
                cost_center = cost_center_dict.get(row['cost_center_id'], None)
                meta_result = {"id": row['id'],
                               "name": row['name'],
                               "uuid": row['uuid'],
                               "energy_category": energy_category,
                               "is_counted": True if row['is_counted'] else False,
                               "hourly_low_limit": row['hourly_low_limit'],
                               "hourly_high_limit": row['hourly_high_limit'],
                               "energy_item": energy_item,
                               "cost_center": cost_center,
                               "description": row['description']}
                result.append(meta_result)

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)

    @staticmethod
    def on_post(req, resp):
        """Handles POST requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_NAME')
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

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.OFFLINE_METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (new_values['data']['energy_category_id'],))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')
        if energy_item_id is not None:
            cursor.execute(" SELECT name, energy_category_id "
                           " FROM tbl_energy_items "
                           " WHERE id = %s ",
                           (new_values['data']['energy_item_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.ENERGY_ITEM_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.disconnect()
                    raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                           description='API.ENERGY_ITEM_IS_NOT_BELONG_TO_ENERGY_CATEGORY')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['data']['cost_center_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_offline_meters "
                      "    (name, uuid, energy_category_id, "
                      "     is_counted, hourly_low_limit, hourly_high_limit, "
                      "     cost_center_id, energy_item_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    energy_category_id,
                                    is_counted,
                                    hourly_low_limit,
                                    hourly_high_limit,
                                    cost_center_id,
                                    energy_item_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/offlinemeters/' + str(new_id)


class OfflineMeterItem:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row['id']] = {"id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_items ")
        cursor.execute(query)
        rows_energy_items = cursor.fetchall()

        energy_item_dict = dict()
        if rows_energy_items is not None and len(rows_energy_items) > 0:
            for row in rows_energy_items:
                energy_item_dict[row['id']] = {"id": row['id'],
                                               "name": row['name'],
                                               "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row['id']] = {"id": row['id'],
                                               "name": row['name'],
                                               "uuid": row['uuid']}

        query = (" SELECT id, name, uuid, energy_category_id, "
                 "        is_counted, hourly_low_limit, hourly_high_limit, "
                 "        energy_item_id, cost_center_id, description "
                 " FROM tbl_offline_meters "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')
        else:
            energy_category = energy_category_dict.get(row['energy_category_id'], None)
            energy_item = energy_item_dict.get(row['energy_item_id'], None)
            cost_center = cost_center_dict.get(row['cost_center_id'], None)
            meta_result = {"id": row['id'],
                           "name": row['name'],
                           "uuid": row['uuid'],
                           "energy_category": energy_category,
                           "is_counted": True if row['is_counted'] else False,
                           "hourly_low_limit": row['hourly_low_limit'],
                           "hourly_high_limit": row['hourly_high_limit'],
                           "energy_item": energy_item,
                           "cost_center": cost_center,
                           "description": row['description']}

        resp.body = json.dumps(meta_result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT uuid "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')
        else:
            offline_meter_uuid = row[0]

        # check if this offline meter is being used by virtual meters
        cursor.execute(" SELECT vm.name "
                       " FROM tbl_variables va, tbl_expressions ex, tbl_virtual_meters vm "
                       " WHERE va.meter_id = %s AND va.meter_type = 'offline_meter' AND va.expression_id = ex.id "
                       " AND ex.virtual_meter_id = vm.id ",
                       (id_,))
        row_virtual_meter = cursor.fetchone()
        if row_virtual_meter is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THIS_OFFLINE_METER_IS_BEING_USED_BY_A_VIRTUAL_METER')

        # check relationship with spaces
        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_offline_meters "
                       " WHERE offline_meter_id = %s ", (id_,))
        rows_companies = cursor.fetchall()
        if rows_companies is not None and len(rows_companies) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # check relation with combined equipments
        cursor.execute(" SELECT combined_equipment_id "
                       " FROM tbl_combined_equipments_offline_meters "
                       " WHERE offline_meter_id = %s ",
                       (id_,))
        rows_combined_equipments = cursor.fetchall()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENTS')

        # check relation with combined equipment parameters
        cursor.execute(" SELECT combined_equipment_id "
                       " FROM tbl_combined_equipments_parameters "
                       " WHERE numerator_meter_uuid = %s OR denominator_meter_uuid = %s",
                       (offline_meter_uuid, offline_meter_uuid,))
        rows_combined_equipments = cursor.fetchall()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENT_PARAMETERS')

        # check relations with tenants
        cursor.execute(" SELECT tenant_id "
                       " FROM tbl_tenants_offline_meters "
                       " WHERE offline_meter_id = %s ", (id_,))
        rows_tenants = cursor.fetchall()
        if rows_tenants is not None and len(rows_tenants) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_TENANTS')

        # check relations with stores
        cursor.execute(" SELECT store_id "
                       " FROM tbl_stores_offline_meters "
                       " WHERE offline_meter_id = %s ", (id_,))
        rows_stores = cursor.fetchall()
        if rows_stores is not None and len(rows_stores) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_STORES')

        # check relations with shopfloors
        cursor.execute(" SELECT shopfloor_id "
                       " FROM tbl_shopfloors_offline_meters "
                       " WHERE offline_meter_id = %s ", (id_,))
        rows_shopfloors = cursor.fetchall()
        if rows_shopfloors is not None and len(rows_shopfloors) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SHOPFLOORS')

        # check relations with equipments
        cursor.execute(" SELECT equipment_id "
                       " FROM tbl_equipments_offline_meters "
                       " WHERE offline_meter_id = %s ", (id_,))
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATIONSHIP_WITH_EQUIPMENTS')

        # check relation with equipment parameters
        cursor.execute(" SELECT equipment_id "
                       " FROM tbl_equipments_parameters "
                       " WHERE numerator_meter_uuid = %s OR denominator_meter_uuid = %s",
                       (offline_meter_uuid, offline_meter_uuid,))
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENT_PARAMETERS')

        # check relation with energy flow diagram links
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE meter_uuid = %s ", (offline_meter_uuid,))
        rows_links = cursor.fetchall()
        if rows_links is not None and len(rows_links) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_FLOW_DIAGRAM_LINKS')

        cursor.execute(" DELETE FROM tbl_offline_meters WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_204

    @staticmethod
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=ex)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_NAME')
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

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.OFFLINE_METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (new_values['data']['energy_category_id'],))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['data']['cost_center_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
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
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.ENERGY_ITEM_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.disconnect()
                    raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                           description='API.ENERGY_ITEM_IS_NOT_BELONG_TO_ENERGY_CATEGORY')

        update_row = (" UPDATE tbl_offline_meters "
                      " SET name = %s, energy_category_id = %s,"
                      "     is_counted = %s, hourly_low_limit = %s, hourly_high_limit = %s, "
                      "     cost_center_id = %s, energy_item_id = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    energy_category_id,
                                    is_counted,
                                    hourly_low_limit,
                                    hourly_high_limit,
                                    cost_center_id,
                                    energy_item_id,
                                    description,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200

