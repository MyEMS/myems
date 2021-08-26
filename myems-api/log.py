import os
from functools import wraps
import config
import mysql.connector
from datetime import datetime, timezone
import uuid
from gunicorn.http.body import Body


def write_log(user_uuid, action, _class, record_id, record_text):
    """
    :param user_uuid: user_uuid
    :param action: create, update, delete and others: login, logout, reset password, change password
    :param _class: class_name
    :param record_id: int
    :param record_text: str
    """
    now = datetime.utcnow()
    cnx = None
    cursor = None
    try:
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT display_name "
                       " FROM tbl_users "
                       " WHERE uuid = %s ",
                       (user_uuid,))
        row = cursor.fetchone()
        user = dict()
        if row is not None and len(row) > 0:
            user["name"] = row[0]
        else:
            user["name"] = "visitor"

        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        add_row = (" INSERT INTO tbl_action_logs "
                   "    (user_name, date_time_utc, action, class, record_id, record_text) "
                   " VALUES (%s, %s, %s, %s, %s , %s) ")
        cursor.execute(add_row, (user['name'],
                                 now,
                                 action,
                                 _class,
                                 record_id if record_id else None,
                                 record_text if record_text else None,
                                 ))
        cnx.commit()
    except Exception as e:
        print(str(e))
    finally:
        if cnx:
            cnx.disconnect()
        if cursor:
            cursor.close()


def judge_admin(user_uuid):
    cnx = None
    cursor = None
    try:
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()
        cursor.execute(" SELECT is_admin "
                       " FROM tbl_users "
                       " WHERE uuid = %s ",
                       (user_uuid,))
        row = cursor.fetchone()
        user = dict()
        if row is not None and len(row) > 0:
            user["admin"] = True if row[0] == 1 else False
        else:
            user["admin"] = False
        return user["admin"]
    except Exception as e:
        print(str(e))
        return False
    finally:
        if cnx:
            cnx.disconnect()
        if cursor:
            cursor.close()


def decorator_record_action_log(func):
    @wraps(func)
    def log_fun(*args, **kwargs):
        type_dict = {
            "on_post": "create",
            "on_put": "update",
            "on_delete": "delete",
        }

        func_names = func.__qualname__
        class_name = func_names.split(".")[0]
        fun_name = func_names.split(".")[1]

        # Judge on_post, on_put, on_delete
        if fun_name not in type_dict.keys():
            return func(*args, **kwargs)

        action = type_dict.get(fun_name)

        # Judge is_admin or not
        if len(args) > 1:
            req, resp = args
            cookies = req.cookies
            if cookies is not None and 'user_uuid' in cookies.keys():
                user_uuid = cookies['user_uuid']
                is_admin = judge_admin(user_uuid)
            else:
                user_uuid = None
                is_admin = False
        else:
            return func(*args, **kwargs)
        if not is_admin:
            return func(*args, **kwargs)

        if class_name == "UserLogin":
            action = "login"
        elif class_name == "UserLogout":
            action = "logout"
        elif class_name == "ResetPassword":
            action = "reset password"
        elif class_name == "ChangePassword":
            action = "change password"
        else:
            pass

        if fun_name == "on_post":
            file_name = str(uuid.uuid4())
            with open(file_name, "wb") as fw:
                reads = req.stream.read()
                fw.write(reads)
            raw_json = reads.decode('utf-8')

            with open(file_name, "rb") as fr:
                req.stream = Body(fr)
                write_log(user_uuid=user_uuid, action=action, _class=class_name,
                          record_id=None, record_text=raw_json)
                func(*args, **kwargs)
            os.remove(file_name)
            return

        elif fun_name == "on_put":
            id_ = kwargs.get('id_')
            file_name = str(uuid.uuid4())
            with open(file_name, "wb") as fw:
                reads = req.stream.read()
                fw.write(reads)
            raw_json = reads.decode('utf-8')

            with open(file_name, "rb") as fr:
                req.stream = Body(fr)
                write_log(user_uuid=user_uuid, action=action, _class=class_name,
                          record_id=id_, record_text=raw_json)
                func(*args, **kwargs)
            os.remove(file_name)
            return

        elif fun_name == "on_delete":
            id_ = kwargs.get('id_')
            write_log(user_uuid=user_uuid, action=action, _class=class_name,
                      record_id=id_, record_text=None)
            func(*args, **kwargs)
            return
        else:
            func(*args, **kwargs)
            return

    return log_fun
