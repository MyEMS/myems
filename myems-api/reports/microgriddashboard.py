from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
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
    # Step 2: query the microgrid list
    # Step 3: query charge energy data
    # Step 4: query discharge energy data
    # Step 5: query charge billing data
    # Step 6: query discharge billing data
    # Step 7: query charge carbon data
    # Step 8: query discharge carbon data
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
        period_type = req.params.get('periodtype')
        base_period_start_datetime_local = req.params.get('baseperiodstartdatetime')
        base_period_end_datetime_local = req.params.get('baseperiodenddatetime')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')

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

        if period_type is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_PERIOD_TYPE')
        else:
            period_type = str.strip(period_type)
            if period_type not in ['hourly', 'daily', 'weekly', 'monthly', 'yearly']:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_PERIOD_TYPE')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        base_start_datetime_utc = None
        if base_period_start_datetime_local is not None and len(str.strip(base_period_start_datetime_local)) > 0:
            base_period_start_datetime_local = str.strip(base_period_start_datetime_local)
            try:
                base_start_datetime_utc = datetime.strptime(base_period_start_datetime_local, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_BASE_PERIOD_START_DATETIME")
            base_start_datetime_utc = \
                base_start_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
            # nomalize the start datetime
            if config.minutes_to_count == 30 and base_start_datetime_utc.minute >= 30:
                base_start_datetime_utc = base_start_datetime_utc.replace(minute=30, second=0, microsecond=0)
            else:
                base_start_datetime_utc = base_start_datetime_utc.replace(minute=0, second=0, microsecond=0)

        base_end_datetime_utc = None
        if base_period_end_datetime_local is not None and len(str.strip(base_period_end_datetime_local)) > 0:
            base_period_end_datetime_local = str.strip(base_period_end_datetime_local)
            try:
                base_end_datetime_utc = datetime.strptime(base_period_end_datetime_local, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_BASE_PERIOD_END_DATETIME")
            base_end_datetime_utc = \
                base_end_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)

        if base_start_datetime_utc is not None and base_end_datetime_utc is not None and \
                base_start_datetime_utc >= base_end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_BASE_PERIOD_END_DATETIME')

        if reporting_period_start_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
        else:
            reporting_period_start_datetime_local = str.strip(reporting_period_start_datetime_local)
            try:
                reporting_start_datetime_utc = datetime.strptime(reporting_period_start_datetime_local,
                                                                 '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
            reporting_start_datetime_utc = \
                reporting_start_datetime_utc.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)
            # nomalize the start datetime
            if config.minutes_to_count == 30 and reporting_start_datetime_utc.minute >= 30:
                reporting_start_datetime_utc = reporting_start_datetime_utc.replace(minute=30, second=0, microsecond=0)
            else:
                reporting_start_datetime_utc = reporting_start_datetime_utc.replace(minute=0, second=0, microsecond=0)

        if reporting_period_end_datetime_local is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
        else:
            reporting_period_end_datetime_local = str.strip(reporting_period_end_datetime_local)
            try:
                reporting_end_datetime_utc = datetime.strptime(reporting_period_end_datetime_local,
                                                               '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                    timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPORTING_PERIOD_END_DATETIME')

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
        if rows_microgrids is not None and len(rows_microgrids) > 0:
            for row in rows_microgrids:
                # get data source latest seen datetime to determine if it is online
                query = (" SELECT tds.last_seen_datetime_utc "
                         " FROM tbl_microgrids_batteries mb, tbl_points p, tbl_data_sources tds, tbl_gateways tg "
                         " WHERE  microgrid_id  = %s "
                         "        AND mb.soc_point_id = p.id "
                         "        AND p.data_source_id = tds.id "
                         " ORDER BY tds.last_seen_datetime_utc DESC "
                         " LIMIT 1 ")
                cursor_system_db.execute(query, (row[0],))
                row_datetime = cursor_system_db.fetchone()
                is_online = False
                if row_datetime is not None and len(row_datetime) > 0:
                    if isinstance(row_datetime[0], datetime):
                        if row_datetime[0] + timedelta(minutes=10) > datetime.utcnow():
                            is_online = True

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
                               "description": row[10],
                               "status": 'online' if is_online else 'offline'}
                microgrid_list.append(meta_result)
        ################################################################################################################
        # Step 3: query charge energy data
        ################################################################################################################
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()

        cnx_billing_db = mysql.connector.connect(**config.myems_billing_db)
        cursor_billing_db = cnx_billing_db.cursor()

        cnx_carbon_db = mysql.connector.connect(**config.myems_billing_db)
        cursor_carbon_db = cnx_carbon_db.cursor()

        query = (" SELECT microgrid_id, SUM(actual_value) "
                 " FROM tbl_microgrid_charge_hourly "
                 " GROUP BY microgrid_id ")
        cursor_energy_db.execute(query, )
        rows_microgrids_subtotal_charge_energy = cursor_energy_db.fetchall()

        new_microgrid_list = list()
        total_charge_energy = Decimal(0.0)
        for microgrid in microgrid_list:
            microgrid['subtotal_charge_energy'] = Decimal(0.0)
            for row in rows_microgrids_subtotal_charge_energy:
                if row[0] == microgrid['id']:
                    microgrid['subtotal_charge_energy'] = row[1]
                    total_charge_energy += microgrid['subtotal_charge_energy']
                    break
            new_microgrid_list.append(microgrid)
        microgrid_list = new_microgrid_list
        ################################################################################################################
        # Step 4: query discharge energy data
        ################################################################################################################
        query = (" SELECT microgrid_id, SUM(actual_value) "
                 " FROM tbl_microgrid_discharge_hourly "
                 " GROUP BY microgrid_id ")
        cursor_energy_db.execute(query, )
        rows_microgrids_subtotal_discharge_energy = cursor_energy_db.fetchall()

        new_microgrid_list = list()
        total_discharge_energy = Decimal(0.0)
        for microgrid in microgrid_list:
            microgrid['subtotal_discharge_energy'] = Decimal(0.0)
            for row in rows_microgrids_subtotal_discharge_energy:
                if row[0] == microgrid['id']:
                    microgrid['subtotal_discharge_energy'] = row[1]
                    total_discharge_energy += microgrid['subtotal_discharge_energy']
                    break
            new_microgrid_list.append(microgrid)
        microgrid_list = new_microgrid_list
        ################################################################################################################
        # Step 5:  query charge billing data
        ################################################################################################################
        query = (" SELECT microgrid_id, SUM(actual_value) "
                 " FROM tbl_microgrid_charge_hourly "
                 " GROUP BY microgrid_id ")
        cursor_billing_db.execute(query, )
        rows_microgrids_subtotal_charge_billing = cursor_billing_db.fetchall()

        new_microgrid_list = list()
        total_charge_billing = Decimal(0.0)
        for microgrid in microgrid_list:
            microgrid['subtotal_charge_billing'] = Decimal(0.0)
            for row in rows_microgrids_subtotal_charge_billing:
                if row[0] == microgrid['id']:
                    microgrid['subtotal_charge_billing'] = row[1]
                    total_charge_billing += microgrid['subtotal_charge_billing']
                    break
            new_microgrid_list.append(microgrid)
        microgrid_list = new_microgrid_list
        ################################################################################################################
        # Step 6: query discharge billing data
        ################################################################################################################
        query = (" SELECT microgrid_id, SUM(actual_value) "
                 " FROM tbl_microgrid_discharge_hourly "
                 " GROUP BY microgrid_id ")
        cursor_billing_db.execute(query, )
        rows_microgrids_subtotal_discharge_billing = cursor_billing_db.fetchall()

        new_microgrid_list = list()
        total_discharge_billing = Decimal(0.0)
        for microgrid in microgrid_list:
            microgrid['subtotal_discharge_billing'] = Decimal(0.0)
            for row in rows_microgrids_subtotal_discharge_billing:
                if row[0] == microgrid['id']:
                    microgrid['subtotal_discharge_billing'] = row[1]
                    total_discharge_billing += microgrid['subtotal_discharge_billing']
                    break
            new_microgrid_list.append(microgrid)
        microgrid_list = new_microgrid_list
        ################################################################################################################
        # Step 7:  query charge carbon data
        ################################################################################################################
        query = (" SELECT microgrid_id, SUM(actual_value) "
                 " FROM tbl_microgrid_charge_hourly "
                 " GROUP BY microgrid_id ")
        cursor_carbon_db.execute(query, )
        rows_microgrids_subtotal_charge_carbon = cursor_carbon_db.fetchall()
        new_microgrid_list = list()
        total_charge_carbon = Decimal(0.0)
        for microgrid in microgrid_list:
            microgrid['subtotal_charge_carbon'] = Decimal(0.0)
            for row in rows_microgrids_subtotal_charge_carbon:
                if row[0] == microgrid['id']:
                    microgrid['subtotal_charge_carbon'] = row[1]
                    total_charge_carbon += microgrid['subtotal_charge_carbon']
                    break
            new_microgrid_list.append(microgrid)
        microgrid_list = new_microgrid_list
        ################################################################################################################
        # Step 8: query discharge carbon data
        ################################################################################################################
        query = (" SELECT microgrid_id, SUM(actual_value) "
                 " FROM tbl_microgrid_discharge_hourly "
                 " GROUP BY microgrid_id ")
        cursor_carbon_db.execute(query, )
        rows_microgrids_subtotal_discharge_carbon = cursor_carbon_db.fetchall()
        new_microgrid_list = list()
        total_discharge_carbon = Decimal(0.0)
        for microgrid in microgrid_list:
            microgrid['subtotal_discharge_carbon'] = Decimal(0.0)
            for row in rows_microgrids_subtotal_discharge_carbon:
                if row[0] == microgrid['id']:
                    microgrid['subtotal_discharge_carbon'] = row[1]
                    total_discharge_carbon += microgrid['subtotal_discharge_carbon']
                    break
            new_microgrid_list.append(microgrid)
        microgrid_list = new_microgrid_list
        ################################################################################################################
        # Step 7: construct the report
        ################################################################################################################
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

        if cursor_energy_db:
            cursor_energy_db.close()
        if cnx_energy_db:
            cnx_energy_db.close()

        if cursor_billing_db:
            cursor_billing_db.close()
        if cnx_billing_db:
            cnx_billing_db.close()

        if cursor_carbon_db:
            cursor_carbon_db.close()
        if cnx_carbon_db:
            cnx_carbon_db.close()

        result = dict()
        result['microgrids'] = microgrid_list
        result['total_charge_energy'] = total_charge_energy
        result['total_discharge_energy'] = total_discharge_energy
        result['total_charge_billing'] = total_charge_billing
        result['total_discharge_billing'] = total_discharge_billing
        result['total_charge_carbon'] = total_charge_carbon
        result['total_discharge_carbon'] = total_discharge_carbon
        resp.text = json.dumps(result)
