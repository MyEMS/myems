import uuid
from datetime import datetime, timezone, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control
import config


class RuleCollection:
    def __init__(self):
        """Initializes RuleCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """Handles GET requests"""
        admin_control(req)
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        category, fdd_code, priority, "
                 "        channel, expression, message_template, "
                 "        is_enabled, last_run_datetime_utc, next_run_datetime_utc, is_run_immediately "
                 " FROM tbl_rules "
                 " ORDER BY id ")
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
                if isinstance(row[10], datetime):
                    last_run_datetime_local = row[10].replace(tzinfo=timezone.utc) + \
                                              timedelta(minutes=timezone_offset)
                    last_run_datetime = last_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                else:
                    last_run_datetime = None

                if isinstance(row[11], datetime):
                    next_run_datetime_local = row[11].replace(tzinfo=timezone.utc) + \
                                              timedelta(minutes=timezone_offset)
                    next_run_datetime = next_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                else:
                    next_run_datetime = None

                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "category": row[3],
                               "fdd_code": row[4],
                               "priority": row[5],
                               "channel": row[6],
                               "expression": row[7],
                               "message_template": row[8].replace("<br>", ""),
                               "is_enabled": bool(row[9]),
                               "last_run_datetime": last_run_datetime,
                               "next_run_datetime": next_run_datetime,
                               "is_run_immediately": bool(row[12])
                               }
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
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RULE_NAME')
        name = str.strip(new_values['data']['name'])

        if 'category' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['category'], str) or \
                len(str.strip(new_values['data']['category'])) == 0 or \
                str.strip(new_values['data']['category']) not in \
                ('SYSTEM', 'REALTIME', 'SPACE', 'METER', 'TENANT', 'STORE', 'SHOPFLOOR', 'EQUIPMENT',
                 'COMBINEDEQUIPMENT', 'VIRTUALMETER', 'DIGITALPOINT'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CATEGORY')
        category = str.strip(new_values['data']['category'])

        if 'fdd_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['fdd_code'], str) or \
                len(str.strip(new_values['data']['fdd_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_FDD_CODE')
        fdd_code = str.strip(new_values['data']['fdd_code'])

        if 'priority' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['priority'], str) or \
                len(str.strip(new_values['data']['priority'])) == 0 or \
                str.strip(new_values['data']['priority']) not in \
                ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIORITY')
        priority = str.strip(new_values['data']['priority'])

        if 'channel' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['channel'], str) or \
                len(str.strip(new_values['data']['channel'])) == 0 or \
                str.strip(new_values['data']['channel']) not in ('WEB', 'EMAIL', 'SMS', 'WECHAT', 'CALL'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CHANNEL')
        channel = str.strip(new_values['data']['channel'])

        if 'expression' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['expression'], str) or \
                len(str.strip(new_values['data']['expression'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION')
        expression = str.strip(new_values['data']['expression'])
        # validate expression in json
        try:
            json.loads(expression)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description=str(ex))

        if 'message_template' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['message_template'], str) or \
                len(str.strip(new_values['data']['message_template'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_MESSAGE_TEMPLATE')
        message_template = str.strip(new_values['data']['message_template'])

        if 'is_enabled' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_enabled'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ENABLED')
        is_enabled = new_values['data']['is_enabled']

        if 'is_run_immediately' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_run_immediately'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_RUN_IMMEDIATELY')
        is_run_immediately = new_values['data']['is_run_immediately']

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_rules "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.RULE_NAME_IS_ALREADY_IN_USE')

        add_row = (" INSERT INTO tbl_rules "
                   "             (name, uuid, category, fdd_code, priority, "
                   "              channel, expression, message_template, is_enabled, "
                   "              is_run_immediately) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 category,
                                 fdd_code,
                                 priority,
                                 channel,
                                 expression,
                                 message_template,
                                 is_enabled,
                                 is_run_immediately))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/rules/' + str(new_id)


class RuleItem:
    def __init__(self):
        """Initializes RuleItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RULE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        category, fdd_code, priority, "
                 "        channel, expression, message_template, "
                 "        is_enabled, last_run_datetime_utc, next_run_datetime_utc, is_run_immediately "
                 " FROM tbl_rules "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.RULE_NOT_FOUND')
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if isinstance(row[10], datetime):
            last_run_datetime_local = row[10].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            last_run_datetime = last_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            last_run_datetime = None

        if isinstance(row[11], datetime):
            next_run_datetime_local = row[11].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            next_run_datetime = next_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            next_run_datetime = None

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "category": row[3],
                  "fdd_code": row[4],
                  "priority": row[5],
                  "channel": row[6],
                  "expression": row[7],
                  "message_template": row[8].replace("<br>", ""),
                  "is_enabled": bool(row[9]),
                  "last_run_datetime": last_run_datetime,
                  "next_run_datetime": next_run_datetime,
                  "is_run_immediately": bool(row[12])
                  }
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RULE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_rules "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.RULE_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_rules WHERE id = %s ", (id_,))
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
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RULE_ID')

        new_values = json.loads(raw_json)
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RULE_NAME')
        name = str.strip(new_values['data']['name'])

        if 'category' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['category'], str) or \
                len(str.strip(new_values['data']['category'])) == 0 or \
                str.strip(new_values['data']['category']) not in \
                ('SYSTEM', 'REALTIME', 'SPACE', 'METER', 'TENANT', 'STORE', 'SHOPFLOOR', 'EQUIPMENT',
                 'COMBINEDEQUIPMENT', 'VIRTUALMETER', 'DIGITALPOINT'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CATEGORY')
        category = str.strip(new_values['data']['category'])

        if 'fdd_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['fdd_code'], str) or \
                len(str.strip(new_values['data']['fdd_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_FDD_CODE')
        fdd_code = str.strip(new_values['data']['fdd_code'])

        if 'priority' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['priority'], str) or \
                len(str.strip(new_values['data']['priority'])) == 0 or \
                str.strip(new_values['data']['priority']) not in \
                ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIORITY')
        priority = str.strip(new_values['data']['priority'])

        if 'channel' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['channel'], str) or \
                len(str.strip(new_values['data']['channel'])) == 0 or \
                str.strip(new_values['data']['channel']) not in ('WEB', 'EMAIL', 'SMS', 'WECHAT', 'CALL'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CHANNEL')
        channel = str.strip(new_values['data']['channel'])

        if 'expression' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['expression'], str) or \
                len(str.strip(new_values['data']['expression'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION')
        expression = str.strip(new_values['data']['expression'])
        # validate expression in json
        try:
            json.loads(expression)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description=str(ex))

        if 'message_template' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['message_template'], str) or \
                len(str.strip(new_values['data']['message_template'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_MESSAGE_TEMPLATE')
        message_template = str.strip(new_values['data']['message_template'])

        if 'is_enabled' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_enabled'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ENABLED')
        is_enabled = new_values['data']['is_enabled']

        if 'is_run_immediately' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_run_immediately'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_RUN_IMMEDIATELY')
        is_run_immediately = new_values['data']['is_run_immediately']

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_rules "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.RULE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_rules "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.RULE_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_rules "
                      " SET name = %s, category = %s, fdd_code = %s, priority = %s, "
                      "     channel = %s, expression = %s, message_template = %s, "
                      "     is_enabled = %s, is_run_immediately = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    category,
                                    fdd_code,
                                    priority,
                                    channel,
                                    expression,
                                    message_template,
                                    is_enabled,
                                    is_run_immediately,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class RuleRun:
    def __init__(self):
        """Initializes RuleItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RULE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_rules "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.RULE_NOT_FOUND')
        update_row = (" UPDATE tbl_rules "
                      " SET is_run_immediately = 1 "
                      " WHERE id = %s ")
        cursor.execute(update_row, (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class RuleExport:
    def __init__(self):
        """Initializes RuleExport"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RULE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        category, fdd_code, priority, "
                 "        channel, expression, message_template, "
                 "        is_enabled, last_run_datetime_utc, next_run_datetime_utc, is_run_immediately "
                 " FROM tbl_rules "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.RULE_NOT_FOUND')
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if isinstance(row[10], datetime):
            last_run_datetime_local = row[10].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            last_run_datetime = last_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            last_run_datetime = None

        if isinstance(row[11], datetime):
            next_run_datetime_local = row[11].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            next_run_datetime = next_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            next_run_datetime = None

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "category": row[3],
                  "fdd_code": row[4],
                  "priority": row[5],
                  "channel": row[6],
                  "expression": row[7],
                  "message_template": row[8].replace("<br>", ""),
                  "is_enabled": bool(row[9]),
                  "last_run_datetime": last_run_datetime,
                  "next_run_datetime": next_run_datetime,
                  "is_run_immediately": bool(row[12])
                  }
        resp.text = json.dumps(result)


class RuleImport:
    def __init__(self):
        """Initializes RuleImport"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)
        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RULE_NAME')
        name = str.strip(new_values['name'])

        if 'category' not in new_values.keys() or \
                not isinstance(new_values['category'], str) or \
                len(str.strip(new_values['category'])) == 0 or \
                str.strip(new_values['category']) not in \
                ('SYSTEM', 'REALTIME', 'SPACE', 'METER', 'TENANT', 'STORE', 'SHOPFLOOR', 'EQUIPMENT',
                 'COMBINEDEQUIPMENT', 'VIRTUALMETER', 'DIGITALPOINT'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CATEGORY')
        category = str.strip(new_values['category'])

        if 'fdd_code' not in new_values.keys() or \
                not isinstance(new_values['fdd_code'], str) or \
                len(str.strip(new_values['fdd_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_FDD_CODE')
        fdd_code = str.strip(new_values['fdd_code'])

        if 'priority' not in new_values.keys() or \
                not isinstance(new_values['priority'], str) or \
                len(str.strip(new_values['priority'])) == 0 or \
                str.strip(new_values['priority']) not in \
                ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIORITY')
        priority = str.strip(new_values['priority'])

        if 'channel' not in new_values.keys() or \
                not isinstance(new_values['channel'], str) or \
                len(str.strip(new_values['channel'])) == 0 or \
                str.strip(new_values['channel']) not in ('WEB', 'EMAIL', 'SMS', 'WECHAT', 'CALL'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CHANNEL')
        channel = str.strip(new_values['channel'])

        if 'expression' not in new_values.keys() or \
                not isinstance(new_values['expression'], str) or \
                len(str.strip(new_values['expression'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION')
        expression = str.strip(new_values['expression'])
        # validate expression in json
        try:
            json.loads(expression)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description=str(ex))

        if 'message_template' not in new_values.keys() or \
                not isinstance(new_values['message_template'], str) or \
                len(str.strip(new_values['message_template'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_MESSAGE_TEMPLATE')
        message_template = str.strip(new_values['message_template'])

        if 'is_enabled' not in new_values.keys() or \
                not isinstance(new_values['is_enabled'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ENABLED')
        is_enabled = new_values['is_enabled']

        if 'is_run_immediately' not in new_values.keys() or \
                not isinstance(new_values['is_run_immediately'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_RUN_IMMEDIATELY')
        is_run_immediately = new_values['is_run_immediately']

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_rules "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.RULE_NAME_IS_ALREADY_IN_USE')

        add_row = (" INSERT INTO tbl_rules "
                   "             (name, uuid, category, fdd_code, priority, "
                   "              channel, expression, message_template, is_enabled, "
                   "              is_run_immediately) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 category,
                                 fdd_code,
                                 priority,
                                 channel,
                                 expression,
                                 message_template,
                                 is_enabled,
                                 is_run_immediately))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/rules/' + str(new_id)


class RuleClone:
    def __init__(self):
        """Initializes RuleClone"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RULE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        category, fdd_code, priority, "
                 "        channel, expression, message_template, "
                 "        is_enabled, last_run_datetime_utc, next_run_datetime_utc, is_run_immediately "
                 " FROM tbl_rules "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.RULE_NOT_FOUND')
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if isinstance(row[10], datetime):
            last_run_datetime_local = row[10].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            last_run_datetime = last_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            last_run_datetime = None

        if isinstance(row[11], datetime):
            next_run_datetime_local = row[11].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            next_run_datetime = next_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            next_run_datetime = None

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "category": row[3],
                  "fdd_code": row[4],
                  "priority": row[5],
                  "channel": row[6],
                  "expression": row[7],
                  "message_template": row[8].replace("<br>", ""),
                  "is_enabled": bool(row[9]),
                  "last_run_datetime": last_run_datetime,
                  "next_run_datetime": next_run_datetime,
                  "is_run_immediately": bool(row[12])
                  }
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        new_name = (str.strip(result['name'])
                    + (datetime.now()
                       + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
        add_row = (" INSERT INTO tbl_rules "
                   "             (name, uuid, category, fdd_code, priority, "
                   "              channel, expression, message_template, is_enabled, "
                   "              is_run_immediately) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_row, (new_name,
                                 str(uuid.uuid4()),
                                 result['category'],
                                 result['fdd_code'],
                                 result['priority'],
                                 result['channel'],
                                 result['expression'],
                                 result['message_template'],
                                 result['is_enabled'],
                                 result['is_run_immediately']))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/rules/' + str(new_id)
        
