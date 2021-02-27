import falcon
import json
import mysql.connector
import config
from datetime import datetime, timedelta, timezone


class WebMessageCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, startdate, enddate):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, startdate, enddate):
        try:
            start_datetime_local = datetime.strptime(startdate, '%Y-%m-%d')
        except Exception:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_START_DATE_FORMAT')
        try:
            end_datetime_local = datetime.strptime(enddate, '%Y-%m-%d')
        except Exception:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_END_DATE_FORMAT')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        start_datetime_utc = start_datetime_local.replace(tzinfo=timezone.utc)
        start_datetime_utc -= timedelta(minutes=timezone_offset)

        end_datetime_utc = end_datetime_local.replace(tzinfo=timezone.utc)
        end_datetime_utc -= timedelta(minutes=timezone_offset)
        end_datetime_utc += timedelta(days=1)

        if start_datetime_utc >= end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.START_DATETIME_SHOULD_BE_EARLY_THAN_END_DATETIME')
        # get user dict
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, display_name "
                 " FROM tbl_users ")
        cursor.execute(query)
        rows_users = cursor.fetchall()

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        user_dict = dict()
        if rows_users is not None and len(rows_users) > 0:
            for row in rows_users:
                user_dict[row['id']] = row['display_name']

        # get web messages
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, user_id, subject, message, "
                 "        created_datetime_utc, status, reply "
                 " FROM tbl_web_messages "
                 " WHERE created_datetime_utc >= %s AND created_datetime_utc < %s "
                 " ORDER BY created_datetime_utc DESC ")
        cursor.execute(query, (start_datetime_utc, end_datetime_utc))
        rows = cursor.fetchall()

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "user_id": row[1],
                               "user_display_name": user_dict.get(row[1], None),
                               "subject": row[2],
                               "message": row[3].replace("<br>", ""),
                               "created_datetime": row[4].timestamp() * 1000 if isinstance(row[4], datetime) else None,
                               "status": row[5],
                               "reply": row[6]}
                result.append(meta_result)

        resp.body = json.dumps(result)


class WebMessageStatusNewCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):

        # get user dict
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, display_name "
                 " FROM tbl_users ")
        cursor.execute(query)
        rows_users = cursor.fetchall()

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        user_dict = dict()
        if rows_users is not None and len(rows_users) > 0:
            for row in rows_users:
                user_dict[row['id']] = row['display_name']

        # get new web messages
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, user_id, subject, message, "
                 "        created_datetime_utc, status "
                 " FROM tbl_web_messages "
                 " WHERE status = %s "
                 " ORDER BY created_datetime_utc DESC ")
        cursor.execute(query, ("new", ))
        rows = cursor.fetchall()

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "user_id": row[1],
                               "user_display_name": user_dict.get(row[1], None),
                               "subject": row[2],
                               "message": row[3].replace("<br>", ""),
                               "created_datetime": row[4].timestamp() * 1000 if isinstance(row[4], datetime) else None,
                               "status": row[5]}
                result.append(meta_result)

        resp.body = json.dumps(result)


class WebMessageItem:
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
                                   description='API.INVALID_WEB_MESSAGE_ID')

        # get user dict
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, display_name "
                 " FROM tbl_users ")
        cursor.execute(query)
        rows_users = cursor.fetchall()

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        user_dict = dict()
        if rows_users is not None and len(rows_users) > 0:
            for row in rows_users:
                user_dict[row['id']] = row['display_name']

        # get web message
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, user_id, subject, message, "
                 "        created_datetime_utc, status, reply "
                 " FROM tbl_web_messages "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WEB_MESSAGE_NOT_FOUND')

        meta_result = {"id": row[0],
                       "user_id": row[1],
                       "user_display_name": user_dict.get(row[1], None),
                       "subject": row[2],
                       "message": row[3].replace("<br>", ""),
                       "created_datetime": row[4].timestamp() * 1000 if isinstance(row[4], datetime) else None,
                       "status": row[5],
                       "reply": row[6]}

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
                                   description='API.INVALID_WEB_MESSAGE_ID')

        new_values = json.loads(raw_json)

        if 'status' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['status'], str) or \
                len(str.strip(new_values['data']['status'])) == 0 or \
                str.strip(new_values['data']['status']) not in ('new', 'acknowledged', 'timeout'):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STATUS')
        status = str.strip(new_values['data']['status'])

        if 'reply' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['reply'], str) or \
                len(str.strip(new_values['data']['reply'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPLY')
        reply = str.strip(new_values['data']['reply'])

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT user_id "
                       " FROM tbl_web_messages "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WEB_MESSAGE_NOT_FOUND')

        update_row = (" UPDATE tbl_web_messages "
                      " SET status = %s, reply = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (status,
                                    reply,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WEB_MESSAGE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_web_messages "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WEB_MESSAGE_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_web_messages WHERE id = %s ", (id_,))
        cnx.commit()
        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        resp.status = falcon.HTTP_204
