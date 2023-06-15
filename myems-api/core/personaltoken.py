import os
import importlib.util
import uuid
from datetime import datetime, timezone, timedelta

import falcon
import mysql.connector
import simplejson as json

import config
from core.utilities import get_class_names_in_the_parent_directory

class ClassCollection:
    @staticmethod
    def __init__():
        """Initializes ClassCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" select id, name, description "
                 " from tbl_classes ")
        cursor.execute(query)
        rows_classes = cursor.fetchall()
        
        clesses_list = list()
        if rows_classes is not None and len(rows_classes) > 0:
            for row in rows_classes:
                clesses_list.append({"id": row[0],
                                     "name": row[1],
                                     "uuid": row[2]})

        cursor.close()
        cnx.close()
        resp.text = json.dumps(clesses_list)

    @staticmethod
    def on_post(req, resp):
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
        
        new_values = json.loads(raw_json)

        if "name" not in new_values['data'].keys() or \
            not isinstance(new_values['data']['name'], str) or \
            len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CLASS_NAME')
        name = str.strip(new_values['data']['name'])

        if "description" not in new_values['data'].keys() or \
            not isinstance(new_values['data']['description'], str):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CLASS_DESCRIPTION')
        description = str.strip(new_values['data']['description'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_classes "
                       " WHERE name = %s ", (name,))
        row = cursor.fetchone()

        if row is not None:
            cursor.close()
            cnx.close()

            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.CLASS_NAME_IS_ALREADY_IN_USE')

        if name not in get_class_names_in_the_parent_directory(__file__):
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.NOT_FOUND',
                                   description='API.CLASS_NAME_NOT_FOUND')
        
        cursor.execute(" INSERT INTO tbl_classes "
                       " (name, decription) "
                       " VALUES(%s, %s) ", (name, description))
        
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/classes/' + str(new_id)


class ClassItem:
    @staticmethod
    def __init__():
        """Initializes ClassItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or id_ <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title="API.INVALID_CLASS_ID")
        
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, description "
                 " FROM tbl_classes "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CLASS_NOT_FOUND')
        else:
            meta_result = {"id": row[0],
                           "name": row[1],
                           "description": row[2]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    def on_put(req, resp, id_):
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or id_ <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title="API.INVALID_CLASS_ID")
        
        new_values = json.loads(raw_json)

        if "name" not in new_values['data'].keys() or \
            not isinstance(new_values['data']['name'], str) or \
            len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CLASS_NAME')
        name = str.strip(new_values['data']['name'])

        if "description" not in new_values['data'].keys() or \
            not isinstance(new_values['data']['description'], str):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CLASS_DESCRIPTION')
        description = str.strip(new_values['data']['description'])

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_classes "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CLASS_NOT_FOUND')
        
        cursor.execute(" SELECT name "
                       " FROM tbl_classes "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.CLASS_NAME_IS_ALREADY_IN_USE')

        cursor.execute(" UPDATE tbl_classes "
                       " set name = %s, descritpion = %s "
                       " WHERE id = %s ", (name, description, id_))
        cnx.commit()
        
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_CLASS_ID')

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_classes "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.CLASS_NOT_FOUND')

        # check relation with personal token
        cursor.execute(" SELECT id "
                       " FROM tbl_personal_tokens_classes "
                       " WHERE class_id = %s ", (id_,))
        rows = cursor.fetchall()
        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_PERSONAL_TOKENS')

        cursor.execute(" DELETE FROM tbl_personal_tokens_classes WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class PersonalTokenCollection: 
    @staticmethod
    def __init__():
        """Initializes RuleCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id, token, description, "
                       " create_datetime_utc, expire_datetime_utc"
                       " FROM tbl_personal_tokens ")
        rows = cursor.fetchall()
        
        result = list()
        if row is not None and len(rows) > 0:
            for row in rows:
                result.append({"id": row[0],
                               "name": row[1],
                               "description": row[2],
                               "create_datetime_utc": row[3],
                               "expire_datetime_utc": row[4]})

    @staticmethod
    def on_post(req, resp):
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')
            
        
class PersonalTokenItem: 
    @staticmethod
    def __init__():
        """Initializes RuleCollection"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigint() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_PERSONAL_TOKEN_ID')
        
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" select  ")