import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control
import config


class PrivilegeCollection:
    """
    Privilege Collection Resource

    This class handles privilege management operations for the MyEMS system.
    It provides functionality to create and retrieve user privileges
    that define access permissions and roles.
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
        Handle GET requests to retrieve all privileges

        Returns a list of all privileges with their metadata including:
        - Privilege ID and name
        - Privilege data (JSON configuration)

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        admin_control(req)
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        # Query to retrieve all privileges ordered by ID descending
        query = (" SELECT id, name, data "
                 " FROM tbl_privileges "
                 " ORDER BY id DESC ")
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
                               "data": row[2]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """
        Handle POST requests to create a new privilege

        Creates a new privilege with the specified name and data configuration.
        Requires admin privileges.

        Args:
            req: Falcon request object containing privilege data:
                - name: Privilege name (required)
                - data: Privilege data configuration (required)
            resp: Falcon response object
        """
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except UnicodeDecodeError as ex:
            print(f"Failed to decode request: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except json.JSONDecodeError as ex:
            print(f"Failed to parse JSON: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_JSON_FORMAT')
        except Exception as ex:
            print(f"Unexcept error reading request stream: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        # Validate privilege name
        if 'name' not in new_values['data'] or \
            not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIVILEGE_NAME')
        name = str.strip(new_values['data']['name'])

        # Validate privilege data
        if 'data' not in new_values['data'] or \
            not isinstance(new_values['data']['data'], str) or \
                len(str.strip(new_values['data']['data'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIVILEGE_DATA')
        data = str.strip(new_values['data']['data'])

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        # Check if privilege name already exists
        cursor.execute(" SELECT name "
                       " FROM tbl_privileges "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PRIVILEGE_NAME_IS_ALREADY_IN_USE')

        # Insert new privilege into database
        add_row = (" INSERT INTO tbl_privileges "
                   "             (name, data) "
                   " VALUES (%s, %s) ")

        cursor.execute(add_row, (name, data, ))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/privileges/' + str(new_id)


class PrivilegeItem:
    """
    Privilege Item Resource

    This class handles individual privilege operations including:
    - Updating privilege information
    - Deleting privileges (with relationship checks)
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
            id_: Privilege ID parameter
        """
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        """
        Handle DELETE requests to remove a privilege

        Deletes the specified privilege from the database.
        Checks for existing relationships with users before deletion.
        Requires admin privileges.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Privilege ID to delete
        """
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIVILEGE_ID')

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        # Check for relationships with users
        cursor.execute(" SELECT id "
                       " FROM tbl_users "
                       " WHERE privilege_id = %s ", (id_,))
        rows_users = cursor.fetchall()
        if rows_users is not None and len(rows_users) > 0:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.THERE_IS_RELATION_WITH_USERS')

        # Check if privilege exists
        cursor.execute(" SELECT name "
                       " FROM tbl_privileges "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PRIVILEGE_NOT_FOUND')

        # TODO: Delete associated objects before deleting privilege
        cursor.execute(" DELETE FROM tbl_privileges WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """
        Handle PUT requests to update privilege information

        Updates an existing privilege with new name and data configuration.
        Requires admin privileges.

        Args:
            req: Falcon request object containing update data:
                - name: New privilege name (required)
                - data: New privilege data configuration (required)
            resp: Falcon response object
            id_: Privilege ID to update
        """
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
        except UnicodeDecodeError as ex:
            print(f"Failed to decode request: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except json.JSONDecodeError as ex:
            print(f"Failed to parse JSON: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_JSON_FORMAT')
        except Exception as ex:
            print(f"Unexcept error reading request stream: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIVILEGE_ID')

        # Validate privilege name
        if 'name' not in new_values['data'] or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIVILEGE_NAME')
        name = str.strip(new_values['data']['name'])

        # Validate privilege data
        if 'data' not in new_values['data'] or \
                not isinstance(new_values['data']['data'], str) or \
                len(str.strip(new_values['data']['data'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PRIVILEGE_DATA')
        data = str.strip(new_values['data']['data'])

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        # Check if privilege exists
        cursor.execute(" SELECT name "
                       " FROM tbl_privileges "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.PRIVILEGE_NOT_FOUND')

        # Check if new name conflicts with existing privileges (excluding current)
        cursor.execute(" SELECT name "
                       " FROM tbl_privileges "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.PRIVILEGE_NAME_IS_ALREADY_IN_USE')

        # Update privilege information
        update_row = (" UPDATE tbl_privileges "
                      " SET name = %s, data = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name, data, id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200

