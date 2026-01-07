import uuid
from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
import redis
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


def clear_tariff_cache(tariff_id=None):
    """
    Clear tariff-related cache after data modification

    Args:
        tariff_id: Tariff ID (optional, for specific tariff cache)
    """
    # Check if Redis is enabled
    if not config.redis.get('is_enabled', False):
        return

    redis_client = None
    try:
        redis_client = redis.Redis(
            host=config.redis['host'],
            port=config.redis['port'],
            password=config.redis['password'] if config.redis['password'] else None,
            db=config.redis['db'],
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2
        )
        redis_client.ping()

        # Clear tariff list cache (all search query variations)
        list_cache_key_pattern = 'tariff:list:*'
        matching_keys = redis_client.keys(list_cache_key_pattern)
        if matching_keys:
            redis_client.delete(*matching_keys)

        # Clear specific tariff item cache if tariff_id is provided
        if tariff_id:
            item_cache_key = f'tariff:item:{tariff_id}'
            redis_client.delete(item_cache_key)
            export_cache_key = f'tariff:export:{tariff_id}'
            redis_client.delete(export_cache_key)

    except Exception:
        # If cache clear fails, ignore and continue
        pass


class TariffCollection:
    """
    Tariff Collection Resource

    This class handles CRUD operations for tariff collection.
    It provides endpoints for listing all tariffs and creating new tariffs.
    Tariffs define pricing structures for energy consumption in the energy management system.
    """
    def __init__(self):
        """Initialize TariffCollection"""
        pass


    @staticmethod
    def on_options(req, resp):
        """Handle OPTIONS requests for CORS preflight"""
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

        # Redis cache key
        cache_key = f'tariff:list:{search_query}'
        cache_expire = 28800  # 8 hours in seconds (long-term cache)

        # Try to get from Redis cache (only if Redis is enabled)
        redis_client = None
        if config.redis.get('is_enabled', False):
            try:
                redis_client = redis.Redis(
                    host=config.redis['host'],
                    port=config.redis['port'],
                    password=config.redis['password'] if config.redis['password'] else None,
                    db=config.redis['db'],
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2
                )
                redis_client.ping()
                cached_result = redis_client.get(cache_key)
                if cached_result:
                    resp.text = cached_result
                    return
            except Exception:
                # If Redis connection fails, continue to database query
                pass

        # Cache miss or Redis error - query database
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT t.id, t.name, t.uuid, "
                 "        ec.id AS energy_category_id, ec.name AS energy_category_name, "
                 "        t.tariff_type, t.unit_of_price, "
                 "        t.valid_from_datetime_utc, t.valid_through_datetime_utc "
                 " FROM tbl_tariffs t, tbl_energy_categories ec "
                 " WHERE t.energy_category_id = ec.id ")
        params = []
        if search_query:
            query += " AND t.name LIKE %s "
            params = [f'%{search_query}%']
        query += " ORDER BY id "
        cursor.execute(query, params)

        rows = cursor.fetchall()

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "energy_category": {"id": row[3],
                                                   "name": row[4]},
                               "tariff_type": row[5],
                               "unit_of_price": row[6],
                               "valid_from": (row[7].replace(tzinfo=timezone.utc)
                                              + timedelta(minutes=timezone_offset)).isoformat()[0:19],
                               "valid_through": (row[8].replace(tzinfo=timezone.utc)
                                                 + timedelta(minutes=timezone_offset)).isoformat()[0:19]}

                if meta_result['tariff_type'] == 'timeofuse':
                    meta_result['timeofuse'] = list()
                    query = (" SELECT start_time_of_day, end_time_of_day, peak_type, price "
                             " FROM tbl_tariffs_timeofuses "
                             " WHERE tariff_id = %s  "
                             " ORDER BY id")
                    cursor.execute(query, (meta_result['id'],))
                    rows_timeofuses = cursor.fetchall()
                    if rows_timeofuses is not None and len(rows_timeofuses) > 0:
                        for row_timeofuse in rows_timeofuses:
                            meta_data = {"start_time_of_day": str(row_timeofuse[0]),
                                         "end_time_of_day": str(row_timeofuse[1]),
                                         "peak_type": row_timeofuse[2],
                                         "price": row_timeofuse[3]}
                            meta_result['timeofuse'].append(meta_data)
                else:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400,
                                           title='API.ERROR',
                                           description='API.INVALID_TARIFF_TYPE')

                result.append(meta_result)

        cursor.close()
        cnx.close()

        # Store result in Redis cache
        result_json = json.dumps(result)
        if redis_client:
            try:
                redis_client.setex(cache_key, cache_expire, result_json)
            except Exception:
                # If cache set fails, ignore and continue
                pass

        resp.text = result_json

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category' not in new_values['data'].keys() or \
                'id' not in new_values['data']['energy_category'].keys() or \
                not isinstance(new_values['data']['energy_category']['id'], int) or \
                new_values['data']['energy_category']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category']['id']

        if 'tariff_type' not in new_values['data'].keys() \
           or str.strip(new_values['data']['tariff_type']) not in ('timeofuse',):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_TYPE')
        tariff_type = str.strip(new_values['data']['tariff_type'])

        if new_values['data']['tariff_type'] == 'timeofuse':
            if new_values['data']['timeofuse'] is None:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_TARIFF_TIME_OF_USE_PRICING')

        if 'unit_of_price' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['unit_of_price'], str) or \
                len(str.strip(new_values['data']['unit_of_price'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNIT_OF_PRICE')
        unit_of_price = str.strip(new_values['data']['unit_of_price'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tariffs "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARIFF_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ", (energy_category_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

        # todo: validate datetime values
        valid_from = datetime.strptime(new_values['data']['valid_from'], '%Y-%m-%dT%H:%M:%S')
        valid_from = valid_from.replace(tzinfo=timezone.utc)
        valid_from -= timedelta(minutes=timezone_offset)
        valid_through = datetime.strptime(new_values['data']['valid_through'], '%Y-%m-%dT%H:%M:%S')
        valid_through = valid_through.replace(tzinfo=timezone.utc)
        valid_through -= timedelta(minutes=timezone_offset)

        add_row = (" INSERT INTO tbl_tariffs "
                   "             (name, uuid, energy_category_id, tariff_type, unit_of_price, "
                   "              valid_from_datetime_utc, valid_through_datetime_utc ) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 energy_category_id,
                                 tariff_type,
                                 unit_of_price,
                                 valid_from,
                                 valid_through))
        new_id = cursor.lastrowid
        cnx.commit()
        # insert time of use prices
        if tariff_type == 'timeofuse':
            for timeofuse in new_values['data']['timeofuse']:
                add_timeofuse = (" INSERT INTO tbl_tariffs_timeofuses "
                                 "             (tariff_id, start_time_of_day, end_time_of_day, peak_type, price) "
                                 " VALUES (%s, %s, %s, %s, %s) ")
                cursor.execute(add_timeofuse, (new_id,
                                               timeofuse['start_time_of_day'],
                                               timeofuse['end_time_of_day'],
                                               timeofuse['peak_type'],
                                               timeofuse['price']))
                cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after creating new tariff
        clear_tariff_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/tariffs/' + str(new_id)


class TariffItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_ID')

        # Redis cache key
        cache_key = f'tariff:item:{id_}'
        cache_expire = 28800  # 8 hours in seconds (long-term cache)

        # Try to get from Redis cache (only if Redis is enabled)
        redis_client = None
        if config.redis.get('is_enabled', False):
            try:
                redis_client = redis.Redis(
                    host=config.redis['host'],
                    port=config.redis['port'],
                    password=config.redis['password'] if config.redis['password'] else None,
                    db=config.redis['db'],
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2
                )
                redis_client.ping()
                cached_result = redis_client.get(cache_key)
                if cached_result:
                    resp.text = cached_result
                    return
            except Exception:
                # If Redis connection fails, continue to database query
                pass

        # Cache miss or Redis error - query database
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT t.id, t.name, t.uuid, "
                 "        ec.id AS energy_category_id, ec.name AS energy_category_name, "
                 "        t.tariff_type, "
                 "        t.unit_of_price, "
                 "        t.valid_from_datetime_utc, t.valid_through_datetime_utc "
                 " FROM tbl_tariffs t, tbl_energy_categories ec "
                 " WHERE t.energy_category_id = ec.id AND t.id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TARIFF_NOT_FOUND')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "energy_category": {"id": row[3],
                                      "name": row[4]},
                  "tariff_type": row[5],
                  "unit_of_price": row[6],
                  "valid_from": (row[7].replace(tzinfo=timezone.utc)
                                 + timedelta(minutes=timezone_offset)).isoformat()[0:19],
                  "valid_through": (row[8].replace(tzinfo=timezone.utc)
                                    + timedelta(minutes=timezone_offset)).isoformat()[0:19]}

        if result['tariff_type'] == 'timeofuse':
            result['timeofuse'] = list()
            query = (" SELECT start_time_of_day, end_time_of_day, peak_type, price "
                     " FROM tbl_tariffs_timeofuses"
                     " WHERE tariff_id = %s ")
            cursor.execute(query, (result['id'],))
            rows_timeofuses = cursor.fetchall()
            if rows_timeofuses is not None and len(rows_timeofuses) > 0:
                for row_timeofuse in rows_timeofuses:
                    meta_data = {"start_time_of_day": str(row_timeofuse[0]),
                                 "end_time_of_day": str(row_timeofuse[1]),
                                 "peak_type": row_timeofuse[2],
                                 "price": row_timeofuse[3]}
                    result['timeofuse'].append(meta_data)

        cursor.close()
        cnx.close()

        # Store result in Redis cache
        result_json = json.dumps(result)
        if redis_client:
            try:
                redis_client.setex(cache_key, cache_expire, result_json)
            except Exception:
                # If cache set fails, ignore and continue
                pass

        resp.text = result_json

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tariffs "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TARIFF_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_cost_centers_tariffs "
                       " WHERE tariff_id = %s ", (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARIFF_IN_USE')

        cursor.execute(" DELETE FROM tbl_tariffs_timeofuses WHERE tariff_id = %s ", (id_,))
        cnx.commit()

        cursor.execute(" DELETE FROM tbl_tariffs WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after deleting tariff
        clear_tariff_cache(tariff_id=int(id_))

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category' not in new_values['data'].keys() or \
                'id' not in new_values['data']['energy_category'].keys() or \
                not isinstance(new_values['data']['energy_category']['id'], int) or \
                new_values['data']['energy_category']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category']['id']

        if 'tariff_type' not in new_values['data'].keys() \
           or str.strip(new_values['data']['tariff_type']) not in ('timeofuse',):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_TYPE')
        tariff_type = str.strip(new_values['data']['tariff_type'])

        if new_values['data']['tariff_type'] == 'timeofuse':
            if new_values['data']['timeofuse'] is None:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_TARIFF_TIME_OF_USE_PRICING')

        if 'unit_of_price' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['unit_of_price'], str) or \
                len(str.strip(new_values['data']['unit_of_price'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNIT_OF_PRICE')
        unit_of_price = str.strip(new_values['data']['unit_of_price'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # check if the tariff exist
        query = (" SELECT name "
                 " FROM tbl_tariffs "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        cursor.fetchone()

        if cursor.rowcount != 1:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TARIFF_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_tariffs "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARIFF_NAME_IS_ALREADY_IN_USE')

        valid_from = datetime.strptime(new_values['data']['valid_from'], '%Y-%m-%dT%H:%M:%S')
        valid_from = valid_from.replace(tzinfo=timezone.utc)
        valid_from -= timedelta(minutes=timezone_offset)
        valid_through = datetime.strptime(new_values['data']['valid_through'], '%Y-%m-%dT%H:%M:%S')
        valid_through = valid_through.replace(tzinfo=timezone.utc)
        valid_through -= timedelta(minutes=timezone_offset)

        # update tariff itself
        update_row = (" UPDATE tbl_tariffs "
                      " SET name = %s, energy_category_id = %s, tariff_type = %s, unit_of_price = %s, "
                      "     valid_from_datetime_utc = %s , valid_through_datetime_utc = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    energy_category_id,
                                    tariff_type,
                                    unit_of_price,
                                    valid_from,
                                    valid_through,
                                    id_,))
        cnx.commit()

        # update prices of the tariff
        if tariff_type == 'timeofuse':
            if 'timeofuse' not in new_values['data'].keys() or new_values['data']['timeofuse'] is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_TARIFF_TIME_OF_USE_PRICING')
            else:
                # remove all (possible) exist prices
                cursor.execute(" DELETE FROM tbl_tariffs_timeofuses "
                               " WHERE tariff_id = %s ",
                               (id_,))
                cnx.commit()

                for timeofuse in new_values['data']['timeofuse']:
                    add_timeofuse = (" INSERT INTO tbl_tariffs_timeofuses "
                                     "             (tariff_id, start_time_of_day, end_time_of_day, peak_type, price) "
                                     " VALUES (%s, %s, %s, %s, %s) ")
                    cursor.execute(add_timeofuse, (id_,
                                                   timeofuse['start_time_of_day'],
                                                   timeofuse['end_time_of_day'],
                                                   timeofuse['peak_type'],
                                                   timeofuse['price']))
                    cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after updating tariff
        clear_tariff_cache(tariff_id=int(id_))

        resp.status = falcon.HTTP_200


class TariffExport:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_ID')

        # Redis cache key
        cache_key = f'tariff:export:{id_}'
        cache_expire = 28800  # 8 hours in seconds (long-term cache)

        # Try to get from Redis cache (only if Redis is enabled)
        redis_client = None
        if config.redis.get('is_enabled', False):
            try:
                redis_client = redis.Redis(
                    host=config.redis['host'],
                    port=config.redis['port'],
                    password=config.redis['password'] if config.redis['password'] else None,
                    db=config.redis['db'],
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2
                )
                redis_client.ping()
                cached_result = redis_client.get(cache_key)
                if cached_result:
                    resp.text = cached_result
                    return
            except Exception:
                # If Redis connection fails, continue to database query
                pass

        # Cache miss or Redis error - query database
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT t.id, t.name, t.uuid, "
                 "        ec.id AS energy_category_id, ec.name AS energy_category_name, "
                 "        t.tariff_type, "
                 "        t.unit_of_price, "
                 "        t.valid_from_datetime_utc, t.valid_through_datetime_utc "
                 " FROM tbl_tariffs t, tbl_energy_categories ec "
                 " WHERE t.energy_category_id = ec.id AND t.id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TARIFF_NOT_FOUND')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "energy_category": {"id": row[3],
                                      "name": row[4]},
                  "tariff_type": row[5],
                  "unit_of_price": row[6],
                  "valid_from": (row[7].replace(tzinfo=timezone.utc)
                                 + timedelta(minutes=timezone_offset)).isoformat()[0:19],
                  "valid_through": (row[8].replace(tzinfo=timezone.utc)
                                    + timedelta(minutes=timezone_offset)).isoformat()[0:19]}

        if result['tariff_type'] == 'timeofuse':
            result['timeofuse'] = list()
            query = (" SELECT start_time_of_day, end_time_of_day, peak_type, price "
                     " FROM tbl_tariffs_timeofuses"
                     " WHERE tariff_id = %s ")
            cursor.execute(query, (result['id'],))
            rows_timeofuses = cursor.fetchall()
            if rows_timeofuses is not None and len(rows_timeofuses) > 0:
                for row_timeofuse in rows_timeofuses:
                    meta_data = {"start_time_of_day": str(row_timeofuse[0]),
                                 "end_time_of_day": str(row_timeofuse[1]),
                                 "peak_type": row_timeofuse[2],
                                 "price": row_timeofuse[3]}
                    result['timeofuse'].append(meta_data)

        cursor.close()
        cnx.close()

        # Store result in Redis cache
        result_json = json.dumps(result)
        if redis_client:
            try:
                redis_client.setex(cache_key, cache_expire, result_json)
            except Exception:
                # If cache set fails, ignore and continue
                pass

        resp.text = result_json


class TariffImport:
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
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        new_values = json.loads(raw_json)

        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_NAME')
        name = str.strip(new_values['name'])

        if 'energy_category' not in new_values.keys() or \
                'id' not in new_values['energy_category'].keys() or \
                not isinstance(new_values['energy_category']['id'], int) or \
                new_values['energy_category']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['energy_category']['id']

        if 'tariff_type' not in new_values.keys() \
                or str.strip(new_values['tariff_type']) not in ('timeofuse',):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_TYPE')
        tariff_type = str.strip(new_values['tariff_type'])

        if new_values['tariff_type'] == 'timeofuse':
            if new_values['timeofuse'] is None:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_TARIFF_TIME_OF_USE_PRICING')

        if 'unit_of_price' not in new_values.keys() or \
                not isinstance(new_values['unit_of_price'], str) or \
                len(str.strip(new_values['unit_of_price'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNIT_OF_PRICE')
        unit_of_price = str.strip(new_values['unit_of_price'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tariffs "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARIFF_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ", (energy_category_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

        # todo: validate datetime values
        valid_from = datetime.strptime(new_values['valid_from'], '%Y-%m-%dT%H:%M:%S')
        valid_from = valid_from.replace(tzinfo=timezone.utc)
        valid_from -= timedelta(minutes=timezone_offset)
        valid_through = datetime.strptime(new_values['valid_through'], '%Y-%m-%dT%H:%M:%S')
        valid_through = valid_through.replace(tzinfo=timezone.utc)
        valid_through -= timedelta(minutes=timezone_offset)

        add_row = (" INSERT INTO tbl_tariffs "
                   "             (name, uuid, energy_category_id, tariff_type, unit_of_price, "
                   "              valid_from_datetime_utc, valid_through_datetime_utc ) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 energy_category_id,
                                 tariff_type,
                                 unit_of_price,
                                 valid_from,
                                 valid_through))
        new_id = cursor.lastrowid
        cnx.commit()
        # insert time of use prices
        if tariff_type == 'timeofuse':
            for timeofuse in new_values['timeofuse']:
                add_timeofuse = (" INSERT INTO tbl_tariffs_timeofuses "
                                 "             (tariff_id, start_time_of_day, end_time_of_day, peak_type, price) "
                                 " VALUES (%s, %s, %s, %s, %s) ")
                cursor.execute(add_timeofuse, (new_id,
                                               timeofuse['start_time_of_day'],
                                               timeofuse['end_time_of_day'],
                                               timeofuse['peak_type'],
                                               timeofuse['price']))
                cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after importing tariff
        clear_tariff_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/tariffs/' + str(new_id)


class TariffClone:
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
                                   description='API.INVALID_TARIFF_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT t.id, t.name, t.uuid, "
                 "        ec.id AS energy_category_id, ec.name AS energy_category_name, "
                 "        t.tariff_type, "
                 "        t.unit_of_price, "
                 "        t.valid_from_datetime_utc, t.valid_through_datetime_utc "
                 " FROM tbl_tariffs t, tbl_energy_categories ec "
                 " WHERE t.energy_category_id = ec.id AND t.id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TARIFF_NOT_FOUND')

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "energy_category": {"id": row[3],
                                      "name": row[4]},
                  "tariff_type": row[5],
                  "unit_of_price": row[6],
                  "valid_from": row[7].isoformat()[0:19],
                  "valid_through": row[8].isoformat()[0:19]}

        if result['tariff_type'] == 'timeofuse':
            result['timeofuse'] = list()
            query = (" SELECT start_time_of_day, end_time_of_day, peak_type, price "
                     " FROM tbl_tariffs_timeofuses"
                     " WHERE tariff_id = %s ")
            cursor.execute(query, (result['id'],))
            rows_timeofuses = cursor.fetchall()
            if rows_timeofuses is not None and len(rows_timeofuses) > 0:
                for row_timeofuse in rows_timeofuses:
                    meta_data = {"start_time_of_day": str(row_timeofuse[0]),
                                 "end_time_of_day": str(row_timeofuse[1]),
                                 "peak_type": row_timeofuse[2],
                                 "price": row_timeofuse[3]}
                    result['timeofuse'].append(meta_data)
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        new_name = (str.strip(result['name']) +
                    (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
        add_row = (" INSERT INTO tbl_tariffs "
                   "             (name, uuid, energy_category_id, tariff_type, unit_of_price, "
                   "              valid_from_datetime_utc, valid_through_datetime_utc ) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_row, (new_name,
                                 str(uuid.uuid4()),
                                 result['energy_category']['id'],
                                 result['tariff_type'],
                                 result['unit_of_price'],
                                 result['valid_from'],
                                 result['valid_through']))
        new_id = cursor.lastrowid
        cnx.commit()
        # insert time of use prices
        if result['tariff_type'] == 'timeofuse':
            for timeofuse in result['timeofuse']:
                add_timeofuse = (" INSERT INTO tbl_tariffs_timeofuses "
                                 "             (tariff_id, start_time_of_day, end_time_of_day, peak_type, price) "
                                 " VALUES (%s, %s, %s, %s, %s) ")
                cursor.execute(add_timeofuse, (new_id,
                                               timeofuse['start_time_of_day'],
                                               timeofuse['end_time_of_day'],
                                               timeofuse['peak_type'],
                                               timeofuse['price']))
                cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after cloning tariff
        clear_tariff_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/tariffs/' + str(new_id)
