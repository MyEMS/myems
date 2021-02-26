import falcon
import simplejson as json
import mysql.connector
from datetime import datetime, timedelta, timezone
import base64
import sys
import config


class AdvancedReportCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query advanced reports
    # Step 3: construct the result
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        print(req.params)
        reporting_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_end_datetime_local = req.params.get('reportingperiodenddatetime')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if reporting_start_datetime_local is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
        else:
            reporting_start_datetime_local = str.strip(reporting_start_datetime_local)
            try:
                reporting_start_datetime_utc = datetime.strptime(reporting_start_datetime_local,
                                                                 '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                    timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_START_DATETIME")

        if reporting_end_datetime_local is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
        else:
            reporting_end_datetime_local = str.strip(reporting_end_datetime_local)
            try:
                reporting_end_datetime_utc = datetime.strptime(reporting_end_datetime_local,
                                                               '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                    timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPORTING_PERIOD_END_DATETIME')

        ################################################################################################################
        # Step 2: query advanced reports
        ################################################################################################################

        cnx_reporting = mysql.connector.connect(**config.myems_reporting_db)
        cursor_reporting = cnx_reporting.cursor(dictionary=True)

        query = (" SELECT id, file_name, uuid, create_datetime_utc, file_type, file_object "
                 " FROM tbl_reports_files "
                 " WHERE create_datetime_utc >= %s AND create_datetime_utc < %s "
                 " ORDER BY create_datetime_utc desc ")
        cursor_reporting.execute(query, (reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows = cursor_reporting.fetchall()
        if cursor_reporting:
            cursor_reporting.close()
        if cnx_reporting:
            cnx_reporting.disconnect()

        ################################################################################################################
        # Step 3: construct the result
        ################################################################################################################
        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                # Base64 encode the bytes
                base64_encoded_data = base64.b64encode(row['file_object'])
                # get the Base64 encoded data using human-readable characters.
                base64_message = base64_encoded_data.decode('utf-8')
                create_datetime_local = row['create_datetime_utc'].replace(tzinfo=None) + \
                    timedelta(minutes=timezone_offset)
                meta_result = {"id": row['id'],
                               "file_name": row['file_name'],
                               "uuid": row['uuid'],
                               "create_datetime_local": create_datetime_local.isoformat(),
                               "file_type": row['file_type'],
                               "file_size_bytes": sys.getsizeof(row['file_object']),
                               "file_bytes_base64": base64_message}
                result.append(meta_result)

        resp.body = json.dumps(result)


class AdvancedReportItem:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx_reporting = mysql.connector.connect(**config.myems_reporting_db)
        cursor_reporting = cnx_reporting.cursor(dictionary=True)

        query = (" SELECT id, file_name, uuid, create_datetime_utc, file_type, file_object "
                 " FROM tbl_reports_files "
                 " WHERE id = %s ")
        cursor_reporting.execute(query, (id_,))
        row = cursor_reporting.fetchone()
        if cursor_reporting:
            cursor_reporting.close()
        if cnx_reporting:
            cnx_reporting.disconnect()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        # Base64 encode the bytes
        base64_encoded_data = base64.b64encode(row['file_object'])
        # get the Base64 encoded data using human-readable characters.
        base64_message = base64_encoded_data.decode('utf-8')

        result = {"id": row['id'],
                  "file_name": row['file_name'],
                  "uuid": row['uuid'],
                  "create_datetime":
                  row['create_datetime_utc'].replace(tzinfo=timezone.utc).timestamp() * 1000,
                  "file_type": row['file_type'],
                  "file_bytes_base64": base64_message}
        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx_reporting = mysql.connector.connect(**config.myems_reporting_db)
        cursor_reporting = cnx_reporting.cursor(dictionary=True)

        cursor_reporting.execute(" SELECT id "
                                 " FROM tbl_reports_files "
                                 " WHERE id = %s ", (id_,))
        if cursor_reporting.fetchone() is None:
            cursor_reporting.close()
            cnx_reporting.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        cursor_reporting.execute(" DELETE FROM tbl_reports_files "
                                 " WHERE id = %s ", (id_,))
        cnx_reporting.commit()

        if cursor_reporting:
            cursor_reporting.close()
        if cnx_reporting:
            cnx_reporting.disconnect()

        resp.status = falcon.HTTP_204
