import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import access_control, api_key_control
import config


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
    # Step 3: query associated containers
    # Step 4: query associated batteries on containers
    # Step 5: query associated grids on containers
    # Step 6: query associated loads on containers
    # Step 7: query associated power conversion systems on containers
    #     Step 7.1 query energy indicator data
    #     Step 7.2 query revenue indicator data
    # Step 8: query associated points data on containers
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
        print(req.params)
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

        reporting_start_datetime_utc = datetime.utcnow() - timedelta(days=3)
        reporting_end_datetime_utc = datetime.utcnow()

        ################################################################################################################
        # Step 2: query the energy storage power station
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_billing = mysql.connector.connect(**config.myems_billing_db)
        cursor_billing = cnx_billing.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        query = (" SELECT id, name, uuid "
                 " FROM tbl_contacts ")
        cursor_system.execute(query)
        rows_contacts = cursor_system.fetchall()

        contact_dict = dict()
        if rows_contacts is not None and len(rows_contacts) > 0:
            for row in rows_contacts:
                contact_dict[row[0]] = {"id": row[0],
                                        "name": row[1],
                                        "uuid": row[2]}

        query = (" SELECT id, name, uuid "
                 " FROM tbl_cost_centers ")
        cursor_system.execute(query)
        rows_cost_centers = cursor_system.fetchall()

        cost_center_dict = dict()
        if rows_cost_centers is not None and len(rows_cost_centers) > 0:
            for row in rows_cost_centers:
                cost_center_dict[row[0]] = {"id": row[0],
                                            "name": row[1],
                                            "uuid": row[2]}
        if photovoltaic_power_station_id is not None:
            query = (" SELECT e.id, e.name, e.uuid, "
                     "        e.address, e.postal_code, e.latitude, e.longitude, e.rated_capacity, e.rated_power, "
                     "        e.contact_id, e.cost_center_id, s.source_code, e.description, e.phase_of_lifecycle "
                     " FROM tbl_photovoltaic_power_stations e, tbl_svgs s "
                     " WHERE e.svg_id = s.id AND e.id = %s ")
            cursor_system.execute(query, (photovoltaic_power_station_id,))
            row = cursor_system.fetchone()
        elif photovoltaic_power_station_uuid is not None:
            query = (" SELECT e.id, e.name, e.uuid, "
                     "        e.address, e.postal_code, e.latitude, e.longitude, e.rated_capacity, e.rated_power, "
                     "        e.contact_id, e.cost_center_id, s.source_code, e.description, e.phase_of_lifecycle "
                     " FROM tbl_photovoltaic_power_stations e, tbl_svgs s "
                     " WHERE e.svg_id = s.id AND e.uuid = %s ")
            cursor_system.execute(query, (photovoltaic_power_station_uuid,))
            row = cursor_system.fetchone()

        if row is None:
            cursor_system.close()
            cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.photovoltaic_POWER_STATION_NOT_FOUND')
        else:
            photovoltaic_power_station_id = row[0]
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2],
                           "address": row[3],
                           "postal_code": row[4],
                           "latitude": row[5],
                           "longitude": row[6],
                           "rated_capacity": row[7],
                           "rated_power": row[8],
                           "contact": contact_dict.get(row[9], None),
                           "cost_center": cost_center_dict.get(row[10], None),
                           "svg": row[11],
                           "description": row[12],
                           "phase_of_lifecycle": row[13],
                           "qrcode": 'energystoragepowerstation:' + row[2]}

        point_list = list()
        meter_list = list()

        # query all energy categories in system
        cursor_system.execute(" SELECT id, name, unit_of_measure, kgce, kgco2e "
                              " FROM tbl_energy_categories "
                              " ORDER BY id ", )
        rows_energy_categories = cursor_system.fetchall()
        if rows_energy_categories is None or len(rows_energy_categories) == 0:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')
        energy_category_dict = dict()
        for row_energy_category in rows_energy_categories:
            energy_category_dict[row_energy_category[0]] = {"name": row_energy_category[1],
                                                            "unit_of_measure": row_energy_category[2],
                                                            "kgce": row_energy_category[3],
                                                            "kgco2e": row_energy_category[4]}

        ################################################################################################################
        # Step 5: query associated grids on containers
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, cg.name, p.units, p.object_type  "
                              " FROM tbl_photovoltaic_power_stations_grids cg, tbl_points p "
                              " WHERE cg.photovoltaic_power_station_id = %s AND cg.power_point_id = p.id ",
                              (photovoltaic_power_station_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1] + '.P',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT m.id, cg.name, m.energy_category_id  "
                              " FROM tbl_photovoltaic_power_stations_grids cg, tbl_meters m "
                              " WHERE cg.photovoltaic_power_station_id = %s AND cg.buy_meter_id = m.id ",
                              (photovoltaic_power_station_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '.Buy',
                               "energy_category_id": row_meter[2]})

        cursor_system.execute(" SELECT m.id, cg.name, m.energy_category_id  "
                              " FROM tbl_photovoltaic_power_stations_grids cg, tbl_meters m "
                              " WHERE cg.photovoltaic_power_station_id = %s AND cg.sell_meter_id = m.id ",
                              (photovoltaic_power_station_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '.Sell',
                               "energy_category_id": row_meter[2]})

        ################################################################################################################
        # Step 6: query associated loads on containers
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, cl.name, p.units, p.object_type  "
                              " FROM tbl_photovoltaic_power_stations_loads cl, tbl_points p "
                              " WHERE cl.photovoltaic_power_station_id = %s AND cl.power_point_id = p.id ",
                              (photovoltaic_power_station_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1] + '.P',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT m.id, cl.name, m.energy_category_id  "
                              " FROM tbl_photovoltaic_power_stations_loads cl, tbl_meters m "
                              " WHERE cl.photovoltaic_power_station_id = %s AND cl.meter_id = m.id ",
                              (photovoltaic_power_station_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1],
                               "energy_category_id": row_meter[2]})

        ################################################################################################################
        # Step 7: query associated power conversion systems on containers
        ################################################################################################################
        # Step 7.1 query energy indicator data
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        today_end_datetime_utc = datetime.utcnow()
        today_end_datetime_local = datetime.utcnow() + timedelta(minutes=timezone_offset)
        today_start_datetime_local = today_end_datetime_local.replace(hour=0, minute=0, second=0, microsecond=0)
        today_start_datetime_utc = today_start_datetime_local - timedelta(minutes=timezone_offset)

        today_generation_energy_value = Decimal(0.0)
        total_generation_energy_value = Decimal(0.0)
        #
        # # query meter energy
        # cursor_energy.execute(" SELECT SUM(actual_value) "
        #                       " FROM tbl_meter_hourly "
        #                       " WHERE meter_id = %s "
        #                       "     AND start_datetime_utc >= %s "
        #                       "     AND start_datetime_utc < %s ",
        #                       (generation_meter_id,
        #                        today_start_datetime_utc,
        #                        today_end_datetime_utc))
        # row = cursor_energy.fetchone()
        # if row is not None:
        #     today_generation_energy_value = row[0]
        #
        #
        # cursor_energy.execute(" SELECT SUM(actual_value) "
        #                       " FROM tbl_meter_hourly "
        #                       " WHERE meter_id = %s ",
        #                       (generation_meter_id,))
        # row = cursor_energy.fetchone()
        # if row is not None:
        #     total_generation_energy_value = row[0]
        #
        # Step 7.2 query revenue indicator data
        today_generation_revenue_value = Decimal(0.0)
        total_generation_revenue_value = Decimal(0.0)

        # # query meter revenue
        # cursor_billing.execute(" SELECT SUM(actual_value) "
        #                        " FROM tbl_meter_hourly "
        #                        " WHERE meter_id = %s "
        #                        "     AND start_datetime_utc >= %s "
        #                        "     AND start_datetime_utc < %s ",
        #                        (generation_meter_id,
        #                         today_start_datetime_utc,
        #                         today_end_datetime_utc))
        # row = cursor_billing.fetchone()
        # if row is not None:
        #     today_generation_revenue_value = row[0]
        #
        # cursor_billing.execute(" SELECT SUM(actual_value) "
        #                        " FROM tbl_meter_hourly "
        #                        " WHERE meter_id = %s ",
        #                        (generation_meter_id,))
        # row = cursor_billing.fetchone()
        # if row is not None:
        #     total_generation_revenue_value = row[0]

        ################################################################################################################
        # Step 8: query associated points data on containers
        ################################################################################################################
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()

        for point in point_list:
            point_values = []
            point_timestamps = []
            if point['object_type'] == 'ENERGY_VALUE':
                query = (" SELECT utc_date_time, actual_value "
                         " FROM tbl_energy_value "
                         " WHERE point_id = %s "
                         "       AND utc_date_time BETWEEN %s AND %s "
                         " ORDER BY utc_date_time ")
                cursor_historical.execute(query, (point['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                rows = cursor_historical.fetchall()

                if rows is not None and len(rows) > 0:
                    reporting_start_datetime_local = reporting_start_datetime_utc.replace(tzinfo=timezone.utc) + \
                                                     timedelta(minutes=timezone_offset)
                    current_datetime_local = reporting_start_datetime_local

                    while current_datetime_local < rows[0][0].replace(tzinfo=timezone.utc) + \
                            timedelta(minutes=timezone_offset):
                        point_timestamps.append(current_datetime_local.strftime('%m-%d %H:%M'))
                        point_values.append(rows[0][1])
                        current_datetime_local += timedelta(minutes=1)

                    for index in range(len(rows) - 1):
                        while current_datetime_local < rows[index + 1][0].replace(tzinfo=timezone.utc) + \
                                timedelta(minutes=timezone_offset):
                            point_timestamps.append(current_datetime_local.strftime('%m-%d %H:%M'))
                            point_values.append(rows[index][1])
                            current_datetime_local += timedelta(minutes=1)
            elif point['object_type'] == 'ANALOG_VALUE':
                query = (" SELECT utc_date_time, actual_value "
                         " FROM tbl_analog_value "
                         " WHERE point_id = %s "
                         "       AND utc_date_time BETWEEN %s AND %s "
                         " ORDER BY utc_date_time ")
                cursor_historical.execute(query, (point['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                rows = cursor_historical.fetchall()

                if rows is not None and len(rows) > 0:
                    reporting_start_datetime_local = reporting_start_datetime_utc.replace(tzinfo=timezone.utc) + \
                                                     timedelta(minutes=timezone_offset)
                    current_datetime_local = reporting_start_datetime_local

                    while current_datetime_local < rows[0][0].replace(tzinfo=timezone.utc) + \
                            timedelta(minutes=timezone_offset):
                        point_timestamps.append(current_datetime_local.strftime('%m-%d %H:%M'))
                        point_values.append(rows[0][1])
                        current_datetime_local += timedelta(minutes=1)

                    for index in range(len(rows) - 1):
                        while current_datetime_local < rows[index + 1][0].replace(tzinfo=timezone.utc) + \
                                timedelta(minutes=timezone_offset):
                            point_timestamps.append(current_datetime_local.strftime('%m-%d %H:%M'))
                            point_values.append(rows[index][1])
                            current_datetime_local += timedelta(minutes=1)
            elif point['object_type'] == 'DIGITAL_VALUE':
                query = (" SELECT utc_date_time, actual_value "
                         " FROM tbl_digital_value "
                         " WHERE point_id = %s "
                         "       AND utc_date_time BETWEEN %s AND %s "
                         " ORDER BY utc_date_time ")
                cursor_historical.execute(query, (point['id'],
                                                  reporting_start_datetime_utc,
                                                  reporting_end_datetime_utc))
                rows = cursor_historical.fetchall()

                if rows is not None and len(rows) > 0:
                    reporting_start_datetime_local = reporting_start_datetime_utc.replace(tzinfo=timezone.utc) + \
                                                     timedelta(minutes=timezone_offset)
                    current_datetime_local = reporting_start_datetime_local

                    while current_datetime_local < rows[0][0].replace(tzinfo=timezone.utc) + \
                            timedelta(minutes=timezone_offset):
                        point_timestamps.append(current_datetime_local.strftime('%m-%d %H:%M'))
                        point_values.append(rows[0][1])
                        current_datetime_local += timedelta(minutes=1)

                    for index in range(len(rows) - 1):
                        while current_datetime_local < rows[index + 1][0].replace(tzinfo=timezone.utc) + \
                                timedelta(minutes=timezone_offset):
                            point_timestamps.append(current_datetime_local.strftime('%m-%d %H:%M'))
                            point_values.append(rows[index][1])
                            current_datetime_local += timedelta(minutes=1)

            parameters_data['names'].append(point['name'] + ' (' + point['units'] + ')')
            parameters_data['timestamps'].append(point_timestamps)
            parameters_data['values'].append(point_values)

        # query pcs parameters
        pcs_parameters_data = dict()
        pcs_parameters_data['names'] = list()
        pcs_parameters_data['timestamps'] = list()
        pcs_parameters_data['values'] = list()
        cursor_system.execute(" SELECT invertor_state_point_id "
                              " FROM tbl_photovoltaic_power_stations_invertors "
                              " WHERE photovoltaic_power_station_id = %s "
                              " ORDER BY id "
                              " LIMIT 1 ",
                              (photovoltaic_power_station_id,))
        row_point = cursor_system.fetchone()

        if row_point is not None:
            pcs_run_state_point_id = row_point[0]
            point_values = []
            point_timestamps = []
            query = (" SELECT utc_date_time, actual_value "
                     " FROM tbl_digital_value "
                     " WHERE point_id = %s "
                     "       AND utc_date_time BETWEEN %s AND %s "
                     " ORDER BY utc_date_time ")
            cursor_historical.execute(query, (pcs_run_state_point_id,
                                              reporting_start_datetime_utc,
                                              reporting_end_datetime_utc))
            rows = cursor_historical.fetchall()

            if rows is not None and len(rows) > 0:
                for row in rows:
                    current_datetime_local = row[0].replace(tzinfo=timezone.utc) + \
                                             timedelta(minutes=timezone_offset)
                    current_datetime = current_datetime_local.strftime('%m-%d %H:%M')
                    point_timestamps.append(current_datetime)
                    point_values.append(row[1])

            pcs_parameters_data['names'].append('RunState')
            pcs_parameters_data['timestamps'].append(point_timestamps)
            pcs_parameters_data['values'].append(point_values)

        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()
        ################################################################################################################
        # Step 9: construct the report
        ################################################################################################################
        result = dict()
        result['photovoltaic_power_station'] = meta_result
        result['reporting_period'] = dict()
        result['reporting_period']['names'] = list()
        result['reporting_period']['units'] = list()
        result['reporting_period']['subtotals'] = list()
        result['reporting_period']['increment_rates'] = list()
        result['reporting_period']['timestamps'] = list()
        result['reporting_period']['values'] = list()

        result['energy_indicators'] = dict()
        result['energy_indicators']['today_generation_energy_value'] = today_generation_energy_value
        result['energy_indicators']['total_generation_energy_value'] = total_generation_energy_value

        result['revenue_indicators'] = dict()
        result['revenue_indicators']['today_generation_revenue_value'] = today_generation_revenue_value
        result['revenue_indicators']['total_generation_revenue_value'] = total_generation_revenue_value

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }
        result['pcs_parameters'] = {
            "names": pcs_parameters_data['names'],
            "timestamps": pcs_parameters_data['timestamps'],
            "values": pcs_parameters_data['values']}

        resp.text = json.dumps(result)
