import falcon
import simplejson as json
import mysql.connector
from datetime import datetime, timedelta, timezone
from core import utilities
from decimal import Decimal
import config


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
        print(req.params)
        energy_flow_diagram_id = req.params.get('energyflowdiagramid')
        reporting_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_end_datetime_local = req.params.get('reportingperiodenddatetime')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if energy_flow_diagram_id is None:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')
        else:
            energy_flow_diagram_id = str.strip(energy_flow_diagram_id)
            if not energy_flow_diagram_id.isdigit() or int(energy_flow_diagram_id) <= 0:
                raise falcon.HTTPError(falcon.HTTP_400,
                                       title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

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
        # Step 2: query the energy flow diagram
        ################################################################################################################

        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor(dictionary=True)

        query = (" SELECT name, uuid "
                 " FROM tbl_energy_flow_diagrams "
                 " WHERE id = %s ")
        cursor_system.execute(query, (energy_flow_diagram_id,))
        row = cursor_system.fetchone()

        if row is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')
        else:
            energy_flow_diagram_name = row['name']
            energy_flow_diagram_uuid = row['uuid']

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
                node_dict[row['id']] = row['name']
                if node_list_dict.get(row['energy_flow_diagram_id']) is None:
                    node_list_dict[row['energy_flow_diagram_id']] = list()
                node_list_dict[row['energy_flow_diagram_id']].append({"id": row['id'], "name": row['name']})

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
                meter_dict[row['uuid']] = {"type": 'meter',
                                           "id": row['id'],
                                           "name": row['name'],
                                           "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor_system.execute(query)
        rows_offline_meters = cursor_system.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row['uuid']] = {"type": 'offline_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor_system.execute(query)
        rows_virtual_meters = cursor_system.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row['uuid']] = {"type": 'virtual_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        query = (" SELECT id, energy_flow_diagram_id, source_node_id, target_node_id, meter_uuid "
                 " FROM tbl_energy_flow_diagrams_links")
        cursor_system.execute(query)
        rows_links = cursor_system.fetchall()

        link_list_dict = dict()
        if rows_links is not None and len(rows_links) > 0:
            for row in rows_links:
                # find meter by uuid
                meter = meter_dict.get(row['meter_uuid'], None)
                if meter is None:
                    meter = virtual_meter_dict.get(row['meter_uuid'], None)
                if meter is None:
                    meter = offline_meter_dict.get(row['meter_uuid'], None)

                if link_list_dict.get(row['energy_flow_diagram_id']) is None:
                    link_list_dict[row['energy_flow_diagram_id']] = list()
                link_list_dict[row['energy_flow_diagram_id']].append({"id": row['id'],
                                                                      "source_node": {
                                                                          "id": row['source_node_id'],
                                                                          "name": node_dict.get(row['source_node_id'])},
                                                                      "target_node": {
                                                                          "id": row['target_node_id'],
                                                                          "name": node_dict.get(row['target_node_id'])},
                                                                      "meter": meter,
                                                                      "value": None})

        meta_result = {"id": energy_flow_diagram_id,
                       "name": energy_flow_diagram_name,
                       "uuid": energy_flow_diagram_uuid,
                       "nodes": node_list_dict.get(int(energy_flow_diagram_id), None),
                       "links": link_list_dict.get(int(energy_flow_diagram_id), None),
                       }
        print(meta_result)
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.disconnect()

        ################################################################################################################
        # Step 5: query reporting period meter energy input
        ################################################################################################################
        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()
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
                         " WHERE meter_id = %s "
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
                         " WHERE meter_id = %s "
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
                  'links': list()}
        if meta_result['nodes'] is not None and len(meta_result['nodes']) > 0:
            for node in meta_result['nodes']:
                result['nodes'].append({'name': node['name']})
        if meta_result['links'] is not None and len(meta_result['links']) > 0:
            for link in meta_result['links']:
                result['links'].append({'source': link['source_node']['name'],
                                        'target': link['target_node']['name'],
                                        'value': link['value']})
        resp.body = json.dumps(result)
