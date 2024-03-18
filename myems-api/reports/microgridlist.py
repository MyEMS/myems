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
        # Get contracts
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
        # Get cost centers
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
        # Get microgrids
        query = (" SELECT m.id, m.name, m.uuid, "
                 "        m.address, m.postal_code, m.latitude, m.longitude, m.rated_capacity, m.rated_power, "
                 "        m.contact_id, m.cost_center_id, m.serial_number, m.description "
                 " FROM tbl_microgrids m, tbl_microgrids_users mu "
                 " WHERE m.id = mu.microgrid_id AND mu.user_id = %s "
                 " ORDER BY id ")
        cursor_system_db.execute(query, (user_id, ))
        rows_microgrids = cursor_system_db.fetchall()

        result = list()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                microgrid_id = row[0]

                # get gateway latest seen datetime to determine if it is online
                query = (" SELECT tg.last_seen_datetime_utc "
                         " FROM tbl_microgrids_batteries mb, tbl_points p, tbl_data_sources tds, tbl_gateways tg "
                         " WHERE  microgrid_id  = %s "
                         "        AND mb.soc_point_id = p.id "
                         "        AND p.data_source_id = tds.id "
                         "        AND tds.gateway_id  = tg.id ")
                cursor_system_db.execute(query, (microgrid_id,))
                row_datetime = cursor_system_db.fetchone()
                is_online = False
                if row_datetime is not None and len(row_datetime) > 0:
                    if isinstance(row_datetime[0], datetime):
                        if row_datetime[0] + timedelta(minutes=10) > datetime.utcnow():
                            is_online = True

                # get PCS run state point
                pcs_run_state_point_value = None
                if is_online:
                    query = (" SELECT run_state_point_id "
                             " FROM tbl_microgrids_power_conversion_systems "
                             " WHERE microgrid_id = %s "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (microgrid_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if digital_value_latest_dict.get(row_point[0]) is not None:
                            pcs_run_state_point_value = digital_value_latest_dict.get(row_point[0])['actual_value']

                # 0: 初始上电, Initial power on
                # 1: 待机, Standby
                # 2: 起动, start
                # 3: 运行并网,Run grid connection
                # 4: 运行离网, Running offline
                # 5: 运行柴发,Running diesel generator
                # 6: 并网切离网, Grid connection and disconnection
                # 7: 离网切并网, Off grid switching and grid connection
                # 8: 掉电处理, Power failure treatment
                # 9: 关机, Shutdown
                # 10: 故障, fault
                # 11: 升级, upgradation
                if pcs_run_state_point_value is None:
                    pcs_run_state = 'Unknown'
                elif pcs_run_state_point_value == 0:
                    pcs_run_state = 'Initializing'
                elif pcs_run_state_point_value == 1:
                    pcs_run_state = 'Standby'
                elif pcs_run_state_point_value == 9:
                    pcs_run_state = 'Shutdown'
                elif pcs_run_state_point_value == 10:
                    pcs_run_state = 'Fault'
                else:
                    pcs_run_state = 'Running'

                # get battery state point
                battery_state_point_value = None
                if is_online:
                    query = (" SELECT battery_state_point_id "
                             " FROM tbl_microgrids_batteries "
                             " WHERE microgrid_id = %s "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (microgrid_id,))
                    row_point = cursor_system_db.fetchone()

                    if row_point is not None and len(row_point) > 0:
                        if digital_value_latest_dict.get(row_point[0]) is not None:
                            battery_state_point_value = digital_value_latest_dict.get(row_point[0])['actual_value']

                # 0: 无电池, No Battery
                # 1: 故障, Fault
                # 2: 休眠, Sleep
                # 3: 起动, Starting
                # 4: 运行充电, Charging
                # 5: 运行放电, Discharging
                # 6: 运行停止, Stopped
                if battery_state_point_value is None:
                    battery_state = 'Unknown'
                elif battery_state_point_value == 4:
                    battery_state = 'Charging'
                elif battery_state_point_value == 5:
                    battery_state = 'Discharging'
                else:
                    battery_state = 'Stopped'

                # get battery soc point, power point
                battery_soc_point_value = None
                battery_power_point_value = None
                if is_online:
                    query = (" SELECT soc_point_id, power_point_id "
                             " FROM tbl_microgrids_batteries "
                             " WHERE microgrid_id = %s "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (microgrid_id, ))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if analog_value_latest_dict.get(row_point[0]) is not None:
                            battery_soc_point_value = analog_value_latest_dict.get(row_point[0])['actual_value']
                            battery_power_point_value = analog_value_latest_dict.get(row_point[1])['actual_value']

                # get photovoltaic power point
                photovoltaic_power_point_value = None
                if is_online:
                    query = (" SELECT power_point_id "
                             " FROM tbl_microgrids_photovoltaics "
                             " WHERE microgrid_id = %s "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (microgrid_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if analog_value_latest_dict.get(row_point[0]) is not None:
                            photovoltaic_power_point_value = analog_value_latest_dict.get(row_point[0])['actual_value']

                # get grid power point
                grid_power_point_value = None
                if is_online:
                    query = (" SELECT power_point_id "
                             " FROM tbl_microgrids_grids "
                             " WHERE microgrid_id = %s "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (microgrid_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if analog_value_latest_dict.get(row_point[0]) is not None:
                            grid_power_point_value = analog_value_latest_dict.get(row_point[0])['actual_value']

                # get load power point
                load_power_point_value = None
                if is_online:
                    query = (" SELECT power_point_id "
                             " FROM tbl_microgrids_loads "
                             " WHERE microgrid_id = %s "
                             " LIMIT 1 ")
                    cursor_system_db.execute(query, (microgrid_id,))
                    row_point = cursor_system_db.fetchone()
                    if row_point is not None and len(row_point) > 0:
                        if analog_value_latest_dict.get(row_point[0]) is not None:
                            load_power_point_value = analog_value_latest_dict.get(row_point[0])['actual_value']

                meta_result = {"id": microgrid_id,
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
                               "serial_number": row[11],
                               "description": row[12],
                               "qrcode": 'microgrid:' + row[2],
                               "battery_state": battery_state,
                               "battery_soc_point_value": battery_soc_point_value,
                               "battery_power_point_value": battery_power_point_value,
                               "photovoltaic_power_point_value": photovoltaic_power_point_value,
                               "grid_power_point_value": grid_power_point_value,
                               "load_power_point_value": load_power_point_value,
                               "is_online": is_online,
                               "pcs_run_state": pcs_run_state}

                result.append(meta_result)

        cursor_system_db.close()
        cnx_system_db.close()
        resp.text = json.dumps(result)
