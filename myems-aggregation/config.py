from decouple import config

MYEMS_SYSTEM_DB_HOST = config('MYEMS_SYSTEM_DB_HOST', default='127.0.0.1')
MYEMS_SYSTEM_DB_PORT = config('MYEMS_SYSTEM_DB_PORT', default=3306, cast=int)
MYEMS_SYSTEM_DB_DATABASE = config('MYEMS_SYSTEM_DB_DATABASE', default='myems_system_db')
MYEMS_SYSTEM_DB_USER = config('MYEMS_SYSTEM_DB_USER', default='root')
MYEMS_SYSTEM_DB_PASSWORD = config('MYEMS_SYSTEM_DB_PASSWORD', default='!MyEMS1')

MYEMS_HISTORICAL_DB_HOST = config('MYEMS_HISTORICAL_DB_HOST', default='127.0.0.1')
MYEMS_HISTORICAL_DB_PORT = config('MYEMS_HISTORICAL_DB_PORT', default=3306, cast=int)
MYEMS_HISTORICAL_DB_DATABASE = config('MYEMS_HISTORICAL_DB_DATABASE', default='myems_system_db')
MYEMS_HISTORICAL_DB_USER = config('MYEMS_HISTORICAL_DB_USER', default='root')
MYEMS_HISTORICAL_DB_PASSWORD = config('MYEMS_HISTORICAL_DB_PASSWORD', default='!MyEMS1')

MYEMS_ENERGY_DB_HOST = config('MYEMS_ENERGY_DB_HOST', default='127.0.0.1')
MYEMS_ENERGY_DB_PORT = config('MYEMS_ENERGY_DB_PORT', default=3306, cast=int)
MYEMS_ENERGY_DB_DATABASE = config('MYEMS_ENERGY_DB_DATABASE', default='myems_system_db')
MYEMS_ENERGY_DB_USER = config('MYEMS_ENERGY_DB_USER', default='root')
MYEMS_ENERGY_DB_PASSWORD = config('MYEMS_ENERGY_DB_PASSWORD', default='!MyEMS1')

MYEMS_BILLING_DB_HOST = config('MYEMS_BILLING_DB_HOST', default='127.0.0.1')
MYEMS_BILLING_DB_PORT = config('MYEMS_BILLING_DB_PORT', default=3306, cast=int)
MYEMS_BILLING_DB_DATABASE = config('MYEMS_BILLING_DB_DATABASE', default='myems_system_db')
MYEMS_BILLING_DB_USER = config('MYEMS_BILLING_DB_USER', default='root')
MYEMS_BILLING_DB_PASSWORD = config('MYEMS_BILLING_DB_PASSWORD', default='!MyEMS1')

MINUTES_TO_COUNT = config('MINUTES_TO_COUNT', default=60, cast=int)
START_DATETIME_UTC = config('START_DATETIME_UTC', default='2019-12-31 16:00:00')
UTC_OFFSET = config('UTC_OFFSET', default='+08:00')
POOL_SIZE = config('POOL_SIZE', default=5, cast=int)

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

myems_energy_db = {
    'host': MYEMS_ENERGY_DB_HOST,
    'port': MYEMS_ENERGY_DB_PORT,
    'database': MYEMS_ENERGY_DB_DATABASE,
    'user': MYEMS_ENERGY_DB_USER,
    'password': MYEMS_ENERGY_DB_PASSWORD,
}

myems_billing_db = {
    'host': MYEMS_BILLING_DB_HOST,
    'port': MYEMS_BILLING_DB_PORT,
    'database': MYEMS_BILLING_DB_DATABASE,
    'user': MYEMS_BILLING_DB_USER,
    'password': MYEMS_BILLING_DB_PASSWORD,
}

# indicates how long in minutes energy data will be aggregated
# 30 for half hourly
# 60 for hourly
minutes_to_count = MINUTES_TO_COUNT

# indicates from when (in UTC timezone) to recalculate if the energy data is null or were cleared
# format string: '%Y-%m-%d %H:%M:%S'
start_datetime_utc = START_DATETIME_UTC

# indicates the project's time zone offset from UTC
utc_offset = UTC_OFFSET

# the number of worker processes in parallel
# the pool size depends on the computing performance of the database server and the analysis server
pool_size = POOL_SIZE

