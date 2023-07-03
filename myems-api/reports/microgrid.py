from datetime import datetime, timedelta
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

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the microgrid
    # Step 3: query associated batteries
    # Step 4: query associated converters
    # Step 5: query associated evchargers
    # Step 6: query associated generators
    # Step 7: query associated grids
    # Step 8: query associated heatpumps
    # Step 9: query associated inverters
    # Step 10: query associated loads
    # Step 11: query associated photovoltaics
    # Step 12: query associated sensors
    # Step 13: query associated windturbines
    # Step 14: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        access_control(req)
        print(req.params)
        microgrid_id = req.params.get('microgrid_id')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if microgrid_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')
        else:
            microgrid_id = str.strip(microgrid_id)
            if not microgrid_id.isdigit() or int(microgrid_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_MICROGRID_ID')
        # set the earliest datetime of valid actual value
        # if the utc_date_time is less than reporting_start_datetime_utc, then the value is None because of timeout
        reporting_start_datetime_utc = datetime.utcnow() - timedelta(minutes=30)

        ################################################################################################################
        # Step 2: Step 2: query the microgrid
        ################################################################################################################
        if not microgrid_id.isdigit() or int(microgrid_id) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrid_architecture_types ")
        cursor.execute(query)
        rows_architecture_types = cursor.fetchall()

        architecture_type_dict = dict()
        if rows_architecture_types is not None and len(rows_architecture_types) > 0:
            for row in rows_architecture_types:
                architecture_type_dict[row[0]] = {"id": row[0], "name": row[1], "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrid_owner_types ")
        cursor.execute(query)
        rows_microgrid_owner_types = cursor.fetchall()

        microgrid_owner_type_dict = dict()
        if rows_microgrid_owner_types is not None and len(rows_microgrid_owner_types) > 0:
            for row in rows_microgrid_owner_types:
                microgrid_owner_type_dict[row[0]] = {"id": row[0],
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
                 "        address, postal_code, latitude, longitude, capacity, "
                 "        architecture_type_id, owner_type_id, "
                 "        is_input_counted, is_output_counted, "
                 "        contact_id, cost_center_id, svg, description "
                 " FROM tbl_microgrids "
                 " WHERE id = %s ")
        cursor.execute(query, (microgrid_id,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')
        else:
            architecture_type = architecture_type_dict.get(row[8], None)
            owner_type = microgrid_owner_type_dict.get(row[9], None)
            contact = contact_dict.get(row[12], None)
            cost_center = cost_center_dict.get(row[13], None)
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "address": row[3],
                           "postal_code": row[4],
                           "latitude": row[5],
                           "longitude": row[6],
                           "capacity": row[7],
                           "architecture_type": architecture_type,
                           "owner_type": owner_type,
                           "is_input_counted": bool(row[10]),
                           "is_output_counted": bool(row[11]),
                           "contact": contact,
                           "cost_center": cost_center,
                           "svg": row[14],
                           "description": row[15],
                           "qrcode": 'microgrid:' + row[2]}

        ################################################################################################################
        # Step 6: construct the report
        ################################################################################################################
        resp.text = json.dumps(meta_result)
