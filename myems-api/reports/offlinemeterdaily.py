import re
import falcon
import simplejson as json
import mysql.connector
import config
import calendar
from datetime import datetime, timedelta, timezone
from core.useractivity import access_control, api_key_control


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
    # Step 2: query the offline meter
    # Step 3: query associated points
    # Step 4: query reporting period points trends
    # Step 5: query tariff data
    # Step 6: construct the report
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
        offline_meter_id = req.params.get('offlinemeterid')
        offline_meter_uuid = req.params.get('offlinemeteruuid')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if offline_meter_id is None and offline_meter_uuid is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_OFFLINE_METER_ID')

        if offline_meter_id is not None:
            offline_meter_id = str.strip(offline_meter_id)
            if not offline_meter_id.isdigit() or int(offline_meter_id) <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_OFFLINE_METER_ID')

        if offline_meter_uuid is not None:
            regex = re.compile('^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\\Z', re.I)
            match = regex.match(str.strip(offline_meter_uuid))
            if not bool(match):
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_OFFLINE_METER_UUID')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if reporting_period_start_datetime_local is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
        else:
            reporting_period_start_datetime_local = str.strip(reporting_period_start_datetime_local)
            try:
                reporting_start_datetime_utc = datetime.strptime(reporting_period_start_datetime_local,
                                                                 '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
            reporting_start_datetime_utc = reporting_start_datetime_utc.replace(tzinfo=timezone.utc) - \
                timedelta(minutes=timezone_offset)

        if reporting_period_end_datetime_local is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
        else:
            reporting_period_end_datetime_local = str.strip(reporting_period_end_datetime_local)
            try:
                reporting_end_datetime_utc = datetime.strptime(reporting_period_end_datetime_local,
                                                               '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
            reporting_end_datetime_utc = reporting_end_datetime_utc.replace(tzinfo=timezone.utc) - \
                timedelta(minutes=timezone_offset)

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPORTING_PERIOD_END_DATETIME')

        ################################################################################################################
        # Step 2: query the offline meter
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_historical = cnx_energy.cursor()
        if offline_meter_id is not None:
            cursor_system.execute(" SELECT id, name   "
                                  " FROM  tbl_offline_meters  "
                                  " WHERE id = %s ", (offline_meter_id,))
            row_offline_meter = cursor_system.fetchone()
        if row_offline_meter is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.disconnect()

            if cursor_historical:
                cursor_historical.close()
            if cnx_energy:
                cnx_energy.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_NOT_FOUND')

        #######################################################
        # Step 4: query reporting period points trends
        #######################################################
        reporting_date_list = list()
        reporting_daily_values = list()
        reportyear = reporting_period_start_datetime_local[0:4]
        reportmonth = reporting_period_start_datetime_local[5:7]
        daysnum = calendar.monthrange(int(reportyear), int(reportmonth))
        for i in range(daysnum[1]):
            reporting_period_start_datetime_local = reportyear + '-' + reportmonth + '-' + \
                                                    str(i + 1).rjust(2, '0') + 'T00:00:00'
            reporting_start_datetime_utc = datetime.strptime(reporting_period_start_datetime_local,
                                                             '%Y-%m-%dT%H:%M:%S')
            reporting_start_datetime_utc = reporting_start_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(
                minutes=timezone_offset)
            reporting_period_end_datetime_local = reportyear + '-' + reportmonth + '-' + str(i + 1).rjust(2, '0') + \
                'T23:59:59'
            reporting_end_datetime_utc = datetime.strptime(reporting_period_end_datetime_local,
                                                           '%Y-%m-%dT%H:%M:%S')
            reporting_end_datetime_utc = reporting_end_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(
                minutes=timezone_offset)
            query = (" SELECT sum(actual_value) as sum_val"
                     " FROM  tbl_offline_meter_hourly  "
                     " WHERE offline_meter_id = %s "
                     " AND start_datetime_utc BETWEEN %s AND %s ")
            cursor_historical.execute(query, (row_offline_meter[0],
                                              reporting_start_datetime_utc,
                                              reporting_end_datetime_utc))
            rows = cursor_historical.fetchone()
            datetime_utc = reportmonth + '-' + str(i + 1).rjust(2, '0')
            if rows is not None and len(rows) > 0:
                reporting_date_list.append(datetime_utc)
                reporting_daily_values.append(rows[0])
            else:
                reporting_daily_values.append(None)
        ################################################################################################################
        # Step 6: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.disconnect()

        if cursor_historical:
            cursor_historical.close()
        if cnx_energy:
            cnx_energy.disconnect()

        result_values = []
        for date, daily_value in zip(reporting_date_list, reporting_daily_values):
            result_values.append({
                "monthdate": date,
                "daily_value": daily_value
            })

        resp.text = json.dumps(result_values)
