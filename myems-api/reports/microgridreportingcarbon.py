"""
Microgrid Reporting Carbon Report API

This module provides REST API endpoints for generating microgrid reporting carbon emissions reports.
It analyzes carbon dioxide emissions from microgrid operations with detailed reporting,
providing insights into environmental impact and carbon footprint reduction opportunities.

Key Features:
- Microgrid carbon emissions analysis
- Base period vs reporting period comparison
- Time-of-use carbon breakdown
- Carbon footprint calculations
- Excel export functionality
- Environmental impact assessment

Report Components:
- Microgrid carbon emissions summary
- Base period comparison data
- Time-of-use carbon breakdown
- Carbon footprint metrics
- Environmental impact indicators
- Reduction opportunity analysis

The module uses Falcon framework for REST API and includes:
- Database queries for carbon data
- Carbon emission calculations
- Time-of-use analysis
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
import excelexporters.microgridreportingcarbon
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
    # Step 2: query the microgrid
    # Step 3: query associated batteries
    # Step 4: query associated ev chargers
    # Step 5: query associated generators
    # Step 6: query associated grids
    # Step 7: query associated heat pumps
    # Step 8: query associated loads
    # Step 9: query associated photovoltaics
    # Step 10: query associated power conversion systems
    # Step 11: query associated sensors
    # Step 12: query associated meters data
    # Step 13: query associated points data
    # Step 14: construct the report
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
        # this procedure accepts microgrid id or
        # microgrid uuid to identify a microgrid
        microgrid_id = req.params.get('id')
        microgrid_uuid = req.params.get('uuid')
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
        if microgrid_id is None and microgrid_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')

        if microgrid_id is not None:
            microgrid_id = str.strip(microgrid_id)
            if not microgrid_id.isdigit() or int(microgrid_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_MICROGRID_ID')

        if microgrid_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(microgrid_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_MICROGRID_UUID')

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
        # Step 2: query the microgrid
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        cnx_carbon = mysql.connector.connect(**config.myems_carbon_db)
        cursor_carbon = cnx_carbon.cursor()

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

        if microgrid_id is not None:
            query = (" SELECT id, name, uuid, "
                     "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                     "        contact_id, cost_center_id "
                     " FROM tbl_microgrids "
                     " WHERE id = %s ")
            cursor_system.execute(query, (microgrid_id,))
            row = cursor_system.fetchone()
        elif microgrid_uuid is not None:
            query = (" SELECT id, name, uuid, "
                     "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                     "        contact_id, cost_center_id "
                     " FROM tbl_microgrids "
                     " WHERE uuid = %s ")
            cursor_system.execute(query, (microgrid_uuid,))
            row = cursor_system.fetchone()

        if row is None:
            cursor_system.close()
            cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')
        else:
            microgrid_id = row[0]
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
                           "qrcode": 'microgrid:' + row[2]}

        point_list = list()
        meter_list = list()

        ################################################################################################################
        # Step 4: query associated batteries data
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, mb.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_batteries mb, tbl_points p "
                              " WHERE mb.microgrid_id = %s AND mb.soc_point_id = p.id ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1] + '.SOC',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT p.id, mb.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_batteries mb, tbl_points p "
                              " WHERE mb.microgrid_id = %s AND mb.power_point_id = p.id ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1]+'.P',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT m.id, mb.name, m.energy_category_id  "
                              " FROM tbl_microgrids_batteries mb, tbl_meters m "
                              " WHERE mb.microgrid_id = %s AND mb.charge_meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '-Charge',
                               "energy_category_id": row_meter[2]})

        cursor_system.execute(" SELECT m.id, mb.name, m.energy_category_id  "
                              " FROM tbl_microgrids_batteries mb, tbl_meters m "
                              " WHERE mb.microgrid_id = %s AND mb.discharge_meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '-Discharge',
                               "energy_category_id": row_meter[2]})

        ################################################################################################################
        # Step 4: query associated ev chargers
        ################################################################################################################

        ################################################################################################################
        # Step 5: query associated generators
        ################################################################################################################

        ################################################################################################################
        # Step 6: query associated grids
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, mg.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_grids mg, tbl_points p "
                              " WHERE mg.microgrid_id = %s AND mg.power_point_id = p.id ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1]+'.P',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT m.id, mg.name, m.energy_category_id  "
                              " FROM tbl_microgrids_grids mg, tbl_meters m "
                              " WHERE mg.microgrid_id = %s AND mg.buy_meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '-Buy',
                               "energy_category_id": row_meter[2]})

        cursor_system.execute(" SELECT m.id, mg.name, m.energy_category_id  "
                              " FROM tbl_microgrids_grids mg, tbl_meters m "
                              " WHERE mg.microgrid_id = %s AND mg.sell_meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '-Sell',
                               "energy_category_id": row_meter[2]})

        ################################################################################################################
        # Step 7: query associated heat pumps
        ################################################################################################################

        ################################################################################################################
        # Step 8: query associated loads
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, ml.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_loads ml, tbl_points p "
                              " WHERE ml.microgrid_id = %s AND ml.power_point_id = p.id ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1]+'.P',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT m.id, ml.name, m.energy_category_id  "
                              " FROM tbl_microgrids_loads ml, tbl_meters m "
                              " WHERE ml.microgrid_id = %s AND ml.meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1],
                               "energy_category_id": row_meter[2]})

        ################################################################################################################
        # Step 9: query associated photovoltaics
        ################################################################################################################
        # todo

        ################################################################################################################
        # Step 10: query associated power conversion systems
        ################################################################################################################
        # todo

        ################################################################################################################
        # Step 11: query associated sensors
        ################################################################################################################
        # todo

        ################################################################################################################
        # Step 12: query associated meters data
        ################################################################################################################
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        meter_base_list = list()

        for meter in meter_list:
            cursor_carbon.execute(" SELECT start_datetime_utc, actual_value "
                                  " FROM tbl_meter_hourly "
                                  " WHERE meter_id = %s "
                                  "     AND start_datetime_utc >= %s "
                                  "     AND start_datetime_utc < %s "
                                  " ORDER BY start_datetime_utc ",
                                  (meter['id'],
                                   base_start_datetime_utc,
                                   base_end_datetime_utc))
            rows_meter_hourly = cursor_carbon.fetchall()

            if rows_meter_hourly is not None and len(rows_meter_hourly) > 0:
                print('rows_meter_hourly:' + str(rows_meter_hourly))
                rows_meter_periodically = utilities.aggregate_hourly_data_by_period(rows_meter_hourly,
                                                                                    base_start_datetime_utc,
                                                                                    base_end_datetime_utc,
                                                                                    period_type)
                print('rows_meter_periodically:' + str(rows_meter_periodically))
                meter_report = dict()
                meter_report['timestamps'] = list()
                meter_report['values'] = list()
                meter_report['subtotal'] = Decimal(0.0)

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

                    meter_report['timestamps'].append(current_datetime)
                    meter_report['values'].append(actual_value)
                    meter_report['subtotal'] += actual_value
                    meter_report['name'] = meter['name']
                    meter_report['unit_of_measure'] = \
                        energy_category_dict[meter['energy_category_id']]['unit_of_measure']

                meter_base_list.append(meter_report)

        meter_reporting_list = list()

        for meter in meter_list:
            cursor_carbon.execute(" SELECT start_datetime_utc, actual_value "
                                  " FROM tbl_meter_hourly "
                                  " WHERE meter_id = %s "
                                  "     AND start_datetime_utc >= %s "
                                  "     AND start_datetime_utc < %s "
                                  " ORDER BY start_datetime_utc ",
                                  (meter['id'],
                                   reporting_start_datetime_utc,
                                   reporting_end_datetime_utc))
            rows_meter_hourly = cursor_carbon.fetchall()
            if rows_meter_hourly is not None and len(rows_meter_hourly) > 0:
                rows_meter_periodically = utilities.aggregate_hourly_data_by_period(rows_meter_hourly,
                                                                                    reporting_start_datetime_utc,
                                                                                    reporting_end_datetime_utc,
                                                                                    period_type)
                meter_report = dict()
                meter_report['timestamps'] = list()
                meter_report['values'] = list()
                meter_report['subtotal'] = Decimal(0.0)

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

                    meter_report['timestamps'].append(current_datetime)
                    meter_report['values'].append(actual_value)
                    meter_report['subtotal'] += actual_value
                    meter_report['name'] = meter['name']
                    meter_report['unit_of_measure'] = \
                        energy_category_dict[meter['energy_category_id']]['unit_of_measure']

                meter_reporting_list.append(meter_report)

        ################################################################################################################
        # Step 13: query associated points data
        ################################################################################################################

        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()

        for point in point_list:
            point_values = []
            point_timestamps = []
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
                    reporting_start_datetime_local = reporting_start_datetime_utc.replace(tzinfo=timezone.utc) + \
                                                     timedelta(minutes=timezone_offset)
                    current_datetime_local = reporting_start_datetime_local

                    while current_datetime_local < rows[0][0].replace(tzinfo=timezone.utc) + \
                            timedelta(minutes=timezone_offset):
                        point_timestamps.append(current_datetime_local.isoformat()[5:16])
                        point_values.append(rows[0][1])
                        current_datetime_local += timedelta(minutes=1)

                    for index in range(len(rows) - 1):
                        while current_datetime_local < rows[index + 1][0].replace(tzinfo=timezone.utc) + \
                                timedelta(minutes=timezone_offset):
                            point_timestamps.append(current_datetime_local.isoformat()[5:16])
                            point_values.append(rows[index][1])
                            current_datetime_local += timedelta(minutes=1)
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
                    reporting_start_datetime_local = reporting_start_datetime_utc.replace(tzinfo=timezone.utc) + \
                                                     timedelta(minutes=timezone_offset)
                    current_datetime_local = reporting_start_datetime_local

                    while current_datetime_local < rows[0][0].replace(tzinfo=timezone.utc) + \
                            timedelta(minutes=timezone_offset):
                        point_timestamps.append(current_datetime_local.isoformat()[5:16])
                        point_values.append(rows[0][1])
                        current_datetime_local += timedelta(minutes=1)

                    for index in range(len(rows) - 1):
                        while current_datetime_local < rows[index + 1][0].replace(tzinfo=timezone.utc) + \
                                timedelta(minutes=timezone_offset):
                            point_timestamps.append(current_datetime_local.isoformat()[5:16])
                            point_values.append(rows[index][1])
                            current_datetime_local += timedelta(minutes=1)
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
                    reporting_start_datetime_local = reporting_start_datetime_utc.replace(tzinfo=timezone.utc) + \
                                                     timedelta(minutes=timezone_offset)
                    current_datetime_local = reporting_start_datetime_local

                    while current_datetime_local < rows[0][0].replace(tzinfo=timezone.utc) + \
                            timedelta(minutes=timezone_offset):
                        point_timestamps.append(current_datetime_local.isoformat()[5:16])
                        point_values.append(rows[0][1])
                        current_datetime_local += timedelta(minutes=1)

                    for index in range(len(rows) - 1):
                        while current_datetime_local < rows[index + 1][0].replace(tzinfo=timezone.utc) + \
                                timedelta(minutes=timezone_offset):
                            point_timestamps.append(current_datetime_local.isoformat()[5:16])
                            point_values.append(rows[index][1])
                            current_datetime_local += timedelta(minutes=1)

            parameters_data['names'].append(point['name'] + ' (' + point['units'] + ')')
            parameters_data['timestamps'].append(point_timestamps)
            parameters_data['values'].append(point_values)

        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_carbon:
            cursor_carbon.close()
        if cnx_carbon:
            cnx_carbon.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()
        ################################################################################################################
        # Step 14: construct the report
        ################################################################################################################
        result = dict()
        result['microgrid'] = meta_result
        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }
        result['base_period'] = dict()
        result['base_period']['names'] = list()
        result['base_period']['units'] = list()
        result['base_period']['timestamps'] = list()
        result['base_period']['values'] = list()
        result['base_period']['subtotals'] = list()

        if meter_base_list is not None and len(meter_base_list) > 0:
            for meter_report in meter_base_list:
                result['base_period']['names'].append(meter_report['name'])
                result['base_period']['units'].append(meter_report['unit_of_measure'])
                result['base_period']['timestamps'].append(meter_report['timestamps'])
                result['base_period']['values'].append(meter_report['values'])
                result['base_period']['subtotals'].append(meter_report['subtotal'])

        result['reporting_period'] = dict()
        result['reporting_period']['names'] = list()
        result['reporting_period']['units'] = list()
        result['reporting_period']['subtotals'] = list()
        result['reporting_period']['increment_rates'] = list()
        result['reporting_period']['timestamps'] = list()
        result['reporting_period']['values'] = list()

        if meter_reporting_list is not None and len(meter_reporting_list) > 0:
            for meter_report in meter_reporting_list:
                result['reporting_period']['names'].append(meter_report['name'])
                result['reporting_period']['units'].append(meter_report['unit_of_measure'])
                result['reporting_period']['timestamps'].append(meter_report['timestamps'])
                result['reporting_period']['values'].append(meter_report['values'])
                result['reporting_period']['subtotals'].append(meter_report['subtotal'])

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.microgridreportingcarbon.\
                export(result,
                       result['microgrid']['name'],
                       reporting_period_start_datetime_local,
                       reporting_period_end_datetime_local,
                       base_period_start_datetime_local,
                       base_period_end_datetime_local,
                       period_type,
                       language)
        resp.text = json.dumps(result)
