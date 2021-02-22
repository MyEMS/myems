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

myems_mqtt_broker = {
    'host': '127.0.0.1',
    'port': 1883,
    'username': 'admin',
    'password': 'Password1',
}

# The quality of service level to use.
# The value is one of 0, 1 or 2,
qos = 0

# The topic prefix that the message should be published on.
topic_prefix = 'myems/point/'

interval_in_seconds = 60
