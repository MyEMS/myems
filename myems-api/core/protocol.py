from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class ProtocolCollection:
    def __init__(self):
        """"Initializes ContactCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
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

        query = (" SELECT id, name, code "
                 " FROM tbl_protocols "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "code": row[2]}
                result.append(meta_result)

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
                                   description='API.INVALID_PROTOCOL_NAME')
        name = str.strip(new_values['data']['name'])

        if 'code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['code'], str) or \
                len(str.strip(new_values['data']['code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PROTOCOL_CODE')
        code = str.strip(new_values['data']['code'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_protocols "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PROTOCOL_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT code "
                       " FROM tbl_protocols "
                       " WHERE code = %s ", (code,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PROTOCOL_CODE_IS_ALREADY_IN_USE')

        add_row = (" INSERT INTO tbl_protocols "
                   "     (name, code) "
                   " VALUES (%s, %s) ")

        cursor.execute(add_row, (name,
                                 code))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/protocols/' + str(new_id)


class ProtocolItem:
    def __init__(self):
        """"Initializes ContactItem"""
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
                                   description='API.INVALID_PROTOCOL_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, code "
                 " FROM tbl_protocols "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PROTOCOL_NOT_FOUND')

        result = {"id": row[0],
                  "name": row[1],
                  "code": row[2]}
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title='API.BAD_REQUEST',
                description='API.INVALID_PROTOCOL_ID'
            )

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute("SELECT name,code FROM tbl_protocols WHERE id = %s", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(
                status=falcon.HTTP_404,
                title='API.NOT_FOUND',
                description='API.PROTOCOL_NOT_FOUND'
            )

        # check if this protocol is being used by any data sources
        code=row[1]
        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE protocol = %s "
                       " LIMIT 1 ",
                       (code,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_DATA_SOURCES')
        cursor.execute(" DELETE FROM tbl_protocols WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_PROTOCOL_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PROTOCOL_NAME')
        name = str.strip(new_values['data']['name'])

        if 'code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['code'], str) or \
                len(str.strip(new_values['data']['code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PROTOCOL_CODE')
        code = str.strip(new_values['data']['code'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_protocols "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchall() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PROTOCOL_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_protocols "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PROTOCOL_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT code "
                       " FROM tbl_protocols "
                       " WHERE code = %s AND id != %s ", (code, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PROTOCOL_CODE_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_protocols "
                      " SET name = %s, code = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    code,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200



