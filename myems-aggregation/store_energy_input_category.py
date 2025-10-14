"""
MyEMS Store Energy Input Category Aggregation Service

This module handles the aggregation of energy input consumption data for stores by energy categories.
It processes energy consumption data from various sources (meters, virtual meters, offline meters, equipment, spaces)
associated with each store and aggregates them into hourly energy consumption by categories.

The service follows a systematic approach:
1. Retrieves all stores from the system database
2. Creates a multiprocessing pool to process stores in parallel
3. For each store, retrieves associated input sources (meters, virtual meters, offline meters, equipment, spaces)
4. Determines the time range for data aggregation
5. Fetches energy consumption data from all input sources
6. Finds the common time slot across all sources
7. Aggregates energy data by energy categories and time slots
8. Saves the aggregated data to the energy database

This service runs continuously, processing new energy data as it becomes available and
ensuring accurate energy consumption aggregation for all stores in the system.
"""

import random
import time
from datetime import datetime, timedelta
from decimal import Decimal
from multiprocessing import Pool

import mysql.connector

import config


########################################################################################################################
# PROCEDURES
# Step 1: get all stores
# Step 2: Create multiprocessing pool to call worker in parallel
########################################################################################################################


def main(logger):
    """
    Main function for store energy input category aggregation service.

    This function runs continuously and processes energy aggregation for all stores.
    It uses multiprocessing to handle multiple stores in parallel for better performance.

    Args:
        logger: Logger instance for recording activities and errors

    The function follows these steps:
    1. Connects to the system database and retrieves all stores
    2. Creates a multiprocessing pool to process stores in parallel
    3. Sleeps for 300 seconds before the next processing cycle
    """

    while True:
        # Main processing loop - runs continuously
        ################################################################################################################
        # Step 1: Get all stores from system database
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None
        try:
            # Connect to MyEMS System Database
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of store_energy_input_category.main " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and continue the main loop to reconnect the database
            time.sleep(60)
            continue
        print("Connected to MyEMS System Database")

        # Retrieve all stores from the system database
        store_list = list()
        try:
            cursor_system_db.execute(" SELECT id, name "
                                     " FROM tbl_stores "
                                     " ORDER BY id ")
            rows_stores = cursor_system_db.fetchall()

            if rows_stores is None or len(rows_stores) == 0:
                print("There isn't any stores ")
                # Sleep and continue the main loop to reconnect the database
                time.sleep(60)
                continue

            # Build store list with id and name
            for row in rows_stores:
                store_list.append({"id": row[0], "name": row[1]})

        except Exception as e:
            logger.error("Error in step 1.2 of store_energy_input_category.main " + str(e))
            # Sleep and continue the main loop to reconnect the database
            time.sleep(60)
            continue
        finally:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        print("Got all stores in MyEMS System Database")

        # Shuffle the store list for randomly calculating the meter hourly value
        random.shuffle(store_list)

        ################################################################################################################
        # Step 2: Create multiprocessing pool to call worker in parallel
        ################################################################################################################
        # Create multiprocessing pool to process stores in parallel
        p = Pool(processes=config.pool_size)
        error_list = p.map(worker, store_list)
        p.close()
        p.join()

        # Log any errors that occurred during processing
        for error in error_list:
            if error is not None and len(error) > 0:
                logger.error(error)

        # Sleep for 300 seconds before the next processing cycle
        print("go to sleep 300 seconds...")
        time.sleep(300)
        print("wake from sleep, and continue to work...")
    # End of main processing loop


########################################################################################################################
# PROCEDURES:
#   Step 1: get all input meters associated with the store
#   Step 2: get all input virtual meters associated with the store
#   Step 3: get all input offline meters associated with the store
#   Step 4: determine start datetime and end datetime to aggregate
#   Step 5: for each meter in list, get energy input data from energy database
#   Step 6: for each virtual meter in list, get energy input data from energy database
#   Step 7: for each offline meter in list, get energy input data from energy database
#   Step 8: determine common time slot to aggregate
#   Step 9: aggregate energy data in the common time slot by energy categories and hourly
#   Step 10: save energy data to energy database
#
# NOTE: returns None or the error string because that the logger object cannot be passed in as parameter
########################################################################################################################

def worker(store):
    """
    Worker function to process energy aggregation for a single store.

    This function handles the complete energy aggregation process for one store,
    including retrieving associated input sources, fetching energy data, and saving
    aggregated results to the database.

    Args:
        store: Dictionary containing store information (id, name)

    Returns:
        None if successful, error string if an error occurred
    """
    ####################################################################################################################
    # Step 1: get all input meters associated with the store
    ####################################################################################################################
    print("Step 1: get all input meters associated with the store " + str(store['name']))

    meter_list = list()
    cnx_system_db = None
    cursor_system_db = None
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        error_string = "Error in step 1.1 of store_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_category_id "
                                 " FROM tbl_meters m, tbl_stores_meters sm "
                                 " WHERE m.id = sm.meter_id "
                                 "       AND m.is_counted = 1 "
                                 "       AND sm.store_id = %s ",
                                 (store['id'],))
        rows_meters = cursor_system_db.fetchall()

        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_list.append({"id": row[0],
                                   "name": row[1],
                                   "energy_category_id": row[2]})

    except Exception as e:
        error_string = "Error in step 1.2 of store_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 2: get all input virtual meters associated with the store
    ####################################################################################################################
    print("Step 2: get all input virtual meters associated with the store")
    virtual_meter_list = list()

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_category_id "
                                 " FROM tbl_virtual_meters m, tbl_stores_virtual_meters sm "
                                 " WHERE m.id = sm.virtual_meter_id "
                                 "       AND m.is_counted = 1 "
                                 "       AND sm.store_id = %s ",
                                 (store['id'],))
        rows_virtual_meters = cursor_system_db.fetchall()

        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_list.append({"id": row[0],
                                           "name": row[1],
                                           "energy_category_id": row[2]})

    except Exception as e:
        error_string = "Error in step 2.1 of store_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 3: get all input offline meters associated with the store
    ####################################################################################################################
    print("Step 3: get all input offline meters associated with the store")

    offline_meter_list = list()

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_category_id "
                                 " FROM tbl_offline_meters m, tbl_stores_offline_meters sm "
                                 " WHERE m.id = sm.offline_meter_id "
                                 "       AND m.is_counted = 1 "
                                 "       AND sm.store_id = %s ",
                                 (store['id'],))
        rows_offline_meters = cursor_system_db.fetchall()

        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_list.append({"id": row[0],
                                           "name": row[1],
                                           "energy_category_id": row[2]})

    except Exception as e:
        error_string = "Error in step 3.1 of store_energy_input_category.worker " + str(e)
        print(error_string)
        return error_string
    finally:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

    ####################################################################################################################
    # stop to the next store if this store is empty
    ####################################################################################################################
    if (meter_list is None or len(meter_list) == 0) and \
            (virtual_meter_list is None or len(virtual_meter_list) == 0) and \
            (offline_meter_list is None or len(offline_meter_list) == 0):
        print("This is an empty store ")
        return None

    ####################################################################################################################
    # Step 4: determine start datetime and end datetime to aggregate
    ####################################################################################################################
    print("Step 4: determine start datetime and end datetime to aggregate")
    cnx_energy_db = None
    cursor_energy_db = None
    try:
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()
    except Exception as e:
        error_string = "Error in step 4.1 of store_energy_input_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    try:
        query = (" SELECT MAX(start_datetime_utc) "
                 " FROM tbl_store_input_category_hourly "
                 " WHERE store_id = %s ")
        cursor_energy_db.execute(query, (store['id'],))
        row_datetime = cursor_energy_db.fetchone()
        start_datetime_utc = datetime.strptime(config.start_datetime_utc, '%Y-%m-%d %H:%M:%S')
        start_datetime_utc = start_datetime_utc.replace(minute=0, second=0, microsecond=0, tzinfo=None)

        if row_datetime is not None and len(row_datetime) > 0 and isinstance(row_datetime[0], datetime):
            # replace second and microsecond with 0
            # note: do not replace minute in case of calculating in half hourly
            start_datetime_utc = row_datetime[0].replace(second=0, microsecond=0, tzinfo=None)
            # start from the next time slot
            start_datetime_utc += timedelta(minutes=config.minutes_to_count)

        end_datetime_utc = datetime.utcnow().replace(second=0, microsecond=0, tzinfo=None)

        print("start_datetime_utc: " + start_datetime_utc.isoformat()[0:19]
              + "end_datetime_utc: " + end_datetime_utc.isoformat()[0:19])

    except Exception as e:
        error_string = "Error in step 4.2 of store_energy_input_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 5: for each meter in list, get energy input data from energy database
    ####################################################################################################################
    energy_meter_hourly = dict()
    try:
        if meter_list is not None and len(meter_list) > 0:
            for meter in meter_list:
                meter_id = str(meter['id'])

                query = (" SELECT start_datetime_utc, actual_value "
                         " FROM tbl_meter_hourly "
                         " WHERE meter_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (meter_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()
                if rows_energy_values is None or len(rows_energy_values) == 0:
                    energy_meter_hourly[meter_id] = None
                else:
                    energy_meter_hourly[meter_id] = dict()
                    for row_energy_value in rows_energy_values:
                        energy_meter_hourly[meter_id][row_energy_value[0]] = row_energy_value[1]
    except Exception as e:
        error_string = "Error in step 5.1 of store_energy_input_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 6: for each virtual meter in list, get energy input data from energy database
    ####################################################################################################################
    energy_virtual_meter_hourly = dict()
    if virtual_meter_list is not None and len(virtual_meter_list) > 0:
        try:
            for virtual_meter in virtual_meter_list:
                virtual_meter_id = str(virtual_meter['id'])

                query = (" SELECT start_datetime_utc, actual_value "
                         " FROM tbl_virtual_meter_hourly "
                         " WHERE virtual_meter_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (virtual_meter_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()
                if rows_energy_values is None or len(rows_energy_values) == 0:
                    energy_virtual_meter_hourly[virtual_meter_id] = None
                else:
                    energy_virtual_meter_hourly[virtual_meter_id] = dict()
                    for row_energy_value in rows_energy_values:
                        energy_virtual_meter_hourly[virtual_meter_id][row_energy_value[0]] = row_energy_value[1]
        except Exception as e:
            error_string = "Error in step 6.1 of store_energy_input_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 7: for each offline meter in list, get energy input data from energy database
    ####################################################################################################################
    energy_offline_meter_hourly = dict()
    if offline_meter_list is not None and len(offline_meter_list) > 0:
        try:
            for offline_meter in offline_meter_list:
                offline_meter_id = str(offline_meter['id'])

                query = (" SELECT start_datetime_utc, actual_value "
                         " FROM tbl_offline_meter_hourly "
                         " WHERE offline_meter_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (offline_meter_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()
                if rows_energy_values is None or len(rows_energy_values) == 0:
                    energy_offline_meter_hourly[offline_meter_id] = None
                else:
                    energy_offline_meter_hourly[offline_meter_id] = dict()
                    for row_energy_value in rows_energy_values:
                        energy_offline_meter_hourly[offline_meter_id][row_energy_value[0]] = row_energy_value[1]

        except Exception as e:
            error_string = "Error in step 7.1 of store_energy_input_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 8: determine common time slot to aggregate
    ####################################################################################################################

    common_start_datetime_utc = start_datetime_utc
    common_end_datetime_utc = end_datetime_utc

    print("Getting common time slot of energy values for all meters")
    if energy_meter_hourly is not None and len(energy_meter_hourly) > 0:
        for meter_id, energy_hourly in energy_meter_hourly.items():
            if energy_hourly is None or len(energy_hourly) == 0:
                common_start_datetime_utc = None
                common_end_datetime_utc = None
                break
            else:
                if common_start_datetime_utc < min(energy_hourly.keys()):
                    common_start_datetime_utc = min(energy_hourly.keys())
                if common_end_datetime_utc > max(energy_hourly.keys()):
                    common_end_datetime_utc = max(energy_hourly.keys())

    print("Getting common time slot of energy values for all virtual meters")
    if common_start_datetime_utc is not None and common_end_datetime_utc is not None:
        if energy_virtual_meter_hourly is not None and len(energy_virtual_meter_hourly) > 0:
            for meter_id, energy_hourly in energy_virtual_meter_hourly.items():
                if energy_hourly is None or len(energy_hourly) == 0:
                    common_start_datetime_utc = None
                    common_end_datetime_utc = None
                    break
                else:
                    if common_start_datetime_utc < min(energy_hourly.keys()):
                        common_start_datetime_utc = min(energy_hourly.keys())
                    if common_end_datetime_utc > max(energy_hourly.keys()):
                        common_end_datetime_utc = max(energy_hourly.keys())

    print("Getting common time slot of energy values for all offline meters")
    if common_start_datetime_utc is not None and common_end_datetime_utc is not None:
        if energy_offline_meter_hourly is not None and len(energy_offline_meter_hourly) > 0:
            for meter_id, energy_hourly in energy_offline_meter_hourly.items():
                if energy_hourly is None or len(energy_hourly) == 0:
                    common_start_datetime_utc = None
                    common_end_datetime_utc = None
                    break
                else:
                    if common_start_datetime_utc < min(energy_hourly.keys()):
                        common_start_datetime_utc = min(energy_hourly.keys())
                    if common_end_datetime_utc > max(energy_hourly.keys()):
                        common_end_datetime_utc = max(energy_hourly.keys())

    if (energy_meter_hourly is None or len(energy_meter_hourly) == 0) and \
            (energy_virtual_meter_hourly is None or len(energy_virtual_meter_hourly) == 0) and \
            (energy_offline_meter_hourly is None or len(energy_offline_meter_hourly) == 0):
        # There isn't any energy data
        print("There isn't any energy data")
        # continue the for store loop to the next store
        print("continue the for store loop to the next store")
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return None

    print("common_start_datetime_utc: " + str(common_start_datetime_utc))
    print("common_end_datetime_utc: " + str(common_end_datetime_utc))

    ####################################################################################################################
    # Step 9: aggregate energy data in the common time slot by energy categories and hourly
    ####################################################################################################################

    print("Step 9: aggregate energy data in the common time slot by energy categories and hourly")
    aggregated_values = list()
    try:
        current_datetime_utc = common_start_datetime_utc
        while common_start_datetime_utc is not None \
                and common_end_datetime_utc is not None \
                and current_datetime_utc <= common_end_datetime_utc:
            aggregated_value = dict()
            aggregated_value['start_datetime_utc'] = current_datetime_utc
            aggregated_value['meta_data'] = dict()

            if meter_list is not None and len(meter_list) > 0:
                for meter in meter_list:
                    meter_id = str(meter['id'])
                    energy_category_id = meter['energy_category_id']
                    actual_value = energy_meter_hourly[meter_id].get(current_datetime_utc, Decimal(0.0))
                    aggregated_value['meta_data'][energy_category_id] = \
                        aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            if virtual_meter_list is not None and len(virtual_meter_list) > 0:
                for virtual_meter in virtual_meter_list:
                    virtual_meter_id = str(virtual_meter['id'])
                    energy_category_id = virtual_meter['energy_category_id']
                    actual_value = energy_virtual_meter_hourly[virtual_meter_id].get(current_datetime_utc, Decimal(0.0))
                    aggregated_value['meta_data'][energy_category_id] = \
                        aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            if offline_meter_list is not None and len(offline_meter_list) > 0:
                for offline_meter in offline_meter_list:
                    offline_meter_id = str(offline_meter['id'])
                    energy_category_id = offline_meter['energy_category_id']
                    actual_value = energy_offline_meter_hourly[offline_meter_id].get(current_datetime_utc, Decimal(0.0))
                    aggregated_value['meta_data'][energy_category_id] = \
                        aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            aggregated_values.append(aggregated_value)

            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    except Exception as e:
        error_string = "Error in step 9 of store_energy_input_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 10: save energy data to energy database
    ####################################################################################################################
    print("Step 10: save energy data to energy database")

    while len(aggregated_values) > 0:
        insert_100 = aggregated_values[:100]
        aggregated_values = aggregated_values[100:]
        try:
            add_values = (" INSERT INTO tbl_store_input_category_hourly "
                          "             (store_id, "
                          "              energy_category_id, "
                          "              start_datetime_utc, "
                          "              actual_value) "
                          " VALUES  ")

            for aggregated_value in insert_100:
                for energy_category_id, actual_value in aggregated_value['meta_data'].items():
                    add_values += " (" + str(store['id']) + ","
                    add_values += " " + str(energy_category_id) + ","
                    add_values += "'" + aggregated_value['start_datetime_utc'].isoformat()[0:19] + "',"
                    add_values += str(actual_value) + "), "
            # print("add_values:" + add_values)
            # trim ", " at the end of string and then execute
            cursor_energy_db.execute(add_values[:-2])
            cnx_energy_db.commit()

        except Exception as e:
            error_string = "Error in step 10.1 of store_energy_input_category.worker " + str(e)
            print(error_string)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            return error_string

    if cursor_energy_db:
        cursor_energy_db.close()
    if cnx_energy_db:
        cnx_energy_db.close()
    return None
