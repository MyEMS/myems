import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.hybridpowerstationreportingenergy
from core import utilities
from core.useractivity import access_control, api_key_control


class Reporting:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the energy storage power station
    # Step 3: query energy charge
    # Step 4: query energy discharge
    # Step 5: query energy fuel
    # Step 6: query energy grid buy
    # Step 7: query energy grid sell
    # Step 8: query energy load
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
        print(req.params)
        # this procedure accepts energy storage power station id or
        # energy storage power station uuid to identify a energy storage power station
        hybrid_power_station_id = req.params.get('id')
        hybrid_power_station_uuid = req.params.get('uuid')
        period_type = req.params.get('periodtype')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if hybrid_power_station_id is None and hybrid_power_station_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        if hybrid_power_station_id is not None:
            hybrid_power_station_id = str.strip(hybrid_power_station_id)
            if not hybrid_power_station_id.isdigit() or int(hybrid_power_station_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_HYBRID_POWER_STATION_ID')

        if hybrid_power_station_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(hybrid_power_station_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_HYBRID_POWER_STATION_UUID')

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

        trans = utilities.get_translation(language)
        trans.install()
        _ = trans.gettext

        ################################################################################################################
        # Step 2: query the energy storage power station
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        # query all contacts in system
        query = (" SELECT id, name, uuid "
                 " FROM tbl_contacts ")
        cursor_system.execute(query)
        rows_contacts = cursor_system.fetchall()

        contact_dict = dict()
        if rows_contacts is not None and len(rows_contacts) > 0:
            for row in rows_contacts:
                contact_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}
        # query all cost centers in system
        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor_system.execute(query)
        rows_cost_centers = cursor_system.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        # query all energy categories in system
        cursor_system.execute(" SELECT id, name, unit_of_measure, kgce, kgco2e "
                              " FROM tbl_energy_categories "
                              " ORDER BY id ", )
        rows_energy_categories = cursor_system.fetchall()
        if rows_energy_categories is None or len(rows_energy_categories) == 0:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')
        energy_category_dict = dict()
        for row_energy_category in rows_energy_categories:
            energy_category_dict[row_energy_category[0]] = {"name": row_energy_category[1],
                                                            "unit_of_measure": row_energy_category[2],
                                                            "kgce": row_energy_category[3],
                                                            "kgco2e": row_energy_category[4]}

        if hybrid_power_station_id is not None:
            query = (" SELECT id, name, uuid, "
                     "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                     "        contact_id, cost_center_id "
                     " FROM tbl_hybrid_power_stations "
                     " WHERE id = %s ")
            cursor_system.execute(query, (hybrid_power_station_id,))
            row = cursor_system.fetchone()
        elif hybrid_power_station_uuid is not None:
            query = (" SELECT id, name, uuid, "
                     "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                     "        contact_id, cost_center_id "
                     " FROM tbl_hybrid_power_stations "
                     " WHERE uuid = %s ")
            cursor_system.execute(query, (hybrid_power_station_uuid,))
            row = cursor_system.fetchone()

        if row is None:
            cursor_system.close()
            cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_NOT_FOUND')
        else:
            hybrid_power_station_id = row[0]
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "address": row[3],
                           "postal_code": row[4],
                           "latitude": row[5],
                           "longitude": row[6],
                           "rated_capacity": row[7],
                           "rated_power": row[8],
                           "contact": contact_dict.get(row[9], None),
                           "cost_center": cost_center_dict.get(row[10], None),
                           "qrcode": 'hybrid_power_station:' + row[2]}

        ################################################################################################################
        # Step 3: query energy charge
        ################################################################################################################
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        energy_category_id = 1  # electricity
        meta_report_list = list()

        cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                              " FROM tbl_hybrid_power_station_charge_hourly "
                              " WHERE hybrid_power_station_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s "
                              " ORDER BY start_datetime_utc ",
                              (hybrid_power_station_id,
                               reporting_start_datetime_utc,
                               reporting_end_datetime_utc))
        rows_hourly = cursor_energy.fetchall()
        if rows_hourly is not None and len(rows_hourly) > 0:
            rows_periodically = utilities.aggregate_hourly_data_by_period(rows_hourly,
                                                                          reporting_start_datetime_utc,
                                                                          reporting_end_datetime_utc,
                                                                          period_type)
            meta_report = dict()
            meta_report['name'] = '充'
            meta_report['energy_category_id'] = energy_category_id
            meta_report['unit_of_measure'] = energy_category_dict[1]['unit_of_measure']
            meta_report['timestamps'] = list()
            meta_report['values'] = list()
            meta_report['subtotal'] = Decimal(0.0)
            meta_report['toppeak'] = Decimal(0.0)
            meta_report['onpeak'] = Decimal(0.0)
            meta_report['midpeak'] = Decimal(0.0)
            meta_report['offpeak'] = Decimal(0.0)
            meta_report['deep'] = Decimal(0.0)

            for row_periodically in rows_periodically:
                current_datetime_local = row_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_periodically[1] is None else row_periodically[1]
                meta_report['timestamps'].append(current_datetime)
                meta_report['values'].append(actual_value)
                meta_report['subtotal'] += actual_value

            tariff_dict = utilities.get_energy_category_peak_types(meta_result['cost_center']['id'],
                                                                   energy_category_id,
                                                                   reporting_start_datetime_utc,
                                                                   reporting_end_datetime_utc)
            for row in rows_hourly:
                peak_type = tariff_dict.get(row[0], None)
                if peak_type == 'toppeak':
                    meta_report['toppeak'] += row[1]
                elif peak_type == 'onpeak':
                    meta_report['onpeak'] += row[1]
                elif peak_type == 'midpeak':
                    meta_report['midpeak'] += row[1]
                elif peak_type == 'offpeak':
                    meta_report['offpeak'] += row[1]
                elif peak_type == 'deep':
                    meta_report['deep'] += row[1]

            meta_report_list.append(meta_report)

        ################################################################################################################
        # Step 4: query energy discharge
        ################################################################################################################
        cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                              " FROM tbl_hybrid_power_station_discharge_hourly "
                              " WHERE hybrid_power_station_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s "
                              " ORDER BY start_datetime_utc ",
                              (hybrid_power_station_id,
                               reporting_start_datetime_utc,
                               reporting_end_datetime_utc))
        rows_hourly = cursor_energy.fetchall()
        if rows_hourly is not None and len(rows_hourly) > 0:
            rows_meter_periodically = utilities.aggregate_hourly_data_by_period(rows_hourly,
                                                                                reporting_start_datetime_utc,
                                                                                reporting_end_datetime_utc,
                                                                                period_type)
            meta_report = dict()
            meta_report['name'] = '放'
            meta_report['energy_category_id'] = energy_category_id
            meta_report['unit_of_measure'] = energy_category_dict[1]['unit_of_measure']
            meta_report['timestamps'] = list()
            meta_report['values'] = list()
            meta_report['subtotal'] = Decimal(0.0)
            meta_report['toppeak'] = Decimal(0.0)
            meta_report['onpeak'] = Decimal(0.0)
            meta_report['midpeak'] = Decimal(0.0)
            meta_report['offpeak'] = Decimal(0.0)
            meta_report['deep'] = Decimal(0.0)

            for row_periodically in rows_meter_periodically:
                current_datetime_local = row_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_periodically[1] is None else row_periodically[1]
                meta_report['timestamps'].append(current_datetime)
                meta_report['values'].append(actual_value)
                meta_report['subtotal'] += actual_value

            tariff_dict = utilities.get_energy_category_peak_types(meta_result['cost_center']['id'],
                                                                   energy_category_id,
                                                                   reporting_start_datetime_utc,
                                                                   reporting_end_datetime_utc)
            for row in rows_hourly:
                peak_type = tariff_dict.get(row[0], None)
                if peak_type == 'toppeak':
                    meta_report['toppeak'] += row[1]
                elif peak_type == 'onpeak':
                    meta_report['onpeak'] += row[1]
                elif peak_type == 'midpeak':
                    meta_report['midpeak'] += row[1]
                elif peak_type == 'offpeak':
                    meta_report['offpeak'] += row[1]
                elif peak_type == 'deep':
                    meta_report['deep'] += row[1]

            meta_report_list.append(meta_report)
        ################################################################################################################
        # Step 5: query energy fuel
        ################################################################################################################
        cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                              " FROM tbl_hybrid_power_station_fuel_hourly "
                              " WHERE hybrid_power_station_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s "
                              " ORDER BY start_datetime_utc ",
                              (hybrid_power_station_id,
                               reporting_start_datetime_utc,
                               reporting_end_datetime_utc))
        rows_hourly = cursor_energy.fetchall()
        if rows_hourly is not None and len(rows_hourly) > 0:
            rows_periodically = utilities.aggregate_hourly_data_by_period(rows_hourly,
                                                                          reporting_start_datetime_utc,
                                                                          reporting_end_datetime_utc,
                                                                          period_type)
            meta_report = dict()
            meta_report['name'] = '油'
            meta_report['energy_category_id'] = 2  # fuel
            meta_report['unit_of_measure'] = energy_category_dict[2]['unit_of_measure']
            meta_report['timestamps'] = list()
            meta_report['values'] = list()
            meta_report['subtotal'] = Decimal(0.0)
            meta_report['toppeak'] = Decimal(0.0)
            meta_report['onpeak'] = Decimal(0.0)
            meta_report['midpeak'] = Decimal(0.0)
            meta_report['offpeak'] = Decimal(0.0)
            meta_report['deep'] = Decimal(0.0)

            for row_periodically in rows_periodically:
                current_datetime_local = row_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_periodically[1] is None else row_periodically[1]
                meta_report['timestamps'].append(current_datetime)
                meta_report['values'].append(actual_value)
                meta_report['subtotal'] += actual_value

            tariff_dict = utilities.get_energy_category_peak_types(meta_result['cost_center']['id'],
                                                                   2,  # fuel
                                                                   reporting_start_datetime_utc,
                                                                   reporting_end_datetime_utc)
            for row in rows_hourly:
                peak_type = tariff_dict.get(row[0], None)
                if peak_type == 'toppeak':
                    meta_report['toppeak'] += row[1]
                elif peak_type == 'onpeak':
                    meta_report['onpeak'] += row[1]
                elif peak_type == 'midpeak':
                    meta_report['midpeak'] += row[1]
                elif peak_type == 'offpeak':
                    meta_report['offpeak'] += row[1]
                elif peak_type == 'deep':
                    meta_report['deep'] += row[1]

            meta_report_list.append(meta_report)

        ################################################################################################################
        # Step 6: query energy grid buy
        ################################################################################################################
        cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                              " FROM tbl_hybrid_power_station_grid_buy_hourly "
                              " WHERE hybrid_power_station_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s "
                              " ORDER BY start_datetime_utc ",
                              (hybrid_power_station_id,
                               reporting_start_datetime_utc,
                               reporting_end_datetime_utc))
        rows_hourly = cursor_energy.fetchall()
        if rows_hourly is not None and len(rows_hourly) > 0:
            rows_periodically = utilities.aggregate_hourly_data_by_period(rows_hourly,
                                                                                reporting_start_datetime_utc,
                                                                                reporting_end_datetime_utc,
                                                                                period_type)
            meta_report = dict()
            meta_report['name'] = '购'
            meta_report['energy_category_id'] = energy_category_id
            meta_report['unit_of_measure'] = energy_category_dict[1]['unit_of_measure']
            meta_report['timestamps'] = list()
            meta_report['values'] = list()
            meta_report['subtotal'] = Decimal(0.0)
            meta_report['toppeak'] = Decimal(0.0)
            meta_report['onpeak'] = Decimal(0.0)
            meta_report['midpeak'] = Decimal(0.0)
            meta_report['offpeak'] = Decimal(0.0)
            meta_report['deep'] = Decimal(0.0)

            for row_periodically in rows_periodically:
                current_datetime_local = row_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_periodically[1] is None else row_periodically[1]
                meta_report['timestamps'].append(current_datetime)
                meta_report['values'].append(actual_value)
                meta_report['subtotal'] += actual_value

            tariff_dict = utilities.get_energy_category_peak_types(meta_result['cost_center']['id'],
                                                                   energy_category_id,
                                                                   reporting_start_datetime_utc,
                                                                   reporting_end_datetime_utc)
            for row in rows_hourly:
                peak_type = tariff_dict.get(row[0], None)
                if peak_type == 'toppeak':
                    meta_report['toppeak'] += row[1]
                elif peak_type == 'onpeak':
                    meta_report['onpeak'] += row[1]
                elif peak_type == 'midpeak':
                    meta_report['midpeak'] += row[1]
                elif peak_type == 'offpeak':
                    meta_report['offpeak'] += row[1]
                elif peak_type == 'deep':
                    meta_report['deep'] += row[1]

            meta_report_list.append(meta_report)

        ################################################################################################################
        # Step 7: query energy grid sell
        ################################################################################################################
        cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                              " FROM tbl_hybrid_power_station_grid_sell_hourly "
                              " WHERE hybrid_power_station_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s "
                              " ORDER BY start_datetime_utc ",
                              (hybrid_power_station_id,
                               reporting_start_datetime_utc,
                               reporting_end_datetime_utc))
        rows_hourly = cursor_energy.fetchall()
        if rows_hourly is not None and len(rows_hourly) > 0:
            rows_periodically = utilities.aggregate_hourly_data_by_period(rows_hourly,
                                                                                reporting_start_datetime_utc,
                                                                                reporting_end_datetime_utc,
                                                                                period_type)
            meta_report = dict()
            meta_report['name'] = '售'
            meta_report['energy_category_id'] = energy_category_id
            meta_report['unit_of_measure'] = energy_category_dict[1]['unit_of_measure']
            meta_report['timestamps'] = list()
            meta_report['values'] = list()
            meta_report['subtotal'] = Decimal(0.0)
            meta_report['toppeak'] = Decimal(0.0)
            meta_report['onpeak'] = Decimal(0.0)
            meta_report['midpeak'] = Decimal(0.0)
            meta_report['offpeak'] = Decimal(0.0)
            meta_report['deep'] = Decimal(0.0)

            for row_periodically in rows_periodically:
                current_datetime_local = row_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_periodically[1] is None else row_periodically[1]
                meta_report['timestamps'].append(current_datetime)
                meta_report['values'].append(actual_value)
                meta_report['subtotal'] += actual_value

            tariff_dict = utilities.get_energy_category_peak_types(meta_result['cost_center']['id'],
                                                                   energy_category_id,
                                                                   reporting_start_datetime_utc,
                                                                   reporting_end_datetime_utc)
            for row in rows_hourly:
                peak_type = tariff_dict.get(row[0], None)
                if peak_type == 'toppeak':
                    meta_report['toppeak'] += row[1]
                elif peak_type == 'onpeak':
                    meta_report['onpeak'] += row[1]
                elif peak_type == 'midpeak':
                    meta_report['midpeak'] += row[1]
                elif peak_type == 'offpeak':
                    meta_report['offpeak'] += row[1]
                elif peak_type == 'deep':
                    meta_report['deep'] += row[1]

            meta_report_list.append(meta_report)

        ################################################################################################################
        # Step 8: query energy load
        ################################################################################################################
        cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                              " FROM tbl_hybrid_power_station_load_hourly "
                              " WHERE hybrid_power_station_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s "
                              " ORDER BY start_datetime_utc ",
                              (hybrid_power_station_id,
                               reporting_start_datetime_utc,
                               reporting_end_datetime_utc))
        rows_hourly = cursor_energy.fetchall()
        if rows_hourly is not None and len(rows_hourly) > 0:
            rows_periodically = utilities.aggregate_hourly_data_by_period(rows_hourly,
                                                                          reporting_start_datetime_utc,
                                                                          reporting_end_datetime_utc,
                                                                          period_type)
            meta_report = dict()
            meta_report['name'] = '荷'
            meta_report['energy_category_id'] = energy_category_id
            meta_report['unit_of_measure'] = energy_category_dict[1]['unit_of_measure']
            meta_report['timestamps'] = list()
            meta_report['values'] = list()
            meta_report['subtotal'] = Decimal(0.0)
            meta_report['toppeak'] = Decimal(0.0)
            meta_report['onpeak'] = Decimal(0.0)
            meta_report['midpeak'] = Decimal(0.0)
            meta_report['offpeak'] = Decimal(0.0)
            meta_report['deep'] = Decimal(0.0)

            for row_periodically in rows_periodically:
                current_datetime_local = row_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_periodically[1] is None else row_periodically[1]
                meta_report['timestamps'].append(current_datetime)
                meta_report['values'].append(actual_value)
                meta_report['subtotal'] += actual_value

            tariff_dict = utilities.get_energy_category_peak_types(meta_result['cost_center']['id'],
                                                                   energy_category_id,
                                                                   reporting_start_datetime_utc,
                                                                   reporting_end_datetime_utc)
            for row in rows_hourly:
                peak_type = tariff_dict.get(row[0], None)
                if peak_type == 'toppeak':
                    meta_report['toppeak'] += row[1]
                elif peak_type == 'onpeak':
                    meta_report['onpeak'] += row[1]
                elif peak_type == 'midpeak':
                    meta_report['midpeak'] += row[1]
                elif peak_type == 'offpeak':
                    meta_report['offpeak'] += row[1]
                elif peak_type == 'deep':
                    meta_report['deep'] += row[1]

            meta_report_list.append(meta_report)

        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_energy:
            cursor_energy.close()
        if cnx_energy:
            cnx_energy.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()
        ################################################################################################################
        # Step 9: construct the report
        ################################################################################################################
        result = dict()
        result['hybrid_power_station'] = meta_result

        result['reporting_period'] = dict()
        result['reporting_period']['names'] = list()
        result['reporting_period']['energy_category_ids'] = list()
        result['reporting_period']['units'] = list()
        result['reporting_period']['subtotals'] = list()
        result['reporting_period']['timestamps'] = list()
        result['reporting_period']['values'] = list()
        result['reporting_period']['toppeaks'] = list()
        result['reporting_period']['onpeaks'] = list()
        result['reporting_period']['midpeaks'] = list()
        result['reporting_period']['offpeaks'] = list()
        result['reporting_period']['deeps'] = list()

        if meta_report_list is not None and len(meta_report_list) > 0:
            for meta_report in meta_report_list:
                result['reporting_period']['names'].append(meta_report['name'])
                result['reporting_period']['energy_category_ids'].append(meta_report['energy_category_id'])
                result['reporting_period']['units'].append(meta_report['unit_of_measure'])
                result['reporting_period']['timestamps'].append(meta_report['timestamps'])
                result['reporting_period']['values'].append(meta_report['values'])
                result['reporting_period']['subtotals'].append(meta_report['subtotal'])
                result['reporting_period']['toppeaks'].append(meta_report['toppeak'])
                result['reporting_period']['onpeaks'].append(meta_report['onpeak'])
                result['reporting_period']['midpeaks'].append(meta_report['midpeak'])
                result['reporting_period']['offpeaks'].append(meta_report['offpeak'])
                result['reporting_period']['deeps'].append(meta_report['deep'])

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.hybridpowerstationreportingenergy.\
                export(result,
                       result['hybrid_power_station']['name'],
                       reporting_period_start_datetime_local,
                       reporting_period_end_datetime_local,
                       period_type,
                       language)
        resp.text = json.dumps(result)
