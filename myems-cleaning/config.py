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

# indicates how long analog values and digital values will be kept in database
# the longer days the more memory and disc space needed.
# NOTE: By default, energy values in historical db will never be deleted automatically.
live_in_days = config('LIVE_IN_DAYS', default=365, cast=int)

# indicates from when (in UTC timezone) to clean if all is_bad properties are null
# format string: "%Y-%m-%d %H:%M:%S"
start_datetime_utc = config('START_DATETIME_UTC', default='2023-12-31 16:00:00')

# indicates if the program is in debug mode
is_debug = config('IS_DEBUG', default=False, cast=bool)
