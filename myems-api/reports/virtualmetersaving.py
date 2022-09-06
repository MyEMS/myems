import re
import falcon
import simplejson as json
import mysql.connector
import config
from datetime import datetime, timedelta, timezone
from core import utilities
from decimal import Decimal
import excelexporters.virtualmetersaving


class Reporting:
    @staticmethod
    def __init__():
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the meter and energy category
    # Step 3: query base period energy saving
    # Step 4: query reporting period energy saving
    # Step 5: query tariff data
    # Step 6: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        print(req.params)
        virtual_meter_id = req.params.get('virtualmeterid')
        virtual_meter_uuid = req.params.get('virtualmeteruuid')
        period_type = req.params.get('periodtype')
        base_start_datetime_local = req.params.get('baseperiodstartdatetime')
        base_end_datetime_local = req.params.get('baseperiodenddatetime')
        reporting_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_end_datetime_local = req.params.get('reportingperiodenddatetime')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if virtual_meter_id is None and virtual_meter_id is None:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')

        if virtual_meter_id is not None:
            virtual_meter_id = str.strip(virtual_meter_id)
            if not virtual_meter_id.isdigit() or int(virtual_meter_id) <= 0:
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_VIRTUAL_METER_ID')

        if virtual_meter_uuid is not None:
            regex = re.compile('^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(virtual_meter_uuid))
            if not bool(match):
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_VIRTUAL_METER_UUID')

        if period_type is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_PERIOD_TYPE')
        else:
            period_type = str.strip(period_type)
            if period_type not in ['hourly', 'daily', 'weekly', 'monthly', 'yearly']:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_PERIOD_TYPE')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        base_start_datetime_utc = None
        if base_start_datetime_local is not None and len(str.strip(base_start_datetime_local)) > 0:
            base_start_datetime_local = str.strip(base_start_datetime_local)
            try:
                base_start_datetime_utc = datetime.strptime(base_start_datetime_local,
                                                            '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                          timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_BASE_PERIOD_START_DATETIME")

        base_end_datetime_utc = None
        if base_end_datetime_local is not None and len(str.strip(base_end_datetime_local)) > 0:
            base_end_datetime_local = str.strip(base_end_datetime_local)
            try:
                base_end_datetime_utc = datetime.strptime(base_end_datetime_local,
                                                          '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                        timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_BASE_PERIOD_END_DATETIME")

        if base_start_datetime_utc is not None and base_end_datetime_utc is not None and \
                base_start_datetime_utc >= base_end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BASE_PERIOD_END_DATETIME')

        if reporting_start_datetime_local is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
        else:
            reporting_start_datetime_local = str.strip(reporting_start_datetime_local)
            try:
                reporting_start_datetime_utc = datetime.strptime(reporting_start_datetime_local,
                                                                 '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                               timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_START_DATETIME")

        if reporting_end_datetime_local is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
        else:
            reporting_end_datetime_local = str.strip(reporting_end_datetime_local)
            try:
                reporting_end_datetime_utc = datetime.strptime(reporting_end_datetime_local,
                                                               '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                             timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPORTING_PERIOD_END_DATETIME')
            
        ################################################################################################################
        # Step 2: query the meter and energy category
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_energy_baseline = mysql.connector.connect(**config.myems_energy_baseline_db)
        cursor_energy_baseline = cnx_energy_baseline.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()
        if virtual_meter_id is not None:
            cursor_system.execute(" SELECT m.id, m.name, m.cost_center_id, m.energy_category_id, "
                                  "        ec.name, ec.unit_of_measure, ec.kgce, ec.kgco2e "
                                  " FROM tbl_virtual_meters m, tbl_energy_categories ec "
                                  " WHERE m.id = %s AND m.energy_category_id = ec.id ", (virtual_meter_id,))
            row_virtual_meter = cursor_system.fetchone()
        elif virtual_meter_uuid is not None:
            cursor_system.execute(" SELECT m.id, m.name, m.cost_center_id, m.energy_category_id, "
                                  "        ec.name, ec.unit_of_measure, ec.kgce, ec.kgco2e "
                                  " FROM tbl_virtual_meters m, tbl_energy_categories ec "
                                  " WHERE m.uuid = %s AND m.energy_category_id = ec.id ", (virtual_meter_uuid,))
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

            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND', description='API.VIRTUAL_METER_NOT_FOUND')
        
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
        kgce = virtual_meter['kgce']
        kgco2e = virtual_meter['kgco2e']
        base = dict()
        base['timestamps'] = list()
        base['values_baseline'] = list()
        base['values_actual'] = list()
        base['values_saving'] = list()
        base['subtotal_baseline'] = Decimal(0.0)
        base['subtotal_actual'] = Decimal(0.0)
        base['subtotal_saving'] = Decimal(0.0)
        base['subtotal_in_kgce_baseline'] = Decimal(0.0)
        base['subtotal_in_kgce_actual'] = Decimal(0.0)
        base['subtotal_in_kgce_saving'] = Decimal(0.0)
        base['subtotal_in_kgco2e_baseline'] = Decimal(0.0)
        base['subtotal_in_kgco2e_actual'] = Decimal(0.0)
        base['subtotal_in_kgco2e_saving'] = Decimal(0.0)
        # query base period's energy baseline
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

        rows_virtual_meter_periodically = utilities.aggregate_hourly_data_by_period(rows_virtual_meter_hourly,
                                                                            base_start_datetime_utc,
                                                                            base_end_datetime_utc,
                                                                            period_type)
        for row_virtual_meter_periodically in rows_virtual_meter_periodically:
            current_datetime_local = row_virtual_meter_periodically[0].replace(tzinfo=timezone.utc) + \
                                     timedelta(minutes=timezone_offset)
            if period_type == 'hourly':
                current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
            elif period_type == 'daily':
                current_datetime = current_datetime_local.strftime('%Y-%m-%d')
            elif period_type == 'weekly':
                current_datetime = current_datetime_local.strftime('%Y-%m-%d')
            elif period_type == 'monthly':
                current_datetime = current_datetime_local.strftime('%Y-%m')
            elif period_type == 'yearly':
                current_datetime = current_datetime_local.strftime('%Y')

            baseline_value = Decimal(0.0) if row_virtual_meter_periodically[1] is None else row_virtual_meter_periodically[1]
            base['timestamps'].append(current_datetime)
            base['values_baseline'].append(baseline_value)
            base['subtotal_baseline'] += baseline_value
            base['subtotal_in_kgce_baseline'] += baseline_value * kgce
            base['subtotal_in_kgco2e_baseline'] += baseline_value * kgco2e

        # query base period's energy actual
        cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                              " FROM tbl_virtual_meter_hourly "
                              " WHERE virtual_meter_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s "
                              " ORDER BY start_datetime_utc ",
                              (virtual_meter['id'],
                               base_start_datetime_utc,
                               base_end_datetime_utc))
        rows_virtual_meter_hourly = cursor_energy.fetchall()

        rows_virtual_meter_periodically = utilities.aggregate_hourly_data_by_period(rows_virtual_meter_hourly,
                                                                            base_start_datetime_utc,
                                                                            base_end_datetime_utc,
                                                                            period_type)
        for row_virtual_meter_periodically in rows_virtual_meter_periodically:
            current_datetime_local = row_virtual_meter_periodically[0].replace(tzinfo=timezone.utc) + \
                                     timedelta(minutes=timezone_offset)
            if period_type == 'hourly':
                current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
            elif period_type == 'daily':
                current_datetime = current_datetime_local.strftime('%Y-%m-%d')
            elif period_type == 'weekly':
                current_datetime = current_datetime_local.strftime('%Y-%m-%d')
            elif period_type == 'monthly':
                current_datetime = current_datetime_local.strftime('%Y-%m')
            elif period_type == 'yearly':
                current_datetime = current_datetime_local.strftime('%Y')

            actual_value = Decimal(0.0) if row_virtual_meter_periodically[1] is None else row_virtual_meter_periodically[1]
            base['values_actual'].append(actual_value)
            base['subtotal_actual'] += actual_value
            base['subtotal_in_kgce_actual'] += actual_value * kgce
            base['subtotal_in_kgco2e_actual'] += actual_value * kgco2e
        # calculate base period's energy savings
        for i in range(len(base['values_baseline'])):
            base['values_saving'].append(
                base['values_baseline'][i] -
                base['values_actual'][i])

        base['subtotal_saving'] = \
            base['subtotal_baseline'] - \
            base['subtotal_actual']
        base['subtotal_in_kgce_saving'] = \
            base['subtotal_in_kgce_baseline'] - \
            base['subtotal_in_kgce_actual']
        base['subtotal_in_kgco2e_saving'] = \
            base['subtotal_in_kgco2e_baseline'] - \
            base['subtotal_in_kgco2e_actual']
        ################################################################################################################
        # Step 4: query reporting period energy saving
        ################################################################################################################
        reporting = dict()
        kgce = virtual_meter['kgce']
        kgco2e = virtual_meter['kgco2e']

        reporting = dict()
        reporting['timestamps'] = list()
        reporting['values_baseline'] = list()
        reporting['values_actual'] = list()
        reporting['values_saving'] = list()
        reporting['subtotal_baseline'] = Decimal(0.0)
        reporting['subtotal_actual'] = Decimal(0.0)
        reporting['subtotal_saving'] = Decimal(0.0)
        reporting['subtotal_in_kgce_baseline'] = Decimal(0.0)
        reporting['subtotal_in_kgce_actual'] = Decimal(0.0)
        reporting['subtotal_in_kgce_saving'] = Decimal(0.0)
        reporting['subtotal_in_kgco2e_baseline'] = Decimal(0.0)
        reporting['subtotal_in_kgco2e_actual'] = Decimal(0.0)
        reporting['subtotal_in_kgco2e_saving'] = Decimal(0.0)
        # query reporting period's energy baseline
        cursor_energy_baseline.execute(" SELECT start_datetime_utc, actual_value "
                                       " FROM tbl_virtual_meter_hourly "
                                       " WHERE virtual_meter_id = %s "
                                       "     AND start_datetime_utc >= %s "
                                       "     AND start_datetime_utc < %s "
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
                current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
            elif period_type == 'daily':
                current_datetime = current_datetime_local.strftime('%Y-%m-%d')
            elif period_type == 'weekly':
                current_datetime = current_datetime_local.strftime('%Y-%m-%d')
            elif period_type == 'monthly':
                current_datetime = current_datetime_local.strftime('%Y-%m')
            elif period_type == 'yearly':
                current_datetime = current_datetime_local.strftime('%Y')

            baseline_value = Decimal(0.0) if row_virtual_meter_periodically[1] is None else row_virtual_meter_periodically[1]
            reporting['timestamps'].append(current_datetime)
            reporting['values_baseline'].append(baseline_value)
            reporting['subtotal_baseline'] += baseline_value
            reporting['subtotal_in_kgce_baseline'] += baseline_value * kgce
            reporting['subtotal_in_kgco2e_baseline'] += baseline_value * kgco2e

        # query reporting period's energy actual
        cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                              " FROM tbl_virtual_meter_hourly "
                              " WHERE virtual_meter_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s "
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
            actual_value = Decimal(0.0) if row_virtual_meter_periodically[1] is None else row_virtual_meter_periodically[1]
            reporting['values_actual'].append(actual_value)
            reporting['subtotal_actual'] += actual_value
            reporting['subtotal_in_kgce_actual'] += actual_value * kgce
            reporting['subtotal_in_kgco2e_actual'] += actual_value * kgco2e

        # calculate reporting period's energy savings
        for i in range(len(reporting['values_baseline'])):
            reporting['values_saving'].append(
                reporting['values_baseline'][i] -
                reporting['values_actual'][i])

        reporting['subtotal_saving'] = \
            reporting['subtotal_baseline'] - \
            reporting['subtotal_actual']
        reporting['subtotal_in_kgce_saving'] = \
            reporting['subtotal_in_kgce_baseline'] - \
            reporting['subtotal_in_kgce_actual']
        reporting['subtotal_in_kgco2e_saving'] = \
            reporting['subtotal_in_kgco2e_baseline'] - \
            reporting['subtotal_in_kgco2e_actual']
        ################################################################################################################
        # Step 5: query tariff data
        ################################################################################################################
        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()
        energy_category_id = virtual_meter['energy_category_id']
        energy_category_tariff_dict = utilities.get_energy_category_tariffs(virtual_meter['cost_center_id'],
                                                                            energy_category_id,
                                                                            reporting_start_datetime_utc,
                                                                            reporting_end_datetime_utc)
        tariff_timestamp_list = list()
        tariff_value_list = list()
        for key, value in energy_category_tariff_dict.items():
            # convert k from utc to local
            key = key + timedelta(minutes=timezone_offset)
            tariff_timestamp_list.append(key.isoformat()[0:19][0:19])
            tariff_value_list.append(value)

            parameters_data['names'].append('TARIFF-' + virtual_meter['name'])
            parameters_data['timestamps'].append(tariff_timestamp_list)
            parameters_data['values'].append(tariff_value_list)
        ################################################################################################################
        # Step6 : construct the report
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

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()

        result = dict()

        result['meter'] = dict()
        result['meter']['name'] = virtual_meter['name']

        result['base_period'] = dict()
        result['base_period']['names'] = list()
        result['base_period']['units'] = list()
        result['base_period']['timestamps'] = list()
        result['base_period']['values_actual'] = list()
        result['base_period']['values_baseline'] = list()
        result['base_period']['values_saving'] = list()
        result['base_period']['subtotals_actual'] = list()
        result['base_period']['subtotals_baseline'] = list()
        result['base_period']['subtotals_saving'] = list()
        result['base_period']['subtotals_in_kgce_saving'] = list()
        result['base_period']['subtotals_in_kgco2e_saving'] = list()
        result['base_period']['total_in_kgce_saving'] = Decimal(0.0)
        result['base_period']['total_in_kgco2e_saving'] = Decimal(0.0)

        result['base_period']['names'] = virtual_meter['name']
        result['base_period']['units'] = virtual_meter['unit_of_measure']
        result['base_period']['timestamps'] = base['timestamps']
        result['base_period']['values_actual'] = base['values_actual']
        result['base_period']['values_baseline'] = base['values_baseline']
        result['base_period']['values_saving'] = base['values_saving']
        result['base_period']['subtotals_actual'] = base['subtotal_actual']
        result['base_period']['subtotals_baseline'] = base['subtotal_baseline']
        result['base_period']['subtotals_saving'] = base['subtotal_saving']
        result['base_period']['subtotals_in_kgce_saving'] = base['subtotal_in_kgce_saving']
        result['base_period']['subtotals_in_kgco2e_saving'] = base['subtotal_in_kgco2e_saving']
        result['base_period']['total_in_kgce_saving'] += base['subtotal_in_kgce_saving']
        result['base_period']['total_in_kgco2e_saving'] += base['subtotal_in_kgco2e_saving']

        result['reporting_period'] = dict()
        result['reporting_period']['names'] = list()
        result['reporting_period']['energy_category_ids'] = list()
        result['reporting_period']['units'] = list()
        result['reporting_period']['timestamps'] = list()
        result['reporting_period']['values_actual'] = list()
        result['reporting_period']['values_baseline'] = list()
        result['reporting_period']['values_saving'] = list()
        result['reporting_period']['subtotals_actual'] = list()
        result['reporting_period']['subtotals_baseline'] = list()
        result['reporting_period']['subtotals_saving'] = list()
        result['reporting_period']['subtotals_in_kgce_saving'] = list()
        result['reporting_period']['subtotals_in_kgco2e_saving'] = list()
        result['reporting_period']['increment_rates_saving'] = list()
        result['reporting_period']['total_in_kgce_saving'] = Decimal(0.0)
        result['reporting_period']['total_in_kgco2e_saving'] = Decimal(0.0)
        result['reporting_period']['increment_rate_in_kgce_saving'] = Decimal(0.0)
        result['reporting_period']['increment_rate_in_kgco2e_saving'] = Decimal(0.0)

        result['reporting_period']['names'] = virtual_meter['name']
        result['reporting_period']['energy_category_ids'] = energy_category_id
        result['reporting_period']['units'] = virtual_meter['unit_of_measure']
        result['reporting_period']['timestamps'] = reporting['timestamps']
        result['reporting_period']['values_actual'] = reporting['values_actual']
        result['reporting_period']['values_baseline'] = reporting['values_baseline']
        result['reporting_period']['values_saving'] = reporting['values_saving']
        result['reporting_period']['subtotals_actual'] = reporting['subtotal_actual']
        result['reporting_period']['subtotals_baseline'] = reporting['subtotal_baseline']
        result['reporting_period']['subtotals_saving'] = reporting['subtotal_saving']
        result['reporting_period']['subtotals_in_kgce_saving'] = reporting['subtotal_in_kgce_saving']
        result['reporting_period']['subtotals_in_kgco2e_saving'] = reporting['subtotal_in_kgco2e_saving']
        result['reporting_period']['increment_rates_saving'] = (
            (reporting['subtotal_saving'] - base['subtotal_saving']) /
            base['subtotal_saving']
            if base['subtotal_saving'] > 0.0 else None)
        result['reporting_period']['total_in_kgce_saving'] += \
            reporting['subtotal_in_kgce_saving']
        result['reporting_period']['total_in_kgco2e_saving'] += \
            reporting['subtotal_in_kgco2e_saving']

        result['reporting_period']['increment_rate_in_kgce_saving'] = \
            (result['reporting_period']['total_in_kgce_saving'] - result['base_period']['total_in_kgce_saving']) / \
            result['base_period']['total_in_kgce_saving'] \
            if result['base_period']['total_in_kgce_saving'] > Decimal(0.0) else None

        result['reporting_period']['increment_rate_in_kgco2e_saving'] = \
            (result['reporting_period']['total_in_kgco2e_saving'] - result['base_period']['total_in_kgco2e_saving']) / \
            result['base_period']['total_in_kgco2e_saving'] \
            if result['base_period']['total_in_kgco2e_saving'] > Decimal(0.0) else None

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }

        # export result to Excel file and then encode the file to base64 string
        result['excel_bytes_base64'] = excelexporters.virtualmetersaving.export(result,
                                                                            virtual_meter['name'],
                                                                            reporting_start_datetime_local,
                                                                            reporting_end_datetime_local,
                                                                            period_type)

        resp.text = json.dumps(result)
