"""
Photovoltaic Power Station Dashboard Report API

This module provides REST API endpoints for generating comprehensive photovoltaic power station dashboard reports.
It aggregates data from multiple sources including photovoltaic power stations, energy categories, sensors,
and child spaces to provide a complete overview of solar generation performance and system status.

Key Features:
- Multi-photovoltaic power station analysis
- Solar generation performance tracking
- Energy category breakdown and trends
- Sensor data integration and monitoring
- Base period vs reporting period comparison
- Real-time data processing

Report Components:
- Photovoltaic power station generation analysis
- Energy generation calculations
- System performance tracking
- Sensor monitoring data
- Performance metrics and KPIs
- System status indicators

The module uses Falcon framework for REST API and includes:
- Database queries for historical data
- Real-time data aggregation
- Multi-language support
- User authentication and authorization
"""

from datetime import datetime, timedelta
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
        _ = req
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the energy storage power station list
    # Step 3: query generation energy data
    # Step 4: query generation billing data
    # Step 5: query generation carbon data
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

        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
        # Get Spaces associated with energy storage power stations
        query = (" SELECT se.photovoltaic_power_station_id, s.name "
                 " FROM tbl_spaces s, tbl_spaces_photovoltaic_power_stations se "
                 " WHERE se.space_id = s.id ")
        cursor_system_db.execute(query)
        rows_spaces = cursor_system_db.fetchall()

        space_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                space_dict[row[0]] = row[1]
        print(space_dict)
        # Get energy storage power stations
        query = (" SELECT m.id, m.name, m.uuid, "
                 "        m.address, m.latitude, m.longitude, "
                 "        m.rated_capacity, m.rated_power, m.description, m.phase_of_lifecycle "
                 " FROM tbl_photovoltaic_power_stations m, tbl_photovoltaic_power_stations_users mu "
                 " WHERE m.id = mu.photovoltaic_power_station_id AND mu.user_id = %s "
                 " ORDER BY m.phase_of_lifecycle, m.id ")
        cursor_system_db.execute(query, (user['id'],))
        rows_photovoltaic_power_stations = cursor_system_db.fetchall()

        photovoltaic_power_station_list = list()
        total_rated_capacity = Decimal(0.0)
        total_rated_power = Decimal(0.0)
        total_online = int(0)
        total_offline = int(0)
        total_locked = int(0)
        if rows_photovoltaic_power_stations is not None and len(rows_photovoltaic_power_stations) > 0:
            for row in rows_photovoltaic_power_stations:
                # todo get data source latest seen datetime to determine if it is online
                is_online = True
                row_datetime = list()
                row_datetime.append(datetime.utcnow())
                if row_datetime is not None and len(row_datetime) > 0:
                    if isinstance(row_datetime[0], datetime):
                        if row_datetime[0] + timedelta(minutes=10) > datetime.utcnow():
                            is_online = True

                meta_result = {"id": row[0],
                               "name": row[1],
                               "uuid": row[2],
                               "address": row[3],
                               "space_name": space_dict.get(row[0]),
                               "latitude": row[4],
                               "longitude": row[5],
                               "rated_capacity": row[6],
                               "rated_power": row[7],
                               "description": row[8],
                               "phase_of_lifecycle": row[9],
                               "status": 'online' if is_online else 'offline'}
                total_rated_capacity += row[6]
                total_rated_power += row[7]
                # todo: check locked status
                if is_online:
                    total_online += 1
                else:
                    total_offline += 1
                photovoltaic_power_station_list.append(meta_result)
        ################################################################################################################
        # Step 3: query generation energy data
        ################################################################################################################
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()

        cnx_billing_db = mysql.connector.connect(**config.myems_billing_db)
        cursor_billing_db = cnx_billing_db.cursor()

        cnx_carbon_db = mysql.connector.connect(**config.myems_billing_db)
        cursor_carbon_db = cnx_carbon_db.cursor()

        query = (" SELECT photovoltaic_power_station_id, SUM(actual_value) "
                 " FROM tbl_photovoltaic_power_station_generation_hourly "
                 " GROUP BY photovoltaic_power_station_id ")
        cursor_energy_db.execute(query, )
        rows_photovoltaic_power_stations_subtotal_generation_energy = cursor_energy_db.fetchall()

        new_photovoltaic_power_station_list = list()
        total_generation_energy = Decimal(0.0)
        for photovoltaic_power_station in photovoltaic_power_station_list:
            photovoltaic_power_station['subtotal_generation_energy'] = Decimal(0.0)
            for row in rows_photovoltaic_power_stations_subtotal_generation_energy:
                if row[0] == photovoltaic_power_station['id']:
                    photovoltaic_power_station['subtotal_generation_energy'] = row[1]
                    total_generation_energy += photovoltaic_power_station['subtotal_generation_energy']
                    break
            new_photovoltaic_power_station_list.append(photovoltaic_power_station)
        photovoltaic_power_station_list = new_photovoltaic_power_station_list

        ################################################################################################################
        # Step 4:  query generation billing data
        ################################################################################################################
        query = (" SELECT photovoltaic_power_station_id, SUM(actual_value) "
                 " FROM tbl_photovoltaic_power_station_generation_hourly "
                 " GROUP BY photovoltaic_power_station_id ")
        cursor_billing_db.execute(query, )
        rows_photovoltaic_power_stations_subtotal_generation_billing = cursor_billing_db.fetchall()

        new_photovoltaic_power_station_list = list()
        total_generation_billing = Decimal(0.0)
        for photovoltaic_power_station in photovoltaic_power_station_list:
            photovoltaic_power_station['subtotal_generation_billing'] = Decimal(0.0)
            for row in rows_photovoltaic_power_stations_subtotal_generation_billing:
                if row[0] == photovoltaic_power_station['id']:
                    photovoltaic_power_station['subtotal_generation_billing'] = row[1]
                    total_generation_billing += photovoltaic_power_station['subtotal_generation_billing']
                    break
            new_photovoltaic_power_station_list.append(photovoltaic_power_station)
        photovoltaic_power_station_list = new_photovoltaic_power_station_list

        ################################################################################################################
        # Step 5:  query generation carbon data
        ################################################################################################################
        query = (" SELECT photovoltaic_power_station_id, SUM(actual_value) "
                 " FROM tbl_photovoltaic_power_station_generation_hourly "
                 " GROUP BY photovoltaic_power_station_id ")
        cursor_carbon_db.execute(query, )
        rows_photovoltaic_power_stations_subtotal_generation_carbon = cursor_carbon_db.fetchall()
        new_photovoltaic_power_station_list = list()
        total_generation_carbon = Decimal(0.0)
        for photovoltaic_power_station in photovoltaic_power_station_list:
            photovoltaic_power_station['subtotal_generation_carbon'] = Decimal(0.0)
            for row in rows_photovoltaic_power_stations_subtotal_generation_carbon:
                if row[0] == photovoltaic_power_station['id']:
                    photovoltaic_power_station['subtotal_generation_carbon'] = row[1]
                    total_generation_carbon += photovoltaic_power_station['subtotal_generation_carbon']
                    break
            new_photovoltaic_power_station_list.append(photovoltaic_power_station)
        photovoltaic_power_station_list = new_photovoltaic_power_station_list

        ################################################################################################################
        # Step 6: construct the report
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
        result['total_rated_capacity'] = total_rated_capacity
        result['total_rated_power'] = total_rated_power
        result['total_online'] = total_online
        result['total_offline'] = total_offline
        result['total_locked'] = total_locked
        result['photovoltaic_power_stations'] = photovoltaic_power_station_list
        result['total_generation_energy'] = total_generation_energy
        result['total_generation_billing'] = total_generation_billing
        result['total_generation_carbon'] = total_generation_carbon
        resp.text = json.dumps(result)
