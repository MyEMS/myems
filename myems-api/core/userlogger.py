import os
from functools import wraps
import config
import mysql.connector
from datetime import datetime
import uuid
from gunicorn.http.body import Body
import simplejson as json


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
        print(str(e))
    finally:
        if cnx:
            cnx.disconnect()
        if cursor:
            cursor.close()


def user_logger(func):
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
        cookies = req.cookies
        if cookies is not None and 'user_uuid' in cookies.keys():
            user_uuid = cookies['user_uuid']
        else:
            # todo: deal with requests with NULL user_uuid
            print('user_logger: user_uuid is NULL')
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
                    write_log(user_uuid=user_uuid, request_method="POST", resource_type=class_name,
                              resource_id=kwargs.get('id_'), request_body=raw_json)
                os.remove(file_name)
            except Exception as e:
                print('user_logger:' + str(e))
            return
        elif func_name == "on_delete":
            try:
                func(*args, **kwargs)
                write_log(user_uuid=user_uuid, request_method="DELETE", resource_type=class_name,
                          resource_id=kwargs.get('id_'), request_body=json.dumps(kwargs))
            except Exception as e:
                print('user_logger:' + str(e))
            return

    return logger
