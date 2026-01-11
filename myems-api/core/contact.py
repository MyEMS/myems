import re
import uuid
import falcon
import mysql.connector
import simplejson as json
import redis
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


def clear_contact_cache(contact_id=None):
    """
    Clear contact-related cache after data modification

    Args:
        contact_id: Contact ID (optional, for specific contact cache)
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

        # Clear contact list cache (all search query variations)
        list_cache_key_pattern = 'contact:list:*'
        matching_keys = redis_client.keys(list_cache_key_pattern)
        if matching_keys:
            redis_client.delete(*matching_keys)

        # Clear specific contact item cache if contact_id is provided
        if contact_id:
            item_cache_key = f'contact:item:{contact_id}'
            redis_client.delete(item_cache_key)

    except Exception:
        # If cache clear fails, ignore and continue
        pass


class ContactCollection:
    """
    Contact Collection Resource

    This class handles CRUD operations for contact collection.
    It provides endpoints for listing all contacts and creating new contacts.
    Contacts represent individuals or organizations in the energy management system.
    """
    def __init__(self):
        """Initialize ContactCollection"""
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
        cache_key = f'contact:list:{search_query}'
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

        query = (" SELECT id, name, uuid, "
                 "        email, phone, description "
                 " FROM tbl_contacts " )

        params=[]
        if search_query:
            query += " WHERE name LIKE %s OR  description LIKE %s "
            params = [f'%{search_query}%', f'%{search_query}%']
        query +=  " ORDER BY name "

        cursor.execute(query,params)
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "email": row[3],
                               "phone": row[4],
                               "description": row[5]}
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
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'email' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['email'], str) or \
                len(str.strip(new_values['data']['email'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')
        email = str.lower(str.strip(new_values['data']['email']))

        match = re.match(r'^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email)
        if match is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')

        if 'phone' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['phone'], str) or \
                len(str.strip(new_values['data']['phone'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PHONE')
        phone = str.strip(new_values['data']['phone'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_contacts "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.CONTACT_NAME_IS_ALREADY_IN_USE')

        add_row = (" INSERT INTO tbl_contacts "
                   "     (name, uuid, email, phone, description) "
                   " VALUES (%s, %s, %s, %s, %s) ")

        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 email,
                                 phone,
                                 description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        # Clear cache after creating new contact
        clear_contact_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/contacts/' + str(new_id)


class ContactItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = id_
        _ = req
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_CONTACT_ID')

        # Redis cache key
        cache_key = f'contact:item:{id_}'
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

        query = (" SELECT id, name, uuid, email, phone, description "
                 " FROM tbl_contacts "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTACT_NOT_FOUND')

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "email": row[3],
                  "phone": row[4],
                  "description": row[5]}

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
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTACT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_contacts "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTACT_NOT_FOUND')

        # check relation with shopfloors
        cursor.execute(" SELECT id "
                       " FROM tbl_shopfloors "
                       " WHERE contact_id = %s ", (id_,))
        rows_shopfloors = cursor.fetchall()
        if rows_shopfloors is not None and len(rows_shopfloors) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SHOPFLOORS')

        # check relation with spaces
        cursor.execute(" SELECT id "
                       " FROM tbl_spaces "
                       " WHERE contact_id = %s ", (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # check relation with stores
        cursor.execute(" SELECT id "
                       " FROM tbl_stores "
                       " WHERE contact_id = %s ", (id_,))
        rows_stores = cursor.fetchall()
        if rows_stores is not None and len(rows_stores) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_STORES')

        # check relation with tenants
        cursor.execute(" SELECT id "
                       " FROM tbl_tenants "
                       " WHERE contact_id = %s ", (id_,))
        rows_tenants = cursor.fetchall()
        if rows_tenants is not None and len(rows_tenants) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_TENANTS')

        # check relation with charging_stations
        cursor.execute(" SELECT id "
                       " FROM tbl_charging_stations "
                       " WHERE contact_id = %s ", (id_,))
        rows_charging_stations = cursor.fetchall()
        if rows_charging_stations is not None and len(rows_charging_stations) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_CHARGING_STATIONS')

        # check relation with energy_storage_containers
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers "
                       " WHERE contact_id = %s ", (id_,))
        rows_energy_storage_containers = cursor.fetchall()
        if rows_energy_storage_containers is not None and len(rows_energy_storage_containers) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS')


        # check relation with energy_storage_power_stations
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE contact_id = %s ", (id_,))
        rows_energy_storage_power_stations = cursor.fetchall()
        if rows_energy_storage_power_stations is not None and len(rows_energy_storage_power_stations) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_POWER_STATIONS')

        # check relation with microgrids
        cursor.execute(" SELECT id "
                       " FROM tbl_microgrids "
                       " WHERE contact_id = %s ", (id_,))
        rows_microgrids = cursor.fetchall()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_MICROGRIDS')

        # check relation with photovoltaic_power_stations
        cursor.execute(" SELECT id "
                       " FROM tbl_photovoltaic_power_stations "
                       " WHERE contact_id = %s ", (id_,))
        rows_photovoltaic_power_stations = cursor.fetchall()
        if rows_photovoltaic_power_stations  is not None and len(rows_photovoltaic_power_stations) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS')

        #check relation with wind_farms
        cursor.execute(" SELECT id "
                       " FROM tbl_wind_farms "
                       " WHERE contact_id = %s ", (id_,))
        rows_wind_farms = cursor.fetchall()
        if rows_wind_farms is not None and len(rows_wind_farms) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_WIND_FARMS')


        cursor.execute(" DELETE FROM tbl_contacts WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after deleting contact
        clear_contact_cache(contact_id=id_)

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
                                   description='API.INVALID_CONTACT_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTACT_NAME')
        name = str.strip(new_values['data']['name'])

        if 'email' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['email'], str) or \
                len(str.strip(new_values['data']['email'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')
        email = str.lower(str.strip(new_values['data']['email']))

        match = re.match(r'^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email)
        if match is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMAIL')

        if 'phone' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['phone'], str) or \
                len(str.strip(new_values['data']['phone'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PHONE')
        phone = str.strip(new_values['data']['phone'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_contacts "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTACT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_contacts "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.CONTACT_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_contacts "
                      " SET name = %s, email = %s, "
                      "     phone = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    email,
                                    phone,
                                    description,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after updating contact
        clear_contact_cache(contact_id=id_)

        resp.status = falcon.HTTP_200

