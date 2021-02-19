from datetime import timedelta
import mysql.connector
import config
import collections


########################################################################################################################
# Get tariffs by energy category
########################################################################################################################
def get_energy_category_tariffs(cost_center_id, energy_category_id, start_datetime_utc, end_datetime_utc):
    # todo: verify parameters
    if cost_center_id is None:
        return dict()

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
            cnx.disconnect()
        if cursor:
            cursor.close()
        return dict()

    if rows_tariffs is None or len(rows_tariffs) == 0:
        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()
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
            cnx.disconnect()
        if cursor:
            cursor.close()
        return dict()

    if cursor:
        cursor.close()
    if cnx:
        cnx.disconnect()

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
# Get tariffs by energy item
########################################################################################################################
def get_energy_item_tariffs(cost_center_id, energy_item_id, start_datetime_utc, end_datetime_utc):
    # todo: verify parameters
    if cost_center_id is None:
        return dict()

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
                         " FROM tbl_tariffs t, tbl_cost_centers_tariffs cct, tbl_energy_items ei "
                         " WHERE ei.id = %s AND "
                         "       t.energy_category_id = ei.energy_category_id AND "
                         "       t.id = cct.tariff_id AND "
                         "       cct.cost_center_id = %s AND "
                         "       t.valid_through_datetime_utc >= %s AND "
                         "       t.valid_from_datetime_utc <= %s "
                         " ORDER BY t.valid_from_datetime_utc ")
        cursor.execute(query_tariffs, (energy_item_id, cost_center_id, start_datetime_utc, end_datetime_utc,))
        rows_tariffs = cursor.fetchall()
    except Exception as e:
        print(str(e))
        if cnx:
            cnx.disconnect()
        if cursor:
            cursor.close()
        return dict()

    if rows_tariffs is None or len(rows_tariffs) == 0:
        if cursor:
            cursor.close()
        if cnx:
            cnx.disconnect()
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
            cnx.disconnect()
        if cursor:
            cursor.close()
        return dict()

    if cursor:
        cursor.close()
    if cnx:
        cnx.disconnect()

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
