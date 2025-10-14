"""
MyEMS Cleaning Service - Analog Values Cleaning Module

This module handles the cleaning of analog values (continuous sensor readings like temperature,
pressure, flow rate, etc.) from the historical database. It removes old analog value records
based on the configured retention policy to maintain database performance and storage efficiency.

The cleaning process runs on a schedule (every 8 hours by default) and deletes analog values
older than the specified retention period (default: 365 days).
"""

import time
from datetime import datetime, timedelta

import mysql.connector
import schedule

import config


def job(logger):
    """
    Execute the analog values cleaning job.

    This function connects to the historical database and deletes analog values
    that are older than the configured retention period.

    Args:
        logger: Logger instance for recording cleaning activities and errors
    """
    cnx_historical = None
    cursor_historical = None

    # Establish connection to historical database
    try:
        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()
    except Exception as e:
        logger.error("Error in clean analog value process " + str(e))
        # Clean up database connections in case of error
        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()
        return

    # Calculate the cutoff date for data retention
    # Delete analog values older than the configured retention period
    expired_utc = datetime.utcnow() - timedelta(days=config.live_in_days)

    try:
        # Execute deletion of expired analog values
        cursor_historical.execute(" DELETE "
                                  " FROM tbl_analog_value "
                                  " WHERE utc_date_time < %s ", (expired_utc,))
        cnx_historical.commit()
    except Exception as e:
        logger.error("Error in delete_expired_trend process " + str(e))
    finally:
        # Always clean up database connections
        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()

    # Log successful cleaning operation
    logger.info("Deleted trend before date time in UTC: " + expired_utc.isoformat()[0:19])


def process(logger):
    """
    Main process function for analog values cleaning.

    This function manages the scheduling and execution of analog values cleaning.
    In debug mode, it runs the cleaning job immediately once.
    In normal mode, it schedules the job to run every 8 hours.

    Args:
        logger: Logger instance for recording process activities and errors
    """
    if config.is_debug:
        # In debug mode, run the cleaning job immediately once
        job(logger)
        return

    # Schedule the cleaning job to run every 8 hours
    schedule.every(8).hours.do(job, logger)

    # Main loop to check and execute scheduled jobs
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute for pending scheduled jobs

