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
            logger.error("Error in step 1.1 of space_energy_input_category.main " + str(e))
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
            logger.error("Error in step 1.2 of space_energy_input_category.main " + str(e))
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
#   Step 1: get all input meters associated with the space
#   Step 2: get all input virtual meters associated with the space
#   Step 3: get all input offline meters associated with the space
#   Step 4: get all combined equipments associated with the space
#   Step 5: get all equipments associated with the space
#   Step 6: get all shopfloors associated with the space
#   Step 7: get all stores associated with the space
#   Step 8: get all tenants associated with the space
#   Step 9: get all child spaces associated with the space
#   Step 10: determine start datetime and end datetime to aggregate
#   Step 11: for each meter in list, get energy input data from energy database
#   Step 12: for each virtual meter in list, get energy input data from energy database
#   Step 13: for each offline meter in list, get energy input data from energy database
#   Step 14: for each combined equipment in list, get energy input data from energy database
#   Step 15: for each equipment in list, get energy input data from energy database
#   Step 16: for each shopfloor in list, get energy input data from energy database
#   Step 17: for each store in list, get energy input data from energy database
#   Step 18: for each tenant in list, get energy input data from energy database
#   Step 19: for each child space in list, get energy input data from energy database
#   Step 20: determine common time slot to aggregate
#   Step 21: aggregate energy data in the common time slot by energy categories and hourly
#   Step 22: save energy data to energy database
#
# NOTE: returns None or the error string because that the logger object cannot be passed in as parameter
########################################################################################################################

def worker(space):
    ####################################################################################################################
    # Step 1: get all input meters associated with the space
    ####################################################################################################################
    print("Step 1: get all input meters associated with the space " + str(space['name']))

    cnx_system_db = None
    cursor_system_db = None
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        error_string = "Error in step 1.1 of space_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    meter_list = list()
    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_category_id "
                                 " FROM tbl_meters m, tbl_spaces_meters sm "
                                 " WHERE m.id = sm.meter_id "
                                 "       AND m.is_counted = 1 "
                                 "       AND sm.space_id = %s ",
                                 (space['id'],))
        rows_meters = cursor_system_db.fetchall()

        if rows_meters is not None and len(rows_meters) > 0:
            for row in rows_meters:
                meter_list.append({"id": row[0],
                                   "name": row[1],
                                   "energy_category_id": row[2]})

    except Exception as e:
        error_string = "Error in step 1.2 of space_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 2: get all input virtual meters associated with the space
    ####################################################################################################################
    print("Step 2: get all input virtual meters associated with the space")
    virtual_meter_list = list()

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_category_id "
                                 " FROM tbl_virtual_meters m, tbl_spaces_virtual_meters sm "
                                 " WHERE m.id = sm.virtual_meter_id "
                                 "       AND m.is_counted = 1 "
                                 "       AND sm.space_id = %s ",
                                 (space['id'],))
        rows_virtual_meters = cursor_system_db.fetchall()

        if rows_virtual_meters is not None and len(rows_virtual_meters) > 0:
            for row in rows_virtual_meters:
                virtual_meter_list.append({"id": row[0],
                                           "name": row[1],
                                           "energy_category_id": row[2]})

    except Exception as e:
        error_string = "Error in step 2 of space_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 3: get all input offline meters associated with the space
    ####################################################################################################################
    print("Step 3: get all input offline meters associated with the space")

    offline_meter_list = list()

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_category_id "
                                 " FROM tbl_offline_meters m, tbl_spaces_offline_meters sm "
                                 " WHERE m.id = sm.offline_meter_id "
                                 "       AND m.is_counted = 1 "
                                 "       AND sm.space_id = %s ",
                                 (space['id'],))
        rows_offline_meters = cursor_system_db.fetchall()

        if rows_offline_meters is not None and len(rows_offline_meters) > 0:
            for row in rows_offline_meters:
                offline_meter_list.append({"id": row[0],
                                           "name": row[1],
                                           "energy_category_id": row[2]})

    except Exception as e:
        error_string = "Error in step 3 of space_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 4: get all combined equipments associated with the space
    ####################################################################################################################
    print("Step 4: get all combined equipments associated with the space")

    combined_equipment_list = list()

    try:
        cursor_system_db.execute(" SELECT e.id, e.name "
                                 " FROM tbl_combined_equipments e, tbl_spaces_combined_equipments se "
                                 " WHERE e.id = se.combined_equipment_id "
                                 "       AND e.is_input_counted = 1 "
                                 "       AND se.space_id = %s ",
                                 (space['id'],))
        rows_combined_equipments = cursor_system_db.fetchall()

        if rows_combined_equipments is not None and len(rows_combined_equipments) > 0:
            for row in rows_combined_equipments:
                combined_equipment_list.append({"id": row[0],
                                                "name": row[1]})

    except Exception as e:
        error_string = "Error in step 4 of space_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 5: get all equipments associated with the space
    ####################################################################################################################
    print("Step 5: get all equipments associated with the space")

    equipment_list = list()

    try:
        cursor_system_db.execute(" SELECT e.id, e.name "
                                 " FROM tbl_equipments e, tbl_spaces_equipments se "
                                 " WHERE e.id = se.equipment_id "
                                 "       AND e.is_input_counted = 1 "
                                 "       AND se.space_id = %s ",
                                 (space['id'],))
        rows_equipments = cursor_system_db.fetchall()

        if rows_equipments is not None and len(rows_equipments) > 0:
            for row in rows_equipments:
                equipment_list.append({"id": row[0],
                                       "name": row[1]})

    except Exception as e:
        error_string = "Error in step 5 of space_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 6: get all shopfloors associated with the space
    ####################################################################################################################
    print("Step 6: get all shopfloors associated with the space")

    shopfloor_list = list()

    try:
        cursor_system_db.execute(" SELECT s.id, s.name "
                                 " FROM tbl_shopfloors s, tbl_spaces_shopfloors ss "
                                 " WHERE s.id = ss.shopfloor_id "
                                 "       AND s.is_input_counted = 1 "
                                 "       AND ss.space_id = %s ",
                                 (space['id'],))
        rows_shopfloors = cursor_system_db.fetchall()

        if rows_shopfloors is not None and len(rows_shopfloors) > 0:
            for row in rows_shopfloors:
                shopfloor_list.append({"id": row[0],
                                       "name": row[1]})

    except Exception as e:
        error_string = "Error in step 6 of space_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 7: get all stores associated with the space
    ####################################################################################################################
    print("Step 7: get all stores associated with the space")

    store_list = list()

    try:
        cursor_system_db.execute(" SELECT s.id, s.name "
                                 " FROM tbl_stores s, tbl_spaces_stores ss "
                                 " WHERE s.id = ss.store_id "
                                 "       AND s.is_input_counted = 1 "
                                 "       AND ss.space_id = %s ",
                                 (space['id'],))
        rows_stores = cursor_system_db.fetchall()

        if rows_stores is not None and len(rows_stores) > 0:
            for row in rows_stores:
                store_list.append({"id": row[0],
                                   "name": row[1]})

    except Exception as e:
        error_string = "Error in step 7 of space_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 8: get all tenants associated with the space
    ####################################################################################################################
    print("Step 8: get all tenants associated with the space")

    tenant_list = list()

    try:
        cursor_system_db.execute(" SELECT t.id, t.name "
                                 " FROM tbl_tenants t, tbl_spaces_tenants st "
                                 " WHERE t.id = st.tenant_id "
                                 "       AND t.is_input_counted = 1 "
                                 "       AND st.space_id = %s ",
                                 (space['id'],))
        rows_tenants = cursor_system_db.fetchall()

        if rows_tenants is not None and len(rows_tenants) > 0:
            for row in rows_tenants:
                tenant_list.append({"id": row[0],
                                    "name": row[1]})

    except Exception as e:
        error_string = "Error in step 8 of space_energy_input_category.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 9: get all child spaces associated with the space
    ####################################################################################################################
    print("Step 9: get all child spaces associated with the space")

    child_space_list = list()

    try:
        cursor_system_db.execute(" SELECT id, name "
                                 " FROM tbl_spaces "
                                 " WHERE is_input_counted = 1 "
                                 "       AND parent_space_id = %s ",
                                 (space['id'],))
        rows_child_spaces = cursor_system_db.fetchall()

        if rows_child_spaces is not None and len(rows_child_spaces) > 0:
            for row in rows_child_spaces:
                child_space_list.append({"id": row[0],
                                         "name": row[1]})

    except Exception as e:
        error_string = "Error in step 9 of space_energy_input_category.worker " + str(e)
        print(error_string)
        return error_string
    finally:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

    if (meter_list is None or len(meter_list) == 0) and \
            (virtual_meter_list is None or len(virtual_meter_list) == 0) and \
            (offline_meter_list is None or len(offline_meter_list) == 0) and \
            (combined_equipment_list is None or len(combined_equipment_list) == 0) and \
            (equipment_list is None or len(equipment_list) == 0) and \
            (shopfloor_list is None or len(shopfloor_list) == 0) and \
            (store_list is None or len(store_list) == 0) and \
            (tenant_list is None or len(tenant_list) == 0) and \
            (child_space_list is None or len(child_space_list) == 0):
        print("This is an empty space ")
        return None

    ####################################################################################################################
    # Step 10: determine start datetime and end datetime to aggregate
    ####################################################################################################################
    print("Step 10: determine start datetime and end datetime to aggregate")
    cnx_energy_db = None
    cursor_energy_db = None
    try:
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()
    except Exception as e:
        error_string = "Error in step 10.1 of space_energy_input_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    try:
        query = (" SELECT MAX(start_datetime_utc) "
                 " FROM tbl_space_input_category_hourly "
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
        error_string = "Error in step 10.2 of space_energy_input_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 11: for each meter in list, get energy input data from energy database
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
        error_string = "Error in step 11 of space_energy_input_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 12: for each virtual meter in list, get energy input data from energy database
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
            error_string = "Error in step 12 of space_energy_input_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 13: for each offline meter in list, get energy input data from energy database
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
            error_string = "Error in step 13 of space_energy_input_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 14: for each combined equipment in list, get energy input data from energy database
    ####################################################################################################################
    energy_combined_equipment_hourly = dict()
    if combined_equipment_list is not None and len(combined_equipment_list) > 0:
        try:
            for combined_equipment in combined_equipment_list:
                combined_equipment_id = str(combined_equipment['id'])
                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_combined_equipment_input_category_hourly "
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
            error_string = "Error in step 14 of space_energy_input_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 15: for each equipment in list, get energy input data from energy database
    ####################################################################################################################
    energy_equipment_hourly = dict()
    if equipment_list is not None and len(equipment_list) > 0:
        try:
            for equipment in equipment_list:
                equipment_id = str(equipment['id'])
                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_equipment_input_category_hourly "
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
            error_string = "Error in step 15 of space_energy_input_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 16: for each shopfloor in list, get energy input data from energy database
    ####################################################################################################################
    energy_shopfloor_hourly = dict()
    if shopfloor_list is not None and len(shopfloor_list) > 0:
        try:
            for shopfloor in shopfloor_list:
                shopfloor_id = str(shopfloor['id'])

                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_shopfloor_input_category_hourly "
                         " WHERE shopfloor_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (shopfloor_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()
                if rows_energy_values is None or len(rows_energy_values) == 0:
                    energy_shopfloor_hourly[shopfloor_id] = None
                else:
                    energy_shopfloor_hourly[shopfloor_id] = dict()
                    for row_energy_value in rows_energy_values:
                        current_datetime_utc = row_energy_value[0]
                        if current_datetime_utc not in energy_shopfloor_hourly[shopfloor_id]:
                            energy_shopfloor_hourly[shopfloor_id][current_datetime_utc] = dict()
                        energy_category_id = row_energy_value[1]
                        actual_value = row_energy_value[2]
                        energy_shopfloor_hourly[shopfloor_id][current_datetime_utc][energy_category_id] = actual_value
        except Exception as e:
            error_string = "Error in step 16 of space_energy_input_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 17: for each store in list, get energy input data from energy database
    ####################################################################################################################
    energy_store_hourly = dict()
    if store_list is not None and len(store_list) > 0:
        try:
            for store in store_list:
                store_id = str(store['id'])

                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_store_input_category_hourly "
                         " WHERE store_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (store_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()
                if rows_energy_values is None or len(rows_energy_values) == 0:
                    energy_store_hourly[store_id] = None
                else:
                    energy_store_hourly[store_id] = dict()
                    for row_energy_value in rows_energy_values:
                        current_datetime_utc = row_energy_value[0]
                        if current_datetime_utc not in energy_store_hourly[store_id]:
                            energy_store_hourly[store_id][current_datetime_utc] = dict()
                        energy_category_id = row_energy_value[1]
                        actual_value = row_energy_value[2]
                        energy_store_hourly[store_id][current_datetime_utc][energy_category_id] = actual_value
        except Exception as e:
            error_string = "Error in step 17 of space_energy_input_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 18: for each tenant in list, get energy input data from energy database
    ####################################################################################################################
    energy_tenant_hourly = dict()
    if tenant_list is not None and len(tenant_list) > 0:
        try:
            for tenant in tenant_list:
                tenant_id = str(tenant['id'])

                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_tenant_input_category_hourly "
                         " WHERE tenant_id = %s "
                         "       AND start_datetime_utc >= %s "
                         "       AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (tenant_id, start_datetime_utc, end_datetime_utc,))
                rows_energy_values = cursor_energy_db.fetchall()
                if rows_energy_values is None or len(rows_energy_values) == 0:
                    energy_tenant_hourly[tenant_id] = None
                else:
                    energy_tenant_hourly[tenant_id] = dict()
                    for row_energy_value in rows_energy_values:
                        current_datetime_utc = row_energy_value[0]
                        if current_datetime_utc not in energy_tenant_hourly[tenant_id]:
                            energy_tenant_hourly[tenant_id][current_datetime_utc] = dict()
                        energy_category_id = row_energy_value[1]
                        actual_value = row_energy_value[2]
                        energy_tenant_hourly[tenant_id][current_datetime_utc][energy_category_id] = actual_value
        except Exception as e:
            error_string = "Error in step 18 of space_energy_input_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 19: for each child space in list, get energy input data from energy database
    ####################################################################################################################
    energy_child_space_hourly = dict()
    if child_space_list is not None and len(child_space_list) > 0:
        try:
            for child_space in child_space_list:
                child_space_id = str(child_space['id'])

                query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                         " FROM tbl_space_input_category_hourly "
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
            error_string = "Error in step 19 of space_energy_input_category.worker " + str(e)
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            print(error_string)
            return error_string

    ####################################################################################################################
    # Step 20: determine common time slot to aggregate
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

    print("Getting common time slot of energy values for all shopfloors")
    if common_start_datetime_utc is not None and common_end_datetime_utc is not None:
        if energy_shopfloor_hourly is not None and len(energy_shopfloor_hourly) > 0:
            for shopfloor_id, energy_hourly in energy_shopfloor_hourly.items():
                if energy_hourly is None or len(energy_hourly) == 0:
                    common_start_datetime_utc = None
                    common_end_datetime_utc = None
                    break
                else:
                    if common_start_datetime_utc < min(energy_hourly.keys()):
                        common_start_datetime_utc = min(energy_hourly.keys())
                    if common_end_datetime_utc > max(energy_hourly.keys()):
                        common_end_datetime_utc = max(energy_hourly.keys())

    print("Getting common time slot of energy values for all stores")
    if common_start_datetime_utc is not None and common_end_datetime_utc is not None:
        if energy_store_hourly is not None and len(energy_store_hourly) > 0:
            for store_id, energy_hourly in energy_store_hourly.items():
                if energy_hourly is None or len(energy_hourly) == 0:
                    common_start_datetime_utc = None
                    common_end_datetime_utc = None
                    break
                else:
                    if common_start_datetime_utc < min(energy_hourly.keys()):
                        common_start_datetime_utc = min(energy_hourly.keys())
                    if common_end_datetime_utc > max(energy_hourly.keys()):
                        common_end_datetime_utc = max(energy_hourly.keys())

    print("Getting common time slot of energy values for all tenants")
    if common_start_datetime_utc is not None and common_end_datetime_utc is not None:
        if energy_tenant_hourly is not None and len(energy_tenant_hourly) > 0:
            for tenant_id, energy_hourly in energy_tenant_hourly.items():
                if energy_hourly is None or len(energy_hourly) == 0:
                    common_start_datetime_utc = None
                    common_end_datetime_utc = None
                    break
                else:
                    if common_start_datetime_utc < min(energy_hourly.keys()):
                        common_start_datetime_utc = min(energy_hourly.keys())
                    if common_end_datetime_utc > max(energy_hourly.keys()):
                        common_end_datetime_utc = max(energy_hourly.keys())

    print("Getting common time slot of energy values for all child spaces")
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

    if (energy_meter_hourly is None or len(energy_meter_hourly) == 0) and \
            (energy_virtual_meter_hourly is None or len(energy_virtual_meter_hourly) == 0) and \
            (energy_offline_meter_hourly is None or len(energy_offline_meter_hourly) == 0) and \
            (energy_combined_equipment_hourly is None or len(energy_combined_equipment_hourly) == 0) and \
            (energy_equipment_hourly is None or len(energy_equipment_hourly) == 0) and \
            (energy_shopfloor_hourly is None or len(energy_shopfloor_hourly) == 0) and \
            (energy_store_hourly is None or len(energy_store_hourly) == 0) and \
            (energy_tenant_hourly is None or len(energy_tenant_hourly) == 0) and \
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
    # Step 21: aggregate energy data in the common time slot by energy categories and hourly
    ####################################################################################################################

    print("Step 21: aggregate energy data in the common time slot by energy categories and hourly")
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

            if shopfloor_list is not None and len(shopfloor_list) > 0:
                for shopfloor in shopfloor_list:
                    shopfloor_id = str(shopfloor['id'])
                    meta_data_dict = energy_shopfloor_hourly[shopfloor_id].get(current_datetime_utc, None)
                    if meta_data_dict is not None and len(meta_data_dict) > 0:
                        for energy_category_id, actual_value in meta_data_dict.items():
                            aggregated_value['meta_data'][energy_category_id] = \
                                aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            if store_list is not None and len(store_list) > 0:
                for store in store_list:
                    store_id = str(store['id'])
                    meta_data_dict = energy_store_hourly[store_id].get(current_datetime_utc, None)
                    if meta_data_dict is not None and len(meta_data_dict) > 0:
                        for energy_category_id, actual_value in meta_data_dict.items():
                            aggregated_value['meta_data'][energy_category_id] = \
                                aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            if tenant_list is not None and len(tenant_list) > 0:
                for tenant in tenant_list:
                    tenant_id = str(tenant['id'])
                    meta_data_dict = energy_tenant_hourly[tenant_id].get(current_datetime_utc, None)
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
        error_string = "Error in step 21 of space_energy_input_category.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 22: save energy data to energy database
    ####################################################################################################################
    print("Step 22: save energy data to energy database")

    while len(aggregated_values) > 0:
        insert_100 = aggregated_values[:100]
        aggregated_values = aggregated_values[100:]
        try:
            add_values = (" INSERT INTO tbl_space_input_category_hourly "
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
            error_string = "Error in step 22 of space_energy_input_category.worker " + str(e)
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
