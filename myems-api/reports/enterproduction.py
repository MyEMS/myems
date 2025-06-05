from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
from core.useractivity import access_control, api_key_control


class Reporting:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query reporting period production
    # Step 3: construct the report
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
        space_id = req.params.get('spaceid')
        product_id = req.params.get('productid')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if space_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if space_id is not None:
            space_id = str.strip(space_id)
            if not space_id.isdigit() or int(space_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_SPACE_ID')

        if product_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_PRODUCT_ID')

        if product_id is not None:
            product_id = str.strip(product_id)
            if not product_id.isdigit() or int(product_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_PRODUCT_ID')

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

        is_quick_mode = False
        if quick_mode is not None and \
                len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cursor_system.execute(" SELECT name "
                              " FROM tbl_spaces "
                              " WHERE id = %s ", (space_id,))
        row = cursor_system.fetchone()

        if row is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')
        else:
            space_name = row[0]

        cnx_production = mysql.connector.connect(**config.myems_production_db)
        cursor_production = cnx_production.cursor()

        cursor_production.execute(" SELECT name "
                                  " FROM tbl_products "
                                  " WHERE id = %s ", (product_id,))
        row = cursor_production.fetchone()

        if row is None:
            if cursor_production:
                cursor_production.close()
            if cnx_production:
                cnx_production.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PRODUCT_NOT_FOUND')
        else:
            product_name = row[0]

        ################################################################################################################
        # Step 2: query reporting period production
        ################################################################################################################
        reporting_date_list = list()
        reporting_daily_values = list()

        cnx_production = mysql.connector.connect(**config.myems_production_db)
        cursor_production = cnx_production.cursor()

        query = (" SELECT start_datetime_utc, product_count "
                 " FROM tbl_space_hourly "
                 " WHERE space_id = %s "
                 " AND product_id = %s "
                 " AND start_datetime_utc >= %s "
                 " AND start_datetime_utc < %s "
                 " ORDER BY start_datetime_utc ")
        cursor_production.execute(query, (space_id,
                                          product_id,
                                          reporting_start_datetime_utc,
                                          reporting_end_datetime_utc))
        rows_space_production_hourly = cursor_production.fetchall()

        start_datetime_utc = reporting_start_datetime_utc.replace(tzinfo=None)
        end_datetime_utc = reporting_end_datetime_utc.replace(tzinfo=None)

        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        current_datetime_utc = start_datetime_local.replace(hour=0) - timedelta(hours=int(config.utc_offset[1:3]))

        while current_datetime_utc <= end_datetime_utc:
            flag = True
            subtotal = Decimal(0.0)
            for row in rows_space_production_hourly:
                if current_datetime_utc <= row[0] < current_datetime_utc + timedelta(days=1):
                    flag = False
                    subtotal += row[1]
            if flag:
                subtotal = None
            current_datetime = start_datetime_local.isoformat()[0:10]

            reporting_date_list.append(current_datetime)
            reporting_daily_values.append(subtotal)
            current_datetime_utc += timedelta(days=1)
            start_datetime_local += timedelta(days=1)

        ################################################################################################################
        # Step 3: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.disconnect()

        if cursor_production:
            cursor_production.close()
        if cnx_production:
            cnx_production.disconnect()

        result_values = []
        for date, daily_value in zip(reporting_date_list, reporting_daily_values):
            result_values.append({
                "monthdate": date,
                "daily_value": daily_value
            })

        resp.text = json.dumps(result_values)

    @staticmethod
    def on_post(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        """Handles POST requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
            formdata = new_values['value']
            production_data = dict()
            production_data['space_id'] = new_values['spaceid']
            production_data['product_id'] = new_values['spaceid']
            production_data['data'] = dict()
            for item in formdata:
                start_datetime_local = datetime(year=int(item[0][0:4]),
                                                month=int(item[0][5:7]),
                                                day=int(item[0][8:10]))
                start_datetime_utc = start_datetime_local - timedelta(minutes=timezone_offset)
                if item[1] is None or \
                        item[1] == '' or \
                        float(item[1]) < 0:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_PRODUCTION_VALUE')
                production_data['data'][start_datetime_utc] = Decimal(item[1])
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PRODUCTION_VALUE')

        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cursor_system.execute(" SELECT name "
                              " FROM tbl_spaces "
                              " WHERE id = %s ", (str(production_data['space_id']),))
        row = cursor_system.fetchone()

        if row is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')

        cnx_production = mysql.connector.connect(**config.myems_production_db)
        cursor_production = cnx_production.cursor()

        cursor_production.execute(" SELECT name "
                                  " FROM tbl_products "
                                  " WHERE id = %s ", (production_data['product_id'],))
        row = cursor_production.fetchone()

        if row is None:
            if cursor_production:
                cursor_production.close()
            if cnx_production:
                cnx_production.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PRODUCT_NOT_FOUND')

        for start_datetime_utc, daily_value in production_data['data'].items():
            end_datetime_utc = (start_datetime_utc + timedelta(hours=24))
            actual_value = \
                round(daily_value / (Decimal(24) * Decimal(60) / Decimal(config.minutes_to_count)), 3)

            cursor_production.execute(" DELETE FROM tbl_space_hourly WHERE space_id = %s AND product_id = %s "
                                      " AND start_datetime_utc >= %s AND start_datetime_utc < %s ",
                                      (production_data['space_id'], production_data['product_id'],
                                       start_datetime_utc.isoformat()[0:19],
                                       end_datetime_utc.isoformat()[0:19]))

            cnx_production.commit()

            add_values = (" INSERT INTO tbl_space_hourly "
                          "(space_id, product_id, start_datetime_utc, product_count) "
                          " VALUES  ")
            sum_24hours = actual_value * 24
            last_date_utc = end_datetime_utc - timedelta(minutes=config.minutes_to_count)
            while start_datetime_utc < end_datetime_utc:
                if start_datetime_utc == last_date_utc and sum_24hours != daily_value:
                    actual_value = daily_value - sum_24hours + actual_value
                add_values += " (" + str(production_data['space_id']) + ","
                add_values += str(production_data['product_id']) + ","
                add_values += "'" + start_datetime_utc.isoformat()[0:19] + "',"
                add_values += str(actual_value) + "), "
                start_datetime_utc += timedelta(minutes=config.minutes_to_count)
            # trim ", " at the end of string and then execute
            cursor_production.execute(add_values[:-2])
            cnx_production.commit()

        if cursor_system:
            cursor_system.close()

        if cnx_system:
            cnx_system.close()

        if cursor_production:
            cursor_production.close()

        if cnx_production:
            cnx_production.close()

        resp.text = json.dumps({})
