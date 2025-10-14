"""
Meter Sub-meters Balance Report API

This module provides REST API endpoints for generating meter sub-meters balance reports.
It analyzes energy balance between main meters and their sub-meters to identify
discrepancies, losses, and optimization opportunities in the metering system.

Key Features:
- Main meter vs sub-meter balance analysis
- Energy balance verification
- Loss identification and analysis
- Balance discrepancy reporting
- Excel export functionality
- Metering system optimization

Report Components:
- Meter balance summary
- Main meter vs sub-meter comparison
- Energy balance verification
- Loss analysis and identification
- Balance optimization recommendations
- Metering system performance metrics

The module uses Falcon framework for REST API and includes:
- Database queries for balance data
- Balance calculation algorithms
- Loss analysis tools
- Excel export via excelexporters
- Multi-language support
- User authentication and authorization
"""

import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.metersubmetersbalance
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
    # Step 2: query the master meter and energy category
    # Step 3: query associated submeters
    # Step 4: query reporting period master meter energy consumption
    # Step 5: query reporting period submeters energy consumption
    # Step 6: calculate reporting period difference between master meter and submeters
    # Step 7: query submeter values as parameter data
    # Step 8: construct the report
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
        period_type = req.params.get('periodtype')
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

        ################################################################################################################
        # Step 2: query the meter and energy category
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

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

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.close()

            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.METER_NOT_FOUND')

        master_meter = dict()
        master_meter['id'] = row_meter[0]
        master_meter['name'] = row_meter[1]
        master_meter['cost_center_id'] = row_meter[2]
        master_meter['energy_category_id'] = row_meter[3]
        master_meter['energy_category_name'] = row_meter[4]
        master_meter['unit_of_measure'] = row_meter[5]

        ################################################################################################################
        # Step 3: query associated submeters
        ################################################################################################################
        submeter_list = list()
        submeter_id_set = set()

        cursor_system.execute(" SELECT id, name, energy_category_id "
                              " FROM tbl_meters "
                              " WHERE master_meter_id = %s ",
                              (master_meter['id'],))
        rows_meters = cursor_system.fetchall()

        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                submeter_list.append({"id": row[0],
                                      "name": row[1],
                                      "energy_category_id": row[2]})
                submeter_id_set.add(row[0])

        ################################################################################################################
        # Step 4: query reporting period master meter energy consumption
        ################################################################################################################
        reporting = dict()
        reporting['master_meter_total_in_category'] = Decimal(0.0)
        reporting['submeters_total_in_category'] = Decimal(0.0)
        reporting['total_difference_in_category'] = Decimal(0.0)
        reporting['percentage_difference'] = Decimal(0.0)
        reporting['timestamps'] = list()
        reporting['master_meter_values'] = list()
        reporting['submeters_values'] = list()
        reporting['difference_values'] = list()

        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()

        query = (" SELECT start_datetime_utc, actual_value "
                 " FROM tbl_meter_hourly "
                 " WHERE meter_id = %s "
                 " AND start_datetime_utc >= %s "
                 " AND start_datetime_utc < %s "
                 " ORDER BY start_datetime_utc ")
        cursor_energy.execute(query, (master_meter['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_meter_hourly = cursor_energy.fetchall()

        rows_meter_periodically = utilities.aggregate_hourly_data_by_period(rows_meter_hourly,
                                                                            reporting_start_datetime_utc,
                                                                            reporting_end_datetime_utc,
                                                                            period_type)

        for row_meter_periodically in rows_meter_periodically:
            current_datetime_local = row_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

            actual_value = Decimal(0.0) if row_meter_periodically[1] is None else row_meter_periodically[1]

            reporting['timestamps'].append(current_datetime)
            reporting['master_meter_values'].append(actual_value)
            reporting['master_meter_total_in_category'] += actual_value

        # add master meter values to parameter data
        parameters_data['names'].append(master_meter['name'])
        parameters_data['timestamps'].append(reporting['timestamps'])
        parameters_data['values'].append(reporting['master_meter_values'])

        ################################################################################################################
        # Step 5: query reporting period submeters energy consumption
        ################################################################################################################
        if len(submeter_list) > 0:
            query = (" SELECT start_datetime_utc, SUM(actual_value) "
                     " FROM tbl_meter_hourly "
                     " WHERE meter_id IN ( " + ', '.join(map(str, submeter_id_set)) + ") "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " GROUP BY start_datetime_utc "
                     " ORDER BY start_datetime_utc ")
            cursor_energy.execute(query, (reporting_start_datetime_utc, reporting_end_datetime_utc))
            rows_submeters_hourly = cursor_energy.fetchall()

            rows_submeters_periodically = utilities.aggregate_hourly_data_by_period(rows_submeters_hourly,
                                                                                    reporting_start_datetime_utc,
                                                                                    reporting_end_datetime_utc,
                                                                                    period_type)

            for row_submeters_periodically in rows_submeters_periodically:
                current_datetime_local = row_submeters_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_submeters_periodically[1] is None else row_submeters_periodically[1]

                reporting['submeters_values'].append(actual_value)
                reporting['submeters_total_in_category'] += actual_value

        ################################################################################################################
        # Step 6: calculate reporting period difference between master meter and submeters
        ################################################################################################################
        if len(submeter_list) > 0:
            for i in range(len(reporting['timestamps'])):
                reporting['difference_values'].append(reporting['master_meter_values'][i] -
                                                      reporting['submeters_values'][i])
        else:
            for i in range(len(reporting['timestamps'])):
                reporting['difference_values'].append(reporting['master_meter_values'][i])

        reporting['total_difference_in_category'] = \
            reporting['master_meter_total_in_category'] - reporting['submeters_total_in_category']

        if abs(reporting['master_meter_total_in_category']) > Decimal(0.0):
            reporting['percentage_difference'] = \
                reporting['total_difference_in_category'] / reporting['master_meter_total_in_category']
        elif abs(reporting['master_meter_total_in_category']) == Decimal(0.0) and \
                abs(reporting['submeters_total_in_category']) > Decimal(0.0):
            reporting['percentage_difference'] = Decimal(-1.0)

        ################################################################################################################
        # Step 7: query submeter values as parameter data
        ################################################################################################################
        for submeter in submeter_list:
            submeter_timestamps = list()
            submeter_values = list()

            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_meter_hourly "
                     " WHERE meter_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy.execute(query, (submeter['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
            rows_meter_hourly = cursor_energy.fetchall()

            rows_meter_periodically = utilities.aggregate_hourly_data_by_period(rows_meter_hourly,
                                                                                reporting_start_datetime_utc,
                                                                                reporting_end_datetime_utc,
                                                                                period_type)

            for row_meter_periodically in rows_meter_periodically:
                current_datetime_local = row_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_meter_periodically[1] is None else row_meter_periodically[1]

                submeter_timestamps.append(current_datetime)
                submeter_values.append(actual_value)

            parameters_data['names'].append(submeter['name'])
            parameters_data['timestamps'].append(submeter_timestamps)
            parameters_data['values'].append(submeter_values)

        ################################################################################################################
        # Step 8: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_energy:
            cursor_energy.close()
        if cnx_energy:
            cnx_energy.close()

        result = {
            "meter": {
                "cost_center_id": master_meter['cost_center_id'],
                "energy_category_id": master_meter['energy_category_id'],
                "energy_category_name": master_meter['energy_category_name'],
                "unit_of_measure": master_meter['unit_of_measure'],
            },
            "reporting_period": {
                "master_meter_consumption_in_category": reporting['master_meter_total_in_category'],
                "submeters_consumption_in_category": reporting['submeters_total_in_category'],
                "difference_in_category": reporting['total_difference_in_category'],
                "percentage_difference": reporting['percentage_difference'],
                "timestamps": reporting['timestamps'],
                "difference_values": reporting['difference_values'],
            },
            "parameters": {
                "names": parameters_data['names'],
                "timestamps": parameters_data['timestamps'],
                "values": parameters_data['values']
            },
        }

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.metersubmetersbalance.export(result,
                                                            master_meter['name'],
                                                            reporting_period_start_datetime_local,
                                                            reporting_period_end_datetime_local,
                                                            period_type,
                                                            language)

        resp.text = json.dumps(result)
