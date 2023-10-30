import falcon
import mysql.connector
import simplejson as json
from core.useractivity import access_control
import config


class Reporting:
    @staticmethod
    def __init__():
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        access_control(req)
        # Get user inforamtion
        user_uuid = str.strip(req.headers['USER-UUID'])
        cnx_user_db = mysql.connector.connect(**config.myems_user_db)
        cursor_user_db = cnx_user_db.cursor()
        query = (" SELECT id "
                 " FROM tbl_users "
                 " WHERE uuid = %s ")
        cursor_user_db.execute(query, (user_uuid,))
        row = cursor_user_db.fetchone()
        cursor_user_db.close()
        cnx_user_db.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIVILEGE')
        user_id = row[0]
        # Get all points latest values
        analog_value_latest_dict = dict()
        cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical_db = cnx_historical_db.cursor()
        query = (" SELECT point_id, utc_date_time, actual_value "
                 " FROM tbl_analog_value_latest ")
        cursor_historical_db.execute(query,)
        rows = cursor_historical_db.fetchall()
        cursor_historical_db.close()
        cnx_historical_db.close()
        if rows is not None and len(rows) > 0:
            for row in rows:
                analog_value_latest_dict[row[0]] = {"utc_date_time": row[1],
                                                    "actual_value": row[2]}
        # Get contracts
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_contacts ")
        cursor_system_db.execute(query)
        rows_contacts = cursor_system_db.fetchall()

        contact_dict = dict()
        if rows_contacts is not None and len(rows_contacts) > 0:
            for row in rows_contacts:
                contact_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}
        # Get cost centers
        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor_system_db.execute(query)
        rows_cost_centers = cursor_system_db.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}
        # Get microgrids
        query = (" SELECT m.id, m.name, m.uuid, "
                 "        m.address, m.postal_code, m.latitude, m.longitude, m.capacity, "
                 "        m.contact_id, m.cost_center_id, m.serial_number, m.description "
                 " FROM tbl_microgrids m, tbl_microgrids_users mu "
                 " WHERE m.id = mu.microgrid_id AND mu.user_id = %s "
                 " ORDER BY id ")
        cursor_system_db.execute(query, (user_id, ))
        rows_microgrids = cursor_system_db.fetchall()

        result = list()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                contact = contact_dict.get(row[8], None)
                cost_center = cost_center_dict.get(row[9], None)
                # Get SoC Point
                query = (" SELECT soc_point_id "
                         " FROM tbl_microgrids_batteries "
                         " WHERE id = %s ")
                cursor_system_db.execute(query, (row[0], ))
                row_point = cursor_system_db.fetchone()
                soc_point_value = None
                if row_point is not None and len(row_point) > 0:
                    if analog_value_latest_dict.get(row_point[0]) is not None:
                        soc_point_value = analog_value_latest_dict.get(row_point[0])['actual_value']

                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "address": row[3],
                               "postal_code": row[4],
                               "latitude": row[5],
                               "longitude": row[6],
                               "capacity": row[7],
                               "contact": contact,
                               "cost_center": cost_center,
                               "serial_number": row[10],
                               "description": row[11],
                               "qrcode": 'microgrid:' + row[2],
                               "soc_point_value": soc_point_value}
                result.append(meta_result)

        cursor_system_db.close()
        cnx_system_db.close()
        resp.text = json.dumps(result)
