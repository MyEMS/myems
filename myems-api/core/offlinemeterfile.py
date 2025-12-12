import os
import uuid
from datetime import datetime, timezone, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control, access_control, api_key_control
import config


class OfflineMeterFileCollection:
    """
    Offline Meter File Collection Resource

    This class handles CRUD operations for offline meter file collection.
    It provides endpoints for listing all uploaded offline meter files and uploading new files.
    Offline meter files are used for importing energy data from external sources.
    """
    def __init__(self):
        """Initialize OfflineMeterFileCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        """Handle OPTIONS requests for CORS preflight"""
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """
        Handle GET requests to retrieve all offline meter files

        Returns a list of all uploaded offline meter files with their metadata including:
        - File ID, name, and UUID
        - Upload datetime (converted to local timezone)
        - Processing status

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

        # Connect to historical database
        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        # Get all offline meter files ordered by upload time
        query = (" SELECT id, file_name, uuid, upload_datetime_utc, status "
                 " FROM tbl_offline_meter_files "
                 " ORDER BY upload_datetime_utc desc ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

        # Calculate timezone offset for datetime conversion
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # Build result list with converted datetime
        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "file_name": row[1],
                               "uuid": row[2],
                               "upload_datetime": (row[3].replace(tzinfo=timezone.utc) +
                                                   timedelta(minutes=timezone_offset)).isoformat()[0:19],
                               "status": row[4]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """
        Handle POST requests to upload a new offline meter file

        Uploads a file containing offline meter data for processing.
        The file is saved to disk and metadata is stored in the database.

        Args:
            req: Falcon request object containing file upload
            resp: Falcon response object
        """
        admin_control(req)

        try:
            # Get uploaded file from request
            upload = req.get_param('file')
            # Read upload file as binary
            raw_blob = upload.file.read()
            # Retrieve filename
            filename = upload.filename
            file_uuid = str(uuid.uuid4())

            # Define file_path
            file_path = os.path.join(config.upload_path, file_uuid)

            # Write to a temporary file to prevent incomplete files from being used.
            with open(file_path + '~', 'wb') as f:
                f.write(raw_blob)

            # Now that we know the file has been fully saved to disk move it into place.
            os.rename(file_path + '~', file_path)
        except OSError as ex:
            print(f"Failed to stream request: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_UPLOAD_OFFLINE_METER_FILE')
        except IOError as ex:
            print(f"Failed to IO request: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_UPLOAD_OFFLINE_METER_FILE')
        except Exception as ex:
            print(f"Unexcept error reading request stream: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_UPLOAD_OFFLINE_METER_FILE')

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_UUID_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')

        # Validate user session
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT utc_expires "
                 " FROM tbl_sessions "
                 " WHERE user_uuid = %s AND token = %s")
        cursor.execute(query, (user_uuid, token,))
        row = cursor.fetchone()

        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.close()
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.USER_SESSION_TIMEOUT')

        # Verify user exists
        cursor.execute(" SELECT id "
                       " FROM tbl_users "
                       " WHERE uuid = %s ",
                       (user_uuid,))
        row = cursor.fetchone()
        if row is None:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')

        # Save file metadata to database
        try:
            cnx = mysql.connector.connect(**config.myems_historical_db)
            cursor = cnx.cursor()

            add_values = (" INSERT INTO tbl_offline_meter_files "
                          " (file_name, uuid, upload_datetime_utc, status, file_object ) "
                          " VALUES (%s, %s, %s, %s, %s) ")
            cursor.execute(add_values, (filename,
                                        file_uuid,
                                        datetime.utcnow(),
                                        'new',
                                        raw_blob))
            new_id = cursor.lastrowid
            cnx.commit()
            cursor.close()
            cnx.close()
        except InterfaceError as e:
            print(f"Failed to connect request: {str(e)}")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_SAVE_OFFLINE_METER_FILE')
        except ProgrammingError as e:
            print(f"Failed to SQL request: {str(e)}")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_SAVE_OFFLINE_METER_FILE')
        except DataError as e:
            print(f"Failed to SQL Data request: {str(e)}")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_SAVE_OFFLINE_METER_FILE')
        except Exception as e:
            print("API.FAILED_TO_SAVE_OFFLINE_METER_FILE " + str(e))
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_SAVE_OFFLINE_METER_FILE')

        resp.status = falcon.HTTP_201
        resp.location = '/offlinemeterfiles/' + str(new_id)


class OfflineMeterFileItem:
    """
    Offline Meter File Item Resource

    This class handles individual offline meter file operations.
    It provides endpoints for retrieving and deleting specific offline meter files.
    """

    def __init__(self):
        """Initialize OfflineMeterFileItem"""
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
        Handle GET requests to retrieve a specific offline meter file

        Returns the offline meter file details for the specified ID.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Offline meter file ID to retrieve
        """
        admin_control(req)

        # Validate file ID
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_FILE_ID')

        # Connect to historical database
        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        # Get file details
        query = (" SELECT id, file_name, uuid, upload_datetime_utc, status "
                 " FROM tbl_offline_meter_files "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        # Check if file exists
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_FILE_NOT_FOUND')

        # Calculate timezone offset for datetime conversion
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # Build result with converted datetime
        result = {"id": row[0],
                  "file_name": row[1],
                  "uuid": row[2],
                  "upload_datetime": (row[3].replace(tzinfo=timezone.utc) +
                                      timedelta(minutes=timezone_offset)).isoformat()[0:19],
                  "status": row[4]}
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        """
        Handle DELETE requests to delete a specific offline meter file

        Deletes the offline meter file with the specified ID.
        Removes both the file from disk and metadata from database.
        Note: Energy data imported from the deleted file will not be deleted.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Offline meter file ID to delete
        """
        admin_control(req)

        # Validate file ID
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_FILE_ID')

        # Connect to historical database
        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        # Get file UUID for file deletion
        cursor.execute(" SELECT uuid "
                       " FROM tbl_offline_meter_files "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_FILE_NOT_FOUND')

        # Remove file from disk
        try:
            file_uuid = row[0]
            # Define file_path
            file_path = os.path.join(config.upload_path, file_uuid)

            # remove the file from disk
            os.remove(file_path)
        except OSError as ex:
            print(f"Failed to stream request: {str(ex)}")
        except IOError as ex:
            print(f"Failed to IO request: {str(ex)}")
        except Exception as ex:
            print(f"Unexcept error reading request stream: {str(ex)}")
            # ignore exception and don't return API.OFFLINE_METER_FILE_NOT_FOUND error
            pass

        # Note: the energy data imported from the deleted file will not be deleted
        cursor.execute(" DELETE FROM tbl_offline_meter_files WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class OfflineMeterFileRestore:
    """
    Offline Meter File Restore Resource

    This class handles restoring offline meter files from database to disk.
    It provides functionality to restore files that may have been lost from disk.
    """

    def __init__(self):
        """Initialize OfflineMeterFileRestore"""
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
        Handle GET requests to restore a specific offline meter file

        Restores the offline meter file from database to disk.
        This is useful when files have been lost from disk but metadata still exists.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Offline meter file ID to restore
        """
        admin_control(req)

        # Validate file ID
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_FILE_ID')

        # Connect to historical database
        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        # Get file data from database
        query = (" SELECT uuid, file_object "
                 " FROM tbl_offline_meter_files "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        # Check if file exists in database
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_FILE_NOT_FOUND')

        # Restore file to disk
        result = {"uuid": row[0],
                  "file_object": row[1]}
        try:
            raw_blob = result["file_object"]
            file_uuid = result["uuid"]

            # Define file_path
            file_path = os.path.join(config.upload_path, file_uuid)

            # Write to a temporary file to prevent incomplete files from being used.
            temp_file_path = file_path + '~'

            with open(temp_file_path, 'wb') as f:
                f.write(raw_blob)

            # Now that we know the file has been fully saved to disk move it into place.
            os.replace(temp_file_path, file_path)
        except OSError as ex:
            print(f"Failed to stream request: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_RESTORE_OFFLINE_METER_FILE')
        except IOError as ex:
            print(f"Failed to IO request: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_RESTORE_OFFLINE_METER_FILE')
        except Exception as ex:
            print(f"Unexcept error reading request stream: {str(ex)}")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_RESTORE_OFFLINE_METER_FILE')
        resp.text = json.dumps('success')
