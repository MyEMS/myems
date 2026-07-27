"""
Meter Tracking Report API

This module provides REST API endpoints for generating meter tracking reports.
It tracks meter performance over time and provides insights into
operational patterns, maintenance needs, and performance trends.

Key Features:
- Meter performance tracking
- Time-series data analysis
- Performance trend identification
- Maintenance scheduling insights
- Excel export functionality
- Performance monitoring

Report Components:
- Meter tracking summary
- Time-series performance data
- Performance trend analysis
- Maintenance indicators
- Performance alerts
- Operational patterns

The module uses Falcon framework for REST API and includes:
- Database queries for tracking data
- Time-series analysis algorithms
- Performance monitoring tools
- Excel export via excelexporters
- Multi-language support
- User authentication and authorization
"""

import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import hashlib
import falcon
import mysql.connector
import redis
import simplejson as json
from anytree import AnyNode, LevelOrderIter
import config
import excelexporters.metertracking
from core.useractivity import access_control, api_key_control

logger = logging.getLogger(__name__)


class Reporting:
    def __init__(self):
        """"Initializes Reporting"""
        pass

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: build a space tree
    # Step 3: query all meters in the space tree
    # Step 4: query start value and end value
    # Step 5: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        space_id = req.params.get('spaceid')
        energy_category = req.params.get('energyCategory')
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

        if energy_category is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        else:
            if energy_category == 'all':
                energy_category_id = None
                energy_category_name = None
            else:
                energy_category = str.strip(energy_category)
                if not energy_category.isdigit() or int(energy_category) <= 0:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_ENERGY_CATEGORY_ID')
                else:
                    energy_category_id = int(energy_category)
                    cnx_system_db = mysql.connector.connect(**config.myems_system_db)
                    cursor_system_db = cnx_system_db.cursor()
                    cursor_system_db.execute(" SELECT name "
                                             " FROM tbl_energy_categories "
                                             " WHERE id = %s ", (energy_category_id,))
                    row = cursor_system_db.fetchone()

                    if row is None:
                        if cursor_system_db:
                            cursor_system_db.close()
                        if cnx_system_db:
                            cnx_system_db.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.ENERGY_CATEGORY_NOT_FOUND')
                    else:
                        energy_category_name = row[0]

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # Set default reporting period to current month if not provided
        if reporting_period_start_datetime_local is None or len(str.strip(reporting_period_start_datetime_local)) == 0:
            now = datetime.now().replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
            reporting_start_datetime_utc = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
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

        if reporting_period_end_datetime_local is None or len(str.strip(reporting_period_end_datetime_local)) == 0:
            reporting_end_datetime_utc = datetime.now().replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
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

        if reporting_start_datetime_utc + timedelta(minutes=15) >= reporting_end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.THE_REPORTING_PERIOD_MUST_BE_LONGER_THAN_15_MINUTES')

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
                    "energyCategory": energy_category,
                    "reporting_start_datetime_utc": reporting_start_datetime_utc.isoformat()
                    if reporting_start_datetime_utc else None,
                    "reporting_end_datetime_utc": reporting_end_datetime_utc_normalized.isoformat()
                    if reporting_end_datetime_utc_normalized else None,
                    "language": language,
                    "quickmode": is_quick_mode,
                }
                cache_params_json = json.dumps(cache_params, sort_keys=True)
                cache_key = 'report:meterdashboard:' + hashlib.sha256(cache_params_json.encode('utf-8')).hexdigest()

                cached_result = redis_client.get(cache_key)
                if cached_result:
                    resp.text = cached_result
                    return
            except Exception:
                redis_client = None

        cnx_system_db = None
        cnx_historical = None
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cnx_historical = mysql.connector.connect(**config.myems_historical_db)

            cursor_system_db = None
            cursor_historical = None
            try:
                cursor_system_db = cnx_system_db.cursor()
                cursor_historical = cnx_historical.cursor()

                cursor_system_db.execute(" SELECT name "
                                         " FROM tbl_spaces "
                                         " WHERE id = %s ", (space_id,))
                row = cursor_system_db.fetchone()

                if row is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.SPACE_NOT_FOUND')
                else:
                    space_name = row[0]

                #################################################################################################
                # Step 2: build a space tree
                #################################################################################################

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

                def get_full_space_path(node):
                    path_names = []
                    while node is not None:
                        path_names.append(node.name)
                        node = node.parent
                    path_names.reverse()
                    return '/'.join(path_names)

                ##################################################################################################
                # Step 3: query all meters in the space tree
                ##################################################################################################
                meter_dict = dict()
                space_dict = dict()

                if config.is_recursive:
                    for node in LevelOrderIter(node_dict[space_id]):
                        space_dict[node.id] = node.name

                    space_ids = list(space_dict.keys())
                    placeholders = ','.join(['%s'] * len(space_ids))
                    if energy_category_id is not None:
                        cursor_system_db.execute(" SELECT m.id, m.name AS meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         m.description, m.uuid AS meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_meters sm, "
                                                 "tbl_meters m, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id IN (" + placeholders + ") "
                                                 "       AND sm.space_id = s.id AND sm.meter_id = m.id "
                                                 "       AND m.energy_category_id = %s "
                                                 " AND m.cost_center_id = cc.id AND m.energy_category_id = ec.id "
                                                 " ORDER BY meter_id ", tuple(space_ids) + (energy_category_id,))
                    else:
                        cursor_system_db.execute(" SELECT m.id, m.name AS meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         m.description, m.uuid AS meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_meters sm, "
                                                 "tbl_meters m, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id IN (" + placeholders + ") "
                                                 "       AND sm.space_id = s.id AND sm.meter_id = m.id "
                                                 " AND m.cost_center_id = cc.id AND m.energy_category_id = ec.id "
                                                 " ORDER BY meter_id ", tuple(space_ids))
                else:
                    if energy_category_id is not None:
                        cursor_system_db.execute(" SELECT m.id, m.name AS meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         m.description, m.uuid AS meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_meters sm, "
                                                 "tbl_meters m, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id = %s AND sm.space_id = s.id AND sm.meter_id = m.id "
                                                 "       AND m.energy_category_id = %s "
                                                 " AND m.cost_center_id = cc.id AND m.energy_category_id = ec.id  "
                                                 " ORDER BY meter_id ", (space_id, energy_category_id))
                    else:
                        cursor_system_db.execute(" SELECT m.id, m.name AS meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         m.description, m.uuid AS meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_meters sm, "
                                                 "tbl_meters m, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id = %s AND sm.space_id = s.id AND sm.meter_id = m.id "
                                                 " AND m.cost_center_id = cc.id AND m.energy_category_id = ec.id  "
                                                 " ORDER BY meter_id ", (space_id,))

                rows_meters = cursor_system_db.fetchall()
                if rows_meters is not None and len(rows_meters) > 0:
                    for row in rows_meters:
                        space_node = node_dict.get(row[2])
                        full_space_path = get_full_space_path(space_node) if space_node else row[2]
                        meter_dict[row[0]] = {"meter_name": row[1],
                                              "space_name": full_space_path,
                                              "cost_center_name": row[3],
                                              "energy_category_name": row[4],
                                              "description": row[5],
                                              "meter_uuid": row[6],
                                              "start_value": None,
                                              "end_value": None,
                                              "difference_value": None}

                ####################################################################################################
                # Step 4: count meters, virtual meters and offline meters
                ####################################################################################################
                meter_count = len(meter_dict)

                if meter_dict:
                    meter_ids = list(meter_dict.keys())
                    placeholders = ','.join(['%s'] * len(meter_ids))
                    cursor_system_db.execute(
                        "SELECT mp.meter_id, mp.point_id "
                        "FROM tbl_meters_points mp "
                        "JOIN tbl_points p ON mp.point_id = p.id "
                        "WHERE p.object_type = 'ENERGY_VALUE' AND mp.meter_id IN (" + placeholders + ")",
                        tuple(meter_ids)
                    )
                    point_rows = cursor_system_db.fetchall()
                    meter_point_map = {}
                    all_point_ids_set = set()
                    for mid, pid in point_rows:
                        if mid not in meter_point_map:
                            meter_point_map[mid] = []
                        meter_point_map[mid].append(pid)
                        all_point_ids_set.add(pid)
                    all_point_ids = list(all_point_ids_set)

                    start_map = {}
                    end_map = {}
                    if all_point_ids:
                        point_placeholders = ','.join(['%s'] * len(all_point_ids))
                        s_start = reporting_start_datetime_utc - timedelta(minutes=15)
                        s_end = reporting_start_datetime_utc
                        cursor_historical.execute(
                            "SELECT point_id, actual_value "
                            "FROM tbl_energy_value "
                            "WHERE point_id IN (" + point_placeholders + ") "
                            "AND utc_date_time BETWEEN %s AND %s "
                            "ORDER BY utc_date_time DESC",
                            tuple(all_point_ids) + (s_start, s_end)
                        )
                        start_rows = cursor_historical.fetchall()
                        for pid, val in start_rows:
                            if pid not in start_map:
                                start_map[pid] = val

                        e_start = reporting_end_datetime_utc - timedelta(minutes=15)
                        e_end = reporting_end_datetime_utc
                        cursor_historical.execute(
                            "SELECT point_id, actual_value "
                            "FROM tbl_energy_value "
                            "WHERE point_id IN (" + point_placeholders + ") "
                            "AND utc_date_time BETWEEN %s AND %s "
                            "ORDER BY utc_date_time DESC",
                            tuple(all_point_ids) + (e_start, e_end)
                        )
                        end_rows = cursor_historical.fetchall()
                        for pid, val in end_rows:
                            if pid not in end_map:
                                end_map[pid] = val

                    for meter_id in meter_dict:
                        pids = meter_point_map.get(meter_id, [])
                        s_val = None
                        e_val = None
                        for pid in pids:
                            if s_val is None and pid in start_map:
                                s_val = start_map[pid]
                            if e_val is None and pid in end_map:
                                e_val = end_map[pid]

                        meter_dict[meter_id]['start_value'] = s_val
                        meter_dict[meter_id]['end_value'] = e_val
                        if s_val is not None and e_val is not None:
                            meter_dict[meter_id]['difference_value'] = e_val - s_val
                        else:
                            meter_dict[meter_id]['difference_value'] = None

                # Query virtual meters in the space tree
                virtual_meter_dict = dict()
                if config.is_recursive:
                    space_ids = list(space_dict.keys())
                    placeholders = ','.join(['%s'] * len(space_ids))
                    if energy_category_id is not None:
                        cursor_system_db.execute(" SELECT vm.id, vm.name AS virtual_meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         vm.description, vm.uuid AS virtual_meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_virtual_meters svm, "
                                                 "tbl_virtual_meters vm, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id IN (" + placeholders + ") "
                                                 "       AND svm.space_id = s.id AND svm.virtual_meter_id = vm.id "
                                                 "       AND vm.energy_category_id = %s "
                                                 " AND vm.cost_center_id = cc.id AND vm.energy_category_id = ec.id "
                                                 " ORDER BY virtual_meter_id ", tuple(space_ids) + (energy_category_id,))
                    else:
                        cursor_system_db.execute(" SELECT vm.id, vm.name AS virtual_meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         vm.description, vm.uuid AS virtual_meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_virtual_meters svm, "
                                                 "tbl_virtual_meters vm, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id IN (" + placeholders + ") "
                                                 "       AND svm.space_id = s.id AND svm.virtual_meter_id = vm.id "
                                                 " AND vm.cost_center_id = cc.id AND vm.energy_category_id = ec.id "
                                                 " ORDER BY virtual_meter_id ", tuple(space_ids))
                else:
                    if energy_category_id is not None:
                        cursor_system_db.execute(" SELECT vm.id, vm.name AS virtual_meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         vm.description, vm.uuid AS virtual_meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_virtual_meters svm, "
                                                 "tbl_virtual_meters vm, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id = %s AND svm.space_id = s.id AND svm.virtual_meter_id = vm.id "
                                                 "       AND vm.energy_category_id = %s "
                                                 " AND vm.cost_center_id = cc.id AND vm.energy_category_id = ec.id  "
                                                 " ORDER BY virtual_meter_id ", (space_id, energy_category_id))
                    else:
                        cursor_system_db.execute(" SELECT vm.id, vm.name AS virtual_meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         vm.description, vm.uuid AS virtual_meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_virtual_meters svm, "
                                                 "tbl_virtual_meters vm, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id = %s AND svm.space_id = s.id AND svm.virtual_meter_id = vm.id "
                                                 " AND vm.cost_center_id = cc.id AND vm.energy_category_id = ec.id  "
                                                 " ORDER BY virtual_meter_id ", (space_id,))

                rows_virtual_meters = cursor_system_db.fetchall()
                if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
                    for row in rows_virtual_meters:
                        space_node = node_dict.get(row[2])
                        full_space_path = get_full_space_path(space_node) if space_node else row[2]
                        virtual_meter_dict[row[0]] = {"virtual_meter_name": row[1],
                                                      "space_name": full_space_path,
                                                      "cost_center_name": row[3],
                                                      "energy_category_name": row[4],
                                                      "description": row[5],
                                                      "virtual_meter_uuid": row[6],
                                                      "start_value": None,
                                                      "end_value": None,
                                                      "difference_value": None}

                # Count virtual meters in the space tree
                virtual_meter_count = len(virtual_meter_dict)

                if virtual_meter_dict:
                    cnx_energy = mysql.connector.connect(**config.myems_energy_db)
                    cursor_energy = cnx_energy.cursor()
                    try:
                        virtual_meter_ids = list(virtual_meter_dict.keys())
                        placeholders = ','.join(['%s'] * len(virtual_meter_ids))
                        
                        # Query start value from tbl_virtual_meter_hourly
                        s_start = reporting_start_datetime_utc - timedelta(hours=1)
                        s_end = reporting_start_datetime_utc
                        cursor_energy.execute(
                            "SELECT virtual_meter_id, actual_value "
                            "FROM tbl_virtual_meter_hourly "
                            "WHERE virtual_meter_id IN (" + placeholders + ") "
                            "AND start_datetime_utc >= %s "
                            "AND start_datetime_utc < %s "
                            "ORDER BY start_datetime_utc DESC",
                            tuple(virtual_meter_ids) + (s_start, s_end)
                        )
                        virtual_start_rows = cursor_energy.fetchall()
                        virtual_start_map = {}
                        for vmid, val in virtual_start_rows:
                            if vmid not in virtual_start_map:
                                virtual_start_map[vmid] = val

                        # Query end value from tbl_virtual_meter_hourly
                        e_start = reporting_end_datetime_utc - timedelta(hours=1)
                        e_end = reporting_end_datetime_utc
                        cursor_energy.execute(
                            "SELECT virtual_meter_id, actual_value "
                            "FROM tbl_virtual_meter_hourly "
                            "WHERE virtual_meter_id IN (" + placeholders + ") "
                            "AND start_datetime_utc >= %s "
                            "AND start_datetime_utc < %s "
                            "ORDER BY start_datetime_utc DESC",
                            tuple(virtual_meter_ids) + (e_start, e_end)
                        )
                        virtual_end_rows = cursor_energy.fetchall()
                        virtual_end_map = {}
                        for vmid, val in virtual_end_rows:
                            if vmid not in virtual_end_map:
                                virtual_end_map[vmid] = val

                        for vm_id in virtual_meter_dict:
                            s_val = virtual_start_map.get(vm_id, None)
                            e_val = virtual_end_map.get(vm_id, None)

                            virtual_meter_dict[vm_id]['start_value'] = s_val
                            virtual_meter_dict[vm_id]['end_value'] = e_val
                            if s_val is not None and e_val is not None:
                                virtual_meter_dict[vm_id]['difference_value'] = e_val - s_val
                            else:
                                virtual_meter_dict[vm_id]['difference_value'] = None
                    finally:
                        if cursor_energy:
                            cursor_energy.close()
                        if cnx_energy:
                            cnx_energy.close()

                # Query offline meters in the space tree
                offline_meter_dict = dict()
                if config.is_recursive:
                    space_ids = list(space_dict.keys())
                    placeholders = ','.join(['%s'] * len(space_ids))
                    if energy_category_id is not None:
                        cursor_system_db.execute(" SELECT om.id, om.name AS offline_meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         om.description, om.uuid AS offline_meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_offline_meters som, "
                                                 "tbl_offline_meters om, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id IN (" + placeholders + ") "
                                                 "       AND som.space_id = s.id AND som.offline_meter_id = om.id "
                                                 "       AND om.energy_category_id = %s "
                                                 " AND om.cost_center_id = cc.id AND om.energy_category_id = ec.id "
                                                 " ORDER BY offline_meter_id ", tuple(space_ids) + (energy_category_id,))
                    else:
                        cursor_system_db.execute(" SELECT om.id, om.name AS offline_meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         om.description, om.uuid AS offline_meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_offline_meters som, "
                                                 "tbl_offline_meters om, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id IN (" + placeholders + ") "
                                                 "       AND som.space_id = s.id AND som.offline_meter_id = om.id "
                                                 " AND om.cost_center_id = cc.id AND om.energy_category_id = ec.id "
                                                 " ORDER BY offline_meter_id ", tuple(space_ids))
                else:
                    if energy_category_id is not None:
                        cursor_system_db.execute(" SELECT om.id, om.name AS offline_meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         om.description, om.uuid AS offline_meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_offline_meters som, "
                                                 "tbl_offline_meters om, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id = %s AND som.space_id = s.id AND som.offline_meter_id = om.id "
                                                 "       AND om.energy_category_id = %s "
                                                 " AND om.cost_center_id = cc.id AND om.energy_category_id = ec.id  "
                                                 " ORDER BY offline_meter_id ", (space_id, energy_category_id))
                    else:
                        cursor_system_db.execute(" SELECT om.id, om.name AS offline_meter_name, s.id AS space_id, "
                                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                                 "         om.description, om.uuid AS offline_meter_uuid "
                                                 " FROM tbl_spaces s, tbl_spaces_offline_meters som, "
                                                 "tbl_offline_meters om, tbl_cost_centers cc, "
                                                 "      tbl_energy_categories ec "
                                                 " WHERE s.id = %s AND som.space_id = s.id AND som.offline_meter_id = om.id "
                                                 " AND om.cost_center_id = cc.id AND om.energy_category_id = ec.id  "
                                                 " ORDER BY offline_meter_id ", (space_id,))

                rows_offline_meters = cursor_system_db.fetchall()
                if rows_offline_meters is not None and len(rows_offline_meters) > 0:
                    for row in rows_offline_meters:
                        space_node = node_dict.get(row[2])
                        full_space_path = get_full_space_path(space_node) if space_node else row[2]
                        offline_meter_dict[row[0]] = {"offline_meter_name": row[1],
                                                      "space_name": full_space_path,
                                                      "cost_center_name": row[3],
                                                      "energy_category_name": row[4],
                                                      "description": row[5],
                                                      "offline_meter_uuid": row[6],
                                                      "start_value": None,
                                                      "end_value": None,
                                                      "difference_value": None}

                # Count offline meters in the space tree
                offline_meter_count = len(offline_meter_dict)

                if offline_meter_dict:
                    cnx_energy = mysql.connector.connect(**config.myems_energy_db)
                    cursor_energy = cnx_energy.cursor()
                    try:
                        offline_meter_ids = list(offline_meter_dict.keys())
                        placeholders = ','.join(['%s'] * len(offline_meter_ids))
                        
                        # Query start value from tbl_offline_meter_hourly
                        s_start = reporting_start_datetime_utc - timedelta(hours=1)
                        s_end = reporting_start_datetime_utc
                        cursor_energy.execute(
                            "SELECT offline_meter_id, actual_value "
                            "FROM tbl_offline_meter_hourly "
                            "WHERE offline_meter_id IN (" + placeholders + ") "
                            "AND start_datetime_utc >= %s "
                            "AND start_datetime_utc < %s "
                            "ORDER BY start_datetime_utc DESC",
                            tuple(offline_meter_ids) + (s_start, s_end)
                        )
                        offline_start_rows = cursor_energy.fetchall()
                        offline_start_map = {}
                        for omid, val in offline_start_rows:
                            if omid not in offline_start_map:
                                offline_start_map[omid] = val

                        # Query end value from tbl_offline_meter_hourly
                        e_start = reporting_end_datetime_utc - timedelta(hours=1)
                        e_end = reporting_end_datetime_utc
                        cursor_energy.execute(
                            "SELECT offline_meter_id, actual_value "
                            "FROM tbl_offline_meter_hourly "
                            "WHERE offline_meter_id IN (" + placeholders + ") "
                            "AND start_datetime_utc >= %s "
                            "AND start_datetime_utc < %s "
                            "ORDER BY start_datetime_utc DESC",
                            tuple(offline_meter_ids) + (e_start, e_end)
                        )
                        offline_end_rows = cursor_energy.fetchall()
                        offline_end_map = {}
                        for omid, val in offline_end_rows:
                            if omid not in offline_end_map:
                                offline_end_map[omid] = val

                        for om_id in offline_meter_dict:
                            s_val = offline_start_map.get(om_id, None)
                            e_val = offline_end_map.get(om_id, None)

                            offline_meter_dict[om_id]['start_value'] = s_val
                            offline_meter_dict[om_id]['end_value'] = e_val
                            if s_val is not None and e_val is not None:
                                offline_meter_dict[om_id]['difference_value'] = e_val - s_val
                            else:
                                offline_meter_dict[om_id]['difference_value'] = None
                    finally:
                        if cursor_energy:
                            cursor_energy.close()
                        if cnx_energy:
                            cnx_energy.close()

            finally:
                if cursor_system_db:
                    cursor_system_db.close()
                if cursor_historical:
                    cursor_historical.close()

        finally:
            if cnx_system_db:
                cnx_system_db.close()
            if cnx_historical:
                cnx_historical.close()

        ################################################################################################################
        # Step 5: construct the report
        ################################################################################################################
        meter_list = list()
        for meter_id, meter in meter_dict.items():
            meter_list.append({
                "id": meter_id,
                "meter_name": meter['meter_name'],
                "space_name": meter['space_name'],
                "cost_center_name": meter['cost_center_name'],
                "energy_category_name": meter['energy_category_name'],
                "description": meter['description'],
                "start_value": meter['start_value'],
                "end_value": meter['end_value'],
                "difference_value": meter['difference_value'],
                "meter_uuid": meter['meter_uuid']
            })

        virtual_meter_list = list()
        for vm_id, vm in virtual_meter_dict.items():
            virtual_meter_list.append({
                "id": vm_id,
                "virtual_meter_name": vm['virtual_meter_name'],
                "space_name": vm['space_name'],
                "cost_center_name": vm['cost_center_name'],
                "energy_category_name": vm['energy_category_name'],
                "description": vm['description'],
                "start_value": vm['start_value'],
                "end_value": vm['end_value'],
                "difference_value": vm['difference_value'],
                "virtual_meter_uuid": vm['virtual_meter_uuid']
            })

        offline_meter_list = list()
        for om_id, om in offline_meter_dict.items():
            offline_meter_list.append({
                "id": om_id,
                "offline_meter_name": om['offline_meter_name'],
                "space_name": om['space_name'],
                "cost_center_name": om['cost_center_name'],
                "energy_category_name": om['energy_category_name'],
                "description": om['description'],
                "start_value": om['start_value'],
                "end_value": om['end_value'],
                "difference_value": om['difference_value'],
                "offline_meter_uuid": om['offline_meter_uuid']
            })

        result = {
            'meters': meter_list,
            'meter_count': meter_count,
            'virtual_meters': virtual_meter_list,
            'virtual_meter_count': virtual_meter_count,
            'offline_meters': offline_meter_list,
            'offline_meter_count': offline_meter_count
        }
        resp_text = json.dumps(result)
        resp.text = resp_text

        if config.redis.get('is_enabled') and redis_client is not None and cache_key is not None:
            try:
                redis_client.setex(cache_key, cache_expire, resp_text)
            except Exception:
                logger.warning("Failed to write cache key %s", cache_key, exc_info=True)