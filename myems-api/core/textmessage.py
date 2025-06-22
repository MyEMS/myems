from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control
import config


class TextMessageCollection:
    def __init__(self):
        """"Initializes TextMessageCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        _=req
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
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, recipient_name, recipient_mobile, "
                 "        message, created_datetime_utc, scheduled_datetime_utc, acknowledge_code, status "
                 " FROM tbl_text_messages_outbox "
                 " WHERE created_datetime_utc >= %s AND created_datetime_utc < %s "
                 " ORDER BY created_datetime_utc DESC ")
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
                               "recipient_mobile": row[2],
                               "message": row[3],
                               "created_datetime": row[4].timestamp() * 1000 if isinstance(row[4], datetime) else None,
                               "scheduled_datetime":
                                   row[5].timestamp() * 1000 if isinstance(row[5], datetime) else None,
                               "acknowledge_code": row[6],
                               "status": row[7]}
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
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'rule_id' in new_values['data'].keys():
            if new_values['data']['rule_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_RULE_ID')
            rule_id = new_values['data']['rule_id']
        else:
            rule_id = None

        if 'recipient_name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['recipient_name'], str) or \
                len(str.strip(new_values['data']['recipient_name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RECIPIENT_NAME')
        recipient_name = str.strip(new_values['data']['recipient_name'])

        if 'recipient_mobile' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['recipient_mobile'], str) or \
                len(str.strip(new_values['data']['recipient_mobile'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RECIPIENT_MOBILE')
        recipient_mobile = str.strip(new_values['data']['recipient_mobile'])

        if 'message' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['message'], str) or \
                len(str.strip(new_values['data']['message'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MESSAGE_VALUE')
        message = str.strip(new_values['data']['message'])

        if 'acknowledge_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['acknowledge_code'], str) or \
                len(str.strip(new_values['data']['acknowledge_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ACKNOWLEDGE_CODE')
        acknowledge_code = str.strip(new_values['data']['acknowledge_code'])

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

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        if rule_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_rules "
                           " WHERE id = %s ",
                           (new_values['data']['rule_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.RULE_NOT_FOUND')

        add_row = (" INSERT INTO tbl_text_messages_outbox"
                   "             (rule_id, recipient_name, recipient_mobile, message, "
                   "              acknowledge_code, created_datetime_utc,"
                   "              scheduled_datetime_utc, status) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")

        cursor.execute(add_row, (rule_id,
                                 recipient_name,
                                 recipient_mobile,
                                 message,
                                 acknowledge_code,
                                 created_datetime_utc,
                                 scheduled_datetime_utc,
                                 status))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/textmessages/' + str(new_id)


class TextMessageItem:
    def __init__(self):
        """"Initializes TextMessageItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _=req
        resp.status = falcon.HTTP_200
        _=id_
    @staticmethod
    def on_get(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TEXT_MESSAGE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, recipient_name, recipient_mobile, "
                 "        message, created_datetime_utc, scheduled_datetime_utc, acknowledge_code, status "
                 " FROM tbl_text_messages_outbox "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TEXT_MESSAGE_NOT_FOUND')

        result = {"id": row[0],
                  "recipient_name": row[1],
                  "recipient_mobile": row[2],
                  "message": row[3],
                  "created_datetime": row[4].timestamp() * 1000 if isinstance(row[4], datetime) else None,
                  "scheduled_datetime": row[5].timestamp() * 1000 if isinstance(row[5], datetime) else None,
                  "acknowledge_code": row[6],
                  "status": row[7]}

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TEXT_MESSAGE_ID')

        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'rule_id' in new_values['data'].keys():
            if new_values['data']['rule_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_RULE_ID')
            rule_id = new_values['data']['rule_id']
        else:
            rule_id = None

        if 'recipient_name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['recipient_name'], str) or \
                len(str.strip(new_values['data']['recipient_name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RECIPIENT_NAME')
        recipient_name = str.strip(new_values['data']['recipient_name'])

        if 'recipient_mobile' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['recipient_mobile'], str) or \
                len(str.strip(new_values['data']['recipient_mobile'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RECIPIENT_MOBILE')
        recipient_mobile = str.strip(new_values['data']['recipient_mobile'])

        if 'message' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['message'], str) or \
                len(str.strip(new_values['data']['message'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MESSAGE_VALUE')
        message = str.strip(new_values['data']['message'])

        if 'acknowledge_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['acknowledge_code'], str) or \
                len(str.strip(new_values['data']['acknowledge_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ACKNOWLEDGE_CODE')
        acknowledge_code = str.strip(new_values['data']['acknowledge_code'])

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

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT recipient_name "
                       " FROM tbl_text_messages_outbox "
                       " WHERE id = %s ", (id_,))

        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TEXT_MESSAGE_NOT_FOUND')

        if rule_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_rules "
                           " WHERE id = %s ",
                           (new_values['data']['rule_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.RULE_NOT_FOUND')

        update_row = (" UPDATE tbl_text_messages_outbox "
                      " SET rule_id = %s, recipient_name = %s, recipient_mobile = %s, message = %s,"
                      "     acknowledge_code = %s, created_datetime_utc = %s,"
                      "     scheduled_datetime_utc = %s, status = %s"
                      " WHERE id = %s ")

        cursor.execute(update_row, (rule_id,
                                    recipient_name,
                                    recipient_mobile,
                                    message,
                                    acknowledge_code,
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
                                   description='API.INVALID_TEXT_MESSAGE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id FROM tbl_text_messages_outbox WHERE id = %s ", (id_,))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TEXT_MESSAGE_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_text_messages_outbox WHERE id = %s ", (id_,))
        cnx.commit()

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        resp.status = falcon.HTTP_204
