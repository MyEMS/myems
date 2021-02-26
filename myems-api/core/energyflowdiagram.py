import falcon
import simplejson as json
import mysql.connector
import config
import uuid


class EnergyFlowDiagramCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, energy_flow_diagram_id, name "
                 " FROM tbl_energy_flow_diagrams_nodes")
        cursor.execute(query)
        rows_nodes = cursor.fetchall()
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row['uuid']] = {"type": 'meter',
                                           "id": row['id'],
                                           "name": row['name'],
                                           "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row['uuid']] = {"type": 'offline_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row['uuid']] = {"type": 'virtual_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        node_dict = dict()
        node_list_dict = dict()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                node_dict[row['id']] = row['name']
                if node_list_dict.get(row['energy_flow_diagram_id']) is None:
                    node_list_dict[row['energy_flow_diagram_id']] = list()
                node_list_dict[row['energy_flow_diagram_id']].append({"id": row['id'], "name": row['name']})

        query = (" SELECT id, energy_flow_diagram_id, source_node_id, target_node_id, meter_uuid "
                 " FROM tbl_energy_flow_diagrams_links")
        cursor.execute(query)
        rows_links = cursor.fetchall()

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
                                                                      "meter": meter})

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_flow_diagrams "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_energy_flow_diagrams = cursor.fetchall()

        result = list()
        if rows_energy_flow_diagrams is not None and len(rows_energy_flow_diagrams) > 0:
            for row in rows_energy_flow_diagrams:

                meta_result = {"id": row['id'],
                               "name": row['name'],
                               "uuid": row['uuid'],
                               "nodes": node_list_dict.get(row['id'], None),
                               "links": link_list_dict.get(row['id'], None), }
                result.append(meta_result)

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)

    @staticmethod
    def on_post(req, resp):
        """Handles POST requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.ENERGY_FLOW_DIAGRAM_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_energy_flow_diagrams "
                      "    (name, uuid) "
                      " VALUES (%s, %s) ")
        cursor.execute(add_values, (name,
                                    str(uuid.uuid4())))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/energyflowdiagrams/' + str(new_id)


class EnergyFlowDiagramItem:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, energy_flow_diagram_id, name "
                 " FROM tbl_energy_flow_diagrams_nodes")
        cursor.execute(query)
        rows_nodes = cursor.fetchall()
        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row['uuid']] = {"type": 'meter',
                                           "id": row['id'],
                                           "name": row['name'],
                                           "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row['uuid']] = {"type": 'offline_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row['uuid']] = {"type": 'virtual_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        node_dict = dict()
        node_list_dict = dict()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                node_dict[row['id']] = row['name']
                if node_list_dict.get(row['energy_flow_diagram_id']) is None:
                    node_list_dict[row['energy_flow_diagram_id']] = list()
                node_list_dict[row['energy_flow_diagram_id']].append({"id": row['id'], "name": row['name']})

        query = (" SELECT id, energy_flow_diagram_id, source_node_id, target_node_id, meter_uuid "
                 " FROM tbl_energy_flow_diagrams_links")
        cursor.execute(query)
        rows_links = cursor.fetchall()

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
                                                                      "meter": meter})

        query = (" SELECT id, name, uuid "
                 " FROM tbl_energy_flow_diagrams "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')
        else:
            meta_result = {"id": row['id'],
                           "name": row['name'],
                           "uuid": row['uuid'],
                           "nodes": node_list_dict.get(row['id'], None),
                           "links": link_list_dict.get(row['id'], None),
                           }

        resp.body = json.dumps(meta_result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

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
        cnx.disconnect()

        resp.status = falcon.HTTP_204

    @staticmethod
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=ex)

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.BAD_REQUEST',
                                   description='API.ENERGY_FLOW_DIAGRAM_NAME_IS_ALREADY_IN_USE')

        update_row = (" UPDATE tbl_energy_flow_diagrams "
                      " SET name = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200


class EnergyFlowDiagramLinkCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes ")
        cursor.execute(query)
        rows_nodes = cursor.fetchall()

        node_dict = dict()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                node_dict[row['id']] = {"id": row['id'],
                                        "name": row['name']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row['uuid']] = {"type": 'meter',
                                           "id": row['id'],
                                           "name": row['name'],
                                           "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row['uuid']] = {"type": 'offline_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row['uuid']] = {"type": 'virtual_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
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
                source_node = node_dict.get(row['source_node_id'], None)
                target_node = node_dict.get(row['target_node_id'], None)
                # find meter by uuid
                meter = meter_dict.get(row['meter_uuid'], None)
                if meter is None:
                    meter = virtual_meter_dict.get(row['meter_uuid'], None)
                if meter is None:
                    meter = offline_meter_dict.get(row['meter_uuid'], None)

                meta_result = {"id": row['id'],
                               "source_node": source_node,
                               "target_node": target_node,
                               "meter": meter}
                result.append(meta_result)

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)

    @staticmethod
    def on_post(req, resp, id_):
        """Handles POST requests"""
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        new_values = json.loads(raw_json)

        source_node_id = None
        if 'source_node_id' in new_values['data'].keys():
            if new_values['data']['source_node_id'] is not None and \
                    new_values['data']['source_node_id'] <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_SOURCE_NODE_ID')
            source_node_id = new_values['data']['source_node_id']

        target_node_id = None
        if 'target_node_id' in new_values['data'].keys():
            if new_values['data']['target_node_id'] is not None and \
                    new_values['data']['target_node_id'] <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_TARGET_NODE_ID')
            target_node_id = new_values['data']['target_node_id']

        meter_uuid = None
        if 'meter_uuid' in new_values['data'].keys():
            if new_values['data']['meter_uuid'] is not None and \
                    isinstance(new_values['data']['meter_uuid'], str) and \
                    len(str.strip(new_values['data']['meter_uuid'])) > 0:
                meter_uuid = str.strip(new_values['data']['meter_uuid'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE energy_flow_diagram_id = %s AND "
                       "       source_node_id = %s AND target_node_id = %s ",
                       (id_, source_node_id, target_node_id,))
        row = cursor.fetchone()
        if row is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_LINK_IS_ALREADY_IN_USE')

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes "
                 " WHERE id = %s ")
        cursor.execute(query, (source_node_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SOURCE_NODE_NOT_FOUND')

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes "
                 " WHERE id = %s ")
        cursor.execute(query, (target_node_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARGET_NODE_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row['uuid']] = {"type": 'meter',
                                           "id": row['id'],
                                           "name": row['name'],
                                           "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row['uuid']] = {"type": 'offline_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row['uuid']] = {"type": 'virtual_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        # validate meter uuid
        if meter_dict.get(meter_uuid) is None and \
                virtual_meter_dict.get(meter_uuid) is None and \
                offline_meter_dict.get(meter_uuid) is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
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
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/energyflowdiagrams/' + str(id_) + 'links/' + str(new_id)


class EnergyFlowDiagramLinkItem:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_, lid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, lid):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_LINK_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes ")
        cursor.execute(query)
        rows_nodes = cursor.fetchall()

        node_dict = dict()
        if rows_nodes is not None and len(rows_nodes) > 0:
            for row in rows_nodes:
                node_dict[row['id']] = {"id": row['id'],
                                        "name": row['name']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row['uuid']] = {"type": 'meter',
                                           "id": row['id'],
                                           "name": row['name'],
                                           "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row['uuid']] = {"type": 'offline_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row['uuid']] = {"type": 'virtual_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        query = (" SELECT id, source_node_id, target_node_id, meter_uuid "
                 " FROM tbl_energy_flow_diagrams_links "
                 " WHERE energy_flow_diagram_id = %s AND id = %s ")
        cursor.execute(query, (id_, lid))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_LINK_NOT_FOUND_OR_NOT_MATCH')
        else:
            source_node = node_dict.get(row['source_node_id'], None)
            target_node = node_dict.get(row['target_node_id'], None)
            # find meter by uuid
            meter = meter_dict.get(row['meter_uuid'], None)
            if meter is None:
                meter = virtual_meter_dict.get(row['meter_uuid'], None)
            if meter is None:
                meter = offline_meter_dict.get(row['meter_uuid'], None)

            meta_result = {"id": row['id'],
                           "source_node": source_node,
                           "target_node": target_node,
                           "meter": meter}
            resp.body = json.dumps(meta_result)

    @staticmethod
    def on_delete(req, resp, id_, lid):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
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
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE energy_flow_diagram_id = %s AND id = %s ",
                       (id_, lid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_LINK_NOT_FOUND_OR_NOT_MATCH')

        cursor.execute(" DELETE FROM tbl_energy_flow_diagrams_links "
                       " WHERE id = %s ", (lid, ))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_204

    @staticmethod
    def on_put(req, resp, id_, lid):
        """Handles POST requests"""
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not lid.isdigit() or int(lid) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_LINK_ID')

        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        new_values = json.loads(raw_json)

        source_node_id = None
        if 'source_node_id' in new_values['data'].keys():
            if new_values['data']['source_node_id'] is not None and \
                    new_values['data']['source_node_id'] <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_SOURCE_NODE_ID')
            source_node_id = new_values['data']['source_node_id']

        target_node_id = None
        if 'target_node_id' in new_values['data'].keys():
            if new_values['data']['target_node_id'] is not None and \
                    new_values['data']['target_node_id'] <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_TARGET_NODE_ID')
            target_node_id = new_values['data']['target_node_id']

        meter_uuid = None
        if 'meter_uuid' in new_values['data'].keys():
            if new_values['data']['meter_uuid'] is not None and \
                    isinstance(new_values['data']['meter_uuid'], str) and \
                    len(str.strip(new_values['data']['meter_uuid'])) > 0:
                meter_uuid = str.strip(new_values['data']['meter_uuid'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT id "
                       " FROM tbl_energy_flow_diagrams_links "
                       " WHERE energy_flow_diagram_id = %s AND id = %s ",
                       (id_, lid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
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
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_LINK_IS_ALREADY_IN_USE')

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes "
                 " WHERE id = %s ")
        cursor.execute(query, (source_node_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.SOURCE_NODE_NOT_FOUND')

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes "
                 " WHERE id = %s ")
        cursor.execute(query, (target_node_id,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TARGET_NODE_NOT_FOUND')

        query = (" SELECT id, name, uuid "
                 " FROM tbl_meters ")
        cursor.execute(query)
        rows_meters = cursor.fetchall()

        meter_dict = dict()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_dict[row['uuid']] = {"type": 'meter',
                                           "id": row['id'],
                                           "name": row['name'],
                                           "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_offline_meters ")
        cursor.execute(query)
        rows_offline_meters = cursor.fetchall()

        offline_meter_dict = dict()
        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_dict[row['uuid']] = {"type": 'offline_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_virtual_meters ")
        cursor.execute(query)
        rows_virtual_meters = cursor.fetchall()

        virtual_meter_dict = dict()
        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_dict[row['uuid']] = {"type": 'virtual_meter',
                                                   "id": row['id'],
                                                   "name": row['name'],
                                                   "uuid": row['uuid']}

        # validate meter uuid
        if meter_dict.get(meter_uuid) is None and \
                virtual_meter_dict.get(meter_uuid) is None and \
                offline_meter_dict.get(meter_uuid) is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
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
        cnx.disconnect()

        resp.status = falcon.HTTP_200


class EnergyFlowDiagramNodeCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
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
                meta_result = {"id": row['id'],
                               "name": row['name']}
                result.append(meta_result)

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)

    @staticmethod
    def on_post(req, resp, id_):
        """Handles POST requests"""
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NODE_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams_nodes "
                       " WHERE name = %s AND energy_flow_diagram_id = %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_FLOW_DIAGRAM_NAME_IS_ALREADY_IN_USE')

        add_values = (" INSERT INTO tbl_energy_flow_diagrams_nodes "
                      "    (energy_flow_diagram_id, name) "
                      " VALUES (%s, %s) ")
        cursor.execute(add_values, (id_,
                                    name))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/energyflowdiagrams/' + str(id_) + 'nodes/' + str(new_id)


class EnergyFlowDiagramNodeItem:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_, nid):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, nid):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not nid.isdigit() or int(nid) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NODE_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name "
                 " FROM tbl_energy_flow_diagrams_nodes "
                 " WHERE energy_flow_diagram_id = %s AND id = %s ")
        cursor.execute(query, (id_, nid))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()

        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NODE_NOT_FOUND_OR_NOT_MATCH')
        else:
            meta_result = {"id": row['id'],
                           "name": row['name']}

        resp.body = json.dumps(meta_result)

    @staticmethod
    def on_delete(req, resp, id_, nid):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not nid.isdigit() or int(nid) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
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
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams_nodes "
                       " WHERE energy_flow_diagram_id = %s AND id = %s ",
                       (id_, nid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NODE_NOT_FOUND_OR_NOT_MATCH')

        cursor.execute(" DELETE FROM tbl_energy_flow_diagrams_nodes "
                       " WHERE id = %s ", (nid, ))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_204

    @staticmethod
    def on_put(req, resp, id_, nid):
        """Handles POST requests"""
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_ID')

        if not nid.isdigit() or int(nid) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NODE_ID')

        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=ex)

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_FLOW_DIAGRAM_NODE_NAME')
        name = str.strip(new_values['data']['name'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams_nodes "
                       " WHERE energy_flow_diagram_id = %s AND id = %s ",
                       (id_, nid,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_FLOW_DIAGRAM_NODE_NOT_FOUND_OR_NOT_MATCH')

        cursor.execute(" SELECT name "
                       " FROM tbl_energy_flow_diagrams_nodes "
                       " WHERE name = %s AND energy_flow_diagram_id = %s  AND id != %s ", (name, id_, nid))
        row = cursor.fetchone()
        if row is not None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ENERGY_FLOW_DIAGRAM_NODE_NAME_IS_ALREADY_IN_USE')

        add_values = (" UPDATE tbl_energy_flow_diagrams_nodes "
                      " SET name = %s "
                      " WHERE id = %s ")
        cursor.execute(add_values, (name,
                                    nid))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200

