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

# Indicates how long the process waits between readings
interval_in_seconds = 180

bacnet_device = {
    'local_address': '192.168.1.10',
    'object_name': 'MYEMS',
    'object_identifier': 0xABCD,
    'max_apdu_length_accepted': 1024,
    'segmentation_supported': 'segmentedBoth',
    'vendor_identifier': 0xABCD,
    'foreignPort': 47808,
    'foreignBBMD': '192.168.0.1',
    'foreignTTL': 30,
}

# Get the gateway ID and token from MyEMS Admin
# This is used for getting data sources associated with the gateway
gateway = {
    'id': 1,
    'token': 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
}
