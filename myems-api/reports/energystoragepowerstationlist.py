import falcon
from datetime import datetime, timedelta
import mysql.connector
import simplejson as json
from core.useractivity import access_control
import config


class Reporting:
    @staticmethod
    def __init__():
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
        # get energy storage power stations
        query = (" SELECT m.id, m.name, m.uuid, "
                 "        m.address, m.postal_code, m.latitude, m.longitude, m.rated_capacity, m.rated_power, "
                 "        m.contact_id, m.cost_center_id, m.description "
                 " FROM tbl_energy_storage_power_stations m, tbl_energy_storage_power_stations_users mu "
                 " WHERE m.id = mu.energy_storage_power_station_id AND mu.user_id = %s "
                 " ORDER BY id ")
        cursor_system_db.execute(query, (user_id, ))
        rows_energy_storage_power_stations = cursor_system_db.fetchall()

        result = list()
        if rows_energy_storage_power_stations is not None and len(rows_energy_storage_power_stations) > 0:
            for row in rows_energy_storage_power_stations:
                energy_storage_power_station_id = row[0]
                # get data source latest seen datetime to determine if it is online
                query = (" SELECT tds.last_seen_datetime_utc   "
                         " FROM tbl_energy_storage_power_stations_containers tespsesc, "
                         "      tbl_energy_storage_containers_power_conversion_systems tescpcs, "
                         "      tbl_points tp, tbl_data_sources tds  "
                         " WHERE tespsesc.energy_storage_power_station_id  = %s "
                         "        AND tespsesc.energy_storage_container_id = tescpcs.energy_storage_container_id  "
                         "        AND tescpcs.run_state_point_id = tp.id  "
                         "        AND tp.data_source_id = tds.id  "
                         " LIMIT 1 ")
                cursor_system_db.execute(query, (energy_storage_power_station_id,))
                row_datetime = cursor_system_db.fetchone()

                is_online = False
                if row_datetime is not None and len(row_datetime) > 0:
                    if isinstance(row_datetime[0], datetime):
                        if row_datetime[0] + timedelta(minutes=10) > datetime.utcnow():
                            is_online = True

                # get PCS run state point
                pcs_run_state_point_value = None
                if is_online:
                    query = (" SELECT tescpcs.run_state_point_id "
                             " FROM tbl_energy_storage_power_stations_containers tespsesc, "
                             "     tbl_energy_storage_containers_power_conversion_systems tescpcs "
                             " WHERE tespsesc.energy_storage_power_station_id  = %s "
                             "       AND tespsesc.energy_storage_container_id = tescpcs.energy_storage_container_id "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (energy_storage_power_station_id,))
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

                # get battery state point
                battery_state_point_value = None
                if is_online:
                    query = (" SELECT tescb.battery_state_point_id "
                             " FROM tbl_energy_storage_power_stations_containers tespsesc, "
                             "      tbl_energy_storage_containers_batteries tescb "
                             " WHERE tespsesc.energy_storage_power_station_id = %s "
                             "       AND tespsesc.energy_storage_container_id = tescb.energy_storage_container_id "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (energy_storage_power_station_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if digital_value_latest_dict.get(row_point[0]) is not None:
                            battery_state_point_value = digital_value_latest_dict.get(row_point[0])['actual_value']

                # 1故障  2预警  3待机  4禁放  5禁充  6正常
                print(battery_state_point_value)
                if battery_state_point_value is None:
                    battery_operating_state = 'Unknown'
                elif battery_state_point_value == 1:
                    battery_operating_state = 'Fault'
                elif battery_state_point_value == 2:
                    battery_operating_state = 'Warning'
                elif battery_state_point_value == 3:
                    battery_operating_state = 'Standby'
                elif battery_state_point_value == 4:
                    battery_operating_state = 'ProhibitDisCharging'
                elif battery_state_point_value == 5:
                    battery_operating_state = 'ProhibitCharging'
                elif battery_state_point_value == 6:
                    battery_operating_state = 'Normal'
                else:
                    battery_operating_state = 'Unknown'

                # get battery soc point, power point
                battery_soc_point_value = None
                battery_power_point_value = None
                if is_online:
                    query = (" SELECT tescb.soc_point_id, tescb.power_point_id "
                             " FROM tbl_energy_storage_power_stations_containers tespsc, "
                             "      tbl_energy_storage_containers_batteries tescb "
                             " WHERE tespsc.energy_storage_power_station_id = %s "
                             "       AND tespsc.energy_storage_container_id = tescb.energy_storage_container_id "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (energy_storage_power_station_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if analog_value_latest_dict.get(row_point[0]) is not None:
                            battery_soc_point_value = analog_value_latest_dict.get(row_point[0])['actual_value']
                            battery_power_point_value = analog_value_latest_dict.get(row_point[1])['actual_value']
                # get grid power point
                grid_power_point_value = None
                if is_online:
                    query = (" SELECT tescg.power_point_id "
                             " FROM tbl_energy_storage_power_stations_containers tespsesc, "
                             "      tbl_energy_storage_containers_grids tescg "
                             " WHERE tespsesc.energy_storage_power_station_id = %s "
                             "       AND tespsesc.energy_storage_container_id = tescg.energy_storage_container_id "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (energy_storage_power_station_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if analog_value_latest_dict.get(row_point[0]) is not None:
                            grid_power_point_value = analog_value_latest_dict.get(row_point[0])['actual_value']

                # get load power point
                load_power_point_value = None
                if is_online:
                    query = (" SELECT tescl.power_point_id "
                             " FROM tbl_energy_storage_power_stations_containers tespsesc, "
                             "      tbl_energy_storage_containers_loads tescl "
                             " WHERE tespsesc.energy_storage_power_station_id = %s "
                             "       AND tespsesc.energy_storage_container_id = tescl.energy_storage_container_id "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (energy_storage_power_station_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if analog_value_latest_dict.get(row_point[0]) is not None:
                            load_power_point_value = analog_value_latest_dict.get(row_point[0])['actual_value']

                meta_result = {"id": energy_storage_power_station_id,
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
                               "qrcode": 'energystoragepowerstation:' + row[2],
                               "is_online": is_online,
                               "pcs_run_state": pcs_run_state,
                               "battery_operating_state": battery_operating_state,
                               "battery_soc_point_value": battery_soc_point_value,
                               "battery_power_point_value": battery_power_point_value,
                               "grid_power_point_value": grid_power_point_value,
                               "load_power_point_value": load_power_point_value,
                               }

                result.append(meta_result)

        cursor_system_db.close()
        cnx_system_db.close()
        resp.text = json.dumps(result)
