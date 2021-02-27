import falcon
import json
import mysql.connector
import config
from datetime import datetime, timedelta, timezone


class TextMessageCollection:
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
        try:
            cnx = mysql.connector.connect(**config.myems_fdd_db)
            cursor = cnx.cursor()
        except Exception as e:
            raise falcon.HTTPError(falcon.HTTP_500, title='API.DATABASE_ERROR', description=str(e))

        try:
            query = (" SELECT id, recipient_name, recipient_mobile, "
                     "        message, created_datetime_utc, scheduled_datetime_utc, acknowledge_code, status "
                     " FROM tbl_text_messages_outbox "
                     " WHERE created_datetime_utc >= %s AND created_datetime_utc < %s "
                     " ORDER BY created_datetime_utc ")
            cursor.execute(query, (start_datetime_utc, end_datetime_utc))
            rows = cursor.fetchall()

            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
        except Exception as e:
            raise falcon.HTTPError(falcon.HTTP_500, title='API.DATABASE_ERROR', description=str(e))

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "recipient_name": row[1],
                               "recipient_mobile": row[2],
                               "message": row[3],
                               "created_datetime": row[4].timestamp() * 1000 if isinstance(row[4], datetime) else None,
                               "scheduled_datetime": row[5].timestamp() * 1000 if isinstance(row[5], datetime)
                               else None,
                               "acknowledge_code": row[6],
                               "status": row[7]}
                result.append(meta_result)

        resp.body = json.dumps(result)


class TextMessageItem:
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
                                   description='API.INVALID_TEXT_MESSAGE_ID')

        try:
            cnx = mysql.connector.connect(**config.myems_fdd_db)
            cursor = cnx.cursor()
        except Exception as e:
            raise falcon.HTTPError(falcon.HTTP_500, title='API.DATABASE_ERROR', description=str(e))

        try:
            query = (" SELECT id, recipient_name, recipient_mobile, "
                     "        message, created_datetime_utc, scheduled_datetime_utc, acknowledge_code, status "
                     " FROM tbl_text_messages_outbox "
                     " WHERE id = %s ")
            cursor.execute(query, (id_,))
            row = cursor.fetchone()

            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()

        except Exception as e:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_500, title='API.DATABASE_ERROR', description=str(e))

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TEXT_MESSAGE_NOT_FOUND')

        result = {"id": row[0],
                  "recipient_name": row[1],
                  "recipient_mobile": row[2],
                  "message": row[3],
                  "created_datetime": row[4].timestamp() * 1000 if isinstance(row[4], datetime) else None,
                  "scheduled_datetime": row[5].timestamp() * 1000 if isinstance(row[5], datetime) else None,
                  "acknowledge_code": row[6],
                  "status": row[7]}

        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TEXT_MESSAGE_ID')

        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_fdd_db)
            cursor = cnx.cursor()
        except Exception as e:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_500, title='API.DATABASE_ERROR', description=str(e))

        try:
            cursor.execute(" SELECT id FROM tbl_text_messages_outbox WHERE id = %s ", (id_,))
            row = cursor.fetchone()
        except Exception as e:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_500, title='API.DATABASE_ERROR', description=str(e))

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TEXT_MESSAGE_NOT_FOUND')

        try:
            cursor.execute(" DELETE FROM tbl_text_messages_outbox WHERE id = %s ", (id_,))
            cnx.commit()
        except Exception as e:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_500, title='API.DATABASE_ERROR', description=str(e))

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        resp.status = falcon.HTTP_204

