"""
MyEMS Modbus TCP Gateway Service - Main Module

This module is the main entry point for the MyEMS Modbus TCP gateway service.
It initializes logging, starts the gateway monitoring process, and manages data source
acquisition processes for Modbus TCP communication.

The service performs the following functions:
1. Sets up logging and error handling
2. Starts the gateway monitoring process to report gateway status
3. Discovers and validates Modbus TCP data sources from the system database
4. Spawns separate acquisition processes for each data source
5. Manages process lifecycle and error recovery

Each data source represents a Modbus TCP server (slave device) that the gateway
will connect to and read data from at regular intervals.
"""

import json
import logging
import time
from logging.handlers import RotatingFileHandler
from multiprocessing import Process
import mysql.connector
import acquisition
import config
import gateway


def main():
    """
    Main function to initialize the MyEMS Modbus TCP gateway service.

    Sets up logging, starts the gateway monitoring process, discovers data sources,
    and spawns acquisition processes for each Modbus TCP data source.
    """
    # Create logger for the Modbus TCP gateway service
    logger = logging.getLogger('myems-modbus-tcp')

    # Set logging level to ERROR to capture only error messages and above
    # This specifies the lowest-severity log message a logger will handle,
    # where debug is the lowest built-in severity level and critical is the highest built-in severity.
    # For example, if the severity level is INFO, the logger will handle only INFO, WARNING, ERROR, and CRITICAL
    # messages and will ignore DEBUG messages.
    logger.setLevel(logging.ERROR)

    # Create rotating file handler which logs messages to a file
    # maxBytes=1024*1024 means 1MB, backupCount=1 means keep 1 backup file
    fh = RotatingFileHandler('myems-modbus-tcp.log', maxBytes=1024*1024, backupCount=1)

    # Create formatter for log messages and add it to the file handler
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)

    # Add the file handler to logger
    logger.addHandler(fh)

    # Add console handler to send logging output to sys.stderr
    logger.addHandler(logging.StreamHandler())

    ####################################################################################################################
    # Create Gateway Process - Monitor gateway status and report to system
    ####################################################################################################################
    Process(target=gateway.process, args=(logger,)).start()

    # Get Data Sources from system database
    data_source_list = list()
    while True:
        # TODO: This service has to RESTART to reload latest data sources and this should be fixed
        # Connect to system database to discover available data sources
        cnx_system_db = None
        cursor_system_db = None
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in main process " + str(e))
            # Clean up database connections in case of error
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep several minutes and continue the outer loop to reload points
            time.sleep(60)
            continue

        # Get data sources by gateway and protocol
        rows_data_source = None
        try:
            # Query all Modbus TCP data sources associated with this gateway
            query = (" SELECT ds.id, ds.name, ds.connection "
                     " FROM tbl_data_sources ds, tbl_gateways g "
                     " WHERE ds.protocol = 'modbus-tcp' AND ds.gateway_id = g.id AND g.id = %s AND g.token = %s "
                     " ORDER BY ds.id ")
            cursor_system_db.execute(query, (config.gateway['id'], config.gateway['token'],))
            rows_data_source = cursor_system_db.fetchall()

            # Reset data sources' process_id to NULL to clear any stale process references
            query = (" UPDATE tbl_data_sources ds, tbl_gateways g "
                     " SET ds.process_id = NULL "
                     " WHERE ds.protocol = 'modbus-tcp' AND ds.gateway_id = g.id AND g.id = %s AND g.token = %s ")
            cursor_system_db.execute(query, (config.gateway['id'], config.gateway['token'],))
            cnx_system_db.commit()

        except Exception as e:
            logger.error("Error in main process " + str(e))
            # Sleep several minutes and continue the outer loop to reload points
            time.sleep(60)
        finally:
            # Always clean up database connections
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        # Check if data sources were found
        if rows_data_source is None or len(rows_data_source) == 0:
            logger.error("Data Source Not Found, Wait for minutes to retry.")
            # Wait for a while and retry
            time.sleep(60)
            continue
        else:
            # Stop the while loop to connect these data sources
            data_source_list = rows_data_source
            break

    # Process each discovered data source
    for data_source in data_source_list:
        print("Data Source: ID=%s, Name=%s, Connection=%s " %
              (data_source[0], data_source[1], data_source[2]))

        # Validate data source connection configuration
        if data_source[2] is None or len(data_source[2]) == 0:
            logger.error("Data Source Connection Not Found.")
            continue

        # Parse connection JSON configuration
        try:
            server = json.loads(data_source[2])
        except Exception as e:
            logger.error("Data Source Connection JSON error " + str(e))
            continue

        # Validate required connection parameters
        if 'host' not in server.keys() \
                or 'port' not in server.keys() \
                or server['host'] is None \
                or server['port'] is None \
                or len(server['host']) == 0 \
                or not isinstance(server['port'], int) \
                or server['port'] < 1 \
                or server['port'] > 65535:
            logger.error("Data Source Connection Invalid.")
            continue

        # Validate or set default interval for data acquisition
        if 'interval_in_seconds' not in server.keys() \
            or (not isinstance(server['interval_in_seconds'], int)
                and not isinstance(server['interval_in_seconds'], float)) \
            or server['interval_in_seconds'] < 0 \
                or server['interval_in_seconds'] > 3600:
            # Use default interval from configuration
            interval_in_seconds = config.interval_in_seconds
        else:
            # Use configured interval from data source
            interval_in_seconds = server['interval_in_seconds']

        # Fork worker process for each data source
        # TODO: How to restart the process if the process terminated unexpectedly
        Process(target=acquisition.process,
                args=(logger, data_source[0], server['host'], server['port'], interval_in_seconds)).start()


if __name__ == "__main__":
    main()
