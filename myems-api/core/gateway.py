import falcon
import simplejson as json
import mysql.connector
import config
import uuid
from datetime import datetime


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
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, token, last_seen_datetime_utc "
                 " FROM tbl_gateways "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.disconnect()

        result = list()
        now = datetime.utcnow().replace(second=0, microsecond=0, tzinfo=None)
        if rows is not None and len(rows) > 0:
            for row in rows:
                last_seen_time = row[4]
                if last_seen_time is not None and (now - last_seen_time).total_seconds() > 5 * 60:
                    status = "online"
                else:
                    status = "offline"
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "token": row[3],
                               "last_seen_datetime": row[4].timestamp() * 1000 if isinstance(row[4],
                                                                                             datetime) else None,
                               "status": status}
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
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
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
        cursor = cnx.cursor()

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

        now = datetime.utcnow().replace(second=0, microsecond=0, tzinfo=None)
        last_seen_time = row[4]
        if last_seen_time is not None and (now - last_seen_time).total_seconds() > 5 * 60:
            status = "online"
        else:
            status = "offline"

        result = {"id": row[0], "name": row[1], "uuid": row[2],
                  "token": row[3],
                  "last_seen_datetime": row[4].timestamp()*1000 if isinstance(row[4], datetime) else None,
                  "status": status}

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
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
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
        cursor = cnx.cursor()

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
                last_seen_time = row[5]
                if last_seen_time is not None and (now - last_seen_time).total_seconds() > 5 * 60:
                    status = "online"
                else:
                    status = "offline"
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "protocol": row[3],
                               "connection": row[4],
                               "last_seen_datetime": row[5].timestamp()*1000 if isinstance(row[5], datetime) else None,
                               "status": status}
                result.append(meta_result)

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)

