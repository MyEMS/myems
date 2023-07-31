import falcon
import simplejson as json
import mysql.connector
import config
from core.useractivity import access_control, api_key_control


class Reporting:
    @staticmethod
    def __init__():
        """"Initializes Reporting"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the meter and energy category
    # Step 3: query associated points
    # Step 4: query reporting period points trends
    # Step 5: query tariff data
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
        ################################################################################################################
        # Step 2: query the meter and energy category
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_historical = cnx_energy.cursor()
        cursor_system.execute(" SELECT *   "
                              " FROM  tbl_offline_meters  ", ())
        offlinemeters = cursor_system.fetchall()
        print(offlinemeters)
        if offlinemeters is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.disconnect()

            if cursor_historical:
                cursor_historical.close()
            if cnx_energy:
                cnx_energy.disconnect()
            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND', description='API.METER_NOT_FOUND')

        ################################################################################################################
        # Step 4: query reporting period points trends
        ################################################################################################################

        re_values = []
        for rowmeter in offlinemeters:
            re_values.append({
                "meterid": rowmeter[0],
                "metername": rowmeter[1]
            })

        result = {'meteroptions': re_values}
        resp.text = json.dumps(result)
