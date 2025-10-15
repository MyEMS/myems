import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
import paho.mqtt.client as mqtt
import time
from string import Template
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class CommandCollection:
    """
    Command Collection Resource

    This class handles CRUD operations for command collection.
    It provides endpoints for listing all commands and creating new commands.
    Commands represent MQTT-based control instructions for energy management systems.
    """
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        search_query = req.get_param('q', default=None)
        if search_query is not None:
            search_query = search_query.strip()
        else:
            search_query = ''

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        topic, payload, set_value, description "
                 " FROM tbl_commands " )

        params=[]
        if search_query:
            query += " WHERE name LIKE %s  OR topic LIKE %s  OR  description LIKE %s "
            params = [f'%{search_query}%', f'%{search_query}%', f'%{search_query}%']
        query +=  " ORDER BY id "
        cursor.execute(query, params)

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
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
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
        topic = str.strip(new_values['data']['topic'])

        if 'payload' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['payload'], str) or \
                len(str.strip(new_values['data']['payload'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PAYLOAD')
        payload = str.strip(new_values['data']['payload'])

        if 'set_value' not in new_values['data'].keys() or new_values['data']['set_value'] is None:
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
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
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
        admin_control(req)
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

        # check relation with meter
        cursor.execute(" SELECT meter_id "
                       " FROM tbl_meters_commands "
                       " WHERE command_id = %s ",
                       (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_METERS')

        # check relation with space
        cursor.execute(" SELECT space_id "
                       " FROM tbl_spaces_commands "
                       " WHERE command_id = %s ",
                       (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # check relation with equipment
        cursor.execute(" SELECT equipment_id "
                       " FROM tbl_equipments_commands "
                       " WHERE command_id = %s ",
                       (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENTS')

        # check relation with combined equipment
        cursor.execute(" SELECT combined_equipment_id "
                       " FROM tbl_combined_equipments_commands "
                       " WHERE command_id = %s ",
                       (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENTS')

        # check relation with tenant
        cursor.execute(" SELECT tenant_id "
                       " FROM tbl_tenants_commands "
                       " WHERE command_id = %s ",
                       (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_TENANTS')

        # check relation with store
        cursor.execute(" SELECT store_id "
                       " FROM tbl_stores_commands "
                       " WHERE command_id = %s ",
                       (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_STORES')

        # check relation with shopfloor
        cursor.execute(" SELECT shopfloor_id "
                       " FROM tbl_shopfloors_commands "
                       " WHERE command_id = %s ",
                       (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SHOPFLOORS')

        # check relation with energy storage container
        cursor.execute(" SELECT energy_storage_container_id "
                       " FROM tbl_energy_storage_containers_commands "
                       " WHERE command_id = %s ",
                       (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS')

        # check relation with microgrid
        cursor.execute(" SELECT microgrid_id "
                       " FROM tbl_microgrids_commands "
                       " WHERE command_id = %s ",
                       (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_MICROGRIDS')

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
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
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
        topic = str.strip(new_values['data']['topic'])

        if 'payload' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['payload'], str) or \
                len(str.strip(new_values['data']['payload'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PAYLOAD')
        payload = str.strip(new_values['data']['payload'])

        if 'set_value' not in new_values['data'].keys() or new_values['data']['set_value'] is None:
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
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_put(req, resp, id_):
        """Handles GET requests"""
        admin_control(req)
        # Get command by ID
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')

        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'set_value' not in new_values['data'].keys() or new_values['data']['set_value'] is None:
            set_value = None
        elif isinstance(new_values['data']['set_value'], float):
            set_value = float(new_values['data']['set_value'])
        elif isinstance(new_values['data']['set_value'], int):
            set_value = int(new_values['data']['set_value'])
        else:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SET_VALUE')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, topic, payload, set_value "
                 " FROM tbl_commands "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        command = {"id": row[0],
                   "name": row[1],
                   "uuid": row[2],
                   "topic": row[3],
                   "payload": row[4],
                   "set_value": set_value if set_value is not None else row[5]}

        update_row = (" UPDATE tbl_commands "
                      " SET set_value = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (set_value,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        mqc = None
        try:
            mqc = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
                              client_id='MYEMS' + "-" + str(time.time()),
                              clean_session=None,
                              userdata=None,
                              protocol=mqtt.MQTTv5,
                              transport='tcp',
                              reconnect_on_failure=True,
                              manual_ack=False)
            mqc.username_pw_set(config.myems_mqtt_broker['username'], config.myems_mqtt_broker['password'])
            mqc.connect(config.myems_mqtt_broker['host'], config.myems_mqtt_broker['port'], 60)
        except Exception as e:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MQTT_CONNECTION_ERROR')

        try:
            if command['set_value'] is not None:
                payload = Template(command['payload']).substitute(s1=str(command['set_value']))
            else:
                payload = Template(command['payload']).substitute(s1=str(0))
            print('payload=' + str(payload))
            mqc.publish(command['topic'], payload=payload)
        except Exception as e:
            print(str(e))
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MQTT_PUBLISH_ERROR')

        resp.text = json.dumps('success')


class CommandExport:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
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


class CommandImport:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

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

        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_NAME')
        name = str.strip(new_values['name'])

        if 'topic' not in new_values.keys() or \
                not isinstance(new_values['topic'], str) or \
                len(str.strip(new_values['topic'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOPIC')
        topic = str.strip(new_values['topic'])

        if 'payload' not in new_values.keys() or \
                not isinstance(new_values['payload'], str) or \
                len(str.strip(new_values['payload'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PAYLOAD')
        payload = str.strip(new_values['payload'])

        if 'set_value' not in new_values.keys() or new_values['set_value'] is None:
            set_value = None
        elif isinstance(new_values['set_value'], float) or \
                isinstance(new_values['set_value'], int):
            set_value = float(new_values['set_value'])
        else:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SET_VALUE')

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
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


class CommandClone:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        admin_control(req)
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
        add_row = (" INSERT INTO tbl_commands "
                   "     (name, uuid, topic, payload, set_value, description) "
                   " VALUES (%s, %s, %s, %s, %s, %s) ")

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        new_name = (str.strip(result['name']) +
                    (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
        cursor.execute(add_row, (new_name,
                                 str(uuid.uuid4()),
                                 result['topic'],
                                 result['payload'],
                                 result['set_value'],
                                 result['description']))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/commands/' + str(new_id)

