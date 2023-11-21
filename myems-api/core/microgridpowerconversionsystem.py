import uuid
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control
import config


class MicrogridPowerconversionsystemCollection:
    @staticmethod
    def __init__():
        """Initializes MicrogridPowerconversionsystemCollection"""
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

        query = (" SELECT id, name, uuid, microgrid_id, run_state_point_id, capacity, "
                 "        charge_start_time1_point_id, charge_end_time1_point_id, "
                 "        charge_start_time2_point_id, charge_end_time2_point_id, "
                 "        charge_start_time3_point_id, charge_end_time3_point_id, "
                 "        charge_start_time4_point_id, charge_end_time4_point_id, "
                 "        discharge_start_time1_point_id, discharge_end_time1_point_id, "
                 "        discharge_start_time2_point_id, discharge_end_time2_point_id, "
                 "        discharge_start_time3_point_id, discharge_end_time3_point_id, "
                 "        discharge_start_time4_point_id, discharge_end_time4_point_id, "
                 "        charge_start_time1_command_id, charge_end_time1_command_id, "
                 "        charge_start_time2_command_id, charge_end_time2_command_id, "
                 "        charge_start_time3_command_id, charge_end_time3_command_id, "
                 "        charge_start_time4_command_id, charge_end_time4_command_id, "
                 "        discharge_start_time1_command_id, discharge_end_time1_command_id, "
                 "        discharge_start_time2_command_id, discharge_end_time2_command_id, "
                 "        discharge_start_time3_command_id, discharge_end_time3_command_id, "
                 "        discharge_start_time4_command_id, discharge_end_time4_command_id "
                 " FROM tbl_microgrids_power_conversion_systems "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_microgrid_power_conversion_systems = cursor.fetchall()

        result = list()
        if rows_microgrid_power_conversion_systems is not None and len(rows_microgrid_power_conversion_systems) > 0:
            for row in rows_microgrid_power_conversion_systems:
                microgrid = microgrid_dict.get(row[3])
                run_state_point = point_dict.get(row[4])
                charge_start_time1_point = point_dict.get(row[6])
                charge_end_time1_point = point_dict.get(row[7])
                charge_start_time2_point = point_dict.get(row[8])
                charge_end_time2_point = point_dict.get(row[9])
                charge_start_time3_point = point_dict.get(row[10])
                charge_end_time3_point = point_dict.get(row[11])
                charge_start_time4_point = point_dict.get(row[12])
                charge_end_time4_point = point_dict.get(row[13])
                discharge_start_time1_point = point_dict.get(row[14])
                discharge_end_time1_point = point_dict.get(row[15])
                discharge_start_time2_point = point_dict.get(row[16])
                discharge_end_time2_point = point_dict.get(row[17])
                discharge_start_time3_point = point_dict.get(row[18])
                discharge_end_time3_point = point_dict.get(row[19])
                discharge_start_time4_point = point_dict.get(row[20])
                discharge_end_time4_point = point_dict.get(row[21])
                charge_start_time1_command = command_dict.get(row[22])
                charge_end_time1_command = command_dict.get(row[23])
                charge_start_time2_command = command_dict.get(row[24])
                charge_end_time2_command = command_dict.get(row[25])
                charge_start_time3_command = command_dict.get(row[26])
                charge_end_time3_command = command_dict.get(row[27])
                charge_start_time4_command = command_dict.get(row[28])
                charge_end_time4_command = command_dict.get(row[29])
                discharge_start_time1_command = command_dict.get(row[30])
                discharge_end_time1_command = command_dict.get(row[31])
                discharge_start_time2_command = command_dict.get(row[32])
                discharge_end_time2_command = command_dict.get(row[33])
                discharge_start_time3_command = command_dict.get(row[34])
                discharge_end_time3_command = command_dict.get(row[35])
                discharge_start_time4_command = command_dict.get(row[36])
                discharge_end_time4_command = command_dict.get(row[37])
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "microgrid": microgrid,
                               "run_state_point": run_state_point,
                               "capacity": row[5],
                               "charge_start_time1_point": charge_start_time1_point,
                               "charge_end_time1_point": charge_end_time1_point,
                               "charge_start_time2_point": charge_start_time2_point,
                               "charge_end_time2_point": charge_end_time2_point,
                               "charge_start_time3_point": charge_start_time3_point,
                               "charge_end_time3_point": charge_end_time3_point,
                               "charge_start_time4_point": charge_start_time4_point,
                               "charge_end_time4_point": charge_end_time4_point,
                               "discharge_start_time1_point": discharge_start_time1_point,
                               "discharge_end_time1_point": discharge_end_time1_point,
                               "discharge_start_time2_point": discharge_start_time2_point,
                               "discharge_end_time2_point": discharge_end_time2_point,
                               "discharge_start_time3_point": discharge_start_time3_point,
                               "discharge_end_time3_point": discharge_end_time3_point,
                               "discharge_start_time4_point": discharge_start_time4_point,
                               "discharge_end_time4_point": discharge_end_time4_point,
                               "charge_start_time1_command": charge_start_time1_command,
                               "charge_end_time1_command": charge_end_time1_command,
                               "charge_start_time2_command": charge_start_time2_command,
                               "charge_end_time2_command": charge_end_time2_command,
                               "charge_start_time3_command": charge_start_time3_command,
                               "charge_end_time3_command": charge_end_time3_command,
                               "charge_start_time4_command": charge_start_time4_command,
                               "charge_end_time4_command": charge_end_time4_command,
                               "discharge_start_time1_command": discharge_start_time1_command,
                               "discharge_end_time1_command": discharge_end_time1_command,
                               "discharge_start_time2_command": discharge_start_time2_command,
                               "discharge_end_time2_command": discharge_end_time2_command,
                               "discharge_start_time3_command": discharge_start_time3_command,
                               "discharge_end_time3_command": discharge_end_time3_command,
                               "discharge_start_time4_command": discharge_start_time4_command,
                               "discharge_end_time4_command": discharge_end_time4_command
                               }
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
                                   description='API.INVALID_MICROGRID_POWER_CONVERSION_SYSTEM_NAME')
        name = str.strip(new_values['data']['name'])

        if 'microgrid_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['microgrid_id'], int) or \
                new_values['data']['microgrid_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        microgrid_id = new_values['data']['microgrid_id']

        if 'run_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['run_state_point_id'], int) or \
                new_values['data']['run_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RUN_STATE_POINT_ID')
        run_state_point_id = new_values['data']['run_state_point_id']

        if 'capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['capacity'], float) or
                     isinstance(new_values['data']['capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CAPACITY')
        capacity = float(new_values['data']['capacity'])

        if 'charge_start_time1_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time1_point_id'], int) or \
                new_values['data']['charge_start_time1_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME1_POINT_ID')
        charge_start_time1_point_id = new_values['data']['charge_start_time1_point_id']

        if 'charge_end_time1_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time1_point_id'], int) or \
                new_values['data']['charge_end_time1_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME1_POINT_ID')
        charge_end_time1_point_id = new_values['data']['charge_end_time1_point_id']

        if 'charge_start_time2_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time2_point_id'], int) or \
                new_values['data']['charge_start_time2_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME2_POINT_ID')
        charge_start_time2_point_id = new_values['data']['charge_start_time2_point_id']

        if 'charge_end_time2_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time2_point_id'], int) or \
                new_values['data']['charge_end_time2_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME2_POINT_ID')
        charge_end_time2_point_id = new_values['data']['charge_end_time2_point_id']

        if 'charge_start_time3_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time3_point_id'], int) or \
                new_values['data']['charge_start_time3_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME3_POINT_ID')
        charge_start_time3_point_id = new_values['data']['charge_start_time3_point_id']

        if 'charge_end_time3_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time3_point_id'], int) or \
                new_values['data']['charge_end_time3_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME3_POINT_ID')
        charge_end_time3_point_id = new_values['data']['charge_end_time3_point_id']

        if 'charge_start_time4_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time4_point_id'], int) or \
                new_values['data']['charge_start_time4_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME4_POINT_ID')
        charge_start_time4_point_id = new_values['data']['charge_start_time4_point_id']

        if 'charge_end_time4_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time4_point_id'], int) or \
                new_values['data']['charge_end_time4_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME4_POINT_ID')
        charge_end_time4_point_id = new_values['data']['charge_end_time4_point_id']

        if 'discharge_start_time1_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time1_point_id'], int) or \
                new_values['data']['discharge_start_time1_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME1_POINT_ID')
        discharge_start_time1_point_id = new_values['data']['discharge_start_time1_point_id']

        if 'discharge_end_time1_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time1_point_id'], int) or \
                new_values['data']['discharge_end_time1_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME1_POINT_ID')
        discharge_end_time1_point_id = new_values['data']['discharge_end_time1_point_id']

        if 'discharge_start_time2_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time2_point_id'], int) or \
                new_values['data']['discharge_start_time2_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME2_POINT_ID')
        discharge_start_time2_point_id = new_values['data']['discharge_start_time2_point_id']

        if 'discharge_end_time2_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time2_point_id'], int) or \
                new_values['data']['discharge_end_time2_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME2_POINT_ID')
        discharge_end_time2_point_id = new_values['data']['discharge_end_time2_point_id']

        if 'discharge_start_time3_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time3_point_id'], int) or \
                new_values['data']['discharge_start_time3_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME3_POINT_ID')
        discharge_start_time3_point_id = new_values['data']['discharge_start_time3_point_id']

        if 'discharge_end_time3_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time3_point_id'], int) or \
                new_values['data']['discharge_end_time3_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME3_POINT_ID')
        discharge_end_time3_point_id = new_values['data']['discharge_end_time3_point_id']

        if 'discharge_start_time4_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time4_point_id'], int) or \
                new_values['data']['discharge_start_time4_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME4_POINT_ID')
        discharge_start_time4_point_id = new_values['data']['discharge_start_time4_point_id']

        if 'discharge_end_time4_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time4_point_id'], int) or \
                new_values['data']['discharge_end_time4_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME4_POINT_ID')
        discharge_end_time4_point_id = new_values['data']['discharge_end_time4_point_id']

        if 'charge_start_time1_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time1_command_id'], int) or \
                new_values['data']['charge_start_time1_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME1_POINT_ID')
        charge_start_time1_command_id = new_values['data']['charge_start_time1_command_id']

        if 'charge_end_time1_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time1_command_id'], int) or \
                new_values['data']['charge_end_time1_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME1_POINT_ID')
        charge_end_time1_command_id = new_values['data']['charge_end_time1_command_id']

        if 'charge_start_time2_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time2_command_id'], int) or \
                new_values['data']['charge_start_time2_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME2_POINT_ID')
        charge_start_time2_command_id = new_values['data']['charge_start_time2_command_id']

        if 'charge_end_time2_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time2_command_id'], int) or \
                new_values['data']['charge_end_time2_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME2_POINT_ID')
        charge_end_time2_command_id = new_values['data']['charge_end_time2_command_id']

        if 'charge_start_time3_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time3_command_id'], int) or \
                new_values['data']['charge_start_time3_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME3_POINT_ID')
        charge_start_time3_command_id = new_values['data']['charge_start_time3_command_id']

        if 'charge_end_time3_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time3_command_id'], int) or \
                new_values['data']['charge_end_time3_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME3_POINT_ID')
        charge_end_time3_command_id = new_values['data']['charge_end_time3_command_id']

        if 'charge_start_time4_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time4_command_id'], int) or \
                new_values['data']['charge_start_time4_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME4_POINT_ID')
        charge_start_time4_command_id = new_values['data']['charge_start_time4_command_id']

        if 'charge_end_time4_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time4_command_id'], int) or \
                new_values['data']['charge_end_time4_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME4_POINT_ID')
        charge_end_time4_command_id = new_values['data']['charge_end_time4_command_id']

        if 'discharge_start_time1_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time1_command_id'], int) or \
                new_values['data']['discharge_start_time1_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME1_POINT_ID')
        discharge_start_time1_command_id = new_values['data']['discharge_start_time1_command_id']

        if 'discharge_end_time1_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time1_command_id'], int) or \
                new_values['data']['discharge_end_time1_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME1_POINT_ID')
        discharge_end_time1_command_id = new_values['data']['discharge_end_time1_command_id']

        if 'discharge_start_time2_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time2_command_id'], int) or \
                new_values['data']['discharge_start_time2_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME2_POINT_ID')
        discharge_start_time2_command_id = new_values['data']['discharge_start_time2_command_id']

        if 'discharge_end_time2_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time2_command_id'], int) or \
                new_values['data']['discharge_end_time2_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME2_POINT_ID')
        discharge_end_time2_command_id = new_values['data']['discharge_end_time2_command_id']

        if 'discharge_start_time3_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time3_command_id'], int) or \
                new_values['data']['discharge_start_time3_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME3_POINT_ID')
        discharge_start_time3_command_id = new_values['data']['discharge_start_time3_command_id']

        if 'discharge_end_time3_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time3_command_id'], int) or \
                new_values['data']['discharge_end_time3_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME3_POINT_ID')
        discharge_end_time3_command_id = new_values['data']['discharge_end_time3_command_id']

        if 'discharge_start_time4_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time4_command_id'], int) or \
                new_values['data']['discharge_start_time4_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME4_POINT_ID')
        discharge_start_time4_command_id = new_values['data']['discharge_start_time4_command_id']

        if 'discharge_end_time4_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time4_command_id'], int) or \
                new_values['data']['discharge_end_time4_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME4_POINT_ID')
        discharge_end_time4_command_id = new_values['data']['discharge_end_time4_command_id']

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
                       " FROM tbl_microgrids_power_conversion_systems "
                       " WHERE microgrid_id = %s AND name = %s ",
                       (microgrid_id, name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_microgrids_power_conversion_systems "
                      "     (name, uuid, microgrid_id, run_state_point_id, capacity, "
                      "      charge_start_time1_point_id, charge_end_time1_point_id, "
                      "      charge_start_time2_point_id, charge_end_time2_point_id, "
                      "      charge_start_time3_point_id, charge_end_time3_point_id, "
                      "      charge_start_time4_point_id, charge_end_time4_point_id, "
                      "      discharge_start_time1_point_id, discharge_end_time1_point_id, "
                      "      discharge_start_time2_point_id, discharge_end_time2_point_id, "
                      "      discharge_start_time3_point_id, discharge_end_time3_point_id, "
                      "      discharge_start_time4_point_id, discharge_end_time4_point_id, "
                      "      charge_start_time1_command_id, charge_end_time1_command_id, "
                      "      charge_start_time2_command_id, charge_end_time2_command_id, "
                      "      charge_start_time3_command_id, charge_end_time3_command_id, "
                      "      charge_start_time4_command_id, charge_end_time4_command_id, "
                      "      discharge_start_time1_command_id, discharge_end_time1_command_id, "
                      "      discharge_start_time2_command_id, discharge_end_time2_command_id, "
                      "      discharge_start_time3_command_id, discharge_end_time3_command_id, "
                      "      discharge_start_time4_command_id, discharge_end_time4_command_id) "
                      " VALUES (%s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, "
                      "         %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    microgrid_id,
                                    run_state_point_id,
                                    capacity,
                                    charge_start_time1_point_id,
                                    charge_end_time1_point_id,
                                    charge_start_time2_point_id,
                                    charge_end_time2_point_id,
                                    charge_start_time3_point_id,
                                    charge_end_time3_point_id,
                                    charge_start_time4_point_id,
                                    charge_end_time4_point_id,
                                    discharge_start_time1_point_id,
                                    discharge_end_time1_point_id,
                                    discharge_start_time2_point_id,
                                    discharge_end_time2_point_id,
                                    discharge_start_time3_point_id,
                                    discharge_end_time3_point_id,
                                    discharge_start_time4_point_id,
                                    discharge_end_time4_point_id,
                                    charge_start_time1_command_id,
                                    charge_end_time1_command_id,
                                    charge_start_time2_command_id,
                                    charge_end_time2_command_id,
                                    charge_start_time3_command_id,
                                    charge_end_time3_command_id,
                                    charge_start_time4_command_id,
                                    charge_end_time4_command_id,
                                    discharge_start_time1_command_id,
                                    discharge_end_time1_command_id,
                                    discharge_start_time2_command_id,
                                    discharge_end_time2_command_id,
                                    discharge_start_time3_command_id,
                                    discharge_end_time3_command_id,
                                    discharge_start_time4_command_id,
                                    discharge_end_time4_command_id
                                    ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/microgridpowerconversionsystems/' + str(new_id)


class MicrogridPowerconversionsystemItem:
    @staticmethod
    def __init__():
        """Initializes MicrogridPowerconversionsystemItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_POWER_CONVERSION_SYSTEM_ID')

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

        query = (" SELECT id, name, uuid, microgrid_id, run_state_point_id, capacity, "
                 "        charge_start_time1_point_id, charge_end_time1_point_id, "
                 "        charge_start_time2_point_id, charge_end_time2_point_id, "
                 "        charge_start_time3_point_id, charge_end_time3_point_id, "
                 "        charge_start_time4_point_id, charge_end_time4_point_id, "
                 "        discharge_start_time1_point_id, discharge_end_time1_point_id, "
                 "        discharge_start_time2_point_id, discharge_end_time2_point_id, "
                 "        discharge_start_time3_point_id, discharge_end_time3_point_id, "
                 "        discharge_start_time4_point_id, discharge_end_time4_point_id, "
                 "        charge_start_time1_command_id, charge_end_time1_command_id, "
                 "        charge_start_time2_command_id, charge_end_time2_command_id, "
                 "        charge_start_time3_command_id, charge_end_time3_command_id, "
                 "        charge_start_time4_command_id, charge_end_time4_command_id, "
                 "        discharge_start_time1_command_id, discharge_end_time1_command_id, "
                 "        discharge_start_time2_command_id, discharge_end_time2_command_id, "
                 "        discharge_start_time3_command_id, discharge_end_time3_command_id, "
                 "        discharge_start_time4_command_id, discharge_end_time4_command_id "
                 " FROM tbl_microgrids_power_conversion_systems "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NOT_FOUND')
        else:
            microgrid = microgrid_dict.get(row[3])
            run_state_point = point_dict.get(row[4])
            charge_start_time1_point = point_dict.get(row[6])
            charge_end_time1_point = point_dict.get(row[7])
            charge_start_time2_point = point_dict.get(row[8])
            charge_end_time2_point = point_dict.get(row[9])
            charge_start_time3_point = point_dict.get(row[10])
            charge_end_time3_point = point_dict.get(row[11])
            charge_start_time4_point = point_dict.get(row[12])
            charge_end_time4_point = point_dict.get(row[13])
            discharge_start_time1_point = point_dict.get(row[14])
            discharge_end_time1_point = point_dict.get(row[15])
            discharge_start_time2_point = point_dict.get(row[16])
            discharge_end_time2_point = point_dict.get(row[17])
            discharge_start_time3_point = point_dict.get(row[18])
            discharge_end_time3_point = point_dict.get(row[19])
            discharge_start_time4_point = point_dict.get(row[20])
            discharge_end_time4_point = point_dict.get(row[21])
            charge_start_time1_command = command_dict.get(row[22])
            charge_end_time1_command = command_dict.get(row[23])
            charge_start_time2_command = command_dict.get(row[24])
            charge_end_time2_command = command_dict.get(row[25])
            charge_start_time3_command = command_dict.get(row[26])
            charge_end_time3_command = command_dict.get(row[27])
            charge_start_time4_command = command_dict.get(row[28])
            charge_end_time4_command = command_dict.get(row[29])
            discharge_start_time1_command = command_dict.get(row[30])
            discharge_end_time1_command = command_dict.get(row[31])
            discharge_start_time2_command = command_dict.get(row[32])
            discharge_end_time2_command = command_dict.get(row[33])
            discharge_start_time3_command = command_dict.get(row[34])
            discharge_end_time3_command = command_dict.get(row[35])
            discharge_start_time4_command = command_dict.get(row[36])
            discharge_end_time4_command = command_dict.get(row[37])
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "microgrid": microgrid,
                           "run_state_point": run_state_point,
                           "capacity": row[5],
                           "charge_start_time1_point": charge_start_time1_point,
                           "charge_end_time1_point": charge_end_time1_point,
                           "charge_start_time2_point": charge_start_time2_point,
                           "charge_end_time2_point": charge_end_time2_point,
                           "charge_start_time3_point": charge_start_time3_point,
                           "charge_end_time3_point": charge_end_time3_point,
                           "charge_start_time4_point": charge_start_time4_point,
                           "charge_end_time4_point": charge_end_time4_point,
                           "discharge_start_time1_point": discharge_start_time1_point,
                           "discharge_end_time1_point": discharge_end_time1_point,
                           "discharge_start_time2_point": discharge_start_time2_point,
                           "discharge_end_time2_point": discharge_end_time2_point,
                           "discharge_start_time3_point": discharge_start_time3_point,
                           "discharge_end_time3_point": discharge_end_time3_point,
                           "discharge_start_time4_point": discharge_start_time4_point,
                           "discharge_end_time4_point": discharge_end_time4_point,
                           "charge_start_time1_command": charge_start_time1_command,
                           "charge_end_time1_command": charge_end_time1_command,
                           "charge_start_time2_command": charge_start_time2_command,
                           "charge_end_time2_command": charge_end_time2_command,
                           "charge_start_time3_command": charge_start_time3_command,
                           "charge_end_time3_command": charge_end_time3_command,
                           "charge_start_time4_command": charge_start_time4_command,
                           "charge_end_time4_command": charge_end_time4_command,
                           "discharge_start_time1_command": discharge_start_time1_command,
                           "discharge_end_time1_command": discharge_end_time1_command,
                           "discharge_start_time2_command": discharge_start_time2_command,
                           "discharge_end_time2_command": discharge_end_time2_command,
                           "discharge_start_time3_command": discharge_start_time3_command,
                           "discharge_end_time3_command": discharge_end_time3_command,
                           "discharge_start_time4_command": discharge_start_time4_command,
                           "discharge_end_time4_command": discharge_end_time4_command}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_POWER_CONVERSION_SYSTEM_ID')
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_power_conversion_systems "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_microgrids_power_conversion_systems "
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
                                   description='API.INVALID_MICROGRID_POWER_CONVERSION_SYSTEM_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_POWER_CONVERSION_SYSTEM_NAME')
        name = str.strip(new_values['data']['name'])

        if 'microgrid_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['microgrid_id'], int) or \
                new_values['data']['microgrid_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        microgrid_id = new_values['data']['microgrid_id']

        if 'run_state_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['run_state_point_id'], int) or \
                new_values['data']['run_state_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_RUN_STATE_POINT_ID')
        run_state_point_id = new_values['data']['run_state_point_id']

        if 'capacity' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['capacity'], float) or
                     isinstance(new_values['data']['capacity'], int)):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CAPACITY')
        capacity = float(new_values['data']['capacity'])

        if 'charge_start_time1_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time1_point_id'], int) or \
                new_values['data']['charge_start_time1_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME1_COMMAND_ID')
        charge_start_time1_point_id = new_values['data']['charge_start_time1_point_id']

        if 'charge_end_time1_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time1_point_id'], int) or \
                new_values['data']['charge_end_time1_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME1_COMMAND_ID')
        charge_end_time1_point_id = new_values['data']['charge_end_time1_point_id']

        if 'charge_start_time2_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time2_point_id'], int) or \
                new_values['data']['charge_start_time2_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME2_COMMAND_ID')
        charge_start_time2_point_id = new_values['data']['charge_start_time2_point_id']

        if 'charge_end_time2_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time2_point_id'], int) or \
                new_values['data']['charge_end_time2_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME2_COMMAND_ID')
        charge_end_time2_point_id = new_values['data']['charge_end_time2_point_id']

        if 'charge_start_time3_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time3_point_id'], int) or \
                new_values['data']['charge_start_time3_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME3_COMMAND_ID')
        charge_start_time3_point_id = new_values['data']['charge_start_time3_point_id']

        if 'charge_end_time3_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time3_point_id'], int) or \
                new_values['data']['charge_end_time3_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME3_COMMAND_ID')
        charge_end_time3_point_id = new_values['data']['charge_end_time3_point_id']

        if 'charge_start_time4_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time4_point_id'], int) or \
                new_values['data']['charge_start_time4_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME4_COMMAND_ID')
        charge_start_time4_point_id = new_values['data']['charge_start_time4_point_id']

        if 'charge_end_time4_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time4_point_id'], int) or \
                new_values['data']['charge_end_time4_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME4_COMMAND_ID')
        charge_end_time4_point_id = new_values['data']['charge_end_time4_point_id']

        if 'discharge_start_time1_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time1_point_id'], int) or \
                new_values['data']['discharge_start_time1_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME1_COMMAND_ID')
        discharge_start_time1_point_id = new_values['data']['discharge_start_time1_point_id']

        if 'discharge_end_time1_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time1_point_id'], int) or \
                new_values['data']['discharge_end_time1_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME1_COMMAND_ID')
        discharge_end_time1_point_id = new_values['data']['discharge_end_time1_point_id']

        if 'discharge_start_time2_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time2_point_id'], int) or \
                new_values['data']['discharge_start_time2_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME2_COMMAND_ID')
        discharge_start_time2_point_id = new_values['data']['discharge_start_time2_point_id']

        if 'discharge_end_time2_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time2_point_id'], int) or \
                new_values['data']['discharge_end_time2_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME2_COMMAND_ID')
        discharge_end_time2_point_id = new_values['data']['discharge_end_time2_point_id']

        if 'discharge_start_time3_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time3_point_id'], int) or \
                new_values['data']['discharge_start_time3_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME3_COMMAND_ID')
        discharge_start_time3_point_id = new_values['data']['discharge_start_time3_point_id']

        if 'discharge_end_time3_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time3_point_id'], int) or \
                new_values['data']['discharge_end_time3_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME3_COMMAND_ID')
        discharge_end_time3_point_id = new_values['data']['discharge_end_time3_point_id']

        if 'discharge_start_time4_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time4_point_id'], int) or \
                new_values['data']['discharge_start_time4_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME4_COMMAND_ID')
        discharge_start_time4_point_id = new_values['data']['discharge_start_time4_point_id']

        if 'discharge_end_time4_point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time4_point_id'], int) or \
                new_values['data']['discharge_end_time4_point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME4_COMMAND_ID')
        discharge_end_time4_point_id = new_values['data']['discharge_end_time4_point_id']

        if 'charge_start_time1_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time1_command_id'], int) or \
                new_values['data']['charge_start_time1_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME1_POINT_ID')
        charge_start_time1_command_id = new_values['data']['charge_start_time1_command_id']

        if 'charge_end_time1_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time1_command_id'], int) or \
                new_values['data']['charge_end_time1_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME1_POINT_ID')
        charge_end_time1_command_id = new_values['data']['charge_end_time1_command_id']

        if 'charge_start_time2_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time2_command_id'], int) or \
                new_values['data']['charge_start_time2_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME2_POINT_ID')
        charge_start_time2_command_id = new_values['data']['charge_start_time2_command_id']

        if 'charge_end_time2_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time2_command_id'], int) or \
                new_values['data']['charge_end_time2_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME2_POINT_ID')
        charge_end_time2_command_id = new_values['data']['charge_end_time2_command_id']

        if 'charge_start_time3_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time3_command_id'], int) or \
                new_values['data']['charge_start_time3_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME3_POINT_ID')
        charge_start_time3_command_id = new_values['data']['charge_start_time3_command_id']

        if 'charge_end_time3_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time3_command_id'], int) or \
                new_values['data']['charge_end_time3_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME3_POINT_ID')
        charge_end_time3_command_id = new_values['data']['charge_end_time3_command_id']

        if 'charge_start_time4_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_start_time4_command_id'], int) or \
                new_values['data']['charge_start_time4_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_START_TIME4_POINT_ID')
        charge_start_time4_command_id = new_values['data']['charge_start_time4_command_id']

        if 'charge_end_time4_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['charge_end_time4_command_id'], int) or \
                new_values['data']['charge_end_time4_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CHARGE_END_TIME4_POINT_ID')
        charge_end_time4_command_id = new_values['data']['charge_end_time4_command_id']

        if 'discharge_start_time1_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time1_command_id'], int) or \
                new_values['data']['discharge_start_time1_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME1_POINT_ID')
        discharge_start_time1_command_id = new_values['data']['discharge_start_time1_command_id']

        if 'discharge_end_time1_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time1_command_id'], int) or \
                new_values['data']['discharge_end_time1_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME1_POINT_ID')
        discharge_end_time1_command_id = new_values['data']['discharge_end_time1_command_id']

        if 'discharge_start_time2_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time2_command_id'], int) or \
                new_values['data']['discharge_start_time2_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME2_POINT_ID')
        discharge_start_time2_command_id = new_values['data']['discharge_start_time2_command_id']

        if 'discharge_end_time2_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time2_command_id'], int) or \
                new_values['data']['discharge_end_time2_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME2_POINT_ID')
        discharge_end_time2_command_id = new_values['data']['discharge_end_time2_command_id']

        if 'discharge_start_time3_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time3_command_id'], int) or \
                new_values['data']['discharge_start_time3_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME3_POINT_ID')
        discharge_start_time3_command_id = new_values['data']['discharge_start_time3_command_id']

        if 'discharge_end_time3_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time3_command_id'], int) or \
                new_values['data']['discharge_end_time3_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME3_POINT_ID')
        discharge_end_time3_command_id = new_values['data']['discharge_end_time3_command_id']

        if 'discharge_start_time4_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_start_time4_command_id'], int) or \
                new_values['data']['discharge_start_time4_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_START_TIME4_POINT_ID')
        discharge_start_time4_command_id = new_values['data']['discharge_start_time4_command_id']

        if 'discharge_end_time4_command_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['discharge_end_time4_command_id'], int) or \
                new_values['data']['discharge_end_time4_command_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISCHARGE_END_TIME4_POINT_ID')
        discharge_end_time4_command_id = new_values['data']['discharge_end_time4_command_id']

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
                       " FROM tbl_microgrids_power_conversion_systems "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids_power_conversion_systems "
                       " WHERE microgrid_id = %s AND name = %s AND id != %s ",
                       (microgrid_id, name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.MICROGRID_POWER_CONVERSION_SYSTEM_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_microgrids_power_conversion_systems "
                      " SET name = %s, microgrid_id = %s, run_state_point_id = %s, capacity = %s, "
                      "     charge_start_time1_point_id = %s, charge_end_time1_point_id = %s, "
                      "     charge_start_time2_point_id = %s, charge_end_time2_point_id = %s, "
                      "     charge_start_time3_point_id = %s, charge_end_time3_point_id = %s, "
                      "     charge_start_time4_point_id = %s, charge_end_time4_point_id = %s, "
                      "     discharge_start_time1_point_id = %s, discharge_end_time1_point_id = %s, "
                      "     discharge_start_time2_point_id = %s, discharge_end_time2_point_id = %s, "
                      "     discharge_start_time3_point_id = %s, discharge_end_time3_point_id = %s, "
                      "     discharge_start_time4_point_id = %s, discharge_end_time4_point_id = %s, "
                      "     charge_start_time1_command_id = %s, charge_end_time1_command_id = %s, "
                      "     charge_start_time2_command_id = %s, charge_end_time2_command_id = %s, "
                      "     charge_start_time3_command_id = %s, charge_end_time3_command_id = %s, "
                      "     charge_start_time4_command_id = %s, charge_end_time4_command_id = %s, "
                      "     discharge_start_time1_command_id = %s, discharge_end_time1_command_id = %s, "
                      "     discharge_start_time2_command_id = %s, discharge_end_time2_command_id = %s, "
                      "     discharge_start_time3_command_id = %s, discharge_end_time3_command_id = %s, "
                      "     discharge_start_time4_command_id = %s, discharge_end_time4_command_id = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    microgrid_id,
                                    run_state_point_id,
                                    capacity,
                                    charge_start_time1_point_id,
                                    charge_end_time1_point_id,
                                    charge_start_time2_point_id,
                                    charge_end_time2_point_id,
                                    charge_start_time3_point_id,
                                    charge_end_time3_point_id,
                                    charge_start_time4_point_id,
                                    charge_end_time4_point_id,
                                    discharge_start_time1_point_id,
                                    discharge_end_time1_point_id,
                                    discharge_start_time2_point_id,
                                    discharge_end_time2_point_id,
                                    discharge_start_time3_point_id,
                                    discharge_end_time3_point_id,
                                    discharge_start_time4_point_id,
                                    discharge_end_time4_point_id,
                                    charge_start_time1_command_id,
                                    charge_end_time1_command_id,
                                    charge_start_time2_command_id,
                                    charge_end_time2_command_id,
                                    charge_start_time3_command_id,
                                    charge_end_time3_command_id,
                                    charge_start_time4_command_id,
                                    charge_end_time4_command_id,
                                    discharge_start_time1_command_id,
                                    discharge_end_time1_command_id,
                                    discharge_start_time2_command_id,
                                    discharge_end_time2_command_id,
                                    discharge_start_time3_command_id,
                                    discharge_end_time3_command_id,
                                    discharge_start_time4_command_id,
                                    discharge_end_time4_command_id,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200
