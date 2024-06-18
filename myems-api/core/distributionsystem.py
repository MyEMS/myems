import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class DistributionSystemCollection:
    @staticmethod
    def __init__():
        """Initializes DistributionSystemCollection"""
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

        query = (" SELECT id, name, uuid, "
                 "        svg, description "
                 " FROM tbl_distribution_systems "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_distribution_systems = cursor.fetchall()

        result = list()
        if rows_distribution_systems is not None and len(rows_distribution_systems) > 0:
            for row in rows_distribution_systems:

                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "svg": row[3],
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
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_NAME')
        name = str.strip(new_values['data']['name'])

        if 'svg' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['svg'], str) or \
                len(str.strip(new_values['data']['svg'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG')
        svg = str.strip(new_values['data']['svg'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_distribution_systems "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.DISTRIBUTION_SYSTEM_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_distribution_systems "
                      "    (name, uuid, svg, description) "
                      " VALUES (%s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    svg,
                                    description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/distributionsystems/' + str(new_id)


class DistributionSystemItem:
    @staticmethod
    def __init__():
        """Initializes DistributionSystemItem"""
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
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        svg, description "
                 " FROM tbl_distribution_systems "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISTRIBUTION_SYSTEM_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "svg": row[3],
                           "description": row[4]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_ID')
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_distribution_systems "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISTRIBUTION_SYSTEM_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_distribution_circuits_points WHERE distribution_circuit_id "
                       "IN (SELECT id FROM tbl_distribution_circuits WHERE distribution_system_id = %s) ", (id_,))
        cursor.execute(" DELETE FROM tbl_distribution_circuits WHERE distribution_system_id = %s ", (id_,))
        cursor.execute(" DELETE FROM tbl_distribution_systems WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_NAME')
        name = str.strip(new_values['data']['name'])

        if 'svg' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['svg'], str) or \
                len(str.strip(new_values['data']['svg'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG')
        svg = str.strip(new_values['data']['svg'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_distribution_systems "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.DISTRIBUTION_SYSTEM_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_distribution_systems "
                      " SET name = %s, svg = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    svg,
                                    description,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class DistributionSystemDistributionCircuitCollection:
    @staticmethod
    def __init__():
        """Initializes DistributionSystemDistributionCircuitCollection"""
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
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_distribution_systems "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISTRIBUTION_SYSTEM_NOT_FOUND')

        query = (" SELECT id, name, uuid, "
                 "        distribution_room, switchgear, peak_load, peak_current, customers, meters "
                 " FROM tbl_distribution_circuits "
                 " WHERE distribution_system_id = %s "
                 " ORDER BY name ")
        cursor.execute(query, (id_,))
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "distribution_room": row[3], "switchgear": row[4],
                               "peak_load": row[5], "peak_current": row[6],
                               "customers": row[7], "meters": row[8]}
                result.append(meta_result)

        resp.text = json.dumps(result)


class DistributionSystemExport:
    @staticmethod
    def __init__():
        """Initializes DistributionSystemExport"""
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
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        svg, description "
                 " FROM tbl_distribution_systems "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISTRIBUTION_SYSTEM_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "svg": row[3],
                           "description": row[4],
                           "circuits": None}
            query = (" SELECT id, name, uuid, "
                     "        distribution_room, switchgear, peak_load, peak_current, customers, meters "
                     " FROM tbl_distribution_circuits "
                     " WHERE distribution_system_id = %s "
                     " ORDER BY name ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    circuit_result = {"id": row[0], "name": row[1], "uuid": row[2],
                                      "distribution_room": row[3], "switchgear": row[4],
                                      "peak_load": row[5], "peak_current": row[6],
                                      "customers": row[7], "meters": row[8],
                                      "points": None}
                    query = (" SELECT p.id AS point_id, p.name AS point_name, "
                             "        dc.id AS distribution_circuit_id, dc.name AS distribution_circuit_name, "
                             "        dc.uuid AS distribution_circuit_uuid "
                             " FROM tbl_points p, tbl_distribution_circuits_points dcp, tbl_distribution_circuits dc "
                             " WHERE dcp.distribution_circuit_id = %s AND p.id = dcp.point_id "
                             "       AND dcp.distribution_circuit_id = dc.id "
                             " ORDER BY p.name ")
                    cursor.execute(query, (circuit_result['id'],))
                    rows = cursor.fetchall()

                    points = list()
                    if rows is not None and len(rows) > 0:
                        for point_row in rows:
                            point_result = {"id": point_row[0], "name": point_row[1]}
                            points.append(point_result)
                        circuit_result['points'] = points

                    result.append(circuit_result)
                meta_result['circuits'] = result

        cursor.close()
        cnx.close()
        resp.text = json.dumps(meta_result)


class DistributionSystemImport:
    @staticmethod
    def __init__():
        """Initializes DistributionSystemImport"""
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
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_NAME')
        name = str.strip(new_values['name'])

        if 'svg' not in new_values.keys() or \
                not isinstance(new_values['svg'], str) or \
                len(str.strip(new_values['svg'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SVG')
        svg = str.strip(new_values['svg'])

        if 'description' in new_values.keys() and \
                new_values['description'] is not None and \
                len(str(new_values['description'])) > 0:
            description = str.strip(new_values['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_distribution_systems "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.DISTRIBUTION_SYSTEM_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_distribution_systems "
                      "    (name, uuid, svg, description) "
                      " VALUES (%s, %s, %s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4()),
                                    svg,
                                    description))
        new_id = cursor.lastrowid
        if new_values['circuits'] is not None and len(new_values['circuits']) > 0:
            for circuit in new_values['circuits']:
                add_values = (" INSERT INTO tbl_distribution_circuits "
                              "    (name, uuid, distribution_system_id,"
                              "     distribution_room, switchgear, peak_load, peak_current, customers, meters) "
                              " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ")
                cursor.execute(add_values, (circuit['name'],
                                            str(uuid.uuid4()),
                                            new_id,
                                            circuit['distribution_room'],
                                            circuit['switchgear'],
                                            circuit['peak_load'],
                                            circuit['peak_current'],
                                            circuit['customers'],
                                            circuit['meters']))
                circuit_id = cursor.lastrowid
                if circuit['points'] is not None and len(circuit['points']) > 0:
                    for point in circuit['points']:
                        cursor.execute(" SELECT name "
                                       " FROM tbl_points "
                                       " WHERE id = %s ", (point['id'],))
                        if cursor.fetchone() is None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                                   description='API.POINT_NOT_FOUND')

                        query = (" SELECT id "
                                 " FROM tbl_distribution_circuits_points "
                                 " WHERE distribution_circuit_id = %s AND point_id = %s")
                        cursor.execute(query, (circuit_id, point['id'],))
                        if cursor.fetchone() is not None:
                            cursor.close()
                            cnx.close()
                            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                                   description='API.DISTRIBUTION_CIRCUIT_POINT_RELATION_EXISTS')

                        add_row = (" INSERT INTO tbl_distribution_circuits_points (distribution_circuit_id, point_id) "
                                   " VALUES (%s, %s) ")
                        cursor.execute(add_row, (circuit_id, point['id'],))

        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/distributionsystems/' + str(new_id)


class DistributionSystemClone:
    @staticmethod
    def __init__():
        """Initializes DistributionSystemClone"""
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
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, "
                 "        svg, description "
                 " FROM tbl_distribution_systems "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISTRIBUTION_SYSTEM_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "svg": row[3],
                           "description": row[4],
                           "circuits": None}
            query = (" SELECT id, name, uuid, "
                     "        distribution_room, switchgear, peak_load, peak_current, customers, meters "
                     " FROM tbl_distribution_circuits "
                     " WHERE distribution_system_id = %s "
                     " ORDER BY name ")
            cursor.execute(query, (id_,))
            rows = cursor.fetchall()

            result = list()
            if rows is not None and len(rows) > 0:
                for row in rows:
                    circuit_result = {"id": row[0], "name": row[1], "uuid": row[2],
                                      "distribution_room": row[3], "switchgear": row[4],
                                      "peak_load": row[5], "peak_current": row[6],
                                      "customers": row[7], "meters": row[8],
                                      "points": None}
                    query = (" SELECT p.id AS point_id, p.name AS point_name, p.address AS point_address, "
                             "        dc.id AS distribution_circuit_id, dc.name AS distribution_circuit_name, "
                             "        dc.uuid AS distribution_circuit_uuid "
                             " FROM tbl_points p, tbl_distribution_circuits_points dcp, tbl_distribution_circuits dc "
                             " WHERE dcp.distribution_circuit_id = %s AND p.id = dcp.point_id "
                             "       AND dcp.distribution_circuit_id = dc.id "
                             " ORDER BY p.name ")
                    cursor.execute(query, (circuit_result['id'],))
                    rows = cursor.fetchall()

                    points = list()
                    if rows is not None and len(rows) > 0:
                        for point_row in rows:
                            point_result = {"id": point_row[0], "name": point_row[1], "address": point_row[2]}
                            points.append(point_result)
                        circuit_result['points'] = points

                    result.append(circuit_result)
                meta_result['circuits'] = result
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = (str.strip(meta_result['name'])
                        + (datetime.now()
                           + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
            add_values = (" INSERT INTO tbl_distribution_systems "
                          "    (name, uuid, svg, description) "
                          " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4()),
                                        meta_result['svg'],
                                        meta_result['description']))
            new_id = cursor.lastrowid
            if meta_result['circuits'] is not None and len(meta_result['circuits']) > 0:
                for circuit in meta_result['circuits']:
                    add_values = (" INSERT INTO tbl_distribution_circuits "
                                  "    (name, uuid, distribution_system_id,"
                                  "     distribution_room, switchgear, peak_load, peak_current, customers, meters) "
                                  " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ")
                    cursor.execute(add_values, (circuit['name'],
                                                str(uuid.uuid4()),
                                                new_id,
                                                circuit['distribution_room'],
                                                circuit['switchgear'],
                                                circuit['peak_load'],
                                                circuit['peak_current'],
                                                circuit['customers'],
                                                circuit['meters']))
                    circuit_id = cursor.lastrowid
                    if circuit['points'] is not None and len(circuit['points']) > 0:
                        for point in circuit['points']:
                            cursor.execute(" SELECT name "
                                           " FROM tbl_points "
                                           " WHERE id = %s ", (point['id'],))
                            if cursor.fetchone() is None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                                       description='API.POINT_NOT_FOUND')

                            query = (" SELECT id "
                                     " FROM tbl_distribution_circuits_points "
                                     " WHERE distribution_circuit_id = %s AND point_id = %s")
                            cursor.execute(query, (circuit_id, point['id'],))
                            if cursor.fetchone() is not None:
                                cursor.close()
                                cnx.close()
                                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                                       description='API.DISTRIBUTION_CIRCUIT_POINT_RELATION_EXISTS')

                            add_row = (
                                " INSERT INTO tbl_distribution_circuits_points (distribution_circuit_id, point_id) "
                                " VALUES (%s, %s) ")
                            cursor.execute(add_row, (circuit_id, point['id'],))
            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/distributionsystems/' + str(new_id)
