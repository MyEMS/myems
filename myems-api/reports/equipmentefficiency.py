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
    # Step 2: query the equipment
    # Step 3: query energy categories
    # Step 4: query associated constants
    # Step 4: query associated points
    # Step 5: query associated fractions
    # Step 5: query base period energy input
    # Step 6: query base period energy output
    # Step 7: query reporting period energy input
    # Step 8: query reporting period energy output
    # Step 9: query tariff data
    # Step 10: query associated points data
    # Step 11: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        print(req.params)
        equipment_id = req.params.get('equipmentid')
        period_type = req.params.get('periodtype')
        base_start_datetime_local = req.params.get('baseperiodstartdatetime')
        base_end_datetime_local = req.params.get('baseperiodenddatetime')
        reporting_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_end_datetime_local = req.params.get('reportingperiodenddatetime')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if equipment_id is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_EQUIPMENT_ID')
        else:
            equipment_id = str.strip(equipment_id)
            if not equipment_id.isdigit() or int(equipment_id) <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_EQUIPMENT_ID')

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
        # Step 2: query the equipment
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        cursor_system.execute(" SELECT id, name, cost_center_id "
                              " FROM tbl_equipments "
                              " WHERE id = %s ", (equipment_id,))
        row_equipment = cursor_system.fetchone()
        if row_equipment is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.disconnect()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.disconnect()

            if cnx_historical:
                cnx_historical.close()
            if cursor_historical:
                cursor_historical.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND', description='API.EQUIPMENT_NOT_FOUND')

        equipment = dict()
        equipment['id'] = row_equipment[0]
        equipment['name'] = row_equipment[1]
        equipment['cost_center_id'] = row_equipment[2]

        ################################################################################################################
        # Step 3: query input energy categories and output energy categories
        ################################################################################################################
        energy_category_set_input = set()
        energy_category_set_output = set()
        # query input energy categories in base period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_equipment_input_category_hourly "
                              " WHERE equipment_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (equipment['id'], base_start_datetime_utc, base_end_datetime_utc))
        rows_energy_categories = cursor_energy.fetchall()
        if rows_energy_categories is not None or len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set_input.add(row_energy_category[0])

        # query input energy categories in reporting period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_equipment_input_category_hourly "
                              " WHERE equipment_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (equipment['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_energy_categories = cursor_energy.fetchall()
        if rows_energy_categories is not None or len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set_input.add(row_energy_category[0])

        # query output energy categories in base period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_equipment_output_category_hourly "
                              " WHERE equipment_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (equipment['id'], base_start_datetime_utc, base_end_datetime_utc))
        rows_energy_categories = cursor_energy.fetchall()
        if rows_energy_categories is not None or len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set_output.add(row_energy_category[0])

        # query output energy categories in reporting period
        cursor_energy.execute(" SELECT DISTINCT(energy_category_id) "
                              " FROM tbl_equipment_output_category_hourly "
                              " WHERE equipment_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (equipment['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_energy_categories = cursor_energy.fetchall()
        if rows_energy_categories is not None or len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set_output.add(row_energy_category[0])

        # query properties of all energy categories above
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

            if cnx_historical:
                cnx_historical.close()
            if cursor_historical:
                cursor_historical.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')
        energy_category_dict = dict()
        for row_energy_category in rows_energy_categories:
            if row_energy_category[0] in energy_category_set_input or \
                    row_energy_category[0] in energy_category_set_output:
                energy_category_dict[row_energy_category[0]] = {"name": row_energy_category[1],
                                                                "unit_of_measure": row_energy_category[2],
                                                                "kgce": row_energy_category[3],
                                                                "kgco2e": row_energy_category[4]}

        ################################################################################################################
        # Step 4: query associated points
        ################################################################################################################
        point_list = list()
        cursor_system.execute(" SELECT p.id, p.name, p.units, p.object_type  "
                              " FROM tbl_equipments e, tbl_equipments_parameters ep, tbl_points p "
                              " WHERE e.id = %s AND e.id = ep.equipment_id AND ep.parameter_type = 'point' "
                              "       AND ep.point_id = p.id "
                              " ORDER BY p.id ", (equipment['id'],))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row in rows_points:
                point_list.append({"id": row[0], "name": row[1], "units": row[2], "object_type": row[3]})

        ################################################################################################################
        # Step 5: query base period energy input
        ################################################################################################################
        base_input = dict()
        if energy_category_set_input is not None and len(energy_category_set_input) > 0:
            for energy_category_id in energy_category_set_input:
                base_input[energy_category_id] = dict()
                base_input[energy_category_id]['timestamps'] = list()
                base_input[energy_category_id]['values'] = list()
                base_input[energy_category_id]['subtotal'] = Decimal(0.0)

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
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    actual_value = Decimal(0.0) if row_equipment_periodically[1] is None \
                        else row_equipment_periodically[1]
                    base_input[energy_category_id]['timestamps'].append(current_datetime)
                    base_input[energy_category_id]['values'].append(actual_value)
                    base_input[energy_category_id]['subtotal'] += actual_value

        ################################################################################################################
        # Step 6: query base period energy output
        ################################################################################################################
        base_output = dict()
        if energy_category_set_output is not None and len(energy_category_set_output) > 0:
            for energy_category_id in energy_category_set_output:
                base_output[energy_category_id] = dict()
                base_output[energy_category_id]['timestamps'] = list()
                base_output[energy_category_id]['values'] = list()
                base_output[energy_category_id]['subtotal'] = Decimal(0.0)

                cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                      " FROM tbl_equipment_output_category_hourly "
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
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    actual_value = Decimal(0.0) if row_equipment_periodically[1] is None \
                        else row_equipment_periodically[1]
                    base_output[energy_category_id]['timestamps'].append(current_datetime)
                    base_output[energy_category_id]['values'].append(actual_value)
                    base_output[energy_category_id]['subtotal'] += actual_value
        ################################################################################################################
        # Step 7: query reporting period energy input
        ################################################################################################################
        reporting_input = dict()
        if energy_category_set_input is not None and len(energy_category_set_input) > 0:
            for energy_category_id in energy_category_set_input:

                reporting_input[energy_category_id] = dict()
                reporting_input[energy_category_id]['timestamps'] = list()
                reporting_input[energy_category_id]['values'] = list()
                reporting_input[energy_category_id]['subtotal'] = Decimal(0.0)

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
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    actual_value = Decimal(0.0) if row_equipment_periodically[1] is None \
                        else row_equipment_periodically[1]
                    reporting_input[energy_category_id]['timestamps'].append(current_datetime)
                    reporting_input[energy_category_id]['values'].append(actual_value)
                    reporting_input[energy_category_id]['subtotal'] += actual_value

        ################################################################################################################
        # Step 8: query reporting period energy output
        ################################################################################################################
        reporting_output = dict()
        if energy_category_set_output is not None and len(energy_category_set_output) > 0:
            for energy_category_id in energy_category_set_output:

                reporting_output[energy_category_id] = dict()
                reporting_output[energy_category_id]['timestamps'] = list()
                reporting_output[energy_category_id]['values'] = list()
                reporting_output[energy_category_id]['subtotal'] = Decimal(0.0)

                cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                      " FROM tbl_equipment_output_category_hourly "
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
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    actual_value = Decimal(0.0) if row_equipment_periodically[1] is None \
                        else row_equipment_periodically[1]
                    reporting_output[energy_category_id]['timestamps'].append(current_datetime)
                    reporting_output[energy_category_id]['values'].append(actual_value)
                    reporting_output[energy_category_id]['subtotal'] += actual_value

        ################################################################################################################
        # Step 9: query tariff data
        ################################################################################################################
        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()
        if energy_category_set_input is not None and len(energy_category_set_input) > 0:
            for energy_category_id in energy_category_set_input:
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

                parameters_data['names'].append('TARIFF-' + energy_category_dict[energy_category_id]['name'])
                parameters_data['timestamps'].append(tariff_timestamp_list)
                parameters_data['values'].append(tariff_value_list)

        ################################################################################################################
        # Step 10: query associated sensors and points data
        ################################################################################################################
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
        # Step 11: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.disconnect()

        if cursor_energy:
            cursor_energy.close()
        if cnx_energy:
            cnx_energy.disconnect()

        result = dict()

        result['equipment'] = dict()
        result['equipment']['name'] = equipment['name']

        result['base_period_input'] = dict()
        result['base_period_input']['names'] = list()
        result['base_period_input']['units'] = list()
        result['base_period_input']['timestamps'] = list()
        result['base_period_input']['values'] = list()
        result['base_period_input']['subtotals'] = list()
        if energy_category_set_input is not None and len(energy_category_set_input) > 0:
            for energy_category_id in energy_category_set_input:
                result['base_period_input']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['base_period_input']['units'].append(energy_category_dict[energy_category_id]['unit_of_measure'])
                result['base_period_input']['timestamps'].append(base_input[energy_category_id]['timestamps'])
                result['base_period_input']['values'].append(base_input[energy_category_id]['values'])
                result['base_period_input']['subtotals'].append(base_input[energy_category_id]['subtotal'])

        result['base_period_output'] = dict()
        result['base_period_output']['names'] = list()
        result['base_period_output']['units'] = list()
        result['base_period_output']['timestamps'] = list()
        result['base_period_output']['values'] = list()
        result['base_period_output']['subtotals'] = list()

        if energy_category_set_output is not None and len(energy_category_set_output) > 0:
            for energy_category_id in energy_category_set_output:
                result['base_period_output']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['base_period_output']['units'].append(
                    energy_category_dict[energy_category_id]['unit_of_measure'])
                result['base_period_output']['timestamps'].append(base_output[energy_category_id]['timestamps'])
                result['base_period_output']['values'].append(base_output[energy_category_id]['values'])
                result['base_period_output']['subtotals'].append(base_output[energy_category_id]['subtotal'])

        result['base_period_efficiency'] = dict()
        result['base_period_efficiency']['names'] = list()
        result['base_period_efficiency']['units'] = list()
        result['base_period_efficiency']['timestamps'] = list()
        result['base_period_efficiency']['values'] = list()
        result['base_period_efficiency']['cumulations'] = list()

        if energy_category_set_output is not None and len(energy_category_set_output) > 0:
            for energy_category_id_output in energy_category_set_output:
                for energy_category_id_input in energy_category_set_input:
                    result['base_period_efficiency']['names'].append(
                        energy_category_dict[energy_category_id_output]['name'] + '/' +
                        energy_category_dict[energy_category_id_input]['name'])
                    result['base_period_efficiency']['units'].append(
                        energy_category_dict[energy_category_id_output]['unit_of_measure'] + '/' +
                        energy_category_dict[energy_category_id_input]['unit_of_measure'])
                    result['base_period_efficiency']['timestamps'].append(
                        base_output[energy_category_id_output]['timestamps'])
                    efficiency_values = list()
                    for i in range(len(base_output[energy_category_id_output]['timestamps'])):
                        efficiency_values.append((base_output[energy_category_id_output]['values'][i] /
                                                  base_input[energy_category_id_input]['values'][i])
                                                 if base_input[energy_category_id_input]['values'][i] > Decimal(0.0)
                                                 else None)
                    result['base_period_efficiency']['values'].append(efficiency_values)

                    base_cumulation = (base_output[energy_category_id_output]['subtotal'] /
                                       base_input[energy_category_id_input]['subtotal']) if \
                        base_input[energy_category_id_input]['subtotal'] > Decimal(0.0) else None
                    result['base_period_efficiency']['cumulations'].append(base_cumulation)

        result['reporting_period_input'] = dict()
        result['reporting_period_input']['names'] = list()
        result['reporting_period_input']['energy_category_ids'] = list()
        result['reporting_period_input']['units'] = list()
        result['reporting_period_input']['timestamps'] = list()
        result['reporting_period_input']['values'] = list()
        result['reporting_period_input']['subtotals'] = list()
        result['reporting_period_input']['increment_rates'] = list()

        if energy_category_set_input is not None and len(energy_category_set_input) > 0:
            for energy_category_id in energy_category_set_input:
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
                result['reporting_period_input']['increment_rates'].append(
                    (reporting_input[energy_category_id]['subtotal'] -
                     base_input[energy_category_id]['subtotal']) /
                    base_input[energy_category_id]['subtotal']
                    if base_input[energy_category_id]['subtotal'] > 0.0 else None)

        result['reporting_period_output'] = dict()
        result['reporting_period_output']['names'] = list()
        result['reporting_period_output']['energy_category_ids'] = list()
        result['reporting_period_output']['units'] = list()
        result['reporting_period_output']['timestamps'] = list()
        result['reporting_period_output']['values'] = list()
        result['reporting_period_output']['subtotals'] = list()
        result['reporting_period_output']['increment_rates'] = list()

        if energy_category_set_output is not None and len(energy_category_set_output) > 0:
            for energy_category_id in energy_category_set_output:
                result['reporting_period_output']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['reporting_period_output']['energy_category_ids'].append(energy_category_id)
                result['reporting_period_output']['units'].append(
                    energy_category_dict[energy_category_id]['unit_of_measure'])
                result['reporting_period_output']['timestamps'].append(
                    reporting_output[energy_category_id]['timestamps'])
                result['reporting_period_output']['values'].append(reporting_output[energy_category_id]['values'])
                result['reporting_period_output']['subtotals'].append(reporting_output[energy_category_id]['subtotal'])
                result['reporting_period_output']['increment_rates'].append(
                    (reporting_output[energy_category_id]['subtotal'] -
                     base_output[energy_category_id]['subtotal']) /
                    base_output[energy_category_id]['subtotal']
                    if base_output[energy_category_id]['subtotal'] > 0.0 else None)

        result['reporting_period_efficiency'] = dict()
        result['reporting_period_efficiency']['names'] = list()
        result['reporting_period_efficiency']['units'] = list()
        result['reporting_period_efficiency']['timestamps'] = list()
        result['reporting_period_efficiency']['values'] = list()
        result['reporting_period_efficiency']['cumulations'] = list()
        result['reporting_period_efficiency']['increment_rates'] = list()

        if energy_category_set_output is not None and len(energy_category_set_output) > 0:
            for energy_category_id_output in energy_category_set_output:
                for energy_category_id_input in energy_category_set_input:
                    result['reporting_period_efficiency']['names'].append(
                        energy_category_dict[energy_category_id_output]['name'] + '/' +
                        energy_category_dict[energy_category_id_input]['name'])
                    result['reporting_period_efficiency']['units'].append(
                        energy_category_dict[energy_category_id_output]['unit_of_measure'] + '/' +
                        energy_category_dict[energy_category_id_input]['unit_of_measure'])
                    result['reporting_period_efficiency']['timestamps'].append(
                        reporting_output[energy_category_id_output]['timestamps'])
                    efficiency_values = list()
                    for i in range(len(reporting_output[energy_category_id_output]['timestamps'])):
                        efficiency_values.append((reporting_output[energy_category_id_output]['values'][i] /
                                                 reporting_input[energy_category_id_input]['values'][i])
                                                 if reporting_input[energy_category_id_input]['values'][i] >
                                                 Decimal(0.0) else None)
                    result['reporting_period_efficiency']['values'].append(efficiency_values)

                    base_cumulation = (base_output[energy_category_id_output]['subtotal'] /
                                       base_input[energy_category_id_input]['subtotal']) if \
                        base_input[energy_category_id_input]['subtotal'] > Decimal(0.0) else None

                    reporting_cumulation = (reporting_output[energy_category_id_output]['subtotal'] /
                                            reporting_input[energy_category_id_input]['subtotal']) if \
                        reporting_input[energy_category_id_input]['subtotal'] > Decimal(0.0) else None

                    result['reporting_period_efficiency']['cumulations'].append(reporting_cumulation)
                    result['reporting_period_efficiency']['increment_rates'].append(
                        ((reporting_cumulation - base_cumulation) / base_cumulation if (base_cumulation is not None and
                                                                                        base_cumulation > Decimal(0.0))
                         else None)
                    )

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }

        resp.body = json.dumps(result)
