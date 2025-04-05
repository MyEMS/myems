import uuid
from datetime import datetime, timezone, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control
import config
from decimal import Decimal


class DataSourceCollection:
    def __init__(self):
        """"Initializes DataSourceCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        admin_control(req)
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

        query = (" SELECT id, name, uuid, gateway_id, protocol, connection, last_seen_datetime_utc, description "
                 " FROM tbl_data_sources "
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
                if isinstance(row[6], datetime):
                    last_seen_datetime_local = row[6].replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                    last_seen_datetime = last_seen_datetime_local.isoformat()[0:19]
                else:
                    last_seen_datetime = None
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "gateway": gateway_dict.get(row[3]),
                               "protocol": row[4],
                               "connection": row[5],
                               "last_seen_datetime": last_seen_datetime,
                               "description": row[7]
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
                                   description='API.INVALID_DATA_SOURCE_NAME')
        name = str.strip(new_values['data']['name'])

        if 'gateway_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['gateway_id'], int) or \
                new_values['data']['gateway_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')
        gateway_id = new_values['data']['gateway_id']

        if 'protocol' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['protocol'], str) or \
                len(str.strip(new_values['data']['protocol'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_PROTOCOL')
        protocol = new_values['data']['protocol']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, code "
                 " FROM tbl_protocols ")
        cursor.execute(query)
        rows_protocols = cursor.fetchall()

        procotol_dict = dict()
        if rows_protocols is not None and len(rows_protocols) > 0:
            for row in rows_protocols:
                procotol_dict[row[2]] = {"id": row[0],
                                         "name": row[1],
                                         "code": row[2]}

        if protocol not in procotol_dict.keys():
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_PROTOCOL')

        if 'connection' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['connection'], str) or \
                len(str.strip(new_values['data']['connection'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONNECTION')
        connection = str.strip(new_values['data']['connection'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.DATA_SOURCE_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE id = %s ", (gateway_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')

        add_values = (" INSERT INTO tbl_data_sources (name, uuid, gateway_id, protocol, connection, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    gateway_id,
                                    protocol,
                                    connection,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/datasources/' + str(new_id)


class DataSourceItem:
    def __init__(self):
        """"Initializes DataSourceItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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

        query = (" SELECT id, name, uuid, gateway_id, protocol, connection, last_seen_datetime_utc, description "
                 " FROM tbl_data_sources "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if isinstance(row[6], datetime):
            last_seen_datetime_local = row[6].replace(tzinfo=timezone.utc) + \
                timedelta(minutes=timezone_offset)
            last_seen_datetime = last_seen_datetime_local.isoformat()[0:19]
        else:
            last_seen_datetime = None

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "gateway": gateway_dict.get(row[3]),
                  "protocol": row[4],
                  "connection": row[5],
                  "last_seen_datetime": last_seen_datetime,
                  "description": row[7]
                  }

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
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
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THIS_DATA_SOURCE_IS_BEING_USED_BY_A_METER' + row_meter[0])
        # todo : check if this data source is being used by any other objects
        cursor.execute(" DELETE FROM tbl_points WHERE data_source_id = %s ", (id_,))
        cursor.execute(" DELETE FROM tbl_data_sources WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_DATA_SOURCE_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_NAME')
        name = str.strip(new_values['data']['name'])

        if 'gateway_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['gateway_id'], int) or \
                new_values['data']['gateway_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')
        gateway_id = new_values['data']['gateway_id']

        if 'protocol' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['protocol'], str) or \
                len(str.strip(new_values['data']['protocol'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_PROTOCOL')
        protocol = new_values['data']['protocol']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, code "
                 " FROM tbl_protocols ")
        cursor.execute(query)
        rows_protocols = cursor.fetchall()

        procotol_dict = dict()
        if rows_protocols is not None and len(rows_protocols) > 0:
            for row in rows_protocols:
                procotol_dict[row[2]] = {"id": row[0],
                                         "name": row[1],
                                         "code": row[2]}

        if protocol not in procotol_dict.keys():
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_PROTOCOL')

        if 'connection' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['connection'], str) or \
                len(str.strip(new_values['data']['connection'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONNECTION')
        connection = str.strip(new_values['data']['connection'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE id = %s ", (gateway_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')

        update_row = (" UPDATE tbl_data_sources "
                      " SET name = %s, gateway_id = %s, protocol = %s, connection = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    gateway_id,
                                    protocol,
                                    connection,
                                    description,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class DataSourcePointCollection:
    def __init__(self):
        """"Initializes DataSourcePointCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()

        cursor_system_db.execute(" SELECT name "
                                 " FROM tbl_data_sources "
                                 " WHERE id = %s ", (id_,))
        if cursor_system_db.fetchone() is None:
            cursor_system_db.close()
            cnx_system_db.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        result = list()
        # Get points of the data source
        # NOTE: there is no uuid in tbl_points
        query_point = (" SELECT id, name, object_type, "
                       "        units, high_limit, low_limit, higher_limit, lower_limit, ratio, offset_constant, "
                       "        is_trend, is_virtual, address, description, faults "
                       " FROM tbl_points "
                       " WHERE data_source_id = %s "
                       " ORDER BY id ")
        cursor_system_db.execute(query_point, (id_,))
        rows_point = cursor_system_db.fetchall()

        cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical_db = cnx_historical_db.cursor()
        cursor_historical_db.execute(" SELECT point_id, actual_value "
                                     " FROM tbl_analog_value_latest "
                                     " WHERE utc_date_time >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 MINUTE)")
        analog_values = cursor_historical_db.fetchall()
        analog_value_dict = dict()
        for v in analog_values:
            analog_value_dict[v[0]] = v[1]

        cursor_historical_db.execute(" SELECT point_id, actual_value "
                                     " FROM tbl_digital_value_latest "
                                     " WHERE utc_date_time >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 MINUTE)")
        digital_values = cursor_historical_db.fetchall()
        digital_value_dict = dict()
        for v in digital_values:
            digital_value_dict[v[0]] = v[1]

        cursor_historical_db.execute(" SELECT point_id, actual_value "
                                     " FROM tbl_energy_value_latest "
                                     " WHERE utc_date_time >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 MINUTE)")
        energy_values = cursor_historical_db.fetchall()
        energy_value_dict = dict()
        for v in energy_values:
            energy_value_dict[v[0]] = v[1]

        cursor_historical_db.execute(" SELECT point_id, actual_value "
                                     " FROM tbl_text_value_latest "
                                     " WHERE utc_date_time >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 MINUTE)")
        text_values = cursor_historical_db.fetchall()
        text_value_dict = dict()
        for v in text_values:
            text_value_dict[v[0]] = v[1]

        if rows_point is not None and len(rows_point) > 0:
            for row in rows_point:
                if row[2] == 'ANALOG_VALUE':
                    latest_value = analog_value_dict.get(row[0], None)
                    latest_value = Decimal(latest_value) if latest_value is not None else None
                elif row[2] == 'DIGITAL_VALUE':
                    latest_value = digital_value_dict.get(row[0], None)
                    latest_value = int(latest_value) if latest_value is not None else None
                elif row[2] == 'ENERGY_VALUE':
                    latest_value = energy_value_dict.get(row[0], None)
                    latest_value = Decimal(latest_value) if latest_value is not None else None
                elif row[2] == 'TEXT_VALUE':
                    latest_value = text_value_dict.get(row[0], None)
                    latest_value = str(latest_value) if latest_value is not None else None

                meta_result = {"id": row[0],
                               "name": row[1],
                               "object_type": row[2],
                               "units": row[3],
                               "high_limit": row[4],
                               "low_limit": row[5],
                               "higher_limit": row[6],
                               "lower_limit": row[7],
                               "ratio": Decimal(row[8]),
                               "offset_constant": Decimal(row[9]),
                               "is_trend": bool(row[10]),
                               "is_virtual": bool(row[11]),
                               "address": row[12],
                               "description": row[13],
                               "faults": row[14],
                               "latest_value": latest_value,
                               }

                result.append(meta_result)

        cursor_system_db.close()
        cnx_system_db.close()
        cursor_historical_db.close()
        cnx_historical_db.close()
        resp.text = json.dumps(result)


class DataSourceExport:
    def __init__(self):
        """"Initializes DataSourceExport"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
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

        query = (" SELECT id, name, uuid, gateway_id, protocol, connection, last_seen_datetime_utc, description "
                 " FROM tbl_data_sources "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if isinstance(row[6], datetime):
            last_seen_datetime_local = row[6].replace(tzinfo=timezone.utc) + \
                                       timedelta(minutes=timezone_offset)
            last_seen_datetime = last_seen_datetime_local.isoformat()[0:19]
        else:
            last_seen_datetime = None

        result = {"name": row[1],
                  "uuid": row[2],
                  "gateway": gateway_dict.get(row[3]),
                  "protocol": row[4],
                  "connection": row[5],
                  "last_seen_datetime": last_seen_datetime,
                  "description": row[7],
                  "points": None
                  }
        point_result = list()
        # Get points of the data source
        # NOTE: there is no uuid in tbl_points
        query_point = (" SELECT id, name, object_type, "
                       "        units, high_limit, low_limit, higher_limit, lower_limit, ratio, "
                       "        is_trend, is_virtual, address, description, faults "
                       " FROM tbl_points "
                       " WHERE data_source_id = %s "
                       " ORDER BY id ")
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
                               "higher_limit": row[6],
                               "lower_limit": row[7],
                               "ratio": Decimal(row[8]),
                               "is_trend": bool(row[9]),
                               "is_virtual": bool(row[10]),
                               "address": row[11],
                               "description": row[12],
                               "faults": row[13]}
                point_result.append(meta_result)
            result['points'] = point_result
        cursor.close()
        cnx.close()

        resp.text = json.dumps(result)


class DataSourceImport:
    def __init__(self):
        """"Initializes DataSourceImport"""
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
                                   description='API.INVALID_DATA_SOURCE_NAME')
        name = str.strip(new_values['name'])

        if 'gateway' not in new_values.keys() or \
                'id' not in new_values['gateway'].keys() or \
                not isinstance(new_values['gateway']['id'], int) or \
                new_values['gateway']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')
        gateway_id = new_values['gateway']['id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, code "
                 " FROM tbl_protocols ")
        cursor.execute(query)
        rows_protocols = cursor.fetchall()
        procotol_dict = dict()
        if rows_protocols is not None and len(rows_protocols) > 0:
            for row in rows_protocols:
                procotol_dict[row[2]] = {"id": row[0],
                                         "name": row[1],
                                         "code": row[2]}

        if 'protocol' not in new_values.keys() \
                or new_values['protocol'] not in procotol_dict.keys():
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_PROTOCOL')
        protocol = new_values['protocol']

        if 'connection' not in new_values.keys() or \
                not isinstance(new_values['connection'], str) or \
                len(str.strip(new_values['connection'])) == 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONNECTION')
        connection = str.strip(new_values['connection'])

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.DATA_SOURCE_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE id = %s ", (gateway_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')

        add_values = (" INSERT INTO tbl_data_sources (name, uuid, gateway_id, protocol, connection, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    gateway_id,
                                    protocol,
                                    connection,
                                    description))
        new_id = cursor.lastrowid
        if new_values['points'] is not None and len(new_values['points']) > 0:
            for point in new_values['points']:
                # todo: validate point properties
                add_value = (" INSERT INTO tbl_points (name, data_source_id, object_type, units, "
                             "                         high_limit, low_limit, higher_limit, lower_limit, ratio, "
                             "                         is_trend, is_virtual, address, description, faults) "
                             " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
                cursor.execute(add_value, (point['name'],
                                           new_id,
                                           point['object_type'],
                                           point['units'],
                                           point['high_limit'],
                                           point['low_limit'],
                                           point['higher_limit'],
                                           point['lower_limit'],
                                           point['ratio'],
                                           point['is_trend'],
                                           point['is_virtual'],
                                           point['address'],
                                           point['description'],
                                           point['faults']))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/datasources/' + str(new_id)


class DataSourceClone:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, gateway_id, protocol, connection, description "
                 " FROM tbl_data_sources "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        meta_result = {"id": row[0],
                       "name": row[1],
                       "uuid": row[2],
                       "gateway_id": row[3],
                       "protocol": row[4],
                       "connection": row[5],
                       "description": row[6],
                       "points": None
                       }
        point_result = list()
        # Get points of the data source
        # NOTE: there is no uuid in tbl_points
        query_point = (" SELECT id, name, object_type, "
                       "        units, high_limit, low_limit, higher_limit, lower_limit, ratio, "
                       "        is_trend, is_virtual, address, description, faults "
                       " FROM tbl_points "
                       " WHERE data_source_id = %s "
                       " ORDER BY id ")
        cursor.execute(query_point, (id_,))
        rows_point = cursor.fetchall()

        if rows_point is not None and len(rows_point) > 0:
            for row in rows_point:
                result = {"id": row[0],
                          "name": row[1],
                          "object_type": row[2],
                          "units": row[3],
                          "high_limit": row[4],
                          "low_limit": row[5],
                          "higher_limit": row[6],
                          "lower_limit": row[7],
                          "ratio": Decimal(row[8]),
                          "is_trend": bool(row[9]),
                          "is_virtual": bool(row[10]),
                          "address": row[11],
                          "description": row[12],
                          "faults": row[13]}
                point_result.append(result)
            meta_result['points'] = point_result

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        new_name = str.strip(meta_result['name']) + \
            (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds')

        add_values = (" INSERT INTO tbl_data_sources (name, uuid, gateway_id, protocol, connection, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (new_name,
                                    str(uuid.uuid4()),
                                    meta_result['gateway_id'],
                                    meta_result['protocol'],
                                    meta_result['connection'],
                                    meta_result['description']))
        new_id = cursor.lastrowid
        if meta_result['points'] is not None:
            for point in meta_result['points']:
                add_value = (" INSERT INTO tbl_points (name, data_source_id, object_type, units, "
                             "                         high_limit, low_limit, higher_limit, lower_limit, ratio, "
                             "                         is_trend, is_virtual, address, description, faults) "
                             " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
                cursor.execute(add_value, (point['name'],
                                           new_id,
                                           point['object_type'],
                                           point['units'],
                                           point['high_limit'],
                                           point['low_limit'],
                                           point['higher_limit'],
                                           point['lower_limit'],
                                           point['ratio'],
                                           point['is_trend'],
                                           point['is_virtual'],
                                           point['address'],
                                           point['description'],
                                           point['faults']))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/datasources/' + str(new_id)
