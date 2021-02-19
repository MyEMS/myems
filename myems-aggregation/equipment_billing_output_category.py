import time
from datetime import datetime, timedelta
from decimal import Decimal
import mysql.connector
import tariff
import config


########################################################################################################################
# PROCEDURES
# Step 1: get all equipments
# for each equipment in list:
#   Step 2: get the latest start_datetime_utc
#   Step 3: get all energy input data since the latest start_datetime_utc
#   Step 4: get tariffs
#   Step 5: calculate billing by multiplying energy with tariff
#   Step 6: save billing data to database
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
            logger.error("Error in step 1.1 of equipment_billing_input_category " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and continue the outermost while loop
            time.sleep(60)
            continue

        print("Connected to MyEMS System Database")

        try:
            cursor_system_db.execute(" SELECT id, name, cost_center_id "
                                     " FROM tbl_equipments "
                                     " ORDER BY id ")
            rows_equipments = cursor_system_db.fetchall()

            if rows_equipments is None or len(rows_equipments) == 0:
                print("Step 1.2: There isn't any equipments. ")
                if cursor_system_db:
                    cursor_system_db.close()
                if cnx_system_db:
                    cnx_system_db.close()
                # sleep and continue the outermost while loop
                time.sleep(60)
                continue

            equipment_list = list()
            for row in rows_equipments:
                equipment_list.append({"id": row[0], "name": row[1], "cost_center_id": row[2]})

        except Exception as e:
            logger.error("Error in step 1.2 of equipment_billing_output_category " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and continue the outermost while loop
            time.sleep(60)
            continue

        print("Step 1.2: Got all equipments from MyEMS System Database")

        cnx_energy_db = None
        cursor_energy_db = None
        try:
            cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
            cursor_energy_db = cnx_energy_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.3 of equipment_billing_output_category " + str(e))
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()

            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and continue the outermost while loop
            time.sleep(60)
            continue

        print("Connected to MyEMS Energy Database")

        cnx_billing_db = None
        cursor_billing_db = None
        try:
            cnx_billing_db = mysql.connector.connect(**config.myems_billing_db)
            cursor_billing_db = cnx_billing_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.4 of equipment_billing_output_category " + str(e))
            if cursor_billing_db:
                cursor_billing_db.close()
            if cnx_billing_db:
                cnx_billing_db.close()

            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()

            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and continue the outermost while loop
            time.sleep(60)
            continue

        print("Connected to MyEMS Billing Database")

        for equipment in equipment_list:

            ############################################################################################################
            # Step 2: get the latest start_datetime_utc
            ############################################################################################################
            print("Step 2: get the latest start_datetime_utc from billing database for " + equipment['name'])
            try:
                cursor_billing_db.execute(" SELECT MAX(start_datetime_utc) "
                                          " FROM tbl_equipment_output_category_hourly "
                                          " WHERE equipment_id = %s ",
                                          (equipment['id'], ))
                row_datetime = cursor_billing_db.fetchone()
                start_datetime_utc = datetime.strptime(config.start_datetime_utc, '%Y-%m-%d %H:%M:%S')
                start_datetime_utc = start_datetime_utc.replace(minute=0, second=0, microsecond=0, tzinfo=None)

                if row_datetime is not None and len(row_datetime) > 0 and isinstance(row_datetime[0], datetime):
                    # replace second and microsecond with 0
                    # note: do not replace minute in case of calculating in half hourly
                    start_datetime_utc = row_datetime[0].replace(second=0, microsecond=0, tzinfo=None)
                    # start from the next time slot
                    start_datetime_utc += timedelta(minutes=config.minutes_to_count)

                print("start_datetime_utc: " + start_datetime_utc.isoformat()[0:19])
            except Exception as e:
                logger.error("Error in step 2 of equipment_billing_output_category " + str(e))
                # break the for equipment loop
                break

            ############################################################################################################
            # Step 3: get all energy output data since the latest start_datetime_utc
            ############################################################################################################
            print("Step 3: get all energy output data since the latest start_datetime_utc")

            query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                     " FROM tbl_equipment_output_category_hourly "
                     " WHERE equipment_id = %s AND start_datetime_utc >= %s "
                     " ORDER BY id ")
            cursor_energy_db.execute(query, (equipment['id'], start_datetime_utc, ))
            rows_hourly = cursor_energy_db.fetchall()

            if rows_hourly is None or len(rows_hourly) == 0:
                print("Step 3: There isn't any energy output data to calculate. ")
                # continue the for equipment loop
                continue

            energy_dict = dict()
            energy_category_list = list()
            end_datetime_utc = start_datetime_utc
            for row_hourly in rows_hourly:
                current_datetime_utc = row_hourly[0]
                energy_category_id = row_hourly[1]

                if energy_category_id not in energy_category_list:
                    energy_category_list.append(energy_category_id)

                actual_value = row_hourly[2]
                if energy_dict.get(current_datetime_utc) is None:
                    energy_dict[current_datetime_utc] = dict()
                energy_dict[current_datetime_utc][energy_category_id] = actual_value
                if current_datetime_utc > end_datetime_utc:
                    end_datetime_utc = current_datetime_utc

            ############################################################################################################
            # Step 4: get tariffs
            ############################################################################################################
            print("Step 4: get tariffs")
            tariff_dict = dict()
            for energy_category_id in energy_category_list:
                tariff_dict[energy_category_id] = tariff.get_energy_category_tariffs(equipment['cost_center_id'],
                                                                                     energy_category_id,
                                                                                     start_datetime_utc,
                                                                                     end_datetime_utc)
            ############################################################################################################
            # Step 5: calculate billing by multiplying energy with tariff
            ############################################################################################################
            print("Step 5: calculate billing by multiplying energy with tariff")
            billing_dict = dict()

            if len(energy_dict) > 0:
                for current_datetime_utc in energy_dict.keys():
                    billing_dict[current_datetime_utc] = dict()
                    for energy_category_id in energy_category_list:
                        current_tariff = tariff_dict[energy_category_id].get(current_datetime_utc)
                        current_energy = energy_dict[current_datetime_utc].get(energy_category_id)
                        if current_tariff is not None \
                                and isinstance(current_tariff, Decimal) \
                                and current_energy is not None \
                                and isinstance(current_energy, Decimal):
                            billing_dict[current_datetime_utc][energy_category_id] = \
                                current_energy * current_tariff

                    if len(billing_dict[current_datetime_utc]) == 0:
                        del billing_dict[current_datetime_utc]

            ############################################################################################################
            # Step 6: save billing data to billing database
            ############################################################################################################
            print("Step 6: save billing data to billing database")

            if len(billing_dict) > 0:
                try:
                    add_values = (" INSERT INTO tbl_equipment_output_category_hourly "
                                  "             (equipment_id, "
                                  "              energy_category_id, "
                                  "              start_datetime_utc, "
                                  "              actual_value) "
                                  " VALUES  ")

                    for current_datetime_utc in billing_dict:
                        for energy_category_id in energy_category_list:
                            current_billing = billing_dict[current_datetime_utc].get(energy_category_id)
                            if current_billing is not None and isinstance(current_billing, Decimal):
                                add_values += " (" + str(equipment['id']) + ","
                                add_values += " " + str(energy_category_id) + ","
                                add_values += "'" + current_datetime_utc.isoformat()[0:19] + "',"
                                add_values += str(billing_dict[current_datetime_utc][energy_category_id]) + "), "
                    print("add_values:" + add_values)
                    # trim ", " at the end of string and then execute
                    cursor_billing_db.execute(add_values[:-2])
                    cnx_billing_db.commit()
                except Exception as e:
                    logger.error("Error in step 6 of equipment_billing_output_category " + str(e))
                    # break the for equipment loop
                    break

        # end of for equipment loop
        if cnx_system_db:
            cnx_system_db.close()
        if cursor_system_db:
            cursor_system_db.close()

        if cnx_energy_db:
            cnx_energy_db.close()
        if cursor_energy_db:
            cursor_energy_db.close()

        if cnx_billing_db:
            cnx_billing_db.close()
        if cursor_billing_db:
            cursor_billing_db.close()
        print("go to sleep 300 seconds...")
        time.sleep(300)
        print("wake from sleep, and continue to work...")
    # end of the outermost while loop
