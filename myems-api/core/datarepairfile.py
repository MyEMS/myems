import os
import uuid
from datetime import datetime, timezone, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control
import config


class DataRepairFileCollection:
    def __init__(self):
        """"Initializes DataRepairFileCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        _=req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        admin_control(req)
        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        query = (" SELECT id, file_name, uuid, upload_datetime_utc, status "
                 " FROM tbl_data_repair_files "
                 " ORDER BY upload_datetime_utc desc ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
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
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_UPLOAD_DATA_REPAIR_FILE')

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.USER_UUID_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')

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

        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        add_values = (" INSERT INTO tbl_data_repair_files "
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

        resp.status = falcon.HTTP_201
        resp.location = '/datarepairfiles/' + str(new_id)


class DataRepairFileItem:
    def __init__(self):
        """"Initializes DataRepairFileItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _=req
        resp.status = falcon.HTTP_200
        _=id_
    @staticmethod
    def on_get(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_REPAIR_FILE_ID')

        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        query = (" SELECT id, file_name, uuid, upload_datetime_utc, status "
                 " FROM tbl_data_repair_files "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_REPAIR_FILE_NOT_FOUND')

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
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_REPAIR_FILE_ID')

        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT uuid "
                       " FROM tbl_data_repair_files "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_REPAIR_FILE_NOT_FOUND')

        try:
            file_uuid = row[0]
            # Define file_path
            file_path = os.path.join(config.upload_path, file_uuid)

            # remove the file from disk
            os.remove(file_path)
        except Exception as ex:
            print(str(ex))
            # ignore exception and don't return API.DATA_REPAIR_FILE_NOT_FOUND error
            pass

        # Note: the energy data imported from the deleted file will not be deleted
        cursor.execute(" DELETE FROM tbl_data_repair_files WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204


class DataRepairFileRestore:
    def __init__(self):
        """"Initializes DataRepairFileRestore"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        _=req
        resp.status = falcon.HTTP_200
        _=id_
    @staticmethod
    def on_get(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DATA_REPAIR_FILE_ID')

        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        query = (" SELECT uuid, file_object "
                 " FROM tbl_data_repair_files "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()

        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DATA_REPAIR_FILE_NOT_FOUND')

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
        except Exception as ex:
            print(str(ex))
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_RESTORE_DATA_REPAIR_FILE')
        resp.text = json.dumps('success')
