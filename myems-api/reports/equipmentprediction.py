"""
Equipment Prediction Report API

This module provides REST API endpoints for generating equipment prediction reports.
It analyzes prediction data by different energy categories for equipment,
providing insights into energy usage patterns and category-specific optimizations.

Key Features:
- Equipment prediction energy consumption by category analysis
- Base period vs reporting period comparison
- Energy category breakdown and trends
- Excel export functionality

The module uses Falcon framework for REST API
"""

import re
import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.equipmentenergycategory
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
    # Step 2: query the equipment
    # Step 3: query energy categories
    # Step 4: query associated points
    # Step 5: query base period energy input (PREDICTION)
    # Step 6: query reporting period energy input (PREDICTION)
    # Step 7: query tariff data
    # Step 8: query associated points data
    # Step 9: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        # Log request params
        logger.info("Request params: %s", req.params)
        print(req.params)

        equipment_id = req.params.get('equipmentid')
        equipment_uuid = req.params.get('equipmentuuid')
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
        if equipment_id is None and equipment_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUIPMENT_ID')

        if equipment_id is not None:
            equipment_id = str.strip(equipment_id)
            if not equipment_id.isdigit() or int(equipment_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_EQUIPMENT_ID')

        if equipment_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(equipment_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_EQUIPMENT_UUID')

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

        is_quick_mode = False
        if quick_mode is not None and \
                len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

        trans = utilities.get_translation(language)
        trans.install()
        _ = trans.gettext

        ################################################################################################################
        # Step 2: query the equipment
        ################################################################################################################
        cnx_system = None
        cnx_energy_prediction = None
        cnx_historical = None
        try:
            cnx_system = mysql.connector.connect(**config.myems_system_db)
            cnx_energy_prediction = mysql.connector.connect(**config.myems_energy_prediction_db)
            cnx_historical = mysql.connector.connect(**config.myems_historical_db)

            cursor_system = None
            cursor_energy_prediction = None
            cursor_historical = None
            try:
                cursor_system = cnx_system.cursor(dictionary=False)
                cursor_energy_prediction = cnx_energy_prediction.cursor(dictionary=False)
                cursor_historical = cnx_historical.cursor(dictionary=False)

                if equipment_id is not None:
                    cursor_system.execute(" SELECT id, name, cost_center_id "
                                          " FROM tbl_equipments "
                                          " WHERE id = %s ", (equipment_id,))
                else:
                    cursor_system.execute(" SELECT id, name, cost_center_id "
                                          " FROM tbl_equipments "
                                          " WHERE uuid = %s ", (equipment_uuid,))
                row_equipment = cursor_system.fetchone()

                if row_equipment is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.EQUIPMENT_NOT_FOUND')

                equipment = {
                    'id': row_equipment[0],
                    'name': row_equipment[1],
                    'cost_center_id': row_equipment[2]
                }

                #######################################################################################
                # Step 3: query energy categories
                #######################################################################################
                energy_category_set = set()

                cursor_energy_prediction.execute("""
                    SELECT DISTINCT(energy_category_id)
                    FROM tbl_equipment_input_category_hourly
                    WHERE equipment_id = %s
                      AND start_datetime_utc >= %s
                      AND start_datetime_utc < %s
                """, (equipment['id'], base_start_datetime_utc, base_end_datetime_utc))
                rows = cursor_energy_prediction.fetchall()
                for r in rows:
                    energy_category_set.add(r[0])

                cursor_energy_prediction.execute("""
                    SELECT DISTINCT(energy_category_id)
                    FROM tbl_equipment_input_category_hourly
                    WHERE equipment_id = %s
                      AND start_datetime_utc >= %s
                      AND start_datetime_utc < %s
                """, (equipment['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
                rows = cursor_energy_prediction.fetchall()
                for r in rows:
                    energy_category_set.add(r[0])

                cursor_system.execute("""
                    SELECT id, name, unit_of_measure, kgce, kgco2e
                    FROM tbl_energy_categories
                    ORDER BY id
                """)
                rows_energy_categories = cursor_system.fetchall()
                if not rows_energy_categories:
                    raise falcon.HTTPError(falcon.HTTP_404, 'API.NOT_FOUND', 'API.ENERGY_CATEGORY_NOT_FOUND')

                energy_category_dict = {}
                for r in rows_energy_categories:
                    if r[0] in energy_category_set:
                        energy_category_dict[r[0]] = {
                            'name': r[1],
                            'unit_of_measure': r[2],
                            'kgce': r[3],
                            'kgco2e': r[4]
                        }

                #####################################################################################
                # Step 4: query associated points
                #####################################################################################
                point_list = []
                cursor_system.execute("""
                    SELECT p.id, ep.name, p.units, p.object_type
                    FROM tbl_equipments e
                    JOIN tbl_equipments_parameters ep ON e.id = ep.equipment_id
                    JOIN tbl_points p ON ep.point_id = p.id
                    WHERE e.id = %s
                      AND ep.parameter_type = 'point'
                    ORDER BY p.id
                """, (equipment['id'],))
                rows_points = cursor_system.fetchall()
                for r in rows_points:
                    point_list.append({
                        'id': r[0],
                        'name': r[1],
                        'units': r[2],
                        'object_type': r[3]
                    })

                ###################################################################################
                # Step 5: base period prediction
                ###################################################################################
                base = {}
                for ecid in energy_category_set:
                    cfg = energy_category_dict[ecid]
                    kgce = cfg['kgce']
                    kgco2e = cfg['kgco2e']

                    base[ecid] = {
                        'timestamps': [],
                        'values': [],
                        'subtotal': Decimal(0),
                        'subtotal_in_kgce': Decimal(0),
                        'subtotal_in_kgco2e': Decimal(0)
                    }

                    cursor_energy_prediction.execute("""
                        SELECT start_datetime_utc, actual_value
                        FROM tbl_equipment_input_category_hourly
                        WHERE equipment_id = %s
                          AND energy_category_id = %s
                          AND start_datetime_utc >= %s
                          AND start_datetime_utc < %s
                        ORDER BY start_datetime_utc
                    """, (equipment['id'], ecid, base_start_datetime_utc, base_end_datetime_utc))
                    rows_hourly = cursor_energy_prediction.fetchall()

                    rows_periodic = utilities.aggregate_hourly_data_by_period(
                        rows_hourly, base_start_datetime_utc, base_end_datetime_utc, period_type)

                    for ts, val in rows_periodic:
                        local_ts = ts.replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                        if period_type == 'hourly':
                            dt_str = local_ts.isoformat()[:19]
                        elif period_type in ('daily', 'weekly'):
                            dt_str = local_ts.isoformat()[:10]
                        elif period_type == 'monthly':
                            dt_str = local_ts.isoformat()[:7]
                        elif period_type == 'yearly':
                            dt_str = local_ts.isoformat()[:4]
                        else:
                            dt_str = ''

                        val = Decimal(val or 0)
                        base[ecid]['timestamps'].append(dt_str)
                        base[ecid]['values'].append(val)
                        base[ecid]['subtotal'] += val
                        base[ecid]['subtotal_in_kgce'] += val * kgce
                        base[ecid]['subtotal_in_kgco2e'] += val * kgco2e

                ######################################################################################
                # Step 6: reporting period prediction
                ######################################################################################
                reporting = {}
                for ecid in energy_category_set:
                    cfg = energy_category_dict[ecid]
                    kgce = cfg['kgce']
                    kgco2e = cfg['kgco2e']

                    reporting[ecid] = {
                        'timestamps': [],
                        'values': [],
                        'subtotal': Decimal(0),
                        'subtotal_in_kgce': Decimal(0),
                        'subtotal_in_kgco2e': Decimal(0),
                        'toppeak': Decimal(0),
                        'onpeak': Decimal(0),
                        'midpeak': Decimal(0),
                        'offpeak': Decimal(0),
                        'deep': Decimal(0)
                    }

                    cursor_energy_prediction.execute("""
                        SELECT start_datetime_utc, actual_value
                        FROM tbl_equipment_input_category_hourly
                        WHERE equipment_id = %s
                          AND energy_category_id = %s
                          AND start_datetime_utc >= %s
                          AND start_datetime_utc < %s
                        ORDER BY start_datetime_utc
                    """, (equipment['id'], ecid, reporting_start_datetime_utc, reporting_end_datetime_utc))
                    rows_hourly = cursor_energy_prediction.fetchall()

                    rows_periodic = utilities.aggregate_hourly_data_by_period(
                        rows_hourly, reporting_start_datetime_utc, reporting_end_datetime_utc, period_type)

                    for ts, val in rows_periodic:
                        local_ts = ts.replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                        if period_type == 'hourly':
                            dt_str = local_ts.isoformat()[:19]
                        elif period_type in ('daily', 'weekly'):
                            dt_str = local_ts.isoformat()[:10]
                        elif period_type == 'monthly':
                            dt_str = local_ts.isoformat()[:7]
                        elif period_type == 'yearly':
                            dt_str = local_ts.isoformat()[:4]
                        else:
                            dt_str = ''

                        val = Decimal(val or 0)
                        reporting[ecid]['timestamps'].append(dt_str)
                        reporting[ecid]['values'].append(val)
                        reporting[ecid]['subtotal'] += val
                        reporting[ecid]['subtotal_in_kgce'] += val * kgce
                        reporting[ecid]['subtotal_in_kgco2e'] += val * kgco2e

                    # Peak types
                    peak_dict = utilities.get_energy_category_peak_types(
                        equipment['cost_center_id'], ecid,
                        reporting_start_datetime_utc, reporting_end_datetime_utc)
                    for ts, val in rows_hourly:
                        if val is None:
                            continue
                        peak = peak_dict.get(ts)
                        val = Decimal(val)
                        if peak == 'toppeak':
                            reporting[ecid]['toppeak'] += val
                        elif peak == 'onpeak':
                            reporting[ecid]['onpeak'] += val
                        elif peak == 'midpeak':
                            reporting[ecid]['midpeak'] += val
                        elif peak == 'offpeak':
                            reporting[ecid]['offpeak'] += val
                        elif peak == 'deep':
                            reporting[ecid]['deep'] += val

                ###################################################################################
                # Step 7: tariff data
                ###################################################################################
                params = {'names': [], 'timestamps': [], 'values': []}
                if not is_quick_mode and config.is_tariff_appended:
                    for ecid in energy_category_set:
                        tariff_dict = utilities.get_energy_category_tariffs(
                            equipment['cost_center_id'], ecid,
                            reporting_start_datetime_utc, reporting_end_datetime_utc)
                        ts_list = []
                        val_list = []
                        for utc_ts, tv in tariff_dict.items():
                            local = utc_ts + timedelta(minutes=timezone_offset)
                            ts_list.append(local.isoformat()[:19])
                            val_list.append(tv)
                        params['names'].append(_('Tariff') + '-' + energy_category_dict[ecid]['name'])
                        params['timestamps'].append(ts_list)
                        params['values'].append(val_list)

                ######################################################################################
                # Step 8: associated points data
                ######################################################################################
                if not is_quick_mode:
                    for p in point_list:
                        ts_list = []
                        val_list = []
                        query = None
                        if p['object_type'] == 'ENERGY_VALUE':
                            query = """
                                SELECT utc_date_time, actual_value FROM tbl_energy_value
                                WHERE point_id = %s AND utc_date_time BETWEEN %s AND %s ORDER BY utc_date_time
                            """
                        elif p['object_type'] == 'ANALOG_VALUE':
                            query = """
                                SELECT utc_date_time, actual_value FROM tbl_analog_value
                                WHERE point_id = %s AND utc_date_time BETWEEN %s AND %s ORDER BY utc_date_time
                            """
                        elif p['object_type'] == 'DIGITAL_VALUE':
                            query = """
                                SELECT utc_date_time, actual_value FROM tbl_digital_value
                                WHERE point_id = %s AND utc_date_time BETWEEN %s AND %s ORDER BY utc_date_time
                            """
                        if query:
                            cursor_historical.execute(query, (p['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
                            rows = cursor_historical.fetchall()
                            for utc_ts, val in rows:
                                local = utc_ts.replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                                ts_list.append(local.isoformat()[:19])
                                val_list.append(val)
                        params['names'].append(f"{p['name']} ({p['units']})")
                        params['timestamps'].append(ts_list)
                        params['values'].append(val_list)

            finally:
                if cursor_system:
                    cursor_system.close()
                if cursor_energy_prediction:
                    cursor_energy_prediction.close()
                if cursor_historical:
                    cursor_historical.close()

        finally:
            if cnx_system:
                cnx_system.close()
            if cnx_energy_prediction:
                cnx_energy_prediction.close()
            if cnx_historical:
                cnx_historical.close()

        ######################################################################################
        # Step 9: build result
        ######################################################################################
        result = {
            'equipment': {
                'id': equipment['id'],
                'name': equipment['name']
            },
            'base_period': {
                'names': [], 'units': [], 'timestamps': [], 'values': [],
                'subtotals': [], 'subtotals_in_kgce': [], 'subtotals_in_kgco2e': [],
                'total_in_kgce': Decimal(0), 'total_in_kgco2e': Decimal(0)
            },
            'reporting_period': {
                'names': [], 'energy_category_ids': [], 'units': [], 'timestamps': [], 'values': [],
                'rates': [], 'subtotals': [], 'subtotals_in_kgce': [], 'subtotals_in_kgco2e': [],
                'toppeaks': [], 'onpeaks': [], 'midpeaks': [], 'offpeaks': [], 'deeps': [],
                'increment_rates': [],
                'total_in_kgce': Decimal(0), 'total_in_kgco2e': Decimal(0),
                'increment_rate_in_kgce': None, 'increment_rate_in_kgco2e': None
            },
            'parameters': params,
            'excel_bytes_base64': None
        }

        # Base period
        bp = result['base_period']
        for ecid in energy_category_set:
            ec = energy_category_dict[ecid]
            b = base[ecid]
            bp['names'].append(ec['name'])
            bp['units'].append(ec['unit_of_measure'])
            bp['timestamps'].append(b['timestamps'])
            bp['values'].append(b['values'])
            bp['subtotals'].append(b['subtotal'])
            bp['subtotals_in_kgce'].append(b['subtotal_in_kgce'])
            bp['subtotals_in_kgco2e'].append(b['subtotal_in_kgco2e'])
            bp['total_in_kgce'] += b['subtotal_in_kgce']
            bp['total_in_kgco2e'] += b['subtotal_in_kgco2e']

        # Reporting period
        rp = result['reporting_period']
        for ecid in energy_category_set:
            ec = energy_category_dict[ecid]
            r = reporting[ecid]
            b = base[ecid]
            rp['names'].append(ec['name'])
            rp['energy_category_ids'].append(ecid)
            rp['units'].append(ec['unit_of_measure'])
            rp['timestamps'].append(r['timestamps'])
            rp['values'].append(r['values'])
            rp['subtotals'].append(r['subtotal'])
            rp['subtotals_in_kgce'].append(r['subtotal_in_kgce'])
            rp['subtotals_in_kgco2e'].append(r['subtotal_in_kgco2e'])
            rp['toppeaks'].append(r['toppeak'])
            rp['onpeaks'].append(r['onpeak'])
            rp['midpeaks'].append(r['midpeak'])
            rp['offpeaks'].append(r['offpeak'])
            rp['deeps'].append(r['deep'])

            # Increment rate per category
            if b['subtotal'] > 0:
                inc = (r['subtotal'] - b['subtotal']) / b['subtotal']
            else:
                inc = None
            rp['increment_rates'].append(inc)

            rp['total_in_kgce'] += r['subtotal_in_kgce']
            rp['total_in_kgco2e'] += r['subtotal_in_kgco2e']

            # Period-by-period rate
            rate = []
            for i, v in enumerate(r['values']):
                if i < len(b['values']) and b['values'][i] != 0 and v != 0:
                    rate.append((v - b['values'][i]) / b['values'][i])
                else:
                    rate.append(None)
            rp['rates'].append(rate)

        # Total increment rates
        if bp['total_in_kgce'] > 0:
            rp['increment_rate_in_kgce'] = (rp['total_in_kgce'] - bp['total_in_kgce']) / bp['total_in_kgce']
        if bp['total_in_kgco2e'] > 0:
            rp['increment_rate_in_kgco2e'] = (rp['total_in_kgco2e'] - bp['total_in_kgco2e']) / bp['total_in_kgco2e']

        # Excel
        if not is_quick_mode:
            result['excel_bytes_base64'] = excelexporters.equipmentenergycategory.export(
                result, equipment['name'],
                base_period_start_datetime_local, base_period_end_datetime_local,
                reporting_period_start_datetime_local, reporting_period_end_datetime_local,
                period_type, language
            )

        # Final log
        logger.info("Equipment prediction report generated successfully: equipment_id=%s", equipment['id'])
        print(f"Report done: equipment {equipment['id']} ({equipment['name']})")

        resp.text = json.dumps(result, default=str)