import uuid
import falcon
import mysql.connector
import simplejson as json
import redis
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


def clear_tenanttype_cache(tenanttype_id=None):
    """
    Clear tenanttype-related cache after data modification

    Args:
        tenanttype_id: Tenant Type ID (optional, for specific tenanttype cache)
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

        # Clear tenanttype list cache
        list_cache_key = 'tenanttype:list'
        redis_client.delete(list_cache_key)

        # Clear specific tenanttype item cache if tenanttype_id is provided
        if tenanttype_id:
            item_cache_key = f'tenanttype:item:{tenanttype_id}'
            redis_client.delete(item_cache_key)

    except Exception:
        # If cache clear fails, ignore and continue
        pass


class TenantTypeCollection:
    """
    Tenant Type Collection Resource

    This class handles CRUD operations for tenant type collection.
    It provides endpoints for listing all tenant types and creating new tenant types.
    Tenant types define categories of tenants in the energy management system.
    """
    def __init__(self):
        """Initialize TenantTypeCollection"""
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
        cache_key = 'tenanttype:list'
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

        query = (" SELECT id, name, uuid, description, simplified_code "
                 " FROM tbl_tenant_types "
                 " ORDER BY id ")
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
                               "description": row[3],
                               "simplified_code": row[4]}
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
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_TYPE_NAME')

        name = str.strip(new_values['data']['name'])

        if 'description' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['description'], str) or \
                len(str.strip(new_values['data']['description'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_TYPE_DESCRIPTION')

        description = str.strip(new_values['data']['description'])

        if 'simplified_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['simplified_code'], str) or \
                len(str.strip(new_values['data']['simplified_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_TYPE_SIMPLIFIED_CODE')

        simplified_code = str.strip(new_values['data']['simplified_code'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenant_types "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.TENANT_TYPE_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT simplified_code "
                       " FROM tbl_tenant_types "
                       " WHERE simplified_code = %s ", (simplified_code,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.TENANT_TYPE_SIMPLIFIED_CODE_IS_ALREADY_IN_USE')

        add_value = (" INSERT INTO tbl_tenant_types "
                     " (name, uuid, description, simplified_code) "
                     " VALUES (%s, %s, %s, %s) ")
        cursor.execute(add_value, (name,
                                   str(uuid.uuid4()),
                                   description,
                                   simplified_code))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        # Clear cache after creating new tenant type
        clear_tenanttype_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/tenanttypes/' + str(new_id)



class TenantTypeItem:
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
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_TYPE_ID')

        # Redis cache key
        cache_key = f'tenanttype:item:{id_}'
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

        query = (" SELECT id, name, uuid, description, simplified_code "
                 " FROM tbl_tenant_types "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.TENANT_TYPE_NOT_FOUND')
        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "description": row[3],
                  "simplified_code": row[4]}

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
                                   description='API.INVALID_TENANT_TYPE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenant_types "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.TENANT_TYPE_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_tenants "
                       " WHERE tenant_type_id = %s ", (id_,))
        rows_tenants = cursor.fetchall()
        if rows_tenants is not None and len(rows_tenants) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.TENANT_TYPE_USED_IN_TENANT')

        cursor.execute(" DELETE FROM tbl_tenant_types WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after deleting tenant type
        clear_tenanttype_cache(tenanttype_id=int(id_))

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
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_TYPE_ID')

        new_values = json.loads(raw_json)
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_TYPE_NAME')

        name = str.strip(new_values['data']['name'])

        if 'description' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['description'], str) or \
                len(str.strip(new_values['data']['description'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_TYPE_DESCRIPTION')

        description = str.strip(new_values['data']['description'])

        if 'simplified_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['simplified_code'], str) or \
                len(str.strip(new_values['data']['simplified_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_TYPE_SIMPLIFIED_CODE')

        simplified_code = str.strip(new_values['data']['simplified_code'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenant_types "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.TENANT_TYPE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_tenant_types "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.TENANT_TYPE_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT simplified_code "
                       " FROM tbl_tenant_types "
                       " WHERE simplified_code = %s  AND id != %s ", (simplified_code, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404,
                                   title='API.BAD_REQUEST',
                                   description='API.TENANT_TYPE_SIMPLIFIED_CODE_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_tenant_types "
                      " SET name = %s, description = %s, simplified_code = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    description,
                                    simplified_code,
                                    id_,))
        cnx.commit()
        cursor.close()
        cnx.close()

        # Clear cache after updating tenant type
        clear_tenanttype_cache(tenanttype_id=int(id_))

        resp.status = falcon.HTTP_200

