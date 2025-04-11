from datetime import timedelta
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
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the energy storage power station
    # Step 3: query associated containers
    # Step 4: query associated schedules on containers
    # Step 5: construct the report
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
                                   description='API.INVALID_HYBRID_POWER_STATION_ID')
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
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')
        else:
            energy_storage_power_station_id = row[0]
            meta_result = {"id": row[0],
                           "name": row[1],
                           "uuid": row[2]}

        ################################################################################################################
        # Step 3: query associated containers
        ################################################################################################################
        # todo: query multiple energy storage containers
        container_list = list()
        cursor_system.execute(" SELECT c.id, c.name, c.uuid "
                              " FROM tbl_energy_storage_power_stations_containers espsc, "
                              "      tbl_energy_storage_containers c "
                              " WHERE espsc.energy_storage_power_station_id = %s "
                              "      AND espsc.energy_storage_container_id = c.id"
                              " LIMIT 1 ",
                              (energy_storage_power_station_id,))
        row_container = cursor_system.fetchone()
        if row_container is not None:
            container_list.append({"id": row_container[0],
                                   "name": row_container[1],
                                   "uuid": row_container[2]})
        # todo: if len(container_list) == 0
        print('container_list:' + str(container_list))

        ################################################################################################################
        # Step 4: query associated schedules on containers
        ################################################################################################################
        schedule_list = list()
        schedule_series_data = list()
        cursor_system.execute(" SELECT start_time_of_day, end_time_of_day, peak_type, power "
                              " FROM tbl_energy_storage_containers_schedules "
                              " WHERE energy_storage_container_id = %s "
                              " ORDER BY start_time_of_day ",
                              (container_list[0]['id'],))
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

        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()
        ################################################################################################################
        # Step 5: construct the report
        ################################################################################################################
        result = dict()

        result['schedule'] = dict()
        result['schedule']['series_data'] = schedule_series_data
        result['schedule']['schedule_list'] = schedule_list

        resp.text = json.dumps(result)
