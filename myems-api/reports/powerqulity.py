import re
from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.powerqulity
from core import utilities
from core.useractivity import access_control, api_key_control


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
    # Step 2: query the meter and energy category
    # Step 3: query associated points
    # Step 4: query reporting period points trends
    # Step 5: query tariff data
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
        meter_id = req.params.get('meterid')
        meter_uuid = req.params.get('meteruuid')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if meter_id is None and meter_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_METER_ID')

        if meter_id is not None:
            meter_id = str.strip(meter_id)
            if not meter_id.isdigit() or int(meter_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_METER_ID')

        if meter_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(meter_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_METER_UUID')

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

        trans = utilities.get_translation(language)
        trans.install()
        _ = trans.gettext

        ################################################################################################################
        # Step 2: query the meter and energy category
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()
        if meter_id is not None:
            cursor_system.execute(" SELECT m.id, m.name, m.cost_center_id, m.energy_category_id, "
                                  "        ec.name, ec.unit_of_measure, ec.kgce, ec.kgco2e "
                                  " FROM tbl_meters m, tbl_energy_categories ec "
                                  " WHERE m.id = %s AND m.energy_category_id = ec.id ", (meter_id,))
            row_meter = cursor_system.fetchone()
        elif meter_uuid is not None:
            cursor_system.execute(" SELECT m.id, m.name, m.cost_center_id, m.energy_category_id, "
                                  "        ec.name, ec.unit_of_measure, ec.kgce, ec.kgco2e "
                                  " FROM tbl_meters m, tbl_energy_categories ec "
                                  " WHERE m.uuid = %s AND m.energy_category_id = ec.id ", (meter_uuid,))
            row_meter = cursor_system.fetchone()

        if row_meter is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()

            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.METER_NOT_FOUND')
        meter = dict()
        meter['id'] = row_meter[0]
        meter['name'] = row_meter[1]
        meter['cost_center_id'] = row_meter[2]
        meter['energy_category_id'] = row_meter[3]
        meter['energy_category_name'] = row_meter[4]
        meter['unit_of_measure'] = row_meter[5]
        meter['kgce'] = row_meter[6]
        meter['kgco2e'] = row_meter[7]

        ################################################################################################################
        # Step 3: query associated points
        ################################################################################################################
        point_list = list()
        cursor_system.execute(" SELECT p.id, p.name, p.units, p.object_type  "
                              " FROM tbl_meters m, tbl_meters_points mp, tbl_points p "
                              " WHERE m.id = %s AND m.id = mp.meter_id AND mp.point_id = p.id "
                              " ORDER BY p.id ", (meter['id'],))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_list.append({"id": row[0], "name": row[1], "units": row[2], "object_type": row[3]})

        ################################################################################################################
        # Step 4: query reporting period points trends
        ################################################################################################################
        reporting = dict()
        reporting['names'] = list()
        reporting['timestamps'] = list()
        reporting['values'] = list()
        reporting['units'] = list()

        for point in point_list:
            if is_quick_mode and point['object_type'] != 'ENERGY_VALUE':
                continue

            point_value_list = list()
            point_timestamp_list = list()
            if point['object_type'] == 'ENERGY_VALUE':
                query = (" SELECT utc_date_time, actual_value "
                         " FROM tbl_energy_value "
                         " WHERE point_id = %s "
                         "       AND utc_date_time BETWEEN %s AND %s "
                         " ORDER BY utc_date_time ")
                cursor_historical.execute(query, (point['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                rows = cursor_historical.fetchall()

                if rows is not None and len(rows) > 0:
                    for row in rows:
                        current_datetime_local = row[0].replace(tzinfo=timezone.utc) + \
                                                 timedelta(minutes=timezone_offset)
                        current_datetime = current_datetime_local.isoformat()[0:19]
                        point_timestamp_list.append(current_datetime)
                        point_value_list.append(row[1])
            elif point['object_type'] == 'ANALOG_VALUE':
                query = (" SELECT utc_date_time, actual_value "
                         " FROM tbl_analog_value "
                         " WHERE point_id = %s "
                         "       AND utc_date_time BETWEEN %s AND %s "
                         " ORDER BY utc_date_time ")
                cursor_historical.execute(query, (point['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                rows = cursor_historical.fetchall()

                if rows is not None and len(rows) > 0:
                    for row in rows:
                        current_datetime_local = row[0].replace(tzinfo=timezone.utc) + \
                                                 timedelta(minutes=timezone_offset)
                        current_datetime = current_datetime_local.isoformat()[0:19]
                        point_timestamp_list.append(current_datetime)
                        point_value_list.append(row[1])
            elif point['object_type'] == 'DIGITAL_VALUE':
                query = (" SELECT utc_date_time, actual_value "
                         " FROM tbl_digital_value "
                         " WHERE point_id = %s "
                         "       AND utc_date_time BETWEEN %s AND %s "
                         " ORDER BY utc_date_time ")
                cursor_historical.execute(query, (point['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                rows = cursor_historical.fetchall()

                if rows is not None and len(rows) > 0:
                    for row in rows:
                        current_datetime_local = row[0].replace(tzinfo=timezone.utc) + \
                                                 timedelta(minutes=timezone_offset)
                        current_datetime = current_datetime_local.isoformat()[0:19]
                        point_timestamp_list.append(current_datetime)
                        point_value_list.append(row[1])

            reporting['names'].append(point['name'] + ' (' + point['units'] + ')')
            reporting['timestamps'].append(point_timestamp_list)
            reporting['values'].append(point_value_list)
            reporting['units'].append(point['units'])

        ################################################################################################################
        # Step 4.1: analyze power quality by unit (A, V, HZ)
        ################################################################################################################
        def _safe_float_list(values):
            return [float(v) for v in values if v is not None]

        def _calc_basic_stats(values):
            n = len(values)
            if n == 0:
                return None
            vmin = min(values)
            vmax = max(values)
            mean = sum(values) / n
            # population standard deviation
            variance = sum((x - mean) ** 2 for x in values) / n
            std = variance ** 0.5
            # percentiles
            sorted_vals = sorted(values)
            def _percentile(p):
                if n == 1:
                    return sorted_vals[0]
                k = (n - 1) * p
                f = int(k)
                c = f + 1
                if c >= n:
                    return sorted_vals[-1]
                d0 = sorted_vals[f] * (c - k)
                d1 = sorted_vals[c] * (k - f)
                return d0 + d1
            p5 = _percentile(0.05)
            p95 = _percentile(0.95)
            return {
                'count': n,
                'min': vmin,
                'max': vmax,
                'mean': mean,
                'std': std,
                'p5': p5,
                'p95': p95
            }

        analysis = list()
        # helper to get nominal values from config or default
        nominal_voltage = getattr(config, 'nominal_voltage', 220.0)
        nominal_frequency = getattr(config, 'nominal_frequency', 50.0)

        # Collect indices by unit for grouping
        voltage_indices = [i for i, u in enumerate(reporting['units']) if (u or '').upper() == 'V']
        current_indices = [i for i, u in enumerate(reporting['units']) if (u or '').upper() == 'A']
        freq_indices = [i for i, u in enumerate(reporting['units']) if (u or '').upper() in ('HZ', 'HERTZ')]

        # 1) Voltage deviation (GB/T 12325): compute deviation and compliance within ±7% by default
        voltage_deviation_limit_pct = getattr(config, 'voltage_deviation_limit_pct', 7.0)
        for vidx in voltage_indices:
            name = reporting['names'][vidx]
            timestamps = reporting['timestamps'][vidx]
            values = _safe_float_list(reporting['values'][vidx])
            if len(values) == 0 or len(values) != len(timestamps):
                continue
            deviations_pct = []
            worst_abs_dev = -1.0
            worst_time = None
            within = 0
            for i, v in enumerate(values):
                dev_pct = (v - nominal_voltage) / nominal_voltage * 100.0
                deviations_pct.append(dev_pct)
                abs_dev = abs(dev_pct)
                if abs_dev <= voltage_deviation_limit_pct:
                    within += 1
                if abs_dev > worst_abs_dev:
                    worst_abs_dev = abs_dev
                    worst_time = timestamps[i]
            compliance = within / len(values) * 100.0
            stats = _calc_basic_stats(deviations_pct)
            analysis.append({
                'point_name': name,
                'unit': 'V',
                'category': 'voltage',
                'type': 'voltage_deviation',
                'limit_pct': voltage_deviation_limit_pct,
                'compliance_pct': compliance,
                'worst_abs_deviation_pct': worst_abs_dev,
                'worst_time': worst_time,
                'metrics': [
                    {'name': 'mean_deviation_pct', 'value': stats['mean'] if stats else None},
                    {'name': 'p95_abs_deviation_pct', 'value': abs(stats['p95']) if stats else None}
                ]
            })

        # 2) Voltage unbalance (GB/T 15543): if we have 3-phase voltage series, compute unbalance rate
        if len(voltage_indices) >= 3:
            # pick first three
            triplet = voltage_indices[:3]
            ts0 = reporting['timestamps'][triplet[0]]
            ts1 = reporting['timestamps'][triplet[1]]
            ts2 = reporting['timestamps'][triplet[2]]
            v0 = _safe_float_list(reporting['values'][triplet[0]])
            v1 = _safe_float_list(reporting['values'][triplet[1]])
            v2 = _safe_float_list(reporting['values'][triplet[2]])
            if len(v0) and len(v0) == len(v1) == len(v2) and ts0 == ts1 == ts2:
                unbalance_rates = []
                worst = -1.0
                worst_time = None
                for i in range(len(v0)):
                    avg_v = (v0[i] + v1[i] + v2[i]) / 3.0
                    if avg_v <= 0:
                        continue
                    max_dev = max(abs(v0[i] - avg_v), abs(v1[i] - avg_v), abs(v2[i] - avg_v))
                    rate_pct = max_dev / avg_v * 100.0
                    unbalance_rates.append(rate_pct)
                    if rate_pct > worst:
                        worst = rate_pct
                        worst_time = ts0[i]
                limit_pct = getattr(config, 'voltage_unbalance_limit_pct', 2.0)
                within = sum(1 for r in unbalance_rates if r <= limit_pct)
                compliance = (within / len(unbalance_rates) * 100.0) if unbalance_rates else None
                stats = _calc_basic_stats(unbalance_rates) if unbalance_rates else None
                analysis.append({
                    'point_name': 'Three-phase voltage',
                    'unit': 'V',
                    'category': 'voltage',
                    'type': 'voltage_unbalance',
                    'limit_pct': limit_pct,
                    'compliance_pct': compliance,
                    'worst_unbalance_pct': worst,
                    'worst_time': worst_time,
                    'metrics': [
                        {'name': 'mean_unbalance_pct', 'value': stats['mean'] if stats else None},
                        {'name': 'p95_unbalance_pct', 'value': stats['p95'] if stats else None}
                    ]
                })

        # 3) Frequency deviation (GB/T 15945): compliance within ±0.2 Hz; severe > 0.5 Hz
        freq_normal_limit_hz = getattr(config, 'frequency_normal_limit_hz', 0.2)
        freq_severe_limit_hz = getattr(config, 'frequency_severe_limit_hz', 0.5)
        for fidx in freq_indices:
            name = reporting['names'][fidx]
            timestamps = reporting['timestamps'][fidx]
            values = _safe_float_list(reporting['values'][fidx])
            if len(values) == 0 or len(values) != len(timestamps):
                continue
            abs_devs = []
            within = 0
            severe = 0
            worst = -1.0
            worst_time = None
            for i, hz in enumerate(values):
                dev = abs(hz - nominal_frequency)
                abs_devs.append(dev)
                if dev <= freq_normal_limit_hz:
                    within += 1
                if dev > freq_severe_limit_hz:
                    severe += 1
                if dev > worst:
                    worst = dev
                    worst_time = timestamps[i]
            compliance = within / len(values) * 100.0
            stats = _calc_basic_stats(abs_devs)
            analysis.append({
                'point_name': name,
                'unit': 'Hz',
                'category': 'frequency',
                'type': 'frequency_deviation',
                'limit_normal_hz': freq_normal_limit_hz,
                'limit_severe_hz': freq_severe_limit_hz,
                'compliance_pct': compliance,
                'severe_exceed_count': severe,
                'worst_deviation_hz': worst,
                'worst_time': worst_time,
                'metrics': [
                    {'name': 'mean_abs_deviation_hz', 'value': stats['mean'] if stats else None},
                    {'name': 'p95_abs_deviation_hz', 'value': stats['p95'] if stats else None}
                ]
            })

        # 4) Current unbalance (reference similar method): compute 3-phase current unbalance if available
        if len(current_indices) >= 3:
            triplet = current_indices[:3]
            ts0 = reporting['timestamps'][triplet[0]]
            ts1 = reporting['timestamps'][triplet[1]]
            ts2 = reporting['timestamps'][triplet[2]]
            i0 = _safe_float_list(reporting['values'][triplet[0]])
            i1 = _safe_float_list(reporting['values'][triplet[1]])
            i2 = _safe_float_list(reporting['values'][triplet[2]])
            if len(i0) and len(i0) == len(i1) == len(i2) and ts0 == ts1 == ts2:
                unbalance_rates = []
                worst = -1.0
                worst_time = None
                for i in range(len(i0)):
                    avg_i = (i0[i] + i1[i] + i2[i]) / 3.0
                    if avg_i <= 0:
                        continue
                    max_dev = max(abs(i0[i] - avg_i), abs(i1[i] - avg_i), abs(i2[i] - avg_i))
                    rate_pct = max_dev / avg_i * 100.0
                    unbalance_rates.append(rate_pct)
                    if rate_pct > worst:
                        worst = rate_pct
                        worst_time = ts0[i]
                limit_pct = getattr(config, 'current_unbalance_limit_pct', 10.0)
                within = sum(1 for r in unbalance_rates if r <= limit_pct)
                compliance = (within / len(unbalance_rates) * 100.0) if unbalance_rates else None
                stats = _calc_basic_stats(unbalance_rates) if unbalance_rates else None
                analysis.append({
                    'point_name': 'Three-phase current',
                    'unit': 'A',
                    'category': 'current',
                    'type': 'current_unbalance',
                    'limit_pct': limit_pct,
                    'compliance_pct': compliance,
                    'worst_unbalance_pct': worst,
                    'worst_time': worst_time,
                    'metrics': [
                        {'name': 'mean_unbalance_pct', 'value': stats['mean'] if stats else None},
                        {'name': 'p95_unbalance_pct', 'value': stats['p95'] if stats else None}
                    ]
                })
        for idx, name in enumerate(reporting['names']):
            unit = (reporting['units'][idx] or '').upper()
            values = _safe_float_list(reporting['values'][idx])
            if len(values) == 0:
                continue
            stats = _calc_basic_stats(values)
            if stats is None:
                continue
            category = None
            if 'A' == unit:
                category = 'current'
            elif 'V' == unit:
                category = 'voltage'
            elif 'HZ' == unit or 'HERTZ' == unit:
                category = 'frequency'
            # only include targeted categories
            if category is None:
                continue
            analysis.append({
                'point_name': name,
                'unit': reporting['units'][idx],
                'category': category,
                'metrics': [
                    {'name': 'count', 'value': stats['count']},
                    {'name': 'min', 'value': stats['min']},
                    {'name': 'max', 'value': stats['max']},
                    {'name': 'mean', 'value': stats['mean']},
                    {'name': 'std', 'value': stats['std']},
                    {'name': 'p5', 'value': stats['p5']},
                    {'name': 'p95', 'value': stats['p95']}
                ]
            })

        # Step 5 removed: drop tariff/parameters in power quality API

        ################################################################################################################
        # Step 6: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()

        result = {
            "meter": {
                "cost_center_id": meter['cost_center_id'],
                "energy_category_id": meter['energy_category_id'],
                "energy_category_name": meter['energy_category_name'],
                "unit_of_measure": meter['unit_of_measure'],
                "kgce": meter['kgce'],
                "kgco2e": meter['kgco2e'],
            },
            "reporting_period": {
                "names": reporting['names'],
                "timestamps": reporting['timestamps'],
                "values": reporting['values'],
            },
            "parameters": None,
            "analysis": analysis,
            "excel_bytes_base64": None
        }
        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = excelexporters.powerqulity.export(result,
                                                                             meter['name'],
                                                                             reporting_period_start_datetime_local,
                                                                             reporting_period_end_datetime_local,
                                                                             None,
                                                                             language)

        resp.text = json.dumps(result)
