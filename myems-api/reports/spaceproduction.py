from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
from core import utilities
from core.useractivity import access_control, api_key_control


class Reporting:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
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
        space_id = req.params.get('spaceid')
        product_id = req.params.get('productid')
        period_type = req.params.get('periodtype')
        base_period_start_datetime_local = req.params.get('baseperiodstartdatetime')
        base_period_end_datetime_local = req.params.get('baseperiodenddatetime')
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

        base_start_datetime_utc = None
        if base_period_start_datetime_local is not None and len(str.strip(base_period_start_datetime_local)) > 0:
            base_period_start_datetime_local = str.strip(base_period_start_datetime_local)
            try:
                base_start_datetime_utc = datetime.strptime(base_period_start_datetime_local, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_BASE_PERIOD_START_DATETIME')
            base_start_datetime_utc = \
                base_start_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
            # nomalize the start datetime
            if config.minutes_to_count == 30 and base_start_datetime_utc.minute >= 30:
                base_start_datetime_utc = base_start_datetime_utc.replace(minute=30, second=0, microsecond=0)
            else:
                base_start_datetime_utc = base_start_datetime_utc.replace(minute=0, second=0, microsecond=0)

        base_end_datetime_utc = None
        if base_period_end_datetime_local is not None or len(str.strip(base_period_end_datetime_local)) > 0:
            base_period_end_datetime_local = str.strip(base_period_end_datetime_local)
            try:
                base_end_datetime_utc = datetime.strptime(base_period_end_datetime_local, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_BASE_PERIOD_END_DATETIME')
            base_end_datetime_utc = \
                base_end_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
            
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

        if period_type is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PERIOD_TYPE')
        else:
            period_type = str.strip(period_type)
            if period_type not in ['hourly', 'daily', 'weekly', 'monthly', 'yearly']:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PERIOD_TYPE')
        
        is_quick_mode = False
        if quick_mode is not None and \
            len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True
        
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()
        
        cursor_system.execute(" SELECT name, area, number_of_occupants, cost_center_id "
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
            space_area = row[1]
            space_center_id = row[2]
            space_number_of_occupants = row[3]

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
        # Step 2: query base period production
        ################################################################################################################
        base_date_list = list()
        base_daily_values = list()

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
                                          base_start_datetime_utc,
                                          base_end_datetime_utc))
        rows_space_production_hourly = cursor_production.fetchall()

        start_datetime_utc = base_start_datetime_utc.replace(tzinfo=None)
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

            base_date_list.append(current_datetime)
            base_daily_values.append(subtotal)
            current_datetime_utc += timedelta(days=1)
            start_datetime_local += timedelta(days=1)

        ################################################################################################################
        # Step 3: query energy categories
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_billing = mysql.connector.connect(**config.myems_billing_db)
        cursor_billing = cnx_billing.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        energy_category_set = set()
        # query energy categories in base period
        cursor_billing.execute(" SELECT DISTINCT(energy_category_id) "
                               " FROM tbl_space_input_category_hourly "
                               " WHERE space_id = %s "
                               "     AND start_datetime_utc >= %s "
                               "     AND start_datetime_utc < %s ",
                               (space_id, base_start_datetime_utc, base_end_datetime_utc))
        rows_energy_categories = cursor_billing.fetchall()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set.add(row_energy_category[0])

        # query energy categories in reporting period
        cursor_billing.execute(" SELECT DISTINCT(energy_category_id) "
                               " FROM tbl_space_input_category_hourly "
                               " WHERE space_id = %s "
                               "     AND start_datetime_utc >= %s "
                               "     AND start_datetime_utc < %s ",
                               (space_id, reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_energy_categories = cursor_billing.fetchall()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set.add(row_energy_category[0])

        # query all energy categories in base period and reporting period
        cursor_system.execute(" SELECT id, name, unit_of_measure, kgce, kgco2e "
                              " FROM tbl_energy_categories "
                              " ORDER BY id ", )
        rows_energy_categories = cursor_system.fetchall()
        if rows_energy_categories is None or len(rows_energy_categories) == 0:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()

            if cursor_billing:
                cursor_billing.close()
            if cnx_billing:
                cnx_billing.close()

            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            raise falcon.HTTPError(status=falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')
        energy_category_dict = dict()
        for row_energy_category in rows_energy_categories:
            if row_energy_category[0] in energy_category_set:
                energy_category_dict[row_energy_category[0]] = {"name": row_energy_category[1],
                                                                "unit_of_measure": row_energy_category[2],
                                                                "kgce": row_energy_category[3],
                                                                "kgco2e": row_energy_category[4]}

        ################################################################################################################
        # Step 4: query reporting period production
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

        query = (" SELECT name, unit_of_measure, tag, standard_product_coefficient "
                 " FROM tbl_products "
                 " WHERE id = %s ")
        cursor_production.execute(query, (product_id,))
        row_product = cursor_production.fetchone()
        product_dict = dict()
        product_dict['name'] = row_product[0]
        product_dict['unit'] = row_product[1]
        product_dict['tag'] = row_product[2]
        product_dict['coefficient'] = row_product[3]
        
        ################################################################################################################
        # Step 5: query base period production
        ################################################################################################################
        base_date_list = list()
        base_daily_values = list()

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
                                          base_start_datetime_utc,
                                          base_end_datetime_utc))
        rows_space_production_hourly = cursor_production.fetchall()
        start_datetime_utc = base_start_datetime_utc.replace(tzinfo=None)
        end_datetime_utc = base_end_datetime_utc.replace(tzinfo=None)

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

            base_date_list.append(current_datetime)
            base_daily_values.append(subtotal)
            current_datetime_utc += timedelta(days=1)
            start_datetime_local += timedelta(days=1)

        ################################################################################################################
        # Step 6: query base period energy consumption
        ################################################################################################################
        base = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                kgce = energy_category_dict[energy_category_id]['kgce']
                kgco2e = energy_category_dict[energy_category_id]['kgco2e']

                base[energy_category_id] = dict()
                base[energy_category_id]['timestamps'] = list()
                base[energy_category_id]['values'] = list()
                base[energy_category_id]['subtotal'] = Decimal(0.0)
                base[energy_category_id]['subtotal_in_kgce'] = Decimal(0.0)
                base[energy_category_id]['subtotal_in_kgco2e'] = Decimal(0.0)

                cursor_billing.execute(" SELECT start_datetime_utc, actual_value "
                                       " FROM tbl_space_input_category_hourly "
                                       " WHERE space_id = %s "
                                       "     AND energy_category_id = %s "
                                       "     AND start_datetime_utc >= %s "
                                       "     AND start_datetime_utc < %s "
                                       " ORDER BY start_datetime_utc ",
                                       (space_id,
                                        energy_category_id,
                                        base_start_datetime_utc,
                                        base_end_datetime_utc))
                rows_space_hourly = cursor_billing.fetchall()

                rows_space_periodically = utilities.aggregate_hourly_data_by_period(rows_space_hourly,
                                                                                    base_start_datetime_utc,
                                                                                    base_end_datetime_utc,
                                                                                    period_type)
                for row_space_periodically in rows_space_periodically:
                    current_datetime_local = row_space_periodically[0].replace(tzinfo=timezone.utc) + \
                                             timedelta(minutes=timezone_offset)
                    if period_type == 'hourly':
                        current_datetime = current_datetime_local.isoformat()[0:19]
                    elif period_type == 'daily':
                        current_datetime = current_datetime_local.isoformat()[0:10]
                    elif period_type == 'weekly':
                        current_datetime = current_datetime_local.isoformat()[0:10]
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.isoformat()[0:7]
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.isoformat()[0:4]

                    actual_value = Decimal(0.0) if row_space_periodically[1] is None else row_space_periodically[1]
                    base[energy_category_id]['timestamps'].append(current_datetime)
                    base[energy_category_id]['values'].append(actual_value)
                    base[energy_category_id]['subtotal'] += actual_value
                    base[energy_category_id]['subtotal_in_kgce'] += actual_value * kgce
                    base[energy_category_id]['subtotal_in_kgco2e'] += actual_value * kgco2e

        ################################################################################################################
        # Step 7: query reporting period energy consumption
        ################################################################################################################
        reporting = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                kgce = energy_category_dict[energy_category_id]['kgce']
                kgco2e = energy_category_dict[energy_category_id]['kgco2e']

                reporting[energy_category_id] = dict()
                reporting[energy_category_id]['timestamps'] = list()
                reporting[energy_category_id]['values'] = list()
                reporting[energy_category_id]['subtotal'] = Decimal(0.0)
                reporting[energy_category_id]['subtotal_in_kgce'] = Decimal(0.0)
                reporting[energy_category_id]['subtotal_in_kgco2e'] = Decimal(0.0)

                cursor_billing.execute(" SELECT start_datetime_utc, actual_value "
                                       " FROM tbl_space_input_category_hourly "
                                       " WHERE space_id = %s "
                                       "     AND energy_category_id = %s "
                                       "     AND start_datetime_utc >= %s "
                                       "     AND start_datetime_utc < %s "
                                       " ORDER BY start_datetime_utc ",
                                       (space_id,
                                        energy_category_id,
                                        reporting_start_datetime_utc,
                                        reporting_end_datetime_utc))
                rows_space_hourly = cursor_billing.fetchall()

                rows_space_periodically = utilities.aggregate_hourly_data_by_period(rows_space_hourly,
                                                                                    reporting_start_datetime_utc,
                                                                                    reporting_end_datetime_utc,
                                                                                    period_type)
                for row_space_periodically in rows_space_periodically:
                    current_datetime_local = row_space_periodically[0].replace(tzinfo=timezone.utc) + \
                                             timedelta(minutes=timezone_offset)
                    if period_type == 'hourly':
                        current_datetime = current_datetime_local.isoformat()[0:19]
                    elif period_type == 'daily':
                        current_datetime = current_datetime_local.isoformat()[0:10]
                    elif period_type == 'weekly':
                        current_datetime = current_datetime_local.isoformat()[0:10]
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.isoformat()[0:7]
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.isoformat()[0:4]

                    actual_value = Decimal(0.0) if row_space_periodically[1] is None else row_space_periodically[1]
                    reporting[energy_category_id]['timestamps'].append(current_datetime)
                    reporting[energy_category_id]['values'].append(actual_value)
                    reporting[energy_category_id]['subtotal'] += actual_value
                    reporting[energy_category_id]['subtotal_in_kgce'] += actual_value * kgce
                    reporting[energy_category_id]['subtotal_in_kgco2e'] += actual_value * kgco2e

        ################################################################################################################
        # Step 8: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.disconnect()

        if cursor_production:
            cursor_production.close()
        if cnx_production:
            cnx_production.disconnect()

        if cursor_billing:
            cursor_billing.close()
        if cnx_billing:
            cnx_billing.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()

        reporting_result_values = []
        base_result_values = []
        result = dict()
        
        result['space'] = dict()
        result['space']['name'] = space_name
        result['space']['area'] = space_area
        result['space']['number_of_occupants'] = space_number_of_occupants

        result['base_period'] = dict()
        result['base_period']['names'] = list()
        result['base_period']['units'] = list()
        result['base_period']['timestamps'] = list()
        result['base_period']['values'] = list()
        result['base_period']['subtotals'] = list()
        result['base_period']['total'] = Decimal(0.0)
        result['base_period']['subtotals_in_kgce'] = list()
        result['base_period']['subtotals_in_kgco2e'] = list()
        result['base_period']['total_in_kgce'] = Decimal(0.0)
        result['base_period']['total_in_kgco2e'] = Decimal(0.0)

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['base_period']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['base_period']['units'].append(config.currency_unit)
                result['base_period']['timestamps'].append(base[energy_category_id]['timestamps'])
                result['base_period']['values'].append(base[energy_category_id]['values'])
                result['base_period']['subtotals'].append(base[energy_category_id]['subtotal'])
                result['base_period']['total'] += base[energy_category_id]['subtotal']
                result['base_period']['subtotals_in_kgce'].append(base[energy_category_id]['subtotal_in_kgce'])
                result['base_period']['subtotals_in_kgco2e'].append(base[energy_category_id]['subtotal_in_kgco2e'])
                result['base_period']['total_in_kgce'] += base[energy_category_id]['subtotal_in_kgce']
                result['base_period']['total_in_kgco2e'] += base[energy_category_id]['subtotal_in_kgco2e']

        result['reporting_period'] = dict()
        result['reporting_period']['names'] = list()
        result['reporting_period']['energy_category_ids'] = list()
        result['reporting_period']['units'] = list()
        result['reporting_period']['timestamps'] = list()
        result['reporting_period']['values'] = list()
        result['reporting_period']['subtotals'] = list()
        result['reporting_period']['total'] = Decimal(0.0)
        result['reporting_period']['subtotals_in_kgce'] = list()
        result['reporting_period']['subtotals_in_kgco2e'] = list()
        result['reporting_period']['subtotals_per_unit_area'] = list()
        result['reporting_period']['subtotals_per_capita'] = list()
        result['reporting_period']['total_in_kgce'] = Decimal(0.0)
        result['reporting_period']['total_in_kgco2e'] = Decimal(0.0)
        result['reporting_period']['total_unit'] = config.currency_unit
        result['reporting_period']['rates'] = list()
        result['reporting_period']['increment_rates'] = list()
        result['reporting_period']['increment_rate_in_kgce'] = Decimal(0.0)
        result['reporting_period']['increment_rate_in_kgco2e'] = Decimal(0.0)

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['reporting_period']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['reporting_period']['energy_category_ids'].append(energy_category_id)
                result['reporting_period']['units'].append(config.currency_unit)
                result['reporting_period']['timestamps'].append(reporting[energy_category_id]['timestamps'])
                result['reporting_period']['values'].append(reporting[energy_category_id]['values'])
                result['reporting_period']['subtotals'].append(reporting[energy_category_id]['subtotal'])
                result['reporting_period']['total'] += reporting[energy_category_id]['subtotal']
                result['reporting_period']['subtotals_in_kgce'].append(
                    reporting[energy_category_id]['subtotal_in_kgce'])
                result['reporting_period']['subtotals_in_kgco2e'].append(
                    reporting[energy_category_id]['subtotal_in_kgco2e'])
                result['reporting_period']['total_in_kgce'] += reporting[energy_category_id]['subtotal_in_kgce']
                result['reporting_period']['total_in_kgco2e'] += reporting[energy_category_id]['subtotal_in_kgco2e']
                result['reporting_period']['increment_rates'].append(
                    (reporting[energy_category_id]['subtotal'] - base[energy_category_id]['subtotal']) /
                    base[energy_category_id]['subtotal']
                    if base[energy_category_id]['subtotal'] > 0.0 else None)
                
        reporting_period_total_production = 0
        for date, daily_value in zip(reporting_date_list, reporting_daily_values):
            reporting_period_total_production += daily_value if daily_value is not None else 0

        base_period_total_production = 0
        for date, daily_value in zip(base_date_list, base_daily_values):
            base_period_total_production += daily_value if daily_value is not None else 0

        result['reporting_period']['total_in_kgco2e_per_prodution'] = \
            result['reporting_period']['total_in_kgce'] / reporting_period_total_production \
            if reporting_period_total_production > 0.0 else None

        result['reporting_period']['increment_rate_in_kgce'] = \
            (result['reporting_period']['total_in_kgce'] - result['base_period']['total_in_kgce']) / \
            result['base_period']['total_in_kgce'] \
            if result['base_period']['total_in_kgce'] > Decimal(0.0) else None

        result['reporting_period']['total_in_kgce_per_prodution'] = \
            result['reporting_period']['total_in_kgco2e'] / reporting_period_total_production \
            if reporting_period_total_production > 0.0 else None

        result['reporting_period']['increment_rate_in_kgco2e'] = \
            (result['reporting_period']['total_in_kgco2e'] - result['base_period']['total_in_kgco2e']) / \
            result['base_period']['total_in_kgco2e'] \
            if result['base_period']['total_in_kgco2e'] > Decimal(0.0) else None
        
        rates = list()
        result['base_production'] = dict()
        result['base_production']['timestamps'] = base_date_list
        result['base_production']['values'] = base_daily_values

        result['reporting_production'] = dict()
        result['reporting_production']['timestamps'] = reporting_date_list
        result['reporting_production']['values'] = reporting_daily_values
        for base, reporting in zip(base_daily_values, reporting_daily_values):
            rate = (reporting - base) / base \
                if reporting is not None and base is not None and base > 0 and reporting > 0 else 0
            rates.append(rate)
        result['reporting_production']['rates'] = rates

        result['reporting_result_values'] = reporting_result_values
        result['reporting_total_production'] = reporting_period_total_production
        result['base_result_values'] = base_result_values
        result['base_total_production'] = base_period_total_production
        result['product'] = product_dict
        resp.text = json.dumps(result)
