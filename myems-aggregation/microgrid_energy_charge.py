import random
import time
from datetime import datetime, timedelta
from decimal import Decimal
from multiprocessing import Pool
import mysql.connector
import config


########################################################################################################################
# PROCEDURES
# Step 1: get all microgrids
# Step 2: Create multiprocessing pool to call worker in parallel
########################################################################################################################


def main(logger):

    while True:
        # the outermost while loop
        ################################################################################################################
        # Step 1: get all microgrids
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of microgrid_energy_charge.main " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue
        print("Connected to MyEMS System Database")

        microgrid_list = list()
        try:
            cursor_system_db.execute(" SELECT id, name "
                                     " FROM tbl_microgrids "
                                     " ORDER BY id ")
            rows_microgrids = cursor_system_db.fetchall()

            if rows_microgrids is None or len(rows_microgrids) == 0:
                print("There isn't any microgrids ")
                # sleep and continue the outer loop to reconnect the database
                time.sleep(60)
                continue

            for row in rows_microgrids:
                microgrid_list.append({"id": row[0], "name": row[1]})

        except Exception as e:
            logger.error("Error in step 1.2 of microgrid_energy_charge.main " + str(e))
            # sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue
        finally:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        print("Got all microgrids in MyEMS System Database")

        # shuffle the microgrid list for randomly calculating the hourly values
        random.shuffle(microgrid_list)

        ################################################################################################################
        # Step 2: Create multiprocessing pool to call worker in parallel
        ################################################################################################################
        p = Pool(processes=config.pool_size)
        error_list = p.map(worker, microgrid_list)
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
#   Step 1: get all charge meters associated with the microgrid
#   Step 2: determine start datetime and end datetime to aggregate
#   Step 3: for each charge meter in list, get energy data from energy database
#   Step 4: determine common time slot to aggregate
#   Step 5: aggregate energy data in the common time slot by energy categories and hourly
#   Step 6: save energy data to energy database
#
# NOTE: returns None or the error string because that the logger object cannot be passed in as parameter
########################################################################################################################

def worker(microgrid):
    ####################################################################################################################
    # Step 1: get all charge meters associated with the microgrid
    ####################################################################################################################
    print("Step 1: get all charge meters associated with the microgrid " + str(microgrid['name']))

    charge_meter_list = list()
    cnx_system_db = None
    cursor_system_db = None
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        error_string = "Error in step 1.1 of microgrid_energy_charge.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    try:
        cursor_system_db.execute(" SELECT m.id, m.name, m.energy_category_id "
                                 " FROM tbl_meters m, tbl_microgrids_batteries mb "
                                 " WHERE m.id = mb.charge_meter_id "
                                 "       AND m.is_counted = 1 "
                                 "       AND mb.microgrid_id = %s ",
                                 (microgrid['id'],))
        rows_charge_meters = cursor_system_db.fetchall()

        if rows_charge_meters is not None and len(rows_charge_meters) > 0:
            for row in rows_charge_meters:
                charge_meter_list.append({"id": row[0],
                                          "name": row[1],
                                          "energy_category_id": row[2]})

    except Exception as e:
        error_string = "Error in step 1.2 of microgrid_energy_charge.worker " + str(e)
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # stop to the next microgrid if this microgrid is empty
    ####################################################################################################################
    if charge_meter_list is None or len(charge_meter_list) == 0:
        print("This is an empty microgrid ")
        return None

    ####################################################################################################################
    # Step 2: determine start datetime and end datetime to aggregate
    ####################################################################################################################
    print("Step 2: determine start datetime and end datetime to aggregate")
    cnx_energy_db = None
    cursor_energy_db = None
    try:
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()
    except Exception as e:
        error_string = "Error in step 2.1 of microgrid_energy_charge.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    try:
        query = (" SELECT MAX(start_datetime_utc) "
                 " FROM tbl_microgrid_charge_hourly "
                 " WHERE microgrid_id = %s ")
        cursor_energy_db.execute(query, (microgrid['id'],))
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
        error_string = "Error in step 2.2 of microgrid_energy_charge.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 3: for each charge meter in list, get energy data from energy database
    ####################################################################################################################
    energy_meter_hourly = dict()
    try:
        if charge_meter_list is not None and len(charge_meter_list) > 0:
            for meter in charge_meter_list:
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
        error_string = "Error in step 3.1 of microgrid_energy_charge.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 4: determine common time slot to aggregate
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

    if energy_meter_hourly is None or len(energy_meter_hourly) == 0:
        # There isn't any energy data
        print("There isn't any energy data")
        # continue the for tenant loop to the next microgrid
        print("continue the for microgrid loop to the next microgrid")
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return None

    print("common_start_datetime_utc: " + str(common_start_datetime_utc))
    print("common_end_datetime_utc: " + str(common_end_datetime_utc))

    ####################################################################################################################
    # Step 5: aggregate energy data in the common time slot by energy categories and hourly
    ####################################################################################################################

    print("Step 5: aggregate energy data in the common time slot by energy categories and hourly")
    aggregated_values = list()
    try:
        current_datetime_utc = common_start_datetime_utc
        while common_start_datetime_utc is not None \
                and common_end_datetime_utc is not None \
                and current_datetime_utc <= common_end_datetime_utc:
            aggregated_value = dict()
            aggregated_value['start_datetime_utc'] = current_datetime_utc
            aggregated_value['meta_data'] = dict()

            if charge_meter_list is not None and len(charge_meter_list) > 0:
                for meter in charge_meter_list:
                    meter_id = str(meter['id'])
                    energy_category_id = meter['energy_category_id']
                    actual_value = energy_meter_hourly[meter_id].get(current_datetime_utc, Decimal(0.0))
                    aggregated_value['meta_data'][energy_category_id] = \
                        aggregated_value['meta_data'].get(energy_category_id, Decimal(0.0)) + actual_value

            aggregated_values.append(aggregated_value)
            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    except Exception as e:
        error_string = "Error in step 5 of microgrid_energy_charge.worker " + str(e)
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        print(error_string)
        return error_string

    ####################################################################################################################
    # Step 6: save energy data to energy database
    ####################################################################################################################
    print("Step 6: save energy data to energy database")

    while len(aggregated_values) > 0:
        insert_100 = aggregated_values[:100]
        aggregated_values = aggregated_values[100:]
        try:
            add_values = (" INSERT INTO tbl_microgrid_charge_hourly "
                          "             (microgrid_id, "
                          "              start_datetime_utc, "
                          "              actual_value) "
                          " VALUES  ")

            for aggregated_value in insert_100:
                for energy_category_id, actual_value in aggregated_value['meta_data'].items():
                    add_values += " (" + str(microgrid['id']) + ","
                    add_values += "'" + aggregated_value['start_datetime_utc'].isoformat()[0:19] + "',"
                    add_values += str(actual_value) + "), "
            # print("add_values:" + add_values)
            # trim ", " at the end of string and then execute
            cursor_energy_db.execute(add_values[:-2])
            cnx_energy_db.commit()

        except Exception as e:
            error_string = "Error in step 6.1 of microgrid_energy_charge.worker " + str(e)
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
