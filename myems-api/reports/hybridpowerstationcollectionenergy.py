from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
from core import utilities
import config
from core.useractivity import access_control, api_key_control


class Reporting:
    def __init__(self):
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the hybrid power station list
    # Step 3: query charge energy data in 7 days
    # Step 4: query discharge energy data in 7 days
    # Step 5: query fuel consumption data in 7 days
    # Step 6: query charge energy data in this month
    # Step 7: query discharge energy data in this month
    # Step 8: query fuel consumption data in this month
    # Step 9: query charge energy data in this year
    # Step 10: query discharge energy data in this year
    # Step 11: query fuel consumption data in this year
    # Step 12: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        user_uuid = req.params.get('useruuid')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if user_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_USER_UUID')
        else:
            user_uuid = str.strip(user_uuid)
            if len(user_uuid) != 36:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_USER_UUID')

        ################################################################################################################
        # Step 2: query the hybrid power station list
        ################################################################################################################
        cnx_user = mysql.connector.connect(**config.myems_user_db)
        cursor_user = cnx_user.cursor()
        cursor_user.execute(" SELECT id, is_admin, privilege_id "
                            " FROM tbl_users "
                            " WHERE uuid = %s ", (user_uuid,))
        row_user = cursor_user.fetchone()
        if row_user is None:
            if cursor_user:
                cursor_user.close()
            if cnx_user:
                cnx_user.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.USER_NOT_FOUND')

        user = {'id': row_user[0], 'is_admin': row_user[1], 'privilege_id': row_user[2]}

        # Get hybrid power stations
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
        query = (" SELECT m.id, m.name, m.uuid "
                 " FROM tbl_hybrid_power_stations m, tbl_hybrid_power_stations_users mu "
                 " WHERE m.phase_of_lifecycle != '3installation' "
                 "       AND m.id = mu.hybrid_power_station_id "
                 "       AND mu.user_id = %s "
                 " ORDER BY id ")
        cursor_system_db.execute(query, (user['id'],))
        rows_hybrid_power_stations = cursor_system_db.fetchall()

        hybrid_power_station_list = list()
        hybrid_power_station_names = list()
        if rows_hybrid_power_stations is not None and len(rows_hybrid_power_stations) > 0:
            for row in rows_hybrid_power_stations:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2]}
                hybrid_power_station_list.append(meta_result)
                hybrid_power_station_names.append(row[1])
        ################################################################################################################
        # Step 3: query charge energy data in 7 days
        ################################################################################################################
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        reporting = dict()
        reporting['charge_7_days'] = dict()
        reporting['discharge_7_days'] = dict()
        reporting['fuel_7_days'] = dict()
        reporting['charge_this_month'] = dict()
        reporting['discharge_this_month'] = dict()
        reporting['fuel_this_month'] = dict()
        reporting['charge_this_year'] = dict()
        reporting['discharge_this_year'] = dict()
        reporting['fuel_this_year'] = dict()

        end_datetime_utc = datetime.utcnow()
        end_datetime_local = datetime.utcnow() + timedelta(minutes=timezone_offset)
        period_type = 'daily'
        start_datetime_local = end_datetime_local.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=6)
        start_datetime_utc = start_datetime_local - timedelta(minutes=timezone_offset)
        print('start_datetime_local:' + start_datetime_local.isoformat())
        print('end_datetime_local:' + end_datetime_local.isoformat())
        print('start_datetime_utc:' + start_datetime_utc.isoformat())
        print('end_datetime_utc:' + end_datetime_utc.isoformat())

        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()

        reporting['charge_7_days'] = dict()
        reporting['charge_7_days']['timestamps_array'] = list()
        reporting['charge_7_days']['values_array'] = list()
        reporting['charge_7_days']['total_values'] = list()

        for hybrid_power_station in hybrid_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_hybrid_power_station_charge_hourly "
                     " WHERE hybrid_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (hybrid_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_charge_hourly = cursor_energy_db.fetchall()

            rows_charge_periodically = utilities.aggregate_hourly_data_by_period(rows_charge_hourly,
                                                                                 start_datetime_utc,
                                                                                 end_datetime_utc,
                                                                                 period_type)
            for row_charge_periodically in rows_charge_periodically:
                current_datetime_local = row_charge_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.strftime('%Y-%m')
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.strftime('%Y')

                actual_value = Decimal(0.0) if row_charge_periodically[1] is None else row_charge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['charge_7_days']['timestamps_array'].append(timestamps)
            reporting['charge_7_days']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['charge_7_days']['total_values']) <= i:
                    reporting['charge_7_days']['total_values'].append(Decimal(0.0))
                else:
                    reporting['charge_7_days']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 4: query discharge energy data in 7 days
        ################################################################################################################
        reporting['discharge_7_days'] = dict()
        reporting['discharge_7_days']['timestamps_array'] = list()
        reporting['discharge_7_days']['values_array'] = list()
        reporting['discharge_7_days']['total_values'] = list()
        for hybrid_power_station in hybrid_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_hybrid_power_station_discharge_hourly "
                     " WHERE hybrid_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (hybrid_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_discharge_hourly = cursor_energy_db.fetchall()

            rows_discharge_periodically = utilities.aggregate_hourly_data_by_period(rows_discharge_hourly,
                                                                                    start_datetime_utc,
                                                                                    end_datetime_utc,
                                                                                    period_type)

            for row_discharge_periodically in rows_discharge_periodically:
                current_datetime_local = row_discharge_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.strftime('%Y-%m')
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.strftime('%Y')

                actual_value = Decimal(0.0) if row_discharge_periodically[1] is None else row_discharge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['discharge_7_days']['timestamps_array'].append(timestamps)
            reporting['discharge_7_days']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['discharge_7_days']['total_values']) <= i:
                    reporting['discharge_7_days']['total_values'].append(Decimal(0.0))
                else:
                    reporting['discharge_7_days']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 5: query fuel consumption data in 7 days
        ################################################################################################################
        reporting['fuel_7_days'] = dict()
        reporting['fuel_7_days']['timestamps_array'] = list()
        reporting['fuel_7_days']['values_array'] = list()
        reporting['fuel_7_days']['total_values'] = list()
        for hybrid_power_station in hybrid_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_hybrid_power_station_fuel_hourly "
                     " WHERE hybrid_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (hybrid_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_fuel_hourly = cursor_energy_db.fetchall()

            rows_fuel_periodically = utilities.aggregate_hourly_data_by_period(rows_fuel_hourly,
                                                                               start_datetime_utc,
                                                                               end_datetime_utc,
                                                                               period_type)

            for row_fuel_periodically in rows_fuel_periodically:
                current_datetime_local = row_fuel_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.strftime('%Y-%m')
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.strftime('%Y')

                actual_value = Decimal(0.0) if row_fuel_periodically[1] is None else row_fuel_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['fuel_7_days']['timestamps_array'].append(timestamps)
            reporting['fuel_7_days']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['fuel_7_days']['total_values']) <= i:
                    reporting['fuel_7_days']['total_values'].append(Decimal(0.0))
                else:
                    reporting['fuel_7_days']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 6: query charge energy data in this month
        ################################################################################################################
        end_datetime_utc = datetime.utcnow()
        end_datetime_local = datetime.utcnow() + timedelta(minutes=timezone_offset)
        period_type = 'daily'
        start_datetime_local = end_datetime_local.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_datetime_utc = start_datetime_local - timedelta(minutes=timezone_offset)
        print('start_datetime_local:' + start_datetime_local.isoformat())
        print('end_datetime_local:' + end_datetime_local.isoformat())
        print('start_datetime_utc:' + start_datetime_utc.isoformat())
        print('end_datetime_utc:' + end_datetime_utc.isoformat())

        reporting['charge_this_month'] = dict()
        reporting['charge_this_month']['timestamps_array'] = list()
        reporting['charge_this_month']['values_array'] = list()
        reporting['charge_this_month']['total_values'] = list()

        for hybrid_power_station in hybrid_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_hybrid_power_station_charge_hourly "
                     " WHERE hybrid_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (hybrid_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_charge_hourly = cursor_energy_db.fetchall()

            rows_charge_periodically = utilities.aggregate_hourly_data_by_period(rows_charge_hourly,
                                                                                 start_datetime_utc,
                                                                                 end_datetime_utc,
                                                                                 period_type)

            for row_charge_periodically in rows_charge_periodically:
                current_datetime_local = row_charge_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.strftime('%Y-%m')
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.strftime('%Y')

                actual_value = Decimal(0.0) if row_charge_periodically[1] is None else row_charge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['charge_this_month']['timestamps_array'].append(timestamps)
            reporting['charge_this_month']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['charge_this_month']['total_values']) <= i:
                    reporting['charge_this_month']['total_values'].append(Decimal(0.0))
                else:
                    reporting['charge_this_month']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 7: query discharge energy data in this month
        ################################################################################################################
        reporting['discharge_this_month'] = dict()
        reporting['discharge_this_month']['timestamps_array'] = list()
        reporting['discharge_this_month']['values_array'] = list()
        reporting['discharge_this_month']['total_values'] = list()

        for hybrid_power_station in hybrid_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_hybrid_power_station_discharge_hourly "
                     " WHERE hybrid_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (hybrid_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_discharge_hourly = cursor_energy_db.fetchall()

            rows_discharge_periodically = utilities.aggregate_hourly_data_by_period(rows_discharge_hourly,
                                                                                    start_datetime_utc,
                                                                                    end_datetime_utc,
                                                                                    period_type)

            for row_discharge_periodically in rows_discharge_periodically:
                current_datetime_local = row_discharge_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.strftime('%Y-%m')
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.strftime('%Y')

                actual_value = Decimal(0.0) if row_discharge_periodically[1] is None else row_discharge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['discharge_this_month']['timestamps_array'].append(timestamps)
            reporting['discharge_this_month']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['discharge_this_month']['total_values']) <= i:
                    reporting['discharge_this_month']['total_values'].append(Decimal(0.0))
                else:
                    reporting['discharge_this_month']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 8: query fuel energy data in this month
        ################################################################################################################
        reporting['fuel_this_month'] = dict()
        reporting['fuel_this_month']['timestamps_array'] = list()
        reporting['fuel_this_month']['values_array'] = list()
        reporting['fuel_this_month']['total_values'] = list()

        for hybrid_power_station in hybrid_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_hybrid_power_station_fuel_hourly "
                     " WHERE hybrid_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (hybrid_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_fuel_hourly = cursor_energy_db.fetchall()

            rows_fuel_periodically = utilities.aggregate_hourly_data_by_period(rows_fuel_hourly,
                                                                               start_datetime_utc,
                                                                               end_datetime_utc,
                                                                               period_type)

            for row_fuel_periodically in rows_fuel_periodically:
                current_datetime_local = row_fuel_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.strftime('%Y-%m')
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.strftime('%Y')

                actual_value = Decimal(0.0) if row_fuel_periodically[1] is None else row_fuel_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['fuel_this_month']['timestamps_array'].append(timestamps)
            reporting['fuel_this_month']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['fuel_this_month']['total_values']) <= i:
                    reporting['fuel_this_month']['total_values'].append(Decimal(0.0))
                else:
                    reporting['fuel_this_month']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 9: query charge energy data in this year
        ################################################################################################################
        end_datetime_utc = datetime.utcnow()
        end_datetime_local = datetime.utcnow() + timedelta(minutes=timezone_offset)
        period_type = 'monthly'
        start_datetime_local = end_datetime_local.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        start_datetime_utc = start_datetime_local - timedelta(minutes=timezone_offset)
        print('start_datetime_local:' + start_datetime_local.isoformat())
        print('end_datetime_local:' + end_datetime_local.isoformat())
        print('start_datetime_utc:' + start_datetime_utc.isoformat())
        print('end_datetime_utc:' + end_datetime_utc.isoformat())

        reporting['charge_this_year'] = dict()
        reporting['charge_this_year']['timestamps_array'] = list()
        reporting['charge_this_year']['values_array'] = list()
        reporting['charge_this_year']['total_values'] = list()

        for hybrid_power_station in hybrid_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_hybrid_power_station_charge_hourly "
                     " WHERE hybrid_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (hybrid_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_charge_hourly = cursor_energy_db.fetchall()

            rows_charge_periodically = utilities.aggregate_hourly_data_by_period(rows_charge_hourly,
                                                                                 start_datetime_utc,
                                                                                 end_datetime_utc,
                                                                                 period_type)
            for row_charge_periodically in rows_charge_periodically:
                current_datetime_local = row_charge_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.strftime('%Y-%m')
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.strftime('%Y')

                actual_value = Decimal(0.0) if row_charge_periodically[1] is None else row_charge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['charge_this_year']['timestamps_array'].append(timestamps)
            reporting['charge_this_year']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['charge_this_year']['total_values']) <= i:
                    reporting['charge_this_year']['total_values'].append(Decimal(0.0))
                else:
                    reporting['charge_this_year']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 10: query discharge energy data in this year
        ################################################################################################################
        reporting['discharge_this_year'] = dict()
        reporting['discharge_this_year']['timestamps_array'] = list()
        reporting['discharge_this_year']['values_array'] = list()
        reporting['discharge_this_year']['total_values'] = list()

        for hybrid_power_station in hybrid_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_hybrid_power_station_discharge_hourly "
                     " WHERE hybrid_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (hybrid_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_discharge_hourly = cursor_energy_db.fetchall()

            rows_discharge_periodically = utilities.aggregate_hourly_data_by_period(rows_discharge_hourly,
                                                                                    start_datetime_utc,
                                                                                    end_datetime_utc,
                                                                                    period_type)
            for row_discharge_periodically in rows_discharge_periodically:
                current_datetime_local = row_discharge_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.strftime('%Y-%m')
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.strftime('%Y')

                actual_value = Decimal(0.0) if row_discharge_periodically[1] is None else row_discharge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['discharge_this_year']['timestamps_array'].append(timestamps)
            reporting['discharge_this_year']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['discharge_this_year']['total_values']) <= i:
                    reporting['discharge_this_year']['total_values'].append(Decimal(0.0))
                else:
                    reporting['discharge_this_year']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 11: query fuel energy data in this year
        ################################################################################################################
        reporting['fuel_this_year'] = dict()
        reporting['fuel_this_year']['timestamps_array'] = list()
        reporting['fuel_this_year']['values_array'] = list()
        reporting['fuel_this_year']['total_values'] = list()

        for hybrid_power_station in hybrid_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_hybrid_power_station_fuel_hourly "
                     " WHERE hybrid_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (hybrid_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_fuel_hourly = cursor_energy_db.fetchall()

            rows_fuel_periodically = utilities.aggregate_hourly_data_by_period(rows_fuel_hourly,
                                                                               start_datetime_utc,
                                                                               end_datetime_utc,
                                                                               period_type)
            for row_fuel_periodically in rows_fuel_periodically:
                current_datetime_local = row_fuel_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.strftime('%Y-%m')
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.strftime('%Y')

                actual_value = Decimal(0.0) if row_fuel_periodically[1] is None else row_fuel_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['fuel_this_year']['timestamps_array'].append(timestamps)
            reporting['fuel_this_year']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['fuel_this_year']['total_values']) <= i:
                    reporting['fuel_this_year']['total_values'].append(Decimal(0.0))
                else:
                    reporting['fuel_this_year']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 12: construct the report
        ################################################################################################################
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()

        result = dict()
        result['hybrid_power_station_names'] = hybrid_power_station_names
        result['reporting'] = reporting
        resp.text = json.dumps(result)
