import falcon
import simplejson as json
import mysql.connector
import config
import uuid
from datetime import datetime


class DataSourceCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_gateways ")
        cursor.execute(query)
        rows_gateways = cursor.fetchall()
        gateway_dict = dict()
        if rows_gateways is not None and len(rows_gateways) > 0:
            for row in rows_gateways:
                gateway_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}

        query = (" SELECT id, name, uuid, gateway_id, protocol, connection, last_seen_datetime_utc "
                 " FROM tbl_data_sources "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.disconnect()

        result = list()
        now = datetime.utcnow().replace(second=0, microsecond=0, tzinfo=None)
        if rows is not None and len(rows) > 0:
            for row in rows:
                last_seen_time = row[6]
                if last_seen_time is not None and (now - last_seen_time).total_seconds() > 5 * 60:
                    status = "online"
                else:
                    status = "offline"
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "gateway": gateway_dict.get(row[3]),
                               "protocol": row[4],
                               "connection": row[5],
                               "last_seen_datetime": row[4].timestamp() * 1000 if isinstance(row[4],
                                                                                             datetime) else None,
                               "status": status
                               }

                result.append(meta_result)

        resp.body = json.dumps(result)

    @staticmethod
    def on_post(req, resp):
        """Handles POST requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_NAME')
        name = str.strip(new_values['data']['name'])

        if 'gateway_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['gateway_id'], int) or \
                new_values['data']['gateway_id'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')
        gateway_id = new_values['data']['gateway_id']

        if 'protocol' not in new_values['data'].keys() \
                or new_values['data']['protocol'] not in \
                ('modbus-tcp', 'modbus-rtu', 'bacnet-ip', 's7', 'profibus', 'profinet', 'opc-ua', 'lora', 'simulation',
                 'controllogix', 'weather'):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_PROTOCOL.')
        protocol = new_values['data']['protocol']

        if 'connection' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['connection'], str) or \
                len(str.strip(new_values['data']['connection'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONNECTION')
        connection = str.strip(new_values['data']['connection'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.DATA_SOURCE_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE id = %s ", (gateway_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')

        add_values = (" INSERT INTO tbl_data_sources (name, uuid, gateway_id, protocol, connection) "
                      " VALUES (%s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    gateway_id,
                                    protocol,
                                    connection))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/datasources/' + str(new_id)


class DataSourceItem:
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
                                   description='API.INVALID_DATA_SOURCE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_gateways ")
        cursor.execute(query)
        rows_gateways = cursor.fetchall()
        gateway_dict = dict()
        if rows_gateways is not None and len(rows_gateways) > 0:
            for row in rows_gateways:
                gateway_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}

        query = (" SELECT id, name, uuid, gateway_id, protocol, connection, last_seen_datetime_utc "
                 " FROM tbl_data_sources "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()
        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        last_seen_time = row[6]
        now = datetime.utcnow().replace(second=0, microsecond=0, tzinfo=None)

        if last_seen_time is not None and (now - last_seen_time).total_seconds() > 5 * 60:
            status = "online"
        else:
            status = "offline"

        result = {"id": row[0], "name": row[1], "uuid": row[2],
                  "gateway": gateway_dict.get(row[3]),
                  "protocol": row[4],
                  "connection": row[5],
                  "last_seen_datetime": row[4].timestamp() * 1000 if isinstance(row[4], datetime) else None,
                  "status": status
                  }

        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        # check if this data source is being used by any meters
        cursor.execute(" SELECT DISTINCT(m.name) "
                       " FROM tbl_meters m, tbl_meters_points mp, tbl_points p, tbl_data_sources ds "
                       " WHERE m.id = mp.meter_id AND mp.point_id = p.id AND p.data_source_id = ds.id "
                       "       AND ds.id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_meter = cursor.fetchone()
        if row_meter is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THIS_DATA_SOURCE_IS_BEING_USED_BY_A_METER' + row_meter[0])

        cursor.execute(" DELETE FROM tbl_points WHERE data_source_id = %s ", (id_,))
        cursor.execute(" DELETE FROM tbl_data_sources WHERE id = %s ", (id_,))
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
            raise falcon.HTTPError(falcon.HTTP_400, 'API.ERROR', ex)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_NAME')
        name = str.strip(new_values['data']['name'])

        if 'gateway_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['gateway_id'], int) or \
                new_values['data']['gateway_id'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')
        gateway_id = new_values['data']['gateway_id']

        if 'protocol' not in new_values['data'].keys() \
                or new_values['data']['protocol'] not in \
                ('modbus-tcp', 'modbus-rtu', 'bacnet-ip', 's7', 'profibus', 'profinet', 'opc-ua', 'lora', 'simulation',
                 'controllogix', 'weather'):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_PROTOCOL.')
        protocol = new_values['data']['protocol']

        if 'connection' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['connection'], str) or \
                len(str.strip(new_values['data']['connection'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONNECTION')
        connection = str.strip(new_values['data']['connection'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE id = %s ", (gateway_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')

        update_row = (" UPDATE tbl_data_sources "
                      " SET name = %s, gateway_id = %s, protocol = %s, connection = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    gateway_id,
                                    protocol,
                                    connection,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200


class DataSourcePointCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        result = list()
        # Get points of the data source
        # NOTE: there is no uuid in tbl_points
        query_point = (" SELECT id, name, object_type, "
                       "        units, high_limit, low_limit, ratio, is_trend, address, description "
                       " FROM tbl_points "
                       " WHERE data_source_id = %s "
                       " ORDER BY name ")
        cursor.execute(query_point, (id_,))
        rows_point = cursor.fetchall()

        if rows_point is not None and len(rows_point) > 0:
            for row in rows_point:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "object_type": row[2],
                               "units": row[3],
                               "high_limit": row[4],
                               "low_limit": row[5],
                               "ratio": float(row[6]),
                               "is_trend": True if row[7] else False,
                               "address": row[8],
                               "description": row[9]}
                result.append(meta_result)

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)
