"""
Photovoltaic Power Station List Report API

This module provides REST API endpoints for generating photovoltaic power station list reports.
It provides a comprehensive list of photovoltaic power stations with their basic information,
status, and key performance indicators for management and monitoring purposes.

Key Features:
- Photovoltaic power station listing and overview
- Status monitoring and tracking
- Key performance indicators
- Basic information management
- Performance summary
- Status reporting

Report Components:
- Photovoltaic power station list summary
- Status information
- Key performance indicators
- Basic configuration data
- Performance metrics
- Status indicators

The module uses Falcon framework for REST API and includes:
- Database queries for photovoltaic power station list data
- Status monitoring algorithms
- Performance tracking tools
- Multi-language support
- User authentication and authorization
"""

import falcon
from datetime import datetime, timedelta, timezone
import mysql.connector
import simplejson as json
from core.useractivity import access_control
from decimal import Decimal
import config


class Reporting:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        access_control(req)
        # Get user inforamtion
        user_uuid = str.strip(req.headers['USER-UUID'])
        cnx_user_db = mysql.connector.connect(**config.myems_user_db)
        cursor_user_db = cnx_user_db.cursor()
        query = (" SELECT id "
                 " FROM tbl_users "
                 " WHERE uuid = %s ")
        cursor_user_db.execute(query, (user_uuid,))
        row = cursor_user_db.fetchone()
        cursor_user_db.close()
        cnx_user_db.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIVILEGE')
        user_id = row[0]
        # Get all points latest values
        digital_value_latest_dict = dict()
        analog_value_latest_dict = dict()
        cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical_db = cnx_historical_db.cursor()
        query = (" SELECT point_id, utc_date_time, actual_value "
                 " FROM tbl_digital_value_latest ")
        cursor_historical_db.execute(query, )
        rows = cursor_historical_db.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                digital_value_latest_dict[row[0]] = {"utc_date_time": row[1],
                                                     "actual_value": row[2]}
        query = (" SELECT point_id, utc_date_time, actual_value "
                 " FROM tbl_analog_value_latest ")
        cursor_historical_db.execute(query,)
        rows = cursor_historical_db.fetchall()
        cursor_historical_db.close()
        cnx_historical_db.close()
        if rows is not None and len(rows) > 0:
            for row in rows:
                analog_value_latest_dict[row[0]] = {"utc_date_time": row[1],
                                                    "actual_value": row[2]}

        # get generation hourly data today
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        reporting_start_datetime_local = (datetime.utcnow().replace(tzinfo=timezone.utc) +
                                          timedelta(minutes=timezone_offset)).\
            replace(hour=0, minute=0, second=0, microsecond=0)
        reporting_end_datetime_local = reporting_start_datetime_local + timedelta(hours=24)
        reporting_start_datetime_utc = reporting_start_datetime_local - timedelta(minutes=timezone_offset)
        reporting_end_datetime_utc = reporting_end_datetime_local - timedelta(minutes=timezone_offset)
        generation_report_dict = dict()

        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()

        cursor_energy_db.execute(" SELECT photovoltaic_power_station_id, start_datetime_utc, actual_value "
                                 " FROM tbl_photovoltaic_power_station_generation_hourly "
                                 " WHERE start_datetime_utc >= %s "
                                 "     AND start_datetime_utc < %s "
                                 " ORDER BY photovoltaic_power_station_id, start_datetime_utc ",
                                 (reporting_start_datetime_utc,
                                  reporting_end_datetime_utc))
        rows_hourly = cursor_energy_db.fetchall()
        if rows_hourly is not None and len(rows_hourly) > 0:
            for row_hourly in rows_hourly:
                if row_hourly[0] not in generation_report_dict.keys():
                    generation_report_dict[row_hourly[0]] = dict()
                    generation_report_dict[row_hourly[0]]['times'] = list()
                    generation_report_dict[row_hourly[0]]['values'] = list()

                current_datetime_local = row_hourly[1].replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                generation_report_dict[row_hourly[0]]['times'].append(current_datetime_local.isoformat()[11:16])
                actual_value = Decimal(0.0) if row_hourly[2] is None else row_hourly[2]
                generation_report_dict[row_hourly[0]]['values'].append(actual_value)

        cursor_energy_db.close()
        cnx_energy_db.close()

        default_time_list = list()
        default_value_list = list()

        current_datetime_local = reporting_start_datetime_local
        while current_datetime_local < reporting_end_datetime_local:
            default_time_list.append(current_datetime_local.isoformat()[11:16])
            default_value_list.append(Decimal(0.0))
            current_datetime_local = current_datetime_local + timedelta(hours=1)

        # get photovoltaic power stations
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
        query = (" SELECT m.id, m.name, m.uuid, "
                 "        m.address, m.latitude, m.longitude, m.rated_capacity, m.rated_power, "
                 "        m.description, m.phase_of_lifecycle "
                 " FROM tbl_photovoltaic_power_stations m, tbl_photovoltaic_power_stations_users mu "
                 " WHERE m.id = mu.photovoltaic_power_station_id AND mu.user_id = %s "
                 " ORDER BY m.phase_of_lifecycle, m.id ")
        cursor_system_db.execute(query, (user_id, ))
        rows_photovoltaic_power_stations = cursor_system_db.fetchall()

        result = list()
        if rows_photovoltaic_power_stations is not None and len(rows_photovoltaic_power_stations) > 0:
            for row in rows_photovoltaic_power_stations:
                photovoltaic_power_station_id = row[0]
                # todo: get data source latest seen datetime to determine if it is online

                is_online = False
                row_datetime = list()
                row_datetime.append(datetime.utcnow())
                if row_datetime is not None and len(row_datetime) > 0:
                    if isinstance(row_datetime[0], datetime):
                        if row_datetime[0] + timedelta(minutes=10) > datetime.utcnow():
                            is_online = True

                # get invertor run state point
                invertor_run_state_point_value = None
                if is_online:
                    query = (" SELECT invertor_state_point_id "
                             " FROM tbl_photovoltaic_power_stations_invertors "
                             " WHERE photovoltaic_power_station_id  = %s "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (photovoltaic_power_station_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if digital_value_latest_dict.get(row_point[0]) is not None:
                            invertor_run_state_point_value = digital_value_latest_dict.get(row_point[0])['actual_value']

                # 0：关闭 Shutdown
                # 1：软启动中 Soft Starting
                # 2：并网充电 On Grid Charging
                # 3：并网放电 On Grid DisCharging
                # 4：离网放电 Off Grid DisCharging
                # 5：降额并网 Derating On Grid
                # 6：待机 Standby
                # 7：离网充电 Off Grid Charging

                if invertor_run_state_point_value is None:
                    invertor_run_state = 'Unknown'
                elif invertor_run_state_point_value == 0:
                    invertor_run_state = 'Shutdown'
                elif invertor_run_state_point_value == 1:
                    invertor_run_state = 'Running'
                elif invertor_run_state_point_value == 2:
                    invertor_run_state = 'Running'
                elif invertor_run_state_point_value == 3:
                    invertor_run_state = 'Running'
                elif invertor_run_state_point_value == 4:
                    invertor_run_state = 'Running'
                elif invertor_run_state_point_value == 5:
                    invertor_run_state = 'Running'
                elif invertor_run_state_point_value == 6:
                    invertor_run_state = 'Standby'
                elif invertor_run_state_point_value == 7:
                    invertor_run_state = 'Running'
                else:
                    invertor_run_state = 'Running'

                # complete the generation_report_dict
                if photovoltaic_power_station_id not in generation_report_dict.keys():
                    generation_report_dict[photovoltaic_power_station_id] = dict()
                    generation_report_dict[photovoltaic_power_station_id]['times'] = default_time_list
                    generation_report_dict[photovoltaic_power_station_id]['values'] = default_value_list

                meta_result = {"id": photovoltaic_power_station_id,
                               "name": row[1],
                               "uuid": row[2],
                               "address": row[3],
                               "latitude": row[4],
                               "longitude": row[5],
                               "rated_capacity": row[6],
                               "rated_power": row[7],
                               "description": row[8],
                               "phase_of_lifecycle": row[9],
                               "qrcode": 'energystoragepowerstation:' + row[2],
                               "is_online": is_online,
                               "invertor_run_state": invertor_run_state,
                               "times": generation_report_dict[photovoltaic_power_station_id]['times'],
                               "values": generation_report_dict[photovoltaic_power_station_id]['values']
                               }

                result.append(meta_result)

        cursor_system_db.close()
        cnx_system_db.close()
        resp.text = json.dumps(result)
