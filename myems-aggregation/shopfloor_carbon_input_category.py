"""
MyEMS Shopfloor Carbon Input Category Aggregation

This module handles carbon dioxide emissions calculations for shopfloors based on energy input consumption
and emission factors, aggregated by energy categories. It processes energy consumption
data from the energy database and applies emission factors to calculate carbon footprint.

The module performs the following main functions:
1. Retrieves all shopfloors from the system database
2. For each shopfloor, determines the latest processed carbon emissions data
3. Fetches energy input consumption data since the last processed time
4. Retrieves applicable emission factors for each energy category
5. Calculates carbon dioxide emissions by multiplying energy consumption with emission factors
6. Saves the calculated carbon emissions data to the carbon database

The carbon emissions calculation supports time-varying emission factors and handles multiple energy
categories per shopfloor. The process runs continuously, processing new data
every 5 minutes.

Author: MyEMS
Date: 2024
"""

import time
from datetime import datetime, timedelta
from decimal import Decimal

import mysql.connector

import carbon_dioxide_emmision_factor
import config


########################################################################################################################
# PROCEDURES
# Step 1: get all shopfloors
# for each shopfloor in list:
#   Step 2: get the latest start_datetime_utc
#   Step 3: get all energy input data since the latest start_datetime_utc
#   Step 4: get carbon dioxide emissions factor
#   Step 5: calculate carbon dioxide emissions by multiplying energy with factor
#   Step 6: save carbon dioxide emissions data to database
########################################################################################################################


def main(logger):
    """
    Main function for shopfloor carbon input category aggregation.

    This function runs continuously and processes carbon emissions calculations for all shopfloors.
    It handles database connections, retrieves shopfloor data, processes energy consumption,
    applies emission factors, and saves carbon emissions results.

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
            logger.error("Error in step 1.1 of shopfloor_carbon_input_category " + str(e))
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
            logger.error("Error in step 1.2 of shopfloor_carbon_input_category " + str(e))
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
            logger.error("Error in step 1.3 of shopfloor_carbon_input_category " + str(e))
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

        # Connect to MyEMS Carbon Database to save calculated carbon emissions data
        cnx_carbon_db = None
        cursor_carbon_db = None
        try:
            cnx_carbon_db = mysql.connector.connect(**config.myems_carbon_db)
            cursor_carbon_db = cnx_carbon_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.4 of shopfloor_carbon_input_category " + str(e))
            # Clean up carbon database connections on error
            if cursor_carbon_db:
                cursor_carbon_db.close()
            if cnx_carbon_db:
                cnx_carbon_db.close()
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

        print("Connected to MyEMS Carbon Database")

        # Process each shopfloor for carbon emissions calculations
        for shopfloor in shopfloor_list:

            ############################################################################################################
            # Step 2: get the latest start_datetime_utc
            ############################################################################################################
            print("Step 2: get the latest start_datetime_utc from carbon database for " + shopfloor['name'])
            try:
                # Query the latest processed carbon emissions data timestamp for this shopfloor
                cursor_carbon_db.execute(" SELECT MAX(start_datetime_utc) "
                                         " FROM tbl_shopfloor_input_category_hourly "
                                         " WHERE shopfloor_id = %s ",
                                         (shopfloor['id'], ))
                row_datetime = cursor_carbon_db.fetchone()

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
                logger.error("Error in step 2 of shopfloor_carbon_input_category " + str(e))
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

                # Track the latest datetime for emission factor retrieval
                if current_datetime_utc > end_datetime_utc:
                    end_datetime_utc = current_datetime_utc

            ############################################################################################################
            # Step 4: get carbon dioxide emissions factor
            ############################################################################################################
            print("Step 4: get carbon dioxide emissions factor")
            # Retrieve emission factors for each energy category and time period
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
                # Calculate carbon emissions for each time slot and energy category
                for current_datetime_utc in energy_dict.keys():
                    carbon_dict[current_datetime_utc] = dict()
                    for energy_category_id in energy_category_list:
                        # Get emission factor and energy consumption for current time slot
                        current_factor = factor_dict[energy_category_id]
                        current_energy = energy_dict[current_datetime_utc].get(energy_category_id)

                        # Calculate carbon emissions if both factor and energy data are available
                        if current_factor is not None \
                                and isinstance(current_factor, Decimal) \
                                and current_energy is not None \
                                and isinstance(current_energy, Decimal):
                            carbon_dict[current_datetime_utc][energy_category_id] = \
                                current_energy * current_factor

                    # Remove empty time slots from carbon dictionary
                    if len(carbon_dict[current_datetime_utc]) == 0:
                        del carbon_dict[current_datetime_utc]

            ############################################################################################################
            # Step 6: save carbon dioxide emissions data to database
            ############################################################################################################
            print("Step 6: save carbon dioxide emissions data to database")

            if len(carbon_dict) > 0:
                try:
                    # Prepare bulk insert statement for carbon emissions data
                    add_values = (" INSERT INTO tbl_shopfloor_input_category_hourly "
                                  "             (shopfloor_id, "
                                  "              energy_category_id, "
                                  "              start_datetime_utc, "
                                  "              actual_value) "
                                  " VALUES  ")

                    # Build values string for bulk insert
                    for current_datetime_utc in carbon_dict:
                        for energy_category_id in energy_category_list:
                            current_carbon = carbon_dict[current_datetime_utc].get(energy_category_id)
                            if current_carbon is not None and isinstance(current_carbon, Decimal):
                                add_values += " (" + str(shopfloor['id']) + ","
                                add_values += " " + str(energy_category_id) + ","
                                add_values += "'" + current_datetime_utc.isoformat()[0:19] + "',"
                                add_values += str(current_carbon) + "), "

                    # Execute bulk insert (trim trailing ", " before execution)
                    cursor_carbon_db.execute(add_values[:-2])
                    cnx_carbon_db.commit()
                except Exception as e:
                    logger.error("Error in step 6 of shopfloor_carbon_input_category " + str(e))
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

        if cursor_carbon_db:
            cursor_carbon_db.close()
        if cnx_carbon_db:
            cnx_carbon_db.close()

        # Sleep for 5 minutes before next processing cycle
        print("go to sleep 300 seconds...")
        time.sleep(300)
        print("wake from sleep, and continue to work...")
    # End of main processing loop
