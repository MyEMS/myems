"""
MyEMS Aggregation Service - Carbon Dioxide Emission Factor Module

This module provides carbon dioxide emission factor calculation functionality for environmental reporting.
It retrieves emission factors from the system database to calculate carbon dioxide emissions
based on energy consumption data.

The module supports:
- Time-of-use emission factors with different rates for different time periods
- Cost center-bound emission factors for accurate carbon accounting
- Fallback to static energy category emission factors when no time-of-use factor is configured
"""

import collections
from datetime import datetime, timedelta

import mysql.connector

import config


########################################################################################################################
# Get carbon dioxide emission factor by energy category (electricity, natural gas, etc.)
########################################################################################################################
def get_energy_category_factor(cost_center_id, energy_category_id, start_datetime_utc, end_datetime_utc):
    """
    Retrieve carbon dioxide emission factor for a specific energy category.

    This function first attempts to find a matching emission factor from the new
    tbl_emission_factors table (bound to the cost center via tbl_cost_centers_emission_factors).
    If no matching factor is found, it falls back to the static kgco2e field
    in tbl_energy_categories.

    Different factors are applied based on the time of day.
    A factor covering 00:00:00-24:00:00 represents a constant value.

    Args:
        cost_center_id: ID of the cost center for emission factor lookup
        energy_category_id: ID of the energy category (electricity, natural gas, etc.)
        start_datetime_utc: Start datetime in UTC for factor calculation
        end_datetime_utc: End datetime in UTC for factor calculation

    Returns:
        Dictionary mapping datetime_utc to factor value for each time slot in the period
    """
    # Validate input parameters
    if not isinstance(cost_center_id, int) or cost_center_id <= 0:
        raise ValueError("Invalid cost_center_id")
    if not isinstance(energy_category_id, int) or energy_category_id <= 0:
        raise ValueError("Invalid energy_category_id")
    if not isinstance(start_datetime_utc, datetime) or not isinstance(end_datetime_utc, datetime):
        raise ValueError("Invalid start_datetime_utc or end_datetime_utc")
    if start_datetime_utc > end_datetime_utc:
        raise ValueError("start_datetime_utc must be before end_datetime_utc")

    # Get timezone offset in minutes for converting UTC to local time
    timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
    if config.utc_offset[0] == '-':
        timezone_offset = -timezone_offset

    # Use OrderedDict to maintain factor order for proper processing
    emission_factor_dict = collections.OrderedDict()

    cnx = None
    cursor = None

    # Connect to system database to retrieve emission factor information
    try:
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Query for emission factors that apply to the specified energy category and cost center
        query_factors = (" SELECT ef.id, "
                         "        ef.valid_from_datetime_utc, ef.valid_through_datetime_utc "
                         " FROM tbl_emission_factors ef, tbl_cost_centers_emission_factors ccef "
                         " WHERE ef.energy_category_id = %s AND "
                         "       ef.id = ccef.emission_factor_id AND "
                         "       ccef.cost_center_id = %s AND "
                         "       ef.valid_through_datetime_utc >= %s AND "
                         "       ef.valid_from_datetime_utc <= %s "
                         " ORDER BY ef.valid_from_datetime_utc ")
        cursor.execute(query_factors, (energy_category_id, cost_center_id, start_datetime_utc, end_datetime_utc,))
        rows_factors = cursor.fetchall()
    except Exception as e:
        print(str(e))
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return dict()

    # Check if emission factors were found in the new table
    if rows_factors is None or len(rows_factors) == 0:
        # Fall back to static kgco2e field in tbl_energy_categories
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return _get_fallback_factor(energy_category_id, start_datetime_utc, end_datetime_utc)

    # Build emission factor dictionary with validity periods
    for row in rows_factors:
        emission_factor_dict[row[0]] = {
            'valid_from_datetime_utc': row[1],
            'valid_through_datetime_utc': row[2],
            'rates': list()
        }

    # Retrieve time-of-use rates for all emission factors
    factor_ids = list(emission_factor_dict.keys())
    if factor_ids:
        try:
            query_timeofuse_factors = (" SELECT emission_factor_id, start_time_of_day, end_time_of_day, factor "
                                       " FROM tbl_emission_factors_timeofuses "
                                       " WHERE emission_factor_id IN ( " +
                                       ', '.join(map(str, factor_ids)) + ")"
                                       " ORDER BY emission_factor_id, start_time_of_day ")
            cursor.execute(query_timeofuse_factors, )
            rows_timeofuse_factors = cursor.fetchall()
        except Exception as e:
            print(str(e))
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()
            return dict()

        # Add time-of-use rates to emission factor dictionary
        if rows_timeofuse_factors is not None:
            for row in rows_timeofuse_factors:
                emission_factor_dict[row[0]]['rates'].append({
                    'start_time_of_day': row[1],
                    'end_time_of_day': row[2],
                    'factor': row[3]
                })

    # Clean up database connections
    if cursor:
        cursor.close()
    if cnx:
        cnx.close()

    # Calculate emission factors for each time slot
    result = dict()
    for ef_id, ef_value in emission_factor_dict.items():
        current_datetime_utc = ef_value['valid_from_datetime_utc']

        # Process each time slot within the factor validity period
        while current_datetime_utc < ef_value['valid_through_datetime_utc']:
            if ef_value['rates']:
                # Time-of-use factor: check each rate to find the applicable factor
                for rate in ef_value['rates']:
                    # Convert UTC time to local time for time-of-use determination
                    current_datetime_local = current_datetime_utc + timedelta(minutes=timezone_offset)
                    seconds_since_midnight = (current_datetime_local -
                                              current_datetime_local.replace(hour=0,
                                                                             second=0,
                                                                             microsecond=0,
                                                                             tzinfo=None)).total_seconds()

                    # Check if current time falls within this rate period
                    if rate['start_time_of_day'].total_seconds() <= \
                            seconds_since_midnight < rate['end_time_of_day'].total_seconds():
                        result[current_datetime_utc] = rate['factor']
                        break

            # Move to the next time slot
            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    # Filter results to only include the requested time period
    return {k: v for k, v in result.items() if start_datetime_utc <= k <= end_datetime_utc}


def _get_fallback_factor(energy_category_id, start_datetime_utc, end_datetime_utc):
    """
    Fallback: retrieve static kgco2e from tbl_energy_categories and treat it as a fixed factor.

    Args:
        energy_category_id: ID of the energy category
        start_datetime_utc: Start datetime in UTC
        end_datetime_utc: End datetime in UTC

    Returns:
        Dictionary mapping datetime_utc to factor value for each time slot in the period
    """
    cnx = None
    cursor = None

    try:
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT kgco2e FROM tbl_energy_categories WHERE id = %s ", (energy_category_id,))
        row = cursor.fetchone()
    except Exception as e:
        print(str(e))
        return dict()
    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

    if row is None or row[0] is None:
        return dict()

    result = dict()
    current_datetime_utc = start_datetime_utc
    while current_datetime_utc < end_datetime_utc:
        result[current_datetime_utc] = row[0]
        current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    return result