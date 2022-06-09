import falcon
import simplejson as json
import mysql.connector
import config
from anytree import AnyNode, LevelOrderIter
from datetime import datetime, timedelta, timezone
import excelexporters.offlinemeterbatch


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
    # Step 2: build a space tree
    # Step 3: query all offline meters in the space tree
    # Step 4: query energy categories
    # Step 5: query reporting period energy input
    # Step 6: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        print(req.params)
        space_id = req.params.get('spaceid')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if space_id is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_SPACE_ID')
        else:
            space_id = str.strip(space_id)
            if not space_id.isdigit() or int(space_id) <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_SPACE_ID')
            else:
                space_id = int(space_id)

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

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
            reporting_start_datetime_utc = reporting_start_datetime_utc.replace(tzinfo=timezone.utc) - \
                timedelta(minutes=timezone_offset)

        if reporting_period_end_datetime_local is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
        else:
            reporting_period_end_datetime_local = str.strip(reporting_period_end_datetime_local)
            try:
                reporting_end_datetime_utc = datetime.strptime(reporting_period_end_datetime_local,
                                                               '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
            reporting_end_datetime_utc = reporting_end_datetime_utc.replace(tzinfo=timezone.utc) - \
                timedelta(minutes=timezone_offset)

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
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
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
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
        # Step 3: query all offline meters in the space tree
        ################################################################################################################
        offline_meter_dict = dict()
        space_dict = dict()

        for node in LevelOrderIter(node_dict[space_id]):
            space_dict[node.id] = node.name

        cursor_system_db.execute(" SELECT om.id, om.name AS offline_meter_name, om.energy_category_id, "
                                 "        s.name AS space_name, "
                                 "        cc.name AS cost_center_name"
                                 " FROM tbl_spaces s, tbl_spaces_offline_meters som, "
                                 "      tbl_offline_meters om, tbl_cost_centers cc "
                                 " WHERE s.id IN ( " + ', '.join(map(str, space_dict.keys())) + ") "
                                 " AND som.space_id = s.id AND som.offline_meter_id = om.id "
                                 " AND om.cost_center_id = cc.id  ", )
        rows_offline_meters = cursor_system_db.fetchall()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[0]] = {"offline_meter_name": row[1],
                                              "energy_category_id": row[2],
                                              "space_name": row[3],
                                              "cost_center_name": row[4],
                                              "values": list()}

        ################################################################################################################
        # Step 4: query energy categories
        ################################################################################################################
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()

        # query energy categories in reporting period
        energy_category_set = set()

        if rows_meters is not None and len(rows_meters) > 0:
            for row_meter in rows_meters:
                energy_category_set.add(row_meter[2])

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

            raise falcon.HTTPError(falcon.HTTP_404,
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
        for offline_meter_id in offline_meter_dict:

            cursor_energy_db.execute(" SELECT SUM(actual_value) "
                                     " FROM tbl_offline_meter_hourly "
                                     " WHERE offline_meter_id = %s "
                                     "     AND start_datetime_utc >= %s "
                                     "     AND start_datetime_utc < %s ",
                                     (offline_meter_id,
                                      reporting_start_datetime_utc,
                                      reporting_end_datetime_utc))
            rows_meter_energy = cursor_energy_db.fetchall()
            for energy_category in energy_category_list:
                subtotal = None
                for row_meter_energy in rows_meter_energy:
                    if energy_category['id'] == offline_meter_dict[offline_meter_id]['energy_category_id']:
                        subtotal = row_meter_energy[0]
                        break
                offline_meter_dict[offline_meter_id]['values'].append(subtotal)

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
        offline_meter_list = list()
        for offline_meter_id, offline_meter in offline_meter_dict.items():
            offline_meter_list.append({
                "id": offline_meter_id,
                "offline_meter_name": offline_meter['offline_meter_name'],
                "space_name": offline_meter['space_name'],
                "cost_center_name": offline_meter['cost_center_name'],
                "values": offline_meter['values'],
            })

        result = {'offline_meters': offline_meter_list,
                  'energycategories': energy_category_list}

        # export result to Excel file and then encode the file to base64 string
        result['excel_bytes_base64'] = \
            excelexporters.offlinemeterbatch.export(result,
                                                    space_name,
                                                    reporting_period_start_datetime_local,
                                                    reporting_period_end_datetime_local)
        resp.text = json.dumps(result)
