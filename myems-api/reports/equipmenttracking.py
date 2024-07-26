import falcon
import mysql.connector
import simplejson as json
from anytree import AnyNode, LevelOrderIter
import config
import excelexporters.equipmenttracking
from core.useractivity import access_control, api_key_control


class Reporting:
    def __init__(self):
        """ Initializes Reporting"""
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
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        print(req.params)
        space_id = req.params.get('spaceid')
        language = req.params.get('language')
        quick_mode = req.params.get('quick_mode')
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

        # if turn quick mode on, do not return parameters data and excel file
        is_quick_mode = False
        if quick_mode is not None and \
            len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_spaces "
                       " WHERE id = %s ", (space_id,))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()
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
        cursor.execute(query)
        rows_spaces = cursor.fetchall()
        node_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                parent_node = node_dict[row[2]] if row[2] is not None else None
                node_dict[row[0]] = AnyNode(id=row[0], parent=parent_node, name=row[1])

        ################################################################################################################
        # Step 3: query all equipments in the space tree
        ################################################################################################################
        equipment_list = list()
        space_dict = dict()

        for node in LevelOrderIter(node_dict[space_id]):
            space_dict[node.id] = node.name

        cursor.execute(" SELECT e.id, e.name AS equipment_name, e.uuid AS equipment_uuid, s.name AS space_name, "
                       "        cc.name AS cost_center_name, e.description "
                       " FROM tbl_spaces s, tbl_spaces_equipments se, tbl_equipments e, tbl_cost_centers cc "
                       " WHERE s.id IN ( " + ', '.join(map(str, space_dict.keys())) + ") "
                       "       AND se.space_id = s.id "
                       "       AND se.equipment_id = e.id "
                       "       AND e.cost_center_id = cc.id  ", )
        rows_equipments = cursor.fetchall()
        if rows_equipments is not None and len(rows_equipments) > 0:
            for row in rows_equipments:
                equipment_list.append({"id": row[0],
                                       "equipment_name": row[1],
                                       "equipment_uuid": row[2],
                                       "space_name": row[3],
                                       "cost_center_name": row[4],
                                       "description": row[5]})

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        ################################################################################################################
        # Step 4: construct the report
        ################################################################################################################
        result = {'equipments': equipment_list, 'excel_bytes_base64': None}

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.equipmenttracking.export(result,
                                                        space_name,
                                                        language)
        resp.text = json.dumps(result)
