import falcon
import simplejson as json
import mysql.connector
import config
import uuid
import hashlib
import re
import os
from datetime import datetime, timedelta


class UserCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT u.id, u.name, u.display_name, u.uuid, "
                 "        u.email, u.is_admin, p.id,p.name "
                 " FROM tbl_users u "
                 " LEFT JOIN tbl_privileges p ON u.privilege_id = p.id "
                 " ORDER BY u.name ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "display_name": row[2],
                               "uuid": row[3],
                               "email": row[4],
                               "is_admin": True if row[5] else False,
                               "privilege": {
                                   "id": row[6],
                                   "name": row[7]} if row[6] is not None else None}
                result.append(meta_result)

        resp.body = json.dumps(result)

    @staticmethod
    def on_post(req, resp):
        """Handles POST requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=ex)

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'display_name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['display_name'], str) or \
                len(str.strip(new_values['data']['display_name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISPLAY_NAME')
        display_name = str.strip(new_values['data']['display_name'])

        if 'email' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['email'], str) or \
                len(str.strip(new_values['data']['email'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')
        email = str.lower(str.strip(new_values['data']['email']))

        match = re.match(r'^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email)
        if match is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')

        if 'is_admin' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_admin'], bool):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ADMIN_VALUE')
        is_admin = new_values['data']['is_admin']

        if 'privilege_id' in new_values['data'].keys():
            if not isinstance(new_values['data']['privilege_id'], int) or \
                    new_values['data']['privilege_id'] <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PRIVILEGE_ID')
            privilege_id = new_values['data']['privilege_id']
        else:
            privilege_id = None

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.USER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE email = %s ", (email,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.EMAIL_IS_ALREADY_IN_USE')

        if privilege_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_privileges "
                           " WHERE id = %s ",
                           (privilege_id,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.PRIVILEGE_NOT_FOUND')

        add_row = (" INSERT INTO tbl_users "
                   "     (name, uuid, display_name, email, salt, password, is_admin, privilege_id) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")

        salt = uuid.uuid4().hex
        password = new_values['data']['password']
        hashed_password = hashlib.sha512(salt.encode() + password.encode()).hexdigest()

        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 display_name,
                                 email,
                                 salt,
                                 hashed_password,
                                 is_admin,
                                 privilege_id))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/users/' + str(new_id)


class UserItem:
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
                                   description='API.INVALID_USER_ID')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, display_name, uuid, email "
                 " FROM tbl_users "
                 " WHERE id =%s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        result = {"id": row[0],
                  "name": row[1],
                  "display_name": row[2],
                  "uuid": row[3],
                  "email": row[4]}
        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        # TODO: delete associated objects
        cursor.execute(" DELETE FROM tbl_users WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'display_name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['display_name'], str) or \
                len(str.strip(new_values['data']['display_name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISPLAY_NAME')
        display_name = str.strip(new_values['data']['display_name'])

        if 'email' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['email'], str) or \
                len(str.strip(new_values['data']['email'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')
        email = str.lower(str.strip(new_values['data']['email']))

        match = re.match(r'^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email)
        if match is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')

        if 'is_admin' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_admin'], bool):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ADMIN_VALUE')
        is_admin = new_values['data']['is_admin']

        if 'privilege_id' in new_values['data'].keys():
            if not isinstance(new_values['data']['privilege_id'], int) or \
                    new_values['data']['privilege_id'] <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PRIVILEGE_ID')
            privilege_id = new_values['data']['privilege_id']
        else:
            privilege_id = None

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.USER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE email = %s AND id != %s ", (email, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.EMAIL_IS_ALREADY_IN_USE')

        if privilege_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_privileges "
                           " WHERE id = %s ",
                           (privilege_id,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.PRIVILEGE_NOT_FOUND')

        update_row = (" UPDATE tbl_users "
                      " SET name = %s, display_name = %s, email = %s, "
                      "     is_admin = %s, privilege_id = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    display_name,
                                    email,
                                    is_admin,
                                    privilege_id,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200


class UserLogin:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_put(req, resp):
        """Handles PUT requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=ex)

        if not isinstance(new_values['data']['password'], str) or \
                len(str.strip(new_values['data']['password'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PASSWORD')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        result = dict()

        if 'name' in new_values['data']:

            if not isinstance(new_values['data']['name'], str) or \
                    len(str.strip(new_values['data']['name'])) == 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_USER_NAME')

            query = (" SELECT id, name, uuid, display_name, email, salt, password, is_admin "
                     " FROM tbl_users "
                     " WHERE name = %s ")
            cursor.execute(query, (str.strip(new_values['data']['name']).lower(),))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_404, 'API.ERROR', 'API.USER_NOT_FOUND')

            result = {"id": row[0],
                      "name": row[1],
                      "uuid": row[2],
                      "display_name": row[3],
                      "email": row[4],
                      "salt": row[5],
                      "password": row[6],
                      "is_admin": True if row[7] else False}

        elif 'email' in new_values['data']:
            if not isinstance(new_values['data']['email'], str) or \
                    len(str.strip(new_values['data']['email'])) == 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_EMAIL')

            query = (" SELECT id, name, uuid, display_name, email, salt, password, is_admin "
                     " FROM tbl_users "
                     " WHERE email = %s ")
            cursor.execute(query, (str.strip(new_values['data']['email']).lower(),))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_404, 'API.ERROR', 'API.USER_NOT_FOUND')

            result = {"id": row[0],
                      "name": row[1],
                      "uuid": row[2],
                      "display_name": row[3],
                      "email": row[4],
                      "salt": row[5],
                      "password": row[6],
                      "is_admin": True if row[7] else False}
        else:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_NAME_OR_EMAIL')

        salt = result['salt']
        password = str.strip(new_values['data']['password'])
        hashed_password = hashlib.sha512(salt.encode() + password.encode()).hexdigest()

        if hashed_password != result['password']:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST', 'API.INVALID_PASSWORD')

        add_session = (" INSERT INTO tbl_sessions "
                       "             (user_uuid, token, utc_expires) "
                       " VALUES (%s, %s, %s) ")
        user_uuid = result['uuid']
        token = hashlib.sha1(os.urandom(24)).hexdigest()
        utc_expires = datetime.utcnow() + timedelta(seconds=1000 * 60 * 60 * 8)
        cursor.execute(add_session, (user_uuid, token, utc_expires))
        cnx.commit()
        cursor.close()
        cnx.disconnect()
        resp.set_cookie('user_uuid', user_uuid,
                        domain=config.myems_api_domain, path='/', secure=False, http_only=False)
        resp.set_cookie('token', token,
                        domain=config.myems_api_domain, path='/', secure=False, http_only=False)
        del result['salt']
        del result['password']
        result['token'] = token

        resp.body = json.dumps(result)
        resp.status = falcon.HTTP_200


class UserLogout:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_put(req, resp):
        """Handles PUT requests"""

        if 'USER-UUID' not in req.headers or \
                not isinstance(req.headers['USER-UUID'], str) or \
                len(str.strip(req.headers['USER-UUID'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_UUID')
        user_uuid = str.strip(req.headers['USER-UUID'])

        if 'TOKEN' not in req.headers or \
                not isinstance(req.headers['TOKEN'], str) or \
                len(str.strip(req.headers['TOKEN'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOKEN')
        token = str.strip(req.headers['TOKEN'])

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        query = (" DELETE FROM tbl_sessions "
                 " WHERE user_uuid = %s AND token = %s ")
        cursor.execute(query, (user_uuid, token,))
        rowcount = cursor.rowcount
        cnx.commit()
        cursor.close()
        cnx.disconnect()
        if rowcount is None or rowcount == 0:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_SESSION_NOT_FOUND')

        resp.set_cookie('user_uuid', '',
                        domain=config.myems_api_domain, path='/', secure=False, http_only=False)
        resp.set_cookie('token', '',
                        domain=config.myems_api_domain, path='/', secure=False, http_only=False)
        resp.body = json.dumps("OK")
        resp.status = falcon.HTTP_200


class ChangePassword:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_put(req, resp):
        """Handles PUT requests"""
        if 'USER-UUID' not in req.headers or \
                not isinstance(req.headers['USER-UUID'], str) or \
                len(str.strip(req.headers['USER-UUID'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_UUID')
        user_uuid = str.strip(req.headers['USER-UUID'])

        if 'TOKEN' not in req.headers or \
                not isinstance(req.headers['TOKEN'], str) or \
                len(str.strip(req.headers['TOKEN'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOKEN')
        token = str.strip(req.headers['TOKEN'])

        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.ERROR', ex.args)

        if 'old_password' not in new_values['data'] or \
                not isinstance(new_values['data']['old_password'], str) or \
                len(str.strip(new_values['data']['old_password'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OLD_PASSWORD')
        old_password = str.strip(new_values['data']['old_password'])

        if 'new_password' not in new_values['data'] or \
                not isinstance(new_values['data']['new_password'], str) or \
                len(str.strip(new_values['data']['new_password'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NEW_PASSWORD')
        new_password = str.strip(new_values['data']['new_password'])

        # Verify User Session

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        query = (" SELECT utc_expires "
                 " FROM tbl_sessions "
                 " WHERE user_uuid = %s AND token = %s")
        cursor.execute(query, (user_uuid, token,))
        row = cursor.fetchone()

        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_SESSION_NOT_FOUND')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                cursor.close()
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.USER_SESSION_TIMEOUT')

        query = (" SELECT salt, password "
                 " FROM tbl_users "
                 " WHERE uuid = %s ")
        cursor.execute(query, (user_uuid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, 'API.NOT_FOUND', 'API.USER_NOT_FOUND')

        result = {'salt': row[0], 'password': row[1]}

        # verify old password
        salt = result['salt']
        hashed_password = hashlib.sha512(salt.encode() + old_password.encode()).hexdigest()

        if hashed_password != result['password']:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST', 'API.INVALID_OLD_PASSWORD')

        # Update User password
        salt = uuid.uuid4().hex
        hashed_password = hashlib.sha512(salt.encode() + new_password.encode()).hexdigest()

        update_user = (" UPDATE tbl_users "
                       " SET salt = %s, password = %s "
                       " WHERE uuid = %s ")
        cursor.execute(update_user, (salt, hashed_password, user_uuid,))
        cnx.commit()

        # Refresh User session
        update_session = (" UPDATE tbl_sessions "
                          " SET utc_expires = %s "
                          " WHERE user_uuid = %s AND token = %s ")
        utc_expires = datetime.utcnow() + timedelta(seconds=1000 * 60 * 60 * 8)
        cursor.execute(update_session, (utc_expires, user_uuid, token, ))
        cnx.commit()

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps("OK")
        resp.status = falcon.HTTP_200


class ResetPassword:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_put(req, resp):
        """Handles PUT requests"""
        if 'USER-UUID' not in req.headers or \
                not isinstance(req.headers['USER-UUID'], str) or \
                len(str.strip(req.headers['USER-UUID'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_UUID')
        admin_user_uuid = str.strip(req.headers['USER-UUID'])

        if 'TOKEN' not in req.headers or \
                not isinstance(req.headers['TOKEN'], str) or \
                len(str.strip(req.headers['TOKEN'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOKEN')
        admin_token = str.strip(req.headers['TOKEN'])

        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, 'API.ERROR', ex.args)

        if 'name' not in new_values['data'] or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_NAME')
        user_name = str.strip(new_values['data']['name'])

        if 'password' not in new_values['data'] or \
                not isinstance(new_values['data']['password'], str) or \
                len(str.strip(new_values['data']['password'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PASSWORD')
        new_password = str.strip(new_values['data']['password'])

        # Verify Administrator
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        query = (" SELECT utc_expires "
                 " FROM tbl_sessions "
                 " WHERE user_uuid = %s AND token = %s")
        cursor.execute(query, (admin_user_uuid, admin_token,))
        row = cursor.fetchone()

        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ADMINISTRATOR_SESSION_NOT_FOUND')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                cursor.close()
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.ADMINISTRATOR_SESSION_TIMEOUT')

        query = (" SELECT name "
                 " FROM tbl_users "
                 " WHERE uuid = %s AND is_admin = true ")
        cursor.execute(query, (admin_user_uuid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST', 'API.INVALID_PRIVILEGE')

        salt = uuid.uuid4().hex
        hashed_password = hashlib.sha512(salt.encode() + new_password.encode()).hexdigest()

        update_user = (" UPDATE tbl_users "
                       " SET salt = %s, password = %s "
                       " WHERE name = %s ")
        cursor.execute(update_user, (salt, hashed_password, user_name,))
        cnx.commit()

        # Refresh administrator session
        update_session = (" UPDATE tbl_sessions "
                          " SET utc_expires = %s "
                          " WHERE user_uuid = %s and token = %s ")
        utc_expires = datetime.utcnow() + timedelta(seconds=1000 * 60 * 60 * 8)
        cursor.execute(update_session, (utc_expires, admin_user_uuid, admin_token, ))
        cnx.commit()

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps("OK")
        resp.status = falcon.HTTP_200
