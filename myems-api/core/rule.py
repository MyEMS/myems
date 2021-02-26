import falcon
import json
import mysql.connector
import config
import uuid


class RuleCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, uuid, "
                 "        fdd_code, category, priority, "
                 "        channel, expression, message_template, "
                 "        is_enabled "
                 " FROM tbl_rules "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row['id'], "name": row['name'], "uuid": row['uuid'],
                               "fdd_code": row['fdd_code'], "category": row['category'], "priority": row['priority'],
                               "channel": row['channel'], "expression": row['expression'],
                               "message_template": row['message_template'].replace("<br>", ""),
                               "is_enabled": bool(row['is_enabled'])}
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
                                   description='API.INVALID_RULE_NAME')
        name = str.strip(new_values['data']['name'])

        if 'fdd_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['fdd_code'], str) or \
                len(str.strip(new_values['data']['fdd_code'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_FDD_CODE')
        fdd_code = str.strip(new_values['data']['fdd_code'])

        if 'category' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['category'], str) or \
                len(str.strip(new_values['data']['category'])) == 0 or \
                str.strip(new_values['data']['category']) not in \
                ('SYSTEM', 'SPACE', 'METER', 'TENANT', 'STORE', 'SHOPFLOOR', 'EQUIPMENT', 'COMBINEDEQUIPMENT'):
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CATEGORY')
        category = str.strip(new_values['data']['category'])

        if 'priority' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['priority'], str) or \
                len(str.strip(new_values['data']['priority'])) == 0 or \
                str.strip(new_values['data']['priority']) not in \
                ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'):
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIORITY')
        priority = str.strip(new_values['data']['priority'])

        if 'channel' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['channel'], str) or \
                len(str.strip(new_values['data']['channel'])) == 0 or \
                str.strip(new_values['data']['channel']) not in ('WEB', 'EMAIL', 'SMS', 'WECHAT', 'CALL'):
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CHANNEL')
        channel = str.strip(new_values['data']['channel'])

        if 'expression' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['expression'], str) or \
                len(str.strip(new_values['data']['expression'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION')
        expression = str.strip(new_values['data']['expression'])

        if 'message_template' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['message_template'], str) or \
                len(str.strip(new_values['data']['message_template'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_MESSAGE_TEMPLATE')
        message_template = str.strip(new_values['data']['message_template'])

        if 'is_enabled' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_enabled'], bool):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ENABLED')
        is_enabled = new_values['data']['is_enabled']

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_rules "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.RULE_NAME_IS_ALREADY_IN_USE')

        add_row = (" INSERT INTO tbl_rules "
                   "             (name, uuid, fdd_code, category, priority, "
                   "              channel, expression, message_template, is_enabled) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 fdd_code,
                                 category,
                                 priority,
                                 channel,
                                 expression,
                                 message_template,
                                 is_enabled))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/rules/' + str(new_id)


class RuleItem:
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
                                   description='API.INVALID_RULE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, uuid, "
                 "        fdd_code, category, priority, "
                 "        channel, expression, message_template, is_enabled "
                 " FROM tbl_rules "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()
        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.RULE_NOT_FOUND')

        result = {"id": row['id'], "name": row['name'], "uuid": row['uuid'],
                  "fdd_code": row['fdd_code'], "category": row['category'], "priority": row['priority'],
                  "channel": row['channel'], "expression": row['expression'],
                  "message_template": row['message_template'].replace("<br>", ""),
                  "is_enabled": bool(row['is_enabled'])}
        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RULE_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_rules "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.RULE_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_rules WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_RULE_ID')

        new_values = json.loads(raw_json)
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RULE_NAME')
        name = str.strip(new_values['data']['name'])

        if 'fdd_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['fdd_code'], str) or \
                len(str.strip(new_values['data']['fdd_code'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_FDD_CODE')
        fdd_code = str.strip(new_values['data']['fdd_code'])

        if 'category' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['category'], str) or \
                len(str.strip(new_values['data']['category'])) == 0 or \
                str.strip(new_values['data']['category']) not in \
                ('SYSTEM', 'SPACE', 'METER', 'TENANT', 'STORE', 'SHOPFLOOR', 'EQUIPMENT', 'COMBINEDEQUIPMENT'):
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CATEGORY')
        category = str.strip(new_values['data']['category'])

        if 'priority' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['priority'], str) or \
                len(str.strip(new_values['data']['priority'])) == 0 or \
                str.strip(new_values['data']['priority']) not in \
                ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'):
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIORITY')
        priority = str.strip(new_values['data']['priority'])

        if 'channel' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['channel'], str) or \
                len(str.strip(new_values['data']['channel'])) == 0 or \
                str.strip(new_values['data']['channel']) not in ('WEB', 'EMAIL', 'SMS', 'WECHAT', 'CALL'):
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CHANNEL')
        channel = str.strip(new_values['data']['channel'])

        if 'expression' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['expression'], str) or \
                len(str.strip(new_values['data']['expression'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION')
        expression = str.strip(new_values['data']['expression'])

        if 'message_template' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['message_template'], str) or \
                len(str.strip(new_values['data']['message_template'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_MESSAGE_TEMPLATE')
        message_template = str.strip(new_values['data']['message_template'])

        if 'is_enabled' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_enabled'], bool):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ENABLED')
        is_enabled = new_values['data']['is_enabled']

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_rules "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.RULE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_rules "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.RULE_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_rules "
                      " SET name = %s, fdd_code = %s, category = %s, priority = %s, "
                      "     channel = %s, expression = %s, message_template = %s, "
                      "     is_enabled = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    fdd_code,
                                    category,
                                    priority,
                                    channel,
                                    expression,
                                    message_template,
                                    is_enabled,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200
