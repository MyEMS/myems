import uuid
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config
from datetime import datetime, timedelta


class EnergyStorageContainerCollection:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
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

        query = (" SELECT id, name, uuid "
                 " FROM tbl_svgs ")
        cursor.execute(query)
        rows_svgs = cursor.fetchall()

        svg_dict = dict()
        if rows_svgs is not None and len(rows_svgs) > 0:
            for row in rows_svgs:
                svg_dict[row[0]] = {"id": row[0],
                                    "name": row[1],
                                    "uuid": row[2]}

        query = (" SELECT id, name, uuid, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, svg_id, description "
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
                               "svg": svg_dict.get(row[7], None),
                               "description": row[8],
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
                new_values['data']['rated_capacity'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['data']['rated_capacity']

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)) or \
                new_values['data']['rated_power'] <= 0.0:
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

        if 'svg_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg_id'], int) and \
                new_values['data']['svg_id'] > 0:
            svg_id = new_values['data']['svg_id']
        else:
            svg_id = None

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

        if svg_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_svgs "
                           " WHERE id = %s ",
                           (svg_id,))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.SVG_NOT_FOUND')

        add_values = (" INSERT INTO tbl_energy_storage_containers "
                      "    (name, uuid, rated_capacity, rated_power, contact_id, cost_center_id, svg_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    svg_id,
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
        resp.status = falcon.HTTP_200

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

        svg_dict = dict()
        query = (" SELECT id, name, uuid "
                 " FROM tbl_svgs ")
        cursor.execute(query)
        rows_svgs = cursor.fetchall()
        if rows_svgs is not None and len(rows_svgs) > 0:
            for row in rows_svgs:
                svg_dict[row[0]] = {"id": row[0],
                                    "name": row[1],
                                    "uuid": row[2]}

        query = (" SELECT id, name, uuid, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, svg_id, description "
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
                           "svg": svg_dict.get(row[7], None),
                           "description": row[8],
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

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_sensors "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_batteries "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_grids "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_loads "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE energy_storage_container_id = %s ", (id_, ))

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_users "
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
                new_values['data']['rated_capacity'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['data']['rated_capacity']

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)) or \
                new_values['data']['rated_power'] <= 0.0:
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

        if 'svg_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['svg_id'], int) and \
                new_values['data']['svg_id'] > 0:
            svg_id = new_values['data']['svg_id']
        else:
            svg_id = None

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

        if svg_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_svgs "
                           " WHERE id = %s ",
                           (new_values['data']['svg_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.SVG_NOT_FOUND')

        update_row = (" UPDATE tbl_energy_storage_containers "
                      " SET name = %s, rated_capacity = %s, rated_power = %s, contact_id = %s, cost_center_id = %s, "
                      "     svg_id = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    svg_id,
                                    description,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerSensorCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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

        query = (" SELECT s.id, s.name, s.uuid "
                 " FROM tbl_energy_storage_containers e, "
                 "      tbl_energy_storage_containers_sensors es, tbl_sensors s "
                 " WHERE es.energy_storage_container_id = e.id AND s.id = es.sensor_id AND e.id = %s "
                 " ORDER BY s.id ")
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
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        new_values = json.loads(raw_json)

        if 'sensor_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['sensor_id'], int) or \
                new_values['data']['sensor_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SENSOR_ID')
        sensor_id = new_values['data']['sensor_id']

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
                       " FROM tbl_sensors "
                       " WHERE id = %s ", (sensor_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SENSOR_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_energy_storage_containers_sensors "
                 " WHERE energy_storage_container_id = %s AND sensor_id = %s")
        cursor.execute(query, (id_, sensor_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.ENERGY_STORAGE_CONTAINER_SENSOR_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_energy_storage_containers_sensors "
                   "        (energy_storage_container_id, sensor_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, sensor_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(id_) + '/sensors/' + str(sensor_id)


class EnergyStorageContainerSensorItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, sid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, sid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SENSOR_ID')

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
                       " FROM tbl_sensors "
                       " WHERE id = %s ", (sid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SENSOR_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_storage_containers_sensors "
                       " WHERE energy_storage_container_id = %s AND sensor_id = %s ", (id_, sid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_SENSOR_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_sensors "
                       " WHERE energy_storage_container_id = %s AND sensor_id = %s ", (id_, sid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class EnergyStorageContainerBatteryCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                               "nominal_voltage": row[10],
                               "communication_status_with_pcs_point": point_dict.get(row[11]),
                               "communication_status_with_ems_point": point_dict.get(row[12]),
                               "grid_status_point": point_dict.get(row[13]),
                               "total_voltage_point": point_dict.get(row[14]),
                               "total_current_point": point_dict.get(row[15]),
                               "soh_point": point_dict.get(row[16]),
                               "charging_power_limit_point": point_dict.get(row[17]),
                               "discharge_limit_power_point": point_dict.get(row[18]),
                               "rechargeable_capacity_point": point_dict.get(row[19]),
                               "dischargeable_capacity_point": point_dict.get(row[20]),
                               "average_temperature_point": point_dict.get(row[21]),
                               "average_voltage_point": point_dict.get(row[22]),
                               "insulation_value_point": point_dict.get(row[23]),
                               "positive_insulation_value_point": point_dict.get(row[24]),
                               "negative_insulation_value_point": point_dict.get(row[25]),
                               "maximum_temperature_point": point_dict.get(row[26]),
                               "maximum_temperature_battery_cell_point": point_dict.get(row[27]),
                               "minimum_temperature_point": point_dict.get(row[28]),
                               "minimum_temperature_battery_cell_point": point_dict.get(row[29]),
                               "maximum_voltage_point": point_dict.get(row[30]),
                               "maximum_voltage_battery_cell_point": point_dict.get(row[31]),
                               "minimum_voltage_point": point_dict.get(row[32]),
                               "minimum_voltage_battery_cell_point": point_dict.get(row[33])
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
                     isinstance(new_values['data']['rated_capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = float(new_values['data']['rated_capacity'])

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = float(new_values['data']['rated_power'])

        if 'nominal_voltage' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['nominal_voltage'], float) or
                     isinstance(new_values['data']['nominal_voltage'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NOMINAL_VOLTAGE')
        nominal_voltage = float(new_values['data']['nominal_voltage'])

        communication_status_with_pcs_point_id = None
        communication_status_with_ems_point_id = None
        grid_status_point_id = None
        total_voltage_point_id = None
        total_current_point_id = None
        soh_point_id = None
        charging_power_limit_point_id = None
        discharge_limit_power_point_id = None
        rechargeable_capacity_point_id = None
        dischargeable_capacity_point_id = None
        average_temperature_point_id = None
        average_voltage_point_id = None
        insulation_value_point_id = None
        positive_insulation_value_point_id = None
        negative_insulation_value_point_id = None
        maximum_temperature_point_id = None
        maximum_temperature_battery_cell_point_id = None
        minimum_temperature_point_id = None
        minimum_temperature_battery_cell_point_id = None
        maximum_voltage_point_id = None
        maximum_voltage_battery_cell_point_id = None
        minimum_voltage_point_id = None
        minimum_voltage_battery_cell_point_id = None
        if 'communication_status_with_pcs_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['communication_status_with_pcs_point_id'], int) and \
                new_values['data']['communication_status_with_pcs_point_id'] > 0:
            communication_status_with_pcs_point_id = new_values['data']['communication_status_with_pcs_point_id']

        if 'communication_status_with_ems_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['communication_status_with_ems_point_id'], int) and \
                new_values['data']['communication_status_with_ems_point_id'] > 0:
            communication_status_with_ems_point_id = new_values['data']['communication_status_with_ems_point_id']

        if 'grid_status_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['grid_status_point_id'], int) and \
                new_values['data']['grid_status_point_id'] > 0:
            grid_status_point_id = new_values['data']['grid_status_point_id']

        if 'total_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_voltage_point_id'], int) and \
                new_values['data']['total_voltage_point_id'] > 0:
            total_voltage_point_id = new_values['data']['total_voltage_point_id']

        if 'total_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_current_point_id'], int) and \
                new_values['data']['total_current_point_id'] > 0:
            total_current_point_id = new_values['data']['total_current_point_id']

        if 'soh_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['soh_point_id'], int) and \
                new_values['data']['soh_point_id'] > 0:
            soh_point_id = new_values['data']['soh_point_id']

        if 'charging_power_limit_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['charging_power_limit_point_id'], int) and \
                new_values['data']['charging_power_limit_point_id'] > 0:
            charging_power_limit_point_id = new_values['data']['charging_power_limit_point_id']

        if 'discharge_limit_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['discharge_limit_power_point_id'], int) and \
                new_values['data']['discharge_limit_power_point_id'] > 0:
            discharge_limit_power_point_id = new_values['data']['discharge_limit_power_point_id']

        if 'rechargeable_capacity_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['rechargeable_capacity_point_id'], int) and \
                new_values['data']['rechargeable_capacity_point_id'] > 0:
            rechargeable_capacity_point_id = new_values['data']['rechargeable_capacity_point_id']

        if 'dischargeable_capacity_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['dischargeable_capacity_point_id'], int) and \
                new_values['data']['dischargeable_capacity_point_id'] > 0:
            dischargeable_capacity_point_id = new_values['data']['dischargeable_capacity_point_id']

        if 'average_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['average_temperature_point_id'], int) and \
                new_values['data']['average_temperature_point_id'] > 0:
            average_temperature_point_id = new_values['data']['average_temperature_point_id']

        if 'average_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['average_voltage_point_id'], int) and \
                new_values['data']['average_voltage_point_id'] > 0:
            average_voltage_point_id = new_values['data']['average_voltage_point_id']

        if 'insulation_value_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['insulation_value_point_id'], int) and \
                new_values['data']['insulation_value_point_id'] > 0:
            insulation_value_point_id = new_values['data']['insulation_value_point_id']

        if 'positive_insulation_value_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['positive_insulation_value_point_id'], int) and \
                new_values['data']['positive_insulation_value_point_id'] > 0:
            positive_insulation_value_point_id = new_values['data']['positive_insulation_value_point_id']

        if 'negative_insulation_value_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['negative_insulation_value_point_id'], int) and \
                new_values['data']['negative_insulation_value_point_id'] > 0:
            negative_insulation_value_point_id = new_values['data']['negative_insulation_value_point_id']

        if 'maximum_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['maximum_temperature_point_id'], int) and \
                new_values['data']['maximum_temperature_point_id'] > 0:
            maximum_temperature_point_id = new_values['data']['maximum_temperature_point_id']

        if 'maximum_temperature_battery_cell_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['maximum_temperature_battery_cell_point_id'], int) and \
                new_values['data']['maximum_temperature_battery_cell_point_id'] > 0:
            maximum_temperature_battery_cell_point_id = new_values['data']['maximum_temperature_battery_cell_point_id']

        if 'minimum_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['minimum_temperature_point_id'], int) and \
                new_values['data']['minimum_temperature_point_id'] > 0:
            minimum_temperature_point_id = new_values['data']['minimum_temperature_point_id']

        if 'minimum_temperature_battery_cell_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['minimum_temperature_battery_cell_point_id'], int) and \
                new_values['data']['minimum_temperature_battery_cell_point_id'] > 0:
            minimum_temperature_battery_cell_point_id = new_values['data']['minimum_temperature_battery_cell_point_id']

        if 'maximum_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['maximum_voltage_point_id'], int) and \
                new_values['data']['maximum_voltage_point_id'] > 0:
            maximum_voltage_point_id = new_values['data']['maximum_voltage_point_id']

        if 'maximum_voltage_battery_cell_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['maximum_voltage_battery_cell_point_id'], int) and \
                new_values['data']['maximum_voltage_battery_cell_point_id'] > 0:
            maximum_voltage_battery_cell_point_id = new_values['data']['maximum_voltage_battery_cell_point_id']

        if 'minimum_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['minimum_voltage_point_id'], int) and \
                new_values['data']['minimum_voltage_point_id'] > 0:
            minimum_voltage_point_id = new_values['data']['minimum_voltage_point_id']

        if 'minimum_voltage_battery_cell_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['minimum_voltage_battery_cell_point_id'], int) and \
                new_values['data']['minimum_voltage_battery_cell_point_id'] > 0:
            minimum_voltage_battery_cell_point_id = new_values['data']['minimum_voltage_battery_cell_point_id']

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
                      "     charge_meter_id, discharge_meter_id, rated_capacity, rated_power, nominal_voltage, "
                      "     communication_status_with_pcs_point_id, "
                      "     communication_status_with_ems_point_id, "
                      "     grid_status_point_id, "
                      "     total_voltage_point_id, "
                      "     total_current_point_id, "
                      "     soh_point_id, "
                      "     charging_power_limit_point_id, "
                      "     discharge_limit_power_point_id, "
                      "     rechargeable_capacity_point_id, "
                      "     dischargeable_capacity_point_id, "
                      "     average_temperature_point_id, "
                      "     average_voltage_point_id, "
                      "     insulation_value_point_id, "
                      "     positive_insulation_value_point_id, "
                      "     negative_insulation_value_point_id, "
                      "     maximum_temperature_point_id, "
                      "     maximum_temperature_battery_cell_point_id, "
                      "     minimum_temperature_point_id, "
                      "     minimum_temperature_battery_cell_point_id, "
                      "     maximum_voltage_point_id, "
                      "     maximum_voltage_battery_cell_point_id, "
                      "     minimum_voltage_point_id, "
                      "     minimum_voltage_battery_cell_point_id) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,"
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,"
                      "         %s, %s, %s) ")
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
                                    nominal_voltage,
                                    communication_status_with_pcs_point_id,
                                    communication_status_with_ems_point_id,
                                    grid_status_point_id,
                                    total_voltage_point_id,
                                    total_current_point_id,
                                    soh_point_id,
                                    charging_power_limit_point_id,
                                    discharge_limit_power_point_id,
                                    rechargeable_capacity_point_id,
                                    dischargeable_capacity_point_id,
                                    average_temperature_point_id,
                                    average_voltage_point_id,
                                    insulation_value_point_id,
                                    positive_insulation_value_point_id,
                                    negative_insulation_value_point_id,
                                    maximum_temperature_point_id,
                                    maximum_temperature_battery_cell_point_id,
                                    minimum_temperature_point_id,
                                    minimum_temperature_battery_cell_point_id,
                                    maximum_voltage_point_id,
                                    maximum_voltage_battery_cell_point_id,
                                    minimum_voltage_point_id,
                                    minimum_voltage_battery_cell_point_id
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
        resp.status = falcon.HTTP_200

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
                 "       charge_meter_id, discharge_meter_id, rated_capacity, rated_power, nominal_voltage, "
                 "       communication_status_with_pcs_point_id, "
                 "       communication_status_with_ems_point_id, "
                 "       grid_status_point_id, "
                 "       total_voltage_point_id, "
                 "       total_current_point_id, "
                 "       soh_point_id, "
                 "       charging_power_limit_point_id, "
                 "       discharge_limit_power_point_id, "
                 "       rechargeable_capacity_point_id, "
                 "       dischargeable_capacity_point_id, "
                 "       average_temperature_point_id, "
                 "       average_voltage_point_id, "
                 "       insulation_value_point_id, "
                 "       positive_insulation_value_point_id, "
                 "       negative_insulation_value_point_id, "
                 "       maximum_temperature_point_id, "
                 "       maximum_temperature_battery_cell_point_id, "
                 "       minimum_temperature_point_id, "
                 "       minimum_temperature_battery_cell_point_id, "
                 "       maximum_voltage_point_id, "
                 "       maximum_voltage_battery_cell_point_id, "
                 "       minimum_voltage_point_id, "
                 "       minimum_voltage_battery_cell_point_id "
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
                           "nominal_voltage": row[11],
                           "communication_status_with_pcs_point": point_dict.get(row[12]),
                           "communication_status_with_ems_point": point_dict.get(row[13]),
                           "grid_status_point": point_dict.get(row[14]),
                           "total_voltage_point": point_dict.get(row[15]),
                           "total_current_point": point_dict.get(row[16]),
                           "soh_point": point_dict.get(row[17]),
                           "charging_power_limit_point": point_dict.get(row[18]),
                           "discharge_limit_power_point": point_dict.get(row[19]),
                           "rechargeable_capacity_point": point_dict.get(row[20]),
                           "dischargeable_capacity_point": point_dict.get(row[21]),
                           "average_temperature_point": point_dict.get(row[22]),
                           "average_voltage_point": point_dict.get(row[23]),
                           "insulation_value_point": point_dict.get(row[24]),
                           "positive_insulation_value_point": point_dict.get(row[25]),
                           "negative_insulation_value_point": point_dict.get(row[26]),
                           "maximum_temperature_point": point_dict.get(row[27]),
                           "maximum_temperature_battery_cell_point": point_dict.get(row[28]),
                           "minimum_temperature_point": point_dict.get(row[29]),
                           "minimum_temperature_battery_cell_point": point_dict.get(row[30]),
                           "maximum_voltage_point": point_dict.get(row[31]),
                           "maximum_voltage_battery_cell_point": point_dict.get(row[32]),
                           "minimum_voltage_point": point_dict.get(row[33]),
                           "minimum_voltage_battery_cell_point": point_dict.get(row[34])
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
                     isinstance(new_values['data']['rated_capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = float(new_values['data']['rated_capacity'])

        if 'rated_power' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['rated_power'], float) or
                     isinstance(new_values['data']['rated_power'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_POWER')
        rated_power = float(new_values['data']['rated_power'])

        if 'nominal_voltage' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['nominal_voltage'], float) or
                     isinstance(new_values['data']['nominal_voltage'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NOMINAL_VOLTAGE')
        nominal_voltage = float(new_values['data']['nominal_voltage'])

        communication_status_with_pcs_point_id = None
        communication_status_with_ems_point_id = None
        grid_status_point_id = None
        total_voltage_point_id = None
        total_current_point_id = None
        soh_point_id = None
        charging_power_limit_point_id = None
        discharge_limit_power_point_id = None
        rechargeable_capacity_point_id = None
        dischargeable_capacity_point_id = None
        average_temperature_point_id = None
        average_voltage_point_id = None
        insulation_value_point_id = None
        positive_insulation_value_point_id = None
        negative_insulation_value_point_id = None
        maximum_temperature_point_id = None
        maximum_temperature_battery_cell_point_id = None
        minimum_temperature_point_id = None
        minimum_temperature_battery_cell_point_id = None
        maximum_voltage_point_id = None
        maximum_voltage_battery_cell_point_id = None
        minimum_voltage_point_id = None
        minimum_voltage_battery_cell_point_id = None

        if 'communication_status_with_pcs_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['communication_status_with_pcs_point_id'], int) and \
                new_values['data']['communication_status_with_pcs_point_id'] > 0:
            communication_status_with_pcs_point_id = new_values['data']['communication_status_with_pcs_point_id']

        if 'communication_status_with_ems_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['communication_status_with_ems_point_id'], int) and \
                new_values['data']['communication_status_with_ems_point_id'] > 0:
            communication_status_with_ems_point_id = new_values['data']['communication_status_with_ems_point_id']

        if 'grid_status_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['grid_status_point_id'], int) and \
                new_values['data']['grid_status_point_id'] > 0:
            grid_status_point_id = new_values['data']['grid_status_point_id']

        if 'total_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_voltage_point_id'], int) and \
                new_values['data']['total_voltage_point_id'] > 0:
            total_voltage_point_id = new_values['data']['total_voltage_point_id']

        if 'total_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_current_point_id'], int) and \
                new_values['data']['total_current_point_id'] > 0:
            total_current_point_id = new_values['data']['total_current_point_id']

        if 'soh_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['soh_point_id'], int) and \
                new_values['data']['soh_point_id'] > 0:
            soh_point_id = new_values['data']['soh_point_id']

        if 'charging_power_limit_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['charging_power_limit_point_id'], int) and \
                new_values['data']['charging_power_limit_point_id'] > 0:
            charging_power_limit_point_id = new_values['data']['charging_power_limit_point_id']

        if 'discharge_limit_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['discharge_limit_power_point_id'], int) and \
                new_values['data']['discharge_limit_power_point_id'] > 0:
            discharge_limit_power_point_id = new_values['data']['discharge_limit_power_point_id']

        if 'rechargeable_capacity_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['rechargeable_capacity_point_id'], int) and \
                new_values['data']['rechargeable_capacity_point_id'] > 0:
            rechargeable_capacity_point_id = new_values['data']['rechargeable_capacity_point_id']

        if 'dischargeable_capacity_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['dischargeable_capacity_point_id'], int) and \
                new_values['data']['dischargeable_capacity_point_id'] > 0:
            dischargeable_capacity_point_id = new_values['data']['dischargeable_capacity_point_id']

        if 'average_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['average_temperature_point_id'], int) and \
                new_values['data']['average_temperature_point_id'] > 0:
            average_temperature_point_id = new_values['data']['average_temperature_point_id']

        if 'average_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['average_voltage_point_id'], int) and \
                new_values['data']['average_voltage_point_id'] > 0:
            average_voltage_point_id = new_values['data']['average_voltage_point_id']

        if 'insulation_value_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['insulation_value_point_id'], int) and \
                new_values['data']['insulation_value_point_id'] > 0:
            insulation_value_point_id = new_values['data']['insulation_value_point_id']

        if 'positive_insulation_value_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['positive_insulation_value_point_id'], int) and \
                new_values['data']['positive_insulation_value_point_id'] > 0:
            positive_insulation_value_point_id = new_values['data']['positive_insulation_value_point_id']

        if 'negative_insulation_value_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['negative_insulation_value_point_id'], int) and \
                new_values['data']['negative_insulation_value_point_id'] > 0:
            negative_insulation_value_point_id = new_values['data']['negative_insulation_value_point_id']

        if 'maximum_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['maximum_temperature_point_id'], int) and \
                new_values['data']['maximum_temperature_point_id'] > 0:
            maximum_temperature_point_id = new_values['data']['maximum_temperature_point_id']

        if 'maximum_temperature_battery_cell_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['maximum_temperature_battery_cell_point_id'], int) and \
                new_values['data']['maximum_temperature_battery_cell_point_id'] > 0:
            maximum_temperature_battery_cell_point_id = new_values['data']['maximum_temperature_battery_cell_point_id']

        if 'minimum_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['minimum_temperature_point_id'], int) and \
                new_values['data']['minimum_temperature_point_id'] > 0:
            minimum_temperature_point_id = new_values['data']['minimum_temperature_point_id']

        if 'minimum_temperature_battery_cell_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['minimum_temperature_battery_cell_point_id'], int) and \
                new_values['data']['minimum_temperature_battery_cell_point_id'] > 0:
            minimum_temperature_battery_cell_point_id = new_values['data']['minimum_temperature_battery_cell_point_id']

        if 'maximum_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['maximum_voltage_point_id'], int) and \
                new_values['data']['maximum_voltage_point_id'] > 0:
            maximum_voltage_point_id = new_values['data']['maximum_voltage_point_id']

        if 'maximum_voltage_battery_cell_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['maximum_voltage_battery_cell_point_id'], int) and \
                new_values['data']['maximum_voltage_battery_cell_point_id'] > 0:
            maximum_voltage_battery_cell_point_id = new_values['data']['maximum_voltage_battery_cell_point_id']

        if 'minimum_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['minimum_voltage_point_id'], int) and \
                new_values['data']['minimum_voltage_point_id'] > 0:
            minimum_voltage_point_id = new_values['data']['minimum_voltage_point_id']

        if 'minimum_voltage_battery_cell_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['minimum_voltage_battery_cell_point_id'], int) and \
                new_values['data']['minimum_voltage_battery_cell_point_id'] > 0:
            minimum_voltage_battery_cell_point_id = new_values['data']['minimum_voltage_battery_cell_point_id']
        print(new_values)
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
                      "     rated_capacity = %s,  rated_power = %s, nominal_voltage = %s, "
                      "     communication_status_with_pcs_point_id = %s, "
                      "     communication_status_with_ems_point_id = %s, "
                      "     grid_status_point_id = %s, "
                      "     total_voltage_point_id = %s, "
                      "     total_current_point_id = %s, "
                      "     soh_point_id = %s, "
                      "     charging_power_limit_point_id = %s, "
                      "     discharge_limit_power_point_id = %s, "
                      "     rechargeable_capacity_point_id = %s, "
                      "     dischargeable_capacity_point_id = %s, "
                      "     average_temperature_point_id = %s, "
                      "     average_voltage_point_id = %s, "
                      "     insulation_value_point_id = %s, "
                      "     positive_insulation_value_point_id = %s, "
                      "     negative_insulation_value_point_id = %s, "
                      "     maximum_temperature_point_id = %s, "
                      "     maximum_temperature_battery_cell_point_id = %s, "
                      "     minimum_temperature_point_id = %s, "
                      "     minimum_temperature_battery_cell_point_id = %s, "
                      "     maximum_voltage_point_id = %s, "
                      "     maximum_voltage_battery_cell_point_id = %s, "
                      "     minimum_voltage_point_id = %s, "
                      "     minimum_voltage_battery_cell_point_id = %s) "
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
                                    communication_status_with_pcs_point_id,
                                    communication_status_with_ems_point_id,
                                    grid_status_point_id,
                                    total_voltage_point_id,
                                    total_current_point_id,
                                    soh_point_id,
                                    charging_power_limit_point_id,
                                    discharge_limit_power_point_id,
                                    rechargeable_capacity_point_id,
                                    dischargeable_capacity_point_id,
                                    average_temperature_point_id,
                                    average_voltage_point_id,
                                    insulation_value_point_id,
                                    positive_insulation_value_point_id,
                                    negative_insulation_value_point_id,
                                    maximum_temperature_point_id,
                                    maximum_temperature_battery_cell_point_id,
                                    minimum_temperature_point_id,
                                    minimum_temperature_battery_cell_point_id,
                                    maximum_voltage_point_id,
                                    maximum_voltage_battery_cell_point_id,
                                    minimum_voltage_point_id,
                                    minimum_voltage_battery_cell_point_id,
                                    bid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerCommandCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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

        query = (" SELECT c.id, c.name, c.uuid "
                 " FROM tbl_energy_storage_containers m, "
                 "      tbl_energy_storage_containers_commands mc, "
                 "      tbl_commands c "
                 " WHERE mc.energy_storage_container_id = m.id AND c.id = mc.command_id AND m.id = %s "
                 " ORDER BY c.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2]}
                result.append(meta_result)

        resp.text = json.dumps(result)


class EnergyStorageContainerGridCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                               "capacity": row[6]}
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
        capacity = float(new_values['data']['capacity'])

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
                                    capacity))
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
        resp.status = falcon.HTTP_200

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
                           "capacity": row[7]}

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
        capacity = float(new_values['data']['capacity'])

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
                      " WHERE id = %s ")
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


class EnergyStorageContainerLoadCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                               "rated_input_power": row[5]}
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
        rated_input_power = float(new_values['data']['rated_input_power'])

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
                                    rated_input_power))
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
        resp.status = falcon.HTTP_200

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

        query = (" SELECT id, name, uuid, energy_storage_container_id, power_point_id, meter_id, rated_input_power "
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
                           "rated_input_power": row[6]}

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
        rated_input_power = float(new_values['data']['rated_input_power'])

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


class EnergyStorageContainerPowerconversionsystemCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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

        query = (" SELECT id, name, uuid, run_state_point_id, rated_output_power, "
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
                 "        dc_current_point_id  "
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
                               "rated_output_power": row[4],
                               "today_charge_energy_point": point_dict.get(row[5]),
                               "today_discharge_energy_point": point_dict.get(row[6]),
                               "total_charge_energy_point": point_dict.get(row[7]),
                               "total_discharge_energy_point": point_dict.get(row[8]),
                               "working_status_point": point_dict.get(row[9]),
                               "grid_connection_status_point": point_dict.get(row[10]),
                               "device_status_point": point_dict.get(row[11]),
                               "control_mode_point": point_dict.get(row[12]),
                               "total_ac_active_power_point": point_dict.get(row[13]),
                               "total_ac_reactive_power_point": point_dict.get(row[14]),
                               "total_ac_apparent_power_point": point_dict.get(row[15]),
                               "total_ac_power_factor_point": point_dict.get(row[16]),
                               "ac_frequency_point": point_dict.get(row[17]),
                               "phase_a_active_power_point": point_dict.get(row[18]),
                               "phase_b_active_power_point": point_dict.get(row[19]),
                               "phase_c_active_power_point": point_dict.get(row[20]),
                               "phase_a_reactive_power_point": point_dict.get(row[21]),
                               "phase_b_reactive_power_point": point_dict.get(row[22]),
                               "phase_c_reactive_power_point": point_dict.get(row[23]),
                               "phase_a_apparent_power_point": point_dict.get(row[24]),
                               "phase_b_apparent_power_point": point_dict.get(row[25]),
                               "phase_c_apparent_power_point": point_dict.get(row[26]),
                               "ab_voltage_point": point_dict.get(row[27]),
                               "bc_voltage_point": point_dict.get(row[28]),
                               "ca_voltage_point": point_dict.get(row[29]),
                               "ab_current_point": point_dict.get(row[30]),
                               "bc_current_point": point_dict.get(row[31]),
                               "ca_current_point": point_dict.get(row[32]),
                               "phase_a_voltage_point": point_dict.get(row[33]),
                               "phase_b_voltage_point": point_dict.get(row[34]),
                               "phase_c_voltage_point": point_dict.get(row[35]),
                               "phase_a_current_point": point_dict.get(row[36]),
                               "phase_b_current_point": point_dict.get(row[37]),
                               "phase_c_current_point": point_dict.get(row[38]),
                               "pcs_module_temperature_point": point_dict.get(row[39]),
                               "pcs_ambient_temperature_point": point_dict.get(row[40]),
                               "a1_module_temperature_point": point_dict.get(row[41]),
                               "b1_module_temperature_point": point_dict.get(row[42]),
                               "c1_module_temperature_point": point_dict.get(row[43]),
                               "a2_module_temperature_point": point_dict.get(row[44]),
                               "b2_module_temperature_point": point_dict.get(row[45]),
                               "c2_module_temperature_point": point_dict.get(row[46]),
                               "air_inlet_temperature_point": point_dict.get(row[47]),
                               "air_outlet_temperature_point": point_dict.get(row[48]),
                               "dc_power_point": point_dict.get(row[49]),
                               "dc_voltage_point": point_dict.get(row[50]),
                               "dc_current_point": point_dict.get(row[51])
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
        rated_output_power = float(new_values['data']['rated_output_power'])

        today_charge_energy_point_id = None
        today_discharge_energy_point_id = None
        total_charge_energy_point_id = None
        total_discharge_energy_point_id = None
        working_status_point_id = None
        grid_connection_status_point_id = None
        device_status_point_id = None
        control_mode_point_id = None
        total_ac_active_power_point_id = None
        total_ac_reactive_power_point_id = None
        total_ac_apparent_power_point_id = None
        total_ac_power_factor_point_id = None
        ac_frequency_point_id = None
        phase_a_active_power_point_id = None
        phase_b_active_power_point_id = None
        phase_c_active_power_point_id = None
        phase_a_reactive_power_point_id = None
        phase_b_reactive_power_point_id = None
        phase_c_reactive_power_point_id = None
        phase_a_apparent_power_point_id = None
        phase_b_apparent_power_point_id = None
        phase_c_apparent_power_point_id = None
        ab_voltage_point_id = None
        bc_voltage_point_id = None
        ca_voltage_point_id = None
        ab_current_point_id = None
        bc_current_point_id = None
        ca_current_point_id = None
        phase_a_voltage_point_id = None
        phase_b_voltage_point_id = None
        phase_c_voltage_point_id = None
        phase_a_current_point_id = None
        phase_b_current_point_id = None
        phase_c_current_point_id = None
        pcs_module_temperature_point_id = None
        pcs_ambient_temperature_point_id = None
        a1_module_temperature_point_id = None
        b1_module_temperature_point_id = None
        c1_module_temperature_point_id = None
        a2_module_temperature_point_id = None
        b2_module_temperature_point_id = None
        c2_module_temperature_point_id = None
        air_inlet_temperature_point_id = None
        air_outlet_temperature_point_id = None
        dc_power_point_id = None
        dc_voltage_point_id = None
        dc_current_point_id = None

        if 'today_charge_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['today_charge_energy_point_id'], int) and \
                new_values['data']['today_charge_energy_point_id'] > 0:
            today_charge_energy_point_id = new_values['data']['today_charge_energy_point_id']

        if 'today_discharge_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['today_discharge_energy_point_id'], int) and \
                new_values['data']['today_discharge_energy_point_id'] > 0:
            today_discharge_energy_point_id = new_values['data']['today_discharge_energy_point_id']

        if 'total_charge_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_charge_energy_point_id'], int) and \
                new_values['data']['total_charge_energy_point_id'] > 0:
            total_charge_energy_point_id = new_values['data']['total_charge_energy_point_id']

        if 'total_discharge_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_discharge_energy_point_id'], int) and \
                new_values['data']['total_discharge_energy_point_id'] > 0:
            total_discharge_energy_point_id = new_values['data']['total_discharge_energy_point_id']

        if 'working_status_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['working_status_point_id'], int) and \
                new_values['data']['working_status_point_id'] > 0:
            working_status_point_id = new_values['data']['working_status_point_id']

        if 'grid_connection_status_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['grid_connection_status_point_id'], int) and \
                new_values['data']['grid_connection_status_point_id'] > 0:
            grid_connection_status_point_id = new_values['data']['grid_connection_status_point_id']

        if 'device_status_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['device_status_point_id'], int) and \
                new_values['data']['device_status_point_id'] > 0:
            device_status_point_id = new_values['data']['device_status_point_id']

        if 'control_mode_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['control_mode_point_id'], int) and \
                new_values['data']['control_mode_point_id'] > 0:
            control_mode_point_id = new_values['data']['control_mode_point_id']

        if 'total_ac_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_ac_active_power_point_id'], int) and \
                new_values['data']['total_ac_active_power_point_id'] > 0:
            total_ac_active_power_point_id = new_values['data']['total_ac_active_power_point_id']

        if 'total_ac_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_ac_reactive_power_point_id'], int) and \
                new_values['data']['total_ac_reactive_power_point_id'] > 0:
            total_ac_reactive_power_point_id = new_values['data']['total_ac_reactive_power_point_id']

        if 'total_ac_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_ac_apparent_power_point_id'], int) and \
                new_values['data']['total_ac_apparent_power_point_id'] > 0:
            total_ac_apparent_power_point_id = new_values['data']['total_ac_apparent_power_point_id']

        if 'total_ac_power_factor_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_ac_power_factor_point_id'], int) and \
                new_values['data']['total_ac_power_factor_point_id'] > 0:
            total_ac_power_factor_point_id = new_values['data']['total_ac_power_factor_point_id']

        if 'ac_frequency_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ac_frequency_point_id'], int) and \
                new_values['data']['ac_frequency_point_id'] > 0:
            ac_frequency_point_id = new_values['data']['ac_frequency_point_id']

        if 'phase_a_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_a_active_power_point_id'], int) and \
                new_values['data']['phase_a_active_power_point_id'] > 0:
            phase_a_active_power_point_id = new_values['data']['phase_a_active_power_point_id']

        if 'phase_b_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_b_active_power_point_id'], int) and \
                new_values['data']['phase_b_active_power_point_id'] > 0:
            phase_b_active_power_point_id = new_values['data']['phase_b_active_power_point_id']

        if 'phase_c_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_c_active_power_point_id'], int) and \
                new_values['data']['phase_c_active_power_point_id'] > 0:
            phase_c_active_power_point_id = new_values['data']['phase_c_active_power_point_id']

        if 'phase_a_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_a_reactive_power_point_id'], int) and \
                new_values['data']['phase_a_reactive_power_point_id'] > 0:
            phase_a_reactive_power_point_id = new_values['data']['phase_a_reactive_power_point_id']

        if 'phase_b_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_b_reactive_power_point_id'], int) and \
                new_values['data']['phase_b_reactive_power_point_id'] > 0:
            phase_b_reactive_power_point_id = new_values['data']['phase_b_reactive_power_point_id']

        if 'phase_c_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_c_reactive_power_point_id'], int) and \
                new_values['data']['phase_c_reactive_power_point_id'] > 0:
            phase_c_reactive_power_point_id = new_values['data']['phase_c_reactive_power_point_id']

        if 'phase_a_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_a_apparent_power_point_id'], int) and \
                new_values['data']['phase_a_apparent_power_point_id'] > 0:
            phase_a_apparent_power_point_id = new_values['data']['phase_a_apparent_power_point_id']

        if 'phase_b_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_b_apparent_power_point_id'], int) and \
                new_values['data']['phase_b_apparent_power_point_id'] > 0:
            phase_b_apparent_power_point_id = new_values['data']['phase_b_apparent_power_point_id']

        if 'phase_c_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_c_apparent_power_point_id'], int) and \
                new_values['data']['phase_c_apparent_power_point_id'] > 0:
            phase_c_apparent_power_point_id = new_values['data']['phase_c_apparent_power_point_id']

        if 'ab_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ab_voltage_point_id'], int) and \
                new_values['data']['ab_voltage_point_id'] > 0:
            ab_voltage_point_id = new_values['data']['ab_voltage_point_id']

        if 'bc_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['bc_voltage_point_id'], int) and \
                new_values['data']['bc_voltage_point_id'] > 0:
            bc_voltage_point_id = new_values['data']['bc_voltage_point_id']

        if 'ca_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ca_voltage_point_id'], int) and \
                new_values['data']['ca_voltage_point_id'] > 0:
            ca_voltage_point_id = new_values['data']['ca_voltage_point_id']

        if 'ab_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ab_current_point_id'], int) and \
                new_values['data']['ab_current_point_id'] > 0:
            ab_current_point_id = new_values['data']['ab_current_point_id']

        if 'bc_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['bc_current_point_id'], int) and \
                new_values['data']['bc_current_point_id'] > 0:
            bc_current_point_id = new_values['data']['bc_current_point_id']

        if 'ca_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ca_current_point_id'], int) and \
                new_values['data']['ca_current_point_id'] > 0:
            ca_current_point_id = new_values['data']['ca_current_point_id']

        if 'phase_a_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_a_voltage_point_id'], int) and \
                new_values['data']['phase_a_voltage_point_id'] > 0:
            phase_a_voltage_point_id = new_values['data']['phase_a_voltage_point_id']

        if 'phase_b_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_b_voltage_point_id'], int) and \
                new_values['data']['phase_b_voltage_point_id'] > 0:
            phase_b_voltage_point_id = new_values['data']['phase_b_voltage_point_id']

        if 'phase_c_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_c_voltage_point_id'], int) and \
                new_values['data']['phase_c_voltage_point_id'] > 0:
            phase_c_voltage_point_id = new_values['data']['phase_c_voltage_point_id']

        if 'phase_a_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_a_current_point_id'], int) and \
                new_values['data']['phase_a_current_point_id'] > 0:
            phase_a_current_point_id = new_values['data']['phase_a_current_point_id']

        if 'phase_b_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_b_current_point_id'], int) and \
                new_values['data']['phase_b_current_point_id'] > 0:
            phase_b_current_point_id = new_values['data']['phase_b_current_point_id']

        if 'phase_c_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_c_current_point_id'], int) and \
                new_values['data']['phase_c_current_point_id'] > 0:
            phase_c_current_point_id = new_values['data']['phase_c_current_point_id']

        if 'pcs_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pcs_module_temperature_point_id'], int) and \
                new_values['data']['pcs_module_temperature_point_id'] > 0:
            pcs_module_temperature_point_id = new_values['data']['pcs_module_temperature_point_id']

        if 'pcs_ambient_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pcs_ambient_temperature_point_id'], int) and \
                new_values['data']['pcs_ambient_temperature_point_id'] > 0:
            pcs_ambient_temperature_point_id = new_values['data']['pcs_ambient_temperature_point_id']

        if 'a1_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['a1_module_temperature_point_id'], int) and \
                new_values['data']['a1_module_temperature_point_id'] > 0:
            a1_module_temperature_point_id = new_values['data']['a1_module_temperature_point_id']

        if 'b1_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['b1_module_temperature_point_id'], int) and \
                new_values['data']['b1_module_temperature_point_id'] > 0:
            b1_module_temperature_point_id = new_values['data']['b1_module_temperature_point_id']

        if 'c1_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['c1_module_temperature_point_id'], int) and \
                new_values['data']['c1_module_temperature_point_id'] > 0:
            c1_module_temperature_point_id = new_values['data']['c1_module_temperature_point_id']

        if 'a2_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['a2_module_temperature_point_id'], int) and \
                new_values['data']['a2_module_temperature_point_id'] > 0:
            a2_module_temperature_point_id = new_values['data']['a2_module_temperature_point_id']

        if 'b2_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['b2_module_temperature_point_id'], int) and \
                new_values['data']['b2_module_temperature_point_id'] > 0:
            b2_module_temperature_point_id = new_values['data']['b2_module_temperature_point_id']

        if 'c2_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['c2_module_temperature_point_id'], int) and \
                new_values['data']['c2_module_temperature_point_id'] > 0:
            c2_module_temperature_point_id = new_values['data']['c2_module_temperature_point_id']

        if 'air_inlet_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['air_inlet_temperature_point_id'], int) and \
                new_values['data']['air_inlet_temperature_point_id'] > 0:
            air_inlet_temperature_point_id = new_values['data']['air_inlet_temperature_point_id']

        if 'air_outlet_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['air_outlet_temperature_point_id'], int) and \
                new_values['data']['air_outlet_temperature_point_id'] > 0:
            air_outlet_temperature_point_id = new_values['data']['air_outlet_temperature_point_id']

        if 'dc_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['dc_power_point_id'], int) and \
                new_values['data']['dc_power_point_id'] > 0:
            dc_power_point_id = new_values['data']['dc_power_point_id']

        if 'dc_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['dc_voltage_point_id'], int) and \
                new_values['data']['dc_voltage_point_id'] > 0:
            dc_voltage_point_id = new_values['data']['dc_voltage_point_id']

        if 'dc_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['dc_current_point_id'], int) and \
                new_values['data']['dc_current_point_id'] > 0:
            dc_current_point_id = new_values['data']['dc_current_point_id']

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
                      "     (name, uuid, energy_storage_container_id, run_state_point_id, rated_output_power, "
                      "      today_charge_energy_point_id, "
                      "      today_discharge_energy_point_id,"
                      "      total_charge_energy_point_id, "
                      "      total_discharge_energy_point_id, "
                      "      working_status_point_id, "
                      "      grid_connection_status_point_id, "
                      "      device_status_point_id, "
                      "      control_mode_point_id, "
                      "      total_ac_active_power_point_id, "
                      "      total_ac_reactive_power_point_id, "
                      "      total_ac_apparent_power_point_id, "
                      "      total_ac_power_factor_point_id, "
                      "      ac_frequency_point_id, "
                      "      phase_a_active_power_point_id, "
                      "      phase_b_active_power_point_id, "
                      "      phase_c_active_power_point_id, "
                      "      phase_a_reactive_power_point_id, "
                      "      phase_b_reactive_power_point_id, "
                      "      phase_c_reactive_power_point_id, "
                      "      phase_a_apparent_power_point_id, "
                      "      phase_b_apparent_power_point_id, "
                      "      phase_c_apparent_power_point_id, "
                      "      ab_voltage_point_id, "
                      "      bc_voltage_point_id, "
                      "      ca_voltage_point_id, "
                      "      ab_current_point_id, "
                      "      bc_current_point_id, "
                      "      ca_current_point_id, "
                      "      phase_a_voltage_point_id, "
                      "      phase_b_voltage_point_id, "
                      "      phase_c_voltage_point_id, "
                      "      phase_a_current_point_id, "
                      "      phase_b_current_point_id, "
                      "      phase_c_current_point_id, "
                      "      pcs_module_temperature_point_id, "
                      "      pcs_ambient_temperature_point_id, "
                      "      a1_module_temperature_point_id, "
                      "      b1_module_temperature_point_id, "
                      "      c1_module_temperature_point_id, "
                      "      a2_module_temperature_point_id, "
                      "      b2_module_temperature_point_id, "
                      "      c2_module_temperature_point_id, "
                      "      air_inlet_temperature_point_id, "
                      "      air_outlet_temperature_point_id, "
                      "      dc_power_point_id, "
                      "      dc_voltage_point_id, "
                      "      dc_current_point_id) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, " 
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    id_,
                                    run_state_point_id,
                                    rated_output_power,
                                    today_charge_energy_point_id,
                                    today_discharge_energy_point_id,
                                    total_charge_energy_point_id,
                                    total_discharge_energy_point_id,
                                    working_status_point_id,
                                    grid_connection_status_point_id,
                                    device_status_point_id,
                                    control_mode_point_id,
                                    total_ac_active_power_point_id,
                                    total_ac_reactive_power_point_id,
                                    total_ac_apparent_power_point_id,
                                    total_ac_power_factor_point_id,
                                    ac_frequency_point_id,
                                    phase_a_active_power_point_id,
                                    phase_b_active_power_point_id,
                                    phase_c_active_power_point_id,
                                    phase_a_reactive_power_point_id,
                                    phase_b_reactive_power_point_id,
                                    phase_c_reactive_power_point_id,
                                    phase_a_apparent_power_point_id,
                                    phase_b_apparent_power_point_id,
                                    phase_c_apparent_power_point_id,
                                    ab_voltage_point_id,
                                    bc_voltage_point_id,
                                    ca_voltage_point_id,
                                    ab_current_point_id,
                                    bc_current_point_id,
                                    ca_current_point_id,
                                    phase_a_voltage_point_id,
                                    phase_b_voltage_point_id,
                                    phase_c_voltage_point_id,
                                    phase_a_current_point_id,
                                    phase_b_current_point_id,
                                    phase_c_current_point_id,
                                    pcs_module_temperature_point_id,
                                    pcs_ambient_temperature_point_id,
                                    a1_module_temperature_point_id,
                                    b1_module_temperature_point_id,
                                    c1_module_temperature_point_id,
                                    a2_module_temperature_point_id,
                                    b2_module_temperature_point_id,
                                    c2_module_temperature_point_id,
                                    air_inlet_temperature_point_id,
                                    air_outlet_temperature_point_id,
                                    dc_power_point_id,
                                    dc_voltage_point_id,
                                    dc_current_point_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainerpowerconversionsystems/' + str(new_id)


class EnergyStorageContainerPowerconversionsystemItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, pid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not pid.isdigit() or int(pid) <= 0:
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

        query = (" SELECT id, name, uuid, energy_storage_container_id, run_state_point_id, rated_output_power, "
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
                 "        dc_current_point_id  "
                 " FROM tbl_energy_storage_containers_power_conversion_systems "
                 " WHERE id = %s ")
        cursor.execute(query, (pid,))
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
                           "rated_output_power": row[5],
                           "today_charge_energy_point": point_dict.get(row[6]),
                           "today_discharge_energy_point": point_dict.get(row[7]),
                           "total_charge_energy_point": point_dict.get(row[8]),
                           "total_discharge_energy_point": point_dict.get(row[9]),
                           "working_status_point": point_dict.get(row[10]),
                           "grid_connection_status_point": point_dict.get(row[11]),
                           "device_status_point": point_dict.get(row[12]),
                           "control_mode_point": point_dict.get(row[13]),
                           "total_ac_active_power_point": point_dict.get(row[14]),
                           "total_ac_reactive_power_point": point_dict.get(row[15]),
                           "total_ac_apparent_power_point": point_dict.get(row[16]),
                           "total_ac_power_factor_point": point_dict.get(row[17]),
                           "ac_frequency_point": point_dict.get(row[18]),
                           "phase_a_active_power_point": point_dict.get(row[19]),
                           "phase_b_active_power_point": point_dict.get(row[20]),
                           "phase_c_active_power_point": point_dict.get(row[21]),
                           "phase_a_reactive_power_point": point_dict.get(row[22]),
                           "phase_b_reactive_power_point": point_dict.get(row[23]),
                           "phase_c_reactive_power_point": point_dict.get(row[24]),
                           "phase_a_apparent_power_point": point_dict.get(row[25]),
                           "phase_b_apparent_power_point": point_dict.get(row[26]),
                           "phase_c_apparent_power_point": point_dict.get(row[27]),
                           "ab_voltage_point": point_dict.get(row[28]),
                           "bc_voltage_point": point_dict.get(row[29]),
                           "ca_voltage_point": point_dict.get(row[30]),
                           "ab_current_point": point_dict.get(row[31]),
                           "bc_current_point": point_dict.get(row[32]),
                           "ca_current_point": point_dict.get(row[33]),
                           "phase_a_voltage_point": point_dict.get(row[34]),
                           "phase_b_voltage_point": point_dict.get(row[35]),
                           "phase_c_voltage_point": point_dict.get(row[36]),
                           "phase_a_current_point": point_dict.get(row[37]),
                           "phase_b_current_point": point_dict.get(row[38]),
                           "phase_c_current_point": point_dict.get(row[39]),
                           "pcs_module_temperature_point": point_dict.get(row[40]),
                           "pcs_ambient_temperature_point": point_dict.get(row[41]),
                           "a1_module_temperature_point": point_dict.get(row[42]),
                           "b1_module_temperature_point": point_dict.get(row[43]),
                           "c1_module_temperature_point": point_dict.get(row[44]),
                           "a2_module_temperature_point": point_dict.get(row[45]),
                           "b2_module_temperature_point": point_dict.get(row[46]),
                           "c2_module_temperature_point": point_dict.get(row[47]),
                           "air_inlet_temperature_point": point_dict.get(row[48]),
                           "air_outlet_temperature_point": point_dict.get(row[49]),
                           "dc_power_point": point_dict.get(row[50]),
                           "dc_voltage_point": point_dict.get(row[51]),
                           "dc_current_point": point_dict.get(row[52])
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not pid.isdigit() or int(pid) <= 0:
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
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE id = %s ", (pid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, pid):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')
        if not pid.isdigit() or int(pid) <= 0:
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
        rated_output_power = float(new_values['data']['rated_output_power'])

        today_charge_energy_point_id = None
        today_discharge_energy_point_id = None
        total_charge_energy_point_id = None
        total_discharge_energy_point_id = None
        working_status_point_id = None
        grid_connection_status_point_id = None
        device_status_point_id = None
        control_mode_point_id = None
        total_ac_active_power_point_id = None
        total_ac_reactive_power_point_id = None
        total_ac_apparent_power_point_id = None
        total_ac_power_factor_point_id = None
        ac_frequency_point_id = None
        phase_a_active_power_point_id = None
        phase_b_active_power_point_id = None
        phase_c_active_power_point_id = None
        phase_a_reactive_power_point_id = None
        phase_b_reactive_power_point_id = None
        phase_c_reactive_power_point_id = None
        phase_a_apparent_power_point_id = None
        phase_b_apparent_power_point_id = None
        phase_c_apparent_power_point_id = None
        ab_voltage_point_id = None
        bc_voltage_point_id = None
        ca_voltage_point_id = None
        ab_current_point_id = None
        bc_current_point_id = None
        ca_current_point_id = None
        phase_a_voltage_point_id = None
        phase_b_voltage_point_id = None
        phase_c_voltage_point_id = None
        phase_a_current_point_id = None
        phase_b_current_point_id = None
        phase_c_current_point_id = None
        pcs_module_temperature_point_id = None
        pcs_ambient_temperature_point_id = None
        a1_module_temperature_point_id = None
        b1_module_temperature_point_id = None
        c1_module_temperature_point_id = None
        a2_module_temperature_point_id = None
        b2_module_temperature_point_id = None
        c2_module_temperature_point_id = None
        air_inlet_temperature_point_id = None
        air_outlet_temperature_point_id = None
        dc_power_point_id = None
        dc_voltage_point_id = None
        dc_current_point_id = None

        if 'today_charge_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['today_charge_energy_point_id'], int) and \
                new_values['data']['today_charge_energy_point_id'] > 0:
            today_charge_energy_point_id = new_values['data']['today_charge_energy_point_id']

        if 'today_discharge_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['today_discharge_energy_point_id'], int) and \
                new_values['data']['today_discharge_energy_point_id'] > 0:
            today_discharge_energy_point_id = new_values['data']['today_discharge_energy_point_id']

        if 'total_charge_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_charge_energy_point_id'], int) and \
                new_values['data']['total_charge_energy_point_id'] > 0:
            total_charge_energy_point_id = new_values['data']['total_charge_energy_point_id']

        if 'total_discharge_energy_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_discharge_energy_point_id'], int) and \
                new_values['data']['total_discharge_energy_point_id'] > 0:
            total_discharge_energy_point_id = new_values['data']['total_discharge_energy_point_id']

        if 'working_status_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['working_status_point_id'], int) and \
                new_values['data']['working_status_point_id'] > 0:
            working_status_point_id = new_values['data']['working_status_point_id']

        if 'grid_connection_status_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['grid_connection_status_point_id'], int) and \
                new_values['data']['grid_connection_status_point_id'] > 0:
            grid_connection_status_point_id = new_values['data']['grid_connection_status_point_id']

        if 'device_status_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['device_status_point_id'], int) and \
                new_values['data']['device_status_point_id'] > 0:
            device_status_point_id = new_values['data']['device_status_point_id']

        if 'control_mode_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['control_mode_point_id'], int) and \
                new_values['data']['control_mode_point_id'] > 0:
            control_mode_point_id = new_values['data']['control_mode_point_id']

        if 'total_ac_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_ac_active_power_point_id'], int) and \
                new_values['data']['total_ac_active_power_point_id'] > 0:
            total_ac_active_power_point_id = new_values['data']['total_ac_active_power_point_id']

        if 'total_ac_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_ac_reactive_power_point_id'], int) and \
                new_values['data']['total_ac_reactive_power_point_id'] > 0:
            total_ac_reactive_power_point_id = new_values['data']['total_ac_reactive_power_point_id']

        if 'total_ac_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_ac_apparent_power_point_id'], int) and \
                new_values['data']['total_ac_apparent_power_point_id'] > 0:
            total_ac_apparent_power_point_id = new_values['data']['total_ac_apparent_power_point_id']

        if 'total_ac_power_factor_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['total_ac_power_factor_point_id'], int) and \
                new_values['data']['total_ac_power_factor_point_id'] > 0:
            total_ac_power_factor_point_id = new_values['data']['total_ac_power_factor_point_id']

        if 'ac_frequency_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ac_frequency_point_id'], int) and \
                new_values['data']['ac_frequency_point_id'] > 0:
            ac_frequency_point_id = new_values['data']['ac_frequency_point_id']

        if 'phase_a_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_a_active_power_point_id'], int) and \
                new_values['data']['phase_a_active_power_point_id'] > 0:
            phase_a_active_power_point_id = new_values['data']['phase_a_active_power_point_id']

        if 'phase_b_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_b_active_power_point_id'], int) and \
                new_values['data']['phase_b_active_power_point_id'] > 0:
            phase_b_active_power_point_id = new_values['data']['phase_b_active_power_point_id']

        if 'phase_c_active_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_c_active_power_point_id'], int) and \
                new_values['data']['phase_c_active_power_point_id'] > 0:
            phase_c_active_power_point_id = new_values['data']['phase_c_active_power_point_id']

        if 'phase_a_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_a_reactive_power_point_id'], int) and \
                new_values['data']['phase_a_reactive_power_point_id'] > 0:
            phase_a_reactive_power_point_id = new_values['data']['phase_a_reactive_power_point_id']

        if 'phase_b_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_b_reactive_power_point_id'], int) and \
                new_values['data']['phase_b_reactive_power_point_id'] > 0:
            phase_b_reactive_power_point_id = new_values['data']['phase_b_reactive_power_point_id']

        if 'phase_c_reactive_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_c_reactive_power_point_id'], int) and \
                new_values['data']['phase_c_reactive_power_point_id'] > 0:
            phase_c_reactive_power_point_id = new_values['data']['phase_c_reactive_power_point_id']

        if 'phase_a_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_a_apparent_power_point_id'], int) and \
                new_values['data']['phase_a_apparent_power_point_id'] > 0:
            phase_a_apparent_power_point_id = new_values['data']['phase_a_apparent_power_point_id']

        if 'phase_b_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_b_apparent_power_point_id'], int) and \
                new_values['data']['phase_b_apparent_power_point_id'] > 0:
            phase_b_apparent_power_point_id = new_values['data']['phase_b_apparent_power_point_id']

        if 'phase_c_apparent_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_c_apparent_power_point_id'], int) and \
                new_values['data']['phase_c_apparent_power_point_id'] > 0:
            phase_c_apparent_power_point_id = new_values['data']['phase_c_apparent_power_point_id']

        if 'ab_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ab_voltage_point_id'], int) and \
                new_values['data']['ab_voltage_point_id'] > 0:
            ab_voltage_point_id = new_values['data']['ab_voltage_point_id']

        if 'bc_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['bc_voltage_point_id'], int) and \
                new_values['data']['bc_voltage_point_id'] > 0:
            bc_voltage_point_id = new_values['data']['bc_voltage_point_id']

        if 'ca_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ca_voltage_point_id'], int) and \
                new_values['data']['ca_voltage_point_id'] > 0:
            ca_voltage_point_id = new_values['data']['ca_voltage_point_id']

        if 'ab_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ab_current_point_id'], int) and \
                new_values['data']['ab_current_point_id'] > 0:
            ab_current_point_id = new_values['data']['ab_current_point_id']

        if 'bc_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['bc_current_point_id'], int) and \
                new_values['data']['bc_current_point_id'] > 0:
            bc_current_point_id = new_values['data']['bc_current_point_id']

        if 'ca_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['ca_current_point_id'], int) and \
                new_values['data']['ca_current_point_id'] > 0:
            ca_current_point_id = new_values['data']['ca_current_point_id']

        if 'phase_a_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_a_voltage_point_id'], int) and \
                new_values['data']['phase_a_voltage_point_id'] > 0:
            phase_a_voltage_point_id = new_values['data']['phase_a_voltage_point_id']

        if 'phase_b_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_b_voltage_point_id'], int) and \
                new_values['data']['phase_b_voltage_point_id'] > 0:
            phase_b_voltage_point_id = new_values['data']['phase_b_voltage_point_id']

        if 'phase_c_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_c_voltage_point_id'], int) and \
                new_values['data']['phase_c_voltage_point_id'] > 0:
            phase_c_voltage_point_id = new_values['data']['phase_c_voltage_point_id']

        if 'phase_a_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_a_current_point_id'], int) and \
                new_values['data']['phase_a_current_point_id'] > 0:
            phase_a_current_point_id = new_values['data']['phase_a_current_point_id']

        if 'phase_b_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_b_current_point_id'], int) and \
                new_values['data']['phase_b_current_point_id'] > 0:
            phase_b_current_point_id = new_values['data']['phase_b_current_point_id']

        if 'phase_c_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['phase_c_current_point_id'], int) and \
                new_values['data']['phase_c_current_point_id'] > 0:
            phase_c_current_point_id = new_values['data']['phase_c_current_point_id']

        if 'pcs_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pcs_module_temperature_point_id'], int) and \
                new_values['data']['pcs_module_temperature_point_id'] > 0:
            pcs_module_temperature_point_id = new_values['data']['pcs_module_temperature_point_id']

        if 'pcs_ambient_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['pcs_ambient_temperature_point_id'], int) and \
                new_values['data']['pcs_ambient_temperature_point_id'] > 0:
            pcs_ambient_temperature_point_id = new_values['data']['pcs_ambient_temperature_point_id']

        if 'a1_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['a1_module_temperature_point_id'], int) and \
                new_values['data']['a1_module_temperature_point_id'] > 0:
            a1_module_temperature_point_id = new_values['data']['a1_module_temperature_point_id']

        if 'b1_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['b1_module_temperature_point_id'], int) and \
                new_values['data']['b1_module_temperature_point_id'] > 0:
            b1_module_temperature_point_id = new_values['data']['b1_module_temperature_point_id']

        if 'c1_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['c1_module_temperature_point_id'], int) and \
                new_values['data']['c1_module_temperature_point_id'] > 0:
            c1_module_temperature_point_id = new_values['data']['c1_module_temperature_point_id']

        if 'a2_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['a2_module_temperature_point_id'], int) and \
                new_values['data']['a2_module_temperature_point_id'] > 0:
            a2_module_temperature_point_id = new_values['data']['a2_module_temperature_point_id']

        if 'b2_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['b2_module_temperature_point_id'], int) and \
                new_values['data']['b2_module_temperature_point_id'] > 0:
            b2_module_temperature_point_id = new_values['data']['b2_module_temperature_point_id']

        if 'c2_module_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['c2_module_temperature_point_id'], int) and \
                new_values['data']['c2_module_temperature_point_id'] > 0:
            c2_module_temperature_point_id = new_values['data']['c2_module_temperature_point_id']

        if 'air_inlet_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['air_inlet_temperature_point_id'], int) and \
                new_values['data']['air_inlet_temperature_point_id'] > 0:
            air_inlet_temperature_point_id = new_values['data']['air_inlet_temperature_point_id']

        if 'air_outlet_temperature_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['air_outlet_temperature_point_id'], int) and \
                new_values['data']['air_outlet_temperature_point_id'] > 0:
            air_outlet_temperature_point_id = new_values['data']['air_outlet_temperature_point_id']

        if 'dc_power_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['dc_power_point_id'], int) and \
                new_values['data']['dc_power_point_id'] > 0:
            dc_power_point_id = new_values['data']['dc_power_point_id']

        if 'dc_voltage_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['dc_voltage_point_id'], int) and \
                new_values['data']['dc_voltage_point_id'] > 0:
            dc_voltage_point_id = new_values['data']['dc_voltage_point_id']

        if 'dc_current_point_id' in new_values['data'].keys() and \
                isinstance(new_values['data']['dc_current_point_id'], int) and \
                new_values['data']['dc_current_point_id'] > 0:
            dc_current_point_id = new_values['data']['dc_current_point_id']

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
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_CONTAINER_POWER_CONVERSION_SYSTEM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_containers_power_conversion_systems "
                       " WHERE energy_storage_container_id = %s AND name = %s AND id != %s ",
                       (id_, name, pid))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_STORAGE_CONTAINER_PCS_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_energy_storage_containers_power_conversion_systems "
                      " SET name = %s, energy_storage_container_id = %s, run_state_point_id = %s, "
                      "     rated_output_power = %s, "
                      "     today_charge_energy_point_id = %s, "
                      "     today_discharge_energy_point_id = %s, "
                      "     total_charge_energy_point_id = %s, "
                      "     total_discharge_energy_point_id = %s, "
                      "     working_status_point_id = %s, "
                      "     grid_connection_status_point_id = %s, "
                      "     device_status_point_id = %s, "
                      "     control_mode_point_id = %s, "
                      "     total_ac_active_power_point_id = %s, "
                      "     total_ac_reactive_power_point_id = %s, "
                      "     total_ac_apparent_power_point_id = %s, "
                      "     total_ac_power_factor_point_id = %s, "
                      "     ac_frequency_point_id = %s, "
                      "     phase_a_active_power_point_id = %s, "
                      "     phase_b_active_power_point_id = %s, "
                      "     phase_c_active_power_point_id = %s, "
                      "     phase_a_reactive_power_point_id = %s, "
                      "     phase_b_reactive_power_point_id = %s, "
                      "     phase_c_reactive_power_point_id = %s, "
                      "     phase_a_apparent_power_point_id = %s, "
                      "     phase_b_apparent_power_point_id = %s, "
                      "     phase_c_apparent_power_point_id = %s, "
                      "     ab_voltage_point_id = %s, "
                      "     bc_voltage_point_id = %s, "
                      "     ca_voltage_point_id = %s, "
                      "     ab_current_point_id = %s, "
                      "     bc_current_point_id = %s, "
                      "     ca_current_point_id = %s, "
                      "     phase_a_voltage_point_id = %s, "
                      "     phase_b_voltage_point_id = %s, "
                      "     phase_c_voltage_point_id = %s, "
                      "     phase_a_current_point_id = %s, "
                      "     phase_b_current_point_id = %s, "
                      "     phase_c_current_point_id = %s, "
                      "     pcs_module_temperature_point_id = %s, "
                      "     pcs_ambient_temperature_point_id = %s, "
                      "     a1_module_temperature_point_id = %s, "
                      "     b1_module_temperature_point_id = %s, "
                      "     c1_module_temperature_point_id = %s, "
                      "     a2_module_temperature_point_id = %s, "
                      "     b2_module_temperature_point_id = %s, "
                      "     c2_module_temperature_point_id = %s, "
                      "     air_inlet_temperature_point_id = %s, "
                      "     air_outlet_temperature_point_id = %s, "
                      "     dc_power_point_id = %s, "
                      "     dc_voltage_point_id = %s, "
                      "     dc_current_point_id = %s "
                      "     WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_,
                                    run_state_point_id,
                                    rated_output_power,
                                    today_charge_energy_point_id,
                                    today_discharge_energy_point_id,
                                    total_charge_energy_point_id,
                                    total_discharge_energy_point_id,
                                    working_status_point_id,
                                    grid_connection_status_point_id,
                                    device_status_point_id,
                                    control_mode_point_id,
                                    total_ac_active_power_point_id,
                                    total_ac_reactive_power_point_id,
                                    total_ac_apparent_power_point_id,
                                    total_ac_power_factor_point_id,
                                    ac_frequency_point_id,
                                    phase_a_active_power_point_id,
                                    phase_b_active_power_point_id,
                                    phase_c_active_power_point_id,
                                    phase_a_reactive_power_point_id,
                                    phase_b_reactive_power_point_id,
                                    phase_c_reactive_power_point_id,
                                    phase_a_apparent_power_point_id,
                                    phase_b_apparent_power_point_id,
                                    phase_c_apparent_power_point_id,
                                    ab_voltage_point_id,
                                    bc_voltage_point_id,
                                    ca_voltage_point_id,
                                    ab_current_point_id,
                                    bc_current_point_id,
                                    ca_current_point_id,
                                    phase_a_voltage_point_id,
                                    phase_b_voltage_point_id,
                                    phase_c_voltage_point_id,
                                    phase_a_current_point_id,
                                    phase_b_current_point_id,
                                    phase_c_current_point_id,
                                    pcs_module_temperature_point_id,
                                    pcs_ambient_temperature_point_id,
                                    a1_module_temperature_point_id,
                                    b1_module_temperature_point_id,
                                    c1_module_temperature_point_id,
                                    a2_module_temperature_point_id,
                                    b2_module_temperature_point_id,
                                    c2_module_temperature_point_id,
                                    air_inlet_temperature_point_id,
                                    air_outlet_temperature_point_id,
                                    dc_power_point_id,
                                    dc_voltage_point_id,
                                    dc_current_point_id,
                                    pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyStorageContainerScheduleCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
        resp.status = falcon.HTTP_200

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
        power = float(new_values['data']['power'])

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


class EnergyStorageContainerClone:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_CONTAINER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, svg_id, description "
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
                           "svg_id": row[7],
                           "description": row[8]}
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = str.strip(meta_result['name']) + \
                (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds')
            add_values = (" INSERT INTO tbl_energy_storage_containers "
                          "    (name, uuid, rated_capacity, rated_power, contact_id, "
                          "     cost_center_id, svg_id, description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['rated_capacity'],
                                        meta_result['rated_power'],
                                        meta_result['contact_id'],
                                        meta_result['cost_center_id'],
                                        meta_result['svg_id'],
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
        resp.status = falcon.HTTP_200

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

        svg_dict = dict()
        query = (" SELECT id, name, uuid "
                 " FROM tbl_svgs ")
        cursor.execute(query)
        rows_svgs = cursor.fetchall()
        if rows_svgs is not None and len(rows_svgs) > 0:
            for row in rows_svgs:
                svg_dict[row[0]] = {"id": row[0],
                                    "name": row[1],
                                    "uuid": row[2]}

        query = (" SELECT id, name, uuid, "
                 "        rated_capacity, rated_power, contact_id, cost_center_id, svg_id, description "
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
                           "svg_id": svg_dict.get(row[7], None),
                           "description": row[8]}

        resp.text = json.dumps(meta_result)


class EnergyStorageContainerImport:
    def __init__(self):
        """"Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
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
                new_values['rated_capacity'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RATED_CAPACITY')
        rated_capacity = new_values['rated_capacity']

        if 'rated_power' not in new_values.keys() or \
                not (isinstance(new_values['rated_power'], float) or
                     isinstance(new_values['rated_power'], int)) or \
                new_values['rated_power'] <= 0.0:
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

        if 'svg_id' in new_values['svg_id'].keys() and \
                isinstance(new_values['svg_id']['id'], int) and \
                new_values['svg_id']['id'] > 0:
            svg_id = new_values['svg_id']['id']
        else:
            svg_id = None

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

        if svg_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_svgs "
                           " WHERE id = %s ",
                           (svg_id,))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.SVG_NOT_FOUND')

        add_values = (" INSERT INTO tbl_energy_storage_containers "
                      "    (name, uuid, rated_capacity, rated_power, contact_id, cost_center_id, svg_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    rated_capacity,
                                    rated_power,
                                    contact_id,
                                    cost_center_id,
                                    svg_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energystoragecontainers/' + str(new_id)
