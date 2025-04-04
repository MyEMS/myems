import re
from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.hybridpowerstationreportingparameters
from core import utilities
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
    # Step 3: query associated data sources
    # Step 4: query associated points
    # Step 5: query associated points data
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
        print(req.params)
        # this procedure accepts energy storage power station id or
        # energy storage power station uuid to identify a energy storage power station
        hybrid_power_station_id = req.params.get('id')
        hybrid_power_station_uuid = req.params.get('uuid')
        reporting_period_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_period_end_datetime_local = req.params.get('reportingperiodenddatetime')
        language = req.params.get('language')
        quick_mode = req.params.get('quickmode')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if hybrid_power_station_id is None and hybrid_power_station_uuid is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')

        if hybrid_power_station_id is not None:
            hybrid_power_station_id = str.strip(hybrid_power_station_id)
            if not hybrid_power_station_id.isdigit() or int(hybrid_power_station_id) <= 0:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_HYBRID_POWER_STATION_ID')

        if hybrid_power_station_uuid is not None:
            regex = re.compile(r'^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z', re.I)
            match = regex.match(str.strip(hybrid_power_station_uuid))
            if not bool(match):
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_HYBRID_POWER_STATION_UUID')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

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
                                                               '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
            reporting_end_datetime_utc = reporting_end_datetime_utc.replace(tzinfo=timezone.utc) - \
                timedelta(minutes=timezone_offset)

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPORTING_PERIOD_END_DATETIME')

        # if turn quick mode on, do not return parameters data and excel file
        is_quick_mode = False
        if quick_mode is not None and \
                len(str.strip(quick_mode)) > 0 and \
                str.lower(str.strip(quick_mode)) in ('true', 't', 'on', 'yes', 'y'):
            is_quick_mode = True

        trans = utilities.get_translation(language)
        trans.install()
        _ = trans.gettext

        ################################################################################################################
        # Step 2: query the energy storage power station
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        if hybrid_power_station_id is not None:
            query = (" SELECT id, name, uuid "
                     " FROM tbl_hybrid_power_stations "
                     " WHERE id = %s ")
            cursor_system.execute(query, (hybrid_power_station_id,))
            row = cursor_system.fetchone()
        elif hybrid_power_station_uuid is not None:
            query = (" SELECT id, name, uuid "
                     " FROM tbl_hybrid_power_stations "
                     " WHERE uuid = %s ")
            cursor_system.execute(query, (hybrid_power_station_uuid,))
            row = cursor_system.fetchone()

        if row is None:
            cursor_system.close()
            cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')
        else:
            hybrid_power_station_id = row[0]
            hybrid_power_station = {"id": row[0],
                                    "name": row[1],
                                    "uuid": row[2]}

        ################################################################################################################
        # Step 3: query associated data sources
        ################################################################################################################
        data_source_list = list()
        cursor_system.execute(" SELECT ds.id, ds.name "
                              " FROM tbl_hybrid_power_stations_bmses b, tbl_points p, tbl_data_sources ds "
                              " WHERE b.hybrid_power_station_id = %s "
                              "       AND b.operating_status_point_id = p.id "
                              "       AND p.data_source_id = ds.id ",
                              (hybrid_power_station_id,))
        row_data_source = cursor_system.fetchone()
        if row_data_source is not None:
            data_source_list.append({"id": row_data_source[0],
                                     "name": row_data_source[1]})

        ################################################################################################################
        # Step 4: query associated points
        ################################################################################################################
        analog_point_id_list = list()
        analog_point_name_list = list()
        digital_point_id_list = list()
        digital_point_name_list = list()
        energy_point_id_list = list()
        energy_point_name_list = list()
        parameters_dict = dict()
        for data_source in data_source_list:
            cursor_system.execute(" SELECT p.id, p.name, p.units, p.object_type  "
                                  " FROM tbl_points p "
                                  " WHERE p.data_source_id = %s AND p.object_type != 'TEXT_VALUE'",
                                  (data_source['id'],))
            rows_points = cursor_system.fetchall()
            if rows_points is not None and len(rows_points) > 0:
                for row_point in rows_points:
                    parameters_dict[row_point[0]] = dict()
                    parameters_dict[row_point[0]]['timestamps'] = list()
                    parameters_dict[row_point[0]]['values'] = list()
                    if row_point[3] == 'ANALOG_VALUE':
                        analog_point_id_list.append(row_point[0])
                        analog_point_name_list.append(row_point[1] + ' (' + row_point[2] + ')')
                    elif row_point[3] == 'DIGITAL_VALUE':
                        digital_point_id_list.append(row_point[0])
                        digital_point_name_list.append(row_point[1] + ' (' + row_point[2] + ')')
                    elif row_point[3] == 'ENERGY_VALUE':
                        energy_point_id_list.append(row_point[0])
                        energy_point_name_list.append(row_point[1] + ' (' + row_point[2] + ')')

        ################################################################################################################
        # Step 5: query associated points data
        ################################################################################################################
        query = (" SELECT point_id, utc_date_time, actual_value "
                 " FROM tbl_analog_value "
                 " WHERE point_id IN ( " + ', '.join(map(str, analog_point_id_list)) + ") "
                 "       AND utc_date_time BETWEEN %s AND %s "
                 " ORDER BY point_id, utc_date_time ")
        cursor_historical.execute(query, (reporting_start_datetime_utc,
                                          reporting_end_datetime_utc))
        rows = cursor_historical.fetchall()
        if rows is not None and len(rows) > 0:
            for row in rows:
                current_datetime_local = row[1].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                parameters_dict[row[0]]['timestamps'].append(current_datetime_local.isoformat()[5:19])
                parameters_dict[row[0]]['values'].append(row[2])
        query = (" SELECT point_id, utc_date_time, actual_value "
                 " FROM tbl_digital_value "
                 " WHERE point_id IN ( " + ', '.join(map(str, digital_point_id_list)) + ") "
                 "       AND utc_date_time BETWEEN %s AND %s "
                 " ORDER BY point_id, utc_date_time ")
        cursor_historical.execute(query, (reporting_start_datetime_utc,
                                          reporting_end_datetime_utc))
        rows = cursor_historical.fetchall()

        if rows is not None and len(rows) > 0:
            for row in rows:
                current_datetime_local = row[1].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                parameters_dict[row[0]]['timestamps'].append(current_datetime_local.isoformat()[5:19])
                parameters_dict[row[0]]['values'].append(row[2])

        query = (" SELECT point_id, utc_date_time, actual_value "
                 " FROM tbl_energy_value "
                 " WHERE point_id IN ( " + ', '.join(map(str, energy_point_id_list)) + ") "
                 "       AND utc_date_time BETWEEN %s AND %s "
                 " ORDER BY point_id, utc_date_time ")
        cursor_historical.execute(query, (reporting_start_datetime_utc,
                                          reporting_end_datetime_utc))
        rows = cursor_historical.fetchall()

        if rows is not None and len(rows) > 0:
            for row in rows:
                current_datetime_local = row[1].replace(tzinfo=timezone.utc) + \
                                         timedelta(minutes=timezone_offset)
                parameters_dict[row[0]]['timestamps'].append(current_datetime_local.isoformat()[5:19])
                parameters_dict[row[0]]['values'].append(row[2])

        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()
        ################################################################################################################
        # Step 6: construct the report
        ################################################################################################################
        result = dict()
        result['hybrid_power_station'] = hybrid_power_station
        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()
        if len(parameters_dict) > 0:
            for i in range(len(analog_point_id_list)):
                parameters_data['names'].append(analog_point_name_list[i])
                parameters_data['timestamps'].append(parameters_dict[analog_point_id_list[i]]['timestamps'])
                parameters_data['values'].append(parameters_dict[analog_point_id_list[i]]['values'])

            for i in range(len(digital_point_id_list)):
                parameters_data['names'].append(digital_point_name_list[i])
                parameters_data['timestamps'].append(parameters_dict[digital_point_id_list[i]]['timestamps'])
                parameters_data['values'].append(parameters_dict[digital_point_id_list[i]]['values'])

            for i in range(len(energy_point_id_list)):
                parameters_data['names'].append(energy_point_name_list[i])
                parameters_data['timestamps'].append(parameters_dict[energy_point_id_list[i]]['timestamps'])
                parameters_data['values'].append(parameters_dict[energy_point_id_list[i]]['values'])

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result['excel_bytes_base64'] = \
                excelexporters.hybridpowerstationreportingparameters.\
                export(result,
                       result['hybrid_power_station']['name'],
                       reporting_period_start_datetime_local,
                       reporting_period_end_datetime_local,
                       language)
        resp.text = json.dumps(result)
