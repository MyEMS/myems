import re
import uuid
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class IoTSIMCardCollection:
    """
    IoT SIM Card Collection Resource

    This class handles CRUD operations for IoT SIM card collection.
    It provides endpoints for listing all IoT SIM cards and creating new SIM cards.
    IoT SIM cards represent cellular communication modules for IoT devices.
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

        query = (" SELECT id, iccid, imsi, operator, status, active_time, open_time, expiration_time, "
                 "        used_traffic, total_traffic, description "
                 " FROM tbl_iot_sim_cards "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "iccid": row[1],
                               "imsi": row[2],
                               "operator": row[3],
                               "status": row[4],
                               "active_time": row[5],
                               "open_time": row[6],
                               "expiration_time": row[7],
                               "used_traffic": row[8],
                               "total_traffic": row[9],
                               "description": row[10]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except UnicodeDecodeError as ex:
            print(f"Failed to decode request: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print(f"Unexcept error reading request stream: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'iccid' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['iccid'], str) or \
                len(str.strip(new_values['data']['iccid'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ICCID')
        iccid = str.strip(new_values['data']['iccid'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT iccid "
                       " FROM tbl_iot_sim_cards "
                       " WHERE iccid = %s ", (iccid,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ICCID_IS_ALREADY_IN_USE')

        add_row = (" INSERT INTO tbl_iot_sim_cards "
                   "     (iccid, description) "
                   " VALUES (%s, %s) ")

        cursor.execute(add_row, (iccid, description))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/iotsimcards/' + str(new_id)


class IoTSIMCardItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = id_
        _ = req
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
                                   description='API.INVALID_CONTACT_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, iccid, imsi, operator, status, active_time, open_time, expiration_time, "
                 "        used_traffic, total_traffic, description "
                 " FROM tbl_iot_sim_cards "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.IOT_SIM_CARD_NOT_FOUND')

        result = {"id": row[0],
                  "iccid": row[1],
                  "imsi": row[2],
                  "operator": row[3],
                  "status": row[4],
                  "active_time": row[5],
                  "open_time": row[6],
                  "expiration_time": row[7],
                  "used_traffic": row[8],
                  "total_traffic": row[9],
                  "description": row[10]}
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IOT_SIM_CARD_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT iccid "
                       " FROM tbl_iot_sim_cards "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.IOT_SIM_CARD_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_iot_sim_cards WHERE id = %s ", (id_,))
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
            print(f"Failed to decode request: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print(f"Unexcept error reading request stream: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IOT_SIM_CARD_ID')

        new_values = json.loads(raw_json)

        if 'iccid' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['iccid'], str) or \
                len(str.strip(new_values['data']['iccid'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ICCID')
        iccid = str.strip(new_values['data']['iccid'])

        if 'description' in new_values['data'].keys() and \
                new_values['data']['description'] is not None and \
                len(str(new_values['data']['description'])) > 0:
            description = str.strip(new_values['data']['description'])
        else:
            description = None

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT iccid "
                       " FROM tbl_iot_sim_cards "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.IOT_SIM_CARD_NOT_FOUND')

        cursor.execute(" SELECT iccid "
                       " FROM tbl_iot_sim_cards "
                       " WHERE iccid = %s AND id != %s ", (iccid, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ICCID_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_iot_sim_cards "
                      " SET iccid = %s, description = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (iccid,
                                    description,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200

