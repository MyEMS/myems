import os
import uuid
from datetime import datetime, timezone, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control
import config


class CostFileCollection:
    """
    Cost File Collection Resource

    This class handles CRUD operations for cost file collection.
    It provides endpoints for listing all cost files and creating new files.
    Cost files contain cost data for the energy management system.
    """
    def __init__(self):
        """Initialize CostFileCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        """Handle OPTIONS requests for CORS preflight"""
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """Handles GET requests"""
        admin_control(req)
        
        cnx = None
        cursor = None
        rows = []
        try:
            cnx = mysql.connector.connect(**config.myems_historical_db)
            try:
                cursor = cnx.cursor()

                query = (" SELECT id, file_name, uuid, upload_datetime_utc, status "
                         " FROM tbl_cost_files "
                         " ORDER BY upload_datetime_utc desc ")
                cursor.execute(query)
                rows = cursor.fetchall()
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meta_result = {"id": row[0],
                               "file_name": row[1],
                               "uuid": row[2],
                               "upload_datetime": (row[3].replace(tzinfo=timezone.utc)
                                                   + timedelta(minutes=timezone_offset)).isoformat()[0:19],
                               "status": row[4]}
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
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
            print("Failed to stream request")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_UPLOAD_COST_FILE')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_UPLOAD_COST_FILE')

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_UUID_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')

        # Database connection for User DB
        cnx_user_db = None
        cursor_user_db = None
        user_id = None
        
        try:
            cnx_user_db = mysql.connector.connect(**config.myems_user_db)
            try:
                cursor_user_db = cnx_user_db.cursor()

                query = (" SELECT utc_expires "
                         " FROM tbl_sessions "
                         " WHERE user_uuid = %s AND token = %s")
                cursor_user_db.execute(query, (user_uuid, token,))
                row = cursor_user_db.fetchone()

                if row is None:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
                
                utc_expires = row[0]
                if datetime.utcnow() > utc_expires:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.USER_SESSION_TIMEOUT')

                cursor_user_db.execute(" SELECT id "
                                       " FROM tbl_users "
                                       " WHERE uuid = %s ",
                                       (user_uuid,))
                row = cursor_user_db.fetchone()
                if row is None:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_USER_PLEASE_RE_LOGIN')
                user_id = row[0]
            finally:
                if cursor_user_db:
                    cursor_user_db.close()
        finally:
            if cnx_user_db:
                cnx_user_db.close()

        # Database connection for Historical DB
        cnx_historical_db = None
        cursor_historical_db = None
        new_id = None
        
        try:
            cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
            try:
                cursor_historical_db = cnx_historical_db.cursor()

                add_values = (" INSERT INTO tbl_cost_files "
                              " (file_name, uuid, upload_datetime_utc, status, file_object ) "
                              " VALUES (%s, %s, %s, %s, %s) ")
                cursor_historical_db.execute(add_values, (filename,
                                                          file_uuid,
                                                          datetime.utcnow(),
                                                          'new',
                                                          raw_blob))
                new_id = cursor_historical_db.lastrowid
                cnx_historical_db.commit()
            finally:
                if cursor_historical_db:
                    cursor_historical_db.close()
        finally:
            if cnx_historical_db:
                cnx_historical_db.close()

        resp.status = falcon.HTTP_201
        resp.location = '/costfiles/' + str(new_id)


class CostFileItem:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_FILE_ID')

        cnx = None
        cursor = None
        row = None
        try:
            cnx = mysql.connector.connect(**config.myems_historical_db)
            try:
                cursor = cnx.cursor()

                query = (" SELECT id, file_name, uuid, upload_datetime_utc, status "
                         " FROM tbl_cost_files "
                         " WHERE id = %s ")
                cursor.execute(query, (id_,))
                row = cursor.fetchone()
                
                if row is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.COST_FILE_NOT_FOUND')
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result = {"id": row[0],
                  "file_name": row[1],
                  "uuid": row[2],
                  "upload_datetime": (row[3].replace(tzinfo=timezone.utc)
                                      + timedelta(minutes=timezone_offset)).isoformat()[0:19],
                  "status": row[4]}
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_FILE_ID')

        cnx = None
        cursor = None
        file_uuid = None
        
        try:
            cnx = mysql.connector.connect(**config.myems_historical_db)
            try:
                cursor = cnx.cursor()

                cursor.execute(" SELECT uuid "
                               " FROM tbl_cost_files "
                               " WHERE id = %s ", (id_,))
                row = cursor.fetchone()
                if row is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.COST_FILE_NOT_FOUND')
                
                file_uuid = row[0]
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        # File deletion logic (outside DB transaction)
        try:
            # Define file_path
            file_path = os.path.join(config.upload_path, file_uuid)

            # remove the file from disk
            os.remove(file_path)
        except OSError as ex: 
            print("Failed to stream request")
        except Exception as ex:
            print(str(ex))
            # ignore exception and don't return API.COST_FILE_NOT_FOUND error
            pass

        # Re-connect to delete DB record
        cnx_del = None
        cursor_del = None
        try:
            cnx_del = mysql.connector.connect(**config.myems_historical_db)
            try:
                cursor_del = cnx_del.cursor()
                
                # Note: the energy data imported from the deleted file will not be deleted
                cursor_del.execute(" DELETE FROM tbl_cost_files WHERE id = %s ", (id_,))
                cnx_del.commit()
            finally:
                if cursor_del:
                    cursor_del.close()
        finally:
            if cnx_del:
                cnx_del.close()

        resp.status = falcon.HTTP_204


class CostFileRestore:
    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_COST_FILE_ID')

        cnx = None
        cursor = None
        row = None
        try:
            cnx = mysql.connector.connect(**config.myems_historical_db)
            try:
                cursor = cnx.cursor()

                query = (" SELECT uuid, file_object "
                         " FROM tbl_cost_files "
                         " WHERE id = %s ")
                cursor.execute(query, (id_,))
                row = cursor.fetchone()

                if row is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.COST_FILE_NOT_FOUND')
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        result = {"uuid": row[0],
                  "file_object": row[1]}
        try:
            raw_blob = result["file_object"]
            file_uuid = result["uuid"]

            # Define file_path
            file_path = os.path.join(config.upload_path, file_uuid)

            # Write to a temporary file to prevent incomplete files from
            # being used.
            temp_file_path = file_path + '~'

            with open(temp_file_path, 'wb') as f:
                f.write(raw_blob)

            # Now that we know the file has been fully saved to disk
            # move it into place.
            os.replace(temp_file_path, file_path)
        except OSError as ex: 
            print("Failed to stream request")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_RESTORE_COST_FILE')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_RESTORE_COST_FILE')
        resp.text = json.dumps('success')
