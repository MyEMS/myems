"""
MyEMS Normalization Service - Configuration Module

This module contains all configuration settings for the MyEMS normalization service.
It uses the python-decouple library to read configuration from environment variables
with sensible defaults for local development.

Configuration includes:
- Database connection settings for system, energy, and historical databases
- Data processing intervals and timing settings
- Timezone and date range configurations
- Multiprocessing pool size settings
"""

from decouple import config


# Database connection configuration for MyEMS System Database
# This database contains system configuration, meter definitions, and virtual meter equations
myems_system_db = {
    'host': config('MYEMS_SYSTEM_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_SYSTEM_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_SYSTEM_DB_DATABASE', default='myems_system_db'),
    'user': config('MYEMS_SYSTEM_DB_USER', default='root'),
    'password': config('MYEMS_SYSTEM_DB_PASSWORD', default=''),
}

# Database connection configuration for MyEMS Energy Database
# This database contains normalized energy consumption data (hourly aggregations)
myems_energy_db = {
    'host': config('MYEMS_ENERGY_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_ENERGY_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_ENERGY_DB_DATABASE', default='myems_energy_db'),
    'user': config('MYEMS_ENERGY_DB_USER', default='root'),
    'password': config('MYEMS_ENERGY_DB_PASSWORD', default=''),
}

# Database connection configuration for MyEMS Historical Database
# This database contains raw time-series data from meters and uploaded files
myems_historical_db = {
    'host': config('MYEMS_HISTORICAL_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_HISTORICAL_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_HISTORICAL_DB_DATABASE', default='myems_historical_db'),
    'user': config('MYEMS_HISTORICAL_DB_USER', default='root'),
    'password': config('MYEMS_HISTORICAL_DB_PASSWORD', default=''),
}

# Data processing interval: indicates in how many minutes to normalize energy consumption
# Common values:
# - 30 for half-hourly processing
# - 60 for hourly processing (default)
# This determines the time granularity for energy consumption calculations
minutes_to_count = config('MINUTES_TO_COUNT', default=60, cast=int)

# Data cleaning buffer: indicates within how many minutes to allow myems-cleaning service to clean the historical data
# This creates a buffer zone to prevent the normalization service from processing data
# that might be cleaned by the cleaning service, ensuring data consistency
minutes_to_clean = config('MINUTES_TO_CLEAN', default=30, cast=int)

# Processing start time: indicates from when (in UTC timezone) to calculate if the energy data is empty or were cleared
# This is used when the normalization service runs for the first time or after a reset
# Format string: "%Y-%m-%d %H:%M:%S"
start_datetime_utc = config('START_DATETIME_UTC', default='2023-12-31 16:00:00')

# Timezone configuration: indicates the project's time zone offset from UTC
# Used for converting local time to UTC when processing uploaded Excel files
# Format: "+HH:MM" or "-HH:MM" (e.g., "+08:00" for UTC+8)
utc_offset = config('UTC_OFFSET', default='+08:00')

# Multiprocessing configuration: the number of worker processes in parallel for meter and virtual meter processing
# The pool size depends on the computing performance of the database server and the analysis server
# Higher values increase processing speed but consume more system resources
pool_size = config('POOL_SIZE', default=5, cast=int)

