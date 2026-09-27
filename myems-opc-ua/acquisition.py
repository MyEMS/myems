"""
MyEMS OPC UA Gateway Service - Data Acquisition Module

This module handles the core data acquisition functionality for OPC UA servers.
It connects to OPC UA servers, reads data from configured points,
and stores the collected data in the MyEMS historical database.

The acquisition process performs the following functions:
1. Updates process ID in database for monitoring
2. Checks connectivity to the OPC UA host and port
3. Retrieves point configuration from system database
4. Reads point values from OPC UA servers using configured parameters
5. Processes and validates the collected data
6. Bulk inserts point values and updates latest values in historical database

The module supports multiple data types:
- ANALOG_VALUE: Continuous sensor readings (temperature, pressure, flow, etc.)
- DIGITAL_VALUE: Binary states (on/off, open/closed, alarm status, etc.)
- ENERGY_VALUE: Cumulative energy consumption data (kWh readings)

Data processing includes:
- Ratio and offset calculations for calibration
- Byte swapping for devices with non-standard byte order
- Data validation and range checking
- Trend data storage and latest value updates
"""

import os
import json
import math
import telnetlib3
import asyncio
import time
from datetime import datetime, timezone
from decimal import Decimal
from urllib.parse import urlparse
import mysql.connector
from asyncua import Client
import config


########################################################################################################################
# Check connectivity to the host and port
########################################################################################################################
async def check_connectivity(host, port):
    """
    Test basic TCP connectivity to a OPC UA host and port.

    This function attempts to establish a TCP connection to verify that the
    target OPC UA server is reachable before attempting OPC UA communication.

    Args:
        host: Target hostname or IP address of the OPC UA server
        port: Target port number

    Raises:
        Exception: If connection fails
    """
    reader, writer = await telnetlib3.open_connection(host, port)
    # Close the connection immediately after establishing it
    writer.close()

########################################################################################################################
# Acquisition Procedures
# Step 1: Update process ID in database for monitoring and management
# Step 2: Check connectivity to the OPC UA server
# Step 3: Get point list from system database for this data source
# Step 4: Read point values from OPC UA server using configured parameters
# Step 5: Bulk insert point values and update latest values in historical database
########################################################################################################################


async def process(logger, data_source_id, url, interval_in_seconds):
    """
    Main data acquisition process function.

    This function manages the complete data acquisition lifecycle for a Modbus TCP data source.
    It runs continuously, connecting to the Modbus device, reading configured points,
    and storing the data in the historical database.

    Args:
        logger: Logger instance for recording acquisition activities and errors
        data_source_id: Unique identifier for the data source in the system database
        host: Hostname or IP address of the OPC UA server
        port: Port number of the OPC UA server
        interval_in_seconds: Time interval between data acquisition cycles
    """
    ####################################################################################################################
    # Step 1: Update process ID in database for monitoring and management
    ####################################################################################################################
    cnx_system_db = None
    cursor_system_db = None

    # Connect to system database to register this acquisition process
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        logger.error("Error in step 1.1 of acquisition process " + str(e))
        # Clean up database connections in case of error
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        return

    # Update the data source record with the current process ID for monitoring
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
        # Always clean up database connections
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

    # Main acquisition loop - runs continuously until process termination
    while True:
        # Begin of the outermost while loop
        ################################################################################################################
        # Step 2: Check connectivity to the OPC UA server
        ################################################################################################################
        try:
            server_url = urlparse(url)
            asyncio.run(check_connectivity(server_url.hostname, server_url.port))
            print("Succeeded to connect %s:%s in acquisition process ", server_url.hostname, server_url.port)
        except Exception as e:
            logger.error("Failed to connect %s:%s in acquisition process: %s  ",
                         server_url.hostname, server_url.port, str(e))
            # Go to begin of the outermost while loop and wait before retrying
            time.sleep(300)  # Wait 5 minutes before retrying connection
            continue

        ################################################################################################################
        # Step 3: Get point list from system database for this data source
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None

        # Connect to system database to retrieve point configuration
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 3.1 of acquisition process " + str(e))
            # Clean up database connections in case of error
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Go to begin of the outermost while loop
            time.sleep(60)
            continue

        # Retrieve all configured points for this data source
        try:
            query = (" SELECT id, name, object_type, is_trend, ratio, offset_constant, address "
                     " FROM tbl_points "
                     " WHERE data_source_id = %s AND is_virtual = 0 "
                     " ORDER BY id ")
            cursor_system_db.execute(query, (data_source_id,))
            rows_point = cursor_system_db.fetchall()
        except Exception as e:
            logger.error("Error in step 3.2 of acquisition process: " + str(e))
            # Clean up database connections in case of error
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Go to begin of the outermost while loop
            time.sleep(60)
            continue

        # Validate that points were found for this data source
        if rows_point is None or len(rows_point) == 0:
            # There are no points configured for this data source
            logger.error("Point Not Found in Data Source (ID = %s), acquisition process terminated ", data_source_id)
            # Clean up database connections
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Go to begin of the outermost while loop
            time.sleep(60)
            continue

        # Build point list from database results
        # There are points configured for this data source
        point_list = list()
        for row_point in rows_point:
            point_list.append({"id": row_point[0],
                               "name": row_point[1],
                               "object_type": row_point[2],
                               "is_trend": row_point[3],
                               "ratio": row_point[4],
                               "offset_constant": row_point[5],
                               "address": row_point[6]})

        ################################################################################################################
        # Step 4: Read point values from OPC UA server
        ################################################################################################################
        # Connect to historical database for storing collected data
        cnx_historical_db = None
        cursor_historical_db = None
        try:
            cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
            cursor_historical_db = cnx_historical_db.cursor()
        except Exception as e:
            logger.error("Error in step 4.1 of acquisition process " + str(e))
            # Clean up database connections in case of error
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()

            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Go to begin of the outermost while loop
            time.sleep(60)
            continue

        # Connect to the OPC UA server
        try:
            # Refer to https://www.python.org/dev/peps/pep-0492/#new-syntax
            # for Asynchronous Context Managers and "async with"
            mgr = (Client(url=url))
            aexit = type(mgr).__aexit__
            aenter = type(mgr).__aenter__(mgr)
            client = await aenter
        except Exception as e:
            logger.error("OPC UA Connection error in step 3.2 of acquisition process " + str(e))
            # sleep and continue to the begin of outside while loop
            time.sleep(60)
            continue

        # Inner while loop to read all point values periodically
        while True:
            energy_value_list = list()
            analog_value_list = list()
            digital_value_list = list()

            # indicates if there is an read area error
            is_get_node_value_error = False

            # Process each configured point
            for point in point_list:
                # Begin of foreach point loop
                try:
                    # Parse the point address configuration from JSON
                    address = json.loads(point['address'])
                except Exception as e:
                    logger.error("Error in step 4.2 of acquisition process: Invalid point address in JSON " + str(e))
                    continue

                # Validate point address configuration
                if 'node_id' not in address.keys() or len(address['node_id']) == 0:
                    logger.error('Data Source(ID=%s), Point(ID=%s) Invalid address data.',
                                 data_source_id, point['id'])
                    # Invalid point configuration found
                    # Go to begin of foreach point loop to process next point
                    continue

                # Read point value from OPC UA server
                try:
                    node = client.get_node(address['node_id'])
                    value = await node.get_value()
                except Exception as e:
                    logger.error(str(e) + " at host:" + url + " node_id:" + str(address['node_id']))
                    # exception occurred when read node value, go on the foreach point loop to process next point
                    is_get_node_value_error = True

                    # break the foreach point loop
                    break

                if not isinstance(value, float) and not isinstance(value, int) or math.isnan(value):
                    # invalid result, and go on the foreach point loop to process next point
                    logger.error(" Error in step 4.3 of acquisition process:\n"
                                 " invalid result: not float and not int or not a number "
                                 " for point_id: " + str(point['id']))
                    continue

                # Process the value based on point type and apply ratio/offset
                if point['object_type'] == 'ANALOG_VALUE':
                    # Standard SQL requires that DECIMAL(18, 3) be able to store any value with 18 digits and
                    # 3 decimals, so values that can be stored in the column range
                    # from -999999999999999.999 to 999999999999999.999.
                    if Decimal(-999999999999999.999) <= Decimal(value) <= Decimal(999999999999999.999):
                        analog_value_list.append({'point_id': point['id'],
                                                  'is_trend': point['is_trend'],
                                                  'value': Decimal(value) * point['ratio'] + point['offset_constant']})
                elif point['object_type'] == 'ENERGY_VALUE':
                    # Standard SQL requires that DECIMAL(18, 3) be able to store any value with 18 digits and
                    # 3 decimals, so values that can be stored in the column range
                    # from -999999999999999.999 to 999999999999999.999.
                    if Decimal(-999999999999999.999) <= Decimal(value) <= Decimal(999999999999999.999):
                        energy_value_list.append({'point_id': point['id'],
                                                  'is_trend': point['is_trend'],
                                                  'value': Decimal(value) * point['ratio'] + point['offset_constant']})
                elif point['object_type'] == 'DIGITAL_VALUE':
                    digital_value_list.append({'point_id': point['id'],
                                               'is_trend': point['is_trend'],
                                               'value': int(value) * int(point['ratio']) + int(point['offset_constant'])
                                               })

            # End of foreach point loop
            ############################################################################################################
            # Step 5: Bulk insert point values and update latest values in historical database
            ############################################################################################################
            # Check the connection to the Historical Database
            if not cnx_historical_db.is_connected():
                try:
                    cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
                    cursor_historical_db = cnx_historical_db.cursor()
                except Exception as e:
                    logger.error("Error in step 5.1 of acquisition process: " + str(e))
                    # Clean up database connections in case of error
                    if cursor_historical_db:
                        cursor_historical_db.close()
                    if cnx_historical_db:
                        cnx_historical_db.close()
                    # Go to begin of the inner while loop
                    time.sleep(60)
                    continue

            # Check the connection to the System Database
            if not cnx_system_db.is_connected():
                try:
                    cnx_system_db = mysql.connector.connect(**config.myems_system_db)
                    cursor_system_db = cnx_system_db.cursor()
                except Exception as e:
                    logger.error("Error in step 5.2 of acquisition process: " + str(e))
                    # Clean up database connections in case of error
                    if cursor_system_db:
                        cursor_system_db.close()
                    if cnx_system_db:
                        cnx_system_db.close()
                    # Go to begin of the inner while loop
                    time.sleep(60)
                    continue

            # Get current UTC timestamp for data storage
            current_datetime_utc = datetime.now(timezone.utc).replace(tzinfo=None)

            # Bulk insert analog values into historical database and update latest values
            # Process in batches of 100 to avoid overwhelming the database
            while len(analog_value_list) > 0:
                analog_value_list_100 = analog_value_list[:100]  # Take first 100 items
                analog_value_list = analog_value_list[100:]      # Remove processed items

                # Build INSERT statement for trend data (historical values)
                add_values = (" INSERT INTO tbl_analog_value (point_id, utc_date_time, actual_value) "
                              " VALUES  ")
                trend_value_count = 0

                # Add trend values to INSERT statement
                for point_value in analog_value_list_100:
                    if point_value['is_trend']:
                        add_values += " (" + str(point_value['point_id']) + ","
                        add_values += "'" + current_datetime_utc.isoformat() + "',"
                        add_values += str(point_value['value']) + "), "
                        trend_value_count += 1

                # Execute trend data insertion if there are trend values
                if trend_value_count > 0:
                    try:
                        # Trim ", " at the end of string and then execute
                        cursor_historical_db.execute(add_values[:-2])
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 5.3.1 of acquisition process " + str(e))
                        # Ignore this exception and continue processing

                # Update latest values table for analog values
                delete_values = " DELETE FROM tbl_analog_value_latest WHERE point_id IN ( "
                latest_values = (" INSERT INTO tbl_analog_value_latest (point_id, utc_date_time, actual_value) "
                                 " VALUES  ")
                latest_value_count = 0

                # Build DELETE and INSERT statements for latest values
                for point_value in analog_value_list_100:
                    delete_values += str(point_value['point_id']) + ","
                    latest_values += " (" + str(point_value['point_id']) + ","
                    latest_values += "'" + current_datetime_utc.isoformat() + "',"
                    latest_values += str(point_value['value']) + "), "
                    latest_value_count += 1

                # Execute latest values update if there are values to process
                if latest_value_count > 0:
                    try:
                        # Replace "," at the end of string with ")" and execute DELETE
                        cursor_historical_db.execute(delete_values[:-1] + ")")
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 5.3.2 of acquisition process " + str(e))
                        # Ignore this exception and continue processing

                    try:
                        # Trim ", " at the end of string and then execute INSERT
                        cursor_historical_db.execute(latest_values[:-2])
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 5.3.3 of acquisition process " + str(e))
                        # Ignore this exception and continue processing

            # Bulk insert energy values into historical database and update latest values
            # Process in batches of 100 to avoid overwhelming the database
            while len(energy_value_list) > 0:
                energy_value_list_100 = energy_value_list[:100]  # Take first 100 items
                energy_value_list = energy_value_list[100:]      # Remove processed items

                # Build INSERT statement for trend data (historical values)
                add_values = (" INSERT INTO tbl_energy_value (point_id, utc_date_time, actual_value) "
                              " VALUES  ")
                trend_value_count = 0

                # Add trend values to INSERT statement
                for point_value in energy_value_list_100:
                    if point_value['is_trend']:
                        add_values += " (" + str(point_value['point_id']) + ","
                        add_values += "'" + current_datetime_utc.isoformat() + "',"
                        add_values += str(point_value['value']) + "), "
                        trend_value_count += 1

                # Execute trend data insertion if there are trend values
                if trend_value_count > 0:
                    try:
                        # Trim ", " at the end of string and then execute
                        cursor_historical_db.execute(add_values[:-2])
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 5.4.1 of acquisition process: " + str(e))
                        # Ignore this exception and continue processing

                # Update latest values table for energy values
                delete_values = " DELETE FROM tbl_energy_value_latest WHERE point_id IN ( "
                latest_values = (" INSERT INTO tbl_energy_value_latest (point_id, utc_date_time, actual_value) "
                                 " VALUES  ")
                latest_value_count = 0

                # Build DELETE and INSERT statements for latest values
                for point_value in energy_value_list_100:
                    delete_values += str(point_value['point_id']) + ","
                    latest_values += " (" + str(point_value['point_id']) + ","
                    latest_values += "'" + current_datetime_utc.isoformat() + "',"
                    latest_values += str(point_value['value']) + "), "
                    latest_value_count += 1

                # Execute latest values update if there are values to process
                if latest_value_count > 0:
                    try:
                        # Replace "," at the end of string with ")" and execute DELETE
                        cursor_historical_db.execute(delete_values[:-1] + ")")
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 5.4.2 of acquisition process " + str(e))
                        # Ignore this exception and continue processing

                    try:
                        # Trim ", " at the end of string and then execute INSERT
                        cursor_historical_db.execute(latest_values[:-2])
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 5.4.3 of acquisition process " + str(e))
                        # Ignore this exception and continue processing

            # Bulk insert digital values into historical database and update latest values
            # Process in batches of 100 to avoid overwhelming the database
            while len(digital_value_list) > 0:
                digital_value_list_100 = digital_value_list[:100]  # Take first 100 items
                digital_value_list = digital_value_list[100:]      # Remove processed items

                # Build INSERT statement for trend data (historical values)
                add_values = (" INSERT INTO tbl_digital_value (point_id, utc_date_time, actual_value) "
                              " VALUES  ")
                trend_value_count = 0

                # Add trend values to INSERT statement
                for point_value in digital_value_list_100:
                    if point_value['is_trend']:
                        add_values += " (" + str(point_value['point_id']) + ","
                        add_values += "'" + current_datetime_utc.isoformat() + "',"
                        add_values += str(point_value['value']) + "), "
                        trend_value_count += 1

                # Execute trend data insertion if there are trend values
                if trend_value_count > 0:
                    try:
                        # Trim ", " at the end of string and then execute
                        cursor_historical_db.execute(add_values[:-2])
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 5.5.1 of acquisition process: " + str(e))
                        # Ignore this exception and continue processing

                # Update latest values table for digital values
                delete_values = " DELETE FROM tbl_digital_value_latest WHERE point_id IN ( "
                latest_values = (" INSERT INTO tbl_digital_value_latest (point_id, utc_date_time, actual_value) "
                                 " VALUES  ")
                latest_value_count = 0

                # Build DELETE and INSERT statements for latest values
                for point_value in digital_value_list_100:
                    delete_values += str(point_value['point_id']) + ","
                    latest_values += " (" + str(point_value['point_id']) + ","
                    latest_values += "'" + current_datetime_utc.isoformat() + "',"
                    latest_values += str(point_value['value']) + "), "
                    latest_value_count += 1

                # Execute latest values update if there are values to process
                if latest_value_count > 0:
                    try:
                        # Replace "," at the end of string with ")" and execute DELETE
                        cursor_historical_db.execute(delete_values[:-1] + ")")
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 5.5.2 of acquisition process " + str(e))
                        # Ignore this exception and continue processing

                    try:
                        # Trim ", " at the end of string and then execute INSERT
                        cursor_historical_db.execute(latest_values[:-2])
                        cnx_historical_db.commit()
                    except Exception as e:
                        logger.error("Error in step 5.5.3 of acquisition process " + str(e))
                        # Ignore this exception and continue processing

            # Update data source last seen datetime to indicate successful data collection
            update_row = (" UPDATE tbl_data_sources "
                          " SET last_seen_datetime_utc = '" + current_datetime_utc.isoformat() + "' "
                          " WHERE id = %s ")
            try:
                cursor_system_db.execute(update_row, (data_source_id,))
                cnx_system_db.commit()
            except Exception as e:
                logger.error("Error in step 5.6 of acquisition process " + str(e))
                # Clean up database connections in case of error
                if cursor_system_db:
                    cursor_system_db.close()
                if cnx_system_db:
                    cnx_system_db.close()
                # Go to begin of the inner while loop
                time.sleep(60)
                continue

            # Sleep for the configured interval before starting the next data collection cycle
            # This argument may be a floating point number for subsecond precision
            time.sleep(interval_in_seconds)

        # End of the inner while loop

    # End of the outermost while loop
