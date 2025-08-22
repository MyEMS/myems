import falcon
from datetime import datetime, timedelta
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control
import config
from decimal import Decimal


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

        # check if this point is being used by meters
        cursor.execute(" SELECT meter_id "
                       " FROM tbl_meters_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_meter = cursor.fetchone()
        if row_meter is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_METERS')

        # check if this point is being used by sensors
        cursor.execute(" SELECT sensor_id "
                       " FROM tbl_sensors_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_sensor = cursor.fetchone()
        if row_sensor is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SENSORS')

        # check if this point is being used by shopfloors
        cursor.execute(" SELECT shopfloor_id "
                       " FROM tbl_shopfloors_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_shopfloor = cursor.fetchone()
        if row_shopfloor is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SHOPFLOORS')

        # check if this point is being used by stores
        cursor.execute(" SELECT store_id "
                       " FROM tbl_stores_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_store = cursor.fetchone()
        if row_store is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_STORES')

        # check if this point is being used by spaces
        cursor.execute(" SELECT space_id "
                       " FROM tbl_spaces_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_space = cursor.fetchone()
        if row_space is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # check if this point is being used by tenants
        cursor.execute(" SELECT tenant_id "
                       " FROM tbl_tenants_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_tenant = cursor.fetchone()
        if row_tenant is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_TENANTS')

        # check if this point is being used by equipment parameters
        cursor.execute(" SELECT equipment_id "
                       " FROM tbl_equipments_parameters "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_equipment = cursor.fetchone()
        if row_equipment is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENT_PARAMETERS')

        # check if this point is being used by combined equipment parameters
        cursor.execute(" SELECT combined_equipment_id "
                       " FROM tbl_combined_equipments_parameters "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_combined_equipment = cursor.fetchone()
        if row_combined_equipment is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENT_PARAMETERS')

        # check if this point is being used by distribution circuit point
        cursor.execute(" SELECT distribution_circuit_id "
                       " FROM tbl_distribution_circuits_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_distribution_circuit = cursor.fetchone()
        if row_distribution_circuit is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_DISTRIBUTION_CIRCUITS_POINTS')

        # check if this point is being used by distribution integrator
        cursor.execute(" SELECT name "
                       " FROM tbl_integrators "
                       " WHERE high_temperature_point_id = %s "
                       "    OR low_temperature_point_id = %s "
                       "    OR flow_point_id = %s "
                       "    OR result_point_id = %s "
                       " LIMIT 1",
                       (id_, id_, id_, id_))
        row_integrator = cursor.fetchone()
        if row_integrator is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_INTEGRATORS')

        # check if this point is being used by microgrid battery
        cursor.execute(" SELECT microgrid_id "
                       " FROM tbl_microgrids_batteries "
                       " WHERE battery_state_point_id = %s "
                       "    OR soc_point_id = %s "
                       "    OR power_point_id = %s "
                       " LIMIT 1",
                       (id_, id_, id_))
        row_microgrid_battery = cursor.fetchone()
        if row_microgrid_battery is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_MICROGRIDS_BATTERIES')

        # check if this point is being used by microgrid power conversion system
        cursor.execute("SELECT microgrid_id "
                       "FROM tbl_microgrids_power_conversion_systems "
                       "WHERE run_state_point_id = %s "
                       "   OR today_charge_energy_point_id = %s "
                       "   OR today_discharge_energy_point_id = %s "
                       "   OR total_charge_energy_point_id = %s "
                       "   OR total_discharge_energy_point_id = %s "
                       "LIMIT 1",
                       (id_, id_, id_, id_, id_))
        row_microgrid_power_conversion_system = cursor.fetchone()
        if row_microgrid_power_conversion_system is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_MICROGRIDS_POWER_CONVERSION_SYSTEMS')

        # check if this point is being used by microgrid evcharger
        cursor.execute(" SELECT microgrid_id "
                       " FROM tbl_microgrids_evchargers "
                       " WHERE power_point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_microgrid_evcharger = cursor.fetchone()
        if row_microgrid_evcharger is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_MICROGRIDS_EVCHARGERS')

        # check if this point is being used by microgrid generator
        cursor.execute(" SELECT microgrid_id "
                       " FROM tbl_microgrids_generators "
                       " WHERE power_point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_microgrid_generator = cursor.fetchone()
        if row_microgrid_generator is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_MICROGRIDS_GENERATORS')

        # check if this point is being used by microgrid grid
        cursor.execute(" SELECT microgrid_id "
                       " FROM tbl_microgrids_grids "
                       " WHERE power_point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_microgrid_grid = cursor.fetchone()
        if row_microgrid_grid is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_MICROGRIDS_GRIDS')

        # check if this point is being used by microgrid heatpump
        cursor.execute(" SELECT microgrid_id "
                       " FROM tbl_microgrids_heatpumps "
                       " WHERE power_point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_microgrid_heatpump = cursor.fetchone()
        if row_microgrid_heatpump is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_MICROGRIDS_HEATPUMPS')

        # check if this point is being used by microgrid load
        cursor.execute(" SELECT microgrid_id "
                       " FROM tbl_microgrids_loads "
                       " WHERE power_point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_microgrid_load = cursor.fetchone()
        if row_microgrid_load is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_MICROGRIDS_LOADS')

        # check if this point is being used by microgrid photovoltaic
        cursor.execute(" SELECT microgrid_id "
                       " FROM tbl_microgrids_photovoltaics "
                       " WHERE power_point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_microgrid_photovoltaic = cursor.fetchone()
        if row_microgrid_photovoltaic is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_MICROGRIDS_PHOTOVOLTAICS')

        # check if this point is being used by virtual power plant
        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_power_plants "
                       " WHERE balancing_price_point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_virtual_power_plant = cursor.fetchone()
        if row_virtual_power_plant is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_VIRTUAL_POWER_PLANTS')

        # check if this point is being used by energy storage container battery
        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_batteries "
                       " WHERE battery_state_point_id = %s "
                       "   OR soc_point_id = %s "
                       "   OR power_point_id = %s "
                       " LIMIT 1 ", (id_, id_, id_,))
        row_energy_storage_container_battery = cursor.fetchone()
        if row_energy_storage_container_battery is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_BATTERIES')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_bmses_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ", (id_, ))
        row_energy_storage_container_battery = cursor.fetchone()
        if row_energy_storage_container_battery is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_BATTERIES')
        # check if this point is being used by energy storage container dcdc
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_dcdcs_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ", (id_, ))
        row_energy_storage_container_dcdc = cursor.fetchone()
        if row_energy_storage_container_dcdc is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_DCDCS')
        # check if this point is being used by energy storage container firecontrol
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_firecontrols_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ", (id_,))
        row_energy_storage_container_dcdc = cursor.fetchone()
        if row_energy_storage_container_dcdc is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_FIRECONTROLS')

        # check if this point is being used by energy storage container grid
        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_grids "
                       " WHERE power_point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_energy_storage_container_grid = cursor.fetchone()
        if row_energy_storage_container_grid is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_GRIDS')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_grids_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_energy_storage_container_grid = cursor.fetchone()
        if row_energy_storage_container_grid is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_GRIDS')

        # check if this point is being used by energy storage container hvac
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_hvacs_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_energy_storage_container_hvac = cursor.fetchone()
        if row_energy_storage_container_hvac is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_HVACS')

        # check if this point is being used by energy storage container load
        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_loads "
                       " WHERE power_point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_energy_storage_container_load = cursor.fetchone()
        if row_energy_storage_container_load is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_LOADS')
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_loads_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_energy_storage_container_load = cursor.fetchone()
        if row_energy_storage_container_load is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_LOADS')

        # check if this point is being used by energy storage container power conversion system
        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE run_state_point_id = %s "
                       " LIMIT 1 ",
                       (id_, ))
        row_energy_storage_container_power_conversion_system = cursor.fetchone()
        if row_energy_storage_container_power_conversion_system is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description=
                                   'API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_POWER_CONVERSION_SYSTEMS')
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_pcses_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_energy_storage_container_power_conversion_system = cursor.fetchone()
        if row_energy_storage_container_power_conversion_system is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description=
                                   'API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_POWER_CONVERSION_SYSTEMS')

        # check if this point is being used by energy storage container stses
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_stses_points "
                       " WHERE point_id = %s "
                       " LIMIT 1 ",
                       (id_,))
        row_energy_storage_container_sts = cursor.fetchone()
        if row_energy_storage_container_sts is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description=
                                   'API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_CONTAINERS_STSES')

        # check if this point is being used by energy storage power stations
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE latitude_point_id = %s "
                       "OR longitude_point_id=%s"
                       " LIMIT 1 ",
                       (id_,))
        row_energy_storage_power_stations = cursor.fetchone()
        if row_energy_storage_power_stations is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description=
                                   'API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_POWER_STATIONS')

            # check if this point is being used by equipments parameters
            cursor.execute(" SELECT id "
                           " FROM tbl_equipments_parameters "
                           " WHERE point_id = %s "
                           " LIMIT 1 ",
                           (id_,))
            row_equipments_parameters = cursor.fetchone()
            if row_equipments_parameters is not None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description=
                                       'API.THERE_IS_RELATION_WITH_EQUIPMENTS_PARAMETERS')

                # check if this point is being used by fuel integrators
                cursor.execute(" SELECT id "
                               " FROM tbl_fuel_integrators "
                               " WHERE power_point_id = %s "
                               "OR result_point_id=%s"
                               " LIMIT 1 ",
                               (id_,))
                row_fuel_integrators = cursor.fetchone()
                if row_fuel_integrators is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400,
                                           title='API.BAD_REQUEST',
                                           description=
                                           'API.THERE_IS_RELATION_WITH_FUEL_INTEGRATORS')

                    # check if this point is being used by heat integrators
                    cursor.execute(" SELECT id "
                                   " FROM tbl_heat_integrators "
                                   " WHERE high_temperature_point_id = %s "
                                   "OR low_temperature_point_id=%s"
                                   "OR flow_point_id=%s"
                                   "OR result_point_id=%s"
                                   " LIMIT 1 ",
                                   (id_,))
                    row_heat_integrators = cursor.fetchone()
                    if row_heat_integrators is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400,
                                               title='API.BAD_REQUEST',
                                               description=
                                               'API.THERE_IS_RELATION_WITH_HEAT_INTEGRATORS')

                    # check if this point is being used by meters points
                    cursor.execute(" SELECT id "
                                   " FROM tbl_meters_points "
                                   " WHERE point_id = %s "
                                   " LIMIT 1 ",
                                   (id_,))
                    row_meters_points = cursor.fetchone()
                    if row_meters_points is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400,
                                               title='API.BAD_REQUEST',
                                               description=
                                               'API.THERE_IS_RELATION_WITH_METERS_POINTS')

                        # check if this point is being used by microgrids
                        cursor.execute(" SELECT id "
                                       " FROM tbl_microgrids "
                                       " WHERE latitude_point_id = %s "
                                       "OR longitude_point_id=%s"
                                       " LIMIT 1 ",
                                       (id_,))
                        row_microgrids = cursor.fetchone()
                        if row_microgrids is not None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400,
                                                   title='API.BAD_REQUEST',
                                                   description=
                                                   'API.THERE_IS_RELATION_WITH_MICROGRIDS')

                        # check if this point is being used by microgrids batteries
                        cursor.execute(" SELECT id "
                                       " FROM tbl_microgrids_batteries "
                                       " WHERE battery_state_point_id = %s "
                                       "OR soc_point_id=%s"
                                       "OR power_point_id=%s"
                                       " LIMIT 1 ",
                                       (id_,))
                        row_microgrids_batteries = cursor.fetchone()
                        if row_microgrids_batteries is not None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400,
                                                   title='API.BAD_REQUEST',
                                                   description=
                                                   'API.THERE_IS_RELATION_WITH_MICROGRIDS_BATTERIES')

                        # check if this point is being used by microgrids bmses points
                        cursor.execute(" SELECT id "
                                       " FROM tbl_microgrids_bmses_points "
                                       " WHERE point_id = %s "
                                       " LIMIT 1 ",
                                       (id_,))
                        row_microgrids_bmses_points = cursor.fetchone()
                        if row_microgrids_bmses_points is not None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400,
                                                   title='API.BAD_REQUEST',
                                                   description=
                                                   'API.THERE_IS_RELATION_WITH_MICROGRIDS_BMSES_POINTS')

                        # check if this point is being used by microgrids power conversion systems
                        cursor.execute(" SELECT id "
                                       " FROM tbl_microgrids_power_conversion_systems "
                                       " WHERE run_state_point_id = %s "
                                       "OR today_charge_energy_point_id=%s"
                                       "OR today_discharge_energy_point_id=%s"
                                       "OR total_charge_energy_point_id=%s"
                                       "OR total_discharge_energy_point_id=%s"
                                       " LIMIT 1 ",
                                       (id_,))
                        row_microgrids_power_conversion_systems = cursor.fetchone()
                        if row_microgrids_power_conversion_systems is not None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400,
                                                   title='API.BAD_REQUEST',
                                                   description=
                                                   'API.THERE_IS_RELATION_WITH_MICROGRIDS_POWER_CONVERSION_SYSTEMS')

                        # check if this point is being used by microgrids pcses points
                        cursor.execute(" SELECT id "
                                       " FROM tbl_microgrids_pcses_points "
                                       " WHERE point_id = %s "
                                       " LIMIT 1 ",
                                       (id_,))
                        row_microgrids_pcses_points = cursor.fetchone()
                        if row_microgrids_pcses_points is not None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400,
                                                   title='API.BAD_REQUEST',
                                                   description=
                                                   'API.THERE_IS_RELATION_WITH_MICROGRIDS_PCSES_POINTS')

                        # check if this point is being used by microgrids evchargers
                        cursor.execute(" SELECT id "
                                       " FROM tbl_microgrids_evchargers "
                                       " WHERE power_point_id = %s "
                                       " LIMIT 1 ",
                                       (id_,))
                        row_microgrids_evchargers = cursor.fetchone()
                        if row_microgrids_evchargers is not None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400,
                                                   title='API.BAD_REQUEST',
                                                   description=
                                                   'API.THERE_IS_RELATION_WITH_MICROGRIDS_EVCHARGERS')

                        # check if this point is being used by microgrids evchargers points
                        cursor.execute(" SELECT id "
                                       " FROM tbl_microgrids_evchargers_points "
                                       " WHERE point_id = %s "
                                       " LIMIT 1 ",
                                       (id_,))
                        row_microgrids_evchargers_points = cursor.fetchone()
                        if row_microgrids_evchargers_points is not None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400,
                                                   title='API.BAD_REQUEST',
                                                   description=
                                                   'API.THERE_IS_RELATION_WITH_MICROGRIDS_EVCHARGERS_POINTS')

                        # check if this point is being used by microgrids generators
                        cursor.execute(" SELECT id "
                                       " FROM tbl_microgrids_generators "
                                       " WHERE power_point_id = %s "
                                       " LIMIT 1 ",
                                       (id_,))
                        row_microgrids_generators = cursor.fetchone()
                        if row_microgrids_generators is not None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400,
                                                   title='API.BAD_REQUEST',
                                                   description=
                                                   'API.THERE_IS_RELATION_WITH_MICROGRIDS_GENERATORS')

                        # check if this point is being used by microgrids generators points
                        cursor.execute(" SELECT id "
                                       " FROM tbl_microgrids_generators_points "
                                       " WHERE point_id = %s "
                                       " LIMIT 1 ",
                                       (id_,))
                        row_microgrids_generators_points = cursor.fetchone()
                        if row_microgrids_generators_points is not None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400,
                                                   title='API.BAD_REQUEST',
                                                   description=
                                                   'API.THERE_IS_RELATION_WITH_MICROGRIDS_GENERATORS_POINTS')

                        # check if this point is being used by microgrids grids
                        cursor.execute(" SELECT id "
                                       " FROM tbl_microgrids_grids "
                                       " WHERE point_id = %s "
                                       " LIMIT 1 ",
                                       (id_,))
                        row_microgrids_generators_points = cursor.fetchone()
                        if row_microgrids_generators_points is not None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400,
                                                   title='API.BAD_REQUEST',
                                                   description=
                                                   'API.THERE_IS_RELATION_WITH_MICROGRIDS_GRIDS')

                            # check if this point is being used by microgrids grids points
                            cursor.execute(" SELECT id "
                                           " FROM tbl_microgrids_grids_points "
                                           " WHERE point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_microgrids_grids_points = cursor.fetchone()
                            if row_microgrids_grids_points is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_MICROGRIDS_GRIDS_POINTS')

                            # check if this point is being used by microgrids heatpumps
                            cursor.execute(" SELECT id "
                                           " FROM tbl_microgrids_heatpumps "
                                           " WHERE power_point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_microgrids_heatpumps = cursor.fetchone()
                            if row_microgrids_heatpumps is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_MICROGRIDS_HEATPUMPS')

                            # check if this point is being used by microgrids heatpumps points
                            cursor.execute(" SELECT id "
                                           " FROM tbl_microgrids_heatpumps_points "
                                           " WHERE point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_microgrids_heatpumps_points = cursor.fetchone()
                            if row_microgrids_heatpumps_points is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_MICROGRIDS_HEATPUMPS_POINTS')

                            # check if this point is being used by microgrids loads
                            cursor.execute(" SELECT id "
                                           " FROM tbl_microgrids_loads "
                                           " WHERE power_point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_microgrids_loads = cursor.fetchone()
                            if row_microgrids_loads is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_MICROGRIDS_LOADS')

                            # check if this point is being used by microgrids loads points
                            cursor.execute(" SELECT id "
                                           " FROM tbl_microgrids_loads_points "
                                           " WHERE point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_microgrids_loads_points = cursor.fetchone()
                            if row_microgrids_loads_points is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_MICROGRIDS_LOADS_POINTS')

                            # check if this point is being used by microgrids photovoltaics
                            cursor.execute(" SELECT id "
                                           " FROM tbl_microgrids_photovoltaics "
                                           " WHERE power_point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_microgrids_photovoltaics = cursor.fetchone()
                            if row_microgrids_photovoltaics is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_MICROGRIDS_PHOTOVOLTAICS')

                            # check if this point is being used by microgrids pvs points
                            cursor.execute(" SELECT id "
                                           " FROM tbl_microgrids_pvs_points "
                                           " WHERE point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_microgrids_pvs_points = cursor.fetchone()
                            if row_microgrids_pvs_points is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_MICROGRIDS_PVS_POINTS')

                            # check if this point is being used by photovoltaic power stations
                            cursor.execute(" SELECT id "
                                           " FROM tbl_photovoltaic_power_stations "
                                           " WHERE latitude_point_id = %s "
                                           "OR longitude_point_id=%s"
                                           " LIMIT 1 ",
                                           (id_,))
                            row_photovoltaic_power_stations = cursor.fetchone()
                            if row_photovoltaic_power_stations is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS')

                            # check if this point is being used by photovoltaic power stations grids
                            cursor.execute(" SELECT id "
                                           " FROM tbl_photovoltaic_power_stations_grids "
                                           " WHERE power_point_id = %s "
                                           "OR active_power_a_point_id=%s"
                                           "OR active_power_b_point_id=%s"
                                           "OR active_power_c_point_id=%s"
                                           "OR total_reactive_power_point_id=%s"
                                           "OR reactive_power_a_point_id=%s"
                                           "OR reactive_power_b_point_id=%s"
                                           "OR reactive_power_c_point_id=%s"
                                           "OR total_apparent_power_point_id=%s"
                                           "OR apparent_power_a_point_id=%s"
                                           "OR apparent_power_b_point_id=%s"
                                           "OR apparent_power_c_point_id=%s"
                                           "OR total_power_factor_point_id=%s"
                                           "OR active_energy_import_point_id=%s"
                                           "OR active_energy_export_point_id=%s"
                                           "OR active_energy_net_point_id=%s"
                                           " LIMIT 1 ",
                                           (id_,))
                            row_photovoltaic_power_stations_grids = cursor.fetchone()
                            if row_photovoltaic_power_stations_grids is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS_GRIDS')

                            # check if this point is being used by photovoltaic power stations invertors
                            cursor.execute(" SELECT id "
                                           " FROM tbl_photovoltaic_power_stations_invertors "
                                           " WHERE invertor_state_point_id = %s "
                                           "OR communication_state_point_id=%s"
                                           "OR total_energy_point_id=%s"
                                           "OR today_energy_point_id=%s"
                                           "OR efficiency_point_id=%s"
                                           "OR temperature_point_id=%s"
                                           "OR power_factor_point_id=%s"
                                           "OR active_power_point_id=%s"
                                           "OR reactive_power_point_id=%s"
                                           "OR frequency_point_id=%s"
                                           "OR uab_point_id=%s"
                                           "OR ubc_point_id=%s"
                                           "OR uca_point_id=%s"
                                           "OR ua_point_id=%s"
                                           "OR ub_point_id=%s"
                                           "OR uc_point_id=%s"
                                           "OR ia_point_id=%s"
                                           "OR ib_point_id=%s"
                                           "OR ic_point_id=%s"
                                           "OR pv1_u_point_id=%s"
                                           "OR pv1_i_point_id=%s"
                                           "OR pv2_u_point_id=%s"
                                           "OR pv2_i_point_id=%s"
                                           "OR pv3_u_point_id=%s"
                                           "OR pv3_i_point_id=%s"
                                           "OR pv4_u_point_id=%s"
                                           "OR pv4_i_point_id=%s"
                                           "OR pv5_u_point_id=%s"
                                           "OR pv5_i_point_id=%s"
                                           "OR pv6_u_point_id=%s"
                                           "OR pv6_i_point_id=%s"
                                           "OR pv7_u_point_id=%s"
                                           "OR pv7_i_point_id=%s"
                                           "OR pv8_u_point_id=%s"
                                           "OR pv8_i_point_id=%s"
                                           "OR pv9_u_point_id=%s"
                                           "OR pv9_i_point_id=%s"
                                           "OR pv10_u_point_id=%s"
                                           "OR pv10_i_point_id=%s"
                                           "OR pv11_u_point_id=%s"
                                           "OR pv11_i_point_id=%s"
                                           "OR pv12_u_point_id=%s"
                                           "OR pv12_i_point_id=%s"
                                           "OR pv13_u_point_id=%s"
                                           "OR pv13_i_point_id=%s"
                                           "OR pv14_u_point_id=%s"
                                           "OR pv14_i_point_id=%s"
                                           "OR pv15_u_point_id=%s"
                                           "OR pv15_i_point_id=%s"
                                           "OR pv16_u_point_id=%s"
                                           "OR pv16_i_point_id=%s"
                                           "OR pv17_u_point_id=%s"
                                           "OR pv17_i_point_id=%s"
                                           "OR pv18_u_point_id=%s"
                                           "OR pv18_i_point_id=%s"
                                           "OR pv19_u_point_id=%s"
                                           "OR pv19_i_point_id=%s"
                                           "OR pv20_u_point_id=%s"
                                           "OR pv20_i_point_id=%s"
                                           "OR pv21_u_point_id=%s"
                                           "OR pv21_i_point_id=%s"
                                           "OR pv22_u_point_id=%s"
                                           "OR pv22_i_point_id=%s"
                                           "OR pv23_u_point_id=%s"
                                           "OR pv23_i_point_id=%s"
                                           "OR pv24_u_point_id=%s"
                                           "OR pv24_i_point_id=%s"
                                           "OR pv25_u_point_id=%s"
                                           "OR pv25_i_point_id=%s"
                                           "OR pv26_u_point_id=%s"
                                           "OR pv26_i_point_id=%s"
                                           "OR pv27_u_point_id=%s"
                                           "OR pv27_i_point_id=%s"
                                           "OR pv28_u_point_id=%s"
                                           "OR pv28_i_point_id=%s"
                                           "OR mppt_total_energy_point_id=%s"
                                           "OR mppt_power_point_id=%s"
                                           "OR mppt_1_energy_point_id=%s"
                                           "OR mppt_2_energy_point_id=%s"
                                           "OR mppt_3_energy_point_id=%s"
                                           "OR mppt_4_energy_point_id=%s"
                                           "OR mppt_5_energy_point_id=%s"
                                           "OR mppt_6_energy_point_id=%s"
                                           "OR mppt_7_energy_point_id=%s"
                                           "OR mppt_8_energy_point_id=%s"
                                           "OR mppt_9_energy_point_id=%s"
                                           "OR mppt_10_energy_point_id=%s"
                                           "OR startup_time_point_id=%s"
                                           "OR shutdown_time_point_id=%s"
                                           " LIMIT 1 ",
                                           (id_,))
                            row_photovoltaic_power_stations_invertors = cursor.fetchone()
                            if row_photovoltaic_power_stations_invertors is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS_INVERTORS')

                            # check if this point is being used by photovoltaic power stations loads
                            cursor.execute(" SELECT id "
                                           " FROM tbl_photovoltaic_power_stations_loads "
                                           " WHERE power_point_id = %s "
                                           "OR total_active_power_point_id=%s"
                                           "OR active_power_a_point_id=%s"
                                           "OR active_power_b_point_id=%s"
                                           "OR active_power_c_point_id=%s"
                                           "OR total_reactive_power_point_id=%s"
                                           "OR reactive_power_a_point_id=%s"
                                           "OR reactive_power_b_point_id=%s"
                                           "OR reactive_power_c_point_id=%s"
                                           "OR total_apparent_power_point_id=%s"
                                           "OR apparent_power_a_point_id=%s"
                                           "OR apparent_power_b_point_id=%s"
                                           "OR apparent_power_c_point_id=%s"
                                           "OR total_power_factor_point_id=%s"
                                           "OR active_energy_import_point_id=%s"
                                           "OR active_energy_export_point_id=%s"
                                           "OR active_energy_net_point_id=%s"
                                           " LIMIT 1 ",
                                           (id_,))
                            row_photovoltaic_power_stations_loads = cursor.fetchone()
                            if row_photovoltaic_power_stations_loads is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS_LOADS')

                            # check if this point is being used by power integrators
                            cursor.execute(" SELECT id "
                                           " FROM tbl_power_integrators "
                                           " WHERE power_point_id = %s "
                                           "OR result_point_id=%s"
                                           " LIMIT 1 ",
                                           (id_,))
                            row_power_integrators = cursor.fetchone()
                            if row_power_integrators is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_POWER_INTEGRATORS')

                            # check if this point is being used by sensors points
                            cursor.execute(" SELECT id "
                                           " FROM tbl_sensors_points "
                                           " WHERE point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_sensors_points = cursor.fetchone()
                            if row_sensors_points is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_SENSORS_POINTS')

                            # check if this point is being used by shopfloors points
                            cursor.execute(" SELECT id "
                                           " FROM tbl_shopfloors_points "
                                           " WHERE point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_shopfloors_points = cursor.fetchone()
                            if row_shopfloors_points is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_SHOPFLOORS_POINTS')

                            # check if this point is being used by spaces points
                            cursor.execute(" SELECT id "
                                           " FROM tbl_spaces_points "
                                           " WHERE point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_spaces_points = cursor.fetchone()
                            if row_spaces_points is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_SPACES_POINTS')

                            # check if this point is being used by stores points
                            cursor.execute(" SELECT id "
                                           " FROM tbl_stores_points "
                                           " WHERE point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_stores_points = cursor.fetchone()
                            if row_stores_points is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_STORES_POINTS')

                            # check if this point is being used by tenants points
                            cursor.execute(" SELECT id "
                                           " FROM tbl_tenants_points "
                                           " WHERE point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_tenants_points = cursor.fetchone()
                            if row_tenants_points is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_TENANTS_POINTS')

                            # check if this point is being used by virtual power plants
                            cursor.execute(" SELECT id "
                                           " FROM tbl_virtual_power_plants "
                                           " WHERE balancing_price_point_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_virtual_power_plants = cursor.fetchone()
                            if row_virtual_power_plants is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_VIRTUAL_POWER_PLANTS')

                            # check if this point is being used by virtual power plants microgrids
                            cursor.execute(" SELECT id "
                                           " FROM tbl_virtual_power_plants_microgrids "
                                           " WHERE virtual_power_plant_id = %s "
                                           " LIMIT 1 ",
                                           (id_,))
                            row_virtual_power_plants_microgrids = cursor.fetchone()
                            if row_virtual_power_plants_microgrids is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_VIRTUAL_POWER_PLANTS_MICROGRIDS')

                            # check if this point is being used by wind farms
                            cursor.execute(" SELECT id "
                                           " FROM tbl_wind_farms "
                                           " WHERE latitude_point_id = %s "
                                           "OR longitude_point_id=%s"
                                           " LIMIT 1 ",
                                           (id_,))
                            row_wind_farms = cursor.fetchone()
                            if row_wind_farms is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400,
                                                       title='API.BAD_REQUEST',
                                                       description=
                                                       'API.THERE_IS_RELATION_WITH_WIND_FARMS')
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

