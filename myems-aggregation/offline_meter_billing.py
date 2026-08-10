"""
MyEMS Aggregation Service - Offline Meter Billing Module

This module handles billing calculations for offline meters based on energy consumption
and tariff structures. Offline meters are manually read meters that don't have real-time
data collection capabilities, but their consumption data is uploaded via Excel files.

The offline meter billing process performs the following functions:
1. Retrieves all offline meters from the system database
2. For each offline meter, determines the latest processed billing data
3. Fetches energy consumption data since the last processed time
4. Retrieves applicable tariffs for the meter's energy category and cost center
5. Calculates billing costs by multiplying energy consumption with tariff rates
6. Stores billing data in the billing database

Key features:
- Handles time-of-use pricing with different rates for different time periods
- Processes billing calculations for offline meters with manually uploaded data
- Supports incremental processing to avoid recalculating existing data
- Maintains data integrity through comprehensive error handling
"""

import time
from datetime import datetime, timedelta
from decimal import Decimal

import mysql.connector

import config
import tariff


########################################################################################################################
# Offline Meter Billing Calculation Procedures:
# Step 1: Get all offline meters from system database
# For each offline meter in list:
#   Step 2: Get the latest start_datetime_utc from billing database
#   Step 3: Get all energy data since the latest start_datetime_utc
#   Step 4: Get tariffs for the meter's energy category and cost center
#   Step 5: Calculate billing by multiplying energy consumption with tariff rates
#   Step 6: Save billing data to billing database
########################################################################################################################


def main(logger):
    """
    Main function for offline meter billing calculation.

    This function runs continuously, processing billing calculations for all offline meters.
    It retrieves energy consumption data from manually uploaded Excel files, applies tariff rates,
    and calculates billing costs for each offline meter based on their energy category and cost center.

    Args:
        logger: Logger instance for recording billing activities and errors
    """
    while True:
        # The outermost while loop to handle database connection errors and retry
        ################################################################################################################
        # Step 1: Get all offline meters from system database
        ################################################################################################################
        cnx_system_db = None
        cursor_system_db = None

        # Connect to system database to retrieve offline meter information
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.1 of offline_meter_billing " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and continue the outermost while loop to retry connection
            time.sleep(60)
            continue

        print("Connected to MyEMS System Database")

        # Retrieve all offline meters with their energy category and cost center information
        offline_meter_list = list()
        try:
            cursor_system_db.execute(" SELECT id, name, energy_category_id, cost_center_id "
                                     " FROM tbl_offline_meters "
                                     " ORDER BY id ")
            rows_offline_meters = cursor_system_db.fetchall()

            # Check if offline meters were found
            if rows_offline_meters is None or len(rows_offline_meters) == 0:
                print("Step 1.2: There isn't any offline meters. ")
                if cursor_system_db:
                    cursor_system_db.close()
                if cnx_system_db:
                    cnx_system_db.close()
                # Sleep and continue the outermost while loop
                time.sleep(60)
                continue

            # Build offline meter list with configuration data
            for row in rows_offline_meters:
                offline_meter_list.append({"id": row[0],
                                           "name": row[1],
                                           "energy_category_id": row[2],
                                           "cost_center_id": row[3]})

        except Exception as e:
            logger.error("Error in step 1.2 of offline_meter_billing " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and continue the outermost while loop
            time.sleep(60)
            continue

        print("Step 1.2: Got all offline_meters from MyEMS System Database")

        # Connect to energy database to retrieve energy consumption data
        cnx_energy_db = None
        cursor_energy_db = None
        try:
            cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
            cursor_energy_db = cnx_energy_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.3 of offline_meter_billing " + str(e))
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()

            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and continue the outermost while loop
            time.sleep(60)
            continue

        print("Connected to MyEMS Energy Database")

        # Connect to billing database to store calculated billing data
        cnx_billing_db = None
        cursor_billing_db = None
        try:
            cnx_billing_db = mysql.connector.connect(**config.myems_billing_db)
            cursor_billing_db = cnx_billing_db.cursor()
        except Exception as e:
            logger.error("Error in step 1.4 of offline_meter_billing " + str(e))
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
            # Sleep and continue the outermost while loop
            time.sleep(60)
            continue

        print("Connected to MyEMS Billing Database")

        # Process each offline meter for billing calculation
        for offline_meter in offline_meter_list:

            ############################################################################################################
            # Step 2: Get the latest start_datetime_utc from billing database
            ############################################################################################################
            print("Step 2: get the latest start_datetime_utc from billing database for " + offline_meter['name'])
            try:
                # Query for the latest processed billing data to determine where to continue
                cursor_billing_db.execute(" SELECT MAX(start_datetime_utc) "
                                          " FROM tbl_offline_meter_hourly "
                                          " WHERE offline_meter_id = %s ",
                                          (offline_meter['id'], ))
                row_datetime = cursor_billing_db.fetchone()

                # Initialize start datetime from configuration
                start_datetime_utc = datetime.strptime(config.start_datetime_utc, '%Y-%m-%d %H:%M:%S')
                start_datetime_utc = start_datetime_utc.replace(minute=0, second=0, microsecond=0, tzinfo=None)

                # Update start datetime if existing billing data is found
                if row_datetime is not None and len(row_datetime) > 0 and isinstance(row_datetime[0], datetime):
                    # Replace second and microsecond with 0
                    # Note: Do not replace minute in case of calculating in half hourly
                    start_datetime_utc = row_datetime[0].replace(second=0, microsecond=0, tzinfo=None)
                    # Start from the next time slot
                    start_datetime_utc += timedelta(minutes=config.minutes_to_count)

                print("start_datetime_utc: " + start_datetime_utc.isoformat()[0:19])
            except Exception as e:
                logger.error("Error in step 2 of offline_meter_billing " + str(e))
                # Break the for offline_meter loop
                break

            ############################################################################################################
            # Step 3: Get all energy data since the latest start_datetime_utc
            ############################################################################################################
            print("Step 3: get all energy data since the latest start_datetime_utc")
            try:
                # Query for energy consumption data from the energy database
                query = (" SELECT start_datetime_utc, actual_value "
                         " FROM tbl_offline_meter_hourly "
                         " WHERE offline_meter_id = %s AND start_datetime_utc >= %s "
                         " ORDER BY id ")
                cursor_energy_db.execute(query, (offline_meter['id'], start_datetime_utc, ))
                rows_hourly = cursor_energy_db.fetchall()

                # Check if energy data is available
                if rows_hourly is None or len(rows_hourly) == 0:
                    print("Step 3: There isn't any energy input data to calculate. ")
                    # Continue the for offline_meter loop
                    continue

                # Build energy consumption dictionary and determine end datetime
                energy_dict = dict()
                end_datetime_utc = start_datetime_utc
                for row_hourly in rows_hourly:
                    current_datetime_utc = row_hourly[0]
                    actual_value = row_hourly[1]
                    if energy_dict.get(current_datetime_utc) is None:
                        energy_dict[current_datetime_utc] = dict()
                    energy_dict[current_datetime_utc][offline_meter['energy_category_id']] = actual_value
                    if current_datetime_utc > end_datetime_utc:
                        end_datetime_utc = current_datetime_utc
            except Exception as e:
                logger.error("Error in step 3 of offline_meter_billing " + str(e))
                # Break the for offline_meter loop
                break

            ############################################################################################################
            # Step 4: Get tariffs for the offline meter's energy category and cost center
            ############################################################################################################
            print("Step 4: get tariffs")
            tariff_dict = dict()
            # Retrieve tariff information for the offline meter's energy category and cost center
            tariff_dict[offline_meter['energy_category_id']] = \
                tariff.get_energy_category_tariffs(offline_meter['cost_center_id'],
                                                   offline_meter['energy_category_id'],
                                                   start_datetime_utc,
                                                   end_datetime_utc)

            ############################################################################################################
            # Step 5: Calculate billing by multiplying energy consumption with tariff rates
            ############################################################################################################
            print("Step 5: calculate billing by multiplying energy with tariff")
            aggregated_values = list()

            # Calculate billing costs for each time slot
            if len(energy_dict) > 0:
                for current_datetime_utc in energy_dict.keys():
                    aggregated_value = dict()
                    aggregated_value['start_datetime_utc'] = current_datetime_utc
                    aggregated_value['actual_value'] = None

                    # Get tariff rate and energy consumption for current time slot
                    current_tariff = tariff_dict[offline_meter['energy_category_id']].get(current_datetime_utc)
                    current_energy = energy_dict[current_datetime_utc].get(offline_meter['energy_category_id'])

                    # Calculate billing cost if both tariff and energy data are available
                    if current_tariff is not None \
                            and isinstance(current_tariff, Decimal) \
                            and current_energy is not None \
                            and isinstance(current_energy, Decimal):
                        aggregated_value['actual_value'] = current_energy * current_tariff
                        aggregated_values.append(aggregated_value)

            ############################################################################################################
            # Step 6: Save billing data to billing database
            ############################################################################################################
            print("Step 6: save billing data to billing database")

            # Process calculated billing values in batches of 100 to avoid overwhelming the database
            while len(aggregated_values) > 0:
                insert_100 = aggregated_values[:100]  # Take first 100 items
                aggregated_values = aggregated_values[100:]  # Remove processed items

                try:
                    # Build INSERT statement for offline meter billing data
                    add_values = (" INSERT INTO tbl_offline_meter_hourly "
                                  "             (offline_meter_id, "
                                  "              start_datetime_utc, "
                                  "              actual_value) "
                                  " VALUES  ")

                    # Add each billing value to the INSERT statement
                    for aggregated_value in insert_100:
                        if aggregated_value['actual_value'] is not None and \
                                isinstance(aggregated_value['actual_value'], Decimal):
                            add_values += " (" + str(offline_meter['id']) + ","
                            add_values += "'" + aggregated_value['start_datetime_utc'].isoformat()[0:19] + "',"
                            add_values += str(aggregated_value['actual_value']) + "), "

                    # Trim ", " at the end of string and then execute
                    cursor_billing_db.execute(add_values[:-2])
                    cnx_billing_db.commit()
                except Exception as e:
                    logger.error("Error in step 6 of offline_meter_billing " + str(e))
                    break

        # End of for offline_meter loop - clean up database connections
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

        print("go to sleep 300 seconds...")
        time.sleep(300)  # Sleep for 5 minutes before next processing cycle
        print("wake from sleep, and continue to work...")
    # End of the outermost while loop
