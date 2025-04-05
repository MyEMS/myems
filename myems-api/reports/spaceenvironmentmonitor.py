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
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the sensor
    # Step 3: query associated points
    # Step 4: query associated points data
    # Step 5: construct the report
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
        sensor_id = req.params.get('sensorid')
        sensor_uuid = req.params.get('sensoruuid')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if sensor_id is None and sensor_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_SENSOR_ID')
        
        if sensor_id is not None:
            sensor_id = str.strip(sensor_id)
            if not sensor_id.isdigit() or int(sensor_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_SENSOR_UUID')
            
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
        # Step 2: query the sensor
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if sensor_id is not None:
            cursor_system.execute(" SELECT id, name, uuid, description "
                                  " FROM tbl_sensors "
                                  " WHERE id = %s ", (sensor_id,))
            row_sensor = cursor_system.fetchone()
        elif sensor_uuid is not None:
            cursor_system.execute(" SELECT id, name, uuid, description "
                                  " FROM tbl_sensors "
                                  " WHERE uuid = %s ", (sensor_uuid,))
            row_sensor = cursor_system.fetchone()

        if row_sensor is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()

            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.SENSOR_NOT_FOUND')

        sensor = dict()
        sensor['id'] = row_sensor[0]
        sensor['name'] = row_sensor[1]
        sensor['uuid'] = row_sensor[2]
        sensor['description'] = row_sensor[3]

        ################################################################################################################
        # Step 3: query associated points
        ################################################################################################################
        point_list = list()
        cursor_system.execute(" SELECT p.id, p.name, p.units, p.object_type  "
                              " FROM tbl_sensors s, tbl_sensors_points sp, tbl_points p "
                              " WHERE s.id = %s AND s.id = sp.sensor_id AND p.id = sp.point_id "
                              " ORDER BY p.id ", (sensor['id'],))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_list.append({"id": row[0], "name": row[1], "units": row[2], "object_type": row[3]})

        ################################################################################################################
        # Step 4: query associated points data
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
        # Step 5: construct the report
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
            "sensor": {
                "sensor_id": sensor['id'],
                "name": sensor['name'],
                "uuid": sensor['uuid'],
                "description": sensor['description'],
            },
            "energy_value": energy_value_data,
            "parameters": {
                "names": parameters_data['names'],
                "timestamps": parameters_data['timestamps'],
                "values": parameters_data['values']
            },

        }

        resp.text = json.dumps(result)
