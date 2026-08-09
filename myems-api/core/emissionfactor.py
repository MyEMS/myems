import uuid
from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
import redis
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


def clear_emission_factor_cache(emission_factor_id=None):
    """
    Clear emission factor related cache after data modification

    Args:
        emission_factor_id: Emission Factor ID (optional, for specific emission factor cache)
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

        # Clear emission factor list cache (all search query variations)
        list_cache_key_pattern = 'emissionfactor:list:*'
        matching_keys = redis_client.keys(list_cache_key_pattern)
        if matching_keys:
            redis_client.delete(*matching_keys)

        # Clear specific emission factor item cache if emission_factor_id is provided
        if emission_factor_id:
            item_cache_key = f'emissionfactor:item:{emission_factor_id}'
            redis_client.delete(item_cache_key)
            export_cache_key = f'emissionfactor:export:{emission_factor_id}'
            redis_client.delete(export_cache_key)

    except Exception:
        # If cache clear fails, ignore and continue
        pass


class EmissionFactorCollection:
    """
    Emission Factor Collection Resource

    This class handles CRUD operations for carbon dioxide emission factor collection.
    It provides endpoints for listing all emission factors and creating new emission factors.
    Emission factors define the amount of carbon dioxide emitted per unit of energy
    consumed in the energy management system.
    """
    def __init__(self):
        """Initialize EmissionFactorCollection"""
        pass

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
        cache_key = f'emissionfactor:list:{search_query}'
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
        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            try:
                cursor = cnx.cursor()

                query = (" SELECT ef.id, ef.name, ef.uuid, "
                         "        ec.id AS energy_category_id, ec.name AS energy_category_name, "
                         "        ef.factor_type, ef.unit_of_factor, ef.factor, "
                         "        ef.valid_from_datetime_utc, ef.valid_through_datetime_utc "
                         " FROM tbl_emission_factors ef, tbl_energy_categories ec "
                         " WHERE ef.energy_category_id = ec.id ")
                params = []
                if search_query:
                    query += " AND ef.name LIKE %s "
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
                                       "factor_type": row[5],
                                       "unit_of_factor": row[6],
                                       "valid_from": (row[8].replace(tzinfo=timezone.utc)
                                                      + timedelta(minutes=timezone_offset)).isoformat()[0:19],
                                       "valid_through": (row[9].replace(tzinfo=timezone.utc)
                                                         + timedelta(minutes=timezone_offset)).isoformat()[0:19]}

                        if meta_result['factor_type'] == 'fixed':
                            meta_result['factor'] = row[7]
                        elif meta_result['factor_type'] == 'timeofuse':
                            meta_result['timeofuse'] = list()
                            query = (" SELECT start_time_of_day, end_time_of_day, factor "
                                     " FROM tbl_emission_factors_timeofuses "
                                     " WHERE emission_factor_id = %s  "
                                     " ORDER BY id")
                            cursor.execute(query, (meta_result['id'],))
                            rows_timeofuses = cursor.fetchall()
                            if rows_timeofuses is not None and len(rows_timeofuses) > 0:
                                for row_timeofuse in rows_timeofuses:
                                    meta_data = {"start_time_of_day": str(row_timeofuse[0]),
                                                 "end_time_of_day": str(row_timeofuse[1]),
                                                 "factor": row_timeofuse[2]}
                                    meta_result['timeofuse'].append(meta_data)
                        else:
                            raise falcon.HTTPError(status=falcon.HTTP_400,
                                                   title='API.ERROR',
                                                   description='API.INVALID_EMISSION_FACTOR_TYPE')

                        result.append(meta_result)
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
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
                                   description='API.INVALID_EMISSION_FACTOR_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category' not in new_values['data'].keys() or \
                'id' not in new_values['data']['energy_category'].keys() or \
                not isinstance(new_values['data']['energy_category']['id'], int) or \
                new_values['data']['energy_category']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category']['id']

        if 'factor_type' not in new_values['data'].keys() \
           or str.strip(new_values['data']['factor_type']) not in ('fixed', 'timeofuse'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EMISSION_FACTOR_TYPE')
        factor_type = str.strip(new_values['data']['factor_type'])

        if new_values['data']['factor_type'] == 'timeofuse':
            if new_values['data']['timeofuse'] is None:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_EMISSION_FACTOR_TIME_OF_USE_PRICING')

        if 'unit_of_factor' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['unit_of_factor'], str) or \
                len(str.strip(new_values['data']['unit_of_factor'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNIT_OF_FACTOR')
        unit_of_factor = str.strip(new_values['data']['unit_of_factor'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            try:
                cursor = cnx.cursor()

                cursor.execute(" SELECT name "
                               " FROM tbl_emission_factors "
                               " WHERE name = %s ", (name,))
                if cursor.fetchone() is not None:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.EMISSION_FACTOR_NAME_IS_ALREADY_IN_USE')

                cursor.execute(" SELECT name "
                               " FROM tbl_energy_categories "
                               " WHERE id = %s ", (energy_category_id,))
                if cursor.fetchone() is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.ENERGY_CATEGORY_NOT_FOUND')

                # todo: validate datetime values
                valid_from = datetime.strptime(new_values['data']['valid_from'], '%Y-%m-%dT%H:%M:%S')
                valid_from = valid_from.replace(tzinfo=timezone.utc)
                valid_from -= timedelta(minutes=timezone_offset)
                valid_through = datetime.strptime(new_values['data']['valid_through'], '%Y-%m-%dT%H:%M:%S')
                valid_through = valid_through.replace(tzinfo=timezone.utc)
                valid_through -= timedelta(minutes=timezone_offset)

                factor = None
                if factor_type == 'fixed':
                    if 'factor' not in new_values['data'].keys() or \
                            new_values['data']['factor'] is None:
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_EMISSION_FACTOR')
                    factor = new_values['data']['factor']
                    if factor <= 0:
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_EMISSION_FACTOR')

                add_row = (" INSERT INTO tbl_emission_factors "
                           "             (name, uuid, energy_category_id, factor_type, unit_of_factor, "
                           "              factor, "
                           "              valid_from_datetime_utc, valid_through_datetime_utc ) "
                           " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
                cursor.execute(add_row, (name,
                                         str(uuid.uuid4()),
                                         energy_category_id,
                                         factor_type,
                                         unit_of_factor,
                                         factor,
                                         valid_from,
                                         valid_through))
                new_id = cursor.lastrowid
                cnx.commit()
                # insert time of use factors
                if factor_type == 'timeofuse':
                    for timeofuse in new_values['data']['timeofuse']:
                        if timeofuse['factor'] <= 0:
                            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                                   description='API.INVALID_EMISSION_FACTOR')
                        add_timeofuse = (" INSERT INTO tbl_emission_factors_timeofuses "
                                         " (emission_factor_id, start_time_of_day, end_time_of_day, factor) "
                                         " VALUES (%s, %s, %s, %s) ")
                        cursor.execute(add_timeofuse, (new_id,
                                                       timeofuse['start_time_of_day'],
                                                       timeofuse['end_time_of_day'],
                                                       timeofuse['factor']))
                        cnx.commit()
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        # Clear cache after creating new emission factor
        clear_emission_factor_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/emissionfactors/' + str(new_id)


class EmissionFactorItem:
    def __init__(self):
        pass

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
                                   description='API.INVALID_EMISSION_FACTOR_ID')

        # Redis cache key
        cache_key = f'emissionfactor:item:{id_}'
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
        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            try:
                cursor = cnx.cursor()

                query = (" SELECT ef.id, ef.name, ef.uuid, "
                         "        ec.id AS energy_category_id, ec.name AS energy_category_name, "
                         "        ef.factor_type, "
                         "        ef.unit_of_factor, ef.factor, "
                         "        ef.valid_from_datetime_utc, ef.valid_through_datetime_utc "
                         " FROM tbl_emission_factors ef, tbl_energy_categories ec "
                         " WHERE ef.energy_category_id = ec.id AND ef.id = %s ")
                cursor.execute(query, (id_,))
                row = cursor.fetchone()
                if row is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.EMISSION_FACTOR_NOT_FOUND')

                timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
                if config.utc_offset[0] == '-':
                    timezone_offset = -timezone_offset

                result = {"id": row[0],
                          "name": row[1],
                          "uuid": row[2],
                          "energy_category": {"id": row[3],
                                              "name": row[4]},
                          "factor_type": row[5],
                          "unit_of_factor": row[6],
                          "valid_from": (row[8].replace(tzinfo=timezone.utc)
                                         + timedelta(minutes=timezone_offset)).isoformat()[0:19],
                          "valid_through": (row[9].replace(tzinfo=timezone.utc)
                                            + timedelta(minutes=timezone_offset)).isoformat()[0:19]}

                if result['factor_type'] == 'fixed':
                    result['factor'] = row[7]
                elif result['factor_type'] == 'timeofuse':
                    result['timeofuse'] = list()
                    query = (" SELECT start_time_of_day, end_time_of_day, factor "
                             " FROM tbl_emission_factors_timeofuses"
                             " WHERE emission_factor_id = %s ")
                    cursor.execute(query, (result['id'],))
                    rows_timeofuses = cursor.fetchall()
                    if rows_timeofuses is not None and len(rows_timeofuses) > 0:
                        for row_timeofuse in rows_timeofuses:
                            meta_data = {"start_time_of_day": str(row_timeofuse[0]),
                                         "end_time_of_day": str(row_timeofuse[1]),
                                         "factor": row_timeofuse[2]}
                            result['timeofuse'].append(meta_data)
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
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
                                   description='API.INVALID_EMISSION_FACTOR_ID')

        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            try:
                cursor = cnx.cursor()

                cursor.execute(" SELECT name "
                               " FROM tbl_emission_factors "
                               " WHERE id = %s ", (id_,))
                if cursor.fetchone() is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.EMISSION_FACTOR_NOT_FOUND')

                cursor.execute(" SELECT id "
                               " FROM tbl_cost_centers_emission_factors "
                               " WHERE emission_factor_id = %s ", (id_,))
                rows = cursor.fetchall()
                if rows is not None and len(rows) > 0:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.EMISSION_FACTOR_IN_USE')

                cursor.execute(" DELETE FROM tbl_emission_factors_timeofuses WHERE emission_factor_id = %s ", (id_,))
                cnx.commit()

                cursor.execute(" DELETE FROM tbl_emission_factors WHERE id = %s ", (id_,))
                cnx.commit()
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        # Clear cache after deleting emission factor
        clear_emission_factor_cache(emission_factor_id=int(id_))

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
                                   description='API.INVALID_EMISSION_FACTOR_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMISSION_FACTOR_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category' not in new_values['data'].keys() or \
                'id' not in new_values['data']['energy_category'].keys() or \
                not isinstance(new_values['data']['energy_category']['id'], int) or \
                new_values['data']['energy_category']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category']['id']

        if 'factor_type' not in new_values['data'].keys() \
           or str.strip(new_values['data']['factor_type']) not in ('fixed', 'timeofuse'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EMISSION_FACTOR_TYPE')
        factor_type = str.strip(new_values['data']['factor_type'])

        if new_values['data']['factor_type'] == 'timeofuse':
            if new_values['data']['timeofuse'] is None:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_EMISSION_FACTOR_TIME_OF_USE_PRICING')

        if 'unit_of_factor' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['unit_of_factor'], str) or \
                len(str.strip(new_values['data']['unit_of_factor'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNIT_OF_FACTOR')
        unit_of_factor = str.strip(new_values['data']['unit_of_factor'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            try:
                cursor = cnx.cursor()

                # check if the emission factor exist
                query = (" SELECT name "
                         " FROM tbl_emission_factors "
                         " WHERE id = %s ")
                cursor.execute(query, (id_,))
                cursor.fetchone()

                if cursor.rowcount != 1:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.EMISSION_FACTOR_NOT_FOUND')

                cursor.execute(" SELECT name "
                               " FROM tbl_emission_factors "
                               " WHERE name = %s AND id != %s ", (name, id_))
                if cursor.fetchone() is not None:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.EMISSION_FACTOR_NAME_IS_ALREADY_IN_USE')

                valid_from = datetime.strptime(new_values['data']['valid_from'], '%Y-%m-%dT%H:%M:%S')
                valid_from = valid_from.replace(tzinfo=timezone.utc)
                valid_from -= timedelta(minutes=timezone_offset)
                valid_through = datetime.strptime(new_values['data']['valid_through'], '%Y-%m-%dT%H:%M:%S')
                valid_through = valid_through.replace(tzinfo=timezone.utc)
                valid_through -= timedelta(minutes=timezone_offset)

                factor = None
                if factor_type == 'fixed':
                    if 'factor' not in new_values['data'].keys() or \
                            new_values['data']['factor'] is None:
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_EMISSION_FACTOR')
                    factor = new_values['data']['factor']
                    if factor <= 0:
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_EMISSION_FACTOR')

                # update emission factor itself
                update_row = (" UPDATE tbl_emission_factors "
                              " SET name = %s, energy_category_id = %s, factor_type = %s, unit_of_factor = %s, "
                              "     factor = %s, "
                              "     valid_from_datetime_utc = %s , valid_through_datetime_utc = %s "
                              " WHERE id = %s ")
                cursor.execute(update_row, (name,
                                            energy_category_id,
                                            factor_type,
                                            unit_of_factor,
                                            factor,
                                            valid_from,
                                            valid_through,
                                            id_,))
                cnx.commit()

                # update time of use factors of the emission factor
                if factor_type == 'timeofuse':
                    if 'timeofuse' not in new_values['data'].keys() or new_values['data']['timeofuse'] is None:
                        raise falcon.HTTPError(status=falcon.HTTP_400,
                                               title='API.BAD_REQUEST',
                                               description='API.INVALID_EMISSION_FACTOR_TIME_OF_USE_PRICING')
                    else:
                        # remove all (possible) exist factors
                        cursor.execute(" DELETE FROM tbl_emission_factors_timeofuses "
                                       " WHERE emission_factor_id = %s ",
                                       (id_,))
                        cnx.commit()

                        for timeofuse in new_values['data']['timeofuse']:
                            if timeofuse['factor'] <= 0:
                                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                                       description='API.INVALID_EMISSION_FACTOR')
                            add_timeofuse = (" INSERT INTO tbl_emission_factors_timeofuses "
                                             " (emission_factor_id, start_time_of_day, end_time_of_day, factor) "
                                             " VALUES (%s, %s, %s, %s) ")
                            cursor.execute(add_timeofuse, (id_,
                                                           timeofuse['start_time_of_day'],
                                                           timeofuse['end_time_of_day'],
                                                           timeofuse['factor']))
                            cnx.commit()
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        # Clear cache after updating emission factor
        clear_emission_factor_cache(emission_factor_id=int(id_))

        resp.status = falcon.HTTP_200


class EmissionFactorExport:
    def __init__(self):
        pass

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
                                   description='API.INVALID_EMISSION_FACTOR_ID')

        # Redis cache key
        cache_key = f'emissionfactor:export:{id_}'
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
        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            try:
                cursor = cnx.cursor()

                query = (" SELECT ef.id, ef.name, ef.uuid, "
                         "        ec.id AS energy_category_id, ec.name AS energy_category_name, "
                         "        ef.factor_type, "
                         "        ef.unit_of_factor, ef.factor, "
                         "        ef.valid_from_datetime_utc, ef.valid_through_datetime_utc "
                         " FROM tbl_emission_factors ef, tbl_energy_categories ec "
                         " WHERE ef.energy_category_id = ec.id AND ef.id = %s ")
                cursor.execute(query, (id_,))
                row = cursor.fetchone()
                if row is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.EMISSION_FACTOR_NOT_FOUND')

                timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
                if config.utc_offset[0] == '-':
                    timezone_offset = -timezone_offset

                result = {"name": row[1],
                          "energy_category": {"id": row[3],
                                              "name": row[4]},
                          "factor_type": row[5],
                          "unit_of_factor": row[6],
                          "valid_from": (row[8].replace(tzinfo=timezone.utc)
                                         + timedelta(minutes=timezone_offset)).isoformat()[0:19],
                          "valid_through": (row[9].replace(tzinfo=timezone.utc)
                                            + timedelta(minutes=timezone_offset)).isoformat()[0:19]}

                if result['factor_type'] == 'fixed':
                    result['factor'] = row[7]
                elif result['factor_type'] == 'timeofuse':
                    result['timeofuse'] = list()
                    query = (" SELECT start_time_of_day, end_time_of_day, factor "
                             " FROM tbl_emission_factors_timeofuses"
                             " WHERE emission_factor_id = %s ")
                    cursor.execute(query, (row[0],))
                    rows_timeofuses = cursor.fetchall()
                    if rows_timeofuses is not None and len(rows_timeofuses) > 0:
                        for row_timeofuse in rows_timeofuses:
                            meta_data = {"start_time_of_day": str(row_timeofuse[0]),
                                         "end_time_of_day": str(row_timeofuse[1]),
                                         "factor": row_timeofuse[2]}
                            result['timeofuse'].append(meta_data)
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
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


class EmissionFactorImport:
    def __init__(self):
        pass

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
                                   description='API.INVALID_EMISSION_FACTOR_NAME')
        name = str.strip(new_values['name'])

        if 'energy_category' not in new_values.keys() or \
                'id' not in new_values['energy_category'].keys() or \
                not isinstance(new_values['energy_category']['id'], int) or \
                new_values['energy_category']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['energy_category']['id']

        if 'factor_type' not in new_values.keys() \
                or str.strip(new_values['factor_type']) not in ('fixed', 'timeofuse'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EMISSION_FACTOR_TYPE')
        factor_type = str.strip(new_values['factor_type'])

        if new_values['factor_type'] == 'timeofuse':
            if new_values['timeofuse'] is None:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_EMISSION_FACTOR_TIME_OF_USE_PRICING')

        if 'unit_of_factor' not in new_values.keys() or \
                not isinstance(new_values['unit_of_factor'], str) or \
                len(str.strip(new_values['unit_of_factor'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNIT_OF_FACTOR')
        unit_of_factor = str.strip(new_values['unit_of_factor'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            try:
                cursor = cnx.cursor()

                cursor.execute(" SELECT name "
                               " FROM tbl_emission_factors "
                               " WHERE name = %s ", (name,))
                if cursor.fetchone() is not None:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.EMISSION_FACTOR_NAME_IS_ALREADY_IN_USE')

                cursor.execute(" SELECT name "
                               " FROM tbl_energy_categories "
                               " WHERE id = %s ", (energy_category_id,))
                if cursor.fetchone() is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.ENERGY_CATEGORY_NOT_FOUND')

                # todo: validate datetime values
                valid_from = datetime.strptime(new_values['valid_from'], '%Y-%m-%dT%H:%M:%S')
                valid_from = valid_from.replace(tzinfo=timezone.utc)
                valid_from -= timedelta(minutes=timezone_offset)
                valid_through = datetime.strptime(new_values['valid_through'], '%Y-%m-%dT%H:%M:%S')
                valid_through = valid_through.replace(tzinfo=timezone.utc)
                valid_through -= timedelta(minutes=timezone_offset)

                factor = None
                if factor_type == 'fixed':
                    if 'factor' not in new_values.keys() or \
                            new_values['factor'] is None:
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_EMISSION_FACTOR')
                    factor = new_values['factor']
                    if factor <= 0:
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                               description='API.INVALID_EMISSION_FACTOR')

                add_row = (" INSERT INTO tbl_emission_factors "
                           "             (name, uuid, energy_category_id, factor_type, unit_of_factor, "
                           "              factor, "
                           "              valid_from_datetime_utc, valid_through_datetime_utc ) "
                           " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
                cursor.execute(add_row, (name,
                                         str(uuid.uuid4()),
                                         energy_category_id,
                                         factor_type,
                                         unit_of_factor,
                                         factor,
                                         valid_from,
                                         valid_through))
                new_id = cursor.lastrowid
                cnx.commit()
                # insert time of use factors
                if factor_type == 'timeofuse':
                    for timeofuse in new_values['timeofuse']:
                        if timeofuse['factor'] <= 0:
                            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                                   description='API.INVALID_EMISSION_FACTOR')
                        add_timeofuse = (" INSERT INTO tbl_emission_factors_timeofuses "
                                         " (emission_factor_id, start_time_of_day, end_time_of_day, factor) "
                                         " VALUES (%s, %s, %s, %s) ")
                        cursor.execute(add_timeofuse, (new_id,
                                                       timeofuse['start_time_of_day'],
                                                       timeofuse['end_time_of_day'],
                                                       timeofuse['factor']))
                        cnx.commit()
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        # Clear cache after importing emission factor
        clear_emission_factor_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/emissionfactors/' + str(new_id)


class EmissionFactorClone:
    def __init__(self):
        pass

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EMISSION_FACTOR_ID')

        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_system_db)
            try:
                cursor = cnx.cursor()

                query = (" SELECT ef.id, ef.name, ef.uuid, "
                         "        ec.id AS energy_category_id, ec.name AS energy_category_name, "
                         "        ef.factor_type, "
                         "        ef.unit_of_factor, ef.factor, "
                         "        ef.valid_from_datetime_utc, ef.valid_through_datetime_utc "
                         " FROM tbl_emission_factors ef, tbl_energy_categories ec "
                         " WHERE ef.energy_category_id = ec.id AND ef.id = %s ")
                cursor.execute(query, (id_,))
                row = cursor.fetchone()
                if row is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.EMISSION_FACTOR_NOT_FOUND')

                result = {"id": row[0],
                          "name": row[1],
                          "uuid": row[2],
                          "energy_category": {"id": row[3],
                                              "name": row[4]},
                          "factor_type": row[5],
                          "unit_of_factor": row[6],
                          "factor": row[7],
                          "valid_from": row[8].isoformat()[0:19],
                          "valid_through": row[9].isoformat()[0:19]}

                if result['factor_type'] == 'timeofuse':
                    result['timeofuse'] = list()
                    query = (" SELECT start_time_of_day, end_time_of_day, factor "
                             " FROM tbl_emission_factors_timeofuses"
                             " WHERE emission_factor_id = %s ")
                    cursor.execute(query, (result['id'],))
                    rows_timeofuses = cursor.fetchall()
                    if rows_timeofuses is not None and len(rows_timeofuses) > 0:
                        for row_timeofuse in rows_timeofuses:
                            meta_data = {"start_time_of_day": str(row_timeofuse[0]),
                                         "end_time_of_day": str(row_timeofuse[1]),
                                         "factor": row_timeofuse[2]}
                            result['timeofuse'].append(meta_data)
                timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
                if config.utc_offset[0] == '-':
                    timezone_offset = -timezone_offset
                suffix = (
                    datetime.now(timezone.utc).replace(tzinfo=None)
                    + timedelta(minutes=timezone_offset)
                ).isoformat(sep='-', timespec='seconds')
                new_name = str.strip(result['name']) + suffix
                add_row = (" INSERT INTO tbl_emission_factors "
                           "             (name, uuid, energy_category_id, factor_type, unit_of_factor, "
                           "              factor, "
                           "              valid_from_datetime_utc, valid_through_datetime_utc ) "
                           " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
                cursor.execute(add_row, (new_name,
                                         str(uuid.uuid4()),
                                         result['energy_category']['id'],
                                         result['factor_type'],
                                         result['unit_of_factor'],
                                         result['factor'],
                                         result['valid_from'],
                                         result['valid_through']))
                new_id = cursor.lastrowid
                cnx.commit()
                # insert time of use factors
                if result['factor_type'] == 'timeofuse':
                    for timeofuse in result['timeofuse']:
                        add_timeofuse = (" INSERT INTO tbl_emission_factors_timeofuses "
                                         " (emission_factor_id, start_time_of_day, end_time_of_day, factor) "
                                         " VALUES (%s, %s, %s, %s) ")
                        cursor.execute(add_timeofuse, (new_id,
                                                       timeofuse['start_time_of_day'],
                                                       timeofuse['end_time_of_day'],
                                                       timeofuse['factor']))
                        cnx.commit()
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        # Clear cache after cloning emission factor
        clear_emission_factor_cache()

        resp.status = falcon.HTTP_201
        resp.location = '/emissionfactors/' + str(new_id)