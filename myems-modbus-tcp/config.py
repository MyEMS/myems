from decouple import config


myems_system_db = {
    'host': config('MYEMS_SYSTEM_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_SYSTEM_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_SYSTEM_DB_DATABASE', default='myems_system_db'),
    'user': config('MYEMS_SYSTEM_DB_USER', default='root'),
    'password': config('MYEMS_SYSTEM_DB_PASSWORD', default='!MyEMS1'),
}

myems_historical_db = {
    'host': config('MYEMS_HISTORICAL_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_HISTORICAL_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_HISTORICAL_DB_DATABASE', default='myems_historical_db'),
    'user': config('MYEMS_HISTORICAL_DB_USER', default='root'),
    'password': config('MYEMS_HISTORICAL_DB_PASSWORD', default='!MyEMS1'),
}


# Indicates how long the process waits between readings
interval_in_seconds = config('INTERVAL_IN_SECONDS', default=600, cast=int)

# Get the gateway ID and token from MyEMS Admin
# This is used for getting data sources associated with the gateway
gateway = {
    'id': config('GATEWAY_ID', default=1, cast=int),
    'token': config('GATEWAY_TOKEN', default='983427af-1c35-42ba-8b4d-288675550225')
}
