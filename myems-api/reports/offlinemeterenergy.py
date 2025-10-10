"""
Offline Meter Energy Report API

This module provides REST API endpoints for generating offline meter energy reports.
It analyzes energy consumption data from offline meters, providing comprehensive insights
into energy usage patterns, consumption trends, and optimization opportunities.

Key Features:
- Offline meter energy consumption analysis
- Base period vs reporting period comparison
- Energy consumption trends and patterns
- Consumption optimization insights
- Excel export functionality
- Performance metrics calculation

Report Components:
- Offline meter energy consumption summary
- Base period comparison data
- Energy consumption trends
- Consumption optimization recommendations
- Performance indicators
- Usage pattern analysis

The module uses Falcon framework for REST API and includes:
- Database queries for energy data
- Energy consumption calculations
- Trend analysis algorithms
- Excel export via excelexporters
- Multi-language support
- User authentication and authorization
"""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.offlinemeterenergy
from core import utilities
from core.useractivity import access_control, api_key_control


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
    # Step 2: query the offline meter and energy category
    # Step 3: query base period energy consumption
    # Step 4: query reporting period energy consumption
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
        offline_meter_id = req.params.get('offlinemeterid')
        period_type = req.params.get('periodtype')
        base_period_start_datetime_local = req.params.get('baseperiodstartdatetime')
        base_period_end_datetime_local = req.params.get('baseperiodenddatetime')
        reporting_period_start_datetime = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if offline_meter_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')
        else:
            offline_meter_id = str.strip(offline_meter_id)
            if not offline_meter_id.isdigit() or int(offline_meter_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_OFFLINE_METER_ID')

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

        if reporting_period_start_datetime is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
        else:
            reporting_period_start_datetime = str.strip(reporting_period_start_datetime)
            try:
                reporting_start_datetime_utc = datetime.strptime(reporting_period_start_datetime, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
            reporting_start_datetime_utc = reporting_start_datetime_utc.replace(tzinfo=timezone.utc) - \
                timedelta(minutes=timezone_offset)

        if reporting_period_end_datetime is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
        else:
            reporting_period_end_datetime = str.strip(reporting_period_end_datetime)
            try:
                reporting_end_datetime_utc = datetime.strptime(reporting_period_end_datetime, '%Y-%m-%dT%H:%M:%S')
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
        # Step 2: query the offline meter and energy category
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cursor_system.execute(" SELECT m.id, m.name, m.cost_center_id, m.energy_category_id, "
                              "        ec.name, ec.unit_of_measure, ec.kgce, ec.kgco2e "
                              " FROM tbl_offline_meters m, tbl_energy_categories ec "
                              " WHERE m.id = %s AND m.energy_category_id = ec.id ", (offline_meter_id,))
        row_offline_meter = cursor_system.fetchone()
        if row_offline_meter is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        offline_meter = dict()
        offline_meter['id'] = row_offline_meter[0]
        offline_meter['name'] = row_offline_meter[1]
        offline_meter['cost_center_id'] = row_offline_meter[2]
        offline_meter['energy_category_id'] = row_offline_meter[3]
        offline_meter['energy_category_name'] = row_offline_meter[4]
        offline_meter['unit_of_measure'] = row_offline_meter[5]
        offline_meter['kgce'] = row_offline_meter[6]
        offline_meter['kgco2e'] = row_offline_meter[7]

        ################################################################################################################
        # Step 3: query base period energy consumption
        ################################################################################################################
        query = (" SELECT start_datetime_utc, actual_value "
                 " FROM tbl_offline_meter_hourly "
                 " WHERE offline_meter_id = %s "
                 " AND start_datetime_utc >= %s "
                 " AND start_datetime_utc < %s "
                 " ORDER BY start_datetime_utc ")
        cursor_energy.execute(query, (offline_meter['id'], base_start_datetime_utc, base_end_datetime_utc))
        rows_offline_meter_hourly = cursor_energy.fetchall()

        rows_offline_meter_periodically = utilities.aggregate_hourly_data_by_period(rows_offline_meter_hourly,
                                                                                    base_start_datetime_utc,
                                                                                    base_end_datetime_utc,
                                                                                    period_type)
        base = dict()
        base['timestamps'] = list()
        base['values'] = list()
        base['total_in_category'] = Decimal(0.0)
        base['total_in_kgce'] = Decimal(0.0)
        base['total_in_kgco2e'] = Decimal(0.0)

        for row_offline_meter_periodically in rows_offline_meter_periodically:
            current_datetime_local = row_offline_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

            actual_value = Decimal(0.0) if row_offline_meter_periodically[1] is None \
                else row_offline_meter_periodically[1]
            base['timestamps'].append(current_datetime)
            base['values'].append(actual_value)
            base['total_in_category'] += actual_value
            base['total_in_kgce'] += actual_value * offline_meter['kgce']
            base['total_in_kgco2e'] += actual_value * offline_meter['kgco2e']
        ################################################################################################################
        # Step 4: query reporting period energy consumption
        ################################################################################################################

        query = (" SELECT start_datetime_utc, actual_value "
                 " FROM tbl_offline_meter_hourly "
                 " WHERE offline_meter_id = %s "
                 " AND start_datetime_utc >= %s "
                 " AND start_datetime_utc < %s "
                 " ORDER BY start_datetime_utc ")
        cursor_energy.execute(query, (offline_meter['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_offline_meter_hourly = cursor_energy.fetchall()

        rows_offline_meter_periodically = utilities.aggregate_hourly_data_by_period(rows_offline_meter_hourly,
                                                                                    reporting_start_datetime_utc,
                                                                                    reporting_end_datetime_utc,
                                                                                    period_type)
        reporting = dict()
        reporting['timestamps'] = list()
        reporting['values'] = list()
        reporting['rates'] = list()
        reporting['total_in_category'] = Decimal(0.0)
        reporting['total_in_kgce'] = Decimal(0.0)
        reporting['total_in_kgco2e'] = Decimal(0.0)

        for row_offline_meter_periodically in rows_offline_meter_periodically:
            current_datetime_local = row_offline_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

            actual_value = Decimal(0.0) if row_offline_meter_periodically[1] is None \
                else row_offline_meter_periodically[1]

            reporting['timestamps'].append(current_datetime)
            reporting['values'].append(actual_value)
            reporting['total_in_category'] += actual_value
            reporting['total_in_kgce'] += actual_value * offline_meter['kgce']
            reporting['total_in_kgco2e'] += actual_value * offline_meter['kgco2e']

        for index, value in enumerate(reporting['values']):
            if index < len(base['values']) and base['values'][index] != 0 and value != 0:
                reporting['rates'].append((value - base['values'][index]) / base['values'][index])
            else:
                reporting['rates'].append(None)

        ################################################################################################################
        # Step 5: query tariff data
        ################################################################################################################
        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()
        if config.is_tariff_appended and not is_quick_mode:
            tariff_dict = utilities.get_energy_category_tariffs(offline_meter['cost_center_id'],
                                                                offline_meter['energy_category_id'],
                                                                reporting_start_datetime_utc,
                                                                reporting_end_datetime_utc)
            tariff_timestamp_list = list()
            tariff_value_list = list()
            for k, v in tariff_dict.items():
                # convert k from utc to local
                k = k + timedelta(minutes=timezone_offset)
                tariff_timestamp_list.append(k.isoformat()[0:19])
                tariff_value_list.append(v)

            parameters_data['names'].append(_('Tariff') + '-' + offline_meter['energy_category_name'])
            parameters_data['timestamps'].append(tariff_timestamp_list)
            parameters_data['values'].append(tariff_value_list)

        ################################################################################################################
        # Step 6: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_energy:
            cursor_energy.close()
        if cnx_energy:
            cnx_energy.close()

        result = {"offline_meter": {
            "cost_center_id": offline_meter['cost_center_id'],
            "energy_category_id": offline_meter['energy_category_id'],
            "energy_category_name": offline_meter['energy_category_name'],
            "unit_of_measure": offline_meter['unit_of_measure'],
            "kgce": offline_meter['kgce'],
            "kgco2e": offline_meter['kgco2e'],
        }, "base_period": {
            "total_in_category": base['total_in_category'],
            "total_in_kgce": base['total_in_kgce'],
            "total_in_kgco2e": base['total_in_kgco2e'],
            "timestamps": base['timestamps'],
            "values": base['values'],
        }, "reporting_period": {
            "increment_rate":
                (reporting['total_in_category'] - base['total_in_category']) / base['total_in_category']
                if base['total_in_category'] != Decimal(0.0) else None,
            "total_in_category": reporting['total_in_category'],
            "total_in_kgce": reporting['total_in_kgce'],
            "total_in_kgco2e": reporting['total_in_kgco2e'],
            "timestamps": reporting['timestamps'],
            "values": reporting['values'],
            "rates": reporting['rates'],
        }, "parameters": {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }, 'excel_bytes_base64': None}

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.offlinemeterenergy.export(result,
                                                         offline_meter['name'],
                                                         base_period_start_datetime_local,
                                                         base_period_end_datetime_local,
                                                         reporting_period_start_datetime,
                                                         reporting_period_end_datetime,
                                                         period_type,
                                                         language)

        resp.text = json.dumps(result)
