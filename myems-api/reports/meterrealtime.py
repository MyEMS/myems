"""
Meter Real-time Report API

This module provides REST API endpoints for generating meter real-time reports.
It monitors and reports on real-time meter data and readings to provide
immediate insights into current energy consumption and system performance.

Key Features:
- Real-time meter data monitoring
- Live energy consumption tracking
- Real-time performance metrics
- Current system status reporting
- Performance monitoring
- Alert generation

Report Components:
- Real-time meter readings
- Current energy consumption data
- Live performance metrics
- System status indicators
- Performance alerts
- Real-time trends

The module uses Falcon framework for REST API and includes:
- Real-time data queries
- Live monitoring capabilities
- Performance tracking
- Alert management
- Multi-language support
- User authentication and authorization
"""

import re
from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
import config
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

        # if turn quick mode on, do not return parameters data and excel file
        is_quick_mode = False
        if quick_mode is not None and \
                len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        reporting_end_datetime_utc = datetime.utcnow()
        reporting_start_datetime_utc = reporting_end_datetime_utc - timedelta(minutes=60)
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
        # Step 7: query associated points data
        ################################################################################################################
        energy_value_data = dict()
        energy_value_data['name'] = None
        energy_value_data['timestamps'] = list()
        energy_value_data['values'] = list()

        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()

        if not is_quick_mode:
            for point in point_list:
                point_values = []
                point_timestamps = []
                if point['object_type'] == 'ENERGY_VALUE':
                    energy_value_data['name'] = point['name'] + ' (' + point['units'] + ')'
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
                            energy_value_data['timestamps'].append(current_datetime)
                            energy_value_data['values'].append(row[1])
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
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])

                    parameters_data['names'].append(point['name'] + ' (' + point['units'] + ')')
                    parameters_data['timestamps'].append(point_timestamps)
                    parameters_data['values'].append(point_values)
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
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])

                    parameters_data['names'].append(point['name'] + ' (' + point['units'] + ')')
                    parameters_data['timestamps'].append(point_timestamps)
                    parameters_data['values'].append(point_values)

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
            },
            "energy_value": energy_value_data,
            "parameters": {
                "names": parameters_data['names'],
                "timestamps": parameters_data['timestamps'],
                "values": parameters_data['values']
            },

        }

        resp.text = json.dumps(result)
