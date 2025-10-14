"""
MyEMS Modbus TCP Gateway Service - Gateway Monitoring Module

This module handles gateway status monitoring and reporting to the MyEMS system.
It periodically verifies gateway authentication and updates the gateway's last seen
timestamp to indicate that the gateway is active and operational.

The gateway monitoring process performs the following functions:
1. Verifies gateway token authentication with the system
2. Collects gateway status information (currently just timestamp)
3. Updates the gateway's last seen datetime in the system database

This allows the MyEMS system to track which gateways are online and operational.
"""

import time
from datetime import datetime

import mysql.connector
import schedule

import config


########################################################################################################################
# Gateway Job Procedures
# Step 1: Verify Gateway Token - Authenticate gateway with system
# Step 2: Collect Gateway Information - Gather status and performance data
# Step 3: Update Gateway Information - Report status to system database
########################################################################################################################


def job(logger):
    """
    Execute the gateway monitoring job.

    This function performs gateway authentication verification and status reporting
    to the MyEMS system database.

    Args:
        logger: Logger instance for recording gateway activities and errors
    """
    ################################################################################################################
    # Step 1: Verify Gateway Token - Authenticate gateway with system
    ################################################################################################################
    cnx_system_db = None
    cursor_system_db = None

    # Connect to system database
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        logger.error("Error in step 1.1 of Gateway process " + str(e))
        # Clean up database connections in case of error
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        return

    # TODO: Choose a more secure method to verify gateway token
    # Verify gateway authentication using ID and token
    try:
        query = (" SELECT name "
                 " FROM tbl_gateways "
                 " WHERE id = %s AND token = %s ")
        cursor_system_db.execute(query, (config.gateway['id'], config.gateway['token']))
        row = cursor_system_db.fetchone()
    except Exception as e:
        logger.error("Error in step 1.2 of gateway process: " + str(e))
        # Clean up database connections in case of error
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        return

    # Check if gateway authentication was successful
    if row is None:
        logger.error("Error in step 1.3 of gateway process: Not Found ")
        # Clean up database connections
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        return

    ############################################################################################################
    # Step 2: Collect Gateway Information - Gather status and performance data
    ############################################################################################################
    # TODO: Get more information, such as CPU/MEMORY/DISK usage, network status, etc.
    # Currently only collecting current timestamp as basic status information
    current_datetime_utc = datetime.utcnow()

    ############################################################################################################
    # Step 3: Update Gateway Information - Report status to system database
    ############################################################################################################
    # Update the gateway's last seen timestamp to indicate it's active
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
        # Always clean up database connections
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()


def process(logger):
    """
    Main process function for gateway monitoring.

    This function schedules and manages the gateway monitoring job execution.
    It runs the monitoring job at regular intervals to keep the system informed
    of the gateway's operational status.

    Args:
        logger: Logger instance for recording process activities and errors
    """
    # Schedule the gateway monitoring job to run at the configured interval
    schedule.every(config.interval_in_seconds).seconds.do(job, logger)

    # Main loop to check and execute scheduled jobs
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute for pending scheduled jobs
