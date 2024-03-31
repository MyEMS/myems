import re
from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, access_control
import config


class WebMessageCollection:
    @staticmethod
    def __init__():
        """"Initializes WebMessageCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        access_control(req)
        start_datetime_local = req.params.get('startdatetime')
        end_datetime_local = req.params.get('enddatetime')
        status = req.params.get('status')
        priority = req.params.get('priority')

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

        if status is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_STATUS")
        else:
            status = str.lower(str.strip(status))
            if status not in ['new', 'read', 'acknowledged', 'all']:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_STATUS')
            else:
                if status == 'all':
                    status_query = ""
                else: 
                    status_query = "status = '" + status + "' AND "

        if priority is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_PRIORITY")
        else:
            priority = str.upper(str.strip(priority))
            if priority not in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'ALL']:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PRIORITY')
            else:
                if priority == 'ALL':
                    priority_query = ""
                else:
                    priority_query = "priority= '" + priority + "' AND "

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')
        else:
            user_id = row[0]

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        # get web messages
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, subject, message, created_datetime_utc, start_datetime_utc, end_datetime_utc, "
                 "        update_datetime_utc, status, reply "
                 " FROM tbl_web_messages "
                 " WHERE user_id = %s AND "
                 "       created_datetime_utc >= %s AND created_datetime_utc < %s AND "
                 + status_query + priority_query + 
                 " 1 = 1 ORDER BY created_datetime_utc DESC ")

        cursor.execute(query, (user_id, start_datetime_utc, end_datetime_utc))
        rows = cursor.fetchall()

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "subject": row[1],
                               "message": row[2].replace("<br>", ""),
                               "created_datetime": row[3].timestamp() * 1000 if isinstance(row[3], datetime) else None,
                               "start_datetime": row[4].timestamp() * 1000 if isinstance(row[4], datetime) else None,
                               "end_datetime": row[5].timestamp() * 1000 if isinstance(row[5], datetime) else None,
                               "update_datetime": row[6].timestamp() * 1000 if isinstance(row[6], datetime) else None,
                               "status": row[7],
                               "reply": row[8]}
                result.append(meta_result)

        resp.text = json.dumps(result)


class WebMessageStatusNewCollection:
    @staticmethod
    def __init__():
        """"Initializes WebMessageStatusNewCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """Handles GET requests"""
        access_control(req)
        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')
        else:
            user_id = row[0]

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        # get 'new' web messages
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, subject, message, created_datetime_utc, start_datetime_utc, end_datetime_utc, "
                 "        update_datetime_utc, status, reply "
                 " FROM tbl_web_messages "
                 " WHERE user_id = %s AND "
                 "       status = %s "
                 " ORDER BY created_datetime_utc DESC ")
        cursor.execute(query, (user_id, 'new'))
        rows = cursor.fetchall()

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "subject": row[1],
                               "message": row[2].replace("<br>", ""),
                               "created_datetime": row[3].timestamp() * 1000 if isinstance(row[3], datetime) else None,
                               "start_datetime": row[4].timestamp() * 1000 if isinstance(row[4], datetime) else None,
                               "end_datetime": row[5].timestamp() * 1000 if isinstance(row[5], datetime) else None,
                               "update_datetime": row[6].timestamp() * 1000 if isinstance(row[6], datetime) else None,
                               "status": row[7],
                               "reply": row[8]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_put(req, resp):
        """Handles PUT requests"""
        access_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'status' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['status'], str) or \
                len(str.strip(new_values['data']['status'])) == 0 or \
                str.strip(new_values['data']['status']) not in ('new', 'acknowledged', 'read'):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STATUS')
        status = str.strip(new_values['data']['status'])

        # reply is required for 'acknowledged' status
        if status == 'acknowledged':
            if 'reply' not in new_values['data'].keys() or \
                    not isinstance(new_values['data']['reply'], str) or \
                    len(str.strip(new_values['data']['reply'])) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_REPLY')
            else:
                reply = str.strip(new_values['data']['reply'])
        else:
            reply = None

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')
        else:
            user_id = row[0]

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT user_id "
                       " FROM tbl_web_messages "
                       " WHERE status = %s AND user_id = %s ", ('new', user_id))
        if cursor.fetchall() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WEB_MESSAGE_NOT_FOUND')

        update_row = (" UPDATE tbl_web_messages "
                      " SET status = %s, reply = %s "
                      " WHERE status = %s AND user_id = %s ")
        cursor.execute(update_row, (status,
                                    reply,
                                    'new',
                                    user_id,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class WebMessageItem:
    @staticmethod
    def __init__():
        """"Initializes WebMessageItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WEB_MESSAGE_ID')

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')
        else:
            user_id = row[0]

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        # get web message by id
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, subject, message, created_datetime_utc, start_datetime_utc, end_datetime_utc, "
                 "        update_datetime_utc, status, reply "
                 " FROM tbl_web_messages "
                 " WHERE id = %s AND user_id = %s "
                 " ORDER BY created_datetime_utc DESC ")
        cursor.execute(query, (id_, user_id))
        row = cursor.fetchone()

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WEB_MESSAGE_NOT_FOUND')

        meta_result = {"id": row[0],
                       "subject": row[1],
                       "message": row[2].replace("<br>", ""),
                       "created_datetime": row[3].timestamp() * 1000 if isinstance(row[3], datetime) else None,
                       "start_datetime": row[4].timestamp() * 1000 if isinstance(row[4], datetime) else None,
                       "end_datetime": row[5].timestamp() * 1000 if isinstance(row[5], datetime) else None,
                       "update_datetime": row[6].timestamp() * 1000 if isinstance(row[6], datetime) else None,
                       "status": row[7],
                       "reply": row[8]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        access_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WEB_MESSAGE_ID')

        new_values = json.loads(raw_json)

        if 'status' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['status'], str) or \
                len(str.strip(new_values['data']['status'])) == 0 or \
                str.strip(new_values['data']['status']) not in ('new', 'acknowledged', 'read'):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STATUS')
        status = str.strip(new_values['data']['status'])

        # reply is required for 'acknowledged' status
        if status == 'acknowledged':
            if 'reply' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['reply'], str) or \
                    len(str.strip(new_values['data']['reply'])) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_REPLY')
            else:
                reply = str.strip(new_values['data']['reply'])
        else:
            reply = None

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')
        else:
            user_id = row[0]

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT user_id "
                       " FROM tbl_web_messages "
                       " WHERE id = %s AND user_id = %s ", (id_, user_id))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WEB_MESSAGE_NOT_FOUND')

        update_row = (" UPDATE tbl_web_messages "
                      " SET status = %s, reply = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (status,
                                    reply,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WEB_MESSAGE_ID')

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')
        else:
            user_id = row[0]

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_web_messages "
                       " WHERE id = %s AND user_id = %s ", (id_, user_id))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WEB_MESSAGE_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_web_messages WHERE id = %s ", (id_,))
        cnx.commit()
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        resp.status = falcon.HTTP_204


class WebMessageBatch:
    @staticmethod
    def __init__():
        """"Initializes WebMessageBatch"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_put(req, resp):
        """Handles PUT requests"""
        access_control(req)
        try:
            data = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        data = json.loads(data)
        ids = data['ids']
        rt = re.match('^(\\d+,)*\\d+$', ids, flags=0)
        if ids is None or rt is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WEB_MESSAGE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()
        update_row = (" UPDATE tbl_web_messages  SET status = %s "
                      " WHERE status = %s AND  id in (" + ids + ")")
        cursor.execute(update_row, ('read', 'new',))
        cnx.commit()
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp):
        access_control(req)
        try:
            data = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        data = json.loads(data)
        ids = data['ids']
        rt = re.match('^(\\d+,)*\\d+$', ids, flags=0)
        if ids is None or rt is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WEB_MESSAGE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()
        cursor.execute(" DELETE FROM tbl_web_messages WHERE id in (" + ids + ")", ())
        cnx.commit()
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        resp.status = falcon.HTTP_200
