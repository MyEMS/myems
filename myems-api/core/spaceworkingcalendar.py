from datetime import datetime, timedelta, timezone

import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, access_control

import config

class SpaceNonWorkingDayCollection:
    @staticmethod
    def __init__():
        """"Initializes WebMessageCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_, startDate, endDate):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        start_datetime_utc = None
        if startDate is not None and len(str.strip(startDate)) > 0:
            start_datetime_utc = str.strip(startDate)
        else:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                    description="API.INVALID_START_DATETIME")

        end_datetime_utc = None
        if endDate is not None and len(str.strip(endDate)) > 0:
            end_datetime_utc = str.strip(endDate)
        else:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                    description="API.INVALID_END_DATETIME")

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT date_local "
                       " FROM tbl_spaces_non_working_days "
                       " WHERE space_id = %s AND"
                       " date_local >= %s AND"
                       " date_local <= %s"
                       , (id_, start_datetime_utc, end_datetime_utc))
        rows = cursor.fetchall()

        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

        result = dict()
        result['non_working_days'] = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                date = row[0].strftime("%Y-%m-%d")
                result['non_working_days'].append(date)
        resp.text = json.dumps(result)

class SpaceNonWorkingDayItem:
    @staticmethod
    def __init__():
        """"Initializes WebMessageCollection"""
        pass


    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')

        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=str(ex))
        
        new_values = json.loads(raw_json)

        if 'create_non_working_days_array' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['create_non_working_days_array'], (list, tuple)):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_')
        create_non_working_days_array = new_values['data']['create_non_working_days_array']

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        create_non_working_days_list= list()
        if len(create_non_working_days_array) > 0:
            add_row = (" INSERT INTO tbl_spaces_non_working_days"
                       " (space_id, date_local)"
                       " VALUES (%s, %s)")
            for create_non_working_day in create_non_working_days_array:
                create_non_working_days_list.append((id_, create_non_working_day))
            cursor.executemany(add_row, create_non_working_days_list)
            cnx.commit()
        
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/spaces/' + str(id_) + '/nonworkingdays/'

    @staticmethod
    @user_logger
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SPACE_ID')
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR', description=str(ex))

        new_values = json.loads(raw_json)

        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        if 'delete_non_working_days_array' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['delete_non_working_days_array'], (list, tuple)):
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_')
        delete_non_working_days_array = new_values['data']['delete_non_working_days_array']
        if len(delete_non_working_days_array) > 0:
            for delete_non_working_day in delete_non_working_days_array:
                cursor.execute(" DELETE from tbl_spaces_non_working_days "
                               " WHERE space_id = %s AND "
                               " date_local = %s", (id_, delete_non_working_day))
            cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200
