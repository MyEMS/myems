import re

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

        query = (" SELECT id, name "
                 " FROM tbl_svgs "
                 " ORDER BY id ")
        cursor.execute(query)
        rows_svgs = cursor.fetchall()

        result = list()
        if rows_svgs is not None and len(rows_svgs) > 0:
            for row in rows_svgs:
                temp = {"id": row['id'],
                        "name": row['name']}

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

        tmp_content = result['content']
        # Get all ids
        ids = re.findall(r'<text id="(.*?)" .*?>8*</text>', tmp_content)  # # ['PT100', 'PT101']
        # Get All Data
        """
        数据点 Point 代码 PT
        计量表 Meter 代号 MT
        虚拟表 VirtualMeter 代号 VM
        离线表 OfflineMeter 代码 OM
        空间 Space 代号 SP
        传感器 Sensor 代号 SS
        设备 Equipment 代号 EQ
        组合设备 CombinedEquipment 代码 CE
        车间 Shopfloor代码 SF
        """
        _dict = {
            'PT': {},
            'MT': {},
            'VM': {},
            'OM': {},
            'SP': {},
            'SS': {},
            'EQ': {},
            'CE': {},
            'SF': {},
        }

        # Group the tag
        for item in ids:
            _type = item[0:2]
            _number = item[2:]
            if _number not in _dict[_type].keys():
                _dict[_type][_number] = 111

        # Todo: Get data from database

        # Replace
        for item in ids:
            r_type = item[0:2]
            r_id = item[2:]
            tmp_content = re.sub(r'<text id="' + item + '" (?P<other>.*?)>8*</text>',
                                 r'<text id="' + item + '" \g<other> >' + str(_dict[r_type][r_id]) + '</text>',
                                 tmp_content)

        result['content'] = tmp_content
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
