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
    # Step 2: query the energy storage power station
    # Step 3: query associated containers
    # Step 4: query analog points latest values
    # Step 5: query energy points latest values
    # Step 6: query digital points latest values
    # Step 7: query the points of dcdcs
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
        container_list = list()
        cursor_system.execute(" SELECT c.id, c.name, c.uuid "
                              " FROM tbl_energy_storage_power_stations_containers espsc, "
                              "      tbl_energy_storage_containers c "
                              " WHERE espsc.energy_storage_power_station_id = %s "
                              "      AND espsc.energy_storage_container_id = c.id ",
                              (energy_storage_power_station_id,))
        rows_containers = cursor_system.fetchall()
        if rows_containers is not None and len(rows_containers) > 0:
            for row_container in rows_containers:
                container_list.append({"id": row_container[0],
                                       "name": row_container[1],
                                       "uuid": row_container[2]})
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
        # Step 7: query the points of dcdcs
        ################################################################################################################
        # query all points with units
        query = (" SELECT id, units "
                 " FROM tbl_points ")
        cursor_system.execute(query)
        rows = cursor_system.fetchall()

        units_dict = dict()
        if rows is not None and len(rows) > 0:
            for row in rows:
                units_dict[row[0]] = row[1]
        # query pcs parameters
        dcdc_list = list()
        for container in container_list:
            cursor_system.execute(" SELECT id, name, uuid, "
                                  " state_point_id, "
                                  " module_environmental_temperature_point_id, "
                                  " radiator_temperature_point_id, "
                                  " environmental_temperature_limit_power_point_id, "
                                  " high_voltage_side_positive_bus_voltage_point_id, "
                                  " high_voltage_side_negative_bus_voltage_point_id, "
                                  " high_voltage_side_positive_busbar_voltage_difference_point_id, "
                                  " high_voltage_side_voltage_point_id, "
                                  " low_voltage_side_voltage_point_id, "
                                  " low_voltage_side_current_point_id, "
                                  " low_voltage_side_dc_power_point_id, "
                                  " high_voltage_side_pre_charging_overvoltage_point_id, "
                                  " high_voltage_side_polarity_reverse_connection_point_id, "
                                  " high_voltage_side_short_circuit_point_id, "
                                  " high_voltage_side_unbalanced_busbars_point_id, "
                                  " low_voltage_side_undervoltage_point_id, "
                                  " low_voltage_side_overvoltage_point_id, "
                                  " low_voltage_side_overcurrent_point_id, "
                                  " low_voltage_side_reverse_polarity_connection_point_id, "
                                  " low_insulation_resistance_point_id "
                                  " FROM tbl_energy_storage_containers_dcdcs "
                                  " WHERE energy_storage_container_id = %s "
                                  " ORDER BY id ",
                                  (container_list[0]['id'],))
            rows_dcdcs = cursor_system.fetchall()
            if rows_dcdcs is not None and len(rows_dcdcs) > 0:
                for row in rows_dcdcs:
                    current_dcdc = dict()
                    current_dcdc['id'] = row[0]
                    current_dcdc['name'] = container['name'] + '-' + row[1]
                    current_dcdc['uuid'] = row[2]
                    current_dcdc['state_point'] = (latest_value_dict.get(row[3], None),
                                                   units_dict.get(row[3], None))
                    current_dcdc['module_environmental_temperature_point'] = (latest_value_dict.get(row[4], None),
                                                                              units_dict.get(row[4], None))
                    current_dcdc['radiator_temperature_point'] = (latest_value_dict.get(row[5], None),
                                                                  units_dict.get(row[5], None))
                    current_dcdc['environmental_temperature_limit_power_point'] = (latest_value_dict.get(row[6], None),
                                                                                   units_dict.get(row[6], None))
                    current_dcdc['high_voltage_side_positive_bus_voltage_point'] = (latest_value_dict.get(row[7], None),
                                                                                    units_dict.get(row[7], None))
                    current_dcdc['high_voltage_side_negative_bus_voltage_point'] = (latest_value_dict.get(row[8], None),
                                                                                    units_dict.get(row[8], None))
                    current_dcdc['high_voltage_side_positive_busbar_voltage_difference_point'] = \
                        (latest_value_dict.get(row[9], None),
                         units_dict.get(row[9], None))
                    current_dcdc['high_voltage_side_voltage_point'] = (latest_value_dict.get(row[10], None),
                                                                       units_dict.get(row[10], None))
                    current_dcdc['low_voltage_side_voltage_point'] = (latest_value_dict.get(row[11], None),
                                                                      units_dict.get(row[11], None))
                    current_dcdc['low_voltage_side_current_point'] = (latest_value_dict.get(row[12], None),
                                                                      units_dict.get(row[12], None))
                    current_dcdc['low_voltage_side_dc_power_point'] = (latest_value_dict.get(row[13], None),
                                                                       units_dict.get(row[13], None))
                    current_dcdc['high_voltage_side_pre_charging_overvoltage_point'] = \
                        (latest_value_dict.get(row[14], None),
                         units_dict.get(row[14], None))
                    current_dcdc['high_voltage_side_polarity_reverse_connection_point'] = \
                        (latest_value_dict.get(row[15], None),
                         units_dict.get(row[15], None))
                    current_dcdc['high_voltage_side_short_circuit_point'] = (latest_value_dict.get(row[16], None),
                                                                             units_dict.get(row[16], None))
                    current_dcdc['high_voltage_side_unbalanced_busbars_point'] = \
                        (latest_value_dict.get(row[17], None),
                         units_dict.get(row[17], None))
                    current_dcdc['low_voltage_side_undervoltage_point'] = (latest_value_dict.get(row[18], None),
                                                                           units_dict.get(row[18], None))
                    current_dcdc['low_voltage_side_overvoltage_point'] = (latest_value_dict.get(row[19], None),
                                                                          units_dict.get(row[19], None))
                    current_dcdc['low_voltage_side_overcurrent_point'] = (latest_value_dict.get(row[20], None),
                                                                          units_dict.get(row[20], None))
                    current_dcdc['low_voltage_side_reverse_polarity_connection_point'] = \
                        (latest_value_dict.get(row[21], None),
                         units_dict.get(row[21], None))
                    current_dcdc['low_insulation_resistance_point'] = (latest_value_dict.get(row[22], None),
                                                                       units_dict.get(row[22], None))
                    dcdc_list.append(current_dcdc)

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
        resp.text = json.dumps(dcdc_list)
