"""
MyEMS Modbus RTU Gateway Service - Main Module

This module is the main entry point for the MyEMS Modbus RTU gateway service.
It initializes logging, starts the gateway monitoring process, and manages data source
acquisition processes for Modbus RTU serial communication.
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


def parse_connection(server):
    """
    Validate and normalize a Modbus RTU data source connection configuration.

    Args:
        server: Parsed connection JSON object

    Returns:
        Normalized connection dict, or None if invalid
    """
    if 'port' not in server.keys() or server['port'] is None or len(str(server['port']).strip()) == 0:
        return None

    port = str(server['port']).strip()

    if 'slaveaddress' not in server.keys() \
            or not isinstance(server['slaveaddress'], int) \
            or server['slaveaddress'] < 1 \
            or server['slaveaddress'] > 247:
        slaveaddress = 1
    else:
        slaveaddress = server['slaveaddress']

    if 'baudrate' not in server.keys() or not isinstance(server['baudrate'], int):
        baudrate = 9600
    else:
        baudrate = server['baudrate']

    if 'bytesize' not in server.keys() or not isinstance(server['bytesize'], int):
        bytesize = 8
    else:
        bytesize = server['bytesize']

    if 'parity' not in server.keys() or server['parity'] is None:
        parity = 'N'
    else:
        parity = str(server['parity']).upper()

    if 'stopbits' not in server.keys() or not isinstance(server['stopbits'], (int, float)):
        stopbits = 1
    else:
        stopbits = server['stopbits']

    if 'timeout' not in server.keys() or not isinstance(server['timeout'], (int, float)):
        timeout = 0.2
    else:
        timeout = server['timeout']

    if 'write_timeout' not in server.keys() or not isinstance(server['write_timeout'], (int, float)):
        write_timeout = 2.0
    else:
        write_timeout = server['write_timeout']

    if 'mode' not in server.keys() or server['mode'] not in ('rtu', 'ascii'):
        mode = 'rtu'
    else:
        mode = server['mode']

    if 'close_port_after_each_call' not in server.keys() \
            or not isinstance(server['close_port_after_each_call'], bool):
        close_port_after_each_call = False
    else:
        close_port_after_each_call = server['close_port_after_each_call']

    if 'interval_in_seconds' not in server.keys() \
            or (not isinstance(server['interval_in_seconds'], int)
                and not isinstance(server['interval_in_seconds'], float)) \
            or server['interval_in_seconds'] < 0 \
            or server['interval_in_seconds'] > 3600:
        interval_in_seconds = 300
    else:
        interval_in_seconds = server['interval_in_seconds']

    return {
        'port': port,
        'slaveaddress': slaveaddress,
        'baudrate': baudrate,
        'bytesize': bytesize,
        'parity': parity,
        'stopbits': stopbits,
        'timeout': timeout,
        'write_timeout': write_timeout,
        'mode': mode,
        'close_port_after_each_call': close_port_after_each_call,
        'interval_in_seconds': interval_in_seconds
    }


def main():
    """
    Main function to initialize the MyEMS Modbus RTU gateway service.
    """
    logger = logging.getLogger('myems-modbus-rtu')
    logger.setLevel(logging.ERROR)

    fh = RotatingFileHandler('myems-modbus-rtu.log', maxBytes=1024*1024, backupCount=1)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    logger.addHandler(fh)
    logger.addHandler(logging.StreamHandler())

    Process(target=gateway.process, args=(logger,)).start()

    data_source_list = list()
    while True:
        cnx_system_db = None
        cursor_system_db = None
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in main process " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            time.sleep(60)
            continue

        rows_data_source = None
        try:
            query = (" SELECT ds.id, ds.name, ds.connection "
                     " FROM tbl_data_sources ds, tbl_gateways g "
                     " WHERE ds.protocol = 'modbus-rtu' AND ds.gateway_id = g.id AND g.id = %s AND g.token = %s "
                     " ORDER BY ds.id ")
            cursor_system_db.execute(query, (config.gateway['id'], config.gateway['token'],))
            rows_data_source = cursor_system_db.fetchall()

            query = (" UPDATE tbl_data_sources ds, tbl_gateways g "
                     " SET ds.process_id = NULL "
                     " WHERE ds.protocol = 'modbus-rtu' AND ds.gateway_id = g.id AND g.id = %s AND g.token = %s ")
            cursor_system_db.execute(query, (config.gateway['id'], config.gateway['token'],))
            cnx_system_db.commit()

        except Exception as e:
            logger.error("Error in main process " + str(e))
            time.sleep(60)
        finally:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        if rows_data_source is None or len(rows_data_source) == 0:
            logger.error("Data Source Not Found, Wait for minutes to retry.")
            time.sleep(60)
            continue

        data_source_list = rows_data_source
        break

    for data_source in data_source_list:
        print("Data Source: ID=%s, Name=%s, Connection=%s " %
              (data_source[0], data_source[1], data_source[2]))

        if data_source[2] is None or len(data_source[2]) == 0:
            logger.error("Data Source Connection Not Found.")
            continue

        try:
            server = json.loads(data_source[2])
        except Exception as e:
            logger.error("Data Source Connection JSON error " + str(e))
            continue

        connection = parse_connection(server)
        if connection is None:
            logger.error("Data Source Connection Invalid.")
            continue

        Process(target=acquisition.process,
                args=(logger, data_source[0], connection)).start()


if __name__ == "__main__":
    main()
