"""
Virtual Meter Saving Report API

This module provides REST API endpoints for generating virtual meter saving reports.
It analyzes energy savings achieved through virtual meter optimization and efficiency
improvements, providing insights into saving opportunities and ROI calculations.

Key Features:
- Virtual meter energy saving analysis
- Base period vs reporting period comparison
- Saving calculation and verification
- ROI analysis and metrics
- Excel export functionality
- Saving optimization insights

Report Components:
- Virtual meter saving summary
- Base period comparison data
- Saving calculation details
- ROI analysis and metrics
- Saving optimization recommendations
- Cost-benefit analysis

The module uses Falcon framework for REST API and includes:
- Database queries for saving data
- Saving calculation algorithms
- ROI analysis tools
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
import excelexporters.virtualmetersaving
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
    # Step 2: query the virtual meter and energy category
    # Step 3: query base period energy saving
    # Step 4: query reporting period energy saving
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
        virtual_meter_id = req.params.get('virtualmeterid')
        virtual_meter_uuid = req.params.get('virtualmeteruuid')
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
        if virtual_meter_id is None and virtual_meter_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')

        if virtual_meter_id is not None:
            virtual_meter_id = str.strip(virtual_meter_id)
            if not virtual_meter_id.isdigit() or int(virtual_meter_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_VIRTUAL_METER_ID')

        if virtual_meter_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(virtual_meter_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_VIRTUAL_METER_UUID')

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
        # Step 2: query the virtual meter and energy category
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_energy_baseline = mysql.connector.connect(**config.myems_energy_baseline_db)
        cursor_energy_baseline = cnx_energy_baseline.cursor()

        cursor_system.execute(" SELECT m.id, m.name, m.cost_center_id, m.energy_category_id, "
                              "        ec.name, ec.unit_of_measure, ec.kgce, ec.kgco2e "
                              " FROM tbl_virtual_meters m, tbl_energy_categories ec "
                              " WHERE m.id = %s AND m.energy_category_id = ec.id ", (virtual_meter_id,))
        row_virtual_meter = cursor_system.fetchone()
        if row_virtual_meter is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.close()

            if cursor_energy_baseline:
                cursor_energy_baseline.close()
            if cnx_energy_baseline:
                cnx_energy_baseline.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')

        virtual_meter = dict()
        virtual_meter['id'] = row_virtual_meter[0]
        virtual_meter['name'] = row_virtual_meter[1]
        virtual_meter['cost_center_id'] = row_virtual_meter[2]
        virtual_meter['energy_category_id'] = row_virtual_meter[3]
        virtual_meter['energy_category_name'] = row_virtual_meter[4]
        virtual_meter['unit_of_measure'] = row_virtual_meter[5]
        virtual_meter['kgce'] = row_virtual_meter[6]
        virtual_meter['kgco2e'] = row_virtual_meter[7]

        ################################################################################################################
        # Step 3: query base period energy saving
        ################################################################################################################
        base = dict()
        base['timestamps'] = list()
        base['values_baseline'] = list()
        base['values_actual'] = list()
        base['values_saving'] = list()
        base['total_in_category_baseline'] = Decimal(0.0)
        base['total_in_category_actual'] = Decimal(0.0)
        base['total_in_category_saving'] = Decimal(0.0)
        base['total_in_kgce_baseline'] = Decimal(0.0)
        base['total_in_kgce_actual'] = Decimal(0.0)
        base['total_in_kgce_saving'] = Decimal(0.0)
        base['total_in_kgco2e_baseline'] = Decimal(0.0)
        base['total_in_kgco2e_actual'] = Decimal(0.0)
        base['total_in_kgco2e_saving'] = Decimal(0.0)

        # query base period baseline
        cursor_energy_baseline.execute(" SELECT start_datetime_utc, actual_value "
                                       " FROM tbl_virtual_meter_hourly "
                                       " WHERE virtual_meter_id = %s "
                                       " AND start_datetime_utc >= %s "
                                       " AND start_datetime_utc < %s "
                                       " ORDER BY start_datetime_utc ",
                                       (virtual_meter['id'],
                                        base_start_datetime_utc,
                                        base_end_datetime_utc))
        rows_virtual_meter_hourly = cursor_energy_baseline.fetchall()

        rows_virtual_meter_periodically = \
            utilities.aggregate_hourly_data_by_period(rows_virtual_meter_hourly,
                                                      base_start_datetime_utc,
                                                      base_end_datetime_utc,
                                                      period_type)

        for row_virtual_meter_periodically in rows_virtual_meter_periodically:
            current_datetime_local = row_virtual_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

            actual_value = Decimal(0.0) if row_virtual_meter_periodically[1] is None \
                else row_virtual_meter_periodically[1]
            base['timestamps'].append(current_datetime)
            base['values_baseline'].append(actual_value)
            base['total_in_category_baseline'] += actual_value
            base['total_in_kgce_baseline'] += actual_value * virtual_meter['kgce']
            base['total_in_kgco2e_baseline'] += actual_value * virtual_meter['kgco2e']

        # query base period actual
        cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                              " FROM tbl_virtual_meter_hourly "
                              " WHERE virtual_meter_id = %s "
                              " AND start_datetime_utc >= %s "
                              " AND start_datetime_utc < %s "
                              " ORDER BY start_datetime_utc ",
                              (virtual_meter['id'],
                               base_start_datetime_utc,
                               base_end_datetime_utc))
        rows_virtual_meter_hourly = cursor_energy.fetchall()

        rows_virtual_meter_periodically = \
            utilities.aggregate_hourly_data_by_period(rows_virtual_meter_hourly,
                                                      base_start_datetime_utc,
                                                      base_end_datetime_utc,
                                                      period_type)

        for row_virtual_meter_periodically in rows_virtual_meter_periodically:
            current_datetime_local = row_virtual_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

            actual_value = Decimal(0.0) if row_virtual_meter_periodically[1] is None \
                else row_virtual_meter_periodically[1]
            base['values_actual'].append(actual_value)
            base['total_in_category_actual'] += actual_value
            base['total_in_kgce_actual'] += actual_value * virtual_meter['kgce']
            base['total_in_kgco2e_actual'] += actual_value * virtual_meter['kgco2e']

        # calculate base period saving
        for i in range(len(base['values_baseline'])):
            base['values_saving'].append(base['values_baseline'][i] - base['values_actual'][i])

        base['total_in_category_saving'] = base['total_in_category_baseline'] - base['total_in_category_actual']
        base['total_in_kgce_saving'] = base['total_in_kgce_baseline'] - base['total_in_kgce_actual']
        base['total_in_kgco2e_saving'] = base['total_in_kgco2e_baseline'] - base['total_in_kgco2e_actual']

        ################################################################################################################
        # Step 3: query reporting period energy saving
        ################################################################################################################
        reporting = dict()
        reporting['timestamps'] = list()
        reporting['values_baseline'] = list()
        reporting['values_actual'] = list()
        reporting['values_saving'] = list()
        reporting['values_rates'] = list()
        reporting['total_in_category_baseline'] = Decimal(0.0)
        reporting['total_in_category_actual'] = Decimal(0.0)
        reporting['total_in_category_saving'] = Decimal(0.0)
        reporting['total_in_kgce_baseline'] = Decimal(0.0)
        reporting['total_in_kgce_actual'] = Decimal(0.0)
        reporting['total_in_kgce_saving'] = Decimal(0.0)
        reporting['total_in_kgco2e_baseline'] = Decimal(0.0)
        reporting['total_in_kgco2e_actual'] = Decimal(0.0)
        reporting['total_in_kgco2e_saving'] = Decimal(0.0)
        # query reporting period baseline
        cursor_energy_baseline.execute(" SELECT start_datetime_utc, actual_value "
                                       " FROM tbl_virtual_meter_hourly "
                                       " WHERE virtual_meter_id = %s "
                                       " AND start_datetime_utc >= %s "
                                       " AND start_datetime_utc < %s "
                                       " ORDER BY start_datetime_utc ",
                                       (virtual_meter['id'],
                                        reporting_start_datetime_utc,
                                        reporting_end_datetime_utc))
        rows_virtual_meter_hourly = cursor_energy_baseline.fetchall()

        rows_virtual_meter_periodically = utilities.aggregate_hourly_data_by_period(rows_virtual_meter_hourly,
                                                                                    reporting_start_datetime_utc,
                                                                                    reporting_end_datetime_utc,
                                                                                    period_type)

        for row_virtual_meter_periodically in rows_virtual_meter_periodically:
            current_datetime_local = row_virtual_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

            actual_value = Decimal(0.0) if row_virtual_meter_periodically[1] is None \
                else row_virtual_meter_periodically[1]

            reporting['timestamps'].append(current_datetime)
            reporting['values_baseline'].append(actual_value)
            reporting['total_in_category_baseline'] += actual_value
            reporting['total_in_kgce_baseline'] += actual_value * virtual_meter['kgce']
            reporting['total_in_kgco2e_baseline'] += actual_value * virtual_meter['kgco2e']

        # query reporting period actual
        cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                              " FROM tbl_virtual_meter_hourly "
                              " WHERE virtual_meter_id = %s "
                              " AND start_datetime_utc >= %s "
                              " AND start_datetime_utc < %s "
                              " ORDER BY start_datetime_utc ",
                              (virtual_meter['id'],
                               reporting_start_datetime_utc,
                               reporting_end_datetime_utc))
        rows_virtual_meter_hourly = cursor_energy.fetchall()

        rows_virtual_meter_periodically = utilities.aggregate_hourly_data_by_period(rows_virtual_meter_hourly,
                                                                                    reporting_start_datetime_utc,
                                                                                    reporting_end_datetime_utc,
                                                                                    period_type)

        for row_virtual_meter_periodically in rows_virtual_meter_periodically:
            current_datetime_local = row_virtual_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

            actual_value = Decimal(0.0) if row_virtual_meter_periodically[1] is None \
                else row_virtual_meter_periodically[1]

            reporting['values_actual'].append(actual_value)
            reporting['total_in_category_actual'] += actual_value
            reporting['total_in_kgce_actual'] += actual_value * virtual_meter['kgce']
            reporting['total_in_kgco2e_actual'] += actual_value * virtual_meter['kgco2e']

        # calculate base period saving
        for i in range(len(reporting['values_baseline'])):
            reporting['values_saving'].append(reporting['values_baseline'][i] - reporting['values_actual'][i])

        reporting['total_in_category_saving'] = \
            reporting['total_in_category_baseline'] - reporting['total_in_category_actual']
        reporting['total_in_kgce_saving'] = \
            reporting['total_in_kgce_baseline'] - reporting['total_in_kgce_actual']
        reporting['total_in_kgco2e_saving'] = \
            reporting['total_in_kgco2e_baseline'] - reporting['total_in_kgco2e_actual']

        for index, value in enumerate(reporting['values_saving']):
            if index < len(base['values_saving']) and base['values_saving'][index] != 0 and value != 0:
                reporting['values_rates'].append((value - base['values_saving'][index]) / base['values_saving'][index])
            else:
                reporting['values_rates'].append(None)

        ################################################################################################################
        # Step 5: query tariff data
        ################################################################################################################
        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()
        if config.is_tariff_appended and not is_quick_mode:
            tariff_dict = utilities.get_energy_category_tariffs(virtual_meter['cost_center_id'],
                                                                virtual_meter['energy_category_id'],
                                                                reporting_start_datetime_utc,
                                                                reporting_end_datetime_utc)
            tariff_timestamp_list = list()
            tariff_value_list = list()
            for k, v in tariff_dict.items():
                # convert k from utc to local
                k = k + timedelta(minutes=timezone_offset)
                tariff_timestamp_list.append(k.isoformat()[0:19])
                tariff_value_list.append(v)

            parameters_data['names'].append(_('Tariff') + '-' + virtual_meter['energy_category_name'])
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

        if cursor_energy_baseline:
            cursor_energy_baseline.close()
        if cnx_energy_baseline:
            cnx_energy_baseline.close()

        result = {
            "virtual_meter": {
                "cost_center_id": virtual_meter['cost_center_id'],
                "energy_category_id": virtual_meter['energy_category_id'],
                "energy_category_name": virtual_meter['energy_category_name'],
                "unit_of_measure": virtual_meter['unit_of_measure'],
                "kgce": virtual_meter['kgce'],
                "kgco2e": virtual_meter['kgco2e'],
            },
            "base_period": {
                "total_in_category_saving": base['total_in_category_saving'],
                "total_in_kgce_saving": base['total_in_kgce_saving'],
                "total_in_kgco2e_saving": base['total_in_kgco2e_saving'],
                "timestamps": base['timestamps'],
                "values_saving": base['values_saving'],
            },
            "reporting_period": {
                "increment_rate_saving":
                    (reporting['total_in_category_saving'] - base['total_in_category_saving']) /
                    base['total_in_category_saving']
                    if base['total_in_category_saving'] != Decimal(0.0) else None,
                "total_in_category_saving": reporting['total_in_category_saving'],
                "total_in_kgce_saving": reporting['total_in_kgce_saving'],
                "total_in_kgco2e_saving": reporting['total_in_kgco2e_saving'],
                "timestamps": reporting['timestamps'],
                "values_saving": reporting['values_saving'],
                "values_rates": reporting['values_rates'],
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
                excelexporters.virtualmetersaving.export(result,
                                                         virtual_meter['name'],
                                                         base_period_start_datetime_local,
                                                         base_period_end_datetime_local,
                                                         reporting_period_start_datetime_local,
                                                         reporting_period_end_datetime_local,
                                                         period_type,
                                                         language)

        resp.text = json.dumps(result)
