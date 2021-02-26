import falcon
import simplejson as json
import mysql.connector
import config
import uuid
from datetime import datetime, timedelta, timezone


class TariffCollection:
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

        query = (" SELECT t.id, t.name, t.uuid, "
                 "        ec.id AS energy_category_id, ec.name AS energy_category_name, "
                 "        t.tariff_type, t.unit_of_price, "
                 "        t.valid_from_datetime_utc, t.valid_through_datetime_utc "
                 " FROM tbl_tariffs t, tbl_energy_categories ec "
                 " WHERE t.energy_category_id = ec.id "
                 " ORDER BY t.name ")
        cursor.execute(query)
        rows = cursor.fetchall()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                valid_from = row[7].replace(tzinfo=timezone.utc)
                valid_through = row[8].replace(tzinfo=timezone.utc)

                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "energy_category": {"id": row[3],
                                                   "name": row[4]},
                               "tariff_type": row[5],
                               "unit_of_price": row[6],
                               "valid_from": valid_from.timestamp() * 1000,
                               "valid_through": valid_through.timestamp() * 1000}

                if meta_result['tariff_type'] == 'block':
                    meta_result['block'] = list()
                    query = (" SELECT start_amount, end_amount, price "
                             " FROM tbl_tariffs_blocks "
                             " WHERE tariff_id = %s "
                             " ORDER BY id ")
                    cursor.execute(query, (meta_result['id'],))
                    rows_block = cursor.fetchall()
                    if rows_block is not None and len(rows_block) > 0:
                        for row_block in rows_block:
                            meta_data = {"start_amount": row_block[0],
                                         "end_amount": row_block[1],
                                         "price": row_block[2]}
                            meta_result['block'].append(meta_data)

                elif meta_result['tariff_type'] == 'timeofuse':
                    meta_result['timeofuse'] = list()
                    query = (" SELECT start_time_of_day, end_time_of_day, peak_type, price "
                             " FROM tbl_tariffs_timeofuses "
                             " WHERE tariff_id = %s  "
                             " ORDER BY id")
                    cursor.execute(query, (meta_result['id'],))
                    rows_timeofuses = cursor.fetchall()
                    if rows_timeofuses is not None and len(rows_timeofuses) > 0:
                        for row_timeofuse in rows_timeofuses:
                            meta_data = {"start_time_of_day": str(row_timeofuse[0]),
                                         "end_time_of_day": str(row_timeofuse[1]),
                                         "peak_type": row_timeofuse[2],
                                         "price": row_timeofuse[3]}
                            meta_result['timeofuse'].append(meta_data)
                else:
                    cursor.close()
                    cnx.disconnect()
                    raise falcon.HTTPError(falcon.HTTP_400,
                                           title='API.ERROR',
                                           description='API.INVALID_TARIFF_TYPE')

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
                                   description='API.INVALID_METER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category' not in new_values['data'].keys() or \
                'id' not in new_values['data']['energy_category'].keys() or \
                not isinstance(new_values['data']['energy_category']['id'], int) or \
                new_values['data']['energy_category']['id'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category']['id']

        if 'tariff_type' not in new_values['data'].keys() \
           or str.strip(new_values['data']['tariff_type']) not in ('block', 'timeofuse'):
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_TYPE')
        tariff_type = str.strip(new_values['data']['tariff_type'])

        if new_values['data']['tariff_type'] == 'block':
            if new_values['data']['block'] is None:
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_TARIFF_BLOCK_PRICING')
        elif new_values['data']['tariff_type'] == 'timeofuse':
            if new_values['data']['timeofuse'] is None:
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_TARIFF_TIME_OF_USE_PRICING')
        if 'unit_of_price' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['unit_of_price'], str) or \
                len(str.strip(new_values['data']['unit_of_price'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNIT_OF_PRICE')
        unit_of_price = str.strip(new_values['data']['unit_of_price'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tariffs "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.TARIFF_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_categories "
                       " WHERE id = %s ", (energy_category_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')

        # todo: validate datetime values
        valid_from = datetime.strptime(new_values['data']['valid_from'], '%Y-%m-%dT%H:%M:%S')
        valid_from = valid_from.replace(tzinfo=timezone.utc)
        valid_from -= timedelta(minutes=timezone_offset)
        valid_through = datetime.strptime(new_values['data']['valid_through'], '%Y-%m-%dT%H:%M:%S')
        valid_through = valid_through.replace(tzinfo=timezone.utc)
        valid_through -= timedelta(minutes=timezone_offset)

        add_row = (" INSERT INTO tbl_tariffs "
                   "             (name, uuid, energy_category_id, tariff_type, unit_of_price, "
                   "              valid_from_datetime_utc, valid_through_datetime_utc ) "
                   " VALUES (%s, %s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 energy_category_id,
                                 tariff_type,
                                 unit_of_price,
                                 valid_from,
                                 valid_through))
        new_id = cursor.lastrowid
        cnx.commit()
        # insert block prices
        if tariff_type == 'block':
            for block in new_values['data']['block']:
                add_block = (" INSERT INTO tbl_tariffs_blocks "
                             "             (tariff_id, start_amount, end_amount, price) "
                             " VALUES (%s, %s, %s, %s) ")
                cursor.execute(add_block, (new_id, block['start_amount'], block['end_amount'], block['price']))
                cnx.commit()
        # insert time of use prices
        elif tariff_type == 'timeofuse':
            for timeofuse in new_values['data']['timeofuse']:
                add_timeofuse = (" INSERT INTO tbl_tariffs_timeofuses "
                                 "             (tariff_id, start_time_of_day, end_time_of_day, peak_type, price) "
                                 " VALUES (%s, %s, %s, %s, %s) ")
                cursor.execute(add_timeofuse, (new_id,
                                               timeofuse['start_time_of_day'],
                                               timeofuse['end_time_of_day'],
                                               timeofuse['peak_type'],
                                               timeofuse['price']))
                cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/tariffs/' + str(new_id)


class TariffItem:
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
                                   description='API.INVALID_TARIFF_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT t.id, t.name, t.uuid, "
                 "        ec.id AS energy_category_id, ec.name AS energy_category_name, "
                 "        t.tariff_type, "
                 "        t.unit_of_price, "
                 "        t.valid_from_datetime_utc, t.valid_through_datetime_utc "
                 " FROM tbl_tariffs t, tbl_energy_categories ec "
                 " WHERE t.energy_category_id = ec.id AND t.id =%s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TARIFF_NOT_FOUND')

        valid_from = row[7].replace(tzinfo=timezone.utc)
        valid_through = row[8].replace(tzinfo=timezone.utc)

        result = {"id": row[0],
                  "name": row[1],
                  "uuid": row[2],
                  "energy_category": {"id": row[3],
                                      "name": row[4]},
                  "tariff_type": row[5],
                  "unit_of_price": row[6],
                  "valid_from": valid_from.timestamp() * 1000,
                  "valid_through": valid_through.timestamp() * 1000}

        if result['tariff_type'] == 'block':
            result['block'] = list()
            query = (" SELECT start_amount, end_amount, price "
                     " FROM tbl_tariffs_blocks "
                     " WHERE tariff_id = %s "
                     " ORDER BY id")
            cursor.execute(query, (result['id'],))
            rows_block = cursor.fetchall()
            if rows_block is not None and len(rows_block) > 0:
                for row_block in rows_block:
                    meta_data = {"start_amount": row_block[0], "end_amount": row_block[1], "price": row_block[2]}
                    result['block'].append(meta_data)

        elif result['tariff_type'] == 'timeofuse':
            result['timeofuse'] = list()
            query = (" SELECT start_time_of_day, end_time_of_day, peak_type, price "
                     " FROM tbl_tariffs_timeofuses"
                     " WHERE tariff_id =%s ")
            cursor.execute(query, (result['id'],))
            rows_timeofuses = cursor.fetchall()
            if rows_timeofuses is not None and len(rows_timeofuses) > 0:
                for row_timeofuse in rows_timeofuses:
                    meta_data = {"start_time_of_day": str(row_timeofuse[0]),
                                 "end_time_of_day": str(row_timeofuse[1]),
                                 "peak_type": row_timeofuse[2],
                                 "price": row_timeofuse[3]}
                    result['timeofuse'].append(meta_data)

        cursor.close()
        cnx.disconnect()

        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_tariffs "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TARIFF_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_tariffs_blocks "
                       " WHERE tariff_id = %s ", (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARIFF_NOT_EMPTY')

        cursor.execute(" SELECT id "
                       " FROM tbl_tariffs_timeofuses "
                       " WHERE tariff_id = %s ", (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARIFF_NOT_EMPTY')

        cursor.execute(" SELECT id "
                       " FROM tbl_cost_centers_tariffs "
                       " WHERE tariff_id = %s ", (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARIFF_IN_USE')

        cursor.execute(" DELETE FROM tbl_tariffs WHERE id = %s ", (id_,))
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
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_NAME')
        name = str.strip(new_values['data']['name'])

        if 'energy_category' not in new_values['data'].keys() or \
                'id' not in new_values['data']['energy_category'].keys() or \
                not isinstance(new_values['data']['energy_category']['id'], int) or \
                new_values['data']['energy_category']['id'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        energy_category_id = new_values['data']['energy_category']['id']

        if 'tariff_type' not in new_values['data'].keys() \
           or str.strip(new_values['data']['tariff_type']) not in ('block', 'timeofuse'):
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_TARIFF_TYPE')
        tariff_type = str.strip(new_values['data']['tariff_type'])

        if new_values['data']['tariff_type'] == 'block':
            if new_values['data']['block'] is None:
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_TARIFF_BLOCK_PRICING')
        elif new_values['data']['tariff_type'] == 'timeofuse':
            if new_values['data']['timeofuse'] is None:
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_TARIFF_TIME_OF_USE_PRICING')

        if 'unit_of_price' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['unit_of_price'], str) or \
                len(str.strip(new_values['data']['unit_of_price'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_UNIT_OF_PRICE')
        unit_of_price = str.strip(new_values['data']['unit_of_price'])

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # check if the tariff exist
        query = (" SELECT name " 
                 " FROM tbl_tariffs " 
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        cursor.fetchone()

        if cursor.rowcount != 1:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.TARIFF_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_tariffs "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.TARIFF_NAME_IS_ALREADY_IN_USE')

        valid_from = datetime.strptime(new_values['data']['valid_from'], '%Y-%m-%dT%H:%M:%S')
        valid_from = valid_from.replace(tzinfo=timezone.utc)
        valid_from -= timedelta(minutes=timezone_offset)
        valid_through = datetime.strptime(new_values['data']['valid_through'], '%Y-%m-%dT%H:%M:%S')
        valid_through = valid_through.replace(tzinfo=timezone.utc)
        valid_through -= timedelta(minutes=timezone_offset)

        # update tariff itself
        update_row = (" UPDATE tbl_tariffs "
                      " SET name = %s, energy_category_id = %s, tariff_type = %s, unit_of_price = %s, "
                      "     valid_from_datetime_utc = %s , valid_through_datetime_utc = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    energy_category_id,
                                    tariff_type,
                                    unit_of_price,
                                    valid_from,
                                    valid_through,
                                    id_,))
        cnx.commit()

        # update prices of the tariff
        if tariff_type == 'block':
            if 'block' not in new_values['data'].keys() or new_values['data']['block'] is None:
                cursor.close()
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_TARIFF_BLOCK_PRICING')
            else:
                # remove all (possible) exist prices
                cursor.execute(" DELETE FROM tbl_tariffs_blocks "
                               " WHERE tariff_id = %s ",
                               (id_,))

                cursor.execute(" DELETE FROM tbl_tariffs_timeofuses "
                               " WHERE tariff_id = %s ",
                               (id_,))
                cnx.commit()

                for block in new_values['data']['block']:
                    cursor.execute(" INSERT INTO tbl_tariffs_blocks "
                                   "             (tariff_id, start_amount, end_amount, price) "
                                   " VALUES (%s, %s, %s, %s) ",
                                   (id_, block['start_amount'], block['end_amount'], block['price']))
                    cnx.commit()
        elif tariff_type == 'timeofuse':
            if 'timeofuse' not in new_values['data'].keys() or new_values['data']['timeofuse'] is None:
                cursor.close()
                cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_TARIFF_TIME_OF_USE_PRICING')
            else:
                # remove all (possible) exist prices
                cursor.execute(" DELETE FROM tbl_tariffs_blocks "
                               " WHERE tariff_id = %s ",
                               (id_,))

                cursor.execute(" DELETE FROM tbl_tariffs_timeofuses "
                               " WHERE tariff_id = %s ",
                               (id_,))
                cnx.commit()

                for timeofuse in new_values['data']['timeofuse']:
                    add_timeofuse = (" INSERT INTO tbl_tariffs_timeofuses "
                                     "             (tariff_id, start_time_of_day, end_time_of_day, peak_type, price) "
                                     " VALUES (%s, %s, %s, %s, %s) ")
                    cursor.execute(add_timeofuse, (id_,
                                                   timeofuse['start_time_of_day'],
                                                   timeofuse['end_time_of_day'],
                                                   timeofuse['peak_type'],
                                                   timeofuse['price']))
                    cnx.commit()

        cursor.close()
        cnx.disconnect()
        resp.status = falcon.HTTP_200


