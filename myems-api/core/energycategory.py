import falcon
import simplejson as json
import mysql.connector
import config
import uuid


class EnergyCategoryCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, unit_of_measure, kgce, kgco2e "
                 " FROM tbl_energy_categories "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2], "unit_of_measure": row[3],
                               "kgce": row[4], "kgco2e": row[5]}
                result.append(meta_result)

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
                                   description='API.INVALID_ENERGY_CATEGORY_NAME')

        name = str.strip(new_values['data']['name'])

        if 'unit_of_measure' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['unit_of_measure'], str) or \
                len(str.strip(new_values['data']['unit_of_measure'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNIT_OF_MEASURE')

        unit_of_measure = str.strip(new_values['data']['unit_of_measure'])

        if 'kgce' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['kgce'], float) or
                     isinstance(new_values['data']['kgce'], int)):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_KGCE')
        kgce = float(new_values['data']['kgce'])

        if 'kgco2e' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['kgco2e'], float) or
                     isinstance(new_values['data']['kgco2e'], int)):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_KGCO2E')
        kgco2e = float(new_values['data']['kgco2e'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.ENERGY_CATEGORY_NAME_IS_ALREADY_IN_USE')

        add_value = (" INSERT INTO tbl_energy_categories "
                     "    (name, uuid, unit_of_measure, kgce, kgco2e) "
                     " VALUES (%s, %s, %s, %s, %s) ")
        cursor.execute(add_value, (name,
                                   str(uuid.uuid4()),
                                   unit_of_measure,
                                   kgce,
                                   kgco2e))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/energycategories/' + str(new_id)


class EnergyCategoryItem:
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
                                   description='API.INVALID_ENERGY_CATEGORY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid, unit_of_measure, kgce, kgco2e "
                 " FROM tbl_energy_categories "
                 " WHERE id =%s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()
        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "unit_of_measure": row[3],
                  "kgce": row[4],
                  "kgco2e": row[5]}
        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_meters "
                       " WHERE energy_category_id = %s ", (id_,))
        rows_meters = cursor.fetchall()
        if rows_meters is not None and len(rows_meters) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.ENERGY_CATEGORY_USED_IN_METER')

        cursor.execute(" SELECT id "
                       " FROM tbl_virtual_meters "
                       " WHERE energy_category_id = %s ", (id_,))
        rows_virtual_meters = cursor.fetchall()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.ENERGY_CATEGORY_USED_IN_VIRTUAL_METER')

        cursor.execute(" SELECT id "
                       " FROM tbl_offline_meters "
                       " WHERE energy_category_id = %s ", (id_,))
        rows_offline_meters = cursor.fetchall()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.ENERGY_CATEGORY_USED_IN_OFFLINE_METER')

        cursor.execute(" SELECT id "
                       " FROM tbl_tariffs "
                       " WHERE energy_category_id = %s ", (id_,))
        rows_tariffs = cursor.fetchall()
        if rows_tariffs is not None and len(rows_tariffs) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.ENERGY_CATEGORY_USED_IN_TARIFFS')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_items "
                       " WHERE energy_category_id = %s ", (id_,))
        rows_energy_items = cursor.fetchall()
        if rows_energy_items is not None and len(rows_energy_items) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.ENERGY_CATEGORY_USED_IN_ENERGY_ITEMS')

        cursor.execute(" DELETE FROM tbl_energy_categories WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_ENERGY_CATEGORY_ID')

        new_values = json.loads(raw_json)
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_NAME')

        name = str.strip(new_values['data']['name'])

        if 'unit_of_measure' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['unit_of_measure'], str) or \
                len(str.strip(new_values['data']['unit_of_measure'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNIT_OF_MEASURE')

        unit_of_measure = str.strip(new_values['data']['unit_of_measure'])

        if 'kgce' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['kgce'], float) or
                     isinstance(new_values['data']['kgce'], int)):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_KGCE')
        kgce = float(new_values['data']['kgce'])

        if 'kgco2e' not in new_values['data'].keys() or \
                not (isinstance(new_values['data']['kgco2e'], float) or
                     isinstance(new_values['data']['kgco2e'], int)):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_KGCO2E')
        kgco2e = float(new_values['data']['kgco2e'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.ENERGY_CATEGORY_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_energy_categories "
                      " SET name = %s, unit_of_measure = %s, kgce = %s, kgco2e = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    unit_of_measure,
                                    kgce,
                                    kgco2e,
                                    id_,))
        cnx.commit()
        cursor.close()
        cnx.disconnect()
        resp.status = falcon.HTTP_200

