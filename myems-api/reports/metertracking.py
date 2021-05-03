import falcon
import simplejson as json
import mysql.connector
import config
from anytree import Node, AnyNode, LevelOrderIter
import excelexporters.metertracking
from datetime import datetime, timedelta, timezone


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
    # Step 2: build a space tree
    # Step 3: query all meters in the space tree
    # Step 4: query start value and end value
    # Step 5: construct the report
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

        if reporting_start_datetime_utc + timedelta(minutes=15) >= reporting_end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.THE_REPORTING_PERIOD_MUST_BE_LONGER_THAN_15_MINUTES')

        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor(dictionary=True)

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        cursor_system_db.execute(" SELECT name "
                                 " FROM tbl_spaces "
                                 " WHERE id = %s ", (space_id,))
        row = cursor_system_db.fetchone()

        if row is None:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.SPACE_NOT_FOUND')
        else:
            space_name = row['name']

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
                parent_node = node_dict[row['parent_space_id']] if row['parent_space_id'] is not None else None
                node_dict[row['id']] = AnyNode(id=row['id'], parent=parent_node, name=row['name'])

        ################################################################################################################
        # Step 3: query all meters in the space tree
        ################################################################################################################
        meter_dict = dict()
        space_dict = dict()

        for node in LevelOrderIter(node_dict[space_id]):
            space_dict[node.id] = node.name

        cursor_system_db.execute(" SELECT m.id, m.name AS meter_name, s.name AS space_name, "
                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                 "         m.description "
                                 " FROM tbl_spaces s, tbl_spaces_meters sm, tbl_meters m, tbl_cost_centers cc, "
                                 "      tbl_energy_categories ec "
                                 " WHERE s.id IN ( " + ', '.join(map(str, space_dict.keys())) + ") "
                                 "       AND sm.space_id = s.id AND sm.meter_id = m.id "
                                 "       AND m.cost_center_id = cc.id AND m.energy_category_id = ec.id ", )
        rows_meters = cursor_system_db.fetchall()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row['id']] = {"meter_name": row['meter_name'],
                                         "space_name": row['space_name'],
                                         "cost_center_name": row['cost_center_name'],
                                         "energy_category_name": row['energy_category_name'],
                                         "description": row['description']}

        ################################################################################################################
        # Step 4: query start value and end value
        ################################################################################################################
        for meter_id in meter_dict:
            cursor_system_db.execute(" SELECT point_id "
                                     " FROM tbl_meters_points mp, tbl_points p"
                                     " WHERE p.id = mp.point_id AND p.object_type = 'ENERGY_VALUE' "
                                     "       AND meter_id = %s ", (meter_id, ))

            rows_points_id = cursor_system_db.fetchall()

            start_value = None
            end_value = None

            if rows_points_id is not None and len(rows_points_id) > 0:
                query_start_value = (" SELECT actual_value "
                                     " FROM tbl_energy_value "
                                     " where point_id in ("
                                     + ', '.join(map(lambda x: str(x['point_id']), rows_points_id)) + ") "
                                     " AND utc_date_time BETWEEN %s AND %s "
                                     " order by utc_date_time ASC LIMIT 0,1")
                query_end_value = (" SELECT actual_value "
                                   " FROM tbl_energy_value "
                                   " where point_id in ("
                                   + ', '.join(map(lambda x: str(x['point_id']), rows_points_id)) + ") "
                                   " AND utc_date_time BETWEEN %s AND %s "
                                   " order by utc_date_time DESC LIMIT 0,1")
                cursor_historical.execute(query_start_value,
                                          (reporting_start_datetime_utc,
                                           (reporting_start_datetime_utc + timedelta(minutes=15)), ))
                row_start_value = cursor_historical.fetchone()
                if row_start_value is not None:
                    start_value = row_start_value[0]

                cursor_historical.execute(query_end_value,
                                          ((reporting_end_datetime_utc - timedelta(minutes=15)),
                                           reporting_end_datetime_utc, ))
                row_end_value = cursor_historical.fetchone()

                if row_end_value is not None:
                    end_value = row_end_value[0]

            meter_dict[meter_id]['start_value'] = start_value
            meter_dict[meter_id]['end_value'] = end_value

        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.disconnect()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.disconnect()

        ################################################################################################################
        # Step 5: construct the report
        ################################################################################################################
        meter_list = list()
        for meter_id, meter in meter_dict.items():
            meter_list.append({
                "id": meter_id,
                "meter_name": meter['meter_name'],
                "space_name": meter['space_name'],
                "cost_center_name": meter['cost_center_name'],
                "energy_category_name": meter['energy_category_name'],
                "description": meter['description'],
                "start_value": meter['start_value'],
                "end_value": meter['end_value']
            })

        result = {'meters': meter_list}
        # export result to Excel file and then encode the file to base64 string
        result['excel_bytes_base64'] = \
            excelexporters.metertracking.export(result,
                                                space_name,
                                                reporting_period_start_datetime_local,
                                                reporting_period_end_datetime_local)
        resp.body = json.dumps(result)
