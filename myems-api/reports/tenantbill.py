import falcon
import simplejson as json
import mysql.connector
import config
from datetime import datetime, timedelta, timezone
from core import utilities
from decimal import Decimal
import excelexporters.tenantbill


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
    # Step 2: query the tenant
    # Step 3: query energy categories
    # Step 4: query reporting period energy input
    # Step 5: query reporting period energy cost
    # Step 6: query tariff data
    # Step 7: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        print(req.params)
        tenant_id = req.params.get('tenantid')
        reporting_start_datetime_local = req.params.get('reportingperiodstartdatetime')
        reporting_end_datetime_local = req.params.get('reportingperiodenddatetime')

        period_type = 'daily'

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if tenant_id is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_TENANT_ID')
        else:
            tenant_id = str.strip(tenant_id)
            if not tenant_id.isdigit() or int(tenant_id) <= 0:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST', description='API.INVALID_TENANT_ID')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if reporting_start_datetime_local is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_START_DATETIME")
        else:
            reporting_start_datetime_local = str.strip(reporting_start_datetime_local)
            try:
                reporting_start_datetime_utc = datetime.strptime(reporting_start_datetime_local,
                                                                 '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                    timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_START_DATETIME")

        if reporting_end_datetime_local is None:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description="API.INVALID_REPORTING_PERIOD_END_DATETIME")
        else:
            reporting_end_datetime_local = str.strip(reporting_end_datetime_local)
            try:
                reporting_end_datetime_utc = datetime.strptime(reporting_end_datetime_local,
                                                               '%Y-%m-%dT%H:%M:%S').replace(tzinfo=timezone.utc) - \
                    timedelta(minutes=timezone_offset)
            except ValueError:
                raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description="API.INVALID_REPORTING_PERIOD_END_DATETIME")

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_REPORTING_PERIOD_END_DATETIME')

        ################################################################################################################
        # Step 2: query the tenant
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_billing = mysql.connector.connect(**config.myems_billing_db)
        cursor_billing = cnx_billing.cursor()

        cursor_system.execute(" SELECT t.id, t.name, t.buildings, t.floors, t.rooms, t.lease_number, "
                              "        c.email, c.phone, cost_center_id "
                              " FROM tbl_tenants t, tbl_contacts c "
                              " WHERE t.id = %s AND t.contact_id = c.id ", (tenant_id,))
        row_tenant = cursor_system.fetchone()
        if row_tenant is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.disconnect()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.disconnect()

            if cursor_billing:
                cursor_billing.close()
            if cnx_billing:
                cnx_billing.disconnect()

            raise falcon.HTTPError(falcon.HTTP_404, title='API.NOT_FOUND', description='API.TENANT_NOT_FOUND')

        tenant = dict()
        tenant['id'] = row_tenant[0]
        tenant['name'] = row_tenant[1]
        tenant['buildings'] = row_tenant[2]
        tenant['floors'] = row_tenant[3]
        tenant['rooms'] = row_tenant[4]
        tenant['lease_number'] = row_tenant[5]
        tenant['email'] = row_tenant[6]
        tenant['phone'] = row_tenant[7]
        tenant['cost_center_id'] = row_tenant[8]

        ################################################################################################################
        # Step 3: query energy categories
        ################################################################################################################
        energy_category_set = set()

        # query energy categories in reporting period
        cursor_billing.execute(" SELECT DISTINCT(energy_category_id) "
                               " FROM tbl_tenant_input_category_hourly "
                               " WHERE tenant_id = %s "
                               "     AND start_datetime_utc >= %s "
                               "     AND start_datetime_utc < %s ",
                               (tenant['id'], reporting_start_datetime_utc, reporting_end_datetime_utc))
        rows_energy_categories = cursor_billing.fetchall()
        if rows_energy_categories is not None or len(rows_energy_categories) > 0:
            for row_energy_category in rows_energy_categories:
                energy_category_set.add(row_energy_category[0])

        # query all energy categories
        cursor_system.execute(" SELECT id, name, unit_of_measure, kgce, kgco2e "
                              " FROM tbl_energy_categories "
                              " ORDER BY id ", )
        rows_energy_categories = cursor_system.fetchall()
        if rows_energy_categories is None or len(rows_energy_categories) == 0:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.disconnect()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.disconnect()

            if cursor_billing:
                cursor_billing.close()
            if cnx_billing:
                cnx_billing.disconnect()

            raise falcon.HTTPError(falcon.HTTP_404,
                                   title='API.NOT_FOUND',
                                   description='API.ENERGY_CATEGORY_NOT_FOUND')
        energy_category_dict = dict()
        for row_energy_category in rows_energy_categories:
            if row_energy_category[0] in energy_category_set:
                energy_category_dict[row_energy_category[0]] = {"name": row_energy_category[1],
                                                                "unit_of_measure": row_energy_category[2],
                                                                "kgce": row_energy_category[3],
                                                                "kgco2e": row_energy_category[4]}

        ################################################################################################################
        # Step 4: query reporting period energy input
        ################################################################################################################
        reporting_input = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                reporting_input[energy_category_id] = dict()
                reporting_input[energy_category_id]['timestamps'] = list()
                reporting_input[energy_category_id]['values'] = list()
                reporting_input[energy_category_id]['subtotal'] = Decimal(0.0)

                cursor_energy.execute(" SELECT start_datetime_utc, actual_value "
                                      " FROM tbl_tenant_input_category_hourly "
                                      " WHERE tenant_id = %s "
                                      "     AND energy_category_id = %s "
                                      "     AND start_datetime_utc >= %s "
                                      "     AND start_datetime_utc < %s "
                                      " ORDER BY start_datetime_utc ",
                                      (tenant['id'],
                                       energy_category_id,
                                       reporting_start_datetime_utc,
                                       reporting_end_datetime_utc))
                rows_tenant_hourly = cursor_energy.fetchall()

                rows_tenant_periodically = utilities.aggregate_hourly_data_by_period(rows_tenant_hourly,
                                                                                     reporting_start_datetime_utc,
                                                                                     reporting_end_datetime_utc,
                                                                                     period_type)
                for row_tenant_periodically in rows_tenant_periodically:
                    current_datetime_local = row_tenant_periodically[0].replace(tzinfo=timezone.utc) + \
                                             timedelta(minutes=timezone_offset)
                    if period_type == 'hourly':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                    elif period_type == 'daily':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    actual_value = Decimal(0.0) if row_tenant_periodically[1] is None else row_tenant_periodically[1]
                    reporting_input[energy_category_id]['timestamps'].append(current_datetime)
                    reporting_input[energy_category_id]['values'].append(actual_value)
                    reporting_input[energy_category_id]['subtotal'] += actual_value

        ################################################################################################################
        # Step 5: query reporting period energy cost
        ################################################################################################################
        reporting_cost = dict()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                reporting_cost[energy_category_id] = dict()
                reporting_cost[energy_category_id]['timestamps'] = list()
                reporting_cost[energy_category_id]['values'] = list()
                reporting_cost[energy_category_id]['subtotal'] = Decimal(0.0)

                cursor_billing.execute(" SELECT start_datetime_utc, actual_value "
                                       " FROM tbl_tenant_input_category_hourly "
                                       " WHERE tenant_id = %s "
                                       "     AND energy_category_id = %s "
                                       "     AND start_datetime_utc >= %s "
                                       "     AND start_datetime_utc < %s "
                                       " ORDER BY start_datetime_utc ",
                                       (tenant['id'],
                                        energy_category_id,
                                        reporting_start_datetime_utc,
                                        reporting_end_datetime_utc))
                rows_tenant_hourly = cursor_billing.fetchall()

                rows_tenant_periodically = utilities.aggregate_hourly_data_by_period(rows_tenant_hourly,
                                                                                     reporting_start_datetime_utc,
                                                                                     reporting_end_datetime_utc,
                                                                                     period_type)
                for row_tenant_periodically in rows_tenant_periodically:
                    current_datetime_local = row_tenant_periodically[0].replace(tzinfo=timezone.utc) + \
                                             timedelta(minutes=timezone_offset)
                    if period_type == 'hourly':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                    elif period_type == 'daily':
                        current_datetime = current_datetime_local.strftime('%Y-%m-%d')
                    elif period_type == 'monthly':
                        current_datetime = current_datetime_local.strftime('%Y-%m')
                    elif period_type == 'yearly':
                        current_datetime = current_datetime_local.strftime('%Y')

                    actual_value = Decimal(0.0) if row_tenant_periodically[1] is None else row_tenant_periodically[1]
                    reporting_cost[energy_category_id]['timestamps'].append(current_datetime)
                    reporting_cost[energy_category_id]['values'].append(actual_value)
                    reporting_cost[energy_category_id]['subtotal'] += actual_value

        ################################################################################################################
        # Step 6: query tariff data
        ################################################################################################################
        parameters_data = dict()
        parameters_data['names'] = list()
        parameters_data['timestamps'] = list()
        parameters_data['values'] = list()
        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                energy_category_tariff_dict = utilities.get_energy_category_tariffs(tenant['cost_center_id'],
                                                                                    energy_category_id,
                                                                                    reporting_start_datetime_utc,
                                                                                    reporting_end_datetime_utc)
                tariff_timestamp_list = list()
                tariff_value_list = list()
                for k, v in energy_category_tariff_dict.items():
                    # convert k from utc to local
                    k = k + timedelta(minutes=timezone_offset)
                    tariff_timestamp_list.append(k.isoformat()[0:19][0:19])
                    tariff_value_list.append(v)

                parameters_data['names'].append('TARIFF-' + energy_category_dict[energy_category_id]['name'])
                parameters_data['timestamps'].append(tariff_timestamp_list)
                parameters_data['values'].append(tariff_value_list)

        ################################################################################################################
        # Step 7: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.disconnect()

        if cursor_energy:
            cursor_energy.close()
        if cnx_energy:
            cnx_energy.disconnect()

        if cursor_billing:
            cursor_billing.close()
        if cnx_billing:
            cnx_billing.disconnect()

        result = dict()

        result['tenant'] = dict()
        result['tenant']['name'] = tenant['name']
        result['tenant']['buildings'] = tenant['buildings']
        result['tenant']['floors'] = tenant['floors']
        result['tenant']['rooms'] = tenant['rooms']
        result['tenant']['lease_number'] = tenant['lease_number']
        result['tenant']['email'] = tenant['email']
        result['tenant']['phone'] = tenant['phone']

        result['reporting_period'] = dict()
        result['reporting_period']['names'] = list()
        result['reporting_period']['energy_category_ids'] = list()
        result['reporting_period']['units'] = list()
        result['reporting_period']['subtotals_input'] = list()
        result['reporting_period']['subtotals_cost'] = list()
        result['reporting_period']['total_cost'] = Decimal(0.0)
        result['reporting_period']['currency_unit'] = config.currency_unit

        if energy_category_set is not None and len(energy_category_set) > 0:
            for energy_category_id in energy_category_set:
                result['reporting_period']['names'].append(energy_category_dict[energy_category_id]['name'])
                result['reporting_period']['energy_category_ids'].append(energy_category_id)
                result['reporting_period']['units'].append(energy_category_dict[energy_category_id]['unit_of_measure'])
                result['reporting_period']['subtotals_input'].append(reporting_input[energy_category_id]['subtotal'])
                result['reporting_period']['subtotals_cost'].append(reporting_cost[energy_category_id]['subtotal'])
                result['reporting_period']['total_cost'] += reporting_cost[energy_category_id]['subtotal']

        result['parameters'] = {
            "names": parameters_data['names'],
            "timestamps": parameters_data['timestamps'],
            "values": parameters_data['values']
        }

        # export result to Excel file and then encode the file to base64 string
        result['excel_bytes_base64'] = excelexporters.tenantbill.export(result,
                                                                        tenant['name'],
                                                                        reporting_start_datetime_local,
                                                                        reporting_end_datetime_local,
                                                                        period_type)

        resp.body = json.dumps(result)
