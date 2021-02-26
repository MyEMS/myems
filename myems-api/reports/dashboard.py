import falcon
import simplejson as json
import mysql.connector
import config
from datetime import datetime, timedelta, timezone
from core import utilities
from decimal import Decimal


class Reporting:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the space
    # Step 3: query energy categories
    # Step 4: query associated sensors
    # Step 5: query associated points
    # Step 6: query child spaces
    # Step 7: query base period energy input
    # Step 8: query base period energy cost
    # Step 9: query reporting period energy input
    # Step 10: query reporting period energy cost
    # Step 11: query tariff data
    # Step 12: query associated sensors and points data
    # Step 13: query child spaces energy input
    # Step 14: query child spaces energy cost
    # Step 15: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        print(req.params)
        user_uuid = req.params.get('useruuid')
        period_type = req.params.get('periodtype')
        base_start_datetime_local = req.params.get('baseperiodstartdatetime')
        base_end_datetime_local = req.params.get('baseperiodenddatetime')
        reporting_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_end_datetime_local = req.params.get('reportingperiodenddatetime')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if user_uuid is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_USER_UUID')
        else:
            user_uuid = str.strip(user_uuid)
            if len(user_uuid) != 36:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_USER_UUID')

        if period_type is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_PERIOD_TYPE')
        else:
            period_type = str.strip(period_type)
            if period_type not in ['hourly', 'daily', 'monthly', 'yearly']:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_PERIOD_TYPE')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        base_start_datetime_utc = None
        if base_start_datetime_local is not None and len(str.strip(base_start_datetime_local)) > 0:
            base_start_datetime_local = str.strip(base_start_datetime_local)
            try:
                base_start_datetime_utc = datetime.strptime(base_start_datetime_local,
                                                            '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                    timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_BASE_PERIOD_START_DATETIME")

        base_end_datetime_utc = None
        if base_end_datetime_local is not None and len(str.strip(base_end_datetime_local)) > 0:
            base_end_datetime_local = str.strip(base_end_datetime_local)
            try:
                base_end_datetime_utc = datetime.strptime(base_end_datetime_local,
                                                          '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                    timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_BASE_PERIOD_END_DATETIME")

        if base_start_datetime_utc is not None and base_end_datetime_utc is not None and \
                base_start_datetime_utc >= base_end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BASE_PERIOD_END_DATETIME')

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
        # Step 2: query the space
        ################################################################################################################

        cnx_user = mysql.connector.connect(**config.myems_user_db)
        cursor_user = cnx_user.cursor()

        cursor_user.execute(" SELECT id, is_admin, privilege_id "
                            " FROM tbl_users "
                            " WHERE uuid = %s ", (user_uuid,))
        row_user = cursor_user.fetchone()
        if row_user is None:
            if cursor_user:
                cursor_user.close()
            if cnx_user:
                cnx_user.disconnect()

            raise falcon.HTTPError(falcon.HTTP_404, 'API.NOT_FOUND', 'API.USER_NOT_FOUND')

        user = {'id': row_user[0], 'is_admin': row_user[1], 'privilege_id': row_user[2]}
        if user['is_admin']:
            # todo: make sure the space id is always 1 for admin
            space_id = 1
        else:
            cursor_user.execute(" SELECT data "
                                " FROM tbl_privileges "
                                " WHERE id = %s ", (user['privilege_id'],))
            row_privilege = cursor_user.fetchone()
            if row_privilege is None:
                if cursor_user:
                    cursor_user.close()
                if cnx_user:
                    cnx_user.disconnect()

                raise falcon.HTTPError(falcon.HTTP_404, 'API.NOT_FOUND', 'API.USER_PRIVILEGE_NOT_FOUND')

            privilege_data = json.loads(row_privilege[0])
            if 'spaces' not in privilege_data.keys() \
                    or privilege_data['spaces'] is None \
                    or len(privilege_data['spaces']) == 0:
                if cursor_user:
                    cursor_user.close()
                if cnx_user:
                    cnx_user.disconnect()

                raise falcon.HTTPError(falcon.HTTP_404, 'API.NOT_FOUND', 'API.USER_PRIVILEGE_NOT_FOUND')
            # todo: how to deal with multiple spaces in privilege data
            space_id = privilege_data['spaces'][0]

        if cursor_user:
            cursor_user.close()
        if cnx_user:
            cnx_user.disconnect()

        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cursor_system.execute(" SELECT id, name, area, cost_center_id "
                              " FROM tbl_spaces "
                              " WHERE id = %s ", (space_id,))
        row_space = cursor_system.fetchone()
        if row_space is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.disconnect()

            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND', description='API.SPACE_NOT_FOUND')

        space = dict()
        space['id'] = row_space[0]
        space['name'] = row_space[1]
        space['area'] = row_space[2]
        space['cost_center_id'] = row_space[3]

        ################################################################################################################
        # Step 3: query energy categories
        ################################################################################################################
        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_billing = mysql.connector.connect(**config.myems_billing_db)
        cursor_billing = cnx_billing.cursor()

        energy_category_set = set()
        # query energy categories in base period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_space_input_category_hourly "
                              " WHERE space_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (space['id'], base_start_datetime_utc, base_end_datetime_utc))
        rows_energy_categories = cursor_energy.fetchall()
        if rows_energy_categories is not None or len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set.add(row_energy_category[0])

        # query energy categories in reporting period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_space_input_category_hourly "
                              " WHERE space_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (space['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_energy_categories = cursor_energy.fetchall()
        if rows_energy_categories is not None or len(rows_energy_categories) > 0:
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
                cnx_system.disconnect()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.disconnect()

            if cursor_billing:
                cursor_billing.close()
            if cnx_billing:
                cnx_billing.disconnect()

            raise falcon.HTTPError(falcon.HTTP_404,
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
        # Step 4: query associated sensors
        ################################################################################################################
        point_list = list()
        cursor_system.execute(" SELECT po.id, po.name, po.units, po.object_type  "
                              " FROM tbl_spaces sp, tbl_sensors se, tbl_spaces_sensors spse, "
                              "      tbl_points po, tbl_sensors_points sepo "
                              " WHERE sp.id = %s AND sp.id = spse.space_id AND spse.sensor_id = se.id "
                              "       AND se.id = sepo.sensor_id AND sepo.point_id = po.id "
                              " ORDER BY po.id ", (space['id'], ))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_list.append({"id": row[0], "name": row[1], "units": row[2], "object_type": row[3]})

        ################################################################################################################
        # Step 5: query associated points
        ################################################################################################################
        cursor_system.execute(" SELECT po.id, po.name, po.units, po.object_type  "
                              " FROM tbl_spaces sp, tbl_spaces_points sppo, tbl_points po "
                              " WHERE sp.id = %s AND sp.id = sppo.space_id AND sppo.point_id = po.id "
                              " ORDER BY po.id ", (space['id'], ))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_list.append({"id": row[0], "name": row[1], "units": row[2], "object_type": row[3]})

        ################################################################################################################
        # Step 6: query child spaces
        ################################################################################################################
        child_space_list = list()
        cursor_system.execute(" SELECT id, name  "
                              " FROM tbl_spaces "
                              " WHERE parent_space_id = %s "
                              " ORDER BY id ", (space['id'], ))
        rows_child_spaces = cursor_system.fetchall()
        if rows_child_spaces is not None and len(rows_child_spaces) > 0:
            for row in rows_child_spaces:
                child_space_list.append({"id": row[0], "name": row[1]})

        ################################################################################################################
        # Step 7: query base period energy input
        ################################################################################################################
        base_input = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                kgce = energy_category_dict[energy_category_id]['kgce']
                kgco2e = energy_category_dict[energy_category_id]['kgco2e']

                base_input[energy_category_id] = dict()
                base_input[energy_category_id]['timestamps'] = list()
                base_input[energy_category_id]['values'] = list()
                base_input[energy_category_id]['subtotal'] = Decimal(0.0)
                base_input[energy_category_id]['subtotal_in_kgce'] = Decimal(0.0)
                base_input[energy_category_id]['subtotal_in_kgco2e'] = Decimal(0.0)

                cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                      " FROM tbl_space_input_category_hourly "
                                      " WHERE space_id = %s "
                                      "     AND energy_category_id = %s "
                                      "     AND start_datetime_utc >= %s "
                                      "     AND start_datetime_utc < %s "
                                      " ORDER BY start_datetime_utc ",
                                      (space['id'],
                                       energy_category_id,
                                       base_start_datetime_utc,
                                       base_end_datetime_utc))
                rows_space_hourly = cursor_energy.fetchall()

                rows_space_periodically = utilities.aggregate_hourly_data_by_period(rows_space_hourly,
                                                                                    base_start_datetime_utc,
                                                                                    base_end_datetime_utc,
                                                                                    period_type)
                for row_space_periodically in rows_space_periodically:
                    current_datetime_local = row_space_periodically[0].replace(tzinfo=timezone.utc) + \
                                             timedelta(minutes=timezone_offset)
                    if period_type == 'hourly':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                    elif period_type == 'daily':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    actual_value = Decimal(0.0) if row_space_periodically[1] is None else row_space_periodically[1]
                    base_input[energy_category_id]['timestamps'].append(current_datetime)
                    base_input[energy_category_id]['values'].append(actual_value)
                    base_input[energy_category_id]['subtotal'] += actual_value
                    base_input[energy_category_id]['subtotal_in_kgce'] += actual_value * kgce
                    base_input[energy_category_id]['subtotal_in_kgco2e'] += actual_value * kgco2e

        ################################################################################################################
        # Step 8: query base period energy cost
        ################################################################################################################
        base_cost = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                base_cost[energy_category_id] = dict()
                base_cost[energy_category_id]['timestamps'] = list()
                base_cost[energy_category_id]['values'] = list()
                base_cost[energy_category_id]['subtotal'] = Decimal(0.0)

                cursor_billing.execute(" SELECT start_datetime_utc, actual_value "
                                       " FROM tbl_space_input_category_hourly "
                                       " WHERE space_id = %s "
                                       "     AND energy_category_id = %s "
                                       "     AND start_datetime_utc >= %s "
                                       "     AND start_datetime_utc < %s "
                                       " ORDER BY start_datetime_utc ",
                                       (space['id'],
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
                        current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                    elif period_type == 'daily':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    actual_value = Decimal(0.0) if row_space_periodically[1] is None else row_space_periodically[1]
                    base_cost[energy_category_id]['timestamps'].append(current_datetime)
                    base_cost[energy_category_id]['values'].append(actual_value)
                    base_cost[energy_category_id]['subtotal'] += actual_value

        ################################################################################################################
        # Step 9: query reporting period energy input
        ################################################################################################################
        reporting_input = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                kgce = energy_category_dict[energy_category_id]['kgce']
                kgco2e = energy_category_dict[energy_category_id]['kgco2e']

                reporting_input[energy_category_id] = dict()
                reporting_input[energy_category_id]['timestamps'] = list()
                reporting_input[energy_category_id]['values'] = list()
                reporting_input[energy_category_id]['subtotal'] = Decimal(0.0)
                reporting_input[energy_category_id]['subtotal_in_kgce'] = Decimal(0.0)
                reporting_input[energy_category_id]['subtotal_in_kgco2e'] = Decimal(0.0)
                reporting_input[energy_category_id]['toppeak'] = Decimal(0.0)
                reporting_input[energy_category_id]['onpeak'] = Decimal(0.0)
                reporting_input[energy_category_id]['midpeak'] = Decimal(0.0)
                reporting_input[energy_category_id]['offpeak'] = Decimal(0.0)

                cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                      " FROM tbl_space_input_category_hourly "
                                      " WHERE space_id = %s "
                                      "     AND energy_category_id = %s "
                                      "     AND start_datetime_utc >= %s "
                                      "     AND start_datetime_utc < %s "
                                      " ORDER BY start_datetime_utc ",
                                      (space['id'],
                                       energy_category_id,
                                       reporting_start_datetime_utc,
                                       reporting_end_datetime_utc))
                rows_space_hourly = cursor_energy.fetchall()

                rows_space_periodically = utilities.aggregate_hourly_data_by_period(rows_space_hourly,
                                                                                    reporting_start_datetime_utc,
                                                                                    reporting_end_datetime_utc,
                                                                                    period_type)
                for row_space_periodically in rows_space_periodically:
                    current_datetime_local = row_space_periodically[0].replace(tzinfo=timezone.utc) + \
                                             timedelta(minutes=timezone_offset)
                    if period_type == 'hourly':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                    elif period_type == 'daily':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    actual_value = Decimal(0.0) if row_space_periodically[1] is None else row_space_periodically[1]
                    reporting_input[energy_category_id]['timestamps'].append(current_datetime)
                    reporting_input[energy_category_id]['values'].append(actual_value)
                    reporting_input[energy_category_id]['subtotal'] += actual_value
                    reporting_input[energy_category_id]['subtotal_in_kgce'] += actual_value * kgce
                    reporting_input[energy_category_id]['subtotal_in_kgco2e'] += actual_value * kgco2e

                energy_category_tariff_dict = utilities.get_energy_category_peak_types(space['cost_center_id'],
                                                                                       energy_category_id,
                                                                                       reporting_start_datetime_utc,
                                                                                       reporting_end_datetime_utc)
                for row in rows_space_hourly:
                    peak_type = energy_category_tariff_dict.get(row[0], None)
                    if peak_type == 'toppeak':
                        reporting_input[energy_category_id]['toppeak'] += row[1]
                    elif peak_type == 'onpeak':
                        reporting_input[energy_category_id]['onpeak'] += row[1]
                    elif peak_type == 'midpeak':
                        reporting_input[energy_category_id]['midpeak'] += row[1]
                    elif peak_type == 'offpeak':
                        reporting_input[energy_category_id]['offpeak'] += row[1]

        ################################################################################################################
        # Step 10: query reporting period energy cost
        ################################################################################################################
        reporting_cost = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:

                reporting_cost[energy_category_id] = dict()
                reporting_cost[energy_category_id]['timestamps'] = list()
                reporting_cost[energy_category_id]['values'] = list()
                reporting_cost[energy_category_id]['subtotal'] = Decimal(0.0)
                reporting_cost[energy_category_id]['toppeak'] = Decimal(0.0)
                reporting_cost[energy_category_id]['onpeak'] = Decimal(0.0)
                reporting_cost[energy_category_id]['midpeak'] = Decimal(0.0)
                reporting_cost[energy_category_id]['offpeak'] = Decimal(0.0)

                cursor_billing.execute(" SELECT start_datetime_utc, actual_value "
                                       " FROM tbl_space_input_category_hourly "
                                       " WHERE space_id = %s "
                                       "     AND energy_category_id = %s "
                                       "     AND start_datetime_utc >= %s "
                                       "     AND start_datetime_utc < %s "
                                       " ORDER BY start_datetime_utc ",
                                       (space['id'],
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
                        current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                    elif period_type == 'daily':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    actual_value = Decimal(0.0) if row_space_periodically[1] is None else row_space_periodically[1]
                    reporting_cost[energy_category_id]['timestamps'].append(current_datetime)
                    reporting_cost[energy_category_id]['values'].append(actual_value)
                    reporting_cost[energy_category_id]['subtotal'] += actual_value

                energy_category_tariff_dict = utilities.get_energy_category_peak_types(space['cost_center_id'],
                                                                                       energy_category_id,
                                                                                       reporting_start_datetime_utc,
                                                                                       reporting_end_datetime_utc)
                for row in rows_space_hourly:
                    peak_type = energy_category_tariff_dict.get(row[0], None)
                    if peak_type == 'toppeak':
                        reporting_cost[energy_category_id]['toppeak'] += row[1]
                    elif peak_type == 'onpeak':
                        reporting_cost[energy_category_id]['onpeak'] += row[1]
                    elif peak_type == 'midpeak':
                        reporting_cost[energy_category_id]['midpeak'] += row[1]
                    elif peak_type == 'offpeak':
                        reporting_cost[energy_category_id]['offpeak'] += row[1]
        ################################################################################################################
        # Step 11: query tariff data
        ################################################################################################################
        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                energy_category_tariff_dict = utilities.get_energy_category_tariffs(space['cost_center_id'],
                                                                                    energy_category_id,
                                                                                    reporting_start_datetime_utc,
                                                                                    reporting_end_datetime_utc)
                tariff_timestamp_list = list()
                tariff_value_list = list()
                for k, v in energy_category_tariff_dict.items():
                    # convert k from utc to local
                    k = k + timedelta(minutes=timezone_offset)
                    tariff_timestamp_list.append(k.isoformat()[0:19][0:19])
                    tariff_value_list.append(v)

                parameters_data['names'].append('TARIFF-' + energy_category_dict[energy_category_id]['name'])
                parameters_data['timestamps'].append(tariff_timestamp_list)
                parameters_data['values'].append(tariff_value_list)

        ################################################################################################################
        # Step 12: query associated sensors and points data
        ################################################################################################################

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        for point in point_list:
            point_values = []
            point_timestamps = []
            if point['object_type'] == 'ANALOG_VALUE':
                query = (" SELECT utc_date_time, actual_value "
                         " FROM tbl_analog_value "
                         " WHERE point_id = %s "
                         "       AND utc_date_time BETWEEN %s AND %s "
                         " ORDER BY utc_date_time ")
                cursor_historical.execute(query, (point['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                rows = cursor_historical.fetchall()

                if rows is not None and len(rows) > 0:
                    for row in rows:
                        current_datetime_local = row[0].replace(tzinfo=timezone.utc) + \
                                                 timedelta(minutes=timezone_offset)
                        current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                        point_timestamps.append(current_datetime)
                        point_values.append(row[1])

            elif point['object_type'] == 'ENERGY_VALUE':
                query = (" SELECT utc_date_time, actual_value "
                         " FROM tbl_energy_value "
                         " WHERE point_id = %s "
                         "       AND utc_date_time BETWEEN %s AND %s "
                         " ORDER BY utc_date_time ")
                cursor_historical.execute(query, (point['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                rows = cursor_historical.fetchall()

                if rows is not None and len(rows) > 0:
                    for row in rows:
                        current_datetime_local = row[0].replace(tzinfo=timezone.utc) + \
                                                 timedelta(minutes=timezone_offset)
                        current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                        point_timestamps.append(current_datetime)
                        point_values.append(row[1])
            elif point['object_type'] == 'DIGITAL_VALUE':
                query = (" SELECT utc_date_time, actual_value "
                         " FROM tbl_digital_value "
                         " WHERE point_id = %s "
                         "       AND utc_date_time BETWEEN %s AND %s ")
                cursor_historical.execute(query, (point['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                rows = cursor_historical.fetchall()

                if rows is not None and len(rows) > 0:
                    for row in rows:
                        current_datetime_local = row[0].replace(tzinfo=timezone.utc) + \
                                                 timedelta(minutes=timezone_offset)
                        current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                        point_timestamps.append(current_datetime)
                        point_values.append(row[1])

            parameters_data['names'].append(point['name'] + ' (' + point['units'] + ')')
            parameters_data['timestamps'].append(point_timestamps)
            parameters_data['values'].append(point_values)

        ################################################################################################################
        # Step 13: query child spaces energy input
        ################################################################################################################
        child_space_input = dict()

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                child_space_input[energy_category_id] = dict()
                child_space_input[energy_category_id]['child_space_names'] = list()
                child_space_input[energy_category_id]['subtotals'] = list()
                child_space_input[energy_category_id]['subtotals_in_kgce'] = list()
                child_space_input[energy_category_id]['subtotals_in_kgco2e'] = list()
                kgce = energy_category_dict[energy_category_id]['kgce']
                kgco2e = energy_category_dict[energy_category_id]['kgco2e']
                for child_space in child_space_list:
                    child_space_input[energy_category_id]['child_space_names'].append(child_space['name'])

                    cursor_energy.execute(" SELECT SUM(actual_value) "
                                          " FROM tbl_space_input_category_hourly "
                                          " WHERE space_id = %s "
                                          "     AND energy_category_id = %s "
                                          "     AND start_datetime_utc >= %s "
                                          "     AND start_datetime_utc < %s "
                                          " ORDER BY start_datetime_utc ",
                                          (child_space['id'],
                                           energy_category_id,
                                           reporting_start_datetime_utc,
                                           reporting_end_datetime_utc))
                    row_subtotal = cursor_energy.fetchone()

                    subtotal = Decimal(0.0) if (row_subtotal is None or row_subtotal[0] is None) else row_subtotal[0]
                    child_space_input[energy_category_id]['subtotals'].append(subtotal)
                    child_space_input[energy_category_id]['subtotals_in_kgce'].append(subtotal * kgce)
                    child_space_input[energy_category_id]['subtotals_in_kgco2e'].append(subtotal * kgco2e)

        ################################################################################################################
        # Step 14: query child spaces energy cost
        ################################################################################################################
        child_space_cost = dict()

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                child_space_cost[energy_category_id] = dict()
                child_space_cost[energy_category_id]['child_space_names'] = list()
                child_space_cost[energy_category_id]['subtotals'] = list()
                for child_space in child_space_list:
                    child_space_cost[energy_category_id]['child_space_names'].append(child_space['name'])

                    cursor_billing.execute(" SELECT SUM(actual_value) "
                                           " FROM tbl_space_input_category_hourly "
                                           " WHERE space_id = %s "
                                           "     AND energy_category_id = %s "
                                           "     AND start_datetime_utc >= %s "
                                           "     AND start_datetime_utc < %s "
                                           " ORDER BY start_datetime_utc ",
                                           (child_space['id'],
                                            energy_category_id,
                                            reporting_start_datetime_utc,
                                            reporting_end_datetime_utc))
                    row_subtotal = cursor_billing.fetchone()

                    subtotal = Decimal(0.0) if (row_subtotal is None or row_subtotal[0] is None) else row_subtotal[0]
                    child_space_cost[energy_category_id]['subtotals'].append(subtotal)

        ################################################################################################################
        # Step 15: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.disconnect()

        if cursor_energy:
            cursor_energy.close()
        if cnx_energy:
            cnx_energy.disconnect()

        if cursor_billing:
            cursor_billing.close()
        if cnx_billing:
            cnx_billing.disconnect()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.disconnect()

        result = dict()

        result['space'] = dict()
        result['space']['name'] = space['name']
        result['space']['area'] = space['area']

        result['base_period_input'] = dict()
        result['base_period_input']['names'] = list()
        result['base_period_input']['units'] = list()
        result['base_period_input']['timestamps'] = list()
        result['base_period_input']['values'] = list()
        result['base_period_input']['subtotals'] = list()
        result['base_period_input']['subtotals_in_kgce'] = list()
        result['base_period_input']['subtotals_in_kgco2e'] = list()
        result['base_period_input']['total_in_kgce'] = Decimal(0.0)
        result['base_period_input']['total_in_kgco2e'] = Decimal(0.0)
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['base_period_input']['names'].append(
                    energy_category_dict[energy_category_id]['name'])
                result['base_period_input']['units'].append(
                    energy_category_dict[energy_category_id]['unit_of_measure'])
                result['base_period_input']['timestamps'].append(
                    base_input[energy_category_id]['timestamps'])
                result['base_period_input']['values'].append(
                    base_input[energy_category_id]['values'])
                result['base_period_input']['subtotals'].append(
                    base_input[energy_category_id]['subtotal'])
                result['base_period_input']['subtotals_in_kgce'].append(
                    base_input[energy_category_id]['subtotal_in_kgce'])
                result['base_period_input']['subtotals_in_kgco2e'].append(
                    base_input[energy_category_id]['subtotal_in_kgco2e'])
                result['base_period_input']['total_in_kgce'] += \
                    base_input[energy_category_id]['subtotal_in_kgce']
                result['base_period_input']['total_in_kgco2e'] += \
                    base_input[energy_category_id]['subtotal_in_kgco2e']

        result['base_period_cost'] = dict()
        result['base_period_cost']['names'] = list()
        result['base_period_cost']['units'] = list()
        result['base_period_cost']['timestamps'] = list()
        result['base_period_cost']['values'] = list()
        result['base_period_cost']['subtotals'] = list()
        result['base_period_cost']['total'] = Decimal(0.0)
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['base_period_cost']['names'].append(
                    energy_category_dict[energy_category_id]['name'])
                result['base_period_cost']['units'].append(
                    energy_category_dict[energy_category_id]['unit_of_measure'])
                result['base_period_cost']['timestamps'].append(
                    base_cost[energy_category_id]['timestamps'])
                result['base_period_cost']['values'].append(
                    base_cost[energy_category_id]['values'])
                result['base_period_cost']['subtotals'].append(
                    base_cost[energy_category_id]['subtotal'])
                result['base_period_cost']['total'] += base_cost[energy_category_id]['subtotal']

        result['reporting_period_input'] = dict()
        result['reporting_period_input']['names'] = list()
        result['reporting_period_input']['energy_category_ids'] = list()
        result['reporting_period_input']['units'] = list()
        result['reporting_period_input']['timestamps'] = list()
        result['reporting_period_input']['values'] = list()
        result['reporting_period_input']['subtotals'] = list()
        result['reporting_period_input']['subtotals_in_kgce'] = list()
        result['reporting_period_input']['subtotals_in_kgco2e'] = list()
        result['reporting_period_input']['subtotals_per_unit_area'] = list()
        result['reporting_period_input']['toppeaks'] = list()
        result['reporting_period_input']['onpeaks'] = list()
        result['reporting_period_input']['midpeaks'] = list()
        result['reporting_period_input']['offpeaks'] = list()
        result['reporting_period_input']['increment_rates'] = list()
        result['reporting_period_input']['total_in_kgce'] = Decimal(0.0)
        result['reporting_period_input']['total_in_kgco2e'] = Decimal(0.0)
        result['reporting_period_input']['increment_rate_in_kgce'] = Decimal(0.0)
        result['reporting_period_input']['increment_rate_in_kgco2e'] = Decimal(0.0)

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['reporting_period_input']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['reporting_period_input']['energy_category_ids'].append(energy_category_id)
                result['reporting_period_input']['units'].append(
                    energy_category_dict[energy_category_id]['unit_of_measure'])
                result['reporting_period_input']['timestamps'].append(
                    reporting_input[energy_category_id]['timestamps'])
                result['reporting_period_input']['values'].append(
                    reporting_input[energy_category_id]['values'])
                result['reporting_period_input']['subtotals'].append(
                    reporting_input[energy_category_id]['subtotal'])
                result['reporting_period_input']['subtotals_in_kgce'].append(
                    reporting_input[energy_category_id]['subtotal_in_kgce'])
                result['reporting_period_input']['subtotals_in_kgco2e'].append(
                    reporting_input[energy_category_id]['subtotal_in_kgco2e'])
                result['reporting_period_input']['subtotals_per_unit_area'].append(
                    reporting_input[energy_category_id]['subtotal'] / space['area']
                    if space['area'] > 0.0 else None)
                result['reporting_period_input']['toppeaks'].append(
                    reporting_input[energy_category_id]['toppeak'])
                result['reporting_period_input']['onpeaks'].append(
                    reporting_input[energy_category_id]['onpeak'])
                result['reporting_period_input']['midpeaks'].append(
                    reporting_input[energy_category_id]['midpeak'])
                result['reporting_period_input']['offpeaks'].append(
                    reporting_input[energy_category_id]['offpeak'])
                result['reporting_period_input']['increment_rates'].append(
                    (reporting_input[energy_category_id]['subtotal'] -
                     base_input[energy_category_id]['subtotal']) /
                    base_input[energy_category_id]['subtotal']
                    if base_input[energy_category_id]['subtotal'] > 0.0 else None)
                result['reporting_period_input']['total_in_kgce'] += \
                    reporting_input[energy_category_id]['subtotal_in_kgce']
                result['reporting_period_input']['total_in_kgco2e'] += \
                    reporting_input[energy_category_id]['subtotal_in_kgco2e']

        result['reporting_period_input']['total_in_kgco2e_per_unit_area'] = \
            result['reporting_period_input']['total_in_kgce'] / space['area'] if space['area'] > 0.0 else None

        result['reporting_period_input']['increment_rate_in_kgce'] = \
            (result['reporting_period_input']['total_in_kgce'] - result['base_period_input']['total_in_kgce']) / \
            result['base_period_input']['total_in_kgce'] \
            if result['base_period_input']['total_in_kgce'] > Decimal(0.0) else None

        result['reporting_period_input']['total_in_kgce_per_unit_area'] = \
            result['reporting_period_input']['total_in_kgco2e'] / space['area'] if space['area'] > 0.0 else None

        result['reporting_period_input']['increment_rate_in_kgco2e'] = \
            (result['reporting_period_input']['total_in_kgco2e'] - result['base_period_input']['total_in_kgco2e']) / \
            result['base_period_input']['total_in_kgco2e'] \
            if result['base_period_input']['total_in_kgco2e'] > Decimal(0.0) else None

        result['reporting_period_cost'] = dict()
        result['reporting_period_cost']['names'] = list()
        result['reporting_period_cost']['energy_category_ids'] = list()
        result['reporting_period_cost']['units'] = list()
        result['reporting_period_cost']['timestamps'] = list()
        result['reporting_period_cost']['values'] = list()
        result['reporting_period_cost']['subtotals'] = list()
        result['reporting_period_cost']['subtotals_per_unit_area'] = list()
        result['reporting_period_cost']['toppeaks'] = list()
        result['reporting_period_cost']['onpeaks'] = list()
        result['reporting_period_cost']['midpeaks'] = list()
        result['reporting_period_cost']['offpeaks'] = list()
        result['reporting_period_cost']['increment_rates'] = list()
        result['reporting_period_cost']['total'] = Decimal(0.0)
        result['reporting_period_cost']['total_per_unit_area'] = Decimal(0.0)
        result['reporting_period_cost']['total_increment_rate'] = Decimal(0.0)
        result['reporting_period_cost']['total_unit'] = config.currency_unit

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['reporting_period_cost']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['reporting_period_cost']['energy_category_ids'].append(energy_category_id)
                result['reporting_period_cost']['units'].append(config.currency_unit)
                result['reporting_period_cost']['timestamps'].append(
                    reporting_cost[energy_category_id]['timestamps'])
                result['reporting_period_cost']['values'].append(
                    reporting_cost[energy_category_id]['values'])
                result['reporting_period_cost']['subtotals'].append(
                    reporting_cost[energy_category_id]['subtotal'])
                result['reporting_period_cost']['subtotals_per_unit_area'].append(
                    reporting_cost[energy_category_id]['subtotal'] / space['area']
                    if space['area'] > 0.0 else None)
                result['reporting_period_cost']['toppeaks'].append(
                    reporting_cost[energy_category_id]['toppeak'])
                result['reporting_period_cost']['onpeaks'].append(
                    reporting_cost[energy_category_id]['onpeak'])
                result['reporting_period_cost']['midpeaks'].append(
                    reporting_cost[energy_category_id]['midpeak'])
                result['reporting_period_cost']['offpeaks'].append(
                    reporting_cost[energy_category_id]['offpeak'])
                result['reporting_period_cost']['increment_rates'].append(
                    (reporting_cost[energy_category_id]['subtotal'] -
                     base_cost[energy_category_id]['subtotal']) /
                    base_cost[energy_category_id]['subtotal']
                    if base_cost[energy_category_id]['subtotal'] > 0.0 else None)
                result['reporting_period_cost']['total'] += reporting_cost[energy_category_id]['subtotal']
        result['reporting_period_cost']['total_per_unit_area'] = \
            result['reporting_period_cost']['total'] / space['area'] if space['area'] > 0.0 else None

        result['reporting_period_cost']['total_increment_rate'] = \
            (result['reporting_period_cost']['total'] - result['base_period_cost']['total']) / \
            result['reporting_period_cost']['total'] \
            if result['reporting_period_cost']['total'] > Decimal(0.0) else None

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }

        result['child_space_input'] = dict()
        result['child_space_input']['energy_category_names'] = list()  # 1D array [energy category]
        result['child_space_input']['units'] = list()  # 1D array [energy category]
        result['child_space_input']['child_space_names_array'] = list()  # 2D array [energy category][child space]
        result['child_space_input']['subtotals_array'] = list()  # 2D array [energy category][child space]
        result['child_space_input']['subtotals_in_kgce_array'] = list()  # 2D array [energy category][child space]
        result['child_space_input']['subtotals_in_kgco2e_array'] = list()  # 2D array [energy category][child space]
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['child_space_input']['energy_category_names'].append(
                    energy_category_dict[energy_category_id]['name'])
                result['child_space_input']['units'].append(
                    energy_category_dict[energy_category_id]['unit_of_measure'])
                result['child_space_input']['child_space_names_array'].append(
                    child_space_input[energy_category_id]['child_space_names'])
                result['child_space_input']['subtotals_array'].append(
                    child_space_input[energy_category_id]['subtotals'])
                result['child_space_input']['subtotals_in_kgce_array'].append(
                    child_space_input[energy_category_id]['subtotals_in_kgce'])
                result['child_space_input']['subtotals_in_kgco2e_array'].append(
                    child_space_input[energy_category_id]['subtotals_in_kgco2e'])

        result['child_space_cost'] = dict()
        result['child_space_cost']['energy_category_names'] = list()  # 1D array [energy category]
        result['child_space_cost']['units'] = list()  # 1D array [energy category]
        result['child_space_cost']['child_space_names_array'] = list()  # 2D array [energy category][child space]
        result['child_space_cost']['subtotals_array'] = list()  # 2D array [energy category][child space]
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['child_space_cost']['energy_category_names'].append(
                    energy_category_dict[energy_category_id]['name'])
                result['child_space_cost']['units'].append(config.currency_unit)
                result['child_space_cost']['child_space_names_array'].append(
                    child_space_cost[energy_category_id]['child_space_names'])
                result['child_space_cost']['subtotals_array'].append(
                    child_space_cost[energy_category_id]['subtotals'])

        resp.body = json.dumps(result)
