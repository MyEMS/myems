import falcon
import simplejson as json
import mysql.connector
import config
import uuid


class DistributionSystemCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, uuid, "
                 "        svg, description "
                 " FROM tbl_distribution_systems "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_distribution_systems = cursor.fetchall()

        result = list()
        if rows_distribution_systems is not None and len(rows_distribution_systems) > 0:
            for row in rows_distribution_systems:

                meta_result = {"id": row['id'],
                               "name": row['name'],
                               "uuid": row['uuid'],
                               "svg": row['svg'],
                               "description": row['description']}
                result.append(meta_result)

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)

    @staticmethod
    def on_post(req, resp):
        """Handles POST requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_NAME')
        name = str.strip(new_values['data']['name'])

        if 'svg' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['svg'], str) or \
                len(str.strip(new_values['data']['svg'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
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
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
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
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/distributionsystems/' + str(new_id)


class DistributionSystemItem:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, uuid, "
                 "        svg, description "
                 " FROM tbl_distribution_systems "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISTRIBUTION_SYSTEM_NOT_FOUND')
        else:
            meta_result = {"id": row['id'],
                           "name": row['name'],
                           "uuid": row['uuid'],
                           "svg": row['svg'],
                           "description": row['description']}

        resp.body = json.dumps(meta_result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_ID')
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_distribution_systems "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISTRIBUTION_SYSTEM_NOT_FOUND')

        # check associated distribution circuits
        cursor.execute(" SELECT id "
                       " FROM tbl_distribution_circuits "
                       " WHERE distribution_system_id = %s ",
                       (id_,))
        rows_distribution_circuits = cursor.fetchall()
        if rows_distribution_circuits is not None and len(rows_distribution_circuits) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_ASSOCIATED_DISTRIBUTION_CIRCUITS')

        cursor.execute(" DELETE FROM tbl_distribution_systems WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_204

    @staticmethod
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=ex)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_NAME')
        name = str.strip(new_values['data']['name'])

        if 'svg' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['svg'], str) or \
                len(str.strip(new_values['data']['svg'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
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
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
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
        cnx.disconnect()

        resp.status = falcon.HTTP_200


class DistributionSystemDistributionCircuitCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        cursor.execute(" SELECT name "
                       " FROM tbl_distribution_systems "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
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
                meta_result = {"id": row['id'], "name": row['name'], "uuid": row['uuid'],
                               "distribution_room": row['distribution_room'], "switchgear": row['switchgear'],
                               "peak_load": row['peak_load'], "peak_current": row['peak_current'],
                               "customers": row['customers'], "meters": row['meters']}
                result.append(meta_result)

        resp.body = json.dumps(result)
