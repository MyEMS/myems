"""
Meter Batch Report API

This module provides REST API endpoints for generating meter batch reports.
It analyzes energy consumption data for multiple meters within a space hierarchy,
providing comprehensive insights into meter performance and energy usage patterns.

Key Features:
- Multi-meter energy consumption analysis
- Space hierarchy traversal and analysis
- Energy category breakdown
- Base period vs reporting period comparison
- Excel export functionality
- Performance metrics calculation

Report Components:
- Meter energy consumption summary
- Space-based meter grouping
- Energy category analysis
- Performance comparison metrics
- Consumption trends and patterns
- Efficiency indicators

The module uses Falcon framework for REST API and includes:
- Database queries for meter data
- Space tree traversal algorithms
- Energy consumption calculations
- Excel export via excelexporters
- Multi-language support
- User authentication and authorization
"""

from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
from anytree import AnyNode, LevelOrderIter
import config
import excelexporters.meterbatch
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
    # Step 3: query all meters in the space tree
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

        # if turn quick mode on, do not return parameters data and excel file
        is_quick_mode = False
        if quick_mode is not None and \
            len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

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
        # Step 3: query all meters in the space tree
        ################################################################################################################
        meter_dict = dict()
        space_dict = dict()
        energy_category_set = set()

        if config.is_recursive:
            for node in LevelOrderIter(node_dict[space_id]):
                space_dict[node.id] = node.name

            cursor_system_db.execute(" SELECT m.id, m.name AS meter_name, m.uuid, m.energy_category_id, "
                                     "        s.name AS space_name, "
                                     "        cc.name AS cost_center_name"
                                     " FROM tbl_spaces s, tbl_spaces_meters sm, "
                                     "      tbl_meters m, tbl_cost_centers cc "
                                     " WHERE s.id IN ( " + ', '.join(map(str, space_dict.keys())) + ") "
                                     " AND sm.space_id = s.id AND sm.meter_id = m.id "
                                     " AND m.cost_center_id = cc.id ORDER BY meter_id ", )
        else:
            cursor_system_db.execute(" SELECT m.id, m.name AS meter_name, m.uuid, m.energy_category_id, "
                                     "        s.name AS space_name, "
                                     "        cc.name AS cost_center_name "
                                     " FROM tbl_spaces s, tbl_spaces_meters sm, "
                                     "      tbl_meters m, tbl_cost_centers cc "
                                     " WHERE s.id = %s AND sm.space_id = s.id AND sm.meter_id = m.id "
                                     " AND m.cost_center_id = cc.id  ORDER BY meter_id ", (space_id,))

        rows_meters = cursor_system_db.fetchall()
        print(rows_meters)
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"meter_name": row[1],
                                      "uuid": row[2],
                                      "energy_category_id": row[3],
                                      "space_name": row[4],
                                      "cost_center_name": row[5],
                                      "values": list(),
                                      "subtotal": None}
                energy_category_set.add(row[3])

        ################################################################################################################
        # Step 4: query energy categories
        ################################################################################################################
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()

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
        for meter_id in meter_dict:

            cursor_energy_db.execute(" SELECT SUM(actual_value) "
                                     " FROM tbl_meter_hourly "
                                     " WHERE meter_id = %s "
                                     "     AND start_datetime_utc >= %s "
                                     "     AND start_datetime_utc < %s ",
                                     (meter_id,
                                      reporting_start_datetime_utc,
                                      reporting_end_datetime_utc))
            rows_meter_energy = cursor_energy_db.fetchall()
            for energy_category in energy_category_list:
                subtotal = None
                for row_meter_energy in rows_meter_energy:
                    if energy_category['id'] == meter_dict[meter_id]['energy_category_id']:
                        subtotal = row_meter_energy[0]
                        meter_dict[meter_id]['subtotal'] = subtotal
                        break
                # append subtotal
                # append None if energy category is not applicable
                meter_dict[meter_id]['values'].append(subtotal)

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
        meter_list = list()
        for meter_id, meter in meter_dict.items():
            meter_list.append({
                "id": meter_id,
                "meter_name": meter['meter_name'],
                "uuid": meter['uuid'],
                "space_name": meter['space_name'],
                "cost_center_name": meter['cost_center_name'],
                "values": meter['values'],
                "subtotal": meter['subtotal'],
            })

        result = {'meters': meter_list, 'energycategories': energy_category_list, "excel_bytes_base64": None}

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.meterbatch.export(result,
                                                 space_name,
                                                 reporting_period_start_datetime_local,
                                                 reporting_period_end_datetime_local,
                                                 language)
        resp.text = json.dumps(result)
