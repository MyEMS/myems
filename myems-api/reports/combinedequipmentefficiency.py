import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import falcon
import mysql.connector
import simplejson as json

import config
import excelexporters.combinedequipmentefficiency
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
    # Step 2: query the combined equipment
    # Step 3: query energy categories
    # Step 4: query associated points
    # Step 5: query associated equipments
    # Step 6: query associated fractions
    # Step 7: query fractions' numerator and denominator
    # Step 8: calculate base period fractions
    # Step 9: calculate reporting period fractions
    # Step 10: query associated points data
    # Step 11: query associated equipments energy input
    # Step 12: construct the report
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
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
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
        # Step 6: query associated fractions
        ################################################################################################################
        fraction_list = list()
        cursor_system.execute(" SELECT id, name, numerator_meter_uuid, denominator_meter_uuid  "
                              " FROM tbl_combined_equipments_parameters "
                              " WHERE combined_equipment_id = %s AND parameter_type = 'fraction' ",
                              (combined_equipment['id'],))
        rows_fractions = cursor_system.fetchall()
        if rows_fractions is not None and len(rows_fractions) > 0:
            for row in rows_fractions:
                fraction_list.append({"id": row[0],
                                      "name": row[1],
                                      "numerator_meter_uuid": row[2],
                                      "denominator_meter_uuid": row[3],
                                      })

        ################################################################################################################
        # Step 7: query fractions' numerator and denominator
        ################################################################################################################
        # get all meters
        meter_dict = dict()
        query = (" SELECT m.uuid, m.id, m.name, ec.unit_of_measure "
                 " FROM tbl_meters m, tbl_energy_categories ec "
                 " WHERE m.energy_category_id  = ec.id ")
        cursor_system.execute(query)
        rows_meters = cursor_system.fetchall()

        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {'id': row[1], 'name': row[2], 'unit': row[3]}
        # get all offline meters
        offline_meter_dict = dict()
        query = (" SELECT m.uuid, m.id, m.name, ec.unit_of_measure "
                 " FROM tbl_offline_meters m, tbl_energy_categories ec "
                 " WHERE m.energy_category_id  = ec.id ")
        cursor_system.execute(query)
        rows_offline_meters = cursor_system.fetchall()

        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[0]] = {'id': row[1], 'name': row[2], 'unit': row[3]}
        # get all virtual meters
        virtual_meter_dict = dict()
        query = (" SELECT m.uuid, m.id, m.name, ec.unit_of_measure "
                 " FROM tbl_virtual_meters m, tbl_energy_categories ec "
                 " WHERE m.energy_category_id  = ec.id ")
        cursor_system.execute(query)
        rows_virtual_meters = cursor_system.fetchall()

        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[0]] = {'id': row[1], 'name': row[2], 'unit': row[3]}

        if fraction_list is not None and len(fraction_list) > 0:
            for i in range(len(fraction_list)):
                if fraction_list[i]['numerator_meter_uuid'] in offline_meter_dict:
                    fraction_list[i]['numerator_meter_id'] = \
                        offline_meter_dict[fraction_list[i]['numerator_meter_uuid']]['id']
                    fraction_list[i]['numerator_meter_name'] = \
                        offline_meter_dict[fraction_list[i]['numerator_meter_uuid']]['name']
                    fraction_list[i]['numerator_meter_unit'] = \
                        offline_meter_dict[fraction_list[i]['numerator_meter_uuid']]['unit']
                    fraction_list[i]['numerator_meter_type'] = 'offline_meter'
                elif fraction_list[i]['numerator_meter_uuid'] in virtual_meter_dict:
                    fraction_list[i]['numerator_meter_id'] = \
                        virtual_meter_dict[fraction_list[i]['numerator_meter_uuid']]['id']
                    fraction_list[i]['numerator_meter_name'] = \
                        virtual_meter_dict[fraction_list[i]['numerator_meter_uuid']]['name']
                    fraction_list[i]['numerator_meter_unit'] = \
                        virtual_meter_dict[fraction_list[i]['numerator_meter_uuid']]['unit']
                    fraction_list[i]['numerator_meter_type'] = 'virtual_meter'
                elif fraction_list[i]['numerator_meter_uuid'] in meter_dict:
                    fraction_list[i]['numerator_meter_id'] = \
                        meter_dict[fraction_list[i]['numerator_meter_uuid']]['id']
                    fraction_list[i]['numerator_meter_name'] = \
                        meter_dict[fraction_list[i]['numerator_meter_uuid']]['name']
                    fraction_list[i]['numerator_meter_unit'] = \
                        meter_dict[fraction_list[i]['numerator_meter_uuid']]['unit']
                    fraction_list[i]['numerator_meter_type'] = 'meter'
                else:
                    del fraction_list[i]
                    continue

                if fraction_list[i]['denominator_meter_uuid'] in offline_meter_dict:
                    fraction_list[i]['denominator_meter_id'] = \
                        offline_meter_dict[fraction_list[i]['denominator_meter_uuid']]['id']
                    fraction_list[i]['denominator_meter_name'] = \
                        offline_meter_dict[fraction_list[i]['denominator_meter_uuid']]['name']
                    fraction_list[i]['denominator_meter_unit'] = \
                        offline_meter_dict[fraction_list[i]['denominator_meter_uuid']]['unit']
                    fraction_list[i]['denominator_meter_type'] = 'offline_meter'
                elif fraction_list[i]['denominator_meter_uuid'] in virtual_meter_dict:
                    fraction_list[i]['denominator_meter_id'] = \
                        virtual_meter_dict[fraction_list[i]['denominator_meter_uuid']]['id']
                    fraction_list[i]['denominator_meter_name'] = \
                        virtual_meter_dict[fraction_list[i]['denominator_meter_uuid']]['name']
                    fraction_list[i]['denominator_meter_unit'] = \
                        virtual_meter_dict[fraction_list[i]['denominator_meter_uuid']]['unit']
                    fraction_list[i]['denominator_meter_type'] = 'virtual_meter'
                elif fraction_list[i]['denominator_meter_uuid'] in meter_dict:
                    fraction_list[i]['denominator_meter_id'] = \
                        meter_dict[fraction_list[i]['denominator_meter_uuid']]['id']
                    fraction_list[i]['denominator_meter_name'] = \
                        meter_dict[fraction_list[i]['denominator_meter_uuid']]['name']
                    fraction_list[i]['denominator_meter_unit'] = \
                        meter_dict[fraction_list[i]['denominator_meter_uuid']]['unit']
                    fraction_list[i]['denominator_meter_type'] = 'meter'
                else:
                    del fraction_list[i]
                    continue

        ################################################################################################################
        # Step 8: calculate base period fractions
        ################################################################################################################
        base = dict()
        if fraction_list is not None and len(fraction_list) > 0:
            for fraction in fraction_list:
                base[fraction['id']] = dict()
                base[fraction['id']]['name'] = fraction['name']
                base[fraction['id']]['unit'] = fraction['numerator_meter_unit'] + '/' + \
                    fraction['denominator_meter_unit']
                base[fraction['id']]['numerator_timestamps'] = list()
                base[fraction['id']]['numerator_values'] = list()
                base[fraction['id']]['numerator_cumulation'] = Decimal(0.0)
                base[fraction['id']]['denominator_timestamps'] = list()
                base[fraction['id']]['denominator_values'] = list()
                base[fraction['id']]['denominator_cumulation'] = Decimal(0.0)
                base[fraction['id']]['timestamps'] = list()
                base[fraction['id']]['values'] = list()
                base[fraction['id']]['cumulation'] = Decimal(0.0)
                # query numerator meter output
                if fraction['numerator_meter_type'] == 'meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_meter_hourly "
                             " WHERE meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")
                elif fraction['numerator_meter_type'] == 'offline_meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_offline_meter_hourly "
                             " WHERE offline_meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")
                elif fraction['numerator_meter_type'] == 'virtual_meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_virtual_meter_hourly "
                             " WHERE virtual_meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")

                cursor_energy.execute(query, (fraction['numerator_meter_id'],
                                              base_start_datetime_utc,
                                              base_end_datetime_utc))
                rows_numerator_meter_hourly = cursor_energy.fetchall()

                rows_numerator_meter_periodically = \
                    utilities.aggregate_hourly_data_by_period(rows_numerator_meter_hourly,
                                                              base_start_datetime_utc,
                                                              base_end_datetime_utc,
                                                              period_type)
                # query denominator meter input
                if fraction['denominator_meter_type'] == 'meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_meter_hourly "
                             " WHERE meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")
                elif fraction['denominator_meter_type'] == 'offline_meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_offline_meter_hourly "
                             " WHERE offline_meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")
                elif fraction['denominator_meter_type'] == 'virtual_meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_virtual_meter_hourly "
                             " WHERE virtual_meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")

                cursor_energy.execute(query, (fraction['denominator_meter_id'],
                                              base_start_datetime_utc,
                                              base_end_datetime_utc))
                rows_denominator_meter_hourly = cursor_energy.fetchall()

                rows_denominator_meter_periodically = \
                    utilities.aggregate_hourly_data_by_period(rows_denominator_meter_hourly,
                                                              base_start_datetime_utc,
                                                              base_end_datetime_utc,
                                                              period_type)

                for row_numerator_meter_periodically in rows_numerator_meter_periodically:
                    current_datetime_local = row_numerator_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

                    actual_value = Decimal(0.0) if row_numerator_meter_periodically[1] is None \
                        else row_numerator_meter_periodically[1]

                    base[fraction['id']]['numerator_timestamps'].append(current_datetime)
                    base[fraction['id']]['numerator_values'].append(actual_value)
                    base[fraction['id']]['numerator_cumulation'] += actual_value

                for row_denominator_meter_periodically in rows_denominator_meter_periodically:
                    current_datetime_local = row_denominator_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

                    actual_value = Decimal(0.0) if row_denominator_meter_periodically[1] is None \
                        else row_denominator_meter_periodically[1]

                    base[fraction['id']]['denominator_timestamps'].append(current_datetime)
                    base[fraction['id']]['denominator_values'].append(actual_value)
                    base[fraction['id']]['denominator_cumulation'] += actual_value

                for i in range(len(base[fraction['id']]['denominator_timestamps'])):
                    timestamp = base[fraction['id']]['denominator_timestamps'][i]
                    base[fraction['id']]['timestamps'].append(timestamp)
                    value = (base[fraction['id']]['numerator_values'][i] /
                             base[fraction['id']]['denominator_values'][i]) \
                        if base[fraction['id']]['denominator_values'][i] > Decimal(0.0) else Decimal(0.0)
                    base[fraction['id']]['values'].append(value)

                cumulation = (base[fraction['id']]['numerator_cumulation'] /
                              base[fraction['id']]['denominator_cumulation']) \
                    if base[fraction['id']]['denominator_cumulation'] > Decimal(0.0) else Decimal(0.0)
                base[fraction['id']]['cumulation'] = cumulation

        ################################################################################################################
        # Step 9: calculate reporting period fractions
        ################################################################################################################
        reporting = dict()
        if fraction_list is not None and len(fraction_list) > 0:
            for fraction in fraction_list:
                reporting[fraction['id']] = dict()
                reporting[fraction['id']]['name'] = fraction['name']
                reporting[fraction['id']]['unit'] = fraction['numerator_meter_unit'] + '/' + \
                    fraction['denominator_meter_unit']

                reporting[fraction['id']]['numerator_name'] = fraction['numerator_meter_name']
                reporting[fraction['id']]['numerator_unit'] = fraction['numerator_meter_unit']
                reporting[fraction['id']]['denominator_name'] = fraction['denominator_meter_name']
                reporting[fraction['id']]['denominator_unit'] = fraction['denominator_meter_unit']

                reporting[fraction['id']]['numerator_timestamps'] = list()
                reporting[fraction['id']]['numerator_values'] = list()
                reporting[fraction['id']]['numerator_cumulation'] = Decimal(0.0)
                reporting[fraction['id']]['denominator_timestamps'] = list()
                reporting[fraction['id']]['denominator_values'] = list()
                reporting[fraction['id']]['denominator_cumulation'] = Decimal(0.0)
                reporting[fraction['id']]['timestamps'] = list()
                reporting[fraction['id']]['values'] = list()
                reporting[fraction['id']]['cumulation'] = Decimal(0.0)
                # query numerator meter output
                if fraction['numerator_meter_type'] == 'meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_meter_hourly "
                             " WHERE meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")
                elif fraction['numerator_meter_type'] == 'offline_meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_offline_meter_hourly "
                             " WHERE offline_meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")
                elif fraction['numerator_meter_type'] == 'virtual_meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_virtual_meter_hourly "
                             " WHERE virtual_meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")

                cursor_energy.execute(query, (fraction['numerator_meter_id'],
                                              reporting_start_datetime_utc,
                                              reporting_end_datetime_utc))
                rows_numerator_meter_hourly = cursor_energy.fetchall()

                rows_numerator_meter_periodically = \
                    utilities.aggregate_hourly_data_by_period(rows_numerator_meter_hourly,
                                                              reporting_start_datetime_utc,
                                                              reporting_end_datetime_utc,
                                                              period_type)
                # query denominator meter input
                if fraction['denominator_meter_type'] == 'meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_meter_hourly "
                             " WHERE meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")
                elif fraction['denominator_meter_type'] == 'offline_meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_offline_meter_hourly "
                             " WHERE offline_meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")
                elif fraction['denominator_meter_type'] == 'virtual_meter':
                    query = (" SELECT start_datetime_utc, actual_value "
                             " FROM tbl_virtual_meter_hourly "
                             " WHERE virtual_meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s "
                             " ORDER BY start_datetime_utc ")

                cursor_energy.execute(query, (fraction['denominator_meter_id'],
                                              reporting_start_datetime_utc,
                                              reporting_end_datetime_utc))
                rows_denominator_meter_hourly = cursor_energy.fetchall()

                rows_denominator_meter_periodically = \
                    utilities.aggregate_hourly_data_by_period(rows_denominator_meter_hourly,
                                                              reporting_start_datetime_utc,
                                                              reporting_end_datetime_utc,
                                                              period_type)

                for row_numerator_meter_periodically in rows_numerator_meter_periodically:
                    current_datetime_local = row_numerator_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

                    actual_value = Decimal(0.0) if row_numerator_meter_periodically[1] is None \
                        else row_numerator_meter_periodically[1]

                    reporting[fraction['id']]['numerator_timestamps'].append(current_datetime)
                    reporting[fraction['id']]['numerator_values'].append(actual_value)
                    reporting[fraction['id']]['numerator_cumulation'] += actual_value

                for row_denominator_meter_periodically in rows_denominator_meter_periodically:
                    current_datetime_local = row_denominator_meter_periodically[0].replace(tzinfo=timezone.utc) + \
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

                    actual_value = Decimal(0.0) if row_denominator_meter_periodically[1] is None \
                        else row_denominator_meter_periodically[1]

                    reporting[fraction['id']]['denominator_timestamps'].append(current_datetime)
                    reporting[fraction['id']]['denominator_values'].append(actual_value)
                    reporting[fraction['id']]['denominator_cumulation'] += actual_value

                for i in range(len(reporting[fraction['id']]['denominator_timestamps'])):
                    timestamp = reporting[fraction['id']]['denominator_timestamps'][i]
                    reporting[fraction['id']]['timestamps'].append(timestamp)
                    value = reporting[fraction['id']]['numerator_values'][i] / \
                        reporting[fraction['id']]['denominator_values'][i] \
                        if reporting[fraction['id']]['denominator_values'][i] > Decimal(0.0) else Decimal(0.0)
                    reporting[fraction['id']]['values'].append(value)

                cumulation = (reporting[fraction['id']]['numerator_cumulation'] /
                              reporting[fraction['id']]['denominator_cumulation']) \
                    if reporting[fraction['id']]['denominator_cumulation'] > Decimal(0.0) else Decimal(0.0)
                reporting[fraction['id']]['cumulation'] = cumulation

        ################################################################################################################
        # Step 10: query associated points data
        ################################################################################################################
        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()
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
        # Step 11: query associated equipments energy input
        ################################################################################################################
        associated_equipment_data = dict()

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                associated_equipment_data[energy_category_id] = dict()
                associated_equipment_data[energy_category_id]['associated_equipment_names'] = list()
                associated_equipment_data[energy_category_id]['subtotals'] = list()
                for associated_equipment in associated_equipment_list:
                    associated_equipment_data[energy_category_id]['associated_equipment_names'].append(
                        associated_equipment['name'])

                    cursor_energy.execute(" SELECT SUM(actual_value) "
                                          " FROM tbl_equipment_input_category_hourly "
                                          " WHERE equipment_id = %s "
                                          "     AND energy_category_id = %s "
                                          "     AND start_datetime_utc >= %s "
                                          "     AND start_datetime_utc < %s ",
                                          (associated_equipment['id'],
                                           energy_category_id,
                                           reporting_start_datetime_utc,
                                           reporting_end_datetime_utc))
                    row_subtotal = cursor_energy.fetchone()

                    subtotal = Decimal(0.0) if (row_subtotal is None or row_subtotal[0] is None) else row_subtotal[0]
                    associated_equipment_data[energy_category_id]['subtotals'].append(subtotal)

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

        result = dict()

        result['combined_equipment'] = dict()
        result['combined_equipment']['name'] = combined_equipment['name']

        result['base_period_efficiency'] = dict()
        result['base_period_efficiency']['timestamps'] = list()
        result['base_period_efficiency']['values'] = list()
        result['base_period_efficiency']['cumulations'] = list()
        result['base_period_efficiency']['numerator_timestamps'] = list()
        result['base_period_efficiency']['numerator_values'] = list()
        result['base_period_efficiency']['numerator_cumulations'] = list()
        result['base_period_efficiency']['denominator_timestamps'] = list()
        result['base_period_efficiency']['denominator_values'] = list()
        result['base_period_efficiency']['denominator_cumulations'] = list()

        result['reporting_period_efficiency'] = dict()
        result['reporting_period_efficiency']['names'] = list()
        result['reporting_period_efficiency']['units'] = list()

        result['reporting_period_efficiency']['numerator_names'] = list()
        result['reporting_period_efficiency']['numerator_units'] = list()
        result['reporting_period_efficiency']['denominator_names'] = list()
        result['reporting_period_efficiency']['denominator_units'] = list()

        result['reporting_period_efficiency']['timestamps'] = list()
        result['reporting_period_efficiency']['values'] = list()
        result['reporting_period_efficiency']['rates'] = list()

        result['reporting_period_efficiency']['numerator_timestamps'] = list()
        result['reporting_period_efficiency']['numerator_values'] = list()
        result['reporting_period_efficiency']['numerator_rates'] = list()
        result['reporting_period_efficiency']['denominator_timestamps'] = list()
        result['reporting_period_efficiency']['denominator_values'] = list()
        result['reporting_period_efficiency']['denominator_rates'] = list()

        result['reporting_period_efficiency']['cumulations'] = list()

        result['reporting_period_efficiency']['numerator_cumulations'] = list()
        result['reporting_period_efficiency']['denominator_cumulations'] = list()

        result['reporting_period_efficiency']['increment_rates'] = list()

        result['reporting_period_efficiency']['increment_rates_num'] = list()
        result['reporting_period_efficiency']['increment_rates_den'] = list()

        if fraction_list is not None and len(fraction_list) > 0:
            for fraction in fraction_list:
                result['base_period_efficiency']['timestamps'].append(base[fraction['id']]['timestamps'])
                result['base_period_efficiency']['values'].append(base[fraction['id']]['values'])
                result['base_period_efficiency']['cumulations'].append(base[fraction['id']]['cumulation'])
                result['base_period_efficiency']['numerator_timestamps'] \
                    .append(base[fraction['id']]['numerator_timestamps'])
                result['base_period_efficiency']['numerator_values'] \
                    .append(base[fraction['id']]['numerator_values'])
                result['base_period_efficiency']['numerator_cumulations'] \
                    .append(base[fraction['id']]['numerator_cumulation'])
                result['base_period_efficiency']['denominator_timestamps'] \
                    .append(base[fraction['id']]['denominator_timestamps'])
                result['base_period_efficiency']['denominator_values'] \
                    .append(base[fraction['id']]['denominator_values'])
                result['base_period_efficiency']['denominator_cumulations']. \
                    append(base[fraction['id']]['denominator_cumulation'])
                result['reporting_period_efficiency']['names'].append(reporting[fraction['id']]['name'])
                result['reporting_period_efficiency']['units'].append(reporting[fraction['id']]['unit'])

                result['reporting_period_efficiency']['numerator_names'].append(
                    reporting[fraction['id']]['numerator_name'])
                result['reporting_period_efficiency']['numerator_units'].append(
                    reporting[fraction['id']]['numerator_unit'])
                result['reporting_period_efficiency']['denominator_names'].append(
                    reporting[fraction['id']]['denominator_name'])
                result['reporting_period_efficiency']['denominator_units'].append(
                    reporting[fraction['id']]['denominator_unit'])

                result['reporting_period_efficiency']['timestamps'].append(reporting[fraction['id']]['timestamps'])
                result['reporting_period_efficiency']['values'].append(reporting[fraction['id']]['values'])

                result['reporting_period_efficiency']['numerator_timestamps'].append(
                    reporting[fraction['id']]['numerator_timestamps'])
                result['reporting_period_efficiency']['numerator_values'].append(
                    reporting[fraction['id']]['numerator_values'])
                result['reporting_period_efficiency']['denominator_timestamps'].append(
                    reporting[fraction['id']]['denominator_timestamps'])
                result['reporting_period_efficiency']['denominator_values'].append(
                    reporting[fraction['id']]['denominator_values'])

                result['reporting_period_efficiency']['cumulations'].append(reporting[fraction['id']]['cumulation'])

                result['reporting_period_efficiency']['numerator_cumulations'].append(
                    reporting[fraction['id']]['numerator_cumulation'])
                result['reporting_period_efficiency']['denominator_cumulations'].append(
                    reporting[fraction['id']]['denominator_cumulation'])

                result['reporting_period_efficiency']['increment_rates'].append(
                    (reporting[fraction['id']]['cumulation'] - base[fraction['id']]['cumulation']) /
                    base[fraction['id']]['cumulation'] if base[fraction['id']]['cumulation'] > Decimal(0.0) else None)

                result['reporting_period_efficiency']['increment_rates_num'].append(
                    (reporting[fraction['id']]['numerator_cumulation'] - base[fraction['id']]['numerator_cumulation']) /
                    base[fraction['id']]['numerator_cumulation']
                    if base[fraction['id']]['numerator_cumulation'] > Decimal(0.0) else None)
                result['reporting_period_efficiency']['increment_rates_den'].append(
                    (reporting[fraction['id']]['denominator_cumulation'] -
                     base[fraction['id']]['denominator_cumulation']) /
                    base[fraction['id']]['denominator_cumulation']
                    if base[fraction['id']]['denominator_cumulation'] > Decimal(0.0) else None)

                rate = list()
                for index, value in enumerate(reporting[fraction['id']]['values']):
                    if index < len(base[fraction['id']]['values']) \
                            and base[fraction['id']]['values'][index] != 0 and value != 0:
                        rate.append((value - base[fraction['id']]['values'][index])
                                    / base[fraction['id']]['values'][index])
                    else:
                        rate.append(None)
                result['reporting_period_efficiency']['rates'].append(rate)

                numerator_rate = list()
                for index, value in enumerate(reporting[fraction['id']]['numerator_values']):
                    if index < len(base[fraction['id']]['numerator_values']) \
                            and base[fraction['id']]['numerator_values'][index] != 0 and value != 0:
                        numerator_rate.append((value - base[fraction['id']]['numerator_values'][index])
                                              / base[fraction['id']]['numerator_values'][index])
                    else:
                        numerator_rate.append(None)
                result['reporting_period_efficiency']['numerator_rates'].append(numerator_rate)

                denominator_rate = list()
                for index, value in enumerate(reporting[fraction['id']]['denominator_values']):
                    if index < len(base[fraction['id']]['denominator_values']) \
                            and base[fraction['id']]['denominator_values'][index] != 0 and value != 0:
                        denominator_rate.append((value - base[fraction['id']]['denominator_values'][index])
                                                / base[fraction['id']]['denominator_values'][index])
                    else:
                        denominator_rate.append(None)
                result['reporting_period_efficiency']['denominator_rates'].append(denominator_rate)

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }
        result['associated_equipment'] = dict()
        result['associated_equipment']['energy_category_names'] = list()
        result['associated_equipment']['units'] = list()
        result['associated_equipment']['associated_equipment_names_array'] = list()
        result['associated_equipment']['subtotals_array'] = list()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['associated_equipment']['energy_category_names'].append(
                    energy_category_dict[energy_category_id]['name'])
                result['associated_equipment']['units'].append(
                    energy_category_dict[energy_category_id]['unit_of_measure'])
                result['associated_equipment']['associated_equipment_names_array'].append(
                    associated_equipment_data[energy_category_id]['associated_equipment_names'])
                result['associated_equipment']['subtotals_array'].append(
                    associated_equipment_data[energy_category_id]['subtotals'])

        # export result to Excel file and then encode the file to base64 string
        result['excel_bytes_base64'] = None
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.combinedequipmentefficiency.export(result,
                                                                  combined_equipment['name'],
                                                                  base_period_start_datetime_local,
                                                                  base_period_end_datetime_local,
                                                                  reporting_period_start_datetime_local,
                                                                  reporting_period_end_datetime_local,
                                                                  period_type,
                                                                  language)

        resp.text = json.dumps(result)
