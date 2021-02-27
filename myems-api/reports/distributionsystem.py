import falcon
import simplejson as json
import mysql.connector
import config
from datetime import datetime, timedelta, timezone


class Reporting:
    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the distribution system
    # Step 3: query associated circuits
    # Step 4: query circuits' associated points
    # Step 5: query points' latest values
    # Step 6: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        print(req.params)
        distribution_system_id = req.params.get('distributionsystemid')

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if distribution_system_id is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_DISTRIBUTION_SYSTEM_ID')
        else:
            distribution_system_id = str.strip(distribution_system_id)
            if not distribution_system_id.isdigit() or int(distribution_system_id) <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_DISTRIBUTION_SYSTEM_ID')
        # set the earliest datetime of valid actual value
        # if the utc_date_time is less than reporting_start_datetime_utc, then the value is None because of timeout
        reporting_start_datetime_utc = datetime.utcnow() - timedelta(minutes=5)

        ################################################################################################################
        # Step 2: Step 2: query the distribution system
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor(dictionary=True)

        cursor_system.execute(" SELECT name "
                              " FROM tbl_distribution_systems "
                              " WHERE id = %s ", (distribution_system_id,))
        if cursor_system.fetchone() is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.DISTRIBUTION_SYSTEM_NOT_FOUND')

        ################################################################################################################
        # Step 3: query associated circuits
        ################################################################################################################
        query = (" SELECT id, name, uuid, "
                 "        distribution_room, switchgear, peak_load, peak_current, customers, meters "
                 " FROM tbl_distribution_circuits "
                 " WHERE distribution_system_id = %s "
                 " ORDER BY name ")
        cursor_system.execute(query, (distribution_system_id,))
        rows = cursor_system.fetchall()

        circuit_list = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                circuit_list.append({"id": row['id'], "name": row['name'], "uuid": row['uuid'],
                                     "distribution_room": row['distribution_room'], "switchgear": row['switchgear'],
                                     "peak_load": row['peak_load'], "peak_current": row['peak_current'],
                                     "customers": row['customers'], "meters": row['meters'],
                                     "points": list()})

        ################################################################################################################
        # Step 4: query circuits' associated points
        ################################################################################################################
        for x in range(len(circuit_list)):
            query = (" SELECT p.id, p.name, p.object_type, p.units "
                     " FROM tbl_points p, tbl_distribution_circuits_points dcp, tbl_distribution_circuits dc "
                     " WHERE dcp.distribution_circuit_id = %s AND p.id = dcp.point_id "
                     "       AND dcp.distribution_circuit_id = dc.id "
                     " ORDER BY p.name ")
            cursor_system.execute(query, (circuit_list[x]['id'],))
            rows = cursor_system.fetchall()

            if rows is not None and len(rows) > 0:
                for row in rows:
                    circuit_list[x]['points'].append({"id": row['id'],
                                                      "name": row['name'],
                                                      "object_type": row['object_type'],
                                                      "units": row['units'],
                                                      "value": None})
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.disconnect()
        ################################################################################################################
        # Step 5: query points' data
        ################################################################################################################
        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        for x in range(len(circuit_list)):
            for y in range(len(circuit_list[x]['points'])):
                if circuit_list[x]['points'][y]['object_type'] == 'ANALOG_VALUE':

                    query = (" SELECT actual_value "
                             " FROM tbl_analog_value_latest "
                             " WHERE point_id = %s "
                             "       AND utc_date_time > %s ")
                    cursor_historical.execute(query, (circuit_list[x]['points'][y]['id'],
                                                      reporting_start_datetime_utc))
                    row = cursor_historical.fetchone()

                    if row is not None:
                        circuit_list[x]['points'][y]['value'] = row[0]

                elif circuit_list[x]['points'][y]['object_type'] == 'ENERGY_VALUE':
                    query = (" SELECT actual_value "
                             " FROM tbl_energy_value_latest "
                             " WHERE point_id = %s "
                             "       AND utc_date_time > %s ")
                    cursor_historical.execute(query, (circuit_list[x]['points'][y]['id'],
                                                      reporting_start_datetime_utc))
                    row = cursor_historical.fetchone()

                    if row is not None:
                        circuit_list[x]['points'][y]['value'] = row[0]

                elif circuit_list[x]['points'][y]['object_type'] == 'DIGITAL_VALUE':
                    query = (" SELECT actual_value "
                             " FROM tbl_digital_value_latest "
                             " WHERE point_id = %s "
                             "       AND utc_date_time > %s ")
                    cursor_historical.execute(query, (circuit_list[x]['points'][y]['id'],
                                                      reporting_start_datetime_utc))
                    row = cursor_historical.fetchone()

                    if row is not None:
                        circuit_list[x]['points'][y]['value'] = row[0]

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.disconnect()

        ################################################################################################################
        # Step 6: construct the report
        ################################################################################################################

        result = circuit_list

        resp.body = json.dumps(result)
