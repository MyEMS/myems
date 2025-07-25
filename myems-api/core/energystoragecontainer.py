import uuid
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config
from datetime import datetime, timedelta
from decimal import Decimal


class EnergyStorageContainerCollection:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        access_control(req)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_contacts ")
        cursor.execute(query)
        rows_contacts = cursor.fetchall()

        contact_dict = dict()
        if rows_contacts is not None and len(rows_contacts) > 0:
            for row in rows_contacts:
                contact_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, description "
                 " FROM tbl_energy_storage_containers "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_spaces = cursor.fetchall()

        result = list()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "rated_capacity": row[3],
                               "rated_power": row[4],
                               "contact": contact_dict.get(row[5], None),
                               "cost_center": cost_center_dict.get(row[6], None),
                               "description": row[7],
                               "qrcode": 'energystoragecontainer:' + row[2]}
                result.append(meta_result)

        cursor.close()
        cnx.close()
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'rated_capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_capacity'], float) or
                     isinstance(new_values['data']['rated_capacity'], int)) or \
                new_values['data']['rated_capacity'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['data']['rated_capacity']

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)) or \
                new_values['data']['rated_power'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = new_values['data']['rated_power']

        if 'contact_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['contact_id'], int) or \
                new_values['data']['contact_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTACT_ID')
        contact_id = new_values['data']['contact_id']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')
        cost_center_id = new_values['data']['cost_center_id']

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_contacts "
                       " WHERE id = %s ",
                       (new_values['data']['contact_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTACT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['data']['cost_center_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_energy_storage_containers "
                      "    (name, uuid, rated_capacity, rated_power, contact_id, cost_center_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(new_id)


class EnergyStorageContainerItem:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_contacts ")
        cursor.execute(query)
        rows_contacts = cursor.fetchall()

        contact_dict = dict()
        if rows_contacts is not None and len(rows_contacts) > 0:
            for row in rows_contacts:
                contact_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, description "
                 " FROM tbl_energy_storage_containers "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "rated_capacity": row[3],
                           "rated_power": row[4],
                           "contact": contact_dict.get(row[5], None),
                           "cost_center": cost_center_dict.get(row[6], None),
                           "description": row[7],
                           "qrcode": 'energystoragecontainer:' + row[2]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(
            " SELECT id "
            " FROM tbl_energy_storage_power_stations_containers "
            " WHERE energy_storage_container_id = %s ",
            (id_,)
        )
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_POWER_STATIONS')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_bmses_points "
                       " WHERE bms_id IN "
                       "      (SELECT id FROM tbl_energy_storage_containers_batteries "
                       "       WHERE energy_storage_container_id = %s) ", (id_, ))
        cursor.execute(" DELETE FROM tbl_energy_storage_containers_batteries "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_commands "
                       " WHERE energy_storage_container_id = %s ", (id_,))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_dcdcs_points "
                       " WHERE dcdc_id IN "
                       "      (SELECT id FROM tbl_energy_storage_containers_dcdcs "
                       "       WHERE energy_storage_container_id = %s) ", (id_,))
        cursor.execute(" DELETE FROM tbl_energy_storage_containers_dcdcs "
                       " WHERE energy_storage_container_id = %s ", (id_,))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_firecontrols_points "
                       " WHERE firecontrol_id IN "
                       "      (SELECT id FROM tbl_energy_storage_containers_firecontrols "
                       "       WHERE energy_storage_container_id = %s) ", (id_,))
        cursor.execute(" DELETE FROM tbl_energy_storage_containers_firecontrols "
                       " WHERE energy_storage_container_id = %s ", (id_,))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_grids_points "
                       " WHERE grid_id IN "
                       "      (SELECT id FROM tbl_energy_storage_containers_grids "
                       "       WHERE energy_storage_container_id = %s) ", (id_,))
        cursor.execute(" DELETE FROM tbl_energy_storage_containers_grids "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_hvacs_points "
                       " WHERE hvac_id IN "
                       "      (SELECT id FROM tbl_energy_storage_containers_hvacs "
                       "       WHERE energy_storage_container_id = %s) ", (id_,))
        cursor.execute(" DELETE FROM tbl_energy_storage_containers_hvacs "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_loads_points "
                       " WHERE load_id IN "
                       "      (SELECT id FROM tbl_energy_storage_containers_loads "
                       "       WHERE energy_storage_container_id = %s) ", (id_,))
        cursor.execute(" DELETE FROM tbl_energy_storage_containers_loads "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_pcses_points "
                       " WHERE pcs_id IN "
                       "      (SELECT id FROM tbl_energy_storage_containers_power_conversion_systems "
                       "       WHERE energy_storage_container_id = %s) ", (id_,))
        cursor.execute(" DELETE FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_schedules "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_stses_points "
                       " WHERE sts_id IN "
                       "      (SELECT id FROM tbl_energy_storage_containers_stses "
                       "       WHERE energy_storage_container_id = %s) ", (id_,))
        cursor.execute(" DELETE FROM tbl_energy_storage_containers_stses "
                       " WHERE energy_storage_container_id = %s ", (id_,))

        cursor.execute(" DELETE FROM tbl_energy_storage_power_stations_containers "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'rated_capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_capacity'], float) or
                     isinstance(new_values['data']['rated_capacity'], int)) or \
                new_values['data']['rated_capacity'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['data']['rated_capacity']

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)) or \
                new_values['data']['rated_power'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = new_values['data']['rated_power']

        if 'contact_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['contact_id'], int) or \
                new_values['data']['contact_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTACT_ID')
        contact_id = new_values['data']['contact_id']

        if 'cost_center_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['cost_center_id'], int) or \
                new_values['data']['cost_center_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')
        cost_center_id = new_values['data']['cost_center_id']

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_contacts "
                       " WHERE id = %s ",
                       (new_values['data']['contact_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTACT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['data']['cost_center_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        update_row = (" UPDATE tbl_energy_storage_containers "
                      " SET name = %s, rated_capacity = %s, rated_power = %s, contact_id = %s, cost_center_id = %s, "
                      "     description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    description,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerBatteryCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        battery_state_point_id, soc_point_id, power_point_id, "
                 "        charge_meter_id, discharge_meter_id, rated_capacity, rated_power, nominal_voltage "
                 " FROM tbl_energy_storage_containers_batteries "
                 " WHERE energy_storage_container_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "battery_state_point": point_dict.get(row[3]),
                               "soc_point": point_dict.get(row[4]),
                               "power_point": point_dict.get(row[5]),
                               "charge_meter": meter_dict.get(row[6]),
                               "discharge_meter": meter_dict.get(row[7]),
                               "rated_capacity": row[8],
                               "rated_power": row[9],
                               "nominal_voltage": row[10]
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_BATTERY_NAME')
        name = str.strip(new_values['data']['name'])

        if 'battery_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['battery_state_point_id'], int) or \
                new_values['data']['battery_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BATTERY_STATE_POINT_ID')
        battery_state_point_id = new_values['data']['battery_state_point_id']

        if 'soc_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['soc_point_id'], int) or \
                new_values['data']['soc_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SOC_POINT_ID')
        soc_point_id = new_values['data']['soc_point_id']

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

        if 'charge_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_meter_id'], int) or \
                new_values['data']['charge_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_METER_ID')
        charge_meter_id = new_values['data']['charge_meter_id']

        if 'discharge_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_meter_id'], int) or \
                new_values['data']['discharge_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_METER_ID')
        discharge_meter_id = new_values['data']['discharge_meter_id']

        if 'rated_capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_capacity'], float) or
                     isinstance(new_values['data']['rated_capacity'], int)) or \
                new_values['data']['rated_capacity'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = Decimal(new_values['data']['rated_capacity'])

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)) or \
                new_values['data']['rated_power'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = Decimal(new_values['data']['rated_power'])

        if 'nominal_voltage' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['nominal_voltage'], float) or
                     isinstance(new_values['data']['nominal_voltage'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NOMINAL_VOLTAGE')
        nominal_voltage = Decimal(new_values['data']['nominal_voltage'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_batteries "
                       " WHERE energy_storage_container_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_BATTERY_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (battery_state_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.BATTERY_STATE_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (soc_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SOC_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (power_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POWER_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (charge_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CHARGE_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (discharge_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISCHARGE_METER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_energy_storage_containers_batteries "
                      "    (name, uuid, energy_storage_container_id, "
                      "     battery_state_point_id, soc_point_id, power_point_id, "
                      "     charge_meter_id, discharge_meter_id, rated_capacity, rated_power, nominal_voltage) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    battery_state_point_id,
                                    soc_point_id,
                                    power_point_id,
                                    charge_meter_id,
                                    discharge_meter_id,
                                    rated_capacity,
                                    rated_power,
                                    nominal_voltage
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/batteries/' + str(new_id)


class EnergyStorageContainerBatteryItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, bid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, bid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_BATTERY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        # query energy storage power station dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers ")
        cursor.execute(query)
        rows_energystoragecontainers = cursor.fetchall()

        energy_storage_container_dict = dict()
        if rows_energystoragecontainers is not None and len(rows_energystoragecontainers) > 0:
            for row in rows_energystoragecontainers:
                energy_storage_container_dict[row[0]] = {"id": row[0],
                                                         "name": row[1],
                                                         "uuid": row[2]}
        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, energy_storage_container_id, "
                 "       battery_state_point_id, soc_point_id, power_point_id, "
                 "       charge_meter_id, discharge_meter_id, rated_capacity, rated_power, nominal_voltage "
                 " FROM tbl_energy_storage_containers_batteries "
                 " WHERE id = %s ")
        cursor.execute(query, (bid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_BATTERY_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "energy_storage_container": energy_storage_container_dict.get(row[3]),
                           "battery_state_point": point_dict.get(row[4]),
                           "soc_point": point_dict.get(row[5]),
                           "power_point": point_dict.get(row[6]),
                           "charge_meter": meter_dict.get(row[7]),
                           "discharge_meter": meter_dict.get(row[8]),
                           "rated_capacity": row[9],
                           "rated_power": row[10],
                           "nominal_voltage": row[11]
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, bid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_BATTERY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_batteries "
                       " WHERE id = %s ", (bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_BATTERY_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_batteries "
                       " WHERE id = %s ", (bid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, bid):
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_BATTERY_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_BATTERY_NAME')
        name = str.strip(new_values['data']['name'])

        if 'battery_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['battery_state_point_id'], int) or \
                new_values['data']['battery_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BATTERY_STATE_POINT_ID')
        battery_state_point_id = new_values['data']['battery_state_point_id']

        if 'soc_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['soc_point_id'], int) or \
                new_values['data']['soc_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SOC_POINT_ID')
        soc_point_id = new_values['data']['soc_point_id']

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

        if 'charge_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_meter_id'], int) or \
                new_values['data']['charge_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_METER_ID')
        charge_meter_id = new_values['data']['charge_meter_id']

        if 'discharge_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_meter_id'], int) or \
                new_values['data']['discharge_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_METER_ID')
        discharge_meter_id = new_values['data']['discharge_meter_id']

        if 'rated_capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_capacity'], float) or
                     isinstance(new_values['data']['rated_capacity'], int)) or \
                new_values['data']['rated_capacity'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = Decimal(new_values['data']['rated_capacity'])

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)) or \
                new_values['data']['rated_power'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = Decimal(new_values['data']['rated_power'])

        if 'nominal_voltage' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['nominal_voltage'], float) or
                     isinstance(new_values['data']['nominal_voltage'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NOMINAL_VOLTAGE')
        nominal_voltage = Decimal(new_values['data']['nominal_voltage'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_batteries "
                       " WHERE id = %s ", (bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_BATTERY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_batteries "
                       " WHERE energy_storage_container_id = %s AND name = %s AND id != %s ",
                       (id_, name, bid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_BATTERY_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (battery_state_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.BATTERY_STATE_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (soc_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SOC_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (power_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POWER_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (charge_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CHARGE_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (discharge_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISCHARGE_METER_NOT_FOUND')

        update_row = (" UPDATE tbl_energy_storage_containers_batteries "
                      " SET name = %s, energy_storage_container_id = %s, "
                      "     battery_state_point_id = %s, soc_point_id = %s, power_point_id = %s, "
                      "     charge_meter_id = %s, discharge_meter_id = %s, "
                      "     rated_capacity = %s,  rated_power = %s, nominal_voltage = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    battery_state_point_id,
                                    soc_point_id,
                                    power_point_id,
                                    charge_meter_id,
                                    discharge_meter_id,
                                    rated_capacity,
                                    rated_power,
                                    nominal_voltage,
                                    bid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerBatteryPointCollection:
    def __init__(self):
        """Initializes EnergyStorageContainerBatteryPointCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_, bid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, bid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BMS_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_batteries "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, bid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_BMS_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_energy_storage_containers_bmses_points mp, tbl_data_sources ds "
                 " WHERE mp.bms_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (bid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, bid):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BMS_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_batteries "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_BMS_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_energy_storage_containers_bmses_points "
                 " WHERE bms_id = %s AND point_id = %s")
        cursor.execute(query, (bid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.BMS_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_energy_storage_containers_bmses_points (bms_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (bid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/batteries/' + str(bid) + '/points/' + \
                        str(new_values['data']['point_id'])


class EnergyStorageContainerBatteryPointItem:
    def __init__(self):
        """Initializes MeterPointItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_, bid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, bid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not bid.isdigit() or int(bid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BMS_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_batteries "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, bid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_BMS_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_bmses_points "
                       " WHERE bms_id = %s AND point_id = %s ", (bid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.BMS_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_bmses_points "
                       " WHERE bms_id = %s AND point_id = %s ", (bid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStorageContainerCommandCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT c.id, c.name, c.uuid "
                 " FROM tbl_energy_storage_containers ce, tbl_energy_storage_containers_commands cec, tbl_commands c "
                 " WHERE cec.energy_storage_container_id = ce.id AND c.id = cec.command_id AND ce.id = %s "
                 " ORDER BY c.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        new_values = json.loads(raw_json)

        if 'command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['command_id'], int) or \
                new_values['data']['command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')
        command_id = new_values['data']['command_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (command_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_energy_storage_containers_commands "
                 " WHERE energy_storage_container_id = %s AND command_id = %s")
        cursor.execute(query, (id_, command_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.ENERGY_STORAGE_CONTAINER_COMMAND_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_energy_storage_containers_commands (energy_storage_container_id, command_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, command_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/commands/' + str(command_id)


class EnergyStorageContainerCommandItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, cid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, cid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        if not cid.isdigit() or int(cid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (cid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_commands "
                       " WHERE energy_storage_container_id = %s AND command_id = %s ", (id_, cid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_COMMAND_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_commands "
                       " WHERE energy_storage_container_id = %s AND command_id = %s ", (id_, cid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStorageContainerDataSourceCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT ds.id, ds.name, ds.uuid "
                 " FROM tbl_energy_storage_containers ce, tbl_energy_storage_containers_data_sources ceds, "
                 "      tbl_data_sources ds "
                 " WHERE ceds.energy_storage_container_id = ce.id AND ds.id = ceds.data_source_id AND ce.id = %s "
                 " ORDER BY ds.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        new_values = json.loads(raw_json)

        if 'data_source_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['data_source_id'], int) or \
                new_values['data']['data_source_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')
        data_source_id = new_values['data']['data_source_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE id = %s ", (data_source_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_energy_storage_containers_data_sources "
                 " WHERE energy_storage_container_id = %s AND data_source_id = %s")
        cursor.execute(query, (id_, data_source_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.ENERGY_STORAGE_CONTAINER_DATA_SOURCE_RELATION_EXISTS')

        add_row = (" INSERT INTO "
                   "     tbl_energy_storage_containers_data_sources (energy_storage_container_id, data_source_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, data_source_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/datasources/' + str(data_source_id)


class EnergyStorageContainerDataSourceItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, cid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, dsid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        if not dsid.isdigit() or int(dsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_SOURCE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE id = %s ", (dsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_SOURCE_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_data_sources "
                       " WHERE energy_storage_container_id = %s AND data_source_id = %s ", (id_, dsid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_DATA_SOURCE_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_data_sources "
                       " WHERE energy_storage_container_id = %s AND command_id = %s ", (id_, dsid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStorageContainerDataSourcePointCollection:
    def __init__(self):
        """Initializes"""
        pass

    @staticmethod
    def on_options(req, resp, id_,):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_,):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT p.id, p.name "
                 " FROM tbl_points p, tbl_energy_storage_containers_data_sources ecds, tbl_data_sources ds "
                 " WHERE ecds.energy_storage_container_id = %s "
                 "       AND ecds.data_source_id = ds.id "
                 "       AND p.data_source_id = ds.id "
                 " ORDER BY p.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1]}
                result.append(meta_result)

        resp.text = json.dumps(result)


class EnergyStorageContainerDCDCCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers_dcdcs "
                 " WHERE energy_storage_container_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2]
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_DCDC_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_dcdcs "
                       " WHERE energy_storage_container_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_DCDC_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_energy_storage_containers_dcdcs "
                      "    (name, uuid, energy_storage_container_id) "
                      " VALUES (%s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/dcdcs/' + str(new_id)


class EnergyStorageContainerDCDCItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, did):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, did):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not did.isdigit() or int(did) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_DCDC_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers ")
        cursor.execute(query)
        rows_energystoragecontainers = cursor.fetchall()

        energy_storage_container_dict = dict()
        if rows_energystoragecontainers is not None and len(rows_energystoragecontainers) > 0:
            for row in rows_energystoragecontainers:
                energy_storage_container_dict[row[0]] = {"id": row[0],
                                                         "name": row[1],
                                                         "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers_dcdcs "
                 " WHERE id = %s ")
        cursor.execute(query, (did,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_DCDC_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2]
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, did):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not did.isdigit() or int(did) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_DCDC_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_dcdcs "
                       " WHERE id = %s ", (did,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_DCDC_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_dcdcs "
                       " WHERE id = %s ", (did,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, did):
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        if not did.isdigit() or int(did) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_DCDC_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_DCDC_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_dcdcs "
                       " WHERE id = %s ", (did,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_DCDC_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_dcdcs "
                       " WHERE energy_storage_container_id = %s AND name = %s AND id != %s ",
                       (id_, name, did))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_DCDC_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_energy_storage_containers_dcdcs "
                      " SET name = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    did))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerDCDCPointCollection:
    def __init__(self):
        """Initializes EnergyStorageContainerDCDCPointCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_, did):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, did):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not did.isdigit() or int(did) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DCDC_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_dcdcs "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, did, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_DCDC_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_energy_storage_containers_dcdcs_points mp, tbl_data_sources ds "
                 " WHERE mp.dcdc_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (did,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, did):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not did.isdigit() or int(did) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DCDC_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_dcdcs "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, did,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_DCDC_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_energy_storage_containers_dcdcs_points "
                 " WHERE dcdc_id = %s AND point_id = %s")
        cursor.execute(query, (did, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.DCDC_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_energy_storage_containers_dcdcs_points (dcdc_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (did, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/dcdcs/' + str(did) + '/points/' + \
                        str(new_values['data']['point_id'])


class EnergyStorageContainerDCDCPointItem:
    def __init__(self):
        """Initializes MeterPointItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_, did, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, did, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not did.isdigit() or int(did) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DCDC_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_dcdcs "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, did,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_DCDC_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_dcdcs_points "
                       " WHERE dcdc_id = %s AND point_id = %s ", (did, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DCDC_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_dcdcs_points "
                       " WHERE dcdc_id = %s AND point_id = %s ", (did, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStorageContainerFirecontrolCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers_firecontrols "
                 " WHERE energy_storage_container_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2]
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_FIRECONTROL_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_firecontrols "
                       " WHERE energy_storage_container_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_FIRECONTROL_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_energy_storage_containers_firecontrols "
                      "    (name, uuid, energy_storage_container_id) "
                      " VALUES (%s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/firecontrols/' + str(new_id)


class EnergyStorageContainerFirecontrolItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, fid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, fid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_FIRECONTROL_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers ")
        cursor.execute(query)
        rows_energystoragecontainers = cursor.fetchall()

        energy_storage_container_dict = dict()
        if rows_energystoragecontainers is not None and len(rows_energystoragecontainers) > 0:
            for row in rows_energystoragecontainers:
                energy_storage_container_dict[row[0]] = {"id": row[0],
                                                         "name": row[1],
                                                         "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers_firecontrols "
                 " WHERE id = %s ")
        cursor.execute(query, (fid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_FIRECONTROL_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2]
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, fid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_FIRECONTROL_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_firecontrols "
                       " WHERE id = %s ", (fid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_FIRECONTROL_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_firecontrols "
                       " WHERE id = %s ", (fid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, fid):
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_FIRECONTROL_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_FIRECONTROL_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_firecontrols "
                       " WHERE id = %s ", (fid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_FIRECONTROL_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_firecontrols "
                       " WHERE energy_storage_container_id = %s AND name = %s AND id != %s ",
                       (id_, name, fid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_FIRECONTROL_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_energy_storage_containers_firecontrols "
                      " SET name = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    fid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerFirecontrolPointCollection:
    def __init__(self):
        """Initializes EnergyStorageContainerFirecontrolPointCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_, fid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, fid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FIRECONTROL_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_firecontrols "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, fid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_FIRECONTROL_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_energy_storage_containers_firecontrols_points mp, tbl_data_sources ds "
                 " WHERE mp.firecontrol_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (fid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, fid):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FIRECONTROL_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_firecontrols "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, fid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_FIRECONTROL_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_energy_storage_containers_firecontrols_points "
                 " WHERE firecontrol_id = %s AND point_id = %s")
        cursor.execute(query, (fid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FIRECONTROL_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_energy_storage_containers_firecontrols_points (firecontrol_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (fid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/firecontrols/' + str(fid) + '/points/' + \
                        str(new_values['data']['point_id'])


class EnergyStorageContainerFirecontrolPointItem:
    def __init__(self):
        """Initializes EnergyStorageContainerFirecontrolPointItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_, fid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, fid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FIRECONTROL_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_firecontrols "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, fid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_FIRECONTROL_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_firecontrols_points "
                       " WHERE firecontrol_id = %s AND point_id = %s ", (fid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.FIRECONTROL_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_firecontrols_points "
                       " WHERE firecontrol_id = %s AND point_id = %s ", (fid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStorageContainerGridCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        power_point_id, buy_meter_id, sell_meter_id, capacity "
                 " FROM tbl_energy_storage_containers_grids "
                 " WHERE energy_storage_container_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "power_point": point_dict.get(row[3]),
                               "buy_meter": meter_dict.get(row[4]),
                               "sell_meter": meter_dict.get(row[5]),
                               "capacity": row[6]
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_GRID_NAME')
        name = str.strip(new_values['data']['name'])

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

        if 'buy_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['buy_meter_id'], int) or \
                new_values['data']['buy_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BUY_METER_ID')
        buy_meter_id = new_values['data']['buy_meter_id']

        if 'sell_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['sell_meter_id'], int) or \
                new_values['data']['sell_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SELL_METER_ID')
        sell_meter_id = new_values['data']['sell_meter_id']

        if 'capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['capacity'], float) or
                     isinstance(new_values['data']['capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CAPACITY')
        capacity = Decimal(new_values['data']['capacity'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_grids "
                       " WHERE energy_storage_container_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_GRID_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (power_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POWER_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (buy_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.BUY_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (sell_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SELL_METER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_energy_storage_containers_grids "
                      "    (name, uuid, energy_storage_container_id, power_point_id, "
                      "     buy_meter_id, sell_meter_id, capacity) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    power_point_id,
                                    buy_meter_id,
                                    sell_meter_id,
                                    capacity
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/grids/' + str(new_id)


class EnergyStorageContainerGridItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, gid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, gid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_GRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers ")
        cursor.execute(query)
        rows_energystoragecontainers = cursor.fetchall()

        energy_storage_container_dict = dict()
        if rows_energystoragecontainers is not None and len(rows_energystoragecontainers) > 0:
            for row in rows_energystoragecontainers:
                energy_storage_container_dict[row[0]] = {"id": row[0],
                                                         "name": row[1],
                                                         "uuid": row[2]}
        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, energy_storage_container_id, power_point_id, "
                 "        buy_meter_id, sell_meter_id, capacity "
                 " FROM tbl_energy_storage_containers_grids "
                 " WHERE id = %s ")
        cursor.execute(query, (gid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_GRID_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "energy_storage_container": energy_storage_container_dict.get(row[3]),
                           "power_point": point_dict.get(row[4]),
                           "buy_meter": meter_dict.get(row[5]),
                           "sell_meter": meter_dict.get(row[6]),
                           "capacity": row[7]
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, gid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_GRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_grids "
                       " WHERE id = %s ", (gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_GRID_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_grids "
                       " WHERE id = %s ", (gid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, gid):
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_GRID_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_GRID_NAME')
        name = str.strip(new_values['data']['name'])

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

        if 'buy_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['buy_meter_id'], int) or \
                new_values['data']['buy_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BUY_METER_ID')
        buy_meter_id = new_values['data']['buy_meter_id']

        if 'sell_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['sell_meter_id'], int) or \
                new_values['data']['sell_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        sell_meter_id = new_values['data']['sell_meter_id']

        if 'capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['capacity'], float) or
                     isinstance(new_values['data']['capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CAPACITY')
        capacity = Decimal(new_values['data']['capacity'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_grids "
                       " WHERE id = %s ", (gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_GRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_grids "
                       " WHERE energy_storage_container_id = %s AND name = %s AND id != %s ",
                       (id_, name, gid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_GRID_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (power_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POWER_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (buy_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.BUY_METER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (sell_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SELL_METER_NOT_FOUND')

        update_row = (" UPDATE tbl_energy_storage_containers_grids "
                      " SET name = %s, energy_storage_container_id = %s, "
                      "     power_point_id = %s, buy_meter_id = %s, sell_meter_id = %s, capacity = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    power_point_id,
                                    buy_meter_id,
                                    sell_meter_id,
                                    capacity,
                                    gid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerGridPointCollection:
    def __init__(self):
        """Initializes EnergyStorageContainerGridPointCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_, gid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, gid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_grids "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, gid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_GRID_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_energy_storage_containers_grids_points mp, tbl_data_sources ds "
                 " WHERE mp.grid_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (gid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, gid):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GRID_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_grids "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_GRID_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_energy_storage_containers_grids_points "
                 " WHERE grid_id = %s AND point_id = %s")
        cursor.execute(query, (gid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.GRID_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_energy_storage_containers_grids_points (grid_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (gid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/grids/' + str(gid) + '/points/' + \
                        str(new_values['data']['point_id'])


class EnergyStorageContainerGridPointItem:
    def __init__(self):
        """Initializes EnergyStorageContainerGridPointItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_, gid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, gid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not gid.isdigit() or int(gid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GRID_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_grids "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, gid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_GRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_grids_points "
                       " WHERE grid_id = %s AND point_id = %s ", (gid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GRID_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_grids_points "
                       " WHERE grid_id = %s AND point_id = %s ", (gid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStorageContainerHVACCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers_hvacs "
                 " WHERE energy_storage_container_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2]
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_HVAC_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_hvacs "
                       " WHERE energy_storage_container_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_HVAC_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_energy_storage_containers_hvacs "
                      "    (name, uuid, energy_storage_container_id) "
                      " VALUES (%s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/hvacs/' + str(new_id)


class EnergyStorageContainerHVACItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, hid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, hid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_HVAC_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers ")
        cursor.execute(query)
        rows_energystoragecontainers = cursor.fetchall()

        energy_storage_container_dict = dict()
        if rows_energystoragecontainers is not None and len(rows_energystoragecontainers) > 0:
            for row in rows_energystoragecontainers:
                energy_storage_container_dict[row[0]] = {"id": row[0],
                                                         "name": row[1],
                                                         "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers_hvacs "
                 " WHERE id = %s ")
        cursor.execute(query, (hid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_HVAC_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2]
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, hid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_HVAC_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_hvacs "
                       " WHERE id = %s ", (hid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_HVAC_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_hvacs "
                       " WHERE id = %s ", (hid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, hid):
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_HVAC_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_HVAC_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_hvacs "
                       " WHERE id = %s ", (hid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_HVAC_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_hvacs "
                       " WHERE energy_storage_container_id = %s AND name = %s AND id != %s ",
                       (id_, name, hid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_HVAC_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_energy_storage_containers_hvacs "
                      " SET name = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    hid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerHVACPointCollection:
    def __init__(self):
        """Initializes EnergyStorageContainerHVACPointCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_, hid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, hid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HVAC_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_hvacs "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, hid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_HVAC_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_energy_storage_containers_hvacs_points mp, tbl_data_sources ds "
                 " WHERE mp.hvac_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (hid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, hid):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HVAC_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_hvacs "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, hid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_HVAC_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_energy_storage_containers_hvacs_points "
                 " WHERE hvac_id = %s AND point_id = %s")
        cursor.execute(query, (hid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.HVAC_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_energy_storage_containers_hvacs_points (hvac_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (hid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/hvacs/' + str(hid) + '/points/' + \
                        str(new_values['data']['point_id'])


class EnergyStorageContainerHVACPointItem:
    def __init__(self):
        """Initializes EnergyStorageContainerHVACPointItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_, hid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, hid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not hid.isdigit() or int(hid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HVAC_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_hvacs "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, hid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_HVAC_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_hvacs_points "
                       " WHERE hvac_id = %s AND point_id = %s ", (hid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HVAC_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_hvacs_points "
                       " WHERE hvac_id = %s AND point_id = %s ", (hid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStorageContainerLoadCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        power_point_id, meter_id, rated_input_power "
                 " FROM tbl_energy_storage_containers_loads "
                 " WHERE energy_storage_container_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "power_point": point_dict.get(row[3]),
                               "meter": meter_dict.get(row[4]),
                               "rated_input_power": row[5]
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_LOAD_NAME')
        name = str.strip(new_values['data']['name'])

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

        if 'meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['meter_id'], int) or \
                new_values['data']['meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        meter_id = new_values['data']['meter_id']

        if 'rated_input_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_input_power'], float) or
                     isinstance(new_values['data']['rated_input_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_INPUT_POWER')
        rated_input_power = Decimal(new_values['data']['rated_input_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_loads "
                       " WHERE energy_storage_container_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_LOAD_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (power_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POWER_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_energy_storage_containers_loads "
                      "    (name, uuid, energy_storage_container_id, power_point_id, meter_id, rated_input_power) "
                      " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_input_power
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/loads/' + str(new_id)


class EnergyStorageContainerLoadItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, lid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, lid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_LOAD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers ")
        cursor.execute(query)
        rows_energystoragecontainers = cursor.fetchall()

        energy_storage_container_dict = dict()
        if rows_energystoragecontainers is not None and len(rows_energystoragecontainers) > 0:
            for row in rows_energystoragecontainers:
                energy_storage_container_dict[row[0]] = {"id": row[0],
                                                         "name": row[1],
                                                         "uuid": row[2]}
        # query meter dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, name, uuid, "
                 "        energy_storage_container_id, power_point_id, meter_id, rated_input_power "
                 " FROM tbl_energy_storage_containers_loads "
                 " WHERE id = %s ")
        cursor.execute(query, (lid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_LOAD_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "energy_storage_container": energy_storage_container_dict.get(row[3]),
                           "power_point": point_dict.get(row[4]),
                           "meter": meter_dict.get(row[5]),
                           "rated_input_power": row[6]
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, lid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_LOAD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_loads "
                       " WHERE id = %s ", (lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_LOAD_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_loads "
                       " WHERE id = %s ", (lid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, lid):
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_LOAD_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_LOAD_NAME')
        name = str.strip(new_values['data']['name'])

        if 'power_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['power_point_id'], int) or \
                new_values['data']['power_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER_POINT_ID')
        power_point_id = new_values['data']['power_point_id']

        if 'meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['meter_id'], int) or \
                new_values['data']['meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        meter_id = new_values['data']['meter_id']

        if 'rated_input_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_input_power'], float) or
                     isinstance(new_values['data']['rated_input_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_INPUT_POWER')
        rated_input_power = Decimal(new_values['data']['rated_input_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_loads "
                       " WHERE id = %s ", (lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_LOAD_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_loads "
                       " WHERE energy_storage_container_id = %s AND name = %s AND id != %s ",
                       (id_, name, lid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_LOAD_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ",
                       (power_point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POWER_POINT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ",
                       (meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        update_row = (" UPDATE tbl_energy_storage_containers_loads "
                      " SET name = %s, energy_storage_container_id = %s, power_point_id = %s, "
                      "     meter_id = %s, rated_input_power = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    power_point_id,
                                    meter_id,
                                    rated_input_power,
                                    lid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerLoadPointCollection:
    def __init__(self):
        """Initializes EnergyStorageContainerLoadPointCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_, lid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, lid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOAD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_loads "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, lid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_LOAD_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_energy_storage_containers_loads_points mp, tbl_data_sources ds "
                 " WHERE mp.load_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (lid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, lid):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOAD_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_loads "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_LOAD_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_energy_storage_containers_loads_points "
                 " WHERE load_id = %s AND point_id = %s")
        cursor.execute(query, (lid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.LOAD_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_energy_storage_containers_loads_points (load_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (lid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/loads/' + str(lid) + '/points/' + \
                        str(new_values['data']['point_id'])


class EnergyStorageContainerLoadPointItem:
    def __init__(self):
        """Initializes EnergyStorageContainerLoadPointItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_, lid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, lid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LOAD_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_loads "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, lid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_LOAD_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_loads_points "
                       " WHERE load_id = %s AND point_id = %s ", (lid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.LOAD_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_loads_points "
                       " WHERE load_id = %s AND point_id = %s ", (lid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStorageContainerPCSCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}
        # query command dict
        query = (" SELECT id, name "
                 " FROM tbl_commands ")
        cursor.execute(query)
        rows_commands = cursor.fetchall()

        command_dict = dict()
        if rows_commands is not None and len(rows_commands) > 0:
            for row in rows_commands:
                command_dict[row[0]] = {"id": row[0],
                                        "name": row[1]}

        query = (" SELECT id, name, uuid, run_state_point_id, rated_output_power "
                 "        FROM tbl_energy_storage_containers_power_conversion_systems "
                 " WHERE energy_storage_container_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "run_state_point": point_dict.get(row[3]),
                               "rated_output_power": row[4]
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM_NAME')
        name = str.strip(new_values['data']['name'])

        if 'run_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['run_state_point_id'], int) or \
                new_values['data']['run_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RUN_STATE_POINT_ID')
        run_state_point_id = new_values['data']['run_state_point_id']

        if 'rated_output_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_output_power'], float) or
                     isinstance(new_values['data']['rated_output_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_OUTPUT_POWER')
        rated_output_power = Decimal(new_values['data']['rated_output_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE energy_storage_container_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_PCS_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_energy_storage_containers_power_conversion_systems "
                      "     (name, uuid, energy_storage_container_id, run_state_point_id, rated_output_power) "
                      " VALUES (%s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    run_state_point_id,
                                    rated_output_power
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainerpowerconversionsystems/' + str(new_id)


class EnergyStorageContainerPCSItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pcsid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, pcsid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers ")
        cursor.execute(query)
        rows_energystoragecontainers = cursor.fetchall()

        energy_storage_container_dict = dict()
        if rows_energystoragecontainers is not None and len(rows_energystoragecontainers) > 0:
            for row in rows_energystoragecontainers:
                energy_storage_container_dict[row[0]] = {"id": row[0],
                                                         "name": row[1],
                                                         "uuid": row[2]}
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query point dict
        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        # query command dict
        query = (" SELECT id, name "
                 " FROM tbl_commands ")
        cursor.execute(query)
        rows_commands = cursor.fetchall()

        command_dict = dict()
        if rows_commands is not None and len(rows_commands) > 0:
            for row in rows_commands:
                command_dict[row[0]] = {"id": row[0],
                                        "name": row[1]}

        query = (" SELECT id, name, uuid, energy_storage_container_id, run_state_point_id, rated_output_power "
                 " FROM tbl_energy_storage_containers_power_conversion_systems "
                 " WHERE id = %s ")
        cursor.execute(query, (pcsid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "energy_storage_container": energy_storage_container_dict.get(row[3]),
                           "run_state_point": point_dict.get(row[4]),
                           "rated_output_power": row[5]
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pcsid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE id = %s ", (pcsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE id = %s ", (pcsid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, pcsid):
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM_NAME')
        name = str.strip(new_values['data']['name'])

        if 'run_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['run_state_point_id'], int) or \
                new_values['data']['run_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RUN_STATE_POINT_ID')
        run_state_point_id = new_values['data']['run_state_point_id']

        if 'rated_output_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_output_power'], float) or
                     isinstance(new_values['data']['rated_output_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_OUTPUT_POWER')
        rated_output_power = Decimal(new_values['data']['rated_output_power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE id = %s ", (pcsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE energy_storage_container_id = %s AND name = %s AND id != %s ",
                       (id_, name, pcsid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_PCS_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_energy_storage_containers_power_conversion_systems "
                      " SET name = %s, energy_storage_container_id = %s, run_state_point_id = %s, "
                      "     rated_output_power = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    run_state_point_id,
                                    rated_output_power,
                                    pcsid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerPCSPointCollection:
    def __init__(self):
        """Initializes EnergyStorageContainerPCSPointCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pcsid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, pcsid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PCS_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, pcsid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_PCS_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_energy_storage_containers_pcses_points mp, tbl_data_sources ds "
                 " WHERE mp.pcs_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (pcsid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, pcsid):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PCS_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, pcsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_PCS_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_energy_storage_containers_pcses_points "
                 " WHERE pcs_id = %s AND point_id = %s")
        cursor.execute(query, (pcsid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.PCS_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_energy_storage_containers_pcses_points (pcs_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (pcsid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/pcses/' + str(pcsid) + '/points/' + \
                        str(new_values['data']['point_id'])


class EnergyStorageContainerPCSPointItem:
    def __init__(self):
        """Initializes EnergyStorageContainerPCSPointItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pcsid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pcsid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not pcsid.isdigit() or int(pcsid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PCS_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, pcsid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_PCS_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_pcses_points "
                       " WHERE pcs_id = %s AND point_id = %s ", (pcsid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PCS_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_pcses_points "
                       " WHERE pcs_id = %s AND point_id = %s ", (pcsid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStorageContainerScheduleCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, start_time_of_day, end_time_of_day, peak_type, power "
                 " FROM tbl_energy_storage_containers_schedules "
                 " WHERE energy_storage_container_id = %s "
                 " ORDER BY start_time_of_day ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "start_time_of_day": str(row[1]),
                               "end_time_of_day": str(row[2]),
                               "peak_type": row[3],
                               "power": row[4],
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        new_values = json.loads(raw_json)

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        add_schedule = (" INSERT INTO tbl_energy_storage_containers_schedules "
                        "     (energy_storage_container_id, start_time_of_day, end_time_of_day, peak_type, power) "
                        " VALUES (%s, %s, %s, %s, %s) ")
        cursor.execute(add_schedule, (id_,
                                      new_values['data']['start_time_of_day'],
                                      new_values['data']['end_time_of_day'],
                                      new_values['data']['peak_type'],
                                      new_values['data']['power']))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()
        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainerschedules/' + str(new_id)


class EnergyStorageContainerScheduleItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, sid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, sid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_SCHEDULE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers ")
        cursor.execute(query)
        rows_energystoragecontainers = cursor.fetchall()

        energy_storage_container_dict = dict()
        if rows_energystoragecontainers is not None and len(rows_energystoragecontainers) > 0:
            for row in rows_energystoragecontainers:
                energy_storage_container_dict[row[0]] = {"id": row[0],
                                                         "name": row[1],
                                                         "uuid": row[2]}

        query = (" SELECT id, start_time_of_day, end_time_of_day, peak_type, power "
                 " FROM tbl_energy_storage_containers_schedules "
                 " WHERE id = %s ")
        cursor.execute(query, (sid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_SCHEDULE_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "start_time_of_day": str(row[1]),
                           "end_time_of_day": str(row[2]),
                           "peak_type": row[3],
                           "power": row[4]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, sid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_SCHEDULE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_schedules "
                       " WHERE id = %s ", (sid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_SCHEDULE_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_schedules "
                       " WHERE id = %s ", (sid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, sid):
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_SCHEDULE_ID')

        new_values = json.loads(raw_json)

        if 'start_time_of_day' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['start_time_of_day'], str) or \
                len(str.strip(new_values['data']['start_time_of_day'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_START_TIME_OF_DAY')
        start_time_of_day = str.strip(new_values['data']['start_time_of_day'])

        if 'end_time_of_day' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['end_time_of_day'], str) or \
                len(str.strip(new_values['data']['end_time_of_day'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_END_TIME_OF_DAY')
        end_time_of_day = str.strip(new_values['data']['end_time_of_day'])

        if 'peak_type' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['peak_type'], str) or \
                len(str.strip(new_values['data']['peak_type'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PEAK_TYPE')
        peak_type = str.strip(new_values['data']['peak_type'])

        if 'power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['power'], float) or
                     isinstance(new_values['data']['power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POWER')
        power = Decimal(new_values['data']['power'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_schedules "
                       " WHERE id = %s ", (sid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_SCHEDULE_NOT_FOUND')

        update_row = (" UPDATE tbl_energy_storage_containers_schedules "
                      " SET start_time_of_day = %s, end_time_of_day = %s, peak_type = %s, power = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (start_time_of_day,
                                    end_time_of_day,
                                    peak_type,
                                    power,
                                    sid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerSTSCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers_stses "
                 " WHERE energy_storage_container_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2]
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_STS_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_stses "
                       " WHERE energy_storage_container_id = %s AND name = %s ",
                       (id_, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_STS_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_energy_storage_containers_stses "
                      "    (name, uuid, energy_storage_container_id) "
                      " VALUES (%s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/stses/' + str(new_id)


class EnergyStorageContainerSTSItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, fid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, fid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_STS_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers ")
        cursor.execute(query)
        rows_energystoragecontainers = cursor.fetchall()

        energy_storage_container_dict = dict()
        if rows_energystoragecontainers is not None and len(rows_energystoragecontainers) > 0:
            for row in rows_energystoragecontainers:
                energy_storage_container_dict[row[0]] = {"id": row[0],
                                                         "name": row[1],
                                                         "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_storage_containers_stses "
                 " WHERE id = %s ")
        cursor.execute(query, (fid,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_STS_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2]
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, fid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_STS_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_stses "
                       " WHERE id = %s ", (fid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_STS_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_stses "
                       " WHERE id = %s ", (fid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, fid):
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_STS_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_STS_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_stses "
                       " WHERE id = %s ", (fid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_STS_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_stses "
                       " WHERE energy_storage_container_id = %s AND name = %s AND id != %s ",
                       (id_, name, fid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_STS_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_energy_storage_containers_stses "
                      " SET name = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    fid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerSTSPointCollection:
    def __init__(self):
        """Initializes EnergyStorageContainerSTSPointCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_, fid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, fid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STS_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_stses "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, fid, ))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_STS_NOT_FOUND')

        query = (" SELECT p.id, p.name, "
                 "        ds.id, ds.name, ds.uuid, "
                 "        p.address "
                 " FROM tbl_points p, tbl_energy_storage_containers_stses_points mp, tbl_data_sources ds "
                 " WHERE mp.sts_id = %s AND p.id = mp.point_id AND p.data_source_id = ds.id "
                 " ORDER BY p.name ")
        cursor.execute(query, (fid,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1],
                               "data_source": {"id": row[2], "name": row[3], "uuid": row[4]},
                               "address": row[5]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_, fid):
        """Handles POST requests"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STS_ID')

        new_values = json.loads(raw_json)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_stses "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, fid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_STS_NOT_FOUND')

        cursor.execute(" SELECT name, object_type "
                       " FROM tbl_points "
                       " WHERE id = %s ", (new_values['data']['point_id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_energy_storage_containers_stses_points "
                 " WHERE sts_id = %s AND point_id = %s")
        cursor.execute(query, (fid, new_values['data']['point_id'],))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.STS_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_energy_storage_containers_stses_points (sts_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (fid, new_values['data']['point_id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/stses/' + str(fid) + '/points/' + \
                        str(new_values['data']['point_id'])


class EnergyStorageContainerSTSPointItem:
    def __init__(self):
        """Initializes EnergyStorageContainerSTSPointItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_, fid, pid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, fid, pid):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not fid.isdigit() or int(fid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STS_ID')
        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_stses "
                       " WHERE energy_storage_container_id = %s AND id = %s ", (id_, fid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_STS_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_stses_points "
                       " WHERE sts_id = %s AND point_id = %s ", (fid, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.STS_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_stses_points "
                       " WHERE sts_id = %s AND point_id = %s ", (fid, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStorageContainerClone:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, description "
                 " FROM tbl_energy_storage_containers "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "rated_capacity": row[3],
                           "rated_power": row[4],
                           "contact_id": row[5],
                           "cost_center_id": row[6],
                           "description": row[7]}
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = str.strip(meta_result['name']) + \
                (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds')
            add_values = (" INSERT INTO tbl_energy_storage_containers "
                          "    (name, uuid, rated_capacity, rated_power, contact_id, "
                          "     cost_center_id, description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['rated_capacity'],
                                        meta_result['rated_power'],
                                        meta_result['contact_id'],
                                        meta_result['cost_center_id'],
                                        meta_result['description']))
            new_id = cursor.lastrowid
            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/energystoragecontainers/' + str(new_id)


class EnergyStorageContainerExport:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_contacts ")
        cursor.execute(query)
        rows_contacts = cursor.fetchall()

        contact_dict = dict()
        if rows_contacts is not None and len(rows_contacts) > 0:
            for row in rows_contacts:
                contact_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor.execute(query)
        rows_cost_centers = cursor.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

        query = (" SELECT id, name, uuid, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, description "
                 " FROM tbl_energy_storage_containers "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "rated_capacity": row[3],
                           "rated_power": row[4],
                           "contact": contact_dict.get(row[5], None),
                           "cost_center": cost_center_dict.get(row[6], None),
                           "description": row[7]}

        resp.text = json.dumps(meta_result)


class EnergyStorageContainerImport:
    def __init__(self):
        """"Initializes Class"""
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
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_NAME')
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        name = str.strip(new_values['name']) + \
            (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds')

        if 'rated_capacity' not in new_values.keys() or \
                not (isinstance(new_values['rated_capacity'], float) or
                     isinstance(new_values['rated_capacity'], int)) or \
                new_values['rated_capacity'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['rated_capacity']

        if 'rated_power' not in new_values.keys() or \
                not (isinstance(new_values['rated_power'], float) or
                     isinstance(new_values['rated_power'], int)) or \
                new_values['rated_power'] < 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = new_values['rated_power']

        if 'contact' not in new_values.keys() or \
                'id' not in new_values['contact'].keys() or \
                not isinstance(new_values['contact']['id'], int) or \
                new_values['contact']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTACT_ID')
        contact_id = new_values['contact']['id']

        if 'cost_center' not in new_values.keys() or \
                'id' not in new_values['cost_center'].keys() or \
                not isinstance(new_values['cost_center']['id'], int) or \
                new_values['cost_center']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_CENTER_ID')
        cost_center_id = new_values['cost_center']['id']

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_contacts "
                       " WHERE id = %s ",
                       (new_values['contact']['id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTACT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_cost_centers "
                       " WHERE id = %s ",
                       (new_values['cost_center']['id'],))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COST_CENTER_NOT_FOUND')

        add_values = (" INSERT INTO tbl_energy_storage_containers "
                      "    (name, uuid, rated_capacity, rated_power, contact_id, cost_center_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(new_id)
