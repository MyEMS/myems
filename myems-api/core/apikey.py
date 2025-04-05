import os
import hashlib
from datetime import datetime, timezone, timedelta
import falcon
import mysql.connector
import simplejson as json
import config
from core.useractivity import admin_control


class ApiKeyCollection:
    def __init__(self):
        """Initializes ApiKeyCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        admin_control(req)
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, token, created_datetime_utc, expires_datetime_utc "
                 " FROM tbl_api_keys ")
        cursor.execute(query)
        rows = cursor.fetchall()
        
        token_list = list()
        if rows is not None and len(rows) > 0:
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            for row in rows:
                token_list.append({"id": row[0],
                                   "name": row[1],
                                   "token": row[2],
                                   "created_datetime": (row[3].replace(tzinfo=timezone.utc)
                                                        + timedelta(minutes=timezone_offset)).isoformat()[0:19],
                                   "expires_datetime": (row[4].replace(tzinfo=timezone.utc)
                                                        + timedelta(minutes=timezone_offset)).isoformat()[0:19]})

        cursor.close()
        cnx.close()
        resp.text = json.dumps(token_list)

    @staticmethod
    def on_post(req, resp):        
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_API_KEY_NAME')
        name = str.strip(new_values['data']['name'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        expires_datetime_local = datetime.strptime(new_values['data']['expires_datetime'], '%Y-%m-%dT%H:%M:%S')
        expires_datetime_utc = expires_datetime_local.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
        
        token = hashlib.sha512(os.urandom(16)).hexdigest()
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name FROM tbl_api_keys"
                       " WHERE name = %s ", (name,))
        rows = cursor.fetchall()

        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.API_KEY_NAME_IS_ALREADY_IN_USE')            
        
        cursor.execute(" INSERT INTO tbl_api_keys "
                       " (name, token, created_datetime_utc, expires_datetime_utc) "
                       " VALUES(%s, %s, %s, %s) ", (name, token, datetime.utcnow(), expires_datetime_utc))
        
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/apikeys/' + str(new_id)


class ApiKeyItem:
    def __init__(self):
        """Initializes ApiKeyItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title="API.INVALID_API_KEY_ID")
        
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, token, created_datetime_utc, expires_datetime_utc "
                 " FROM tbl_api_keys "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.API_KEY_NOT_FOUND')
        else:
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            meta_result = {"id": row[0],
                           "name": row[1],
                           "token": row[2],
                           "created_datetime": (row[3].replace(tzinfo=timezone.utc) +
                                                timedelta(minutes=timezone_offset)).isoformat()[0:19],
                           "expires_datetime": (row[4].replace(tzinfo=timezone.utc) +
                                                timedelta(minutes=timezone_offset)).isoformat()[0:19]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    def on_put(req, resp, id_):
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title="API.INVALID_API_KEY_ID")
        
        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_API_KEY_NAME')
        name = str.strip(new_values['data']['name'])        

        if 'expires_datetime' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['expires_datetime'], str) or \
                len(str.strip(new_values['data']['expires_datetime'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPIRES_DATETIME')
        expires_datetime_local = str.strip(new_values['data']['expires_datetime'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        try:
            expires_datetime_local = datetime.strptime(expires_datetime_local, '%Y-%m-%dT%H:%M:%S')
            expires_datetime_utc = expires_datetime_local.replace(tzinfo=timezone.utc) - \
                timedelta(minutes=timezone_offset)
        except ValueError:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_EXPIRES_DATETIME")

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_api_keys "
                       " WHERE name = %s ", (name,))
        if cursor.fetchall() is not None and \
                len(cursor.fetchall()) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.API_KEY_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT token "
                       " FROM tbl_api_keys "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.API_KEY_NOT_FOUND')

        cursor.execute(" UPDATE tbl_api_keys "
                       " SET name = %s, expires_datetime_utc = %s "
                       " WHERE id = %s ", (name, expires_datetime_utc, id_))
        cnx.commit()
        
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200

    @staticmethod
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_API_KEY_ID')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT token "
                       " FROM tbl_api_keys "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.API_KEY_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_api_keys WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204
