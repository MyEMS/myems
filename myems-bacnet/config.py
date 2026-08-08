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


INTERVAL_IN_SECONDS = config('INTERVAL_IN_SECONDS', default=600, cast=int)
GATEWAY_ID = config('GATEWAY_ID', cast=int)
GATEWAY_TOKEN = config('GATEWAY_TOKEN')

BACNET_DEVICE_LOCAL_ADDRESS = config('BACNET_DEVICE_LOCAL_ADDRESS', default='192.168.1.10')
BACNET_DEVICE_OBJECT_NAME = config('BACNET_DEVICE_OBJECT_NAME', default='MYEMS')
BACNET_DEVICE_OBJECT_IDENTIFIER = config('BACNET_DEVICE_OBJECT_IDENTIFIER', default=43981, cast=int)
BACNET_DEVICE_MAX_APDU_LENGTH_ACCEPTED = config('BACNET_DEVICE_MAX_APDU_LENGTH_ACCEPTED', default=1024, cast=int)
BACNET_DEVICE_SEGMENTATION_SUPPORTED = config('BACNET_DEVICE_SEGMENTATION_SUPPORTED', default='segmentedBoth')
BACNET_DEVICE_VENDOR_IDENTIFIER = config('BACNET_DEVICE_VENDOR_IDENTIFIER', default=1524, cast=int)
BACNET_DEVICE_FOREIGN_PORT = config('BACNET_DEVICE_FOREIGN_PORT', default=47808, cast=int)
BACNET_DEVICE_FOREIGN_BBMD = config('BACNET_DEVICE_FOREIGN_BBMD', default='192.168.1.1')
BACNET_DEVICE_FOREIGN_TTL = config('BACNET_DEVICE_FOREIGN_TTL', default=30, cast=int)

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


# Indicates how long the process waits between readings
interval_in_seconds = INTERVAL_IN_SECONDS

# Get the gateway ID and token from MyEMS Admin
# This is used for getting data sources associated with the gateway
gateway = {
    'id': GATEWAY_ID,
    'token': GATEWAY_TOKEN
}

bacnet_device = {
    'local_address': BACNET_DEVICE_LOCAL_ADDRESS,
    'object_name': BACNET_DEVICE_OBJECT_NAME,
    'object_identifier': BACNET_DEVICE_OBJECT_IDENTIFIER,
    'max_apdu_length_accepted': BACNET_DEVICE_MAX_APDU_LENGTH_ACCEPTED,
    'segmentation_supported': BACNET_DEVICE_SEGMENTATION_SUPPORTED,
    'vendor_identifier': BACNET_DEVICE_VENDOR_IDENTIFIER,
    'foreignPort': BACNET_DEVICE_FOREIGN_PORT,
    'foreignBBMD': BACNET_DEVICE_FOREIGN_BBMD,
    'foreignTTL': BACNET_DEVICE_FOREIGN_TTL,
}
