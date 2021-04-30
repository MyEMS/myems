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


def job(logger, ):
    ################################################################################################################
    # Step 1: Verify Gateway Token
    ################################################################################################################
    cnx_system_db = None
    cursor_system_db = None
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        logger.error("Error in step 1.1 of Gateway process " + str(e))
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        return

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
        return

    if row is None:
        logger.error("Error in step 1.3 of gateway process: Not Found ")
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        return

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
        logger.error("Error in step 3.1 of gateway process " + str(e))
        return
    finally:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()


def process(logger, ):
    schedule.every(3).minutes.do(job, logger,)

    while True:
        schedule.run_pending()
        time.sleep(60)
