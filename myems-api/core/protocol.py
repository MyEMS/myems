from datetime import datetime, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class ProtocolCollection:
    """
    Protocol Collection Resource

    This class handles CRUD operations for protocol collection.
    It provides endpoints for listing all protocols and creating new protocols.
    Protocols define communication standards used by data sources.
    """
    def __init__(self):
        """Initialize ProtocolCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        """Handle OPTIONS requests for CORS preflight"""
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """
        Handle GET requests to retrieve all protocols

        Returns a list of all protocols with their metadata including:
        - Protocol ID
        - Protocol name
        - Protocol code

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        # Check authentication - use API key if provided, otherwise use access control
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        # Connect to database and execute query
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, code "
                 " FROM tbl_protocols "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

        # Build result list
        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "code": row[2]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """
        Handle POST requests to create a new protocol

        Creates a new protocol with the specified name and code.
        Validates that both name and code are unique.

        Args:
            req: Falcon request object containing protocol data:
                - name: Protocol name (required)
                - code: Protocol code (required)
            resp: Falcon response object
        """
        admin_control(req)

        # Read and parse request body
        try:
            raw_json = req.stream.read().decode('utf-8')
        except UnicodeDecodeError as ex:
            print(f"Failed to decode request: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print(f"Unexcept error reading request stream: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        # Validate protocol name
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PROTOCOL_NAME')
        name = str.strip(new_values['data']['name'])

        # Validate protocol code
        if 'code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['code'], str) or \
                len(str.strip(new_values['data']['code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PROTOCOL_CODE')
        code = str.strip(new_values['data']['code'])

        # Connect to database
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Check if protocol name already exists
        cursor.execute(" SELECT name "
                       " FROM tbl_protocols "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PROTOCOL_NAME_IS_ALREADY_IN_USE')

        # Check if protocol code already exists
        cursor.execute(" SELECT code "
                       " FROM tbl_protocols "
                       " WHERE code = %s ", (code,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PROTOCOL_CODE_IS_ALREADY_IN_USE')

        # Insert new protocol
        add_row = (" INSERT INTO tbl_protocols "
                   "     (name, code) "
                   " VALUES (%s, %s) ")

        cursor.execute(add_row, (name,
                                 code))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/protocols/' + str(new_id)


class ProtocolItem:
    """
    Protocol Item Resource

    This class handles individual protocol operations.
    It provides endpoints for retrieving, updating, and deleting specific protocols.
    """

    def __init__(self):
        """Initialize ProtocolItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        """Handle OPTIONS requests for CORS preflight"""
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """
        Handle GET requests to retrieve a specific protocol

        Returns the protocol details for the specified ID.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Protocol ID to retrieve
        """
        # Check authentication - use API key if provided, otherwise use access control
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        # Validate protocol ID
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PROTOCOL_ID')

        # Connect to database and execute query
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, code "
                 " FROM tbl_protocols "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        # Check if protocol exists
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PROTOCOL_NOT_FOUND')

        # Build result
        result = {"id": row[0],
                  "name": row[1],
                  "code": row[2]}
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        """
        Handle DELETE requests to delete a specific protocol

        Deletes the protocol with the specified ID.
        Checks if the protocol is being used by any data sources before deletion.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Protocol ID to delete
        """
        admin_control(req)

        # Validate protocol ID
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title='API.BAD_REQUEST',
                description='API.INVALID_PROTOCOL_ID'
            )

        # Connect to database
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Check if protocol exists
        cursor.execute("SELECT name,code FROM tbl_protocols WHERE id = %s", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(
                status=falcon.HTTP_404,
                title='API.NOT_FOUND',
                description='API.PROTOCOL_NOT_FOUND'
            )

        # Check if this protocol is being used by any data sources
        code = row[1]
        cursor.execute(" SELECT name "
                       " FROM tbl_data_sources "
                       " WHERE protocol = %s "
                       " LIMIT 1 ",
                       (code,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_DATA_SOURCES')

        # Delete the protocol
        cursor.execute(" DELETE FROM tbl_protocols WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()
        resp.status = falcon.HTTP_204



    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """
        Handle PUT requests to update a specific protocol

        Updates the protocol with the specified ID.
        Validates that the new name and code are unique.

        Args:
            req: Falcon request object containing updated protocol data:
                - name: Updated protocol name (required)
                - code: Updated protocol code (required)
            resp: Falcon response object
            id_: Protocol ID to update
        """
        admin_control(req)

        # Read and parse request body
        try:
            raw_json = req.stream.read().decode('utf-8')
        except UnicodeDecodeError as ex:
            print(f"Failed to decode request: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print(f"Unexcept error reading request stream: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        # Validate protocol ID
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PROTOCOL_ID')

        new_values = json.loads(raw_json)

        # Validate protocol name
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PROTOCOL_NAME')
        name = str.strip(new_values['data']['name'])

        # Validate protocol code
        if 'code' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['code'], str) or \
                len(str.strip(new_values['data']['code'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PROTOCOL_CODE')
        code = str.strip(new_values['data']['code'])

        # Connect to database
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Check if protocol exists
        cursor.execute(" SELECT name "
                       " FROM tbl_protocols "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PROTOCOL_NOT_FOUND')

        # Check if new name already exists (excluding current protocol)
        cursor.execute(" SELECT name "
                       " FROM tbl_protocols "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PROTOCOL_NAME_IS_ALREADY_IN_USE')

        # Check if new code already exists (excluding current protocol)
        cursor.execute(" SELECT code "
                       " FROM tbl_protocols "
                       " WHERE code = %s AND id != %s ", (code, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PROTOCOL_CODE_IS_ALREADY_IN_USE')

        # Update the protocol
        update_row = (" UPDATE tbl_protocols "
                      " SET name = %s, code = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    code,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200



