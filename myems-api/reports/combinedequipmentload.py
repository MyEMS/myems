import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import gettext
import falcon
import mysql.connector
import simplejson as json

import config
import excelexporters.combinedequipmentload
from core import utilities


class Reporting:
    @staticmethod
    def __init__():
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the combined equipment
    # Step 3: query energy categories
    # Step 4: query associated points
    # Step 5: query associated equipments
    # Step 6: query base period energy input
    # Step 7: query reporting period energy input
    # Step 8: query tariff data
    # Step 9: query associated points data
    # Step 10: query associated equipments energy input
    # Step 11: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        print(req.params)
        combined_equipment_id = req.params.get('combinedequipmentid')
        combined_equipment_uuid = req.params.get('combinedequipmentuuid')
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
        if combined_equipment_id is None and combined_equipment_uuid is None:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if combined_equipment_id is not None:
            combined_equipment_id = str.strip(combined_equipment_id)
            if not combined_equipment_id.isdigit() or int(combined_equipment_id) <= 0:
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_COMBINED_EQUIPMENT_ID')

        if combined_equipment_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(combined_equipment_uuid))
            if not bool(match):
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_COMBINED_EQUIPMENT_UUID')

        if period_type is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_PERIOD_TYPE')
        else:
            period_type = str.strip(period_type)
            if period_type not in ['hourly', 'daily', 'weekly', 'monthly', 'yearly']:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_PERIOD_TYPE')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        base_start_datetime_utc = None
        if base_period_start_datetime_local is not None and len(str.strip(base_period_start_datetime_local)) > 0:
            base_period_start_datetime_local = str.strip(base_period_start_datetime_local)
            try:
                base_start_datetime_utc = datetime.strptime(base_period_start_datetime_local, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
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
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_BASE_PERIOD_END_DATETIME")
            base_end_datetime_utc = \
                base_end_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)

        if base_start_datetime_utc is not None and base_end_datetime_utc is not None and \
                base_start_datetime_utc >= base_end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BASE_PERIOD_END_DATETIME')

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
            reporting_start_datetime_utc = \
                reporting_start_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
            # nomalize the start datetime
            if config.minutes_to_count == 30 and reporting_start_datetime_utc.minute >= 30:
                reporting_start_datetime_utc = reporting_start_datetime_utc.replace(minute=30, second=0, microsecond=0)
            else:
                reporting_start_datetime_utc = reporting_start_datetime_utc.replace(minute=0, second=0, microsecond=0)

        if reporting_period_end_datetime_local is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
        else:
            reporting_period_end_datetime_local = str.strip(reporting_period_end_datetime_local)
            try:
                reporting_end_datetime_utc = datetime.strptime(reporting_period_end_datetime_local,
                                                               '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                             timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPORTING_PERIOD_END_DATETIME')

        # if turn quick mode on, do not return parameters data and excel file
        is_quick_mode = False
        if quick_mode is not None and \
                len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

        locale_path = './i18n/'
        if language == 'zh_CN':
            trans = gettext.translation('myems', locale_path, languages=['zh_CN'])
        elif language == 'de':
            trans = gettext.translation('myems', locale_path, languages=['de'])
        elif language == 'en':
            trans = gettext.translation('myems', locale_path, languages=['en'])
        else:
            trans = gettext.translation('myems', locale_path, languages=['en'])
        trans.install()
        _ = trans.gettext

        ################################################################################################################
        # Step 2: query the combined equipment
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if combined_equipment_id is not None:
            cursor_system.execute(" SELECT id, name, cost_center_id "
                                  " FROM tbl_combined_equipments "
                                  " WHERE id = %s ", (combined_equipment_id,))
            row_combined_equipment = cursor_system.fetchone()
        elif combined_equipment_uuid is not None:
            cursor_system.execute(" SELECT id, name, cost_center_id "
                                  " FROM tbl_combined_equipments "
                                  " WHERE uuid = %s ", (combined_equipment_uuid,))
            row_combined_equipment = cursor_system.fetchone()

        if row_combined_equipment is None:
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
            raise falcon.HTTPError(falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.COMBINED_EQUIPMENT_NOT_FOUND')

        combined_equipment = dict()
        combined_equipment['id'] = row_combined_equipment[0]
        combined_equipment['name'] = row_combined_equipment[1]
        combined_equipment['cost_center_id'] = row_combined_equipment[2]

        ################################################################################################################
        # Step 3: query energy categories
        ################################################################################################################
        energy_category_set = set()
        # query energy categories in base period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_combined_equipment_input_category_hourly "
                              " WHERE combined_equipment_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (combined_equipment['id'], base_start_datetime_utc, base_end_datetime_utc))
        rows_energy_categories = cursor_energy.fetchall()
        if rows_energy_categories is not None or len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set.add(row_energy_category[0])

        # query energy categories in reporting period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_combined_equipment_input_category_hourly "
                              " WHERE combined_equipment_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (combined_equipment['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
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
                cnx_system.close()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.close()

            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
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
        # Step 4: query associated points
        ################################################################################################################
        point_list = list()
        cursor_system.execute(" SELECT p.id, ep.name, p.units, p.object_type  "
                              " FROM tbl_combined_equipments e, tbl_combined_equipments_parameters ep, tbl_points p "
                              " WHERE e.id = %s AND e.id = ep.combined_equipment_id AND ep.parameter_type = 'point' "
                              "       AND ep.point_id = p.id "
                              " ORDER BY p.id ", (combined_equipment['id'],))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_list.append({"id": row[0], "name": row[1], "units": row[2], "object_type": row[3]})

        ################################################################################################################
        # Step 5: query associated equipments
        ################################################################################################################
        associated_equipment_list = list()
        cursor_system.execute(" SELECT e.id, e.name "
                              " FROM tbl_equipments e,tbl_combined_equipments_equipments ee"
                              " WHERE ee.combined_equipment_id = %s AND e.id = ee.equipment_id"
                              " ORDER BY id ", (combined_equipment['id'],))
        rows_associated_equipments = cursor_system.fetchall()
        if rows_associated_equipments is not None and len(rows_associated_equipments) > 0:
            for row in rows_associated_equipments:
                associated_equipment_list.append({"id": row[0], "name": row[1]})

        ################################################################################################################
        # Step 6: query base period energy input
        ################################################################################################################
        base = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                base[energy_category_id] = dict()
                base[energy_category_id]['timestamps'] = list()
                base[energy_category_id]['sub_averages'] = list()
                base[energy_category_id]['sub_maximums'] = list()
                base[energy_category_id]['average'] = None
                base[energy_category_id]['maximum'] = None
                base[energy_category_id]['factor'] = None

                cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                      " FROM tbl_combined_equipment_input_category_hourly "
                                      " WHERE combined_equipment_id = %s "
                                      "     AND energy_category_id = %s "
                                      "     AND start_datetime_utc >= %s "
                                      "     AND start_datetime_utc < %s "
                                      " ORDER BY start_datetime_utc ",
                                      (combined_equipment['id'],
                                       energy_category_id,
                                       base_start_datetime_utc,
                                       base_end_datetime_utc))
                rows_combined_equipment_hourly = cursor_energy.fetchall()

                rows_combined_equipment_periodically, \
                    base[energy_category_id]['average'], \
                    base[energy_category_id]['maximum'] = \
                    utilities.averaging_hourly_data_by_period(rows_combined_equipment_hourly,
                                                              base_start_datetime_utc,
                                                              base_end_datetime_utc,
                                                              period_type)
                base[energy_category_id]['factor'] = \
                    (base[energy_category_id]['average'] / base[energy_category_id]['maximum']
                     if (base[energy_category_id]['average'] is not None and
                         base[energy_category_id]['maximum'] is not None and
                         base[energy_category_id]['maximum'] > Decimal(0.0))
                     else None)

                for row_combined_equipment_periodically in rows_combined_equipment_periodically:
                    current_datetime_local = row_combined_equipment_periodically[0].replace(tzinfo=timezone.utc) + \
                                             timedelta(minutes=timezone_offset)
                    if period_type == 'hourly':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                    elif period_type == 'daily':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                    elif period_type == 'weekly':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    base[energy_category_id]['timestamps'].append(current_datetime)
                    base[energy_category_id]['sub_averages'].append(row_combined_equipment_periodically[1])
                    base[energy_category_id]['sub_maximums'].append(row_combined_equipment_periodically[2])

        ################################################################################################################
        # Step 7: query reporting period energy input
        ################################################################################################################
        reporting = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                reporting[energy_category_id] = dict()
                reporting[energy_category_id]['timestamps'] = list()
                reporting[energy_category_id]['sub_averages'] = list()
                reporting[energy_category_id]['sub_maximums'] = list()
                reporting[energy_category_id]['average'] = None
                reporting[energy_category_id]['maximum'] = None
                reporting[energy_category_id]['factor'] = None

                cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                      " FROM tbl_combined_equipment_input_category_hourly "
                                      " WHERE combined_equipment_id = %s "
                                      "     AND energy_category_id = %s "
                                      "     AND start_datetime_utc >= %s "
                                      "     AND start_datetime_utc < %s "
                                      " ORDER BY start_datetime_utc ",
                                      (combined_equipment['id'],
                                       energy_category_id,
                                       reporting_start_datetime_utc,
                                       reporting_end_datetime_utc))
                rows_combined_equipment_hourly = cursor_energy.fetchall()

                rows_combined_equipment_periodically, \
                    reporting[energy_category_id]['average'], \
                    reporting[energy_category_id]['maximum'] = \
                    utilities.averaging_hourly_data_by_period(rows_combined_equipment_hourly,
                                                              reporting_start_datetime_utc,
                                                              reporting_end_datetime_utc,
                                                              period_type)
                reporting[energy_category_id]['factor'] = \
                    (reporting[energy_category_id]['average'] / reporting[energy_category_id]['maximum']
                     if (reporting[energy_category_id]['average'] is not None and
                         reporting[energy_category_id]['maximum'] is not None and
                         reporting[energy_category_id]['maximum'] > Decimal(0.0))
                     else None)

                for row_combined_equipment_periodically in rows_combined_equipment_periodically:
                    current_datetime_local = row_combined_equipment_periodically[0].replace(tzinfo=timezone.utc) + \
                                             timedelta(minutes=timezone_offset)
                    if period_type == 'hourly':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                    elif period_type == 'daily':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                    elif period_type == 'weekly':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    reporting[energy_category_id]['timestamps'].append(current_datetime)
                    reporting[energy_category_id]['sub_averages'].append(row_combined_equipment_periodically[1])
                    reporting[energy_category_id]['sub_maximums'].append(row_combined_equipment_periodically[2])

        ################################################################################################################
        # Step 8: query tariff data
        ################################################################################################################
        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()
        if not is_quick_mode:
            if config.is_tariff_appended and energy_category_set is not None and len(energy_category_set) > 0:
                for energy_category_id in energy_category_set:
                    energy_category_tariff_dict = \
                        utilities.get_energy_category_tariffs(combined_equipment['cost_center_id'],
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

                    parameters_data['names'].append(
                        _('Tariff') + '-' + energy_category_dict[energy_category_id]['name'])
                    parameters_data['timestamps'].append(tariff_timestamp_list)
                    parameters_data['values'].append(tariff_value_list)

        ################################################################################################################
        # Step 9: query associated points data
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
                            current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
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
                            current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
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
                            current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                            point_timestamps.append(current_datetime)
                            point_values.append(row[1])

                parameters_data['names'].append(point['name'] + ' (' + point['units'] + ')')
                parameters_data['timestamps'].append(point_timestamps)
                parameters_data['values'].append(point_values)

        ################################################################################################################
        # Step 10: query associated equipments energy input
        ################################################################################################################
        associated_equipment_data = dict()

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                associated_equipment_data[energy_category_id] = dict()
                associated_equipment_data[energy_category_id]['associated_equipment_names'] = list()
                associated_equipment_data[energy_category_id]['average'] = list()
                associated_equipment_data[energy_category_id]['maximum'] = list()
                associated_equipment_data[energy_category_id]['sub_averages'] = list()
                associated_equipment_data[energy_category_id]['sub_maximums'] = list()
                for associated_equipment in associated_equipment_list:
                    associated_equipment_data[energy_category_id]['associated_equipment_names'].append(
                        associated_equipment['name'])

                    cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                          " FROM tbl_equipment_input_category_hourly "
                                          " WHERE equipment_id = %s "
                                          "     AND energy_category_id = %s "
                                          "     AND start_datetime_utc >= %s "
                                          "     AND start_datetime_utc < %s "
                                          " ORDER BY start_datetime_utc ",
                                          (associated_equipment['id'],
                                           energy_category_id,
                                           reporting_start_datetime_utc,
                                           reporting_end_datetime_utc))
                    rows_associated_equipments_hourly = cursor_energy.fetchall()

                    rows_associated_equipment_periodically, \
                        associated_equipment_data[energy_category_id]['average'], \
                        associated_equipment_data[energy_category_id]['maximum'] = \
                        utilities.averaging_hourly_data_by_period(rows_associated_equipments_hourly,
                                                                  reporting_start_datetime_utc,
                                                                  reporting_end_datetime_utc,
                                                                  period_type)

                    associated_equipment_data[energy_category_id]['sub_averages'].append(
                        associated_equipment_data[energy_category_id]['average'])
                    associated_equipment_data[energy_category_id]['sub_maximums'].append(
                        associated_equipment_data[energy_category_id]['maximum'])

        ################################################################################################################
        # Step 11: construct the report
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

        result['combined_equipment'] = dict()
        result['combined_equipment']['name'] = combined_equipment['name']

        result['base_period'] = dict()
        result['base_period']['names'] = list()
        result['base_period']['units'] = list()
        result['base_period']['timestamps'] = list()
        result['base_period']['sub_averages'] = list()
        result['base_period']['sub_maximums'] = list()
        result['base_period']['averages'] = list()
        result['base_period']['maximums'] = list()
        result['base_period']['factors'] = list()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['base_period']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['base_period']['units'].append(energy_category_dict[energy_category_id]['unit_of_measure'])
                result['base_period']['timestamps'].append(base[energy_category_id]['timestamps'])
                result['base_period']['sub_averages'].append(base[energy_category_id]['sub_averages'])
                result['base_period']['sub_maximums'].append(base[energy_category_id]['sub_maximums'])
                result['base_period']['averages'].append(base[energy_category_id]['average'])
                result['base_period']['maximums'].append(base[energy_category_id]['maximum'])
                result['base_period']['factors'].append(base[energy_category_id]['factor'])

        result['reporting_period'] = dict()
        result['reporting_period']['names'] = list()
        result['reporting_period']['energy_category_ids'] = list()
        result['reporting_period']['units'] = list()
        result['reporting_period']['timestamps'] = list()
        result['reporting_period']['sub_averages'] = list()
        result['reporting_period']['sub_maximums'] = list()
        result['reporting_period']['rates_of_sub_maximums'] = list()
        result['reporting_period']['averages'] = list()
        result['reporting_period']['averages_increment_rate'] = list()
        result['reporting_period']['maximums'] = list()
        result['reporting_period']['maximums_increment_rate'] = list()
        result['reporting_period']['factors'] = list()
        result['reporting_period']['factors_increment_rate'] = list()

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['reporting_period']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['reporting_period']['energy_category_ids'].append(energy_category_id)
                result['reporting_period']['units'].append(energy_category_dict[energy_category_id]['unit_of_measure'])
                result['reporting_period']['timestamps'].append(reporting[energy_category_id]['timestamps'])
                result['reporting_period']['sub_averages'].append(reporting[energy_category_id]['sub_averages'])
                result['reporting_period']['sub_maximums'].append(reporting[energy_category_id]['sub_maximums'])
                result['reporting_period']['averages'].append(reporting[energy_category_id]['average'])
                result['reporting_period']['averages_increment_rate'].append(
                    (reporting[energy_category_id]['average'] - base[energy_category_id]['average']) /
                    base[energy_category_id]['average'] if (reporting[energy_category_id]['average'] is not None and
                                                            base[energy_category_id]['average'] is not None and
                                                            base[energy_category_id]['average'] > Decimal(0.0))
                    else None)
                result['reporting_period']['maximums'].append(reporting[energy_category_id]['maximum'])
                result['reporting_period']['maximums_increment_rate'].append(
                    (reporting[energy_category_id]['maximum'] - base[energy_category_id]['maximum']) /
                    base[energy_category_id]['maximum'] if (reporting[energy_category_id]['maximum'] is not None and
                                                            base[energy_category_id]['maximum'] is not None and
                                                            base[energy_category_id]['maximum'] > Decimal(0.0))
                    else None)
                result['reporting_period']['factors'].append(reporting[energy_category_id]['factor'])
                result['reporting_period']['factors_increment_rate'].append(
                    (reporting[energy_category_id]['factor'] - base[energy_category_id]['factor']) /
                    base[energy_category_id]['factor'] if (reporting[energy_category_id]['factor'] is not None and
                                                           base[energy_category_id]['factor'] is not None and
                                                           base[energy_category_id]['factor'] > Decimal(0.0))
                    else None)

                rate = list()
                for index, value in enumerate(reporting[energy_category_id]['sub_maximums']):
                    if index < len(base[energy_category_id]['sub_maximums']) \
                            and base[energy_category_id]['sub_maximums'][index] != 0 and value != 0 \
                            and base[energy_category_id]['sub_maximums'][index] is not None and value is not None:
                        rate.append((value - base[energy_category_id]['sub_maximums'][index])
                                    / base[energy_category_id]['sub_maximums'][index])
                    else:
                        rate.append(None)
                result['reporting_period']['rates_of_sub_maximums'].append(rate)

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }

        result['associated_equipment'] = dict()
        result['associated_equipment']['energy_category_names'] = list()
        result['associated_equipment']['units'] = list()
        result['associated_equipment']['associated_equipment_names_array'] = list()
        result['associated_equipment']['sub_averages_array'] = list()
        result['associated_equipment']['sub_maximums_array'] = list()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['associated_equipment']['energy_category_names'].append(
                    energy_category_dict[energy_category_id]['name'])
                result['associated_equipment']['units'].append(
                    energy_category_dict[energy_category_id]['unit_of_measure'])
                result['associated_equipment']['associated_equipment_names_array'].append(
                    associated_equipment_data[energy_category_id]['associated_equipment_names'])
                result['associated_equipment']['sub_averages_array'].append(
                    associated_equipment_data[energy_category_id]['sub_averages'])
                result['associated_equipment']['sub_maximums_array'].append(
                    associated_equipment_data[energy_category_id]['sub_maximums'])

        # export result to Excel file and then encode the file to base64 string
        result['excel_bytes_base64'] = None
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.combinedequipmentload.export(result,
                                                            combined_equipment['name'],
                                                            base_period_start_datetime_local,
                                                            base_period_end_datetime_local,
                                                            reporting_period_start_datetime_local,
                                                            reporting_period_end_datetime_local,
                                                            period_type,
                                                            language)

        resp.text = json.dumps(result)
