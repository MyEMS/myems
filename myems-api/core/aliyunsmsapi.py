import falcon
import json
import mysql.connector
import config
from core.userlogger import user_logger


class AliyunSMSAPICollection:
    @staticmethod
    def __init__():
        """Initializes AliyunSMSAPICollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, access_key_id, access_key_secret, endpoint, sign_name, template_code "
                 " FROM tbl_aliyun_sms_api ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "access_key_id": row[1],
                               "access_key_secret": row[2],
                               "endpoint": row[3],
                               "sign_name": row[4],
                               "template_code": row[5]}
                result.append(meta_result)

        resp.body = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        new_values = json.loads(raw_json)

        if 'access_key_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['access_key_id'], str) or \
                len(str.strip(new_values['data']['access_key_id'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_ACCESS_KEY_ID')
        access_key_id = str.strip(new_values['data']['access_key_id'])

        if 'access_key_secret' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['access_key_secret'], str) or \
                len(new_values['data']['access_key_secret']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_ACCESS_KEY_SECRET')
        access_key_secret = new_values['data']['access_key_secret']

        if 'endpoint' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['endpoint'], str) or \
                len(new_values['data']['endpoint']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_ENDPOINT')
        endpoint = new_values['data']['endpoint']

        if 'sign_name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['sign_name'], str) or \
                len(new_values['data']['sign_name']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_SIGN_NAME')
        sign_name = new_values['data']['sign_name']

        if 'template_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['template_code'], str) or \
                len(new_values['data']['template_code']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_TEMPLATE_CODE')
        template_code = new_values['data']['template_code']

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_aliyun_sms_api "
                       " WHERE access_key_id = %s ", (access_key_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.ALIYUN_SMS_API_ACCESS_KEY_ID_IS_ALREADY_IN_USE')

        add_value = (" INSERT INTO tbl_aliyun_sms_api "
                     "    (access_key_id, access_key_secret, endpoint, sign_name, template_code) "
                     " VALUES (%s, %s, %s, %s, %s) ")
        cursor.execute(add_value, (access_key_id,
                                   access_key_secret,
                                   endpoint,
                                   sign_name,
                                   template_code))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/aliyunsmsapis/' + str(new_id)


class AliyunSMSAPIItem:
    @staticmethod
    def __init__():
        """Initializes AliyunSMSAPIItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, '400 Bad Request')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, access_key_id, access_key_secret, endpoint, sign_name, template_code "
                 " FROM tbl_aliyun_sms_api "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()
        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, 'API.NOT_FOUND')

        result = {"id": row[0],
                  "access_key_id": row[1],
                  "access_key_secret": row[2],
                  "endpoint": row[3],
                  "sign_name": row[4],
                  "template_code": row[5]}
        resp.body = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT access_key_id "
                       " FROM tbl_aliyun_sms_api "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ALIYUN_SMS_API_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_aliyun_sms_api WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=ex)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_ID')

        new_values = json.loads(raw_json)

        if 'access_key_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['access_key_id'], str) or \
                len(str.strip(new_values['data']['access_key_id'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_ACCESS_KEY_ID')
        access_key_id = str.strip(new_values['data']['access_key_id'])

        if 'access_key_secret' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['access_key_secret'], str) or \
                len(new_values['data']['access_key_secret']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_ACCESS_KEY_SECRET')
        access_key_secret = new_values['data']['access_key_secret']

        if 'endpoint' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['endpoint'], str) or \
                len(new_values['data']['endpoint']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_ENDPOINT')
        endpoint = new_values['data']['endpoint']

        if 'sign_name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['sign_name'], str) or \
                len(new_values['data']['sign_name']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_SIGN_NAME')
        sign_name = new_values['data']['sign_name']

        if 'template_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['template_code'], str) or \
                len(new_values['data']['template_code']) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ALIYUN_SMS_API_TEMPLATE_CODE')
        template_code = new_values['data']['template_code']

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT access_key_id "
                       " FROM tbl_aliyun_sms_api "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ALIYUN_SMS_API_NOT_FOUND')

        cursor.execute(" SELECT access_key_id "
                       " FROM tbl_aliyun_sms_api "
                       " WHERE access_key_id = %s AND id != %s ", (access_key_id, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.ALIYUN_SMS_API_ACCESS_KEY_ID_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_aliyun_sms_api "
                      " SET access_key_id = %s, access_key_secret = %s, endpoint = %s, sign_name = %s, "
                      "     template_code = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (access_key_id,
                                    access_key_secret,
                                    endpoint,
                                    sign_name,
                                    template_code,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200
