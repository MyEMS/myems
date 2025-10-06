"""
MyEMS Tenant Carbon Input Category Aggregation Service

This module handles the calculation of carbon dioxide emissions for tenants based on energy input consumption
and emission factors. It processes energy consumption data from various sources associated with
each tenant and calculates the corresponding carbon dioxide emissions using emission factors.

The service follows a systematic approach:
1. Retrieves all tenants from the system database
2. For each tenant, determines the latest processed carbon emissions data timestamp
3. Fetches energy input consumption data since the last processed timestamp
4. Retrieves applicable emission factors for the energy categories
5. Calculates carbon dioxide emissions by multiplying energy consumption with emission factors
6. Saves the calculated carbon emissions data to the carbon database

This service runs continuously, processing new energy data as it becomes available and
ensuring accurate carbon footprint calculations for all tenants in the system.
"""

import time
from datetime import datetime, timedelta
from decimal import Decimal

import mysql.connector

import carbon_dioxide_emmision_factor
import config


########################################################################################################################
# PROCEDURES
# Step 1: get all tenants
# for each tenant in list:
#   Step 2: get the latest start_datetime_utc
#   Step 3: get all energy input data since the latest start_datetime_utc
#   Step 4: get carbon dioxide emissions factor
#   Step 5: calculate carbon dioxide emissions by multiplying energy with factor
#   Step 6: save carbon dioxide emissions data to database
########################################################################################################################


def main(logger):
    """
    Main function for tenant carbon input category aggregation service.

    This function runs continuously and processes carbon emissions calculations for all tenants
    based on energy input. It retrieves energy consumption data, applies emission factors, and
    calculates carbon dioxide emissions.

    Args:
        logger: Logger instance for recording activities and errors

    The function follows these steps:
    1. Connects to system, energy, and carbon databases
    2. Retrieves all tenants from the system database
    3. For each tenant, processes carbon emissions calculations for energy input
    4. Sleeps for 300 seconds before the next processing cycle
    """

    while True:
        # Main processing loop - runs continuously
        ################################################################################################################
        # Step 1: Get all tenants from system database
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None
        try:
            # Connect to MyEMS System Database
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of tenant_carbon_input_category " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and continue the main loop
            time.sleep(60)
            continue

        print("Connected to MyEMS System Database")

        # Retrieve all tenants from the system database
        tenant_list = list()
        try:
            cursor_system_db.execute(" SELECT id, name, cost_center_id "
                                     " FROM tbl_tenants "
                                     " ORDER BY id ")
            rows_tenants = cursor_system_db.fetchall()

            if rows_tenants is None or len(rows_tenants) == 0:
                print("Step 1.2: There isn't any tenants. ")
                if cursor_system_db:
                    cursor_system_db.close()
                if cnx_system_db:
                    cnx_system_db.close()
                # Sleep and continue the main loop
                time.sleep(60)
                continue

            # Build tenant list with id, name, and cost_center_id
            for row in rows_tenants:
                tenant_list.append({"id": row[0], "name": row[1], "cost_center_id": row[2]})

        except Exception as e:
            logger.error("Error in step 1.2 of tenant_carbon_input_category " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and continue the main loop
            time.sleep(60)
            continue

        print("Step 1.2: Got all tenants from MyEMS System Database")

        # Connect to MyEMS Energy Database
        cnx_energy_db = None
        cursor_energy_db = None
        try:
            cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
            cursor_energy_db = cnx_energy_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.3 of tenant_carbon_input_category " + str(e))
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()

            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and continue the main loop
            time.sleep(60)
            continue

        print("Connected to MyEMS Energy Database")

        # Connect to MyEMS Carbon Database
        cnx_carbon_db = None
        cursor_carbon_db = None
        try:
            cnx_carbon_db = mysql.connector.connect(**config.myems_carbon_db)
            cursor_carbon_db = cnx_carbon_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.4 of tenant_carbon_input_category " + str(e))
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
            # Sleep and continue the main loop
            time.sleep(60)
            continue

        print("Connected to MyEMS Carbon Database")

        for tenant in tenant_list:
            ############################################################################################################
            # Step 2: get the latest start_datetime_utc
            ############################################################################################################
            print("Step 2: get the latest start_datetime_utc from carbon database for " + tenant['name'])
            try:
                cursor_carbon_db.execute(" SELECT MAX(start_datetime_utc) "
                                         " FROM tbl_tenant_input_category_hourly "
                                         " WHERE tenant_id = %s ",
                                         (tenant['id'], ))
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
                logger.error("Error in step 2 of tenant_carbon_input_category " + str(e))
                # break the for tenant loop
                break

            ############################################################################################################
            # Step 3: get all energy input data since the latest start_datetime_utc
            ############################################################################################################
            print("Step 3: get all energy input data since the latest start_datetime_utc")

            query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                     " FROM tbl_tenant_input_category_hourly "
                     " WHERE tenant_id = %s AND start_datetime_utc >= %s "
                     " ORDER BY id ")
            cursor_energy_db.execute(query, (tenant['id'], start_datetime_utc, ))
            rows_hourly = cursor_energy_db.fetchall()

            if rows_hourly is None or len(rows_hourly) == 0:
                print("Step 3: There isn't any energy input data to calculate. ")
                # continue the for tenant loop
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
            # Step 4: get carbon dioxide emissions factor
            ############################################################################################################
            print("Step 4: get carbon dioxide emissions factor")
            factor_dict = dict()
            for energy_category_id in energy_category_list:
                factor_dict[energy_category_id] = \
                    carbon_dioxide_emmision_factor.get_energy_category_factor(
                        energy_category_id,
                        start_datetime_utc,
                        end_datetime_utc)
            ############################################################################################################
            # Step 5: calculate carbon dioxide emissions by multiplying energy with factor
            ############################################################################################################
            print("Step 5: calculate carbon dioxide emissions by multiplying energy with factor")
            carbon_dict = dict()

            if len(energy_dict) > 0:
                for current_datetime_utc in energy_dict.keys():
                    carbon_dict[current_datetime_utc] = dict()
                    for energy_category_id in energy_category_list:
                        current_factor = factor_dict[energy_category_id]
                        current_energy = energy_dict[current_datetime_utc].get(energy_category_id)
                        if current_factor is not None \
                                and isinstance(current_factor, Decimal) \
                                and current_energy is not None \
                                and isinstance(current_energy, Decimal):
                            carbon_dict[current_datetime_utc][energy_category_id] = \
                                current_energy * current_factor

                    if len(carbon_dict[current_datetime_utc]) == 0:
                        del carbon_dict[current_datetime_utc]

            ############################################################################################################
            # Step 6: save carbon dioxide emissions data to database
            ############################################################################################################
            print("Step 6: save carbon dioxide emissions data to database")

            if len(carbon_dict) > 0:
                try:
                    add_values = (" INSERT INTO tbl_tenant_input_category_hourly "
                                  "             (tenant_id, "
                                  "              energy_category_id, "
                                  "              start_datetime_utc, "
                                  "              actual_value) "
                                  " VALUES  ")

                    for current_datetime_utc in carbon_dict:
                        for energy_category_id in energy_category_list:
                            current_carbon = carbon_dict[current_datetime_utc].get(energy_category_id)
                            if current_carbon is not None and isinstance(current_carbon, Decimal):
                                add_values += " (" + str(tenant['id']) + ","
                                add_values += " " + str(energy_category_id) + ","
                                add_values += "'" + current_datetime_utc.isoformat()[0:19] + "',"
                                add_values += str(current_carbon) + "), "
                    # print("add_values:" + add_values)
                    # trim ", " at the end of string and then execute
                    cursor_carbon_db.execute(add_values[:-2])
                    cnx_carbon_db.commit()
                except Exception as e:
                    logger.error("Error in step 6 of tenant_carbon_input_category " + str(e))
                    # break the for tenant loop
                    break

        # end of for tenant loop
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
