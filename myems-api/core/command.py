import uuid
import falcon
import mysql.connector
import simplejson as json
import paho.mqtt.client as mqtt
import time
from string import Template
import config
from core.useractivity import user_logger, access_control


class CommandCollection:
    @staticmethod
    def __init__():
        """"Initializes CommandCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        topic, payload, set_value, description "
                 " FROM tbl_commands "
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
                               "uuid": row[2],
                               "topic": row[3],
                               "payload": row[4],
                               "set_value": row[5],
                               "description": row[6]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        access_control(req)
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
                                   description='API.INVALID_COMMAND_NAME')
        name = str.strip(new_values['data']['name'])

        if 'topic' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['topic'], str) or \
                len(str.strip(new_values['data']['topic'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOPIC')
        topic = str.lower(str.strip(new_values['data']['topic']))

        if 'payload' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['payload'], str) or \
                len(str.strip(new_values['data']['payload'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PAYLOAD')
        payload = str.strip(new_values['data']['payload'])

        if 'set_value' not in new_values['data'].keys():
            set_value = None
        elif isinstance(new_values['data']['set_value'], float) or \
                isinstance(new_values['data']['set_value'], int):
            set_value = float(new_values['data']['set_value'])
        else:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SET_VALUE')

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.COMMAND_NAME_IS_ALREADY_IN_USE')

        add_row = (" INSERT INTO tbl_commands "
                   "     (name, uuid, topic, payload, set_value, description) "
                   " VALUES (%s, %s, %s, %s, %s, %s) ")

        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 topic,
                                 payload,
                                 set_value,
                                 description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/commands/' + str(new_id)


class CommandItem:
    @staticmethod
    def __init__():
        """"Initializes CommandItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, topic, payload, set_value, description "
                 " FROM tbl_commands "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "topic": row[3],
                  "payload": row[4],
                  "set_value": row[5],
                  "description": row[6]}
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        # todo: check relation with points

        cursor.execute(" DELETE FROM tbl_commands WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

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
                                   description='API.INVALID_COMMAND_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_NAME')
        name = str.strip(new_values['data']['name'])

        if 'topic' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['topic'], str) or \
                len(str.strip(new_values['data']['topic'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOPIC')
        topic = str.lower(str.strip(new_values['data']['topic']))

        if 'payload' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['payload'], str) or \
                len(str.strip(new_values['data']['payload'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PAYLOAD')
        payload = str.strip(new_values['data']['payload'])

        if 'set_value' in new_values['data'].keys() and \
                not (isinstance(new_values['data']['set_value'], float) or
                     isinstance(new_values['data']['set_value'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SET_VALUE')
            set_value = float(new_values['data']['set_value'])
        else:
            set_value = None

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.COMMAND_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_commands "
                      " SET name = %s, topic = %s, payload = %s, set_value = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    topic,
                                    payload,
                                    set_value,
                                    description,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class CommandSend:
    @staticmethod
    def __init__():
        """"Initializes CommandSend"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        access_control(req)
        # Get command by ID
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, topic, payload, set_value, description "
                 " FROM tbl_commands "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        command = {"id": row[0],
                   "name": row[1],
                   "uuid": row[2],
                   "topic": row[3],
                   "payload": row[4],
                   "set_value": row[5],
                   "description": row[6]}

        mqc = None
        try:
            mqc = mqtt.Client(client_id='MYEMS' + "-" + str(time.time()))
            mqc.username_pw_set(config.myems_mqtt_broker['username'], config.myems_mqtt_broker['password'])
            mqc.connect(config.myems_mqtt_broker['host'], config.myems_mqtt_broker['port'], 60)
        except Exception as e:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MQTT_CONNECTION_ERROR')

        try:
            if command['set_value']:
                payload = Template(command['payload']).substitute(s1=str(command['set_value']))
            else:
                payload = command['payload']
            print('payload=' + str(payload))
            mqc.publish(command['topic'], payload=payload)
        except Exception as e:
            print(str(e))
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MQTT_PUBLISH_ERROR')

        resp.text = json.dumps('success')
