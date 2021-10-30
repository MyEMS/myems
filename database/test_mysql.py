import mysql.connector
from decouple import config


if __name__ == "__main__":

    myems_system_db = {
        'host': config('MYEMS_SYSTEM_DB_HOST', default='127.0.0.1'),
        'port': config('MYEMS_SYSTEM_DB_PORT', default=3306, cast=int),
        'database': config('MYEMS_SYSTEM_DB_DATABASE', default='myems_system_db'),
        'user': config('MYEMS_SYSTEM_DB_USER', default='root'),
        'password': config('MYEMS_SYSTEM_DB_PASSWORD', default='!MyEMS1'),
    }

    cursor = None
    cnx = None
    try:
        cnx = mysql.connector.connect(**myems_system_db)
        cursor = cnx.cursor()

        query = (" SELECT version "
                 " FROM tbl_versions  "
                 " WHERE id = 1 ")
        cursor.execute(query)
        row = cursor.fetchone()
        if row is not None and len(row) > 0:
            print("The database version is : ", str(row[0]))
    except Exception as e:
        print("There is something wrong with database :", str(e))
    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()
