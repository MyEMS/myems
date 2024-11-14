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
    # Step 7: query the points of meters
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
                                   description='API.INVALID_photovoltaic_POWER_STATION_ID')
        photovoltaic_power_station_id = id_
        ################################################################################################################
        # Step 2: query the energy storage power station
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if photovoltaic_power_station_id is not None:
            query = (" SELECT id, name, uuid "
                     " FROM tbl_photovoltaic_power_stations "
                     " WHERE id = %s ")
            cursor_system.execute(query, (photovoltaic_power_station_id,))
            row = cursor_system.fetchone()

        if row is None:
            cursor_system.close()
            cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.photovoltaic_POWER_STATION_NOT_FOUND')
        else:
            photovoltaic_power_station_id = row[0]
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2]}

        ################################################################################################################
        # Step 3: query associated containers
        ################################################################################################################
        # todo: query multiple energy storage containers
        container_list = list()
        cursor_system.execute(" SELECT c.id, c.name, c.uuid "
                              " FROM tbl_photovoltaic_power_stations_containers espsc, "
                              "      tbl_photovoltaic_containers c "
                              " WHERE espsc.photovoltaic_power_station_id = %s "
                              "      AND espsc.photovoltaic_container_id = c.id"
                              " LIMIT 1 ",
                              (photovoltaic_power_station_id,))
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
        # Step 7: query the points of meters
        ################################################################################################################

        # query grid meter parameters
        meter_list = list()
        cursor_system.execute(" SELECT id, name, uuid, "
                              "        total_active_power_point_id, "
                              "        active_power_a_point_id, "
                              "        active_power_b_point_id, "
                              "        active_power_c_point_id, "
                              "        total_reactive_power_point_id, "
                              "        reactive_power_a_point_id, "
                              "        reactive_power_b_point_id, "
                              "        reactive_power_c_point_id, "
                              "        total_apparent_power_point_id, "
                              "        apparent_power_a_point_id, "
                              "        apparent_power_b_point_id, "
                              "        apparent_power_c_point_id, "
                              "        total_power_factor_point_id, "
                              "        active_energy_import_point_id, "
                              "        active_energy_export_point_id, "
                              "        active_energy_net_point_id "
                              " FROM tbl_photovoltaic_containers_grids "
                              " WHERE photovoltaic_container_id = %s "
                              " ORDER BY id ",
                              (container_list[0]['id'],))
        rows_grid_meters = cursor_system.fetchall()
        if rows_grid_meters is not None and len(rows_grid_meters) > 0:
            for row in rows_grid_meters:
                current_grid_meter = dict()
                current_grid_meter['id'] = row[0]
                current_grid_meter['name'] = row[1]
                current_grid_meter['uuid'] = row[2]
                current_grid_meter['total_active_power_point'] = latest_value_dict.get(row[3], None)
                current_grid_meter['active_power_a_point'] = latest_value_dict.get(row[4], None)
                current_grid_meter['active_power_b_point'] = latest_value_dict.get(row[5], None)
                current_grid_meter['active_power_c_point'] = latest_value_dict.get(row[6], None)
                current_grid_meter['total_reactive_power_point'] = latest_value_dict.get(row[7], None)
                current_grid_meter['reactive_power_a_point'] = latest_value_dict.get(row[8], None)
                current_grid_meter['reactive_power_b_point'] = latest_value_dict.get(row[9], None)
                current_grid_meter['reactive_power_c_point'] = latest_value_dict.get(row[10], None)
                current_grid_meter['total_apparent_power_point'] = latest_value_dict.get(row[11], None)
                current_grid_meter['apparent_power_a_point'] = latest_value_dict.get(row[12], None)
                current_grid_meter['apparent_power_b_point'] = latest_value_dict.get(row[13], None)
                current_grid_meter['apparent_power_c_point'] = latest_value_dict.get(row[14], None)
                current_grid_meter['total_power_factor_point'] = latest_value_dict.get(row[15], None)
                current_grid_meter['active_energy_import_point'] = latest_value_dict.get(row[16], None)
                current_grid_meter['active_energy_export_point'] = latest_value_dict.get(row[17], None)
                current_grid_meter['active_energy_net_point'] = latest_value_dict.get(row[18], None)
                meter_list.append(current_grid_meter)

        # query load meter parameters
        cursor_system.execute(" SELECT id, name, uuid, "
                              "        total_active_power_point_id, "
                              "        active_power_a_point_id, "
                              "        active_power_b_point_id, "
                              "        active_power_c_point_id, "
                              "        total_reactive_power_point_id, "
                              "        reactive_power_a_point_id, "
                              "        reactive_power_b_point_id, "
                              "        reactive_power_c_point_id, "
                              "        total_apparent_power_point_id, "
                              "        apparent_power_a_point_id, "
                              "        apparent_power_b_point_id, "
                              "        apparent_power_c_point_id, "
                              "        total_power_factor_point_id, "
                              "        active_energy_import_point_id, "
                              "        active_energy_export_point_id, "
                              "        active_energy_net_point_id "
                              " FROM tbl_photovoltaic_containers_loads "
                              " WHERE photovoltaic_container_id = %s "
                              " ORDER BY id ",
                              (container_list[0]['id'],))
        rows_load_meters = cursor_system.fetchall()
        if rows_load_meters is not None and len(rows_load_meters) > 0:
            for row in rows_load_meters:
                current_load_meter = dict()
                current_load_meter['id'] = row[0]
                current_load_meter['name'] = row[1]
                current_load_meter['uuid'] = row[2]
                current_load_meter['total_active_power_point'] = latest_value_dict.get(row[3], None)
                current_load_meter['active_power_a_point'] = latest_value_dict.get(row[4], None)
                current_load_meter['active_power_b_point'] = latest_value_dict.get(row[5], None)
                current_load_meter['active_power_c_point'] = latest_value_dict.get(row[6], None)
                current_load_meter['total_reactive_power_point'] = latest_value_dict.get(row[7], None)
                current_load_meter['reactive_power_a_point'] = latest_value_dict.get(row[8], None)
                current_load_meter['reactive_power_b_point'] = latest_value_dict.get(row[9], None)
                current_load_meter['reactive_power_c_point'] = latest_value_dict.get(row[10], None)
                current_load_meter['total_apparent_power_point'] = latest_value_dict.get(row[11], None)
                current_load_meter['apparent_power_a_point'] = latest_value_dict.get(row[12], None)
                current_load_meter['apparent_power_b_point'] = latest_value_dict.get(row[13], None)
                current_load_meter['apparent_power_c_point'] = latest_value_dict.get(row[14], None)
                current_load_meter['total_power_factor_point'] = latest_value_dict.get(row[15], None)
                current_load_meter['active_energy_import_point'] = latest_value_dict.get(row[16], None)
                current_load_meter['active_energy_export_point'] = latest_value_dict.get(row[17], None)
                current_load_meter['active_energy_net_point'] = latest_value_dict.get(row[18], None)
                meter_list.append(current_load_meter)

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
        resp.text = json.dumps(meter_list)
