import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import re
import config


class ControlModeCollection:
    """
    Control Mode Collection Resource

    This class handles CRUD operations for control mode collection.
    It provides endpoints for listing all control modes and creating new control modes.
    Control modes define power control strategies for energy management systems.
    """
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, is_active "
                 " FROM tbl_control_modes "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2], "is_active": bool(row[3]), 'times': list()}

                query = (" SELECT start_time_of_day, end_time_of_day, power_value "
                         " FROM tbl_control_modes_times "
                         " WHERE control_mode_id = %s  "
                         " ORDER BY id")
                cursor.execute(query, (meta_result['id'],))
                rows_times = cursor.fetchall()
                if rows_times is not None and len(rows_times) > 0:
                    for row_time in rows_times:
                        start_time_of_day = str(row_time[0])
                        parts = start_time_of_day.split(':')
                        hour = parts[0].zfill(2)
                        minute = parts[1].zfill(2) if len(parts) > 1 else '00'
                        second = parts[2].zfill(2) if len(parts) > 2 else '00'
                        start_time_of_day = f"{hour}:{minute}:{second}"

                        end_time_of_day = str(row_time[1])
                        parts = end_time_of_day.split(':')
                        hour = parts[0].zfill(2)
                        minute = parts[1].zfill(2) if len(parts) > 1 else '00'
                        second = parts[2].zfill(2) if len(parts) > 2 else '00'
                        end_time_of_day = f"{hour}:{minute}:{second}"

                        meta_data = {"start_time_of_day": start_time_of_day,
                                     "end_time_of_day": end_time_of_day,
                                     "power_value": row_time[2]}
                        meta_result['times'].append(meta_data)
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
                                   description='API.INVALID_CONTROL_MODE_NAME')
        name = str.strip(new_values['data']['name'])

        if 'is_active' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_active'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ACTIVE_VALUE')
        is_active = new_values['data']['is_active']

        if new_values['data']['times'] is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_TIMES')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_control_modes "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.CONTROL_MODE_NAME_IS_ALREADY_IN_USE')

        add_row = (" INSERT INTO tbl_control_modes "
                   "             (name, uuid, is_active ) "
                   " VALUES (%s, %s, %s) ")
        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 is_active))
        new_id = cursor.lastrowid
        cnx.commit()
        for item in new_values['data']['times']:
            add_time = (" INSERT INTO tbl_control_modes_times "
                        "             (control_mode_id, start_time_of_day, end_time_of_day, power_value) "
                        " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_time, (new_id,
                                      item['start_time_of_day'],
                                      item['end_time_of_day'],
                                      item['power_value']))
            cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/controlmodes/' + str(new_id)


class ControlModeItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, is_active "
                 " FROM tbl_control_modes "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_NOT_FOUND')

        result = {"id": row[0], "name": row[1], "uuid": row[2], "is_active": bool(row[3]), 'times': list()}

        query = (" SELECT start_time_of_day, end_time_of_day, power_value "
                 " FROM tbl_control_modes_times "
                 " WHERE control_mode_id = %s  "
                 " ORDER BY id ")
        cursor.execute(query, (result['id'],))
        rows_times = cursor.fetchall()
        if rows_times is not None and len(rows_times) > 0:
            for row_time in rows_times:
                start_time_of_day = str(row_time[0])
                parts = start_time_of_day.split(':')
                hour = parts[0].zfill(2)
                minute = parts[1].zfill(2) if len(parts) > 1 else '00'
                second = parts[2].zfill(2) if len(parts) > 2 else '00'
                start_time_of_day = f"{hour}:{minute}:{second}"

                end_time_of_day = str(row_time[1])
                parts = end_time_of_day.split(':')
                hour = parts[0].zfill(2)
                minute = parts[1].zfill(2) if len(parts) > 1 else '00'
                second = parts[2].zfill(2) if len(parts) > 2 else '00'
                end_time_of_day = f"{hour}:{minute}:{second}"

                meta_data = {"start_time_of_day": start_time_of_day,
                             "end_time_of_day": end_time_of_day,
                             "power_value": row_time[2]}
                result['times'].append(meta_data)

        cursor.close()
        cnx.close()

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_control_modes "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_control_modes_times WHERE control_mode_id = %s ", (id_,))
        cnx.commit()

        cursor.execute(" DELETE FROM tbl_control_modes WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_CONTROL_MODE_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_NAME')
        name = str.strip(new_values['data']['name'])

        if 'is_active' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_active'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ACTIVE_VALUE')
        is_active = new_values['data']['is_active']

        if 'times' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['times'], list) or \
                len(new_values['data']['times']) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_TIMES')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # check if the control mode exists
        query = (" SELECT name "
                 " FROM tbl_control_modes "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        cursor.fetchone()

        if cursor.rowcount != 1:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_control_modes "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.CONTROL_MODE_NAME_IS_ALREADY_IN_USE')

        # update control mode
        update_row = (" UPDATE tbl_control_modes "
                      " SET name = %s, is_active = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    is_active,
                                    id_,))
        cnx.commit()

        # remove all (possible) exist times
        cursor.execute(" DELETE FROM tbl_control_modes_times "
                       " WHERE control_mode_id = %s ",
                       (id_,))
        cnx.commit()

        for item in new_values['data']['times']:
            add_time = (" INSERT INTO tbl_control_modes_times "
                        "             (control_mode_id, start_time_of_day, end_time_of_day, power_value) "
                        " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_time, (id_,
                                      item['start_time_of_day'],
                                      item['end_time_of_day'],
                                      item['power_value']))
            cnx.commit()
        cursor.close()
        cnx.close()
        resp.status = falcon.HTTP_200


class ControlModeExport:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, is_active "
                 " FROM tbl_control_modes "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_NOT_FOUND')

        result = {"id": row[0], "name": row[1], "uuid": row[2], "is_active": bool(row[3]), 'times': list()}

        query = (" SELECT start_time_of_day, end_time_of_day, power_value "
                 " FROM tbl_control_modes_times "
                 " WHERE control_mode_id = %s  "
                 " ORDER BY id")
        cursor.execute(query, (result['id'],))
        rows_times = cursor.fetchall()
        if rows_times is not None and len(rows_times) > 0:
            for row_time in rows_times:
                start_time_of_day = str(row_time[0])
                parts = start_time_of_day.split(':')
                hour = parts[0].zfill(2)
                minute = parts[1].zfill(2) if len(parts) > 1 else '00'
                second = parts[2].zfill(2) if len(parts) > 2 else '00'
                start_time_of_day = f"{hour}:{minute}:{second}"

                end_time_of_day = str(row_time[1])
                parts = end_time_of_day.split(':')
                hour = parts[0].zfill(2)
                minute = parts[1].zfill(2) if len(parts) > 1 else '00'
                second = parts[2].zfill(2) if len(parts) > 2 else '00'
                end_time_of_day = f"{hour}:{minute}:{second}"

                meta_data = {"start_time_of_day": start_time_of_day,
                             "end_time_of_day": end_time_of_day,
                             "power_value": row_time[2]}
                result['times'].append(meta_data)

        cursor.close()
        cnx.close()

        resp.text = json.dumps(result)


class ControlModeImport:
    def __init__(self):
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
                                   description='API.INVALID_METER_NAME')
        name = str.strip(new_values['name'])

        if 'is_active' not in new_values.keys() or \
                not isinstance(new_values['is_active'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ACTIVE_VALUE')
        is_active = new_values['is_active']

        if 'times' not in new_values.keys() or \
                not isinstance(new_values['times'], list) or \
                len(new_values['times']) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_TIMES')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_control_modes "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.CONTROL_MODE_NAME_IS_ALREADY_IN_USE')

        add_row = (" INSERT INTO tbl_control_modes "
                   "             (name, uuid, is_active ) "
                   " VALUES (%s, %s, %s) ")
        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 is_active,))
        new_id = cursor.lastrowid
        cnx.commit()

        for item in new_values['times']:
            add_time = (" INSERT INTO tbl_control_modes_times "
                        "             (control_mode_id, start_time_of_day, end_time_of_day, power_value) "
                        " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_time, (new_id,
                                      item['start_time_of_day'],
                                      item['end_time_of_day'],
                                      item['power_value']))
            cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/controlmodes/' + str(new_id)


class ControlModeClone:
    def __init__(self):
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
                                   description='API.INVALID_CONTROL_MODE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, is_active "
                 " FROM tbl_control_modes "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_NOT_FOUND')

        result = {"id": row[0], "name": row[1], "uuid": row[2], "is_active": bool(row[3]), 'times': list()}

        query = (" SELECT start_time_of_day, end_time_of_day, power_value "
                 " FROM tbl_control_modes_times "
                 " WHERE control_mode_id = %s  "
                 " ORDER BY id")
        cursor.execute(query, (result['id'],))
        rows_times = cursor.fetchall()
        if rows_times is not None and len(rows_times) > 0:
            for row_time in rows_times:
                start_time_of_day = str(row_time[0])
                parts = start_time_of_day.split(':')
                hour = parts[0].zfill(2)
                minute = parts[1].zfill(2) if len(parts) > 1 else '00'
                second = parts[2].zfill(2) if len(parts) > 2 else '00'
                start_time_of_day = f"{hour}:{minute}:{second}"

                end_time_of_day = str(row_time[1])
                parts = end_time_of_day.split(':')
                hour = parts[0].zfill(2)
                minute = parts[1].zfill(2) if len(parts) > 1 else '00'
                second = parts[2].zfill(2) if len(parts) > 2 else '00'
                end_time_of_day = f"{hour}:{minute}:{second}"

                meta_data = {"start_time_of_day": start_time_of_day,
                             "end_time_of_day": end_time_of_day,
                             "power_value": row_time[2]}
                result['times'].append(meta_data)

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        new_name = (str.strip(result['name']) +
                    (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
        add_row = (" INSERT INTO tbl_control_modes "
                   "             (name, uuid, is_active) "
                   " VALUES (%s, %s, %s) ")
        cursor.execute(add_row, (new_name,
                                 str(uuid.uuid4()),
                                 result['is_active']))
        new_id = cursor.lastrowid
        cnx.commit()
        for item in result['times']:
            add_time = (" INSERT INTO tbl_control_modes_times "
                        "             (control_mode_id, start_time_of_day, end_time_of_day, power_value) "
                        " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_time, (new_id,
                                      item['start_time_of_day'],
                                      item['end_time_of_day'],
                                      item['power_value']))
            cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/controlmodes/' + str(new_id)


class ControlModeTimeCollection:
    def __init__(self):
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
                                   description='API.INVALID_CONTROL_MODE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        cursor.execute(" SELECT name "
                       " FROM tbl_control_modes "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_NOT_FOUND')

        query = (" SELECT id, start_time_of_day, end_time_of_day, "
                 "        power_value, power_point_id, power_equation, description "
                 " FROM tbl_control_modes_times "
                 " WHERE control_mode_id = %s "
                 " ORDER BY id ")
        cursor.execute(query, (id_,))
        rows_times = cursor.fetchall()

        result = list()
        if rows_times is not None and len(rows_times) > 0:
            for row_time in rows_times:
                start_time_of_day = str(row_time[1])
                parts = start_time_of_day.split(':')
                hour = parts[0].zfill(2)
                minute = parts[1].zfill(2) if len(parts) > 1 else '00'
                second = parts[2].zfill(2) if len(parts) > 2 else '00'
                start_time_of_day = f"{hour}:{minute}:{second}"

                end_time_of_day = str(row_time[2])
                parts = end_time_of_day.split(':')
                hour = parts[0].zfill(2)
                minute = parts[1].zfill(2) if len(parts) > 1 else '00'
                second = parts[2].zfill(2) if len(parts) > 2 else '00'
                end_time_of_day = f"{hour}:{minute}:{second}"

                meta_result = {"id": row[0],
                               "start_time_of_day": start_time_of_day,
                               "end_time_of_day": end_time_of_day,
                               "power_value": row_time[3],
                               "power_point": point_dict.get(row_time[4], None),
                               "power_equation": row_time[5],
                               "description": row_time[6]}
                result.append(meta_result)
        print(result)
        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_ID')
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

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

        power_value = None
        if 'power_value' in new_values['data'].keys():
            if new_values['data']['power_value'] is not None and \
                    (isinstance(new_values['data']['power_value'], int) or
                     isinstance(new_values['data']['power_value'], float)):
                power_value = str.strip(new_values['data']['power_value'])

        power_point_id = None
        if 'power_point_id' in new_values['data'].keys():
            if new_values['data']['power_point_id'] is not None and \
                    new_values['data']['power_point_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_POWER_POINT_ID')
            power_point_id = new_values['data']['power_point_id']

        power_equation = None
        if 'power_equation' in new_values['data'].keys():
            if new_values['data']['power_equation'] is not None and \
                    isinstance(new_values['data']['power_equation'], str) and \
                    len(str.strip(new_values['data']['power_equation'])) > 0:
                power_equation = str.strip(new_values['data']['power_equation'])

        description = None
        if 'description' in new_values['data'].keys():
            if new_values['data']['description'] is not None and \
                    isinstance(new_values['data']['description'], str) and \
                    len(str.strip(new_values['data']['description'])) > 0:
                description = str.strip(new_values['data']['description'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT name "
                       " FROM tbl_control_modes "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_NOT_FOUND')

        add_values = (" INSERT INTO tbl_control_modes_times "
                      "    (control_mode_id, start_time_of_day, end_time_of_day, power_value, "
                      "     power_point_id, power_equation, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (id_,
                                    start_time_of_day,
                                    end_time_of_day,
                                    power_value,
                                    power_point_id,
                                    power_equation,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/controlmodes/' + str(id_) + 'times/' + str(new_id)


class ControlModeTimeItem:
    @staticmethod
    @user_logger
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_, tid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, tid):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_ID')

        if not tid.isdigit() or int(tid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_TIME_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name "
                 " FROM tbl_points ")
        cursor.execute(query)
        rows_points = cursor.fetchall()

        point_dict = dict()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_dict[row[0]] = {"id": row[0],
                                      "name": row[1]}

        query = (" SELECT id, control_mode_id, start_time_of_day, end_time_of_day, "
                 "        power_value, power_point_id, power_equation, description "
                 " FROM tbl_control_modes_times "
                 " WHERE control_mode_id = %s AND id = %s ")
        cursor.execute(query, (id_, tid))
        row_time = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row_time is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_TIME_NOT_FOUND_OR_NOT_MATCH')
        else:
            start_time_of_day = str(row_time[2])
            parts = start_time_of_day.split(':')
            hour = parts[0].zfill(2)
            minute = parts[1].zfill(2) if len(parts) > 1 else '00'
            second = parts[2].zfill(2) if len(parts) > 2 else '00'
            start_time_of_day = f"{hour}:{minute}:{second}"

            end_time_of_day = str(row_time[3])
            parts = end_time_of_day.split(':')
            hour = parts[0].zfill(2)
            minute = parts[1].zfill(2) if len(parts) > 1 else '00'
            second = parts[2].zfill(2) if len(parts) > 2 else '00'
            end_time_of_day = f"{hour}:{minute}:{second}"

            meta_result = {"id": row_time[0],
                           "control_mode_id": row_time[1],
                           "start_time_of_day": start_time_of_day,
                           "end_time_of_day": end_time_of_day,
                           "power_value": row_time[4],
                           "power_point": point_dict.get(row_time[5], None),
                           "power_equation": row_time[6],
                           "description": row_time[7]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, tid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_ID')

        if not tid.isdigit() or int(tid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_TIME_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_control_modes "
                       " WHERE id = %s ",
                       (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_control_modes_times "
                       " WHERE control_mode_id = %s AND id = %s ",
                       (id_, tid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_TIME_NOT_FOUND_OR_NOT_MATCH')

        cursor.execute(" DELETE FROM tbl_control_modes_times "
                       " WHERE id = %s ", (tid,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, tid):
        """Handles PUT requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_ID')

        if not tid.isdigit() or int(tid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTROL_MODE_TIME_ID')

        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

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

        power_value = None
        if 'power_value' in new_values['data'].keys():
            if new_values['data']['power_value'] is not None and \
                    (isinstance(new_values['data']['power_value'], int) or
                     isinstance(new_values['data']['power_value'], float)):
                power_value = str.strip(new_values['data']['power_value'])

        power_point_id = None
        if 'power_point_id' in new_values['data'].keys():
            if new_values['data']['power_point_id'] is not None and \
                    new_values['data']['power_point_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_POWER_POINT_ID')
            power_point_id = new_values['data']['power_point_id']

        power_equation = None
        if 'power_equation' in new_values['data'].keys():
            if new_values['data']['power_equation'] is not None and \
                    isinstance(new_values['data']['power_equation'], str) and \
                    len(str.strip(new_values['data']['power_equation'])) > 0:
                power_equation = str.strip(new_values['data']['power_equation'])

        description = None
        if 'description' in new_values['data'].keys():
            if new_values['data']['description'] is not None and \
                    isinstance(new_values['data']['description'], str) and \
                    len(str.strip(new_values['data']['description'])) > 0:
                description = str.strip(new_values['data']['description'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_control_modes "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_control_modes_times "
                       " WHERE control_mode_id = %s AND id = %s ",
                       (id_, tid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.CONTROL_MODE_TIME_NOT_FOUND_OR_NOT_MATCH')

        add_values = (" UPDATE tbl_control_modes_times "
                      " SET start_time_of_day = %s , end_time_of_day = %s, power_value = %s, "
                      "     power_point_id = %s, power_equation = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(add_values, (start_time_of_day,
                                    end_time_of_day,
                                    power_value,
                                    power_point_id,
                                    power_equation,
                                    description,
                                    tid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200
