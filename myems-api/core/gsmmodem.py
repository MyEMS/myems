import falcon
import json
import mysql.connector
import config
import base64
import re


class GSMModemCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, serial_port, baud_rate "
                 " FROM tbl_gsm_modems ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "serial_port": row[1],
                               "baud_rate": row[2]}
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

        if 'serial_port' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['serial_port'], str) or \
                len(str.strip(new_values['data']['serial_port'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SERIAL_PORT')

        serial_port = str.strip(new_values['data']['serial_port'])

        if 'baud_rate' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['baud_rate'], int) or \
                new_values['data']['baud_rate'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BAUD_RATE')
        baud_rate = float(new_values['data']['baud_rate'])

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_gsm_modems "
                       " WHERE serial_port = %s ", (serial_port,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.GSM_MODEM_SERIAL_PORT_IS_ALREADY_IN_USE')

        add_value = (" INSERT INTO tbl_gsm_modems "
                     "    (serial_port, baud_rate) "
                     " VALUES (%s, %s) ")
        cursor.execute(add_value, (serial_port,
                                   baud_rate))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/gsmmodems/' + str(new_id)


class GSMModemItem:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, '400 Bad Request')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        query = (" SELECT id, serial_port, baud_rate "
                 " FROM tbl_gsm_modems "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()
        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, 'API.NOT_FOUND')

        result = {"id": row[0],
                  "serial_port": row[1],
                  "baud_rate": row[2]}
        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_GSM_MODEM_ID')

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT serial_port "
                       " FROM tbl_gsm_modems "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GSM_MODEM_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_gsm_modems WHERE id = %s ", (id_,))
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
                                   description='API.INVALID_GSM_MODEM_ID')

        new_values = json.loads(raw_json)

        if 'serial_port' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['serial_port'], str) or \
                len(str.strip(new_values['data']['serial_port'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SERIAL_PORT')

        serial_port = str.strip(new_values['data']['serial_port'])

        if 'baud_rate' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['baud_rate'], int) or \
                new_values['data']['baud_rate'] <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BAUD_RATE')
        baud_rate = float(new_values['data']['baud_rate'])

        cnx = mysql.connector.connect(**config.myems_fdd_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT serial_port "
                       " FROM tbl_gsm_modems "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.GSM_MODEM_NOT_FOUND')

        cursor.execute(" SELECT serial_port "
                       " FROM tbl_gsm_modems "
                       " WHERE serial_port = %s AND id != %s ", (serial_port, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.GSM_MODEM_SERIAL_PORT_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_gsm_modems "
                      " SET serial_port = %s, baud_rate = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (serial_port,
                                    baud_rate,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200
