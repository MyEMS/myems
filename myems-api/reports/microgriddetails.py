"""
Microgrid Details Report API

This module provides REST API endpoints for generating detailed microgrid reports.
It analyzes comprehensive microgrid data including energy consumption, generation,
storage, and distribution to provide detailed insights into microgrid performance.

Key Features:
- Comprehensive microgrid analysis
- Energy generation and consumption tracking
- Storage system monitoring
- Distribution network analysis
- Performance optimization insights
- Detailed component analysis

Report Components:
- Microgrid energy generation summary
- Energy consumption analysis
- Storage system performance
- Distribution network metrics
- Component performance indicators
- Optimization recommendations

The module uses Falcon framework for REST API and includes:
- Database queries for detailed microgrid data
- Comprehensive analysis algorithms
- Performance monitoring tools
- Multi-language support
- User authentication and authorization
"""

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
        _ = req
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the microgrid
    # Step 3: query associated batteries
    # Step 4: query associated power conversion systems
    # Step 5: query associated evchargers
    # Step 6: query associated generators
    # Step 7: query associated grids
    # Step 8: query associated heatpumps
    # Step 9: query associated loads
    # Step 10: query associated photovoltaics
    # Step 11: query associated schedules
    # Step 12: query associated sensors
    # Step 13: query associated meters data
    # Step 14: query associated points data
    # Step 15: construct the report
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
        # this procedure accepts microgrid id or microgrid uuid to identify a microgrid
        microgrid_id = req.params.get('id')
        microgrid_uuid = req.params.get('uuid')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if microgrid_id is None and microgrid_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_MICROGRID_ID')

        if microgrid_id is not None:
            microgrid_id = str.strip(microgrid_id)
            if not microgrid_id.isdigit() or int(microgrid_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_MICROGRID_ID')

        if microgrid_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(microgrid_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_MICROGRID_UUID')

        reporting_start_datetime_utc = datetime.utcnow() - timedelta(days=3)
        reporting_end_datetime_utc = datetime.utcnow()

        ################################################################################################################
        # Step 2: Step 2: query the microgrid
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_billing = mysql.connector.connect(**config.myems_billing_db)
        cursor_billing = cnx_billing.cursor()

        cnx_carbon = mysql.connector.connect(**config.myems_carbon_db)
        cursor_carbon = cnx_carbon.cursor()

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
        if microgrid_id is not None:
            query = (" SELECT m.id, m.name, m.uuid, "
                     "        m.address, m.postal_code, m.latitude, m.longitude, m.rated_capacity, m.rated_power, "
                     "        m.contact_id, m.cost_center_id, m.serial_number, s.source_code, m.description "
                     " FROM tbl_microgrids m, tbl_svgs s"
                     " WHERE m.svg_id = s.id AND m.id = %s ")
            cursor_system.execute(query, (microgrid_id,))
            row = cursor_system.fetchone()
        elif microgrid_uuid is not None:
            query = (" SELECT m.id, m.name, m.uuid, "
                     "        m.address, m.postal_code, m.latitude, m.longitude, m.rated_capacity, m.rated_power, "
                     "        m.contact_id, m.cost_center_id, m.serial_number, s.source_code, m.description "
                     " FROM tbl_microgrids m, tbl_svgs s "
                     " WHERE m.svg_id = s.id AND m.uuid = %s ")
            cursor_system.execute(query, (microgrid_uuid,))
            row = cursor_system.fetchone()

        if row is None:
            cursor_system.close()
            cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.MICROGRID_NOT_FOUND')
        else:
            microgrid_id = row[0]
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
                           "serial_number": row[11],
                           "svg": row[12],
                           "description": row[13],
                           "qrcode": 'microgrid:' + row[2]}

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
        # Step 3: query associated batteries
        ################################################################################################################

        energy_value_latest_dict = dict()
        query = (" SELECT point_id, actual_value "
                 " FROM tbl_energy_value_latest ")
        cursor_historical.execute(query, )
        energy_value_latest_rows = cursor_historical.fetchall()
        for row in energy_value_latest_rows:
            energy_value_latest_dict[row[0]] = row[1]

        analog_value_latest_dict = dict()
        query = (" SELECT point_id, actual_value "
                 " FROM tbl_analog_value_latest ")
        cursor_historical.execute(query, )
        analog_value_latest_rows = cursor_historical.fetchall()
        for row in analog_value_latest_rows:
            analog_value_latest_dict[row[0]] = row[1]

        digital_value_latest_dict = dict()
        query = (" SELECT point_id, actual_value "
                 " FROM tbl_digital_value_latest ")
        cursor_historical.execute(query, )
        digital_value_latest_rows = cursor_historical.fetchall()
        for row in digital_value_latest_rows:
            digital_value_latest_dict[row[0]] = row[1]

        cursor_system.execute(" SELECT battery_state_point_id "
                              " FROM tbl_microgrids_batteries "
                              " WHERE microgrid_id = %s "
                              " ORDER BY id "
                              " LIMIT 1 ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            battery_state_point_id = row_point[0]

        if digital_value_latest_dict.get(battery_state_point_id) is not None:
            battery_state_point_value = digital_value_latest_dict.get(battery_state_point_id)

        cursor_system.execute(" SELECT p.id, mb.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_batteries mb, tbl_points p "
                              " WHERE mb.microgrid_id = %s AND mb.soc_point_id = p.id ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1] + '.SOC',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT p.id, mb.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_batteries mb, tbl_points p "
                              " WHERE mb.microgrid_id = %s AND mb.power_point_id = p.id ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1]+'.P',
                               "units": row_point[2],
                               "object_type": row_point[3]})
        charge_meter_id = None
        cursor_system.execute(" SELECT m.id, mb.name, m.energy_category_id  "
                              " FROM tbl_microgrids_batteries mb, tbl_meters m "
                              " WHERE mb.microgrid_id = %s AND mb.charge_meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '.Charge',
                               "energy_category_id": row_meter[2]})
            charge_meter_id = row_meter[0]

        discharge_meter_id = None
        cursor_system.execute(" SELECT m.id, mb.name, m.energy_category_id  "
                              " FROM tbl_microgrids_batteries mb, tbl_meters m "
                              " WHERE mb.microgrid_id = %s AND mb.discharge_meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '.Discharge',
                               "energy_category_id": row_meter[2]})
            discharge_meter_id = row_meter[0]

        ################################################################################################################
        # Step 4: query associated power conversion systems
        ################################################################################################################
        # Step 4.1 query energy indicator data
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        today_end_datetime_utc = datetime.utcnow()
        today_end_datetime_local = datetime.utcnow() + timedelta(minutes=timezone_offset)
        today_start_datetime_local = today_end_datetime_local.replace(hour=0, minute=0, second=0, microsecond=0)
        today_start_datetime_utc = today_start_datetime_local - timedelta(minutes=timezone_offset)

        today_charge_energy_value = Decimal(0.0)
        today_discharge_energy_value = Decimal(0.0)
        total_charge_energy_value = Decimal(0.0)
        total_discharge_energy_value = Decimal(0.0)

        # query meter energy
        cursor_energy.execute(" SELECT SUM(actual_value) "
                              " FROM tbl_meter_hourly "
                              " WHERE meter_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (charge_meter_id,
                               today_start_datetime_utc,
                               today_end_datetime_utc))
        row = cursor_energy.fetchone()
        if row is not None:
            today_charge_energy_value = row[0]

        cursor_energy.execute(" SELECT SUM(actual_value) "
                              " FROM tbl_meter_hourly "
                              " WHERE meter_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (discharge_meter_id,
                               today_start_datetime_utc,
                               today_end_datetime_utc))
        row = cursor_energy.fetchone()
        if row is not None:
            today_discharge_energy_value = row[0]

        cursor_energy.execute(" SELECT SUM(actual_value) "
                              " FROM tbl_meter_hourly "
                              " WHERE meter_id = %s ",
                              (charge_meter_id,))
        row = cursor_energy.fetchone()
        if row is not None:
            total_charge_energy_value = row[0]

        cursor_energy.execute(" SELECT SUM(actual_value) "
                              " FROM tbl_meter_hourly "
                              " WHERE meter_id = %s ",
                              (discharge_meter_id,))
        row = cursor_energy.fetchone()
        if row is not None:
            total_discharge_energy_value = row[0]

        # Step 4.2 query revenue indicator data
        today_charge_revenue_value = Decimal(0.0)
        today_discharge_revenue_value = Decimal(0.0)
        total_charge_revenue_value = Decimal(0.0)
        total_discharge_revenue_value = Decimal(0.0)

        # query meter revenue
        cursor_billing.execute(" SELECT SUM(actual_value) "
                               " FROM tbl_meter_hourly "
                               " WHERE meter_id = %s "
                               "     AND start_datetime_utc >= %s "
                               "     AND start_datetime_utc < %s ",
                               (charge_meter_id,
                                today_start_datetime_utc,
                                today_end_datetime_utc))
        row = cursor_billing.fetchone()
        if row is not None:
            today_charge_revenue_value = row[0]

        cursor_billing.execute(" SELECT SUM(actual_value) "
                               " FROM tbl_meter_hourly "
                               " WHERE meter_id = %s "
                               "     AND start_datetime_utc >= %s "
                               "     AND start_datetime_utc < %s ",
                               (discharge_meter_id,
                                today_start_datetime_utc,
                                today_end_datetime_utc))
        row = cursor_billing.fetchone()
        if row is not None:
            today_discharge_revenue_value = row[0]

        cursor_billing.execute(" SELECT SUM(actual_value) "
                               " FROM tbl_meter_hourly "
                               " WHERE meter_id = %s ",
                               (charge_meter_id,))
        row = cursor_billing.fetchone()
        if row is not None:
            total_charge_revenue_value = row[0]

        cursor_billing.execute(" SELECT SUM(actual_value) "
                               " FROM tbl_meter_hourly "
                               " WHERE meter_id = %s ",
                               (discharge_meter_id,))
        row = cursor_billing.fetchone()
        if row is not None:
            total_discharge_revenue_value = row[0]

        # Step 4.3 query carbon indicator data
        today_charge_carbon_value = Decimal(0.0)
        today_discharge_carbon_value = Decimal(0.0)
        total_charge_carbon_value = Decimal(0.0)
        total_discharge_carbon_value = Decimal(0.0)

        # query meter carbon
        cursor_carbon.execute(" SELECT SUM(actual_value) "
                              " FROM tbl_meter_hourly "
                              " WHERE meter_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (charge_meter_id,
                               today_start_datetime_utc,
                               today_end_datetime_utc))
        row = cursor_carbon.fetchone()
        if row is not None:
            today_charge_carbon_value = row[0]

        cursor_carbon.execute(" SELECT SUM(actual_value) "
                              " FROM tbl_meter_hourly "
                              " WHERE meter_id = %s "
                              "     AND start_datetime_utc >= %s "
                              "     AND start_datetime_utc < %s ",
                              (discharge_meter_id,
                               today_start_datetime_utc,
                               today_end_datetime_utc))
        row = cursor_carbon.fetchone()
        if row is not None:
            today_discharge_carbon_value = row[0]

        cursor_carbon.execute(" SELECT SUM(actual_value) "
                              " FROM tbl_meter_hourly "
                              " WHERE meter_id = %s ",
                              (charge_meter_id,))
        row = cursor_carbon.fetchone()
        if row is not None:
            total_charge_carbon_value = row[0]

        cursor_carbon.execute(" SELECT SUM(actual_value) "
                              " FROM tbl_meter_hourly "
                              " WHERE meter_id = %s ",
                              (discharge_meter_id,))
        row = cursor_carbon.fetchone()
        if row is not None:
            total_discharge_carbon_value = row[0]

        ################################################################################################################
        # Step 5: query associated evchargers
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, me.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_evchargers me, tbl_points p "
                              " WHERE me.microgrid_id = %s AND me.power_point_id = p.id ",
                              (microgrid_id,))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row_point in rows_points:
                point_list.append({"id": row_point[0],
                                   "name": row_point[1]+'.P',
                                   "units": row_point[2],
                                   "object_type": row_point[3]})

        cursor_system.execute(" SELECT m.id, me.name, m.energy_category_id  "
                              " FROM tbl_microgrids_evchargers me, tbl_meters m "
                              " WHERE me.microgrid_id = %s AND me.meter_id = m.id ",
                              (microgrid_id,))
        rows_meters = cursor_system.fetchall()
        if rows_meters is not None and len(rows_meters) > 0:
            for row_meter in rows_meters:
                meter_list.append({"id": row_meter[0],
                                   "name": row_meter[1],
                                   "energy_category_id": row_meter[2]})
        ################################################################################################################
        # Step 6: query associated generators
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, mg.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_generators mg, tbl_points p "
                              " WHERE mg.microgrid_id = %s AND mg.power_point_id = p.id ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1]+'.P',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT m.id, mg.name, m.energy_category_id  "
                              " FROM tbl_microgrids_generators mg, tbl_meters m "
                              " WHERE mg.microgrid_id = %s AND mg.meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1],
                               "energy_category_id": row_meter[2]})
        ################################################################################################################
        # Step 7: query associated grids
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, mg.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_grids mg, tbl_points p "
                              " WHERE mg.microgrid_id = %s AND mg.power_point_id = p.id ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1]+'.P',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT m.id, mg.name, m.energy_category_id  "
                              " FROM tbl_microgrids_grids mg, tbl_meters m "
                              " WHERE mg.microgrid_id = %s AND mg.buy_meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '.Buy',
                               "energy_category_id": row_meter[2]})

        cursor_system.execute(" SELECT m.id, mg.name, m.energy_category_id  "
                              " FROM tbl_microgrids_grids mg, tbl_meters m "
                              " WHERE mg.microgrid_id = %s AND mg.sell_meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '.Sell',
                               "energy_category_id": row_meter[2]})

        ################################################################################################################
        # Step 8: query associated heatpumps
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, mh.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_heatpumps mh, tbl_points p "
                              " WHERE mh.microgrid_id = %s AND mh.power_point_id = p.id ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1]+'.P',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT m.id, mh.name, m.energy_category_id  "
                              " FROM tbl_microgrids_heatpumps mh, tbl_meters m "
                              " WHERE mh.microgrid_id = %s AND mh.electricity_meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '.Electricity',
                               "energy_category_id": row_meter[2]})

        cursor_system.execute(" SELECT m.id, mh.name, m.energy_category_id  "
                              " FROM tbl_microgrids_heatpumps mh, tbl_meters m "
                              " WHERE mh.microgrid_id = %s AND mh.heat_meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '.Heat',
                               "energy_category_id": row_meter[2]})

        cursor_system.execute(" SELECT m.id, mh.name, m.energy_category_id  "
                              " FROM tbl_microgrids_heatpumps mh, tbl_meters m "
                              " WHERE mh.microgrid_id = %s AND mh.cooling_meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1] + '.Cooling',
                               "energy_category_id": row_meter[2]})

        ################################################################################################################
        # Step 9: query associated loads
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, ml.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_loads ml, tbl_points p "
                              " WHERE ml.microgrid_id = %s AND ml.power_point_id = p.id ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1]+'.P',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT m.id, ml.name, m.energy_category_id  "
                              " FROM tbl_microgrids_loads ml, tbl_meters m "
                              " WHERE ml.microgrid_id = %s AND ml.meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1],
                               "energy_category_id": row_meter[2]})
        ################################################################################################################
        # Step 10: query associated photovoltaics
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, mp.name, p.units, p.object_type  "
                              " FROM tbl_microgrids_photovoltaics mp, tbl_points p "
                              " WHERE mp.id = %s AND mp.power_point_id = p.id ",
                              (microgrid_id,))
        row_point = cursor_system.fetchone()
        if row_point is not None:
            point_list.append({"id": row_point[0],
                               "name": row_point[1]+'.P',
                               "units": row_point[2],
                               "object_type": row_point[3]})

        cursor_system.execute(" SELECT m.id, mp.name, m.energy_category_id  "
                              " FROM tbl_microgrids_photovoltaics mp, tbl_meters m "
                              " WHERE mp.id = %s AND mp.meter_id = m.id ",
                              (microgrid_id,))
        row_meter = cursor_system.fetchone()
        if row_meter is not None:
            meter_list.append({"id": row_meter[0],
                               "name": row_meter[1],
                               "energy_category_id": row_meter[2]})

        ################################################################################################################
        # Step 11: query associated schedules
        ################################################################################################################
        schedule_list = list()
        schedule_series_data = list()
        cursor_system.execute(" SELECT start_time_of_day, end_time_of_day, peak_type, power "
                              " FROM tbl_microgrids_schedules "
                              " WHERE microgrid_id = %s "
                              " ORDER BY start_time_of_day ",
                              (microgrid_id,))
        rows_schedules = cursor_system.fetchall()
        if rows_schedules is None or len(rows_schedules) == 0:
            pass
        else:
            for row_schedule in rows_schedules:
                start_time = row_schedule[0]
                end_time = row_schedule[1]
                current_time = start_time
                if row_schedule[2] == 'toppeak':
                    peak_type = 'Top-Peak'
                elif row_schedule[2] == 'onpeak':
                    peak_type = 'On-Peak'
                elif row_schedule[2] == 'midpeak':
                    peak_type = 'Mid-Peak'
                elif row_schedule[2] == 'offpeak':
                    peak_type = 'Off-Peak'
                elif row_schedule[2] == 'deep':
                    peak_type = 'Deep-Valley'
                else:
                    peak_type = 'Unknown'

                while current_time < end_time:
                    schedule_series_data.append(row_schedule[3])
                    current_time = current_time + timedelta(minutes=30)

                schedule_list.append({"start_time_of_day": '0' + str(start_time) if len(str(start_time)) == 7
                                     else str(start_time),
                                      "end_time_of_day": '0' + str(end_time) if len(str(end_time)) == 7
                                      else str(end_time),
                                      "peak_type": peak_type,
                                      "power": row_schedule[3]})
            print('schedule_list:' + str(schedule_list))
        ################################################################################################################
        # Step 12: query associated sensors
        ################################################################################################################
        cursor_system.execute(" SELECT p.id, p.name, p.units, p.object_type "
                              " FROM tbl_microgrids_sensors ms, tbl_sensors_points sp, tbl_points p "
                              " WHERE ms.microgrid_id = %s "
                              " AND ms.sensor_id = sp.sensor_id "
                              " AND sp.point_id  = p.id ",
                              (microgrid_id,))
        rows_points = cursor_system.fetchall()
        if rows_points is not None and len(rows_points) > 0:
            for row_point in rows_points:
                point_list.append({"id": row_point[0],
                                   "name": row_point[1],
                                   "units": row_point[2],
                                   "object_type": row_point[3]})
        ################################################################################################################
        # Step 13: query associated meters data
        ################################################################################################################
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        meter_report_list = list()

        for meter in meter_list:
            cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                  " FROM tbl_meter_hourly "
                                  " WHERE meter_id = %s "
                                  "     AND start_datetime_utc >= %s "
                                  "     AND start_datetime_utc < %s "
                                  " ORDER BY start_datetime_utc ",
                                  (meter['id'],
                                   reporting_start_datetime_utc,
                                   reporting_end_datetime_utc))
            rows_meter_hourly = cursor_energy.fetchall()
            if rows_meter_hourly is not None and len(rows_meter_hourly) > 0:
                meter_report = dict()
                meter_report['timestamps'] = list()
                meter_report['values'] = list()
                meter_report['subtotal'] = Decimal(0.0)

                for row_meter_hourly in rows_meter_hourly:
                    current_datetime_local = row_meter_hourly[0].replace(tzinfo=timezone.utc) + \
                                             timedelta(minutes=timezone_offset)
                    current_datetime = current_datetime_local.isoformat()[0:19]

                    actual_value = Decimal(0.0) if row_meter_hourly[1] is None else row_meter_hourly[1]

                    meter_report['timestamps'].append(current_datetime)
                    meter_report['values'].append(actual_value)
                    meter_report['subtotal'] += actual_value
                    meter_report['name'] = meter['name']
                    meter_report['unit_of_measure'] = \
                        energy_category_dict[meter['energy_category_id']]['unit_of_measure']

                meter_report_list.append(meter_report)

        ################################################################################################################
        # Step 14: query associated points data
        ################################################################################################################

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
        # Step 15: construct the report
        ################################################################################################################
        result = dict()
        result['microgrid'] = meta_result

        result['reporting_period'] = dict()
        result['reporting_period']['names'] = list()
        result['reporting_period']['units'] = list()
        result['reporting_period']['subtotals'] = list()
        result['reporting_period']['increment_rates'] = list()
        result['reporting_period']['timestamps'] = list()
        result['reporting_period']['values'] = list()

        if meter_report_list is not None and len(meter_report_list) > 0:
            for meter_report in meter_report_list:
                result['reporting_period']['names'].append(meter_report['name'])
                result['reporting_period']['units'].append(meter_report['unit_of_measure'])
                result['reporting_period']['timestamps'].append(meter_report['timestamps'])
                result['reporting_period']['values'].append(meter_report['values'])
                result['reporting_period']['subtotals'].append(meter_report['subtotal'])

        result['schedule'] = dict()
        result['schedule']['series_data'] = schedule_series_data
        result['schedule']['schedule_list'] = schedule_list

        result['energy_indicators'] = dict()
        result['energy_indicators']['today_charge_energy_value'] = today_charge_energy_value
        result['energy_indicators']['today_discharge_energy_value'] = today_discharge_energy_value
        result['energy_indicators']['total_charge_energy_value'] = total_charge_energy_value
        result['energy_indicators']['total_discharge_energy_value'] = total_discharge_energy_value

        result['revenue_indicators'] = dict()
        result['revenue_indicators']['today_charge_revenue_value'] = today_charge_revenue_value
        result['revenue_indicators']['today_discharge_revenue_value'] = today_discharge_revenue_value
        result['revenue_indicators']['total_charge_revenue_value'] = total_charge_revenue_value
        result['revenue_indicators']['total_discharge_revenue_value'] = total_discharge_revenue_value

        result['carbon_indicators'] = dict()
        result['carbon_indicators']['today_charge_carbon_value'] = today_charge_carbon_value
        result['carbon_indicators']['today_discharge_carbon_value'] = today_discharge_carbon_value
        result['carbon_indicators']['total_charge_carbon_value'] = total_charge_carbon_value
        result['carbon_indicators']['total_discharge_carbon_value'] = total_discharge_carbon_value

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }

        resp.text = json.dumps(result)

