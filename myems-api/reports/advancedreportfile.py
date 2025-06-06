import base64
import sys
from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import access_control, api_key_control
import config


class AdvancedReportFileCollection:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query advanced reports
    # Step 3: construct the result
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        print(req.params)
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if reporting_period_start_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
        else:
            reporting_period_start_datetime_local = str.strip(reporting_period_start_datetime_local)
            try:
                reporting_start_datetime_utc = datetime.strptime(reporting_period_start_datetime_local,
                                                                 '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
            reporting_start_datetime_utc = \
                reporting_start_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
            # nomalize the start datetime
            if config.minutes_to_count == 30 and reporting_start_datetime_utc.minute >= 30:
                reporting_start_datetime_utc = reporting_start_datetime_utc.replace(minute=30, second=0, microsecond=0)
            else:
                reporting_start_datetime_utc = reporting_start_datetime_utc.replace(minute=0, second=0, microsecond=0)

        if reporting_period_end_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
        else:
            reporting_period_end_datetime_local = str.strip(reporting_period_end_datetime_local)
            try:
                reporting_end_datetime_utc = datetime.strptime(reporting_period_end_datetime_local,
                                                               '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                    timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPORTING_PERIOD_END_DATETIME')

        ################################################################################################################
        # Step 2: query advanced reports
        ################################################################################################################

        cnx_reporting = mysql.connector.connect(**config.myems_reporting_db)
        cursor_reporting = cnx_reporting.cursor()

        query = (" SELECT id, file_name, uuid, create_datetime_utc, file_type, file_object "
                 " FROM tbl_reports_files "
                 " WHERE create_datetime_utc >= %s AND create_datetime_utc < %s "
                 " ORDER BY create_datetime_utc desc ")
        cursor_reporting.execute(query, (reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows = cursor_reporting.fetchall()
        if cursor_reporting:
            cursor_reporting.close()
        if cnx_reporting:
            cnx_reporting.close()

        ################################################################################################################
        # Step 3: construct the result
        ################################################################################################################
        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                # Base64 encode the bytes
                # get the Base64 encoded data using human-readable characters.
                meta_result = {"id": row[0],
                               "file_name": row[1],
                               "uuid": row[2],
                               "create_datetime_local": (row[3].replace(tzinfo=None) +
                                                         timedelta(minutes=timezone_offset)).isoformat(),
                               "file_type": row[4],
                               "file_size_bytes": sys.getsizeof(row[5]),
                               "file_bytes_base64": (base64.b64encode(row[5])).decode('utf-8')}
                result.append(meta_result)

        resp.text = json.dumps(result)


class AdvancedReportFileItem:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
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
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx_reporting = mysql.connector.connect(**config.myems_reporting_db)
        cursor_reporting = cnx_reporting.cursor()

        query = (" SELECT id, file_name, uuid, create_datetime_utc, file_type, file_object "
                 " FROM tbl_reports_files "
                 " WHERE id = %s ")
        cursor_reporting.execute(query, (id_,))
        row = cursor_reporting.fetchone()
        if cursor_reporting:
            cursor_reporting.close()
        if cnx_reporting:
            cnx_reporting.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        # Base64 encode the bytes
        # get the Base64 encoded data using human-readable characters.

        result = {"id": row[0],
                  "file_name": row[1],
                  "uuid": row[2],
                  "create_datetime": row[3].replace(tzinfo=timezone.utc).timestamp() * 1000,
                  "file_type": row[4],
                  "file_bytes_base64": (base64.b64encode(row[5])).decode('utf-8')}
        resp.text = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx_reporting = mysql.connector.connect(**config.myems_reporting_db)
        cursor_reporting = cnx_reporting.cursor()

        cursor_reporting.execute(" SELECT id "
                                 " FROM tbl_reports_files "
                                 " WHERE id = %s ", (id_,))
        if cursor_reporting.fetchone() is None:
            cursor_reporting.close()
            cnx_reporting.close()
            raise falcon.HTTPError(status=falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        cursor_reporting.execute(" DELETE FROM tbl_reports_files "
                                 " WHERE id = %s ", (id_,))
        cnx_reporting.commit()

        if cursor_reporting:
            cursor_reporting.close()
        if cnx_reporting:
            cnx_reporting.close()

        resp.status = falcon.HTTP_204
