import uuid
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control
import config


class MicrogridBatteryCollection:
    @staticmethod
    def __init__():
        """Initializes MicrogridBatteryCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        access_control(req)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        # query microgrid dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrids ")
        cursor.execute(query)
        rows_microgrids = cursor.fetchall()

        microgrid_dict = dict()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                microgrid_dict[row[0]] = {"id": row[0],
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

        query = (" SELECT id, name, uuid, microgrid_id, "
                 "        battery_state_point_id, soc_point_id, power_point_id, "
                 "        charge_meter_id, discharge_meter_id, capacity, nominal_voltage "
                 " FROM tbl_microgrids_batteries "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_microgrid_batteries = cursor.fetchall()

        result = list()
        if rows_microgrid_batteries is not None and len(rows_microgrid_batteries) > 0:
            for row in rows_microgrid_batteries:
                microgrid = microgrid_dict.get(row[3])
                battery_state_point = point_dict.get(row[4])
                soc_point = point_dict.get(row[5])
                power_point = point_dict.get(row[6])
                charge_meter = meter_dict.get(row[7])
                discharge_meter = meter_dict.get(row[8])
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "microgrid": microgrid,
                               "battery_state_point": battery_state_point,
                               "soc_point": soc_point,
                               "power_point": power_point,
                               "charge_meter": charge_meter,
                               "discharge_meter": discharge_meter,
                               "capacity": row[9],
                               "nominal_voltage": row[10]}
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
                                   description='API.INVALID_MICROGRID_BATTERY_NAME')
        name = str.strip(new_values['data']['name'])

        if 'microgrid_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['microgrid_id'], int) or \
                new_values['data']['microgrid_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        microgrid_id = new_values['data']['microgrid_id']

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

        if 'capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['capacity'], float) or
                     isinstance(new_values['data']['capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CAPACITY')
        capacity = float(new_values['data']['capacity'])

        if 'nominal_voltage' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['nominal_voltage'], float) or
                     isinstance(new_values['data']['nominal_voltage'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NOMINAL_VOLTAGE')
        nominal_voltage = float(new_values['data']['nominal_voltage'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ",
                       (microgrid_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_batteries "
                       " WHERE microgrid_id = %s AND name = %s ",
                       (microgrid_id, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_BATTERY_NAME_IS_ALREADY_IN_USE')

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

        add_values = (" INSERT INTO tbl_microgrids_batteries "
                      "    (name, uuid, microgrid_id, "
                      "     battery_state_point_id, soc_point_id, power_point_id, "
                      "     charge_meter_id, discharge_meter_id, capacity, nominal_voltage) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    microgrid_id,
                                    battery_state_point_id,
                                    soc_point_id,
                                    power_point_id,
                                    charge_meter_id,
                                    discharge_meter_id,
                                    capacity,
                                    nominal_voltage))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgridbatteries/' + str(new_id)


class MicrogridBatteryItem:
    @staticmethod
    def __init__():
        """Initializes MicrogridBatteryItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_BATTERY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # query microgrid dict
        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrids ")
        cursor.execute(query)
        rows_microgrids = cursor.fetchall()

        microgrid_dict = dict()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                microgrid_dict[row[0]] = {"id": row[0],
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

        query = (" SELECT id, name, uuid, microgrid_id, "
                 "       battery_state_point_id, soc_point_id, power_point_id, "
                 "       charge_meter_id, discharge_meter_id, capacity, nominal_voltage "
                 " FROM tbl_microgrids_batteries "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_BATTERY_NOT_FOUND')
        else:
            microgrid = microgrid_dict.get(row[3])
            battery_state_point = point_dict.get(row[4])
            soc_point = point_dict.get(row[5])
            power_point = point_dict.get(row[6])
            charge_meter = meter_dict.get(row[7])
            discharge_meter = meter_dict.get(row[8])
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "microgrid": microgrid,
                           "battery_state_point": battery_state_point,
                           "soc_point": soc_point,
                           "power_point": power_point,
                           "charge_meter": charge_meter,
                           "discharge_meter": discharge_meter,
                           "capacity": row[9],
                           "nominal_voltage": row[10]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_BATTERY_ID')
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_batteries "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_BATTERY_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_batteries "
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
                                   description='API.INVALID_MICROGRID_BATTERY_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_BATTERY_NAME')
        name = str.strip(new_values['data']['name'])

        if 'microgrid_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['microgrid_id'], int) or \
                new_values['data']['microgrid_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        microgrid_id = new_values['data']['microgrid_id']

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

        if 'capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['capacity'], float) or
                     isinstance(new_values['data']['capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CAPACITY')
        capacity = float(new_values['data']['capacity'])

        if 'nominal_voltage' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['nominal_voltage'], float) or
                     isinstance(new_values['data']['nominal_voltage'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NOMINAL_VOLTAGE')
        nominal_voltage = float(new_values['data']['nominal_voltage'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ",
                       (microgrid_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_batteries "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_BATTERY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_batteries "
                       " WHERE microgrid_id = %s AND name = %s AND id != %s ",
                       (microgrid_id, name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_BATTERY_NAME_IS_ALREADY_IN_USE')

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

        update_row = (" UPDATE tbl_microgrids_batteries "
                      " SET name = %s, microgrid_id = %s, "
                      "     battery_state_point_id = %s, soc_point_id = %s, power_point_id = %s, "
                      "     charge_meter_id = %s, discharge_meter_id = %s, capacity = %s, nominal_voltage = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    microgrid_id,
                                    battery_state_point_id,
                                    soc_point_id,
                                    power_point_id,
                                    charge_meter_id,
                                    discharge_meter_id,
                                    capacity,
                                    nominal_voltage,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200
