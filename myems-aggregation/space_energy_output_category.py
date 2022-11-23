import random
import time
from datetime import datetime, timedelta
from decimal import Decimal
from multiprocessing import Pool

import mysql.connector

import config


########################################################################################################################
# PROCEDURES
# Step 1: get all spaces
# Step 2: Create multiprocessing pool to call worker in parallel
########################################################################################################################


def main(logger):

    while True:
        # the outermost while loop
        ################################################################################################################
        # Step 1: get all spaces
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of space_energy_output_category.main " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue
        print("Connected to MyEMS System Database")

        space_list = list()
        try:
            cursor_system_db.execute(" SELECT id, name "
                                     " FROM tbl_spaces "
                                     " ORDER BY id ")
            rows_spaces = cursor_system_db.fetchall()

            if rows_spaces is None or len(rows_spaces) == 0:
                print("There isn't any spaces ")
                # sleep and continue the outer loop to reconnect the database
                time.sleep(60)
                continue

            for row in rows_spaces:
                space_list.append({"id": row[0], "name": row[1]})

        except Exception as e:
            logger.error("Error in step 1.2 of space_energy_output_category.main " + str(e))
            # sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue
        finally:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        print("Got all spaces in MyEMS System Database")

        # shuffle the space list for randomly calculating the meter hourly value
        random.shuffle(space_list)

        ################################################################################################################
        # Step 2: Create multiprocessing pool to call worker in parallel
        ################################################################################################################
        p = Pool(processes=config.pool_size)
        error_list = p.map(worker, space_list)
        p.close()
        p.join()

        for error in error_list:
            if error is not None and len(error) > 0:
                logger.error(error)

        print("go to sleep 300 seconds...")
        time.sleep(300)
        print("wake from sleep, and continue to work...")
    # end of outer while


########################################################################################################################
# PROCEDURES:
#   Step 1: get all combined equipments associated with the space
#   Step 2: get all equipments associated with the space
#   Step 3: get all child spaces associated with the space
#   Step 4: determine start datetime and end datetime to aggregate
#   Step 5: for each combined equipment in list, get energy output data from energy database
#   Step 6: for each equipment in list, get energy output data from energy database
#   Step 7: for each child space in list, get energy output data from energy database
#   Step 8: determine common time slot to aggregate
#   Step 9: aggregate energy data in the common time slot by energy categories and hourly
#   Step 10: save energy data to energy database
#
# NOTE: returns None or the error string because that the logger object cannot be passed in as parameter
########################################################################################################################

def worker(space):

    ####################################################################################################################
    # Step 1: get all combined equipments associated with the space
    ####################################################################################################################
    print("Step 1: get all combined equipments associated with the space")

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

    combined_equipment_list = list()
    try:
        cursor_system_db.execute(" SELECT e.id, e.name "
                                 " FROM tbl_combined_equipments e, tbl_spaces_combined_equipments se "
                                 " WHERE e.id = se.combined_equipment_id "
                                 "       AND e.is_output_counted = 1 "
                                 "       AND se.space_id = %s ",
                                 (space['id'],))
        rows_combined_equipments = cursor_system_db.fetchall()

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
    # Step 2: get all equipments associated with the space
    ####################################################################################################################
    print("Step 2: get all equipments associated with the space")

    equipment_list = list()
    try:
        cursor_system_db.execute(" SELECT e.id, e.name "
                                 " FROM tbl_equipments e, tbl_spaces_equipments se "
                                 " WHERE e.id = se.equipment_id "
                                 "       AND e.is_output_counted = 1 "
                                 "       AND se.space_id = %s ",
                                 (space['id'],))
        rows_equipments = cursor_system_db.fetchall()

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
    # Step 3: get all child spaces associated with the space
    ####################################################################################################################
    print("Step 3: get all child spaces associated with the space")

    child_space_list = list()
    try:
        cursor_system_db.execute(" SELECT id, name "
                                 " FROM tbl_spaces "
                                 " WHERE is_output_counted = 1 "
                                 "       AND parent_space_id = %s ",
                                 (space['id'],))
        rows_child_spaces = cursor_system_db.fetchall()

        if rows_child_spaces is not None and len(rows_child_spaces) > 0:
            for row in rows_child_spaces:
                child_space_list.append({"id": row[0],
                                         "name": row[1]})

    except Exception as e:
        error_string = "Error in step 3 of space_energy_output_category.worker " + str(e)
        print(error_string)
        return error_string
    finally:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

    if ((combined_equipment_list is None or len(combined_equipment_list) == 0) and
            (equipment_list is None or len(equipment_list) == 0) and
            (child_space_list is None or len(child_space_list) == 0)):
        print("This is an empty space ")
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
        error_string = "Error in step 4.1 of space_energy_output_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    try:
        query = (" SELECT MAX(start_datetime_utc) "
                 " FROM tbl_space_output_category_hourly "
                 " WHERE space_id = %s ")
        cursor_energy_db.execute(query, (space['id'],))
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
        error_string = "Error in step 4.2 of space_energy_output_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 5: for each combined equipment in list, get energy output data from energy database
    ####################################################################################################################
    energy_combined_equipment_hourly = dict()
    if combined_equipment_list is not None and len(combined_equipment_list) > 0:
        try:
            for combined_equipment in combined_equipment_list:
                combined_equipment_id = str(combined_equipment['id'])
                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_combined_equipment_output_category_hourly "
                         " WHERE combined_equipment_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (combined_equipment_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()
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
    # Step 6: for each equipment in list, get energy output data from energy database
    ####################################################################################################################
    energy_equipment_hourly = dict()
    if equipment_list is not None and len(equipment_list) > 0:
        try:
            for equipment in equipment_list:
                equipment_id = str(equipment['id'])
                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_equipment_output_category_hourly "
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
    # Step 7: for each child space in list, get energy output data from energy database
    ####################################################################################################################
    energy_child_space_hourly = dict()
    if child_space_list is not None and len(child_space_list) > 0:
        try:
            for child_space in child_space_list:
                child_space_id = str(child_space['id'])

                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_space_output_category_hourly "
                         " WHERE space_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (child_space_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()
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
    # Step 8: determine common time slot to aggregate
    ####################################################################################################################

    common_start_datetime_utc = start_datetime_utc
    common_end_datetime_utc = end_datetime_utc

    print("Getting common time slot of energy values for all combined equipments")
    if common_start_datetime_utc is not None and common_end_datetime_utc is not None:
        if energy_combined_equipment_hourly is not None and len(energy_combined_equipment_hourly) > 0:
            for combined_equipment_id, energy_hourly in energy_combined_equipment_hourly.items():
                if energy_hourly is None or len(energy_hourly) == 0:
                    common_start_datetime_utc = None
                    common_end_datetime_utc = None
                    break
                else:
                    if common_start_datetime_utc < min(energy_hourly.keys()):
                        common_start_datetime_utc = min(energy_hourly.keys())
                    if common_end_datetime_utc > max(energy_hourly.keys()):
                        common_end_datetime_utc = max(energy_hourly.keys())

    print("Getting common time slot of energy values for all equipments...")
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

    print("Getting common time slot of energy values for all child spaces...")
    if common_start_datetime_utc is not None and common_end_datetime_utc is not None:
        if energy_child_space_hourly is not None and len(energy_child_space_hourly) > 0:
            for child_space_id, energy_hourly in energy_child_space_hourly.items():
                if energy_hourly is None or len(energy_hourly) == 0:
                    common_start_datetime_utc = None
                    common_end_datetime_utc = None
                    break
                else:
                    if common_start_datetime_utc < min(energy_hourly.keys()):
                        common_start_datetime_utc = min(energy_hourly.keys())
                    if common_end_datetime_utc > max(energy_hourly.keys()):
                        common_end_datetime_utc = max(energy_hourly.keys())

    if (energy_combined_equipment_hourly is None or len(energy_combined_equipment_hourly) == 0) and \
            (energy_equipment_hourly is None or len(energy_equipment_hourly) == 0) and \
            (energy_child_space_hourly is None or len(energy_child_space_hourly) == 0):
        # There isn't any energy data
        print("There isn't any energy data")
        # continue the for space loop to the next space
        print("continue the for space loop to the next space")
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

            if combined_equipment_list is not None and len(combined_equipment_list) > 0:
                for combined_equipment in combined_equipment_list:
                    combined_equipment_id = str(combined_equipment['id'])
                    meta_data_dict = \
                        energy_combined_equipment_hourly[combined_equipment_id].get(current_datetime_utc, None)
                    if meta_data_dict is not None and len(meta_data_dict) > 0:
                        for energy_category_id, actual_value in meta_data_dict.items():
                            aggregated_value['meta_data'][energy_category_id] = \
                                aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            if equipment_list is not None and len(equipment_list) > 0:
                for equipment in equipment_list:
                    equipment_id = str(equipment['id'])
                    meta_data_dict = energy_equipment_hourly[equipment_id].get(current_datetime_utc, None)
                    if meta_data_dict is not None and len(meta_data_dict) > 0:
                        for energy_category_id, actual_value in meta_data_dict.items():
                            aggregated_value['meta_data'][energy_category_id] = \
                                aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            if child_space_list is not None and len(child_space_list) > 0:
                for child_space in child_space_list:
                    child_space_id = str(child_space['id'])
                    meta_data_dict = energy_child_space_hourly[child_space_id].get(current_datetime_utc, None)
                    if meta_data_dict is not None and len(meta_data_dict) > 0:
                        for energy_category_id, actual_value in meta_data_dict.items():
                            aggregated_value['meta_data'][energy_category_id] = \
                                aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            aggregated_values.append(aggregated_value)

            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    except Exception as e:
        error_string = "Error in step 9 of space_energy_output_category.worker " + str(e)
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
            add_values = (" INSERT INTO tbl_space_output_category_hourly "
                          "             (space_id, "
                          "              energy_category_id, "
                          "              start_datetime_utc, "
                          "              actual_value) "
                          " VALUES  ")

            for aggregated_value in insert_100:
                for energy_category_id, actual_value in aggregated_value['meta_data'].items():
                    add_values += " (" + str(space['id']) + ","
                    add_values += " " + str(energy_category_id) + ","
                    add_values += "'" + aggregated_value['start_datetime_utc'].isoformat()[0:19] + "',"
                    add_values += str(actual_value) + "), "
            print("add_values:" + add_values)
            # trim ", " at the end of string and then execute
            cursor_energy_db.execute(add_values[:-2])
            cnx_energy_db.commit()

        except Exception as e:
            error_string = "Error in step 8 of space_energy_output_category.worker " + str(e)
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
