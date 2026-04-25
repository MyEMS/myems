"""
Meter Batch Report API

This module provides REST API endpoints for generating meter batch reports.
It analyzes energy consumption data for multiple meters within a space hierarchy,
providing comprehensive insights into meter performance and energy usage patterns.

Key Features:
- Multi-meter energy consumption analysis
- Space hierarchy traversal and analysis
- Energy category breakdown
- Base period vs reporting period comparison
- Excel export functionality
- Performance metrics calculation
- Daily breakdown of energy consumption

Report Components:
- Meter energy consumption summary
- Space-based meter grouping
- Energy category analysis
- Performance comparison metrics
- Consumption trends and patterns
- Efficiency indicators
- Daily energy consumption breakdown

The module uses Falcon framework for REST API and includes:
- Database queries for meter data
- Space tree traversal algorithms
- Energy consumption calculations
- Excel export via excelexporters
- Multi-language support
- User authentication and authorization
"""

import logging
from datetime import datetime, timedelta, timezone
import hashlib
import falcon
import mysql.connector
import redis
import simplejson as json
from anytree import AnyNode, LevelOrderIter
import config
import excelexporters.meterbatch
from core.useractivity import access_control, api_key_control

logger = logging.getLogger(__name__)


class Reporting:
    def __init__(self):
        """"Initializes Reporting"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: build a space tree
    # Step 3: query all meters in the space tree
    # Step 4: query energy categories
    # Step 5: query reporting period energy input (total and daily)
    # Step 6: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        print(req.params)
        space_id = req.params.get('spaceid')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if space_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_SPACE_ID')
        else:
            space_id = str.strip(space_id)
            if not space_id.isdigit() or int(space_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_SPACE_ID')
            else:
                space_id = int(space_id)

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if reporting_period_start_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
        else:
            reporting_period_start_datetime_local = str.strip(reporting_period_start_datetime_local)
            try:
                reporting_start_datetime_utc = datetime.strptime(reporting_period_start_datetime_local,
                                                                 '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
            reporting_start_datetime_utc = \
                reporting_start_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
            # nomalize the start datetime
            if config.minutes_to_count == 30 and reporting_start_datetime_utc.minute >= 30:
                reporting_start_datetime_utc = reporting_start_datetime_utc.replace(minute=30, second=0, microsecond=0)
            else:
                reporting_start_datetime_utc = reporting_start_datetime_utc.replace(minute=0, second=0, microsecond=0)

        if reporting_period_end_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
        else:
            reporting_period_end_datetime_local = str.strip(reporting_period_end_datetime_local)
            try:
                reporting_end_datetime_utc = datetime.strptime(reporting_period_end_datetime_local,
                                                               '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
            reporting_end_datetime_utc = reporting_end_datetime_utc.replace(tzinfo=timezone.utc) - \
                                         timedelta(minutes=timezone_offset)

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPORTING_PERIOD_END_DATETIME')

        # if turn quick mode on, do not return parameters data and excel file
        is_quick_mode = False
        if quick_mode is not None and \
                len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

        ############################################################################################################
        # Redis cache
        ############################################################################################################
        cache_key = None
        cache_expire = 1800  # 30 minutes
        redis_client = None
        if config.redis.get('is_enabled'):
            try:
                redis_client = redis.Redis(
                    host=config.redis['host'],
                    port=config.redis['port'],
                    password=config.redis.get('password') or None,
                    db=config.redis['db'],
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2
                )
                redis_client.ping()

                # Normalize end datetimes for cache key: set minute/second/microsecond to 0
                reporting_end_datetime_utc_normalized = None
                if reporting_end_datetime_utc is not None:
                    reporting_end_datetime_utc_normalized = reporting_end_datetime_utc.replace(
                        minute=0, second=0, microsecond=0)

                cache_params = {
                    "spaceid": space_id,
                    "reporting_start_datetime_utc": reporting_start_datetime_utc.isoformat()
                    if reporting_start_datetime_utc else None,
                    "reporting_end_datetime_utc": reporting_end_datetime_utc_normalized.isoformat()
                    if reporting_end_datetime_utc_normalized else None,
                    "language": language,
                    "quickmode": is_quick_mode,
                }
                cache_params_json = json.dumps(cache_params, sort_keys=True)
                cache_key = 'report:meterbatch:' + hashlib.sha256(cache_params_json.encode('utf-8')).hexdigest()

                cached_result = redis_client.get(cache_key)
                if cached_result:
                    resp.text = cached_result
                    return
            except Exception:
                redis_client = None

        cnx_system_db = None
        cnx_energy_db = None
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)

            cursor_system_db = None
            cursor_energy_db = None
            try:
                cursor_system_db = cnx_system_db.cursor()
                cursor_energy_db = cnx_energy_db.cursor()

                cursor_system_db.execute(" SELECT name "
                                         " FROM tbl_spaces "
                                         " WHERE id = %s ", (space_id,))
                row = cursor_system_db.fetchone()

                if row is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.SPACE_NOT_FOUND')
                else:
                    space_name = row[0]

                ####################################################################################################
                # Step 2: build a space tree
                ####################################################################################################

                query = (" SELECT id, name, parent_space_id "
                         " FROM tbl_spaces "
                         " ORDER BY id ")
                cursor_system_db.execute(query)
                rows_spaces = cursor_system_db.fetchall()
                node_dict = dict()
                if rows_spaces is not None and len(rows_spaces) > 0:
                    for row in rows_spaces:
                        parent_node = node_dict[row[2]] if row[2] is not None else None
                        node_dict[row[0]] = AnyNode(id=row[0], parent=parent_node, name=row[1])

                ######################################################################################################
                # Step 3: query all meters in the space tree
                ######################################################################################################
                meter_dict = dict()
                space_dict = dict()
                energy_category_set = set()

                if config.is_recursive:
                    for node in LevelOrderIter(node_dict[space_id]):
                        space_dict[node.id] = node.name

                    cursor_system_db.execute(" SELECT m.id, m.name AS meter_name, m.uuid, m.energy_category_id, "
                                             "        s.name AS space_name, "
                                             "        cc.name AS cost_center_name, ec.name AS energy_category_name"
                                             " FROM tbl_spaces s, tbl_spaces_meters sm, "
                                             "      tbl_meters m, tbl_cost_centers cc,tbl_energy_categories ec "
                                             " WHERE s.id IN ( " + ', '.join(map(str, space_dict.keys())) + ") "
                                                                                                            " AND sm.space_id = s.id AND sm.meter_id = m.id AND m.energy_category_id = ec.id "
                                                                                                            " AND m.cost_center_id = cc.id ORDER BY meter_id ", )
                else:
                    cursor_system_db.execute(" SELECT m.id, m.name AS meter_name, m.uuid, m.energy_category_id, "
                                             "        s.name AS space_name, "
                                             "        cc.name AS cost_center_name,ec.name AS energy_category_name "
                                             " FROM tbl_spaces s, tbl_spaces_meters sm, "
                                             "      tbl_meters m, tbl_cost_centers cc,tbl_energy_categories ec "
                                             " WHERE s.id = %s AND sm.space_id = s.id AND sm.meter_id = m.id AND m.energy_category_id = ec.id  "
                                             " AND m.cost_center_id = cc.id  ORDER BY meter_id ", (space_id,))

                rows_meters = cursor_system_db.fetchall()
                print(rows_meters)
                if rows_meters is not None and len(rows_meters) > 0:
                    for row in rows_meters:
                        meter_dict[row[0]] = {"meter_name": row[1],
                                              "uuid": row[2],
                                              "energy_category_id": row[3],
                                              "space_name": row[4],
                                              "cost_center_name": row[5],
                                              "energy_category_name": row[6],
                                              "values": list(),
                                              "daily_values": dict(),
                                              "subtotal": None}
                        energy_category_set.add(row[3])

                ###############################################################################################
                # Step 4: query energy categories
                ###############################################################################################

                # query all energy categories
                cursor_system_db.execute(" SELECT id, name, unit_of_measure "
                                         " FROM tbl_energy_categories "
                                         " ORDER BY id ", )
                rows_energy_categories = cursor_system_db.fetchall()
                if rows_energy_categories is None or len(rows_energy_categories) == 0:
                    raise falcon.HTTPError(status=falcon.HTTP_404,
                                           title='API.NOT_FOUND',
                                           description='API.ENERGY_CATEGORY_NOT_FOUND')
                energy_category_list = list()
                for row_energy_category in rows_energy_categories:
                    if row_energy_category[0] in energy_category_set:
                        energy_category_list.append({"id": row_energy_category[0],
                                                     "name": row_energy_category[1],
                                                     "unit_of_measure": row_energy_category[2]})

                #################################################################################################
                # Step 5: query reporting period energy input (total and daily)
                #################################################################################################

                # Generate date list for the reporting period using local time
                date_list = list()
                reporting_start_datetime_local = reporting_start_datetime_utc.replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                reporting_end_datetime_local = reporting_end_datetime_utc.replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                
                current_date = reporting_start_datetime_local.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = reporting_end_datetime_local.replace(hour=0, minute=0, second=0, microsecond=0)

                while current_date < end_date:
                    date_list.append(current_date)
                    current_date += timedelta(days=1)

                # Query total and daily energy for each meter
                for meter_id in meter_dict:
                    # Query total energy for the reporting period
                    cursor_energy_db.execute(" SELECT SUM(actual_value) "
                                             " FROM tbl_meter_hourly "
                                             " WHERE meter_id = %s "
                                             "     AND start_datetime_utc >= %s "
                                             "     AND start_datetime_utc < %s ",
                                             (meter_id,
                                              reporting_start_datetime_utc,
                                              reporting_end_datetime_utc))
                    rows_meter_energy = cursor_energy_db.fetchall()

                    # Query daily energy breakdown with UTC timestamps
                    cursor_energy_db.execute(" SELECT start_datetime_utc, "
                                             "        actual_value "
                                             " FROM tbl_meter_hourly "
                                             " WHERE meter_id = %s "
                                             "     AND start_datetime_utc >= %s "
                                             "     AND start_datetime_utc < %s "
                                             " ORDER BY start_datetime_utc",
                                             (meter_id,
                                              reporting_start_datetime_utc,
                                              reporting_end_datetime_utc))
                    rows_daily_energy = cursor_energy_db.fetchall()

                    # Build daily values dictionary by converting UTC to local time
                    daily_values_dict = dict()
                    for row_daily in rows_daily_energy:
                        utc_datetime = row_daily[0]
                        if isinstance(utc_datetime, datetime):
                            local_datetime = utc_datetime.replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                            date_str = local_datetime.strftime('%Y-%m-%d')
                        else:
                            date_str = str(utc_datetime)
                        
                        value = row_daily[1]
                        if date_str in daily_values_dict:
                            daily_values_dict[date_str] += value
                        else:
                            daily_values_dict[date_str] = value

                    meter_dict[meter_id]['daily_values'] = daily_values_dict

                    # Process total energy by energy category
                    for energy_category in energy_category_list:
                        subtotal = None
                        for row_meter_energy in rows_meter_energy:
                            if energy_category['id'] == meter_dict[meter_id]['energy_category_id']:
                                subtotal = row_meter_energy[0]
                                meter_dict[meter_id]['subtotal'] = subtotal
                                break
                        # append subtotal
                        # append None if energy category is not applicable
                        meter_dict[meter_id]['values'].append(subtotal)


            finally:
                if cursor_system_db:
                    cursor_system_db.close()
                if cursor_energy_db:
                    cursor_energy_db.close()

        finally:
            if cnx_system_db:
                cnx_system_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()

        ################################################################################################################
        # Step 6: construct the report
        ################################################################################################################
        meter_list = list()
        for meter_id, meter in meter_dict.items():
            # Convert daily_values dict to ordered list based on date_list
            daily_values_list = list()
            for date_obj in date_list:
                date_str = date_obj.strftime('%Y-%m-%d')
                daily_values_list.append({
                    "date": date_str,
                    "value": meter['daily_values'].get(date_str, None)
                })

            meter_list.append({
                "id": meter_id,
                "meter_name": meter['meter_name'],
                "energy_category_name": meter['energy_category_name'],
                "uuid": meter['uuid'],
                "space_name": meter['space_name'],
                "cost_center_name": meter['cost_center_name'],
                "values": meter['values'],
                "daily_values": daily_values_list,
                "subtotal": meter['subtotal'],
            })
        result = {
            'meters': meter_list,
            'energycategories': energy_category_list,
            "date_list": [date_obj.strftime('%Y-%m-%d') for date_obj in date_list],
            "excel_bytes_base64": None
        }

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.meterbatch.export(result,
                                                 space_name,
                                                 reporting_period_start_datetime_local,
                                                 reporting_period_end_datetime_local,
                                                 language)
        resp_text = json.dumps(result)
        resp.text = resp_text

        if config.redis.get('is_enabled') and redis_client is not None and cache_key is not None:
            try:
                redis_client.setex(cache_key, cache_expire, resp_text)
            except Exception:
                logger.warning("Failed to write cache key %s", cache_key, exc_info=True)
