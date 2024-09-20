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
    # Step 7: query the points of HVACs
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
        # Step 7: query the points of HVACs
        ################################################################################################################

        # query pcs parameters
        hvac_list = list()

        cursor_system.execute(" SELECT id, name, uuid, "
                              "        working_status_point_id, "
                              "        indoor_fan_status_point_id, "
                              "        outdoor_fan_status_point_id, "
                              "        emergency_fan_status_point_id, "
                              "        compressor_status_point_id, "
                              "        electric_heating_status_point_id, "
                              "        coil_temperature_point_id, "
                              "        temperature_outside_point_id, "
                              "        temperature_inside_point_id, "
                              "        condensation_temperature_point_id, "
                              "        outlet_air_temperature_point_id, "
                              "        return_air_temperature_point_id, "
                              "        exhaust_temperature_point_id, "
                              "        heating_on_temperature_point_id, "
                              "        heating_off_temperature_point_id, "
                              "        cooling_on_temperature_point_id, "
                              "        cooling_off_temperature_point_id, "
                              "        high_temperature_alarm_set_point_id, "
                              "        low_temperature_alarm_set_point_id "
                              " FROM tbl_energy_storage_containers_hvacs "
                              " WHERE energy_storage_container_id = %s "
                              " ORDER BY id "
                              " LIMIT 1 ",
                              (container_list[0]['id'],))
        rows_hvac = cursor_system.fetchall()
        if rows_hvac is not None and len(rows_hvac) > 0:
            for row in rows_hvac:
                current_hvac = dict()
                current_hvac['id'] = row[0]
                current_hvac['name'] = row[1]
                current_hvac['uuid'] = row[2]
                current_hvac['working_status_point'] = latest_value_dict.get(row[3], None)
                current_hvac['indoor_fan_status_point'] = latest_value_dict.get(row[4], None)
                current_hvac['outdoor_fan_status_point'] = latest_value_dict.get(row[5], None)
                current_hvac['emergency_fan_status_point'] = latest_value_dict.get(row[6], None)
                current_hvac['compressor_status_point'] = latest_value_dict.get(row[7], None)
                current_hvac['electric_heating_status_point'] = latest_value_dict.get(row[8], None)
                current_hvac['coil_temperature_point'] = latest_value_dict.get(row[9], None)
                current_hvac['temperature_outside_point'] = latest_value_dict.get(row[10], None)
                current_hvac['temperature_inside_point'] = latest_value_dict.get(row[11], None)
                current_hvac['condensation_temperature_point'] = latest_value_dict.get(row[12], None)
                current_hvac['outlet_air_temperature_point'] = latest_value_dict.get(row[13], None)
                current_hvac['return_air_temperature_point'] = latest_value_dict.get(row[14], None)
                current_hvac['exhaust_temperature_point'] = latest_value_dict.get(row[15], None)
                current_hvac['heating_on_temperature_point'] = latest_value_dict.get(row[16], None)
                current_hvac['heating_off_temperature_point'] = latest_value_dict.get(row[17], None)
                current_hvac['cooling_on_temperature_point'] = latest_value_dict.get(row[18], None)
                current_hvac['cooling_off_temperature_point'] = latest_value_dict.get(row[19], None)
                current_hvac['high_temperature_alarm_set_point'] = latest_value_dict.get(row[20], None)
                current_hvac['low_temperature_alarm_set_point'] = latest_value_dict.get(row[21], None)
                hvac_list.append(current_hvac)

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
        resp.text = json.dumps(hvac_list)
