"""
Point Real-time Report API

This module provides REST API endpoints for generating real-time point data reports.
It monitors and reports on real-time sensor data, point values, and system status
to provide immediate insights into current system performance and conditions.

Key Features:
- Real-time data monitoring
- Point value tracking
- System status reporting
- Live data streaming
- Performance monitoring
- Alert generation

Report Components:
- Real-time point values
- System status indicators
- Performance metrics
- Alert notifications
- Data trends
- System health status

The module uses Falcon framework for REST API and includes:
- Real-time data queries
- Live monitoring capabilities
- Performance tracking
- Alert management
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
        """"Initializes Reporting"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query analog points latest values
    # Step 3: query energy points latest values
    # Step 4: query digital points latest values
    # Step 5: construct the report
    ####################################################################################################################

    @staticmethod
    def on_get(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        reporting_start_datetime_utc = datetime.utcnow() - timedelta(minutes=60)
        latest_value_data = list()

        data_source_ids = None
        if 'data_source_ids' in req.params and len(str.strip(req.params['data_source_ids'])) > 0:
            try:
                data_source_ids = [int(x) for x in req.params['data_source_ids'].split(',') if x.strip().isdigit()]
            except KeyError as ex:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title='API.BAD_REQUEST',
                    description='API.MISSING_DATA_SOURCE_ID'
                )
            except (TypeError, ValueError) as ex:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title='API.BAD_REQUEST',
                    description='API.INVALID_DATA_SOURCE_ID'
                )
            except Exception:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title='API.BAD_REQUEST',
                    description='API.INVALID_DATA_SOURCE_ID'
                )

            if not data_source_ids:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title='API.BAD_REQUEST',
                    description='API.INVALID_DATA_SOURCE_ID'
                )


        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        ################################################################################################################
        # Step 2: query analog points latest values
        ################################################################################################################
        if data_source_ids:
            placeholder = ','.join(['%s'] * len(data_source_ids))
            query = (
                " SELECT v.point_id, v.actual_value "
                " FROM tbl_analog_value_latest v "
                " JOIN myems_system_db.tbl_points p ON v.point_id = p.id "
                " WHERE v.utc_date_time > %s AND p.data_source_id IN (" + placeholder + ")"
            )
            cursor_historical.execute(query, (reporting_start_datetime_utc, *data_source_ids))
        else:
            query = (
                " SELECT point_id, actual_value "
                " FROM tbl_analog_value_latest "
                " WHERE utc_date_time > %s "
            )
            cursor_historical.execute(query, (reporting_start_datetime_utc,))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                current_value = dict()
                current_value['point_id'] = row[0]
                current_value['value'] = row[1]
                latest_value_data.append(current_value)

        ################################################################################################################
        # Step 3: query energy points latest values
        ################################################################################################################
        if data_source_ids:
            placeholder = ','.join(['%s'] * len(data_source_ids))
            query = (
                " SELECT v.point_id, v.actual_value "
                " FROM tbl_energy_value_latest v "
                " JOIN myems_system_db.tbl_points p ON v.point_id = p.id "
                " WHERE v.utc_date_time > %s AND p.data_source_id IN (" + placeholder + ")"
            )
            cursor_historical.execute(query, (reporting_start_datetime_utc, *data_source_ids))
        else:
            query = (
                " SELECT point_id, actual_value "
                " FROM tbl_energy_value_latest "
                " WHERE utc_date_time > %s "
            )
            cursor_historical.execute(query, (reporting_start_datetime_utc,))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                current_value = dict()
                current_value['point_id'] = row[0]
                current_value['value'] = row[1]
                latest_value_data.append(current_value)

        ################################################################################################################
        # Step 4: query digital points latest values
        ################################################################################################################
        if data_source_ids:
            placeholder = ','.join(['%s'] * len(data_source_ids))
            query = (
                " SELECT v.point_id, v.actual_value "
                " FROM tbl_digital_value_latest v "
                " JOIN myems_system_db.tbl_points p ON v.point_id = p.id "
                " WHERE v.utc_date_time > %s AND p.data_source_id IN (" + placeholder + ")"
            )
            cursor_historical.execute(query, (reporting_start_datetime_utc, *data_source_ids))
        else:
            query = (
                " SELECT point_id, actual_value "
                " FROM tbl_digital_value_latest "
                " WHERE utc_date_time > %s "
            )
            cursor_historical.execute(query, (reporting_start_datetime_utc,))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                current_value = dict()
                current_value['point_id'] = row[0]
                current_value['value'] = row[1]
                latest_value_data.append(current_value)

        ################################################################################################################
        # Step 5: construct the report
        ################################################################################################################
        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()

        resp.text = json.dumps(latest_value_data)
