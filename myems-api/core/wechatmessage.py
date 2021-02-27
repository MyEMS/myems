import falcon
import json
import mysql.connector
import config
from datetime import datetime, timedelta, timezone


class WechatMessageCollection(object):

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

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, recipient_name, recipient_openid, message_template_id, "
                 "        message_data, created_datetime_utc, scheduled_datetime_utc, "
                 "        acknowledge_code, status "
                 " FROM tbl_wechat_messages_outbox "
                 " WHERE created_datetime_utc >= %s AND created_datetime_utc < %s "
                 " ORDER BY id DESC ")
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
                               "recipient_name": row[1],
                               "recipient_openid": row[2],
                               "message_template_id": row[3],
                               "message_data": row[4],
                               "created_datetime_utc": row[5].timestamp() * 1000 if row[5] else None,
                               "scheduled_datetime_utc": row[6].timestamp() * 1000 if row[6] else None,
                               "acknowledge_code": row[7],
                               "status": row[8]}
                result.append(meta_result)
        resp.body = json.dumps(result)


class WechatMessageItem:
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
                                   description='API.INVALID_WECHAT_MESSAGE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, recipient_name, recipient_openid, message_template_id, "
                 "        message_data, created_datetime_utc, scheduled_datetime_utc, "
                 "        acknowledge_code, status "
                 " FROM tbl_wechat_messages_outbox "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WECHAT_MESSAGE_NOT_FOUND')

        result = {"id": row[0],
                  "recipient_name": row[1],
                  "recipient_openid": row[2],
                  "recipient_template_id": row[3],
                  "message_data": row[4],
                  "created_datetime_utc": row[5].timestamp() * 1000 if row[5] else None,
                  "scheduled_datetime_utc": row[6].timestamp() * 1000 if row[6] else None,
                  "acknowledge_code": row[7],
                  "status": row[8]}

        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WECHAT_MESSAGE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_wechat_messages_outbox "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WECHAT_MESSAGE_NOT_FOUND')

        try:
            cursor.execute(" DELETE FROM tbl_wechat_messages_outbox WHERE id = %s ", (id_,))
            cnx.commit()
        except Exception as e:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_500, title='API.ERROR',
                                   description='API.DATABASE_ERROR')

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        resp.status = falcon.HTTP_204
