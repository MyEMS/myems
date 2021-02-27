import falcon
import simplejson as json
import mysql.connector
import config
import uuid


class StoreTypeCollection:
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

        query = (" SELECT id, name, uuid, description, simplified_code "
                 " FROM tbl_store_types "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "description": row[3], "simplified_code": row[4]}
                result.append(meta_result)

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
                                   description='API.INVALID_STORE_TYPE_NAME')

        name = str.strip(new_values['data']['name'])

        if 'description' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['description'], str) or \
                len(str.strip(new_values['data']['description'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STORE_TYPE_DESCRIPTION')

        description = str.strip(new_values['data']['description'])

        if 'simplified_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['simplified_code'], str) or \
                len(str.strip(new_values['data']['simplified_code'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STORE_TYPE_SIMPLIFIED_CODE')

        simplified_code = str.strip(new_values['data']['simplified_code'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_store_types "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.STORE_TYPE_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT simplified_code "
                       " FROM tbl_store_types "
                       " WHERE simplified_code = %s ", (simplified_code,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.STORE_TYPE_SIMPLIFIED_CODE_IS_ALREADY_IN_USE')

        add_value = (" INSERT INTO tbl_store_types "
                     "    (name, uuid, description, simplified_code) "
                     " VALUES (%s, %s, %s, %s) ")
        cursor.execute(add_value, (name,
                                   str(uuid.uuid4()),
                                   description,
                                   simplified_code))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/storetypes/' + str(new_id)


class StoreTypeItem:
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
                                   description='API.INVALID_STORE_TYPE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, description, simplified_code "
                 " FROM tbl_store_types "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()
        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.STORE_TYPE_NOT_FOUND')

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "description": row[3],
                  "simplified_code": row[4]}
        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STORE_TYPE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_store_types "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.STORE_TYPE_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_stores "
                       " WHERE store_type_id = %s ", (id_,))
        rows_stores = cursor.fetchall()
        if rows_stores is not None and len(rows_stores) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.STORE_TYPE_USED_IN_STORE')

        cursor.execute(" DELETE FROM tbl_store_types WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_STORE_TYPE_ID')

        new_values = json.loads(raw_json)
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STORE_TYPE_NAME')

        name = str.strip(new_values['data']['name'])

        if 'description' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['description'], str) or \
                len(str.strip(new_values['data']['description'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STORE_TYPE_DESCRIPTION')

        description = str.strip(new_values['data']['description'])

        if 'simplified_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['simplified_code'], str) or \
                len(str.strip(new_values['data']['simplified_code'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STORE_TYPE_SIMPLIFIED_CODE')

        simplified_code = str.strip(new_values['data']['simplified_code'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_store_types "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.STORE_TYPE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_store_types "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.STORE_TYPE_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT simplified_code "
                       " FROM tbl_store_types "
                       " WHERE simplified_code = %s  AND id != %s ", (simplified_code, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.STORE_TYPE_SIMPLIFIED_CODE_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_store_types "
                      " SET name = %s, description = %s, simplified_code = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    description,
                                    simplified_code,
                                    id_,))
        cnx.commit()
        cursor.close()
        cnx.disconnect()
        resp.status = falcon.HTTP_200

