import falcon
import json
import mysql.connector
import config
from datetime import datetime, timedelta, timezone


class NotificationCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        status = req.params.get('status')
        start_datetime_local = req.params.get('startdatetime')
        end_datetime_local = req.params.get('enddatetime')
        if status is not None:
            status = str.strip(status)
            if status not in ['unread', 'read', 'archived']:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_STATUS')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        start_datetime_utc = None
        if start_datetime_local is not None and len(str.strip(start_datetime_local)) > 0:
            start_datetime_local = str.strip(start_datetime_local)
            try:
                start_datetime_utc = datetime.strptime(start_datetime_local,
                                                       '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                     timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_START_DATETIME")

        end_datetime_utc = None
        if end_datetime_local is not None and len(str.strip(end_datetime_local)) > 0:
            end_datetime_local = str.strip(end_datetime_local)
            try:
                end_datetime_utc = datetime.strptime(end_datetime_local,
                                                     '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                        timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_END_DATETIME")

        if start_datetime_utc is not None and end_datetime_utc is not None and \
                start_datetime_utc >= end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_END_DATETIME')

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_UUID_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT utc_expires "
                 " FROM tbl_sessions "
                 " WHERE user_uuid = %s AND token = %s")
        cursor.execute(query, (user_uuid, token,))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.USER_SESSION_TIMEOUT')

        cursor.execute(" SELECT id "
                       " FROM tbl_users "
                       " WHERE uuid = %s ",
                       (user_uuid,))
        row = cursor.fetchone()
        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')
        else:
            user_id = row[0]

        # get notifications
        if status is None:
            query = (" SELECT id, created_datetime_utc, status, subject, message, url "
                     " FROM tbl_notifications "
                     " WHERE user_id = %s AND "
                     "       created_datetime_utc >= %s AND created_datetime_utc < %s AND"
                     "       status != 'archived' "
                     " ORDER BY created_datetime_utc DESC ")
            cursor.execute(query, (user_id, start_datetime_utc, end_datetime_utc))
        else:
            query = (" SELECT id, created_datetime_utc, status, subject, message, url "
                     " FROM tbl_notifications "
                     " WHERE user_id = %s AND "
                     "       created_datetime_utc >= %s AND created_datetime_utc < %s AND "
                     "       status = %s "
                     " ORDER BY created_datetime_utc DESC ")
            cursor.execute(query, (user_id, start_datetime_utc, end_datetime_utc, status))
        rows = cursor.fetchall()

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "created_datetime":
                                   (row[1] +
                                    timedelta(hours=int(config.utc_offset[1:3]))).strftime('%Y-%m-%dT%H:%M:%S'),
                               "status": row[2],
                               "subject": row[3],
                               "message": row[4],
                               "url": row[5]}
                result.append(meta_result)

        resp.body = json.dumps(result)


class NotificationItem:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NOTIFICATION_ID')

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_UUID_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT utc_expires "
                 " FROM tbl_sessions "
                 " WHERE user_uuid = %s AND token = %s")
        cursor.execute(query, (user_uuid, token,))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.USER_SESSION_TIMEOUT')

        cursor.execute(" SELECT id "
                       " FROM tbl_users "
                       " WHERE uuid = %s ",
                       (user_uuid,))
        row = cursor.fetchone()
        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')
        else:
            user_id = row[0]

        # get notification
        query = (" SELECT id, created_datetime_utc, status, subject, message, url "
                 " FROM tbl_notifications "
                 " WHERE id = %s AND user_id = %s ")
        cursor.execute(query, (id_, user_id))
        row = cursor.fetchone()

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.NOTIFICATION_NOT_FOUND')

        meta_result = {"id": row[0],
                       "created_datetime":
                           (row[1] +
                            timedelta(hours=int(config.utc_offset[1:3]))).strftime('%Y-%m-%dT%H:%M:%S'),
                       "status": row[2],
                       "subject": row[3],
                       "message": row[4],
                       "url": row[5]}

        resp.body = json.dumps(meta_result)

    @staticmethod
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=ex)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NOTIFICATION_ID')

        new_values = json.loads(raw_json)

        if 'status' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['status'], str) or \
                len(str.strip(new_values['data']['status'])) == 0 or \
                str.strip(new_values['data']['status']) not in ('unread', 'read', 'archived'):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STATUS')
        status = str.strip(new_values['data']['status'])

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_UUID_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT utc_expires "
                 " FROM tbl_sessions "
                 " WHERE user_uuid = %s AND token = %s")
        cursor.execute(query, (user_uuid, token,))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.USER_SESSION_TIMEOUT')

        cursor.execute(" SELECT id "
                       " FROM tbl_users "
                       " WHERE uuid = %s ",
                       (user_uuid,))
        row = cursor.fetchone()
        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')
        else:
            user_id = row[0]

        cursor.execute(" SELECT id "
                       " FROM tbl_notifications "
                       " WHERE id = %s AND user_id = %s ", (id_, user_id))
        if cursor.fetchone() is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.NOTIFICATION_NOT_FOUND')

        update_row = (" UPDATE tbl_notifications "
                      " SET status = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (status,
                                    id_,))
        cnx.commit()
        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        resp.status = falcon.HTTP_200

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NOTIFICATION_ID')

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_UUID_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT utc_expires "
                 " FROM tbl_sessions "
                 " WHERE user_uuid = %s AND token = %s")
        cursor.execute(query, (user_uuid, token,))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.USER_SESSION_TIMEOUT')

        cursor.execute(" SELECT id "
                       " FROM tbl_users "
                       " WHERE uuid = %s ",
                       (user_uuid,))
        row = cursor.fetchone()
        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')
        else:
            user_id = row[0]

        cursor.execute(" SELECT id "
                       " FROM tbl_notifications "
                       " WHERE id = %s AND user_id = %s ", (id_, user_id))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.NOTIFICATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_notifications WHERE id = %s ", (id_,))
        cnx.commit()
        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        resp.status = falcon.HTTP_204
