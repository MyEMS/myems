"""
MyEMS Aggregation Service - Carbon Dioxide Emission Factor Module

This module provides carbon dioxide emission factor calculation functionality for environmental reporting.
It retrieves emission factors from the system database to calculate carbon dioxide emissions
based on energy consumption data.

The module supports:
- Energy category-based emission factors (electricity, natural gas, etc.)
- Energy item-based emission factors (specific energy items within categories)
- Carbon dioxide equivalent (CO2e) calculations for environmental impact assessment

Key features:
- Retrieves emission factors from energy category definitions
- Supports both direct energy category and energy item lookups
- Provides foundation for carbon footprint calculations
- Enables environmental impact reporting and sustainability metrics
"""

import mysql.connector

import config


########################################################################################################################
# Get carbon dioxide emission factor by energy category (electricity, natural gas, etc.)
########################################################################################################################
def get_energy_category_factor(energy_category_id, start_datetime_utc, end_datetime_utc):
    """
    Retrieve carbon dioxide emission factor for a specific energy category.

    This function fetches the emission factor (kg CO2e per unit of energy) from the system database
    for the specified energy category. The emission factor is used to calculate carbon dioxide
    emissions from energy consumption data.

    Args:
        energy_category_id: ID of the energy category (electricity, natural gas, etc.)
        start_datetime_utc: Start datetime in UTC (currently not used in factor lookup)
        end_datetime_utc: End datetime in UTC (currently not used in factor lookup)

    Returns:
        Carbon dioxide emission factor (kg CO2e per unit) or None if not found
    """
    # TODO: Verify parameters for data validation
    # TODO: Add start_datetime_utc and end_datetime_utc to factor for time-varying emission factors

    # Get timezone offset in minutes for potential future time-based factor calculations
    timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
    if config.utc_offset[0] == '-':
        timezone_offset = -timezone_offset

    cnx = None
    cursor = None

    # Connect to system database to retrieve emission factor
    try:
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Query for carbon dioxide emission factor from energy category
        query_factors = (" SELECT kgco2e "
                         " FROM tbl_energy_categories "
                         " WHERE id = %s ")
        cursor.execute(query_factors, (energy_category_id,))
        rows_factor = cursor.fetchone()
    except Exception as e:
        print(str(e))
        return None
    finally:
        # Always clean up database connections
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

    # Check if emission factor was found
    if rows_factor is None:
        return None
    else:
        return rows_factor[0]


########################################################################################################################
# Get carbon dioxide emission factor by energy item (specific energy items within categories)
########################################################################################################################
def get_energy_item_tariffs(energy_item_id, start_datetime_utc, end_datetime_utc):
    """
    Retrieve carbon dioxide emission factor for a specific energy item.

    This function fetches the emission factor (kg CO2e per unit of energy) from the system database
    for the specified energy item. It first looks up the energy category for the given energy item,
    then retrieves the emission factor from that category.

    Args:
        energy_item_id: ID of the specific energy item
        start_datetime_utc: Start datetime in UTC (currently not used in factor lookup)
        end_datetime_utc: End datetime in UTC (currently not used in factor lookup)

    Returns:
        Carbon dioxide emission factor (kg CO2e per unit) or None if not found
    """
    # TODO: Verify parameters for data validation
    # TODO: Add start_datetime_utc and end_datetime_utc to factor for time-varying emission factors

    # Get timezone offset in minutes for potential future time-based factor calculations
    timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
    if config.utc_offset[0] == '-':
        timezone_offset = -timezone_offset

    cnx = None
    cursor = None

    # Connect to system database to retrieve emission factor
    try:
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()

        # Query for carbon dioxide emission factor from energy category via energy item
        query_factors = (" SELECT ec.kgco2e "
                         " FROM tbl_energy_categories ec, tbl_energy_items ei "
                         " WHERE ei.id = %s AND ei.energy_category_id = ec.id ")
        cursor.execute(query_factors, (energy_item_id,))
        rows_factor = cursor.fetchone()
    except Exception as e:
        print(str(e))
        return None
    finally:
        # Always clean up database connections
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()

    # Check if emission factor was found
    if rows_factor is None:
        return None
    else:
        return rows_factor[0]
