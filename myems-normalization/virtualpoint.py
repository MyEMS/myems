"""
MyEMS Normalization Service - Virtual Point Processing Module

This module handles the calculation of virtual point values using mathematical expressions.
Virtual points are computed points that derive their values from combinations of other points
(analog points, digital points, and other virtual points) using algebraic equations and piecewise functions.

The virtual point processing performs the following functions:
1. Retrieves all virtual points and their mathematical expressions from the system database
2. Uses multiprocessing to process virtual points in parallel for efficiency
3. Parses mathematical expressions and identifies dependent points
4. Retrieves latest values from dependent points in the historical database
5. Evaluates mathematical expressions using SymPy library
6. Stores calculated virtual point values in the historical database

Key features:
- Supports complex mathematical expressions with multiple variables
- Handles different point types (analog, digital, virtual) in expressions
- Uses SymPy for robust mathematical expression evaluation including piecewise functions
- Maintains data integrity through comprehensive error handling
- Processes virtual points continuously to provide real-time calculated values
"""

import json
import random
import re
import time
from datetime import datetime
from decimal import Decimal
from multiprocessing import Pool
import mysql.connector
from sympy import sympify, Piecewise, symbols
import config


########################################################################################################################
# Virtual Point Calculation Procedures:
# Step 1: Query all virtual points and their mathematical expressions from system database
# Step 2: Create multiprocessing pool to call worker processes in parallel
########################################################################################################################

def calculate(logger):
    """
    Main function for virtual point calculation using mathematical expressions.

    This function runs continuously, retrieving all virtual points from the system database
    and processing them in parallel to calculate virtual point values using their
    configured mathematical expressions.

    Args:
        logger: Logger instance for recording calculation activities and errors
    """
    while True:
        # The outermost while loop to reconnect to server if there is a connection error
        cnx_system_db = None
        cursor_system_db = None

        # Connect to system database to retrieve virtual point configuration
        try:
            cnx_system_db = mysql.connector.connect(**config.myems_system_db)
            cursor_system_db = cnx_system_db.cursor()
        except Exception as e:
            logger.error("Error in step 0 of virtual point calculate " + str(e))
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()
            # Sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue

        print("Connected to MyEMS System Database")

        # Retrieve all virtual points with their configuration data
        virtual_point_list = list()
        try:
            cursor_system_db.execute(" SELECT id, name, data_source_id, object_type, high_limit, low_limit, address "
                                     " FROM tbl_points "
                                     " WHERE is_virtual = 1 ")
            rows_virtual_points = cursor_system_db.fetchall()

            # Check if virtual points were found
            if rows_virtual_points is None or len(rows_virtual_points) == 0:
                # Sleep several minutes and continue the outer loop to reconnect the database
                time.sleep(60)
                continue

            # Build virtual point list with configuration data
            for row in rows_virtual_points:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "data_source_id": row[2],
                               "object_type": row[3],
                               "high_limit": row[4],
                               "low_limit": row[5],
                               "address": row[6]}
                virtual_point_list.append(meta_result)

        except Exception as e:
            logger.error("Error in step 1 of virtual point calculate " + str(e))
            # sleep and continue the outer loop to reconnect the database
            time.sleep(60)
            continue
        finally:
            if cursor_system_db:
                cursor_system_db.close()
            if cnx_system_db:
                cnx_system_db.close()

        # Shuffle the virtual point list for randomly calculating point values
        # This helps distribute processing load evenly across time
        random.shuffle(virtual_point_list)

        print("Got all virtual points in MyEMS System Database")
        ################################################################################################################
        # Step 2: Create multiprocessing pool to call worker processes in parallel
        ################################################################################################################
        # Create process pool with configured size for parallel processing
        p = Pool(processes=config.pool_size)
        error_list = p.map(worker, virtual_point_list)
        p.close()
        p.join()

        # Log any errors from worker processes
        for error in error_list:
            if error is not None and len(error) > 0:
                logger.error(error)

        print("go to sleep ")
        time.sleep(60)  # Sleep for 1 minute before next processing cycle
        print("wake from sleep, and continue to work")


########################################################################################################################
# Worker Process Procedures for Individual Virtual Point Processing:
# Step 1: Get start datetime and end datetime for processing
# Step 2: Parse the expression and get all points in substitutions
# Step 3: Query points type from system database
# Step 4: Query points value from historical database
# Step 5: Evaluate the equation with points values and store results
# Returns the error string for logging or returns None on success
########################################################################################################################

def worker(virtual_point):
    """
    Worker function to process a single virtual point's calculation.

    This function processes one virtual point at a time, evaluating its mathematical
    expression using data from dependent points and storing the calculated results.

    Args:
        virtual_point: Dictionary containing virtual point configuration (id, name, object_type, address, etc.)

    Returns:
        None on success, error string on failure
    """
    cnx_historical_db = None
    cursor_historical_db = None

    # Connect to historical database to check existing processed data
    try:
        cnx_historical_db = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical_db = cnx_historical_db.cursor()
    except Exception as e:
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()
        return "Error in step 1.1 of virtual point worker " + str(e) + " for '" + virtual_point['name'] + "'"

    print("Start to process virtual point: " + "'" + virtual_point['name'] + "'")

    ####################################################################################################################
    # Step 1: Get start datetime and end datetime for processing
    ####################################################################################################################
    # Determine the appropriate table based on virtual point object type
    if virtual_point['object_type'] == 'ANALOG_VALUE':
        table_name = "tbl_analog_value"
    elif virtual_point['object_type'] == 'ENERGY_VALUE':
        table_name = "tbl_energy_value"
    else:
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()
        return "variable point type should not be DIGITAL_VALUE " + " for '" + virtual_point['name'] + "'"

    try:
        query = (" SELECT MAX(utc_date_time) "
                 " FROM " + table_name +
                 " WHERE point_id = %s ")
        cursor_historical_db.execute(query, (virtual_point['id'],))
        row = cursor_historical_db.fetchone()
    except Exception as e:
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()
        return "Error in step 1.2 of virtual point worker " + str(e) + " for '" + virtual_point['name'] + "'"

    start_datetime_utc = datetime.strptime(config.start_datetime_utc, '%Y-%m-%d %H:%M:%S').replace(tzinfo=None)

    if row is not None and len(row) > 0 and isinstance(row[0], datetime):
        start_datetime_utc = row[0].replace(tzinfo=None)

    end_datetime_utc = datetime.utcnow().replace(tzinfo=None)

    if end_datetime_utc <= start_datetime_utc:
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()
        return "it isn't time to calculate" + " for '" + virtual_point['name'] + "'"

    print("start_datetime_utc: " + start_datetime_utc.isoformat()[0:19]
          + "end_datetime_utc: " + end_datetime_utc.isoformat()[0:19])

    ############################################################################################################
    # Step 2: parse the expression and get all points in substitutions
    ############################################################################################################
    point_list = list()
    try:
        ########################################################################################################
        # parse the expression and get all points in substitutions
        ########################################################################################################
        address = json.loads(virtual_point['address'])
        # algebraic expression example: '{"expression": "x1-x2", "substitutions": {"x1":1,"x2":2}}'
        # piecewise function example: '{"expression":"(1,x<200 ), (2,x>=500), (0,True)", "substitutions":{"x":101}}'
        if 'expression' not in address.keys() \
                or 'substitutions' not in address.keys() \
                or len(address['expression']) == 0 \
                or len(address['substitutions']) == 0:
            return "Error in step 2.1 of virtual point worker for '" + virtual_point['name'] + "'"
        expression = address['expression']
        substitutions = address['substitutions']
        for variable_name, point_id in substitutions.items():
            point_list.append({"variable_name": variable_name, "point_id": point_id})
    except Exception as e:
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()
        return "Error in step 2.2 of virtual point worker " + str(e) + " for '" + virtual_point['name'] + "'"

    ############################################################################################################
    # Step 3: query points type from system database
    ############################################################################################################
    print("getting points type ")
    cnx_system_db = None
    cursor_system_db = None
    try:
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
    except Exception as e:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
        print("Error in step 3 of virtual point worker " + str(e))
        return "Error in step 3 of virtual point worker " + str(e)

    print("Connected to MyEMS System Database")

    all_point_dict = dict()
    try:
        cursor_system_db.execute(" SELECT id, object_type "
                                 " FROM tbl_points ")
        rows_points = cursor_system_db.fetchall()

        if rows_points is None or len(rows_points) == 0:
            return "Error in step 3.1 of virtual point worker for '" + virtual_point['name'] + "'"

        for row in rows_points:
            all_point_dict[row[0]] = row[1]
    except Exception as e:
        return "Error in step 3.2 virtual point worker " + str(e) + " for '" + virtual_point['name'] + "'"
    finally:
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()
    ############################################################################################################
    # Step 4: query points value from historical database
    ############################################################################################################

    print("getting point values ")
    point_values_dict = dict()
    if point_list is not None and len(point_list) > 0:
        try:
            for point in point_list:
                point_object_type = all_point_dict.get(point['point_id'])
                if point_object_type is None:
                    return "variable point type should not be None " + " for '" + virtual_point['name'] + "'"
                if point_object_type == 'ANALOG_VALUE':
                    query = (" SELECT utc_date_time, actual_value "
                             " FROM tbl_analog_value "
                             " WHERE point_id = %s AND utc_date_time > %s AND utc_date_time < %s "
                             " ORDER BY utc_date_time ")
                    cursor_historical_db.execute(query, (point['point_id'], start_datetime_utc, end_datetime_utc,))
                    rows = cursor_historical_db.fetchall()
                    if rows is not None and len(rows) > 0:
                        point_values_dict[point['point_id']] = dict()
                        for row in rows:
                            point_values_dict[point['point_id']][row[0]] = row[1]
                elif point_object_type == 'ENERGY_VALUE':
                    query = (" SELECT utc_date_time, actual_value "
                             " FROM tbl_energy_value "
                             " WHERE point_id = %s AND utc_date_time > %s AND utc_date_time < %s "
                             " ORDER BY utc_date_time ")
                    cursor_historical_db.execute(query, (point['point_id'], start_datetime_utc, end_datetime_utc,))
                    rows = cursor_historical_db.fetchall()
                    if rows is not None and len(rows) > 0:
                        point_values_dict[point['point_id']] = dict()
                        for row in rows:
                            point_values_dict[point['point_id']][row[0]] = row[1]
                    else:
                        point_values_dict[point['point_id']] = None
                else:
                    # point type should not be DIGITAL_VALUE
                    return "variable point type should not be DIGITAL_VALUE " + " for '" + virtual_point['name'] + "'"
        except Exception as e:
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            return "Error in step 4.1 virtual point worker " + str(e) + " for '" + virtual_point['name'] + "'"

    ############################################################################################################
    # Step 5: evaluate the equation with points values
    ############################################################################################################

    print("getting date time set for all points")
    utc_date_time_set = set()
    if point_values_dict is not None and len(point_values_dict) > 0:
        for point_id, point_values in point_values_dict.items():
            if point_values is not None and len(point_values) > 0:
                utc_date_time_set = utc_date_time_set.union(point_values.keys())

    print("evaluating the equation with SymPy")
    normalized_values = list()

    ############################################################################################################
    # Converting Strings to SymPy Expressions
    # The sympify function(that’s sympify, not to be confused with simplify) can be used to
    # convert strings into SymPy expressions.
    ############################################################################################################
    try:
        if re.search(',', expression):
            for item in substitutions.keys():
                locals()[item] = symbols(item)
            expr = eval(expression)
            print("the expression will be evaluated as piecewise function: " + str(expr))
        else:
            expr = sympify(expression)
            print("the expression will be evaluated as algebraic expression: " + str(expr))

        for utc_date_time in utc_date_time_set:
            meta_data = dict()
            meta_data['utc_date_time'] = utc_date_time

            ####################################################################################################
            # create a dictionary of Symbol: point pairs
            ####################################################################################################

            subs = dict()

            ####################################################################################################
            # Evaluating the expression at current_datetime_utc
            ####################################################################################################

            if point_list is not None and len(point_list) > 0:
                for point in point_list:
                    actual_value = point_values_dict[point['point_id']].get(utc_date_time, None)
                    if actual_value is None:
                        break
                    subs[point['variable_name']] = actual_value

            if len(subs) != len(point_list):
                continue

            ####################################################################################################
            # To numerically evaluate an expression with a Symbol at a point,
            # we might use subs followed by evalf,
            # but it is more efficient and numerically stable to pass the substitution to evalf
            # using the subs flag, which takes a dictionary of Symbol: point pairs.
            ####################################################################################################
            if re.search(',', expression):
                formula = Piecewise(*expr)
                meta_data['actual_value'] = Decimal(str(formula.subs(subs)))
                normalized_values.append(meta_data)
            else:
                meta_data['actual_value'] = Decimal(str(expr.evalf(subs=subs)))
                normalized_values.append(meta_data)
    except Exception as e:
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()
        return "Error in step 5.1 virtual point worker " + str(e) + " for '" + virtual_point['name'] + "'"

    print("saving virtual points values to historical database")

    if len(normalized_values) > 0:
        latest_meta_data = normalized_values[0]

        while len(normalized_values) > 0:
            insert_100 = normalized_values[:100]
            normalized_values = normalized_values[100:]

            try:
                add_values = (" INSERT INTO " + table_name +
                              " (point_id, utc_date_time, actual_value) "
                              " VALUES  ")

                for meta_data in insert_100:
                    add_values += " (" + str(virtual_point['id']) + ","
                    add_values += "'" + meta_data['utc_date_time'].isoformat()[0:19] + "',"
                    add_values += str(meta_data['actual_value']) + "), "

                    if meta_data['utc_date_time'] > latest_meta_data['utc_date_time']:
                        latest_meta_data = meta_data

                # print("add_values:" + add_values)
                # trim ", " at the end of string and then execute
                cursor_historical_db.execute(add_values[:-2])
                cnx_historical_db.commit()
            except Exception as e:
                if cursor_historical_db:
                    cursor_historical_db.close()
                if cnx_historical_db:
                    cnx_historical_db.close()
                return "Error in step 5.2 virtual point worker " + str(e) + " for '" + virtual_point['name'] + "'"

        try:
            # update tbl_analog_value_latest or tbl_energy_value_latest
            delete_value = " DELETE FROM " + table_name + "_latest WHERE point_id = {} ".format(virtual_point['id'])
            # print("delete_value:" + delete_value)
            cursor_historical_db.execute(delete_value)
            cnx_historical_db.commit()

            latest_value = (" INSERT INTO " + table_name + "_latest (point_id, utc_date_time, actual_value) "
                            " VALUES ({}, '{}', {}) "
                            .format(virtual_point['id'],
                                    latest_meta_data['utc_date_time'].isoformat()[0:19],
                                    latest_meta_data['actual_value']))
            # print("latest_value:" + latest_value)
            cursor_historical_db.execute(latest_value)
            cnx_historical_db.commit()
        except Exception as e:
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            return "Error in step 5.3 virtual point worker " + str(e) + " for '" + virtual_point['name'] + "'"

    if cursor_historical_db:
        cursor_historical_db.close()
    if cnx_historical_db:
        cnx_historical_db.close()

    return None
