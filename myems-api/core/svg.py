import falcon
import simplejson as json
import mysql.connector
import config
from core.useractivity import user_logger, access_control


class Collection:
    @staticmethod
    def __init__():
        """"Initializes svgCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, content "
                 " FROM tbl_svgs "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_svgs = cursor.fetchall()

        result = list()
        if rows_svgs is not None and len(rows_svgs) > 0:
            for row in rows_svgs:
                temp = {"id": row['id'],
                        "name": row['name'],
                        "content": row['content']}

                result.append(temp)

        cursor.close()
        cnx.disconnect()
        resp.text = json.dumps(result)


class Item:
    @staticmethod
    def __init__():
        """"Initializes svgItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_svg_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor(dictionary=True)

        query = (" SELECT id, name, content "
                 " FROM tbl_svgs "
                 " WHERE id=%s ")
        cursor.execute(query, (id_,))
        rows_svg = cursor.fetchone()

        result = None
        if rows_svg is not None and len(rows_svg) > 0:
            result = {"id": rows_svg['id'],
                      "name": rows_svg['name'],
                      "content": rows_svg['content']}
        else:
            cursor.close()
            cnx.disconnect()
            resp.text = json.dumps(result)

        query = (" SELECT id, svg_id, point_id, point_icon, point_x, point_y, meter_type, meter_id, meter_name, func"
                 " FROM tbl_svg_points "
                 " WHERE svg_id=%s ")
        cursor.execute(query, (id_,))
        rows_point = cursor.fetchall()

        add_svg = ""
        if rows_point is not None and len(rows_point) > 0:
            for row in rows_point:
                print("row", row)
                add_svg = add_svg + \
                          '<image id="{point_id}" onclick="{func}(\'{meter_type}\',{meter_id},\'{meter_name}\')" overflow="visible" width="80" height="80" xlink:href="{point_icon}"  transform="translate({point_x},{point_y})"> </image>\n'. \
                              format(point_id=row['point_id'],
                                     point_icon=row['point_icon'],
                                     point_x=row['point_x'],
                                     point_y=row['point_y'],
                                     func=row['func'],
                                     meter_type=row['meter_type'],
                                     meter_id=row['meter_id'],
                                     meter_name=row['meter_name'],
                                     )

            result['content'] = result['content'].replace("Template", add_svg)
        else:
            result['content'] = result['content'].replace("TEMPLATE", "")

        cursor.close()
        cnx.disconnect()
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        access_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.EXCEPTION', description=ex)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_svg_ID')

        new_values = json.loads(raw_json)

        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NAME')
        if 'content' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['content'], str):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CONTENT')

        name = new_values['data']['name']
        content = new_values['data']['content']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        update_row = (" UPDATE tbl_svgs "
                      " SET name = %s, content = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    content,
                                    id_))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_200
