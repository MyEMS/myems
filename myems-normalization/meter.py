"""
MyEMS Normalization Service - Physical Meter Processing Module

This module handles the normalization of energy consumption data from physical meters.
It processes raw energy values from the historical database and converts them into
normalized hourly consumption data for analysis and reporting.

The meter normalization process performs the following functions:
1. Retrieves all physical meters and their associated energy value points
2. Uses multiprocessing to process meters in parallel for efficiency
3. Calculates energy consumption increments from cumulative meter readings
4. Applies data quality checks and validation rules
5. Stores normalized hourly consumption data in the energy database

Key features:
- Handles meter disconnections and reconnections
- Validates data against configured high/low limits
- Processes data in configurable time intervals (hourly/half-hourly)
- Maintains data integrity through comprehensive error handling
"""

import random
import time
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from multiprocessing import Pool
import mysql.connector
import config


########################################################################################################################
# Physical Meter Normalization Procedures:
# Step 1: Query all meters and associated energy value points from system database
# Step 2: Create multiprocessing pool to call worker processes in parallel
########################################################################################################################


def calculate_hourly(logger):
    """
    Main function for physical meter energy consumption normalization.

    This function runs continuously, retrieving all physical meters from the system database
    and processing them in parallel to calculate normalized hourly energy consumption data.

    Args:
        logger: Logger instance for recording normalization activities and errors
    """
    while True:
        ################################################################################################################
        # Step 1: Query all meters and associated energy value points from system database
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None

        # Connect to system database to retrieve meter configuration
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of meter.calculate_hourly process " + str(e))
            # Clean up database connections in case of error
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep several minutes and continue the outer loop to reconnect the database
            time.sleep(60)
            continue

        print("Connected to the MyEMS System Database")

        # Retrieve all physical meters with their associated energy value points
        try:
            cursor_system_db.execute(" SELECT m.id, m.name, m.hourly_low_limit, m.hourly_high_limit, "
                                     "        p.id as point_id, p.units "
                                     " FROM tbl_meters m, tbl_meters_points mp, tbl_points p "
                                     " WHERE m.id = mp.meter_id "
                                     "       AND mp.point_id = p.id "
                                     "       AND p.object_type = 'ENERGY_VALUE'")
            rows_meters = cursor_system_db.fetchall()

            # Check if meters were found
            if rows_meters is None or len(rows_meters) == 0:
                # Sleep several minutes and continue the outer loop to reconnect the database
                time.sleep(60)
                continue

            # Build meter list with configuration data
            meter_list = list()
            for row in rows_meters:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "hourly_low_limit": row[2],
                               "hourly_high_limit": row[3],
                               "point_id": row[4],
                               "units": row[5]}

                meter_list.append(meta_result)

        except Exception as e:
            logger.error("Error in step 1.2 meter.calculate_hourly " + str(e))
            # Sleep several minutes and continue the outer loop to reconnect the database
            time.sleep(60)
            continue
        finally:
            # Always clean up database connections
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        # Shuffle the meter list for randomly calculating the meter hourly values
        # This helps distribute processing load evenly across time
        random.shuffle(meter_list)

        print("Got all meters in MyEMS System Database")

        ################################################################################################################
        # Step 2: Create multiprocessing pool to call worker processes in parallel
        ################################################################################################################
        # Create process pool with configured size for parallel processing
        p = Pool(processes=config.pool_size)
        error_list = p.map(worker, meter_list)
        p.close()
        p.join()

        # Log any errors from worker processes
        for error in error_list:
            if error is not None and len(error) > 0:
                logger.error(error)

        print("go to sleep ...")
        time.sleep(60)  # Sleep for 1 minute before next processing cycle
        print("wake from sleep, and continue to work...")
    # End of outer while loop


########################################################################################################################
# Worker Process Procedures for Individual Meter Processing:
# Step 1: Determine the start datetime and end datetime for processing
# Step 2: Get raw energy data from historical database between start_datetime_utc and end_datetime_utc
# Step 3: Normalize energy values by minutes_to_count (calculate consumption increments)
# Step 4: Insert normalized data into energy database
#
# NOTE: Returns None on success or error string on failure because the logger object cannot be passed as parameter
########################################################################################################################

def worker(meter):
    """
    Worker function to process a single meter's energy consumption normalization.

    This function processes one meter at a time, calculating normalized hourly energy
    consumption from raw cumulative meter readings.

    Args:
        meter: Dictionary containing meter configuration (id, name, limits, point_id, units)

    Returns:
        None on success, error string on failure
    """
    print("Start to process meter: " + "'" + meter['name'] + "'")
    ####################################################################################################################
    # Step 1: Determine the start datetime and end datetime for processing
    ####################################################################################################################
    cnx_energy_db = None
    cursor_energy_db = None

    # Connect to energy database to check existing processed data
    try:
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()
    except Exception as e:
        error_string = "Error in step 1.1 of meter.worker " + str(e) + " for '" + meter['name'] + "'"
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    # Get the initial start datetime from config file in case there is no energy data
    start_datetime_utc = datetime.strptime(config.start_datetime_utc, '%Y-%m-%d %H:%M:%S')
    start_datetime_utc = start_datetime_utc.replace(tzinfo=timezone.utc)
    start_datetime_utc = start_datetime_utc.replace(minute=0, second=0, microsecond=0)

    # Check for existing processed data to determine where to continue
    try:
        query = (" SELECT MAX(start_datetime_utc) "
                 " FROM tbl_meter_hourly "
                 " WHERE meter_id = %s ")
        cursor_energy_db.execute(query, (meter['id'],))
        row_datetime = cursor_energy_db.fetchone()
    except Exception as e:
        error_string = "Error in step 1.3 of meter.worker " + str(e) + " for '" + meter['name'] + "'"
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    # Update start datetime if existing processed data is found
    if row_datetime is not None and len(row_datetime) > 0 and isinstance(row_datetime[0], datetime):
        start_datetime_utc = row_datetime[0].replace(tzinfo=timezone.utc)
        # Replace second and microsecond with 0
        # NOTE: DO NOT replace minute in case of calculating in half hourly
        start_datetime_utc = start_datetime_utc.replace(second=0, microsecond=0)
        # Start from the next time slot
        start_datetime_utc += timedelta(minutes=config.minutes_to_count)

    # Calculate end datetime with cleaning service buffer
    end_datetime_utc = datetime.utcnow().replace(tzinfo=timezone.utc)
    # We should allow myems-cleaning service to take at most [minutes_to_clean] minutes to clean the data
    end_datetime_utc -= timedelta(minutes=config.minutes_to_clean)

    # Validate that there's enough time difference to process
    time_difference = end_datetime_utc - start_datetime_utc
    time_difference_in_minutes = time_difference / timedelta(minutes=1)
    if time_difference_in_minutes < config.minutes_to_count:
        error_string = "it's too early to calculate" + " for '" + meter['name'] + "'"
        print(error_string)
        return error_string

    # Trim end_datetime_utc to align with processing intervals
    trimmed_end_datetime_utc = start_datetime_utc + timedelta(minutes=config.minutes_to_count)
    while trimmed_end_datetime_utc <= end_datetime_utc:
        trimmed_end_datetime_utc += timedelta(minutes=config.minutes_to_count)

    end_datetime_utc = trimmed_end_datetime_utc - timedelta(minutes=config.minutes_to_count)

    # Final validation of datetime range
    if end_datetime_utc <= start_datetime_utc:
        error_string = "it's too early to calculate" + " for '" + meter['name'] + "'"
        print(error_string)
        return error_string

    print("start_datetime_utc: " + start_datetime_utc.isoformat()[0:19]
          + "end_datetime_utc: " + end_datetime_utc.isoformat()[0:19])

    ####################################################################################################################
    # Step 2: Get raw energy data from historical database between start_datetime_utc and end_datetime_utc
    ####################################################################################################################

    cnx_historical_db = None
    cursor_historical_db = None

    # Connect to historical database to retrieve raw energy values
    try:
        cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical_db = cnx_historical_db.cursor()
    except Exception as e:
        error_string = "Error in step 1.2 of meter.worker " + str(e) + " for '" + meter['name'] + "'"
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()

        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()

        print(error_string)
        return error_string

    # Query latest record before start_datetime_utc to establish baseline for consumption calculation
    energy_value_just_before_start = dict()
    try:
        query = (" SELECT utc_date_time, actual_value "
                 " FROM tbl_energy_value "
                 " WHERE point_id = %s AND utc_date_time < %s AND is_bad = 0 "
                 " ORDER BY utc_date_time DESC "
                 " LIMIT 1 ")
        cursor_historical_db.execute(query, (meter['point_id'], start_datetime_utc,))
        row_energy_value_before_start = cursor_historical_db.fetchone()

        if row_energy_value_before_start is not None and len(row_energy_value_before_start) > 0:
            energy_value_just_before_start = {"utc_date_time": row_energy_value_before_start[0],
                                              "actual_value": row_energy_value_before_start[1]}
    except Exception as e:
        error_string = "Error in step 2.2 of meter.worker " + str(e) + " for '" + meter['name'] + "'"
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()

        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()

        print(error_string)
        return error_string

    # Query energy values to be normalized (only good quality data)
    try:
        query = (" SELECT utc_date_time, actual_value "
                 " FROM tbl_energy_value "
                 " WHERE point_id = %s AND utc_date_time >= %s AND utc_date_time < %s AND is_bad = 0 "
                 " ORDER BY utc_date_time ")
        cursor_historical_db.execute(query, (meter['point_id'], start_datetime_utc, end_datetime_utc))
        rows_energy_values = cursor_historical_db.fetchall()
    except Exception as e:
        error_string = "Error in step 2.3 of meter.worker " + str(e) + " for '" + meter['name'] + "'"

        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()

        print(error_string)
        return error_string
    finally:
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()

    ####################################################################################################################
    # Step 3: Normalize energy values by minutes_to_count
    ####################################################################################################################

    ####################################################################################################################
    # special test case 1 (disconnected)
    # id       point_id  utc_date_time        actual_value
    # '878152', '3315', '2016-12-05 23:58:46', '38312088'
    # '878183', '3315', '2016-12-05 23:59:48', '38312088'
    # '878205', '3315', '2016-12-06 06:14:49', '38315900'
    # '878281', '3315', '2016-12-06 06:15:50', '38315928'
    # '878357', '3315', '2016-12-06 06:16:52', '38315928'
    ####################################################################################################################

    ####################################################################################################################
    # special test case 2 (a new added used meter)
    # id,         point_id,  utc_date_time,      actual_value
    # '19070111', '1734', '2017-03-27 02:36:07', '56842220.77297248'
    # '19069943', '1734', '2017-03-27 02:35:04', '56842208.420127675'
    # '19069775', '1734', '2017-03-27 02:34:01', '56842195.95270827'
    # '19069608', '1734', '2017-03-27 02:32:58', '56842183.48610827'
    # '19069439', '1734', '2017-03-27 02:31:53', '56842170.812365524'
    # '19069270', '1734', '2017-03-27 02:30:48', '56842157.90797222'
    # null,       null,   null,                , null

    ####################################################################################################################

    ####################################################################################################################
    # special test case 3 (hi_limit exceeded)
    # id       point_id  utc_date_time        actual_value
    # '3230282', '3336', '2016-12-24 08:26:14', '999984.0625'
    # '3230401', '3336', '2016-12-24 08:27:15', '999984.0625'
    # '3230519', '3336', '2016-12-24 08:28:17', '999984.0625'
    # '3230638', '3336', '2016-12-24 08:29:18', '20'
    # '3230758', '3336', '2016-12-24 08:30:20', '20'
    # '3230878', '3336', '2016-12-24 08:31:21', '20'
    ####################################################################################################################

    ####################################################################################################################
    # test case 4 (recovered from bad zeroes)
    # id      point_id  utc_date_time       actual_value is_bad
    # 300366736	1003344	2019-03-14 02:03:20	1103860.625
    # 300366195	1003344	2019-03-14 02:02:19	1103845
    # 300365654	1003344	2019-03-14 02:01:19	1103825.5
    # 300365106	1003344	2019-03-14 02:00:18	1103804.25
    # 300364562	1003344	2019-03-14 01:59:17	1103785.625
    # 300364021	1003344	2019-03-14 01:58:17	1103770.875
    # 300363478	1003344	2019-03-14 01:57:16	1103755.125
    # 300362936	1003344	2019-03-14 01:56:16	1103739.375
    # 300362393	1003344	2019-03-14 01:55:15	1103720.625
    # 300361851	1003344	2019-03-14 01:54:15	1103698.125
    # 300361305	1003344	2019-03-14 01:53:14	1103674.75
    # 300360764	1003344	2019-03-14 01:52:14	1103649
    # 300360221	1003344	2019-03-14 01:51:13	1103628.25
    # 300359676	1003344	2019-03-14 01:50:13	1103608.625
    # 300359133	1003344	2019-03-14 01:49:12	1103586.75
    # 300358592	1003344	2019-03-14 01:48:12	1103564
    # 300358050	1003344	2019-03-14 01:47:11	1103542
    # 300357509	1003344	2019-03-14 01:46:11	1103520.625
    # 300356966	1003344	2019-03-14 01:45:10	1103499.375
    # 300356509	1003344	2019-03-14 01:44:10	1103478.25
    # 300355964	1003344	2019-03-14 01:43:09	1103456.25
    # 300355419	1003344	2019-03-14 01:42:09	1103435.5
    # 300354878	1003344	2019-03-14 01:41:08	1103414.625
    # 300354335	1003344	2019-03-14 01:40:08	1103391.875
    # 300353793	1003344	2019-03-14 01:39:07	1103373
    # 300353248	1003344	2019-03-14 01:38:07	1103349
    # 300352705	1003344	2019-03-14 01:37:06	1103325.75
    # 300352163	1003344	2019-03-14 01:36:06	0	            1
    # 300351621	1003344	2019-03-14 01:35:05	0	            1
    # 300351080	1003344	2019-03-14 01:34:05	0	            1
    # 300350532	1003344	2019-03-14 01:33:04	0	            1
    # 300349988	1003344	2019-03-14 01:32:04	0	            1
    # 300349446	1003344	2019-03-14 01:31:03	0	            1
    # 300348903	1003344	2019-03-14 01:30:02	0	            1
    # 300348359	1003344	2019-03-14 01:29:02	0	            1
    # 300347819	1003344	2019-03-14 01:28:01	0	            1
    # 300347277	1003344	2019-03-14 01:27:01	0	            1
    # 300346733	1003344	2019-03-14 01:26:00	0	            1
    # 300346191	1003344	2019-03-14 01:25:00	0	            1
    ####################################################################################################################

    # Initialize list to store normalized consumption values
    normalized_values = list()

    # Handle case where no energy values are available (meter offline or all bad data)
    if rows_energy_values is None or len(rows_energy_values) == 0:
        # NOTE: There isn't any value to be normalized
        # That means the meter is offline or all values are bad
        current_datetime_utc = start_datetime_utc
        while current_datetime_utc < end_datetime_utc:
            normalized_values.append({'start_datetime_utc': current_datetime_utc, 'actual_value': Decimal(0.0)})
            current_datetime_utc += timedelta(minutes=config.minutes_to_count)
    else:
        # Initialize maximum value from baseline reading
        maximum = Decimal(0.0)
        if energy_value_just_before_start is not None and \
                len(energy_value_just_before_start) > 0 and \
                energy_value_just_before_start['actual_value'] > Decimal(0.0):
            maximum = energy_value_just_before_start['actual_value']

        # Process each time slot within the datetime range
        current_datetime_utc = start_datetime_utc
        while current_datetime_utc < end_datetime_utc:
            initial_maximum = maximum

            # Get all energy values in current time slot
            current_energy_values = list()
            while len(rows_energy_values) > 0:
                row_energy_value = rows_energy_values.pop(0)
                energy_value_datetime = row_energy_value[0].replace(tzinfo=timezone.utc)
                if energy_value_datetime < current_datetime_utc + timedelta(minutes=config.minutes_to_count):
                    current_energy_values.append(row_energy_value)
                else:
                    rows_energy_values.insert(0, row_energy_value)
                    break

            # Calculate the energy increment for current time slot
            increment = Decimal(0.0)
            # Maximum should be equal to the maximum value of last time slot
            for index in range(len(current_energy_values)):
                current_energy_value = current_energy_values[index]
                if maximum < current_energy_value[1]:
                    increment += current_energy_value[1] - maximum
                maximum = current_energy_value[1]

            # Omit huge initial value for a new meter
            # Or omit huge value for a recovered meter with zero values during failure
            # NOTE: This method may cause the loss of energy consumption in this time slot
            if initial_maximum <= Decimal(0.1):
                increment = Decimal(0.0)

            # Check with hourly low limit (minimum consumption threshold)
            if increment < meter['hourly_low_limit']:
                increment = Decimal(0.0)

            # Check with hourly high limit (maximum consumption threshold)
            # NOTE: This method may cause the loss of energy consumption in this time slot
            if increment > meter['hourly_high_limit']:
                increment = Decimal(0.0)

            # Store normalized consumption data
            meta_data = {'start_datetime_utc': current_datetime_utc,
                         'actual_value': increment}
            # Append meta_data
            normalized_values.append(meta_data)
            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    ####################################################################################################################
    # Step 4: Insert normalized data into energy database
    ####################################################################################################################
    # Process normalized values in batches of 100 to avoid overwhelming the database
    while len(normalized_values) > 0:
        insert_100 = normalized_values[:100]  # Take first 100 items
        normalized_values = normalized_values[100:]  # Remove processed items

        try:
            # Build INSERT statement for normalized hourly consumption data
            add_values = (" INSERT INTO tbl_meter_hourly (meter_id, start_datetime_utc, actual_value) "
                          " VALUES  ")

            # Add each normalized value to the INSERT statement
            for meta_data in insert_100:
                add_values += " (" + str(meter['id']) + ","
                add_values += "'" + meta_data['start_datetime_utc'].isoformat()[0:19] + "',"
                add_values += str(meta_data['actual_value']) + "), "

            # Trim ", " at the end of string and then execute
            cursor_energy_db.execute(add_values[:-2])
            cnx_energy_db.commit()
        except Exception as e:
            error_string = "Error in step 4.1 of meter.worker " + str(e) + " for '" + meter['name'] + "'"
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()

            print(error_string)
            return error_string

    # Clean up database connections
    if cursor_energy_db:
        cursor_energy_db.close()
    if cnx_energy_db:
        cnx_energy_db.close()

    print("End of processing meter: " + "'" + meter['name'] + "'")
    return None
