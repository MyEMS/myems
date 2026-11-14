"""
MyEMS OPC UA Gateway Service - Main Module

This module is the main entry point for the MyEMS OPC UA gateway service.
It initializes logging, starts the gateway monitoring process, and supervises one
data acquisition process for each OPC UA data source.

The service performs the following functions:
1. Sets up logging and error handling
2. Starts the gateway monitoring process to report gateway status
3. Discovers and validates OPC UA data sources from the system database
4. Spawns separate acquisition processes for each data source
5. Reloads data sources periodically and restarts terminated processes

Each data source represents a OPC UA server that the gateway
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


# Name of the logger shared by the main process and all subprocesses
LOGGER_NAME = 'myems-opc-ua'
LOG_FILE_NAME = 'myems-opc-ua.log'
# Interval in seconds between two data source reloads
RELOAD_INTERVAL_IN_SECONDS = 60
# Default interval in seconds between two acquisition cycles
DEFAULT_INTERVAL_IN_SECONDS = 300
# Timeout in seconds while waiting for a terminated subprocess to stop
STOP_TIMEOUT_IN_SECONDS = 5


def setup_logger():
    """
    Create the service logger.

    It is called both in the main process and in every subprocess, because a logger
    passed to a spawned subprocess only keeps its name and loses its handlers.
    """
    logger = logging.getLogger(LOGGER_NAME)
    # specifies the lowest-severity log message a logger will handle,
    # where debug is the lowest built-in severity level and critical is the highest built-in severity.
    # For example, if the severity level is INFO, the logger will handle only INFO, WARNING, ERROR, and CRITICAL
    # messages and will ignore DEBUG messages.
    logger.setLevel(logging.ERROR)
    if not logger.handlers:
        # create file handler which logs messages
        fh = RotatingFileHandler(LOG_FILE_NAME, maxBytes=1024*1024, backupCount=1)
        # create formatter and add it to the handlers
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        fh.setFormatter(formatter)
        # add the handlers to logger
        logger.addHandler(fh)
        # send logging output to sys.stderr
        logger.addHandler(logging.StreamHandler())
    return logger


def run_gateway():
    """Entry point of the gateway monitoring subprocess."""
    gateway.process(setup_logger())


def run_acquisition(data_source_id, url, interval_in_seconds):
    """Entry point of the acquisition subprocess of one data source."""
    acquisition.process(setup_logger(), data_source_id, url, interval_in_seconds)


def main():
    """main"""
    logger = setup_logger()

    # Clear stale process references left by a previous run of the service
    reset_process_ids(logger)

    gateway_process = None
    workers = dict()

    while True:
        # Start or restart the gateway monitoring process
        if gateway_process is None or not gateway_process.is_alive():
            if gateway_process is not None:
                logger.error("Gateway process terminated unexpectedly, restarting it.")
                stop_process(gateway_process)
            gateway_process = Process(target=run_gateway, name='gateway')
            gateway_process.start()

        # Reload data sources and start, restart or stop their acquisition processes
        rows_data_source = get_data_sources(logger)
        if rows_data_source is not None:
            supervise_workers(logger, rows_data_source, workers)

        time.sleep(RELOAD_INTERVAL_IN_SECONDS)


def get_data_sources(logger):
    """
    Get all OPC UA data sources of this gateway from the system database.

    Returns:
        The data source rows, or None if the system database could not be queried
    """
    cnx_system_db = None
    cursor_system_db = None
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
        # Get data sources by gateway and protocol
        query = (" SELECT ds.id, ds.name, ds.connection "
                 " FROM tbl_data_sources ds, tbl_gateways g "
                 " WHERE ds.protocol = 'opc-ua' AND ds.gateway_id = g.id AND g.id = %s AND g.token = %s "
                 " ORDER BY ds.id ")
        cursor_system_db.execute(query, (config.gateway['id'], config.gateway['token'],))
        return cursor_system_db.fetchall()
    except Exception as e:
        logger.error("Error in main process " + str(e))
        return None
    finally:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()


def reset_process_ids(logger):
    """Reset the data sources' process_id to clear any stale process references."""
    cnx_system_db = None
    cursor_system_db = None
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
        query = (" UPDATE tbl_data_sources ds, tbl_gateways g "
                 " SET ds.process_id = NULL "
                 " WHERE ds.protocol = 'opc-ua' AND ds.gateway_id = g.id AND g.id = %s AND g.token = %s ")
        cursor_system_db.execute(query, (config.gateway['id'], config.gateway['token'],))
        cnx_system_db.commit()
    except Exception as e:
        logger.error("Error in main process " + str(e))
    finally:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()


def supervise_workers(logger, rows_data_source, workers):
    """
    Start, restart and stop acquisition processes so that they match the data sources.

    Args:
        logger: Logger instance
        rows_data_source: Data source rows loaded from the system database
        workers: Dictionary of data source id to worker information, updated in place
    """
    active_data_source_ids = set()

    for row_data_source in rows_data_source:
        data_source_id = row_data_source[0]
        print("Data Source: ID=%s, Name=%s, Connection=%s " %
              (row_data_source[0], row_data_source[1], row_data_source[2]))

        worker_config = parse_data_source(logger, row_data_source)
        if worker_config is None:
            continue

        active_data_source_ids.add(data_source_id)
        url, interval_in_seconds = worker_config

        worker = workers.get(data_source_id)
        if worker is not None \
                and worker['url'] == url \
                and worker['interval_in_seconds'] == interval_in_seconds \
                and worker['process'].is_alive():
            # Nothing changed and the process is still running
            continue

        if worker is not None:
            if worker['process'].is_alive():
                logger.error("Data Source (ID=%s) configuration changed, restarting its process.",
                             data_source_id)
            else:
                logger.error("Acquisition process of Data Source (ID=%s) terminated, restarting it.",
                             data_source_id)
            stop_process(worker['process'])

        worker_process = Process(target=run_acquisition,
                                 args=(data_source_id, url, interval_in_seconds),
                                 name='acquisition-%s' % data_source_id)
        worker_process.start()
        workers[data_source_id] = {'process': worker_process,
                                   'url': url,
                                   'interval_in_seconds': interval_in_seconds}

    # Stop processes of data sources that no longer exist or are no longer valid
    for data_source_id in list(workers.keys()):
        if data_source_id not in active_data_source_ids:
            logger.error("Data Source (ID=%s) removed, stopping its process.", data_source_id)
            stop_process(workers.pop(data_source_id)['process'])


def parse_data_source(logger, row_data_source):
    """
    Validate a data source row and return its acquisition configuration.

    Returns:
        A tuple of url and interval in seconds, or None if the configuration is invalid
    """
    if row_data_source[2] is None or len(row_data_source[2]) == 0:
        logger.error("Data Source Connection Not Found.")
        return None

    try:
        server = json.loads(row_data_source[2])
    except Exception as e:
        logger.error("Data Source Connection JSON error " + str(e))
        return None

    if not isinstance(server, dict) \
            or 'url' not in server.keys() \
            or not isinstance(server['url'], str) \
            or len(server['url']) == 0:
        logger.error("Data Source Connection Invalid.")
        return None

    # Validate or set default interval for data acquisition, zero is not allowed
    interval_in_seconds = server.get('interval_in_seconds')
    if not isinstance(interval_in_seconds, (int, float)) \
            or interval_in_seconds <= 0 \
            or interval_in_seconds > 3600:
        interval_in_seconds = DEFAULT_INTERVAL_IN_SECONDS
    else:
        interval_in_seconds = float(interval_in_seconds)

    return server['url'], interval_in_seconds


def stop_process(worker_process):
    """Terminate a subprocess and wait until it is gone."""
    try:
        if worker_process.is_alive():
            worker_process.terminate()
        worker_process.join(STOP_TIMEOUT_IN_SECONDS)
        if worker_process.is_alive():
            worker_process.kill()
            worker_process.join(STOP_TIMEOUT_IN_SECONDS)
    except Exception:
        pass


if __name__ == "__main__":
    main()
