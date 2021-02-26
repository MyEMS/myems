import falcon
import simplejson as json
import mysql.connector
import config
from anytree import Node, AnyNode, LevelOrderIter
import excelexporters.equipmenttracking


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
    # Step 3: query all equipments in the space tree
    # Step 4: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        print(req.params)
        space_id = req.params.get('spaceid')

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

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (space_id,))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.disconnect()
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
        cursor.execute(query)
        rows_spaces = cursor.fetchall()
        node_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                parent_node = node_dict[row['parent_space_id']] if row['parent_space_id'] is not None else None
                node_dict[row['id']] = AnyNode(id=row['id'], parent=parent_node, name=row['name'])

        ################################################################################################################
        # Step 3: query all equipments in the space tree
        ################################################################################################################
        equipment_list = list()
        space_dict = dict()

        for node in LevelOrderIter(node_dict[space_id]):
            space_dict[node.id] = node.name

        cursor.execute(" SELECT e.id, e.name AS equipment_name, s.name AS space_name, "
                       "        cc.name AS cost_center_name, e.description "
                       " FROM tbl_spaces s, tbl_spaces_equipments se, tbl_equipments e, tbl_cost_centers cc "
                       " WHERE s.id IN ( " + ', '.join(map(str, space_dict.keys())) + ") "
                       "       AND se.space_id = s.id "
                       "       AND se.equipment_id = e.id "
                       "       AND e.cost_center_id = cc.id  ", )
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            for row in rows_equipments:
                equipment_list.append({"id": row['id'],
                                       "equipment_name": row['equipment_name'],
                                       "space_name": row['space_name'],
                                       "cost_center_name": row['cost_center_name'],
                                       "description": row['description']})

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        ################################################################################################################
        # Step 4: construct the report
        ################################################################################################################
        result = {'equipments': equipment_list}

        # export result to Excel file and then encode the file to base64 string
        result['excel_bytes_base64'] = \
            excelexporters.equipmenttracking.export(result,
                                                    space_name)
        resp.body = json.dumps(result)
