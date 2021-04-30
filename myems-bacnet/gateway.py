import mysql.connector
import config
import time
from datetime import datetime
import schedule

########################################################################################################################
# Gateway Job Procedures
# Step 1: Verify Gateway Token
# Step 2: Collect Gateway Information
# Step 3: Update Gateway Information
########################################################################################################################


def process(logger, ):
    cnx_system_db = None
    cursor_system_db = None
    while True:
        # the outermost while loop
        ################################################################################################################
        # Step 1: Verify Gateway Token
        ################################################################################################################
        while not cnx_system_db or not cnx_system_db.is_connected():
            try:
                cnx_system_db = mysql.connector.connect(**config.myems_system_db)
                cursor_system_db = cnx_system_db.cursor()
            except Exception as e:
                logger.error("Error to connect to myems_system_db in step 1.1 of gateway process " + str(e))
                if cursor_system_db:
                    cursor_system_db.close()
                if cnx_system_db:
                    cnx_system_db.close()
                print("Failed to connect to myems_system_db, sleep a minute and retry...")
                time.sleep(60)
                continue

        # TODO: choose a more secure method to verify gateway token
        try:
            query = (" SELECT name "
                     " FROM tbl_gateways "
                     " WHERE id = %s AND token = %s ")
            cursor_system_db.execute(query, (config.gateway['id'], config.gateway['token']))
            row = cursor_system_db.fetchone()
        except Exception as e:
            logger.error("Error in step 1.2 of gateway process: " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            time.sleep(60)
            continue

        if row is None:
            logger.error("Error in step 1.3 of gateway process: Gateway Not Found ")
            time.sleep(60)
            continue
        ############################################################################################################
        # Step 2: Collect Gateway Information
        ############################################################################################################
        # todo: get more information, such as CPU/MEMORY/DISK
        current_datetime_utc = datetime.utcnow()

        ############################################################################################################
        # Step 3: Update Gateway Information
        ############################################################################################################
        update_row = (" UPDATE tbl_gateways "
                      " SET last_seen_datetime_utc = '" + current_datetime_utc.isoformat() + "' "
                      " WHERE id = %s ")
        try:
            cursor_system_db.execute(update_row, (config.gateway['id'], ))
            cnx_system_db.commit()
        except Exception as e:
            logger.error("Error in step 3.2 of gateway process " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            time.sleep(60)
            continue

        # sleep some seconds
        time.sleep(60)
        # end of the outermost while loop
