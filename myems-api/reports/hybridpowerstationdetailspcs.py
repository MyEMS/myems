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
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the hybrid power station
    # Step 3: query analog points latest values
    # Step 4: query energy points latest values
    # Step 5: query digital points latest values
    # Step 6: query the points of PCSes
    # Step 7: construct the report
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
        hybrid_power_station_id = id_
        ################################################################################################################
        # Step 2: query the hybrid power station
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

        if row is None:
            cursor_system.close()
            cnx_system.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.HYBRID_POWER_STATION_NOT_FOUND')

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
        # Step 3: query analog points latest values
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
        # Step 4: query energy points latest values
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
        # Step 5: query digital points latest values
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
        # Step 6: query the points of associated PCSes
        ################################################################################################################

        pcs_list = list()
        cursor_system.execute(" SELECT id, name, uuid "
                              " FROM tbl_hybrid_power_stations_pcses "
                              " WHERE hybrid_power_station_id = %s "
                              " ORDER BY id ",
                              (hybrid_power_station_id,))
        rows_pcses = cursor_system.fetchall()
        if rows_pcses is not None and len(rows_pcses) > 0:
            for row in rows_pcses:
                current_pcs = dict()
                current_pcs['id'] = row[0]
                current_pcs['name'] = row[1]
                current_pcs['uuid'] = row[2]
                current_pcs['points'] = list()
                pcs_list.append(current_pcs)

        for index, pcs in enumerate(pcs_list):
            cursor_system.execute(" SELECT p.id "
                                  " FROM tbl_hybrid_power_stations_pcses_points bp, tbl_points p "
                                  " WHERE bp.pcs_id = %s AND bp.point_id = p.id "
                                  " ORDER BY bp.id ",
                                  (pcs['id'],))
            rows_points = cursor_system.fetchall()
            if rows_points is not None and len(rows_points) > 0:
                point_list = list()
                for row in rows_points:
                    point = latest_value_dict.get(row[0], None)
                    if point is not None:
                        point_list.append(point)
                pcs_list[index]['points'] = point_list

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
        resp.text = json.dumps(pcs_list)
