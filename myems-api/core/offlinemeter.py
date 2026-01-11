import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
import redis
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


def clear_offline_meter_cache(offline_meter_id=None):
    """
    Clear offline meter-related cache after data modification

    Args:
        offline_meter_id: Offline meter ID (optional, for specific offline meter cache)
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

        # Clear offline meter list cache (all search query variations)
        list_cache_key_pattern = 'offlinemeter:list:*'
        matching_keys = redis_client.keys(list_cache_key_pattern)
        if matching_keys:
            redis_client.delete(*matching_keys)

        # Clear specific offline meter item cache if offline_meter_id is provided
        if offline_meter_id:
            item_cache_key = f'offlinemeter:item:{offline_meter_id}'
            redis_client.delete(item_cache_key)
            export_cache_key = f'offlinemeter:export:{offline_meter_id}'
            redis_client.delete(export_cache_key)

    except Exception:
        # If cache clear fails, ignore and continue
        pass


class OfflineMeterCollection:
    """
    Offline Meter Collection Resource

    This class handles CRUD operations for offline meter collection.
    It provides endpoints for listing all offline meters and creating new offline meters.
    Offline meters are used for manual energy data entry and tracking.
    """
    def __init__(self):
        """Initialize OfflineMeterCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        """Handle OPTIONS requests for CORS preflight"""
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """
        Handle GET requests to retrieve all offline meters

        Returns a list of all offline meters with their metadata including:
        - Meter ID, name, and UUID
        - Energy category and energy item information
        - Cost center information
        - Counting status and hourly limits
        - Description

        Supports optional search query parameter 'q' for filtering by name or description.

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        # Check authentication - use API key if provided, otherwise use access control
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        # Get search query parameter
        search_query = req.get_param('q', default=None)
        if search_query is not None:
            search_query = search_query.strip()
        else:
            search_query = ''

        # Redis cache key
        cache_key = f'offlinemeter:list:{search_query}'
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
        # Connect to database
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_items ")
        cursor.execute(query)
        rows_energy_items = cursor.fetchall()

        energy_item_dict = dict()
        if rows_energy_items is not None and len(rows_energy_items) > 0:
            for row in rows_energy_items:
                energy_item_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, energy_category_id, "
                 "        is_counted, hourly_low_limit, hourly_high_limit, "
                 "        energy_item_id, cost_center_id, description "
                 " FROM tbl_offline_meters ")
        params = []
        if search_query:
            query += " WHERE name LIKE %s OR description LIKE %s "
            params = [f'%{search_query}%', f'%{search_query}%']

        query += " ORDER BY id "
        cursor.execute(query,params)
        rows_meters = cursor.fetchall()

        result = list()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "energy_category": energy_category_dict.get(row[3], None),
                               "is_counted": True if row[4] else False,
                               "hourly_low_limit": row[5],
                               "hourly_high_limit": row[6],
                               "energy_item": energy_item_dict.get(row[7], None),
                               "cost_center": cost_center_dict.get(row[8], None),
                               "description": row[9]}
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
                                   description='API.INVALID_OFFLINE_METER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['energy_category_id'], int) or \
                new_values['data']['energy_category_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category_id']

        if 'is_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COUNTED_VALUE')
        is_counted = new_values['data']['is_counted']

        if 'hourly_low_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['hourly_low_limit'], float) or
                     isinstance(new_values['data']['hourly_low_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HOURLY_LOW_LIMIT_VALUE')
        hourly_low_limit = new_values['data']['hourly_low_limit']

        if 'hourly_high_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['hourly_high_limit'], float) or
                     isinstance(new_values['data']['hourly_high_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HOURLY_HIGH_LIMIT_VALUE')
        hourly_high_limit = new_values['data']['hourly_high_limit']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')

        cost_center_id = new_values['data']['cost_center_id']

        if 'energy_item_id' in new_values['data'].keys() and \
                new_values['data']['energy_item_id'] is not None:
            if not isinstance(new_values['data']['energy_item_id'], int) or \
                    new_values['data']['energy_item_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_ITEM_ID')
            energy_item_id = new_values['data']['energy_item_id']
        else:
            energy_item_id = None

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.OFFLINE_METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (new_values['data']['energy_category_id'],))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')
        if energy_item_id is not None:
            cursor.execute(" SELECT name, energy_category_id "
                           " FROM tbl_energy_items "
                           " WHERE id = %s ",
                           (new_values['data']['energy_item_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.ENERGY_ITEM_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                           description='API.ENERGY_ITEM_IS_NOT_BELONG_TO_ENERGY_CATEGORY')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['data']['cost_center_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_offline_meters "
                      "    (name, uuid, energy_category_id, "
                      "     is_counted, hourly_low_limit, hourly_high_limit, "
                      "     cost_center_id, energy_item_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    energy_category_id,
                                    is_counted,
                                    hourly_low_limit,
                                    hourly_high_limit,
                                    cost_center_id,
                                    energy_item_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        # Clear cache after creating new offline meter
        clear_offline_meter_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/offlinemeters/' + str(new_id)


class OfflineMeterItem:
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
                                   description='API.INVALID_OFFLINE_METER_ID')

        # Redis cache key
        cache_key = f'offlinemeter:item:{id_}'
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

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_items ")
        cursor.execute(query)
        rows_energy_items = cursor.fetchall()

        energy_item_dict = dict()
        if rows_energy_items is not None and len(rows_energy_items) > 0:
            for row in rows_energy_items:
                energy_item_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, energy_category_id, "
                 "        is_counted, hourly_low_limit, hourly_high_limit, "
                 "        energy_item_id, cost_center_id, description "
                 " FROM tbl_offline_meters "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "energy_category": energy_category_dict.get(row[3], None),
                           "is_counted": True if row[4] else False,
                           "hourly_low_limit": row[5],
                           "hourly_high_limit": row[6],
                           "energy_item": energy_item_dict.get(row[7], None),
                           "cost_center": cost_center_dict.get(row[8], None),
                           "description": row[9]}

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
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT uuid "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')
        else:
            offline_meter_uuid = row[0]

        # check if this offline meter is being used by virtual meters
        cursor.execute(" SELECT vm.name "
                       " FROM tbl_variables va, tbl_virtual_meters vm "
                       " WHERE va.meter_id = %s AND va.meter_type = 'offline_meter' AND va.virtual_meter_id = vm.id ",
                       (id_,))
        row_virtual_meter = cursor.fetchone()
        if row_virtual_meter is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THIS_OFFLINE_METER_IS_BEING_USED_BY_A_VIRTUAL_METER')

        # check relation with spaces
        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_offline_meters "
                       " WHERE offline_meter_id = %s ", (id_,))
        rows_companies = cursor.fetchall()
        if rows_companies is not None and len(rows_companies) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # check relation with combined equipments
        cursor.execute(" SELECT combined_equipment_id "
                       " FROM tbl_combined_equipments_offline_meters "
                       " WHERE offline_meter_id = %s ",
                       (id_,))
        rows_combined_equipments = cursor.fetchall()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENTS')

        # check relation with combined equipment parameters
        cursor.execute(" SELECT combined_equipment_id "
                       " FROM tbl_combined_equipments_parameters "
                       " WHERE numerator_meter_uuid = %s OR denominator_meter_uuid = %s",
                       (offline_meter_uuid, offline_meter_uuid,))
        rows_combined_equipments = cursor.fetchall()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENT_PARAMETERS')

        # check relations with tenants
        cursor.execute(" SELECT tenant_id "
                       " FROM tbl_tenants_offline_meters "
                       " WHERE offline_meter_id = %s ", (id_,))
        rows_tenants = cursor.fetchall()
        if rows_tenants is not None and len(rows_tenants) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_TENANTS')

        # check relations with stores
        cursor.execute(" SELECT store_id "
                       " FROM tbl_stores_offline_meters "
                       " WHERE offline_meter_id = %s ", (id_,))
        rows_stores = cursor.fetchall()
        if rows_stores is not None and len(rows_stores) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_STORES')

        # check relations with shopfloors
        cursor.execute(" SELECT shopfloor_id "
                       " FROM tbl_shopfloors_offline_meters "
                       " WHERE offline_meter_id = %s ", (id_,))
        rows_shopfloors = cursor.fetchall()
        if rows_shopfloors is not None and len(rows_shopfloors) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SHOPFLOORS')

        # check relations with equipments
        cursor.execute(" SELECT equipment_id "
                       " FROM tbl_equipments_offline_meters "
                       " WHERE offline_meter_id = %s ", (id_,))
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENTS')

        # check relation with equipment parameters
        cursor.execute(" SELECT equipment_id "
                       " FROM tbl_equipments_parameters "
                       " WHERE numerator_meter_uuid = %s OR denominator_meter_uuid = %s",
                       (offline_meter_uuid, offline_meter_uuid,))
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENT_PARAMETERS')

        # check relation with energy flow diagram links
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE meter_uuid = %s ", (offline_meter_uuid,))
        rows_links = cursor.fetchall()
        if rows_links is not None and len(rows_links) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_FLOW_DIAGRAM_LINKS')

        cursor.execute(" DELETE FROM tbl_offline_meters WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after deleting offline meter
        clear_offline_meter_cache(offline_meter_id=int(id_))

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
                                   description='API.INVALID_OFFLINE_METER_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['energy_category_id'], int) or \
                new_values['data']['energy_category_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category_id']

        if 'is_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COUNTED_VALUE')
        is_counted = new_values['data']['is_counted']

        if 'hourly_low_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['hourly_low_limit'], float) or
                     isinstance(new_values['data']['hourly_low_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HOURLY_LOW_LIMIT_VALUE')
        hourly_low_limit = new_values['data']['hourly_low_limit']

        if 'hourly_high_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['hourly_high_limit'], float) or
                     isinstance(new_values['data']['hourly_high_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HOURLY_HIGH_LIMIT_VALUE')
        hourly_high_limit = new_values['data']['hourly_high_limit']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')

        cost_center_id = new_values['data']['cost_center_id']

        if 'energy_item_id' in new_values['data'].keys() and \
                new_values['data']['energy_item_id'] is not None:
            if not isinstance(new_values['data']['energy_item_id'], int) or \
                    new_values['data']['energy_item_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_ITEM_ID')
            energy_item_id = new_values['data']['energy_item_id']
        else:
            energy_item_id = None

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.OFFLINE_METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (new_values['data']['energy_category_id'],))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['data']['cost_center_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        if energy_item_id is not None:
            cursor.execute(" SELECT name, energy_category_id "
                           " FROM tbl_energy_items "
                           " WHERE id = %s ",
                           (new_values['data']['energy_item_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.ENERGY_ITEM_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                           description='API.ENERGY_ITEM_IS_NOT_BELONG_TO_ENERGY_CATEGORY')

        update_row = (" UPDATE tbl_offline_meters "
                      " SET name = %s, energy_category_id = %s,"
                      "     is_counted = %s, hourly_low_limit = %s, hourly_high_limit = %s, "
                      "     cost_center_id = %s, energy_item_id = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    energy_category_id,
                                    is_counted,
                                    hourly_low_limit,
                                    hourly_high_limit,
                                    cost_center_id,
                                    energy_item_id,
                                    description,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        # Clear cache after updating offline meter
        clear_offline_meter_cache(offline_meter_id=int(id_))

        resp.status = falcon.HTTP_200


class OfflineMeterExport:
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
                                   description='API.INVALID_OFFLINE_METER_ID')

        # Redis cache key
        cache_key = f'offlinemeter:export:{id_}'
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

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_items ")
        cursor.execute(query)
        rows_energy_items = cursor.fetchall()

        energy_item_dict = dict()
        if rows_energy_items is not None and len(rows_energy_items) > 0:
            for row in rows_energy_items:
                energy_item_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, energy_category_id, "
                 "        is_counted, hourly_low_limit, hourly_high_limit, "
                 "        energy_item_id, cost_center_id, description "
                 " FROM tbl_offline_meters "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "energy_category": energy_category_dict.get(row[3], None),
                           "is_counted": True if row[4] else False,
                           "hourly_low_limit": row[5],
                           "hourly_high_limit": row[6],
                           "energy_item": energy_item_dict.get(row[7], None),
                           "cost_center": cost_center_dict.get(row[8], None),
                           "description": row[9]}

        # Store result in Redis cache
        result_json = json.dumps(meta_result)
        if redis_client:
            try:
                redis_client.setex(cache_key, cache_expire, result_json)
            except Exception:
                # If cache set fails, ignore and continue
                pass

        resp.text = result_json


class OfflineMeterImport:
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
                                   description='API.INVALID_OFFLINE_METER_NAME')
        name = str.strip(new_values['name'])

        if 'energy_category' not in new_values.keys() or \
            'id' not in new_values['energy_category'].keys() or \
            not isinstance(new_values['energy_category']['id'], int) or \
                new_values['energy_category']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['energy_category']['id']

        if 'is_counted' not in new_values.keys() or \
                not isinstance(new_values['is_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_COUNTED_VALUE')
        is_counted = new_values['is_counted']

        if 'hourly_low_limit' not in new_values.keys() or \
                not (isinstance(new_values['hourly_low_limit'], float) or
                     isinstance(new_values['hourly_low_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HOURLY_LOW_LIMIT_VALUE')
        hourly_low_limit = new_values['hourly_low_limit']

        if 'hourly_high_limit' not in new_values.keys() or \
                not (isinstance(new_values['hourly_high_limit'], float) or
                     isinstance(new_values['hourly_high_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HOURLY_HIGH_LIMIT_VALUE')
        hourly_high_limit = new_values['hourly_high_limit']

        if 'cost_center' not in new_values.keys() or \
            new_values['cost_center'] is None or \
            'id' not in new_values['cost_center'].keys() or \
                not isinstance(new_values['cost_center']['id'], int) or \
                new_values['cost_center']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')

        cost_center_id = new_values['cost_center']['id']

        if 'energy_item' in new_values.keys() and \
            new_values['energy_item'] is not None and \
                'id' in new_values['energy_item'].keys() and \
                new_values['energy_item']['id'] is not None:
            if not isinstance(new_values['energy_item']['id'], int) or \
                    new_values['energy_item']['id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_ITEM_ID')
            energy_item_id = new_values['energy_item']['id']
        else:
            energy_item_id = None

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.OFFLINE_METER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ",
                       (new_values['energy_category']['id'],))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')
        if energy_item_id is not None:
            cursor.execute(" SELECT name, energy_category_id "
                           " FROM tbl_energy_items "
                           " WHERE id = %s ",
                           (new_values['energy_item']['id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.ENERGY_ITEM_NOT_FOUND')
            else:
                if row[1] != energy_category_id:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.BAD_REQUEST',
                                           description='API.ENERGY_ITEM_IS_NOT_BELONG_TO_ENERGY_CATEGORY')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['cost_center']['id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_offline_meters "
                      "    (name, uuid, energy_category_id, "
                      "     is_counted, hourly_low_limit, hourly_high_limit, "
                      "     cost_center_id, energy_item_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    energy_category_id,
                                    is_counted,
                                    hourly_low_limit,
                                    hourly_high_limit,
                                    cost_center_id,
                                    energy_item_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        # Clear cache after importing offline meter
        clear_offline_meter_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/offlinemeters/' + str(new_id)


class OfflineMeterClone:
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
                                   description='API.INVALID_OFFLINE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_items ")
        cursor.execute(query)
        rows_energy_items = cursor.fetchall()

        energy_item_dict = dict()
        if rows_energy_items is not None and len(rows_energy_items) > 0:
            for row in rows_energy_items:
                energy_item_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, energy_category_id, "
                 "        is_counted, hourly_low_limit, hourly_high_limit, "
                 "        energy_item_id, cost_center_id, description "
                 " FROM tbl_offline_meters "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "energy_category": energy_category_dict.get(row[3], None),
                           "is_counted": True if row[4] else False,
                           "hourly_low_limit": row[5],
                           "hourly_high_limit": row[6],
                           "energy_item": energy_item_dict.get(row[7], None),
                           "cost_center": cost_center_dict.get(row[8], None),
                           "description": row[9]}

            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = (str.strip(meta_result['name']) +
                        (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
            energy_item_id = meta_result['energy_item']['id'] if meta_result['energy_item'] is not None else None
            add_values = (" INSERT INTO tbl_offline_meters "
                          "    (name, uuid, energy_category_id, "
                          "     is_counted, hourly_low_limit, hourly_high_limit, "
                          "     cost_center_id, energy_item_id, description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['energy_category']['id'],
                                        meta_result['is_counted'],
                                        meta_result['hourly_low_limit'],
                                        meta_result['hourly_high_limit'],
                                        meta_result['cost_center']['id'],
                                        energy_item_id,
                                        meta_result['description']))
            new_id = cursor.lastrowid
            cnx.commit()
            cursor.close()
            cnx.close()

            # Clear cache after cloning offline meter
            clear_offline_meter_cache()

            resp.status = falcon.HTTP_201
            resp.location = '/offlinemeters/' + str(new_id)
