import os
import hashlib
from datetime import datetime, timezone, timedelta
import falcon
import mysql.connector
import simplejson as json
import config
from core.useractivity import admin_control


class ApiKeyCollection:
    """
    API Key Collection Resource

    This class handles API key management operations for the MyEMS system.
    It provides functionality to create, retrieve, and manage API keys
    used for programmatic access to the MyEMS API.
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
        Handle GET requests to retrieve all API keys

        Returns a list of all API keys with their metadata including:
        - API key ID and name
        - Token (hashed)
        - Creation datetime
        - Expiration datetime

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        admin_control(req)
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        # Query to retrieve all API keys
        query = (" SELECT id, name, token, created_datetime_utc, expires_datetime_utc "
                 " FROM tbl_api_keys ")
        cursor.execute(query)
        rows = cursor.fetchall()

        # Build result list with timezone conversion
        token_list = list()
        if rows is not None and len(rows) > 0:
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            for row in rows:
                token_list.append({"id": row[0],
                                   "name": row[1],
                                   "token": row[2],
                                   "created_datetime": (row[3].replace(tzinfo=timezone.utc)
                                                        + timedelta(minutes=timezone_offset)).isoformat()[0:19],
                                   "expires_datetime": (row[4].replace(tzinfo=timezone.utc)
                                                        + timedelta(minutes=timezone_offset)).isoformat()[0:19]})

        cursor.close()
        cnx.close()
        resp.text = json.dumps(token_list)

    @staticmethod
    def on_post(req, resp):
        """
        Handle POST requests to create a new API key

        Creates a new API key with the specified name and expiration date.
        Generates a secure random token using SHA-512 hash.

        Args:
            req: Falcon request object containing API key data:
                - name: API key name (required)
                - expires_datetime: Expiration date (required)
            resp: Falcon response object
        """
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except json.JSONDecodeError as ex:
            print("Failed to parse JSON")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_JSON_FORMAT')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        # Validate API key name
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_API_KEY_NAME')
        name = str.strip(new_values['data']['name'])

        # Calculate timezone offset for datetime conversion
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # Parse and convert expiration datetime to UTC
        expires_datetime_local = datetime.strptime(new_values['data']['expires_datetime'], '%Y-%m-%dT%H:%M:%S')
        expires_datetime_utc = expires_datetime_local.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)

        # Generate secure random token
        token = hashlib.sha512(os.urandom(16)).hexdigest()
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        # Check if API key name already exists
        cursor.execute(" SELECT name FROM tbl_api_keys"
                       " WHERE name = %s ", (name,))
        rows = cursor.fetchall()

        if rows is not None and len(rows) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.API_KEY_NAME_IS_ALREADY_IN_USE')

        # Insert new API key into database
        cursor.execute(" INSERT INTO tbl_api_keys "
                       " (name, token, created_datetime_utc, expires_datetime_utc) "
                       " VALUES(%s, %s, %s, %s) ", (name, token, datetime.utcnow(), expires_datetime_utc))

        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/apikeys/' + str(new_id)


class ApiKeyItem:
    """
    API Key Item Resource

    This class handles individual API key operations including:
    - Retrieving a specific API key by ID
    - Updating API key information
    - Deleting API keys
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
            id_: API key ID parameter
        """
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """
        Handle GET requests to retrieve a specific API key by ID

        Retrieves a single API key with its metadata including:
        - API key ID and name
        - Token (hashed)
        - Creation datetime
        - Expiration datetime

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: API key ID to retrieve
        """
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title="API.INVALID_API_KEY_ID")

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        # Query to retrieve specific API key by ID
        query = (" SELECT id, name, token, created_datetime_utc, expires_datetime_utc "
                 " FROM tbl_api_keys "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.API_KEY_NOT_FOUND')
        else:
            # Convert UTC datetime to local timezone
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            meta_result = {"id": row[0],
                           "name": row[1],
                           "token": row[2],
                           "created_datetime": (row[3].replace(tzinfo=timezone.utc) +
                                                timedelta(minutes=timezone_offset)).isoformat()[0:19],
                           "expires_datetime": (row[4].replace(tzinfo=timezone.utc) +
                                                timedelta(minutes=timezone_offset)).isoformat()[0:19]}

        resp.text = json.dumps(meta_result)

    @staticmethod
    def on_put(req, resp, id_):
        """
        Handle PUT requests to update an API key

        Updates an existing API key with new name and expiration date.
        The token itself cannot be changed - only metadata.

        Args:
            req: Falcon request object containing update data:
                - name: New API key name (required)
                - expires_datetime: New expiration date (required)
            resp: Falcon response object
            id_: API key ID to update
        """
        admin_control(req)
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
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title="API.INVALID_API_KEY_ID")

        new_values = json.loads(raw_json)

        # Validate API key name
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_API_KEY_NAME')
        name = str.strip(new_values['data']['name'])

        # Validate expiration datetime
        if 'expires_datetime' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['expires_datetime'], str) or \
                len(str.strip(new_values['data']['expires_datetime'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPIRES_DATETIME')
        expires_datetime_local = str.strip(new_values['data']['expires_datetime'])

        # Calculate timezone offset for datetime conversion
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # Parse and convert expiration datetime to UTC
        try:
            expires_datetime_local = datetime.strptime(expires_datetime_local, '%Y-%m-%dT%H:%M:%S')
            expires_datetime_utc = expires_datetime_local.replace(tzinfo=timezone.utc) - \
                timedelta(minutes=timezone_offset)
        except ValueError:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_EXPIRES_DATETIME")

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        # Check if new name conflicts with existing API keys
        cursor.execute(" SELECT name "
                       " FROM tbl_api_keys "
                       " WHERE name = %s ", (name,))
        if cursor.fetchall() is not None and \
                len(cursor.fetchall()) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.API_KEY_NAME_IS_ALREADY_IN_USE')

        # Check if API key exists
        cursor.execute(" SELECT token "
                       " FROM tbl_api_keys "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.API_KEY_NOT_FOUND')

        # Update API key information
        cursor.execute(" UPDATE tbl_api_keys "
                       " SET name = %s, expires_datetime_utc = %s "
                       " WHERE id = %s ", (name, expires_datetime_utc, id_))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200

    @staticmethod
    def on_delete(req, resp, id_):
        """
        Handle DELETE requests to remove an API key

        Deletes the specified API key from the database.
        This action cannot be undone.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: API key ID to delete
        """
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_API_KEY_ID')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        # Check if API key exists before deletion
        cursor.execute(" SELECT token "
                       " FROM tbl_api_keys "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.API_KEY_NOT_FOUND')

        # Delete the API key
        cursor.execute(" DELETE FROM tbl_api_keys WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204
