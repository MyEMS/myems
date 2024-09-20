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
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the energy storage power station
    # Step 3: query associated containers
    # Step 4: query analog points latest values
    # Step 5: query energy points latest values
    # Step 6: query digital points latest values
    # Step 7: query the points of batteries
    # Step 8: construct the report
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
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')
        energy_storage_power_station_id = id_
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
        # Step 7: query the points of batteries
        ################################################################################################################

        # query battery parameters
        battery_list = list()

        cursor_system.execute(" SELECT id, name, uuid, "
                              "        battery_state_point_id, "
                              "        soc_point_id, "
                              "        power_point_id, "
                              "        communication_status_with_pcs_point_id, "
                              "        communication_status_with_ems_point_id, "
                              "        grid_status_point_id, "
                              "        total_voltage_point_id, "
                              "        total_current_point_id, "
                              "        soh_point_id, "
                              "        charging_power_limit_point_id, "
                              "        discharge_limit_power_point_id, "
                              "        rechargeable_capacity_point_id, "
                              "        dischargeable_capacity_point_id, "
                              "        average_temperature_point_id, "
                              "        average_voltage_point_id, "
                              "        insulation_value_point_id, "
                              "        positive_insulation_value_point_id, "
                              "        negative_insulation_value_point_id, "
                              "        maximum_temperature_point_id, "
                              "        maximum_temperature_battery_cell_point_id, "
                              "        minimum_temperature_point_id, "
                              "        minimum_temperature_battery_cell_point_id, "
                              "        maximum_voltage_point_id, "
                              "        maximum_voltage_battery_cell_point_id, "
                              "        minimum_voltage_point_id, "
                              "        minimum_voltage_battery_cell_point_id "
                              " FROM tbl_energy_storage_containers_batteries "
                              " WHERE energy_storage_container_id = %s "
                              " ORDER BY id "
                              " LIMIT 1 ",
                              (container_list[0]['id'],))
        rows_batteries = cursor_system.fetchall()
        if rows_batteries is not None and len(rows_batteries) > 0:
            for row in rows_batteries:
                current_battery = dict()
                current_battery['id'] = row[0]
                current_battery['name'] = row[1]
                current_battery['uuid'] = row[2]
                current_battery['battery_state_point'] = latest_value_dict.get(row[3], None)
                current_battery['soc_point'] = latest_value_dict.get(row[4], None)
                current_battery['power_point'] = latest_value_dict.get(row[5], None)
                current_battery['communication_status_with_pcs_point'] = latest_value_dict.get(row[6], None)
                current_battery['communication_status_with_ems_point'] = latest_value_dict.get(row[7], None)
                current_battery['grid_status_point'] = latest_value_dict.get(row[8], None)
                current_battery['total_voltage_point'] = latest_value_dict.get(row[9], None)
                current_battery['total_current_point'] = latest_value_dict.get(row[10], None)
                current_battery['soh_point'] = latest_value_dict.get(row[11], None)
                current_battery['charging_power_limit_point'] = latest_value_dict.get(row[12], None)
                current_battery['discharge_limit_power_point'] = latest_value_dict.get(row[13], None)
                current_battery['rechargeable_capacity_point'] = latest_value_dict.get(row[14], None)
                current_battery['dischargeable_capacity_point'] = latest_value_dict.get(row[15], None)
                current_battery['average_temperature_point'] = latest_value_dict.get(row[16], None)
                current_battery['average_voltage_point'] = latest_value_dict.get(row[17], None)
                current_battery['insulation_value_point'] = latest_value_dict.get(row[18], None)
                current_battery['positive_insulation_value_point'] = latest_value_dict.get(row[19], None)
                current_battery['negative_insulation_value_point'] = latest_value_dict.get(row[20], None)
                current_battery['maximum_temperature_point'] = latest_value_dict.get(row[21], None)
                current_battery['maximum_temperature_battery_cell_point'] = latest_value_dict.get(row[22], None)
                current_battery['minimum_temperature_point'] = latest_value_dict.get(row[23], None)
                current_battery['minimum_temperature_battery_cell_point'] = latest_value_dict.get(row[24], None)
                current_battery['maximum_voltage_point'] = latest_value_dict.get(row[25], None)
                current_battery['maximum_voltage_battery_cell_point'] = latest_value_dict.get(row[26], None)
                current_battery['minimum_voltage_point'] = latest_value_dict.get(row[27], None)
                current_battery['minimum_voltage_battery_cell_point'] = latest_value_dict.get(row[28], None)
                battery_list.append(current_battery)

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
        resp.text = json.dumps(battery_list)
