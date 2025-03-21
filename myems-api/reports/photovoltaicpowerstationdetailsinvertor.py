from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import access_control, api_key_control
import config


class Reporting:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the photovoltaic power station
    # Step 3: query analog points latest values
    # Step 4: query energy points latest values
    # Step 5: query digital points latest values
    # Step 6: query the points of associated invertors
    # Step 7: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PHOTOVOLTAIC_POWER_STATION_ID')
        photovoltaic_power_station_id = id_
        ################################################################################################################
        # Step 2: query the photovoltaic power station
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if photovoltaic_power_station_id is not None:
            query = (" SELECT id "
                     " FROM tbl_photovoltaic_power_stations "
                     " WHERE id = %s ")
            cursor_system.execute(query, (photovoltaic_power_station_id,))
            row = cursor_system.fetchone()
        if row is None:
            cursor_system.close()
            cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PHOTOVOLTAIC_POWER_STATION_NOT_FOUND')

        ################################################################################################################
        # Step 3: query analog points latest values
        ################################################################################################################
        latest_value_dict = dict()
        query = (" SELECT point_id, actual_value "
                 " FROM tbl_analog_value_latest "
                 " WHERE utc_date_time > %s ")
        cursor_historical.execute(query, (datetime.utcnow() - timedelta(minutes=60),))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                latest_value_dict[row[0]] = row[1]

        ################################################################################################################
        # Step 4: query energy points latest values
        ################################################################################################################
        query = (" SELECT point_id, actual_value "
                 " FROM tbl_energy_value_latest "
                 " WHERE utc_date_time > %s ")
        cursor_historical.execute(query, (datetime.utcnow() - timedelta(minutes=60),))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                latest_value_dict[row[0]] = row[1]

        ################################################################################################################
        # Step 5: query digital points latest values
        ################################################################################################################
        query = (" SELECT point_id, actual_value "
                 " FROM tbl_digital_value_latest "
                 " WHERE utc_date_time > %s ")
        cursor_historical.execute(query, (datetime.utcnow() - timedelta(minutes=60),))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                latest_value_dict[row[0]] = row[1]

        ################################################################################################################
        # Step 6: query the points of associated invertors
        ################################################################################################################
        invertor_list = list()
        invertor_state_dict = dict()
        invertor_state_dict[0] = '待机:初始化'
        invertor_state_dict[1] = '待机:绝缘阻抗检测'
        invertor_state_dict[2] = '待机:光照检测'
        invertor_state_dict[3] = '待机:电网检测'
        invertor_state_dict[256] = '启动'
        invertor_state_dict[512] = '并网'
        invertor_state_dict[513] = '并网:限功率'
        invertor_state_dict[514] = '并网:自降额'
        invertor_state_dict[515] = '离网运行'
        invertor_state_dict[768] = '关机:异常关机'
        invertor_state_dict[769] = '关机:指令关机'
        invertor_state_dict[770] = '关机:OVGR'
        invertor_state_dict[771] = '关机:通信断链'
        invertor_state_dict[772] = '关机:限功率'
        invertor_state_dict[773] = '关机:需手动开机'
        invertor_state_dict[774] = '关机:直流开关断开'
        invertor_state_dict[775] = '关机:快速关断'
        invertor_state_dict[776] = '关机:输入欠功率'
        invertor_state_dict[777] = '关机:NS保护'
        invertor_state_dict[778] = '关机:指令快速关机'
        invertor_state_dict[1025] = '电网调度:cosψ-P 曲线'
        invertor_state_dict[1026] = '电网调度:Q-U 曲线'
        invertor_state_dict[1027] = '电网调度:PF-U特征曲线'
        invertor_state_dict[1028] = '电网调度:干接点'
        invertor_state_dict[1029] = '电网调度:Q-P特征曲线'
        invertor_state_dict[1280] = '点检就绪'
        invertor_state_dict[1281] = '点检中'
        invertor_state_dict[1536] = '巡检中'
        invertor_state_dict[1792] = 'AFCI自检'
        invertor_state_dict[2048] = 'IV扫描中'
        invertor_state_dict[2304] = '直流输入检测'
        invertor_state_dict[2560] = '脱网充电'
        invertor_state_dict[40960] = '待机:无光照'
        invertor_state_dict[40961] = '待机:直流无输入'
        invertor_state_dict[45056] = '通信断链'
        invertor_state_dict[49152] = '载入中'

        communication_state_dict = dict()
        communication_state_dict[0] = '断连'
        communication_state_dict[1] = '连接'

        cursor_system.execute(" SELECT id, name, uuid, "
                              " model, "
                              " serial_number, "
                              " invertor_state_point_id, "
                              " communication_state_point_id, "
                              " total_energy_point_id, "
                              " today_energy_point_id, "
                              " efficiency_point_id, "
                              " temperature_point_id, "
                              " power_factor_point_id, "
                              " active_power_point_id, "
                              " reactive_power_point_id, "
                              " frequency_point_id, "
                              " uab_point_id, "
                              " ubc_point_id, "
                              " uca_point_id, "
                              " ua_point_id, "
                              " ub_point_id, "
                              " uc_point_id, "
                              " ia_point_id, "
                              " ib_point_id, "
                              " ic_point_id, "
                              " pv1_u_point_id, "
                              " pv1_i_point_id, "
                              " pv2_u_point_id, "
                              " pv2_i_point_id, "
                              " pv3_u_point_id, "
                              " pv3_i_point_id, "
                              " pv4_u_point_id, "
                              " pv4_i_point_id, "
                              " pv5_u_point_id, "
                              " pv5_i_point_id, "
                              " pv6_u_point_id, "
                              " pv6_i_point_id, "
                              " pv7_u_point_id, "
                              " pv7_i_point_id, "
                              " pv8_u_point_id, "
                              " pv8_i_point_id, "
                              " pv9_u_point_id, "
                              " pv9_i_point_id, "
                              " pv10_u_point_id, "
                              " pv10_i_point_id, "
                              " pv11_u_point_id, "
                              " pv11_i_point_id, "
                              " pv12_u_point_id, "
                              " pv12_i_point_id, "
                              " pv13_u_point_id, "
                              " pv13_i_point_id, "
                              " pv14_u_point_id, "
                              " pv14_i_point_id, "
                              " pv15_u_point_id, "
                              " pv15_i_point_id, "
                              " pv16_u_point_id, "
                              " pv16_i_point_id, "
                              " pv17_u_point_id, "
                              " pv17_i_point_id, "
                              " pv18_u_point_id, "
                              " pv18_i_point_id, "
                              " pv19_u_point_id, "
                              " pv19_i_point_id, "
                              " pv20_u_point_id, "
                              " pv20_i_point_id, "
                              " pv21_u_point_id, "
                              " pv21_i_point_id, "
                              " pv22_u_point_id, "
                              " pv22_i_point_id, "
                              " pv23_u_point_id, "
                              " pv23_i_point_id, "
                              " pv24_u_point_id, "
                              " pv24_i_point_id, "
                              " pv25_u_point_id, "
                              " pv25_i_point_id, "
                              " pv26_u_point_id, "
                              " pv26_i_point_id, "
                              " pv27_u_point_id, "
                              " pv27_i_point_id, "
                              " pv28_u_point_id, "
                              " pv28_i_point_id, "
                              " mppt_total_energy_point_id, "
                              " mppt_power_point_id, "
                              " mppt_1_energy_point_id, "
                              " mppt_2_energy_point_id, "
                              " mppt_3_energy_point_id, "
                              " mppt_4_energy_point_id, "
                              " mppt_5_energy_point_id, "
                              " mppt_6_energy_point_id, "
                              " mppt_7_energy_point_id, "
                              " mppt_8_energy_point_id, "
                              " mppt_9_energy_point_id, "
                              " mppt_10_energy_point_id, "
                              " startup_time_point_id, "
                              " shutdown_time_point_id "
                              " FROM tbl_photovoltaic_power_stations_invertors "
                              " WHERE photovoltaic_power_station_id = %s ",
                              (photovoltaic_power_station_id,))
        rows_invertors = cursor_system.fetchall()
        if rows_invertors is not None and len(rows_invertors) > 0:
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            for row in rows_invertors:
                current_invertor = dict()
                current_invertor['id'] = row[0]
                current_invertor['name'] = row[1]
                current_invertor['uuid'] = row[2]
                current_invertor['model'] = row[3]
                current_invertor['serial_number'] = row[4]
                current_invertor['invertor_state'] = \
                    invertor_state_dict.get(latest_value_dict.get(row[5], None), '未知')
                current_invertor['communication_state'] = \
                    communication_state_dict.get(latest_value_dict.get(row[6], None), '未知')
                current_invertor['total_energy'] = latest_value_dict.get(row[7], None)
                current_invertor['today_energy'] = latest_value_dict.get(row[8], None)
                current_invertor['efficiency'] = latest_value_dict.get(row[9], None)
                current_invertor['temperature'] = latest_value_dict.get(row[10], None)
                current_invertor['power_factor'] = latest_value_dict.get(row[11], None)
                current_invertor['active_power'] = latest_value_dict.get(row[12], None)
                current_invertor['reactive_power'] = latest_value_dict.get(row[13], None)
                current_invertor['frequency'] = latest_value_dict.get(row[14], None)
                current_invertor['uab'] = latest_value_dict.get(row[15], None)
                current_invertor['ubc'] = latest_value_dict.get(row[16], None)
                current_invertor['uca'] = latest_value_dict.get(row[17], None)
                current_invertor['ua'] = latest_value_dict.get(row[18], None)
                current_invertor['ub'] = latest_value_dict.get(row[19], None)
                current_invertor['uc'] = latest_value_dict.get(row[20], None)
                current_invertor['ia'] = latest_value_dict.get(row[21], None)
                current_invertor['ib'] = latest_value_dict.get(row[22], None)
                current_invertor['ic'] = latest_value_dict.get(row[23], None)
                current_invertor['pv1_u'] = latest_value_dict.get(row[24], None)
                current_invertor['pv1_i'] = latest_value_dict.get(row[25], None)
                current_invertor['pv2_u'] = latest_value_dict.get(row[26], None)
                current_invertor['pv2_i'] = latest_value_dict.get(row[27], None)
                current_invertor['pv3_u'] = latest_value_dict.get(row[28], None)
                current_invertor['pv3_i'] = latest_value_dict.get(row[29], None)
                current_invertor['pv4_u'] = latest_value_dict.get(row[30], None)
                current_invertor['pv4_i'] = latest_value_dict.get(row[31], None)
                current_invertor['pv5_u'] = latest_value_dict.get(row[32], None)
                current_invertor['pv5_i'] = latest_value_dict.get(row[33], None)
                current_invertor['pv6_u'] = latest_value_dict.get(row[34], None)
                current_invertor['pv6_i'] = latest_value_dict.get(row[35], None)
                current_invertor['pv7_u'] = latest_value_dict.get(row[36], None)
                current_invertor['pv7_i'] = latest_value_dict.get(row[37], None)
                current_invertor['pv8_u'] = latest_value_dict.get(row[38], None)
                current_invertor['pv8_i'] = latest_value_dict.get(row[39], None)
                current_invertor['pv9_u'] = latest_value_dict.get(row[40], None)
                current_invertor['pv9_i'] = latest_value_dict.get(row[41], None)
                current_invertor['pv10_u'] = latest_value_dict.get(row[42], None)
                current_invertor['pv10_i'] = latest_value_dict.get(row[43], None)
                current_invertor['pv11_u'] = latest_value_dict.get(row[44], None)
                current_invertor['pv11_i'] = latest_value_dict.get(row[45], None)
                current_invertor['pv12_u'] = latest_value_dict.get(row[46], None)
                current_invertor['pv12_i'] = latest_value_dict.get(row[47], None)
                current_invertor['pv13_u'] = latest_value_dict.get(row[48], None)
                current_invertor['pv13_i'] = latest_value_dict.get(row[49], None)
                current_invertor['pv14_u'] = latest_value_dict.get(row[50], None)
                current_invertor['pv14_i'] = latest_value_dict.get(row[51], None)
                current_invertor['pv15_u'] = latest_value_dict.get(row[52], None)
                current_invertor['pv15_i'] = latest_value_dict.get(row[53], None)
                current_invertor['pv16_u'] = latest_value_dict.get(row[54], None)
                current_invertor['pv16_i'] = latest_value_dict.get(row[55], None)
                current_invertor['pv17_u'] = latest_value_dict.get(row[56], None)
                current_invertor['pv17_i'] = latest_value_dict.get(row[57], None)
                current_invertor['pv18_u'] = latest_value_dict.get(row[58], None)
                current_invertor['pv18_i'] = latest_value_dict.get(row[59], None)
                current_invertor['pv19_u'] = latest_value_dict.get(row[60], None)
                current_invertor['pv19_i'] = latest_value_dict.get(row[61], None)
                current_invertor['pv20_u'] = latest_value_dict.get(row[62], None)
                current_invertor['pv20_i'] = latest_value_dict.get(row[63], None)
                current_invertor['pv21_u'] = latest_value_dict.get(row[64], None)
                current_invertor['pv21_i'] = latest_value_dict.get(row[65], None)
                current_invertor['pv22_u'] = latest_value_dict.get(row[66], None)
                current_invertor['pv22_i'] = latest_value_dict.get(row[67], None)
                current_invertor['pv23_u'] = latest_value_dict.get(row[68], None)
                current_invertor['pv23_i'] = latest_value_dict.get(row[69], None)
                current_invertor['pv24_u'] = latest_value_dict.get(row[70], None)
                current_invertor['pv24_i'] = latest_value_dict.get(row[71], None)
                current_invertor['pv25_u'] = latest_value_dict.get(row[72], None)
                current_invertor['pv25_i'] = latest_value_dict.get(row[73], None)
                current_invertor['pv26_u'] = latest_value_dict.get(row[74], None)
                current_invertor['pv26_i'] = latest_value_dict.get(row[75], None)
                current_invertor['pv27_u'] = latest_value_dict.get(row[76], None)
                current_invertor['pv27_i'] = latest_value_dict.get(row[77], None)
                current_invertor['pv28_u'] = latest_value_dict.get(row[78], None)
                current_invertor['pv28_i'] = latest_value_dict.get(row[79], None)
                current_invertor['mppt_total_energy'] = latest_value_dict.get(row[80], None)
                current_invertor['mppt_power'] = latest_value_dict.get(row[81], None)
                current_invertor['mppt_1_energy'] = latest_value_dict.get(row[82], None)
                current_invertor['mppt_2_energy'] = latest_value_dict.get(row[83], None)
                current_invertor['mppt_3_energy'] = latest_value_dict.get(row[84], None)
                current_invertor['mppt_4_energy'] = latest_value_dict.get(row[85], None)
                current_invertor['mppt_5_energy'] = latest_value_dict.get(row[86], None)
                current_invertor['mppt_6_energy'] = latest_value_dict.get(row[87], None)
                current_invertor['mppt_7_energy'] = latest_value_dict.get(row[88], None)
                current_invertor['mppt_8_energy'] = latest_value_dict.get(row[89], None)
                current_invertor['mppt_9_energy'] = latest_value_dict.get(row[90], None)
                current_invertor['mppt_10_energy'] = latest_value_dict.get(row[91], None)
                startup_time = latest_value_dict.get(row[92], None)
                current_invertor['startup_time'] = \
                    (datetime.utcfromtimestamp(int(startup_time) / 1000) + timedelta(minutes=timezone_offset))\
                    .strftime('%Y-%m-%d %H:%M:%S') \
                    if startup_time is not None else None
                shutdown_time = latest_value_dict.get(row[93], None)
                current_invertor['shutdown_time'] = \
                    (datetime.utcfromtimestamp(int(shutdown_time) / 1000) + timedelta(minutes=timezone_offset)) \
                    .strftime('%Y-%m-%d %H:%M:%S') \
                    if shutdown_time is not None else None
                invertor_list.append(current_invertor)

        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()
        ################################################################################################################
        # Step 8: construct the report
        ################################################################################################################
        resp.text = json.dumps(invertor_list)
