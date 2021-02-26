import falcon
import simplejson as json
import mysql.connector
import config
import uuid


class VirtualMeterCollection:
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

        query = (" SELECT id, name, uuid, energy_category_id, is_counted, "
                 "        energy_item_id, cost_center_id, description "
                 " FROM tbl_virtual_meters "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        result = list()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                energy_category = energy_category_dict.get(row['energy_category_id'], None)
                energy_item = energy_item_dict.get(row['energy_item_id'], None)
                cost_center = cost_center_dict.get(row['cost_center_id'], None)
                meta_result = {"id": row['id'],
                               "name": row['name'],
                               "uuid": row['uuid'],
                               "energy_category": energy_category,
                               "is_counted": True if row['is_counted'] else False,
                               "energy_item": energy_item,
                               "cost_center": cost_center,
                               "description": row['description'],
                               "expression": {}}

                expression = dict()
                query_expression = (" SELECT e.id, e.uuid, e.equation "
                                    " FROM tbl_expressions e "
                                    " WHERE e.virtual_meter_id = %s ")
                cursor.execute(query_expression, (row['id'],))
                row_expression = cursor.fetchone()

                if row_expression is not None:
                    expression = {'id': row_expression['id'],
                                  'uuid': row_expression['uuid'],
                                  'equation': row_expression['equation'],
                                  'variables': []}

                    query_variables = (" SELECT v.id, v.name, v.meter_type, v.meter_id "
                                       " FROM tbl_expressions e, tbl_variables v "
                                       " WHERE e.id = %s AND v.expression_id = e.id "
                                       " ORDER BY v.name ")
                    cursor.execute(query_variables, (row_expression['id'],))
                    rows_variables = cursor.fetchall()
                    if rows_variables is not None:
                        for row_variable in rows_variables:
                            if row_variable['meter_type'].lower() == 'meter':
                                query_meter = (" SELECT m.name "
                                               " FROM tbl_meters m "
                                               " WHERE m.id = %s ")
                                cursor.execute(query_meter, (row_variable['meter_id'],))
                                row_meter = cursor.fetchone()
                                if row_meter is not None:
                                    expression['variables'].append({'id': row_variable['id'],
                                                                    'name': row_variable['name'],
                                                                    'meter_type': row_variable['meter_type'],
                                                                    'meter_id': row_variable['meter_id'],
                                                                    'meter_name': row_meter['name']})
                            elif row_variable['meter_type'].lower() == 'offline_meter':
                                query_meter = (" SELECT m.name "
                                               " FROM tbl_offline_meters m "
                                               " WHERE m.id = %s ")
                                cursor.execute(query_meter, (row_variable['meter_id'],))
                                row_meter = cursor.fetchone()
                                if row_meter is not None:
                                    expression['variables'].append({'id': row_variable['id'],
                                                                    'name': row_variable['name'],
                                                                    'meter_type': row_variable['meter_type'],
                                                                    'meter_id': row_variable['meter_id'],
                                                                    'meter_name': row_meter['name']})
                            elif row_variable['meter_type'].lower() == 'virtual_meter':
                                query_meter = (" SELECT m.name "
                                               " FROM tbl_virtual_meters m "
                                               " WHERE m.id = %s ")
                                cursor.execute(query_meter, (row_variable['meter_id'],))
                                row_meter = cursor.fetchone()
                                if row_meter is not None:
                                    expression['variables'].append({'id': row_variable['id'],
                                                                    'name': row_variable['name'],
                                                                    'meter_type': row_variable['meter_type'],
                                                                    'meter_id': row_variable['meter_id'],
                                                                    'meter_name': row_meter['name']})

                meta_result['expression'] = expression
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
                                   description='API.INVALID_VIRTUAL_METER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category_id' not in new_values['data'].keys() or new_values['data']['energy_category_id'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category_id']

        if 'is_counted' not in new_values['data'].keys() or not isinstance(new_values['data']['is_counted'], bool):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COUNTED_VALUE')
        is_counted = new_values['data']['is_counted']

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

        if 'expression' not in new_values['data'].keys():
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION_OBJECT')

        if 'equation' not in new_values['data']['expression'].keys() \
                or len(new_values['data']['expression']['equation']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUATION_IN_EXPRESSION')
        # todo: validate equation with more rules

        if 'variables' not in new_values['data']['expression'].keys() \
                or len(new_values['data']['expression']['variables']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.EMPTY_VARIABLES_ARRAY')

        for variable in new_values['data']['expression']['variables']:
            if 'name' not in variable.keys() or \
                    len(variable['name']) == 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_NAME')
            if 'meter_type' not in variable.keys() or \
                    len(variable['meter_type']) == 0 or \
                    variable['meter_type'].lower() not in ['meter', 'offline_meter', 'virtual_meter']:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_METER_TYPE')
            if 'meter_id' not in variable.keys() or \
                    variable['meter_id'] <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (energy_category_id,))
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

        for variable in new_values['data']['expression']['variables']:
            if variable['meter_type'].lower() == 'meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.disconnect()
                    raise falcon.HTTPError(falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.METER_OF_VARIABLE_NOT_FOUND')
            elif variable['meter_type'].lower() == 'offline_meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_offline_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.disconnect()
                    raise falcon.HTTPError(falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.OFFLINE_METER_OF_VARIABLE_NOT_FOUND')
            elif variable['meter_type'].lower() == 'virtual_meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_virtual_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.disconnect()
                    raise falcon.HTTPError(falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.VIRTUAL_METER_OF_VARIABLE_NOT_FOUND')

        add_values = (" INSERT INTO tbl_virtual_meters "
                      "     (name, uuid, energy_category_id, is_counted, "
                      "      cost_center_id, energy_item_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    energy_category_id,
                                    is_counted,
                                    cost_center_id,
                                    energy_item_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()

        cursor.execute(" SELECT id "
                       " FROM tbl_expressions "
                       " WHERE virtual_meter_id = %s ", (new_id,))
        row_expression = cursor.fetchone()
        if row_expression is not None:
            # delete variables
            cursor.execute(" DELETE FROM tbl_variables WHERE expression_id = %s ", (row_expression[0],))
            # delete expression
            cursor.execute(" DELETE FROM tbl_expressions WHERE id = %s ", (row_expression[0],))
            cnx.commit()

        # add expression
        add_values = (" INSERT INTO tbl_expressions (uuid, virtual_meter_id, equation) "
                      " VALUES (%s, %s, %s) ")
        cursor.execute(add_values, (str(uuid.uuid4()),
                                    new_id,
                                    new_values['data']['expression']['equation'].lower()))
        new_expression_id = cursor.lastrowid
        cnx.commit()

        # add variables
        for variable in new_values['data']['expression']['variables']:
            add_values = (" INSERT INTO tbl_variables (name, expression_id, meter_type, meter_id) "
                          " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_values, (variable['name'].lower(),
                                        new_expression_id,
                                        variable['meter_type'],
                                        variable['meter_id'],))
            cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/virtualmeters/' + str(new_id)


class VirtualMeterItem:
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
                                   description='API.INVALID_VIRTUAL_METER_ID')

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

        query = (" SELECT id, name, uuid, energy_category_id "
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

        query = (" SELECT id, name, uuid, energy_category_id, is_counted, "
                 "        energy_item_id, cost_center_id, description "
                 " FROM tbl_virtual_meters "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')
        else:
            energy_category = energy_category_dict.get(row['energy_category_id'], None)
            energy_item = energy_item_dict.get(row['energy_item_id'], None)
            cost_center = cost_center_dict.get(row['cost_center_id'], None)
            meta_result = {"id": row['id'],
                           "name": row['name'],
                           "uuid": row['uuid'],
                           "energy_category": energy_category,
                           "is_counted": True if row['is_counted'] else False,
                           "energy_item": energy_item,
                           "cost_center": cost_center,
                           "description": row['description'],
                           "expression": {}}

        expression = dict()
        query_expression = (" SELECT e.id, e.uuid, e.equation "
                            " FROM tbl_expressions e "
                            " WHERE e.virtual_meter_id = %s ")
        cursor.execute(query_expression, (id_,))
        row_expression = cursor.fetchone()

        if row_expression is not None:
            expression = {'id': row_expression['id'],
                          'uuid': row_expression['uuid'],
                          'equation': row_expression['equation'],
                          'variables': []}

            query_variables = (" SELECT v.id, v.name, v.meter_type, v.meter_id "
                               " FROM tbl_expressions e, tbl_variables v "
                               " WHERE e.id = %s AND v.expression_id = e.id "
                               " ORDER BY v.name ")
            cursor.execute(query_variables, (row_expression['id'],))
            rows_variables = cursor.fetchall()
            if rows_variables is not None:
                for row_variable in rows_variables:
                    if row_variable['meter_type'].lower() == 'meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable['meter_id'],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable['id'],
                                                            'name': row_variable['name'],
                                                            'meter_type': row_variable['meter_type'],
                                                            'meter_id': row_variable['meter_id'],
                                                            'meter_name': row_meter['name']})
                    elif row_variable['meter_type'].lower() == 'offline_meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_offline_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable['meter_id'],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable['id'],
                                                            'name': row_variable['name'],
                                                            'meter_type': row_variable['meter_type'],
                                                            'meter_id': row_variable['meter_id'],
                                                            'meter_name': row_meter['name']})
                    elif row_variable['meter_type'].lower() == 'virtual_meter':
                        query_meter = (" SELECT m.name "
                                       " FROM tbl_virtual_meters m "
                                       " WHERE m.id = %s ")
                        cursor.execute(query_meter, (row_variable['meter_id'],))
                        row_meter = cursor.fetchone()
                        if row_meter is not None:
                            expression['variables'].append({'id': row_variable['id'],
                                                            'name': row_variable['name'],
                                                            'meter_type': row_variable['meter_type'],
                                                            'meter_id': row_variable['meter_id'],
                                                            'meter_name': row_meter['name']})

        meta_result['expression'] = expression

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(meta_result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT uuid "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')
        else:
            virtual_meter_uuid = row[0]

        # check relations with other virtual meters
        cursor.execute(" SELECT vm.name "
                       " FROM tbl_variables va, tbl_expressions ex, tbl_virtual_meters vm "
                       " WHERE va.meter_id = %s AND va.meter_type = 'virtual_meter' AND va.expression_id = ex.id "
                       " AND ex.virtual_meter_id = vm.id ",
                       (id_,))
        row_virtual_meter = cursor.fetchone()
        if row_virtual_meter is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_OTHER_VIRTUAL_METERS')

        # check relation with spaces
        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_virtual_meters "
                       " WHERE virtual_meter_id = %s ", (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
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
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
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
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENT_PARAMETERS')

        # check relation with equipments
        cursor.execute(" SELECT equipment_id "
                       " FROM tbl_equipments_virtual_meters "
                       " WHERE virtual_meter_id = %s ", (id_,))
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
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
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENT_PARAMETERS')

        # check relations with tenants
        cursor.execute(" SELECT tenant_id "
                       " FROM tbl_tenants_virtual_meters "
                       " WHERE virtual_meter_id = %s ", (id_,))
        rows_tenants = cursor.fetchall()
        if rows_tenants is not None and len(rows_tenants) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_TENANTS')

        # check relations with stores
        cursor.execute(" SELECT store_id "
                       " FROM tbl_stores_virtual_meters "
                       " WHERE virtual_meter_id = %s ", (id_,))
        rows_stores = cursor.fetchall()
        if rows_stores is not None and len(rows_stores) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_STORES')

        # check relations with shopfloors
        cursor.execute(" SELECT shopfloor_id "
                       " FROM tbl_shopfloors_virtual_meters "
                       " WHERE virtual_meter_id = %s ", (id_,))
        rows_shopfloors = cursor.fetchall()
        if rows_shopfloors is not None and len(rows_shopfloors) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SHOPFLOORS')

        cursor.execute(" SELECT id "
                       " FROM tbl_expressions "
                       " WHERE virtual_meter_id = %s ", (id_,))
        row_expression = cursor.fetchone()
        if row_expression is not None:
            # delete variables
            cursor.execute(" DELETE FROM tbl_variables WHERE expression_id = %s ", (row_expression[0],))
            # delete expression
            cursor.execute(" DELETE FROM tbl_expressions WHERE id = %s ", (row_expression[0],))
            cnx.commit()

        # check relation with energy flow diagram links
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE meter_uuid = %s ", (virtual_meter_uuid,))
        rows_links = cursor.fetchall()
        if rows_links is not None and len(rows_links) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_FLOW_DIAGRAM_LINKS')

        cursor.execute(" DELETE FROM tbl_virtual_meters WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_VIRTUAL_METER_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category_id' not in new_values['data'].keys() or new_values['data']['energy_category_id'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category_id']

        if 'is_counted' not in new_values['data'].keys() or not isinstance(new_values['data']['is_counted'], bool):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COUNTED_VALUE')
        is_counted = new_values['data']['is_counted']

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

        if 'expression' not in new_values['data'].keys():
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION_OBJECT')

        if 'equation' not in new_values['data']['expression'].keys() \
                or len(new_values['data']['expression']['equation']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUATION_IN_EXPRESSION')
        # todo: validate equation with more rules

        if 'variables' not in new_values['data']['expression'].keys() \
                or len(new_values['data']['expression']['variables']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.EMPTY_VARIABLES_ARRAY')

        for variable in new_values['data']['expression']['variables']:
            if 'name' not in variable.keys() or \
                    len(variable['name']) == 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_NAME')
            if 'meter_type' not in variable.keys() or \
                len(variable['meter_type']) == 0 or \
                    variable['meter_type'].lower() not in ['meter', 'offline_meter', 'virtual_meter']:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_METER_TYPE')
            if 'meter_id' not in variable.keys() or \
                    variable['meter_id'] <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VARIABLE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.VIRTUAL_METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (energy_category_id,))
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

        for variable in new_values['data']['expression']['variables']:
            if variable['meter_type'].lower() == 'meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.disconnect()
                    raise falcon.HTTPError(falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.METER_OF_VARIABLE_NOT_FOUND')
            elif variable['meter_type'].lower() == 'offline_meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_offline_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.disconnect()
                    raise falcon.HTTPError(falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.OFFLINE_METER_OF_VARIABLE_NOT_FOUND')
            elif variable['meter_type'].lower() == 'virtual_meter':
                cursor.execute(" SELECT name "
                               " FROM tbl_virtual_meters "
                               " WHERE id = %s ", (variable['meter_id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.disconnect()
                    raise falcon.HTTPError(falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.VIRTUAL_METER_OF_VARIABLE_NOT_FOUND')

        update_row = (" UPDATE tbl_virtual_meters "
                      " SET name = %s, energy_category_id = %s, is_counted = %s, "
                      "     cost_center_id = %s, energy_item_id = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    energy_category_id,
                                    is_counted,
                                    cost_center_id,
                                    energy_item_id,
                                    description,
                                    id_,))
        cnx.commit()

        cursor.execute(" SELECT id "
                       " FROM tbl_expressions "
                       " WHERE virtual_meter_id = %s ", (id_,))
        row_expression = cursor.fetchone()
        if row_expression is not None:
            # delete variables
            cursor.execute(" DELETE FROM tbl_variables WHERE expression_id = %s ", (row_expression[0],))
            # delete expression
            cursor.execute(" DELETE FROM tbl_expressions WHERE id = %s ", (row_expression[0],))
            cnx.commit()

        # add expression
        add_values = (" INSERT INTO tbl_expressions (uuid, virtual_meter_id, equation) "
                      " VALUES (%s, %s, %s) ")
        cursor.execute(add_values, (str(uuid.uuid4()),
                                    id_,
                                    new_values['data']['expression']['equation'].lower()))
        new_expression_id = cursor.lastrowid
        cnx.commit()

        # add variables
        for variable in new_values['data']['expression']['variables']:
            add_values = (" INSERT INTO tbl_variables (name, expression_id, meter_type, meter_id) "
                          " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_values, (variable['name'].lower(),
                                        new_expression_id,
                                        variable['meter_type'],
                                        variable['meter_id'],))
            cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200

