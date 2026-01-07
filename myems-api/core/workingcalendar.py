import falcon
from datetime import datetime, timedelta
import mysql.connector
import simplejson as json
import redis
from core.useractivity import admin_control, access_control, api_key_control
import config


def clear_working_calendar_cache(working_calendar_id=None):
    """
    Clear working calendar-related cache after data modification

    Args:
        working_calendar_id: Working calendar ID (optional, for specific calendar cache)
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

        # Clear working calendar list cache
        list_cache_key_pattern = 'workingcalendar:list:*'
        matching_keys = redis_client.keys(list_cache_key_pattern)
        if matching_keys:
            redis_client.delete(*matching_keys)

        # Clear specific working calendar item cache if working_calendar_id is provided
        if working_calendar_id:
            item_cache_key = f'workingcalendar:item:{working_calendar_id}'
            redis_client.delete(item_cache_key)
            non_working_days_cache_key = f'workingcalendar:nonworkingdays:{working_calendar_id}'
            redis_client.delete(non_working_days_cache_key)
            export_cache_key = f'workingcalendar:export:{working_calendar_id}'
            redis_client.delete(export_cache_key)
            # Clear all non-working day item cache (since we don't know specific IDs)
            non_working_day_item_pattern = 'nonworkingday:item:*'
            matching_keys = redis_client.keys(non_working_day_item_pattern)
            if matching_keys:
                redis_client.delete(*matching_keys)

    except Exception:
        # If cache clear fails, ignore and continue
        pass


class WorkingCalendarCollection:
    """
    Working Calendar Collection Resource

    This class handles CRUD operations for working calendar collection.
    It provides endpoints for listing all working calendars and creating new calendars.
    Working calendars define business days and holidays for the energy management system.
    """
    def __init__(self):
        """Initialize WorkingCalendarCollection"""
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

        # Redis cache key
        cache_key = 'workingcalendar:list:'
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

        cursor.execute(" SELECT id, name, description"
                       " FROM tbl_working_calendars ")

        rows_calendars = cursor.fetchall()

        result = list()
        if rows_calendars is not None and len(rows_calendars) > 0:
            for row in rows_calendars:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "description": row[2]}
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
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except json.JSONDecodeError as ex:
            print("Failed to parse JSON")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_JSON_FORMAT')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORKING_CALENDAR_NAME')
        name = str.strip(new_values['data']['name'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_working_calendars "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.WORKING_CALENDAR_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_working_calendars "
                      " (name, description) "
                      " VALUES (%s, %s) ")
        cursor.execute(add_values, (name,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        # Clear cache after creating new working calendar
        clear_working_calendar_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/workingcalendar/' + str(new_id)


class WorkingCalendarItem:
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
                                   description='API.INVALID_WORKING_CALENDAR_ID')

        # Redis cache key
        cache_key = f'workingcalendar:item:{id_}'
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

        cursor.execute(" SELECT id, name, description"
                       " FROM tbl_working_calendars "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WORKING_CALENDAR_NOT_FOUND')

        meta_result = {"id": row[0],
                       "name": row[1],
                       "description": row[2]}

        # Store result in Redis cache
        result_json = json.dumps(meta_result)
        if redis_client:
            try:
                redis_client.setex(cache_key, cache_expire, result_json)
            except Exception:
                # If cache set fails, ignore and continue
                pass

        resp.text = result_json

    @staticmethod
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORKING_CALENDAR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_working_calendars "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WORKING_CALENDAR_NOT_FOUND')

        # check relation with space
        cursor.execute(" SELECT id FROM tbl_spaces_working_calendars"
                       " WHERE working_calendar_id = %s ", (id_,))

        rows_non_working_days = cursor.fetchall()
        if rows_non_working_days is not None and len(rows_non_working_days) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # check relation with tenants
        cursor.execute(" SELECT tenant_id "
                       " FROM tbl_tenants_working_calendars "
                       " WHERE working_calendar_id = %s ", (id_,))
        rows_tenants = cursor.fetchall()
        if rows_tenants is not None and len(rows_tenants) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_TENANTS')

        # check relation with stores
        cursor.execute(" SELECT store_id "
                       " FROM tbl_stores_working_calendars "
                       " WHERE working_calendar_id = %s ", (id_,))
        rows_stores = cursor.fetchall()
        if rows_stores is not None and len(rows_stores) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_STORES')

        # check relation with shopfloors
        cursor.execute(" SELECT shopfloor_id "
                       " FROM tbl_shopfloors_working_calendars "
                       " WHERE working_calendar_id = %s ", (id_,))
        rows_shopfloors = cursor.fetchall()
        if rows_shopfloors is not None and len(rows_shopfloors) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SHOPFLOORS')

        cursor.execute(" DELETE FROM tbl_working_calendars_non_working_days "
                       " WHERE working_calendar_id = %s ", (id_,))
        cnx.commit()

        cursor.execute(" DELETE FROM tbl_working_calendars WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after deleting working calendar
        clear_working_calendar_cache(working_calendar_id=int(id_))

        resp.status = falcon.HTTP_204

    @staticmethod
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
                                   description='API.INVALID_WORKING_CALENDAR_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORKING_CALENDAR_NAME')
        name = str.strip(new_values['data']['name'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_working_calendars "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WORKING_CALENDAR_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_working_calendars "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.WORKING_CALENDAR_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_working_calendars "
                      " SET name = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name, description, id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after updating working calendar
        clear_working_calendar_cache(working_calendar_id=int(id_))

        resp.status = falcon.HTTP_200


class NonWorkingDayCollection:
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
                                   description='API.INVALID_NON_WORKING_DAY_ID')

        # Redis cache key
        cache_key = f'workingcalendar:nonworkingdays:{id_}'
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

        cursor.execute(" SELECT id, working_calendar_id, date_local, description"
                       " FROM tbl_working_calendars_non_working_days "
                       " WHERE working_calendar_id = %s "
                       " ORDER BY date_local DESC ", (id_,))
        rows_date_local = cursor.fetchall()

        meta_result = list()
        if rows_date_local is not None and len(rows_date_local) > 0:
            for row in rows_date_local:
                date_local_dict = {'id': row[0],
                                   'working_calendar_id': row[1],
                                   'date_local': row[2].isoformat()[0:10],
                                   'description': row[3]}
                meta_result.append(date_local_dict)

        cursor.close()
        cnx.close()

        # Store result in Redis cache
        result_json = json.dumps(meta_result)
        if redis_client:
            try:
                redis_client.setex(cache_key, cache_expire, result_json)
            except Exception:
                # If cache set fails, ignore and continue
                pass

        resp.text = result_json

    @staticmethod
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except json.JSONDecodeError as ex:
            print("Failed to parse JSON")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_JSON_FORMAT')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORKING_CALENDAR_ID')
        working_calendar_id = id_

        if 'date_local' not in new_values['data'].keys() or \
                new_values['data']['date_local'] is None or \
                len(str(new_values['data']['date_local'])) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATE_LOCAL')
        date_local = str.strip(new_values['data']['date_local'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_working_calendars_non_working_days "
                       " WHERE working_calendar_id = %s AND date_local = %s ",
                       (working_calendar_id, date_local))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.DATE_IS_ALREADY_IN_WORKING_CALENDAR')

        add_values = (" INSERT INTO tbl_working_calendars_non_working_days "
                      " (working_calendar_id, date_local, description) "
                      " VALUES (%s, %s, %s) ")
        cursor.execute(add_values, (working_calendar_id, date_local, description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        # Clear cache after creating new non-working day
        clear_working_calendar_cache(working_calendar_id=int(working_calendar_id))

        resp.status = falcon.HTTP_201
        resp.location = '/nonworkingday/' + str(new_id)


class NonWorkingDayItem:
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
                                   description='API.INVALID_NON_WORKING_DAY_ID')

        # Redis cache key
        cache_key = f'nonworkingday:item:{id_}'
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

        cursor.execute(" SELECT id, working_calendar_id, date_local, description"
                       " FROM tbl_working_calendars_non_working_days "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.NON_WORKING_DAY_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "working_calendar_id": row[1],
                           "date_local": row[2].isoformat()[0:10],
                           "description": row[3]}

        # Store result in Redis cache
        result_json = json.dumps(meta_result)
        if redis_client:
            try:
                redis_client.setex(cache_key, cache_expire, result_json)
            except Exception:
                # If cache set fails, ignore and continue
                pass

        resp.text = result_json

    @staticmethod
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NON_WORKING_DAY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id, working_calendar_id "
                       " FROM tbl_working_calendars_non_working_days "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.NON_WORKING_DAY_NOT_FOUND')

        working_calendar_id = row[1]

        cursor.execute(" DELETE FROM tbl_working_calendars_non_working_days WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after deleting non-working day
        clear_working_calendar_cache(working_calendar_id=working_calendar_id)

        resp.status = falcon.HTTP_204

    @staticmethod
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
                                   description='API.INVALID_NON_WORKING_DAY_ID')

        new_values = json.loads(raw_json)

        if 'date_local' in new_values['data'].keys() and \
                new_values['data']['date_local'] is not None and \
                len(str(new_values['data']['date_local'])) > 0:
            date_local = str.strip(new_values['data']['date_local'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT working_calendar_id, date_local "
                       " FROM tbl_working_calendars_non_working_days "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATE_LOCAL_NOT_FOUND')

        working_calendar_id = row[0]

        cursor.execute(" SELECT id "
                       " FROM tbl_working_calendars_non_working_days "
                       " WHERE id != %s AND date_local = %s ",
                       (id_, date_local))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.DATE_IS_ALREADY_IN_WORKING_CALENDAR')

        update_row = (" UPDATE tbl_working_calendars_non_working_days "
                      " SET date_local = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (date_local, description, id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after updating non-working day
        clear_working_calendar_cache(working_calendar_id=working_calendar_id)

        resp.status = falcon.HTTP_200


class WorkingCalendarExport:
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
                                   description='API.INVALID_WORKING_CALENDAR_ID')

        # Redis cache key
        cache_key = f'workingcalendar:export:{id_}'
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

        cursor.execute(" SELECT id, name, description"
                       " FROM tbl_working_calendars "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()

        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WORKING_CALENDAR_NOT_FOUND')

        meta_result = {"id": row[0],
                       "name": row[1],
                       "description": row[2],
                       "non_working_days": None}

        cursor.execute(" SELECT id, working_calendar_id, date_local, description"
                       " FROM tbl_working_calendars_non_working_days "
                       " WHERE working_calendar_id = %s ", (id_,))
        rows_date_local = cursor.fetchall()

        result = list()
        if rows_date_local is not None and len(rows_date_local) > 0:
            for row in rows_date_local:
                date_local_dict = {'id': row[0],
                                   'working_calendar_id': row[1],
                                   'date_local': row[2].isoformat()[0:10],
                                   'description': row[3]}
                result.append(date_local_dict)
        meta_result['non_working_days'] = result
        cursor.close()
        cnx.close()

        # Store result in Redis cache
        result_json = json.dumps(meta_result)
        if redis_client:
            try:
                redis_client.setex(cache_key, cache_expire, result_json)
            except Exception:
                # If cache set fails, ignore and continue
                pass

        resp.text = result_json


class WorkingCalendarImport:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except json.JSONDecodeError as ex:
            print("Failed to parse JSON")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_JSON_FORMAT')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORKING_CALENDAR_NAME')
        name = str.strip(new_values['name'])

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_working_calendars "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.WORKING_CALENDAR_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_working_calendars "
                      " (name, description) "
                      " VALUES (%s, %s) ")
        cursor.execute(add_values, (name,
                                    description))
        new_id = cursor.lastrowid
        working_calendar_id = new_id
        for values in new_values['non_working_days']:
            if 'date_local' not in values or \
                    values['date_local'] is None or \
                    len(str(values['date_local'])) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_DATE_LOCAL')
            date_local = str.strip(values['date_local'])

            if 'description' in values and \
                    values['description'] is not None and \
                    len(str(values['description'])) > 0:
                description = str.strip(values['description'])
            else:
                description = None

            cursor.execute(" SELECT id "
                           " FROM tbl_working_calendars_non_working_days "
                           " WHERE working_calendar_id = %s AND date_local = %s ",
                           (working_calendar_id, date_local))
            if cursor.fetchone() is not None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.DATE_IS_ALREADY_IN_WORKING_CALENDAR')

            add_values = (" INSERT INTO tbl_working_calendars_non_working_days "
                          " (working_calendar_id, date_local, description) "
                          " VALUES (%s, %s, %s) ")
            cursor.execute(add_values, (working_calendar_id, date_local, description))
        cnx.commit()
        cursor.close()
        cnx.close()

        # Clear cache after importing working calendar
        clear_working_calendar_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/workingcalendar/' + str(new_id)


class WorkingCalendarClone:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_post(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORKING_CALENDAR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id, name, description"
                       " FROM tbl_working_calendars "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WORKING_CALENDAR_NOT_FOUND')

        meta_result = {"id": row[0],
                       "name": row[1],
                       "description": row[2],
                       "non_working_days": None}
        cursor.execute(" SELECT id, working_calendar_id, date_local, description"
                       " FROM tbl_working_calendars_non_working_days "
                       " WHERE working_calendar_id = %s ", (id_,))
        rows_date_local = cursor.fetchall()

        result = list()
        if rows_date_local is not None and len(rows_date_local) > 0:
            for row in rows_date_local:
                date_local_dict = {'id': row[0],
                                   'working_calendar_id': row[1],
                                   'date_local': row[2].isoformat()[0:10],
                                   'description': row[3]}
                result.append(date_local_dict)
        meta_result['non_working_days'] = result
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        new_name = (str.strip(meta_result['name']) +
                    (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
        add_values = (" INSERT INTO tbl_working_calendars "
                      " (name, description) "
                      " VALUES (%s, %s) ")
        cursor.execute(add_values, (new_name,
                                    meta_result['description']))
        new_id = cursor.lastrowid
        for values in meta_result['non_working_days']:
            add_values = (" INSERT INTO tbl_working_calendars_non_working_days "
                          " (working_calendar_id, date_local, description) "
                          " VALUES (%s, %s, %s) ")
            cursor.execute(add_values, (new_id, values['date_local'], values['description']))
        cnx.commit()
        cursor.close()
        cnx.close()

        # Clear cache after cloning working calendar
        clear_working_calendar_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/workingcalendar/' + str(new_id)

