import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from anytree import AnyNode, LevelOrderIter
from anytree.exporter import JsonExporter
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class SpaceCollection:
    def __init__(self):
        """Initializes Class"""
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

        query = (" SELECT id, name, uuid "
                 " FROM tbl_spaces ")
        cursor.execute(query)
        rows_spaces = cursor.fetchall()

        space_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                space_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, utc_offset "
                 " FROM tbl_timezones ")
        cursor.execute(query)
        rows_timezones = cursor.fetchall()

        timezone_dict = dict()
        if rows_timezones is not None and len(rows_timezones) > 0:
            for row in rows_timezones:
                timezone_dict[row[0]] = {"id": row[0],
                                         "name": row[1],
                                         "utc_offset": row[2]}

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
                 "        parent_space_id, area, timezone_id, is_input_counted, is_output_counted, "
                 "        contact_id, cost_center_id, latitude, longitude, description, number "
                 " FROM tbl_spaces "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_spaces = cursor.fetchall()

        result = list()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "parent_space": space_dict.get(row[3], None),
                               "area": row[4],
                               "timezone": timezone_dict.get(row[5], None),
                               "is_input_counted": bool(row[6]),
                               "is_output_counted": bool(row[7]),
                               "contact": contact_dict.get(row[8], None),
                               "cost_center": cost_center_dict.get(row[9], None),
                               "latitude": row[10],
                               "longitude": row[11],
                               "description": row[12],
                               "qrcode": "space:" + row[2],
                               "number": row[13]}
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
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_NAME')
        name = str.strip(new_values['data']['name'])

        if 'parent_space_id' in new_values['data'].keys():
            if new_values['data']['parent_space_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PARENT_SPACE_ID')
            parent_space_id = new_values['data']['parent_space_id']
        else:
            parent_space_id = None

        if 'area' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['area'], float) or
                     isinstance(new_values['data']['area'], int)) or \
                new_values['data']['area'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_AREA_VALUE')
        area = new_values['data']['area']

        if 'timezone_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['timezone_id'], int) or \
                new_values['data']['timezone_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TIMEZONE_ID')
        timezone_id = new_values['data']['timezone_id']

        if 'is_input_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['data']['is_input_counted']

        if 'is_output_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_output_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_OUTPUT_COUNTED_VALUE')
        is_output_counted = new_values['data']['is_output_counted']

        if 'contact_id' in new_values['data'].keys():
            if new_values['data']['contact_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_CONTACT_ID')
            contact_id = new_values['data']['contact_id']
        else:
            contact_id = None

        if 'cost_center_id' in new_values['data'].keys():
            if new_values['data']['cost_center_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_COST_CENTER_ID')
            cost_center_id = new_values['data']['cost_center_id']
        else:
            cost_center_id = None

        if 'latitude' in new_values['data'].keys() and new_values['data']['latitude'] is not None:
            if not (isinstance(new_values['data']['latitude'], float) or
                    isinstance(new_values['data']['latitude'], int)) or \
                    new_values['data']['latitude'] < -90.0 or \
                    new_values['data']['latitude'] > 90.0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_LATITUDE_VALUE')
            latitude = new_values['data']['latitude']
        else:
            latitude = None

        if 'longitude' in new_values['data'].keys() and new_values['data']['longitude'] is not None:
            if not (isinstance(new_values['data']['longitude'], float) or
                    isinstance(new_values['data']['longitude'], int)) or \
                    new_values['data']['longitude'] < -180.0 or \
                    new_values['data']['longitude'] > 180.0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_LONGITUDE_VALUE')
            longitude = new_values['data']['longitude']
        else:
            longitude = None

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        if 'number' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['number'], int) or \
                new_values['data']['number'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NUMBER')
        number = new_values['data']['number']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SPACE_NAME_IS_ALREADY_IN_USE')

        if parent_space_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_spaces "
                           " WHERE id = %s ",
                           (new_values['data']['parent_space_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.PARENT_SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_timezones "
                       " WHERE id = %s ",
                       (new_values['data']['timezone_id'],))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TIMEZONE_NOT_FOUND')
        if contact_id is not None:
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

        if cost_center_id is not None:
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

        add_values = (" INSERT INTO tbl_spaces "
                      "    (name, uuid, parent_space_id, area, timezone_id, is_input_counted, is_output_counted, "
                      "     contact_id, cost_center_id, latitude, longitude, description, number) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    parent_space_id,
                                    area,
                                    timezone_id,
                                    is_input_counted,
                                    is_output_counted,
                                    contact_id,
                                    cost_center_id,
                                    latitude,
                                    longitude,
                                    description,
                                    number))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(new_id)


class SpaceItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_spaces ")
        cursor.execute(query)
        rows_spaces = cursor.fetchall()

        space_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                space_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, utc_offset "
                 " FROM tbl_timezones ")
        cursor.execute(query)
        rows_timezones = cursor.fetchall()

        timezone_dict = dict()
        if rows_timezones is not None and len(rows_timezones) > 0:
            for row in rows_timezones:
                timezone_dict[row[0]] = {"id": row[0],
                                         "name": row[1],
                                         "utc_offset": row[2]}

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
                 "        parent_space_id, area, timezone_id, is_input_counted, is_output_counted, "
                 "        contact_id, cost_center_id, latitude, longitude, description, number "
                 " FROM tbl_spaces "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "parent_space_id": space_dict.get(row[3], None),
                           "area": row[4],
                           "timezone": timezone_dict.get(row[5], None),
                           "is_input_counted": bool(row[6]),
                           "is_output_counted": bool(row[7]),
                           "contact": contact_dict.get(row[8], None),
                           "cost_center": cost_center_dict.get(row[9], None),
                           "latitude": row[10],
                           "longitude": row[11],
                           "description": row[12],
                           "qrcode": "space:" + row[2],
                           "number": row[13]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')
        if int(id_) == 1:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.THIS_SPACE_CANNOT_BE_DELETED')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        # checkout relation with children spaces
        cursor.execute(" SELECT id "
                       " FROM tbl_spaces "
                       " WHERE parent_space_id = %s ",
                       (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_CHILDREN_SPACES')

        # delete relation with combined equipment
        cursor.execute(" DELETE FROM tbl_spaces_combined_equipments WHERE space_id = %s ", (id_,))

        # delete relation with commands
        cursor.execute(" DELETE FROM tbl_spaces_commands WHERE space_id = %s ", (id_,))

        # delete relation with equipments
        cursor.execute(" DELETE FROM tbl_spaces_equipments WHERE space_id = %s ", (id_,))

        # delete relation with meters
        cursor.execute(" DELETE FROM tbl_spaces_meters WHERE space_id = %s ", (id_,))

        # delete relation with offline meters
        cursor.execute(" DELETE FROM tbl_spaces_offline_meters WHERE space_id = %s ", (id_,))

        # delete relation with points
        cursor.execute(" DELETE FROM tbl_spaces_points WHERE space_id = %s ", (id_,))

        # delete relation with sensors
        cursor.execute(" DELETE FROM tbl_spaces_sensors WHERE space_id = %s ", (id_,))

        # delete relation with shopfloors
        cursor.execute(" DELETE FROM tbl_spaces_shopfloors WHERE space_id = %s ", (id_,))

        # delete relation with stores
        cursor.execute(" DELETE FROM tbl_spaces_stores WHERE space_id = %s ", (id_,))

        # delete relation with tenants
        cursor.execute(" DELETE FROM tbl_spaces_tenants WHERE space_id = %s ", (id_,))

        # delete relation with virtual meters
        cursor.execute(" DELETE FROM tbl_spaces_virtual_meters WHERE space_id = %s ", (id_,))

        # delete relation with working calendars
        cursor.execute(" DELETE FROM tbl_spaces_working_calendars WHERE space_id = %s ", (id_,))

        cursor.execute(" DELETE FROM tbl_spaces WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_NAME')
        name = str.strip(new_values['data']['name'])

        if int(id_) == 1:
            parent_space_id = None
        else:
            if 'parent_space_id' not in new_values['data'].keys() or \
                    new_values['data']['parent_space_id'] is None or \
                    not isinstance(new_values['data']['parent_space_id'], int) or \
                    int(new_values['data']['parent_space_id']) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_TIMEZONE_ID')
            parent_space_id = int(new_values['data']['parent_space_id'])

        if 'area' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['area'], float) or
                     isinstance(new_values['data']['area'], int)) or \
                new_values['data']['area'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_AREA_VALUE')
        area = new_values['data']['area']

        if 'timezone_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['timezone_id'], int) or \
                new_values['data']['timezone_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TIMEZONE_ID')
        timezone_id = new_values['data']['timezone_id']

        if 'is_input_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['data']['is_input_counted']

        if 'is_output_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_output_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_OUTPUT_COUNTED_VALUE')
        is_output_counted = new_values['data']['is_output_counted']

        if 'contact_id' in new_values['data'].keys() and new_values['data']['contact_id'] is not None:
            if new_values['data']['contact_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_CONTACT_ID')
            contact_id = new_values['data']['contact_id']
        else:
            contact_id = None

        if 'cost_center_id' in new_values['data'].keys():
            if new_values['data']['cost_center_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_COST_CENTER_ID')
            cost_center_id = new_values['data']['cost_center_id']
        else:
            cost_center_id = None

        if 'latitude' in new_values['data'].keys():
            if new_values['data']['latitude'] is not None:
                if not (isinstance(new_values['data']['latitude'], float) or
                        isinstance(new_values['data']['latitude'], int)) or \
                        new_values['data']['latitude'] < -90.0 or \
                        new_values['data']['latitude'] > 90.0:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_LATITUDE_VALUE')
                latitude = new_values['data']['latitude']
            else:
                latitude = None
        else:
            latitude = None

        if 'longitude' in new_values['data'].keys():
            if new_values['data']['latitude'] is not None:
                if not (isinstance(new_values['data']['longitude'], float) or
                        isinstance(new_values['data']['longitude'], int)) or \
                        new_values['data']['longitude'] < -180.0 or \
                        new_values['data']['longitude'] > 180.0:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_LONGITUDE_VALUE')
                longitude = new_values['data']['longitude']
            else:
                longitude = None
        else:
            longitude = None

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        if 'number' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['number'], int) or \
                new_values['data']['number'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NUMBER')
        number = new_values['data']['number']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SPACE_NAME_IS_ALREADY_IN_USE')

        if parent_space_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_spaces "
                           " WHERE id = %s ",
                           (new_values['data']['parent_space_id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.PARENT_SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_timezones "
                       " WHERE id = %s ",
                       (new_values['data']['timezone_id'],))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TIMEZONE_NOT_FOUND')
        if contact_id is not None:
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

        if cost_center_id is not None:
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

        update_row = (" UPDATE tbl_spaces "
                      " SET name = %s, parent_space_id = %s, area = %s, timezone_id = %s, "
                      "     is_input_counted = %s, is_output_counted = %s, contact_id = %s, cost_center_id = %s, "
                      "     latitude = %s, longitude = %s, description = %s, number = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    parent_space_id,
                                    area,
                                    timezone_id,
                                    is_input_counted,
                                    is_output_counted,
                                    contact_id,
                                    cost_center_id,
                                    latitude,
                                    longitude,
                                    description,
                                    number,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class SpaceChildrenCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        parent_space_id, area, timezone_id, is_input_counted, is_output_counted, "
                 "        contact_id, cost_center_id, latitude, longitude, description, number "
                 " FROM tbl_spaces "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row_current_space = cursor.fetchone()
        if row_current_space is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')
        # note: row_current_space will be used at the end

        query = (" SELECT id, name, uuid "
                 " FROM tbl_spaces ")
        cursor.execute(query)
        rows_spaces = cursor.fetchall()

        space_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                space_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, utc_offset "
                 " FROM tbl_timezones ")
        cursor.execute(query)
        rows_timezones = cursor.fetchall()

        timezone_dict = dict()
        if rows_timezones is not None and len(rows_timezones) > 0:
            for row in rows_timezones:
                timezone_dict[row[0]] = {"id": row[0],
                                         "name": row[1],
                                         "utc_offset": row[2]}

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
        result = dict()
        result['current'] = dict()
        result['current']['id'] = row_current_space[0]
        result['current']['name'] = row_current_space[1]
        result['current']['uuid'] = row_current_space[2]
        result['current']['parent_space'] = space_dict.get(row_current_space[3], None)
        result['current']['area'] = row_current_space[4]
        result['current']['timezone'] = timezone_dict.get(row_current_space[5], None)
        result['current']['is_input_counted'] = bool(row_current_space[6])
        result['current']['is_output_counted'] = bool(row_current_space[7])
        result['current']['contact'] = contact_dict.get(row_current_space[8], None)
        result['current']['cost_center'] = cost_center_dict.get(row_current_space[9], None)
        result['current']['latitude'] = row_current_space[10]
        result['current']['longitude'] = row_current_space[11]
        result['current']['description'] = row_current_space[12]
        result['current']['qrcode'] = 'space:' + row_current_space[2]
        result['current']['number'] = row_current_space[13]

        result['children'] = list()

        query = (" SELECT id, name, uuid, "
                 "        parent_space_id, area, timezone_id, is_input_counted, is_output_counted, "
                 "        contact_id, cost_center_id, latitude, longitude, description, number "
                 " FROM tbl_spaces "
                 " WHERE parent_space_id = %s "
                 " ORDER BY id ")
        cursor.execute(query, (id_, ))
        rows_spaces = cursor.fetchall()

        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "parent_space": space_dict.get(row[3], None),
                               "area": row[4],
                               "timezone": timezone_dict.get(row[5], None),
                               "is_input_counted": bool(row[6]),
                               "is_output_counted": bool(row[7]),
                               "contact": contact_dict.get(row[8], None),
                               "cost_center": cost_center_dict.get(row[9], None),
                               "latitude": row[10],
                               "longitude": row[11],
                               "description": row[12],
                               "qrcode": 'space:' + row[2],
                               "number": row[13]}
                result['children'].append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)


class SpaceCombinedEquipmentCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT e.id, e.name, e.uuid "
                 " FROM tbl_spaces s, tbl_spaces_combined_equipments se, tbl_combined_equipments e "
                 " WHERE se.space_id = s.id AND e.id = se.combined_equipment_id AND s.id = %s "
                 " ORDER BY e.id ")
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'combined_equipment_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['combined_equipment_id'], int) or \
                new_values['data']['combined_equipment_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')
        combined_equipment_id = new_values['data']['combined_equipment_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (combined_equipment_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_combined_equipments "
                 " WHERE space_id = %s AND combined_equipment_id = %s")
        cursor.execute(query, (id_, combined_equipment_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_COMBINED_EQUIPMENT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_combined_equipments (space_id, combined_equipment_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, combined_equipment_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/combinedequipments/' + str(combined_equipment_id)


class SpaceCombinedEquipmentItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, eid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, eid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_combined_equipments "
                       " WHERE id = %s ", (eid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_combined_equipments "
                       " WHERE space_id = %s AND combined_equipment_id = %s ", (id_, eid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_COMBINED_EQUIPMENT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_combined_equipments "
                       " WHERE space_id = %s AND combined_equipment_id = %s ", (id_, eid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceEnergyStoragePowerStationCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT e.id, e.name, e.uuid, e.phase_of_lifecycle "
                 " FROM tbl_spaces s, tbl_spaces_energy_storage_power_stations se, tbl_energy_storage_power_stations e "
                 " WHERE se.space_id = s.id AND e.id = se.energy_storage_power_station_id AND s.id = %s "
                 " ORDER BY e.phase_of_lifecycle, e.id ")
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'energy_storage_power_station_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['energy_storage_power_station_id'], int) or \
                new_values['data']['energy_storage_power_station_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')
        energy_storage_power_station_id = new_values['data']['energy_storage_power_station_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE id = %s ", (energy_storage_power_station_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_energy_storage_power_stations "
                 " WHERE space_id = %s AND energy_storage_power_station_id = %s")
        cursor.execute(query, (id_, energy_storage_power_station_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_ENERGY_STORAGE_POWER_STATION_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_energy_storage_power_stations (space_id, energy_storage_power_station_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, energy_storage_power_station_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/energystoragepowerstations/' + str(energy_storage_power_station_id)


class SpaceEnergyStoragePowerStationItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, eid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, eid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_storage_power_stations "
                       " WHERE id = %s ", (eid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_energy_storage_power_stations "
                       " WHERE space_id = %s AND energy_storage_power_station_id = %s ", (id_, eid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_ENERGY_STORAGE_POWER_STATION_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_energy_storage_power_stations "
                       " WHERE space_id = %s AND energy_storage_power_station_id = %s ", (id_, eid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceEquipmentCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT e.id, e.name, e.uuid "
                 " FROM tbl_spaces s, tbl_spaces_equipments se, tbl_equipments e "
                 " WHERE se.space_id = s.id AND e.id = se.equipment_id AND s.id = %s "
                 " ORDER BY e.id ")
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'equipment_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['equipment_id'], int) or \
                new_values['data']['equipment_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUIPMENT_ID')
        equipment_id = new_values['data']['equipment_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_equipments "
                       " WHERE id = %s ", (equipment_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EQUIPMENT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_equipments "
                 " WHERE space_id = %s AND equipment_id = %s")
        cursor.execute(query, (id_, equipment_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_EQUIPMENT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_equipments (space_id, equipment_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, equipment_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/equipments/' + str(equipment_id)


class SpaceEquipmentItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, eid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, eid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUIPMENT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_equipments "
                       " WHERE id = %s ", (eid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.EQUIPMENT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_equipments "
                       " WHERE space_id = %s AND equipment_id = %s ", (id_, eid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_EQUIPMENT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_equipments WHERE space_id = %s AND equipment_id = %s ", (id_, eid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceMeterCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

        query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                 " FROM tbl_spaces s, tbl_spaces_meters sm, tbl_meters m "
                 " WHERE sm.space_id = s.id AND m.id = sm.meter_id AND s.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "energy_category": energy_category_dict.get(row[3], None)}
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['meter_id'], int) or \
                new_values['data']['meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')
        meter_id = new_values['data']['meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_meters "
                 " WHERE space_id = %s AND meter_id = %s")
        cursor.execute(query, (id_, meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_meters (space_id, meter_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, meter_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/meters/' + str(meter_id)


class SpaceMeterItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_meters "
                       " WHERE space_id = %s AND meter_id = %s ", (id_, mid))
        # use fetchall to avoid 'Unread result found' error in case there are duplicate rows
        rows = cursor.fetchall()
        if rows is None or len(rows) == 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_meters WHERE space_id = %s AND meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceMicrogridCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT e.id, e.name, e.uuid, e.phase_of_lifecycle "
                 " FROM tbl_spaces s, tbl_spaces_microgrids se, tbl_microgrids e "
                 " WHERE se.space_id = s.id AND e.id = se.microgrid_id AND s.id = %s "
                 " ORDER BY e.phase_of_lifecycle, e.id ")
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'microgrid_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['microgrid_id'], int) or \
                new_values['data']['microgrid_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        microgrid_id = new_values['data']['microgrid_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (microgrid_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_microgrids "
                 " WHERE space_id = %s AND microgrid_id = %s")
        cursor.execute(query, (id_, microgrid_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_MICROGRID_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_microgrids (space_id, microgrid_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, microgrid_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/microgrids/' + str(microgrid_id)


class SpaceMicrogridItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_microgrids "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_microgrids "
                       " WHERE space_id = %s AND microgrid_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_MICROGRID_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_microgrids "
                       " WHERE space_id = %s AND microgrid_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceOfflineMeterCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

        query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                 " FROM tbl_spaces s, tbl_spaces_offline_meters sm, tbl_offline_meters m "
                 " WHERE sm.space_id = s.id AND m.id = sm.offline_meter_id AND s.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "energy_category": energy_category_dict.get(row[3], None)}
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'offline_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['offline_meter_id'], int) or \
                new_values['data']['offline_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')
        offline_meter_id = new_values['data']['offline_meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (offline_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_offline_meters "
                 " WHERE space_id = %s AND offline_meter_id = %s")
        cursor.execute(query, (id_, offline_meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_OFFLINE_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_offline_meters (space_id, offline_meter_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, offline_meter_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/offlinemeters/' + str(offline_meter_id)


class SpaceOfflineMeterItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_offline_meters "
                       " WHERE space_id = %s AND offline_meter_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_OFFLINE_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_offline_meters "
                       " WHERE space_id = %s AND offline_meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpacePointCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

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

        query = (" SELECT p.id, p.name, p.data_source_id "
                 " FROM tbl_spaces s, tbl_spaces_points sp, tbl_points p "
                 " WHERE sp.space_id = s.id AND p.id = sp.point_id AND s.id = %s "
                 " ORDER BY p.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "data_source": data_source_dict.get(row[2], None)}
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'point_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['point_id'], int) or \
                new_values['data']['point_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')
        point_id = new_values['data']['point_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_points "
                 " WHERE space_id = %s AND point_id = %s")
        cursor.execute(query, (id_, point_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_points (space_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, point_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/points/' + str(point_id)


class SpacePointItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, pid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, pid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_points "
                       " WHERE space_id = %s AND point_id = %s ", (id_, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_points "
                       " WHERE space_id = %s AND point_id = %s ", (id_, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceSensorCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT se.id, se.name, se.uuid "
                 " FROM tbl_spaces sp, tbl_spaces_sensors ss, tbl_sensors se "
                 " WHERE ss.space_id = sp.id AND se.id = ss.sensor_id AND sp.id = %s "
                 " ORDER BY se.id ")
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
                                   description='API.INVALID_SPACE_ID')

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
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_sensors "
                       " WHERE id = %s ", (sensor_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SENSOR_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_sensors "
                 " WHERE space_id = %s AND sensor_id = %s")
        cursor.execute(query, (id_, sensor_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_SENSOR_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_sensors (space_id, sensor_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, sensor_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/sensors/' + str(sensor_id)


class SpaceSensorItem:
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
                                   description='API.INVALID_SPACE_ID')

        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SENSOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_sensors "
                       " WHERE id = %s ", (sid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SENSOR_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_sensors "
                       " WHERE space_id = %s AND sensor_id = %s ", (id_, sid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_SENSOR_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_sensors WHERE space_id = %s AND sensor_id = %s ", (id_, sid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceShopfloorCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT sf.id, sf.name, sf.uuid "
                 " FROM tbl_spaces sp, tbl_spaces_shopfloors ss, tbl_shopfloors sf "
                 " WHERE ss.space_id = sp.id AND sf.id = ss.shopfloor_id AND sp.id = %s "
                 " ORDER BY sf.id ")
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'shopfloor_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['shopfloor_id'], int) or \
                new_values['data']['shopfloor_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')
        shopfloor_id = new_values['data']['shopfloor_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (shopfloor_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_shopfloors "
                 " WHERE space_id = %s AND shopfloor_id = %s")
        cursor.execute(query, (id_, shopfloor_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_SHOPFLOOR_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_shopfloors (space_id, shopfloor_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, shopfloor_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/shopfloors/' + str(shopfloor_id)


class SpaceShopfloorItem:
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
                                   description='API.INVALID_SPACE_ID')

        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SHOPFLOOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_shopfloors "
                       " WHERE id = %s ", (sid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SHOPFLOOR_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_shopfloors "
                       " WHERE space_id = %s AND shopfloor_id = %s ", (id_, sid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_SHOPFLOOR_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_shopfloors WHERE space_id = %s AND shopfloor_id = %s ", (id_, sid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceStoreCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT t.id, t.name, t.uuid "
                 " FROM tbl_spaces s, tbl_spaces_stores st, tbl_stores t "
                 " WHERE st.space_id = s.id AND t.id = st.store_id AND s.id = %s "
                 " ORDER BY t.id ")
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'store_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['store_id'], int) or \
                new_values['data']['store_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STORE_ID')
        store_id = new_values['data']['store_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_stores "
                       " WHERE id = %s ", (store_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.STORE_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_stores "
                 " WHERE space_id = %s AND store_id = %s")
        cursor.execute(query, (id_, store_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_STORE_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_stores (space_id, store_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, store_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/stores/' + str(store_id)


class SpaceStoreItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, tid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, tid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not tid.isdigit() or int(tid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_STORE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_stores "
                       " WHERE id = %s ", (tid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.STORE_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_stores "
                       " WHERE space_id = %s AND store_id = %s ", (id_, tid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_STORE_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_stores WHERE space_id = %s AND store_id = %s ", (id_, tid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceTenantCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT t.id, t.name, t.uuid "
                 " FROM tbl_spaces s, tbl_spaces_tenants st, tbl_tenants t "
                 " WHERE st.space_id = s.id AND t.id = st.tenant_id AND s.id = %s "
                 " ORDER BY t.id ")
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'tenant_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['tenant_id'], int) or \
                new_values['data']['tenant_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_ID')
        tenant_id = new_values['data']['tenant_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (tenant_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_tenants "
                 " WHERE space_id = %s AND tenant_id = %s")
        cursor.execute(query, (id_, tenant_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_TENANT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_tenants (space_id, tenant_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, tenant_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/tenants/' + str(tenant_id)


class SpaceTenantItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, tid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, tid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not tid.isdigit() or int(tid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (tid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_tenants "
                       " WHERE space_id = %s AND tenant_id = %s ", (id_, tid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_TENANT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_tenants WHERE space_id = %s AND tenant_id = %s ", (id_, tid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceVirtualMeterCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_categories ")
        cursor.execute(query)
        rows_energy_categories = cursor.fetchall()

        energy_category_dict = dict()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                energy_category_dict[row[0]] = {"id": row[0],
                                                "name": row[1],
                                                "uuid": row[2]}

        query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                 " FROM tbl_spaces s, tbl_spaces_virtual_meters sm, tbl_virtual_meters m "
                 " WHERE sm.space_id = s.id AND m.id = sm.virtual_meter_id AND s.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "energy_category": energy_category_dict.get(row[3], None)}
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'virtual_meter_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['virtual_meter_id'], int) or \
                new_values['data']['virtual_meter_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')
        virtual_meter_id = new_values['data']['virtual_meter_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (virtual_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_virtual_meters "
                 " WHERE space_id = %s AND virtual_meter_id = %s")
        cursor.execute(query, (id_, virtual_meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_VIRTUAL_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_virtual_meters (space_id, virtual_meter_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, virtual_meter_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/virtualmeters/' + str(virtual_meter_id)


class SpaceVirtualMeterItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, mid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, mid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_virtual_meters "
                       " WHERE space_id = %s AND virtual_meter_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_VIRTUAL_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_virtual_meters "
                       " WHERE space_id = %s AND virtual_meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceTreeCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        access_control(req)
        if 'USER-UUID' not in req.headers or \
                not isinstance(req.headers['USER-UUID'], str) or \
                len(str.strip(req.headers['USER-UUID'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_UUID')
        user_uuid = str.strip(req.headers['USER-UUID'])

        if 'TOKEN' not in req.headers or \
                not isinstance(req.headers['TOKEN'], str) or \
                len(str.strip(req.headers['TOKEN'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TOKEN')
        token = str.strip(req.headers['TOKEN'])

        # Verify User Session
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        query = (" SELECT utc_expires "
                 " FROM tbl_sessions "
                 " WHERE user_uuid = %s AND token = %s")
        cursor.execute(query, (user_uuid, token,))
        row = cursor.fetchone()

        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_SESSION_NOT_FOUND')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.USER_SESSION_TIMEOUT')
        # get privilege
        query = (" SELECT is_admin, privilege_id "
                 " FROM tbl_users "
                 " WHERE uuid = %s ")
        cursor.execute(query, (user_uuid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.USER_NOT_FOUND')
        else:
            is_admin = bool(row[0])
            privilege_id = row[1]

        # get space_id in privilege
        if is_admin:
            space_id = 1
        elif privilege_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PRIVILEGE_NOT_FOUND')
        else:
            query = (" SELECT data "
                     " FROM tbl_privileges "
                     " WHERE id = %s ")
            cursor.execute(query, (privilege_id,))
            row = cursor.fetchone()
            cursor.close()
            cnx.close()

            if row is None:
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.PRIVILEGE_NOT_FOUND')
            try:
                data = json.loads(row[0])
            except Exception as ex:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR', description=str(ex))

            if 'spaces' not in data or len(data['spaces']) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.SPACE_NOT_FOUND_IN_PRIVILEGE')

            space_id = data['spaces'][0]
            if space_id is None:
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.PRIVILEGE_NOT_FOUND')
        # get all spaces
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, parent_space_id "
                 " FROM tbl_spaces "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_spaces = cursor.fetchall()
        node_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                parent_node = node_dict[row[2]] if row[2] is not None else None
                node_dict[row[0]] = AnyNode(id=row[0], parent=parent_node, name=row[1])

        cursor.close()
        cnx.close()
        resp.text = JsonExporter(sort_keys=True).export(node_dict[space_id], )


# Get energy categories of all meters in the space tree
class SpaceTreeMetersEnergyCategoryCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        ################################################################################################################
        # Step 2: build a space tree
        ################################################################################################################
        query = (" SELECT id, name, parent_space_id "
                 " FROM tbl_spaces "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_spaces = cursor.fetchall()
        node_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                parent_node = node_dict[row[2]] if row[2] is not None else None
                node_dict[row[0]] = AnyNode(id=row[0], parent=parent_node, name=row[1])
        ################################################################################################################
        # Step 3: query energy categories of all meters in the space tree
        ################################################################################################################
        space_dict = dict()

        for node in LevelOrderIter(node_dict[int(id_)]):
            space_dict[node.id] = node.name

        cursor.execute(" SELECT distinct(m.energy_category_id), ec.name AS energy_category_name, ec.uuid "
                       " FROM tbl_spaces s, tbl_spaces_meters sm, tbl_meters m, tbl_energy_categories ec  "
                       " WHERE s.id IN ( " + ', '.join(map(str, space_dict.keys())) + ") "
                       "       AND sm.space_id = s.id AND sm.meter_id = m.id  AND m.energy_category_id = ec.id ", )
        rows_energy_categories = cursor.fetchall()

        result = list()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row in rows_energy_categories:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2]}
                result.append(meta_result)

        resp.text = json.dumps(result)


class SpaceWorkingCalendarCollection:
    def __init__(self):
        """Initializes SpaceWorkingCalendarCollection Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT wc.id, wc.name, wc.description "
                 " FROM tbl_spaces s, tbl_spaces_working_calendars swc, tbl_working_calendars wc "
                 " WHERE swc.space_id = s.id AND wc.id = swc.working_calendar_id AND s.id = %s "
                 " ORDER BY wc.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "description": row[2]}
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'working_calendar_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['working_calendar_id'], int) or \
                new_values['data']['working_calendar_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORKING_CALENDAR_ID')
        working_calendar_id = new_values['data']['working_calendar_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_working_calendars "
                       " WHERE id = %s ", (working_calendar_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WORKING_CALENDAR_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_working_calendars "
                 " WHERE space_id = %s AND working_calendar_id = %s")
        cursor.execute(query, (id_, working_calendar_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_WORKING_CALENDAR_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_working_calendars (space_id, working_calendar_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, working_calendar_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/workingcalendars/' + str(working_calendar_id)


class SpaceWorkingCalendarItem:
    def __init__(self):
        """Initializes SpaceWorkingCalendarItem Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, wcid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, wcid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not wcid.isdigit() or int(wcid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORKING_CALENDAR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_working_calendars "
                       " WHERE id = %s ", (wcid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WORKING_CALENDAR_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_working_calendars "
                       " WHERE space_id = %s AND working_calendar_id = %s ", (id_, wcid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_WORKING_CALENDAR_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_working_calendars "
                       " WHERE space_id = %s AND working_calendar_id = %s ", (id_, wcid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceCommandCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT c.id, c.name, c.uuid "
                 " FROM tbl_spaces s, tbl_spaces_commands sc, tbl_commands c "
                 " WHERE sc.space_id = s.id AND c.id = sc.command_id AND s.id = %s "
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
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

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
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (command_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_commands "
                 " WHERE space_id = %s AND command_id = %s")
        cursor.execute(query, (id_, command_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_COMMAND_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_commands (space_id, command_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, command_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/commands/' + str(command_id)


class SpaceCommandItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, cid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, cid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not cid.isdigit() or int(cid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (cid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_commands "
                       " WHERE space_id = %s AND command_id = %s ", (id_, cid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_COMMAND_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_commands WHERE space_id = %s AND command_id = %s ", (id_, cid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class SpaceExport:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_spaces ")
        cursor.execute(query)
        rows_spaces = cursor.fetchall()

        space_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                space_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, utc_offset "
                 " FROM tbl_timezones ")
        cursor.execute(query)
        rows_timezones = cursor.fetchall()

        timezone_dict = dict()
        if rows_timezones is not None and len(rows_timezones) > 0:
            for row in rows_timezones:
                timezone_dict[row[0]] = {"id": row[0],
                                         "name": row[1],
                                         "utc_offset": row[2]}

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
                 "        parent_space_id, area, timezone_id, is_input_counted, is_output_counted, "
                 "        contact_id, cost_center_id, latitude, longitude, description "
                 " FROM tbl_spaces "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "parent_space_id": space_dict.get(row[3], None),
                           "area": row[4],
                           "timezone": timezone_dict.get(row[5], None),
                           "is_input_counted": bool(row[6]),
                           "is_output_counted": bool(row[7]),
                           "contact": contact_dict.get(row[8], None),
                           "cost_center": cost_center_dict.get(row[9], None),
                           "latitude": row[10],
                           "longitude": row[11],
                           "description": row[12],
                           "children": None,
                           "commands": None,
                           "meters": None,
                           "offline_meters": None,
                           "virtual_meters": None,
                           "shopfloors": None,
                           "combined_equipments": None,
                           "equipments": None,
                           "points": None,
                           "sensors": None,
                           "tenants": None,
                           "stores": None,
                           "working_calendars": None
                           }
            query = (" SELECT id, name, uuid, "
                     "        parent_space_id, area, timezone_id, is_input_counted, is_output_counted, "
                     "        contact_id, cost_center_id, latitude, longitude, description "
                     " FROM tbl_spaces "
                     " WHERE id = %s ")
            cursor.execute(query, (id_,))
            row_current_space = cursor.fetchone()
            if row_current_space is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.SPACE_NOT_FOUND')
            # note: row_current_space will be used at the end

            query = (" SELECT id, name, uuid "
                     " FROM tbl_spaces ")
            cursor.execute(query)
            rows_spaces = cursor.fetchall()

            space_dict = dict()
            if rows_spaces is not None and len(rows_spaces) > 0:
                for row in rows_spaces:
                    space_dict[row[0]] = {"id": row[0],
                                          "name": row[1],
                                          "uuid": row[2]}

            query = (" SELECT id, name, utc_offset "
                     " FROM tbl_timezones ")
            cursor.execute(query)
            rows_timezones = cursor.fetchall()

            timezone_dict = dict()
            if rows_timezones is not None and len(rows_timezones) > 0:
                for row in rows_timezones:
                    timezone_dict[row[0]] = {"id": row[0],
                                             "name": row[1],
                                             "utc_offset": row[2]}

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
            result = dict()
            result['current'] = dict()
            result['current']['id'] = row_current_space[0]
            result['current']['name'] = row_current_space[1]
            result['current']['uuid'] = row_current_space[2]
            result['current']['parent_space'] = space_dict.get(row_current_space[3], None)
            result['current']['area'] = row_current_space[4]
            result['current']['timezone'] = timezone_dict.get(row_current_space[5], None)
            result['current']['is_input_counted'] = bool(row_current_space[6])
            result['current']['is_output_counted'] = bool(row_current_space[7])
            result['current']['contact'] = contact_dict.get(row_current_space[8], None)
            result['current']['cost_center'] = cost_center_dict.get(row_current_space[9], None)
            result['current']['latitude'] = row_current_space[10]
            result['current']['longitude'] = row_current_space[11]
            result['current']['description'] = row_current_space[12]
            result['current']['qrcode'] = 'space:' + row_current_space[2]

            result['children'] = list()

            query = (" SELECT id, name, uuid, "
                     "        parent_space_id, area, timezone_id, is_input_counted, is_output_counted, "
                     "        contact_id, cost_center_id, latitude, longitude, description "
                     " FROM tbl_spaces "
                     " WHERE parent_space_id = %s "
                     " ORDER BY id ")
            cursor.execute(query, (id_,))
            rows_spaces = cursor.fetchall()

            if rows_spaces is not None and len(rows_spaces) > 0:
                for row in rows_spaces:
                    children_result = {"id": row[0],
                                       "name": row[1],
                                       "uuid": row[2],
                                       "parent_space": space_dict.get(row[3], None),
                                       "area": row[4],
                                       "timezone": timezone_dict.get(row[5], None),
                                       "is_input_counted": bool(row[6]),
                                       "is_output_counted": bool(row[7]),
                                       "contact": contact_dict.get(row[8], None),
                                       "cost_center": cost_center_dict.get(row[9], None),
                                       "latitude": row[10],
                                       "longitude": row[11],
                                       "description": row[12]}
                    result['children'].append(children_result)
                meta_result['children'] = result['children']
            query = (" SELECT c.id, c.name, c.uuid "
                     " FROM tbl_spaces s, tbl_spaces_commands sc, tbl_commands c "
                     " WHERE sc.space_id = s.id AND c.id = sc.command_id AND s.id = %s "
                     " ORDER BY c.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            command_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    command_result.append(result)
                meta_result['commands'] = command_result
            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_categories ")
            cursor.execute(query)
            rows_energy_categories = cursor.fetchall()

            energy_category_dict = dict()
            if rows_energy_categories is not None and len(rows_energy_categories) > 0:
                for row in rows_energy_categories:
                    energy_category_dict[row[0]] = {"id": row[0],
                                                    "name": row[1],
                                                    "uuid": row[2]}

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                     " FROM tbl_spaces s, tbl_spaces_meters sm, tbl_meters m "
                     " WHERE sm.space_id = s.id AND m.id = sm.meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            meter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None)}
                    meter_result.append(result)
                meta_result['meters'] = meter_result
            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_categories ")
            cursor.execute(query)
            rows_energy_categories = cursor.fetchall()

            energy_category_dict = dict()
            if rows_energy_categories is not None and len(rows_energy_categories) > 0:
                for row in rows_energy_categories:
                    energy_category_dict[row[0]] = {"id": row[0],
                                                    "name": row[1],
                                                    "uuid": row[2]}

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                     " FROM tbl_spaces s, tbl_spaces_offline_meters sm, tbl_offline_meters m "
                     " WHERE sm.space_id = s.id AND m.id = sm.offline_meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            offlinemeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None)}
                    offlinemeter_result.append(result)
                meta_result['offline_meters'] = offlinemeter_result
            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_categories ")
            cursor.execute(query)
            rows_energy_categories = cursor.fetchall()

            energy_category_dict = dict()
            if rows_energy_categories is not None and len(rows_energy_categories) > 0:
                for row in rows_energy_categories:
                    energy_category_dict[row[0]] = {"id": row[0],
                                                    "name": row[1],
                                                    "uuid": row[2]}

            query = (" SELECT m.id, m.name, m.uuid, m.energy_category_id "
                     " FROM tbl_spaces s, tbl_spaces_virtual_meters sm, tbl_virtual_meters m "
                     " WHERE sm.space_id = s.id AND m.id = sm.virtual_meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            virtualmeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category_dict.get(row[3], None)}
                    virtualmeter_result.append(result)
                meta_result['virtual_meters'] = virtualmeter_result
            query = (" SELECT sf.id, sf.name, sf.uuid "
                     " FROM tbl_spaces sp, tbl_spaces_shopfloors ss, tbl_shopfloors sf "
                     " WHERE ss.space_id = sp.id AND sf.id = ss.shopfloor_id AND sp.id = %s "
                     " ORDER BY sf.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            shopfloor_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    shopfloor_result.append(result)
                meta_result['shopfloors'] = shopfloor_result
            query = (" SELECT e.id, e.name, e.uuid "
                     " FROM tbl_spaces s, tbl_spaces_combined_equipments se, tbl_combined_equipments e "
                     " WHERE se.space_id = s.id AND e.id = se.combined_equipment_id AND s.id = %s "
                     " ORDER BY e.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            combinedequipment_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    combinedequipment_result.append(result)
                meta_result['combined_equipments'] = combinedequipment_result
            query = (" SELECT e.id, e.name, e.uuid "
                     " FROM tbl_spaces s, tbl_spaces_equipments se, tbl_equipments e "
                     " WHERE se.space_id = s.id AND e.id = se.equipment_id AND s.id = %s "
                     " ORDER BY e.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            equipment_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    equipment_result.append(result)
                meta_result['equipments'] = equipment_result
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

            query = (" SELECT p.id, p.name, p.data_source_id "
                     " FROM tbl_spaces s, tbl_spaces_points sp, tbl_points p "
                     " WHERE sp.space_id = s.id AND p.id = sp.point_id AND s.id = %s "
                     " ORDER BY p.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            point_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "data_source": data_source_dict.get(row[2], None)}
                    point_result.append(result)
                meta_result['points'] = point_result
            query = (" SELECT se.id, se.name, se.uuid "
                     " FROM tbl_spaces sp, tbl_spaces_sensors ss, tbl_sensors se "
                     " WHERE ss.space_id = sp.id AND se.id = ss.sensor_id AND sp.id = %s "
                     " ORDER BY se.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            sensor_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    sensor_result.append(result)
                meta_result['sensors'] = sensor_result
            query = (" SELECT t.id, t.name, t.uuid "
                     " FROM tbl_spaces s, tbl_spaces_tenants st, tbl_tenants t "
                     " WHERE st.space_id = s.id AND t.id = st.tenant_id AND s.id = %s "
                     " ORDER BY t.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            tenant_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    tenant_result.append(result)
                meta_result['tenants'] = tenant_result
            query = (" SELECT t.id, t.name, t.uuid "
                     " FROM tbl_spaces s, tbl_spaces_stores st, tbl_stores t "
                     " WHERE st.space_id = s.id AND t.id = st.store_id AND s.id = %s "
                     " ORDER BY t.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            store_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    store_result.append(result)
                meta_result['stores'] = store_result
            query = (" SELECT wc.id, wc.name, wc.description "
                     " FROM tbl_spaces s, tbl_spaces_working_calendars swc, tbl_working_calendars wc "
                     " WHERE swc.space_id = s.id AND wc.id = swc.working_calendar_id AND s.id = %s "
                     " ORDER BY wc.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            workingcalendar_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "description": row[2]}
                    workingcalendar_result.append(result)
                meta_result['working_calendars'] = workingcalendar_result
        cursor.close()
        cnx.close()
        resp.text = json.dumps(meta_result)


class SpaceImport:
    def __init__(self):
        """Initializes Class"""
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
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_NAME')
        name = str.strip(new_values['name'])

        if 'id' in new_values['parent_space_id'].keys():
            if new_values['parent_space_id']['id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PARENT_SPACE_ID')
            parent_space_id = new_values['parent_space_id']['id']
        else:
            parent_space_id = None

        if 'area' not in new_values.keys() or \
                not (isinstance(new_values['area'], float) or
                     isinstance(new_values['area'], int)) or \
                new_values['area'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_AREA_VALUE')
        area = new_values['area']

        if 'id' not in new_values['timezone'].keys() or \
                not isinstance(new_values['timezone']['id'], int) or \
                new_values['timezone']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TIMEZONE_ID')
        timezone_id = new_values['timezone']['id']

        if 'is_input_counted' not in new_values.keys() or \
                not isinstance(new_values['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['is_input_counted']

        if 'is_output_counted' not in new_values.keys() or \
                not isinstance(new_values['is_output_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_OUTPUT_COUNTED_VALUE')
        is_output_counted = new_values['is_output_counted']

        if 'id' in new_values['contact'].keys():
            if new_values['contact']['id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_CONTACT_ID')
            contact_id = new_values['contact']['id']
        else:
            contact_id = None

        if 'id' in new_values['cost_center'].keys():
            if new_values['cost_center']['id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_COST_CENTER_ID')
            cost_center_id = new_values['cost_center']['id']
        else:
            cost_center_id = None

        if 'latitude' in new_values.keys() and new_values['latitude'] is not None:
            if not (isinstance(new_values['latitude'], float) or
                    isinstance(new_values['latitude'], int)) or \
                    new_values['latitude'] < -90.0 or \
                    new_values['latitude'] > 90.0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_LATITUDE_VALUE')
            latitude = new_values['latitude']
        else:
            latitude = None

        if 'longitude' in new_values.keys() and new_values['longitude'] is not None:
            if not (isinstance(new_values['longitude'], float) or
                    isinstance(new_values['longitude'], int)) or \
                    new_values['longitude'] < -180.0 or \
                    new_values['longitude'] > 180.0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_LONGITUDE_VALUE')
            longitude = new_values['longitude']
        else:
            longitude = None

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SPACE_NAME_IS_ALREADY_IN_USE')

        if parent_space_id is not None:
            cursor.execute(" SELECT name "
                           " FROM tbl_spaces "
                           " WHERE id = %s ",
                           (new_values['parent_space_id']['id'],))
            row = cursor.fetchone()
            if row is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.PARENT_SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_timezones "
                       " WHERE id = %s ",
                       (new_values['timezone']['id'],))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TIMEZONE_NOT_FOUND')
        if contact_id is not None:
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

        if cost_center_id is not None:
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

        add_values = (" INSERT INTO tbl_spaces "
                      "    (name, uuid, parent_space_id, area, timezone_id, is_input_counted, is_output_counted, "
                      "     contact_id, cost_center_id, latitude, longitude, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    parent_space_id,
                                    area,
                                    timezone_id,
                                    is_input_counted,
                                    is_output_counted,
                                    contact_id,
                                    cost_center_id,
                                    latitude,
                                    longitude,
                                    description))
        new_id = cursor.lastrowid
        if new_values['commands'] is not None and len(new_values['commands']) > 0:
            for command in new_values['commands']:
                cursor.execute(" SELECT name "
                               " FROM tbl_commands "
                               " WHERE id = %s ", (command['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.COMMAND_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_spaces_commands "
                         " WHERE space_id = %s AND command_id = %s")
                cursor.execute(query, (new_id, command['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SPACE_COMMAND_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_spaces_commands (space_id, command_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, command['id'],))
        if new_values['meters'] is not None and len(new_values['meters']) > 0:
            for meter in new_values['meters']:
                cursor.execute(" SELECT name "
                               " FROM tbl_meters "
                               " WHERE id = %s ", (meter['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.METER_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_spaces_meters "
                         " WHERE space_id = %s AND meter_id = %s")
                cursor.execute(query, (new_id, meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SPACE_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_spaces_meters (space_id, meter_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, meter['id'],))
        if new_values['offline_meters'] is not None and len(new_values['offline_meters']) > 0:
            for offline_meter in new_values['offline_meters']:
                cursor.execute(" SELECT name "
                               " FROM tbl_offline_meters "
                               " WHERE id = %s ", (offline_meter['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.OFFLINE_METER_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_spaces_offline_meters "
                         " WHERE space_id = %s AND offline_meter_id = %s")
                cursor.execute(query, (new_id, offline_meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SPACE_OFFLINE_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_spaces_offline_meters (space_id, offline_meter_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, offline_meter['id'],))
        if new_values['virtual_meters'] is not None and len(new_values['virtual_meters']) > 0:
            for virtual_meter in new_values['virtual_meters']:
                cursor.execute(" SELECT name "
                               " FROM tbl_virtual_meters "
                               " WHERE id = %s ", (virtual_meter['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.VIRTUAL_METER_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_spaces_virtual_meters "
                         " WHERE space_id = %s AND virtual_meter_id = %s")
                cursor.execute(query, (new_id, virtual_meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SPACE_VIRTUAL_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_spaces_virtual_meters (space_id, virtual_meter_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, virtual_meter['id'],))
        if new_values['shopfloors'] is not None and len(new_values['shopfloors']) > 0:
            for shopfloor in new_values['shopfloors']:
                cursor.execute(" SELECT name "
                               " FROM tbl_shopfloors "
                               " WHERE id = %s ", (shopfloor['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.SHOPFLOOR_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_spaces_shopfloors "
                         " WHERE space_id = %s AND shopfloor_id = %s")
                cursor.execute(query, (new_id, shopfloor['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SPACE_SHOPFLOOR_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_spaces_shopfloors (space_id, shopfloor_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, shopfloor['id'],))
        if new_values['combined_equipments'] is not None and len(new_values['combined_equipments']) > 0:
            for combined_equipment in new_values['combined_equipments']:
                cursor.execute(" SELECT name "
                               " FROM tbl_combined_equipments "
                               " WHERE id = %s ", (combined_equipment['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.COMBINED_EQUIPMENT_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_spaces_combined_equipments "
                         " WHERE space_id = %s AND combined_equipment_id = %s")
                cursor.execute(query, (new_id, combined_equipment['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SPACE_COMBINED_EQUIPMENT_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_spaces_combined_equipments (space_id, combined_equipment_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, combined_equipment['id'],))
        if new_values['equipments'] is not None and len(new_values['equipments']) > 0:
            for equipment in new_values['equipments']:
                cursor.execute(" SELECT name "
                               " FROM tbl_equipments "
                               " WHERE id = %s ", (equipment['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.EQUIPMENT_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_spaces_equipments "
                         " WHERE space_id = %s AND equipment_id = %s")
                cursor.execute(query, (new_id, equipment['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SPACE_EQUIPMENT_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_spaces_equipments (space_id, equipment_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, equipment['id'],))
        if new_values['points'] is not None and len(new_values['points']) > 0:
            for point in new_values['points']:
                cursor.execute(" SELECT name "
                               " FROM tbl_points "
                               " WHERE id = %s ", (point['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.POINT_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_spaces_points "
                         " WHERE space_id = %s AND point_id = %s")
                cursor.execute(query, (new_id, point['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SPACE_POINT_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_spaces_points (space_id, point_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, point['id'],))
        if new_values['sensors'] is not None and len(new_values['sensors']) > 0:
            for sensor in new_values['sensors']:
                cursor.execute(" SELECT name "
                               " FROM tbl_sensors "
                               " WHERE id = %s ", (sensor['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.SENSOR_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_spaces_sensors "
                         " WHERE space_id = %s AND sensor_id = %s")
                cursor.execute(query, (new_id, sensor['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SPACE_SENSOR_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_spaces_sensors (space_id, sensor_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, sensor['id'],))
        if new_values['tenants'] is not None and len(new_values['tenants']) > 0:
            for tenant in new_values['tenants']:
                cursor.execute(" SELECT name "
                               " FROM tbl_tenants "
                               " WHERE id = %s ", (tenant['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.TENANT_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_spaces_tenants "
                         " WHERE space_id = %s AND tenant_id = %s")
                cursor.execute(query, (new_id, tenant['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SPACE_TENANT_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_spaces_tenants (space_id, tenant_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, tenant['id'],))
        if new_values['stores'] is not None and len(new_values['stores']) > 0:
            for store in new_values['stores']:
                cursor.execute(" SELECT name "
                               " FROM tbl_stores "
                               " WHERE id = %s ", (store['id'],))
                if cursor.fetchone() is None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.STORE_NOT_FOUND')

                query = (" SELECT id "
                         " FROM tbl_spaces_stores "
                         " WHERE space_id = %s AND store_id = %s")
                cursor.execute(query, (new_id, store['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.SPACE_STORE_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_spaces_stores (space_id, store_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, store['id'],))
            if new_values['working_calendars'] is not None and len(new_values['working_calendars']) > 0:
                for working_calendar in new_values['working_calendars']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_working_calendars "
                                   " WHERE id = %s ", (working_calendar['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.WORKING_CALENDAR_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_working_calendars "
                             " WHERE space_id = %s AND working_calendar_id = %s")
                    cursor.execute(query, (new_id, working_calendar['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_WORKING_CALENDAR_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_working_calendars (space_id, working_calendar_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, working_calendar['id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(new_id)


class SpaceClone:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        # check parameters
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')
        if int(id_) == 1:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.THIS_SPACE_CANNOT_BE_CLONED')
        # connect the database
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        # query all spaces
        query = (" SELECT id, name, uuid "
                 " FROM tbl_spaces ")
        cursor.execute(query)
        rows_spaces = cursor.fetchall()

        space_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                space_dict[row[0]] = {"id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}
        # query all timezones
        query = (" SELECT id, name, utc_offset "
                 " FROM tbl_timezones ")
        cursor.execute(query)
        rows_timezones = cursor.fetchall()

        timezone_dict = dict()
        if rows_timezones is not None and len(rows_timezones) > 0:
            for row in rows_timezones:
                timezone_dict[row[0]] = {"id": row[0],
                                         "name": row[1],
                                         "utc_offset": row[2]}
        # query all contacts
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
        # query all cost centers
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

        # query the source space
        query = (" SELECT id, name, uuid, "
                 "        parent_space_id, area, timezone_id, is_input_counted, is_output_counted, "
                 "        contact_id, cost_center_id, latitude, longitude, description "
                 " FROM tbl_spaces "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')
        else:
            # save the source space properties to meta_result
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "parent_space_id": row[3],
                           "area": row[4],
                           "timezone_id": row[5],
                           "is_input_counted": bool(row[6]),
                           "is_output_counted": bool(row[7]),
                           "contact_id": row[8],
                           "cost_center_id": row[9],
                           "latitude": row[10],
                           "longitude": row[11],
                           "description": row[12],
                           "commands": None,
                           "meters": None,
                           "offline_meters": None,
                           "virtual_meters": None,
                           "shopfloors": None,
                           "combined_equipments": None,
                           "equipments": None,
                           "points": None,
                           "sensors": None,
                           "tenants": None,
                           "stores": None,
                           "working_calendars": None
                           }

            # query associated commands
            query = (" SELECT c.id, c.name "
                     " FROM tbl_spaces s, tbl_spaces_commands sc, tbl_commands c "
                     " WHERE sc.space_id = s.id AND c.id = sc.command_id AND s.id = %s "
                     " ORDER BY c.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            command_list = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    command_list.append(result)
                meta_result['commands'] = command_list

            # query associated meters
            query = (" SELECT m.id, m.name "
                     " FROM tbl_spaces s, tbl_spaces_meters sm, tbl_meters m "
                     " WHERE sm.space_id = s.id AND m.id = sm.meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            meter_list = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    meter_list.append(result)
                meta_result['meters'] = meter_list

            # query associated offline meters
            query = (" SELECT m.id, m.name "
                     " FROM tbl_spaces s, tbl_spaces_offline_meters sm, tbl_offline_meters m "
                     " WHERE sm.space_id = s.id AND m.id = sm.offline_meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            offline_meter_list = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    offline_meter_list.append(result)
                meta_result['offline_meters'] = offline_meter_list

            # query associated virtual meters
            query = (" SELECT m.id, m.name "
                     " FROM tbl_spaces s, tbl_spaces_virtual_meters sm, tbl_virtual_meters m "
                     " WHERE sm.space_id = s.id AND m.id = sm.virtual_meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            virtual_meter_list = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    virtual_meter_list.append(result)
                meta_result['virtual_meters'] = virtual_meter_list

            # query associated shopfloors
            query = (" SELECT sf.id, sf.name "
                     " FROM tbl_spaces sp, tbl_spaces_shopfloors ss, tbl_shopfloors sf "
                     " WHERE ss.space_id = sp.id AND sf.id = ss.shopfloor_id AND sp.id = %s "
                     " ORDER BY sf.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            shopfloor_list = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    shopfloor_list.append(result)
                meta_result['shopfloors'] = shopfloor_list

            # query associated combined equipments
            query = (" SELECT e.id, e.name "
                     " FROM tbl_spaces s, tbl_spaces_combined_equipments se, tbl_combined_equipments e "
                     " WHERE se.space_id = s.id AND e.id = se.combined_equipment_id AND s.id = %s "
                     " ORDER BY e.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            combined_equipment_list = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    combined_equipment_list.append(result)
                meta_result['combined_equipments'] = combined_equipment_list

            # query associated equipments
            query = (" SELECT e.id, e.name "
                     " FROM tbl_spaces s, tbl_spaces_equipments se, tbl_equipments e "
                     " WHERE se.space_id = s.id AND e.id = se.equipment_id AND s.id = %s "
                     " ORDER BY e.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            equipment_list = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    equipment_list.append(result)
                meta_result['equipments'] = equipment_list

            # query associated points
            query = (" SELECT p.id, p.name "
                     " FROM tbl_spaces s, tbl_spaces_points sp, tbl_points p "
                     " WHERE sp.space_id = s.id AND p.id = sp.point_id AND s.id = %s "
                     " ORDER BY p.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            point_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    point_result.append(result)
                meta_result['points'] = point_result

            # query associated sensors
            query = (" SELECT se.id, se.name "
                     " FROM tbl_spaces sp, tbl_spaces_sensors ss, tbl_sensors se "
                     " WHERE ss.space_id = sp.id AND se.id = ss.sensor_id AND sp.id = %s "
                     " ORDER BY se.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            sensor_list = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    sensor_list.append(result)
                meta_result['sensors'] = sensor_list

            # query associated tenants
            query = (" SELECT t.id, t.name "
                     " FROM tbl_spaces s, tbl_spaces_tenants st, tbl_tenants t "
                     " WHERE st.space_id = s.id AND t.id = st.tenant_id AND s.id = %s "
                     " ORDER BY t.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            tenant_list = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    tenant_list.append(result)
                meta_result['tenants'] = tenant_list

            # query associated stores
            query = (" SELECT t.id, t.name "
                     " FROM tbl_spaces s, tbl_spaces_stores st, tbl_stores t "
                     " WHERE st.space_id = s.id AND t.id = st.store_id AND s.id = %s "
                     " ORDER BY t.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            store_list = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    store_list.append(result)
                meta_result['stores'] = store_list

            # query associated working calendars
            query = (" SELECT wc.id, wc.name "
                     " FROM tbl_spaces s, tbl_spaces_working_calendars swc, tbl_working_calendars wc "
                     " WHERE swc.space_id = s.id AND wc.id = swc.working_calendar_id AND s.id = %s "
                     " ORDER BY wc.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            working_calendar_list = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1]}
                    working_calendar_list.append(result)
                meta_result['working_calendars'] = working_calendar_list

            # generate name for new space
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = (str.strip(meta_result['name'])
                        + (datetime.now()
                           + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))

            # save new space to database
            add_values = (" INSERT INTO tbl_spaces "
                          "    (name, uuid, parent_space_id, area, timezone_id, is_input_counted, is_output_counted, "
                          "     contact_id, cost_center_id, latitude, longitude, description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['parent_space_id'],
                                        meta_result['area'],
                                        meta_result['timezone_id'],
                                        meta_result['is_input_counted'],
                                        meta_result['is_output_counted'],
                                        meta_result['contact_id'],
                                        meta_result['cost_center_id'],
                                        meta_result['latitude'],
                                        meta_result['longitude'],
                                        meta_result['description']))
            new_id = cursor.lastrowid

            # associate commands with new space
            if meta_result['commands'] is not None and len(meta_result['commands']) > 0:
                for command in meta_result['commands']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_commands "
                                   " WHERE id = %s ", (command['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.COMMAND_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_commands "
                             " WHERE space_id = %s AND command_id = %s")
                    cursor.execute(query, (new_id, command['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_COMMAND_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_commands (space_id, command_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, command['id'],))

            # associate meters with new space
            if meta_result['meters'] is not None and len(meta_result['meters']) > 0:
                for meter in meta_result['meters']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_meters "
                                   " WHERE id = %s ", (meter['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.METER_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_meters "
                             " WHERE space_id = %s AND meter_id = %s")
                    cursor.execute(query, (new_id, meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_METER_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_meters (space_id, meter_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, meter['id'],))

            # associate offline meters with new space
            if meta_result['offline_meters'] is not None and len(meta_result['offline_meters']) > 0:
                for offline_meter in meta_result['offline_meters']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_offline_meters "
                                   " WHERE id = %s ", (offline_meter['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.OFFLINE_METER_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_offline_meters "
                             " WHERE space_id = %s AND offline_meter_id = %s")
                    cursor.execute(query, (new_id, offline_meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_OFFLINE_METER_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_offline_meters (space_id, offline_meter_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, offline_meter['id'],))

            # associate virtual meters with new space
            if meta_result['virtual_meters'] is not None and len(meta_result['virtual_meters']) > 0:
                for virtual_meter in meta_result['virtual_meters']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_virtual_meters "
                                   " WHERE id = %s ", (virtual_meter['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.VIRTUAL_METER_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_virtual_meters "
                             " WHERE space_id = %s AND virtual_meter_id = %s")
                    cursor.execute(query, (new_id, virtual_meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_VIRTUAL_METER_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_virtual_meters (space_id, virtual_meter_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, virtual_meter['id'],))

            # associate shopfloors with new space
            if meta_result['shopfloors'] is not None and len(meta_result['shopfloors']) > 0:
                for shopfloor in meta_result['shopfloors']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_shopfloors "
                                   " WHERE id = %s ", (shopfloor['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.SHOPFLOOR_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_shopfloors "
                             " WHERE space_id = %s AND shopfloor_id = %s")
                    cursor.execute(query, (new_id, shopfloor['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_SHOPFLOOR_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_shopfloors (space_id, shopfloor_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, shopfloor['id'],))

            # associate combined equipments with new space
            if meta_result['combined_equipments'] is not None and len(meta_result['combined_equipments']) > 0:
                for combined_equipment in meta_result['combined_equipments']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_combined_equipments "
                                   " WHERE id = %s ", (combined_equipment['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.COMBINED_EQUIPMENT_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_combined_equipments "
                             " WHERE space_id = %s AND combined_equipment_id = %s")
                    cursor.execute(query, (new_id, combined_equipment['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_COMBINED_EQUIPMENT_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_combined_equipments (space_id, combined_equipment_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, combined_equipment['id'],))

            # associate equipments with new space
            if meta_result['equipments'] is not None and len(meta_result['equipments']) > 0:
                for equipment in meta_result['equipments']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_equipments "
                                   " WHERE id = %s ", (equipment['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.EQUIPMENT_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_equipments "
                             " WHERE space_id = %s AND equipment_id = %s")
                    cursor.execute(query, (new_id, equipment['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_EQUIPMENT_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_equipments (space_id, equipment_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, equipment['id'],))

            # associate points with new space
            if meta_result['points'] is not None and len(meta_result['points']) > 0:
                for point in meta_result['points']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_points "
                                   " WHERE id = %s ", (point['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.POINT_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_points "
                             " WHERE space_id = %s AND point_id = %s")
                    cursor.execute(query, (new_id, point['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_POINT_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_points (space_id, point_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, point['id'],))

            # associate sensors with new space
            if meta_result['sensors'] is not None and len(meta_result['sensors']) > 0:
                for sensor in meta_result['sensors']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_sensors "
                                   " WHERE id = %s ", (sensor['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.SENSOR_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_sensors "
                             " WHERE space_id = %s AND sensor_id = %s")
                    cursor.execute(query, (new_id, sensor['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_SENSOR_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_sensors (space_id, sensor_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, sensor['id'],))

            # associate tenants with new space
            if meta_result['tenants'] is not None and len(meta_result['tenants']) > 0:
                for tenant in meta_result['tenants']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_tenants "
                                   " WHERE id = %s ", (tenant['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.TENANT_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_tenants "
                             " WHERE space_id = %s AND tenant_id = %s")
                    cursor.execute(query, (new_id, tenant['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_TENANT_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_tenants (space_id, tenant_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, tenant['id'],))

            # associate stores with new space
            if meta_result['stores'] is not None and len(meta_result['stores']) > 0:
                for store in meta_result['stores']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_stores "
                                   " WHERE id = %s ", (store['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.STORE_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_stores "
                             " WHERE space_id = %s AND store_id = %s")
                    cursor.execute(query, (new_id, store['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_STORE_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_stores (space_id, store_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, store['id'],))

            # associate working calendars with new space
            if meta_result['working_calendars'] is not None and len(meta_result['working_calendars']) > 0:
                for working_calendar in meta_result['working_calendars']:
                    cursor.execute(" SELECT name "
                                   " FROM tbl_working_calendars "
                                   " WHERE id = %s ", (working_calendar['id'],))
                    if cursor.fetchone() is None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.WORKING_CALENDAR_NOT_FOUND')

                    query = (" SELECT id "
                             " FROM tbl_spaces_working_calendars "
                             " WHERE space_id = %s AND working_calendar_id = %s")
                    cursor.execute(query, (new_id, working_calendar['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.SPACE_WORKING_CALENDAR_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_spaces_working_calendars (space_id, working_calendar_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, working_calendar['id'],))

            # todo: associate more objects with new space

            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/spaces/' + str(new_id)


class SpaceEnergyFlowDiagramCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

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
                                   description='API.INVALID_SPACE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        query = (" SELECT e.id, e.name, e.uuid "
                 " FROM tbl_spaces s, tbl_spaces_energy_flow_diagrams se, tbl_energy_flow_diagrams e "
                 " WHERE se.space_id = s.id AND e.id = se.energy_flow_diagram_id AND s.id = %s "
                 " ORDER BY e.id ")
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
                                   description='API.INVALID_SPACE_ID')

        new_values = json.loads(raw_json)

        if 'energy_flow_diagram_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['energy_flow_diagram_id'], int) or \
                new_values['data']['energy_flow_diagram_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')
        energy_flow_diagram_id = new_values['data']['energy_flow_diagram_id']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " from tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (energy_flow_diagram_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_spaces_energy_flow_diagrams "
                 " WHERE space_id = %s AND energy_flow_diagram_id = %s")
        cursor.execute(query, (id_, energy_flow_diagram_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.SPACE_ENERGY_FLOW_DIAGRAM_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_spaces_energy_flow_diagrams (space_id, energy_flow_diagram_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, energy_flow_diagram_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/equipments/' + str(energy_flow_diagram_id)


class SpaceEnergyFlowDiagramItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_, eid):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, eid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if not eid.isdigit() or int(eid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (eid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_spaces_energy_flow_diagrams "
                       " WHERE space_id = %s AND energy_flow_diagram_id = %s ", (id_, eid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_ENERGY_FLOW_DIAGRAM_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_spaces_energy_flow_diagrams "
                       " WHERE space_id = %s AND energy_flow_diagram_id = %s ", (id_, eid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204
