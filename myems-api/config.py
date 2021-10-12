from decouple import config


MYEMS_SYSTEM_DB_HOST = config('MYEMS_SYSTEM_DB_HOST', default='127.0.0.1')
MYEMS_SYSTEM_DB_PORT = config('MYEMS_SYSTEM_DB_PORT', default=3306, cast=int)
MYEMS_SYSTEM_DB_DATABASE = config('MYEMS_SYSTEM_DB_DATABASE', default='myems_system_db')
MYEMS_SYSTEM_DB_USER = config('MYEMS_SYSTEM_DB_USER', default='root')
MYEMS_SYSTEM_DB_PASSWORD = config('MYEMS_SYSTEM_DB_PASSWORD', default='!MyEMS1')

MYEMS_ENERGY_DB_HOST = config('MYEMS_ENERGY_DB_HOST', default='127.0.0.1')
MYEMS_ENERGY_DB_PORT = config('MYEMS_ENERGY_DB_PORT', default=3306, cast=int)
MYEMS_ENERGY_DB_DATABASE = config('MYEMS_ENERGY_DB_DATABASE', default='myems_energy_db')
MYEMS_ENERGY_DB_USER = config('MYEMS_ENERGY_DB_USER', default='root')
MYEMS_ENERGY_DB_PASSWORD = config('MYEMS_ENERGY_DB_PASSWORD', default='!MyEMS1')

MYEMS_ENERGY_BASELINE_DB_HOST = config('MYEMS_ENERGY_BASELINE_DB_HOST', default='127.0.0.1')
MYEMS_ENERGY_BASELINE_DB_PORT = config('MYEMS_ENERGY_BASELINE_DB_PORT', default=3306, cast=int)
MYEMS_ENERGY_BASELINE_DB_DATABASE = config('MYEMS_ENERGY_BASELINE_DB_DATABASE', default='myems_energy_baseline_db')
MYEMS_ENERGY_BASELINE_DB_USER = config('MYEMS_ENERGY_BASELINE_DB_USER', default='root')
MYEMS_ENERGY_BASELINE_DB_PASSWORD = config('MYEMS_ENERGY_BASELINE_DB_PASSWORD', default='!MyEMS1')

MYEMS_BILLING_DB_HOST = config('MYEMS_BILLING_DB_HOST', default='127.0.0.1')
MYEMS_BILLING_DB_PORT = config('MYEMS_BILLING_DB_PORT', default=3306, cast=int)
MYEMS_BILLING_DB_DATABASE = config('MYEMS_BILLING_DB_DATABASE', default='myems_billing_db')
MYEMS_BILLING_DB_USER = config('MYEMS_BILLING_DB_USER', default='root')
MYEMS_BILLING_DB_PASSWORD = config('MYEMS_BILLING_DB_PASSWORD', default='!MyEMS1')

MYEMS_BILLING_BASELINE_DB_HOST = config('MYEMS_BILLING_BASELINE_DB_HOST', default='127.0.0.1')
MYEMS_BILLING_BASELINE_DB_PORT = config('MYEMS_BILLING_BASELINE_DB_PORT', default=3306, cast=int)
MYEMS_BILLING_BASELINE_DB_DATABASE = config('MYEMS_BILLING_BASELINE_DB_DATABASE', default='myems_billing_baseline_db')
MYEMS_BILLING_BASELINE_DB_USER = config('MYEMS_BILLING_BASELINE_DB_USER', default='root')
MYEMS_BILLING_BASELINE_DB_PASSWORD = config('MYEMS_BILLING_BASELINE_DB_PASSWORD', default='!MyEMS1')

MYEMS_HISTORICAL_DB_HOST = config('MYEMS_HISTORICAL_DB_HOST', default='127.0.0.1')
MYEMS_HISTORICAL_DB_PORT = config('MYEMS_HISTORICAL_DB_PORT', default=3306, cast=int)
MYEMS_HISTORICAL_DB_DATABASE = config('MYEMS_HISTORICAL_DB_DATABASE', default='myems_historical_db')
MYEMS_HISTORICAL_DB_USER = config('MYEMS_HISTORICAL_DB_USER', default='root')
MYEMS_HISTORICAL_DB_PASSWORD = config('MYEMS_HISTORICAL_DB_PASSWORD', default='!MyEMS1')

MYEMS_USER_DB_HOST = config('MYEMS_USER_DB_HOST', default='127.0.0.1')
MYEMS_USER_DB_PORT = config('MYEMS_USER_DB_PORT', default=3306, cast=int)
MYEMS_USER_DB_DATABASE = config('MYEMS_USER_DB_DATABASE', default='myems_user_db')
MYEMS_USER_DB_USER = config('MYEMS_USER_DB_USER', default='root')
MYEMS_USER_DB_PASSWORD = config('MYEMS_USER_DB_PASSWORD', default='!MyEMS1')

MYEMS_FDD_DB_HOST = config('MYEMS_FDD_DB_HOST', default='127.0.0.1')
MYEMS_FDD_DB_PORT = config('MYEMS_FDD_DB_PORT', default=3306, cast=int)
MYEMS_FDD_DB_DATABASE = config('MYEMS_FDD_DB_DATABASE', default='myems_fdd_db')
MYEMS_FDD_DB_USER = config('MYEMS_FDD_DB_USER', default='root')
MYEMS_FDD_DB_PASSWORD = config('MYEMS_FDD_DB_PASSWORD', default='!MyEMS1')

MYEMS_REPORTING_DB_HOST = config('MYEMS_REPORTING_DB_HOST', default='127.0.0.1')
MYEMS_REPORTING_DB_PORT = config('MYEMS_REPORTING_DB_PORT', default=3306, cast=int)
MYEMS_REPORTING_DB_DATABASE = config('MYEMS_REPORTING_DB_DATABASE', default='myems_reporting_db')
MYEMS_REPORTING_DB_USER = config('MYEMS_REPORTING_DB_USER', default='root')
MYEMS_REPORTING_DB_PASSWORD = config('MYEMS_REPORTING_DB_PASSWORD', default='!MyEMS1')

MINUTES_TO_COUNT = config('MINUTES_TO_COUNT', default=60, cast=int)
UTC_OFFSET = config('UTC_OFFSET', default='+08:00')
WORKING_DAY_START_TIME_LOCAL = config('WORKING_DAY_START_TIME_LOCAL', default='00:00:00')
UPLOAD_PATH = config('UPLOAD_PATH', default='/var/www/html/admin/upload/')
CURRENCY_UNIT = config('CURRENCY_UNIT', default='CNY')

myems_system_db = {
    'host': MYEMS_SYSTEM_DB_HOST,
    'port': MYEMS_SYSTEM_DB_PORT,
    'database': MYEMS_SYSTEM_DB_DATABASE,
    'user': MYEMS_SYSTEM_DB_USER,
    'password': MYEMS_SYSTEM_DB_PASSWORD,
}

myems_energy_db = {
    'host': MYEMS_ENERGY_DB_HOST,
    'port': MYEMS_ENERGY_DB_PORT,
    'database': MYEMS_ENERGY_DB_DATABASE,
    'user': MYEMS_ENERGY_DB_USER,
    'password': MYEMS_ENERGY_DB_PASSWORD,
}

myems_energy_baseline_db = {
    'host': MYEMS_ENERGY_BASELINE_DB_HOST,
    'port': MYEMS_ENERGY_BASELINE_DB_PORT,
    'database': MYEMS_ENERGY_BASELINE_DB_DATABASE,
    'user': MYEMS_ENERGY_BASELINE_DB_USER,
    'password': MYEMS_ENERGY_BASELINE_DB_PASSWORD,
}

myems_billing_db = {
    'host': MYEMS_BILLING_DB_HOST,
    'port': MYEMS_BILLING_DB_PORT,
    'database': MYEMS_BILLING_DB_DATABASE,
    'user': MYEMS_BILLING_DB_USER,
    'password': MYEMS_BILLING_DB_PASSWORD,
}

myems_billing_baseline_db = {
    'host': MYEMS_BILLING_BASELINE_DB_HOST,
    'port': MYEMS_BILLING_BASELINE_DB_PORT,
    'database': MYEMS_BILLING_BASELINE_DB_DATABASE,
    'user': MYEMS_BILLING_BASELINE_DB_USER,
    'password': MYEMS_BILLING_BASELINE_DB_PASSWORD,
}

myems_historical_db = {
    'host': MYEMS_HISTORICAL_DB_HOST,
    'port': MYEMS_HISTORICAL_DB_PORT,
    'database': MYEMS_HISTORICAL_DB_DATABASE,
    'user': MYEMS_HISTORICAL_DB_USER,
    'password': MYEMS_HISTORICAL_DB_PASSWORD,
}

myems_user_db = {
    'host': MYEMS_USER_DB_HOST,
    'port': MYEMS_USER_DB_PORT,
    'database': MYEMS_USER_DB_DATABASE,
    'user': MYEMS_USER_DB_USER,
    'password': MYEMS_USER_DB_PASSWORD,
}

myems_fdd_db = {
    'host': MYEMS_FDD_DB_HOST,
    'port': MYEMS_FDD_DB_PORT,
    'database': MYEMS_FDD_DB_DATABASE,
    'user': MYEMS_FDD_DB_USER,
    'password': MYEMS_FDD_DB_PASSWORD,
}

myems_reporting_db = {
    'host': MYEMS_REPORTING_DB_HOST,
    'port': MYEMS_REPORTING_DB_PORT,
    'database': MYEMS_REPORTING_DB_DATABASE,
    'user': MYEMS_REPORTING_DB_USER,
    'password': MYEMS_REPORTING_DB_PASSWORD,
}

# indicated in how many minutes to calculate meter energy consumption
# 30 for half hourly period
# 60 for hourly period
minutes_to_count = MINUTES_TO_COUNT

# indicates the project's time zone offset from UTC
utc_offset = UTC_OFFSET

# indicates from when ( in local timezone) of the day to calculate working days
working_day_start_time_local = WORKING_DAY_START_TIME_LOCAL

# indicates where user uploaded files will be saved to
# must use the root folder of myems-admin web application
# for example if you serve myems-admin at /var/www/html/admin
# you should set the upload_path as below
upload_path = UPLOAD_PATH

# main currency unit
currency_unit = CURRENCY_UNIT
