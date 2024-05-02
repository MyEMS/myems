import mysql.connector
import config

if __name__ == "__main__":
    cursor = None
    cnx = None
    try:
        cnx = mysql.connector.connect(**config.myems_system_db)
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
            cnx.close()
