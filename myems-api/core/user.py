import hashlib
import os
import re
import uuid
from datetime import datetime, timedelta, timezone
import random
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, write_log, admin_control
import config


class UserCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        admin_control(req)
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        query = (" SELECT u.id, u.name, u.display_name, u.uuid, "
                 "        u.email, u.is_admin, u.is_read_only, p.id, p.name, "
                 "        u.account_expiration_datetime_utc, u.password_expiration_datetime_utc, u.failed_login_count "
                 " FROM tbl_users u "
                 " LEFT JOIN tbl_privileges p ON u.privilege_id = p.id "
                 " ORDER BY u.name ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "display_name": row[2],
                               "uuid": row[3],
                               "email": row[4],
                               "is_admin": True if row[5] else False,
                               "is_read_only": (True if row[6] else False) if row[5] else None,
                               "privilege": {
                                   "id": row[7],
                                   "name": row[8]} if row[7] is not None else None,
                               "account_expiration_datetime":
                                   (row[9].replace(tzinfo=timezone.utc) +
                                    timedelta(minutes=timezone_offset)).isoformat()[0:19],
                               "password_expiration_datetime":
                                   (row[10].replace(tzinfo=timezone.utc) +
                                    timedelta(minutes=timezone_offset)).isoformat()[0:19],
                               "is_locked": True if row[11] >= config.maximum_failed_login_count else False}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        # todo: add user log
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
                                   description='API.INVALID_USER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'display_name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['display_name'], str) or \
                len(str.strip(new_values['data']['display_name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISPLAY_NAME')
        display_name = str.strip(new_values['data']['display_name'])

        if 'email' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['email'], str) or \
                len(str.strip(new_values['data']['email'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')
        email = str.lower(str.strip(new_values['data']['email']))

        match = re.match(r'^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email)
        if match is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')

        if 'password' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['password'], str) or \
                len(str.strip(new_values['data']['password'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PASSWORD')

        if len(str.strip(new_values['data']['password'])) > 100:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PASSWORD_LENGTH_CANNOT_EXCEED_100_CHARACTERS')

        if 'is_admin' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_admin'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ADMIN_VALUE')
        is_admin = new_values['data']['is_admin']

        is_read_only = False

        if is_admin:
            if 'is_read_only' not in new_values['data'].keys() or \
                   not isinstance(new_values['data']['is_read_only'], bool):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_IS_READ_ONLY_VALUE')
            is_read_only = new_values['data']['is_read_only']

        if 'privilege_id' in new_values['data'].keys():
            if not isinstance(new_values['data']['privilege_id'], int) or \
                    new_values['data']['privilege_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PRIVILEGE_ID')
            privilege_id = new_values['data']['privilege_id']
        else:
            privilege_id = None

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        account_expiration_datetime = datetime.strptime(new_values['data']['account_expiration_datetime'],
                                                        '%Y-%m-%dT%H:%M:%S')
        account_expiration_datetime = account_expiration_datetime.replace(tzinfo=timezone.utc)
        account_expiration_datetime -= timedelta(minutes=timezone_offset)

        password_expiration_datetime = datetime.strptime(new_values['data']['password_expiration_datetime'],
                                                         '%Y-%m-%dT%H:%M:%S')
        password_expiration_datetime = password_expiration_datetime.replace(tzinfo=timezone.utc)
        password_expiration_datetime -= timedelta(minutes=timezone_offset)

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE email = %s ", (email,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.EMAIL_IS_ALREADY_IN_USE')

        if privilege_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_privileges "
                           " WHERE id = %s ",
                           (privilege_id,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.PRIVILEGE_NOT_FOUND')

        add_row = (" INSERT INTO tbl_users "
                   "     (name, uuid, display_name, email, salt, password, is_admin, is_read_only, privilege_id, "
                   "      account_expiration_datetime_utc, password_expiration_datetime_utc, failed_login_count) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")

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
                                 is_read_only,
                                 privilege_id,
                                 account_expiration_datetime,
                                 password_expiration_datetime,
                                 0))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/users/' + str(new_id)


class UserItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT u.id, u.name, u.display_name, u.uuid, "
                 "        u.email, u.is_admin, u.is_read_only, p.id, p.name, "
                 "        u.account_expiration_datetime_utc, u.password_expiration_datetime_utc,"
                 "        u.failed_login_count "
                 " FROM tbl_users u "
                 " LEFT JOIN tbl_privileges p ON u.privilege_id = p.id "
                 " WHERE u.id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result = {"id": row[0],
                  "name": row[1],
                  "display_name": row[2],
                  "uuid": row[3],
                  "email": row[4],
                  "is_admin": True if row[5] else False,
                  "is_read_only": (True if row[6] else False) if row[5] else None,
                  "privilege": {
                      "id": row[7],
                      "name": row[8]} if row[7] is not None else None,
                  "account_expiration_datetime":
                      (row[9].replace(tzinfo=timezone.utc) +
                       timedelta(minutes=timezone_offset)).isoformat()[0:19],
                  "password_expiration_datetime":
                      (row[10].replace(tzinfo=timezone.utc) +
                       timedelta(minutes=timezone_offset)).isoformat()[0:19],
                  "is_locked": True if row[11] >= config.maximum_failed_login_count else False}
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        cnx_user_db = mysql.connector.connect(**config.myems_user_db)
        cursor_user_db = cnx_user_db.cursor()
        user_uuid = None
        cursor_user_db.execute(" SELECT uuid "
                               " FROM tbl_users "
                               " WHERE id = %s ", (id_,))
        row = cursor_user_db.fetchone()
        if row is None:
            cursor_user_db.close()
            cnx_user_db.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')
        else:
            user_uuid = row[0]

        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()

        # check if this user is being used by energy storage power stations
        cursor_system_db.execute(" DELETE FROM tbl_energy_storage_power_stations_users WHERE user_id = %s ", (id_,))
        cnx_system_db.commit()

        # check if this user is being used by microgrids
        cursor_system_db.execute(" DELETE FROM tbl_microgrids_users WHERE user_id = %s ", (id_,))
        cnx_system_db.commit()

        cursor_user_db.execute(" DELETE FROM tbl_sessions WHERE user_uuid = %s ", (user_uuid,))
        cnx_user_db.commit()

        cursor_user_db.execute(" DELETE FROM tbl_logs WHERE user_uuid = %s ", (user_uuid,))
        cnx_user_db.commit()

        cursor_user_db.execute(" DELETE FROM tbl_notifications WHERE user_id = %s ", (id_,))
        cnx_user_db.commit()

        cursor_user_db.execute(" DELETE FROM tbl_users WHERE id = %s ", (id_,))
        cnx_user_db.commit()

        cursor_user_db.close()
        cnx_user_db.close()
        cursor_system_db.close()
        cnx_system_db.close()
        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'display_name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['display_name'], str) or \
                len(str.strip(new_values['data']['display_name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISPLAY_NAME')
        display_name = str.strip(new_values['data']['display_name'])

        if 'email' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['email'], str) or \
                len(str.strip(new_values['data']['email'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')
        email = str.lower(str.strip(new_values['data']['email']))

        match = re.match(r'^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email)
        if match is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')

        if 'is_admin' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_admin'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ADMIN_VALUE')
        is_admin = new_values['data']['is_admin']

        is_read_only = False

        if is_admin:
            if 'is_read_only' not in new_values['data'].keys() or \
                   not isinstance(new_values['data']['is_read_only'], bool):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_IS_READ_ONLY_VALUE')
            is_read_only = new_values['data']['is_read_only']

        if 'privilege_id' in new_values['data'].keys():
            if not isinstance(new_values['data']['privilege_id'], int) or \
                    new_values['data']['privilege_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PRIVILEGE_ID')
            privilege_id = new_values['data']['privilege_id']
        else:
            privilege_id = None

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        account_expiration_datetime = datetime.strptime(new_values['data']['account_expiration_datetime'],
                                                        '%Y-%m-%dT%H:%M:%S')
        account_expiration_datetime = account_expiration_datetime.replace(tzinfo=timezone.utc)
        account_expiration_datetime -= timedelta(minutes=timezone_offset)

        password_expiration_datetime = datetime.strptime(new_values['data']['password_expiration_datetime'],
                                                         '%Y-%m-%dT%H:%M:%S')
        password_expiration_datetime = password_expiration_datetime.replace(tzinfo=timezone.utc)
        password_expiration_datetime -= timedelta(minutes=timezone_offset)

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE email = %s AND id != %s ", (email, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.EMAIL_IS_ALREADY_IN_USE')

        if privilege_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_privileges "
                           " WHERE id = %s ",
                           (privilege_id,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.PRIVILEGE_NOT_FOUND')

        update_row = (" UPDATE tbl_users "
                      " SET name = %s, display_name = %s, email = %s, "
                      "     is_admin = %s, is_read_only = %s, privilege_id = %s,"
                      "     account_expiration_datetime_utc = %s, "
                      "     password_expiration_datetime_utc = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    display_name,
                                    email,
                                    is_admin,
                                    is_read_only,
                                    privilege_id,
                                    account_expiration_datetime,
                                    password_expiration_datetime,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class UserLogin:
    def __init__(self):
        """Initializes Class"""
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
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not isinstance(new_values['data']['password'], str) or \
                len(str.strip(new_values['data']['password'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PASSWORD')

        if len(str.strip(new_values['data']['password'])) > 100:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PASSWORD_LENGTH_CANNOT_EXCEED_100_CHARACTERS')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        if 'name' in new_values['data']:

            if not isinstance(new_values['data']['name'], str) or \
                    len(str.strip(new_values['data']['name'])) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_USER_NAME')

            query = (" SELECT id, name, uuid, display_name, email, salt, password, is_admin, is_read_only, "
                     "        account_expiration_datetime_utc, password_expiration_datetime_utc, failed_login_count "
                     " FROM tbl_users "
                     " WHERE name = %s ")
            cursor.execute(query, (str.strip(new_values['data']['name']).lower(),))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.ERROR', description='API.USER_NOT_FOUND')

            result = {"id": row[0],
                      "name": row[1],
                      "uuid": row[2],
                      "display_name": row[3],
                      "email": row[4],
                      "salt": row[5],
                      "password": row[6],
                      "is_admin": True if row[7] else False,
                      "is_read_only": (True if row[8] else False) if row[7] else None,
                      "account_expiration_datetime_utc": row[9],
                      "password_expiration_datetime_utc": row[10],
                      "failed_login_count": row[11]}

        elif 'email' in new_values['data']:
            if not isinstance(new_values['data']['email'], str) or \
                    len(str.strip(new_values['data']['email'])) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_EMAIL')

            query = (" SELECT id, name, uuid, display_name, email, salt, password, is_admin, is_read_only, "
                     "        account_expiration_datetime_utc, password_expiration_datetime_utc,failed_login_count "
                     " FROM tbl_users "
                     " WHERE email = %s ")
            cursor.execute(query, (str.strip(new_values['data']['email']).lower(),))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.ERROR', description='API.USER_NOT_FOUND')

            result = {"id": row[0],
                      "name": row[1],
                      "uuid": row[2],
                      "display_name": row[3],
                      "email": row[4],
                      "salt": row[5],
                      "password": row[6],
                      "is_admin": True if row[7] else False,
                      "is_read_only": (True if row[8] else False) if row[7] else None,
                      "account_expiration_datetime_utc": row[9],
                      "password_expiration_datetime_utc": row[10],
                      "failed_login_count": row[11]}

        else:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_NAME_OR_EMAIL')

        failed_login_count = result['failed_login_count']

        if failed_login_count >= config.maximum_failed_login_count:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.USER_ACCOUNT_HAS_BEEN_LOCKED')

        salt = result['salt']
        password = str.strip(new_values['data']['password'])
        hashed_password = hashlib.sha512(salt.encode() + password.encode()).hexdigest()

        if hashed_password != result['password']:
            update_failed_login_count = (" UPDATE tbl_users "
                                         " SET failed_login_count = %s "
                                         " WHERE uuid = %s ")
            user_uuid = result['uuid']
            cursor.execute(update_failed_login_count, (failed_login_count + 1, user_uuid))
            cnx.commit()
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_PASSWORD')

        if failed_login_count != 0:
            update_failed_login_count = (" UPDATE tbl_users "
                                         " SET failed_login_count = 0 "
                                         " WHERE uuid = %s ")
            user_uuid = result['uuid']
            cursor.execute(update_failed_login_count, (user_uuid, ))
            cnx.commit()

        if result['account_expiration_datetime_utc'] <= datetime.utcnow():
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.USER_ACCOUNT_HAS_EXPIRED')

        if result['password_expiration_datetime_utc'] <= datetime.utcnow():
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.USER_PASSWORD_HAS_EXPIRED')

        add_session = (" INSERT INTO tbl_sessions "
                       "             (user_uuid, token, utc_expires) "
                       " VALUES (%s, %s, %s) ")
        user_uuid = result['uuid']
        token = hashlib.sha512(os.urandom(24)).hexdigest()
        utc_expires = datetime.utcnow() + timedelta(seconds=config.session_expires_in_seconds)
        cursor.execute(add_session, (user_uuid, token, utc_expires))
        cnx.commit()
        cursor.close()
        cnx.close()
        del result['salt']
        del result['password']

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result['account_expiration_datetime'] = \
            (result['account_expiration_datetime_utc'].replace(tzinfo=timezone.utc) +
             timedelta(minutes=timezone_offset)).isoformat()[0:19]
        del result['account_expiration_datetime_utc']

        result['password_expiration_datetime'] = \
            (result['password_expiration_datetime_utc'].replace(tzinfo=timezone.utc) +
             timedelta(minutes=timezone_offset)).isoformat()[0:19]
        del result['password_expiration_datetime_utc']

        result['token'] = token

        resp.text = json.dumps(result)
        resp.status = falcon.HTTP_200
        write_log(user_uuid=user_uuid, request_method='PUT', resource_type='UserLogin',
                  resource_id=None, request_body=None)


class UserLogout:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_put(req, resp):
        """Handles PUT requests"""

        if 'USER-UUID' not in req.headers or \
                not isinstance(req.headers['USER-UUID'], str) or \
                len(str.strip(req.headers['USER-UUID'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_UUID')
        user_uuid = str.strip(req.headers['USER-UUID'])

        if 'TOKEN' not in req.headers or \
                not isinstance(req.headers['TOKEN'], str) or \
                len(str.strip(req.headers['TOKEN'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
        cnx.close()
        if rowcount is None or rowcount == 0:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_SESSION_NOT_FOUND')
        resp.text = json.dumps("OK")
        resp.status = falcon.HTTP_200


class ChangePassword:
    def __init__(self):
        """Initializes Class"""
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
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_UUID')
        user_uuid = str.strip(req.headers['USER-UUID'])

        if 'TOKEN' not in req.headers or \
                not isinstance(req.headers['TOKEN'], str) or \
                len(str.strip(req.headers['TOKEN'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOKEN')
        token = str.strip(req.headers['TOKEN'])

        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if 'old_password' not in new_values['data'] or \
                not isinstance(new_values['data']['old_password'], str) or \
                len(str.strip(new_values['data']['old_password'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OLD_PASSWORD')
        old_password = str.strip(new_values['data']['old_password'])

        if len(str.strip(new_values['data']['old_password'])) > 100:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.OLD_PASSWORD_LENGTH_CANNOT_EXCEED_100_CHARACTERS')

        if 'new_password' not in new_values['data'] or \
                not isinstance(new_values['data']['new_password'], str) or \
                len(str.strip(new_values['data']['new_password'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NEW_PASSWORD')
        new_password = str.strip(new_values['data']['new_password'])

        if len(str.strip(new_values['data']['new_password'])) > 100:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.NEW_PASSWORD_LENGTH_CANNOT_EXCEED_100_CHARACTERS')

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
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_SESSION_NOT_FOUND')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.USER_SESSION_TIMEOUT')

        query = (" SELECT salt, password "
                 " FROM tbl_users "
                 " WHERE uuid = %s ")
        cursor.execute(query, (user_uuid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.USER_NOT_FOUND')

        result = {'salt': row[0], 'password': row[1]}

        # verify old password
        salt = result['salt']
        hashed_password = hashlib.sha512(salt.encode() + old_password.encode()).hexdigest()

        if hashed_password != result['password']:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_OLD_PASSWORD')

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
        cnx.close()
        resp.text = json.dumps("OK")
        resp.status = falcon.HTTP_200
        write_log(user_uuid=user_uuid, request_method='PUT', resource_type='ChangePassword',
                  resource_id=None, request_body=None)


class ResetPassword:
    def __init__(self):
        """Initializes Class"""
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
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_UUID')
        admin_user_uuid = str.strip(req.headers['USER-UUID'])

        if 'TOKEN' not in req.headers or \
                not isinstance(req.headers['TOKEN'], str) or \
                len(str.strip(req.headers['TOKEN'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOKEN')
        admin_token = str.strip(req.headers['TOKEN'])

        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if 'name' not in new_values['data'] or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_NAME')
        user_name = str.strip(new_values['data']['name'])

        if 'password' not in new_values['data'] or \
                not isinstance(new_values['data']['password'], str) or \
                len(str.strip(new_values['data']['password'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PASSWORD')

        if len(str.strip(new_values['data']['password'])) > 100:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PASSWORD_LENGTH_CANNOT_EXCEED_100_CHARACTERS')

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
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ADMINISTRATOR_SESSION_NOT_FOUND')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.ADMINISTRATOR_SESSION_TIMEOUT')

        query = (" SELECT name "
                 " FROM tbl_users "
                 " WHERE uuid = %s AND is_admin = 1 ")
        cursor.execute(query, (admin_user_uuid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_PRIVILEGE')

        salt = uuid.uuid4().hex
        hashed_password = hashlib.sha512(salt.encode() + new_password.encode()).hexdigest()

        update_user = (" UPDATE tbl_users "
                       " SET salt = %s, password = %s "
                       " WHERE name = %s ")
        cursor.execute(update_user, (salt, hashed_password, user_name,))
        cnx.commit()

        query = (" SELECT id "
                 " FROM tbl_users "
                 " WHERE name = %s ")
        cursor.execute(query, (user_name,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_USERNAME')

        user_id = row[0]

        # Refresh administrator session
        update_session = (" UPDATE tbl_sessions "
                          " SET utc_expires = %s "
                          " WHERE user_uuid = %s and token = %s ")
        utc_expires = datetime.utcnow() + timedelta(seconds=1000 * 60 * 60 * 8)
        cursor.execute(update_session, (utc_expires, admin_user_uuid, admin_token, ))
        cnx.commit()

        cursor.close()
        cnx.close()
        resp.text = json.dumps("OK")
        resp.status = falcon.HTTP_200
        write_log(user_uuid=admin_user_uuid, request_method='PUT', resource_type='ResetPassword',
                  resource_id=user_id, request_body=None)


class Unlock:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        if 'USER-UUID' not in req.headers or \
                not isinstance(req.headers['USER-UUID'], str) or \
                len(str.strip(req.headers['USER-UUID'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_UUID')
        admin_user_uuid = str.strip(req.headers['USER-UUID'])

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT failed_login_count "
                 " FROM tbl_users "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_Id')

        failed_login_count = row[0]
        if failed_login_count < config.maximum_failed_login_count:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.USER_ACCOUNT_IS_NOT_LOCKED')

        update_user = (" UPDATE tbl_users "
                       " SET failed_login_count = 0"
                       " WHERE id = %s ")
        cursor.execute(update_user, (id_, ))
        cnx.commit()

        query = (" SELECT failed_login_count "
                 " FROM tbl_users "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None or row[0] != 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.ACCOUNT_UNLOCK_FAILED')

        cursor.close()
        cnx.close()
        resp.text = json.dumps("OK")
        resp.status = falcon.HTTP_200
        write_log(user_uuid=admin_user_uuid, request_method='PUT', resource_type='UnlockUser',
                  resource_id=id_, request_body=None)


class ForgotPassword:
    def __init__(self):
        """Initializes Class"""
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
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if 'verification_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['verification_code'], str) or \
                len(str.strip(new_values['data']['verification_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VERIFICATION_CODE')
        verification_code = str.strip(new_values['data']['verification_code'])

        if 'password' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['password'], str) or \
                len(str.strip(new_values['data']['password'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PASSWORD')
        password = str.strip(new_values['data']['password'])

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        if 'email' in new_values['data']:
            if not isinstance(new_values['data']['email'], str) or \
                    len(str.strip(new_values['data']['email'])) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_EMAIL')

            email = str.strip(new_values['data']['email']).lower()

            query = (" SELECT recipient_email, verification_code, expires_datetime_utc"
                     " FROM tbl_verification_codes "
                     " WHERE recipient_email = %s and verification_code = %s"
                     " ORDER BY created_datetime_utc DESC")
            cursor.execute(query, (email, verification_code))
            row = cursor.fetchone()

            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.ERROR',
                                       description='API.INVALID_VERIFICATION_CODE')
            else:
                if datetime.utcnow() > row[2]:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.ADMINISTRATOR_SESSION_TIMEOUT')
        else:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')

        cursor.execute(" SELECT salt, uuid, id "
                       " FROM tbl_users "
                       " WHERE email = %s",
                       (email,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.ERROR', description='API.USER_NOT_FOUND')
        else:
            result = {"salt": row[0], "uuid": row[1], "id": row[2]}

        hashed_password = hashlib.sha512(result['salt'].encode() + password.encode()).hexdigest()
        cursor.execute(" SELECT uuid, id "
                       " FROM tbl_users "
                       " WHERE email = %s and password = %s",
                       (email, hashed_password))
        row = cursor.fetchone()
        if row is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.ERROR', description='API.PASSWORDS_MATCH')

        cursor.execute(" UPDATE tbl_users "
                       " SET password = %s "
                       " Where email = %s",
                       (hashed_password, email))
        cnx.commit()

        cursor.execute(" DELETE FROM tbl_verification_codes "
                       " WHERE recipient_email = %s ",
                       (email,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200
        write_log(user_uuid=result['uuid'], request_method='PUT', resource_type='ForgotPassword',
                  resource_id=result['id'], request_body=None)


class EmailMessageCollection:
    def __init__(self):
        """"Initializes EmailMessageCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        admin_control(req)
        start_datetime_local = req.params.get('startdatetime')
        end_datetime_local = req.params.get('enddatetime')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if start_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_START_DATETIME_FORMAT")
        else:
            start_datetime_local = str.strip(start_datetime_local)
            try:
                start_datetime_utc = datetime.strptime(start_datetime_local,
                                                       '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                     timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_START_DATETIME_FORMAT")

        if end_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_END_DATETIME_FORMAT")
        else:
            end_datetime_local = str.strip(end_datetime_local)
            try:
                end_datetime_utc = datetime.strptime(end_datetime_local,
                                                     '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                   timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_END_DATETIME_FORMAT")

        if start_datetime_utc >= end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.START_DATETIME_MUST_BE_EARLIER_THAN_END_DATETIME')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT id, recipient_name, recipient_email, "
                 "        subject, message, created_datetime_utc, "
                 "        scheduled_datetime_utc, status "
                 " FROM tbl_email_messages "
                 " WHERE created_datetime_utc >= %s AND created_datetime_utc < %s "
                 " ORDER BY created_datetime_utc ")
        cursor.execute(query, (start_datetime_utc, end_datetime_utc))
        rows = cursor.fetchall()

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "recipient_name": row[1],
                               "recipient_email": row[2],
                               "subject": row[3],
                               "message": row[4].replace("<br>", ""),
                               "created_datetime": row[5].timestamp() * 1000 if isinstance(row[5], datetime) else None,
                               "scheduled_datetime":
                                   row[6].timestamp() * 1000 if isinstance(row[6], datetime) else None,
                               "status": row[7]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    def on_post(req, resp):
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        expires_datetime_utc = datetime.utcnow() + timedelta(seconds=60 * 60 * 1)

        if 'recipient_email' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['recipient_email'], str) or \
                len(str.strip(new_values['data']['recipient_email'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RECIPIENT_EMAIL')
        recipient_email = str.strip(new_values['data']['recipient_email'])
        match = re.match(r'^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', recipient_email)
        if match is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')

        if 'subject' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['subject'], str) or \
                len(str.strip(new_values['data']['subject'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SUBJECT_VALUE')
        subject = str.strip(new_values['data']['subject'])

        if 'message' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['message'], str) or \
                len(str.strip(new_values['data']['message'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MESSAGE_VALUE')

        verification_code = str(random.randint(100000, 999999))
        message = str.strip(new_values['data']['message'])
        message = re.sub(r'{verification_code}', verification_code, message)

        if 'created_datetime' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['created_datetime'], str) or \
                len(str.strip(new_values['data']['created_datetime'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CREATED_DATETIME')
        created_datetime_local = str.strip(new_values['data']['created_datetime'])

        if 'scheduled_datetime' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['scheduled_datetime'], str) or \
                len(str.strip(new_values['data']['scheduled_datetime'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SCHEDULED_DATETIME')
        scheduled_datetime_local = str.strip(new_values['data']['scheduled_datetime'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if created_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_CREATED_DATETIME")
        else:
            created_datetime_local = str.strip(created_datetime_local)
            try:
                created_datetime_utc = datetime.strptime(created_datetime_local,
                                                         '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                       timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_CREATED_DATETIME")

        if scheduled_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_SCHEDULED_DATETIME")
        else:
            scheduled_datetime_local = str.strip(scheduled_datetime_local)
            try:
                scheduled_datetime_utc = datetime.strptime(scheduled_datetime_local,
                                                           '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                         timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_SCHEDULED_DATETIME")

        status = 'new'

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" DELETE FROM tbl_verification_codes "
                       " WHERE recipient_email = %s ",
                       (recipient_email,))
        cnx.commit()

        cursor.execute(" select name "
                       " from tbl_new_users "
                       " where email = %s ", (recipient_email,))
        row = cursor.fetchone()
        if row is not None:
            recipient_name = row[0]
        else:
            recipient_name = recipient_email.split('@')[0]

        add_verification_code = (" INSERT INTO tbl_verification_codes "
                                 " (recipient_email, verification_code, created_datetime_utc, expires_datetime_utc) "
                                 " VALUES (%s, %s, %s, %s) ")
        cursor.execute(add_verification_code,
                       (recipient_email, verification_code, created_datetime_utc, expires_datetime_utc))

        add_row = (" INSERT INTO tbl_email_messages "
                   "             (recipient_name, recipient_email, subject, message, "
                   "             created_datetime_utc, scheduled_datetime_utc, status) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s) ")

        cursor.execute(add_row, (recipient_name,
                                 recipient_email,
                                 subject,
                                 message,
                                 created_datetime_utc,
                                 scheduled_datetime_utc,
                                 status))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201


class EmailMessageItem:
    def __init__(self):
        """"Initializes EmailMessageItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL_MESSAGE_ID')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT id, recipient_name, recipient_email, "
                 "        subject, message, created_datetime_utc, "
                 "        scheduled_datetime_utc, status "
                 " FROM tbl_email_messages "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EMAIL_MESSAGE_NOT_FOUND')

        result = {"id": row[0],
                  "recipient_name": row[1],
                  "recipient_email": row[2],
                  "subject": row[3],
                  "message": row[4].replace("<br>", ""),
                  "created_datetime": row[5].timestamp() * 1000 if isinstance(row[5], datetime) else None,
                  "scheduled_datetime": row[6].timestamp() * 1000 if isinstance(row[6], datetime) else None,
                  "status": row[7]}

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL_MESSAGE_ID')

        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if 'recipient_name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['recipient_name'], str) or \
                len(str.strip(new_values['data']['recipient_name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RECIPIENT_NAME')
        recipient_name = str.strip(new_values['data']['recipient_name'])

        if 'recipient_email' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['recipient_email'], str) or \
                len(str.strip(new_values['data']['recipient_email'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RECIPIENT_EMAIL')
        recipient_email = str.strip(new_values['data']['recipient_email'])
        match = re.match(r'^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', recipient_email)
        if match is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')

        if 'subject' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['subject'], str) or \
                len(str.strip(new_values['data']['subject'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SUBJECT_VALUE')
        subject = str.strip(new_values['data']['subject'])

        if 'message' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['message'], str) or \
                len(str.strip(new_values['data']['message'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MESSAGE_VALUE')
        message = str.strip(new_values['data']['message'])

        if 'status' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['status'], str) or \
                len(str.strip(new_values['data']['status'])) == 0 or \
                str.strip(new_values['data']['status']) not in ('new', 'acknowledged', 'timeout'):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STATUS')
        status = str.strip(new_values['data']['status'])

        if 'created_datetime' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['created_datetime'], str) or \
                len(str.strip(new_values['data']['created_datetime'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CREATED_DATETIME')
        created_datetime_local = str.strip(new_values['data']['created_datetime'])

        if 'scheduled_datetime' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['scheduled_datetime'], str) or \
                len(str.strip(new_values['data']['scheduled_datetime'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SCHEDULED_DATETIME')
        scheduled_datetime_local = str.strip(new_values['data']['scheduled_datetime'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if created_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_CREATED_DATETIME")
        else:
            created_datetime_local = str.strip(created_datetime_local)
            try:
                created_datetime_utc = datetime.strptime(created_datetime_local,
                                                         '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                       timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_CREATED_DATETIME")

        if scheduled_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_SCHEDULED_DATETIME")
        else:
            scheduled_datetime_local = str.strip(scheduled_datetime_local)
            try:
                scheduled_datetime_utc = datetime.strptime(scheduled_datetime_local,
                                                           '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                         timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_SCHEDULED_DATETIME")

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT recipient_name "
                       " FROM tbl_email_messages "
                       " WHERE id = %s ", (id_,))

        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EMAIL_MESSAGE_NOT_FOUND')

        update_row = (" UPDATE tbl_email_messages "
                      " SET recipient_name = %s, recipient_email = %s, subject = %s, message = %s,"
                      " created_datetime_utc = %s, scheduled_datetime_utc = %s, status = %s"
                      " WHERE id = %s ")

        cursor.execute(update_row, (recipient_name,
                                    recipient_email,
                                    subject,
                                    message,
                                    created_datetime_utc,
                                    scheduled_datetime_utc,
                                    status,
                                    id_))

        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL_MESSAGE_ID')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_email_messages "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EMAIL_MESSAGE_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_email_messages WHERE id = %s ", (id_,))
        cnx.commit()

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        resp.status = falcon.HTTP_204


class NewUserCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        admin_control(req)
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        query = (" SELECT id, name, display_name, uuid, email "
                 " FROM tbl_new_users "
                 " ORDER BY name ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "display_name": row[2],
                               "uuid": row[3],
                               "email": row[4], }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    def on_post(req, resp):
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
                                   description='API.INVALID_USER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'display_name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['display_name'], str) or \
                len(str.strip(new_values['data']['display_name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISPLAY_NAME')
        display_name = str.strip(new_values['data']['display_name'])

        if 'email' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['email'], str) or \
                len(str.strip(new_values['data']['email'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')
        email = str.lower(str.strip(new_values['data']['email']))

        match = re.match(r'^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email)
        if match is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')

        if 'password' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['password'], str) or \
                len(str.strip(new_values['data']['password'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PASSWORD')

        if len(str.strip(new_values['data']['password'])) > 100:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PASSWORD_LENGTH_CANNOT_EXCEED_100_CHARACTERS')

        if 'verification_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['verification_code'], str) or \
                len(str.strip(new_values['data']['verification_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_VERIFICATION_CODE')
        verification_code = str.strip(new_values['data']['verification_code'])

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT expires_datetime_utc "
                       " FROM tbl_verification_codes "
                       " WHERE recipient_email = %s and verification_code = %s ",
                       (email, verification_code))
        row = cursor.fetchone()
        if row is not None:
            expires_datetime_utc = row[0]
            print(expires_datetime_utc)
            print(datetime.utcnow())
            if datetime.utcnow() > expires_datetime_utc:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.NEW_USER_SESSION_TIMEOUT')
        else:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.NEW_USER_SESSION_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_new_users "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_new_users "
                       " WHERE email = %s ", (email,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.EMAIL_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE email = %s ", (email,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.EMAIL_IS_ALREADY_IN_USE')

        add_row = (" INSERT INTO tbl_new_users "
                   "     (name, uuid, display_name, email, salt, password) "
                   " VALUES (%s, %s, %s, %s, %s, %s) ")

        salt = uuid.uuid4().hex
        password = new_values['data']['password']
        hashed_password = hashlib.sha512(salt.encode() + password.encode()).hexdigest()

        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 display_name,
                                 email,
                                 salt,
                                 hashed_password))
        new_id = cursor.lastrowid
        cnx.commit()

        cursor.execute(" DELETE FROM tbl_verification_codes "
                       " WHERE recipient_email = %s",
                       (email,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/users/newusers/' + str(new_id)


class NewUserItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, email):
        if not isinstance(email, str) or len(str.strip(email)) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')
        email = str.lower(str.strip(email))

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, display_name, uuid, email "
                 " FROM tbl_new_users "
                 " WHERE id = %s ")
        cursor.execute(query, (email,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        result = {"id": row[0],
                  "name": row[1],
                  "display_name": row[2],
                  "uuid": row[3],
                  "email": row[4]}
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_new_users "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        # TODO: delete associated objects
        cursor.execute(" DELETE FROM tbl_new_users WHERE id = %s ", (id_,))
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
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'display_name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['display_name'], str) or \
                len(str.strip(new_values['data']['display_name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISPLAY_NAME')
        display_name = str.strip(new_values['data']['display_name'])

        if 'email' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['email'], str) or \
                len(str.strip(new_values['data']['email'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')
        email = str.lower(str.strip(new_values['data']['email']))

        match = re.match(r'^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email)
        if match is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_new_users "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_new_users "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_users "
                       " WHERE email = %s ", (email, ))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.EMAIL_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_new_users "
                       " WHERE email = %s AND id != %s ", (email, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.EMAIL_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_new_users "
                      " SET name = %s, display_name = %s, email = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    display_name,
                                    email,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class NewUserApprove:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)

        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_ID')

        if 'is_admin' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_admin'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ADMIN_VALUE')
        is_admin = new_values['data']['is_admin']

        is_read_only = False

        if is_admin:
            if 'is_read_only' not in new_values['data'].keys() or \
                    not isinstance(new_values['data']['is_read_only'], bool):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_IS_READ_ONLY_VALUE')
            is_read_only = new_values['data']['is_read_only']

        if 'privilege_id' in new_values['data'].keys():
            if not isinstance(new_values['data']['privilege_id'], int) or \
                    new_values['data']['privilege_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PRIVILEGE_ID')
            privilege_id = new_values['data']['privilege_id']
        else:
            privilege_id = None

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        account_expiration_datetime = datetime.strptime(new_values['data']['account_expiration_datetime'],
                                                        '%Y-%m-%dT%H:%M:%S')
        account_expiration_datetime = account_expiration_datetime.replace(tzinfo=timezone.utc)
        account_expiration_datetime -= timedelta(minutes=timezone_offset)

        password_expiration_datetime = datetime.strptime(new_values['data']['password_expiration_datetime'],
                                                         '%Y-%m-%dT%H:%M:%S')
        password_expiration_datetime = password_expiration_datetime.replace(tzinfo=timezone.utc)
        password_expiration_datetime -= timedelta(minutes=timezone_offset)

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_new_users "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        if privilege_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_privileges "
                           " WHERE id = %s ",
                           (privilege_id,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.PRIVILEGE_NOT_FOUND')

        cursor.execute(" SELECT name, uuid, display_name, email, salt, password"
                       " FROM tbl_new_users "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')
        else:
            name = row[0]
            user_uuid = row[1]
            display_name = row[2]
            email = row[3]
            salt = row[4]
            passowrd = row[5]

        add_row = (" INSERT INTO tbl_users "
                   "     (name, uuid, display_name, email, salt, password, is_admin, is_read_only, privilege_id, "
                   "      account_expiration_datetime_utc, password_expiration_datetime_utc, failed_login_count) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")

        cursor.execute(add_row, (name,
                                 user_uuid,
                                 display_name,
                                 email,
                                 salt,
                                 passowrd,
                                 is_admin,
                                 is_read_only,
                                 privilege_id,
                                 account_expiration_datetime,
                                 password_expiration_datetime,
                                 0))
        new_id = cursor.lastrowid
        cnx.commit()

        cursor.execute(" DELETE FROM tbl_new_users WHERE id = %s", (id_,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/users/' + str(new_id)

