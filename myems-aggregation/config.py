myems_system_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_system_db',
}

myems_historical_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_historical_db',
}

myems_energy_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_energy_db',
}

myems_billing_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_billing_db',
}


# indicates how long in minutes energy data will be aggregated
# 30 for half hourly
# 60 for hourly
minutes_to_count = 60

# indicates from when (in UTC timezone) to recalculate if the energy data is null or were cleared
# format string: '%Y-%m-%d %H:%M:%S'
start_datetime_utc = '2019-12-31 16:00:00'

# indicates the project's time zone offset from UTC
utc_offset = '+08:00'

# the number of worker processes in parallel
# the pool size depends on the computing performance of the database server and the analysis server
pool_size = 5

