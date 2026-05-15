"""
Tenant Dashboard Report API - Redesigned

This module provides REST API endpoints for generating comprehensive tenant dashboard reports.
It aggregates data from multiple sources including tenants, energy categories, sensors,
and child spaces to provide a complete overview of tenant energy consumption and performance.

Key Features:
- Multi-tenant energy consumption analysis
- Energy category breakdown and trends
- Sensor data integration and monitoring
- Child space hierarchy analysis
- Base period vs reporting period comparison
- Real-time data processing
- Carbon emissions tracking
- Cost analysis and optimization insights

Report Components:
- Tenant overview KPIs (total tenants, active meters, alerts)
- Energy input analysis by category
- Energy cost calculations and trends
- Carbon emissions tracking
- Child space consumption breakdown
- Sensor monitoring data
- Performance metrics and KPIs
- Time-of-use analysis
- Monthly/yearly trends

The module uses Falcon framework for REST API and includes:
- Database queries for historical data
- Real-time data aggregation
- Multi-language support
- User authentication and authorization
- Redis caching for performance
"""

import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import hashlib
import falcon
import mysql.connector
import redis
import simplejson as json
import config
from core import utilities
from core.useractivity import access_control, api_key_control

logger = logging.getLogger(__name__)


class Reporting:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: Validate parameters
    # Step 2: Query user and get associated tenants
    # Step 3: Query energy categories
    # Step 4: Query base period energy input by category
    # Step 5: Query reporting period energy input by category
    # Step 6: Query base period energy cost by category
    # Step 7: Query reporting period energy cost by category
    # Step 8: Query carbon emissions data
    # Step 9: Query time-of-use data (for electricity)
    # Step 10: Query monthly trends (energy & cost)
    # Step 11: Query tenant statistics (meters, sensors, alerts)
    # Step 12: Query top consuming tenants
    # Step 13: Query real-time sensor data
    # Step 14: Construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        user_uuid = req.params.get('useruuid')
        period_type = req.params.get('periodtype', 'monthly')
        base_period_start_datetime_local = req.params.get('baseperiodstartdatetime')
        base_period_end_datetime_local = req.params.get('baseperiodenddatetime')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language', 'zh_CN')

        ################################################################################################################
        # Step 1: Validate parameters
        ################################################################################################################
        if user_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_UUID')
        else:
            user_uuid = str.strip(user_uuid)
            if len(user_uuid) != 36:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_USER_UUID')

        if period_type is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PERIOD_TYPE')
        else:
            period_type = str.strip(period_type)
            if period_type not in ['hourly', 'daily', 'weekly', 'monthly', 'yearly']:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PERIOD_TYPE')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        base_start_datetime_utc = None
        if base_period_start_datetime_local is not None and len(str.strip(base_period_start_datetime_local)) > 0:
            base_period_start_datetime_local = str.strip(base_period_start_datetime_local)
            try:
                base_start_datetime_utc = datetime.strptime(base_period_start_datetime_local, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_BASE_PERIOD_START_DATETIME")
            base_start_datetime_utc = \
                base_start_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
            if config.minutes_to_count == 30 and base_start_datetime_utc.minute >= 30:
                base_start_datetime_utc = base_start_datetime_utc.replace(minute=30, second=0, microsecond=0)
            else:
                base_start_datetime_utc = base_start_datetime_utc.replace(minute=0, second=0, microsecond=0)

        base_end_datetime_utc = None
        if base_period_end_datetime_local is not None and len(str.strip(base_period_end_datetime_local)) > 0:
            base_period_end_datetime_local = str.strip(base_period_end_datetime_local)
            try:
                base_end_datetime_utc = datetime.strptime(base_period_end_datetime_local, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_BASE_PERIOD_END_DATETIME")
            base_end_datetime_utc = \
                base_end_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)

        if base_start_datetime_utc is not None and base_end_datetime_utc is not None and \
                base_start_datetime_utc >= base_end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BASE_PERIOD_END_DATETIME')

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
                                                               '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                             timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPORTING_PERIOD_END_DATETIME')

        ############################################################################################################
        # Redis cache
        ############################################################################################################
        cache_key = None
        cache_expire = 1800
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

                base_end_datetime_utc_normalized = None
                if base_end_datetime_utc is not None:
                    base_end_datetime_utc_normalized = base_end_datetime_utc.replace(minute=0, second=0, microsecond=0)

                reporting_end_datetime_utc_normalized = None
                if reporting_end_datetime_utc is not None:
                    reporting_end_datetime_utc_normalized = reporting_end_datetime_utc.replace(
                        minute=0, second=0, microsecond=0)

                cache_params = {
                    "useruuid": user_uuid,
                    "periodtype": period_type,
                    "base_start_datetime_utc": base_start_datetime_utc.isoformat() if base_start_datetime_utc else None,
                    "base_end_datetime_utc": base_end_datetime_utc_normalized.isoformat()
                    if base_end_datetime_utc_normalized else None,
                    "reporting_start_datetime_utc": reporting_start_datetime_utc.isoformat()
                    if reporting_start_datetime_utc else None,
                    "reporting_end_datetime_utc": reporting_end_datetime_utc_normalized.isoformat()
                    if reporting_end_datetime_utc_normalized else None,
                    "language": language,
                }
                cache_params_json = json.dumps(cache_params, sort_keys=True)
                cache_key = 'report:tenantdashboard:' + hashlib.sha256(cache_params_json.encode('utf-8')).hexdigest()

                cached_result = redis_client.get(cache_key)
                if cached_result:
                    resp.text = cached_result
                    return
            except Exception:
                redis_client = None

        trans = utilities.get_translation(language)
        trans.install()
        _ = trans.gettext

        ################################################################################################################
        # Step 2: Query user and get associated tenants
        ################################################################################################################
        cnx_user = None
        cnx_system = None
        cnx_energy = None
        cnx_billing = None
        cnx_carbon = None
        cnx_historical = None

        try:
            cnx_user = mysql.connector.connect(**config.myems_user_db)
            cnx_system = mysql.connector.connect(**config.myems_system_db)
            cnx_energy = mysql.connector.connect(**config.myems_energy_db)
            cnx_billing = mysql.connector.connect(**config.myems_billing_db)
            cnx_carbon = mysql.connector.connect(**config.myems_carbon_db)
            cnx_historical = mysql.connector.connect(**config.myems_historical_db)

            cursor_user = cnx_user.cursor()
            cursor_system = cnx_system.cursor()
            cursor_energy = cnx_energy.cursor()
            cursor_billing = cnx_billing.cursor()
            cursor_carbon = cnx_carbon.cursor()
            cursor_historical = cnx_historical.cursor()

            cursor_user.execute(" SELECT id, is_admin, privilege_id FROM tbl_users WHERE uuid = %s ", (user_uuid,))
            row_user = cursor_user.fetchone()
            if row_user is None:
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.USER_NOT_FOUND')

            user = {'id': row_user[0], 'is_admin': row_user[1], 'privilege_id': row_user[2]}

            # Get tenant list based on user privileges
            tenant_list = []
            if user['is_admin']:
                cursor_system.execute(" SELECT t.id, t.name, t.area, t.tenant_type_id, tt.name as tenant_type_name "
                                      " FROM tbl_tenants t "
                                      " LEFT JOIN tbl_tenant_types tt ON t.tenant_type_id = tt.id "
                                      " ORDER BY t.id ")
                rows_tenants = cursor_system.fetchall()
                if rows_tenants:
                    for row in rows_tenants:
                        tenant_list.append({
                            'id': row[0],
                            'name': row[1],
                            'area': row[2],
                            'tenant_type_id': row[3],
                            'tenant_type_name': row[4] if row[4] else ''
                        })
            else:
                cursor_user.execute(" SELECT data FROM tbl_privileges WHERE id = %s ", (user['privilege_id'],))
                row_privilege = cursor_user.fetchone()
                if row_privilege is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.USER_PRIVILEGE_NOT_FOUND')

                privilege_data = json.loads(row_privilege[0])
                if 'tenants' in privilege_data and privilege_data['tenants']:
                    tenant_ids_list = privilege_data['tenants']
                    format_strings = ','.join(['%s'] * len(tenant_ids_list))
                    cursor_system.execute(
                        " SELECT t.id, t.name, t.area, t.tenant_type_id, tt.name as tenant_type_name "
                        " FROM tbl_tenants t "
                        " LEFT JOIN tbl_tenant_types tt ON t.tenant_type_id = tt.id "
                        " WHERE t.id IN (%s) ORDER BY t.id " % format_strings,
                        tuple(tenant_ids_list)
                    )
                    rows_tenants = cursor_system.fetchall()
                    if rows_tenants:
                        for row in rows_tenants:
                            tenant_list.append({
                                'id': row[0],
                                'name': row[1],
                                'area': row[2],
                                'tenant_type_id': row[3],
                                'tenant_type_name': row[4] if row[4] else ''
                            })

            if not tenant_list:
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.TENANT_NOT_FOUND')

            total_tenants = len(tenant_list)
            total_area = sum([float(tenant['area']) for tenant in tenant_list])
            tenant_ids_list = [tenant['id'] for tenant in tenant_list]
            tenant_ids_tuple = tuple(tenant_ids_list)

            ################################################################################################################
            # Step 3: Query energy categories
            ################################################################################################################
            cursor_system.execute(" SELECT id, name, unit_of_measure, kgce, kgco2e "
                                  " FROM tbl_energy_categories ORDER BY id ")
            rows_energy_categories = cursor_system.fetchall()
            energy_category_dict = {}
            if rows_energy_categories:
                for row in rows_energy_categories:
                    energy_category_dict[row[0]] = {
                        'name': row[1],
                        'unit_of_measure': row[2],
                        'kgce': float(row[3]),
                        'kgco2e': float(row[4])
                    }

            ################################################################################################################
            # Step 4: Query base period energy input by category
            ################################################################################################################
            base_input = {
                'names': [],
                'units': [],
                'subtotals': [],
                'subtotals_in_kgce': [],
                'subtotals_in_kgco2e': [],
                'subtotals_per_unit_area': [],
                'increment_rates': [],
                'toppeaks': [],
                'onpeaks': [],
                'midpeaks': [],
                'offpeaks': [],
                'deeps': [],
                'timestamps': [],
                'values': [],
                'energy_category_ids': []
            }

            if base_start_datetime_utc and base_end_datetime_utc:
                format_strings = ','.join(['%s'] * len(tenant_ids_list))
                cursor_energy.execute(
                    " SELECT energy_category_id, SUM(actual_value) "
                    " FROM tbl_tenant_input_category_hourly "
                    " WHERE tenant_id IN (%s) "
                    "   AND start_datetime_utc >= %%s "
                    "   AND start_datetime_utc < %%s "
                    " GROUP BY energy_category_id " % format_strings,
                    tenant_ids_tuple + (base_start_datetime_utc, base_end_datetime_utc)
                )
                rows_base_input = cursor_energy.fetchall()

                if rows_base_input:
                    for row in rows_base_input:
                        ec_id = row[0]
                        subtotal = float(row[1]) if row[1] is not None else 0.0
                        if ec_id in energy_category_dict:
                            ec_info = energy_category_dict[ec_id]
                            base_input['names'].append(ec_info['name'])
                            base_input['units'].append(ec_info['unit_of_measure'])
                            base_input['subtotals'].append(subtotal)
                            base_input['subtotals_in_kgce'].append(subtotal * ec_info['kgce'])
                            base_input['subtotals_in_kgco2e'].append(subtotal * ec_info['kgco2e'])
                            base_input['subtotals_per_unit_area'].append(
                                subtotal / total_area if total_area > 0 else 0.0)
                            base_input['energy_category_ids'].append(ec_id)

            ################################################################################################################
            # Step 5: Query reporting period energy input by category
            ################################################################################################################
            reporting_input = {
                'names': [],
                'units': [],
                'subtotals': [],
                'subtotals_in_kgce': [],
                'subtotals_in_kgco2e': [],
                'subtotals_per_unit_area': [],
                'increment_rates': [],
                'toppeaks': [],
                'onpeaks': [],
                'midpeaks': [],
                'offpeaks': [],
                'deeps': [],
                'timestamps': [],
                'values': [],
                'energy_category_ids': []
            }

            format_strings = ','.join(['%s'] * len(tenant_ids_list))
            cursor_energy.execute(
                " SELECT energy_category_id, SUM(actual_value) "
                " FROM tbl_tenant_input_category_hourly "
                " WHERE tenant_id IN (%s) "
                "   AND start_datetime_utc >= %%s "
                "   AND start_datetime_utc < %%s "
                " GROUP BY energy_category_id " % format_strings,
                tenant_ids_tuple + (reporting_start_datetime_utc, reporting_end_datetime_utc)
            )
            rows_reporting_input = cursor_energy.fetchall()

            if rows_reporting_input:
                for row in rows_reporting_input:
                    ec_id = row[0]
                    subtotal = float(row[1]) if row[1] is not None else 0.0
                    if ec_id in energy_category_dict:
                        ec_info = energy_category_dict[ec_id]
                        reporting_input['names'].append(ec_info['name'])
                        reporting_input['units'].append(ec_info['unit_of_measure'])
                        reporting_input['subtotals'].append(subtotal)
                        reporting_input['subtotals_in_kgce'].append(subtotal * ec_info['kgce'])
                        reporting_input['subtotals_in_kgco2e'].append(subtotal * ec_info['kgco2e'])
                        reporting_input['subtotals_per_unit_area'].append(
                            subtotal / total_area if total_area > 0 else 0.0)
                        reporting_input['energy_category_ids'].append(ec_id)

            # Calculate increment rates
            for i in range(len(reporting_input['names'])):
                name = reporting_input['names'][i]
                if name in base_input['names']:
                    base_idx = base_input['names'].index(name)
                    base_val = base_input['subtotals'][base_idx]
                    report_val = reporting_input['subtotals'][i]
                    if base_val > 0:
                        increment_rate = (report_val - base_val) / base_val
                    else:
                        increment_rate = 0.0
                    reporting_input['increment_rates'].append(increment_rate)
                else:
                    reporting_input['increment_rates'].append(0.0)

            # Calculate totals
            total_in_kgce = sum(reporting_input['subtotals_in_kgce'])
            total_in_kgco2e = sum(reporting_input['subtotals_in_kgco2e'])
            reporting_input['total_in_kgce'] = total_in_kgce
            reporting_input['total_in_kgco2e'] = total_in_kgco2e
            reporting_input['total_in_kgce_per_unit_area'] = total_in_kgce / total_area if total_area > 0 else 0.0
            reporting_input['total_in_kgco2e_per_unit_area'] = total_in_kgco2e / total_area if total_area > 0 else 0.0

            # Overall increment rates
            base_total_kgce = sum(base_input['subtotals_in_kgce'])
            base_total_kgco2e = sum(base_input['subtotals_in_kgco2e'])
            reporting_input['increment_rate_in_kgce'] = (
                (total_in_kgce - base_total_kgce) / base_total_kgce if base_total_kgce > 0 else 0.0)
            reporting_input['increment_rate_in_kgco2e'] = (
                (total_in_kgco2e - base_total_kgco2e) / base_total_kgco2e if base_total_kgco2e > 0 else 0.0)

            ################################################################################################################
            # Step 6 & 7: Query energy cost data
            ################################################################################################################
            reporting_cost = {
                'names': list(reporting_input['names']),
                'units': ['CNY'] * len(reporting_input['names']),
                'subtotals': [0.0] * len(reporting_input['names']),
                'subtotals_per_unit_area': [0.0] * len(reporting_input['names']),
                'increment_rates': list(reporting_input['increment_rates']),
                'timestamps': [],
                'values': []
            }

            # Query billing data
            format_strings = ','.join(['%s'] * len(tenant_ids_list))
            cursor_billing.execute(
                " SELECT energy_category_id, SUM(actual_value) "
                " FROM tbl_tenant_input_category_hourly "
                " WHERE tenant_id IN (%s) "
                "   AND start_datetime_utc >= %%s "
                "   AND start_datetime_utc < %%s "
                " GROUP BY energy_category_id " % format_strings,
                tenant_ids_tuple + (reporting_start_datetime_utc, reporting_end_datetime_utc)
            )
            rows_billing = cursor_billing.fetchall()

            if rows_billing:
                for row in rows_billing:
                    ec_id = row[0]
                    cost = float(row[1]) if row[1] is not None else 0.0
                    if ec_id in energy_category_dict:
                        ec_name = energy_category_dict[ec_id]['name']
                        if ec_name in reporting_cost['names']:
                            idx = reporting_cost['names'].index(ec_name)
                            reporting_cost['subtotals'][idx] = cost
                            reporting_cost['subtotals_per_unit_area'][idx] = (
                                cost / total_area if total_area > 0 else 0.0)

            ################################################################################################################
            # Step 8: Query monthly trends
            ################################################################################################################
            monthly_timestamps = []
            monthly_energy_values = [[] for _ in range(len(reporting_input['names']))]
            monthly_cost_values = [[] for _ in range(len(reporting_cost['names']))]

            # Generate monthly timestamps for current year
            year_start = reporting_start_datetime_utc.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            current_month = year_start
            while current_month < reporting_end_datetime_utc:
                next_month = current_month.replace(month=current_month.month + 1) if current_month.month < 12 \
                    else current_month.replace(year=current_month.year + 1, month=1)

                monthly_timestamps.append(current_month.strftime('%Y-%m'))

                # Query energy for this month
                for idx, ec_id in enumerate(reporting_input['energy_category_ids']):
                    format_strings = ','.join(['%s'] * len(tenant_ids_list))
                    cursor_energy.execute(
                        " SELECT SUM(actual_value) "
                        " FROM tbl_tenant_input_category_hourly "
                        " WHERE tenant_id IN (%s) "
                        "   AND energy_category_id = %%s "
                        "   AND start_datetime_utc >= %%s "
                        "   AND start_datetime_utc < %%s " % format_strings,
                        tenant_ids_tuple + (ec_id, current_month, next_month)
                    )
                    row = cursor_energy.fetchone()
                    monthly_energy_values[idx].append(float(row[0]) if row and row[0] else 0.0)

                # Query cost for this month
                for idx, ec_id in enumerate(reporting_input['energy_category_ids']):
                    format_strings = ','.join(['%s'] * len(tenant_ids_list))
                    cursor_billing.execute(
                        " SELECT SUM(actual_value) "
                        " FROM tbl_tenant_input_category_hourly "
                        " WHERE tenant_id IN (%s) "
                        "     AND energy_category_id = %%s "
                        "     AND start_datetime_utc >= %%s "
                        "     AND start_datetime_utc < %%s " % format_strings,
                        tenant_ids_tuple + (ec_id, current_month, next_month)
                    )
                    row = cursor_billing.fetchone()
                    monthly_cost_values[idx].append(float(row[0]) if row and row[0] else 0.0)

                current_month = next_month

            reporting_input['timestamps'] = [monthly_timestamps] * len(reporting_input['names'])
            reporting_input['values'] = monthly_energy_values
            reporting_cost['timestamps'] = [monthly_timestamps] * len(reporting_cost['names'])
            reporting_cost['values'] = monthly_cost_values

            ################################################################################################################
            # Step 9: Query tenant statistics
            ################################################################################################################
            # Count meters
            format_strings = ','.join(['%s'] * len(tenant_ids_list))
            cursor_system.execute(
                " SELECT COUNT(DISTINCT meter_id) "
                " FROM tbl_tenants_meters "
                " WHERE tenant_id IN (%s) " % format_strings,
                tenant_ids_tuple
            )
            row = cursor_system.fetchone()
            total_meters = int(row[0]) if row and row[0] else 0

            # Count sensors
            format_strings = ','.join(['%s'] * len(tenant_ids_list))
            cursor_system.execute(
                " SELECT COUNT(DISTINCT sensor_id) "
                " FROM tbl_tenants_sensors "
                " WHERE tenant_id IN (%s) " % format_strings,
                tenant_ids_tuple
            )
            row = cursor_system.fetchone()
            total_sensors = int(row[0]) if row and row[0] else 0

            # Count active alerts (from FDD system)
            total_alerts = 0
            cnx_fdd = None
            cursor_fdd = None
            try:
                cnx_fdd = mysql.connector.connect(**config.myems_fdd_db)
                cursor_fdd = cnx_fdd.cursor()
                format_strings = ','.join(['%s'] * len(tenant_ids_list))
                cursor_fdd.execute(
                    " SELECT COUNT(*) "
                    " FROM tbl_faults "
                    " WHERE tenant_id IN (%s) "
                    "   AND status = 'active' " % format_strings,
                    tenant_ids_tuple
                )
                row = cursor_fdd.fetchone()
                total_alerts = int(row[0]) if row and row[0] else 0
            except:
                total_alerts = 0
            finally:
                if cursor_fdd:
                    cursor_fdd.close()
                if cnx_fdd:
                    cnx_fdd.close()

            ################################################################################################################
            # Step 10: Query top 5 consuming tenants
            ################################################################################################################
            top_tenants = []
            # First get tenant names
            tenant_name_dict = {}
            format_strings = ','.join(['%s'] * len(tenant_ids_list))
            cursor_system.execute(
                " SELECT id, name FROM tbl_tenants WHERE id IN (%s) " % format_strings,
                tenant_ids_tuple
            )
            rows_tenants_names = cursor_system.fetchall()
            if rows_tenants_names:
                for row in rows_tenants_names:
                    tenant_name_dict[row[0]] = row[1]

            # Then query energy consumption from energy database
            format_strings = ','.join(['%s'] * len(tenant_ids_list))
            cursor_energy.execute(
                " SELECT tenant_id, SUM(actual_value) as total_energy "
                " FROM tbl_tenant_input_category_hourly "
                " WHERE tenant_id IN (%s) "
                "   AND start_datetime_utc >= %%s "
                "   AND start_datetime_utc < %%s "
                " GROUP BY tenant_id "
                " ORDER BY total_energy DESC LIMIT 5 " % format_strings,
                tenant_ids_tuple + (reporting_start_datetime_utc, reporting_end_datetime_utc)
            )
            rows_top = cursor_energy.fetchall()
            if rows_top:
                for row in rows_top:
                    tenant_id = row[0]
                    tenant_name = tenant_name_dict.get(tenant_id, f'Tenant #{tenant_id}')
                    top_tenants.append({
                        'id': tenant_id,
                        'name': tenant_name,
                        'total_energy': float(row[1]) if row[1] else 0.0
                    })

            ################################################################################################################
            # Step 11: Construct the report
            ################################################################################################################
            
            # Prepare tenant details for response
            tenant_details = []
            for tenant in tenant_list:
                tenant_details.append({
                    'id': tenant['id'],
                    'name': tenant['name'],
                    'area': float(tenant['area']) if tenant['area'] else 0.0,
                    'tenant_type': tenant['tenant_type_name'],
                })
            
            result = {
                'summary': {
                    'total_tenants': total_tenants,
                    'total_area': float(total_area),
                    'total_meters': total_meters,
                    'total_sensors': total_sensors,
                    'total_alerts': total_alerts,
                },
                'tenants': tenant_details,
                'reporting_period_input': reporting_input,
                'base_period_input': base_input,
                'reporting_period_cost': reporting_cost,
                'top_tenants': top_tenants,
                'period_type': period_type,
                'reporting_period_start': reporting_start_datetime_utc.isoformat(),
                'reporting_period_end': reporting_end_datetime_utc.isoformat(),
            }
            #print(result)
            resp.text = json.dumps(result)

            # Cache the result
            if redis_client and cache_key:
                try:
                    redis_client.setex(cache_key, cache_expire, json.dumps(result))
                except:
                    pass

        except Exception as e:
            logger.error(f"Error in tenant dashboard: {str(e)}")
            raise
        finally:
            if cursor_user:
                cursor_user.close()
            if cursor_system:
                cursor_system.close()
            if cursor_energy:
                cursor_energy.close()
            if cursor_billing:
                cursor_billing.close()
            if cursor_carbon:
                cursor_carbon.close()
            if cursor_historical:
                cursor_historical.close()
            if cnx_user:
                cnx_user.close()
            if cnx_system:
                cnx_system.close()
            if cnx_energy:
                cnx_energy.close()
            if cnx_billing:
                cnx_billing.close()
            if cnx_carbon:
                cnx_carbon.close()
            if cnx_historical:
                cnx_historical.close()
