import falcon
import mysql.connector
import simplejson as json
from datetime import timezone, timedelta

import config
from core.useractivity import admin_control


class LogCollection:
    """
    Operation log collection resource.

    This resource provides read-only access to records stored in
    `myems_user_db.tbl_logs`, which are written by `useractivity.write_log`.
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        """
        Handle OPTIONS request for CORS preflight.
        """
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """
        Handle GET requests to retrieve operation logs.

        Optional query parameters:
        - limit: maximum number of records to return (default 100, max 1000)
        """
        admin_control(req)

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT l.id, l.user_uuid, u.name, u.display_name, "
                 "        l.request_datetime_utc, l.request_method, l.resource_type, "
                 "        l.resource_id, l.request_body "
                 " FROM tbl_logs l "
                 " LEFT JOIN tbl_users u ON l.user_uuid = u.uuid "
                 " ORDER BY l.request_datetime_utc DESC ")
        cursor.execute(query)
        rows = cursor.fetchall()

        result = []
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        for row in rows:
            # row[4] is request_datetime_utc in UTC
            if row[4] is not None:
                local_dt = (row[4].replace(tzinfo=timezone.utc) +
                            timedelta(minutes=timezone_offset)).isoformat()[0:19]
            else:
                local_dt = None

            result.append({
                "id": row[0],
                "user_uuid": row[1],
                "user_name": row[2],
                "user_display_name": row[3],
                "request_datetime": local_dt,
                "request_datetime_utc": row[4].isoformat()[0:19] if row[4] else None,
                "request_method": row[5],
                "resource_type": row[6],
                "resource_id": row[7],
                "request_body": row[8],
            })

        cursor.close()
        cnx.close()

        resp.text = json.dumps(result)
