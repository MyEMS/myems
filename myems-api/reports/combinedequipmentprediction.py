"""
Combined Equipment Predictioiin Report API

This module provides REST API endpoints for generating combined equipment Predictioiin reports.
It analyzes energy consumption by different energy categories for combined equipment,
providing insights into energy usage patterns and category-specific optimizations.

Key Features:
- Combined equipment energy consumption by category analysis
- Base period vs reporting period comparison
- Predictioiin breakdown and trends
- Category-specific optimization insights
- Excel export functionality
- Energy mix analysis

Report Components:
- Combined equipment energy consumption by category summary
- Base period comparison data
- Predictioiin breakdown
- Category-specific performance metrics
- Energy mix analysis
- Optimization recommendations by category

The module uses Falcon framework for REST API and includes:
- Database queries for Predictioiin data
- Category-specific calculations
- Energy mix analysis tools
- Excel export via excelexporters
- Multi-language support
- User authentication and authorization
"""

import hashlib
import logging
import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import redis
import simplejson as json
import config
import excelexporters.combinedequipmentprediction
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
    # Step 1: valid parameters
    # Step 2: query the combined equipment
    # Step 3: query energy categories
    # Step 6: query base period energy prediction
    # Step 7: query reporting period energy prediction
    # Step 11: construct the report
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
        combined_equipment_id = req.params.get('combinedequipmentid')
        combined_equipment_uuid = req.params.get('combinedequipmentuuid')
        period_type = req.params.get('periodtype')
        base_period_start_datetime_local = req.params.get('baseperiodstartdatetime')
        base_period_end_datetime_local = req.params.get('baseperiodenddatetime')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if combined_equipment_id is None and combined_equipment_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if combined_equipment_id is not None:
            combined_equipment_id = str.strip(combined_equipment_id)
            if not combined_equipment_id.isdigit() or int(combined_equipment_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if combined_equipment_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(combined_equipment_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_COMBINED_EQUIPMENT_UUID')

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
            # nomalize the start datetime
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
                                                               '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                             timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")

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
                base_end_datetime_utc_normalized = None
                if base_end_datetime_utc is not None:
                    base_end_datetime_utc_normalized = base_end_datetime_utc.replace(minute=0, second=0, microsecond=0)

                reporting_end_datetime_utc_normalized = None
                if reporting_end_datetime_utc is not None:
                    reporting_end_datetime_utc_normalized = reporting_end_datetime_utc.replace(
                        minute=0, second=0, microsecond=0)

                cache_params = {
                    "combinedequipmentid": combined_equipment_id,
                    "combinedequipmentuuid": combined_equipment_uuid,
                    "periodtype": period_type,
                    "base_start_datetime_utc": base_start_datetime_utc.isoformat() if base_start_datetime_utc else None,
                    "base_end_datetime_utc": base_end_datetime_utc_normalized.isoformat()
                    if base_end_datetime_utc_normalized else None,
                    "reporting_start_datetime_utc": reporting_start_datetime_utc.isoformat()
                    if reporting_start_datetime_utc else None,
                    "reporting_end_datetime_utc": reporting_end_datetime_utc_normalized.isoformat()
                    if reporting_end_datetime_utc_normalized else None,
                    "language": language,
                    "quickmode": is_quick_mode,
                }
                cache_params_json = json.dumps(cache_params, sort_keys=True)
                cache_key = 'report:combinedequipmentprediction:' + \
                    hashlib.sha256(cache_params_json.encode('utf-8')).hexdigest()

                cached_result = redis_client.get(cache_key)
                if cached_result:
                    resp.text = cached_result
                    return
            except Exception:
                redis_client = None

        trans = utilities.get_translation(language)
        trans.install()
        _ = trans.gettext

        cnx_system = None
        cursor_system = None
        cnx_energy = None
        cursor_energy = None
        try:
            ############################################################################################################
            # Step 2: query the combined equipment
            ############################################################################################################
            cnx_system = mysql.connector.connect(**config.myems_system_db)
            cursor_system = cnx_system.cursor()

            cnx_energy = mysql.connector.connect(**config.myems_energy_db)
            cursor_energy = cnx_energy.cursor()

            if combined_equipment_id is not None:
                cursor_system.execute(" SELECT id, name, cost_center_id "
                                      " FROM tbl_combined_equipments "
                                      " WHERE id = %s ", (combined_equipment_id,))
                row_combined_equipment = cursor_system.fetchone()
            elif combined_equipment_uuid is not None:
                cursor_system.execute(" SELECT id, name, cost_center_id "
                                      " FROM tbl_combined_equipments "
                                      " WHERE uuid = %s ", (combined_equipment_uuid,))
                row_combined_equipment = cursor_system.fetchone()

            if row_combined_equipment is None:
                raise falcon.HTTPError(status=falcon.HTTP_404,
                                       title='API.NOT_FOUND',
                                       description='API.COMBINED_EQUIPMENT_NOT_FOUND')

            combined_equipment = dict()
            combined_equipment['id'] = row_combined_equipment[0]
            combined_equipment['name'] = row_combined_equipment[1]
            combined_equipment['cost_center_id'] = row_combined_equipment[2]

            ############################################################################################################
            # Step 3: query energy categories
            ############################################################################################################
            energy_category_set = set()
            # query energy categories in base period
            cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                                  " FROM tbl_combined_equipment_input_category_hourly "
                                  " WHERE combined_equipment_id = %s "
                                  "     AND start_datetime_utc >= %s "
                                  "     AND start_datetime_utc < %s ",
                                  (combined_equipment['id'], base_start_datetime_utc, base_end_datetime_utc))
            rows_energy_categories = cursor_energy.fetchall()
            if rows_energy_categories is not None and len(rows_energy_categories) > 0:
                for row_energy_category in rows_energy_categories:
                    energy_category_set.add(row_energy_category[0])

            # query energy categories in reporting period
            cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                                  " FROM tbl_combined_equipment_input_category_hourly "
                                  " WHERE combined_equipment_id = %s "
                                  "     AND start_datetime_utc >= %s "
                                  "     AND start_datetime_utc < %s ",
                                  (combined_equipment['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
            rows_energy_categories = cursor_energy.fetchall()
            if rows_energy_categories is not None and len(rows_energy_categories) > 0:
                for row_energy_category in rows_energy_categories:
                    energy_category_set.add(row_energy_category[0])

            # query all energy categories in base period and reporting period
            cursor_system.execute(" SELECT id, name, unit_of_measure, kgce, kgco2e "
                                  " FROM tbl_energy_categories "
                                  " ORDER BY id ", )
            rows_energy_categories = cursor_system.fetchall()
            if rows_energy_categories is None or len(rows_energy_categories) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_404,
                                       title='API.NOT_FOUND',
                                       description='API.ENERGY_CATEGORY_NOT_FOUND')
            energy_category_dict = dict()
            for row_energy_category in rows_energy_categories:
                if row_energy_category[0] in energy_category_set:
                    energy_category_dict[row_energy_category[0]] = {"name": row_energy_category[1],
                                                                    "unit_of_measure": row_energy_category[2],
                                                                    "kgce": row_energy_category[3],
                                                                    "kgco2e": row_energy_category[4]}

            ############################################################################################################
            # Step 6: query base period energy prediction
            ############################################################################################################
            base = dict()
            if energy_category_set is not None and len(energy_category_set) > 0:
                for energy_category_id in energy_category_set:
                    kgce = energy_category_dict[energy_category_id]['kgce']
                    kgco2e = energy_category_dict[energy_category_id]['kgco2e']

                    base[energy_category_id] = dict()
                    base[energy_category_id]['timestamps'] = list()
                    base[energy_category_id]['values'] = list()
                    base[energy_category_id]['subtotal'] = Decimal(0.0)
                    base[energy_category_id]['subtotal_in_kgce'] = Decimal(0.0)
                    base[energy_category_id]['subtotal_in_kgco2e'] = Decimal(0.0)

                    cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                          " FROM tbl_combined_equipment_input_category_hourly "
                                          " WHERE combined_equipment_id = %s "
                                          "     AND energy_category_id = %s "
                                          "     AND start_datetime_utc >= %s "
                                          "     AND start_datetime_utc < %s "
                                          " ORDER BY start_datetime_utc ",
                                          (combined_equipment['id'],
                                           energy_category_id,
                                           base_start_datetime_utc,
                                           base_end_datetime_utc))
                    rows_combined_equipment_hourly = cursor_energy.fetchall()

                    rows_combined_equipment_periodically = \
                        utilities.aggregate_hourly_data_by_period(rows_combined_equipment_hourly,
                                                                  base_start_datetime_utc,
                                                                  base_end_datetime_utc,
                                                                  period_type)
                    for row_combined_equipment_periodically in rows_combined_equipment_periodically:
                        current_datetime_local = row_combined_equipment_periodically[0].replace(tzinfo=timezone.utc) + \
                                                 timedelta(minutes=timezone_offset)
                        if period_type == 'hourly':
                            current_datetime = current_datetime_local.isoformat()[0:19]
                        elif period_type == 'daily':
                            current_datetime = current_datetime_local.isoformat()[0:10]
                        elif period_type == 'weekly':
                            current_datetime = current_datetime_local.isoformat()[0:10]
                        elif period_type == 'monthly':
                            current_datetime = current_datetime_local.isoformat()[0:7]
                        elif period_type == 'yearly':
                            current_datetime = current_datetime_local.isoformat()[0:4]

                        actual_value = Decimal(0.0) if row_combined_equipment_periodically[1] is None \
                            else row_combined_equipment_periodically[1]
                        base[energy_category_id]['timestamps'].append(current_datetime)
                        base[energy_category_id]['values'].append(actual_value)
                        base[energy_category_id]['subtotal'] += actual_value
                        base[energy_category_id]['subtotal_in_kgce'] += actual_value * kgce
                        base[energy_category_id]['subtotal_in_kgco2e'] += actual_value * kgco2e

            ############################################################################################################
            # Step 7: query reporting period energy prediction
            ############################################################################################################
            reporting = dict()
            if energy_category_set is not None and len(energy_category_set) > 0:
                for energy_category_id in energy_category_set:
                    kgce = energy_category_dict[energy_category_id]['kgce']
                    kgco2e = energy_category_dict[energy_category_id]['kgco2e']

                    reporting[energy_category_id] = dict()
                    reporting[energy_category_id]['timestamps'] = list()
                    reporting[energy_category_id]['values'] = list()
                    reporting[energy_category_id]['subtotal'] = Decimal(0.0)
                    reporting[energy_category_id]['subtotal_in_kgce'] = Decimal(0.0)
                    reporting[energy_category_id]['subtotal_in_kgco2e'] = Decimal(0.0)
                    reporting[energy_category_id]['toppeak'] = Decimal(0.0)
                    reporting[energy_category_id]['onpeak'] = Decimal(0.0)
                    reporting[energy_category_id]['midpeak'] = Decimal(0.0)
                    reporting[energy_category_id]['offpeak'] = Decimal(0.0)
                    reporting[energy_category_id]['deep'] = Decimal(0.0)

                    cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                          " FROM tbl_combined_equipment_input_category_hourly "
                                          " WHERE combined_equipment_id = %s "
                                          "     AND energy_category_id = %s "
                                          "     AND start_datetime_utc >= %s "
                                          "     AND start_datetime_utc < %s "
                                          " ORDER BY start_datetime_utc ",
                                          (combined_equipment['id'],
                                           energy_category_id,
                                           reporting_start_datetime_utc,
                                           reporting_end_datetime_utc))
                    rows_combined_equipment_hourly = cursor_energy.fetchall()

                    rows_combined_equipment_periodically = \
                        utilities.aggregate_hourly_data_by_period(rows_combined_equipment_hourly,
                                                                  reporting_start_datetime_utc,
                                                                  reporting_end_datetime_utc,
                                                                  period_type)
                    for row_combined_equipment_periodically in rows_combined_equipment_periodically:
                        current_datetime_local = row_combined_equipment_periodically[0].replace(tzinfo=timezone.utc) + \
                                                 timedelta(minutes=timezone_offset)
                        if period_type == 'hourly':
                            current_datetime = current_datetime_local.isoformat()[0:19]
                        elif period_type == 'daily':
                            current_datetime = current_datetime_local.isoformat()[0:10]
                        elif period_type == 'weekly':
                            current_datetime = current_datetime_local.isoformat()[0:10]
                        elif period_type == 'monthly':
                            current_datetime = current_datetime_local.isoformat()[0:7]
                        elif period_type == 'yearly':
                            current_datetime = current_datetime_local.isoformat()[0:4]

                        actual_value = Decimal(0.0) if row_combined_equipment_periodically[1] is None \
                            else row_combined_equipment_periodically[1]
                        reporting[energy_category_id]['timestamps'].append(current_datetime)
                        reporting[energy_category_id]['values'].append(actual_value)
                        reporting[energy_category_id]['subtotal'] += actual_value
                        reporting[energy_category_id]['subtotal_in_kgce'] += actual_value * kgce
                        reporting[energy_category_id]['subtotal_in_kgco2e'] += actual_value * kgco2e

                    energy_category_tariff_dict = \
                        utilities.get_energy_category_peak_types(combined_equipment['cost_center_id'],
                                                                 energy_category_id,
                                                                 reporting_start_datetime_utc,
                                                                 reporting_end_datetime_utc)
                    for row in rows_combined_equipment_hourly:
                        peak_type = energy_category_tariff_dict.get(row[0], None)
                        if peak_type == 'toppeak':
                            reporting[energy_category_id]['toppeak'] += row[1]
                        elif peak_type == 'onpeak':
                            reporting[energy_category_id]['onpeak'] += row[1]
                        elif peak_type == 'midpeak':
                            reporting[energy_category_id]['midpeak'] += row[1]
                        elif peak_type == 'offpeak':
                            reporting[energy_category_id]['offpeak'] += row[1]
                        elif peak_type == 'deep':
                            reporting[energy_category_id]['deep'] += row[1]

        finally:
            if cursor_energy is not None:
                try:
                    cursor_energy.close()
                except Exception:
                    pass
            if cnx_energy is not None:
                try:
                    cnx_energy.close()
                except Exception:
                    pass
            if cursor_system is not None:
                try:
                    cursor_system.close()
                except Exception:
                    pass
            if cnx_system is not None:
                try:
                    cnx_system.close()
                except Exception:
                    pass

        ################################################################################################################
        # Step 11: construct the report
        ################################################################################################################
        result = dict()

        result['combined_equipment'] = dict()
        result['combined_equipment']['name'] = combined_equipment['name']
        result['combined_equipment']['id'] = combined_equipment['id']

        result['base_period'] = dict()
        result['base_period']['names'] = list()
        result['base_period']['units'] = list()
        result['base_period']['timestamps'] = list()
        result['base_period']['values'] = list()
        result['base_period']['subtotals'] = list()
        result['base_period']['subtotals_in_kgce'] = list()
        result['base_period']['subtotals_in_kgco2e'] = list()
        result['base_period']['total_in_kgce'] = Decimal(0.0)
        result['base_period']['total_in_kgco2e'] = Decimal(0.0)
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['base_period']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['base_period']['units'].append(energy_category_dict[energy_category_id]['unit_of_measure'])
                result['base_period']['timestamps'].append(base[energy_category_id]['timestamps'])
                result['base_period']['values'].append(base[energy_category_id]['values'])
                result['base_period']['subtotals'].append(base[energy_category_id]['subtotal'])
                result['base_period']['subtotals_in_kgce'].append(base[energy_category_id]['subtotal_in_kgce'])
                result['base_period']['subtotals_in_kgco2e'].append(base[energy_category_id]['subtotal_in_kgco2e'])
                result['base_period']['total_in_kgce'] += base[energy_category_id]['subtotal_in_kgce']
                result['base_period']['total_in_kgco2e'] += base[energy_category_id]['subtotal_in_kgco2e']

        result['reporting_period'] = dict()
        result['reporting_period']['names'] = list()
        result['reporting_period']['energy_category_ids'] = list()
        result['reporting_period']['units'] = list()
        result['reporting_period']['timestamps'] = list()
        result['reporting_period']['values'] = list()
        result['reporting_period']['rates'] = list()
        result['reporting_period']['subtotals'] = list()
        result['reporting_period']['subtotals_in_kgce'] = list()
        result['reporting_period']['subtotals_in_kgco2e'] = list()
        result['reporting_period']['toppeaks'] = list()
        result['reporting_period']['onpeaks'] = list()
        result['reporting_period']['midpeaks'] = list()
        result['reporting_period']['offpeaks'] = list()
        result['reporting_period']['deeps'] = list()
        result['reporting_period']['increment_rates'] = list()
        result['reporting_period']['total_in_kgce'] = Decimal(0.0)
        result['reporting_period']['total_in_kgco2e'] = Decimal(0.0)
        result['reporting_period']['increment_rate_in_kgce'] = Decimal(0.0)
        result['reporting_period']['increment_rate_in_kgco2e'] = Decimal(0.0)

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['reporting_period']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['reporting_period']['energy_category_ids'].append(energy_category_id)
                result['reporting_period']['units'].append(energy_category_dict[energy_category_id]['unit_of_measure'])
                result['reporting_period']['timestamps'].append(reporting[energy_category_id]['timestamps'])
                result['reporting_period']['values'].append(reporting[energy_category_id]['values'])
                result['reporting_period']['subtotals'].append(reporting[energy_category_id]['subtotal'])
                result['reporting_period']['subtotals_in_kgce'].append(
                    reporting[energy_category_id]['subtotal_in_kgce'])
                result['reporting_period']['subtotals_in_kgco2e'].append(
                    reporting[energy_category_id]['subtotal_in_kgco2e'])
                result['reporting_period']['toppeaks'].append(reporting[energy_category_id]['toppeak'])
                result['reporting_period']['onpeaks'].append(reporting[energy_category_id]['onpeak'])
                result['reporting_period']['midpeaks'].append(reporting[energy_category_id]['midpeak'])
                result['reporting_period']['offpeaks'].append(reporting[energy_category_id]['offpeak'])
                result['reporting_period']['deeps'].append(reporting[energy_category_id]['deep'])
                result['reporting_period']['increment_rates'].append(
                    (reporting[energy_category_id]['subtotal'] - base[energy_category_id]['subtotal']) /
                    base[energy_category_id]['subtotal']
                    if base[energy_category_id]['subtotal'] > Decimal(0.0) else None)
                result['reporting_period']['total_in_kgce'] += reporting[energy_category_id]['subtotal_in_kgce']
                result['reporting_period']['total_in_kgco2e'] += reporting[energy_category_id]['subtotal_in_kgco2e']

                rate = list()
                for index, value in enumerate(reporting[energy_category_id]['values']):
                    if index < len(base[energy_category_id]['values']) \
                            and base[energy_category_id]['values'][index] != 0 and value != 0:
                        rate.append((value - base[energy_category_id]['values'][index])
                                    / base[energy_category_id]['values'][index])
                    else:
                        rate.append(None)
                result['reporting_period']['rates'].append(rate)

        result['reporting_period']['increment_rate_in_kgce'] = \
            (result['reporting_period']['total_in_kgce'] - result['base_period']['total_in_kgce']) / \
            result['base_period']['total_in_kgce'] \
            if result['base_period']['total_in_kgce'] > Decimal(0.0) else None

        result['reporting_period']['increment_rate_in_kgco2e'] = \
            (result['reporting_period']['total_in_kgco2e'] - result['base_period']['total_in_kgco2e']) / \
            result['base_period']['total_in_kgco2e'] \
            if result['base_period']['total_in_kgco2e'] > Decimal(0.0) else None

        result['parameters'] = {
            "names": [],
            "timestamps": [],
            "values": []
        }

        result['excel_bytes_base64'] = None
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.combinedequipmentprediction.export(
                    result,
                    combined_equipment['name'],
                    base_period_start_datetime_local,
                    base_period_end_datetime_local,
                    reporting_period_start_datetime_local,
                    reporting_period_end_datetime_local,
                    period_type,
                    language
                )
        resp_text = json.dumps(result)
        resp.text = resp_text

        if config.redis.get('is_enabled') and redis_client is not None and cache_key is not None:
            try:
                redis_client.setex(cache_key, cache_expire, resp_text)
            except Exception:
                logger.warning("Failed to write cache key %s", cache_key, exc_info=True)
