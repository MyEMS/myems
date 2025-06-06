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
    # Step 2: query the microgrid list
    # Step 3: query charge carbon data in 7 days
    # Step 4: query discharge carbon data in 7 days
    # Step 5: query charge carbon data in this month
    # Step 6: query discharge carbon data in this month
    # Step 7: query charge carbon data in this year
    # Step 8: query discharge carbon data in this year
    # Step 9: construct the report
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
        # Step 2: query the microgrid list
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

        # Get microgrids
        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
        query = (" SELECT m.id, m.name, m.uuid, "
                 "        m.address, m.postal_code, m.latitude, m.longitude, "
                 "        m.rated_capacity, m.rated_power, m.serial_number, m.description "
                 " FROM tbl_microgrids m, tbl_microgrids_users mu "
                 " WHERE m.id = mu.microgrid_id AND mu.user_id = %s "
                 " ORDER BY id ")
        cursor_system_db.execute(query, (user['id'],))
        rows_microgrids = cursor_system_db.fetchall()

        microgrid_list = list()
        microgrid_names = list()
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "address": row[3],
                               "postal_code": row[4],
                               "latitude": row[5],
                               "longitude": row[6],
                               "rated_capacity": row[7],
                               "rated_power": row[8],
                               "serial_number": row[9],
                               "description": row[10]}
                microgrid_list.append(meta_result)
                microgrid_names.append(row[1])
        ################################################################################################################
        # Step 3: query charge carbon data in 7 days
        ################################################################################################################
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        reporting = dict()
        reporting['charge_7_days'] = dict()
        reporting['charge_this_month'] = dict()
        reporting['charge_this_year'] = dict()
        reporting['discharge_7_days'] = dict()
        reporting['discharge_this_month'] = dict()
        reporting['discharge_this_year'] = dict()

        end_datetime_utc = datetime.utcnow()
        end_datetime_local = datetime.utcnow() + timedelta(minutes=timezone_offset)
        period_type = 'daily'
        start_datetime_local = end_datetime_local.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=6)
        start_datetime_utc = start_datetime_local - timedelta(minutes=timezone_offset)
        print('start_datetime_local:' + start_datetime_local.isoformat())
        print('end_datetime_local:' + end_datetime_local.isoformat())
        print('start_datetime_utc:' + start_datetime_utc.isoformat())
        print('end_datetime_utc:' + end_datetime_utc.isoformat())

        cnx_carbon_db = mysql.connector.connect(**config.myems_carbon_db)
        cursor_carbon_db = cnx_carbon_db.cursor()

        reporting['charge_7_days'] = dict()
        reporting['charge_7_days']['timestamps_array'] = list()
        reporting['charge_7_days']['values_array'] = list()

        for microgrid in microgrid_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_microgrid_charge_hourly "
                     " WHERE microgrid_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_carbon_db.execute(query, (microgrid['id'], start_datetime_utc, end_datetime_utc))
            rows_charge_hourly = cursor_carbon_db.fetchall()

            rows_charge_periodically = utilities.aggregate_hourly_data_by_period(rows_charge_hourly,
                                                                                 start_datetime_utc,
                                                                                 end_datetime_utc,
                                                                                 period_type)
            for row_charge_periodically in rows_charge_periodically:
                current_datetime_local = row_charge_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_charge_periodically[1] is None else row_charge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['charge_7_days']['timestamps_array'].append(timestamps)
            reporting['charge_7_days']['values_array'].append(values)
        ################################################################################################################
        # Step 4: query discharge carbon data in 7 days
        ################################################################################################################
        reporting['discharge_7_days'] = dict()
        reporting['discharge_7_days']['timestamps_array'] = list()
        reporting['discharge_7_days']['values_array'] = list()
        for microgrid in microgrid_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_microgrid_discharge_hourly "
                     " WHERE microgrid_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_carbon_db.execute(query, (microgrid['id'], start_datetime_utc, end_datetime_utc))
            rows_charge_hourly = cursor_carbon_db.fetchall()

            rows_charge_periodically = utilities.aggregate_hourly_data_by_period(rows_charge_hourly,
                                                                                 start_datetime_utc,
                                                                                 end_datetime_utc,
                                                                                 period_type)

            for row_charge_periodically in rows_charge_periodically:
                current_datetime_local = row_charge_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_charge_periodically[1] is None else row_charge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['discharge_7_days']['timestamps_array'].append(timestamps)
            reporting['discharge_7_days']['values_array'].append(values)

        ################################################################################################################
        # Step 5: query charge carbon data in this month
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

        for microgrid in microgrid_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_microgrid_charge_hourly "
                     " WHERE microgrid_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_carbon_db.execute(query, (microgrid['id'], start_datetime_utc, end_datetime_utc))
            rows_charge_hourly = cursor_carbon_db.fetchall()

            rows_charge_periodically = utilities.aggregate_hourly_data_by_period(rows_charge_hourly,
                                                                                 start_datetime_utc,
                                                                                 end_datetime_utc,
                                                                                 period_type)

            for row_charge_periodically in rows_charge_periodically:
                current_datetime_local = row_charge_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_charge_periodically[1] is None else row_charge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['charge_this_month']['timestamps_array'].append(timestamps)
            reporting['charge_this_month']['values_array'].append(values)

        ################################################################################################################
        # Step 6: query discharge carbon data in this month
        ################################################################################################################
        reporting['discharge_this_month'] = dict()
        reporting['discharge_this_month']['timestamps_array'] = list()
        reporting['discharge_this_month']['values_array'] = list()

        for microgrid in microgrid_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_microgrid_discharge_hourly "
                     " WHERE microgrid_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_carbon_db.execute(query, (microgrid['id'], start_datetime_utc, end_datetime_utc))
            rows_discharge_hourly = cursor_carbon_db.fetchall()

            rows_discharge_periodically = utilities.aggregate_hourly_data_by_period(rows_discharge_hourly,
                                                                                    start_datetime_utc,
                                                                                    end_datetime_utc,
                                                                                    period_type)

            for row_discharge_periodically in rows_discharge_periodically:
                current_datetime_local = row_discharge_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_discharge_periodically[1] is None else row_discharge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['discharge_this_month']['timestamps_array'].append(timestamps)
            reporting['discharge_this_month']['values_array'].append(values)

        ################################################################################################################
        # Step 7: query charge carbon data in this year
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

        for microgrid in microgrid_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_microgrid_charge_hourly "
                     " WHERE microgrid_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_carbon_db.execute(query, (microgrid['id'], start_datetime_utc, end_datetime_utc))
            rows_charge_hourly = cursor_carbon_db.fetchall()

            rows_charge_periodically = utilities.aggregate_hourly_data_by_period(rows_charge_hourly,
                                                                                 start_datetime_utc,
                                                                                 end_datetime_utc,
                                                                                 period_type)
            for row_charge_periodically in rows_charge_periodically:
                current_datetime_local = row_charge_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_charge_periodically[1] is None else row_charge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['charge_this_year']['timestamps_array'].append(timestamps)
            reporting['charge_this_year']['values_array'].append(values)

        ################################################################################################################
        # Step 8: query discharge carbon data in this month
        ################################################################################################################
        reporting['discharge_this_year'] = dict()
        reporting['discharge_this_year']['timestamps_array'] = list()
        reporting['discharge_this_year']['values_array'] = list()

        for microgrid in microgrid_list:
            timestamps = list()
            values = list()
            query = (" SELECT start_datetime_utc, actual_value "
                     " FROM tbl_microgrid_discharge_hourly "
                     " WHERE microgrid_id = %s "
                     " AND start_datetime_utc >= %s "
                     " AND start_datetime_utc < %s "
                     " ORDER BY start_datetime_utc ")
            cursor_carbon_db.execute(query, (microgrid['id'], start_datetime_utc, end_datetime_utc))
            rows_discharge_hourly = cursor_carbon_db.fetchall()

            rows_discharge_periodically = utilities.aggregate_hourly_data_by_period(rows_discharge_hourly,
                                                                                    start_datetime_utc,
                                                                                    end_datetime_utc,
                                                                                    period_type)
            for row_discharge_periodically in rows_discharge_periodically:
                current_datetime_local = row_discharge_periodically[0].replace(tzinfo=timezone.utc) + \
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

                actual_value = Decimal(0.0) if row_discharge_periodically[1] is None else row_discharge_periodically[1]
                timestamps.append(current_datetime)
                values.append(actual_value)
            reporting['discharge_this_year']['timestamps_array'].append(timestamps)
            reporting['discharge_this_year']['values_array'].append(values)

        ################################################################################################################
        # Step 9: construct the report
        ################################################################################################################
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

        if cursor_carbon_db:
            cursor_carbon_db.close()
        if cnx_carbon_db:
            cnx_carbon_db.close()

        result = dict()
        result['microgrid_names'] = microgrid_names
        result['reporting'] = reporting
        resp.text = json.dumps(result)
