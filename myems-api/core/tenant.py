import uuid
from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class TenantCollection:
    def __init__(self):
        """"Initializes TenantCollection"""
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
                 " FROM tbl_tenant_types ")
        cursor.execute(query)
        rows_tenant_types = cursor.fetchall()

        tenant_type_dict = dict()
        if rows_tenant_types is not None and len(rows_tenant_types) > 0:
            for row in rows_tenant_types:
                tenant_type_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

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
                 "        buildings, floors, rooms, area, tenant_type_id, "
                 "        is_input_counted, is_key_tenant, "
                 "        lease_number, lease_start_datetime_utc, lease_end_datetime_utc, is_in_lease, "
                 "        contact_id, cost_center_id, description "
                 " FROM tbl_tenants "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_spaces = cursor.fetchall()

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result = list()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:

                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "buildings": row[3],
                               "floors": row[4],
                               "rooms": row[5],
                               "area": row[6],
                               "tenant_type": tenant_type_dict.get(row[7], None),
                               "is_input_counted": bool(row[8]),
                               "is_key_tenant": bool(row[9]),
                               "lease_number": row[10],
                               "lease_start_datetime":
                                   (row[11].replace(tzinfo=timezone.utc) +
                                    timedelta(minutes=timezone_offset)).strftime('%Y-%m-%dT%H:%M:%S'),
                               "lease_end_datetime": (row[12].replace(tzinfo=timezone.utc) +
                                                      timedelta(minutes=timezone_offset)).strftime('%Y-%m-%dT%H:%M:%S'),
                               "is_in_lease": bool(row[13]),
                               "contact": contact_dict.get(row[14], None),
                               "cost_center": cost_center_dict.get(row[15], None),
                               "description": row[16],
                               "qrcode": 'tenant:' + row[2]}
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
                                   description='API.INVALID_TENANT_NAME')
        name = str.strip(new_values['data']['name'])

        if 'buildings' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['buildings'], str) or \
                len(str.strip(new_values['data']['buildings'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BUILDINGS_VALUE')
        buildings = str.strip(new_values['data']['buildings'])

        if 'floors' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['floors'], str) or \
                len(str.strip(new_values['data']['floors'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FLOORS_VALUE')
        floors = str.strip(new_values['data']['floors'])

        if 'rooms' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['rooms'], str) or \
                len(str.strip(new_values['data']['rooms'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ROOMS_VALUE')
        rooms = str.strip(new_values['data']['rooms'])

        if 'area' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['area'], float) or
                     isinstance(new_values['data']['area'], int)) or \
                new_values['data']['area'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_AREA_VALUE')
        area = new_values['data']['area']

        if 'tenant_type_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['tenant_type_id'], int) or \
                new_values['data']['tenant_type_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_TYPE_ID')
        tenant_type_id = new_values['data']['tenant_type_id']

        if 'is_input_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['data']['is_input_counted']

        if 'is_key_tenant' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_key_tenant'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_KEY_TENANT_VALUE')
        is_key_tenant = new_values['data']['is_key_tenant']

        if 'lease_number' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['lease_number'], str) or \
                len(str.strip(new_values['data']['lease_number'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LEASE_NUMBER_VALUE')
        lease_number = str.strip(new_values['data']['lease_number'])

        if 'is_in_lease' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_in_lease'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_IN_LEASE_VALUE')
        is_in_lease = new_values['data']['is_in_lease']

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # todo: validate datetime values
        lease_start_datetime_utc = datetime.strptime(new_values['data']['lease_start_datetime'],
                                                     '%Y-%m-%dT%H:%M:%S')
        lease_start_datetime_utc = lease_start_datetime_utc.replace(tzinfo=timezone.utc)
        lease_start_datetime_utc -= timedelta(minutes=timezone_offset)

        lease_end_datetime_utc = datetime.strptime(new_values['data']['lease_end_datetime'],
                                                   '%Y-%m-%dT%H:%M:%S')
        lease_end_datetime_utc = lease_end_datetime_utc.replace(tzinfo=timezone.utc)
        lease_end_datetime_utc -= timedelta(minutes=timezone_offset)

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
                       " FROM tbl_tenants "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TENANT_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_tenant_types "
                       " WHERE id = %s ",
                       (tenant_type_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_TYPE_NOT_FOUND')

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

        add_values = (" INSERT INTO tbl_tenants "
                      "    (name, uuid, buildings, floors, rooms, area, tenant_type_id, "
                      "     is_input_counted, is_key_tenant, "
                      "     lease_number, lease_start_datetime_utc, lease_end_datetime_utc, is_in_lease, "
                      "     contact_id, cost_center_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    buildings,
                                    floors,
                                    rooms,
                                    area,
                                    tenant_type_id,
                                    is_input_counted,
                                    is_key_tenant,
                                    lease_number,
                                    lease_start_datetime_utc,
                                    lease_end_datetime_utc,
                                    is_in_lease,
                                    contact_id,
                                    cost_center_id,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/tenants/' + str(new_id)


class TenantItem:
    def __init__(self):
        """"Initializes TenantItem"""
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
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_tenant_types ")
        cursor.execute(query)
        rows_tenant_types = cursor.fetchall()

        tenant_type_dict = dict()
        if rows_tenant_types is not None and len(rows_tenant_types) > 0:
            for row in rows_tenant_types:
                tenant_type_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

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
                 "        buildings, floors, rooms, area, tenant_type_id,"
                 "        is_key_tenant, is_input_counted, "
                 "        lease_number, lease_start_datetime_utc, lease_end_datetime_utc, is_in_lease, "
                 "        contact_id, cost_center_id, description "
                 " FROM tbl_tenants "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')
        else:
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset

            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "buildings": row[3],
                           "floors": row[4],
                           "rooms": row[5],
                           "area": row[6],
                           "tenant_type": tenant_type_dict.get(row[7], None),
                           "is_key_tenant": bool(row[8]),
                           "is_input_counted": bool(row[9]),
                           "lease_number": row[10],
                           "lease_start_datetime": (row[11].replace(tzinfo=timezone.utc) +
                                                    timedelta(minutes=timezone_offset)).strftime('%Y-%m-%dT%H:%M:%S'),
                           "lease_end_datetime": (row[12].replace(tzinfo=timezone.utc) +
                                                  timedelta(minutes=timezone_offset)).strftime('%Y-%m-%dT%H:%M:%S'),
                           "is_in_lease": bool(row[13]),
                           "contact": contact_dict.get(row[14], None),
                           "cost_center": cost_center_dict.get(row[15], None),
                           "description": row[16],
                           "qrcode": 'tenant:' + row[2]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        # check relation with space
        cursor.execute(" SELECT space_id "
                       " FROM tbl_spaces_tenants "
                       " WHERE tenant_id = %s ",
                       (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # delete relation with meter
        cursor.execute(" DELETE FROM tbl_tenants_meters WHERE tenant_id = %s ", (id_,))

        # delete relation with offline meter
        cursor.execute(" DELETE FROM tbl_tenants_offline_meters WHERE tenant_id = %s ", (id_,))

        # delete relation with points
        cursor.execute(" DELETE FROM tbl_tenants_points WHERE tenant_id = %s ", (id_,))

        # delete relation with sensor
        cursor.execute(" DELETE FROM tbl_tenants_sensors WHERE tenant_id = %s ", (id_,))

        # delete relation with virtual meter
        cursor.execute(" DELETE FROM tbl_tenants_virtual_meters WHERE tenant_id = %s ", (id_,))

        # delete relation with command
        cursor.execute(" DELETE FROM tbl_tenants_commands WHERE tenant_id = %s ", (id_,))

        # delete relation with working calendar
        cursor.execute(" DELETE FROM tbl_tenants_working_calendars WHERE tenant_id = %s ", (id_,))

        cursor.execute(" DELETE FROM tbl_tenants WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_TENANT_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_NAME')
        name = str.strip(new_values['data']['name'])

        if 'buildings' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['buildings'], str) or \
                len(str.strip(new_values['data']['buildings'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BUILDINGS_VALUE')
        buildings = str.strip(new_values['data']['buildings'])

        if 'floors' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['floors'], str) or \
                len(str.strip(new_values['data']['floors'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FLOORS_VALUE')
        floors = str.strip(new_values['data']['floors'])

        if 'rooms' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['rooms'], str) or \
                len(str.strip(new_values['data']['rooms'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ROOMS_VALUE')
        rooms = str.strip(new_values['data']['rooms'])

        if 'area' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['area'], float) or
                     isinstance(new_values['data']['area'], int)) or \
                new_values['data']['area'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_AREA_VALUE')
        area = new_values['data']['area']

        if 'tenant_type_id' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['tenant_type_id'], int) or \
                new_values['data']['tenant_type_id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_TYPE_ID')
        tenant_type_id = new_values['data']['tenant_type_id']

        if 'is_input_counted' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['data']['is_input_counted']

        if 'is_key_tenant' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_key_tenant'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_KEY_TENANT_VALUE')
        is_key_tenant = new_values['data']['is_key_tenant']

        if 'lease_number' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['lease_number'], str) or \
                len(str.strip(new_values['data']['lease_number'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LEASE_NUMBER_VALUE')
        lease_number = str.strip(new_values['data']['lease_number'])

        if 'is_in_lease' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_in_lease'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_IN_LEASE_VALUE')
        is_in_lease = new_values['data']['is_in_lease']

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # todo: validate datetime values
        lease_start_datetime_utc = datetime.strptime(new_values['data']['lease_start_datetime'],
                                                     '%Y-%m-%dT%H:%M:%S')
        lease_start_datetime_utc = lease_start_datetime_utc.replace(tzinfo=timezone.utc)
        lease_start_datetime_utc -= timedelta(minutes=timezone_offset)

        lease_end_datetime_utc = datetime.strptime(new_values['data']['lease_end_datetime'],
                                                   '%Y-%m-%dT%H:%M:%S')
        lease_end_datetime_utc = lease_end_datetime_utc.replace(tzinfo=timezone.utc)
        lease_end_datetime_utc -= timedelta(minutes=timezone_offset)

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
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TENANT_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_tenant_types "
                       " WHERE id = %s ",
                       (tenant_type_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_TYPE_NOT_FOUND')

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

        update_row = (" UPDATE tbl_tenants "
                      " SET name = %s, buildings = %s, floors = %s, rooms = %s, area = %s, "
                      "     tenant_type_id = %s, is_input_counted = %s, "
                      "     is_key_tenant = %s, lease_number = %s, lease_start_datetime_utc = %s, "
                      "     lease_end_datetime_utc = %s, is_in_lease = %s, contact_id = %s, cost_center_id = %s, "
                      "     description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    buildings,
                                    floors,
                                    rooms,
                                    area,
                                    tenant_type_id,
                                    is_input_counted,
                                    is_key_tenant,
                                    lease_number,
                                    lease_start_datetime_utc,
                                    lease_end_datetime_utc,
                                    is_in_lease,
                                    contact_id,
                                    cost_center_id,
                                    description,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class TenantMeterCollection:
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
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

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
                 " FROM tbl_tenants t, tbl_tenants_meters tm, tbl_meters m "
                 " WHERE tm.tenant_id = t.id AND m.id = tm.meter_id AND t.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
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
                                   description='API.INVALID_TENANT_ID')

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
                       " from tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_tenants_meters "
                 " WHERE tenant_id = %s AND meter_id = %s")
        cursor.execute(query, (id_, meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.TENANT_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_tenants_meters (tenant_id, meter_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, meter_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/tenants/' + str(id_) + '/meters/' + str(meter_id)


class TenantMeterItem:
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
                                   description='API.INVALID_TENANT_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_tenants_meters "
                       " WHERE tenant_id = %s AND meter_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_tenants_meters WHERE tenant_id = %s AND meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class TenantOfflineMeterCollection:
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
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

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
                 " FROM tbl_tenants s, tbl_tenants_offline_meters sm, tbl_offline_meters m "
                 " WHERE sm.tenant_id = s.id AND m.id = sm.offline_meter_id AND s.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
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
                                   description='API.INVALID_TENANT_ID')

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
                       " from tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (offline_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_tenants_offline_meters "
                 " WHERE tenant_id = %s AND offline_meter_id = %s")
        cursor.execute(query, (id_, offline_meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.TENANT_OFFLINE_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_tenants_offline_meters (tenant_id, offline_meter_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, offline_meter_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/tenants/' + str(id_) + '/offlinemeters/' + str(offline_meter_id)


class TenantOfflineMeterItem:
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
                                   description='API.INVALID_TENANT_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_offline_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_tenants_offline_meters "
                       " WHERE tenant_id = %s AND offline_meter_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_OFFLINE_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_tenants_offline_meters "
                       " WHERE tenant_id = %s AND offline_meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class TenantPointCollection:
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
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

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
                 " FROM tbl_tenants t, tbl_tenants_points tp, tbl_points p "
                 " WHERE tp.tenant_id = t.id AND p.id = tp.point_id AND t.id = %s "
                 " ORDER BY p.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "data_source": data_source_dict.get(row[2], None)}
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
                                   description='API.INVALID_TENANT_ID')

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
                       " from tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (point_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_tenants_points "
                 " WHERE tenant_id = %s AND point_id = %s")
        cursor.execute(query, (id_, point_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.TENANT_POINT_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_tenants_points (tenant_id, point_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, point_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/tenants/' + str(id_) + '/points/' + str(point_id)


class TenantPointItem:
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
                                   description='API.INVALID_TENANT_ID')

        if not pid.isdigit() or int(pid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_POINT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_points "
                       " WHERE id = %s ", (pid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.POINT_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_tenants_points "
                       " WHERE tenant_id = %s AND point_id = %s ", (id_, pid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_POINT_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_tenants_points "
                       " WHERE tenant_id = %s AND point_id = %s ", (id_, pid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class TenantSensorCollection:
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
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        query = (" SELECT s.id, s.name, s.uuid "
                 " FROM tbl_tenants t, tbl_tenants_sensors ts, tbl_sensors s "
                 " WHERE ts.tenant_id = t.id AND s.id = ts.sensor_id AND t.id = %s "
                 " ORDER BY s.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2]}
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
                                   description='API.INVALID_TENANT_ID')

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
                       " from tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_sensors "
                       " WHERE id = %s ", (sensor_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SENSOR_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_tenants_sensors "
                 " WHERE tenant_id = %s AND sensor_id = %s")
        cursor.execute(query, (id_, sensor_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.TENANT_SENSOR_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_tenants_sensors (tenant_id, sensor_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, sensor_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/tenants/' + str(id_) + '/sensors/' + str(sensor_id)


class TenantSensorItem:
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
                                   description='API.INVALID_TENANT_ID')

        if not sid.isdigit() or int(sid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SENSOR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_sensors "
                       " WHERE id = %s ", (sid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SENSOR_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_tenants_sensors "
                       " WHERE tenant_id = %s AND sensor_id = %s ", (id_, sid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_SENSOR_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_tenants_sensors WHERE tenant_id = %s AND sensor_id = %s ", (id_, sid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class TenantVirtualMeterCollection:
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
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

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
                 " FROM tbl_tenants t, tbl_tenants_virtual_meters tm, tbl_virtual_meters m "
                 " WHERE tm.tenant_id = t.id AND m.id = tm.virtual_meter_id AND t.id = %s "
                 " ORDER BY m.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
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
                                   description='API.INVALID_TENANT_ID')

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
                       " from tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (virtual_meter_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_tenants_virtual_meters "
                 " WHERE tenant_id = %s AND virtual_meter_id = %s")
        cursor.execute(query, (id_, virtual_meter_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.TENANT_VIRTUAL_METER_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_tenants_virtual_meters (tenant_id, virtual_meter_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, virtual_meter_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/tenants/' + str(id_) + '/virtualmeters/' + str(virtual_meter_id)


class TenantVirtualMeterItem:
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
                                   description='API.INVALID_TENANT_ID')

        if not mid.isdigit() or int(mid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_virtual_meters "
                       " WHERE id = %s ", (mid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.VIRTUAL_METER_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_tenants_virtual_meters "
                       " WHERE tenant_id = %s AND virtual_meter_id = %s ", (id_, mid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_VIRTUAL_METER_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_tenants_virtual_meters "
                       " WHERE tenant_id = %s AND virtual_meter_id = %s ", (id_, mid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class TenantWorkingCalendarCollection:
    def __init__(self):
        """Initializes TenantWorkingCalendarCollection Class"""
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
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        query = (" SELECT wc.id, wc.name, wc.description "
                 " FROM tbl_tenants t, tbl_tenants_working_calendars twc, tbl_working_calendars wc "
                 " WHERE twc.tenant_id = t.id AND wc.id = twc.working_calendar_id AND t.id = %s "
                 " ORDER BY wc.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "description": row[2]}
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
                                   description='API.INVALID_TENANT_ID')

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
                       " from tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_working_calendars "
                       " WHERE id = %s ", (working_calendar_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WORKING_CALENDAR_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_tenants_working_calendars "
                 " WHERE tenant_id = %s AND working_calendar_id = %s")
        cursor.execute(query, (id_, working_calendar_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.TENANT_WORKING_CALENDAR_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_tenants_working_calendars (tenant_id, working_calendar_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, working_calendar_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/tenants/' + str(id_) + '/workingcalendars/' + str(working_calendar_id)


class TenantWorkingCalendarItem:
    def __init__(self):
        """Initializes TenantWorkingCalendarItem Class"""
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
                                   description='API.INVALID_TENANT_ID')

        if not wcid.isdigit() or int(wcid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORKING_CALENDAR_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_working_calendars "
                       " WHERE id = %s ", (wcid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.WORKING_CALENDAR_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_tenants_working_calendars "
                       " WHERE tenant_id = %s AND working_calendar_id = %s ", (id_, wcid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_WORKING_CALENDAR_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_tenants_working_calendars "
                       " WHERE tenant_id = %s AND working_calendar_id = %s ", (id_, wcid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class TenantCommandCollection:
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
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        query = (" SELECT c.id, c.name, c.uuid "
                 " FROM tbl_tenants t, tbl_tenants_commands tc, tbl_commands c "
                 " WHERE tc.tenant_id = t.id AND c.id = tc.command_id AND t.id = %s "
                 " ORDER BY c.id ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2]}
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
                                   description='API.INVALID_TENANT_ID')

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
                       " from tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (command_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        query = (" SELECT id " 
                 " FROM tbl_tenants_commands "
                 " WHERE tenant_id = %s AND command_id = %s")
        cursor.execute(query, (id_, command_id,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.TENANT_COMMAND_RELATION_EXISTS')

        add_row = (" INSERT INTO tbl_tenants_commands (tenant_id, command_id) "
                   " VALUES (%s, %s) ")
        cursor.execute(add_row, (id_, command_id,))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/tenants/' + str(id_) + '/commands/' + str(command_id)


class TenantCommandItem:
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
                                   description='API.INVALID_TENANT_ID')

        if not cid.isdigit() or int(cid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COMMAND_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tenants "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_commands "
                       " WHERE id = %s ", (cid,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.COMMAND_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_tenants_commands "
                       " WHERE tenant_id = %s AND command_id = %s ", (id_, cid))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_COMMAND_RELATION_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_tenants_commands WHERE tenant_id = %s AND command_id = %s ", (id_, cid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class TenantExport:
    def __init__(self):
        """"Initializes TenantExport"""
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
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_tenant_types ")
        cursor.execute(query)
        rows_tenant_types = cursor.fetchall()

        tenant_type_dict = dict()
        if rows_tenant_types is not None and len(rows_tenant_types) > 0:
            for row in rows_tenant_types:
                tenant_type_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

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
                 "        buildings, floors, rooms, area, tenant_type_id,"
                 "        is_key_tenant, is_input_counted, "
                 "        lease_number, lease_start_datetime_utc, lease_end_datetime_utc, is_in_lease, "
                 "        contact_id, cost_center_id, description "
                 " FROM tbl_tenants "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')
        else:
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset

            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "buildings": row[3],
                           "floors": row[4],
                           "rooms": row[5],
                           "area": row[6],
                           "tenant_type": tenant_type_dict.get(row[7], None),
                           "is_key_tenant": bool(row[8]),
                           "is_input_counted": bool(row[9]),
                           "lease_number": row[10],
                           "lease_start_datetime": (row[11].replace(tzinfo=timezone.utc) +
                                                    timedelta(minutes=timezone_offset)).strftime('%Y-%m-%dT%H:%M:%S'),
                           "lease_end_datetime": (row[12].replace(tzinfo=timezone.utc) +
                                                  timedelta(minutes=timezone_offset)).strftime('%Y-%m-%dT%H:%M:%S'),
                           "is_in_lease": bool(row[13]),
                           "contact": contact_dict.get(row[14], None),
                           "cost_center": cost_center_dict.get(row[15], None),
                           "description": row[16],
                           "commands": None,
                           "meters": None,
                           "offline_meters": None,
                           "virtual_meters": None,
                           "points": None,
                           "sensors": None,
                           "working_calendars": None
                           }
            query = (" SELECT c.id, c.name, c.uuid "
                     " FROM tbl_tenants t, tbl_tenants_commands tc, tbl_commands c "
                     " WHERE tc.tenant_id = t.id AND c.id = tc.command_id AND t.id = %s "
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
                     " FROM tbl_tenants t, tbl_tenants_meters tm, tbl_meters m "
                     " WHERE tm.tenant_id = t.id AND m.id = tm.meter_id AND t.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            meter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    energy_category = energy_category_dict.get(row[3], None)
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category}
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
                     " FROM tbl_tenants s, tbl_tenants_offline_meters sm, tbl_offline_meters m "
                     " WHERE sm.tenant_id = s.id AND m.id = sm.offline_meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            offlinemeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    energy_category = energy_category_dict.get(row[3], None)
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category}
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
                     " FROM tbl_tenants t, tbl_tenants_virtual_meters tm, tbl_virtual_meters m "
                     " WHERE tm.tenant_id = t.id AND m.id = tm.virtual_meter_id AND t.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            virtualmeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    energy_category = energy_category_dict.get(row[3], None)
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category}
                    virtualmeter_result.append(result)
                meta_result['virtual_meters'] = virtualmeter_result
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
                     " FROM tbl_tenants t, tbl_tenants_points tp, tbl_points p "
                     " WHERE tp.tenant_id = t.id AND p.id = tp.point_id AND t.id = %s "
                     " ORDER BY p.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            point_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    data_source = data_source_dict.get(row[2], None)
                    result = {"id": row[0], "name": row[1], "data_source": data_source}
                    point_result.append(result)
                meta_result['points'] = point_result
            query = (" SELECT s.id, s.name, s.uuid "
                     " FROM tbl_tenants t, tbl_tenants_sensors ts, tbl_sensors s "
                     " WHERE ts.tenant_id = t.id AND s.id = ts.sensor_id AND t.id = %s "
                     " ORDER BY s.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            sensor_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    sensor_result.append(result)
                meta_result['sensors'] = sensor_result
            query = (" SELECT wc.id, wc.name, wc.description "
                     " FROM tbl_tenants t, tbl_tenants_working_calendars twc, tbl_working_calendars wc "
                     " WHERE twc.tenant_id = t.id AND wc.id = twc.working_calendar_id AND t.id = %s "
                     " ORDER BY wc.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            workingcalendars_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "description": row[2]}
                    workingcalendars_result.append(result)
                meta_result['working_calendars'] = workingcalendars_result

        cursor.close()
        cnx.close()
        resp.text = json.dumps(meta_result)


class TenantImport:
    def __init__(self):
        """"Initializes TenantImport"""
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
                                   description='API.INVALID_TENANT_NAME')
        name = str.strip(new_values['name'])

        if 'buildings' not in new_values.keys() or \
                not isinstance(new_values['buildings'], str) or \
                len(str.strip(new_values['buildings'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BUILDINGS_VALUE')
        buildings = str.strip(new_values['buildings'])

        if 'floors' not in new_values.keys() or \
                not isinstance(new_values['floors'], str) or \
                len(str.strip(new_values['floors'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_FLOORS_VALUE')
        floors = str.strip(new_values['floors'])

        if 'rooms' not in new_values.keys() or \
                not isinstance(new_values['rooms'], str) or \
                len(str.strip(new_values['rooms'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ROOMS_VALUE')
        rooms = str.strip(new_values['rooms'])

        if 'area' not in new_values.keys() or \
                not (isinstance(new_values['area'], float) or
                     isinstance(new_values['area'], int)) or \
                new_values['area'] <= 0.0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_AREA_VALUE')
        area = new_values['area']

        if 'id' not in new_values['tenant_type'].keys() or \
                not isinstance(new_values['tenant_type']['id'], int) or \
                new_values['tenant_type']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TENANT_TYPE_ID')
        tenant_type_id = new_values['tenant_type']['id']

        if 'is_input_counted' not in new_values.keys() or \
                not isinstance(new_values['is_input_counted'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_INPUT_COUNTED_VALUE')
        is_input_counted = new_values['is_input_counted']

        if 'is_key_tenant' not in new_values.keys() or \
                not isinstance(new_values['is_key_tenant'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_KEY_TENANT_VALUE')
        is_key_tenant = new_values['is_key_tenant']

        if 'lease_number' not in new_values.keys() or \
                not isinstance(new_values['lease_number'], str) or \
                len(str.strip(new_values['lease_number'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_LEASE_NUMBER_VALUE')
        lease_number = str.strip(new_values['lease_number'])

        if 'is_in_lease' not in new_values.keys() or \
                not isinstance(new_values['is_in_lease'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_IN_LEASE_VALUE')
        is_in_lease = new_values['is_in_lease']

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # todo: validate datetime values
        lease_start_datetime_utc = datetime.strptime(new_values['lease_start_datetime'],
                                                     '%Y-%m-%dT%H:%M:%S')
        lease_start_datetime_utc = lease_start_datetime_utc.replace(tzinfo=timezone.utc)
        lease_start_datetime_utc -= timedelta(minutes=timezone_offset)

        lease_end_datetime_utc = datetime.strptime(new_values['lease_end_datetime'],
                                                   '%Y-%m-%dT%H:%M:%S')
        lease_end_datetime_utc = lease_end_datetime_utc.replace(tzinfo=timezone.utc)
        lease_end_datetime_utc -= timedelta(minutes=timezone_offset)

        if 'id' not in new_values['contact'].keys() or \
                not isinstance(new_values['contact']['id'], int) or \
                new_values['contact']['id'] <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTACT_ID')
        contact_id = new_values['contact']['id']

        if 'id' not in new_values['cost_center'].keys() or \
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
                       " FROM tbl_tenants "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TENANT_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_tenant_types "
                       " WHERE id = %s ",
                       (tenant_type_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_TYPE_NOT_FOUND')

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

        add_values = (" INSERT INTO tbl_tenants "
                      "    (name, uuid, buildings, floors, rooms, area, tenant_type_id, "
                      "     is_input_counted, is_key_tenant, "
                      "     lease_number, lease_start_datetime_utc, lease_end_datetime_utc, is_in_lease, "
                      "     contact_id, cost_center_id, description) "
                      " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    buildings,
                                    floors,
                                    rooms,
                                    area,
                                    tenant_type_id,
                                    is_input_counted,
                                    is_key_tenant,
                                    lease_number,
                                    lease_start_datetime_utc,
                                    lease_end_datetime_utc,
                                    is_in_lease,
                                    contact_id,
                                    cost_center_id,
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
                         " FROM tbl_tenants_commands "
                         " WHERE tenant_id = %s AND command_id = %s")
                cursor.execute(query, (new_id, command['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.TENANT_COMMAND_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_tenants_commands (tenant_id, command_id) "
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
                         " FROM tbl_tenants_meters "
                         " WHERE tenant_id = %s AND meter_id = %s")
                cursor.execute(query, (new_id, meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.TENANT_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_tenants_meters (tenant_id, meter_id) "
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
                         " FROM tbl_tenants_offline_meters "
                         " WHERE tenant_id = %s AND offline_meter_id = %s")
                cursor.execute(query, (new_id, offline_meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.TENANT_OFFLINE_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_tenants_offline_meters (tenant_id, offline_meter_id) "
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
                         " FROM tbl_tenants_virtual_meters "
                         " WHERE tenant_id = %s AND virtual_meter_id = %s")
                cursor.execute(query, (new_id, virtual_meter['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.TENANT_VIRTUAL_METER_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_tenants_virtual_meters (tenant_id, virtual_meter_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, virtual_meter['id'],))
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
                         " FROM tbl_tenants_points "
                         " WHERE tenant_id = %s AND point_id = %s")
                cursor.execute(query, (new_id, point['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.TENANT_POINT_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_tenants_points (tenant_id, point_id) "
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
                         " FROM tbl_tenants_sensors "
                         " WHERE tenant_id = %s AND sensor_id = %s")
                cursor.execute(query, (new_id, sensor['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.TENANT_SENSOR_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_tenants_sensors (tenant_id, sensor_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, sensor['id'],))
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
                         " FROM tbl_tenants_working_calendars "
                         " WHERE tenant_id = %s AND working_calendar_id = %s")
                cursor.execute(query, (new_id, working_calendar['id'],))
                if cursor.fetchone() is not None:
                    cursor.close()
                    cnx.close()
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                           description='API.TENANT_WORKING_CALENDAR_RELATION_EXISTS')

                add_row = (" INSERT INTO tbl_tenants_working_calendars (tenant_id, working_calendar_id) "
                           " VALUES (%s, %s) ")
                cursor.execute(add_row, (new_id, working_calendar['id'],))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/tenants/' + str(new_id)


class TenantClone:
    def __init__(self):
        """"Initializes TenantClone"""
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
                                   description='API.INVALID_TENANT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_tenant_types ")
        cursor.execute(query)
        rows_tenant_types = cursor.fetchall()

        tenant_type_dict = dict()
        if rows_tenant_types is not None and len(rows_tenant_types) > 0:
            for row in rows_tenant_types:
                tenant_type_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}

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
                 "        buildings, floors, rooms, area, tenant_type_id,"
                 "        is_key_tenant, is_input_counted, "
                 "        lease_number, lease_start_datetime_utc, lease_end_datetime_utc, is_in_lease, "
                 "        contact_id, cost_center_id, description "
                 " FROM tbl_tenants "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TENANT_NOT_FOUND')
        else:
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset

            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "buildings": row[3],
                           "floors": row[4],
                           "rooms": row[5],
                           "area": row[6],
                           "tenant_type": tenant_type_dict.get(row[7], None),
                           "is_key_tenant": bool(row[8]),
                           "is_input_counted": bool(row[9]),
                           "lease_number": row[10],
                           "lease_start_datetime": (row[11].replace(tzinfo=timezone.utc) +
                                                    timedelta(minutes=timezone_offset)).strftime('%Y-%m-%dT%H:%M:%S'),
                           "lease_end_datetime": (row[12].replace(tzinfo=timezone.utc) +
                                                  timedelta(minutes=timezone_offset)).strftime('%Y-%m-%dT%H:%M:%S'),
                           "is_in_lease": bool(row[13]),
                           "contact": contact_dict.get(row[14], None),
                           "cost_center": cost_center_dict.get(row[15], None),
                           "description": row[16],
                           "commands": None,
                           "meters": None,
                           "offline_meters": None,
                           "virtual_meters": None,
                           "points": None,
                           "sensors": None,
                           "working_calendars": None
                           }
            query = (" SELECT c.id, c.name, c.uuid "
                     " FROM tbl_tenants t, tbl_tenants_commands tc, tbl_commands c "
                     " WHERE tc.tenant_id = t.id AND c.id = tc.command_id AND t.id = %s "
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
                     " FROM tbl_tenants t, tbl_tenants_meters tm, tbl_meters m "
                     " WHERE tm.tenant_id = t.id AND m.id = tm.meter_id AND t.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            meter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    energy_category = energy_category_dict.get(row[3], None)
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category}
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
                     " FROM tbl_tenants s, tbl_tenants_offline_meters sm, tbl_offline_meters m "
                     " WHERE sm.tenant_id = s.id AND m.id = sm.offline_meter_id AND s.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            offlinemeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    energy_category = energy_category_dict.get(row[3], None)
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category}
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
                     " FROM tbl_tenants t, tbl_tenants_virtual_meters tm, tbl_virtual_meters m "
                     " WHERE tm.tenant_id = t.id AND m.id = tm.virtual_meter_id AND t.id = %s "
                     " ORDER BY m.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            virtualmeter_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    energy_category = energy_category_dict.get(row[3], None)
                    result = {"id": row[0], "name": row[1], "uuid": row[2],
                              "energy_category": energy_category}
                    virtualmeter_result.append(result)
                meta_result['virtual_meters'] = virtualmeter_result
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
                     " FROM tbl_tenants t, tbl_tenants_points tp, tbl_points p "
                     " WHERE tp.tenant_id = t.id AND p.id = tp.point_id AND t.id = %s "
                     " ORDER BY p.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            point_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    data_source = data_source_dict.get(row[2], None)
                    result = {"id": row[0], "name": row[1], "data_source": data_source}
                    point_result.append(result)
                meta_result['points'] = point_result
            query = (" SELECT s.id, s.name, s.uuid "
                     " FROM tbl_tenants t, tbl_tenants_sensors ts, tbl_sensors s "
                     " WHERE ts.tenant_id = t.id AND s.id = ts.sensor_id AND t.id = %s "
                     " ORDER BY s.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            sensor_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "uuid": row[2]}
                    sensor_result.append(result)
                meta_result['sensors'] = sensor_result
            query = (" SELECT wc.id, wc.name, wc.description "
                     " FROM tbl_tenants t, tbl_tenants_working_calendars twc, tbl_working_calendars wc "
                     " WHERE twc.tenant_id = t.id AND wc.id = twc.working_calendar_id AND t.id = %s "
                     " ORDER BY wc.id ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            workingcalendars_result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    result = {"id": row[0], "name": row[1], "description": row[2]}
                    workingcalendars_result.append(result)
                meta_result['working_calendars'] = workingcalendars_result
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = (str.strip(meta_result['name']) +
                        (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
            add_values = (" INSERT INTO tbl_tenants "
                          "    (name, uuid, buildings, floors, rooms, area, tenant_type_id, "
                          "     is_input_counted, is_key_tenant, "
                          "     lease_number, lease_start_datetime_utc, lease_end_datetime_utc, is_in_lease, "
                          "     contact_id, cost_center_id, description) "
                          " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['buildings'],
                                        meta_result['floors'],
                                        meta_result['rooms'],
                                        meta_result['area'],
                                        meta_result['tenant_type']['id'],
                                        meta_result['is_input_counted'],
                                        meta_result['is_key_tenant'],
                                        meta_result['lease_number'],
                                        meta_result['lease_start_datetime'],
                                        meta_result['lease_end_datetime'],
                                        meta_result['is_in_lease'],
                                        meta_result['contact']['id'],
                                        meta_result['cost_center']['id'],
                                        meta_result['description']))
            new_id = cursor.lastrowid
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
                             " FROM tbl_tenants_commands "
                             " WHERE tenant_id = %s AND command_id = %s")
                    cursor.execute(query, (new_id, command['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.TENANT_COMMAND_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_tenants_commands (tenant_id, command_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, command['id'],))
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
                             " FROM tbl_tenants_meters "
                             " WHERE tenant_id = %s AND meter_id = %s")
                    cursor.execute(query, (new_id, meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.TENANT_METER_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_tenants_meters (tenant_id, meter_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, meter['id'],))
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
                             " FROM tbl_tenants_offline_meters "
                             " WHERE tenant_id = %s AND offline_meter_id = %s")
                    cursor.execute(query, (new_id, offline_meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.TENANT_OFFLINE_METER_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_tenants_offline_meters (tenant_id, offline_meter_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, offline_meter['id'],))
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
                             " FROM tbl_tenants_virtual_meters "
                             " WHERE tenant_id = %s AND virtual_meter_id = %s")
                    cursor.execute(query, (new_id, virtual_meter['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.TENANT_VIRTUAL_METER_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_tenants_virtual_meters (tenant_id, virtual_meter_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, virtual_meter['id'],))
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
                             " FROM tbl_tenants_points "
                             " WHERE tenant_id = %s AND point_id = %s")
                    cursor.execute(query, (new_id, point['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.TENANT_POINT_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_tenants_points (tenant_id, point_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, point['id'],))
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
                             " FROM tbl_tenants_sensors "
                             " WHERE tenant_id = %s AND sensor_id = %s")
                    cursor.execute(query, (new_id, sensor['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.TENANT_SENSOR_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_tenants_sensors (tenant_id, sensor_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, sensor['id'],))
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
                             " FROM tbl_tenants_working_calendars "
                             " WHERE tenant_id = %s AND working_calendar_id = %s")
                    cursor.execute(query, (new_id, working_calendar['id'],))
                    if cursor.fetchone() is not None:
                        cursor.close()
                        cnx.close()
                        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                               description='API.TENANT_WORKING_CALENDAR_RELATION_EXISTS')

                    add_row = (" INSERT INTO tbl_tenants_working_calendars (tenant_id, working_calendar_id) "
                               " VALUES (%s, %s) ")
                    cursor.execute(add_row, (new_id, working_calendar['id'],))
            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/tenants/' + str(new_id)
