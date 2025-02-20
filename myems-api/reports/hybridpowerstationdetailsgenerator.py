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
    # Step 2: query the hybrid power station
    # Step 3: query analog points latest values
    # Step 4: query energy points latest values
    # Step 5: query digital points latest values
    # Step 6: query the points of generators
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
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
        hybrid_power_station_id = id_
        ################################################################################################################
        # Step 2: query the hybrid power station
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if hybrid_power_station_id is not None:
            query = (" SELECT id, name, uuid "
                     " FROM tbl_hybrid_power_stations "
                     " WHERE id = %s ")
            cursor_system.execute(query, (hybrid_power_station_id,))
            row = cursor_system.fetchone()

        if row is None:
            cursor_system.close()
            cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

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
        # Step 6: query the points of associated generators
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

        generator_list = list()
        cursor_system.execute(" SELECT `id`, `name`, `uuid`, "
                              " `operating_status_point_id`, `power_generation_point_id`, "
                              " `phase_a_voltage_point_id`, `phase_b_voltage_point_id`, "
                              " `phase_c_voltage_point_id`, `phase_a_current_point_id`, "
                              " `phase_b_current_point_id`, `phase_c_current_point_id`, "
                              " `phase_a_active_power_point_id`, `phase_b_active_power_point_id`, "
                              " `phase_c_active_power_point_id`, `phase_a_reactive_power_point_id`, "
                              " `phase_b_reactive_power_point_id`, `phase_c_reactive_power_point_id`, "
                              " `power_factor_point_id`, `genset_active_power_point_id`, "
                              " `genset_reactive_power_point_id`, `genset_frequency_point_id`, "
                              " `engine_fuel_level_point_id`, `engine_oil_pressure_point_id`, "
                              " `engine_coolant_temperature_point_id`, "
                              " `cumulative_engine_fuel_consumption_point_id`, "
                              " `cumulative_fuel_efficiency_point_id`, "
                              " `instantaneous_fuel_efficiency_point_id` "
                              " FROM tbl_hybrid_power_stations_generators "
                              " WHERE hybrid_power_station_id = %s "
                              " ORDER BY id ",
                              (hybrid_power_station_id,))
        rows_generators = cursor_system.fetchall()
        if rows_generators is not None and len(rows_generators) > 0:
            for row in rows_generators:
                current_generator = dict()
                current_generator['id'] = row[0]
                current_generator['name'] = row[1]
                current_generator['uuid'] = row[2]
                current_generator['operating_status_point'] = \
                    (latest_value_dict.get(row[3], None),
                     units_dict.get(row[3], None))
                current_generator['power_generation_point'] = \
                    (latest_value_dict.get(row[4], None),
                     units_dict.get(row[4], None))
                current_generator['phase_a_voltage_point'] = \
                    (latest_value_dict.get(row[5], None),
                     units_dict.get(row[5], None))
                current_generator['phase_b_voltage_point'] = \
                    (latest_value_dict.get(row[6], None),
                     units_dict.get(row[6], None))
                current_generator['phase_c_voltage_point'] = \
                    (latest_value_dict.get(row[7], None),
                     units_dict.get(row[7], None))
                current_generator['phase_a_current_point'] = \
                    (latest_value_dict.get(row[8], None),
                     units_dict.get(row[8], None))
                current_generator['phase_b_current_point'] = \
                    (latest_value_dict.get(row[9], None),
                     units_dict.get(row[9], None))
                current_generator['phase_c_current_point'] = \
                    (latest_value_dict.get(row[10], None),
                     units_dict.get(row[10], None))
                current_generator['phase_a_active_power_point'] = \
                    (latest_value_dict.get(row[11], None),
                     units_dict.get(row[11], None))
                current_generator['phase_b_active_power_point'] = \
                    (latest_value_dict.get(row[12], None),
                     units_dict.get(row[12], None))
                current_generator['phase_c_active_power_point'] = \
                    (latest_value_dict.get(row[13], None),
                     units_dict.get(row[13], None))
                current_generator['phase_a_reactive_power_point'] = \
                    (latest_value_dict.get(row[14], None),
                     units_dict.get(row[14], None))
                current_generator['phase_b_reactive_power_point'] = \
                    (latest_value_dict.get(row[15], None),
                     units_dict.get(row[15], None))
                current_generator['phase_c_reactive_power_point'] = \
                    (latest_value_dict.get(row[16], None),
                     units_dict.get(row[16], None))
                current_generator['power_factor_point'] = \
                    (latest_value_dict.get(row[17], None),
                     units_dict.get(row[17], None))
                current_generator['genset_active_power_point'] = \
                    (latest_value_dict.get(row[18], None),
                     units_dict.get(row[18], None))
                current_generator['genset_reactive_power_point'] = \
                    (latest_value_dict.get(row[19], None),
                     units_dict.get(row[19], None))
                current_generator['genset_frequency_point'] = \
                    (latest_value_dict.get(row[20], None),
                     units_dict.get(row[20], None))
                current_generator['engine_fuel_level_point'] = \
                    (latest_value_dict.get(row[21], None),
                     units_dict.get(row[21], None))
                current_generator['engine_oil_pressure_point'] = \
                    (latest_value_dict.get(row[22], None),
                     units_dict.get(row[22], None))
                current_generator['engine_coolant_temperature_point'] = \
                    (latest_value_dict.get(row[23], None),
                     units_dict.get(row[23], None))
                current_generator['cumulative_engine_fuel_consumption_point'] = \
                    (latest_value_dict.get(row[24], None),
                     units_dict.get(row[24], None))
                current_generator['cumulative_fuel_efficiency_point'] = \
                    (latest_value_dict.get(row[25], None),
                     units_dict.get(row[25], None))
                current_generator['instantaneous_fuel_efficiency_point'] = \
                    (latest_value_dict.get(row[26], None),
                     units_dict.get(row[26], None))
                generator_list.append(current_generator)

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
        resp.text = json.dumps(generator_list)
