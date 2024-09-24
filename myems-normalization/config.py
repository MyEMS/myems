from decouple import config


myems_system_db = {
    'host': config('MYEMS_SYSTEM_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_SYSTEM_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_SYSTEM_DB_DATABASE', default='myems_system_db'),
    'user': config('MYEMS_SYSTEM_DB_USER', default='root'),
    'password': config('MYEMS_SYSTEM_DB_PASSWORD', default='!MyEMS1'),
}

myems_energy_db = {
    'host': config('MYEMS_ENERGY_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_ENERGY_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_ENERGY_DB_DATABASE', default='myems_energy_db'),
    'user': config('MYEMS_ENERGY_DB_USER', default='root'),
    'password': config('MYEMS_ENERGY_DB_PASSWORD', default='!MyEMS1'),
}

myems_historical_db = {
    'host': config('MYEMS_HISTORICAL_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_HISTORICAL_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_HISTORICAL_DB_DATABASE', default='myems_historical_db'),
    'user': config('MYEMS_HISTORICAL_DB_USER', default='root'),
    'password': config('MYEMS_HISTORICAL_DB_PASSWORD', default='!MyEMS1'),
}

# indicates in how many minutes to normalize energy consumption
# 30 for half hourly
# 60 for hourly
minutes_to_count = config('MINUTES_TO_COUNT', default=60, cast=int)

# indicates within how many minutes to allow myems-cleaning service to clean the historical data
minutes_to_clean = config('MINUTES_TO_CLEAN', default=30, cast=int)

# indicates from when (in UTC timezone) to calculate if the energy data is empty or were cleared
# format string: "%Y-%m-%d %H:%M:%S"
start_datetime_utc = config('START_DATETIME_UTC', default='2021-12-31 16:00:00')

# indicates the project's time zone offset from UTC
utc_offset = config('UTC_OFFSET', default='+08:00')

# the number of worker processes in parallel for meter and virtual meter
# the pool size depends on the computing performance of the database server and the analysis server
pool_size = config('POOL_SIZE', default=5, cast=int)

