import mysql.connector
import config
import time
from datetime import datetime, timedelta
import schedule


def job(logger):

    cnx_historical = None
    cursor_historical = None
    try:
        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()
    except Exception as e:
        logger.error("Error in clean analog value process " + str(e))
        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.disconnect()
        return

    expired_utc = datetime.utcnow() - timedelta(days=config.live_in_days)
    try:
        cursor_historical.execute(" DELETE "
                                  " FROM tbl_analog_value "
                                  " WHERE utc_date_time < %s ", (expired_utc,))
        cnx_historical.commit()
    except Exception as e:
        logger.error("Error in delete_expired_trend process " + str(e))
    finally:
        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.disconnect()

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

