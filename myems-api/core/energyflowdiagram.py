import uuid
from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class EnergyFlowDiagramCollection:
    """
    Energy Flow Diagram Collection Resource

    This class handles CRUD operations for energy flow diagram collection.
    It provides endpoints for listing all energy flow diagrams and creating new ones.
    Energy flow diagrams represent visual representations of energy flows between
    different nodes in the energy management system, showing how energy moves
    through various components like meters, equipment, and spaces.
    """
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """
        Handle GET requests to retrieve all energy flow diagrams

        Returns a list of all energy flow diagrams with their complete structure including:
        - Diagram ID, name, and UUID
        - Associated nodes (energy flow points)
        - Links between nodes with meter associations
        - Meter information (regular, offline, and virtual meters)

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        # Check authentication method (API key or session)
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        search_query = req.get_param('q', default=None)
        if search_query is not None:
            search_query = search_query.strip()
        else:
            search_query = ''

        # Connect to database
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Query to retrieve all regular meters for reference
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        # Build meter dictionary for quick lookup by UUID
        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[2]] = {"type": 'meter',
                                      "id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        # Query to retrieve all offline meters for reference
        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        # Build offline meter dictionary for quick lookup by UUID
        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        # Query to retrieve all virtual meters for reference
        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        # Build virtual meter dictionary for quick lookup by UUID
        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, energy_flow_diagram_id, name "
                 " FROM tbl_energy_flow_diagrams_nodes")
        cursor.execute(query)
        rows_nodes = cursor.fetchall()

        node_dict = dict()
        node_list_dict = dict()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                node_dict[row[0]] = row[2]
                if node_list_dict.get(row[1]) is None:
                    node_list_dict[row[1]] = list()
                node_list_dict[row[1]].append({"id": row[0], "name": row[2]})

        query = (" SELECT id, energy_flow_diagram_id, source_node_id, target_node_id, meter_uuid "
                 " FROM tbl_energy_flow_diagrams_links")
        cursor.execute(query)
        rows_links = cursor.fetchall()

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
                                               "meter": meter})

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_flow_diagrams ")

        params=[]
        if search_query:
            query += " WHERE name LIKE %s"
            params = [f'%{search_query}%']
        query +=  " ORDER BY id "
        cursor.execute(query,params)
        rows_energy_flow_diagrams = cursor.fetchall()

        result = list()
        if rows_energy_flow_diagrams is not None and len(rows_energy_flow_diagrams) > 0:
            for row in rows_energy_flow_diagrams:

                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "nodes": node_list_dict.get(row[0], None),
                               "links": link_list_dict.get(row[0], None), }
                result.append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """
        Handle POST requests to create a new energy flow diagram

        Creates a new energy flow diagram with the provided name.
        The diagram will be empty initially and nodes/links can be added separately.

        Args:
            req: Falcon request object containing diagram data
            resp: Falcon response object
        """
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_FLOW_DIAGRAM_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_energy_flow_diagrams "
                      "    (name, uuid) "
                      " VALUES (%s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4())))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energyflowdiagrams/' + str(new_id)


class EnergyFlowDiagramItem:
    """
    Energy Flow Diagram Item Resource

    This class handles CRUD operations for individual energy flow diagrams.
    It provides endpoints for retrieving, updating, and deleting specific
    energy flow diagrams by their ID.
    """
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[2]] = {"type": 'meter',
                                      "id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, energy_flow_diagram_id, name "
                 " FROM tbl_energy_flow_diagrams_nodes")
        cursor.execute(query)
        rows_nodes = cursor.fetchall()

        node_dict = dict()
        node_list_dict = dict()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                node_dict[row[0]] = row[2]
                if node_list_dict.get(row[1]) is None:
                    node_list_dict[row[1]] = list()
                node_list_dict[row[1]].append({"id": row[0], "name": row[2]})

        query = (" SELECT id, energy_flow_diagram_id, source_node_id, target_node_id, meter_uuid "
                 " FROM tbl_energy_flow_diagrams_links")
        cursor.execute(query)
        rows_links = cursor.fetchall()

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
                                               "meter": meter})

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_flow_diagrams "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "nodes": node_list_dict.get(row[0], None),
                           "links": link_list_dict.get(row[0], None),
                           }

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # check relation with spaces
        cursor.execute(" SELECT id "
                       " FROM  tbl_spaces_energy_flow_diagrams "
                       " WHERE energy_flow_diagram_id = %s ", (id_,))
        rows_spaces = cursor.fetchall()
        if rows_spaces is not None and len(rows_spaces) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_SPACES')

        # delete all associated nodes
        cursor.execute(" DELETE FROM tbl_energy_flow_diagrams_nodes"
                       " WHERE energy_flow_diagram_id = %s ", (id_,))
        cnx.commit()

        # delete all associated links
        cursor.execute(" DELETE FROM tbl_energy_flow_diagrams_links"
                       " WHERE energy_flow_diagram_id = %s ", (id_,))
        cnx.commit()

        cursor.execute(" DELETE FROM tbl_energy_flow_diagrams"
                       " WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_FLOW_DIAGRAM_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_energy_flow_diagrams "
                      " SET name = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyFlowDiagramLinkCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes ")
        cursor.execute(query)
        rows_nodes = cursor.fetchall()

        node_dict = dict()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                node_dict[row[0]] = {"id": row[0],
                                     "name": row[1]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[2]] = {"type": 'meter',
                                      "id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        query = (" SELECT id, source_node_id, target_node_id, meter_uuid "
                 " FROM tbl_energy_flow_diagrams_links "
                 " WHERE energy_flow_diagram_id = %s "
                 " ORDER BY id ")
        cursor.execute(query, (id_, ))
        rows_links = cursor.fetchall()

        result = list()
        if rows_links is not None and len(rows_links) > 0:
            for row in rows_links:
                source_node = node_dict.get(row[1], None)
                target_node = node_dict.get(row[2], None)
                # find meter by uuid
                meter = meter_dict.get(row[3], None)
                if meter is None:
                    meter = virtual_meter_dict.get(row[3], None)
                if meter is None:
                    meter = offline_meter_dict.get(row[3], None)

                meta_result = {"id": row[0],
                               "source_node": source_node,
                               "target_node": target_node,
                               "meter": meter}
                result.append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        source_node_id = None
        if 'source_node_id' in new_values['data'].keys():
            if new_values['data']['source_node_id'] is not None and \
                    new_values['data']['source_node_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_SOURCE_NODE_ID')
            source_node_id = new_values['data']['source_node_id']

        target_node_id = None
        if 'target_node_id' in new_values['data'].keys():
            if new_values['data']['target_node_id'] is not None and \
                    new_values['data']['target_node_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_TARGET_NODE_ID')
            target_node_id = new_values['data']['target_node_id']

        meter_uuid = None
        if 'meter_uuid' in new_values['data'].keys():
            if new_values['data']['meter_uuid'] is not None and \
                    isinstance(new_values['data']['meter_uuid'], str) and \
                    len(str.strip(new_values['data']['meter_uuid'])) > 0:
                meter_uuid = str.strip(new_values['data']['meter_uuid'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE energy_flow_diagram_id = %s AND "
                       "       source_node_id = %s AND target_node_id = %s ",
                       (id_, source_node_id, target_node_id,))
        row = cursor.fetchone()
        if row is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_LINK_IS_ALREADY_IN_USE')

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes "
                 " WHERE id = %s ")
        cursor.execute(query, (source_node_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SOURCE_NODE_NOT_FOUND')

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes "
                 " WHERE id = %s ")
        cursor.execute(query, (target_node_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARGET_NODE_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[2]] = {"type": 'meter',
                                      "id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        # validate meter uuid
        if meter_dict.get(meter_uuid) is None and \
                virtual_meter_dict.get(meter_uuid) is None and \
                offline_meter_dict.get(meter_uuid) is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_UUID')

        add_values = (" INSERT INTO tbl_energy_flow_diagrams_links "
                      "    (energy_flow_diagram_id, source_node_id, target_node_id, meter_uuid) "
                      " VALUES (%s, %s, %s, %s) ")
        cursor.execute(add_values, (id_,
                                    source_node_id,
                                    target_node_id,
                                    meter_uuid))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energyflowdiagrams/' + str(id_) + 'links/' + str(new_id)


class EnergyFlowDiagramLinkItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, lid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, lid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_LINK_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes ")
        cursor.execute(query)
        rows_nodes = cursor.fetchall()

        node_dict = dict()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                node_dict[row[0]] = {"id": row[0],
                                     "name": row[1]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[2]] = {"type": 'meter',
                                      "id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, source_node_id, target_node_id, meter_uuid "
                 " FROM tbl_energy_flow_diagrams_links "
                 " WHERE energy_flow_diagram_id = %s AND id = %s ")
        cursor.execute(query, (id_, lid))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_LINK_NOT_FOUND_OR_NOT_MATCH')
        else:
            source_node = node_dict.get(row[1], None)
            target_node = node_dict.get(row[2], None)
            # find meter by uuid
            meter = meter_dict.get(row[3], None)
            if meter is None:
                meter = virtual_meter_dict.get(row[3], None)
            if meter is None:
                meter = offline_meter_dict.get(row[3], None)

            meta_result = {"id": row[0],
                           "source_node": source_node,
                           "target_node": target_node,
                           "meter": meter}
            resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, lid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_LINK_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ",
                       (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE energy_flow_diagram_id = %s AND id = %s ",
                       (id_, lid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_LINK_NOT_FOUND_OR_NOT_MATCH')

        cursor.execute(" DELETE FROM tbl_energy_flow_diagrams_links "
                       " WHERE id = %s ", (lid, ))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, lid):
        """Handles PUT requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_LINK_ID')

        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        source_node_id = None
        if 'source_node_id' in new_values['data'].keys():
            if new_values['data']['source_node_id'] is not None and \
                    new_values['data']['source_node_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_SOURCE_NODE_ID')
            source_node_id = new_values['data']['source_node_id']

        target_node_id = None
        if 'target_node_id' in new_values['data'].keys():
            if new_values['data']['target_node_id'] is not None and \
                    new_values['data']['target_node_id'] <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_TARGET_NODE_ID')
            target_node_id = new_values['data']['target_node_id']

        meter_uuid = None
        if 'meter_uuid' in new_values['data'].keys():
            if new_values['data']['meter_uuid'] is not None and \
                    isinstance(new_values['data']['meter_uuid'], str) and \
                    len(str.strip(new_values['data']['meter_uuid'])) > 0:
                meter_uuid = str.strip(new_values['data']['meter_uuid'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE energy_flow_diagram_id = %s AND id = %s ",
                       (id_, lid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_LINK_NOT_FOUND_OR_NOT_MATCH')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE energy_flow_diagram_id = %s AND id != %s "
                       "       AND source_node_id = %s AND target_node_id = %s ",
                       (id_, lid, source_node_id, target_node_id,))
        row = cursor.fetchone()
        if row is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_LINK_IS_ALREADY_IN_USE')

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes "
                 " WHERE id = %s ")
        cursor.execute(query, (source_node_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SOURCE_NODE_NOT_FOUND')

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes "
                 " WHERE id = %s ")
        cursor.execute(query, (target_node_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARGET_NODE_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[2]] = {"type": 'meter',
                                      "id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        # validate meter uuid
        if meter_dict.get(meter_uuid) is None and \
                virtual_meter_dict.get(meter_uuid) is None and \
                offline_meter_dict.get(meter_uuid) is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_METER_UUID')

        add_values = (" UPDATE tbl_energy_flow_diagrams_links "
                      " SET source_node_id = %s, target_node_id = %s, meter_uuid = %s "
                      " WHERE id = %s ")
        cursor.execute(add_values, (source_node_id,
                                    target_node_id,
                                    meter_uuid,
                                    lid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyFlowDiagramNodeCollection:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes "
                 " WHERE energy_flow_diagram_id = %s "
                 " ORDER BY id ")
        cursor.execute(query, (id_, ))
        rows_nodes = cursor.fetchall()

        result = list()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                meta_result = {"id": row[0],
                               "name": row[1]}
                result.append(meta_result)

        cursor.close()
        cnx.close()
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """Handles POST requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NODE_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams_nodes "
                       " WHERE name = %s AND energy_flow_diagram_id = %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_FLOW_DIAGRAM_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_energy_flow_diagrams_nodes "
                      "    (energy_flow_diagram_id, name) "
                      " VALUES (%s, %s) ")
        cursor.execute(add_values, (id_,
                                    name))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energyflowdiagrams/' + str(id_) + 'nodes/' + str(new_id)


class EnergyFlowDiagramNodeItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_, nid):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_, nid):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not nid.isdigit() or int(nid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NODE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes "
                 " WHERE energy_flow_diagram_id = %s AND id = %s ")
        cursor.execute(query, (id_, nid))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NODE_NOT_FOUND_OR_NOT_MATCH')
        else:
            meta_result = {"id": row[0],
                           "name": row[1]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_, nid):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not nid.isdigit() or int(nid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NODE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ",
                       (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams_nodes "
                       " WHERE energy_flow_diagram_id = %s AND id = %s ",
                       (id_, nid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NODE_NOT_FOUND_OR_NOT_MATCH')

        # check relation with links
        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE energy_flow_diagram_id = %s AND "
                       " (source_node_id = %s OR target_node_id = %s) ", (id_, nid, nid))
        rows_links = cursor.fetchall()
        if rows_links is not None and len(rows_links) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_LINKS')

        cursor.execute(" DELETE FROM tbl_energy_flow_diagrams_nodes "
                       " WHERE id = %s ", (nid, ))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_, nid):
        """Handles PUT requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not nid.isdigit() or int(nid) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NODE_ID')

        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NODE_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams_nodes "
                       " WHERE energy_flow_diagram_id = %s AND id = %s ",
                       (id_, nid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NODE_NOT_FOUND_OR_NOT_MATCH')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams_nodes "
                       " WHERE name = %s AND energy_flow_diagram_id = %s  AND id != %s ", (name, id_, nid))
        row = cursor.fetchone()
        if row is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_FLOW_DIAGRAM_NODE_NAME_IS_ALREADY_IN_USE')

        add_values = (" UPDATE tbl_energy_flow_diagrams_nodes "
                      " SET name = %s "
                      " WHERE id = %s ")
        cursor.execute(add_values, (name,
                                    nid))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class EnergyFlowDiagramExport:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[2]] = {"type": 'meter',
                                      "id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, energy_flow_diagram_id, name "
                 " FROM tbl_energy_flow_diagrams_nodes")
        cursor.execute(query)
        rows_nodes = cursor.fetchall()

        node_dict = dict()
        node_list_dict = dict()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                node_dict[row[0]] = row[2]
                if node_list_dict.get(row[1]) is None:
                    node_list_dict[row[1]] = list()
                node_list_dict[row[1]].append({"id": row[0], "name": row[2]})

        query = (" SELECT id, energy_flow_diagram_id, source_node_id, target_node_id, meter_uuid "
                 " FROM tbl_energy_flow_diagrams_links")
        cursor.execute(query)
        rows_links = cursor.fetchall()

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
                                               "meter": meter})

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_flow_diagrams "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "nodes": node_list_dict.get(row[0], None),
                           "links": link_list_dict.get(row[0], None),
                           }

        resp.text = json.dumps(meta_result)


class EnergyFlowDiagramImport:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NAME')
        name = str.strip(new_values['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_FLOW_DIAGRAM_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_energy_flow_diagrams "
                      "    (name, uuid) "
                      " VALUES (%s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4())))
        new_id = cursor.lastrowid
        for node in new_values['nodes']:
            if 'name' not in node.keys() or \
                    not isinstance(node['name'], str) or \
                    len(str.strip(node['name'])) == 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_FLOW_DIAGRAM_NODE_NAME')
            name = str.strip(node['name'])

            cursor.execute(" SELECT name "
                           " FROM tbl_energy_flow_diagrams "
                           " WHERE id = %s ", (new_id,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                       description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

            cursor.execute(" SELECT name "
                           " FROM tbl_energy_flow_diagrams_nodes "
                           " WHERE name = %s AND energy_flow_diagram_id = %s ", (name, new_id))
            if cursor.fetchone() is not None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.ENERGY_FLOW_DIAGRAM_NAME_IS_ALREADY_IN_USE')

            add_values = (" INSERT INTO tbl_energy_flow_diagrams_nodes "
                          "    (energy_flow_diagram_id, name) "
                          " VALUES (%s, %s) ")
            cursor.execute(add_values, (new_id,
                                        name))
        for link in new_values['links']:
            source_node_id = None
            if 'id' in link['source_node'].keys():
                if link['source_node']['id'] is not None and \
                        link['source_node']['id'] <= 0:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_SOURCE_NODE_ID')
                source_node_id = link['source_node']['id']

            target_node_id = None
            if 'id' in link['target_node'].keys():
                if link['target_node']['id'] is not None and \
                        link['target_node']['id'] <= 0:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_TARGET_NODE_ID')
                target_node_id = link['target_node']['id']

            meter_uuid = None
            if 'uuid' in link['meter'].keys():
                if link['meter']['uuid'] is not None and \
                        isinstance(link['meter']['uuid'], str) and \
                        len(str.strip(link['meter']['uuid'])) > 0:
                    meter_uuid = str.strip(link['meter']['uuid'])

            cursor.execute(" SELECT name "
                           " FROM tbl_energy_flow_diagrams "
                           " WHERE id = %s ", (new_id,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                       description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

            cursor.execute(" SELECT id "
                           " FROM tbl_energy_flow_diagrams_links "
                           " WHERE energy_flow_diagram_id = %s AND "
                           "       source_node_id = %s AND target_node_id = %s ",
                           (new_id, source_node_id, target_node_id,))
            row = cursor.fetchone()
            if row is not None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400,
                                       title='API.NOT_FOUND',
                                       description='API.ENERGY_FLOW_DIAGRAM_LINK_IS_ALREADY_IN_USE')

            query = (" SELECT id, name "
                     " FROM tbl_energy_flow_diagrams_nodes "
                     " WHERE id = %s ")
            cursor.execute(query, (source_node_id,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.SOURCE_NODE_NOT_FOUND')

            query = (" SELECT id, name "
                     " FROM tbl_energy_flow_diagrams_nodes "
                     " WHERE id = %s ")
            cursor.execute(query, (target_node_id,))
            if cursor.fetchone() is None:
                cursor.close()
                cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.TARGET_NODE_NOT_FOUND')

            query = (" SELECT id, name, uuid "
                     " FROM tbl_meters ")
            cursor.execute(query)
            rows_meters = cursor.fetchall()

            meter_dict = dict()
            if rows_meters is not None and len(rows_meters) > 0:
                for row in rows_meters:
                    meter_dict[row[2]] = {"type": 'meter',
                                          "id": row[0],
                                          "name": row[1],
                                          "uuid": row[2]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_offline_meters ")
            cursor.execute(query)
            rows_offline_meters = cursor.fetchall()

            offline_meter_dict = dict()
            if rows_offline_meters is not None and len(rows_offline_meters) > 0:
                for row in rows_offline_meters:
                    offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                                  "id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}

            query = (" SELECT id, name, uuid "
                     " FROM tbl_virtual_meters ")
            cursor.execute(query)
            rows_virtual_meters = cursor.fetchall()

            virtual_meter_dict = dict()
            if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
                for row in rows_virtual_meters:
                    virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                                  "id": row[0],
                                                  "name": row[1],
                                                  "uuid": row[2]}

            # validate meter uuid
            if meter_dict.get(meter_uuid) is None and \
                    virtual_meter_dict.get(meter_uuid) is None and \
                    offline_meter_dict.get(meter_uuid) is None:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_METER_UUID')

            add_values = (" INSERT INTO tbl_energy_flow_diagrams_links "
                          "    (energy_flow_diagram_id, source_node_id, target_node_id, meter_uuid) "
                          " VALUES (%s, %s, %s, %s) ")
            cursor.execute(add_values, (new_id,
                                        source_node_id,
                                        target_node_id,
                                        meter_uuid))
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/energyflowdiagrams/' + str(new_id)


class EnergyFlowDiagramClone:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row[2]] = {"type": 'meter',
                                      "id": row[0],
                                      "name": row[1],
                                      "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row[2]] = {"type": 'offline_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row[2]] = {"type": 'virtual_meter',
                                              "id": row[0],
                                              "name": row[1],
                                              "uuid": row[2]}

        query = (" SELECT id, energy_flow_diagram_id, name "
                 " FROM tbl_energy_flow_diagrams_nodes")
        cursor.execute(query)
        rows_nodes = cursor.fetchall()

        node_dict = dict()
        node_list_dict = dict()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                node_dict[row[0]] = row[2]
                if node_list_dict.get(row[1]) is None:
                    node_list_dict[row[1]] = list()
                node_list_dict[row[1]].append({"id": row[0], "name": row[2]})

        query = (" SELECT id, energy_flow_diagram_id, source_node_id, target_node_id, meter_uuid "
                 " FROM tbl_energy_flow_diagrams_links")
        cursor.execute(query)
        rows_links = cursor.fetchall()

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
                                               "meter": meter})

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_flow_diagrams "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "nodes": node_list_dict.get(row[0], None),
                           "links": link_list_dict.get(row[0], None),
                           }
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            new_name = (str.strip(meta_result['name']) +
                        (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
            add_values = (" INSERT INTO tbl_energy_flow_diagrams "
                          "    (name, uuid) "
                          " VALUES (%s, %s) ")
            cursor.execute(add_values, (new_name,
                                        str(uuid.uuid4())))
            new_id = cursor.lastrowid
            if meta_result['nodes'] is not None and len(meta_result['nodes']) > 0:
                for node in meta_result['nodes']:
                    add_values = (" INSERT INTO tbl_energy_flow_diagrams_nodes "
                                  "    (energy_flow_diagram_id, name) "
                                  " VALUES (%s, %s) ")
                    cursor.execute(add_values, (new_id,
                                                node['name']))
            if meta_result['links'] is not None and len(meta_result['links']) > 0:
                for link in meta_result['links']:
                    if link['meter'] is None:
                        continue
                    add_values = (" INSERT INTO tbl_energy_flow_diagrams_links "
                                  "    (energy_flow_diagram_id, source_node_id, target_node_id, meter_uuid) "
                                  " VALUES (%s, %s, %s, %s) ")
                    cursor.execute(add_values, (new_id,
                                                link['source_node']['id'],
                                                link['target_node']['id'],
                                                link['meter']['uuid']))
            cnx.commit()
            cursor.close()
            cnx.close()

            resp.status = falcon.HTTP_201
            resp.location = '/energyflowdiagrams/' + str(new_id)

