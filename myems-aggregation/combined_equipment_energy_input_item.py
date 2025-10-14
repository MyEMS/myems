"""
MyEMS Combined Equipment Energy Input Item Aggregation Service

This module handles the aggregation of energy input consumption data for combined equipment by energy items.
It processes energy consumption data from various sources (meters, virtual meters, offline meters, equipment)
associated with each combined equipment and aggregates them into hourly energy consumption by items.

The service follows a systematic approach:
1. Retrieves all combined equipment from the system database
2. Creates a multiprocessing pool to process combined equipment in parallel
3. For each combined equipment, retrieves associated input sources (meters, virtual meters, offline meters, equipment)
4. Determines the time range for data aggregation
5. Fetches energy consumption data from all input sources
6. Finds the common time slot across all sources
7. Aggregates energy data by energy items and time slots
8. Saves the aggregated data to the energy database

This service runs continuously, processing new energy data as it becomes available and
ensuring accurate energy consumption aggregation for all combined equipment in the system.
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
# Step 1: get all combined equipments
# Step 2: Create multiprocessing pool to call worker in parallel
########################################################################################################################


def main(logger):
    """
    Main function for combined equipment energy input item aggregation service.

    This function runs continuously and processes energy aggregation for all combined equipment
    by energy items. It uses multiprocessing to handle multiple combined equipment in parallel
    for better performance.

    Args:
        logger: Logger instance for recording activities and errors

    The function follows these steps:
    1. Connects to the system database and retrieves all combined equipment
    2. Creates a multiprocessing pool to process combined equipment in parallel
    3. Sleeps for 300 seconds before the next processing cycle
    """

    while True:
        # Main processing loop - runs continuously
        ################################################################################################################
        # Step 1: Get all combined equipment from system database
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None
        try:
            # Connect to MyEMS System Database
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of combined_equipment_energy_input_item.main " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and continue the main loop to reconnect the database
            time.sleep(60)
            continue
        print("Connected to MyEMS System Database")

        # Retrieve all combined equipment from the system database
        combined_equipment_list = list()
        try:
            cursor_system_db.execute(" SELECT id, name "
                                     " FROM tbl_combined_equipments "
                                     " ORDER BY id ")
            rows_combined_equipments = cursor_system_db.fetchall()

            if rows_combined_equipments is None or len(rows_combined_equipments) == 0:
                print("There isn't any combined equipments ")
                # Sleep and continue the main loop to reconnect the database
                time.sleep(60)
                continue

            # Build combined equipment list with id and name
            for row in rows_combined_equipments:
                combined_equipment_list.append({"id": row[0], "name": row[1]})

        except Exception as e:
            logger.error("Error in step 1.2 of combined_equipment_energy_input_item.main " + str(e))
            # Sleep and continue the main loop to reconnect the database
            time.sleep(60)
            continue
        finally:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        print("Got all combined equipments in MyEMS System Database")

        # Shuffle the combined equipment list for randomly calculating the meter hourly value
        random.shuffle(combined_equipment_list)

        ################################################################################################################
        # Step 2: Create multiprocessing pool to call worker in parallel
        ################################################################################################################
        # Create multiprocessing pool to process combined equipment in parallel
        p = Pool(processes=config.pool_size)
        error_list = p.map(worker, combined_equipment_list)
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
#   Step 1: get all input meters associated with the combined equipment
#   Step 2: get all input virtual meters associated with the combined equipment
#   Step 3: get all input offline meters associated with the combined equipment
#   Step 4: get all equipments associated with the combined equipment
#   Step 5: determine start datetime and end datetime to aggregate
#   Step 6: for each meter in list, get energy input data from energy database
#   Step 7: for each virtual meter in list, get energy input data from energy database
#   Step 8: for each offline meter in list, get energy input data from energy database
#   Step 9: for each equipment in list, get energy input data from energy database
#   Step 10: determine common time slot to aggregate
#   Step 11: aggregate energy data in the common time slot by energy items and hourly
#   Step 12: save energy data to energy database
#
# NOTE: returns None or the error string because that the logger object cannot be passed in as parameter
########################################################################################################################

def worker(combined_equipment):
    """
    Worker function to process energy aggregation for a single combined equipment by energy items.

    This function handles the complete energy aggregation process for one combined equipment,
    including retrieving associated input sources, fetching energy data, and saving
    aggregated results to the database.

    Args:
        combined_equipment: Dictionary containing combined equipment information (id, name)

    Returns:
        None if successful, error string if an error occurred
    """
    ####################################################################################################################
    # Step 1: get all input meters associated with the combined equipment
    ####################################################################################################################
    print("Step 1: get all input meters associated with the combined equipment " + str(combined_equipment['name']))

    meter_list = list()
    cnx_system_db = None
    cursor_system_db = None
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        error_string = "Error in step 1.1 of combined_equipment_energy_input_item.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_item_id "
                                 " FROM tbl_meters m, tbl_combined_equipments_meters em "
                                 " WHERE m.id = em.meter_id "
                                 "       AND m.is_counted = 1 "
                                 "       AND m.energy_item_id is NOT NULL "
                                 "       AND em.is_output = 0 "
                                 "       AND em.combined_equipment_id = %s ",
                                 (combined_equipment['id'],))
        rows_meters = cursor_system_db.fetchall()

        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_list.append({"id": row[0],
                                   "name": row[1],
                                   "energy_item_id": row[2]})

    except Exception as e:
        error_string = "Error in step 1.2 of combined_equipment_energy_input_item.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 2: get all input virtual meters associated with the combined equipment
    ####################################################################################################################
    print("Step 2: get all input virtual meters associated with the combined equipment")
    virtual_meter_list = list()

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_item_id "
                                 " FROM tbl_virtual_meters m, tbl_combined_equipments_virtual_meters em "
                                 " WHERE m.id = em.virtual_meter_id "
                                 "       AND m.energy_item_id is NOT NULL "
                                 "       AND m.is_counted = 1 "
                                 "       AND em.is_output = 0 "
                                 "       AND em.combined_equipment_id = %s ",
                                 (combined_equipment['id'],))
        rows_virtual_meters = cursor_system_db.fetchall()

        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_list.append({"id": row[0],
                                           "name": row[1],
                                           "energy_item_id": row[2]})

    except Exception as e:
        error_string = "Error in step 2.1 of combined_equipment_energy_input_item.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 3: get all input offline meters associated with the combined equipment
    ####################################################################################################################
    print("Step 3: get all input offline meters associated with the combined equipment")

    offline_meter_list = list()

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_item_id "
                                 " FROM tbl_offline_meters m, tbl_combined_equipments_offline_meters em "
                                 " WHERE m.id = em.offline_meter_id "
                                 "       AND m.energy_item_id is NOT NULL "
                                 "       AND m.is_counted = 1 "
                                 "       AND em.is_output = 0 "
                                 "       AND em.combined_equipment_id = %s ",
                                 (combined_equipment['id'],))
        rows_offline_meters = cursor_system_db.fetchall()

        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_list.append({"id": row[0],
                                           "name": row[1],
                                           "energy_item_id": row[2]})

    except Exception as e:
        error_string = "Error in step 3.1 of combined_equipment_energy_input_item.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 4: get all equipments associated with the combined equipment
    ####################################################################################################################
    print("Step 4: get all equipments associated with the combined equipment")

    equipment_list = list()

    try:
        cursor_system_db.execute(" SELECT e.id, e.name "
                                 " FROM tbl_equipments e, tbl_combined_equipments_equipments ce "
                                 " WHERE e.id = ce.equipment_id "
                                 "       AND e.is_input_counted = 1 "
                                 "       AND ce.combined_equipment_id = %s ",
                                 (combined_equipment['id'],))
        rows_equipments = cursor_system_db.fetchall()

        if rows_equipments is not None and len(rows_equipments) > 0:
            for row in rows_equipments:
                equipment_list.append({"id": row[0],
                                       "name": row[1]})

    except Exception as e:
        error_string = "Error in step 4 of combined_equipment_energy_input_item.worker " + str(e)
        print(error_string)
        return error_string
    finally:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

    ####################################################################################################################
    # stop to the next combined equipment if this combined equipment is empty
    ####################################################################################################################
    if (meter_list is None or len(meter_list) == 0) and \
            (virtual_meter_list is None or len(virtual_meter_list) == 0) and \
            (offline_meter_list is None or len(offline_meter_list) == 0) and \
            (equipment_list is None or len(equipment_list) == 0):
        print("This is an empty combined equipment ")
        return None

    ####################################################################################################################
    # Step 5: determine start datetime and end datetime to aggregate
    ####################################################################################################################
    print("Step 5: determine start datetime and end datetime to aggregate")
    cnx_energy_db = None
    cursor_energy_db = None
    try:
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()
    except Exception as e:
        error_string = "Error in step 5.1 of combined_equipment_energy_input_item.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    try:
        query = (" SELECT MAX(start_datetime_utc) "
                 " FROM tbl_combined_equipment_input_item_hourly "
                 " WHERE combined_equipment_id = %s ")
        cursor_energy_db.execute(query, (combined_equipment['id'],))
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
        error_string = "Error in step 5.2 of combined_equipment_energy_input_item.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 6: for each meter in list, get energy input data from energy database
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
        error_string = "Error in step 6.1 of combined_equipment_energy_input_item.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 7: for each virtual meter in list, get energy input data from energy database
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
            error_string = "Error in step 7.1 of combined_equipment_energy_input_item.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 8: for each offline meter in list, get energy input data from energy database
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
            error_string = "Error in step 8.1 of combined_equipment_energy_input_item.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 9: for each equipment in list, get energy input data from energy database
    ####################################################################################################################
    energy_equipment_hourly = dict()
    if equipment_list is not None and len(equipment_list) > 0:
        try:
            for equipment in equipment_list:
                equipment_id = str(equipment['id'])
                query = (" SELECT start_datetime_utc, energy_item_id, actual_value "
                         " FROM tbl_equipment_input_item_hourly "
                         " WHERE equipment_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (equipment_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()
                if rows_energy_values is None or len(rows_energy_values) == 0:
                    energy_equipment_hourly[equipment_id] = None
                else:
                    energy_equipment_hourly[equipment_id] = dict()
                    for row_value in rows_energy_values:
                        current_datetime_utc = row_value[0]
                        if current_datetime_utc not in energy_equipment_hourly[equipment_id]:
                            energy_equipment_hourly[equipment_id][current_datetime_utc] = dict()
                        energy_item_id = row_value[1]
                        actual_value = row_value[2]
                        energy_equipment_hourly[equipment_id][current_datetime_utc][energy_item_id] = \
                            actual_value
        except Exception as e:
            error_string = "Error in step 9 of combined_equipment_energy_input_item.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 10: determine common time slot to aggregate
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

    print("Getting common time slot of energy values for all equipments")
    if common_start_datetime_utc is not None and common_end_datetime_utc is not None:
        if energy_equipment_hourly is not None and len(energy_equipment_hourly) > 0:
            for equipment_id, energy_hourly in energy_equipment_hourly.items():
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
            (energy_offline_meter_hourly is None or len(energy_offline_meter_hourly) == 0) and \
            (energy_equipment_hourly is None or len(energy_equipment_hourly) == 0):
        # There isn't any energy data
        print("There isn't any energy data")
        # continue the for combined equipment loop to the next combined equipment
        print("continue the for combined equipment loop to the next combined equipment")
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return None

    print("common_start_datetime_utc: " + str(common_start_datetime_utc))
    print("common_end_datetime_utc: " + str(common_end_datetime_utc))

    ####################################################################################################################
    # Step 11: aggregate energy data in the common time slot by energy items and hourly
    ####################################################################################################################

    print("Step 11: aggregate energy data in the common time slot by energy items and hourly")
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
                    energy_item_id = meter['energy_item_id']
                    actual_value = energy_meter_hourly[meter_id].get(current_datetime_utc, Decimal(0.0))
                    aggregated_value['meta_data'][energy_item_id] = \
                        aggregated_value['meta_data'].get(energy_item_id, Decimal(0.0)) + actual_value

            if virtual_meter_list is not None and len(virtual_meter_list) > 0:
                for virtual_meter in virtual_meter_list:
                    virtual_meter_id = str(virtual_meter['id'])
                    energy_item_id = virtual_meter['energy_item_id']
                    actual_value = energy_virtual_meter_hourly[virtual_meter_id].get(current_datetime_utc, Decimal(0.0))
                    aggregated_value['meta_data'][energy_item_id] = \
                        aggregated_value['meta_data'].get(energy_item_id, Decimal(0.0)) + actual_value

            if offline_meter_list is not None and len(offline_meter_list) > 0:
                for offline_meter in offline_meter_list:
                    offline_meter_id = str(offline_meter['id'])
                    energy_item_id = offline_meter['energy_item_id']
                    actual_value = energy_offline_meter_hourly[offline_meter_id].get(current_datetime_utc, Decimal(0.0))
                    aggregated_value['meta_data'][energy_item_id] = \
                        aggregated_value['meta_data'].get(energy_item_id, Decimal(0.0)) + actual_value

            if equipment_list is not None and len(equipment_list) > 0:
                for equipment in equipment_list:
                    equipment_id = str(equipment['id'])
                    meta_data_dict = energy_equipment_hourly[equipment_id].get(current_datetime_utc, None)
                    if meta_data_dict is not None and len(meta_data_dict) > 0:
                        for energy_item_id, actual_value in meta_data_dict.items():
                            aggregated_value['meta_data'][energy_item_id] = \
                                aggregated_value['meta_data'].get(energy_item_id, Decimal(0.0)) + actual_value

            aggregated_values.append(aggregated_value)

            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    except Exception as e:
        error_string = "Error in step 11 of combined_equipment_energy_input_item.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 12: save energy data to energy database
    ####################################################################################################################
    print("Step 12: save energy data to energy database")

    while len(aggregated_values) > 0:
        insert_100 = aggregated_values[:100]
        aggregated_values = aggregated_values[100:]
        try:
            add_values = (" INSERT INTO tbl_combined_equipment_input_item_hourly "
                          "             (combined_equipment_id, "
                          "              energy_item_id, "
                          "              start_datetime_utc, "
                          "              actual_value) "
                          " VALUES  ")

            for aggregated_value in insert_100:
                for energy_item_id, actual_value in aggregated_value['meta_data'].items():
                    add_values += " (" + str(combined_equipment['id']) + ","
                    add_values += " " + str(energy_item_id) + ","
                    add_values += "'" + aggregated_value['start_datetime_utc'].isoformat()[0:19] + "',"
                    add_values += str(actual_value) + "), "
            # print("add_values:" + add_values)
            # trim ", " at the end of string and then execute
            cursor_energy_db.execute(add_values[:-2])
            cnx_energy_db.commit()

        except Exception as e:
            error_string = "Error in step 12.1 of combined_equipment_energy_input_item.worker " + str(e)
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
