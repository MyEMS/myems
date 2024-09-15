import re
from datetime import datetime, timedelta, timezone, time
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
from core import utilities
from core.useractivity import access_control, api_key_control
import config


class Reporting:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the energy storage power station
    # Step 3: query associated containers
    # Step 4: query analog points latest values
    # Step 5: query energy points latest values
    # Step 6: query digital points latest values
    # Step 7: query the points of power conversion systems
    # Step 8: construct the report
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
        # this procedure accepts energy storage power station id or uuid
        energy_storage_power_station_id = req.params.get('id')
        energy_storage_power_station_uuid = req.params.get('uuid')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if energy_storage_power_station_id is None and energy_storage_power_station_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        if energy_storage_power_station_id is not None:
            energy_storage_power_station_id = str.strip(energy_storage_power_station_id)
            if not energy_storage_power_station_id.isdigit() or int(energy_storage_power_station_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        if energy_storage_power_station_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(energy_storage_power_station_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_STORAGE_POWER_STATION_UUID')

        ################################################################################################################
        # Step 2: query the energy storage power station
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if energy_storage_power_station_id is not None:
            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_storage_power_stations "
                     " WHERE id = %s ")
            cursor_system.execute(query, (energy_storage_power_station_id,))
            row = cursor_system.fetchone()
        elif energy_storage_power_station_uuid is not None:
            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_storage_power_stations "
                     " WHERE uuid = %s ")
            cursor_system.execute(query, (energy_storage_power_station_uuid,))
            row = cursor_system.fetchone()

        if row is None:
            cursor_system.close()
            cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')
        else:
            energy_storage_power_station_id = row[0]
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2]}

        ################################################################################################################
        # Step 3: query associated containers
        ################################################################################################################
        # todo: query multiple energy storage containers
        container_list = list()
        cursor_system.execute(" SELECT c.id, c.name, c.uuid "
                              " FROM tbl_energy_storage_power_stations_containers espsc, "
                              "      tbl_energy_storage_containers c "
                              " WHERE espsc.energy_storage_power_station_id = %s "
                              "      AND espsc.energy_storage_container_id = c.id"
                              " LIMIT 1 ",
                              (energy_storage_power_station_id,))
        row_container = cursor_system.fetchone()
        if row_container is not None:
            container_list.append({"id": row_container[0],
                                   "name": row_container[1],
                                   "uuid": row_container[2]})
        # todo: if len(container_list) == 0
        print('container_list:' + str(container_list))

        ################################################################################################################
        # Step 4: query analog points latest values
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
        # Step 5: query energy points latest values
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
        # Step 6: query digital points latest values
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
        # Step 7: query the points of power conversion systems
        ################################################################################################################

        # query pcs parameters
        pcs_list = list()

        cursor_system.execute(" SELECT id, name, uuid, "
                              "        run_state_point_id, "
                              "        today_charge_energy_point_id, "
                              "        today_discharge_energy_point_id, "
                              "        total_charge_energy_point_id, "
                              "        total_discharge_energy_point_id, "
                              "        working_status_point_id, "
                              "        grid_connection_status_point_id, "
                              "        device_status_point_id, "
                              "        control_mode_point_id, "
                              "        total_ac_active_power_point_id, "
                              "        total_ac_reactive_power_point_id, "
                              "        total_ac_apparent_power_point_id, "
                              "        total_ac_power_factor_point_id, "
                              "        ac_frequency_point_id, "
                              "        phase_a_active_power_point_id, "
                              "        phase_b_active_power_point_id, "
                              "        phase_c_active_power_point_id, "
                              "        phase_a_reactive_power_point_id, "
                              "        phase_b_reactive_power_point_id, "
                              "        phase_c_reactive_power_point_id, "
                              "        phase_a_apparent_power_point_id, "
                              "        phase_b_apparent_power_point_id, "
                              "        phase_c_apparent_power_point_id, "
                              "        ab_voltage_point_id, "
                              "        bc_voltage_point_id, "
                              "        ca_voltage_point_id, "
                              "        ab_current_point_id, "
                              "        bc_current_point_id, "
                              "        ca_current_point_id, "
                              "        phase_a_voltage_point_id, "
                              "        phase_b_voltage_point_id, "
                              "        phase_c_voltage_point_id, "
                              "        phase_a_current_point_id, "
                              "        phase_b_current_point_id, "
                              "        phase_c_current_point_id, "
                              "        pcs_module_temperature_point_id, "
                              "        pcs_ambient_temperature_point_id, "
                              "        a1_module_temperature_point_id, "
                              "        b1_module_temperature_point_id, "
                              "        c1_module_temperature_point_id, "
                              "        a2_module_temperature_point_id, "
                              "        b2_module_temperature_point_id, "
                              "        c2_module_temperature_point_id, "
                              "        air_inlet_temperature_point_id, "
                              "        air_outlet_temperature_point_id, "
                              "        dc_power_point_id, "
                              "        dc_voltage_point_id, "
                              "        dc_current_point_id "
                              " FROM tbl_energy_storage_containers_power_conversion_systems "
                              " WHERE energy_storage_container_id = %s "
                              " ORDER BY id "
                              " LIMIT 1 ",
                              (container_list[0]['id'],))
        rows_pcs = cursor_system.fetchall()
        if rows_pcs is not None and len(rows_pcs) > 0:
            for row in rows_pcs:
                current_pcs = dict()
                current_pcs['id'] = row[0]
                current_pcs['name'] = row[1]
                current_pcs['uuid'] = row[2]
                current_pcs['run_state_point'] = latest_value_dict.get(row[3], None)
                current_pcs['today_charge_energy_point'] = latest_value_dict.get(row[4], None)
                current_pcs['today_discharge_energy_point'] = latest_value_dict.get(row[5], None)
                current_pcs['total_charge_energy_point'] = latest_value_dict.get(row[6], None)
                current_pcs['total_discharge_energy_point'] = latest_value_dict.get(row[7], None)
                current_pcs['working_status_point'] = latest_value_dict.get(row[8], None)
                current_pcs['grid_connection_status_point'] = latest_value_dict.get(row[9], None)
                current_pcs['device_status_point'] = latest_value_dict.get(row[10], None)
                current_pcs['control_mode_point'] = latest_value_dict.get(row[11], None)
                current_pcs['total_ac_active_power_point'] = latest_value_dict.get(row[12], None)
                current_pcs['total_ac_reactive_power_point'] = latest_value_dict.get(row[13], None)
                current_pcs['total_ac_apparent_power_point'] = latest_value_dict.get(row[14], None)
                current_pcs['total_ac_power_factor_point'] = latest_value_dict.get(row[15], None)
                current_pcs['ac_frequency_point'] = latest_value_dict.get(row[16], None)
                current_pcs['phase_a_active_power_point'] = latest_value_dict.get(row[17], None)
                current_pcs['phase_b_active_power_point'] = latest_value_dict.get(row[18], None)
                current_pcs['phase_c_active_power_point'] = latest_value_dict.get(row[19], None)
                current_pcs['phase_a_reactive_power_point'] = latest_value_dict.get(row[20], None)
                current_pcs['phase_b_reactive_power_point'] = latest_value_dict.get(row[21], None)
                current_pcs['phase_c_reactive_power_point'] = latest_value_dict.get(row[22], None)
                current_pcs['phase_a_apparent_power_point'] = latest_value_dict.get(row[23], None)
                current_pcs['phase_b_apparent_power_point'] = latest_value_dict.get(row[24], None)
                current_pcs['phase_c_apparent_power_point'] = latest_value_dict.get(row[25], None)
                current_pcs['ab_voltage_point'] = latest_value_dict.get(row[26], None)
                current_pcs['bc_voltage_point'] = latest_value_dict.get(row[27], None)
                current_pcs['ca_voltage_point'] = latest_value_dict.get(row[28], None)
                current_pcs['ab_current_point'] = latest_value_dict.get(row[29], None)
                current_pcs['bc_current_point'] = latest_value_dict.get(row[30], None)
                current_pcs['ca_current_point'] = latest_value_dict.get(row[31], None)
                current_pcs['phase_a_voltage_point'] = latest_value_dict.get(row[32], None)
                current_pcs['phase_b_voltage_point'] = latest_value_dict.get(row[33], None)
                current_pcs['phase_c_voltage_point'] = latest_value_dict.get(row[34], None)
                current_pcs['phase_a_current_point'] = latest_value_dict.get(row[35], None)
                current_pcs['phase_b_current_point'] = latest_value_dict.get(row[36], None)
                current_pcs['phase_c_current_point'] = latest_value_dict.get(row[37], None)
                current_pcs['pcs_module_temperature_point'] = latest_value_dict.get(row[38], None)
                current_pcs['pcs_ambient_temperature_point'] = latest_value_dict.get(row[39], None)
                current_pcs['a1_module_temperature_point'] = latest_value_dict.get(row[40], None)
                current_pcs['b1_module_temperature_point'] = latest_value_dict.get(row[41], None)
                current_pcs['c1_module_temperature_point'] = latest_value_dict.get(row[42], None)
                current_pcs['a2_module_temperature_point'] = latest_value_dict.get(row[43], None)
                current_pcs['b2_module_temperature_point'] = latest_value_dict.get(row[44], None)
                current_pcs['c2_module_temperature_point'] = latest_value_dict.get(row[45], None)
                current_pcs['air_inlet_temperature_point'] = latest_value_dict.get(row[46], None)
                current_pcs['air_outlet_temperature_point'] = latest_value_dict.get(row[47], None)
                current_pcs['dc_power_point'] = latest_value_dict.get(row[48], None)
                current_pcs['dc_voltage_point'] = latest_value_dict.get(row[49], None)
                current_pcs['dc_current_point'] = latest_value_dict.get(row[50], None)
                pcs_list.append(current_pcs)

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
        resp.text = json.dumps(pcs_list)
