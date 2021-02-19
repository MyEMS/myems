myems_system_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_system_db',
    'port': 3306,
}

myems_energy_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_energy_db',
    'port': 3306,
}

myems_historical_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_historical_db',
    'port': 3306,
}

# indicates in how many minutes to normalize energy consumption
# 30 for half hourly
# 60 for hourly
minutes_to_count = 60

# indicates within how many minutes to allow myems-cleaning service to clean the historical data
minutes_to_clean = 30

# indicates from when (in UTC timezone) to calculate if the energy data is empty or were cleared
# format string: '%Y-%m-%d %H:%M:%S'
start_datetime_utc = '2019-12-31 16:00:00'

# the number of worker processes in parallel for meter and virtual meter
# the pool size depends on the computing performance of the database server and the analysis server
pool_size = 5

# indicates the project's time zone offset from UTC
utc_offset = '+08:00'

