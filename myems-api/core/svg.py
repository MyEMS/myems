import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class SVGCollection:
    """
    SVG Collection Resource

    This class handles CRUD operations for SVG collection.
    It provides endpoints for listing all SVGs and creating new SVGs.
    SVGs are used for displaying graphical representations in the energy management system.
    """

    def __init__(self):
        """Initialize SVGCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        """Handle OPTIONS requests for CORS preflight"""
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

        search_query = req.get_param('q', default=None)
        if search_query is not None:
            search_query = search_query.strip()
        else:
            search_query = ''

        # if turn quick mode on, do not return source code
        is_quick_mode = False
        if 'QUICKMODE' in req.headers and \
                isinstance(req.headers['QUICKMODE'], str) and \
                len(str.strip(req.headers['QUICKMODE'])) > 0 and \
                str.lower(req.headers['QUICKMODE']) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        if is_quick_mode:
            query = (" SELECT id, name, uuid, description "
                     " FROM tbl_svgs ")
            params = []
            if search_query:
                query += " WHERE name LIKE %s    OR  description LIKE %s "
                params = [f'%{search_query}%', f'%{search_query}%']
            query += " ORDER BY id "
            cursor.execute(query, params)
            rows_svgs = cursor.fetchall()

            result = list()
            if rows_svgs is not None and len(rows_svgs) > 0:
                for row in rows_svgs:
                    meta_result = {"id": row[0],
                                   "name": row[1],
                                   "uuid": row[2],
                                   "description": row[3]}
                    result.append(meta_result)
        else:
            query = (" SELECT id, name, uuid, source_code, description "
                     " FROM tbl_svgs ")
            params = []
            if search_query:
                query += " WHERE name LIKE %s    OR  description LIKE %s "
                params = [f'%{search_query}%', f'%{search_query}%']
            query += " ORDER BY id "
            cursor.execute(query, params)
            rows_svgs = cursor.fetchall()

            result = list()
            if rows_svgs is not None and len(rows_svgs) > 0:
                for row in rows_svgs:
                    meta_result = {"id": row[0],
                                   "name": row[1],
                                   "uuid": row[2],
                                   "source_code": row[3],
                                   "description": row[4]}
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
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_NAME')
        name = str.strip(new_values['data']['name'])

        if 'source_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['source_code'], str) or \
                len(str.strip(new_values['data']['source_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_SOURCE_CODE')
        source_code = str.strip(new_values['data']['source_code'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_svgs "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SVG_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_svgs "
                      "    (name, uuid, source_code, description) "
                      " VALUES (%s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    source_code,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/svgs/' + str(new_id)


class SVGItem:
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
                                   description='API.INVALID_SVG_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, source_code, description "
                 " FROM tbl_svgs "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SVG_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "source_code": row[3],
                           "description": row[4]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_ID')
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_svgs "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SVG_NOT_FOUND')
        # check if any equipment is bound to this SVG
        cursor.execute("SELECT id FROM tbl_equipments WHERE svg_id = %s", (id_,))
        rows_svgs = cursor.fetchall()
        if rows_svgs is not None and len(rows_svgs) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_EQUIPMENTS')
        # check if any combined equipment is bound to this SVG
        cursor.execute("SELECT id FROM tbl_combined_equipments WHERE svg_id = %s", (id_,))
        rows_svgs = cursor.fetchall()
        if rows_svgs is not None and len(rows_svgs) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_COMBINED_EQUIPMENTS')
        # check if any distribution system is bound to this SVG
        cursor.execute("SELECT id FROM tbl_distribution_systems WHERE svg_id = %s", (id_,))
        rows_svgs = cursor.fetchall()
        if rows_svgs is not None and len(rows_svgs) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_DISTRIBUTION_SYSTEMS')
        # check if any energy storage power station is bound to this SVG
        for col in ['svg_id', 'svg2_id', 'svg3_id', 'svg4_id', 'svg5_id']:
            cursor.execute(f"SELECT id FROM tbl_energy_storage_power_stations WHERE {col} = %s", (id_,))
            rows_svgs = cursor.fetchall()
            if rows_svgs is not None and len(rows_svgs) > 0:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.THERE_IS_RELATION_WITH_ENERGY_STORAGE_POWER_STATIONS')
        # check if any photovoltaic power station is bound to this SVG
        for col in ['svg_id', 'svg2_id', 'svg3_id', 'svg4_id', 'svg5_id']:
            cursor.execute(f"SELECT id FROM tbl_photovoltaic_power_stations WHERE {col} = %s", (id_,))
            rows_svgs = cursor.fetchall()
            if rows_svgs is not None and len(rows_svgs) > 0:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.THERE_IS_RELATION_WITH_PHOTOVOLTAIC_POWER_STATIONS')
        # check if any microgrid is bound to this SVG
        for col in ['svg_id', 'svg2_id', 'svg3_id', 'svg4_id', 'svg5_id']:
            cursor.execute(f"SELECT id FROM tbl_microgrids WHERE {col} = %s", (id_,))
            rows_svgs = cursor.fetchall()
            if rows_svgs is not None and len(rows_svgs) > 0:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.THERE_IS_RELATION_WITH_MICROGRIDS')
        # check if any virtual power plant is bound to this SVG
        cursor.execute("SELECT id FROM tbl_virtual_power_plants WHERE svg_id = %s", (id_,))
        rows_svgs = cursor.fetchall()
        if rows_svgs is not None and len(rows_svgs) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_VIRTUAL_POWER_PLANTS')
        # check if any wind farm is bound to this SVG
        for col in ['svg_id', 'svg2_id', 'svg3_id', 'svg4_id', 'svg5_id']:
            cursor.execute(f"SELECT id FROM tbl_wind_farms WHERE {col} = %s", (id_,))
            rows_svgs = cursor.fetchall()
            if rows_svgs is not None and len(rows_svgs) > 0:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.THERE_IS_RELATION_WITH_WIND_FARMS')
        # check if any charging station is bound to this SVG
        for col in ['svg_id', 'svg2_id', 'svg3_id', 'svg4_id', 'svg5_id']:
            cursor.execute(f"SELECT id FROM tbl_charging_stations WHERE {col} = %s", (id_,))
            rows_svgs = cursor.fetchall()
            if rows_svgs is not None and len(rows_svgs) > 0:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.THERE_IS_RELATION_WITH_CHARGING_STATIONS')

        cursor.execute(" DELETE FROM tbl_svgs WHERE id = %s ", (id_,))
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
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_NAME')
        name = str.strip(new_values['data']['name'])

        if 'source_code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['source_code'], str) or \
                len(str.strip(new_values['data']['source_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_SOURCE_CODE')
        source_code = str.strip(new_values['data']['source_code'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_svgs "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SVG_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_svgs "
                      " SET name = %s, source_code = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    source_code,
                                    description,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class SVGExport:
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
                                   description='API.INVALID_SVG_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, source_code, description "
                 " FROM tbl_svgs "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SVG_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "source_code": row[3],
                           "description": row[4]}
        cursor.close()
        cnx.close()
        resp.text = json.dumps(meta_result)


class SVGImport:
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
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_NAME')
        name = str.strip(new_values['name'])

        if 'source_code' not in new_values.keys() or \
                not isinstance(new_values['source_code'], str) or \
                len(str.strip(new_values['source_code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG_SOURCE_CODE')
        source_code = str.strip(new_values['source_code'])

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_svgs "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SVG_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_svgs "
                      "    (name, uuid, source_code, description) "
                      " VALUES (%s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    source_code,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/svgs/' + str(new_id)


class SVGClone:
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
                                   description='API.INVALID_SVG_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, source_code, description "
                 " FROM tbl_svgs "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SVG_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "source_code": row[3],
                           "description": row[4]}

            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = (str.strip(meta_result['name']) +
                        (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
            add_values = (" INSERT INTO tbl_svgs "
                          "    (name, uuid, source_code, description) "
                          " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['source_code'],
                                        meta_result['description']))
            new_id = cursor.lastrowid
            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/svgs/' + str(new_id)
