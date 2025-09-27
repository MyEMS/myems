import falcon
from datetime import datetime, timedelta
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control
import config
from decimal import Decimal


PV_GRID_POINT_COLUMNS = [
    "power_point_id",
    "total_active_power_point_id",
    "active_power_a_point_id",
    "active_power_b_point_id",
    "active_power_c_point_id",
    "total_reactive_power_point_id",
    "reactive_power_a_point_id",
    "reactive_power_b_point_id",
    "reactive_power_c_point_id",
    "total_apparent_power_point_id",
    "apparent_power_a_point_id",
    "apparent_power_b_point_id",
    "apparent_power_c_point_id",
    "total_power_factor_point_id",
    "active_energy_import_point_id",
    "active_energy_export_point_id",
    "active_energy_net_point_id",
]

PV_LOAD_POINT_COLUMNS = list(PV_GRID_POINT_COLUMNS)

_PV_INVERTOR_BASE_COLUMNS = [
    "invertor_state_point_id",
    "communication_state_point_id",
    "total_energy_point_id",
    "today_energy_point_id",
    "efficiency_point_id",
    "temperature_point_id",
    "power_factor_point_id",
    "active_power_point_id",
    "reactive_power_point_id",
    "frequency_point_id",
    "uab_point_id",
    "ubc_point_id",
    "uca_point_id",
    "ua_point_id",
    "ub_point_id",
    "uc_point_id",
    "ia_point_id",
    "ib_point_id",
    "ic_point_id",
]
_PV_INVERTOR_PV_COLUMNS = [f"pv{i}_{suffix}_point_id" for i in range(1, 29) for suffix in ("u", "i")]
_PV_INVERTOR_MPPT_COLUMNS = ["mppt_total_energy_point_id", "mppt_power_point_id"] + [f"mppt_{i}_energy_point_id" for i in range(1, 11)]
PV_INVERTOR_POINT_COLUMNS = (
    _PV_INVERTOR_BASE_COLUMNS
    + _PV_INVERTOR_PV_COLUMNS
    + _PV_INVERTOR_MPPT_COLUMNS
    + ["startup_time_point_id", "shutdown_time_point_id"]
)

POINT_RELATION_CHECKS = [
    ("tbl_microgrids_grids_points", ("point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_GRIDS_POINTS"),
    ("tbl_microgrids_heatpumps_points", ("point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_HEATPUMPS_POINTS"),
    ("tbl_microgrids_loads_points", ("point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_LOADS_POINTS"),
    ("tbl_microgrids_pvs_points", ("point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_PVS_POINTS"),
    ("tbl_photovoltaic_power_stations", ("latitude_point_id", "longitude_point_id"), "API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS"),
    ("tbl_photovoltaic_power_stations_grids", tuple(PV_GRID_POINT_COLUMNS), "API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS_GRIDS"),
    ("tbl_photovoltaic_power_stations_grids_points", ("point_id",), "API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS_GRIDS"),
    ("tbl_photovoltaic_power_stations_invertors", tuple(PV_INVERTOR_POINT_COLUMNS), "API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS_INVERTORS"),
    ("tbl_photovoltaic_power_stations_invertors_points", ("point_id",), "API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS_INVERTORS"),
    ("tbl_photovoltaic_power_stations_loads", tuple(PV_LOAD_POINT_COLUMNS), "API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS_LOADS"),
    ("tbl_photovoltaic_power_stations_loads_points", ("point_id",), "API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS_LOADS"),
    ("tbl_points_set_values", ("point_id",), "API.THERE_IS_RELATION_WITH_POINTS_SET_VALUES"),
    ("tbl_power_integrators", ("power_point_id", "result_point_id"), "API.THERE_IS_RELATION_WITH_POWER_INTEGRATORS"),
    ("tbl_virtual_power_plants_microgrids", ("point_id", "virtual_power_plant_id", "microgrid_id"), "API.THERE_IS_RELATION_WITH_VIRTUAL_POWER_PLANTS_MICROGRIDS"),
    ("tbl_wind_farms", ("latitude_point_id", "longitude_point_id"), "API.THERE_IS_RELATION_WITH_WIND_FARMS"),
    ("tbl_meters_points", ("point_id",), "API.THERE_IS_RELATION_WITH_METERS"),
    ("tbl_sensors_points", ("point_id",), "API.THERE_IS_RELATION_WITH_SENSORS"),
    ("tbl_shopfloors_points", ("point_id",), "API.THERE_IS_RELATION_WITH_SHOPFLOORS"),
    ("tbl_stores_points", ("point_id",), "API.THERE_IS_RELATION_WITH_STORES"),
    ("tbl_spaces_points", ("point_id",), "API.THERE_IS_RELATION_WITH_SPACES"),
    ("tbl_tenants_points", ("point_id",), "API.THERE_IS_RELATION_WITH_TENANTS"),
    ("tbl_equipments_parameters", ("point_id",), "API.THERE_IS_RELATION_WITH_EQUIPMENT_PARAMETERS"),
    ("tbl_combined_equipments_parameters", ("point_id",), "API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENT_PARAMETERS"),
    ("tbl_distribution_circuits_points", ("point_id",), "API.THERE_IS_RELATION_WITH_DISTRIBUTION_CIRCUITS_POINTS"),
    ("tbl_heat_integrators", ("high_temperature_point_id", "low_temperature_point_id", "flow_point_id", "result_point_id"), "API.THERE_IS_RELATION_WITH_HEAT_INTEGRATORS"),
    ("tbl_microgrids_batteries", ("battery_state_point_id", "soc_point_id", "power_point_id"), "API.THERE_IS_RELATION_WITH_MICROGRIDS_BATTERIES"),
    ("tbl_microgrids_power_conversion_systems", ("run_state_point_id", "today_charge_energy_point_id", "today_discharge_energy_point_id", "total_charge_energy_point_id", "total_discharge_energy_point_id"), "API.THERE_IS_RELATION_WITH_MICROGRIDS_POWER_CONVERSION_SYSTEMS"),
    ("tbl_microgrids_evchargers", ("power_point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_EVCHARGERS"),
    ("tbl_microgrids_evchargers_points", ("point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_EVCHARGERS_POINTS"),
    ("tbl_microgrids_generators", ("power_point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_GENERATORS"),
    ("tbl_microgrids_generators_points", ("point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_GENERATORS_POINTS"),
    ("tbl_microgrids_grids", ("power_point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_GRIDS"),
    ("tbl_microgrids_heatpumps", ("power_point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_HEATPUMPS"),
    ("tbl_microgrids_loads", ("power_point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_LOADS"),
    ("tbl_microgrids_photovoltaics", ("power_point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_PHOTOVOLTAICS"),
    ("tbl_microgrids", ("latitude_point_id", "longitude_point_id"), "API.THERE_IS_RELATION_WITH_MICROGRIDS"),
    ("tbl_microgrids_bmses_points", ("point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_BMSES_POINTS"),
    ("tbl_microgrids_pcses_points", ("point_id",), "API.THERE_IS_RELATION_WITH_MICROGRIDS_PCSES_POINTS"),
    ("tbl_virtual_power_plants", ("balancing_price_point_id",), "API.THERE_IS_RELATION_WITH_VIRTUAL_POWER_PLANTS"),
    ("tbl_energy_storage_containers_batteries", ("battery_state_point_id", "soc_point_id", "power_point_id"), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_BATTERIES"),
    ("tbl_energy_storage_containers_grids", ("power_point_id",), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_GRIDS"),
    ("tbl_energy_storage_containers_grids_points", ("point_id",), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_GRIDS_POINTS"),
    ("tbl_energy_storage_containers_bmses_points", ("point_id",), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_BMSES_POINTS"),
    ("tbl_energy_storage_containers_dcdcs_points", ("point_id",), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_DCDCS"),
    ("tbl_energy_storage_containers_firecontrols_points", ("point_id",), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_FIRECONTROLS"),
    ("tbl_energy_storage_containers_hvacs_points", ("point_id",), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_HVACS"),
    ("tbl_energy_storage_containers_loads", ("power_point_id",), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_LOADS"),
    ("tbl_energy_storage_containers_loads_points", ("point_id",), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_LOADS"),
    ("tbl_energy_storage_containers_power_conversion_systems", ("run_state_point_id",), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_POWER_CONVERSION_SYSTEMS"),
    ("tbl_energy_storage_containers_pcses_points", ("point_id",), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_POWER_CONVERSION_SYSTEMS"),
    ("tbl_energy_storage_containers_stses_points", ("point_id",), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_STSES"),
    ("tbl_energy_storage_power_stations", ("latitude_point_id", "longitude_point_id"), "API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_POWER_STATIONS"),
    ("tbl_fuel_integrators", ("power_point_id", "result_point_id"), "API.THERE_IS_RELATION_WITH_FUEL_INTEGRATORS"),
    ("tbl_meters_points", ("point_id",), "API.THERE_IS_RELATION_WITH_METERS_POINTS"),
    ("tbl_sensors_points", ("point_id",), "API.THERE_IS_RELATION_WITH_SENSORS_POINTS"),
    ("tbl_shopfloors_points", ("point_id",), "API.THERE_IS_RELATION_WITH_SHOPFLOORS_POINTS"),
    ("tbl_spaces_points", ("point_id",), "API.THERE_IS_RELATION_WITH_SPACES_POINTS"),
    ("tbl_stores_points", ("point_id",), "API.THERE_IS_RELATION_WITH_STORES_POINTS"),
    ("tbl_tenants_points", ("point_id",), "API.THERE_IS_RELATION_WITH_TENANTS_POINTS"),
]


class PointCollection:
    def __init__(self):
        """"Initializes PointCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """Handles GET requests"""
        admin_control(req)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_data_sources ")
        cursor.execute(query)
        rows_data_sources = cursor.fetchall()

        data_source_dict = dict()
        if rows_data_sources is not None and len(rows_data_sources) > 0:
            for row in rows_data_sources:
                data_source_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, data_source_id, object_type, units, "
                 "        high_limit, low_limit, higher_limit, lower_limit, ratio, offset_constant, "
                 "        is_trend, is_virtual, address, description, faults, definitions "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "data_source": data_source_dict.get(row[2], None),
                               "object_type": row[3],
                               "units": row[4],
                               "high_limit": row[5],
                               "low_limit": row[6],
                               "higher_limit": row[7],
                               "lower_limit": row[8],
                               "ratio": Decimal(row[9]),
                               "offset_constant": Decimal(row[10]),
                               "is_trend": bool(row[11]),
                               "is_virtual": bool(row[12]),
                               "address": row[13],
                               "description": row[14],
                               "faults": row[15],
                               "definitions": row[16]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_NAME')
        name = str.strip(new_values['data']['name'])

        if 'data_source_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['data_source_id'], int) or \
                new_values['data']['data_source_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')
        data_source_id = new_values['data']['data_source_id']

        if 'object_type' not in new_values['data'].keys() \
                or str.strip(new_values['data']['object_type']) not in \
                ('ENERGY_VALUE', 'ANALOG_VALUE', 'DIGITAL_VALUE', 'TEXT_VALUE'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_OBJECT_TYPE')
        object_type = str.strip(new_values['data']['object_type'])

        if 'units' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['units'], str) or \
                len(str.strip(new_values['data']['units'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNITS')
        units = str.strip(new_values['data']['units'])

        if 'high_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['high_limit'], float) or
                     isinstance(new_values['data']['high_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HIGH_LIMIT_VALUE')
        high_limit = new_values['data']['high_limit']

        if 'low_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['low_limit'], float) or
                     isinstance(new_values['data']['low_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOW_LIMIT_VALUE')
        low_limit = new_values['data']['low_limit']

        # the higher_limit is optional
        if 'higher_limit' not in new_values['data'].keys() or \
                new_values['data']['higher_limit'] is None:
            higher_limit = None
        elif not (isinstance(new_values['data']['higher_limit'], float) or
                  isinstance(new_values['data']['higher_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HIGHER_LIMIT_VALUE')
        else:
            higher_limit = new_values['data']['higher_limit']

        # the lower_limit is optional
        if 'lower_limit' not in new_values['data'].keys() or \
                new_values['data']['lower_limit'] is None:
            lower_limit = None
        elif not (isinstance(new_values['data']['lower_limit'], float) or
                  isinstance(new_values['data']['lower_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOWER_LIMIT_VALUE')
        else:
            lower_limit = new_values['data']['lower_limit']

        if 'ratio' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['ratio'], float) or
                     isinstance(new_values['data']['ratio'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATIO_VALUE')
        ratio = new_values['data']['ratio']

        if 'offset_constant' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['offset_constant'], float) or
                     isinstance(new_values['data']['offset_constant'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFSET_CONSTANT_VALUE')
        offset_constant = new_values['data']['offset_constant']

        if 'is_trend' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_trend'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_TREND_VALUE')
        is_trend = new_values['data']['is_trend']

        if 'is_virtual' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_virtual'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_VIRTUAL_VALUE')
        if new_values['data']['is_virtual'] is True and object_type == 'DIGITAL_VALUE':
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.VIRTUAL_POINT_CAN_NOT_BE_DIGITAL_VALUE')
        if new_values['data']['is_virtual'] is True and object_type == 'TEXT_VALUE':
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.VIRTUAL_POINT_CAN_NOT_BE_TEXT_VALUE')
        is_virtual = new_values['data']['is_virtual']

        if 'address' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['address'], str) or \
                len(str.strip(new_values['data']['address'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADDRESS')
        address = str.strip(new_values['data']['address'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        if 'faults' in new_values['data'].keys() and \
                new_values['data']['faults'] is not None and \
                len(str(new_values['data']['faults'])) > 0:
            faults = str.strip(new_values['data']['faults'])
        else:
            faults = None

        if 'definitions' in new_values['data'].keys() and \
                new_values['data']['definitions'] is not None and \
                len(str(new_values['data']['definitions'])) > 0:
            definitions = str.strip(new_values['data']['definitions'])
        else:
            definitions = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE name = %s AND data_source_id = %s ", (name, data_source_id))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.POINT_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE id = %s ", (data_source_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        add_value = (" INSERT INTO tbl_points (name, data_source_id, object_type, units, "
                     "                         high_limit, low_limit, higher_limit, lower_limit, ratio, "
                     "                         offset_constant, is_trend, is_virtual, address, description, faults, "
                     "                         definitions) "
                     " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_value, (name,
                                   data_source_id,
                                   object_type,
                                   units,
                                   high_limit,
                                   low_limit,
                                   higher_limit,
                                   lower_limit,
                                   ratio,
                                   offset_constant,
                                   is_trend,
                                   is_virtual,
                                   address,
                                   description,
                                   faults,
                                   definitions))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/points/' + str(new_id)


class PointItem:
    def __init__(self):
        """"Initializes PointItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_data_sources ")
        cursor.execute(query)
        rows_data_sources = cursor.fetchall()

        data_source_dict = dict()
        if rows_data_sources is not None and len(rows_data_sources) > 0:
            for row in rows_data_sources:
                data_source_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, data_source_id, object_type, units, "
                 "        high_limit, low_limit, higher_limit, lower_limit, ratio, offset_constant, "
                 "        is_trend, is_virtual, address, description, faults, definitions "
                 " FROM tbl_points "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        result = {"id": row[0],
                  "name": row[1],
                  "data_source": data_source_dict.get(row[2], None),
                  "object_type": row[3],
                  "units": row[4],
                  "high_limit": row[5],
                  "low_limit": row[6],
                  "higher_limit": row[7],
                  "lower_limit": row[8],
                  "ratio": Decimal(row[9]),
                  "offset_constant": Decimal(row[10]),
                  "is_trend": bool(row[11]),
                  "is_virtual": bool(row[12]),
                  "address": row[13],
                  "description": row[14],
                  "faults": row[15],
                  "definitions": row[16]}
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        point_id = int(id_)

        def _raise_relation_error(description):
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description=description)

        for table_name, columns, error_description in POINT_RELATION_CHECKS:
            for column in columns:
                try:
                    cursor.execute(
                        f" SELECT 1 FROM {table_name} WHERE {column} = %s LIMIT 1 ",
                        (point_id,))
                except mysql.connector.Error:
                    continue
                if cursor.fetchone() is not None:
                    _raise_relation_error(error_description)

        cursor.execute(" DELETE FROM tbl_points WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_NAME')
        name = str.strip(new_values['data']['name'])

        if 'data_source_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['data_source_id'], int) or \
                new_values['data']['data_source_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')
        data_source_id = new_values['data']['data_source_id']

        if 'object_type' not in new_values['data'].keys() \
                or str.strip(new_values['data']['object_type']) not in \
                ('ENERGY_VALUE', 'ANALOG_VALUE', 'DIGITAL_VALUE', 'TEXT_VALUE'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_OBJECT_TYPE')
        object_type = str.strip(new_values['data']['object_type'])

        if 'units' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['units'], str) or \
                len(str.strip(new_values['data']['units'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNITS')
        units = str.strip(new_values['data']['units'])

        if 'high_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['high_limit'], float) or
                     isinstance(new_values['data']['high_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HIGH_LIMIT_VALUE')
        high_limit = new_values['data']['high_limit']

        if 'low_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['low_limit'], float) or
                     isinstance(new_values['data']['low_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOW_LIMIT_VALUE')
        low_limit = new_values['data']['low_limit']

        # the higher_limit is optional
        if 'higher_limit' not in new_values['data'].keys() or \
                new_values['data']['higher_limit'] is None:
            higher_limit = None
        elif not (isinstance(new_values['data']['higher_limit'], float) or
                  isinstance(new_values['data']['higher_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HIGHER_LIMIT_VALUE')
        else:
            higher_limit = new_values['data']['higher_limit']

        # the lower_limit is optional
        if 'lower_limit' not in new_values['data'].keys() or \
                new_values['data']['lower_limit'] is None:
            lower_limit = None
        elif not (isinstance(new_values['data']['lower_limit'], float) or
                  isinstance(new_values['data']['lower_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOWER_LIMIT_VALUE')
        else:
            lower_limit = new_values['data']['lower_limit']

        if 'ratio' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['ratio'], float) or
                     isinstance(new_values['data']['ratio'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATIO_VALUE')
        ratio = new_values['data']['ratio']

        if 'offset_constant' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['offset_constant'], float) or
                     isinstance(new_values['data']['offset_constant'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFSET_CONSTANT_VALUE')
        offset_constant = new_values['data']['offset_constant']

        if 'is_trend' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_trend'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_TREND_VALUE')
        is_trend = new_values['data']['is_trend']

        if 'is_virtual' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_virtual'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_VIRTUAL_VALUE')
        if new_values['data']['is_virtual'] is True and object_type == 'DIGITAL_VALUE':
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.VIRTUAL_POINT_CAN_NOT_BE_DIGITAL_VALUE')
        if new_values['data']['is_virtual'] is True and object_type == 'TEXT_VALUE':
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.VIRTUAL_POINT_CAN_NOT_BE_TEXT_VALUE')
        is_virtual = new_values['data']['is_virtual']

        if 'address' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['address'], str) or \
                len(str.strip(new_values['data']['address'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADDRESS')
        address = str.strip(new_values['data']['address'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        if 'faults' in new_values['data'].keys() and \
                new_values['data']['faults'] is not None and \
                len(str(new_values['data']['faults'])) > 0:
            faults = str.strip(new_values['data']['faults'])
        else:
            faults = None

        if 'definitions' in new_values['data'].keys() and \
                new_values['data']['definitions'] is not None and \
                len(str(new_values['data']['definitions'])) > 0:
            definitions = str.strip(new_values['data']['definitions'])
        else:
            definitions = None
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE id = %s ", (data_source_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE name = %s AND data_source_id = %s AND id != %s ", (name, data_source_id, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.POINT_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_points "
                      " SET name = %s, data_source_id = %s, "
                      "     object_type = %s, units = %s, "
                      "     high_limit = %s, low_limit = %s, higher_limit = %s, lower_limit = %s, ratio = %s, "
                      "     offset_constant = %s, is_trend = %s, is_virtual = %s, address = %s, description = %s, "
                      "     faults = %s, definitions = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    data_source_id,
                                    object_type,
                                    units,
                                    high_limit,
                                    low_limit,
                                    higher_limit,
                                    lower_limit,
                                    ratio,
                                    offset_constant,
                                    is_trend,
                                    is_virtual,
                                    address,
                                    description,
                                    faults,
                                    definitions,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class PointLimit:
    def __init__(self):
        """"Initializes PointLimit"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.EXCEPTION', description=str(ex))

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        new_values = json.loads(raw_json)

        if 'high_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['high_limit'], float) or
                     isinstance(new_values['data']['high_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HIGH_LIMIT_VALUE')
        high_limit = new_values['data']['high_limit']

        if 'low_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['low_limit'], float) or
                     isinstance(new_values['data']['low_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOW_LIMIT_VALUE')
        low_limit = new_values['data']['low_limit']

        if 'higher_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['higher_limit'], float) or
                     isinstance(new_values['data']['higher_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HIGHER_LIMIT_VALUE')
        higher_limit = new_values['data']['higher_limit']

        if 'lower_limit' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['lower_limit'], float) or
                     isinstance(new_values['data']['lower_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOWER_LIMIT_VALUE')
        lower_limit = new_values['data']['lower_limit']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        update_row = (" UPDATE tbl_points "
                      " SET  high_limit = %s, low_limit = %s, higher_limit = %s, lower_limit = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (high_limit,
                                    low_limit,
                                    higher_limit,
                                    lower_limit,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class PointSetValue:
    def __init__(self):
        """"Initializes PointSetValue"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.EXCEPTION', description=str(ex))

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        new_values = json.loads(raw_json)

        if 'set_value' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['set_value'], float) or
                     isinstance(new_values['data']['set_value'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SET_VALUE')
        set_value = new_values['data']['set_value']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        add_value = (" INSERT INTO tbl_points_set_values (point_id, set_value, utc_date_time) "
                     " VALUES (%s, %s, %s) ")
        cursor.execute(add_value, (id_, set_value, datetime.utcnow()))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class PointExport:
    def __init__(self):
        """"Initializes PointExport"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_data_sources ")
        cursor.execute(query)
        rows_data_sources = cursor.fetchall()

        data_source_dict = dict()
        if rows_data_sources is not None and len(rows_data_sources) > 0:
            for row in rows_data_sources:
                data_source_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, data_source_id, object_type, units, "
                 "        high_limit, low_limit, higher_limit, lower_limit, ratio, offset_constant, "
                 "        is_trend, is_virtual, address, description, faults, definitions "
                 " FROM tbl_points "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        result = {"id": row[0],
                  "name": row[1],
                  "data_source": data_source_dict.get(row[2], None),
                  "object_type": row[3],
                  "units": row[4],
                  "high_limit": row[5],
                  "low_limit": row[6],
                  "higher_limit": row[7],
                  "lower_limit": row[8],
                  "ratio": Decimal(row[9]),
                  "offset_constant": Decimal(row[10]),
                  "is_trend": bool(row[11]),
                  "is_virtual": bool(row[12]),
                  "address": row[13],
                  "description": row[14],
                  "faults": row[15],
                  "definitions": row[16]}
        resp.text = json.dumps(result)


class PointImport:
    def __init__(self):
        """"Initializes PointImport"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_NAME')
        name = str.strip(new_values['name'])

        if 'id' not in new_values['data_source'].keys() or \
                not isinstance(new_values['data_source']['id'], int) or \
                new_values['data_source']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')
        data_source_id = new_values['data_source']['id']

        if 'object_type' not in new_values.keys() \
                or str.strip(new_values['object_type']) not in (
                'ENERGY_VALUE', 'ANALOG_VALUE', 'DIGITAL_VALUE', 'TEXT_VALUE'):
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_OBJECT_TYPE')
        object_type = str.strip(new_values['object_type'])

        if 'units' not in new_values.keys() or \
                not isinstance(new_values['units'], str) or \
                len(str.strip(new_values['units'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNITS')
        units = str.strip(new_values['units'])

        if 'high_limit' not in new_values.keys() or \
                not (isinstance(new_values['high_limit'], float) or
                     isinstance(new_values['high_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HIGH_LIMIT_VALUE')
        high_limit = new_values['high_limit']

        if 'low_limit' not in new_values.keys() or \
                not (isinstance(new_values['low_limit'], float) or
                     isinstance(new_values['low_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOW_LIMIT_VALUE')
        low_limit = new_values['low_limit']

        # the higher_limit is optional
        if 'higher_limit' not in new_values.keys() or \
                new_values['higher_limit'] is None:
            higher_limit = None
        elif not (isinstance(new_values['higher_limit'], float) or
                  isinstance(new_values['higher_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HIGHER_LIMIT_VALUE')
        else:
            higher_limit = new_values['higher_limit']

        # the lower_limit is optional
        if 'lower_limit' not in new_values.keys() or \
                new_values['lower_limit'] is None:
            lower_limit = None
        elif not (isinstance(new_values['lower_limit'], float) or
                  isinstance(new_values['lower_limit'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOWER_LIMIT_VALUE')
        else:
            lower_limit = new_values['lower_limit']

        if 'ratio' not in new_values.keys() or \
                not (isinstance(new_values['ratio'], float) or
                     isinstance(new_values['ratio'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATIO_VALUE')
        ratio = new_values['ratio']

        if 'offset_constant' not in new_values.keys() or \
                not (isinstance(new_values['offset_constant'], float) or
                     isinstance(new_values['offset_constant'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFSET_CONSTANT_VALUE')
        offset_constant = new_values['offset_constant']

        if 'is_trend' not in new_values.keys() or \
                not isinstance(new_values['is_trend'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_TREND_VALUE')
        is_trend = new_values['is_trend']

        if 'is_virtual' not in new_values.keys() or \
                not isinstance(new_values['is_virtual'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_VIRTUAL_VALUE')
        if new_values['is_virtual'] is True and object_type == 'DIGITAL_VALUE':
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.VIRTUAL_POINT_CAN_NOT_BE_DIGITAL_VALUE')
        if new_values['is_virtual'] is True and object_type == 'TEXT_VALUE':
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.VIRTUAL_POINT_CAN_NOT_BE_TEXT_VALUE')
        is_virtual = new_values['is_virtual']

        if 'address' not in new_values.keys() or \
                not isinstance(new_values['address'], str) or \
                len(str.strip(new_values['address'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADDRESS')
        address = str.strip(new_values['address'])

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        if 'faults' in new_values.keys() and \
                new_values['faults'] is not None and \
                len(str(new_values['faults'])) > 0:
            faults = str.strip(new_values['faults'])
        else:
            faults = None

        if 'definitions' in new_values.keys() and \
                new_values['definitions'] is not None and \
                len(str(new_values['definitions'])) > 0:
            definitions = str.strip(new_values['definitions'])
        else:
            definitions = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE name = %s AND data_source_id = %s ", (name, data_source_id))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.POINT_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE id = %s ", (data_source_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        add_value = (" INSERT INTO tbl_points (name, data_source_id, object_type, units, "
                     "                         high_limit, low_limit, higher_limit, lower_limit, ratio, "
                     "                         offset_constant, is_trend, is_virtual, address, description, faults, "
                     "                         definitions) "
                     " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_value, (name,
                                   data_source_id,
                                   object_type,
                                   units,
                                   high_limit,
                                   low_limit,
                                   higher_limit,
                                   lower_limit,
                                   ratio,
                                   offset_constant,
                                   is_trend,
                                   is_virtual,
                                   address,
                                   description,
                                   faults,
                                   definitions))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/points/' + str(new_id)


class PointClone:
    def __init__(self):
        """"Initializes PointClone"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, data_source_id, object_type, units, "
                 "        high_limit, low_limit, higher_limit, lower_limit, ratio, offset_constant, "
                 "        is_trend, is_virtual, address, description, faults, definitions "
                 " FROM tbl_points "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        result = {"id": row[0],
                  "name": row[1],
                  "data_source_id": row[2],
                  "object_type": row[3],
                  "units": row[4],
                  "high_limit": row[5],
                  "low_limit": row[6],
                  "higher_limit": row[7],
                  "lower_limit": row[8],
                  "ratio": Decimal(row[9]),
                  "offset_constant": Decimal(row[10]),
                  "is_trend": bool(row[11]),
                  "is_virtual": bool(row[12]),
                  "address": row[13],
                  "description": row[14],
                  "faults": row[15],
                  "definitions": row[16]}
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        new_name = (str.strip(result['name']) +
                    (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
        add_value = (" INSERT INTO tbl_points (name, data_source_id, object_type, units, "
                     "                         high_limit, low_limit, higher_limit, lower_limit, ratio, "
                     "                         offset_constant, is_trend, is_virtual, address, description, faults, "
                     "                         definitions) "
                     " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_value, (new_name,
                                   result['data_source_id'],
                                   result['object_type'],
                                   result['units'],
                                   result['high_limit'],
                                   result['low_limit'],
                                   result['higher_limit'],
                                   result['lower_limit'],
                                   result['ratio'],
                                   result['offset_constant'],
                                   result['is_trend'],
                                   result['is_virtual'],
                                   result['address'],
                                   result['description'],
                                   result['faults'],
                                   result['definitions']))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/points/' + str(new_id)

