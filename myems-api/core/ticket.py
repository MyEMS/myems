from datetime import datetime, timedelta, timezone
import falcon
from core.useractivity import user_logger, access_control
import simplejson as json
import time
import hashlib
import requests
import config


class TicketCollection:
    def __init__(self):
        """"Initializes TicketCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ =req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        access_control(req)
        start_datetime_local = req.params.get('startdatetime')
        end_datetime_local = req.params.get('enddatetime')
        status = req.params.get('status')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if start_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_START_DATETIME_FORMAT")
        else:
            start_datetime_local = str.strip(start_datetime_local)
            try:
                start_datetime_utc = datetime.strptime(start_datetime_local,
                                                       '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                     timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_START_DATETIME_FORMAT")

        if end_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_END_DATETIME_FORMAT")
        else:
            end_datetime_local = str.strip(end_datetime_local)
            try:
                end_datetime_utc = datetime.strptime(end_datetime_local,
                                                     '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                                   timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_END_DATETIME_FORMAT")

        if start_datetime_utc >= end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.START_DATETIME_MUST_BE_EARLIER_THAN_END_DATETIME')

        if status is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_STATUS")
        else:
            status = str.lower(str.strip(status))
            if status not in ['new', 'read', 'acknowledged', 'all']:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_STATUS')
            else:
                if status == 'all':
                    status_query = ""
                else: 
                    status_query = "status = '" + status + "' AND "

        workflow_base_url = config.myems_workflow['base_url']
        token = config.myems_workflow['token']
        app_name = config.myems_workflow['app_name']
        user_name = config.myems_workflow['user_name']

        timestamp = str(time.time())[:10]
        ori_str = timestamp + token
        signature = hashlib.md5(ori_str.encode(encoding='utf-8')).hexdigest()
        headers = dict(signature=signature, timestamp=timestamp, appname=app_name, username=user_name)

        get_data = dict(per_page=20, category='all')
        r = requests.get(workflow_base_url + 'tickets', headers=headers, params=get_data)
        resp.text = json.dumps(r.text)


class TicketItem:
    def __init__(self):
        """"Initializes TicketItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ =req
        resp.status = falcon.HTTP_200
        _ =id_
    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TICKET_ID')

        workflow_base_url = config.myems_workflow['base_url']
        token = config.myems_workflow['token']
        app_name = config.myems_workflow['app_name']
        user_name = config.myems_workflow['user_name']

        timestamp = str(time.time())[:10]
        ori_str = timestamp + token
        signature = hashlib.md5(ori_str.encode(encoding='utf-8')).hexdigest()
        headers = dict(signature=signature, timestamp=timestamp, appname=app_name, username=user_name)

        get_data = dict()
        r = requests.get(workflow_base_url + 'tickets/' + str(id_), headers=headers, params=get_data)
        resp.text = json.dumps(r.text)

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        access_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TICKET_ID')

        # TODO
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TICKET_ID')
        # todo
        resp.status = falcon.HTTP_204

