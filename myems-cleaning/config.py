from decouple import config


MYEMS_SYSTEM_DB_HOST = config('MYEMS_SYSTEM_DB_HOST', default='127.0.0.1')
MYEMS_SYSTEM_DB_PORT = config('MYEMS_SYSTEM_DB_PORT', default=3306, cast=int)
MYEMS_SYSTEM_DB_DATABASE = config('MYEMS_SYSTEM_DB_DATABASE', default='myems_system_db')
MYEMS_SYSTEM_DB_USER = config('MYEMS_SYSTEM_DB_USER', default='root')
MYEMS_SYSTEM_DB_PASSWORD = config('MYEMS_SYSTEM_DB_PASSWORD', default='!MyEMS1')

MYEMS_HISTORICAL_DB_HOST = config('MYEMS_HISTORICAL_DB_HOST', default='127.0.0.1')
MYEMS_HISTORICAL_DB_PORT = config('MYEMS_HISTORICAL_DB_PORT', default=3306, cast=int)
MYEMS_HISTORICAL_DB_DATABASE = config('MYEMS_HISTORICAL_DB_DATABASE', default='myems_historical_db')
MYEMS_HISTORICAL_DB_USER = config('MYEMS_HISTORICAL_DB_USER', default='root')
MYEMS_HISTORICAL_DB_PASSWORD = config('MYEMS_HISTORICAL_DB_PASSWORD', default='!MyEMS1')

LIVE_IN_DAYS = config('LIVE_IN_DAYS', default=365, cast=int)
IS_DEBUG = config('IS_DEBUG', default=False, cast=bool)

myems_system_db = {
    'host': MYEMS_SYSTEM_DB_HOST,
    'port': MYEMS_SYSTEM_DB_PORT,
    'database': MYEMS_SYSTEM_DB_DATABASE,
    'user': MYEMS_SYSTEM_DB_USER,
    'password': MYEMS_SYSTEM_DB_PASSWORD,
}

myems_historical_db = {
    'host': MYEMS_HISTORICAL_DB_HOST,
    'port': MYEMS_HISTORICAL_DB_PORT,
    'database': MYEMS_HISTORICAL_DB_DATABASE,
    'user': MYEMS_HISTORICAL_DB_USER,
    'password': MYEMS_HISTORICAL_DB_PASSWORD,
}

# indicates how long analog values and digital values will be kept in database
# the longer days the more memory and disc space needed.
# NOTE: By default, energy values in historical db will never be deleted automatically.
live_in_days = LIVE_IN_DAYS

# indicates if the program is in debug mode
is_debug = IS_DEBUG
