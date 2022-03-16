import falcon
import simplejson as json
import mysql.connector
import config
import uuid
from datetime import datetime, timezone, timedelta
from core.useractivity import user_logger, access_control


class GatewayCollection:
    @staticmethod
    def __init__():
        """"Initializes GatewayCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        access_control(req)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, uuid, token, last_seen_datetime_utc "
                 " FROM tbl_gateways "
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
                if isinstance(row['last_seen_datetime_utc'], datetime):
                    last_seen_datetime_local = row['last_seen_datetime_utc'].replace(tzinfo=timezone.utc) + \
                                               timedelta(minutes=timezone_offset)
                    last_seen_datetime = last_seen_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                else:
                    last_seen_datetime = None
                meta_result = {"id": row['id'], "name": row['name'], "uuid": row['uuid'],
                               "token": row['token'],
                               "last_seen_datetime": last_seen_datetime
                               }
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
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.GATEWAY_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_gateways (name, uuid, token) "
                      " VALUES (%s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    str(uuid.uuid4())))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/gateways/' + str(new_id)


class GatewayItem:
    @staticmethod
    def __init__():
        """"Initializes GatewayItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, uuid, token, last_seen_datetime_utc "
                 " FROM tbl_gateways "
                 " WHERE id =%s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()
        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GATEWAY_NOT_FOUND')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if isinstance(row['last_seen_datetime_utc'], datetime):
            last_seen_datetime_local = row['last_seen_datetime_utc'].replace(tzinfo=timezone.utc) + \
                                       timedelta(minutes=timezone_offset)
            last_seen_datetime = last_seen_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            last_seen_datetime = None

        result = {"id": row['id'],
                  "name": row['name'],
                  "uuid": row['uuid'],
                  "token": row['token'],
                  "last_seen_datetime": last_seen_datetime}

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GATEWAY_NOT_FOUND')

        # check if this gateway is being used by any data sources
        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE gateway_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_DATA_SOURCES')

        cursor.execute(" DELETE FROM tbl_gateways WHERE id = %s ", (id_,))
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
            raise falcon.HTTPError(falcon.HTTP_400, 'API.ERROR', ex)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GATEWAY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.GATEWAY_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_gateways "
                      " SET name = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class GatewayDataSourceCollection:
    @staticmethod
    def __init__():
        """"Initializes GatewayDataSourceCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GATEWAY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GATEWAY_NOT_FOUND')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result = list()
        query_data_source = (" SELECT id, name, uuid, "
                             "         protocol, connection, last_seen_datetime_utc "
                             " FROM tbl_data_sources "
                             " WHERE gateway_id = %s "
                             " ORDER BY name ")
        cursor.execute(query_data_source, (id_,))
        rows_data_source = cursor.fetchall()
        if rows_data_source is not None and len(rows_data_source) > 0:
            for row in rows_data_source:
                if isinstance(row['last_seen_datetime_utc'], datetime):
                    last_seen_datetime_local = row['last_seen_datetime_utc'].replace(tzinfo=timezone.utc) + \
                                               timedelta(minutes=timezone_offset)
                    last_seen_datetime = last_seen_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                else:
                    last_seen_datetime = None
                meta_result = {"id": row['id'],
                               "name": row['name'],
                               "uuid": row['uuid'],
                               "protocol": row['protocol'],
                               "connection": row['connection'],
                               "last_seen_datetime": last_seen_datetime,
                               }
                result.append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)

