"""
Photovoltaic Power Station Collection Energy Report API

This module provides REST API endpoints for generating photovoltaic power station collection energy reports.
It analyzes energy generation data from photovoltaic power stations, providing comprehensive insights
into solar generation patterns, performance trends, and optimization opportunities.

Key Features:
- Photovoltaic power station energy generation analysis
- Base period vs reporting period comparison
- Solar generation trends and patterns
- Generation optimization insights
- Performance metrics calculation
- Solar generation analysis

Report Components:
- Photovoltaic power station energy generation summary
- Base period comparison data
- Solar generation trends
- Generation optimization recommendations
- Performance indicators
- Generation pattern analysis

The module uses Falcon framework for REST API and includes:
- Database queries for energy generation data
- Energy generation calculations
- Trend analysis algorithms
- Multi-language support
- User authentication and authorization
"""

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
        _ = req
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the energy storage power station list
    # Step 3: query generation energy data in 7 days
    # Step 4: query generation energy data in this month
    # Step 5: query generation energy data in this year
    # Step 6: construct the report
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
        # Step 2: query the energy storage power station list
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

        # Get energy storage power stations
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
        query = (" SELECT m.id, m.name, m.uuid "
                 " FROM tbl_photovoltaic_power_stations m, tbl_photovoltaic_power_stations_users mu "
                 " WHERE m.phase_of_lifecycle != '3installation' "
                 "       AND m.id = mu.photovoltaic_power_station_id "
                 "       AND mu.user_id = %s "
                 " ORDER BY id ")
        cursor_system_db.execute(query, (user['id'],))
        rows_photovoltaic_power_stations = cursor_system_db.fetchall()

        photovoltaic_power_station_list = list()
        photovoltaic_power_station_names = list()
        if rows_photovoltaic_power_stations is not None and len(rows_photovoltaic_power_stations) > 0:
            for row in rows_photovoltaic_power_stations:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2]}
                photovoltaic_power_station_list.append(meta_result)
                photovoltaic_power_station_names.append(row[1])
        ################################################################################################################
        # Step 3: query generation energy data in 7 days
        ################################################################################################################
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        reporting = dict()
        reporting['generation_7_days'] = dict()
        reporting['generation_this_month'] = dict()
        reporting['generation_this_year'] = dict()

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

        reporting['generation_7_days'] = dict()
        reporting['generation_7_days']['timestamps_array'] = list()
        reporting['generation_7_days']['values_array'] = list()
        reporting['generation_7_days']['total_values'] = list()

        for photovoltaic_power_station in photovoltaic_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_photovoltaic_power_station_generation_hourly "
                     " WHERE photovoltaic_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (photovoltaic_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_generation_hourly = cursor_energy_db.fetchall()

            rows_generation_periodically = utilities.aggregate_hourly_data_by_period(rows_generation_hourly,
                                                                                     start_datetime_utc,
                                                                                     end_datetime_utc,
                                                                                     period_type)
            for row_generation_periodically in rows_generation_periodically:
                current_datetime_local = row_generation_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.isoformat()[0:19]
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.isoformat()[0:10]
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.isoformat()[0:10]
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.isoformat()[0:7]
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.isoformat()[0:4]

                actual_value = Decimal(0.0) if row_generation_periodically[1] is None else \
                    row_generation_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['generation_7_days']['timestamps_array'].append(timestamps)
            reporting['generation_7_days']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['generation_7_days']['total_values']) <= i:
                    reporting['generation_7_days']['total_values'].append(Decimal(0.0))
                else:
                    reporting['generation_7_days']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 5: query generation energy data in this month
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

        reporting['generation_this_month'] = dict()
        reporting['generation_this_month']['timestamps_array'] = list()
        reporting['generation_this_month']['values_array'] = list()
        reporting['generation_this_month']['total_values'] = list()

        for photovoltaic_power_station in photovoltaic_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_photovoltaic_power_station_generation_hourly "
                     " WHERE photovoltaic_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (photovoltaic_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_generation_hourly = cursor_energy_db.fetchall()

            rows_generation_periodically = utilities.aggregate_hourly_data_by_period(rows_generation_hourly,
                                                                                     start_datetime_utc,
                                                                                     end_datetime_utc,
                                                                                     period_type)

            for row_generation_periodically in rows_generation_periodically:
                current_datetime_local = row_generation_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.isoformat()[0:19]
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.isoformat()[0:10]
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.isoformat()[0:10]
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.isoformat()[0:7]
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.isoformat()[0:4]

                actual_value = Decimal(0.0) if row_generation_periodically[1] is None else \
                    row_generation_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['generation_this_month']['timestamps_array'].append(timestamps)
            reporting['generation_this_month']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['generation_this_month']['total_values']) <= i:
                    reporting['generation_this_month']['total_values'].append(Decimal(0.0))
                else:
                    reporting['generation_this_month']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 7: query generation energy data in this year
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

        reporting['generation_this_year'] = dict()
        reporting['generation_this_year']['timestamps_array'] = list()
        reporting['generation_this_year']['values_array'] = list()
        reporting['generation_this_year']['total_values'] = list()

        for photovoltaic_power_station in photovoltaic_power_station_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_photovoltaic_power_station_generation_hourly "
                     " WHERE photovoltaic_power_station_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_energy_db.execute(query, (photovoltaic_power_station['id'], start_datetime_utc, end_datetime_utc))
            rows_generation_hourly = cursor_energy_db.fetchall()

            rows_generation_periodically = utilities.aggregate_hourly_data_by_period(rows_generation_hourly,
                                                                                     start_datetime_utc,
                                                                                     end_datetime_utc,
                                                                                     period_type)
            for row_generation_periodically in rows_generation_periodically:
                current_datetime_local = row_generation_periodically[0].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                if period_type == 'hourly':
                    current_datetime = current_datetime_local.isoformat()[0:19]
                elif period_type == 'daily':
                    current_datetime = current_datetime_local.isoformat()[0:10]
                elif period_type == 'weekly':
                    current_datetime = current_datetime_local.isoformat()[0:10]
                elif period_type == 'monthly':
                    current_datetime = current_datetime_local.isoformat()[0:7]
                elif period_type == 'yearly':
                    current_datetime = current_datetime_local.isoformat()[0:4]

                actual_value = Decimal(0.0) if row_generation_periodically[1] is None else \
                    row_generation_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['generation_this_year']['timestamps_array'].append(timestamps)
            reporting['generation_this_year']['values_array'].append(values)
            for i in range(len(values)):
                if len(reporting['generation_this_year']['total_values']) <= i:
                    reporting['generation_this_year']['total_values'].append(Decimal(0.0))
                else:
                    reporting['generation_this_year']['total_values'][i] += values[i]

        ################################################################################################################
        # Step 9: construct the report
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
        result['photovoltaic_power_station_names'] = photovoltaic_power_station_names
        result['reporting'] = reporting
        resp.text = json.dumps(result)
