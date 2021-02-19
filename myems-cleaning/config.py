# definition of the database
myems_system_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_system_db',
    'port': 3306,
}

myems_historical_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_historical_db',
    'port': 3306,
}

# indicates how long analog values and digital values will be kept in database
# the longer days the more memory and disc space needed.
live_in_days = 365
# note: By default, energy values in historical db will never be deleted automatically.

# indicates if the program is in debug mode
is_debug = False
