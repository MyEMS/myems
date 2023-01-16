from datetime import datetime, timedelta, timezone
from decimal import Decimal

import falcon
import mysql.connector
import simplejson as json
from anytree import AnyNode, LevelOrderIter

import config
import excelexporters.metertracking


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
    # Step 3: query all meters in the space tree
    # Step 4: query start value and end value
    # Step 5: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        print(req.params)
        space_id = req.params.get('spaceid')
        energy_category = req.params.get('energyCategory')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

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

        if energy_category is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_CATEGORY_ID')
        else:
            if energy_category == 'all':
                energy_category_query = ""
                energy_category_name = None
            else:
                energy_category = str.strip(energy_category)
                if not energy_category.isdigit() or int(energy_category) <= 0:
                    raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_ENERGY_CATEGORY_ID')
                else:
                    cnx_system_db = mysql.connector.connect(**config.myems_system_db)
                    cursor_system_db = cnx_system_db.cursor()
                    energy_category_query = "AND m.energy_category_id = '" + energy_category + "' "
                    cursor_system_db.execute(" SELECT name "
                                             " FROM tbl_energy_categories "
                                             " WHERE id = %s ", (energy_category,))
                    row = cursor_system_db.fetchone()

                    if row is None:
                        if cursor_system_db:
                            cursor_system_db.close()
                        if cnx_system_db:
                            cnx_system_db.close()
                        raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                               description='API.ENERGY_CATEGORY_NOT_FOUND')
                    else:
                        energy_category_name = row[0]

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

        # if turn quick mode on, do not return parameters data and excel file
        is_quick_mode = False
        if quick_mode is not None and \
            len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()

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
        # Step 3: query all meters in the space tree
        ################################################################################################################
        meter_dict = dict()
        space_dict = dict()

        for node in LevelOrderIter(node_dict[space_id]):
            space_dict[node.id] = node.name

        cursor_system_db.execute(" SELECT m.id, m.name AS meter_name, s.name AS space_name, "
                                 "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                                 "         m.description, m.uuid AS meter_uuid "
                                 " FROM tbl_spaces s, tbl_spaces_meters sm, tbl_meters m, tbl_cost_centers cc, "
                                 "      tbl_energy_categories ec "
                                 " WHERE s.id IN ( " + ', '.join(map(str, space_dict.keys())) + ") "
                                 "       AND sm.space_id = s.id AND sm.meter_id = m.id "
                                 + energy_category_query +
                                 "       AND m.cost_center_id = cc.id AND m.energy_category_id = ec.id ", )
        rows_meters = cursor_system_db.fetchall()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[0]] = {"meter_name": row[1],
                                      "space_name": row[2],
                                      "cost_center_name": row[3],
                                      "energy_category_name": row[4],
                                      "description": row[5],
                                      "meter_uuid": row[6]}

        ################################################################################################################
        # Step 4: query start value and end value
        ################################################################################################################
        integral_start_count = int(0)
        integral_end_count = int(0)
        integral_full_count = int(0)

        for meter_id in meter_dict:
            cursor_system_db.execute(" SELECT point_id "
                                     " FROM tbl_meters_points mp, tbl_points p"
                                     " WHERE p.id = mp.point_id AND p.object_type = 'ENERGY_VALUE' "
                                     "       AND meter_id = %s ", (meter_id, ))

            rows_points_id = cursor_system_db.fetchall()

            start_value = None
            end_value = None
            is_integral_start_value = False

            if rows_points_id is not None and len(rows_points_id) > 0:
                query_start_value = (" SELECT actual_value "
                                     " FROM tbl_energy_value "
                                     " where point_id in ("
                                     + ', '.join(map(lambda x: str(x[0]), rows_points_id)) + ") "
                                     " AND utc_date_time BETWEEN %s AND %s "
                                     " order by utc_date_time ASC LIMIT 0,1")
                query_end_value = (" SELECT actual_value "
                                   " FROM tbl_energy_value "
                                   " where point_id in ("
                                   + ', '.join(map(lambda x: str(x[0]), rows_points_id)) + ") "
                                   " AND utc_date_time BETWEEN %s AND %s "
                                   " order by utc_date_time DESC LIMIT 0,1")
                cursor_historical.execute(query_start_value,
                                          (reporting_start_datetime_utc,
                                           (reporting_start_datetime_utc + timedelta(minutes=15)), ))
                row_start_value = cursor_historical.fetchone()
                if row_start_value is not None:
                    start_value = row_start_value[0]
                    integral_start_count += int(1)
                    is_integral_start_value = True

                cursor_historical.execute(query_end_value,
                                          ((reporting_end_datetime_utc - timedelta(minutes=15)),
                                           reporting_end_datetime_utc, ))
                row_end_value = cursor_historical.fetchone()

                if row_end_value is not None:
                    end_value = row_end_value[0]
                    integral_end_count += int(1)
                    if is_integral_start_value:
                        integral_full_count += int(1)

            meter_dict[meter_id]['start_value'] = start_value
            meter_dict[meter_id]['end_value'] = end_value
            if start_value is not None and end_value is not None:
                meter_dict[meter_id]['difference_value'] = end_value - start_value
            else:
                meter_dict[meter_id]['difference_value'] = None

        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()

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
                "end_value": meter['end_value'],
                "difference_value": meter['difference_value'],
                "meter_uuid": meter['meter_uuid']
            })

        meter_count = len(meter_list)
        start_integrity_rate = Decimal(integral_start_count / meter_count) if meter_count > 0 else None
        end_integrity_rate = Decimal(integral_end_count / meter_count) if meter_count > 0 else None
        full_integrity_rate = Decimal(integral_full_count / meter_count) if meter_count > 0 else None

        result = {'meters': meter_list, 'start_integrity_rate': start_integrity_rate,
                  'end_integrity_rate': end_integrity_rate, 'full_integrity_rate': full_integrity_rate,
                  'excel_bytes_base64': None}
        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.metertracking.export(result,
                                                    space_name,
                                                    energy_category_name,
                                                    reporting_period_start_datetime_local,
                                                    reporting_period_end_datetime_local,
                                                    language)
        resp.text = json.dumps(result)
