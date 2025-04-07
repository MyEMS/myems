import uuid
from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class ControlModeCollection:
    def __init__(self):
        """"Initializes"""
        pass

    @staticmethod
    def on_options(req, resp):
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
                        meta_data = {"start_time_of_day": str(row_time[0]),
                                     "end_time_of_day": str(row_time[1]),
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
        """"Initializes"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                meta_data = {"start_time_of_day": str(row_time[0]),
                             "end_time_of_day": str(row_time[1]),
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
        """"Initializes"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                meta_data = {"start_time_of_day": str(row_time[0]),
                             "end_time_of_day": str(row_time[1]),
                             "power_value": row_time[2]}
                result['times'].append(meta_data)

        cursor.close()
        cnx.close()

        resp.text = json.dumps(result)


class ControlModeImport:
    def __init__(self):
        """"Initializes"""
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
        """"Initializes"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
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
                meta_data = {"start_time_of_day": str(row_time[0]),
                             "end_time_of_day": str(row_time[1]),
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
