import falcon
import mysql.connector
import simplejson as json
import redis
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


def clear_timezone_cache(timezone_id=None):
    """
    Clear timezone-related cache after data modification

    Args:
        timezone_id: Timezone ID (optional, for specific timezone cache)
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

        # Clear timezone list cache
        list_cache_key = 'timezone:list'
        redis_client.delete(list_cache_key)

        # Clear specific timezone item cache if timezone_id is provided
        if timezone_id:
            item_cache_key = f'timezone:item:{timezone_id}'
            redis_client.delete(item_cache_key)

    except Exception:
        # If cache clear fails, ignore and continue
        pass


class TimezoneCollection:
    """
    Timezone Collection Resource

    This class handles timezone operations for the MyEMS system.
    It provides functionality to retrieve all available timezones
    with their names, descriptions, and UTC offsets.
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """
        Handle GET requests to retrieve all timezones

        Returns a list of all available timezones with their metadata including:
        - Timezone ID
        - Timezone name
        - Description
        - UTC offset

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        # Check authentication method (API key or session)
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        # Redis cache key
        cache_key = 'timezone:list'
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

        # Query to retrieve all timezones
        query = (" SELECT id, name, description, utc_offset "
                 " FROM tbl_timezones ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

        # Build result list
        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "description": row[2],
                               "utc_offset": row[3]}
                result.append(meta_result)

        # Store result in Redis cache
        result_json = json.dumps(result)
        if redis_client:
            try:
                redis_client.setex(cache_key, cache_expire, result_json)
            except Exception:
                # If cache set fails, ignore and continue
                pass

        resp.text = result_json


class TimezoneItem:
    """
    Timezone Item Resource

    This class handles individual timezone operations including:
    - Retrieving a specific timezone by ID
    - Updating timezone information
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Timezone ID parameter
        """
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """
        Handle GET requests to retrieve a specific timezone by ID

        Retrieves a single timezone with its metadata including:
        - Timezone ID
        - Timezone name
        - Description
        - UTC offset

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Timezone ID to retrieve
        """
        # Check authentication method (API key or session)
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TIMEZONE_ID')

        # Redis cache key
        cache_key = f'timezone:item:{id_}'
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

        # Query to retrieve specific timezone by ID
        query = (" SELECT id, name, description, utc_offset "
                 " FROM tbl_timezones "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TIMEZONE_NOT_FOUND')

        # Build result object
        result = {"id": row[0],
                  "name": row[1],
                  "description": row[2],
                  "utc_offset": row[3]}

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
    def on_put(req, resp, id_):
        """
        Handle PUT requests to update timezone information

        Updates a specific timezone with new name, description, and UTC offset.
        Requires admin privileges.

        Args:
            req: Falcon request object containing update data
            resp: Falcon response object
            id_: Timezone ID to update
        """
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
                                   description='API.INVALID_TIMEZONE_ID')

        new_values = json.loads(raw_json)

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Check if timezone exists
        cursor.execute(" SELECT name "
                       " FROM tbl_timezones "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TIMEZONE_NOT_FOUND')

        # Update timezone information
        update_row = (" UPDATE tbl_timezones "
                      " SET name = %s, description = %s, utc_offset = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (new_values['data']['name'],
                                    new_values['data']['description'],
                                    new_values['data']['utc_offset'],
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after updating timezone
        clear_timezone_cache(timezone_id=id_)

        resp.status = falcon.HTTP_200
