import mysql.connector
import config


def test_connect():
    cursor = None
    cnx = None
    try:
        cnx = mysql.connector.connect(**config.myems_user_db)
        cursor = cnx.cursor()

        query = (" SELECT id, name, display_name, email "
                 " FROM tbl_users  "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()
        print("The config of database is right:", rows)
    except Exception as e:
        print("The config of database is wrong:", str(e))
    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()


if __name__ == "__main__":
    test_connect()
