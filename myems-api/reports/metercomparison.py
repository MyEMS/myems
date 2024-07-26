import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.metercomparison
from core import utilities
from core.useractivity import access_control, api_key_control


class Reporting:
    def __init__(self):
        """"Initializes Reporting"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the meter and energy category
    # Step 3: query associated points
    # Step 4: query reporting period energy consumption
    # Step 5: query associated points data
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
        # this procedure accepts meter id or meter uuid to identify a meter
        meter_id1 = req.params.get('meterid1')
        meter_uuid1 = req.params.get('meteruuid1')
        meter_id2 = req.params.get('meterid2')
        meter_uuid2 = req.params.get('meteruuid2')
        period_type = req.params.get('periodtype')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if meter_id1 is None and meter_uuid1 is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_METER_ID')

        if meter_id1 is not None:
            meter_id1 = str.strip(meter_id1)
            if not meter_id1.isdigit() or int(meter_id1) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_METER_ID')

        if meter_uuid1 is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(meter_uuid1))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_METER_UUID')

        if meter_id2 is None and meter_uuid2 is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        if meter_id2 is not None:
            meter_id2 = str.strip(meter_id2)
            if not meter_id2.isdigit() or int(meter_id2) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_METER_ID')

        if meter_uuid2 is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(meter_uuid2))
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

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if meter_id1 is not None:
            cursor_system.execute(" SELECT m.id, m.name, m.energy_category_id, ec.name, ec.unit_of_measure "
                                  " FROM tbl_meters m, tbl_energy_categories ec "
                                  " WHERE m.id = %s AND m.energy_category_id = ec.id ", (meter_id1,))
            row_meter1 = cursor_system.fetchone()
        elif meter_uuid1 is not None:
            cursor_system.execute(" SELECT m.id, m.name, m.energy_category_id, ec.name, ec.unit_of_measure "
                                  " FROM tbl_meters m, tbl_energy_categories ec "
                                  " WHERE m.uuid = %s AND m.energy_category_id = ec.id ", (meter_uuid1,))
            row_meter1 = cursor_system.fetchone()

        if row_meter1 is None:
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
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.METER_NOT_FOUND')

        meter1 = dict()
        meter1['id'] = row_meter1[0]
        meter1['name'] = row_meter1[1]
        meter1['energy_category_id'] = row_meter1[2]
        meter1['energy_category_name'] = row_meter1[3]
        meter1['unit_of_measure'] = row_meter1[4]

        if meter_id2 is not None:
            cursor_system.execute(" SELECT m.id, m.name, m.energy_category_id, ec.name, ec.unit_of_measure "
                                  " FROM tbl_meters m, tbl_energy_categories ec "
                                  " WHERE m.id = %s AND m.energy_category_id = ec.id ", (meter_id2,))
            row_meter2 = cursor_system.fetchone()
        elif meter_uuid2 is not None:
            cursor_system.execute(" SELECT m.id, m.name, m.energy_category_id, ec.name, ec.unit_of_measure "
                                  " FROM tbl_meters m, tbl_energy_categories ec "
                                  " WHERE m.uuid = %s AND m.energy_category_id = ec.id ", (meter_uuid2,))
            row_meter2 = cursor_system.fetchone()

        if row_meter2 is None:
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
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.METER_NOT_FOUND')

        meter2 = dict()
        meter2['id'] = row_meter2[0]
        meter2['name'] = row_meter2[1]
        meter2['energy_category_id'] = row_meter2[2]
        meter2['energy_category_name'] = row_meter2[3]
        meter2['unit_of_measure'] = row_meter2[4]
        ################################################################################################################
        # Step 3: query associated points
        ################################################################################################################
        point_list1 = list()
        cursor_system.execute(" SELECT p.id, p.name, p.units, p.object_type  "
                              " FROM tbl_meters m, tbl_meters_points mp, tbl_points p "
                              " WHERE m.id = %s AND m.id = mp.meter_id AND mp.point_id = p.id "
                              " ORDER BY p.id ", (meter1['id'],))
        rows_points1 = cursor_system.fetchall()
        if rows_points1 is not None and len(rows_points1) > 0:
            for row in rows_points1:
                point_list1.append({"id": row[0], "name": row[1], "units": row[2], "object_type": row[3]})

        point_list2 = list()
        cursor_system.execute(" SELECT p.id, p.name, p.units, p.object_type  "
                              " FROM tbl_meters m, tbl_meters_points mp, tbl_points p "
                              " WHERE m.id = %s AND m.id = mp.meter_id AND mp.point_id = p.id "
                              " ORDER BY p.id ", (meter2['id'],))
        rows_points2 = cursor_system.fetchall()
        if rows_points2 is not None and len(rows_points2) > 0:
            for row in rows_points2:
                point_list2.append({"id": row[0], "name": row[1], "units": row[2], "object_type": row[3]})
        ################################################################################################################
        # Step 4: query reporting period energy consumption
        ################################################################################################################
        query1 = (" SELECT start_datetime_utc, actual_value "
                  " FROM tbl_meter_hourly "
                  " WHERE meter_id = %s "
                  " AND start_datetime_utc >= %s "
                  " AND start_datetime_utc < %s "
                  " ORDER BY start_datetime_utc ")
        cursor_energy.execute(query1, (meter1['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_meter1_hourly = cursor_energy.fetchall()

        rows_meter1_periodically = utilities.aggregate_hourly_data_by_period(rows_meter1_hourly,
                                                                             reporting_start_datetime_utc,
                                                                             reporting_end_datetime_utc,
                                                                             period_type)
        reporting1 = dict()
        reporting1['timestamps'] = list()
        reporting1['values'] = list()
        reporting1['total_in_category'] = Decimal(0.0)

        for row_meter1_periodically in rows_meter1_periodically:
            current_datetime_local = row_meter1_periodically[0].replace(tzinfo=timezone.utc) + \
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

            actual_value = Decimal(0.0) if row_meter1_periodically[1] is None else row_meter1_periodically[1]

            reporting1['timestamps'].append(current_datetime)
            reporting1['values'].append(actual_value)
            reporting1['total_in_category'] += actual_value

        query2 = (" SELECT start_datetime_utc, actual_value "
                  " FROM tbl_meter_hourly "
                  " WHERE meter_id = %s "
                  " AND start_datetime_utc >= %s "
                  " AND start_datetime_utc < %s "
                  " ORDER BY start_datetime_utc ")
        cursor_energy.execute(query2, (meter2['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_meter2_hourly = cursor_energy.fetchall()

        rows_meter2_periodically = utilities.aggregate_hourly_data_by_period(rows_meter2_hourly,
                                                                             reporting_start_datetime_utc,
                                                                             reporting_end_datetime_utc,
                                                                             period_type)
        reporting2 = dict()
        diff = dict()
        reporting2['timestamps'] = list()
        reporting2['values'] = list()
        reporting2['total_in_category'] = Decimal(0.0)
        diff['values'] = list()
        diff['total_in_category'] = Decimal(0.0)

        for row_meter2_periodically in rows_meter2_periodically:
            current_datetime_local = row_meter2_periodically[0].replace(tzinfo=timezone.utc) + \
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

            actual_value = Decimal(0.0) if row_meter2_periodically[1] is None else row_meter2_periodically[1]

            reporting2['timestamps'].append(current_datetime)
            reporting2['values'].append(actual_value)
            reporting2['total_in_category'] += actual_value
        
        for meter1_value, meter2_value in zip(reporting1['values'], reporting2['values']):
            diff['values'].append(meter1_value - meter2_value)
            diff['total_in_category'] += meter1_value - meter2_value
        ################################################################################################################
        # Step 5: query associated points data
        ################################################################################################################
        parameters_data1 = dict()
        parameters_data1['names'] = list()
        parameters_data1['timestamps'] = list()
        parameters_data1['values'] = list()

        if not is_quick_mode:
            for point in point_list1:
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
                        for row in rows:
                            current_datetime_local = row[0].replace(tzinfo=timezone.utc) + \
                                                     timedelta(minutes=timezone_offset)
                            current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])
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
                            current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])
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
                            current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])

                parameters_data1['names'].append(point['name'] + ' (' + point['units'] + ')')
                parameters_data1['timestamps'].append(point_timestamps)
                parameters_data1['values'].append(point_values)

        parameters_data2 = dict()
        parameters_data2['names'] = list()
        parameters_data2['timestamps'] = list()
        parameters_data2['values'] = list()
        if not is_quick_mode:
            for point in point_list2:
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
                        for row in rows:
                            current_datetime_local = row[0].replace(tzinfo=timezone.utc) + \
                                                     timedelta(minutes=timezone_offset)
                            current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])
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
                            current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])
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
                            current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])

                parameters_data2['names'].append(point['name'] + ' (' + point['units'] + ')')
                parameters_data2['timestamps'].append(point_timestamps)
                parameters_data2['values'].append(point_values)
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

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()
        result = {
            "meter1": {
                "name": meter1['name'],
                "energy_category_id": meter1['energy_category_id'],
                "energy_category_name": meter1['energy_category_name'],
                "unit_of_measure": meter1['unit_of_measure'],
            },
            "reporting_period1": {
                "total_in_category": reporting1['total_in_category'],
                "timestamps": reporting1['timestamps'],
                "values": reporting1['values'],
            },
            "parameters1": {
                "names": parameters_data1['names'],
                "timestamps": parameters_data1['timestamps'],
                "values": parameters_data1['values']
            },
            "meter2": {
                "name": meter2['name'],
                "energy_category_id": meter2['energy_category_id'],
                "energy_category_name": meter2['energy_category_name'],
                "unit_of_measure": meter2['unit_of_measure'],
            },
            "reporting_period2": {
                "total_in_category": reporting2['total_in_category'],
                "timestamps": reporting2['timestamps'],
                "values": reporting2['values'],
            },
            "parameters2": {
                "names": parameters_data2['names'],
                "timestamps": parameters_data2['timestamps'],
                "values": parameters_data2['values']
            },
            "diff": {
                "values": diff['values'],
                "total_in_category": diff['total_in_category'],
            }
        }
        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.metercomparison.export(result,
                                                      meter1['name'],
                                                      meter2['name'],
                                                      reporting_period_start_datetime_local,
                                                      reporting_period_end_datetime_local,
                                                      period_type,
                                                      language)

        resp.text = json.dumps(result)
