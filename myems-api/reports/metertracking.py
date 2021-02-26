import falcon
import simplejson as json
import mysql.connector
import config
from anytree import Node, AnyNode, LevelOrderIter
import excelexporters.metertracking


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
        # Step 3: query all meters in the space tree
        ################################################################################################################
        meter_list = list()
        space_dict = dict()

        for node in LevelOrderIter(node_dict[space_id]):
            space_dict[node.id] = node.name

        cursor.execute(" SELECT m.id, m.name AS meter_name, s.name AS space_name, "
                       "        cc.name AS cost_center_name, ec.name AS energy_category_name, "
                       "         m.description "
                       " FROM tbl_spaces s, tbl_spaces_meters sm, tbl_meters m, tbl_cost_centers cc, "
                       "      tbl_energy_categories ec "
                       " WHERE s.id IN ( " + ', '.join(map(str, space_dict.keys())) + ") "
                       "       AND sm.space_id = s.id AND sm.meter_id = m.id "
                       "       AND m.cost_center_id = cc.id AND m.energy_category_id = ec.id ", )
        rows_meters = cursor.fetchall()
        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_list.append({"id": row['id'],
                                   "meter_name": row['meter_name'],
                                   "space_name": row['space_name'],
                                   "cost_center_name": row['cost_center_name'],
                                   "energy_category_name": row['energy_category_name'],
                                   "description": row['description']})

        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()

        ################################################################################################################
        # Step 4: construct the report
        ################################################################################################################
        result = {'meters': meter_list}
        # export result to Excel file and then encode the file to base64 string
        result['excel_bytes_base64'] = \
            excelexporters.metertracking.export(result,
                                                space_name)
        resp.body = json.dumps(result)
