"""
MyEMS Aggregation Service - Tariff Calculation Module

This module provides tariff calculation functionality for energy billing.
It retrieves and processes tariff information from the system database to calculate
energy costs based on time-of-use pricing structures.

The module supports:
- Energy category-based tariffs (electricity, natural gas, etc.)
- Energy item-based tariffs (specific energy items within categories)
- Time-of-use pricing with different rates for different time periods
- Timezone-aware tariff calculations

Key features:
- Handles complex tariff structures with multiple time periods
- Supports timezone conversion for accurate local time pricing
- Provides both energy category and energy item tariff lookups
- Returns detailed tariff information for billing calculations
"""

import collections
from datetime import timedelta

import mysql.connector

import config


########################################################################################################################
# Get tariffs by energy category (electricity, natural gas, etc.)
########################################################################################################################
def get_energy_category_tariffs(cost_center_id, energy_category_id, start_datetime_utc, end_datetime_utc):
    """
    Retrieve tariff information for a specific energy category within a cost center.

    This function fetches tariff data from the system database and calculates
    time-of-use pricing for the specified time period and energy category.

    Args:
        cost_center_id: ID of the cost center for tariff lookup
        energy_category_id: ID of the energy category (electricity, natural gas, etc.)
        start_datetime_utc: Start datetime in UTC for tariff calculation
        end_datetime_utc: End datetime in UTC for tariff calculation

    Returns:
        Dictionary mapping datetime_utc to price for each time slot in the period
    """
    # TODO: Verify parameters for data validation
    if cost_center_id is None:
        return dict()

    # Get timezone offset in minutes for converting UTC to local time
    # This value is used to determine the correct time-of-use period for pricing
    timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
    if config.utc_offset[0] == '-':
        timezone_offset = -timezone_offset

    # Use OrderedDict to maintain tariff order for proper processing
    tariff_dict = collections.OrderedDict()

    cnx = None
    cursor = None

    # Connect to system database to retrieve tariff information
    try:
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Query for tariffs that apply to the specified energy category and cost center
        query_tariffs = (" SELECT t.id, t.valid_from_datetime_utc, t.valid_through_datetime_utc "
                         " FROM tbl_tariffs t, tbl_cost_centers_tariffs cct "
                         " WHERE t.energy_category_id = %s AND "
                         "       t.id = cct.tariff_id AND "
                         "       cct.cost_center_id = %s AND "
                         "       t.valid_through_datetime_utc >= %s AND "
                         "       t.valid_from_datetime_utc <= %s "
                         " ORDER BY t.valid_from_datetime_utc ")
        cursor.execute(query_tariffs, (energy_category_id, cost_center_id, start_datetime_utc, end_datetime_utc,))
        rows_tariffs = cursor.fetchall()
    except Exception as e:
        print(str(e))
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return dict()

    # Check if tariffs were found
    if rows_tariffs is None or len(rows_tariffs) == 0:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return dict()

    # Build tariff dictionary with validity periods
    for row in rows_tariffs:
        tariff_dict[row[0]] = {'valid_from_datetime_utc': row[1],
                               'valid_through_datetime_utc': row[2],
                               'rates': list()}

    # Retrieve time-of-use rates for each tariff
    try:
        query_timeofuse_tariffs = (" SELECT tariff_id, start_time_of_day, end_time_of_day, price "
                                   " FROM tbl_tariffs_timeofuses "
                                   " WHERE tariff_id IN ( " + ', '.join(map(str, tariff_dict.keys())) + ")"
                                   " ORDER BY tariff_id, start_time_of_day ")
        cursor.execute(query_timeofuse_tariffs, )
        rows_timeofuse_tariffs = cursor.fetchall()
    except Exception as e:
        print(str(e))
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return dict()

    # Clean up database connections
    if cursor:
        cursor.close()
    if cnx:
        cnx.close()

    # Check if time-of-use rates were found
    if rows_timeofuse_tariffs is None or len(rows_timeofuse_tariffs) == 0:
        return dict()

    # Add time-of-use rates to tariff dictionary
    for row in rows_timeofuse_tariffs:
        tariff_dict[row[0]]['rates'].append({'start_time_of_day': row[1],
                                             'end_time_of_day': row[2],
                                             'price': row[3]})

    # Calculate tariff prices for each time slot
    result = dict()
    for tariff_id, tariff_value in tariff_dict.items():
        current_datetime_utc = tariff_value['valid_from_datetime_utc']

        # Process each time slot within the tariff validity period
        while current_datetime_utc < tariff_value['valid_through_datetime_utc']:
            # Check each time-of-use rate to find the applicable price
            for rate in tariff_value['rates']:
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
                    result[current_datetime_utc] = rate['price']
                    break

            # Move to the next time slot
            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    # Filter results to only include the requested time period
    return {k: v for k, v in result.items() if start_datetime_utc <= k <= end_datetime_utc}


########################################################################################################################
# Get tariffs by energy item (specific energy items within categories)
########################################################################################################################
def get_energy_item_tariffs(cost_center_id, energy_item_id, start_datetime_utc, end_datetime_utc):
    """
    Retrieve tariff information for a specific energy item within a cost center.

    This function fetches tariff data from the system database and calculates
    time-of-use pricing for the specified time period and energy item.
    It first looks up the energy category for the given energy item, then
    retrieves the applicable tariffs.

    Args:
        cost_center_id: ID of the cost center for tariff lookup
        energy_item_id: ID of the specific energy item
        start_datetime_utc: Start datetime in UTC for tariff calculation
        end_datetime_utc: End datetime in UTC for tariff calculation

    Returns:
        Dictionary mapping datetime_utc to price for each time slot in the period
    """
    # TODO: Verify parameters for data validation
    if cost_center_id is None:
        return dict()

    # Get timezone offset in minutes for converting UTC to local time
    # This value is used to determine the correct time-of-use period for pricing
    timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
    if config.utc_offset[0] == '-':
        timezone_offset = -timezone_offset

    # Use OrderedDict to maintain tariff order for proper processing
    tariff_dict = collections.OrderedDict()

    cnx = None
    cursor = None

    # Connect to system database to retrieve tariff information
    try:
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Query for tariffs that apply to the energy category of the specified energy item and cost center
        query_tariffs = (" SELECT t.id, t.valid_from_datetime_utc, t.valid_through_datetime_utc "
                         " FROM tbl_tariffs t, tbl_cost_centers_tariffs cct, tbl_energy_items ei "
                         " WHERE ei.id = %s AND "
                         "       t.energy_category_id = ei.energy_category_id AND "
                         "       t.id = cct.tariff_id AND "
                         "       cct.cost_center_id = %s AND "
                         "       t.valid_through_datetime_utc >= %s AND "
                         "       t.valid_from_datetime_utc <= %s "
                         " ORDER BY t.valid_from_datetime_utc ")
        cursor.execute(query_tariffs, (energy_item_id, cost_center_id, start_datetime_utc, end_datetime_utc,))
        rows_tariffs = cursor.fetchall()
    except Exception as e:
        print(str(e))
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return dict()

    # Check if tariffs were found
    if rows_tariffs is None or len(rows_tariffs) == 0:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return dict()

    # Build tariff dictionary with validity periods
    for row in rows_tariffs:
        tariff_dict[row[0]] = {'valid_from_datetime_utc': row[1],
                               'valid_through_datetime_utc': row[2],
                               'rates': list()}

    # Retrieve time-of-use rates for each tariff
    try:
        query_timeofuse_tariffs = (" SELECT tariff_id, start_time_of_day, end_time_of_day, price "
                                   " FROM tbl_tariffs_timeofuses "
                                   " WHERE tariff_id IN ( " + ', '.join(map(str, tariff_dict.keys())) + ")"
                                   " ORDER BY tariff_id, start_time_of_day ")
        cursor.execute(query_timeofuse_tariffs, )
        rows_timeofuse_tariffs = cursor.fetchall()
    except Exception as e:
        print(str(e))
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return dict()

    # Clean up database connections
    if cursor:
        cursor.close()
    if cnx:
        cnx.close()

    # Check if time-of-use rates were found
    if rows_timeofuse_tariffs is None or len(rows_timeofuse_tariffs) == 0:
        return dict()

    # Add time-of-use rates to tariff dictionary
    for row in rows_timeofuse_tariffs:
        tariff_dict[row[0]]['rates'].append({'start_time_of_day': row[1],
                                             'end_time_of_day': row[2],
                                             'price': row[3]})

    # Calculate tariff prices for each time slot
    result = dict()
    for tariff_id, tariff_value in tariff_dict.items():
        current_datetime_utc = tariff_value['valid_from_datetime_utc']

        # Process each time slot within the tariff validity period
        while current_datetime_utc < tariff_value['valid_through_datetime_utc']:
            # Check each time-of-use rate to find the applicable price
            for rate in tariff_value['rates']:
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
                    result[current_datetime_utc] = rate['price']
                    break

            # Move to the next time slot
            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    # Filter results to only include the requested time period
    return {k: v for k, v in result.items() if start_datetime_utc <= k <= end_datetime_utc}
