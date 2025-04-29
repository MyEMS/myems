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
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the hybrid power station list
    # Step 3: query charge energy data
    # Step 4: query discharge energy data
    # Step 5: query fuel data
    # Step 6: query charge billing data
    # Step 7: query discharge billing data
    # Step 8: query charge carbon data
    # Step 9: query discharge carbon data
    # Step 10: construct the report
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

        cnx_system_db = mysql.connector.connect(**config.myems_system_db)
        cursor_system_db = cnx_system_db.cursor()
        # Get Spaces associated with hybrid power stations
        query = (" SELECT se.hybrid_power_station_id, s.name "
                 " FROM tbl_spaces s, tbl_spaces_hybrid_power_stations se "
                 " WHERE se.space_id = s.id ")
        cursor_system_db.execute(query)
        rows_spaces = cursor_system_db.fetchall()

        space_dict = dict()
        if rows_spaces is not None and len(rows_spaces) > 0:
            for row in rows_spaces:
                space_dict[row[0]] = row[1]
        print(space_dict)
        # Get hybrid power stations
        query = (" SELECT m.id, m.name, m.uuid, "
                 "        m.address, m.latitude, m.longitude, "
                 "        m.rated_capacity, m.rated_power, m.description, m.phase_of_lifecycle "
                 " FROM tbl_hybrid_power_stations m, tbl_hybrid_power_stations_users mu "
                 " WHERE m.id = mu.hybrid_power_station_id AND mu.user_id = %s "
                 " ORDER BY m.phase_of_lifecycle, m.id ")
        cursor_system_db.execute(query, (user['id'],))
        rows_hybrid_power_stations = cursor_system_db.fetchall()

        hybrid_power_station_list = list()
        total_rated_capacity = Decimal(0.0)
        total_rated_power = Decimal(0.0)
        total_online = int(0)
        total_offline = int(0)
        total_locked = int(0)
        if rows_hybrid_power_stations is not None and len(rows_hybrid_power_stations) > 0:
            for row in rows_hybrid_power_stations:
                # get data source latest seen datetime to determine if it is online
                query = (" SELECT tds.last_seen_datetime_utc "
                         " FROM tbl_hybrid_power_stations_bmses hpsb, "
                         "      tbl_points p, tbl_data_sources tds, tbl_gateways tg "
                         " WHERE  hpsb.hybrid_power_station_id = %s "
                         "        AND hpsb.soc_point_id = p.id "
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
                hybrid_power_station_list.append(meta_result)
        ################################################################################################################
        # Step 3: query charge energy data
        ################################################################################################################
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()

        cnx_billing_db = mysql.connector.connect(**config.myems_billing_db)
        cursor_billing_db = cnx_billing_db.cursor()

        cnx_carbon_db = mysql.connector.connect(**config.myems_billing_db)
        cursor_carbon_db = cnx_carbon_db.cursor()

        query = (" SELECT hybrid_power_station_id, SUM(actual_value) "
                 " FROM tbl_hybrid_power_station_charge_hourly "
                 " GROUP BY hybrid_power_station_id ")
        cursor_energy_db.execute(query, )
        rows_hybrid_power_stations_subtotal_charge_energy = cursor_energy_db.fetchall()

        new_hybrid_power_station_list = list()
        total_charge_energy = Decimal(0.0)
        for hybrid_power_station in hybrid_power_station_list:
            hybrid_power_station['subtotal_charge_energy'] = Decimal(0.0)
            for row in rows_hybrid_power_stations_subtotal_charge_energy:
                if row[0] == hybrid_power_station['id']:
                    hybrid_power_station['subtotal_charge_energy'] = row[1]
                    total_charge_energy += hybrid_power_station['subtotal_charge_energy']
                    break
            new_hybrid_power_station_list.append(hybrid_power_station)
        hybrid_power_station_list = new_hybrid_power_station_list
        ################################################################################################################
        # Step 4: query discharge energy data
        ################################################################################################################
        query = (" SELECT hybrid_power_station_id, SUM(actual_value) "
                 " FROM tbl_hybrid_power_station_discharge_hourly "
                 " GROUP BY hybrid_power_station_id ")
        cursor_energy_db.execute(query, )
        rows_hybrid_power_stations_subtotal_discharge_energy = cursor_energy_db.fetchall()

        new_hybrid_power_station_list = list()
        total_discharge_energy = Decimal(0.0)
        for hybrid_power_station in hybrid_power_station_list:
            hybrid_power_station['subtotal_discharge_energy'] = Decimal(0.0)
            for row in rows_hybrid_power_stations_subtotal_discharge_energy:
                if row[0] == hybrid_power_station['id']:
                    hybrid_power_station['subtotal_discharge_energy'] = row[1]
                    total_discharge_energy += hybrid_power_station['subtotal_discharge_energy']
                    break
            new_hybrid_power_station_list.append(hybrid_power_station)
        hybrid_power_station_list = new_hybrid_power_station_list
        ################################################################################################################
        # Step 5: query fuel data
        ################################################################################################################
        query = (" SELECT hybrid_power_station_id, SUM(actual_value) "
                 " FROM tbl_hybrid_power_station_fuel_hourly "
                 " GROUP BY hybrid_power_station_id ")
        cursor_energy_db.execute(query, )
        rows_hybrid_power_stations_subtotal_fuel = cursor_energy_db.fetchall()

        new_hybrid_power_station_list = list()
        total_fuel_consumption = Decimal(0.0)
        for hybrid_power_station in hybrid_power_station_list:
            hybrid_power_station['subtotal_fuel_consumption'] = Decimal(0.0)
            for row in rows_hybrid_power_stations_subtotal_fuel:
                if row[0] == hybrid_power_station['id']:
                    hybrid_power_station['subtotal_fuel_consumption'] = row[1]
                    total_fuel_consumption += hybrid_power_station['subtotal_fuel_consumption']
                    break
            new_hybrid_power_station_list.append(hybrid_power_station)
        hybrid_power_station_list = new_hybrid_power_station_list
        ################################################################################################################
        # Step 6:  query charge billing data
        ################################################################################################################
        query = (" SELECT hybrid_power_station_id, SUM(actual_value) "
                 " FROM tbl_hybrid_power_station_charge_hourly "
                 " GROUP BY hybrid_power_station_id ")
        cursor_billing_db.execute(query, )
        rows_hybrid_power_stations_subtotal_charge_billing = cursor_billing_db.fetchall()

        new_hybrid_power_station_list = list()
        total_charge_billing = Decimal(0.0)
        for hybrid_power_station in hybrid_power_station_list:
            hybrid_power_station['subtotal_charge_billing'] = Decimal(0.0)
            for row in rows_hybrid_power_stations_subtotal_charge_billing:
                if row[0] == hybrid_power_station['id']:
                    hybrid_power_station['subtotal_charge_billing'] = row[1]
                    total_charge_billing += hybrid_power_station['subtotal_charge_billing']
                    break
            new_hybrid_power_station_list.append(hybrid_power_station)
        hybrid_power_station_list = new_hybrid_power_station_list
        ################################################################################################################
        # Step 7: query discharge billing data
        ################################################################################################################
        query = (" SELECT hybrid_power_station_id, SUM(actual_value) "
                 " FROM tbl_hybrid_power_station_discharge_hourly "
                 " GROUP BY hybrid_power_station_id ")
        cursor_billing_db.execute(query, )
        rows_hybrid_power_stations_subtotal_discharge_billing = cursor_billing_db.fetchall()

        new_hybrid_power_station_list = list()
        total_discharge_billing = Decimal(0.0)
        for hybrid_power_station in hybrid_power_station_list:
            hybrid_power_station['subtotal_discharge_billing'] = Decimal(0.0)
            for row in rows_hybrid_power_stations_subtotal_discharge_billing:
                if row[0] == hybrid_power_station['id']:
                    hybrid_power_station['subtotal_discharge_billing'] = row[1]
                    total_discharge_billing += hybrid_power_station['subtotal_discharge_billing']
                    break
            new_hybrid_power_station_list.append(hybrid_power_station)
        hybrid_power_station_list = new_hybrid_power_station_list
        ################################################################################################################
        # Step 8:  query charge carbon data
        ################################################################################################################
        query = (" SELECT hybrid_power_station_id, SUM(actual_value) "
                 " FROM tbl_hybrid_power_station_charge_hourly "
                 " GROUP BY hybrid_power_station_id ")
        cursor_carbon_db.execute(query, )
        rows_hybrid_power_stations_subtotal_charge_carbon = cursor_carbon_db.fetchall()
        new_hybrid_power_station_list = list()
        total_charge_carbon = Decimal(0.0)
        for hybrid_power_station in hybrid_power_station_list:
            hybrid_power_station['subtotal_charge_carbon'] = Decimal(0.0)
            for row in rows_hybrid_power_stations_subtotal_charge_carbon:
                if row[0] == hybrid_power_station['id']:
                    hybrid_power_station['subtotal_charge_carbon'] = row[1]
                    total_charge_carbon += hybrid_power_station['subtotal_charge_carbon']
                    break
            new_hybrid_power_station_list.append(hybrid_power_station)
        hybrid_power_station_list = new_hybrid_power_station_list
        ################################################################################################################
        # Step 9: query discharge carbon data
        ################################################################################################################
        query = (" SELECT hybrid_power_station_id, SUM(actual_value) "
                 " FROM tbl_hybrid_power_station_discharge_hourly "
                 " GROUP BY hybrid_power_station_id ")
        cursor_carbon_db.execute(query, )
        rows_hybrid_power_stations_subtotal_discharge_carbon = cursor_carbon_db.fetchall()
        new_hybrid_power_station_list = list()
        total_discharge_carbon = Decimal(0.0)
        for hybrid_power_station in hybrid_power_station_list:
            hybrid_power_station['subtotal_discharge_carbon'] = Decimal(0.0)
            for row in rows_hybrid_power_stations_subtotal_discharge_carbon:
                if row[0] == hybrid_power_station['id']:
                    hybrid_power_station['subtotal_discharge_carbon'] = row[1]
                    total_discharge_carbon += hybrid_power_station['subtotal_discharge_carbon']
                    break
            new_hybrid_power_station_list.append(hybrid_power_station)
        hybrid_power_station_list = new_hybrid_power_station_list
        ################################################################################################################
        # Step 10: construct the report
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
        result['hybrid_power_stations'] = hybrid_power_station_list
        result['total_charge_energy'] = total_charge_energy
        result['total_discharge_energy'] = total_discharge_energy
        result['total_fuel_consumption'] = total_fuel_consumption
        result['total_charge_billing'] = total_charge_billing
        result['total_discharge_billing'] = total_discharge_billing
        result['total_charge_carbon'] = total_charge_carbon
        result['total_discharge_carbon'] = total_discharge_carbon
        resp.text = json.dumps(result)
