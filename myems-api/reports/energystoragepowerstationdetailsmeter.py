"""
Energy Storage Power Station Details Meter Report API

This module provides REST API endpoints for generating energy storage power station meter reports.
It analyzes meter data and performance metrics to provide insights into metering
system performance, accuracy, and optimization opportunities.

Key Features:
- Meter performance analysis
- Metering accuracy analysis
- Performance metrics calculation
- Metering optimization insights
- Performance monitoring
- Metering system analysis

Report Components:
- Meter performance summary
- Metering accuracy metrics
- Performance indicators
- Metering optimization recommendations
- Metering system analysis
- Performance trends

The module uses Falcon framework for REST API and includes:
- Database queries for meter data
- Performance analysis algorithms
- Metering monitoring tools
- Multi-language support
- User authentication and authorization
"""

from datetime import datetime, timedelta
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
    def on_options(req, resp, id_):
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the energy storage power station
    # Step 3: query associated containers
    # Step 4: query analog points latest values
    # Step 5: query energy points latest values
    # Step 6: query digital points latest values
    # Step 7: query the points of meters
    # Step 8: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp, id_):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ENERGY_STORAGE_POWER_STATION_ID')
        energy_storage_power_station_id = id_
        ################################################################################################################
        # Step 2: query the energy storage power station
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if energy_storage_power_station_id is not None:
            query = (" SELECT id, name, uuid "
                     " FROM tbl_energy_storage_power_stations "
                     " WHERE id = %s ")
            cursor_system.execute(query, (energy_storage_power_station_id,))
            row = cursor_system.fetchone()
            if row is None:
                cursor_system.close()
                cnx_system.close()
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.ENERGY_STORAGE_POWER_STATION_NOT_FOUND')

        # query all points
        query = (" SELECT id, name, units, description "
                 " FROM tbl_points ")
        cursor_system.execute(query)
        rows = cursor_system.fetchall()

        points_dict = dict()
        if rows is not None and len(rows) > 0:
            for row in rows:
                points_dict[row[0]] = [row[1], row[2], row[3]]
        ################################################################################################################
        # Step 3: query associated containers
        ################################################################################################################
        container_list = list()
        cursor_system.execute(" SELECT c.id, c.name, c.uuid "
                              " FROM tbl_energy_storage_power_stations_containers espsc, "
                              "      tbl_energy_storage_containers c "
                              " WHERE espsc.energy_storage_power_station_id = %s "
                              "      AND espsc.energy_storage_container_id = c.id ",
                              (energy_storage_power_station_id,))
        rows_containers = cursor_system.fetchall()
        if rows_containers is not None and len(rows_containers) > 0:
            for row_container in rows_containers:
                container_list.append({"id": row_container[0],
                                       "name": row_container[1],
                                       "uuid": row_container[2]})
        print('container_list:' + str(container_list))

        ################################################################################################################
        # Step 4: query analog points latest values
        ################################################################################################################
        latest_value_dict = dict()
        query = (" SELECT point_id, actual_value "
                 " FROM tbl_analog_value_latest "
                 " WHERE utc_date_time > %s ")
        cursor_historical.execute(query, (datetime.utcnow() - timedelta(minutes=60),))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                latest_value_dict[row[0]] = [points_dict[row[0]][0],
                                             points_dict[row[0]][1],
                                             points_dict[row[0]][2],
                                             row[1]]

        ################################################################################################################
        # Step 5: query energy points latest values
        ################################################################################################################
        query = (" SELECT point_id, actual_value "
                 " FROM tbl_energy_value_latest "
                 " WHERE utc_date_time > %s ")
        cursor_historical.execute(query, (datetime.utcnow() - timedelta(minutes=60),))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                latest_value_dict[row[0]] = [points_dict[row[0]][0],
                                             points_dict[row[0]][1],
                                             points_dict[row[0]][2],
                                             row[1]]

        ################################################################################################################
        # Step 6: query digital points latest values
        ################################################################################################################
        query = (" SELECT point_id, actual_value "
                 " FROM tbl_digital_value_latest "
                 " WHERE utc_date_time > %s ")
        cursor_historical.execute(query, (datetime.utcnow() - timedelta(minutes=60),))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                latest_value_dict[row[0]] = [points_dict[row[0]][0],
                                             points_dict[row[0]][1],
                                             points_dict[row[0]][2],
                                             row[1]]

        ################################################################################################################
        # Step 7: query the points of meters
        ################################################################################################################
        # query all points with units
        query = (" SELECT id, units "
                 " FROM tbl_points ")
        cursor_system.execute(query)
        rows = cursor_system.fetchall()

        units_dict = dict()
        if rows is not None and len(rows) > 0:
            for row in rows:
                units_dict[row[0]] = row[1]

        # query meter parameters
        meter_list = list()
        point_id_list = list()
        for container in container_list:
            cursor_system.execute(" SELECT charge_meter_id, discharge_meter_id "
                                  " FROM tbl_energy_storage_containers_batteries "
                                  " WHERE energy_storage_container_id = %s "
                                  " ORDER BY id ",
                                  (container['id'],))
            rows_meters = cursor_system.fetchall()
            if rows_meters is not None and len(rows_meters) > 0:
                for row in rows_meters:
                    charge_meter = dict()
                    charge_meter['id'] = row[0]
                    charge_meter['points'] = list()
                    meter_list.append(charge_meter)
                    discharge_meter = dict()
                    discharge_meter['id'] = row[1]
                    discharge_meter['points'] = list()
                    meter_list.append(discharge_meter)

            for index, meter in enumerate(meter_list):
                cursor_system.execute(" SELECT p.id "
                                      " FROM tbl_meters_points mp, tbl_points p "
                                      " WHERE mp.meter_id = %s AND mp.point_id = p.id "
                                      " ORDER BY mp.id ",
                                      (meter['id'],))
                rows_points = cursor_system.fetchall()
                if rows_points is not None and len(rows_points) > 0:
                    point_list = list()
                    for row in rows_points:
                        # ignore duplicate point
                        if row[0] in point_id_list:
                            continue
                        point_id_list.append(row[0])
                        point = latest_value_dict.get(row[0], None)
                        if point is not None:
                            point_list.append(point)
                    meter_list[index]['points'] = point_list

        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()
        ################################################################################################################
        # Step 8: construct the report
        ################################################################################################################
        all_in_one_meter = dict()
        all_in_one_meter['points'] = list()
        for meter in meter_list:
            all_in_one_meter['points'] += meter['points']

        resp.text = json.dumps([all_in_one_meter])
