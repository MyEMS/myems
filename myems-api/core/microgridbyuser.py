import falcon
import mysql.connector
import simplejson as json
from core.useractivity import access_control
import config


class MicrogridByUser:
    @staticmethod
    def __init__():
        """"Initializes MicrogridCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        access_control(req)
        user_uuid = str.strip(req.headers['USER-UUID'])
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrid_architecture_types ")
        cursor.execute(query)
        rows_architecture_types = cursor.fetchall()
        architecture_type_dict = dict()
        if rows_architecture_types is not None and len(rows_architecture_types) > 0:
            for row in rows_architecture_types:
                architecture_type_dict[row[0]] = {"id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}
        query = (" SELECT id, name, uuid "
                 " FROM tbl_microgrid_owner_types ")
        cursor.execute(query)
        rows_owner_types = cursor.fetchall()

        owner_type_dict = dict()
        if rows_owner_types is not None and len(rows_owner_types) > 0:
            for row in rows_owner_types:
                owner_type_dict[row[0]] = {"id": row[0], "name": row[1], "uuid": row[2]}

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

        # query by user
        query = (" SELECT m.id, m.name, m.uuid, "
                 "        m.address, m.postal_code, m.latitude, m.longitude, m.capacity, "
                 "        m.architecture_type_id, m.owner_type_id, "
                 "        m.contact_id, m.cost_center_id, m.svg, m.description "
                 " FROM tbl_microgrids m INNER JOIN tbl_microgrids_users mu on m.id=mu.microgrid_id "
                 " inner join " + config.myems_user_db['database'] + ".tbl_users u on mu.user_id=u.id "
                                                                     " WHERE u.uuid = %s "
                                                                     " ORDER BY id ")
        cursor.execute(query, (user_uuid,))
        rows_spaces = cursor.fetchall()

        result = list()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                architecture_type = architecture_type_dict.get(row[8], None)
                owner_type = owner_type_dict.get(row[9], None)
                contact = contact_dict.get(row[10], None)
                cost_center = cost_center_dict.get(row[11], None)

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
                               "contact": contact,
                               "cost_center": cost_center,
                               "svg": row[12],
                               "description": row[13],
                               "qrcode": 'microgrid:' + row[2]}
                result.append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)
