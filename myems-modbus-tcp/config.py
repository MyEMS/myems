"""
MyEMS Modbus TCP Gateway Service - Configuration Module

This module contains all configuration settings for the MyEMS Modbus TCP gateway service.
It uses the python-decouple library to read configuration from environment variables
with sensible defaults for local development.

Configuration includes:
- Database connection settings for both system and historical databases
- Data acquisition interval settings
- Gateway identification and authentication settings
"""

from decouple import config


# Database connection configuration for MyEMS System Database
# This database contains system configuration, data source definitions, and gateway information
myems_system_db = {
    'host': config('MYEMS_SYSTEM_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_SYSTEM_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_SYSTEM_DB_DATABASE', default='myems_system_db'),
    'user': config('MYEMS_SYSTEM_DB_USER', default='root'),
    'password': config('MYEMS_SYSTEM_DB_PASSWORD', default=''),
}

# Database connection configuration for MyEMS Historical Database
# This database contains time-series data collected from Modbus TCP devices
myems_historical_db = {
    'host': config('MYEMS_HISTORICAL_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_HISTORICAL_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_HISTORICAL_DB_DATABASE', default='myems_historical_db'),
    'user': config('MYEMS_HISTORICAL_DB_USER', default='root'),
    'password': config('MYEMS_HISTORICAL_DB_PASSWORD', default=''),
}


# Data acquisition interval: indicates how long the process waits between readings
# This is the default interval used when data sources don't specify their own interval
# Default is 600 seconds (10 minutes) between data collection cycles
interval_in_seconds = config('INTERVAL_IN_SECONDS', default=600, cast=int)

# Gateway identification and authentication settings
# These are used to identify this gateway instance and authenticate with the MyEMS system
# The gateway ID and token are obtained from MyEMS Admin and used to:
# 1. Associate data sources with this gateway
# 2. Authenticate gateway status reporting
# 3. Authorize data source access
gateway = {
    'id': config('GATEWAY_ID', default=1, cast=int),
    'token': config('GATEWAY_TOKEN', default='983427af-1c35-42ba-8b4d-288675550225')
}
