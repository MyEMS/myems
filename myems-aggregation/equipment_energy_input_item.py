import random
import time
from datetime import datetime, timedelta
from decimal import Decimal
from multiprocessing import Pool

import mysql.connector

import config


########################################################################################################################
# PROCEDURES
# Step 1: get all equipments
# Step 2: Create multiprocessing pool to call worker in parallel
########################################################################################################################


def main(logger):

    while True:
        # the outermost while loop
        ################################################################################################################
        # Step 1: get all equipments
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of equipment_energy_input_item.main " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue
        print("Connected to MyEMS System Database")

        equipment_list = list()
        try:
            cursor_system_db.execute(" SELECT id, name "
                                     " FROM tbl_equipments "
                                     " ORDER BY id ")
            rows_equipments = cursor_system_db.fetchall()

            if rows_equipments is None or len(rows_equipments) == 0:
                print("There isn't any equipments ")
                # sleep and continue the outer loop to reconnect the database
                time.sleep(60)
                continue

            for row in rows_equipments:
                equipment_list.append({"id": row[0], "name": row[1]})

        except Exception as e:
            logger.error("Error in step 1.2 of equipment_energy_input_item.main " + str(e))
            # sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue
        finally:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        print("Got all equipments in MyEMS System Database")

        # shuffle the equipment list for randomly calculating the meter hourly value
        random.shuffle(equipment_list)

        ################################################################################################################
        # Step 2: Create multiprocessing pool to call worker in parallel
        ################################################################################################################
        p = Pool(processes=config.pool_size)
        error_list = p.map(worker, equipment_list)
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
#   Step 1: get all input meters associated with the equipment
#   Step 2: get all input virtual meters associated with the equipment
#   Step 3: get all input offline meters associated with the equipment
#   Step 4: determine start datetime and end datetime to aggregate
#   Step 5: for each meter in list, get energy input data from energy database
#   Step 6: for each virtual meter in list, get energy input data from energy database
#   Step 7: for each offline meter in list, get energy input data from energy database
#   Step 8: determine common time slot to aggregate
#   Step 9: aggregate energy data in the common time slot by energy items and hourly
#   Step 10: save energy data to energy database
#
# NOTE: returns None or the error string because that the logger object cannot be passed in as parameter
########################################################################################################################

def worker(equipment):
    ####################################################################################################################
    # Step 1: get all input meters associated with the equipment
    ####################################################################################################################
    print("Step 1: get all input meters associated with the equipment " + str(equipment['name']))

    meter_list = list()
    cnx_system_db = None
    cursor_system_db = None
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        error_string = "Error in step 1.1 of equipment_energy_input_item.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_item_id "
                                 " FROM tbl_meters m, tbl_equipments_meters em "
                                 " WHERE m.id = em.meter_id "
                                 "       AND m.is_counted = 1 "
                                 "       AND m.energy_item_id is NOT NULL "
                                 "       AND em.is_output = 0 "
                                 "       AND em.equipment_id = %s ",
                                 (equipment['id'],))
        rows_meters = cursor_system_db.fetchall()

        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_list.append({"id": row[0],
                                   "name": row[1],
                                   "energy_item_id": row[2]})

    except Exception as e:
        error_string = "Error in step 1.2 of equipment_energy_input_item.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 2: get all input virtual meters associated with the equipment
    ####################################################################################################################
    print("Step 2: get all input virtual meters associated with the equipment")
    virtual_meter_list = list()

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_item_id "
                                 " FROM tbl_virtual_meters m, tbl_equipments_virtual_meters em "
                                 " WHERE m.id = em.virtual_meter_id "
                                 "       AND m.energy_item_id is NOT NULL "
                                 "       AND m.is_counted = 1 "
                                 "       AND em.is_output = 0 "
                                 "       AND em.equipment_id = %s ",
                                 (equipment['id'],))
        rows_virtual_meters = cursor_system_db.fetchall()

        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_list.append({"id": row[0],
                                           "name": row[1],
                                           "energy_item_id": row[2]})

    except Exception as e:
        error_string = "Error in step 2.1 of equipment_energy_input_item.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 3: get all input offline meters associated with the equipment
    ####################################################################################################################
    print("Step 3: get all input offline meters associated with the equipment")

    offline_meter_list = list()

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_item_id "
                                 " FROM tbl_offline_meters m, tbl_equipments_offline_meters em "
                                 " WHERE m.id = em.offline_meter_id "
                                 "       AND m.energy_item_id is NOT NULL "
                                 "       AND m.is_counted = 1 "
                                 "       AND em.is_output = 0 "
                                 "       AND em.equipment_id = %s ",
                                 (equipment['id'],))
        rows_offline_meters = cursor_system_db.fetchall()

        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_list.append({"id": row[0],
                                           "name": row[1],
                                           "energy_item_id": row[2]})

    except Exception as e:
        error_string = "Error in step 3.1 of equipment_energy_input_item.worker " + str(e)
        print(error_string)
        return error_string
    finally:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

    ####################################################################################################################
    # stop to the next equipment if this equipment is empty
    ####################################################################################################################
    if (meter_list is None or len(meter_list) == 0) and \
            (virtual_meter_list is None or len(virtual_meter_list) == 0) and \
            (offline_meter_list is None or len(offline_meter_list) == 0):
        print("This is an empty equipment ")
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
        error_string = "Error in step 4.1 of equipment_energy_input_item.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    try:
        query = (" SELECT MAX(start_datetime_utc) "
                 " FROM tbl_equipment_input_item_hourly "
                 " WHERE equipment_id = %s ")
        cursor_energy_db.execute(query, (equipment['id'],))
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
        error_string = "Error in step 4.2 of equipment_energy_input_item.worker " + str(e)
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
        error_string = "Error in step 5.1 of equipment_energy_input_item.worker " + str(e)
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
            error_string = "Error in step 6.1 of equipment_energy_input_item.worker " + str(e)
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
            error_string = "Error in step 7.1 of equipment_energy_input_item.worker " + str(e)
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
        # continue the for equipment loop to the next equipment
        print("continue the for equipment loop to the next equipment")
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return None

    print("common_start_datetime_utc: " + str(common_start_datetime_utc))
    print("common_end_datetime_utc: " + str(common_end_datetime_utc))

    ####################################################################################################################
    # Step 9: aggregate energy data in the common time slot by energy items and hourly
    ####################################################################################################################

    print("Step 9: aggregate energy data in the common time slot by energy items and hourly")
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

            aggregated_values.append(aggregated_value)

            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    except Exception as e:
        error_string = "Error in step 9 of equipment_energy_input_item.worker " + str(e)
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
            add_values = (" INSERT INTO tbl_equipment_input_item_hourly "
                          "             (equipment_id, "
                          "              energy_item_id, "
                          "              start_datetime_utc, "
                          "              actual_value) "
                          " VALUES  ")

            for aggregated_value in insert_100:
                for energy_item_id, actual_value in aggregated_value['meta_data'].items():
                    add_values += " (" + str(equipment['id']) + ","
                    add_values += " " + str(energy_item_id) + ","
                    add_values += "'" + aggregated_value['start_datetime_utc'].isoformat()[0:19] + "',"
                    add_values += str(actual_value) + "), "
            print("add_values:" + add_values)
            # trim ", " at the end of string and then execute
            cursor_energy_db.execute(add_values[:-2])
            cnx_energy_db.commit()

        except Exception as e:
            error_string = "Error in step 10.1 of equipment_energy_input_item.worker " + str(e)
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
