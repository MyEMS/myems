import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class VirtualMeterCollection:
    def __init__(self):
        """"Initializes VirtualMeterCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        _=req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
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
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, equation, energy_category_id, is_counted, cost_center_id, "
                 "        energy_item_id, description "
                 " FROM tbl_virtual_meters "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        result = list()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "equation": row[3],
                               "energy_category": energy_category_dict.get(row[4], None),
                               "is_counted": True if row[5] else False,
                               "cost_center": cost_center_dict.get(row[6], None),
                               "energy_item": energy_item_dict.get(row[7], None),
                               "description": row[8],
                               "expression": {}}

                expression = dict()

                if meta_result["equation"] is not None:
                    expression = {'equation': meta_result["equation"], 'variables': []}

                    query_variables = (" SELECT v.id, v.name, v.meter_type, v.meter_id "
                                       " FROM tbl_virtual_meters vm, tbl_variables v "
                                       " WHERE vm.id = %s AND v.virtual_meter_id = vm.id "
                                       " ORDER BY SUBSTRING(v.name, 2, 10) + 0 ")
                    cursor.execute(query_variables, (meta_result['id'],))
                    rows_variables = cursor.fetchall()
                    if rows_variables is not None:
                        for row_variable in rows_variables:
                            if row_variable[2].lower() == 'meter':
                                query_meter = (" SELECT m.name "
                                               " FROM tbl_meters m "
                                               " WHERE m.id = %s ")
                                cursor.execute(query_meter, (row_variable[3],))
                                row_meter = cursor.fetchone()
                                if row_meter is not None:
                                    expression['variables'].append({'id': row_variable[0],
                                                                    'name': row_variable[1],
                                                                    'meter_type': row_variable[2],
                                                                    'meter_id': row_variable[3],
                                                                    'meter_name': row_meter[0]})
                            elif row_variable[2].lower() == 'offline_meter':
                                query_meter = (" SELECT m.name "
                                               " FROM tbl_offline_meters m "
                                               " WHERE m.id = %s ")
                                cursor.execute(query_meter, (row_variable[3],))
                                row_meter = cursor.fetchone()
                                if row_meter is not None:
                                    expression['variables'].append({'id': row_variable[0],
                                                                    'name': row_variable[1],
                                                                    'meter_type': row_variable[2],
                                                                    'meter_id': row_variable[3],
                                                                    'meter_name': row_meter[0]})
                            elif row_variable[2].lower() == 'virtual_meter':
                                query_meter = (" SELECT m.name "
                                               " FROM tbl_virtual_meters m "
                                               " WHERE m.id = %s ")
                                cursor.execute(query_meter, (row_variable[3],))
                                row_meter = cursor.fetchone()
                                if row_meter is not None:
                                    expression['variables'].append({'id': row_variable[0],
                                                                    'name': row_variable[1],
                                                                    'meter_type': row_variable[2],
                                                                    'meter_id': row_variable[3],
                                                                    'meter_name': row_meter[0]})

                meta_result['expression'] = expression
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
                                   description='API.INVALID_VIRTUAL_METER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category_id' not in new_values['data'].keys() or new_values['data']['energy_category_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category_id']

        if 'is_counted' not in new_values['data'].keys() or not isinstance(new_values['data']['is_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COUNTED_VALUE')
        is_counted = new_values['data']['is_counted']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')

        cost_center_id = new_values['data']['cost_center_id']

        if 'energy_item_id' in new_values['data'].keys() and \
                new_values['data']['energy_item_id'] is not None:
            if not isinstance(new_values['data']['energy_item_id'], int) or \
                    new_values['data']['energy_item_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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

        if 'expression' not in new_values['data'].keys():
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION_OBJECT')

        if 'equation' not in new_values['data']['expression'].keys() \
                or len(new_values['data']['expression']['equation']) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUATION_IN_EXPRESSION')
        # todo: validate equation with more rules

        if 'variables' not in new_values['data']['expression'].keys() \
                or len(new_values['data']['expression']['variables']) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.EMPTY_VARIABLES_ARRAY')

        for variable in new_values['data']['expression']['variables']:
            if 'name' not in variable.keys() or \
                    len(variable['name']) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_NAME')
            if 'meter_type' not in variable.keys() or \
                    len(variable['meter_type']) == 0 or \
                    variable['meter_type'].lower() not in ['meter', 'offline_meter', 'virtual_meter']:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_METER_TYPE')
            if 'meter_id' not in variable.keys() or \
                    variable['meter_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (energy_category_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

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

        if energy_item_id is not None:
            cursor.execute(" SELECT name, energy_category_id "
                           " FROM tbl_energy_items "
                           " WHERE id = %s ",
                           (new_values['data']['energy_item_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.ENERGY_ITEM_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                           description='API.ENERGY_ITEM_IS_NOT_BELONG_TO_ENERGY_CATEGORY')

        for variable in new_values['data']['expression']['variables']:
            if variable['meter_type'].lower() == 'meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.METER_OF_VARIABLE_NOT_FOUND')
            elif variable['meter_type'].lower() == 'offline_meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_offline_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.OFFLINE_METER_OF_VARIABLE_NOT_FOUND')
            elif variable['meter_type'].lower() == 'virtual_meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_virtual_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.VIRTUAL_METER_OF_VARIABLE_NOT_FOUND')

        add_values = (" INSERT INTO tbl_virtual_meters "
                      "     (name, uuid, equation, energy_category_id, is_counted, "
                      "      cost_center_id, energy_item_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    new_values['data']['expression']['equation'].lower(),
                                    energy_category_id,
                                    is_counted,
                                    cost_center_id,
                                    energy_item_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()

        # add variables
        for variable in new_values['data']['expression']['variables']:
            add_values = (" INSERT INTO tbl_variables (name, virtual_meter_id, meter_type, meter_id) "
                          " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_values, (variable['name'].lower(),
                                        new_id,
                                        variable['meter_type'],
                                        variable['meter_id'],))
            cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/virtualmeters/' + str(new_id)


class VirtualMeterItem:
    def __init__(self):
        """"Initializes VirtualMeterItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _=req
        resp.status = falcon.HTTP_200
        _=id_
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
                                   description='API.INVALID_VIRTUAL_METER_ID')

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

        query = (" SELECT id, name, uuid, energy_category_id "
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
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, equation, energy_category_id, is_counted, cost_center_id, "
                 "        energy_item_id, description "
                 " FROM tbl_virtual_meters "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "equation": row[3],
                           "energy_category": energy_category_dict.get(row[4], None),
                           "is_counted": True if row[5] else False,
                           "cost_center": cost_center_dict.get(row[6], None),
                           "energy_item": energy_item_dict.get(row[7], None),
                           "description": row[8],
                           "expression": {}}

        expression = dict()

        if meta_result["equation"] is not None:
            expression = {'equation': meta_result["equation"], 'variables': []}

            query_variables = (" SELECT v.id, v.name, v.meter_type, v.meter_id "
                               " FROM tbl_virtual_meters  vm, tbl_variables v "
                               " WHERE vm.id = %s AND v.virtual_meter_id = vm.id "
                               " ORDER BY v.name ")
            cursor.execute(query_variables, (meta_result["id"],))
            rows_variables = cursor.fetchall()
            if rows_variables is not None:
                for row_variable in rows_variables:
                    if row_variable[2].lower() == 'meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable[3],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable[0],
                                                            'name': row_variable[1],
                                                            'meter_type': row_variable[2],
                                                            'meter_id': row_variable[3],
                                                            'meter_name': row_meter[0]})
                    elif row_variable[2].lower() == 'offline_meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_offline_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable[3],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable[0],
                                                            'name': row_variable[1],
                                                            'meter_type': row_variable[2],
                                                            'meter_id': row_variable[3],
                                                            'meter_name': row_meter[0]})
                    elif row_variable[2].lower() == 'virtual_meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_virtual_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable[3],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable[0],
                                                            'name': row_variable[1],
                                                            'meter_type': row_variable[2],
                                                            'meter_id': row_variable[3],
                                                            'meter_name': row_meter[0]})

        meta_result['expression'] = expression

        cursor.close()
        cnx.close()
        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT uuid "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')
        else:
            virtual_meter_uuid = row[0]

        # check relations with other virtual meters
        cursor.execute(" SELECT vm.name "
                       " FROM tbl_variables va, tbl_virtual_meters vm "
                       " WHERE va.meter_id = %s AND va.meter_type = 'virtual_meter' AND va.virtual_meter_id = vm.id ",
                       (id_,))
        row_virtual_meter = cursor.fetchone()
        if row_virtual_meter is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_OTHER_VIRTUAL_METERS')

        # check relation with spaces
        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_virtual_meters "
                       " WHERE virtual_meter_id = %s ", (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # check relation with combined equipments
        cursor.execute(" SELECT combined_equipment_id "
                       " FROM tbl_combined_equipments_virtual_meters "
                       " WHERE virtual_meter_id = %s ",
                       (id_,))
        rows_combined_equipments = cursor.fetchall()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENTS')

        # check relation with combined equipment parameters
        cursor.execute(" SELECT combined_equipment_id "
                       " FROM tbl_combined_equipments_parameters "
                       " WHERE numerator_meter_uuid = %s OR denominator_meter_uuid = %s",
                       (virtual_meter_uuid, virtual_meter_uuid,))
        rows_combined_equipments = cursor.fetchall()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENT_PARAMETERS')

        # check relation with equipments
        cursor.execute(" SELECT equipment_id "
                       " FROM tbl_equipments_virtual_meters "
                       " WHERE virtual_meter_id = %s ", (id_,))
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENTS')

        # check relation with equipment parameters
        cursor.execute(" SELECT equipment_id "
                       " FROM tbl_equipments_parameters "
                       " WHERE numerator_meter_uuid = %s OR denominator_meter_uuid = %s",
                       (virtual_meter_uuid, virtual_meter_uuid,))
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENT_PARAMETERS')

        # check relations with tenants
        cursor.execute(" SELECT tenant_id "
                       " FROM tbl_tenants_virtual_meters "
                       " WHERE virtual_meter_id = %s ", (id_,))
        rows_tenants = cursor.fetchall()
        if rows_tenants is not None and len(rows_tenants) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_TENANTS')

        # check relations with stores
        cursor.execute(" SELECT store_id "
                       " FROM tbl_stores_virtual_meters "
                       " WHERE virtual_meter_id = %s ", (id_,))
        rows_stores = cursor.fetchall()
        if rows_stores is not None and len(rows_stores) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_STORES')

        # check relations with shopfloors
        cursor.execute(" SELECT shopfloor_id "
                       " FROM tbl_shopfloors_virtual_meters "
                       " WHERE virtual_meter_id = %s ", (id_,))
        rows_shopfloors = cursor.fetchall()
        if rows_shopfloors is not None and len(rows_shopfloors) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SHOPFLOORS')

        # check relation with energy flow diagram links
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE meter_uuid = %s ", (virtual_meter_uuid,))
        rows_links = cursor.fetchall()
        if rows_links is not None and len(rows_links) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_FLOW_DIAGRAM_LINKS')

        cursor.execute(" SELECT id "
                       " FROM tbl_variables "
                       " WHERE virtual_meter_id = %s ", (id_,))
        row_variables = cursor.fetchall()
        if row_variables is not None and len(row_variables) > 0:
            # delete variables
            cursor.execute(" DELETE FROM tbl_variables WHERE virtual_meter_id = %s ", (id_,))
            cnx.commit()

        cursor.execute(" DELETE FROM tbl_virtual_meters WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_VIRTUAL_METER_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category_id' not in new_values['data'].keys() or new_values['data']['energy_category_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category_id']

        if 'is_counted' not in new_values['data'].keys() or not isinstance(new_values['data']['is_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COUNTED_VALUE')
        is_counted = new_values['data']['is_counted']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')

        cost_center_id = new_values['data']['cost_center_id']

        if 'energy_item_id' in new_values['data'].keys() and \
                new_values['data']['energy_item_id'] is not None:
            if not isinstance(new_values['data']['energy_item_id'], int) or \
                    new_values['data']['energy_item_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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

        if 'expression' not in new_values['data'].keys():
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION_OBJECT')

        if 'equation' not in new_values['data']['expression'].keys() \
                or len(new_values['data']['expression']['equation']) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUATION_IN_EXPRESSION')
        # todo: validate equation with more rules

        if 'variables' not in new_values['data']['expression'].keys() \
                or len(new_values['data']['expression']['variables']) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.EMPTY_VARIABLES_ARRAY')

        for variable in new_values['data']['expression']['variables']:
            if 'name' not in variable.keys() or \
                    len(variable['name']) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_NAME')
            if 'meter_type' not in variable.keys() or \
                len(variable['meter_type']) == 0 or \
                    variable['meter_type'].lower() not in ['meter', 'offline_meter', 'virtual_meter']:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_METER_TYPE')
            if 'meter_id' not in variable.keys() or \
                    variable['meter_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.VIRTUAL_METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (energy_category_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

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

        if energy_item_id is not None:
            cursor.execute(" SELECT name, energy_category_id "
                           " FROM tbl_energy_items "
                           " WHERE id = %s ",
                           (new_values['data']['energy_item_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.ENERGY_ITEM_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.ENERGY_ITEM_IS_NOT_BELONG_TO_ENERGY_CATEGORY')

        for variable in new_values['data']['expression']['variables']:
            if variable['meter_type'].lower() == 'meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.METER_OF_VARIABLE_NOT_FOUND')
            elif variable['meter_type'].lower() == 'offline_meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_offline_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.OFFLINE_METER_OF_VARIABLE_NOT_FOUND')
            elif variable['meter_type'].lower() == 'virtual_meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_virtual_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.VIRTUAL_METER_OF_VARIABLE_NOT_FOUND')
        try:
            update_row = (" UPDATE tbl_virtual_meters "
                          " SET name = %s, equation = %s, energy_category_id = %s, is_counted = %s, "
                          "     cost_center_id = %s, energy_item_id = %s, description = %s "
                          " WHERE id = %s ")
            cursor.execute(update_row, (name,
                                        new_values['data']['expression']['equation'].lower(),
                                        energy_category_id,
                                        is_counted,
                                        cost_center_id,
                                        energy_item_id,
                                        description,
                                        id_,))
            cnx.commit()
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR', description=str(ex))

        try:
            cursor.execute(" SELECT id "
                           " FROM tbl_variables "
                           " WHERE virtual_meter_id = %s ", (id_,))
            row_variables = cursor.fetchall()
            if row_variables is not None and len(row_variables) > 0:
                # delete variables
                cursor.execute(" DELETE FROM tbl_variables WHERE virtual_meter_id = %s ", (id_,))
                cnx.commit()
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR', description=str(ex))

        # add variables
        for variable in new_values['data']['expression']['variables']:
            try:
                add_values = (" INSERT INTO tbl_variables (name, virtual_meter_id, meter_type, meter_id) "
                              " VALUES (%s, %s, %s, %s) ")
                cursor.execute(add_values, (variable['name'].lower(),
                                            id_,
                                            variable['meter_type'],
                                            variable['meter_id'],))
                cnx.commit()
            except Exception as ex:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR', description=str(ex))

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class VirtualMeterExport:
    def __init__(self):
        """"Initializes VirtualMeterItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _=req
        resp.status = falcon.HTTP_200
        _=id_
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
                                   description='API.INVALID_VIRTUAL_METER_ID')

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

        query = (" SELECT id, name, uuid, energy_category_id "
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
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, equation, energy_category_id, is_counted, cost_center_id, "
                 "        energy_item_id, description "
                 " FROM tbl_virtual_meters "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "equation": row[3],
                           "energy_category": energy_category_dict.get(row[4], None),
                           "is_counted": True if row[5] else False,
                           "cost_center": cost_center_dict.get(row[6], None),
                           "energy_item": energy_item_dict.get(row[7], None),
                           "description": row[8],
                           "expression": {}}

        expression = dict()

        if meta_result["equation"] is not None:
            expression = {'equation': meta_result["equation"], 'variables': []}

            query_variables = (" SELECT v.id, v.name, v.meter_type, v.meter_id "
                               " FROM tbl_virtual_meters  vm, tbl_variables v "
                               " WHERE vm.id = %s AND v.virtual_meter_id = vm.id "
                               " ORDER BY v.name ")
            cursor.execute(query_variables, (meta_result["id"],))
            rows_variables = cursor.fetchall()
            if rows_variables is not None:
                for row_variable in rows_variables:
                    if row_variable[2].lower() == 'meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable[3],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable[0],
                                                            'name': row_variable[1],
                                                            'meter_type': row_variable[2],
                                                            'meter_id': row_variable[3],
                                                            'meter_name': row_meter[0]})
                    elif row_variable[2].lower() == 'offline_meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_offline_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable[3],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable[0],
                                                            'name': row_variable[1],
                                                            'meter_type': row_variable[2],
                                                            'meter_id': row_variable[3],
                                                            'meter_name': row_meter[0]})
                    elif row_variable[2].lower() == 'virtual_meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_virtual_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable[3],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable[0],
                                                            'name': row_variable[1],
                                                            'meter_type': row_variable[2],
                                                            'meter_id': row_variable[3],
                                                            'meter_name': row_meter[0]})

        meta_result['expression'] = expression

        cursor.close()
        cnx.close()
        resp.text = json.dumps(meta_result)


class VirtualMeterImport:
    def __init__(self):
        """"Initializes VirtualMeterImport"""
        pass

    @staticmethod
    def on_options(req, resp):
        _=req
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
                                   description='API.INVALID_VIRTUAL_METER_NAME')
        name = str.strip(new_values['name'])

        if 'id' not in new_values['energy_category'].keys() or new_values['energy_category']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['energy_category']['id']

        if 'is_counted' not in new_values.keys() or not isinstance(new_values['is_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COUNTED_VALUE')
        is_counted = new_values['is_counted']

        if 'id' not in new_values['cost_center'].keys() or \
                not isinstance(new_values['cost_center']['id'], int) or \
                new_values['cost_center']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')

        cost_center_id = new_values['cost_center']['id']

        if 'id' in new_values['energy_item'].keys() and \
                new_values['energy_item']['id'] is not None:
            if not isinstance(new_values['energy_item']['id'], int) or \
                    new_values['energy_item']['id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_ITEM_ID')
            energy_item_id = new_values['energy_item']['id']
        else:
            energy_item_id = None

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        if 'expression' not in new_values.keys():
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION_OBJECT')

        if 'equation' not in new_values['expression'].keys() \
                or len(new_values['expression']['equation']) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUATION_IN_EXPRESSION')
        # todo: validate equation with more rules

        if 'variables' not in new_values['expression'].keys() \
                or len(new_values['expression']['variables']) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.EMPTY_VARIABLES_ARRAY')

        for variable in new_values['expression']['variables']:
            if 'name' not in variable.keys() or \
                    len(variable['name']) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_NAME')
            if 'meter_type' not in variable.keys() or \
                    len(variable['meter_type']) == 0 or \
                    variable['meter_type'].lower() not in ['meter', 'offline_meter', 'virtual_meter']:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_METER_TYPE')
            if 'meter_id' not in variable.keys() or \
                    variable['meter_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (energy_category_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

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

        if energy_item_id is not None:
            cursor.execute(" SELECT name, energy_category_id "
                           " FROM tbl_energy_items "
                           " WHERE id = %s ",
                           (new_values['energy_item']['id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.ENERGY_ITEM_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                           description='API.ENERGY_ITEM_IS_NOT_BELONG_TO_ENERGY_CATEGORY')

        for variable in new_values['expression']['variables']:
            if variable['meter_type'].lower() == 'meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.METER_OF_VARIABLE_NOT_FOUND')
            elif variable['meter_type'].lower() == 'offline_meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_offline_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.OFFLINE_METER_OF_VARIABLE_NOT_FOUND')
            elif variable['meter_type'].lower() == 'virtual_meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_virtual_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.VIRTUAL_METER_OF_VARIABLE_NOT_FOUND')

        add_values = (" INSERT INTO tbl_virtual_meters "
                      "     (name, uuid, equation, energy_category_id, is_counted, "
                      "      cost_center_id, energy_item_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    new_values['expression']['equation'].lower(),
                                    energy_category_id,
                                    is_counted,
                                    cost_center_id,
                                    energy_item_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()

        # add variables
        for variable in new_values['expression']['variables']:
            add_values = (" INSERT INTO tbl_variables (name, virtual_meter_id, meter_type, meter_id) "
                          " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_values, (variable['name'].lower(),
                                        new_id,
                                        variable['meter_type'],
                                        variable['meter_id'],))
            cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/virtualmeters/' + str(new_id)


class VirtualMeterClone:
    def __init__(self):
        """"Initializes VirtualMeterClone"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _=req
        resp.status = falcon.HTTP_200
        _=id_
    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')

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

        query = (" SELECT id, name, uuid, energy_category_id "
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
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, equation, energy_category_id, is_counted, cost_center_id, "
                 "        energy_item_id, description "
                 " FROM tbl_virtual_meters "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "equation": row[3],
                           "energy_category": energy_category_dict.get(row[4], None),
                           "is_counted": True if row[5] else False,
                           "cost_center": cost_center_dict.get(row[6], None),
                           "energy_item": energy_item_dict.get(row[7], None),
                           "description": row[8],
                           "expression": {}}

        expression = dict()

        if meta_result["equation"] is not None:
            expression = {'equation': meta_result["equation"], 'variables': []}

            query_variables = (" SELECT v.id, v.name, v.meter_type, v.meter_id "
                               " FROM tbl_virtual_meters  vm, tbl_variables v "
                               " WHERE vm.id = %s AND v.virtual_meter_id = vm.id "
                               " ORDER BY v.name ")
            cursor.execute(query_variables, (meta_result["id"],))
            rows_variables = cursor.fetchall()
            if rows_variables is not None:
                for row_variable in rows_variables:
                    if row_variable[2].lower() == 'meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable[3],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable[0],
                                                            'name': row_variable[1],
                                                            'meter_type': row_variable[2],
                                                            'meter_id': row_variable[3],
                                                            'meter_name': row_meter[0]})
                    elif row_variable[2].lower() == 'offline_meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_offline_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable[3],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable[0],
                                                            'name': row_variable[1],
                                                            'meter_type': row_variable[2],
                                                            'meter_id': row_variable[3],
                                                            'meter_name': row_meter[0]})
                    elif row_variable[2].lower() == 'virtual_meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_virtual_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable[3],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable[0],
                                                            'name': row_variable[1],
                                                            'meter_type': row_variable[2],
                                                            'meter_id': row_variable[3],
                                                            'meter_name': row_meter[0]})

        meta_result['expression'] = expression
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        new_name = (str.strip(meta_result['name']) +
                    (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
        add_values = (" INSERT INTO tbl_virtual_meters "
                      "     (name, uuid, equation, energy_category_id, is_counted, "
                      "      cost_center_id, energy_item_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (new_name,
                                    str(uuid.uuid4()),
                                    meta_result['expression']['equation'].lower(),
                                    meta_result['energy_category']['id'],
                                    meta_result['is_counted'],
                                    meta_result['cost_center']['id'],
                                    meta_result['energy_item']['id'],
                                    meta_result['description']))
        new_id = cursor.lastrowid
        cnx.commit()

        # add variables
        for variable in meta_result['expression']['variables']:
            add_values = (" INSERT INTO tbl_variables (name, virtual_meter_id, meter_type, meter_id) "
                          " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_values, (variable['name'].lower(),
                                        new_id,
                                        variable['meter_type'],
                                        variable['meter_id'],))
            cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/virtualmeters/' + str(new_id)

        