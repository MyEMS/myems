"""
Space Output Report API

This module provides REST API endpoints for generating space output reports.
It analyzes space output performance and production metrics to provide
insights into output optimization and production efficiency opportunities.

Key Features:
- Space output analysis
- Base period vs reporting period comparison
- Output performance metrics
- Production efficiency analysis
- Excel export functionality
- Output optimization insights

Report Components:
- Space output summary
- Base period comparison data
- Output performance metrics
- Production efficiency indicators
- Output optimization recommendations
- Production trends and patterns

The module uses Falcon framework for REST API and includes:
- Database queries for output data
- Output calculation algorithms
- Production analysis tools
- Excel export via excelexporters
- Multi-language support
- User authentication and authorization
"""

import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.spaceoutput
from core import utilities
from core.useractivity import access_control, api_key_control


class Reporting:
    def __init__(self):
        """"Initializes Reporting"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the space
    # Step 3: query energy categories
    # Step 4: query associated sensors
    # Step 5: query associated points
    # Step 6: query child spaces
    # Step 7: query base period energy output
    # Step 8: query reporting period energy output
    # Step 9: query tariff data
    # Step 10: query associated sensors and points data
    # Step 11: query child spaces energy output
    # Step 12: construct the report
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
        space_uuid = req.params.get('spaceuuid')
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
        if space_id is None and space_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        if space_id is not None:
            space_id = str.strip(space_id)
            if not space_id.isdigit() or int(space_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_SPACE_ID')

        if space_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(space_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_SPACE_UUID')

        if period_type is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PERIOD_TYPE')
        else:
            period_type = str.strip(period_type)
            if period_type not in ['hourly', 'daily', 'weekly', 'monthly', 'yearly']:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PERIOD_TYPE')

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
                                       description="API.INVALID_BASE_PERIOD_START_DATETIME")
            base_start_datetime_utc = \
                base_start_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
            # nomalize the start datetime
            if config.minutes_to_count == 30 and base_start_datetime_utc.minute >= 30:
                base_start_datetime_utc = base_start_datetime_utc.replace(minute=30, second=0, microsecond=0)
            else:
                base_start_datetime_utc = base_start_datetime_utc.replace(minute=0, second=0, microsecond=0)

        base_end_datetime_utc = None
        if base_period_end_datetime_local is not None and len(str.strip(base_period_end_datetime_local)) > 0:
            base_period_end_datetime_local = str.strip(base_period_end_datetime_local)
            try:
                base_end_datetime_utc = datetime.strptime(base_period_end_datetime_local, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_BASE_PERIOD_END_DATETIME")
            base_end_datetime_utc = \
                base_end_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)

        if base_start_datetime_utc is not None and base_end_datetime_utc is not None and \
                base_start_datetime_utc >= base_end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BASE_PERIOD_END_DATETIME')

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

        # if turn quick mode on, do not return parameters data and excel file
        is_quick_mode = False
        if quick_mode is not None and \
                len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

        trans = utilities.get_translation(language)
        trans.install()
        _ = trans.gettext

        ################################################################################################################
        # Step 2: query the space
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if space_id is not None:
            cursor_system.execute(" SELECT id, name, area, number_of_occupants, cost_center_id "
                                  " FROM tbl_spaces "
                                  " WHERE id = %s ", (space_id,))
            row_space = cursor_system.fetchone()
        elif space_uuid is not None:
            cursor_system.execute(" SELECT id, name, area, number_of_occupants, cost_center_id "
                                  " FROM tbl_spaces "
                                  " WHERE uuid = %s ", (space_uuid,))
            row_space = cursor_system.fetchone()

        if row_space is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.close()

            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.SPACE_NOT_FOUND')

        space = dict()
        space['id'] = row_space[0]
        space['name'] = row_space[1]
        space['area'] = row_space[2]
        space['number_of_occupants'] = row_space[3]
        space['cost_center_id'] = row_space[4]

        ################################################################################################################
        # Step 3: query energy categories
        ################################################################################################################
        energy_category_set = set()
        # query energy categories in base period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_space_output_category_hourly "
                              " WHERE space_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (space['id'], base_start_datetime_utc, base_end_datetime_utc))
        rows_energy_categories = cursor_energy.fetchall()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set.add(row_energy_category[0])

        # query energy categories in reporting period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_space_output_category_hourly "
                              " WHERE space_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (space['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_energy_categories = cursor_energy.fetchall()
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

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.close()

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
        # Step 4: query associated sensors
        ################################################################################################################
        point_list = list()
        cursor_system.execute(" SELECT po.id, po.name, po.units, po.object_type  "
                              " FROM tbl_spaces sp, tbl_sensors se, tbl_spaces_sensors spse, "
                              "      tbl_points po, tbl_sensors_points sepo "
                              " WHERE sp.id = %s AND sp.id = spse.space_id AND spse.sensor_id = se.id "
                              "       AND se.id = sepo.sensor_id AND sepo.point_id = po.id "
                              " ORDER BY po.id ", (space['id'],))
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
                              " ORDER BY po.id ", (space['id'],))
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
                              " ORDER BY id ", (space['id'],))
        rows_child_spaces = cursor_system.fetchall()
        if rows_child_spaces is not None and len(rows_child_spaces) > 0:
            for row in rows_child_spaces:
                child_space_list.append({"id": row[0], "name": row[1]})

        ################################################################################################################
        # Step 7: query base period energy output
        ################################################################################################################
        base = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                base[energy_category_id] = dict()
                base[energy_category_id]['timestamps'] = list()
                base[energy_category_id]['values'] = list()
                base[energy_category_id]['subtotal'] = Decimal(0.0)

                cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                      " FROM tbl_space_output_category_hourly "
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

        ################################################################################################################
        # Step 8: query reporting period energy output
        ################################################################################################################
        reporting = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                reporting[energy_category_id] = dict()
                reporting[energy_category_id]['timestamps'] = list()
                reporting[energy_category_id]['values'] = list()
                reporting[energy_category_id]['subtotal'] = Decimal(0.0)

                cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                      " FROM tbl_space_output_category_hourly "
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

        ################################################################################################################
        # Step 9: query tariff data
        ################################################################################################################
        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()
        if config.is_tariff_appended and energy_category_set is not None and len(energy_category_set) > 0 \
                and not is_quick_mode:
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
                    tariff_timestamp_list.append(k.isoformat()[0:19])
                    tariff_value_list.append(v)

                parameters_data['names'].append(_('Tariff') + '-' + energy_category_dict[energy_category_id]['name'])
                parameters_data['timestamps'].append(tariff_timestamp_list)
                parameters_data['values'].append(tariff_value_list)

        ################################################################################################################
        # Step 10: query associated sensors and points data
        ################################################################################################################
        if not is_quick_mode:
            for point in point_list:
                point_values = []
                point_timestamps = []
                if point['object_type'] == 'ENERGY_VALUE':
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
                            current_datetime = current_datetime_local.isoformat()[0:19]
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])
                elif point['object_type'] == 'ANALOG_VALUE':
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
                            current_datetime = current_datetime_local.isoformat()[0:19]
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])
                elif point['object_type'] == 'DIGITAL_VALUE':
                    query = (" SELECT utc_date_time, actual_value "
                             " FROM tbl_digital_value "
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
                            current_datetime = current_datetime_local.isoformat()[0:19]
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])

                parameters_data['names'].append(point['name'] + ' (' + point['units'] + ')')
                parameters_data['timestamps'].append(point_timestamps)
                parameters_data['values'].append(point_values)

        ################################################################################################################
        # Step 11: query child spaces energy output
        ################################################################################################################
        child_space_data = dict()

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                child_space_data[energy_category_id] = dict()
                child_space_data[energy_category_id]['child_space_names'] = list()
                child_space_data[energy_category_id]['subtotals'] = list()
                for child_space in child_space_list:
                    child_space_data[energy_category_id]['child_space_names'].append(child_space['name'])

                    cursor_energy.execute(" SELECT SUM(actual_value) "
                                          " FROM tbl_space_output_category_hourly "
                                          " WHERE space_id = %s "
                                          "     AND energy_category_id = %s "
                                          "     AND start_datetime_utc >= %s "
                                          "     AND start_datetime_utc < %s ",
                                          (child_space['id'],
                                           energy_category_id,
                                           reporting_start_datetime_utc,
                                           reporting_end_datetime_utc))
                    row_subtotal = cursor_energy.fetchone()

                    subtotal = Decimal(0.0) if (row_subtotal is None or row_subtotal[0] is None) else row_subtotal[0]
                    child_space_data[energy_category_id]['subtotals'].append(subtotal)

        ################################################################################################################
        # Step 12: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_energy:
            cursor_energy.close()
        if cnx_energy:
            cnx_energy.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()

        result = dict()

        result['space'] = dict()
        result['space']['name'] = space['name']
        result['space']['area'] = space['area']
        result['space']['number_of_occupants'] = space['number_of_occupants']

        result['base_period'] = dict()
        result['base_period']['names'] = list()
        result['base_period']['units'] = list()
        result['base_period']['timestamps'] = list()
        result['base_period']['values'] = list()
        result['base_period']['subtotals'] = list()
        result['base_period']['subtotals_per_unit_area'] = list()
        result['base_period']['subtotals_per_capita'] = list()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['base_period']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['base_period']['units'].append(energy_category_dict[energy_category_id]['unit_of_measure'])
                result['base_period']['timestamps'].append(base[energy_category_id]['timestamps'])
                result['base_period']['values'].append(base[energy_category_id]['values'])
                result['base_period']['subtotals'].append(base[energy_category_id]['subtotal'])

        result['reporting_period'] = dict()
        result['reporting_period']['names'] = list()
        result['reporting_period']['energy_category_ids'] = list()
        result['reporting_period']['units'] = list()
        result['reporting_period']['timestamps'] = list()
        result['reporting_period']['values'] = list()
        result['reporting_period']['rates'] = list()
        result['reporting_period']['subtotals'] = list()
        result['reporting_period']['subtotals_per_unit_area'] = list()
        result['reporting_period']['subtotals_per_capita'] = list()
        result['reporting_period']['increment_rates'] = list()

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['reporting_period']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['reporting_period']['energy_category_ids'].append(energy_category_id)
                result['reporting_period']['units'].append(energy_category_dict[energy_category_id]['unit_of_measure'])
                result['reporting_period']['timestamps'].append(reporting[energy_category_id]['timestamps'])
                result['reporting_period']['values'].append(reporting[energy_category_id]['values'])
                result['reporting_period']['subtotals'].append(reporting[energy_category_id]['subtotal'])
                result['reporting_period']['subtotals_per_unit_area'].append(
                    reporting[energy_category_id]['subtotal'] / space['area'] if space['area'] > 0.0 else None)
                result['reporting_period']['subtotals_per_capita'].append(
                    reporting[energy_category_id]['subtotal'] / space['number_of_occupants']
                    if space['number_of_occupants'] > 0.0 else None)
                result['reporting_period']['increment_rates'].append(
                    (reporting[energy_category_id]['subtotal'] - base[energy_category_id]['subtotal']) /
                    base[energy_category_id]['subtotal']
                    if base[energy_category_id]['subtotal'] > 0.0 else None)

                rate = list()
                for index, value in enumerate(reporting[energy_category_id]['values']):
                    if index < len(base[energy_category_id]['values']) \
                            and base[energy_category_id]['values'][index] != 0 and value != 0:
                        rate.append((value - base[energy_category_id]['values'][index])
                                    / base[energy_category_id]['values'][index])
                    else:
                        rate.append(None)
                result['reporting_period']['rates'].append(rate)

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }

        result['child_space'] = dict()
        result['child_space']['energy_category_names'] = list()  # 1D array [energy category]
        result['child_space']['units'] = list()  # 1D array [energy category]
        result['child_space']['child_space_names_array'] = list()  # 2D array [energy category][child space]
        result['child_space']['subtotals_array'] = list()  # 2D array [energy category][child space]
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['child_space']['energy_category_names'].append(energy_category_dict[energy_category_id]['name'])
                result['child_space']['units'].append(energy_category_dict[energy_category_id]['unit_of_measure'])
                result['child_space']['child_space_names_array'].append(
                    child_space_data[energy_category_id]['child_space_names'])
                result['child_space']['subtotals_array'].append(
                    child_space_data[energy_category_id]['subtotals'])

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = excelexporters.spaceoutput.export(result,
                                                                             space['name'],
                                                                             base_period_start_datetime_local,
                                                                             base_period_end_datetime_local,
                                                                             reporting_period_start_datetime_local,
                                                                             reporting_period_end_datetime_local,
                                                                             period_type,
                                                                             language)

        resp.text = json.dumps(result)
