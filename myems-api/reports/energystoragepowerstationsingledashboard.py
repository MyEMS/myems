import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
from core.useractivity import access_control, api_key_control


class Reporting:
    @staticmethod
    def __init__():
        """Initializes Class"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the energy storage power station
    # Step 3: query charge data
    # Step 4: query discharge data
    # Step 5: query revenue data
    # Step 6: query efficiency data
    # Step 7: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        # this procedure accepts energy storage power station id or uuid
        energy_storage_power_station_id = req.params.get('id')
        energy_storage_power_station_uuid = req.params.get('uuid')
        period_type = req.params.get('periodtype')
        base_period_start_datetime_local = req.params.get('baseperiodstartdatetime')
        base_period_end_datetime_local = req.params.get('baseperiodenddatetime')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if energy_storage_power_station_id is None and energy_storage_power_station_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        if energy_storage_power_station_id is not None:
            energy_storage_power_station_id = str.strip(energy_storage_power_station_id)
            if not energy_storage_power_station_id.isdigit() or int(energy_storage_power_station_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')

        if energy_storage_power_station_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(energy_storage_power_station_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_ENERGY_STORAGE_POWER_STATION_UUID')

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
        # Step 2: query the energy storage power station list
        ################################################################################################################

        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
        # Get Spaces associated with energy storage power stations
        query = (" SELECT se.energy_storage_power_station_id, s.name "
                 " FROM tbl_spaces s, tbl_spaces_energy_storage_power_stations se "
                 " WHERE se.space_id = s.id ")
        cursor_system_db.execute(query)
        rows_spaces = cursor_system_db.fetchall()

        space_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                space_dict[row[0]] = row[1]
        print(space_dict)
        # Get energy storage power station
        if energy_storage_power_station_id is not None:
            query = (" SELECT id, name, uuid, "
                     "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                     "        contact_id, cost_center_id, svg, description "
                     " FROM tbl_energy_storage_power_stations "
                     " WHERE id = %s ")
            cursor_system_db.execute(query, (energy_storage_power_station_id,))
            row = cursor_system_db.fetchone()
        elif energy_storage_power_station_uuid is not None:
            query = (" SELECT id, name, uuid, "
                     "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                     "        contact_id, cost_center_id, svg, description "
                     " FROM tbl_energy_storage_power_stations "
                     " WHERE uuid = %s ")
            cursor_system_db.execute(query, (energy_storage_power_station_uuid,))
            row = cursor_system_db.fetchone()

        if row is None:
            cursor_system_db.close()
            cnx_system_db.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')
        else:
            energy_storage_power_station = dict()
            # get gateway latest seen datetime to determine if it is online
            query = (" SELECT tds.last_seen_datetime_utc "
                     " FROM tbl_energy_storage_power_stations_containers tespsc, "
                     "      tbl_energy_storage_containers_batteries tescb, "
                     "      tbl_points p, tbl_data_sources tds, tbl_gateways tg "
                     " WHERE  tespsc.energy_storage_power_station_id = %s "
                     "        AND tescb.energy_storage_container_id  = tespsc.energy_storage_container_id "
                     "        AND tescb.soc_point_id = p.id "
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

            energy_storage_power_station = {
                "id": row[0],
                "name": row[1],
                "uuid": row[2],
                "address": row[3],
                "space_name": space_dict.get(row[0]),
                "postal_code": row[4],
                "latitude": row[5],
                "longitude": row[6],
                "rated_capacity": row[7],
                "rated_power": row[8],
                "description": row[9],
                "status": 'online' if is_online else 'offline'}

        charge_ranking = list()

        discharge_ranking = list()

        revenue_ranking = list()

        ################################################################################################################
        # Step 3: query charge data
        ################################################################################################################
        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_billing = mysql.connector.connect(**config.myems_billing_db)
        cursor_billing = cnx_billing.cursor()

        ################################################################################################################
        # Step 4: query discharge data
        ################################################################################################################

        ################################################################################################################
        # Step 5: query revenue data
        ################################################################################################################

        ################################################################################################################
        # Step 6: query efficiency data
        ################################################################################################################

        ################################################################################################################
        # Step 7: construct the report
        ################################################################################################################
        if cursor_system_db:
            cursor_system_db.close()
        if cnx_system_db:
            cnx_system_db.close()

        if cursor_energy:
            cursor_energy.close()
        if cnx_energy:
            cnx_energy.close()

        if cursor_billing:
            cursor_billing.close()
        if cnx_billing:
            cnx_billing.close()

        result = dict()

        result['energy_storage_power_station'] = energy_storage_power_station
        result['charge_ranking'] = charge_ranking
        result['total_charge'] = Decimal(0.0)
        result['discharge_ranking'] = discharge_ranking
        result['total_discharge'] = Decimal(0.0)
        result['revenue_ranking'] = revenue_ranking
        result['total_revenue'] = Decimal(0.0)
        resp.text = json.dumps(result)
