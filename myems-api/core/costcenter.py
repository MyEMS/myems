import falcon
import simplejson as json
import mysql.connector
import config
import uuid


class CostCenterCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, external_id "
                 " FROM tbl_cost_centers "
                 " ORDER BY id")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2], "external_id": row[3]}
                result.append(meta_result)

        resp.body = json.dumps(result)

    @staticmethod
    def on_post(req, resp):
        """Handles POST requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')

        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.ERROR', ex)

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or len(new_values['data']['name']) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NAME_VALUE')
        name = str.strip(new_values['data']['name'])

        if 'external_id' in new_values['data'].keys() and \
                new_values['data']['external_id'] is not None and \
                len(str(new_values['data']['external_id'])) > 0:
            external_id = str.strip(new_values['data']['external_id'])
        else:
            external_id = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE name = %s ", (name, ))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.COST_CENTER_NAME_EXISTS')
        if external_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_cost_centers "
                           " WHERE external_id = %s ", (external_id, ))
            if cursor.fetchone() is not None:
                cursor.close()
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.COST_CENTER_EXTERNAL_ID_EXISTS')

        add_row = (" INSERT INTO tbl_cost_centers "
                   "     (name, uuid, external_id) "
                   " VALUES (%s, %s, %s) ")
        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 external_id,))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/costcenters/' + str(new_id)


class CostCenterItem:
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
                                   description='API.INVALID_COST_CENTER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, external_id "
                 " FROM tbl_cost_centers "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        result = {"id": row[0], "name": row[1], "uuid": row[2], "external_id": row[3]}
        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        # check relation with equipments
        cursor.execute(" SELECT id "
                       " FROM tbl_equipments "
                       " WHERE cost_center_id = %s ", (id_,))
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENTS')

        # check relation with combined equipments
        cursor.execute(" SELECT id "
                       " FROM tbl_combined_equipments "
                       " WHERE cost_center_id = %s ", (id_,))
        rows_combined_equipments = cursor.fetchall()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENTS')

        # check relation with tariffs
        cursor.execute(" SELECT id "
                       " FROM tbl_cost_centers_tariffs "
                       " WHERE cost_center_id = %s ", (id_,))
        rows_tariffs = cursor.fetchall()
        if rows_tariffs is not None and len(rows_tariffs) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_TARIFFS')

        # check relation with meters
        cursor.execute(" SELECT id "
                       " FROM tbl_meters "
                       " WHERE cost_center_id = %s ", (id_,))
        rows_meters = cursor.fetchall()
        if rows_meters is not None and len(rows_meters) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_METERS')

        # check relation with offline meters
        cursor.execute(" SELECT id "
                       " FROM tbl_offline_meters "
                       " WHERE cost_center_id = %s ", (id_,))
        rows_offline_meters = cursor.fetchall()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_OFFLINE_METERS')

        # check relation with virtual meters
        cursor.execute(" SELECT id "
                       " FROM tbl_virtual_meters "
                       " WHERE cost_center_id = %s ", (id_,))
        rows_virtual_meters = cursor.fetchall()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_OFFLINE_METERS')

        # check relation with tenants
        cursor.execute(" SELECT id "
                       " FROM tbl_tenants "
                       " WHERE cost_center_id = %s ", (id_,))
        rows_tenants = cursor.fetchall()
        if rows_tenants is not None and len(rows_tenants) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_TENANTS')

        # check relation with stores
        cursor.execute(" SELECT id "
                       " FROM tbl_stores "
                       " WHERE cost_center_id = %s ", (id_,))
        rows_stores = cursor.fetchall()
        if rows_stores is not None and len(rows_stores) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_STORES')

        # check relation with spaces
        cursor.execute(" SELECT id "
                       " FROM tbl_spaces "
                       " WHERE cost_center_id = %s ", (id_,))
        rows_factories = cursor.fetchall()
        if rows_factories is not None and len(rows_factories) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATIONSHIP_WITH_SPACES')

        # check relation with shopfloors
        cursor.execute(" SELECT id "
                       " FROM tbl_shopfloors "
                       " WHERE cost_center_id = %s ", (id_,))
        rows_shopfloors = cursor.fetchall()
        if rows_shopfloors is not None and len(rows_shopfloors) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SHOPFLOORS')

        cursor.execute(" DELETE FROM tbl_cost_centers WHERE id = %s ", (id_,))
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
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or len(new_values['data']['name']) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NAME_VALUE')
        name = str.strip(new_values['data']['name'])

        if 'external_id' in new_values['data'].keys() and \
                new_values['data']['external_id'] is not None and \
                len(str(new_values['data']['external_id'])) > 0:
            external_id = str.strip(new_values['data']['external_id'])
        else:
            external_id = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE name = %s AND id != %s ",
                       (name, id_, ))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.COST_CENTER_NAME_EXISTS')
        if external_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_cost_centers "
                           " WHERE external_id = %s AND id != %s ",
                           (external_id, id_, ))
            if cursor.fetchone() is not None:
                cursor.close()
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.COST_CENTER_EXTERNAL_ID_EXISTS')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        update_row = (" UPDATE tbl_cost_centers "
                      " SET name = %s, external_id = %s "
                      " WHERE id = %s ")

        cursor.execute(update_row, (name,
                                    external_id,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200


class CostCenterTariffCollection:
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
                                   description='API.INVALID_COST_CENTER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT t.id, t.name, t.uuid, "
                 "        t.tariff_type, t.unit_of_price "
                 " FROM tbl_tariffs t, tbl_cost_centers_tariffs ct "
                 " WHERE t.id = ct.tariff_id AND ct.cost_center_id = %s "
                 " ORDER BY t.name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        cursor.close()
        cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "tariff_type": row[3],
                               "unit_of_price": row[4]}
                result.append(meta_result)

        resp.body = json.dumps(result)

    @staticmethod
    def on_post(req, resp, id_):
        """Handles POST requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=ex)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')

        new_values = json.loads(raw_json)

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_tariffs "
                       " WHERE id = %s ", (new_values['data']['tariff_id'],))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TARIFF_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_cost_centers_tariffs "
                       " WHERE cost_center_id = %s AND tariff_id = %s ", (id_, new_values['data']['tariff_id']))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARIFF_ALREADY_ASSOCIATED_WITH_COST_CENTER')

        add_row = (" INSERT INTO tbl_cost_centers_tariffs "
                   "             (cost_center_id, tariff_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, new_values['data']['tariff_id'],))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/costcenters/' + str(id_) + '/tariffs/' + str(new_values['data']['tariff_id'])


class CostCenterTariffItem:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_, tid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_delete(req, resp, id_, tid):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')

        if not tid.isdigit() or int(tid) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_tariffs "
                       " WHERE id = %s ", (tid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TARIFF_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_cost_centers_tariffs "
                       " WHERE cost_center_id = %s AND tariff_id = %s ", (id_, tid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TARIFF_IS_NOT_ASSOCIATED_WITH_COST_CENTER')

        cursor.execute(" DELETE FROM tbl_cost_centers_tariffs "
                       " WHERE cost_center_id = %s AND tariff_id = %s ", (id_, tid))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_204
