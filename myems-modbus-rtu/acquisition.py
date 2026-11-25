"""
MyEMS Modbus RTU Gateway Service - Data Acquisition Module

This module handles the core data acquisition functionality for Modbus RTU devices.
It connects to Modbus RTU slaves over serial ports, reads data from configured points,
and stores the collected data in the MyEMS historical database.
"""

import os
import json
import math
import time
from datetime import datetime, timezone
from decimal import Decimal
import mysql.connector
import config
from modbus_rtu_client import (
    SERIAL_FAULT_FATAL,
    SERIAL_FAULT_TRANSIENT,
    TRANSIENT_FAULT_RECONNECT_THRESHOLD,
    classify_serial_communication_fault,
    create_instrument,
    read_point_value,
    release_instrument,
)


def check_serial_port(port):
    """
    Verify that the serial port device path exists.

    Args:
        port: Serial port path (e.g. /dev/ttyUSB0)

    Raises:
        Exception: If the serial port is unavailable
    """
    if not os.path.exists(port):
        raise Exception("Serial port not found: " + port)


def persist_acquired_values(logger,
                            data_source_id,
                            cnx_historical_db,
                            cursor_historical_db,
                            cnx_system_db,
                            cursor_system_db,
                            analog_value_list,
                            energy_value_list,
                            digital_value_list):
    """
    Store successfully read point values and refresh last_seen only when data exists.

    Returns:
        Tuple of (cnx_historical_db, cursor_historical_db, cnx_system_db,
                  cursor_system_db, stored_count)
    """
    stored_count = len(analog_value_list) + len(energy_value_list) + len(digital_value_list)
    if stored_count == 0:
        return cnx_historical_db, cursor_historical_db, cnx_system_db, cursor_system_db, 0

    if cnx_historical_db is None or not cnx_historical_db.is_connected():
        try:
            cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
            cursor_historical_db = cnx_historical_db.cursor()
        except Exception as e:
            logger.error("Error in step 5.1 of acquisition process: " + str(e))
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            return None, None, cnx_system_db, cursor_system_db, 0

    if cnx_system_db is None or not cnx_system_db.is_connected():
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 5.2 of acquisition process: " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            return cnx_historical_db, cursor_historical_db, None, None, 0

    current_datetime_utc = datetime.now(timezone.utc).replace(tzinfo=None)

    while len(analog_value_list) > 0:
        analog_value_list_100 = analog_value_list[:100]
        analog_value_list = analog_value_list[100:]

        add_values = (" INSERT INTO tbl_analog_value (point_id, utc_date_time, actual_value) "
                      " VALUES  ")

        for point_value in analog_value_list_100:
            add_values += " (" + str(point_value['point_id']) + ","
            add_values += "'" + current_datetime_utc.isoformat() + "',"
            add_values += str(point_value['value']) + "), "

        try:
            cursor_historical_db.execute(add_values[:-2])
            cnx_historical_db.commit()
        except Exception as e:
            logger.error("Error in step 5.3.1 of acquisition process " + str(e))

        delete_values = " DELETE FROM tbl_analog_value_latest WHERE point_id IN ( "
        latest_values = (" INSERT INTO tbl_analog_value_latest (point_id, utc_date_time, actual_value) "
                         " VALUES  ")
        latest_value_count = 0

        for point_value in analog_value_list_100:
            delete_values += str(point_value['point_id']) + ","
            latest_values += " (" + str(point_value['point_id']) + ","
            latest_values += "'" + current_datetime_utc.isoformat() + "',"
            latest_values += str(point_value['value']) + "), "
            latest_value_count += 1

        if latest_value_count > 0:
            try:
                cursor_historical_db.execute(delete_values[:-1] + ")")
                cnx_historical_db.commit()
            except Exception as e:
                logger.error("Error in step 5.3.2 of acquisition process " + str(e))

            try:
                cursor_historical_db.execute(latest_values[:-2])
                cnx_historical_db.commit()
            except Exception as e:
                logger.error("Error in step 5.3.3 of acquisition process " + str(e))

    while len(energy_value_list) > 0:
        energy_value_list_100 = energy_value_list[:100]
        energy_value_list = energy_value_list[100:]

        add_values = (" INSERT INTO tbl_energy_value (point_id, utc_date_time, actual_value) "
                      " VALUES  ")

        for point_value in energy_value_list_100:
            add_values += " (" + str(point_value['point_id']) + ","
            add_values += "'" + current_datetime_utc.isoformat() + "',"
            add_values += str(point_value['value']) + "), "

        try:
            cursor_historical_db.execute(add_values[:-2])
            cnx_historical_db.commit()
        except Exception as e:
            logger.error("Error in step 5.4.1 of acquisition process: " + str(e))

        delete_values = " DELETE FROM tbl_energy_value_latest WHERE point_id IN ( "
        latest_values = (" INSERT INTO tbl_energy_value_latest (point_id, utc_date_time, actual_value) "
                         " VALUES  ")
        latest_value_count = 0

        for point_value in energy_value_list_100:
            delete_values += str(point_value['point_id']) + ","
            latest_values += " (" + str(point_value['point_id']) + ","
            latest_values += "'" + current_datetime_utc.isoformat() + "',"
            latest_values += str(point_value['value']) + "), "
            latest_value_count += 1

        if latest_value_count > 0:
            try:
                cursor_historical_db.execute(delete_values[:-1] + ")")
                cnx_historical_db.commit()
            except Exception as e:
                logger.error("Error in step 5.4.2 of acquisition process " + str(e))

            try:
                cursor_historical_db.execute(latest_values[:-2])
                cnx_historical_db.commit()
            except Exception as e:
                logger.error("Error in step 5.4.3 of acquisition process " + str(e))

    while len(digital_value_list) > 0:
        digital_value_list_100 = digital_value_list[:100]
        digital_value_list = digital_value_list[100:]

        add_values = (" INSERT INTO tbl_digital_value (point_id, utc_date_time, actual_value) "
                      " VALUES  ")

        for point_value in digital_value_list_100:
            add_values += " (" + str(point_value['point_id']) + ","
            add_values += "'" + current_datetime_utc.isoformat() + "',"
            add_values += str(point_value['value']) + "), "

        try:
            cursor_historical_db.execute(add_values[:-2])
            cnx_historical_db.commit()
        except Exception as e:
            logger.error("Error in step 5.5.1 of acquisition process: " + str(e))

        delete_values = " DELETE FROM tbl_digital_value_latest WHERE point_id IN ( "
        latest_values = (" INSERT INTO tbl_digital_value_latest (point_id, utc_date_time, actual_value) "
                         " VALUES  ")
        latest_value_count = 0

        for point_value in digital_value_list_100:
            delete_values += str(point_value['point_id']) + ","
            latest_values += " (" + str(point_value['point_id']) + ","
            latest_values += "'" + current_datetime_utc.isoformat() + "',"
            latest_values += str(point_value['value']) + "), "
            latest_value_count += 1

        if latest_value_count > 0:
            try:
                cursor_historical_db.execute(delete_values[:-1] + ")")
                cnx_historical_db.commit()
            except Exception as e:
                logger.error("Error in step 5.5.2 of acquisition process " + str(e))

            try:
                cursor_historical_db.execute(latest_values[:-2])
                cnx_historical_db.commit()
            except Exception as e:
                logger.error("Error in step 5.5.3 of acquisition process " + str(e))

    update_row = (" UPDATE tbl_data_sources "
                  " SET last_seen_datetime_utc = '" + current_datetime_utc.isoformat() + "' "
                  " WHERE id = %s ")
    try:
        cursor_system_db.execute(update_row, (data_source_id,))
        cnx_system_db.commit()
    except Exception as e:
        logger.error("Error in step 5.6 of acquisition process " + str(e))
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        return cnx_historical_db, cursor_historical_db, None, None, stored_count

    return cnx_historical_db, cursor_historical_db, cnx_system_db, cursor_system_db, stored_count


def process(logger, data_source_id, connection):
    """
    Main data acquisition process function.

    Args:
        logger: Logger instance for recording acquisition activities and errors
        data_source_id: Unique identifier for the data source in the system database
        connection: Normalized Modbus RTU connection configuration
    """
    port = connection['port']
    interval_in_seconds = connection['interval_in_seconds']

    cnx_system_db = None
    cursor_system_db = None

    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        logger.error("Error in step 1.1 of acquisition process " + str(e))
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        return

    update_row = (" UPDATE tbl_data_sources "
                  " SET process_id = %s "
                  " WHERE id = %s ")
    try:
        cursor_system_db.execute(update_row, (os.getpid(), data_source_id,))
        cnx_system_db.commit()
    except Exception as e:
        logger.error("Error in step 1.2 of acquisition process " + str(e))
        return
    finally:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

    while True:
        try:
            check_serial_port(port)
            print("Succeeded to access serial port %s in acquisition process ", port)
        except Exception as e:
            logger.error("Failed to access serial port %s in acquisition process: %s", port, str(e))
            time.sleep(300)
            continue

        cnx_system_db = None
        cursor_system_db = None

        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 3.1 of acquisition process " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            time.sleep(60)
            continue

        try:
            query = (" SELECT id, name, object_type, ratio, offset_constant, address "
                     " FROM tbl_points "
                     " WHERE data_source_id = %s AND is_virtual = 0 "
                     " ORDER BY id ")
            cursor_system_db.execute(query, (data_source_id,))
            rows_point = cursor_system_db.fetchall()
        except Exception as e:
            logger.error("Error in step 3.2 of acquisition process: " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            time.sleep(60)
            continue

        if rows_point is None or len(rows_point) == 0:
            logger.error("Point Not Found in Data Source (ID = %s), acquisition process terminated ", data_source_id)
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            time.sleep(60)
            continue

        point_list = list()
        for row_point in rows_point:
            point_list.append({"id": row_point[0],
                               "name": row_point[1],
                               "object_type": row_point[2],
                               "ratio": row_point[3],
                               "offset_constant": row_point[4],
                               "address": row_point[5]})

        cnx_historical_db = None
        cursor_historical_db = None
        try:
            cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
            cursor_historical_db = cnx_historical_db.cursor()
        except Exception as e:
            logger.error("Error in step 4.1 of acquisition process " + str(e))
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            time.sleep(60)
            continue

        try:
            instrument = create_instrument(connection)
            print("Ready to connect to serial port %s ", port)
        except Exception as e:
            logger.error("Failed to open Modbus RTU port %s in acquisition process: %s", port, str(e))
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            time.sleep(300)
            continue

        consecutive_transient_faults = 0

        while True:
            is_modbus_rtu_fault = False
            energy_value_list = list()
            analog_value_list = list()
            digital_value_list = list()

            for point in point_list:
                try:
                    address = json.loads(point['address'])
                except Exception as e:
                    logger.error("Error in step 4.2 of acquisition process: Invalid point address in JSON " + str(e))
                    continue

                if 'function_code' not in address.keys() \
                        or 'offset' not in address.keys() \
                        or 'number_of_registers' not in address.keys() \
                        or 'format' not in address.keys() \
                        or 'byte_swap' not in address.keys() \
                        or address['function_code'] not in (1, 2, 3, 4) \
                        or address['offset'] < 0 \
                        or address['number_of_registers'] < 0 \
                        or len(address['format']) < 1 \
                        or not isinstance(address['byte_swap'], bool):
                    logger.error('Data Source(ID=%s), Point(ID=%s) Invalid address data.',
                                 data_source_id, point['id'])
                    continue

                if 'slave_id' in address.keys():
                    if not isinstance(address['slave_id'], int) \
                            or address['slave_id'] < 1 \
                            or address['slave_id'] > 247:
                        logger.error('Data Source(ID=%s), Point(ID=%s) Invalid slave_id.',
                                     data_source_id, point['id'])
                        continue

                try:
                    value = read_point_value(
                        instrument,
                        address,
                        connection['slaveaddress']
                    )
                except Exception as e:
                    logger.error(str(e) +
                                 " port:" + port +
                                 " slave_id:" + str(address.get('slave_id', connection['slaveaddress'])) +
                                 " function_code:" + str(address['function_code']) +
                                 " starting_address:" + str(address['offset']) +
                                 " number_of_registers:" + str(address['number_of_registers']) +
                                 " format:" + str(address['format']) +
                                 " byte_swap:" + str(address['byte_swap']))

                    fault = classify_serial_communication_fault(e)
                    if fault == SERIAL_FAULT_FATAL:
                        is_modbus_rtu_fault = True
                        break
                    if fault == SERIAL_FAULT_TRANSIENT:
                        consecutive_transient_faults += 1
                        if consecutive_transient_faults >= TRANSIENT_FAULT_RECONNECT_THRESHOLD:
                            logger.error(
                                "Reached %s consecutive soft serial faults on %s, reconnecting",
                                TRANSIENT_FAULT_RECONNECT_THRESHOLD,
                                port
                            )
                            is_modbus_rtu_fault = True
                            break
                        continue
                    continue

                consecutive_transient_faults = 0

                if value is None:
                    logger.error("Error in step 4.3 of acquisition process: invalid result: None "
                                 " for point_id: " + str(point['id']))
                    continue

                if not isinstance(value, float) and not isinstance(value, int) or math.isnan(value):
                    logger.error(" Error in step 4.4 of acquisition process: invalid result "
                                 " for point_id: " + str(point['id']))
                    continue

                if point['object_type'] == 'ANALOG_VALUE':
                    if Decimal(-999999999999999.999) <= Decimal(value) <= Decimal(999999999999999.999):
                        analog_value_list.append({'point_id': point['id'],
                                                  'value': Decimal(value) * point['ratio'] + point['offset_constant']})
                elif point['object_type'] == 'ENERGY_VALUE':
                    if Decimal(-999999999999999.999) <= Decimal(value) <= Decimal(999999999999999.999):
                        energy_value_list.append({'point_id': point['id'],
                                                  'value': Decimal(value) * point['ratio'] + point['offset_constant']})
                elif point['object_type'] == 'DIGITAL_VALUE':
                    digital_value_list.append({'point_id': point['id'],
                                               'value': int(value) * int(point['ratio']) + int(point['offset_constant'])
                                               })

            # Persist values collected before a fault so a reconnect does not discard them.
            # last_seen is updated only when at least one value was stored.
            acquired_count = (
                len(analog_value_list) + len(energy_value_list) + len(digital_value_list)
            )
            (cnx_historical_db,
             cursor_historical_db,
             cnx_system_db,
             cursor_system_db,
             stored_count) = persist_acquired_values(
                logger,
                data_source_id,
                cnx_historical_db,
                cursor_historical_db,
                cnx_system_db,
                cursor_system_db,
                analog_value_list,
                energy_value_list,
                digital_value_list
            )

            if is_modbus_rtu_fault:
                logger.error("Serial communication fault on %s, closing port and retrying", port)
                release_instrument(instrument, port)

                if cursor_historical_db:
                    cursor_historical_db.close()
                if cnx_historical_db:
                    cnx_historical_db.close()
                if cursor_system_db:
                    cursor_system_db.close()
                if cnx_system_db:
                    cnx_system_db.close()

                time.sleep(60)
                break

            if acquired_count == 0:
                logger.error("No point values acquired for Data Source(ID=%s) in this cycle",
                             data_source_id)
            elif stored_count == 0:
                logger.error("Failed to store acquired point values for Data Source(ID=%s)",
                             data_source_id)

            time.sleep(interval_in_seconds)
