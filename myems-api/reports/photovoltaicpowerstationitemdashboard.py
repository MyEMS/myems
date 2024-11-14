import re
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
    # Step 2: query the energy storage power station
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
        # this procedure accepts energy storage power station id or uuid
        photovoltaic_power_station_id = req.params.get('id')
        photovoltaic_power_station_uuid = req.params.get('uuid')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if photovoltaic_power_station_id is None and photovoltaic_power_station_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_photovoltaic_POWER_STATION_ID')

        if photovoltaic_power_station_id is not None:
            photovoltaic_power_station_id = str.strip(photovoltaic_power_station_id)
            if not photovoltaic_power_station_id.isdigit() or int(photovoltaic_power_station_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_photovoltaic_POWER_STATION_ID')

        if photovoltaic_power_station_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(photovoltaic_power_station_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_photovoltaic_POWER_STATION_UUID')

        ################################################################################################################
        # Step 2: query the energy storage power station
        ################################################################################################################
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
        # Get energy storage power station
        if photovoltaic_power_station_id is not None:
            query = (" SELECT id, name, uuid, "
                     "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                     "        contact_id, cost_center_id "
                     " FROM tbl_photovoltaic_power_stations "
                     " WHERE id = %s ")
            cursor_system_db.execute(query, (photovoltaic_power_station_id,))
            row = cursor_system_db.fetchone()
        elif photovoltaic_power_station_uuid is not None:
            query = (" SELECT id, name, uuid, "
                     "        address, postal_code, latitude, longitude, rated_capacity, rated_power, "
                     "        contact_id, cost_center_id "
                     " FROM tbl_photovoltaic_power_stations "
                     " WHERE uuid = %s ")
            cursor_system_db.execute(query, (photovoltaic_power_station_uuid,))
            row = cursor_system_db.fetchone()

        if row is None:
            cursor_system_db.close()
            cnx_system_db.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.photovoltaic_POWER_STATION_NOT_FOUND')
        else:
            photovoltaic_power_station_id = row[0]
            photovoltaic_power_station = {
                "id": row[0],
                "name": row[1],
                "uuid": row[2],
                "address": row[3],
                "space_name": space_dict.get(row[0]),
                "postal_code": row[4],
                "latitude": row[5],
                "longitude": row[6],
                "rated_capacity": row[7],
                "rated_power": row[8]
            }

        ################################################################################################################
        # Step 3: query charge energy data
        ################################################################################################################
        cnx_energy_db = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy_db = cnx_energy_db.cursor()

        cnx_billing_db = mysql.connector.connect(**config.myems_billing_db)
        cursor_billing_db = cnx_billing_db.cursor()

        cnx_carbon_db = mysql.connector.connect(**config.myems_billing_db)
        cursor_carbon_db = cnx_carbon_db.cursor()

        query = (" SELECT SUM(actual_value) "
                 " FROM tbl_photovoltaic_power_station_generation_hourly "
                 " WHERE photovoltaic_power_station_id = %s ")
        cursor_energy_db.execute(query, (photovoltaic_power_station_id, ))
        row = cursor_energy_db.fetchone()
        total_charge_energy = Decimal(0.0)
        if row is not None:
            total_charge_energy = row[0]

        ################################################################################################################
        # Step 4: query discharge energy data
        ################################################################################################################
        query = (" SELECT SUM(actual_value) "
                 " FROM tbl_photovoltaic_power_station_generation_hourly "
                 " WHERE photovoltaic_power_station_id = %s ")
        cursor_energy_db.execute(query, (photovoltaic_power_station_id, ))
        row = cursor_energy_db.fetchone()
        total_discharge_energy = Decimal(0.0)
        if row is not None:
            total_discharge_energy = row[0]
        ################################################################################################################
        # Step 5:  query charge billing data
        ################################################################################################################
        query = (" SELECT SUM(actual_value) "
                 " FROM tbl_photovoltaic_power_station_generation_hourly "
                 " WHERE photovoltaic_power_station_id = %s ")
        cursor_billing_db.execute(query, (photovoltaic_power_station_id, ))
        row = cursor_billing_db.fetchone()
        total_charge_billing = Decimal(0.0)
        if row is not None:
            total_charge_billing = row[0]

        ################################################################################################################
        # Step 6: query discharge billing data
        ################################################################################################################
        query = (" SELECT SUM(actual_value) "
                 " FROM tbl_photovoltaic_power_station_generation_hourly "
                 " WHERE photovoltaic_power_station_id = %s ")
        cursor_billing_db.execute(query, (photovoltaic_power_station_id, ))
        row = cursor_billing_db.fetchone()
        total_discharge_billing = Decimal(0.0)
        if row is not None:
            total_discharge_billing = row[0]

        ################################################################################################################
        # Step 7:  query charge carbon data
        ################################################################################################################
        query = (" SELECT SUM(actual_value) "
                 " FROM tbl_photovoltaic_power_station_generation_hourly "
                 " WHERE photovoltaic_power_station_id = %s ")
        cursor_carbon_db.execute(query, (photovoltaic_power_station_id, ))
        row = cursor_carbon_db.fetchone()
        total_charge_carbon = Decimal(0.0)
        if row is not None:
            total_charge_carbon = row[0]

        ################################################################################################################
        # Step 8: query discharge carbon data
        ################################################################################################################
        query = (" SELECT SUM(actual_value) "
                 " FROM tbl_photovoltaic_power_station_generation_hourly "
                 " WHERE photovoltaic_power_station_id = %s ")
        cursor_carbon_db.execute(query, (photovoltaic_power_station_id, ))
        row = cursor_carbon_db.fetchone()
        total_discharge_carbon = Decimal(0.0)
        if row is not None:
            total_discharge_carbon = row[0]

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
        result['photovoltaic_power_station'] = photovoltaic_power_station
        result['total_charge_energy'] = total_charge_energy
        result['total_discharge_energy'] = total_discharge_energy
        result['total_charge_billing'] = total_charge_billing
        result['total_discharge_billing'] = total_discharge_billing
        result['total_charge_carbon'] = total_charge_carbon
        result['total_discharge_carbon'] = total_discharge_carbon
        resp.text = json.dumps(result)
