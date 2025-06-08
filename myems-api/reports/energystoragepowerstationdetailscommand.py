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
    # Step 4: query the commands
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
        # Step 7: query the commands
        ################################################################################################################

        command_list = list()
        for container in container_list:
            cursor_system.execute(" SELECT c.id, c.name, c.uuid, "
                                  "        c.topic, c.payload, c.set_value, c.description "
                                  " FROM tbl_energy_storage_containers_commands cc, tbl_commands c "
                                  " WHERE cc.energy_storage_container_id = %s AND cc.command_id = c.id "
                                  " ORDER BY c.id ",
                                  (container['id'],))
            rows_commands = cursor_system.fetchall()
            if rows_commands is not None and len(rows_commands) > 0:
                for row in rows_commands:
                    current_command = dict()
                    current_command['id'] = row[0]
                    current_command['name'] = container['name'] + '-' + row[1]
                    current_command['uuid'] = row[2]
                    current_command['topic'] = row[3]
                    current_command['payload'] = row[4]
                    current_command['set_value'] = row[5]
                    current_command['description'] = row[6]
                    command_list.append(current_command)

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
        resp.text = json.dumps(command_list)
