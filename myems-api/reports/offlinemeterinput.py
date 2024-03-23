import json
import config
import mysql.connector
from datetime import datetime, timedelta
from decimal import Decimal
import falcon
from core.useractivity import access_control, api_key_control


class Reporting:

    @staticmethod
    def __init__():
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_post(req, resp):
        if 'API-KEY' not in req.headers or \
                not isinstance(req.headers['API-KEY'], str) or \
                len(str.strip(req.headers['API-KEY'])) == 0:
            access_control(req)
        else:
            api_key_control(req)
        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        energy_data_list = list()
        """Handles POST requests"""
        try:
            raw_json = req.stream.read().decode('utf-8')
            new_values = json.loads(raw_json)
            formdata = new_values['value']
            offline_meter_data = dict()
            offline_meter_data['offline_meter_id'] = new_values['meter']
            offline_meter_data['data'] = dict()
            for onepieces in formdata:
                start_datetime_local = datetime(year=int(onepieces[0][0:4]),
                                                month=int(onepieces[0][5:7]),
                                                day=int(onepieces[0][8:10]))
                start_datetime_utc = start_datetime_local - timedelta(minutes=timezone_offset)
                if onepieces[1] is None or \
                        onepieces[1] == '' or \
                        float(onepieces[1]) < 0:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_OFFLINE_METER_VALUE')
                offline_meter_data['data'][start_datetime_utc] = Decimal(onepieces[1])
            if len(offline_meter_data['data']) > 0:
                energy_data_list.append(offline_meter_data)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_OFFLINE_METER_VALUE')

        for energy_data_item in energy_data_list:
            offline_meter_id = energy_data_item['offline_meter_id']
            cnx_system = mysql.connector.connect(**config.myems_system_db)
            cursor_system = cnx_system.cursor()
            cursor_system.execute(" SELECT hourly_low_limit, hourly_high_limit   "
                                  " FROM  tbl_offline_meters  "
                                  " WHERE id = %s ", (offline_meter_id,))
            row_meter = cursor_system.fetchone()
            if row_meter is None:
                raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                       description='API.OFFLINE_METER_NOT_FOUND')
            hourly_low_limit = row_meter[0] if row_meter[0] is not None else 0
            hourly_high_limit = row_meter[1] if row_meter[1] is not None else 0
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.disconnect()

            for start_datetime_utc, daily_value in energy_data_item['data'].items():
                end_datetime_utc = start_datetime_utc + timedelta(hours=24)
                actual_value = \
                    round(daily_value / (Decimal(24) * Decimal(60) / Decimal(config.minutes_to_count)), 3)

                cursor_energy.execute("DELETE FROM tbl_offline_meter_hourly WHERE offline_meter_id = %s "
                                      "AND start_datetime_utc >= %s AND start_datetime_utc < %s ",
                                      (offline_meter_id, start_datetime_utc.isoformat()[0:19],
                                       end_datetime_utc.isoformat()[0:19]))

                cnx_energy.commit()
                # check with hourly low limit and hourly high limit
                if actual_value < hourly_low_limit \
                        or actual_value > hourly_high_limit:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_OFFLINE_METER_VALUE')

                add_values = (" INSERT INTO tbl_offline_meter_hourly "
                              "             (offline_meter_id, start_datetime_utc, actual_value) "
                              " VALUES  ")
                sum_24hours = actual_value * 24
                last_date_utc = end_datetime_utc - timedelta(minutes=config.minutes_to_count)
                while start_datetime_utc < end_datetime_utc:
                    if start_datetime_utc == last_date_utc and sum_24hours != daily_value:
                        actual_value = daily_value - sum_24hours + actual_value
                    add_values += " (" + str(offline_meter_id) + ","
                    add_values += "'" + start_datetime_utc.isoformat()[0:19] + "',"
                    add_values += str(actual_value) + "), "
                    start_datetime_utc += timedelta(minutes=config.minutes_to_count)
                # trim ", " at the end of string and then execute
                cursor_energy.execute(add_values[:-2])
                cnx_energy.commit()

        if cursor_energy:
            cursor_energy.close()

        if cnx_energy:
            cnx_energy.close()

        resp.text = json.dumps({})
