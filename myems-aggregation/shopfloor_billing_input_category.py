"""
MyEMS Shopfloor Billing Input Category Aggregation

This module handles billing calculations for shopfloors based on energy input consumption
and tariff structures, aggregated by energy categories. It processes energy consumption
data from the energy database and applies time-of-use tariffs to calculate billing costs.

The module performs the following main functions:
1. Retrieves all shopfloors from the system database
2. For each shopfloor, determines the latest processed billing data
3. Fetches energy input consumption data since the last processed time
4. Retrieves applicable tariffs for each energy category
5. Calculates billing by multiplying energy consumption with tariffs
6. Saves the calculated billing data to the billing database

The billing calculation supports time-of-use tariffs and handles multiple energy
categories per shopfloor. The process runs continuously, processing new data
every 5 minutes.

Author: MyEMS
Date: 2024
"""

import time
from datetime import datetime, timedelta
from decimal import Decimal

import mysql.connector

import config
import tariff


########################################################################################################################
# PROCEDURES
# Step 1: get all shopfloors
# for each shopfloor in list:
#   Step 2: get the latest start_datetime_utc
#   Step 3: get all energy input data since the latest start_datetime_utc
#   Step 4: get tariffs
#   Step 5: calculate billing by multiplying energy with tariff
#   Step 6: save billing data to database
########################################################################################################################


def main(logger):
    """
    Main function for shopfloor billing input category aggregation.

    This function runs continuously and processes billing calculations for all shopfloors.
    It handles database connections, retrieves shopfloor data, processes energy consumption,
    applies tariffs, and saves billing results.

    Args:
        logger: Logger object for recording activities and errors

    The function runs in an infinite loop, processing data every 5 minutes.
    """

    while True:
        # Main processing loop - runs continuously
        ################################################################################################################
        # Step 1: get all shopfloors
        ################################################################################################################
        # Initialize database connections
        cnx_system_db = None
        cursor_system_db = None
        try:
            # Connect to MyEMS System Database to retrieve shopfloor information
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of shopfloor_billing_input_category " + str(e))
            # Clean up database connections on error
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and retry after error
            time.sleep(60)
            continue

        print("Connected to MyEMS System Database")

        # Retrieve all shopfloors from the system database
        shopfloor_list = list()
        try:
            # Query all shopfloors with their cost center information
            cursor_system_db.execute(" SELECT id, name, cost_center_id "
                                     " FROM tbl_shopfloors "
                                     " ORDER BY id ")
            rows_shopfloors = cursor_system_db.fetchall()

            if rows_shopfloors is None or len(rows_shopfloors) == 0:
                print("Step 1.2: There isn't any shopfloors. ")
                # Clean up connections if no shopfloors found
                if cursor_system_db:
                    cursor_system_db.close()
                if cnx_system_db:
                    cnx_system_db.close()
                # Sleep and retry
                time.sleep(60)
                continue

            # Build shopfloor list with required information
            for row in rows_shopfloors:
                shopfloor_list.append({"id": row[0], "name": row[1], "cost_center_id": row[2]})

        except Exception as e:
            logger.error("Error in step 1.2 of shopfloor_billing_input_category " + str(e))
            # Clean up database connections on error
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and retry after error
            time.sleep(60)
            continue

        print("Step 1.2: Got all shopfloors from MyEMS System Database")

        # Connect to MyEMS Energy Database to retrieve energy consumption data
        cnx_energy_db = None
        cursor_energy_db = None
        try:
            cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
            cursor_energy_db = cnx_energy_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.3 of shopfloor_billing_input_category " + str(e))
            # Clean up energy database connections on error
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            # Clean up system database connections
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and retry after error
            time.sleep(60)
            continue

        print("Connected to MyEMS Energy Database")

        # Connect to MyEMS Billing Database to save calculated billing data
        cnx_billing_db = None
        cursor_billing_db = None
        try:
            cnx_billing_db = mysql.connector.connect(**config.myems_billing_db)
            cursor_billing_db = cnx_billing_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.4 of shopfloor_billing_input_category " + str(e))
            # Clean up billing database connections on error
            if cursor_billing_db:
                cursor_billing_db.close()
            if cnx_billing_db:
                cnx_billing_db.close()
            # Clean up energy database connections
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            # Clean up system database connections
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and retry after error
            time.sleep(60)
            continue

        print("Connected to MyEMS Billing Database")

        # Process each shopfloor for billing calculations
        for shopfloor in shopfloor_list:

            ############################################################################################################
            # Step 2: get the latest start_datetime_utc
            ############################################################################################################
            print("Step 2: get the latest start_datetime_utc from billing database for " + shopfloor['name'])
            try:
                # Query the latest processed billing data timestamp for this shopfloor
                cursor_billing_db.execute(" SELECT MAX(start_datetime_utc) "
                                          " FROM tbl_shopfloor_input_category_hourly "
                                          " WHERE shopfloor_id = %s ",
                                          (shopfloor['id'], ))
                row_datetime = cursor_billing_db.fetchone()

                # Initialize start datetime from configuration
                start_datetime_utc = datetime.strptime(config.start_datetime_utc, '%Y-%m-%d %H:%M:%S')
                start_datetime_utc = start_datetime_utc.replace(minute=0, second=0, microsecond=0, tzinfo=None)

                if row_datetime is not None and len(row_datetime) > 0 and isinstance(row_datetime[0], datetime):
                    # Use the latest processed timestamp as starting point
                    # Replace second and microsecond with 0 for consistency
                    # Note: do not replace minute in case of calculating in half hourly
                    start_datetime_utc = row_datetime[0].replace(second=0, microsecond=0, tzinfo=None)
                    # Start from the next time slot to avoid duplicate processing
                    start_datetime_utc += timedelta(minutes=config.minutes_to_count)

                print("start_datetime_utc: " + start_datetime_utc.isoformat()[0:19])
            except Exception as e:
                logger.error("Error in step 2 of shopfloor_billing_input_category " + str(e))
                # Break the shopfloor processing loop on error
                break

            ############################################################################################################
            # Step 3: get all energy input data since the latest start_datetime_utc
            ############################################################################################################
            print("Step 3: get all energy input data since the latest start_datetime_utc")

            # Query energy consumption data for this shopfloor since the last processed time
            query = (" SELECT start_datetime_utc, energy_category_id, actual_value "
                     " FROM tbl_shopfloor_input_category_hourly "
                     " WHERE shopfloor_id = %s AND start_datetime_utc >= %s "
                     " ORDER BY id ")
            cursor_energy_db.execute(query, (shopfloor['id'], start_datetime_utc, ))
            rows_hourly = cursor_energy_db.fetchall()

            if rows_hourly is None or len(rows_hourly) == 0:
                print("Step 3: There isn't any energy input data to calculate. ")
                # Continue to next shopfloor if no data available
                continue

            # Organize energy data by datetime and energy category
            energy_dict = dict()
            energy_category_list = list()
            end_datetime_utc = start_datetime_utc

            for row_hourly in rows_hourly:
                current_datetime_utc = row_hourly[0]
                energy_category_id = row_hourly[1]

                # Track unique energy categories
                if energy_category_id not in energy_category_list:
                    energy_category_list.append(energy_category_id)

                # Store energy consumption data by datetime and category
                actual_value = row_hourly[2]
                if energy_dict.get(current_datetime_utc) is None:
                    energy_dict[current_datetime_utc] = dict()
                energy_dict[current_datetime_utc][energy_category_id] = actual_value

                # Track the latest datetime for tariff retrieval
                if current_datetime_utc > end_datetime_utc:
                    end_datetime_utc = current_datetime_utc

            ############################################################################################################
            # Step 4: get tariffs
            ############################################################################################################
            print("Step 4: get tariffs")
            # Retrieve tariffs for each energy category and time period
            tariff_dict = dict()
            for energy_category_id in energy_category_list:
                tariff_dict[energy_category_id] = tariff.get_energy_category_tariffs(shopfloor['cost_center_id'],
                                                                                     energy_category_id,
                                                                                     start_datetime_utc,
                                                                                     end_datetime_utc)
            ############################################################################################################
            # Step 5: calculate billing by multiplying energy with tariff
            ############################################################################################################
            print("Step 5: calculate billing by multiplying energy with tariff")
            billing_dict = dict()

            if len(energy_dict) > 0:
                # Calculate billing for each time slot and energy category
                for current_datetime_utc in energy_dict.keys():
                    billing_dict[current_datetime_utc] = dict()
                    for energy_category_id in energy_category_list:
                        # Get tariff and energy consumption for current time slot
                        current_tariff = tariff_dict[energy_category_id].get(current_datetime_utc)
                        current_energy = energy_dict[current_datetime_utc].get(energy_category_id)

                        # Calculate billing if both tariff and energy data are available
                        if current_tariff is not None \
                                and isinstance(current_tariff, Decimal) \
                                and current_energy is not None \
                                and isinstance(current_energy, Decimal):
                            billing_dict[current_datetime_utc][energy_category_id] = \
                                current_energy * current_tariff

                    # Remove empty time slots from billing dictionary
                    if len(billing_dict[current_datetime_utc]) == 0:
                        del billing_dict[current_datetime_utc]

            ############################################################################################################
            # Step 6: save billing data to billing database
            ############################################################################################################
            print("Step 6: save billing data to billing database")

            if len(billing_dict) > 0:
                try:
                    # Prepare bulk insert statement for billing data
                    add_values = (" INSERT INTO tbl_shopfloor_input_category_hourly "
                                  "             (shopfloor_id, "
                                  "              energy_category_id, "
                                  "              start_datetime_utc, "
                                  "              actual_value) "
                                  " VALUES  ")

                    # Build values string for bulk insert
                    for current_datetime_utc in billing_dict:
                        for energy_category_id in energy_category_list:
                            current_billing = billing_dict[current_datetime_utc].get(energy_category_id)
                            if current_billing is not None and isinstance(current_billing, Decimal):
                                add_values += " (" + str(shopfloor['id']) + ","
                                add_values += " " + str(energy_category_id) + ","
                                add_values += "'" + current_datetime_utc.isoformat()[0:19] + "',"
                                add_values += str(billing_dict[current_datetime_utc][energy_category_id]) + "), "

                    # Execute bulk insert (trim trailing ", " before execution)
                    cursor_billing_db.execute(add_values[:-2])
                    cnx_billing_db.commit()
                except Exception as e:
                    logger.error("Error in step 6 of shopfloor_billing_input_category " + str(e))
                    # Break the shopfloor processing loop on error
                    break

        # End of shopfloor processing loop - clean up database connections
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()

        if cursor_billing_db:
            cursor_billing_db.close()
        if cnx_billing_db:
            cnx_billing_db.close()

        # Sleep for 5 minutes before next processing cycle
        print("go to sleep 300 seconds...")
        time.sleep(300)
        print("wake from sleep, and continue to work...")
    # End of main processing loop
