"""
MyEMS Cleaning Service - Configuration Module

This module contains all configuration settings for the MyEMS cleaning service.
It uses the python-decouple library to read configuration from environment variables
with sensible defaults for local development.

Configuration includes:
- Database connection settings for both system and historical databases
- Data retention policies
- Cleaning start time settings
- Debug mode settings
"""

from decouple import config


# Database connection configuration for MyEMS System Database
# This database contains system configuration, user data, and metadata
myems_system_db = {
    'host': config('MYEMS_SYSTEM_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_SYSTEM_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_SYSTEM_DB_DATABASE', default='myems_system_db'),
    'user': config('MYEMS_SYSTEM_DB_USER', default='root'),
    'password': config('MYEMS_SYSTEM_DB_PASSWORD', default='!MyEMS1'),
}

# Database connection configuration for MyEMS Historical Database
# This database contains time-series data like analog values, digital values, and energy values
myems_historical_db = {
    'host': config('MYEMS_HISTORICAL_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_HISTORICAL_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_HISTORICAL_DB_DATABASE', default='myems_historical_db'),
    'user': config('MYEMS_HISTORICAL_DB_USER', default='root'),
    'password': config('MYEMS_HISTORICAL_DB_PASSWORD', default='!MyEMS1'),
}

# Data retention policy: indicates how long analog values and digital values will be kept in database
# The longer the retention period, the more memory and disk space will be needed.
# NOTE: By default, energy values in historical database will never be deleted automatically.
# This is because energy values are cumulative and critical for billing and analysis.
live_in_days = config('LIVE_IN_DAYS', default=365, cast=int)

# Starting point for data cleaning: indicates from when (in UTC timezone) to clean if all is_bad properties are null
# This is used when the cleaning service runs for the first time or after a reset.
# Format string: "%Y-%m-%d %H:%M:%S"
start_datetime_utc = config('START_DATETIME_UTC', default='2023-12-31 16:00:00')

# Debug mode flag: indicates if the program is in debug mode
# When True, cleaning processes will run immediately once instead of on schedule
is_debug = config('IS_DEBUG', default=False, cast=bool)
