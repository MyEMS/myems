"""
MyEMS OPC UA Gateway Service - Configuration Module

This module contains all configuration settings for the MyEMS OPC UA gateway service.
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
    'host': config('MYEMS_SYSTEM_DB_HOST'),
    'port': config('MYEMS_SYSTEM_DB_PORT', cast=int),
    'database': config('MYEMS_SYSTEM_DB_DATABASE'),
    'user': config('MYEMS_SYSTEM_DB_USER'),
    'password': config('MYEMS_SYSTEM_DB_PASSWORD'),
    'connection_timeout': 5,
    'read_timeout': 30,
    'write_timeout': 30,
}

# Database connection configuration for MyEMS Historical Database
# This database contains time-series data collected from OPC UA servers
myems_historical_db = {
    'host': config('MYEMS_HISTORICAL_DB_HOST'),
    'port': config('MYEMS_HISTORICAL_DB_PORT', cast=int),
    'database': config('MYEMS_HISTORICAL_DB_DATABASE'),
    'user': config('MYEMS_HISTORICAL_DB_USER'),
    'password': config('MYEMS_HISTORICAL_DB_PASSWORD'),
    'connection_timeout': 5,
    'read_timeout': 30,
    'write_timeout': 30,
}

# Gateway identification and authentication settings
# These are used to identify this gateway instance and authenticate with the MyEMS system
# The gateway ID and token are obtained from MyEMS Admin and used to:
# 1. Associate data sources with this gateway
# 2. Authenticate gateway status reporting
# 3. Authorize data source access
gateway = {
    'id': config('GATEWAY_ID', cast=int),
    'token': config('GATEWAY_TOKEN')
}
