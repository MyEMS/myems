from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import access_control
import config


class Reporting:
    @staticmethod
    def __init__():
        """"Initializes Reporting"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query analog points latest values
    # Step 3: query energy points latest values
    # Step 4: query digital points latest values
    # Step 5: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        access_control(req)
        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        reporting_end_datetime_utc = datetime.utcnow()
        reporting_start_datetime_utc = reporting_end_datetime_utc - timedelta(minutes=60)

        latest_value_data = list()
        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        ################################################################################################################
        # Step 2: query analog points latest values
        ################################################################################################################

        query = (" SELECT point_id, utc_date_time, actual_value "
                 " FROM tbl_analog_value_latest "
                 " WHERE utc_date_time BETWEEN %s AND %s "
                 " ORDER BY utc_date_time ")
        cursor_historical.execute(query, (reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                current_value = dict()
                current_value['point_id'] = row[0]
                current_datetime_local = row[1].replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                current_value['datetime'] = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                current_value['value'] = row[2]
                latest_value_data.append(current_value)

        ################################################################################################################
        # Step 3: query energy points latest values
        ################################################################################################################
        query = (" SELECT point_id, utc_date_time, actual_value "
                 " FROM tbl_energy_value_latest "
                 " WHERE utc_date_time BETWEEN %s AND %s "
                 " ORDER BY utc_date_time ")
        cursor_historical.execute(query, (reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                current_value = dict()
                current_value['point_id'] = row[0]
                current_datetime_local = row[1].replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                current_value['datetime'] = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                current_value['value'] = row[2]
                latest_value_data.append(current_value)

        ################################################################################################################
        # Step 4: query digital points latest values
        ################################################################################################################

        query = (" SELECT point_id, utc_date_time, actual_value "
                 " FROM tbl_digital_value_latest "
                 " WHERE utc_date_time BETWEEN %s AND %s "
                 " ORDER BY utc_date_time ")
        cursor_historical.execute(query, (reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                current_value = dict()
                current_value['point_id'] = row[0]
                current_datetime_local = row[1].replace(tzinfo=timezone.utc) + timedelta(minutes=timezone_offset)
                current_value['datetime'] = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                current_value['value'] = row[2]
                latest_value_data.append(current_value)

        ################################################################################################################
        # Step 5: construct the report
        ################################################################################################################

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()

        resp.text = json.dumps(latest_value_data)
