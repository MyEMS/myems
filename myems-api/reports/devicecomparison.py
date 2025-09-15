import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.devicecomparison
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
    # Step 2: query the device and energy category
    # Step 3: query associated meters for the specific energy category
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
        # this procedure accepts device id or device uuid to identify a device
        device_id1 = req.params.get('deviceid1')
        device_uuid1 = req.params.get('deviceuuid1')
        device_id2 = req.params.get('deviceid2')
        device_uuid2 = req.params.get('deviceuuid2')
        energy_category_id = req.params.get('energycategoryid')
        period_type = req.params.get('periodtype')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if device_id1 is None and device_uuid1 is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_DEVICE_ID')

        if device_id1 is not None:
            device_id1 = str.strip(device_id1)
            if not device_id1.isdigit() or int(device_id1) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_DEVICE_ID')

        if device_uuid1 is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(device_uuid1))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_DEVICE_UUID')

        if device_id2 is None and device_uuid2 is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DEVICE_ID')

        if device_id2 is not None:
            device_id2 = str.strip(device_id2)
            if not device_id2.isdigit() or int(device_id2) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_DEVICE_ID')

        if device_uuid2 is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(device_uuid2))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_DEVICE_UUID')

        if energy_category_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        else:
            energy_category_id = str.strip(energy_category_id)
            if not energy_category_id.isdigit() or int(energy_category_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_CATEGORY_ID')

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
        # Step 2: query the device and energy category
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        # Query device 1
        if device_id1 is not None:
            cursor_system.execute(" SELECT id, name FROM tbl_equipments WHERE id = %s ", (device_id1,))
            row_device1 = cursor_system.fetchone()
        elif device_uuid1 is not None:
            cursor_system.execute(" SELECT id, name FROM tbl_equipments WHERE uuid = %s ", (device_uuid1,))
            row_device1 = cursor_system.fetchone()

        if row_device1 is None:
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
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.DEVICE_NOT_FOUND')

        device1 = dict()
        device1['id'] = row_device1[0]
        device1['name'] = row_device1[1]

        # Query device 2
        if device_id2 is not None:
            cursor_system.execute(" SELECT id, name FROM tbl_equipments WHERE id = %s ", (device_id2,))
            row_device2 = cursor_system.fetchone()
        elif device_uuid2 is not None:
            cursor_system.execute(" SELECT id, name FROM tbl_equipments WHERE uuid = %s ", (device_uuid2,))
            row_device2 = cursor_system.fetchone()

        if row_device2 is None:
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
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.DEVICE_NOT_FOUND')

        device2 = dict()
        device2['id'] = row_device2[0]
        device2['name'] = row_device2[1]

        # Query energy category
        cursor_system.execute(" SELECT id, name, unit_of_measure FROM tbl_energy_categories WHERE id = %s ", (energy_category_id,))
        row_energy_category = cursor_system.fetchone()

        if row_energy_category is None:
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
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.ENERGY_CATEGORY_NOT_FOUND')

        energy_category = dict()
        energy_category['id'] = row_energy_category[0]
        energy_category['name'] = row_energy_category[1]
        energy_category['unit_of_measure'] = row_energy_category[2]

        ################################################################################################################
        # Step 3: query associated meters for the specific energy category
        ################################################################################################################
        # Query meters for device 1
        cursor_system.execute(" SELECT m.id, m.name, m.energy_category_id, ec.name, ec.unit_of_measure "
                              " FROM tbl_equipments e, tbl_equipments_meters em, tbl_meters m, tbl_energy_categories ec "
                              " WHERE e.id = %s AND e.id = em.equipment_id AND em.meter_id = m.id "
                              " AND m.energy_category_id = %s AND m.energy_category_id = ec.id "
                              " ORDER BY m.id ", (device1['id'], energy_category_id))
        rows_meters1 = cursor_system.fetchall()

        if rows_meters1 is None or len(rows_meters1) == 0:
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
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', 
                                   description='API.NO_METER_FOUND_FOR_DEVICE_1_AND_ENERGY_CATEGORY')

        # Query meters for device 2
        cursor_system.execute(" SELECT m.id, m.name, m.energy_category_id, ec.name, ec.unit_of_measure "
                              " FROM tbl_equipments e, tbl_equipments_meters em, tbl_meters m, tbl_energy_categories ec "
                              " WHERE e.id = %s AND e.id = em.equipment_id AND em.meter_id = m.id "
                              " AND m.energy_category_id = %s AND m.energy_category_id = ec.id "
                              " ORDER BY m.id ", (device2['id'], energy_category_id))
        rows_meters2 = cursor_system.fetchall()

        if rows_meters2 is None or len(rows_meters2) == 0:
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
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', 
                                   description='API.NO_METER_FOUND_FOR_DEVICE_2_AND_ENERGY_CATEGORY')

        ################################################################################################################
        # Step 4: query reporting period energy consumption
        ################################################################################################################
        # Aggregate energy consumption for device 1
        device1_energy_data = dict()
        device1_energy_data['timestamps'] = list()
        device1_energy_data['values'] = list()
        device1_energy_data['total_in_category'] = Decimal(0.0)

        # Get all meter IDs for device 1
        meter_ids1 = [row[0] for row in rows_meters1]
        
        # Query energy data for all meters of device 1
        if len(meter_ids1) > 0:
            placeholders1 = ','.join(['%s'] * len(meter_ids1))
            query1 = (" SELECT start_datetime_utc, SUM(actual_value) as total_value "
                      " FROM tbl_meter_hourly "
                      " WHERE meter_id IN (" + placeholders1 + ") "
                      " AND start_datetime_utc >= %s "
                      " AND start_datetime_utc < %s "
                      " GROUP BY start_datetime_utc "
                      " ORDER BY start_datetime_utc ")
            cursor_energy.execute(query1, meter_ids1 + [reporting_start_datetime_utc, reporting_end_datetime_utc])
            rows_device1_hourly = cursor_energy.fetchall()

            rows_device1_periodically = utilities.aggregate_hourly_data_by_period(rows_device1_hourly,
                                                                                 reporting_start_datetime_utc,
                                                                                 reporting_end_datetime_utc,
                                                                                 period_type)

            for row_device1_periodically in rows_device1_periodically:
                current_datetime_local = row_device1_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_device1_periodically[1] is None else row_device1_periodically[1]

                device1_energy_data['timestamps'].append(current_datetime)
                device1_energy_data['values'].append(actual_value)
                device1_energy_data['total_in_category'] += actual_value

        # Aggregate energy consumption for device 2
        device2_energy_data = dict()
        device2_energy_data['timestamps'] = list()
        device2_energy_data['values'] = list()
        device2_energy_data['total_in_category'] = Decimal(0.0)

        # Get all meter IDs for device 2
        meter_ids2 = [row[0] for row in rows_meters2]
        
        # Query energy data for all meters of device 2
        if len(meter_ids2) > 0:
            placeholders2 = ','.join(['%s'] * len(meter_ids2))
            query2 = (" SELECT start_datetime_utc, SUM(actual_value) as total_value "
                      " FROM tbl_meter_hourly "
                      " WHERE meter_id IN (" + placeholders2 + ") "
                      " AND start_datetime_utc >= %s "
                      " AND start_datetime_utc < %s "
                      " GROUP BY start_datetime_utc "
                      " ORDER BY start_datetime_utc ")
            cursor_energy.execute(query2, meter_ids2 + [reporting_start_datetime_utc, reporting_end_datetime_utc])
            rows_device2_hourly = cursor_energy.fetchall()

            rows_device2_periodically = utilities.aggregate_hourly_data_by_period(rows_device2_hourly,
                                                                                 reporting_start_datetime_utc,
                                                                                 reporting_end_datetime_utc,
                                                                                 period_type)

            for row_device2_periodically in rows_device2_periodically:
                current_datetime_local = row_device2_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_device2_periodically[1] is None else row_device2_periodically[1]

                device2_energy_data['timestamps'].append(current_datetime)
                device2_energy_data['values'].append(actual_value)
                device2_energy_data['total_in_category'] += actual_value

        # Calculate difference
        diff = dict()
        diff['values'] = list()
        diff['total_in_category'] = Decimal(0.0)

        # Ensure both devices have the same number of data points
        min_length = min(len(device1_energy_data['values']), len(device2_energy_data['values']))
        for i in range(min_length):
            device1_value = device1_energy_data['values'][i] if i < len(device1_energy_data['values']) else Decimal(0.0)
            device2_value = device2_energy_data['values'][i] if i < len(device2_energy_data['values']) else Decimal(0.0)
            diff_value = device1_value - device2_value
            diff['values'].append(diff_value)
            diff['total_in_category'] += diff_value

        ################################################################################################################
        # Step 5: query associated points data (for detailed parameters)
        ################################################################################################################
        parameters_data1 = dict()
        parameters_data1['names'] = list()
        parameters_data1['timestamps'] = list()
        parameters_data1['values'] = list()

        parameters_data2 = dict()
        parameters_data2['names'] = list()
        parameters_data2['timestamps'] = list()
        parameters_data2['values'] = list()

        if not is_quick_mode:
            # Query points for device 1 meters
            for meter_row in rows_meters1:
                meter_id = meter_row[0]
                meter_name = meter_row[1]
                
                cursor_system.execute(" SELECT p.id, p.name, p.units, p.object_type "
                                      " FROM tbl_meters m, tbl_meters_points mp, tbl_points p "
                                      " WHERE m.id = %s AND m.id = mp.meter_id AND mp.point_id = p.id "
                                      " ORDER BY p.id ", (meter_id,))
                rows_points = cursor_system.fetchall()
                
                if rows_points is not None and len(rows_points) > 0:
                    for point_row in rows_points:
                        point_values = []
                        point_timestamps = []
                        
                        if point_row[3] == 'ENERGY_VALUE':
                            query = (" SELECT utc_date_time, actual_value "
                                     " FROM tbl_energy_value "
                                     " WHERE point_id = %s "
                                     " AND utc_date_time BETWEEN %s AND %s "
                                     " ORDER BY utc_date_time ")
                            cursor_historical.execute(query, (point_row[0],
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
                        elif point_row[3] == 'ANALOG_VALUE':
                            query = (" SELECT utc_date_time, actual_value "
                                     " FROM tbl_analog_value "
                                     " WHERE point_id = %s "
                                     " AND utc_date_time BETWEEN %s AND %s "
                                     " ORDER BY utc_date_time ")
                            cursor_historical.execute(query, (point_row[0],
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
                        elif point_row[3] == 'DIGITAL_VALUE':
                            query = (" SELECT utc_date_time, actual_value "
                                     " FROM tbl_digital_value "
                                     " WHERE point_id = %s "
                                     " AND utc_date_time BETWEEN %s AND %s "
                                     " ORDER BY utc_date_time ")
                            cursor_historical.execute(query, (point_row[0],
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

                        parameters_data1['names'].append(meter_name + ' - ' + point_row[1] + ' (' + point_row[2] + ')')
                        parameters_data1['timestamps'].append(point_timestamps)
                        parameters_data1['values'].append(point_values)

            # Query points for device 2 meters
            for meter_row in rows_meters2:
                meter_id = meter_row[0]
                meter_name = meter_row[1]
                
                cursor_system.execute(" SELECT p.id, p.name, p.units, p.object_type "
                                      " FROM tbl_meters m, tbl_meters_points mp, tbl_points p "
                                      " WHERE m.id = %s AND m.id = mp.meter_id AND mp.point_id = p.id "
                                      " ORDER BY p.id ", (meter_id,))
                rows_points = cursor_system.fetchall()
                
                if rows_points is not None and len(rows_points) > 0:
                    for point_row in rows_points:
                        point_values = []
                        point_timestamps = []
                        
                        if point_row[3] == 'ENERGY_VALUE':
                            query = (" SELECT utc_date_time, actual_value "
                                     " FROM tbl_energy_value "
                                     " WHERE point_id = %s "
                                     " AND utc_date_time BETWEEN %s AND %s "
                                     " ORDER BY utc_date_time ")
                            cursor_historical.execute(query, (point_row[0],
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
                        elif point_row[3] == 'ANALOG_VALUE':
                            query = (" SELECT utc_date_time, actual_value "
                                     " FROM tbl_analog_value "
                                     " WHERE point_id = %s "
                                     " AND utc_date_time BETWEEN %s AND %s "
                                     " ORDER BY utc_date_time ")
                            cursor_historical.execute(query, (point_row[0],
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
                        elif point_row[3] == 'DIGITAL_VALUE':
                            query = (" SELECT utc_date_time, actual_value "
                                     " FROM tbl_digital_value "
                                     " WHERE point_id = %s "
                                     " AND utc_date_time BETWEEN %s AND %s "
                                     " ORDER BY utc_date_time ")
                            cursor_historical.execute(query, (point_row[0],
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

                        parameters_data2['names'].append(meter_name + ' - ' + point_row[1] + ' (' + point_row[2] + ')')
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
            "device1": {
                "id": device1['id'],
                "name": device1['name'],
            },
            "device2": {
                "id": device2['id'],
                "name": device2['name'],
            },
            "energy_category": {
                "id": energy_category['id'],
                "name": energy_category['name'],
                "unit_of_measure": energy_category['unit_of_measure'],
            },
            "reporting_period1": {
                "total_in_category": device1_energy_data['total_in_category'],
                "timestamps": device1_energy_data['timestamps'],
                "values": device1_energy_data['values'],
            },
            "reporting_period2": {
                "total_in_category": device2_energy_data['total_in_category'],
                "timestamps": device2_energy_data['timestamps'],
                "values": device2_energy_data['values'],
            },
            "parameters1": {
                "names": parameters_data1['names'],
                "timestamps": parameters_data1['timestamps'],
                "values": parameters_data1['values']
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
                excelexporters.devicecomparison.export(result,
                                                       device1['name'],
                                                       device2['name'],
                                                       energy_category['name'],
                                                       reporting_period_start_datetime_local,
                                                       reporting_period_end_datetime_local,
                                                       period_type,
                                                       language)

        resp.text = json.dumps(result)
