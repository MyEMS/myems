import base64
import re
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control
import config


class EmailServerCollection:
    def __init__(self):
        """"Initializes EmailServerCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        admin_control(req)
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, host, port, requires_authentication, user_name, password, from_addr "
                 " FROM tbl_email_servers ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "host": row[1],
                               "port": row[2],
                               "requires_authentication": bool(row[3]),
                               "user_name": row[4],
                               "password": str(base64.b64decode(bytearray(row[5], 'utf-8')), 'utf-8')
                               if row[5] is not None else None,
                               "from_addr": row[6]}
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
            print(ex)
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'host' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['host'], str) or \
                len(str.strip(new_values['data']['host'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL_SERVER_HOST')

        host = str.strip(new_values['data']['host'])

        if 'port' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['port'], int) or \
                new_values['data']['port'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PORT')
        port = float(new_values['data']['port'])

        if 'requires_authentication' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['requires_authentication'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REQUIRES_AUTHENTICATION')
        requires_authentication = new_values['data']['requires_authentication']

        if requires_authentication:
            if 'user_name' not in new_values['data'].keys() or \
                    not isinstance(new_values['data']['user_name'], str) or \
                    len(str.strip(new_values['data']['user_name'])) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_USER_NAME')
            user_name = new_values['data']['user_name']
        else:
            user_name = None

        if requires_authentication:
            if 'password' not in new_values['data'].keys() or \
                    not isinstance(new_values['data']['password'], str) or \
                    len(str.strip(new_values['data']['password'])) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PASSWORD')
            password = base64.b64encode(bytearray(new_values['data']['password'], 'utf-8'))
        else:
            password = None

        if 'from_addr' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['from_addr'], str) or \
                len(str.strip(new_values['data']['from_addr'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FROM_ADDR')
        from_addr = new_values['data']['from_addr']

        match = re.match(r'^[_A-Za-z0-9-]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,4})$',
                         from_addr)
        if match is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FROM_ADDR')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT host "
                       " FROM tbl_email_servers "
                       " WHERE host = %s ", (host,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.EMAIL_SERVER_HOST_IS_ALREADY_IN_USE')

        add_value = (" INSERT INTO tbl_email_servers "
                     "    (host, port, requires_authentication, user_name, password, from_addr) "
                     " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_value, (host,
                                   port,
                                   requires_authentication,
                                   user_name,
                                   password,
                                   from_addr))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/emailservers/' + str(new_id)


class EmailServerItem:
    def __init__(self):
        """"Initializes EmailServerItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='400 Bad Request')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, host, port, requires_authentication, user_name, password, from_addr "
                 " FROM tbl_email_servers "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND')

        result = {"id": row[0],
                  "host": row[1],
                  "port": row[2],
                  "requires_authentication": bool(row[3]),
                  "user_name": row[4],
                  "password": str(base64.b64decode(bytearray(row[5], 'utf-8')), 'utf-8')
                  if row[5] is not None else None,
                  "from_addr": row[5]}
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL_SERVER_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT host "
                       " FROM tbl_email_servers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EMAIL_SERVER_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_email_servers WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_EMAIL_SERVER_ID')

        new_values = json.loads(raw_json)
        if 'host' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['host'], str) or \
                len(str.strip(new_values['data']['host'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL_SERVER_HOST')

        host = str.strip(new_values['data']['host'])

        if 'port' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['port'], int) or \
                new_values['data']['port'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PORT')
        port = float(new_values['data']['port'])

        if 'requires_authentication' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['requires_authentication'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REQUIRES_AUTHENTICATION')
        requires_authentication = new_values['data']['requires_authentication']

        if requires_authentication:
            if 'user_name' not in new_values['data'].keys() or \
                    not isinstance(new_values['data']['user_name'], str) or \
                    len(str.strip(new_values['data']['user_name'])) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_USER_NAME')
            user_name = new_values['data']['user_name']
        else:
            user_name = None

        if requires_authentication:
            if 'password' not in new_values['data'].keys() or \
                    not isinstance(new_values['data']['password'], str) or \
                    len(str.strip(new_values['data']['password'])) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PASSWORD')
            password = base64.b64encode(bytearray(new_values['data']['password'], 'utf-8'))
        else:
            password = None

        if 'from_addr' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['from_addr'], str) or \
                len(str.strip(new_values['data']['from_addr'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FROM_ADDR')
        from_addr = new_values['data']['from_addr']

        match = re.match(r'^[_A-Za-z0-9-]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(\.[A-Za-z]{2,4})$',
                         from_addr)
        if match is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FROM_ADDR')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_email_servers "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EMAIL_SERVER_NOT_FOUND')

        cursor.execute(" SELECT host "
                       " FROM tbl_email_servers "
                       " WHERE host = %s AND id != %s ", (host, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.EMAIL_SERVER_HOST_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_email_servers "
                      " SET host = %s, port = %s, requires_authentication = %s, "
                      "     user_name = %s, password = %s, from_addr = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (host,
                                    port,
                                    requires_authentication,
                                    user_name,
                                    password,
                                    from_addr,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200
