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
    # Step 2: query the photovoltaic power station
    # Step 5: query associated grids on containers
    # Step 6: query associated loads on containers
    # Step 7: query associated invertors on the photovoltaic power station
    #     Step 7.1 query energy indicator data
    #     Step 7.2 query revenue indicator data
    # Step 8: query associated points data on the photovoltaic power station
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
        # Step 2: query the photovoltaic power station
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_billing = mysql.connector.connect(**config.myems_billing_db)
        cursor_billing = cnx_billing.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if photovoltaic_power_station_id is not None:
            query = (" SELECT e.id, e.name, e.uuid, "
                     "        e.address, e.latitude, e.longitude, e.rated_capacity, e.rated_power, "
                     "        s.source_code, e.description, e.phase_of_lifecycle "
                     " FROM tbl_photovoltaic_power_stations e, tbl_svgs s "
                     " WHERE e.svg_id = s.id AND e.id = %s ")
            cursor_system.execute(query, (photovoltaic_power_station_id,))
            row = cursor_system.fetchone()
        elif photovoltaic_power_station_uuid is not None:
            query = (" SELECT e.id, e.name, e.uuid, "
                     "        e.address, e.latitude, e.longitude, e.rated_capacity, e.rated_power, "
                     "        s.source_code, e.description, e.phase_of_lifecycle "
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
                           "latitude": row[4],
                           "longitude": row[5],
                           "rated_capacity": row[6],
                           "rated_power": row[7],
                           "svg": row[8],
                           "description": row[9],
                           "phase_of_lifecycle": row[10],
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
        # Step 5: query associated grids on the photovoltaic power station
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, cg.name, p.units, p.object_type  "
                              " FROM tbl_photovoltaic_power_stations_grids cg, tbl_points p "
                              " WHERE cg.photovoltaic_power_station_id = %s AND cg.power_point_id = p.id ",
                              (photovoltaic_power_station_id,))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row_point in rows_points:
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
        # Step 6: query associated loads on the photovoltaic power station
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, cl.name, p.units, p.object_type  "
                              " FROM tbl_photovoltaic_power_stations_loads cl, tbl_points p "
                              " WHERE cl.photovoltaic_power_station_id = %s AND cl.power_point_id = p.id ",
                              (photovoltaic_power_station_id,))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row_point in rows_points:
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
        # Step 6: query associated invertors on the photovoltaic power station
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, ppai.name, p.units, p.object_type  "
                              " FROM tbl_photovoltaic_power_stations_invertors ppai, tbl_points p "
                              " WHERE ppai.photovoltaic_power_station_id = %s AND ppai.active_power_point_id = p.id ",
                              (photovoltaic_power_station_id,))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row_point in rows_points:
                point_list.append({"id": row_point[0],
                                   "name": row_point[1] + '.P',
                                   "units": row_point[2],
                                   "object_type": row_point[3]})

        ################################################################################################################
        # Step 7 query energy indicator data
        ################################################################################################################
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        today_end_datetime_utc = datetime.utcnow()
        today_end_datetime_local = datetime.utcnow() + timedelta(minutes=timezone_offset)
        today_start_datetime_local = today_end_datetime_local.replace(hour=0, minute=0, second=0, microsecond=0)
        today_start_datetime_utc = today_start_datetime_local - timedelta(minutes=timezone_offset)

        today_generation_energy_value = Decimal(0.0)
        total_generation_energy_value = Decimal(0.0)

        cursor_energy.execute(" SELECT SUM(actual_value) "
                              " FROM tbl_photovoltaic_power_station_generation_hourly "
                              " WHERE photovoltaic_power_station_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (photovoltaic_power_station_id,
                               today_start_datetime_utc,
                               today_end_datetime_utc))
        row = cursor_energy.fetchone()
        if row is not None:
            today_generation_energy_value = row[0]
        cursor_energy.execute(" SELECT SUM(actual_value) "
                              " FROM tbl_photovoltaic_power_station_generation_hourly "
                              " WHERE photovoltaic_power_station_id = %s ",
                              (photovoltaic_power_station_id,))
        row = cursor_energy.fetchone()
        if row is not None:
            total_generation_energy_value = row[0]

        ################################################################################################################
        # Step 8 query revenue indicator data
        ################################################################################################################
        today_generation_revenue_value = Decimal(0.0)
        total_generation_revenue_value = Decimal(0.0)
        cursor_billing.execute(" SELECT SUM(actual_value) "
                               " FROM tbl_photovoltaic_power_station_generation_hourly "
                               " WHERE photovoltaic_power_station_id = %s "
                               "     AND start_datetime_utc >= %s "
                               "     AND start_datetime_utc < %s ",
                               (photovoltaic_power_station_id,
                                today_start_datetime_utc,
                                today_end_datetime_utc))
        row = cursor_billing.fetchone()
        if row is not None:
            today_generation_revenue_value = row[0]

        cursor_billing.execute(" SELECT SUM(actual_value) "
                               " FROM tbl_photovoltaic_power_station_generation_hourly "
                               " WHERE photovoltaic_power_station_id = %s ",
                               (photovoltaic_power_station_id,))
        row = cursor_billing.fetchone()
        if row is not None:
            total_generation_revenue_value = row[0]

        ################################################################################################################
        # Step 8: query parameters data on the photovoltaic power station
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
                        point_timestamps.append(current_datetime_local.isoformat()[5:16])
                        point_values.append(rows[0][1])
                        current_datetime_local += timedelta(minutes=1)

                    for index in range(len(rows) - 1):
                        while current_datetime_local < rows[index + 1][0].replace(tzinfo=timezone.utc) + \
                                timedelta(minutes=timezone_offset):
                            point_timestamps.append(current_datetime_local.isoformat()[5:16])
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
                        point_timestamps.append(current_datetime_local.isoformat()[5:16])
                        point_values.append(rows[0][1])
                        current_datetime_local += timedelta(minutes=1)

                    for index in range(len(rows) - 1):
                        while current_datetime_local < rows[index + 1][0].replace(tzinfo=timezone.utc) + \
                                timedelta(minutes=timezone_offset):
                            point_timestamps.append(current_datetime_local.isoformat()[5:16])
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
                        point_timestamps.append(current_datetime_local.isoformat()[5:16])
                        point_values.append(rows[0][1])
                        current_datetime_local += timedelta(minutes=1)

                    for index in range(len(rows) - 1):
                        while current_datetime_local < rows[index + 1][0].replace(tzinfo=timezone.utc) + \
                                timedelta(minutes=timezone_offset):
                            point_timestamps.append(current_datetime_local.isoformat()[5:16])
                            point_values.append(rows[index][1])
                            current_datetime_local += timedelta(minutes=1)

            parameters_data['names'].append(point['name'] + ' (' + point['units'] + ')')
            parameters_data['timestamps'].append(point_timestamps)
            parameters_data['values'].append(point_values)

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
        result['energy_indicators']['performance_ratio'] = \
            Decimal(100) * (today_generation_energy_value / meta_result['rated_capacity']) \
            if meta_result['rated_capacity'] > 0 else None

        result['revenue_indicators'] = dict()
        result['revenue_indicators']['today_generation_revenue_value'] = today_generation_revenue_value
        result['revenue_indicators']['total_generation_revenue_value'] = total_generation_revenue_value

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }
        resp.text = json.dumps(result)
