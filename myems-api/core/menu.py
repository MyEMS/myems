import falcon
import simplejson as json
import mysql.connector
import config
import uuid
from datetime import datetime
from anytree import AnyNode
from anytree.exporter import JsonExporter


class MenuCollection:
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

        query = (" SELECT id, path, name, parent_menu_id, is_hidden "
                 " FROM tbl_menus ")
        cursor.execute(query)
        rows_menus = cursor.fetchall()

        result = list()
        if rows_menus is not None and len(rows_menus) > 0:
            for row in rows_menus:
                temp = {"id": row['id'],
                        "path": row['path'],
                        "name": row['name'],
                        "parent_menu_id": row['parent_menu_id'],
                        "is_hidden": row['is_hidden']}

                result.append(temp)

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)


class MenuItem:
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
                                   description='API.INVALID_MENU_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, path, name, parent_menu_id, is_hidden "
                 " FROM tbl_menus "
                 " WHERE id=%s ")
        cursor.execute(query, (id_,))
        rows_menu = cursor.fetchone()

        result = None
        if rows_menu is not None and len(rows_menu) > 0:
            result = {"id": rows_menu['id'],
                      "path": rows_menu['path'],
                      "name": rows_menu['name'],
                      "parent_menu_id": rows_menu['parent_menu_id'],
                      "is_hidden": rows_menu['is_hidden']}

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)

    @staticmethod
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=ex)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MENU_ID')

        new_values = json.loads(raw_json)

        if 'is_hidden' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_hidden'], str) or \
                len(str.strip(new_values['data']['is_hidden'])) == 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_HIDDEN')
        is_hidden = str.strip(new_values['data']['is_hidden'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        update_row = (" UPDATE tbl_menus "
                      " SET is_hidden = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (is_hidden,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200


class MenuChildrenCollection:
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
                                   description='API.INVALID_MENU_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, path, name, parent_menu_id, is_hidden  "
                 " FROM tbl_menus "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row_current_menu = cursor.fetchone()
        if row_current_menu is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MENU_NOT_FOUND')
        current_menu = None
        current_menu_id = None
        if row_current_menu is not None and len(row_current_menu) > 0:
            current_menu = {"id": row_current_menu['id'],
                            "path": row_current_menu['path'],
                            "name": row_current_menu['name'],
                            "parent_menu_id": row_current_menu['parent_menu_id'],
                            "is_hidden": row_current_menu['is_hidden']}
            current_menu_id = row_current_menu['id']

        query = (" SELECT id, path, name, parent_menu_id, is_hidden"
                 " FROM tbl_menus "
                 " WHERE parent_menu_id = %s")
        cursor.execute(query, (current_menu_id,))
        rows_menus = cursor.fetchall()

        children_menus = []
        if rows_menus is not None and len(rows_menus) > 0:
            for row in rows_menus:
                children_menus.append(
                    {
                        "id": row['id'],
                        "path": row['path'],
                        "name": row['name'],
                        "parent_menu": current_menu,
                        "is_hidden": row['is_hidden']
                    }
                )

        result = {
            "current": current_menu,
            "children": children_menus,
        }

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)


class MenuWebCollection:
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

        query = (" SELECT id, path,  parent_menu_id, is_hidden "
                 " FROM tbl_menus "
                 " WHERE parent_menu_id is NULL "
                 " AND is_hidden=0 ")
        cursor.execute(query)
        rows_menus = cursor.fetchall()

        first_paths = {}
        if rows_menus is not None and len(rows_menus) > 0:
            for row in rows_menus:
                _id = row['id']
                path = row['path']
                first_paths[_id] = {
                    'path': path,
                    'children': []
                }

        query = (" SELECT id, path,  parent_menu_id, is_hidden "
                 " FROM tbl_menus "
                 " WHERE parent_menu_id is not NULL "
                 " AND is_hidden=0 ")
        cursor.execute(query)
        rows_menus = cursor.fetchall()

        if rows_menus is not None and len(rows_menus) > 0:
            for row in rows_menus:
                _id = row['id']
                parent_menu_id = row['parent_menu_id']
                path = row['path']
                if parent_menu_id in first_paths.keys():
                    first_paths[parent_menu_id]['children'].append(path)

        result = dict()
        for _id, item in first_paths.items():
            first_path = item['path']
            children = item['children']
            result[first_path] = children

        cursor.close()
        cnx.disconnect()
        resp.body = json.dumps(result)
