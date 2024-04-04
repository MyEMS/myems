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

myems_energy_baseline_db = {
    'host': config('MYEMS_ENERGY_BASELINE_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_ENERGY_BASELINE_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_ENERGY_BASELINE_DB_DATABASE', default='myems_energy_baseline_db'),
    'user': config('MYEMS_ENERGY_BASELINE_DB_USER', default='root'),
    'password': config('MYEMS_ENERGY_BASELINE_DB_PASSWORD', default='!MyEMS1'),
}

myems_billing_db = {
    'host': config('MYEMS_BILLING_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_BILLING_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_BILLING_DB_DATABASE', default='myems_billing_db'),
    'user': config('MYEMS_BILLING_DB_USER', default='root'),
    'password': config('MYEMS_BILLING_DB_PASSWORD', default='!MyEMS1'),
}

myems_billing_baseline_db = {
    'host': config('MYEMS_BILLING_BASELINE_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_BILLING_BASELINE_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_BILLING_BASELINE_DB_DATABASE', default='myems_billing_baseline_db'),
    'user': config('MYEMS_BILLING_BASELINE_DB_USER', default='root'),
    'password': config('MYEMS_BILLING_BASELINE_DB_PASSWORD', default='!MyEMS1'),
}

myems_historical_db = {
    'host': config('MYEMS_HISTORICAL_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_HISTORICAL_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_HISTORICAL_DB_DATABASE', default='myems_historical_db'),
    'user': config('MYEMS_HISTORICAL_DB_USER', default='root'),
    'password': config('MYEMS_HISTORICAL_DB_PASSWORD', default='!MyEMS1'),
}

myems_user_db = {
    'host': config('MYEMS_USER_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_USER_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_USER_DB_DATABASE', default='myems_user_db'),
    'user': config('MYEMS_USER_DB_USER', default='root'),
    'password': config('MYEMS_USER_DB_PASSWORD', default='!MyEMS1'),
}

myems_fdd_db = {
    'host': config('MYEMS_FDD_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_FDD_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_FDD_DB_DATABASE', default='myems_fdd_db'),
    'user': config('MYEMS_FDD_DB_USER', default='root'),
    'password': config('MYEMS_FDD_DB_PASSWORD', default='!MyEMS1'),
}

myems_reporting_db = {
    'host': config('MYEMS_REPORTING_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_REPORTING_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_REPORTING_DB_DATABASE', default='myems_reporting_db'),
    'user': config('MYEMS_REPORTING_DB_USER', default='root'),
    'password': config('MYEMS_REPORTING_DB_PASSWORD', default='!MyEMS1'),
}

myems_carbon_db = {
    'host': config('MYEMS_CARBON_DB_HOST', default='127.0.0.1'),
    'port': config('MYEMS_CARBON_DB_PORT', default=3306, cast=int),
    'database': config('MYEMS_CARBON_DB_DATABASE', default='myems_carbon_db'),
    'user': config('MYEMS_CARBON_DB_USER', default='root'),
    'password': config('MYEMS_CARBON_DB_PASSWORD', default='!MyEMS1'),
}

myems_mqtt_broker = {
    'host': config('MYEMS_MQTT_BROKER_HOST', default='127.0.0.1'),
    'port': config('MYEMS_MQTT_BROKER_PORT', default=1883, cast=int),
    'username': config('MYEMS_MQTT_BROKER_USERNAME', default='admin'),
    'password': config('MYEMS_MQTT_BROKER_PASSWORD', default='!MyEMS123'),
}

# indicated in how many minutes to calculate meter energy consumption
# 30 for half hourly period
# 60 for hourly period
minutes_to_count = config('MINUTES_TO_COUNT', default=60, cast=int)

# indicates the project's time zone offset from UTC
utc_offset = config('UTC_OFFSET', default='+08:00')

# indicates from when ( in local timezone) of the day to calculate working days
working_day_start_time_local = config('WORKING_DAY_START_TIME_LOCAL', default='00:00:00')

# indicates where user uploaded files will be saved to
# must use the root folder of myems-admin web application
# for example if you serve myems-admin at /var/www/myems-admin
# you should set the upload_path as below
upload_path = config('UPLOAD_PATH', default='/var/www/myems-admin/upload/')

# main currency unit
currency_unit = config('CURRENCY_UNIT', default='CNY')

# maximum failed login count, otherwise the user should be locked
maximum_failed_login_count = config('MAXIMUM_FAILED_LOGIN_COUNT', default=3, cast=int)

# indicates if the tariff appended to parameters data
is_tariff_appended = config('IS_TARIFF_APPENDED', default=True, cast=bool)

# indicates if search meters recursively by space tree
# this config is used in meter tracking report and in meter batch report
is_recursive = config('IS_RECURSIVE', default=True, cast=bool)

# indicates how long in second the user session expires
# default value is 60 * 60 * 8 = 28800
session_expires_in_seconds = config('SESSION_EXPIRES_IN_SECONDS', default=28800, cast=int)
