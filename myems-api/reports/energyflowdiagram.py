from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
import excelexporters.energyflowdiagram
from core.useractivity import access_control, api_key_control
import config


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
    # Step 2: query the energy flor diagram
    # Step 3: query nodes
    # Step 4: query links
    # Step 5: query reporting period meter energy input
    # Step 6: query reporting period offline meter energy input
    # Step 7: query reporting period virtual energy input
    # Step 8: construct the report
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
        energy_flow_diagram_id = req.params.get('energyflowdiagramid')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if energy_flow_diagram_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')
        else:
            energy_flow_diagram_id = str.strip(energy_flow_diagram_id)
            if not energy_flow_diagram_id.isdigit() or int(energy_flow_diagram_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

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
                                                               '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                    timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")

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
        # Step 2: query the energy flow diagram
        ################################################################################################################

        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        query = (" SELECT name, uuid "
                 " FROM tbl_energy_flow_diagrams "
                 " WHERE id = %s ")
        cursor_system.execute(query, (energy_flow_diagram_id,))
        row = cursor_system.fetchone()

        if row is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')
        else:
            energy_flow_diagram_name = row[0]
            energy_flow_diagram_uuid = row[1]

        ################################################################################################################
        # Step 3: query nodes
        ################################################################################################################

        query = (" SELECT id, energy_flow_diagram_id, name "
                 " FROM tbl_energy_flow_diagrams_nodes")
        cursor_system.execute(query)
        rows_nodes = cursor_system.fetchall()

        node_dict = dict()
        node_list_dict = dict()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                node_dict[row[0]] = row[2]
                if node_list_dict.get(row[1]) is None:
                    node_list_dict[row[1]] = list()
                node_list_dict[row[1]].append({"id": row[0], "name": row[2]})

        ################################################################################################################
        # Step 4: query links
        ################################################################################################################
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor_system.execute(query)
        rows_meters = cursor_system.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[2]] = {"type": 'meter',
                                      "id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor_system.execute(query)
        rows_offline_meters = cursor_system.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor_system.execute(query)
        rows_virtual_meters = cursor_system.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, energy_flow_diagram_id, source_node_id, target_node_id, meter_uuid "
                 " FROM tbl_energy_flow_diagrams_links")
        cursor_system.execute(query)
        rows_links = cursor_system.fetchall()

        link_list_dict = dict()
        if rows_links is not None and len(rows_links) > 0:
            for row in rows_links:
                # find meter by uuid
                meter = meter_dict.get(row[4], None)
                if meter is None:
                    meter = virtual_meter_dict.get(row[4], None)
                if meter is None:
                    meter = offline_meter_dict.get(row[4], None)

                if link_list_dict.get(row[1]) is None:
                    link_list_dict[row[1]] = list()
                link_list_dict[row[1]].append({"id": row[0],
                                               "source_node": {
                                                   "id": row[2],
                                                   "name": node_dict.get(row[2])},
                                               "target_node": {
                                                   "id": row[3],
                                                   "name": node_dict.get(row[3])},
                                               "meter": meter,
                                               "value": None})

        meta_result = {"id": energy_flow_diagram_id,
                       "name": energy_flow_diagram_name,
                       "uuid": energy_flow_diagram_uuid,
                       "nodes": node_list_dict.get(int(energy_flow_diagram_id), None),
                       "links": link_list_dict.get(int(energy_flow_diagram_id), None),
                       }
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        ################################################################################################################
        # Step 5: query reporting period meter energy input
        ################################################################################################################
        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()
        if meta_result['links'] is not None and len(meta_result['links']) > 0:
            for x in range(len(meta_result['links'])):
                if meta_result['links'][x] is None or meta_result['links'][x]['meter'] is None:
                    continue
                if meta_result['links'][x]['meter']['type'] == 'meter':
                    query = (" SELECT SUM(actual_value) "
                             " FROM tbl_meter_hourly "
                             " WHERE meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s ")
                    cursor_energy.execute(query, (meta_result['links'][x]['meter']['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                    row = cursor_energy.fetchone()
                    if row is not None:
                        meta_result['links'][x]['value'] = row[0]
                elif meta_result['links'][x]['meter']['type'] == 'offline_meter':
                    query = (" SELECT SUM(actual_value) "
                             " FROM tbl_offline_meter_hourly "
                             " WHERE offline_meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s ")
                    cursor_energy.execute(query, (meta_result['links'][x]['meter']['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                    row = cursor_energy.fetchone()
                    if row is not None:
                        meta_result['links'][x]['value'] = row[0]
                elif meta_result['links'][x]['meter']['type'] == 'virtual_meter':
                    query = (" SELECT SUM(actual_value) "
                             " FROM tbl_virtual_meter_hourly "
                             " WHERE virtual_meter_id = %s "
                             " AND start_datetime_utc >= %s "
                             " AND start_datetime_utc < %s ")
                    cursor_energy.execute(query, (meta_result['links'][x]['meter']['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                    row = cursor_energy.fetchone()
                    if row is not None:
                        meta_result['links'][x]['value'] = row[0]

        ################################################################################################################
        # Step 8: construct the report
        ################################################################################################################

        result = {'nodes': list(),
                  'links': list(),
                  'excel_bytes_base64': None}
        if meta_result['nodes'] is not None and len(meta_result['nodes']) > 0:
            for node in meta_result['nodes']:
                result['nodes'].append({'name': node['name']})
        if meta_result['links'] is not None and len(meta_result['links']) > 0:
            for link in meta_result['links']:
                result['links'].append({'source': link['source_node']['name'],
                                        'target': link['target_node']['name'],
                                        'value': link['value']})
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.energyflowdiagram.export(result,
                                                  meta_result['name'],
                                                  reporting_period_start_datetime_local,
                                                  reporting_period_end_datetime_local,
                                                  language)

        resp.text = json.dumps(result)
