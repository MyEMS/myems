from datetime import datetime, timedelta, timezone
import falcon
from core.useractivity import user_logger, access_control
import simplejson as json
import time
import hashlib
import requests
import config


class TicketCollection:
    """
    Ticket Collection Resource

    This class handles ticket operations for the MyEMS workflow system.
    It provides functionality to retrieve tickets from the workflow service
    with filtering by date range and status.
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """
        Handle GET requests to retrieve tickets from workflow system

        Retrieves tickets based on date range and status filters.
        Communicates with the MyEMS workflow service to fetch ticket data.

        Args:
            req: Falcon request object with query parameters:
                - startdatetime: Start date for filtering (required)
                - enddatetime: End date for filtering (required)
                - status: Ticket status filter (required)
            resp: Falcon response object
        """
        access_control(req)
        start_datetime_local = req.params.get('startdatetime')
        end_datetime_local = req.params.get('enddatetime')
        status = req.params.get('status')

        # Calculate timezone offset for datetime conversion
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # Validate and parse start datetime
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

        # Validate and parse end datetime
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

        # Validate date range
        if start_datetime_utc >= end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.START_DATETIME_MUST_BE_EARLIER_THAN_END_DATETIME')

        # Validate status parameter
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

        # Prepare workflow service authentication
        workflow_base_url = config.myems_workflow['base_url']
        token = config.myems_workflow['token']
        app_name = config.myems_workflow['app_name']
        user_name = config.myems_workflow['user_name']

        # Generate authentication signature
        timestamp = str(time.time())[:10]
        ori_str = timestamp + token
        signature = hashlib.md5(ori_str.encode(encoding='utf-8')).hexdigest()
        headers = dict(signature=signature, timestamp=timestamp, appname=app_name, username=user_name)

        # Request tickets from workflow service
        get_data = dict(per_page=20, category='all')
        r = requests.get(workflow_base_url + 'tickets', headers=headers, params=get_data)
        resp.text = json.dumps(r.text)


class TicketItem:
    """
    Ticket Item Resource

    This class handles individual ticket operations including:
    - Retrieving a specific ticket by ID
    - Updating ticket status
    - Deleting tickets
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Ticket ID parameter
        """
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """
        Handle GET requests to retrieve a specific ticket by ID

        Retrieves a single ticket from the workflow service based on the provided ID.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Ticket ID to retrieve
        """
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TICKET_ID')

        # Prepare workflow service authentication
        workflow_base_url = config.myems_workflow['base_url']
        token = config.myems_workflow['token']
        app_name = config.myems_workflow['app_name']
        user_name = config.myems_workflow['user_name']

        # Generate authentication signature
        timestamp = str(time.time())[:10]
        ori_str = timestamp + token
        signature = hashlib.md5(ori_str.encode(encoding='utf-8')).hexdigest()
        headers = dict(signature=signature, timestamp=timestamp, appname=app_name, username=user_name)

        # Request specific ticket from workflow service
        get_data = dict()
        r = requests.get(workflow_base_url + 'tickets/' + str(id_), headers=headers, params=get_data)
        resp.text = json.dumps(r.text)

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """
        Handle PUT requests to update a ticket

        Updates a specific ticket in the workflow system.
        Currently marked as TODO - implementation pending.

        Args:
            req: Falcon request object containing update data
            resp: Falcon response object
            id_: Ticket ID to update
        """
        access_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TICKET_ID')

        # TODO: Implement ticket update functionality
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        """
        Handle DELETE requests to remove a ticket

        Deletes a specific ticket from the workflow system.
        Currently marked as TODO - implementation pending.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Ticket ID to delete
        """
        access_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_TICKET_ID')
        # TODO: Implement ticket deletion functionality
        resp.status = falcon.HTTP_204

