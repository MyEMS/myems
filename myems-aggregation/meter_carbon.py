import time
from datetime import datetime, timedelta
from decimal import Decimal

import mysql.connector

import carbon_dioxide_emmision_factor
import config


########################################################################################################################
# PROCEDURES
# Step 1: get all meters
# for each meter in list:
#   Step 2: get the latest start_datetime_utc
#   Step 3: get all energy data since the latest start_datetime_utc
#   Step 4: get carbon dioxide emission factor
#   Step 5: calculate carbon dioxide emission by multiplying energy with factor
#   Step 6: save carbon dioxide emission data to database
########################################################################################################################


def main(logger):

    while True:
        # the outermost while loop
        ################################################################################################################
        # Step 1: get all meters
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of meter_carbon " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and continue the outermost while loop
            time.sleep(60)
            continue

        print("Connected to MyEMS System Database")

        meter_list = list()
        try:
            cursor_system_db.execute(" SELECT id, name, energy_category_id, cost_center_id "
                                     " FROM tbl_meters "
                                     " ORDER BY id ")
            rows_meters = cursor_system_db.fetchall()

            if rows_meters is None or len(rows_meters) == 0:
                print("Step 1.2: There isn't any meters. ")
                if cursor_system_db:
                    cursor_system_db.close()
                if cnx_system_db:
                    cnx_system_db.close()
                # sleep and continue the outermost while loop
                time.sleep(60)
                continue

            for row in rows_meters:
                meter_list.append({"id": row[0],
                                   "name": row[1],
                                   "energy_category_id": row[2],
                                   "cost_center_id": row[3]})

        except Exception as e:
            logger.error("Error in step 1.2 of meter_carbon " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # sleep and continue the outermost while loop
            time.sleep(60)
            continue

        print("Step 1.2: Got all meters from MyEMS System Database")

        cnx_energy_db = None
        cursor_energy_db = None
        try:
            cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
            cursor_energy_db = cnx_energy_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.3 of meter_carbon " + str(e))
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

        cnx_carbon_db = None
        cursor_carbon_db = None
        try:
            cnx_carbon_db = mysql.connector.connect(**config.myems_carbon_db)
            cursor_carbon_db = cnx_carbon_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.4 of meter_carbon " + str(e))
            if cursor_carbon_db:
                cursor_carbon_db.close()
            if cnx_carbon_db:
                cnx_carbon_db.close()

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

        print("Connected to MyEMS Carbon Database")

        for meter in meter_list:

            ############################################################################################################
            # Step 2: get the latest start_datetime_utc
            ############################################################################################################
            print("Step 2: get the latest start_datetime_utc from carbon database for " + meter['name'])
            try:
                cursor_carbon_db.execute(" SELECT MAX(start_datetime_utc) "
                                         " FROM tbl_meter_hourly "
                                         " WHERE meter_id = %s ",
                                         (meter['id'], ))
                row_datetime = cursor_carbon_db.fetchone()
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
                logger.error("Error in step 2 of meter_carbon " + str(e))
                # break the for meter loop
                break

            ############################################################################################################
            # Step 3: get all energy data since the latest start_datetime_utc
            ############################################################################################################
            print("Step 3: get all energy data since the latest start_datetime_utc")
            try:
                query = (" SELECT start_datetime_utc, actual_value "
                         " FROM tbl_meter_hourly "
                         " WHERE meter_id = %s AND start_datetime_utc >= %s "
                         " ORDER BY id ")
                cursor_energy_db.execute(query, (meter['id'], start_datetime_utc, ))
                rows_hourly = cursor_energy_db.fetchall()

                if rows_hourly is None or len(rows_hourly) == 0:
                    print("Step 3: There isn't any energy input data to calculate. ")
                    # continue the for meter loop
                    continue

                energy_dict = dict()
                end_datetime_utc = start_datetime_utc
                for row_hourly in rows_hourly:
                    current_datetime_utc = row_hourly[0]
                    actual_value = row_hourly[1]
                    if energy_dict.get(current_datetime_utc) is None:
                        energy_dict[current_datetime_utc] = dict()
                    energy_dict[current_datetime_utc][meter['energy_category_id']] = actual_value
                    if current_datetime_utc > end_datetime_utc:
                        end_datetime_utc = current_datetime_utc
            except Exception as e:
                logger.error("Error in step 3 of meter_carbon " + str(e))
                # break the for meter loop
                break

            ############################################################################################################
            # Step 4: get carbon dioxide emission factor
            ############################################################################################################
            print("Step 4: get carbon dioxide emission factor")
            factor_dict = dict()
            factor_dict[meter['energy_category_id']] = \
                carbon_dioxide_emmision_factor.get_energy_category_factor(
                    meter['energy_category_id'],
                    start_datetime_utc,
                    end_datetime_utc)
            ############################################################################################################
            # Step 5: calculate carbon dioxide emission by multiplying energy with factor
            ############################################################################################################
            print("Step 5: calculate carbon dioxide emission by multiplying energy with factor")
            aggregated_values = list()
            if len(energy_dict) > 0:
                for current_datetime_utc in energy_dict.keys():
                    aggregated_value = dict()
                    aggregated_value['start_datetime_utc'] = current_datetime_utc
                    aggregated_value['actual_value'] = None
                    current_factor = factor_dict[meter['energy_category_id']]
                    current_energy = energy_dict[current_datetime_utc].get(meter['energy_category_id'])
                    if current_factor is not None \
                            and isinstance(current_factor, Decimal) \
                            and current_energy is not None \
                            and isinstance(current_energy, Decimal):
                        aggregated_value['actual_value'] = current_energy * current_factor
                        aggregated_values.append(aggregated_value)

            ############################################################################################################
            # Step 6: save carbon dioxide emission data to database
            ############################################################################################################
            print("Step 6: save carbon dioxide emission data to database")

            while len(aggregated_values) > 0:
                insert_100 = aggregated_values[:100]
                aggregated_values = aggregated_values[100:]
                try:
                    add_values = (" INSERT INTO tbl_meter_hourly "
                                  "             (meter_id, "
                                  "              start_datetime_utc, "
                                  "              actual_value) "
                                  " VALUES  ")
                    for aggregated_value in insert_100:
                        if aggregated_value['actual_value'] is not None and \
                                isinstance(aggregated_value['actual_value'], Decimal):
                            add_values += " (" + str(meter['id']) + ","
                            add_values += "'" + aggregated_value['start_datetime_utc'].isoformat()[0:19] + "',"
                            add_values += str(aggregated_value['actual_value']) + "), "
                    # print("add_values:" + add_values)
                    # trim ", " at the end of string and then execute
                    cursor_carbon_db.execute(add_values[:-2])
                    cnx_carbon_db.commit()
                except Exception as e:
                    logger.error("Error in step 6 of meter_carbon " + str(e))
                    break

        # end of for meter loop
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()

        if cursor_carbon_db:
            cursor_carbon_db.close()
        if cnx_carbon_db:
            cnx_carbon_db.close()
        print("go to sleep 300 seconds...")
        time.sleep(300)
        print("wake from sleep, and continue to work...")
    # end of the outermost while loop
