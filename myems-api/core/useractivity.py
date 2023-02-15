import os
import uuid
from datetime import datetime
from functools import wraps

import falcon
import mysql.connector
import simplejson as json
from gunicorn.http.body import Body

import config


def access_control(req):
    """
    Check administrator privilege in request headers to protect resources from invalid access
    :param req: HTTP request
    :return: HTTPError if invalid else None
    """
    if 'USER-UUID' not in req.headers or \
            not isinstance(req.headers['USER-UUID'], str) or \
            len(str.strip(req.headers['USER-UUID'])) == 0:
        raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                               description='API.INVALID_USER_UUID')
    admin_user_uuid = str.strip(req.headers['USER-UUID'])

    if 'TOKEN' not in req.headers or \
            not isinstance(req.headers['TOKEN'], str) or \
            len(str.strip(req.headers['TOKEN'])) == 0:
        raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                               description='API.INVALID_TOKEN')
    admin_token = str.strip(req.headers['TOKEN'])

    # Check administrator privilege
    cnx = mysql.connector.connect(**config.myems_user_db)
    cursor = cnx.cursor()
    query = (" SELECT utc_expires "
             " FROM tbl_sessions "
             " WHERE user_uuid = %s AND token = %s")
    cursor.execute(query, (admin_user_uuid, admin_token,))
    row = cursor.fetchone()

    if row is None:
        cursor.close()
        cnx.close()
        raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                               description='API.ADMINISTRATOR_SESSION_NOT_FOUND')
    else:
        utc_expires = row[0]
        if datetime.utcnow() > utc_expires:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ADMINISTRATOR_SESSION_TIMEOUT')
    query = (" SELECT name "
             " FROM tbl_users "
             " WHERE uuid = %s AND is_admin = 1 AND is_read_only = 0 ")
    cursor.execute(query, (admin_user_uuid,))
    row = cursor.fetchone()
    cursor.close()
    cnx.close()
    if row is None:
        raise falcon.HTTPError(falcon.HTTP_400, 'API.BAD_REQUEST', 'API.INVALID_PRIVILEGE')


def write_log(user_uuid, request_method, resource_type, resource_id, request_body):
    """
    :param user_uuid: user_uuid
    :param request_method: 'POST', 'PUT', 'DELETE'
    :param resource_type: class_name
    :param resource_id: int
    :param request_body: json in raw string
    """
    cnx = None
    cursor = None
    try:
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        add_row = (" INSERT INTO tbl_logs "
                   "    (user_uuid, request_datetime_utc, request_method, resource_type, resource_id, request_body) "
                   " VALUES (%s, %s, %s, %s, %s , %s) ")
        cursor.execute(add_row, (user_uuid,
                                 datetime.utcnow(),
                                 request_method,
                                 resource_type,
                                 resource_id if resource_id else None,
                                 request_body if request_body else None,
                                 ))
        cnx.commit()
    except Exception as e:
        print('write_log:' + str(e))
    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()


def user_logger(func):
    """
    Decorator for logging user activities
    :param func: the decorated function
    :return: the decorator
    """
    @wraps(func)
    def logger(*args, **kwargs):
        qualified_name = func.__qualname__
        class_name = qualified_name.split(".")[0]
        func_name = qualified_name.split(".")[1]

        if func_name not in ("on_post", "on_put", "on_delete"):
            # do not log for other HTTP Methods
            func(*args, **kwargs)
            return
        req, resp = args
        headers = req.headers
        if headers is not None and 'USER-UUID' in headers.keys():
            user_uuid = headers['USER-UUID']
        else:
            # todo: deal with requests with NULL user_uuid
            print('user_logger: USER-UUID is NULL')
            # do not log for NULL user_uuid
            func(*args, **kwargs)
            return

        if func_name == "on_post":
            try:
                file_name = str(uuid.uuid4())
                with open(file_name, "wb") as fw:
                    reads = req.stream.read()
                    fw.write(reads)
                raw_json = reads.decode('utf-8')
                with open(file_name, "rb") as fr:
                    req.stream = Body(fr)
                    func(*args, **kwargs)
                    write_log(user_uuid=user_uuid, request_method='POST', resource_type=class_name,
                              resource_id=kwargs.get('id_'), request_body=raw_json)
                os.remove(file_name)
            except Exception as e:
                if isinstance(e, falcon.HTTPError):
                    raise e
                else:
                    print('user_logger:' + str(e))
            return
        elif func_name == "on_put":
            try:
                file_name = str(uuid.uuid4())

                with open(file_name, "wb") as fw:
                    reads = req.stream.read()
                    fw.write(reads)
                raw_json = reads.decode('utf-8')
                with open(file_name, "rb") as fr:
                    req.stream = Body(fr)
                    func(*args, **kwargs)
                    write_log(user_uuid=user_uuid, request_method='PUT', resource_type=class_name,
                              resource_id=kwargs.get('id_'), request_body=raw_json)
                os.remove(file_name)
            except Exception as e:
                if isinstance(e, falcon.HTTPError):
                    raise e
                else:
                    print('user_logger:' + str(e))

            return
        elif func_name == "on_delete":
            try:
                func(*args, **kwargs)
                write_log(user_uuid=user_uuid, request_method="DELETE", resource_type=class_name,
                          resource_id=kwargs.get('id_'), request_body=json.dumps(kwargs))
            except Exception as e:
                if isinstance(e, falcon.HTTPError):
                    raise e
                else:
                    print('user_logger:' + str(e))
            return

    return logger
