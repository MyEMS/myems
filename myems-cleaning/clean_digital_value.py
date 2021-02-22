import mysql.connector
import config
import time
from datetime import datetime, timedelta
import schedule


def job(logger):

    cnx = None
    cursor = None
    try:
        cnx = mysql.connector.connect(**config.myems_historical_db)
        cursor = cnx.cursor()
    except Exception as e:
        logger.error("Error in clean digital value process " + str(e))
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return

    expired_utc = datetime.utcnow() - timedelta(days=config.live_in_days)
    try:
        cursor.execute(" DELETE FROM tbl_digital_value WHERE utc_date_time < %s ", (expired_utc,))
        cnx.commit()
    except Exception as e:
        logger.error("Error in delete_expired_trend process " + str(e))
    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

    logger.info("Deleted trend before date time in UTC: " + expired_utc.isoformat()[0:19])


def process(logger):

    if config.is_debug:
        # run the job immediately
        job(logger)
        return

    schedule.every(8).hours.do(job, logger)

    while True:
        schedule.run_pending()
        time.sleep(60)

