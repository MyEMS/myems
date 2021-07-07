import falcon
import simplejson as json
import mysql.connector
import config
import uuid
from datetime import datetime, timezone


class GatewayCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, uuid, token, last_seen_datetime_utc "
                 " FROM tbl_gateways "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row['id'], "name": row['name'], "uuid": row['uuid'],
                               "token": row['token'],
                               "last_seen_datetime":
                                   row['last_seen_datetime_utc'].replace(tzinfo=timezone.utc).timestamp() * 1000
                               if isinstance(row['last_seen_datetime_utc'], datetime) else None,
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
                                   description='API.INVALID_GATEWAY_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
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
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/gateways/' + str(new_id)


class GatewayItem:
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
                                   description='API.INVALID_GATEWAY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, uuid, token, last_seen_datetime_utc "
                 " FROM tbl_gateways "
                 " WHERE id =%s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()
        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GATEWAY_NOT_FOUND')

        result = {"id": row['id'],
                  "name": row['name'],
                  "uuid": row['uuid'],
                  "token": row['token'],
                  "last_seen_datetime":
                      row['last_seen_datetime_utc'].replace(tzinfo=timezone.utc).timestamp()*1000
                  if isinstance(row['last_seen_datetime_utc'], datetime) else None}

        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
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
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GATEWAY_NOT_FOUND')

        # check if this gateway is being used by any data sources
        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE gateway_id = %s ",
                       " LIMIT 1 ",
                       (id_,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_DATA_SOURCES')

        cursor.execute(" DELETE FROM tbl_gateways WHERE id = %s ", (id_,))
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
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GATEWAY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.GATEWAY_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_gateways "
                      " SET name = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200


class GatewayDataSourceCollection:
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
                                   description='API.INVALID_GATEWAY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        cursor.execute(" SELECT name "
                       " FROM tbl_gateways "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GATEWAY_NOT_FOUND')

        result = list()
        query_data_source = (" SELECT id, name, uuid, "
                             "         protocol, connection, last_seen_datetime_utc "
                             " FROM tbl_data_sources "
                             " WHERE gateway_id = %s "
                             " ORDER BY name ")
        cursor.execute(query_data_source, (id_,))
        rows_data_source = cursor.fetchall()
        now = datetime.utcnow().replace(second=0, microsecond=0, tzinfo=None)
        if rows_data_source is not None and len(rows_data_source) > 0:
            for row in rows_data_source:
                meta_result = {"id": row['id'],
                               "name": row['name'],
                               "uuid": row['uuid'],
                               "protocol": row['protocol'],
                               "connection": row['connection'],
                               "last_seen_datetime":
                                   row['last_seen_datetime_utc'].replace(tzinfo=timezone.utc).timestamp()*1000
                                   if isinstance(row['last_seen_datetime_utc'], datetime) else None,
                               }
                result.append(meta_result)

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)

