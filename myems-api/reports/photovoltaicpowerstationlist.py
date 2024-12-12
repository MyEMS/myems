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
        # get contracts
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_contacts ")
        cursor_system_db.execute(query)
        rows_contacts = cursor_system_db.fetchall()

        contact_dict = dict()
        if rows_contacts is not None and len(rows_contacts) > 0:
            for row in rows_contacts:
                contact_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}
        # get cost centers
        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor_system_db.execute(query)
        rows_cost_centers = cursor_system_db.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        # get generation hourly data in latest 24 hours
        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        reporting_end_datetime_utc = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
        reporting_end_datetime_utc = reporting_end_datetime_utc - timedelta(hours=1)
        reporting_start_datetime_utc = reporting_end_datetime_utc - timedelta(hours=24)
        hourly_report_dict = dict()

        cursor_energy.execute(" SELECT photovoltaic_power_station_id, start_datetime_utc, actual_value "
                              " FROM tbl_photovoltaic_power_station_generation_hourly "
                              " WHERE start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s "
                              " ORDER BY photovoltaic_power_station_id, start_datetime_utc ",
                              (reporting_start_datetime_utc,
                               reporting_end_datetime_utc))
        rows_hourly = cursor_energy.fetchall()
        if rows_hourly is not None and len(rows_hourly) > 0:
            for row_hourly in rows_hourly:
                if row_hourly[0] not in hourly_report_dict.keys():
                    hourly_report_dict[row_hourly[0]] = dict()
                    hourly_report_dict[row_hourly[0]]['time_stamps'] = list()
                    hourly_report_dict[row_hourly[0]]['values'] = list()

                current_datetime_local = row_hourly[1].replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                hourly_report_dict[row_hourly[0]]['time_stamps'].append(current_datetime_local.strftime('%H:%M:%S'))
                actual_value = Decimal(0.0) if row_hourly[2] is None else row_hourly[2]
                hourly_report_dict[row_hourly[0]]['values'].append(actual_value)

        # get photovoltaic power stations
        query = (" SELECT m.id, m.name, m.uuid, "
                 "        m.address, m.postal_code, m.latitude, m.longitude, m.rated_capacity, m.rated_power, "
                 "        m.contact_id, m.cost_center_id, m.description, m.phase_of_lifecycle "
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

                # get PCS run state point
                pcs_run_state_point_value = None
                if is_online:
                    query = (" SELECT invertor_state_point_id "
                             " FROM tbl_photovoltaic_power_stations_invertors "
                             " WHERE photovoltaic_power_station_id  = %s "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (photovoltaic_power_station_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if digital_value_latest_dict.get(row_point[0]) is not None:
                            pcs_run_state_point_value = digital_value_latest_dict.get(row_point[0])['actual_value']

                # 0：关闭 Shutdown
                # 1：软启动中 Soft Starting
                # 2：并网充电 On Grid Charging
                # 3：并网放电 On Grid DisCharging
                # 4：离网放电 Off Grid DisCharging
                # 5：降额并网 Derating On Grid
                # 6：待机 Standby
                # 7：离网充电 Off Grid Charging

                if pcs_run_state_point_value is None:
                    pcs_run_state = 'Unknown'
                elif pcs_run_state_point_value == 0:
                    pcs_run_state = 'Shutdown'
                elif pcs_run_state_point_value == 1:
                    pcs_run_state = 'Running'
                elif pcs_run_state_point_value == 2:
                    pcs_run_state = 'Running'
                elif pcs_run_state_point_value == 3:
                    pcs_run_state = 'Running'
                elif pcs_run_state_point_value == 4:
                    pcs_run_state = 'Running'
                elif pcs_run_state_point_value == 5:
                    pcs_run_state = 'Running'
                elif pcs_run_state_point_value == 6:
                    pcs_run_state = 'Standby'
                elif pcs_run_state_point_value == 7:
                    pcs_run_state = 'Running'
                else:
                    pcs_run_state = 'Running'

                # get grid power point
                grid_power_point_value = None
                if is_online:
                    query = (" SELECT power_point_id "
                             " FROM tbl_photovoltaic_power_stations_grids "
                             " WHERE photovoltaic_power_station_id = %s "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (photovoltaic_power_station_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if analog_value_latest_dict.get(row_point[0]) is not None:
                            grid_power_point_value = analog_value_latest_dict.get(row_point[0])['actual_value']

                # get load power point
                load_power_point_value = None
                if is_online:
                    query = (" SELECT power_point_id "
                             " FROM tbl_photovoltaic_power_stations_loads "
                             " WHERE photovoltaic_power_station_id = %s "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (photovoltaic_power_station_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if analog_value_latest_dict.get(row_point[0]) is not None:
                            load_power_point_value = analog_value_latest_dict.get(row_point[0])['actual_value']

                meta_result = {"id": photovoltaic_power_station_id,
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
                               "description": row[11],
                               "phase_of_lifecycle": row[12],
                               "qrcode": 'energystoragepowerstation:' + row[2],
                               "is_online": is_online,
                               "pcs_run_state": pcs_run_state,
                               "grid_power_point_value": grid_power_point_value,
                               "load_power_point_value": load_power_point_value,
                               "time_stamps": hourly_report_dict[photovoltaic_power_station_id]['time_stamps'],
                               "hourly_data": hourly_report_dict[photovoltaic_power_station_id]['values']
                               }

                result.append(meta_result)

        cursor_system_db.close()
        cnx_system_db.close()
        resp.text = json.dumps(result)
