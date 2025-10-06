"""
MyEMS Aggregation Service - Space Energy Output Category Module

This module handles energy output aggregation for spaces by energy categories.
It aggregates energy output data from various sources associated with each space,
including combined equipment, equipment, and child spaces.

The space energy output category process performs the following functions:
1. Retrieves all spaces from the system database
2. Uses multiprocessing to process spaces in parallel for efficiency
3. For each space, collects energy output data from all associated output sources
4. Aggregates energy output by energy categories and time slots
5. Stores aggregated energy data in the energy database

Key features:
- Handles hierarchical space structures with parent-child relationships
- Aggregates energy output data from multiple source types (equipment, etc.)
- Supports parallel processing for improved performance
- Maintains data integrity through comprehensive error handling
- Enables energy output analysis at the space level
"""

import random
import time
from datetime import datetime, timedelta
from decimal import Decimal
from multiprocessing import Pool

import mysql.connector

import config


########################################################################################################################
# Space Energy Output Category Aggregation Procedures:
# Step 1: Get all spaces from system database
# Step 2: Create multiprocessing pool to call worker processes in parallel
########################################################################################################################


def main(logger):
    """
    Main function for space energy output category aggregation.

    This function runs continuously, processing energy output aggregation for all spaces.
    It retrieves all spaces from the system database and processes them in parallel to aggregate
    energy output data from various sources associated with each space.

    Args:
        logger: Logger instance for recording aggregation activities and errors
    """
    while True:
        # The outermost while loop to handle database connection errors and retry
        ################################################################################################################
        # Step 1: Get all spaces from system database
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None

        # Connect to system database to retrieve space information
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of space_energy_output_category.main " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue
        print("Connected to MyEMS System Database")

        # Retrieve all spaces from the system database
        space_list = list()
        try:
            cursor_system_db.execute(" SELECT id, name "
                                     " FROM tbl_spaces "
                                     " ORDER BY id ")
            rows_spaces = cursor_system_db.fetchall()

            # Check if spaces were found
            if rows_spaces is None or len(rows_spaces) == 0:
                print("There isn't any spaces ")
                # Sleep and continue the outer loop to reconnect the database
                time.sleep(60)
                continue

            # Build space list with configuration data
            for row in rows_spaces:
                space_list.append({"id": row[0], "name": row[1]})

        except Exception as e:
            logger.error("Error in step 1.2 of space_energy_output_category.main " + str(e))
            # Sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue
        finally:
            # Always clean up database connections
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        print("Got all spaces in MyEMS System Database")

        # Shuffle the space list for randomly calculating the space hourly values
        # This helps distribute processing load evenly across time
        random.shuffle(space_list)

        ################################################################################################################
        # Step 2: Create multiprocessing pool to call worker processes in parallel
        ################################################################################################################
        # Create process pool with configured size for parallel processing
        p = Pool(processes=config.pool_size)
        error_list = p.map(worker, space_list)
        p.close()
        p.join()

        # Log any errors from worker processes
        for error in error_list:
            if error is not None and len(error) > 0:
                logger.error(error)

        print("go to sleep 300 seconds...")
        time.sleep(300)  # Sleep for 5 minutes before next processing cycle
        print("wake from sleep, and continue to work...")
    # End of outer while loop


########################################################################################################################
# Worker Process Procedures for Individual Space Processing:
#   Step 1: Get all combined equipments associated with the space
#   Step 2: Get all equipments associated with the space
#   Step 3: Get all child spaces associated with the space
#   Step 4: Determine start datetime and end datetime to aggregate
#   Step 5: For each combined equipment in list, get energy output data from energy database
#   Step 6: For each equipment in list, get energy output data from energy database
#   Step 7: For each child space in list, get energy output data from energy database
#   Step 8: Determine common time slot to aggregate
#   Step 9: Aggregate energy data in the common time slot by energy categories and hourly
#   Step 10: Save energy data to energy database
#
# NOTE: Returns None on success or error string on failure because the logger object cannot be passed as parameter
########################################################################################################################

def worker(space):
    """
    Worker function to process a single space's energy output category aggregation.

    This function processes one space at a time, collecting energy output data from all
    associated output sources and aggregating it by energy categories and time slots.

    Args:
        space: Dictionary containing space configuration (id, name)

    Returns:
        None on success, error string on failure
    """
    ####################################################################################################################
    # Step 1: Get all combined equipments associated with the space
    ####################################################################################################################
    print("Step 1: get all combined equipments associated with the space")

    # Connect to system database to retrieve associated output sources
    cnx_system_db = None
    cursor_system_db = None
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        error_string = "Error in step 1.1 of space_energy_output_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    # Retrieve all combined equipments associated with the space
    combined_equipment_list = list()
    try:
        cursor_system_db.execute(" SELECT e.id, e.name "
                                 " FROM tbl_combined_equipments e, tbl_spaces_combined_equipments se "
                                 " WHERE e.id = se.combined_equipment_id "
                                 "       AND e.is_output_counted = 1 "
                                 "       AND se.space_id = %s ",
                                 (space['id'],))
        rows_combined_equipments = cursor_system_db.fetchall()

        # Build combined equipment list with configuration data
        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            for row in rows_combined_equipments:
                combined_equipment_list.append({"id": row[0],
                                                "name": row[1]})

    except Exception as e:
        error_string = "Error in step 1.2 of space_energy_output_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 2: Get all equipments associated with the space
    ####################################################################################################################
    print("Step 2: get all equipments associated with the space")

    equipment_list = list()

    # Retrieve all equipments associated with the space
    try:
        cursor_system_db.execute(" SELECT e.id, e.name "
                                 " FROM tbl_equipments e, tbl_spaces_equipments se "
                                 " WHERE e.id = se.equipment_id "
                                 "       AND e.is_output_counted = 1 "
                                 "       AND se.space_id = %s ",
                                 (space['id'],))
        rows_equipments = cursor_system_db.fetchall()

        # Build equipment list with configuration data
        if rows_equipments is not None and len(rows_equipments) > 0:
            for row in rows_equipments:
                equipment_list.append({"id": row[0],
                                       "name": row[1]})

    except Exception as e:
        error_string = "Error in step 2.2 of space_energy_output_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 3: Get all child spaces associated with the space
    ####################################################################################################################
    print("Step 3: get all child spaces associated with the space")

    child_space_list = list()

    # Retrieve all child spaces associated with the space (hierarchical structure)
    try:
        cursor_system_db.execute(" SELECT id, name "
                                 " FROM tbl_spaces "
                                 " WHERE is_output_counted = 1 "
                                 "       AND parent_space_id = %s ",
                                 (space['id'],))
        rows_child_spaces = cursor_system_db.fetchall()

        # Build child space list with configuration data
        if rows_child_spaces is not None and len(rows_child_spaces) > 0:
            for row in rows_child_spaces:
                child_space_list.append({"id": row[0],
                                         "name": row[1]})

    except Exception as e:
        error_string = "Error in step 3 of space_energy_output_category.worker " + str(e)
        print(error_string)
        return error_string
    finally:
        # Always clean up database connections
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

    # Check if space has any associated output sources
    if ((combined_equipment_list is None or len(combined_equipment_list) == 0) and
            (equipment_list is None or len(equipment_list) == 0) and
            (child_space_list is None or len(child_space_list) == 0)):
        print("This is an empty space ")
        return None

    ####################################################################################################################
    # Step 4: Determine start datetime and end datetime to aggregate
    ####################################################################################################################
    print("Step 4: determine start datetime and end datetime to aggregate")

    # Connect to energy database to check existing processed data
    cnx_energy_db = None
    cursor_energy_db = None
    try:
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()
    except Exception as e:
        error_string = "Error in step 4.1 of space_energy_output_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    # Determine processing time range
    try:
        # Query for the latest processed data to determine where to continue
        query = (" SELECT MAX(start_datetime_utc) "
                 " FROM tbl_space_output_category_hourly "
                 " WHERE space_id = %s ")
        cursor_energy_db.execute(query, (space['id'],))
        row_datetime = cursor_energy_db.fetchone()

        # Initialize start datetime from configuration
        start_datetime_utc = datetime.strptime(config.start_datetime_utc, '%Y-%m-%d %H:%M:%S')
        start_datetime_utc = start_datetime_utc.replace(minute=0, second=0, microsecond=0, tzinfo=None)

        # Update start datetime if existing processed data is found
        if row_datetime is not None and len(row_datetime) > 0 and isinstance(row_datetime[0], datetime):
            # Replace second and microsecond with 0
            # Note: Do not replace minute in case of calculating in half hourly
            start_datetime_utc = row_datetime[0].replace(second=0, microsecond=0, tzinfo=None)
            # Start from the next time slot
            start_datetime_utc += timedelta(minutes=config.minutes_to_count)

        # Set end datetime to current time
        end_datetime_utc = datetime.utcnow().replace(second=0, microsecond=0, tzinfo=None)

        print("start_datetime_utc: " + start_datetime_utc.isoformat()[0:19]
              + "end_datetime_utc: " + end_datetime_utc.isoformat()[0:19])

    except Exception as e:
        error_string = "Error in step 4.2 of space_energy_output_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 5: For each combined equipment in list, get energy output data from energy database
    ####################################################################################################################
    energy_combined_equipment_hourly = dict()
    if combined_equipment_list is not None and len(combined_equipment_list) > 0:
        try:
            # Retrieve energy output data for all combined equipments associated with the space
            for combined_equipment in combined_equipment_list:
                combined_equipment_id = str(combined_equipment['id'])

                # Query for hourly energy output data by energy category from the energy database
                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_combined_equipment_output_category_hourly "
                         " WHERE combined_equipment_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (combined_equipment_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()

                # Build energy output dictionary for the combined equipment
                if rows_energy_values is None or len(rows_energy_values) == 0:
                    energy_combined_equipment_hourly[combined_equipment_id] = None
                else:
                    energy_combined_equipment_hourly[combined_equipment_id] = dict()
                    for row_value in rows_energy_values:
                        current_datetime_utc = row_value[0]
                        if current_datetime_utc not in energy_combined_equipment_hourly[combined_equipment_id]:
                            energy_combined_equipment_hourly[combined_equipment_id][current_datetime_utc] = dict()
                        energy_category_id = row_value[1]
                        actual_value = row_value[2]
                        energy_combined_equipment_hourly[combined_equipment_id][current_datetime_utc][
                            energy_category_id] = actual_value
        except Exception as e:
            error_string = "Error in step 5 of space_energy_output_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 6: For each equipment in list, get energy output data from energy database
    ####################################################################################################################
    energy_equipment_hourly = dict()
    if equipment_list is not None and len(equipment_list) > 0:
        try:
            # Retrieve energy output data for all equipments associated with the space
            for equipment in equipment_list:
                equipment_id = str(equipment['id'])

                # Query for hourly energy output data by energy category from the energy database
                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_equipment_output_category_hourly "
                         " WHERE equipment_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (equipment_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()

                # Build energy output dictionary for the equipment
                if rows_energy_values is None or len(rows_energy_values) == 0:
                    energy_equipment_hourly[equipment_id] = None
                else:
                    energy_equipment_hourly[equipment_id] = dict()
                    for row_value in rows_energy_values:
                        current_datetime_utc = row_value[0]
                        if current_datetime_utc not in energy_equipment_hourly[equipment_id]:
                            energy_equipment_hourly[equipment_id][current_datetime_utc] = dict()
                        energy_category_id = row_value[1]
                        actual_value = row_value[2]
                        energy_equipment_hourly[equipment_id][current_datetime_utc][energy_category_id] = \
                            actual_value
        except Exception as e:
            error_string = "Error in step 6 of space_energy_output_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 7: For each child space in list, get energy output data from energy database
    ####################################################################################################################
    energy_child_space_hourly = dict()
    if child_space_list is not None and len(child_space_list) > 0:
        try:
            # Retrieve energy output data for all child spaces associated with the space
            for child_space in child_space_list:
                child_space_id = str(child_space['id'])

                # Query for hourly energy output data by energy category from the energy database
                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_space_output_category_hourly "
                         " WHERE space_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (child_space_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()

                # Build energy output dictionary for the child space
                if rows_energy_values is None or len(rows_energy_values) == 0:
                    energy_child_space_hourly[child_space_id] = None
                else:
                    energy_child_space_hourly[child_space_id] = dict()
                    for row_energy_value in rows_energy_values:
                        current_datetime_utc = row_energy_value[0]
                        if current_datetime_utc not in energy_child_space_hourly[child_space_id]:
                            energy_child_space_hourly[child_space_id][current_datetime_utc] = dict()
                        energy_category_id = row_energy_value[1]
                        actual_value = row_energy_value[2]
                        energy_child_space_hourly[child_space_id][current_datetime_utc][energy_category_id] \
                            = actual_value
        except Exception as e:
            error_string = "Error in step 7 of space_energy_output_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 8: Determine common time slot to aggregate
    ####################################################################################################################

    # Initialize common time slot with the processing time range
    common_start_datetime_utc = start_datetime_utc
    common_end_datetime_utc = end_datetime_utc

    # Find the intersection of time slots across all energy sources
    print("Getting common time slot of energy values for all combined equipments")
    if common_start_datetime_utc is not None and common_end_datetime_utc is not None:
        if energy_combined_equipment_hourly is not None and len(energy_combined_equipment_hourly) > 0:
            for combined_equipment_id, energy_hourly in energy_combined_equipment_hourly.items():
                if energy_hourly is None or len(energy_hourly) == 0:
                    common_start_datetime_utc = None
                    common_end_datetime_utc = None
                    break
                else:
                    # Adjust common time slot to match available data
                    if common_start_datetime_utc < min(energy_hourly.keys()):
                        common_start_datetime_utc = min(energy_hourly.keys())
                    if common_end_datetime_utc > max(energy_hourly.keys()):
                        common_end_datetime_utc = max(energy_hourly.keys())

    # Find common time slot for equipment energy data
    print("Getting common time slot of energy values for all equipments...")
    if common_start_datetime_utc is not None and common_end_datetime_utc is not None:
        if energy_equipment_hourly is not None and len(energy_equipment_hourly) > 0:
            for equipment_id, energy_hourly in energy_equipment_hourly.items():
                if energy_hourly is None or len(energy_hourly) == 0:
                    common_start_datetime_utc = None
                    common_end_datetime_utc = None
                    break
                else:
                    # Adjust common time slot to match available data
                    if common_start_datetime_utc < min(energy_hourly.keys()):
                        common_start_datetime_utc = min(energy_hourly.keys())
                    if common_end_datetime_utc > max(energy_hourly.keys()):
                        common_end_datetime_utc = max(energy_hourly.keys())

    # Find common time slot for child space energy data
    print("Getting common time slot of energy values for all child spaces...")
    if common_start_datetime_utc is not None and common_end_datetime_utc is not None:
        if energy_child_space_hourly is not None and len(energy_child_space_hourly) > 0:
            for child_space_id, energy_hourly in energy_child_space_hourly.items():
                if energy_hourly is None or len(energy_hourly) == 0:
                    common_start_datetime_utc = None
                    common_end_datetime_utc = None
                    break
                else:
                    # Adjust common time slot to match available data
                    if common_start_datetime_utc < min(energy_hourly.keys()):
                        common_start_datetime_utc = min(energy_hourly.keys())
                    if common_end_datetime_utc > max(energy_hourly.keys()):
                        common_end_datetime_utc = max(energy_hourly.keys())

    # Check if there's any energy data available for aggregation
    if (energy_combined_equipment_hourly is None or len(energy_combined_equipment_hourly) == 0) and \
            (energy_equipment_hourly is None or len(energy_equipment_hourly) == 0) and \
            (energy_child_space_hourly is None or len(energy_child_space_hourly) == 0):
        # No energy data available for processing
        print("There isn't any energy data")
        # Continue to the next space in the loop
        print("continue the for space loop to the next space")
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return None

    print("common_start_datetime_utc: " + str(common_start_datetime_utc))
    print("common_end_datetime_utc: " + str(common_end_datetime_utc))

    ####################################################################################################################
    # Step 9: Aggregate energy data in the common time slot by energy categories and hourly
    ####################################################################################################################

    print("Step 9: aggregate energy data in the common time slot by energy categories and hourly")
    aggregated_values = list()
    try:
        # Process each hour in the common time slot
        current_datetime_utc = common_start_datetime_utc
        while common_start_datetime_utc is not None \
                and common_end_datetime_utc is not None \
                and current_datetime_utc <= common_end_datetime_utc:
            # Initialize aggregated value structure for current hour
            aggregated_value = dict()
            aggregated_value['start_datetime_utc'] = current_datetime_utc
            aggregated_value['meta_data'] = dict()

            # Aggregate energy data from combined equipment
            if combined_equipment_list is not None and len(combined_equipment_list) > 0:
                for combined_equipment in combined_equipment_list:
                    combined_equipment_id = str(combined_equipment['id'])
                    meta_data_dict = \
                        energy_combined_equipment_hourly[combined_equipment_id].get(current_datetime_utc, None)
                    if meta_data_dict is not None and len(meta_data_dict) > 0:
                        for energy_category_id, actual_value in meta_data_dict.items():
                            # Sum energy values by category
                            aggregated_value['meta_data'][energy_category_id] = \
                                aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            # Aggregate energy data from equipment
            if equipment_list is not None and len(equipment_list) > 0:
                for equipment in equipment_list:
                    equipment_id = str(equipment['id'])
                    meta_data_dict = energy_equipment_hourly[equipment_id].get(current_datetime_utc, None)
                    if meta_data_dict is not None and len(meta_data_dict) > 0:
                        for energy_category_id, actual_value in meta_data_dict.items():
                            # Sum energy values by category
                            aggregated_value['meta_data'][energy_category_id] = \
                                aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            # Aggregate energy data from child spaces
            if child_space_list is not None and len(child_space_list) > 0:
                for child_space in child_space_list:
                    child_space_id = str(child_space['id'])
                    meta_data_dict = energy_child_space_hourly[child_space_id].get(current_datetime_utc, None)
                    if meta_data_dict is not None and len(meta_data_dict) > 0:
                        for energy_category_id, actual_value in meta_data_dict.items():
                            # Sum energy values by category
                            aggregated_value['meta_data'][energy_category_id] = \
                                aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            # Add aggregated value to the list
            aggregated_values.append(aggregated_value)

            # Move to next time slot
            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    except Exception as e:
        # Handle any errors during aggregation
        error_string = "Error in step 9 of space_energy_output_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 10: Save energy data to energy database
    ####################################################################################################################
    print("Step 10: save energy data to energy database")

    # Save aggregated values to database in batches of 100
    while len(aggregated_values) > 0:
        insert_100 = aggregated_values[:100]
        aggregated_values = aggregated_values[100:]
        try:
            # Prepare SQL statement for bulk insert
            add_values = (" INSERT INTO tbl_space_output_category_hourly "
                          "             (space_id, "
                          "              energy_category_id, "
                          "              start_datetime_utc, "
                          "              actual_value) "
                          " VALUES  ")

            # Build values for bulk insert
            for aggregated_value in insert_100:
                for energy_category_id, actual_value in aggregated_value['meta_data'].items():
                    add_values += " (" + str(space['id']) + ","
                    add_values += " " + str(energy_category_id) + ","
                    add_values += "'" + aggregated_value['start_datetime_utc'].isoformat()[0:19] + "',"
                    add_values += str(actual_value) + "), "
            # print("add_values:" + add_values)
            # Remove trailing comma and space, then execute the query
            cursor_energy_db.execute(add_values[:-2])
            cnx_energy_db.commit()

        except Exception as e:
            # Handle database insertion errors
            error_string = "Error in step 10 of space_energy_output_category.worker " + str(e)
            print(error_string)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            return error_string

    # Close database connections
    if cursor_energy_db:
        cursor_energy_db.close()
    if cnx_energy_db:
        cnx_energy_db.close()
    return None
