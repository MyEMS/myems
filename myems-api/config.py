myems_system_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_system_db',
}

myems_energy_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_energy_db',
}

myems_energy_baseline_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_energy_baseline_db',
}

myems_billing_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_billing_db',
}

myems_billing_baseline_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_billing_baseline_db',
}

myems_historical_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_historical_db',
}

myems_user_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_user_db',
}

myems_fdd_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_fdd_db',
}

myems_reporting_db = {
    'user': 'root',
    'password': '!MyEMS1',
    'host': '127.0.0.1',
    'database': 'myems_reporting_db',
}

# address for Cookie domain
myems_api_domain = '127.0.0.1'

# indicated in how many minutes to calculate meter energy consumption
# 30 for half hourly period
# 60 for hourly period
minutes_to_count = 60

# indicates the project's time zone offset from UTC
utc_offset = '+08:00'

# indicates from when ( in local timezone) of the day to calculate working days
working_day_start_time_local = '00:00:00'

# indicates where user uploaded files will be saved to
# must use the root folder of myems-admin web application
# for example if you serve myems-admin at /var/www/html/admin
# you should set the upload_path as below
upload_path = '/var/www/html/admin/upload/'

# main currency unit
currency_unit = 'CNY'
