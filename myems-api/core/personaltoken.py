import os
import hashlib
from datetime import datetime, timezone, timedelta

import falcon
import mysql.connector
import simplejson as json

import config
from core.useractivity import user_logger, write_log, access_control

class PersonalTokenCollection:
    @staticmethod
    def __init__():
        """Initializes PersonalTokenCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" select id, token, created_datetime_utc, "
                 " expires_datetime_utc "
                 " from tbl_personal_tokens ")
        cursor.execute(query)
        rows = cursor.fetchall()
        
        token_list = list()
        if rows is not None and len(rows) > 0:
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            for row in rows:
                created_datetime_utc = row[2].replace(tzinfo=timezone.utc) + \
                                        timedelta(minutes=timezone_offset)
                expires_datetime_utc = row[3].replace(tzinfo=timezone.utc) + \
                                        timedelta(minutes=timezone_offset)
                token_list.append({ "id": row[0],
                                    "token": row[1],
                                    "created_datetime_utc": created_datetime_utc.strftime("%Y-%m-%d %H:%M:%S"),
                                    "expires_datetime_utc": expires_datetime_utc.strftime("%Y-%m-%d %H:%M:%S")})

        cursor.close()
        cnx.close()
        resp.text = json.dumps(token_list)

    @staticmethod
    def on_post(req, resp):        
        access_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        created_datetime_utc = datetime.strptime(new_values['data']['created_datetime_utc'],
                                                        '%Y-%m-%dT%H:%M:%S')
        created_datetime_utc = created_datetime_utc.replace(tzinfo=timezone.utc)
        created_datetime_utc -= timedelta(minutes=timezone_offset)

        expires_datetime_utc = datetime.strptime(new_values['data']['expires_datetime_utc'],
                                                         '%Y-%m-%dT%H:%M:%S')
        expires_datetime_utc = expires_datetime_utc.replace(tzinfo=timezone.utc)
        expires_datetime_utc -= timedelta(minutes=timezone_offset)
        
        token = hashlib.sha512(os.urandom(16)).hexdigest()
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        
        cursor.execute(" INSERT INTO tbl_personal_tokens "
                       " (token, created_datetime_utc, expires_datetime_utc) "
                       " VALUES(%s, %s, %s) ", (token, created_datetime_utc, expires_datetime_utc))
        
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/personaltokens/' + str(new_id)


class PersonalTokenItem:
    @staticmethod
    def __init__():
        """Initializes PersonalTokenItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title="API.INVALID_PERSONAL_TOKEN_ID")
        
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT id, token, created_datetime_utc, expires_datetime_utc "
                 " FROM tbl_personal_tokens "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PERSONAL_TOKEN_NOT_FOUND')
        else:
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            created_datetime_utc = row[2].replace(tzinfo=timezone.utc) + \
                                    timedelta(minutes=timezone_offset)
            expires_datetime_utc = row[3].replace(tzinfo=timezone.utc) + \
                                    timedelta(minutes=timezone_offset)
            meta_result = {"id": row[0],
                           "token": row[1],
                           "created_datetime_utc": created_datetime_utc.strftime('%Y-%m-%dT%H:%M:%S'),
                           "expires_datetime_utc": expires_datetime_utc.strftime('%Y-%m-%dT%H:%M:%S')}

        resp.text = json.dumps(meta_result)

    @staticmethod
    def on_put(req, resp, id_):
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title="API.INVALID_PERSONAL_TOKEN_ID")
        
        new_values = json.loads(raw_json)

        if 'created_datetime_utc' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['created_datetime_utc'], str) or \
                len(str.strip(new_values['data']['created_datetime_utc'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CREATED_DATETIME')
        created_datetime_local = str.strip(new_values['data']['created_datetime_utc'])

        if 'expires_datetime_utc' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['expires_datetime_utc'], str) or \
                len(str.strip(new_values['data']['expires_datetime_utc'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPIRES_DATETIME1')
        expires_datetime_local = str.strip(new_values['data']['expires_datetime_utc'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        try:
            created_datetime_utc = datetime.strptime(created_datetime_local,
                                                    '%Y-%m-%dT%H:%M:%S')
            created_datetime_utc = created_datetime_utc.replace(tzinfo=timezone.utc)
            created_datetime_utc -= timedelta(minutes=timezone_offset)
        except ValueError:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                    description="API.INVALID_CREATED_DATETIME2")
        
        try:
            expires_datetime_utc = datetime.strptime(expires_datetime_local,
                                                    '%Y-%m-%dT%H:%M:%S')
            expires_datetime_utc = expires_datetime_utc.replace(tzinfo=timezone.utc)
            expires_datetime_utc -= timedelta(minutes=timezone_offset)
        except ValueError:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                    description="API.INVALID_EXPIRES_DATETIME")
            
            
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT token "
                       " FROM tbl_personal_tokens "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PERSONAL_TOKEN_NOT_FOUND')

        cursor.execute(" UPDATE tbl_personal_tokens "
                       " SET created_datetime_utc = %s, expires_datetime_utc = %s "
                       " WHERE id = %s ", (created_datetime_utc, expires_datetime_utc, id_))
        cnx.commit()
        
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PERSONAL_TOKEN_ID')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT token "
                       " FROM tbl_personal_tokens "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PERSONAL_TOKEN_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_personal_tokens WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204
