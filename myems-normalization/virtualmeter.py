"""
MyEMS Normalization Service - Virtual Meter Processing Module

This module handles the calculation of virtual meter values using mathematical expressions.
Virtual meters are computed meters that derive their values from combinations of other meters
(physical meters, other virtual meters, and offline meters) using algebraic equations.

The virtual meter processing performs the following functions:
1. Retrieves all virtual meters and their mathematical equations from the system database
2. Uses multiprocessing to process virtual meters in parallel for efficiency
3. Parses mathematical expressions and identifies dependent meters
4. Retrieves energy consumption data from dependent meters
5. Evaluates mathematical expressions using SymPy library
6. Stores calculated virtual meter values in the energy database

Key features:
- Supports complex mathematical expressions with multiple variables
- Handles different meter types (physical, virtual, offline) in expressions
- Uses SymPy for robust mathematical expression evaluation
- Maintains data integrity through comprehensive error handling
"""

import random
import time
from datetime import datetime, timedelta
from decimal import Decimal
from multiprocessing import Pool
import mysql.connector
from sympy import sympify
import config


########################################################################################################################
# Virtual Meter Calculation Procedures:
# Step 1: Query all virtual meters and their mathematical equations from system database
# Step 2: Create multiprocessing pool to call worker processes in parallel
########################################################################################################################

def calculate_hourly(logger):
    """
    Main function for virtual meter calculation using mathematical expressions.

    This function runs continuously, retrieving all virtual meters from the system database
    and processing them in parallel to calculate virtual meter values using their
    configured mathematical equations.

    Args:
        logger: Logger instance for recording calculation activities and errors
    """
    while True:
        # The outermost while loop to reconnect to server if there is a connection error
        cnx_system_db = None
        cursor_system_db = None

        # Connect to system database to retrieve virtual meter configuration
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 0 of virtual_meter.calculate_hourly " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue

        print("Connected to MyEMS System Database")

        # Retrieve all virtual meters with their mathematical equations
        virtual_meter_list = list()
        try:
            cursor_system_db.execute(" SELECT id, name, equation "
                                     " FROM tbl_virtual_meters "
                                     " ORDER BY id ")
            rows_virtual_meters = cursor_system_db.fetchall()

            # Check if virtual meters were found
            if rows_virtual_meters is None or len(rows_virtual_meters) == 0:
                # Sleep several minutes and continue the outer loop to reconnect the database
                time.sleep(60)
                continue

            # Build virtual meter list with equation data
            for row in rows_virtual_meters:
                meta_result = {"id": row[0], "name": row[1], "equation": row[2]}
                virtual_meter_list.append(meta_result)

        except Exception as e:
            logger.error("Error in step 1 of virtual meter calculate hourly " + str(e))
            # Sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue
        finally:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        # Shuffle the virtual meter list for randomly calculating the meter hourly values
        # This helps distribute processing load evenly across time
        random.shuffle(virtual_meter_list)

        print("Got all virtual meters in MyEMS System Database")
        ################################################################################################################
        # Step 2: Create multiprocessing pool to call worker processes in parallel
        ################################################################################################################
        # Create process pool with configured size for parallel processing
        p = Pool(processes=config.pool_size)
        error_list = p.map(worker, virtual_meter_list)
        p.close()
        p.join()

        # Log any errors from worker processes
        for error in error_list:
            if error is not None and len(error) > 0:
                logger.error(error)

        print("go to sleep ...")
        time.sleep(60)  # Sleep for 1 minute before next processing cycle
        print("wake from sleep, and continue to work...")


########################################################################################################################
# Worker Process Procedures for Individual Virtual Meter Processing:
# Step 1: Get start datetime and end datetime for processing
# Step 2: Parse the expression and get all meters, virtual meters, offline meters associated with the expression
# Step 3: Query energy consumption values from table meter hourly, virtual meter hourly and offline meter hourly
# Step 4: Evaluate the equation with variable values from previous step and save to table virtual meter hourly
# Returns the error string for logging or returns None on success
########################################################################################################################

def worker(virtual_meter):
    """
    Worker function to process a single virtual meter's calculation.

    This function processes one virtual meter at a time, evaluating its mathematical
    expression using data from dependent meters and storing the calculated results.

    Args:
        virtual_meter: Dictionary containing virtual meter configuration (id, name, equation)

    Returns:
        None on success, error string on failure
    """
    cnx_energy_db = None
    cursor_energy_db = None

    # Connect to energy database to check existing processed data
    try:
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()
    except Exception as e:
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return "Error in step 1.1 of virtual meter worker " + str(e) + " for '" + virtual_meter['name'] + "'"

    print("Start to process virtual meter: " + "'" + virtual_meter['name']+"'")

    ####################################################################################################################
    # Step 1: Get start datetime and end datetime for processing
    # Get latest timestamp from energy database in tbl_virtual_meter_hourly
    ####################################################################################################################

    # Check for existing processed data to determine where to continue
    try:
        query = (" SELECT MAX(start_datetime_utc) "
                 " FROM tbl_virtual_meter_hourly "
                 " WHERE virtual_meter_id = %s ")
        cursor_energy_db.execute(query, (virtual_meter['id'],))
        row_datetime = cursor_energy_db.fetchone()
    except Exception as e:
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return "Error in step 1.2 of virtual meter worker " + str(e) + " for '" + virtual_meter['name'] + "'"

    # Get initial start datetime from configuration
    start_datetime_utc = datetime.strptime(config.start_datetime_utc, '%Y-%m-%d %H:%M:%S')
    start_datetime_utc = start_datetime_utc.replace(minute=0, second=0, microsecond=0, tzinfo=None)

    # Update start datetime if existing processed data is found
    if row_datetime is not None and len(row_datetime) > 0 and isinstance(row_datetime[0], datetime):
        # Replace second and microsecond with 0
        # Note: Do not replace minute in case of calculating in half hourly
        start_datetime_utc = row_datetime[0].replace(second=0, microsecond=0, tzinfo=None)
        # Start from the next time slot
        start_datetime_utc += timedelta(minutes=config.minutes_to_count)

    # Calculate end datetime
    end_datetime_utc = datetime.utcnow().replace()
    end_datetime_utc = end_datetime_utc.replace(second=0, microsecond=0, tzinfo=None)

    # Validate time difference and limit processing to one month maximum
    time_difference = end_datetime_utc - start_datetime_utc
    time_difference_in_minutes = time_difference / timedelta(minutes=1)
    if time_difference_in_minutes < config.minutes_to_count:
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return "it isn't time to calculate" + " for '" + virtual_meter['name'] + "'"
    elif time_difference_in_minutes > 60 * 24 * 30:
        # Avoid calculating records more than one month to prevent excessive processing
        end_datetime_utc = start_datetime_utc + timedelta(minutes=60 * 24 * 30)

    # Trim end_datetime_utc to align with processing intervals
    trimmed_end_datetime_utc = start_datetime_utc + timedelta(minutes=config.minutes_to_count)
    while trimmed_end_datetime_utc <= end_datetime_utc:
        trimmed_end_datetime_utc += timedelta(minutes=config.minutes_to_count)

    end_datetime_utc = trimmed_end_datetime_utc - timedelta(minutes=config.minutes_to_count)

    # Final validation of datetime range
    if end_datetime_utc <= start_datetime_utc:
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return "it isn't time to calculate" + " for '" + virtual_meter['name'] + "'"

    print("start_datetime_utc: " + start_datetime_utc.isoformat()[0:19]
          + "end_datetime_utc: " + end_datetime_utc.isoformat()[0:19])

    ############################################################################################################
    # Step 2: Parse the expression and get all meters, virtual meters, and offline meters associated with the expression
    ############################################################################################################
    cnx_system_db = None
    cursor_system_db = None

    # Connect to system database to retrieve dependent meter information
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return "Error in step 2.1 of virtual meter worker " + str(e) + " for '" + virtual_meter['name'] + "'"

    # Initialize lists to store dependent meters
    meter_list_in_expression = list()
    virtual_meter_list_in_expression = list()
    offline_meter_list_in_expression = list()

    try:
        ########################################################################################################
        # Get all physical meters associated with the expression
        ########################################################################################################

        cursor_system_db.execute(" SELECT m.id as meter_id, v.name as variable_name "
                                 " FROM tbl_meters m, tbl_variables v "
                                 " WHERE m.id = v.meter_id "
                                 "       AND v.meter_type = 'meter' "
                                 "       AND v.virtual_meter_id = %s ",
                                 (virtual_meter['id'], ))
        rows = cursor_system_db.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                meter_list_in_expression.append({"meter_id": row[0], "variable_name": row[1].lower()})

        ########################################################################################################
        # Get all virtual meters associated with the expression
        ########################################################################################################

        cursor_system_db.execute(" SELECT m.id as virtual_meter_id, v.name as variable_name "
                                 " FROM tbl_virtual_meters m, tbl_variables v "
                                 " WHERE m.id = v.meter_id "
                                 "       AND v.meter_type = 'virtual_meter' "
                                 "       AND v.virtual_meter_id = %s ",
                                 (virtual_meter['id'],))
        rows = cursor_system_db.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                virtual_meter_list_in_expression.append({"virtual_meter_id": row[0],
                                                         "variable_name": row[1].lower()})

        ########################################################################################################
        # Get all offline meters associated with the expression
        ########################################################################################################

        cursor_system_db.execute(" SELECT m.id as offline_meter_id, v.name as variable_name "
                                 " FROM tbl_offline_meters m, tbl_variables v "
                                 " WHERE m.id = v.meter_id "
                                 "       AND v.meter_type = 'offline_meter' "
                                 "       AND v.virtual_meter_id = %s ",
                                 (virtual_meter['id'],))
        rows = cursor_system_db.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                offline_meter_list_in_expression.append({"offline_meter_id": row[0],
                                                         "variable_name": row[1].lower()})
    except Exception as e:
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return "Error in step 2.2 of virtual meter worker " + str(e) + " for '" + virtual_meter['name'] + "'"
    finally:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

    ############################################################################################################
    # Step 3: Query energy consumption values from table meter hourly, virtual meter hourly and offline meter hourly
    ############################################################################################################

    # Retrieve energy consumption data from physical meters
    print("getting energy consumption values from myems_energy_db.tbl_meter_hourly...")
    energy_meter_hourly = dict()
    if meter_list_in_expression is not None and len(meter_list_in_expression) > 0:
        try:
            for meter_in_expression in meter_list_in_expression:
                meter_id = str(meter_in_expression['meter_id'])
                query = (" SELECT start_datetime_utc, actual_value "
                         " FROM tbl_meter_hourly "
                         " WHERE meter_id = %s AND start_datetime_utc >= %s AND start_datetime_utc < %s "
                         " ORDER BY start_datetime_utc ")
                cursor_energy_db.execute(query, (meter_id, start_datetime_utc, end_datetime_utc, ))
                rows_energy_values = cursor_energy_db.fetchall()
                if rows_energy_values is None or len(rows_energy_values) == 0:
                    energy_meter_hourly[meter_id] = None
                else:
                    energy_meter_hourly[meter_id] = dict()
                    for row_energy_value in rows_energy_values:
                        energy_meter_hourly[meter_id][row_energy_value[0]] = row_energy_value[1]
        except Exception as e:
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            return "Error in step 3.2 virtual meter worker " + str(e) + " for '" + virtual_meter['name'] + "'"

    # Retrieve energy consumption data from other virtual meters
    print("getting energy consumption values from myems_energy_db.tbl_virtual_meter_hourly...")
    energy_virtual_meter_hourly = dict()
    if virtual_meter_list_in_expression is not None and len(virtual_meter_list_in_expression) > 0:
        try:
            for virtual_meter_in_expression in virtual_meter_list_in_expression:
                virtual_meter_id = str(virtual_meter_in_expression['virtual_meter_id'])
                query = (" SELECT start_datetime_utc, actual_value "
                         " FROM tbl_virtual_meter_hourly "
                         " WHERE virtual_meter_id = %s "
                         "       AND start_datetime_utc >= %s AND start_datetime_utc < %s "
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
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            return "Error in step 3.3 virtual meter worker " + str(e) + " for '" + virtual_meter['name'] + "'"

    # Retrieve energy consumption data from offline meters
    print("getting energy consumption values from myems_energy_db.tbl_offline_meter_hourly...")
    energy_offline_meter_hourly = dict()
    if offline_meter_list_in_expression is not None and len(offline_meter_list_in_expression) > 0:
        try:
            for offline_meter_in_expression in offline_meter_list_in_expression:
                offline_meter_id = str(offline_meter_in_expression['offline_meter_id'])
                query = (" SELECT start_datetime_utc, actual_value "
                         " FROM tbl_offline_meter_hourly "
                         " WHERE offline_meter_id = %s "
                         "       AND start_datetime_utc >= %s AND start_datetime_utc < %s "
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
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            return "Error in step 3.4 virtual meter worker " + str(e) + " for '" + virtual_meter['name'] + "'"

    ############################################################################################################
    # Step 4: evaluate the equation with variables values from previous step
    #         and save to table virtual meter hourly
    ############################################################################################################

    # Find common time slot where all dependent meters have data available
    print("getting common time slot of energy values for all meters...")
    common_start_datetime_utc = start_datetime_utc
    common_end_datetime_utc = end_datetime_utc

    # Adjust time range based on physical meter data availability
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

    # Adjust time range based on virtual meter data availability
    print("getting common time slot of energy values for all virtual meters...")
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

    # Adjust time range based on offline meter data availability
    print("getting common time slot of energy values for all offline meters...")
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

    # Evaluate the mathematical expression using SymPy
    print("evaluating the equation with SymPy...")
    normalized_values = list()

    ############################################################################################################
    # Converting Strings to SymPy Expressions
    # The sympify function (that's sympify, not to be confused with simplify) can be used to
    # convert strings into SymPy expressions.
    ############################################################################################################
    try:
        # Parse the mathematical expression from the virtual meter equation
        expr = sympify(virtual_meter['equation'].lower())
        print("the expression to be evaluated: " + str(expr))
        current_datetime_utc = common_start_datetime_utc
        print("common_start_datetime_utc: " + str(common_start_datetime_utc))
        print("common_end_datetime_utc: " + str(common_end_datetime_utc))

        # Process each time slot within the common time range
        while common_start_datetime_utc is not None \
                and common_end_datetime_utc is not None \
                and current_datetime_utc <= common_end_datetime_utc:
            meta_data = dict()
            meta_data['start_datetime_utc'] = current_datetime_utc

            ####################################################################################################
            # Create a dictionary of Symbol: point pairs for variable substitution
            ####################################################################################################

            subs = dict()

            ####################################################################################################
            # Evaluating the expression at current_datetime_utc
            ####################################################################################################

            # Substitute physical meter values into the expression
            if meter_list_in_expression is not None and len(meter_list_in_expression) > 0:
                for meter_in_expression in meter_list_in_expression:
                    meter_id = str(meter_in_expression['meter_id'])
                    actual_value = energy_meter_hourly[meter_id].get(current_datetime_utc, Decimal(0.0))
                    subs[meter_in_expression['variable_name']] = actual_value

            # Substitute virtual meter values into the expression
            if virtual_meter_list_in_expression is not None and len(virtual_meter_list_in_expression) > 0:
                for virtual_meter_in_expression in virtual_meter_list_in_expression:
                    virtual_meter_id = str(virtual_meter_in_expression['virtual_meter_id'])
                    actual_value = energy_virtual_meter_hourly[virtual_meter_id].get(current_datetime_utc, Decimal(0.0))
                    subs[virtual_meter_in_expression['variable_name']] = actual_value

            # Substitute offline meter values into the expression
            if offline_meter_list_in_expression is not None and len(offline_meter_list_in_expression) > 0:
                for offline_meter_in_expression in offline_meter_list_in_expression:
                    offline_meter_id = str(offline_meter_in_expression['offline_meter_id'])
                    actual_value = energy_offline_meter_hourly[offline_meter_id].get(current_datetime_utc, Decimal(0.0))
                    subs[offline_meter_in_expression['variable_name']] = actual_value

            ####################################################################################################
            # To numerically evaluate an expression with a Symbol at a point,
            # we might use subs followed by evalf,
            # but it is more efficient and numerically stable to pass the substitution to evalf
            # using the subs flag, which takes a dictionary of Symbol: point pairs.
            ####################################################################################################

            # Evaluate the mathematical expression with current variable values
            meta_data['actual_value'] = expr.evalf(subs=subs)

            normalized_values.append(meta_data)

            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    except Exception as e:
        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()
        return "Error in step 4.1 virtual meter worker " + str(e) + " for '" + virtual_meter['name'] + "'"

    # Save calculated virtual meter values to the energy database
    print("saving energy values to table energy virtual meter hourly...")

    # Process calculated values in batches of 100 to avoid overwhelming the database
    while len(normalized_values) > 0:
        insert_100 = normalized_values[:100]  # Take first 100 items
        normalized_values = normalized_values[100:]  # Remove processed items

        try:
            # Build INSERT statement for virtual meter hourly data
            add_values = (" INSERT INTO tbl_virtual_meter_hourly "
                          " (virtual_meter_id, start_datetime_utc, actual_value) "
                          " VALUES  ")

            # Add each calculated value to the INSERT statement
            for meta_data in insert_100:
                add_values += " (" + str(virtual_meter['id']) + ","
                add_values += "'" + meta_data['start_datetime_utc'].isoformat()[0:19] + "',"
                add_values += str(meta_data['actual_value']) + "), "
            print("add_values:" + add_values)
            # Trim ", " at the end of string and then execute
            cursor_energy_db.execute(add_values[:-2])
            cnx_energy_db.commit()
        except Exception as e:
            if cursor_energy_db:
                cursor_energy_db.close()
            if cnx_energy_db:
                cnx_energy_db.close()
            return "Error in step 4.2 virtual meter worker " + str(e) + " for '" + virtual_meter['name'] + "'"

    # Clean up database connections
    if cursor_energy_db:
        cursor_energy_db.close()
    if cnx_energy_db:
        cnx_energy_db.close()

    return None
