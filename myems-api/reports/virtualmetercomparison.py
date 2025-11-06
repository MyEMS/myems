"""
Virtual Meter Comparison Report API

This module provides REST API endpoints for generating virtual meter comparison reports.
It compares energy consumption data between different virtual meters or time periods,
providing insights into performance differences and optimization opportunities.

Key Features:
- Virtual Meter-to-Virtual Meter comparison analysis
- Time period comparison
- Performance difference identification
- Comparative metrics calculation
- Excel export functionality
- Benchmarking insights

Report Components:
- Virtual Meter comparison summary
- Performance difference analysis
- Comparative metrics and KPIs
- Benchmarking data
- Performance gap identification
- Optimization recommendations

The module uses Falcon framework for REST API and includes:
- Database queries for comparison data
- Comparative analysis algorithms
- Performance benchmarking tools
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
import excelexporters.virtualmetercomparison  # 对应虚拟表Excel导出模块
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
    # Step 2: query the virtual meter and energy category
    # Step 3: parse equation and get associated points
    # Step 4: query reporting period energy consumption
    # Step 5: construct the report
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
        # this procedure accepts virtual meter id or virtual meter uuid to identify a virtual meter
        virtual_meter_id1 = req.params.get('virtualmeterid1')
        virtual_meter_uuid1 = req.params.get('virtualmeteruuid1')
        virtual_meter_id2 = req.params.get('virtualmeterid2')
        virtual_meter_uuid2 = req.params.get('virtualmeteruuid2')
        period_type = req.params.get('periodtype')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if virtual_meter_id1 is None and virtual_meter_uuid1 is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_VIRTUAL_METER_ID')

        if virtual_meter_id1 is not None:
            virtual_meter_id1 = str.strip(virtual_meter_id1)
            if not virtual_meter_id1.isdigit() or int(virtual_meter_id1) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VIRTUAL_METER_ID')

        if virtual_meter_uuid1 is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(virtual_meter_uuid1))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VIRTUAL_METER_UUID')

        if virtual_meter_id2 is None and virtual_meter_uuid2 is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_VIRTUAL_METER_ID')

        if virtual_meter_id2 is not None:
            virtual_meter_id2 = str.strip(virtual_meter_id2)
            if not virtual_meter_id2.isdigit() or int(virtual_meter_id2) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VIRTUAL_METER_ID')

        if virtual_meter_uuid2 is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(virtual_meter_uuid2))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_VIRTUAL_METER_UUID')

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
                                                               '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
            reporting_end_datetime_utc = reporting_end_datetime_utc.replace(tzinfo=timezone.utc) - \
                timedelta(minutes=timezone_offset)

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPORTING_PERIOD_END_DATETIME')

        # if turn quick mode on, do not return parameters data and excel file
        is_quick_mode = False
        if quick_mode is not None and \
                len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

        ################################################################################################################
        # Step 2: query the virtual meter and energy category
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(** config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if virtual_meter_id1 is not None:
            cursor_system.execute(" SELECT vm.id, vm.name, vm.energy_category_id, ec.name, ec.unit_of_measure, vm.equation "
                                  " FROM tbl_virtual_meters vm, tbl_energy_categories ec "
                                  " WHERE vm.id = %s AND vm.energy_category_id = ec.id ", (virtual_meter_id1,))
            row_virtual_meter1 = cursor_system.fetchone()
        elif virtual_meter_uuid1 is not None:
            cursor_system.execute(" SELECT vm.id, vm.name, vm.energy_category_id, ec.name, ec.unit_of_measure, vm.equation "
                                  " FROM tbl_virtual_meters vm, tbl_energy_categories ec "
                                  " WHERE vm.uuid = %s AND vm.energy_category_id = ec.id ", (virtual_meter_uuid1,))
            row_virtual_meter1 = cursor_system.fetchone()

        if row_virtual_meter1 is None:
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
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.VIRTUAL_METER_NOT_FOUND')

        virtual_meter1 = dict()
        virtual_meter1['id'] = row_virtual_meter1[0]
        virtual_meter1['name'] = row_virtual_meter1[1]
        virtual_meter1['energy_category_id'] = row_virtual_meter1[2]
        virtual_meter1['energy_category_name'] = row_virtual_meter1[3]
        virtual_meter1['unit_of_measure'] = row_virtual_meter1[4]
        virtual_meter1['equation'] = row_virtual_meter1[5]  

        if virtual_meter_id2 is not None:
            cursor_system.execute(" SELECT vm.id, vm.name, vm.energy_category_id, ec.name, ec.unit_of_measure, vm.equation "
                                  " FROM tbl_virtual_meters vm, tbl_energy_categories ec "
                                  " WHERE vm.id = %s AND vm.energy_category_id = ec.id ", (virtual_meter_id2,))
            row_virtual_meter2 = cursor_system.fetchone()
        elif virtual_meter_uuid2 is not None:
            cursor_system.execute(" SELECT vm.id, vm.name, vm.energy_category_id, ec.name, ec.unit_of_measure, vm.equation "
                                  " FROM tbl_virtual_meters vm, tbl_energy_categories ec "
                                  " WHERE vm.uuid = %s AND vm.energy_category_id = ec.id ", (virtual_meter_uuid2,))
            row_virtual_meter2 = cursor_system.fetchone()

        if row_virtual_meter2 is None:
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
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND', description='API.VIRTUAL_METER_NOT_FOUND')

        virtual_meter2 = dict()
        virtual_meter2['id'] = row_virtual_meter2[0]
        virtual_meter2['name'] = row_virtual_meter2[1]
        virtual_meter2['energy_category_id'] = row_virtual_meter2[2]
        virtual_meter2['energy_category_name'] = row_virtual_meter2[3]
        virtual_meter2['unit_of_measure'] = row_virtual_meter2[4]
        virtual_meter2['equation'] = row_virtual_meter2[5]  

        ################################################################################################################
        # Step 3: parse equation and get associated points 
        ################################################################################################################
        def parse_equation_and_get_points(equation, cursor_system):
            if not equation:
                return []
            variables = re.findall(r'x\d+', equation)  
            if not variables:
                return []
            unique_vars = list(set(variables))
           
            placeholders = ', '.join(['%s'] * len(unique_vars))
            cursor_system.execute(f" SELECT p.id, p.name, p.units, p.object_type "
                                  f" FROM tbl_points p "
                                  f" WHERE p.name IN ({placeholders}) ", tuple(unique_vars))
            rows = cursor_system.fetchall()
            return [{"id": row[0], "name": row[1], "units": row[2], "object_type": row[3]} for row in rows]

        point_list1 = parse_equation_and_get_points(virtual_meter1['equation'], cursor_system)
        point_list2 = parse_equation_and_get_points(virtual_meter2['equation'], cursor_system)

        ################################################################################################################
        # Step 4: query reporting period energy consumption
        ################################################################################################################
        query1 = (" SELECT start_datetime_utc, actual_value "
                  " FROM tbl_virtual_meter_hourly "
                  " WHERE virtual_meter_id = %s "
                  " AND start_datetime_utc >= %s "
                  " AND start_datetime_utc < %s "
                  " ORDER BY start_datetime_utc ")
        cursor_energy.execute(query1, (virtual_meter1['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_virtual_meter1_hourly = cursor_energy.fetchall()

        rows_virtual_meter1_periodically = utilities.aggregate_hourly_data_by_period(rows_virtual_meter1_hourly,
                                                                                     reporting_start_datetime_utc,
                                                                                     reporting_end_datetime_utc,
                                                                                     period_type)
        reporting1 = dict()
        reporting1['timestamps'] = list()
        reporting1['values'] = list()
        reporting1['total_in_category'] = Decimal(0.0)

        for row_virtual_meter1_periodically in rows_virtual_meter1_periodically:
            current_datetime_local = row_virtual_meter1_periodically[0].replace(tzinfo=timezone.utc) + \
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

            actual_value = Decimal(0.0) if row_virtual_meter1_periodically[1] is None else row_virtual_meter1_periodically[1]

            reporting1['timestamps'].append(current_datetime)
            reporting1['values'].append(actual_value)
            reporting1['total_in_category'] += actual_value

        query2 = (" SELECT start_datetime_utc, actual_value "
                  " FROM tbl_virtual_meter_hourly "
                  " WHERE virtual_meter_id = %s "
                  " AND start_datetime_utc >= %s "
                  " AND start_datetime_utc < %s "
                  " ORDER BY start_datetime_utc ")
        cursor_energy.execute(query2, (virtual_meter2['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_virtual_meter2_hourly = cursor_energy.fetchall()

        rows_virtual_meter2_periodically = utilities.aggregate_hourly_data_by_period(rows_virtual_meter2_hourly,
                                                                                     reporting_start_datetime_utc,
                                                                                     reporting_end_datetime_utc,
                                                                                     period_type)
        reporting2 = dict()
        diff = dict()
        reporting2['timestamps'] = list()
        reporting2['values'] = list()
        reporting2['total_in_category'] = Decimal(0.0)
        diff['values'] = list()
        diff['total_in_category'] = Decimal(0.0)

        for row_virtual_meter2_periodically in rows_virtual_meter2_periodically:
            current_datetime_local = row_virtual_meter2_periodically[0].replace(tzinfo=timezone.utc) + \
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

            actual_value = Decimal(0.0) if row_virtual_meter2_periodically[1] is None else row_virtual_meter2_periodically[1]

            reporting2['timestamps'].append(current_datetime)
            reporting2['values'].append(actual_value)
            reporting2['total_in_category'] += actual_value

        for virtual_meter1_value, virtual_meter2_value in zip(reporting1['values'], reporting2['values']):
            diff['values'].append(virtual_meter1_value - virtual_meter2_value)
            diff['total_in_category'] += virtual_meter1_value - virtual_meter2_value

        ################################################################################################################
        # Step 5: construct the report
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

        result = {
            "virtualmeter1": {
                "name": virtual_meter1['name'],
                "energy_category_id": virtual_meter1['energy_category_id'],
                "energy_category_name": virtual_meter1['energy_category_name'],
                "unit_of_measure": virtual_meter1['unit_of_measure'],
                "equation": virtual_meter1['equation']  # 新增：返回方程式
            },
            "reporting_period1": {
                "total_in_category": reporting1['total_in_category'],
                "timestamps": reporting1['timestamps'],
                "values": reporting1['values'],
            },
            "virtualmeter2": {
                "name": virtual_meter2['name'],
                "energy_category_id": virtual_meter2['energy_category_id'],
                "energy_category_name": virtual_meter2['energy_category_name'],
                "unit_of_measure": virtual_meter2['unit_of_measure'],
                "equation": virtual_meter2['equation'] 
            },
            "reporting_period2": {
                "total_in_category": reporting2['total_in_category'],
                "timestamps": reporting2['timestamps'],
                "values": reporting2['values'],
            },

            "diff": {
                "values": diff['values'],
                "total_in_category": diff['total_in_category'],
            }
        }
        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.virtualmetercomparison.export(result,
                                                             virtual_meter1['name'],
                                                             virtual_meter2['name'],
                                                             reporting_period_start_datetime_local,
                                                             reporting_period_end_datetime_local,
                                                             period_type,
                                                             language)

        resp.text = json.dumps(result)
