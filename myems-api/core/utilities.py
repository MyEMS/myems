import collections
import statistics
from datetime import datetime, timedelta
from decimal import Decimal

import mysql.connector

import config


########################################################################################################################
# Aggregate hourly data by period
# rows_hourly: list of (start_datetime_utc, actual_value), should belong to one energy_category_id
# start_datetime_utc: start datetime in utc
# end_datetime_utc: end datetime in utc
# period_type: use one of the period types, 'hourly', 'daily', 'weekly', 'monthly' and 'yearly'
# Note: this procedure doesn't work with multiple energy categories
########################################################################################################################
def aggregate_hourly_data_by_period(rows_hourly, start_datetime_utc, end_datetime_utc, period_type):
    # todo: validate parameters
    if start_datetime_utc is None or \
            end_datetime_utc is None or \
            start_datetime_utc >= end_datetime_utc or \
            period_type not in ('hourly', 'daily', 'weekly', 'monthly', 'yearly'):
        return list()

    start_datetime_utc = start_datetime_utc.replace(tzinfo=None)
    end_datetime_utc = end_datetime_utc.replace(tzinfo=None)

    if period_type == "hourly":
        result_rows_hourly = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        current_datetime_utc = start_datetime_utc.replace(minute=0, second=0, microsecond=0, tzinfo=None)
        while current_datetime_utc <= end_datetime_utc:
            subtotal = Decimal(0.0)
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < current_datetime_utc + \
                        timedelta(minutes=config.minutes_to_count):
                    subtotal += row[1]
            result_rows_hourly.append((current_datetime_utc, subtotal))
            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

        return result_rows_hourly

    elif period_type == "daily":
        result_rows_daily = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        # calculate the start datetime in utc of the first day in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        current_datetime_utc = start_datetime_local.replace(hour=0) - timedelta(hours=int(config.utc_offset[1:3]))
        while current_datetime_utc <= end_datetime_utc:
            subtotal = Decimal(0.0)
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < current_datetime_utc + timedelta(days=1):
                    subtotal += row[1]
            result_rows_daily.append((current_datetime_utc, subtotal))
            current_datetime_utc += timedelta(days=1)

        return result_rows_daily

    elif period_type == 'weekly':
        result_rows_weekly = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        # calculate the start datetime in utc of the monday in the first week in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        weekday = start_datetime_local.weekday()
        current_datetime_utc = \
            start_datetime_local.replace(hour=0) - timedelta(days=weekday, hours=int(config.utc_offset[1:3]))
        while current_datetime_utc <= end_datetime_utc:

            next_datetime_utc = current_datetime_utc + timedelta(days=7)
            subtotal = Decimal(0.0)
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < next_datetime_utc:
                    subtotal += row[1]
            result_rows_weekly.append((current_datetime_utc, subtotal))
            current_datetime_utc = next_datetime_utc

        return result_rows_weekly

    elif period_type == "monthly":
        result_rows_monthly = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        # calculate the start datetime in utc of the first day in the first month in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        current_datetime_utc = \
            start_datetime_local.replace(day=1, hour=0) - timedelta(hours=int(config.utc_offset[1:3]))

        while current_datetime_utc <= end_datetime_utc:
            # calculate the next datetime in utc
            if current_datetime_utc.month == 1:
                temp_day = 28
                ny = current_datetime_utc.year
                if (ny % 100 != 0 and ny % 4 == 0) or (ny % 100 == 0 and ny % 400 == 0):
                    temp_day = 29

                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=temp_day,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month == 2:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month in [3, 5, 8, 10]:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=30,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month == 7:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month in [4, 6, 9, 11]:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month == 12:
                next_datetime_utc = datetime(year=current_datetime_utc.year + 1,
                                             month=1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)

            subtotal = Decimal(0.0)
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < next_datetime_utc:
                    subtotal += row[1]

            result_rows_monthly.append((current_datetime_utc, subtotal))
            current_datetime_utc = next_datetime_utc

        return result_rows_monthly

    elif period_type == "yearly":
        result_rows_yearly = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        # calculate the start datetime in utc of the first day in the first year in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        current_datetime_utc = start_datetime_local.replace(month=1, day=1, hour=0) - timedelta(
            hours=int(config.utc_offset[1:3]))

        while current_datetime_utc <= end_datetime_utc:
            # calculate the next datetime in utc
            # todo: timedelta of year
            next_datetime_utc = datetime(year=current_datetime_utc.year + 2,
                                         month=1,
                                         day=1,
                                         hour=current_datetime_utc.hour,
                                         minute=current_datetime_utc.minute,
                                         second=current_datetime_utc.second,
                                         microsecond=current_datetime_utc.microsecond,
                                         tzinfo=current_datetime_utc.tzinfo) - timedelta(days=1)
            subtotal = Decimal(0.0)
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < next_datetime_utc:
                    subtotal += row[1]

            result_rows_yearly.append((current_datetime_utc, subtotal))
            current_datetime_utc = next_datetime_utc
        return result_rows_yearly
    else:
        return list()


########################################################################################################################
# Get tariffs by energy category
########################################################################################################################
def get_energy_category_tariffs(cost_center_id, energy_category_id, start_datetime_utc, end_datetime_utc):
    # todo: validate parameters
    if cost_center_id is None:
        return dict()

    start_datetime_utc = start_datetime_utc.replace(tzinfo=None)
    end_datetime_utc = end_datetime_utc.replace(tzinfo=None)

    # get timezone offset in minutes, this value will be returned to client
    timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
    if config.utc_offset[0] == '-':
        timezone_offset = -timezone_offset

    tariff_dict = collections.OrderedDict()

    cnx = None
    cursor = None
    try:
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        query_tariffs = (" SELECT t.id, t.valid_from_datetime_utc, t.valid_through_datetime_utc "
                         " FROM tbl_tariffs t, tbl_cost_centers_tariffs cct "
                         " WHERE t.energy_category_id = %s AND "
                         "       t.id = cct.tariff_id AND "
                         "       cct.cost_center_id = %s AND "
                         "       t.valid_through_datetime_utc >= %s AND "
                         "       t.valid_from_datetime_utc <= %s "
                         " ORDER BY t.valid_from_datetime_utc ")
        cursor.execute(query_tariffs, (energy_category_id, cost_center_id, start_datetime_utc, end_datetime_utc,))
        rows_tariffs = cursor.fetchall()
    except Exception as e:
        print(str(e))
        if cnx:
            cnx.close()
        if cursor:
            cursor.close()
        return dict()

    if rows_tariffs is None or len(rows_tariffs) == 0:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return dict()

    for row in rows_tariffs:
        tariff_dict[row[0]] = {'valid_from_datetime_utc': row[1],
                               'valid_through_datetime_utc': row[2],
                               'rates': list()}

    try:
        query_timeofuse_tariffs = (" SELECT tariff_id, start_time_of_day, end_time_of_day, price "
                                   " FROM tbl_tariffs_timeofuses "
                                   " WHERE tariff_id IN ( " + ', '.join(map(str, tariff_dict.keys())) + ")"
                                   " ORDER BY tariff_id, start_time_of_day ")
        cursor.execute(query_timeofuse_tariffs, )
        rows_timeofuse_tariffs = cursor.fetchall()
    except Exception as e:
        print(str(e))
        if cnx:
            cnx.close()
        if cursor:
            cursor.close()
        return dict()

    if cursor:
        cursor.close()
    if cnx:
        cnx.close()

    if rows_timeofuse_tariffs is None or len(rows_timeofuse_tariffs) == 0:
        return dict()

    for row in rows_timeofuse_tariffs:
        tariff_dict[row[0]]['rates'].append({'start_time_of_day': row[1],
                                             'end_time_of_day': row[2],
                                             'price': row[3]})

    result = dict()
    for tariff_id, tariff_value in tariff_dict.items():
        current_datetime_utc = tariff_value['valid_from_datetime_utc']
        while current_datetime_utc < tariff_value['valid_through_datetime_utc']:
            for rate in tariff_value['rates']:
                current_datetime_local = current_datetime_utc + timedelta(minutes=timezone_offset)
                seconds_since_midnight = (current_datetime_local -
                                          current_datetime_local.replace(hour=0,
                                                                         second=0,
                                                                         microsecond=0,
                                                                         tzinfo=None)).total_seconds()
                if rate['start_time_of_day'].total_seconds() <= \
                        seconds_since_midnight < rate['end_time_of_day'].total_seconds():
                    result[current_datetime_utc] = rate['price']
                    break

            # start from the next time slot
            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    return {k: v for k, v in result.items() if start_datetime_utc <= k <= end_datetime_utc}


########################################################################################################################
# Get peak types of tariff by energy category
# peak types: toppeak, onpeak, midpeak, offpeak
########################################################################################################################
def get_energy_category_peak_types(cost_center_id, energy_category_id, start_datetime_utc, end_datetime_utc):
    # todo: validate parameters
    if cost_center_id is None:
        return dict()

    start_datetime_utc = start_datetime_utc.replace(tzinfo=None)
    end_datetime_utc = end_datetime_utc.replace(tzinfo=None)

    # get timezone offset in minutes, this value will be returned to client
    timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
    if config.utc_offset[0] == '-':
        timezone_offset = -timezone_offset

    tariff_dict = collections.OrderedDict()

    cnx = None
    cursor = None
    try:
        cnx = mysql.connector.connect(**config.myems_system_db)
        cursor = cnx.cursor()
        query_tariffs = (" SELECT t.id, t.valid_from_datetime_utc, t.valid_through_datetime_utc "
                         " FROM tbl_tariffs t, tbl_cost_centers_tariffs cct "
                         " WHERE t.energy_category_id = %s AND "
                         "       t.id = cct.tariff_id AND "
                         "       cct.cost_center_id = %s AND "
                         "       t.valid_through_datetime_utc >= %s AND "
                         "       t.valid_from_datetime_utc <= %s "
                         " ORDER BY t.valid_from_datetime_utc ")
        cursor.execute(query_tariffs, (energy_category_id, cost_center_id, start_datetime_utc, end_datetime_utc,))
        rows_tariffs = cursor.fetchall()
    except Exception as e:
        print(str(e))
        if cnx:
            cnx.close()
        if cursor:
            cursor.close()
        return dict()

    if rows_tariffs is None or len(rows_tariffs) == 0:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
        return dict()

    for row in rows_tariffs:
        tariff_dict[row[0]] = {'valid_from_datetime_utc': row[1],
                               'valid_through_datetime_utc': row[2],
                               'rates': list()}

    try:
        query_timeofuse_tariffs = (" SELECT tariff_id, start_time_of_day, end_time_of_day, peak_type "
                                   " FROM tbl_tariffs_timeofuses "
                                   " WHERE tariff_id IN ( " + ', '.join(map(str, tariff_dict.keys())) + ")"
                                   " ORDER BY tariff_id, start_time_of_day ")
        cursor.execute(query_timeofuse_tariffs, )
        rows_timeofuse_tariffs = cursor.fetchall()
    except Exception as e:
        print(str(e))
        if cnx:
            cnx.close()
        if cursor:
            cursor.close()
        return dict()

    if cursor:
        cursor.close()
    if cnx:
        cnx.close()

    if rows_timeofuse_tariffs is None or len(rows_timeofuse_tariffs) == 0:
        return dict()

    for row in rows_timeofuse_tariffs:
        tariff_dict[row[0]]['rates'].append({'start_time_of_day': row[1],
                                             'end_time_of_day': row[2],
                                             'peak_type': row[3]})

    result = dict()
    for tariff_id, tariff_value in tariff_dict.items():
        current_datetime_utc = tariff_value['valid_from_datetime_utc']
        while current_datetime_utc < tariff_value['valid_through_datetime_utc']:
            for rate in tariff_value['rates']:
                current_datetime_local = current_datetime_utc + timedelta(minutes=timezone_offset)
                seconds_since_midnight = (current_datetime_local -
                                          current_datetime_local.replace(hour=0,
                                                                         second=0,
                                                                         microsecond=0,
                                                                         tzinfo=None)).total_seconds()
                if rate['start_time_of_day'].total_seconds() <= \
                        seconds_since_midnight < rate['end_time_of_day'].total_seconds():
                    result[current_datetime_utc] = rate['peak_type']
                    break

            # start from the next time slot
            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

    return {k: v for k, v in result.items() if start_datetime_utc <= k <= end_datetime_utc}


########################################################################################################################
# Averaging calculator of hourly data by period
#   rows_hourly: list of (start_datetime_utc, actual_value), should belong to one energy_category_id
#   start_datetime_utc: start datetime in utc
#   end_datetime_utc: end datetime in utc
#   period_type: use one of the period types, 'hourly', 'daily', 'weekly', 'monthly' and 'yearly'
# Returns: periodically data of average and maximum
# Note: this procedure doesn't work with multiple energy categories
########################################################################################################################
def averaging_hourly_data_by_period(rows_hourly, start_datetime_utc, end_datetime_utc, period_type):
    # todo: validate parameters
    if start_datetime_utc is None or \
            end_datetime_utc is None or \
            start_datetime_utc >= end_datetime_utc or \
            period_type not in ('hourly', 'daily', 'weekly', 'monthly', 'yearly'):
        return list(), None, None

    start_datetime_utc = start_datetime_utc.replace(tzinfo=None)
    end_datetime_utc = end_datetime_utc.replace(tzinfo=None)

    if period_type == "hourly":
        result_rows_hourly = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        total = Decimal(0.0)
        maximum = None
        counter = 0
        current_datetime_utc = start_datetime_utc.replace(minute=0, second=0, microsecond=0, tzinfo=None)
        while current_datetime_utc <= end_datetime_utc:
            sub_total = Decimal(0.0)
            sub_maximum = None
            sub_counter = 0
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < current_datetime_utc + \
                        timedelta(minutes=config.minutes_to_count):
                    sub_total += row[1]
                    if sub_maximum is None:
                        sub_maximum = row[1]
                    elif sub_maximum < row[1]:
                        sub_maximum = row[1]
                    sub_counter += 1

            sub_average = (sub_total / sub_counter) if sub_counter > 0 else None
            result_rows_hourly.append((current_datetime_utc, sub_average, sub_maximum))

            total += sub_total
            counter += sub_counter
            if sub_maximum is None:
                pass
            elif maximum is None:
                maximum = sub_maximum
            elif maximum < sub_maximum:
                maximum = sub_maximum

            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

        average = total / counter if counter > 0 else None
        return result_rows_hourly, average, maximum

    elif period_type == "daily":
        result_rows_daily = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        total = Decimal(0.0)
        maximum = None
        counter = 0
        # calculate the start datetime in utc of the first day in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        current_datetime_utc = start_datetime_local.replace(hour=0) - timedelta(hours=int(config.utc_offset[1:3]))
        while current_datetime_utc <= end_datetime_utc:
            sub_total = Decimal(0.0)
            sub_maximum = None
            sub_counter = 0
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < current_datetime_utc + timedelta(days=1):
                    sub_total += row[1]
                    if sub_maximum is None:
                        sub_maximum = row[1]
                    elif sub_maximum < row[1]:
                        sub_maximum = row[1]
                    sub_counter += 1

            sub_average = (sub_total / sub_counter) if sub_counter > 0 else None
            result_rows_daily.append((current_datetime_utc, sub_average, sub_maximum))
            total += sub_total
            counter += sub_counter
            if sub_maximum is None:
                pass
            elif maximum is None:
                maximum = sub_maximum
            elif maximum < sub_maximum:
                maximum = sub_maximum
            current_datetime_utc += timedelta(days=1)

        average = total / counter if counter > 0 else None
        return result_rows_daily, average, maximum

    elif period_type == 'weekly':
        result_rows_weekly = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        total = Decimal(0.0)
        maximum = None
        counter = 0
        # calculate the start datetime in utc of the monday in the first week in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        weekday = start_datetime_local.weekday()
        current_datetime_utc = \
            start_datetime_local.replace(hour=0) - timedelta(days=weekday, hours=int(config.utc_offset[1:3]))
        while current_datetime_utc <= end_datetime_utc:
            sub_total = Decimal(0.0)
            sub_maximum = None
            sub_counter = 0
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < current_datetime_utc + timedelta(days=7):
                    sub_total += row[1]
                    if sub_maximum is None:
                        sub_maximum = row[1]
                    elif sub_maximum < row[1]:
                        sub_maximum = row[1]
                    sub_counter += 1

            sub_average = (sub_total / sub_counter) if sub_counter > 0 else None
            result_rows_weekly.append((current_datetime_utc, sub_average, sub_maximum))
            total += sub_total
            counter += sub_counter
            if sub_maximum is None:
                pass
            elif maximum is None:
                maximum = sub_maximum
            elif maximum < sub_maximum:
                maximum = sub_maximum
            current_datetime_utc += timedelta(days=7)

        average = total / counter if counter > 0 else None
        return result_rows_weekly, average, maximum

    elif period_type == "monthly":
        result_rows_monthly = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        total = Decimal(0.0)
        maximum = None
        counter = 0
        # calculate the start datetime in utc of the first day in the first month in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        current_datetime_utc = \
            start_datetime_local.replace(day=1, hour=0) - timedelta(hours=int(config.utc_offset[1:3]))

        while current_datetime_utc <= end_datetime_utc:
            # calculate the next datetime in utc
            if current_datetime_utc.month == 1:
                temp_day = 28
                ny = current_datetime_utc.year
                if (ny % 100 != 0 and ny % 4 == 0) or (ny % 100 == 0 and ny % 400 == 0):
                    temp_day = 29

                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=temp_day,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month == 2:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month in [3, 5, 8, 10]:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=30,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month == 7:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month in [4, 6, 9, 11]:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month == 12:
                next_datetime_utc = datetime(year=current_datetime_utc.year + 1,
                                             month=1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)

            sub_total = Decimal(0.0)
            sub_maximum = None
            sub_counter = 0
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < next_datetime_utc:
                    sub_total += row[1]
                    if sub_maximum is None:
                        sub_maximum = row[1]
                    elif sub_maximum < row[1]:
                        sub_maximum = row[1]
                    sub_counter += 1

            sub_average = (sub_total / sub_counter) if sub_counter > 0 else None
            result_rows_monthly.append((current_datetime_utc, sub_average, sub_maximum))
            total += sub_total
            counter += sub_counter
            if sub_maximum is None:
                pass
            elif maximum is None:
                maximum = sub_maximum
            elif maximum < sub_maximum:
                maximum = sub_maximum
            current_datetime_utc = next_datetime_utc

        average = total / counter if counter > 0 else None
        return result_rows_monthly, average, maximum

    elif period_type == "yearly":
        result_rows_yearly = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        total = Decimal(0.0)
        maximum = None
        counter = 0
        # calculate the start datetime in utc of the first day in the first month in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        current_datetime_utc = start_datetime_local.replace(month=1, day=1, hour=0) - timedelta(
            hours=int(config.utc_offset[1:3]))

        while current_datetime_utc <= end_datetime_utc:
            # calculate the next datetime in utc
            # todo: timedelta of year
            next_datetime_utc = datetime(year=current_datetime_utc.year + 2,
                                         month=1,
                                         day=1,
                                         hour=current_datetime_utc.hour,
                                         minute=current_datetime_utc.minute,
                                         second=current_datetime_utc.second,
                                         microsecond=current_datetime_utc.microsecond,
                                         tzinfo=current_datetime_utc.tzinfo) - timedelta(days=1)
            sub_total = Decimal(0.0)
            sub_maximum = None
            sub_counter = 0
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < next_datetime_utc:
                    sub_total += row[1]
                    if sub_maximum is None:
                        sub_maximum = row[1]
                    elif sub_maximum < row[1]:
                        sub_maximum = row[1]
                    sub_counter += 1

            sub_average = (sub_total / sub_counter) if sub_counter > 0 else None
            result_rows_yearly.append((current_datetime_utc, sub_average, sub_maximum))
            total += sub_total
            counter += sub_counter
            if sub_maximum is None:
                pass
            elif maximum is None:
                maximum = sub_maximum
            elif maximum < sub_maximum:
                maximum = sub_maximum
            current_datetime_utc = next_datetime_utc

        average = total / counter if counter > 0 else None
        return result_rows_yearly, average, maximum
    else:
        return list(), None, None


########################################################################################################################
# Statistics calculator of hourly data by period
#   rows_hourly: list of (start_datetime_utc, actual_value), should belong to one energy_category_id
#   start_datetime_utc: start datetime in utc
#   end_datetime_utc: end datetime in utc
#   period_type: use one of the period types, 'hourly', 'daily', 'weekly', 'monthly' and 'yearly'
# Returns: periodically data of values and statistics of mean, median, minimum, maximum, stdev and variance
# Note: this procedure doesn't work with multiple energy categories
########################################################################################################################
def statistics_hourly_data_by_period(rows_hourly, start_datetime_utc, end_datetime_utc, period_type):
    # todo: validate parameters
    if start_datetime_utc is None or \
            end_datetime_utc is None or \
            start_datetime_utc >= end_datetime_utc or \
            period_type not in ('hourly', 'daily', 'weekly', 'monthly', 'yearly'):
        return list(), None, None, None, None, None, None

    start_datetime_utc = start_datetime_utc.replace(tzinfo=None)
    end_datetime_utc = end_datetime_utc.replace(tzinfo=None)

    if period_type == "hourly":
        result_rows_hourly = list()
        sample_data = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        counter = 0
        mean = None
        median = None
        minimum = None
        maximum = None
        stdev = None
        variance = None
        current_datetime_utc = start_datetime_utc.replace(minute=0, second=0, microsecond=0, tzinfo=None)
        while current_datetime_utc <= end_datetime_utc:
            sub_total = Decimal(0.0)
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < current_datetime_utc + \
                        timedelta(minutes=config.minutes_to_count):
                    sub_total += row[1]

            result_rows_hourly.append((current_datetime_utc, sub_total))
            sample_data.append(sub_total)

            counter += 1
            if minimum is None:
                minimum = sub_total
            elif minimum > sub_total:
                minimum = sub_total

            if maximum is None:
                maximum = sub_total
            elif maximum < sub_total:
                maximum = sub_total

            current_datetime_utc += timedelta(minutes=config.minutes_to_count)

        if len(sample_data) > 1:
            mean = statistics.mean(sample_data)
            median = statistics.median(sample_data)
            stdev = statistics.stdev(sample_data)
            variance = statistics.variance(sample_data)

        return result_rows_hourly, mean, median, minimum, maximum, stdev, variance

    elif period_type == "daily":
        result_rows_daily = list()
        sample_data = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        counter = 0
        mean = None
        median = None
        minimum = None
        maximum = None
        stdev = None
        variance = None
        # calculate the start datetime in utc of the first day in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        current_datetime_utc = start_datetime_local.replace(hour=0) - timedelta(hours=int(config.utc_offset[1:3]))
        while current_datetime_utc <= end_datetime_utc:
            sub_total = Decimal(0.0)
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < current_datetime_utc + timedelta(days=1):
                    sub_total += row[1]

            result_rows_daily.append((current_datetime_utc, sub_total))
            sample_data.append(sub_total)

            counter += 1
            if minimum is None:
                minimum = sub_total
            elif minimum > sub_total:
                minimum = sub_total

            if maximum is None:
                maximum = sub_total
            elif maximum < sub_total:
                maximum = sub_total
            current_datetime_utc += timedelta(days=1)

        if len(sample_data) > 1:
            mean = statistics.mean(sample_data)
            median = statistics.median(sample_data)
            stdev = statistics.stdev(sample_data)
            variance = statistics.variance(sample_data)

        return result_rows_daily, mean, median, minimum, maximum, stdev, variance

    elif period_type == "weekly":
        result_rows_weekly = list()
        sample_data = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        counter = 0
        mean = None
        median = None
        minimum = None
        maximum = None
        stdev = None
        variance = None
        # calculate the start datetime in utc of the monday in the first week in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        weekday = start_datetime_local.weekday()
        current_datetime_utc = \
            start_datetime_local.replace(hour=0) - timedelta(days=weekday, hours=int(config.utc_offset[1:3]))
        while current_datetime_utc <= end_datetime_utc:
            sub_total = Decimal(0.0)
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < current_datetime_utc + timedelta(days=7):
                    sub_total += row[1]

            result_rows_weekly.append((current_datetime_utc, sub_total))
            sample_data.append(sub_total)

            counter += 1
            if minimum is None:
                minimum = sub_total
            elif minimum > sub_total:
                minimum = sub_total

            if maximum is None:
                maximum = sub_total
            elif maximum < sub_total:
                maximum = sub_total
            current_datetime_utc += timedelta(days=7)

        if len(sample_data) > 1:
            mean = statistics.mean(sample_data)
            median = statistics.median(sample_data)
            stdev = statistics.stdev(sample_data)
            variance = statistics.variance(sample_data)

        return result_rows_weekly, mean, median, minimum, maximum, stdev, variance

    elif period_type == "monthly":
        result_rows_monthly = list()
        sample_data = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        counter = 0
        mean = None
        median = None
        minimum = None
        maximum = None
        stdev = None
        variance = None
        # calculate the start datetime in utc of the first day in the first month in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        current_datetime_utc = \
            start_datetime_local.replace(day=1, hour=0) - timedelta(hours=int(config.utc_offset[1:3]))

        while current_datetime_utc <= end_datetime_utc:
            # calculate the next datetime in utc
            if current_datetime_utc.month == 1:
                temp_day = 28
                ny = current_datetime_utc.year
                if (ny % 100 != 0 and ny % 4 == 0) or (ny % 100 == 0 and ny % 400 == 0):
                    temp_day = 29

                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=temp_day,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month == 2:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month in [3, 5, 8, 10]:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=30,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month == 7:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month in [4, 6, 9, 11]:
                next_datetime_utc = datetime(year=current_datetime_utc.year,
                                             month=current_datetime_utc.month + 1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)
            elif current_datetime_utc.month == 12:
                next_datetime_utc = datetime(year=current_datetime_utc.year + 1,
                                             month=1,
                                             day=31,
                                             hour=current_datetime_utc.hour,
                                             minute=current_datetime_utc.minute,
                                             second=0,
                                             microsecond=0,
                                             tzinfo=None)

            sub_total = Decimal(0.0)
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < next_datetime_utc:
                    sub_total += row[1]

            result_rows_monthly.append((current_datetime_utc, sub_total))
            sample_data.append(sub_total)

            counter += 1
            if minimum is None:
                minimum = sub_total
            elif minimum > sub_total:
                minimum = sub_total

            if maximum is None:
                maximum = sub_total
            elif maximum < sub_total:
                maximum = sub_total
            current_datetime_utc = next_datetime_utc

        if len(sample_data) > 1:
            mean = statistics.mean(sample_data)
            median = statistics.median(sample_data)
            stdev = statistics.stdev(sample_data)
            variance = statistics.variance(sample_data)

        return result_rows_monthly, mean, median, minimum, maximum, stdev, variance

    elif period_type == "yearly":
        result_rows_yearly = list()
        sample_data = list()
        # todo: add config.working_day_start_time_local
        # todo: add config.minutes_to_count
        mean = None
        median = None
        minimum = None
        maximum = None
        stdev = None
        variance = None
        # calculate the start datetime in utc of the first day in the first month in local
        start_datetime_local = start_datetime_utc + timedelta(hours=int(config.utc_offset[1:3]))
        current_datetime_utc = start_datetime_local.replace(month=1, day=1, hour=0) - timedelta(
            hours=int(config.utc_offset[1:3]))

        while current_datetime_utc <= end_datetime_utc:
            # calculate the next datetime in utc
            # todo: timedelta of year
            next_datetime_utc = datetime(year=current_datetime_utc.year + 2,
                                         month=1,
                                         day=1,
                                         hour=current_datetime_utc.hour,
                                         minute=current_datetime_utc.minute,
                                         second=current_datetime_utc.second,
                                         microsecond=current_datetime_utc.microsecond,
                                         tzinfo=current_datetime_utc.tzinfo) - timedelta(days=1)
            sub_total = Decimal(0.0)
            for row in rows_hourly:
                if current_datetime_utc <= row[0] < next_datetime_utc:
                    sub_total += row[1]

            result_rows_yearly.append((current_datetime_utc, sub_total))
            sample_data.append(sub_total)

            if minimum is None:
                minimum = sub_total
            elif minimum > sub_total:
                minimum = sub_total
            if maximum is None:
                maximum = sub_total
            elif maximum < sub_total:
                maximum = sub_total

            current_datetime_utc = next_datetime_utc

        if len(sample_data) > 1:
            mean = statistics.mean(sample_data)
            median = statistics.median(sample_data)
            stdev = statistics.stdev(sample_data)
            variance = statistics.variance(sample_data)

        return result_rows_yearly, mean, median, minimum, maximum, stdev, variance

    else:
        return list(), None, None, None, None, None, None
