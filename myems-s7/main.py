import json
import logging
import time
from logging.handlers import RotatingFileHandler
from multiprocessing import Process

import mysql.connector

import acquisition
import config
import gateway


########################################################################################################################
# BEGIN imports for Enterprise Version
########################################################################################################################
# {PyArmor Plugins}
# PyArmor Plugin: check_docker()
########################################################################################################################
# END imports for Enterprise Version
########################################################################################################################

def main():
    """main"""
    # create logger
    logger = logging.getLogger('myems-s7')
    # specifies the lowest-severity log message a logger will handle,
    # where debug is the lowest built-in severity level and critical is the highest built-in severity.
    # For example, if the severity level is INFO, the logger will handle only INFO, WARNING, ERROR, and CRITICAL
    # messages and will ignore DEBUG messages.
    logger.setLevel(logging.ERROR)
    # create file handler which logs messages
    fh = RotatingFileHandler('myems-s7.log', maxBytes=1024*1024, backupCount=1)
    # create formatter and add it to the handlers
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    # add the handlers to logger
    logger.addHandler(fh)
    # send logging output to sys.stderr
    logger.addHandler(logging.StreamHandler())

    ####################################################################################################################
    # Create Gateway Process
    ####################################################################################################################
    Process(target=gateway.process, args=(logger,)).start()

    # Get Data Sources
    while True:
        # NOTE: This service should be restarted to reload latest data sources
        cnx_system_db = None
        cursor_system_db = None
        # Get data sources by gateway and protocol
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()

            query = (" SELECT ds.id, ds.name, ds.connection "
                     " FROM tbl_data_sources ds, tbl_gateways g "
                     " WHERE ds.protocol = 's7' AND ds.gateway_id = g.id AND g.id = %s AND g.token = %s "
                     " ORDER BY ds.id ")
            cursor_system_db.execute(query, (config.gateway['id'], config.gateway['token'],))
            rows_data_source = cursor_system_db.fetchall()
        except Exception as e:
            logger.error("Error in main process " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and then retry to query data sources
            time.sleep(60)
            continue

        if rows_data_source is None or len(rows_data_source) == 0:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            logger.error("Data Source Not Found, Wait for a while retry")
            # sleep and then retry to query data sources
            time.sleep(60)
            continue
        else:
            # OK, go to connect these data sources
            break

    for row_data_source in rows_data_source:
        print("Data Source: ID=%s, Name=%s, Connection=%s " %
              (row_data_source[0], row_data_source[1], row_data_source[2]))

        if row_data_source[2] is None or len(row_data_source[2]) == 0:
            logger.error("Data Source Connection Not Found.")
            continue

        try:
            server = json.loads(row_data_source[2])
        except Exception as e:
            logger.error("Data Source Connection JSON error " + str(e))
            continue

        # verify the connection data
        if 'host' not in server.keys() \
                or 'rack' not in server.keys() \
                or 'slot' not in server.keys() \
                or 'port' not in server.keys() \
                or server['host'] is None \
                or server['rack'] is None \
                or server['slot'] is None \
                or server['port'] is None \
                or len(server['host']) == 0 \
                or not isinstance(server['rack'], int) \
                or server['rack'] < 0 \
                or not isinstance(server['slot'], int) \
                or server['slot'] < 0 \
                or not isinstance(server['port'], int) \
                or server['port'] < 1:
            logger.error("Data Source Connection Invalid.")
            continue

        # Validate or set default interval for data acquisition
        if 'interval_in_seconds' not in server.keys() \
            or (not isinstance(server['interval_in_seconds'], int)
                and not isinstance(server['interval_in_seconds'], float)) \
            or server['interval_in_seconds'] < 0 \
                or server['interval_in_seconds'] > 3600:
            # set the default interval
            interval_in_seconds = 300
        else:
            # set interval from data source
            interval_in_seconds = server['interval_in_seconds']

        # fork a worker process for each data source
        Process(target=acquisition.process,
                args=(logger, row_data_source[0], server['host'], server['rack'], server['slot'], server['port'],
                      interval_in_seconds)).start()


if __name__ == "__main__":
    main()
