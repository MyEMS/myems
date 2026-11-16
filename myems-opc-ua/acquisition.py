"""
MyEMS OPC UA Gateway Service - Data Acquisition Module

This module handles the core data acquisition functionality for OPC UA servers.
It connects to OPC UA servers, reads data from configured points,
and stores the collected data in the MyEMS historical database.

The acquisition process performs the following functions:
1. Updates process ID in database for monitoring
2. Retrieves point configuration from system database
3. Reads point values from OPC UA servers using configured parameters
4. Processes and validates the collected data
5. Bulk inserts point values and updates latest values in historical database

The module supports multiple data types:
- ANALOG_VALUE: Continuous sensor readings (temperature, pressure, flow, etc.)
- ENERGY_VALUE: Cumulative energy consumption data (kWh readings)
- DIGITAL_VALUE: Binary states (on/off, open/closed, alarm status, etc.)
- TEXT_VALUE: String or LocalizedText states (batch number, product name, etc.)

Data processing includes:
- Ratio and offset calculations for calibration
- Data validation and range checking
- Trend data storage and latest value updates
"""

import asyncio
import json
import math
import os
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import mysql.connector
from asyncua import Client
import config


# Maximum value that can be stored in a column of type DECIMAL(21, 6)
DECIMAL_MAX = Decimal('999999999999999.999999')
DECIMAL_MIN = -DECIMAL_MAX

# Maximum value that can be stored in a column of type INT
INT_MAX = 2147483647
INT_MIN = -2147483648

# Default timeout in seconds for a single OPC UA request
DEFAULT_REQUEST_TIMEOUT_IN_SECONDS = 10.0
# Timeout in seconds for establishing the OPC UA session
CONNECT_TIMEOUT_IN_SECONDS = 15.0
# Default interval in seconds between two acquisition cycles
DEFAULT_INTERVAL_IN_SECONDS = 300.0
# The minimum interval in seconds to avoid flooding the OPC UA server
MIN_INTERVAL_IN_SECONDS = 1.0
# Delay in seconds before retrying after a failure
RETRY_DELAY_IN_SECONDS = 60

# Mapping of point object types to the trend table and the latest value table
VALUE_TABLES = {
    'ANALOG_VALUE': ('tbl_analog_value', 'tbl_analog_value_latest'),
    'ENERGY_VALUE': ('tbl_energy_value', 'tbl_energy_value_latest'),
    'DIGITAL_VALUE': ('tbl_digital_value', 'tbl_digital_value_latest'),
    'TEXT_VALUE': ('tbl_text_value', 'tbl_text_value_latest'),
}

# Errors that only affect one point. They must never abort the whole acquisition
# cycle nor trigger a reconnection, otherwise a few misconfigured points with the
# smallest ids would hide every other point of the data source forever.
POINT_LEVEL_ERROR_NAMES = {
    'BadNodeIdUnknown',
    'BadNodeIdInvalid',
    'BadAttributeIdInvalid',
    'BadTypeMismatch',
    'BadNotReadable',
    'BadUserAccessDenied',
    'BadIndexRangeInvalid',
    'BadNotSupported',
    'BadDataEncodingInvalid',
    'BadDataEncodingUnsupported',
    'BadWaitingForInitialData',
}


class SessionBrokenError(Exception):
    """Raised when the OPC UA session can no longer be used and must be recreated."""


class HistoricalDatabaseError(Exception):
    """Raised when values could not be written to the historical database."""


########################################################################################################################
# Acquisition Procedures
# Step 1: Update process ID in database for monitoring and management
# Step 2: Get point list from system database for this data source
# Step 3: Connect to the OPC UA server
# Step 4: Read point values from OPC UA server using configured parameters
# Step 5: Bulk insert point values and update latest values in historical database
########################################################################################################################
def process(logger, data_source_id, url, interval_in_seconds):
    """
    Synchronous entry point of the acquisition subprocess.

    multiprocessing requires a regular function: if a coroutine function is passed
    directly, the subprocess only creates a coroutine object, nobody awaits it and
    the subprocess exits immediately without acquiring any data.
    The event loop is created and run here.

    Args:
        logger: Logger instance for recording acquisition activities and errors
        data_source_id: Unique identifier for the data source in the system database
        url: OPC UA endpoint URL, for example opc.tcp://host:port/path
        interval_in_seconds: Time interval between data acquisition cycles
    """
    try:
        asyncio.run(process_async(logger, data_source_id, url, interval_in_seconds))
    except Exception as e:
        # Let the main process notice the failure and restart this subprocess
        logger.error("Acquisition process of Data Source (ID=%s) terminated: %s", data_source_id, e)
        raise


async def process_async(logger, data_source_id, url, interval_in_seconds):
    """
    Main data acquisition coroutine.

    The system database connection is kept for the lifetime of the subprocess, while
    the OPC UA session and the historical database connection are recreated whenever
    the session becomes unusable.

    Args:
        logger: Logger instance for recording acquisition activities and errors
        data_source_id: Unique identifier for the data source in the system database
        url: OPC UA endpoint URL, for example opc.tcp://host:port/path
        interval_in_seconds: Time interval between data acquisition cycles
    """
    interval_in_seconds = normalize_interval(interval_in_seconds)

    cnx_system_db = None
    try:
        while True:
            try:
                # Step 1: Update process ID in database for monitoring and management
                if cnx_system_db is None or not cnx_system_db.is_connected():
                    cnx_system_db = mysql.connector.connect(**config.myems_system_db)
                    register_process(logger, cnx_system_db, data_source_id)

                # Step 2: Get point list from system database for this data source
                point_list = get_point_list(logger, cnx_system_db, data_source_id)
                if not point_list:
                    logger.error("Point Not Found in Data Source (ID=%s), retry later", data_source_id)
                    await asyncio.sleep(RETRY_DELAY_IN_SECONDS)
                    continue

                # Step 3 to Step 5: connect, read and store until the session is unusable
                await run_session(logger, data_source_id, url, cnx_system_db, point_list,
                                  interval_in_seconds)

                # run_session returns only when there are no points left to acquire
                await asyncio.sleep(RETRY_DELAY_IN_SECONDS)

            except SessionBrokenError as e:
                # The OPC UA session is unusable but the system database is fine
                logger.error("OPC UA session of Data Source (ID=%s) broken: %s", data_source_id, e)
                await asyncio.sleep(RETRY_DELAY_IN_SECONDS)

            except HistoricalDatabaseError as e:
                # Drop the historical connection, the next iteration opens a new one
                logger.error("Historical database of Data Source (ID=%s) unavailable: %s",
                             data_source_id, e)
                await asyncio.sleep(RETRY_DELAY_IN_SECONDS)

            except Exception as e:
                # The system database connection may be broken, drop it and reconnect later
                logger.error("Error in acquisition process of Data Source (ID=%s): %s: %s",
                             data_source_id, type(e).__name__, e)
                close_connection(cnx_system_db)
                cnx_system_db = None
                await asyncio.sleep(RETRY_DELAY_IN_SECONDS)
    finally:
        close_connection(cnx_system_db)


async def run_session(logger, data_source_id, url, cnx_system_db, point_list, interval_in_seconds):
    """
    Connect to the OPC UA server and acquire point values until the session is lost.

    The OPC UA client and the historical database connection are always closed when
    this function returns or raises, so no connection is leaked between retries.

    Args:
        logger: Logger instance for recording acquisition activities and errors
        data_source_id: Unique identifier for the data source in the system database
        url: OPC UA endpoint URL
        cnx_system_db: Opened system database connection
        point_list: Point configuration list initially loaded from the system database
        interval_in_seconds: Time interval between data acquisition cycles
    """
    cnx_historical_db = None
    try:
        try:
            cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
        except Exception as e:
            raise HistoricalDatabaseError(str(e) or type(e).__name__)

        # Connect explicitly so that a server that accepts TCP but never answers
        # cannot block the acquisition process forever
        client = Client(url=url, timeout=DEFAULT_REQUEST_TIMEOUT_IN_SECONDS)
        try:
            try:
                await asyncio.wait_for(client.connect(), timeout=CONNECT_TIMEOUT_IN_SECONDS)
            except Exception as e:
                raise SessionBrokenError("connect failed: %s: %s" % (type(e).__name__, e))
            logger.info("Succeeded to connect %s in acquisition process of Data Source (ID=%s)",
                        url, data_source_id)
            while True:
                # Reload points on every cycle so that added, removed or rescaled points take effect
                point_list = get_point_list(logger, cnx_system_db, data_source_id)
                if not point_list:
                    logger.warning("Point Not Found in Data Source (ID=%s), reconnect later",
                                   data_source_id)
                    return

                # Step 4: Read point values from OPC UA server
                value_lists, read_count = await read_point_values(logger, data_source_id, client, point_list)

                if read_count > 0:
                    # Step 5: Bulk insert point values and update latest values
                    current_datetime_utc = datetime.now(timezone.utc).replace(tzinfo=None)
                    try:
                        store_point_values(logger, cnx_historical_db, current_datetime_utc, value_lists)
                    except Exception as e:
                        # The historical connection may be dead, drop it so that the next
                        # iteration reconnects. last_seen must not be updated, otherwise the
                        # data source would be reported online while nothing is stored.
                        logger.error("Error in step 5 of acquisition process of Data Source (ID=%s): %s: %s",
                                     data_source_id, type(e).__name__, e)
                        close_connection(cnx_historical_db)
                        cnx_historical_db = None
                        raise HistoricalDatabaseError(str(e) or type(e).__name__)
                    # A data source is online only if at least one value was read and stored
                    update_last_seen(logger, cnx_system_db, data_source_id, current_datetime_utc)

                await asyncio.sleep(interval_in_seconds)

        finally:
            # Always close the client, the session and the socket of this attempt
            try:
                await client.disconnect()
            except Exception:
                pass

    finally:
        # Always release the historical database connection opened by this session
        close_connection(cnx_historical_db)


async def read_point_values(logger, data_source_id, client, point_list):
    """
    Read and validate all configured point values once.

    A bad point is logged and skipped, the remaining points are still read. Only an
    error that affects the session itself aborts the cycle so that the caller
    reconnects, for example when the server closed the session or the connection.

    Args:
        logger: Logger instance for recording acquisition activities and errors
        data_source_id: Unique identifier for the data source in the system database
        client: Connected OPC UA client
        point_list: Point configuration list

    Returns:
        A tuple of the value lists grouped by object type and the number of values read

    Raises:
        SessionBrokenError: If the OPC UA session can no longer be used
    """
    value_lists = {object_type: list() for object_type in VALUE_TABLES}
    read_count = 0

    for point in point_list:
        node_id = get_node_id(logger, data_source_id, point)
        if node_id is None:
            # Invalid point configuration, go on to process the next point
            continue

        try:
            node = client.get_node(node_id)
            # The request timeout is configured on the client, the outer timeout is the
            # last resort against a half-open socket. A timeout invalidates the session,
            # the caller reconnects instead of reusing a cancelled request.
            value = await asyncio.wait_for(node.get_value(),
                                           timeout=DEFAULT_REQUEST_TIMEOUT_IN_SECONDS)
        except asyncio.TimeoutError:
            raise SessionBrokenError("read timeout on node %s" % node_id)
        except Exception as e:
            if is_point_level_error(e):
                # A misconfigured or temporarily unavailable point must not stop the others
                logger.warning("Data Source(ID=%s), Point(ID=%s) skipped, node_id: %s: %s",
                               data_source_id, point['id'], node_id, e)
                continue
            raise SessionBrokenError("read failed: %s: %s" % (type(e).__name__, e))

        read_count += 1
        point_value = convert_value(logger, data_source_id, point, value)
        if point_value is not None:
            value_lists[point['object_type']].append({'point_id': point['id'],
                                                      'is_trend': point['is_trend'],
                                                      'value': point_value})

    return value_lists, read_count


def is_point_level_error(exception):
    """
    Return True when the error only affects the current point.

    Unknown errors are treated as session errors, reconnecting is safer than
    repeatedly reading from a session that may already be unusable.
    """
    if isinstance(exception, (ValueError, TypeError, KeyError)):
        return True
    return type(exception).__name__ in POINT_LEVEL_ERROR_NAMES


def convert_value(logger, data_source_id, point, value):
    """
    Validate a raw OPC UA value and apply the ratio and offset calibration.

    Args:
        logger: Logger instance for recording acquisition activities and errors
        data_source_id: Unique identifier for the data source in the system database
        point: Point configuration
        value: Raw value read from the OPC UA server

    Returns:
        The calibrated Decimal value for analog and energy points, the calibrated int
        value for digital points, or None if the value is invalid or out of range
    """
    object_type = point['object_type']
    if object_type not in VALUE_TABLES:
        logger.error("Data Source(ID=%s), Point(ID=%s) Invalid object type: %s",
                     data_source_id, point['id'], object_type)
        return None

    if object_type == 'TEXT_VALUE':
        # Text points accept strings and LocalizedText, they are stored as they are
        return convert_text_value(value)

    # bool is a subclass of int, convert it before checking numeric types
    if isinstance(value, bool):
        numeric_value = Decimal(int(value))
    elif isinstance(value, int):
        numeric_value = Decimal(value)
    elif isinstance(value, float):
        if not math.isfinite(value):
            logger.error("Data Source(ID=%s), Point(ID=%s) Invalid result: %s",
                         data_source_id, point['id'], value)
            return None
        # str() avoids the long binary tail produced by Decimal(float)
        numeric_value = Decimal(str(value))
    else:
        logger.error("Data Source(ID=%s), Point(ID=%s) Invalid result: not a number: %s",
                     data_source_id, point['id'], value)
        return None

    ratio, offset_constant = get_calibration(point)
    try:
        # The value stored in the database is the calibrated value, so the range
        # check must be applied after the ratio and offset are applied
        calibrated_value = numeric_value * ratio + offset_constant
    except InvalidOperation as e:
        logger.error("Data Source(ID=%s), Point(ID=%s) Invalid calibration: %s",
                     data_source_id, point['id'], e)
        return None

    if object_type == 'DIGITAL_VALUE':
        stored_value = int(calibrated_value)
        if not INT_MIN <= stored_value <= INT_MAX:
            logger.error("Data Source(ID=%s), Point(ID=%s) Value out of range: %s",
                         data_source_id, point['id'], calibrated_value)
            return None
        return stored_value

    if not DECIMAL_MIN <= calibrated_value <= DECIMAL_MAX:
        logger.error("Data Source(ID=%s), Point(ID=%s) Value out of range: %s",
                     data_source_id, point['id'], calibrated_value)
        return None
    return calibrated_value


def convert_text_value(value):
    """Convert an OPC UA value of a text point to the string stored in the database."""
    # LocalizedText exposes its content in the Text attribute
    text = getattr(value, 'Text', None)
    if text is not None:
        return str(text)
    return str(value)


def get_calibration(point):
    """
    Return the ratio and the offset constant of a point as Decimals.

    Missing or invalid calibration values fall back to no calibration so that a bad
    point configuration can never terminate the whole acquisition process.
    """
    try:
        ratio = Decimal(str(point['ratio'])) if point['ratio'] is not None else Decimal(1)
    except (InvalidOperation, ValueError):
        ratio = Decimal(1)
    try:
        offset_constant = Decimal(str(point['offset_constant'])) \
            if point['offset_constant'] is not None else Decimal(0)
    except (InvalidOperation, ValueError):
        offset_constant = Decimal(0)
    return ratio, offset_constant


def get_node_id(logger, data_source_id, point):
    """
    Parse and validate the node id from a point address in JSON format.

    Returns:
        The node id string, or None if the address is invalid
    """
    try:
        address = json.loads(point['address'])
    except Exception as e:
        logger.error("Error in step 4.1 of acquisition process: Invalid point address in JSON " + str(e))
        return None

    if not isinstance(address, dict):
        logger.error("Data Source(ID=%s), Point(ID=%s) Invalid address data.", data_source_id, point['id'])
        return None

    node_id = address.get('node_id')
    # A numeric or null node id must not raise, it is only an invalid configuration
    if not isinstance(node_id, str) or len(node_id.strip()) == 0:
        logger.error("Data Source(ID=%s), Point(ID=%s) Invalid address data.", data_source_id, point['id'])
        return None
    return node_id.strip()


def get_point_list(logger, cnx_system_db, data_source_id):
    """
    Retrieve all configured points of a data source from the system database.

    Args:
        logger: Logger instance for recording acquisition activities and errors
        cnx_system_db: Opened system database connection
        data_source_id: Unique identifier for the data source in the system database

    Returns:
        A list of point configuration dictionaries
    """
    cursor_system_db = None
    try:
        cursor_system_db = cnx_system_db.cursor()
        query = (" SELECT id, name, object_type, is_trend, ratio, offset_constant, address "
                 " FROM tbl_points "
                 " WHERE data_source_id = %s AND is_virtual = 0 "
                 " ORDER BY id ")
        cursor_system_db.execute(query, (data_source_id,))
        rows_point = cursor_system_db.fetchall()
    except Exception as e:
        logger.error("Error in step 2 of acquisition process: " + str(e))
        raise
    finally:
        if cursor_system_db:
            cursor_system_db.close()

    point_list = list()
    for row_point in rows_point or list():
        point_list.append({"id": row_point[0],
                           "name": row_point[1],
                           "object_type": row_point[2],
                           "is_trend": row_point[3],
                           "ratio": row_point[4],
                           "offset_constant": row_point[5],
                           "address": row_point[6]})
    return point_list


def store_point_values(logger, cnx_historical_db, current_datetime_utc, value_lists):
    """
    Insert trend values and update the latest values in a single transaction.

    Args:
        logger: Logger instance for recording acquisition activities and errors
        cnx_historical_db: Opened historical database connection
        current_datetime_utc: Timestamp applied to every value of this cycle
        value_lists: Value lists grouped by object type
    """
    cursor_historical_db = None
    try:
        cursor_historical_db = cnx_historical_db.cursor()

        for object_type, point_value_list in value_lists.items():
            if not point_value_list:
                continue

            table, latest_table = VALUE_TABLES[object_type]

            # Trend values, only the points configured with is_trend are stored
            trend_rows = [(point_value['point_id'], current_datetime_utc, point_value['value'])
                          for point_value in point_value_list if point_value['is_trend']]
            if trend_rows:
                cursor_historical_db.executemany(
                    " INSERT INTO " + table + " (point_id, utc_date_time, actual_value) "
                                             " VALUES (%s, %s, %s)", trend_rows)

            # Latest values are replaced in the same transaction, so a failure can not
            # leave a point without its latest value
            cursor_historical_db.executemany(
                " DELETE FROM " + latest_table + " WHERE point_id = %s",
                [(point_value['point_id'], ) for point_value in point_value_list])
            cursor_historical_db.executemany(
                " INSERT INTO " + latest_table + " (point_id, utc_date_time, actual_value) "
                                                " VALUES (%s, %s, %s)",
                [(point_value['point_id'], current_datetime_utc, point_value['value'])
                 for point_value in point_value_list])

        cnx_historical_db.commit()

    except Exception:
        # Roll back and let the caller invalidate the connection and the last seen time
        try:
            cnx_historical_db.rollback()
        except Exception:
            pass
        raise
    finally:
        if cursor_historical_db:
            cursor_historical_db.close()


def register_process(logger, cnx_system_db, data_source_id):
    """Update the data source record with the current process ID for monitoring."""
    cursor_system_db = None
    try:
        cursor_system_db = cnx_system_db.cursor()
        update_row = (" UPDATE tbl_data_sources "
                      " SET process_id = %s "
                      " WHERE id = %s ")
        cursor_system_db.execute(update_row, (os.getpid(), data_source_id,))
        cnx_system_db.commit()
    except Exception as e:
        logger.error("Error in step 1 of acquisition process: " + str(e))
        raise
    finally:
        if cursor_system_db:
            cursor_system_db.close()


def update_last_seen(logger, cnx_system_db, data_source_id, current_datetime_utc):
    """Update the data source last seen datetime after values were read successfully."""
    cursor_system_db = None
    try:
        cursor_system_db = cnx_system_db.cursor()
        update_row = (" UPDATE tbl_data_sources "
                      " SET last_seen_datetime_utc = %s "
                      " WHERE id = %s ")
        cursor_system_db.execute(update_row, (current_datetime_utc, data_source_id,))
        cnx_system_db.commit()
    except Exception as e:
        logger.error("Error in step 5.1 of acquisition process: " + str(e))
        raise
    finally:
        if cursor_system_db:
            cursor_system_db.close()


def normalize_interval(interval_in_seconds):
    """Return a valid acquisition interval, zero would flood the OPC UA server."""
    if not isinstance(interval_in_seconds, (int, float)) \
            or interval_in_seconds < MIN_INTERVAL_IN_SECONDS \
            or interval_in_seconds > 3600:
        return DEFAULT_INTERVAL_IN_SECONDS
    return float(interval_in_seconds)


def close_connection(cnx):
    """Close a database connection without raising."""
    if cnx is None:
        return
    try:
        cnx.close()
    except Exception:
        pass
