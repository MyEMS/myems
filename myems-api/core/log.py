import falcon
import mysql.connector
import simplejson as json
from datetime import timezone, timedelta
import re

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

        # parse and clamp limit parameter
        limit = req.get_param_as_int('limit') or 100
        if limit <= 0:
            limit = 100
        if limit > 1000:
            limit = 1000

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT l.id, l.user_uuid, u.name, u.display_name, "
                 "        l.request_datetime_utc, l.request_method, l.resource_type, "
                 "        l.resource_id, l.request_body "
                 " FROM tbl_logs l "
                 " LEFT JOIN tbl_users u ON l.user_uuid = u.uuid "
                 " ORDER BY l.request_datetime_utc DESC "
                 " LIMIT %s ")
        cursor.execute(query, (limit,))
        rows = cursor.fetchall()

        result = []
        
        # Parse time zone offset using regex for robustness
        match = re.match(r'([+-]?)(\d{2}):?(\d{2})', config.utc_offset)
        if match:
            sign, hours, minutes = match.groups()
            # Default to + if no sign provided
            if sign == '':
                sign = '+'
            offset = timedelta(hours=int(hours), minutes=int(minutes))
            if sign == '-':
                offset = -offset
            timezone_offset = offset.total_seconds() / 60
        else:
            # Fallback or raise error, here we default to 0 if invalid format to prevent crash
            print(f"Invalid UTC offset format: {config.utc_offset}")
            timezone_offset = 0

        for row in rows:
            # row['request_datetime_utc'] is in UTC
            if row['request_datetime_utc'] is not None:
                local_dt = (row['request_datetime_utc'].replace(tzinfo=timezone.utc) +
                            timedelta(minutes=timezone_offset)).isoformat()[0:19]
                utc_dt = row['request_datetime_utc'].isoformat()[0:19]
            else:
                local_dt = None
                utc_dt = None

            result.append({
                "id": row['id'],
                "user_uuid": row['user_uuid'],
                "user_name": row['name'],
                "user_display_name": row['display_name'],
                "request_datetime": local_dt,
                "request_datetime_utc": utc_dt,
                "request_method": row['request_method'],
                "resource_type": row['resource_type'],
                "resource_id": row['resource_id'],
                "request_body": row['request_body'],
            })

        cursor.close()
        cnx.close()

        resp.text = json.dumps(result)
