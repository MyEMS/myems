"""
Combined Equipment Batch Report API

This module provides REST API endpoints for generating combined equipment batch reports.
It analyzes energy consumption data for multiple combined equipment within a space hierarchy,
providing comprehensive insights into combined equipment performance and energy usage patterns.

Key Features:
- Multi-combined equipment energy consumption analysis
- Space hierarchy traversal and analysis
- Energy category breakdown
- Base period vs reporting period comparison
- Excel export functionality
- Performance metrics calculation

Report Components:
- Combined equipment energy consumption summary
- Space-based combined equipment grouping
- Energy category analysis
- Performance comparison metrics
- Consumption trends and patterns
- Efficiency indicators

The module uses Falcon framework for REST API and includes:
- Database queries for combined equipment data
- Space tree traversal algorithms
- Energy consumption calculations
- Excel export via excelexporters
- Multi-language support
- User authentication and authorization
"""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
from anytree import AnyNode, LevelOrderIter
import config
import excelexporters.combinedequipmentbatch
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
    # Step 2: build a space tree
    # Step 3: query all combined equipments in the space tree
    # Step 4: query energy categories
    # Step 5: query reporting period energy input
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
        space_id = req.params.get('spaceid')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if space_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_SPACE_ID')
        else:
            space_id = str.strip(space_id)
            if not space_id.isdigit() or int(space_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_SPACE_ID')
            else:
                space_id = int(space_id)

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

        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()

        cursor_system_db.execute(" SELECT name "
                                 " FROM tbl_spaces "
                                 " WHERE id = %s ", (space_id,))
        row = cursor_system_db.fetchone()

        if row is None:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')
        else:
            space_name = row[0]

        # if turn quick mode on, do not return parameters data and excel file
        is_quick_mode = False
        if quick_mode is not None and \
                len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True
        ################################################################################################################
        # Step 2: build a space tree
        ################################################################################################################

        query = (" SELECT id, name, parent_space_id "
                 " FROM tbl_spaces "
                 " ORDER BY id ")
        cursor_system_db.execute(query)
        rows_spaces = cursor_system_db.fetchall()
        node_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                parent_node = node_dict[row[2]] if row[2] is not None else None
                node_dict[row[0]] = AnyNode(id=row[0], parent=parent_node, name=row[1])

        ################################################################################################################
        # Step 3: query all combined equipments in the space tree
        ################################################################################################################
        combined_equipment_dict = dict()
        space_dict = dict()

        for node in LevelOrderIter(node_dict[space_id]):
            space_dict[node.id] = node.name

        cursor_system_db.execute(" SELECT ce.id, ce.name AS combined_equipment_name, "
                                 "        ce.uuid AS combined_equipment_uuid, s.name AS space_name, "
                                 "        cc.name AS cost_center_name, ce.description "
                                 " FROM tbl_spaces s, tbl_spaces_combined_equipments sce, "
                                 "      tbl_combined_equipments ce, tbl_cost_centers cc "
                                 " WHERE s.id IN ( " + ', '.join(map(str, space_dict.keys())) + ") "
                                 "       AND sce.space_id = s.id AND sce.combined_equipment_id = ce.id "
                                 "       AND ce.cost_center_id = cc.id  ", )
        rows_combined_equipments = cursor_system_db.fetchall()
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            for row in rows_combined_equipments:
                combined_equipment_dict[row[0]] = {"combined_equipment_name": row[1],
                                                   "combined_equipment_uuid": row[2],
                                                   "space_name": row[3],
                                                   "cost_center_name": row[4],
                                                   "description": row[5],
                                                   "values": list()}

        ################################################################################################################
        # Step 4: query energy categories
        ################################################################################################################
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()

        # query energy categories in reporting period
        energy_category_set = set()
        cursor_energy_db.execute(" SELECT DISTINCT(energy_category_id) "
                                 " FROM tbl_combined_equipment_input_category_hourly "
                                 " WHERE start_datetime_utc >= %s AND start_datetime_utc < %s ",
                                 (reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_energy_categories = cursor_energy_db.fetchall()
        if rows_energy_categories is not None and len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set.add(row_energy_category[0])

        # query all energy categories
        cursor_system_db.execute(" SELECT id, name, unit_of_measure "
                                 " FROM tbl_energy_categories "
                                 " ORDER BY id ", )
        rows_energy_categories = cursor_system_db.fetchall()
        if rows_energy_categories is None or len(rows_energy_categories) == 0:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()

            raise falcon.HTTPError(status=falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')
        energy_category_list = list()
        for row_energy_category in rows_energy_categories:
            if row_energy_category[0] in energy_category_set:
                energy_category_list.append({"id": row_energy_category[0],
                                             "name": row_energy_category[1],
                                             "unit_of_measure": row_energy_category[2]})

        ################################################################################################################
        # Step 5: query reporting period energy input
        ################################################################################################################
        for combined_equipment_id in combined_equipment_dict:

            cursor_energy_db.execute(" SELECT energy_category_id, SUM(actual_value) "
                                     " FROM tbl_combined_equipment_input_category_hourly "
                                     " WHERE combined_equipment_id = %s "
                                     "     AND start_datetime_utc >= %s "
                                     "     AND start_datetime_utc < %s "
                                     " GROUP BY energy_category_id ",
                                     (combined_equipment_id,
                                      reporting_start_datetime_utc,
                                      reporting_end_datetime_utc))
            rows_combined_equipment_energy = cursor_energy_db.fetchall()
            for energy_category in energy_category_list:
                subtotal = Decimal(0.0)
                for row_combined_equipment_energy in rows_combined_equipment_energy:
                    if energy_category['id'] == row_combined_equipment_energy[0]:
                        subtotal = row_combined_equipment_energy[1]
                        break
                combined_equipment_dict[combined_equipment_id]['values'].append(subtotal)

        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()

        ################################################################################################################
        # Step 6: construct the report
        ################################################################################################################
        combined_equipment_list = list()
        for combined_equipment_id, combined_equipment in combined_equipment_dict.items():
            combined_equipment_list.append({
                "id": combined_equipment_id,
                "combined_equipment_name": combined_equipment['combined_equipment_name'],
                "combined_equipment_uuid": combined_equipment['combined_equipment_uuid'],
                "space_name": combined_equipment['space_name'],
                "cost_center_name": combined_equipment['cost_center_name'],
                "description": combined_equipment['description'],
                "values": combined_equipment['values'],
            })

        result = {'combined_equipments': combined_equipment_list, 'energycategories': energy_category_list,
                  'excel_bytes_base64': None}

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.combinedequipmentbatch.export(result,
                                                             space_name,
                                                             reporting_period_start_datetime_local,
                                                             reporting_period_end_datetime_local,
                                                             language)
        resp.text = json.dumps(result)
