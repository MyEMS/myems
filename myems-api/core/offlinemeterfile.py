import falcon
import json
import mysql.connector
import config
import uuid
from datetime import datetime, timezone
import os


class OfflineMeterFileCollection:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        query = (" SELECT id, file_name, uuid, upload_datetime_utc, status "
                 " FROM tbl_offline_meter_files "
                 " ORDER BY upload_datetime_utc desc ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.disconnect()

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                upload_datetime = row[3]
                upload_datetime = upload_datetime.replace(tzinfo=timezone.utc)
                meta_result = {"id": row[0],
                               "file_name": row[1],
                               "uuid": row[2],
                               "upload_datetime": upload_datetime.timestamp() * 1000,
                               "status": row[4]}
                result.append(meta_result)

        resp.body = json.dumps(result)

    @staticmethod
    def on_post(req, resp):
        """Handles POST requests"""
        try:
            upload = req.get_param('file')
            # Read upload file as binary
            raw_blob = upload.file.read()
            # Retrieve filename
            filename = upload.filename
            file_uuid = str(uuid.uuid4())

            # Define file_path
            file_path = os.path.join(config.upload_path, file_uuid)

            # Write to a temporary file to prevent incomplete files from
            # being used.
            temp_file_path = file_path + '~'

            open(temp_file_path, 'wb').write(raw_blob)

            # Now that we know the file has been fully saved to disk
            # move it into place.
            os.rename(temp_file_path, file_path)
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR',
                                   description='API.FAILED_TO_UPLOAD_OFFLINE_METER_FILE')

        # Verify User Session
        token = req.headers.get('TOKEN')
        user_uuid = req.headers.get('USER-UUID')
        if token is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.TOKEN_NOT_FOUND_IN_HEADERS_PLEASE_LOGIN')
        if user_uuid is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_SESSION_PLEASE_RE_LOGIN')
        else:
            utc_expires = row[0]
            if datetime.utcnow() > utc_expires:
                if cursor:
                    cursor.close()
                if cnx:
                    cnx.disconnect()
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
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
                cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_USER_PLEASE_RE_LOGIN')
        else:
            user_id = row[0]

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
        cnx.disconnect()

        resp.status = falcon.HTTP_201
        resp.location = '/offlinemeterfiles/' + str(new_id)


class OfflineMeterFileItem:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_FILE_ID')

        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        query = (" SELECT id, file_name, uuid, upload_datetime_utc, status "
                 " FROM tbl_offline_meter_files "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.disconnect()
        if row is None:
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_FILE_NOT_FOUND')

        upload_datetime = row[3]
        upload_datetime = upload_datetime.replace(tzinfo=timezone.utc)

        result = {"id": row[0],
                  "file_name": row[1],
                  "uuid": row[2],
                  "upload_datetime": upload_datetime.timestamp() * 1000,
                  "status": row[4]}
        resp.body = json.dumps(result)

    @staticmethod
    def on_delete(req, resp, id_):
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_FILE_ID')

        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT uuid "
                       " FROM tbl_offline_meter_files "
                       " WHERE id = %s ", (id_,))
        row = cursor.fetchone()
        if row is None:
            cursor.close()
            cnx.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.OFFLINE_METER_FILE_NOT_FOUND')

        try:
            file_uuid = row[0]
            # Define file_path
            file_path = os.path.join(config.upload_path, file_uuid)

            # remove the file from disk
            os.remove(file_path)
        except Exception as ex:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.ERROR',
                                   description='API.OFFLINE_METER_FILE_NOT_FOUND')

        # Note: the energy data imported from the deleted file will not be deleted
        cursor.execute(" DELETE FROM tbl_offline_meter_files WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.disconnect()

        resp.status = falcon.HTTP_204
