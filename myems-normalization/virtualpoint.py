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
from sympy import sympify, Piecewise, symbols, parse_expr
import config

MAX_DATETIME_POINTS = 100000

# Maximum expression length to prevent DoS attacks
MAX_EXPRESSION_LENGTH = 10000

# Maximum number of substitutions to prevent DoS attacks
MAX_SUBSTITUTIONS = 100


########################################################################################################################
# Validation Functions
########################################################################################################################

def validate_variable_name(name):
    """
    Validate variable name to ensure it follows safe identifier rules.
    
    Args:
        name: Variable name to validate
        
    Raises:
        ValueError: If variable name is invalid
    """
    if not isinstance(name, str):
        raise ValueError(f"Variable name must be a string, got {type(name)}")
    if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', name):
        raise ValueError(f"Invalid variable name: {name}. Must start with letter or underscore and contain only "
                         f"alphanumeric characters and underscores.")


def validate_point_id(point_id):
    """
    Validate point_id to ensure it is a positive integer.
    
    Args:
        point_id: Point ID to validate
        
    Raises:
        ValueError: If point_id is invalid
    """
    if not isinstance(point_id, int):
        # Try to convert if it's a numeric string
        try:
            point_id = int(point_id)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid point_id: {point_id}. Must be an integer.")
    if point_id <= 0:
        raise ValueError(f"Invalid point_id: {point_id}. Must be a positive integer.")


def validate_expression_safe(expression):
    """
    Validate expression to ensure it doesn't contain dangerous patterns.
    
    Args:
        expression: Expression string to validate
        
    Raises:
        ValueError: If expression contains dangerous patterns
    """
    if not isinstance(expression, str):
        raise ValueError(f"Expression must be a string, got {type(expression)}")
    
    if len(expression) > MAX_EXPRESSION_LENGTH:
        raise ValueError(f"Expression too long: {len(expression)} characters. Maximum allowed: {MAX_EXPRESSION_LENGTH}")
    
    # Check for dangerous patterns that could lead to code execution
    dangerous_patterns = [
        (r'__\w+__', 'Double underscore pattern (magic methods)'),
        (r'import\s+', 'Import statement'),
        (r'exec\s*\(', 'exec() call'),
        (r'eval\s*\(', 'eval() call'),
        (r'open\s*\(', 'File open operation'),
        (r'file\s*\(', 'File operation'),
        (r'__import__', 'Direct __import__ call'),
        (r'compile\s*\(', 'compile() call'),
        (r'globals\s*\(', 'globals() call'),
        (r'locals\s*\(', 'locals() call'),
    ]
    
    for pattern, description in dangerous_patterns:
        if re.search(pattern, expression, re.IGNORECASE):
            raise ValueError(f"Dangerous pattern detected in expression: {description}")


def parse_piecewise_safe(expression, substitutions):
    """
    Safely parse a piecewise function expression without using eval().
    
    Piecewise format: "(value1, condition1), (value2, condition2), (default_value, True)"
    
    Args:
        expression: Piecewise function expression string
        substitutions: Dictionary mapping variable names to point IDs
        
    Returns:
        List of tuples (value_expr, condition_expr) for Piecewise construction
        
    Raises:
        ValueError: If expression cannot be safely parsed
    """
    # Validate expression first
    validate_expression_safe(expression)
    
    # Parse the piecewise expression manually
    # Format: "(value, condition), (value, condition), ..."
    try:
        # Use regex to find all tuples: (value, condition)
        # Pattern matches: ( ... , ... ) where we need to find the comma that separates value from condition
        # This is complex because conditions may contain parentheses and commas
        # Strategy: Find matching parentheses pairs and split on commas outside of them
        
        piecewise_parts = []
        expr = expression.strip()
        
        # Remove outer parentheses if present
        if expr.startswith('(') and expr.endswith(')'):
            # Check if it's a single tuple or multiple tuples
            # Count opening and closing parentheses
            depth = 0
            for i, char in enumerate(expr):
                if char == '(':
                    depth += 1
                elif char == ')':
                    depth -= 1
                    if depth == 0 and i < len(expr) - 1:
                        # Found end of first tuple, there are multiple tuples
                        break
            else:
                # Single tuple, remove outer parentheses
                expr = expr[1:-1]
        
        # Split by "), (" pattern to separate tuples
        # This pattern appears between tuples
        parts = re.split(r'\)\s*,\s*\(', expr)
        
        # Process each tuple part
        for part in parts:
            # Remove leading/trailing parentheses and whitespace
            part = part.strip().lstrip('(').rstrip(')')
            
            # Find the comma that separates value from condition
            # We need the rightmost comma that's not inside nested parentheses
            depth = 0
            last_comma_pos = -1
            for i, char in enumerate(part):
                if char == '(':
                    depth += 1
                elif char == ')':
                    depth -= 1
                elif char == ',' and depth == 0:
                    last_comma_pos = i
            
            if last_comma_pos == -1:
                raise ValueError(f"Invalid piecewise tuple format: {part}. Missing comma separator.")
            
            value_str = part[:last_comma_pos].strip()
            condition_str = part[last_comma_pos+1:].strip()
            
            if not value_str or not condition_str:
                raise ValueError(f"Invalid piecewise tuple format: {part}. Empty value or condition.")
            
            # Parse value and condition using sympify (safe)
            value_expr = sympify(value_str)
            condition_expr = sympify(condition_str)
            
            piecewise_parts.append((value_expr, condition_expr))
        
        if not piecewise_parts:
            raise ValueError("No valid piecewise parts found in expression")
        
        return piecewise_parts
    except Exception as e:
        raise ValueError(f"Failed to parse piecewise expression: {str(e)}")


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
        # Return generic error message to avoid information disclosure
        return f"Error connecting to historical database for virtual point '{virtual_point['name']}': " \
               f"{type(e).__name__}"

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
        # Return generic error message to avoid information disclosure
        return f"Error querying historical database for virtual point '{virtual_point['name']}': {type(e).__name__}"

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
    expression = None
    substitutions = None
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
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            return "Error in step 2.1 of virtual point worker for '" + virtual_point['name'] + "'"
        
        expression = address['expression']
        substitutions = address['substitutions']

        try:
            validate_expression_safe(expression)
        except ValueError as e:
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            return f"Error in step 2.1.1: Invalid expression for '{virtual_point['name']}': {str(e)}"

        if len(substitutions) > MAX_SUBSTITUTIONS:
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            return f"Error in step 2.1.2: Too many substitutions ({len(substitutions)}) for '{virtual_point['name']}'"
        
        # validate variable names and point IDs
        for variable_name, point_id in substitutions.items():
            try:
                validate_variable_name(variable_name)
                validate_point_id(point_id)
            except ValueError as e:
                if cursor_historical_db:
                    cursor_historical_db.close()
                if cnx_historical_db:
                    cnx_historical_db.close()
                return f"Error in step 2.1.3: Invalid variable or point_id for '{virtual_point['name']}': {str(e)}"
            point_list.append({"variable_name": variable_name, "point_id": point_id})
    except json.JSONDecodeError as e:
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()
        return "Error in step 2.2: Invalid JSON in address for '" + virtual_point['name'] + "'"
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
        return f"Error connecting to system database for virtual point '{virtual_point['name']}': {type(e).__name__}"

    print("Connected to MyEMS System Database")

    all_point_dict = dict()
    try:
        cursor_system_db.execute(" SELECT id, object_type "
                                 " FROM tbl_points ")
        rows_points = cursor_system_db.fetchall()

        if rows_points is None or len(rows_points) == 0:
            return f"Error: No points found in system database for virtual point '{virtual_point['name']}'"

        for row in rows_points:
            all_point_dict[row[0]] = row[1]
    except Exception as e:
        return f"Error querying points from system database for virtual point '{virtual_point['name']}': " \
               f"{type(e).__name__}"
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
            return f"Error querying point values from historical database for virtual point " \
                   f"'{virtual_point['name']}': {type(e).__name__}"

    ############################################################################################################
    # Step 5: evaluate the equation with points values
    ############################################################################################################

    print("getting date time set for all points")
    utc_date_time_set = set()
    if point_values_dict is not None and len(point_values_dict) > 0:
        for point_id, point_values in point_values_dict.items():
            if point_values is not None and len(point_values) > 0:
                utc_date_time_set = utc_date_time_set.union(point_values.keys())

    if len(utc_date_time_set) > MAX_DATETIME_POINTS:
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()
        return f"Error: Too many datetime points to process ({len(utc_date_time_set)}) for '{virtual_point['name']}'." \
               f" Maximum allowed: {MAX_DATETIME_POINTS}"

    print("evaluating the equation with SymPy")
    normalized_values = list()

    ############################################################################################################
    # Converting Strings to SymPy Expressions
    # The sympify function(that's sympify, not to be confused with simplify) can be used to
    # convert strings into SymPy expressions.
    ############################################################################################################
    try:
        if re.search(',', expression):
            piecewise_parts = parse_piecewise_safe(expression, substitutions)
            expr = Piecewise(*piecewise_parts)
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
            # Note: expr is already a Piecewise object for piecewise functions, or a SymPy expression for algebraic
            if re.search(',', expression):
                # expr is already a Piecewise object
                meta_data['actual_value'] = Decimal(str(expr.subs(subs)))
                normalized_values.append(meta_data)
            else:
                # expr is a SymPy expression
                meta_data['actual_value'] = Decimal(str(expr.evalf(subs=subs)))
                normalized_values.append(meta_data)
    except Exception as e:
        if cursor_historical_db:
            cursor_historical_db.close()
        if cnx_historical_db:
            cnx_historical_db.close()
        return f"Error evaluating expression for virtual point '{virtual_point['name']}': {type(e).__name__}"

    print("saving virtual points values to historical database")

    if len(normalized_values) > 0:
        latest_meta_data = normalized_values[0]
        if table_name not in ['tbl_analog_value', 'tbl_energy_value']:
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            return f"Error: Invalid table name '{table_name}' for '{virtual_point['name']}'"

        insert_query = ("INSERT INTO " + table_name +
                        " (point_id, utc_date_time, actual_value) VALUES (%s, %s, %s)")

        while len(normalized_values) > 0:
            insert_100 = normalized_values[:100]
            normalized_values = normalized_values[100:]

            try:
                values = []
                for meta_data in insert_100:
                    values.append((
                        virtual_point['id'],
                        meta_data['utc_date_time'],
                        meta_data['actual_value']
                    ))
                    if meta_data['utc_date_time'] > latest_meta_data['utc_date_time']:
                        latest_meta_data = meta_data

                cursor_historical_db.executemany(insert_query, values)
                cnx_historical_db.commit()
            except Exception as e:
                if cursor_historical_db:
                    cursor_historical_db.close()
                if cnx_historical_db:
                    cnx_historical_db.close()
                return f"Error saving calculated values to database for virtual point '{virtual_point['name']}': " \
                       f"{type(e).__name__}"

        try:
            delete_query = "DELETE FROM " + table_name + "_latest WHERE point_id = %s"
            cursor_historical_db.execute(delete_query, (virtual_point['id'],))
            cnx_historical_db.commit()

            insert_latest_query = ("INSERT INTO " + table_name + "_latest " +
                                   " (point_id, utc_date_time, actual_value) VALUES (%s, %s, %s)")
            cursor_historical_db.execute(insert_latest_query, (
                virtual_point['id'],
                latest_meta_data['utc_date_time'],
                latest_meta_data['actual_value']
            ))
            cnx_historical_db.commit()
        except Exception as e:
            if cursor_historical_db:
                cursor_historical_db.close()
            if cnx_historical_db:
                cnx_historical_db.close()
            return f"Error updating latest value in database for virtual point '{virtual_point['name']}': {type(e).__name__}"

    if cursor_historical_db:
        cursor_historical_db.close()
    if cnx_historical_db:
        cnx_historical_db.close()

    return None
