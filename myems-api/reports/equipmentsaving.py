import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import gettext
import falcon
import mysql.connector
import simplejson as json

import config
import excelexporters.equipmentsaving
from core import utilities


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
    # Step 2: query the equipment
    # Step 3: query energy categories
    # Step 4: query associated points
    # Step 5: query base period energy saving
    # Step 6: query reporting period energy saving
    # Step 7: query tariff data
    # Step 8: query associated points data
    # Step 10: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        print(req.params)
        equipment_id = req.params.get('equipmentid')
        equipment_uuid = req.params.get('equipmentuuid')
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
        if equipment_id is None and equipment_uuid is None:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EQUIPMENT_ID')

        if equipment_id is not None:
            equipment_id = str.strip(equipment_id)
            if not equipment_id.isdigit() or int(equipment_id) <= 0:
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_EQUIPMENT_ID')

        if equipment_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(equipment_uuid))
            if not bool(match):
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_EQUIPMENT_UUID')

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
        # Step 2: query the equipment
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_energy_baseline = mysql.connector.connect(**config.myems_energy_baseline_db)
        cursor_energy_baseline = cnx_energy_baseline.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if equipment_id is not None:
            cursor_system.execute(" SELECT id, name, cost_center_id "
                                  " FROM tbl_equipments "
                                  " WHERE id = %s ", (equipment_id,))
            row_equipment = cursor_system.fetchone()
        elif equipment_uuid is not None:
            cursor_system.execute(" SELECT id, name, cost_center_id "
                                  " FROM tbl_equipments "
                                  " WHERE uuid = %s ", (equipment_uuid,))
            row_equipment = cursor_system.fetchone()

        if row_equipment is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.close()

            if cursor_energy_baseline:
                cursor_energy_baseline.close()
            if cnx_energy_baseline:
                cnx_energy_baseline.close()

            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND', description='API.EQUIPMENT_NOT_FOUND')

        equipment = dict()
        equipment['id'] = row_equipment[0]
        equipment['name'] = row_equipment[1]
        equipment['cost_center_id'] = row_equipment[2]

        ################################################################################################################
        # Step 3: query energy categories
        ################################################################################################################
        energy_category_set = set()
        # query energy categories in base period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_equipment_input_category_hourly "
                              " WHERE equipment_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (equipment['id'], base_start_datetime_utc, base_end_datetime_utc))
        rows_energy_categories = cursor_energy.fetchall()
        if rows_energy_categories is not None or len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set.add(row_energy_category[0])

        # query energy categories in reporting period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_equipment_input_category_hourly "
                              " WHERE equipment_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (equipment['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
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

            if cursor_energy_baseline:
                cursor_energy_baseline.close()
            if cnx_energy_baseline:
                cnx_energy_baseline.close()

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
                              " FROM tbl_equipments e, tbl_equipments_parameters ep, tbl_points p "
                              " WHERE e.id = %s AND e.id = ep.equipment_id AND ep.parameter_type = 'point' "
                              "       AND ep.point_id = p.id "
                              " ORDER BY p.id ", (equipment['id'],))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_list.append({"id": row[0], "name": row[1], "units": row[2], "object_type": row[3]})

        ################################################################################################################
        # Step 5: query base period energy saving
        ################################################################################################################
        base = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                kgce = energy_category_dict[energy_category_id]['kgce']
                kgco2e = energy_category_dict[energy_category_id]['kgco2e']

                base[energy_category_id] = dict()
                base[energy_category_id]['timestamps'] = list()
                base[energy_category_id]['values_baseline'] = list()
                base[energy_category_id]['values_actual'] = list()
                base[energy_category_id]['values_saving'] = list()
                base[energy_category_id]['subtotal_baseline'] = Decimal(0.0)
                base[energy_category_id]['subtotal_actual'] = Decimal(0.0)
                base[energy_category_id]['subtotal_saving'] = Decimal(0.0)
                base[energy_category_id]['subtotal_in_kgce_baseline'] = Decimal(0.0)
                base[energy_category_id]['subtotal_in_kgce_actual'] = Decimal(0.0)
                base[energy_category_id]['subtotal_in_kgce_saving'] = Decimal(0.0)
                base[energy_category_id]['subtotal_in_kgco2e_baseline'] = Decimal(0.0)
                base[energy_category_id]['subtotal_in_kgco2e_actual'] = Decimal(0.0)
                base[energy_category_id]['subtotal_in_kgco2e_saving'] = Decimal(0.0)
                # query base period's energy baseline
                cursor_energy_baseline.execute(" SELECT start_datetime_utc, actual_value "
                                               " FROM tbl_equipment_input_category_hourly "
                                               " WHERE equipment_id = %s "
                                               "     AND energy_category_id = %s "
                                               "     AND start_datetime_utc >= %s "
                                               "     AND start_datetime_utc < %s "
                                               " ORDER BY start_datetime_utc ",
                                               (equipment['id'],
                                                energy_category_id,
                                                base_start_datetime_utc,
                                                base_end_datetime_utc))
                rows_equipment_hourly = cursor_energy_baseline.fetchall()

                rows_equipment_periodically = utilities.aggregate_hourly_data_by_period(rows_equipment_hourly,
                                                                                        base_start_datetime_utc,
                                                                                        base_end_datetime_utc,
                                                                                        period_type)
                for row_equipment_periodically in rows_equipment_periodically:
                    current_datetime_local = row_equipment_periodically[0].replace(tzinfo=timezone.utc) + \
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

                    baseline_value = Decimal(0.0) if row_equipment_periodically[1] is None \
                        else row_equipment_periodically[1]
                    base[energy_category_id]['timestamps'].append(current_datetime)
                    base[energy_category_id]['values_baseline'].append(baseline_value)
                    base[energy_category_id]['subtotal_baseline'] += baseline_value
                    base[energy_category_id]['subtotal_in_kgce_baseline'] += baseline_value * kgce
                    base[energy_category_id]['subtotal_in_kgco2e_baseline'] += baseline_value * kgco2e

                # query base period's energy actual
                cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                      " FROM tbl_equipment_input_category_hourly "
                                      " WHERE equipment_id = %s "
                                      "     AND energy_category_id = %s "
                                      "     AND start_datetime_utc >= %s "
                                      "     AND start_datetime_utc < %s "
                                      " ORDER BY start_datetime_utc ",
                                      (equipment['id'],
                                       energy_category_id,
                                       base_start_datetime_utc,
                                       base_end_datetime_utc))
                rows_equipment_hourly = cursor_energy.fetchall()

                rows_equipment_periodically = utilities.aggregate_hourly_data_by_period(rows_equipment_hourly,
                                                                                        base_start_datetime_utc,
                                                                                        base_end_datetime_utc,
                                                                                        period_type)
                for row_equipment_periodically in rows_equipment_periodically:
                    current_datetime_local = row_equipment_periodically[0].replace(tzinfo=timezone.utc) + \
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

                    actual_value = Decimal(0.0) if row_equipment_periodically[1] is None \
                        else row_equipment_periodically[1]
                    base[energy_category_id]['values_actual'].append(actual_value)
                    base[energy_category_id]['subtotal_actual'] += actual_value
                    base[energy_category_id]['subtotal_in_kgce_actual'] += actual_value * kgce
                    base[energy_category_id]['subtotal_in_kgco2e_actual'] += actual_value * kgco2e

                # calculate base period's energy savings
                for i in range(len(base[energy_category_id]['values_baseline'])):
                    base[energy_category_id]['values_saving'].append(
                        base[energy_category_id]['values_baseline'][i] -
                        base[energy_category_id]['values_actual'][i])

                base[energy_category_id]['subtotal_saving'] = \
                    base[energy_category_id]['subtotal_baseline'] - \
                    base[energy_category_id]['subtotal_actual']
                base[energy_category_id]['subtotal_in_kgce_saving'] = \
                    base[energy_category_id]['subtotal_in_kgce_baseline'] - \
                    base[energy_category_id]['subtotal_in_kgce_actual']
                base[energy_category_id]['subtotal_in_kgco2e_saving'] = \
                    base[energy_category_id]['subtotal_in_kgco2e_baseline'] - \
                    base[energy_category_id]['subtotal_in_kgco2e_actual']
        ################################################################################################################
        # Step 5: query reporting period energy saving
        ################################################################################################################
        reporting = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                kgce = energy_category_dict[energy_category_id]['kgce']
                kgco2e = energy_category_dict[energy_category_id]['kgco2e']

                reporting[energy_category_id] = dict()
                reporting[energy_category_id]['timestamps'] = list()
                reporting[energy_category_id]['values_baseline'] = list()
                reporting[energy_category_id]['values_actual'] = list()
                reporting[energy_category_id]['values_saving'] = list()
                reporting[energy_category_id]['subtotal_baseline'] = Decimal(0.0)
                reporting[energy_category_id]['subtotal_actual'] = Decimal(0.0)
                reporting[energy_category_id]['subtotal_saving'] = Decimal(0.0)
                reporting[energy_category_id]['subtotal_in_kgce_baseline'] = Decimal(0.0)
                reporting[energy_category_id]['subtotal_in_kgce_actual'] = Decimal(0.0)
                reporting[energy_category_id]['subtotal_in_kgce_saving'] = Decimal(0.0)
                reporting[energy_category_id]['subtotal_in_kgco2e_baseline'] = Decimal(0.0)
                reporting[energy_category_id]['subtotal_in_kgco2e_actual'] = Decimal(0.0)
                reporting[energy_category_id]['subtotal_in_kgco2e_saving'] = Decimal(0.0)
                # query reporting period's energy baseline
                cursor_energy_baseline.execute(" SELECT start_datetime_utc, actual_value "
                                               " FROM tbl_equipment_input_category_hourly "
                                               " WHERE equipment_id = %s "
                                               "     AND energy_category_id = %s "
                                               "     AND start_datetime_utc >= %s "
                                               "     AND start_datetime_utc < %s "
                                               " ORDER BY start_datetime_utc ",
                                               (equipment['id'],
                                                energy_category_id,
                                                reporting_start_datetime_utc,
                                                reporting_end_datetime_utc))
                rows_equipment_hourly = cursor_energy_baseline.fetchall()

                rows_equipment_periodically = utilities.aggregate_hourly_data_by_period(rows_equipment_hourly,
                                                                                        reporting_start_datetime_utc,
                                                                                        reporting_end_datetime_utc,
                                                                                        period_type)
                for row_equipment_periodically in rows_equipment_periodically:
                    current_datetime_local = row_equipment_periodically[0].replace(tzinfo=timezone.utc) + \
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

                    baseline_value = Decimal(0.0) if row_equipment_periodically[1] is None \
                        else row_equipment_periodically[1]
                    reporting[energy_category_id]['timestamps'].append(current_datetime)
                    reporting[energy_category_id]['values_baseline'].append(baseline_value)
                    reporting[energy_category_id]['subtotal_baseline'] += baseline_value
                    reporting[energy_category_id]['subtotal_in_kgce_baseline'] += baseline_value * kgce
                    reporting[energy_category_id]['subtotal_in_kgco2e_baseline'] += baseline_value * kgco2e

                # query reporting period's energy actual
                cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                      " FROM tbl_equipment_input_category_hourly "
                                      " WHERE equipment_id = %s "
                                      "     AND energy_category_id = %s "
                                      "     AND start_datetime_utc >= %s "
                                      "     AND start_datetime_utc < %s "
                                      " ORDER BY start_datetime_utc ",
                                      (equipment['id'],
                                       energy_category_id,
                                       reporting_start_datetime_utc,
                                       reporting_end_datetime_utc))
                rows_equipment_hourly = cursor_energy.fetchall()

                rows_equipment_periodically = utilities.aggregate_hourly_data_by_period(rows_equipment_hourly,
                                                                                        reporting_start_datetime_utc,
                                                                                        reporting_end_datetime_utc,
                                                                                        period_type)
                for row_equipment_periodically in rows_equipment_periodically:
                    current_datetime_local = row_equipment_periodically[0].replace(tzinfo=timezone.utc) + \
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

                    actual_value = Decimal(0.0) if row_equipment_periodically[1] is None \
                        else row_equipment_periodically[1]
                    reporting[energy_category_id]['values_actual'].append(actual_value)
                    reporting[energy_category_id]['subtotal_actual'] += actual_value
                    reporting[energy_category_id]['subtotal_in_kgce_actual'] += actual_value * kgce
                    reporting[energy_category_id]['subtotal_in_kgco2e_actual'] += actual_value * kgco2e

                # calculate reporting period's energy savings
                for i in range(len(reporting[energy_category_id]['values_baseline'])):
                    reporting[energy_category_id]['values_saving'].append(
                        reporting[energy_category_id]['values_baseline'][i] -
                        reporting[energy_category_id]['values_actual'][i])

                reporting[energy_category_id]['subtotal_saving'] = \
                    reporting[energy_category_id]['subtotal_baseline'] - \
                    reporting[energy_category_id]['subtotal_actual']
                reporting[energy_category_id]['subtotal_in_kgce_saving'] = \
                    reporting[energy_category_id]['subtotal_in_kgce_baseline'] - \
                    reporting[energy_category_id]['subtotal_in_kgce_actual']
                reporting[energy_category_id]['subtotal_in_kgco2e_saving'] = \
                    reporting[energy_category_id]['subtotal_in_kgco2e_baseline'] - \
                    reporting[energy_category_id]['subtotal_in_kgco2e_actual']
        ################################################################################################################
        # Step 6: query tariff data
        ################################################################################################################
        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()
        if not is_quick_mode:
            if config.is_tariff_appended and energy_category_set is not None and len(energy_category_set) > 0:
                for energy_category_id in energy_category_set:
                    energy_category_tariff_dict = utilities.get_energy_category_tariffs(equipment['cost_center_id'],
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

                    parameters_data['names'].append(_('Tariff') + '-'
                                                    + energy_category_dict[energy_category_id]['name'])
                    parameters_data['timestamps'].append(tariff_timestamp_list)
                    parameters_data['values'].append(tariff_value_list)

        ################################################################################################################
        # Step 7: query associated points data
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
        # Step 8: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_energy:
            cursor_energy.close()
        if cnx_energy:
            cnx_energy.close()

        if cursor_energy_baseline:
            cursor_energy_baseline.close()
        if cnx_energy_baseline:
            cnx_energy_baseline.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()

        result = dict()

        result['equipment'] = dict()
        result['equipment']['name'] = equipment['name']

        result['base_period'] = dict()
        result['base_period']['names'] = list()
        result['base_period']['units'] = list()
        result['base_period']['timestamps'] = list()
        result['base_period']['values_saving'] = list()
        result['base_period']['subtotals_saving'] = list()
        result['base_period']['subtotals_in_kgce_saving'] = list()
        result['base_period']['subtotals_in_kgco2e_saving'] = list()
        result['base_period']['total_in_kgce_saving'] = Decimal(0.0)
        result['base_period']['total_in_kgco2e_saving'] = Decimal(0.0)
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['base_period']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['base_period']['units'].append(energy_category_dict[energy_category_id]['unit_of_measure'])
                result['base_period']['timestamps'].append(base[energy_category_id]['timestamps'])
                result['base_period']['values_saving'].append(base[energy_category_id]['values_saving'])
                result['base_period']['subtotals_saving'].append(base[energy_category_id]['subtotal_saving'])
                result['base_period']['subtotals_in_kgce_saving'].append(
                    base[energy_category_id]['subtotal_in_kgce_saving'])
                result['base_period']['subtotals_in_kgco2e_saving'].append(
                    base[energy_category_id]['subtotal_in_kgco2e_saving'])
                result['base_period']['total_in_kgce_saving'] += base[energy_category_id]['subtotal_in_kgce_saving']
                result['base_period']['total_in_kgco2e_saving'] += base[energy_category_id]['subtotal_in_kgco2e_saving']

        result['reporting_period'] = dict()
        result['reporting_period']['names'] = list()
        result['reporting_period']['energy_category_ids'] = list()
        result['reporting_period']['units'] = list()
        result['reporting_period']['timestamps'] = list()
        result['reporting_period']['values_saving'] = list()
        result['reporting_period']['rates_saving'] = list()
        result['reporting_period']['subtotals_saving'] = list()
        result['reporting_period']['subtotals_in_kgce_saving'] = list()
        result['reporting_period']['subtotals_in_kgco2e_saving'] = list()
        result['reporting_period']['increment_rates_saving'] = list()
        result['reporting_period']['total_in_kgce_saving'] = Decimal(0.0)
        result['reporting_period']['total_in_kgco2e_saving'] = Decimal(0.0)
        result['reporting_period']['increment_rate_in_kgce_saving'] = Decimal(0.0)
        result['reporting_period']['increment_rate_in_kgco2e_saving'] = Decimal(0.0)

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['reporting_period']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['reporting_period']['energy_category_ids'].append(energy_category_id)
                result['reporting_period']['units'].append(energy_category_dict[energy_category_id]['unit_of_measure'])
                result['reporting_period']['timestamps'].append(reporting[energy_category_id]['timestamps'])
                result['reporting_period']['values_saving'].append(reporting[energy_category_id]['values_saving'])
                result['reporting_period']['subtotals_saving'].append(reporting[energy_category_id]['subtotal_saving'])
                result['reporting_period']['subtotals_in_kgce_saving'].append(
                    reporting[energy_category_id]['subtotal_in_kgce_saving'])
                result['reporting_period']['subtotals_in_kgco2e_saving'].append(
                    reporting[energy_category_id]['subtotal_in_kgco2e_saving'])
                result['reporting_period']['increment_rates_saving'].append(
                    (reporting[energy_category_id]['subtotal_saving'] - base[energy_category_id]['subtotal_saving']) /
                    base[energy_category_id]['subtotal_saving']
                    if base[energy_category_id]['subtotal_saving'] != Decimal(0.0) else None)
                result['reporting_period']['total_in_kgce_saving'] += \
                    reporting[energy_category_id]['subtotal_in_kgce_saving']
                result['reporting_period']['total_in_kgco2e_saving'] += \
                    reporting[energy_category_id]['subtotal_in_kgco2e_saving']

                rate = list()
                for index, value in enumerate(reporting[energy_category_id]['values_saving']):
                    if index < len(base[energy_category_id]['values_saving']) \
                            and base[energy_category_id]['values_saving'][index] != 0 and value != 0:
                        rate.append((value - base[energy_category_id]['values_saving'][index])
                                    / base[energy_category_id]['values_saving'][index])
                    else:
                        rate.append(None)
                result['reporting_period']['rates_saving'].append(rate)

        result['reporting_period']['increment_rate_in_kgce_saving'] = \
            (result['reporting_period']['total_in_kgce_saving'] - result['base_period']['total_in_kgce_saving']) / \
            result['base_period']['total_in_kgce_saving'] \
            if result['base_period']['total_in_kgce_saving'] != Decimal(0.0) else None

        result['reporting_period']['increment_rate_in_kgco2e_saving'] = \
            (result['reporting_period']['total_in_kgco2e_saving'] - result['base_period']['total_in_kgco2e_saving']) / \
            result['base_period']['total_in_kgco2e_saving'] \
            if result['base_period']['total_in_kgco2e_saving'] != Decimal(0.0) else None

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }

        # export result to Excel file and then encode the file to base64 string
        result['excel_bytes_base64'] = None
        if not is_quick_mode:
            result['excel_bytes_base64'] = excelexporters.equipmentsaving.export(result,
                                                                                 equipment['name'],
                                                                                 base_period_start_datetime_local,
                                                                                 base_period_end_datetime_local,
                                                                                 reporting_period_start_datetime_local,
                                                                                 reporting_period_end_datetime_local,
                                                                                 period_type,
                                                                                 language)

        resp.text = json.dumps(result)
