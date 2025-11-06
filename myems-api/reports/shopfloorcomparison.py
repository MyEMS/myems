import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.shopfloorcomparison
from core import utilities
from core.useractivity import access_control, api_key_control


class Reporting:
    def __init__(self):
        """ "Initializes Reporting"""
        pass

    @staticmethod
    def on_options(req, resp):
        _ = req
        resp.status = falcon.HTTP_200

    ####################################################################################################################
    # PROCEDURES
    # Step 1: valid parameters
    # Step 2: query the shopfloor and energy category
    # Step 3: query shopfloor input category hourly data (pre-aggregated by background service)
    # Step 4: aggregate shopfloor energy consumption data by period
    # Step 5: construct the report
    ####################################################################################################################
    @staticmethod
    def on_get(req, resp):
        if (
            "API-KEY" not in req.headers
            or not isinstance(req.headers["API-KEY"], str)
            or len(str.strip(req.headers["API-KEY"])) == 0
        ):
            access_control(req)
        else:
            api_key_control(req)
        print(req.params)
        # this procedure accepts shopfloor id or shopfloor uuid to identify a shopfloor
        shopfloor_id1 = req.params.get("shopfloorid1")
        shopfloor_uuid1 = req.params.get("shopflooruuid1")
        shopfloor_id2 = req.params.get("shopfloorid2")
        shopfloor_uuid2 = req.params.get("shopflooruuid2")
        energy_category_id = req.params.get("energycategoryid")
        period_type = req.params.get("periodtype")
        reporting_period_start_datetime_local = req.params.get(
            "reportingperiodstartdatetime"
        )
        reporting_period_end_datetime_local = req.params.get(
            "reportingperiodenddatetime"
        )
        language = req.params.get("language")
        quick_mode = req.params.get("quickmode")

        ################################################################################################################
        # Step 1: valid parameters
        ################################################################################################################
        if shopfloor_id1 is None and shopfloor_uuid1 is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                description="API.INVALID_EQUIPMENT_ID",
            )

        if shopfloor_id1 is not None:
            shopfloor_id1 = str.strip(shopfloor_id1)
            if not shopfloor_id1.isdigit() or int(shopfloor_id1) <= 0:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_EQUIPMENT_ID",
                )

        if shopfloor_uuid1 is not None:
            regex = re.compile(
                r"^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z",
                re.I,
            )
            match = regex.match(str.strip(shopfloor_uuid1))
            if not bool(match):
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_EQUIPMENT_UUID",
                )

        if shopfloor_id2 is None and shopfloor_uuid2 is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                description="API.INVALID_EQUIPMENT_ID",
            )

        if shopfloor_id2 is not None:
            shopfloor_id2 = str.strip(shopfloor_id2)
            if not shopfloor_id2.isdigit() or int(shopfloor_id2) <= 0:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_EQUIPMENT_ID",
                )

        if shopfloor_uuid2 is not None:
            regex = re.compile(
                r"^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z",
                re.I,
            )
            match = regex.match(str.strip(shopfloor_uuid2))
            if not bool(match):
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_EQUIPMENT_UUID",
                )

        if energy_category_id is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                description="API.INVALID_ENERGY_CATEGORY_ID",
            )
        else:
            energy_category_id = str.strip(energy_category_id)
            if not energy_category_id.isdigit() or int(energy_category_id) <= 0:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_ENERGY_CATEGORY_ID",
                )

        if period_type is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                description="API.INVALID_PERIOD_TYPE",
            )
        else:
            period_type = str.strip(period_type)
            if period_type not in ["hourly", "daily", "weekly", "monthly", "yearly"]:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_PERIOD_TYPE",
                )

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == "-":
            timezone_offset = -timezone_offset

        if reporting_period_start_datetime_local is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                description="API.INVALID_REPORTING_PERIOD_START_DATETIME",
            )
        else:
            reporting_period_start_datetime_local = str.strip(
                reporting_period_start_datetime_local
            )
            try:
                reporting_start_datetime_utc = datetime.strptime(
                    reporting_period_start_datetime_local, "%Y-%m-%dT%H:%M:%S"
                )
            except ValueError:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_REPORTING_PERIOD_START_DATETIME",
                )
            reporting_start_datetime_utc = reporting_start_datetime_utc.replace(
                tzinfo=timezone.utc
            ) - timedelta(minutes=timezone_offset)
            # nomalize the start datetime
            if (
                config.minutes_to_count == 30
                and reporting_start_datetime_utc.minute >= 30
            ):
                reporting_start_datetime_utc = reporting_start_datetime_utc.replace(
                    minute=30, second=0, microsecond=0
                )
            else:
                reporting_start_datetime_utc = reporting_start_datetime_utc.replace(
                    minute=0, second=0, microsecond=0
                )

        if reporting_period_end_datetime_local is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                description="API.INVALID_REPORTING_PERIOD_END_DATETIME",
            )
        else:
            reporting_period_end_datetime_local = str.strip(
                reporting_period_end_datetime_local
            )
            try:
                reporting_end_datetime_utc = datetime.strptime(
                    reporting_period_end_datetime_local, "%Y-%m-%dT%H:%M:%S"
                )
            except ValueError:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_REPORTING_PERIOD_END_DATETIME",
                )
            reporting_end_datetime_utc = reporting_end_datetime_utc.replace(
                tzinfo=timezone.utc
            ) - timedelta(minutes=timezone_offset)

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                description="API.INVALID_REPORTING_PERIOD_END_DATETIME",
            )

        # if turn quick mode on, do not return parameters data and excel file
        is_quick_mode = False
        if (
            quick_mode is not None
            and len(str.strip(quick_mode)) > 0
            and str.lower(str.strip(quick_mode)) in ("true", "t", "on", "yes", "y")
        ):
            is_quick_mode = True

        ################################################################################################################
        # Step 2: query the shopfloor and energy category
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        # Query shopfloor 1
        if shopfloor_id1 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_shopfloors WHERE id = %s ", (shopfloor_id1,)
            )
            row_shopfloor1 = cursor_system.fetchone()
        elif shopfloor_uuid1 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_shopfloors WHERE uuid = %s ",
                (shopfloor_uuid1,),
            )
            row_shopfloor1 = cursor_system.fetchone()

        if row_shopfloor1 is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.close()

            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            raise falcon.HTTPError(
                status=falcon.HTTP_404,
                title="API.NOT_FOUND",
                description="API.EQUIPMENT_NOT_FOUND",
            )

        shopfloor1 = dict()
        shopfloor1["id"] = row_shopfloor1[0]
        shopfloor1["name"] = row_shopfloor1[1]

        # Query shopfloor 2
        if shopfloor_id2 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_shopfloors WHERE id = %s ", (shopfloor_id2,)
            )
            row_shopfloor2 = cursor_system.fetchone()
        elif shopfloor_uuid2 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_shopfloors WHERE uuid = %s ",
                (shopfloor_uuid2,),
            )
            row_shopfloor2 = cursor_system.fetchone()

        if row_shopfloor2 is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.close()

            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            raise falcon.HTTPError(
                status=falcon.HTTP_404,
                title="API.NOT_FOUND",
                description="API.EQUIPMENT_NOT_FOUND",
            )

        shopfloor2 = dict()
        shopfloor2["id"] = row_shopfloor2[0]
        shopfloor2["name"] = row_shopfloor2[1]

        # Query energy category
        cursor_system.execute(
            " SELECT id, name, unit_of_measure FROM tbl_energy_categories WHERE id = %s ",
            (energy_category_id,),
        )
        row_energy_category = cursor_system.fetchone()

        if row_energy_category is None:
            if cursor_system:
                cursor_system.close()
            if cnx_system:
                cnx_system.close()

            if cursor_energy:
                cursor_energy.close()
            if cnx_energy:
                cnx_energy.close()

            if cursor_historical:
                cursor_historical.close()
            if cnx_historical:
                cnx_historical.close()
            raise falcon.HTTPError(
                status=falcon.HTTP_404,
                title="API.NOT_FOUND",
                description="API.ENERGY_CATEGORY_NOT_FOUND",
            )

        energy_category = dict()
        energy_category["id"] = row_energy_category[0]
        energy_category["name"] = row_energy_category[1]
        energy_category["unit_of_measure"] = row_energy_category[2]

        ################################################################################################################
        # Step 3: query shopfloor input category hourly data (pre-aggregated by background service)
        ################################################################################################################
        # Query shopfloor 1 input category hourly data
        cursor_energy.execute(
            " SELECT start_datetime_utc, actual_value "
            " FROM tbl_shopfloor_input_category_hourly "
            " WHERE shopfloor_id = %s "
            "     AND energy_category_id = %s "
            "     AND start_datetime_utc >= %s "
            "     AND start_datetime_utc < %s "
            " ORDER BY start_datetime_utc ",
            (
                shopfloor1["id"],
                energy_category_id,
                reporting_start_datetime_utc,
                reporting_end_datetime_utc,
            ),
        )
        rows_shopfloor1_hourly = cursor_energy.fetchall()

        # Query shopfloor 2 input category hourly data
        cursor_energy.execute(
            " SELECT start_datetime_utc, actual_value "
            " FROM tbl_shopfloor_input_category_hourly "
            " WHERE shopfloor_id = %s "
            "     AND energy_category_id = %s "
            "     AND start_datetime_utc >= %s "
            "     AND start_datetime_utc < %s "
            " ORDER BY start_datetime_utc ",
            (
                shopfloor2["id"],
                energy_category_id,
                reporting_start_datetime_utc,
                reporting_end_datetime_utc,
            ),
        )
        rows_shopfloor2_hourly = cursor_energy.fetchall()

        ################################################################################################################
        # Step 4: aggregate shopfloor energy consumption data by period
        ################################################################################################################
        # Aggregate energy consumption for shopfloor 1
        shopfloor1_energy_data = dict()
        shopfloor1_energy_data["timestamps"] = list()
        shopfloor1_energy_data["values"] = list()
        shopfloor1_energy_data["total_in_category"] = Decimal(0.0)

        # Aggregate shopfloor 1 hourly data by period
        rows_shopfloor1_periodically = utilities.aggregate_hourly_data_by_period(
            rows_shopfloor1_hourly,
            reporting_start_datetime_utc,
            reporting_end_datetime_utc,
            period_type,
        )

        for row_shopfloor1_periodically in rows_shopfloor1_periodically:
            current_datetime_local = row_shopfloor1_periodically[0].replace(
                tzinfo=timezone.utc
            ) + timedelta(minutes=timezone_offset)
            if period_type == "hourly":
                current_datetime = current_datetime_local.isoformat()[0:19]
            elif period_type == "daily":
                current_datetime = current_datetime_local.isoformat()[0:10]
            elif period_type == "weekly":
                current_datetime = current_datetime_local.isoformat()[0:10]
            elif period_type == "monthly":
                current_datetime = current_datetime_local.isoformat()[0:7]
            elif period_type == "yearly":
                current_datetime = current_datetime_local.isoformat()[0:4]

            actual_value = row_shopfloor1_periodically[1]

            shopfloor1_energy_data["timestamps"].append(current_datetime)
            shopfloor1_energy_data["values"].append(actual_value)
            if actual_value is not None:
                shopfloor1_energy_data["total_in_category"] += actual_value

        # Aggregate energy consumption for shopfloor 2
        shopfloor2_energy_data = dict()
        shopfloor2_energy_data["timestamps"] = list()
        shopfloor2_energy_data["values"] = list()
        shopfloor2_energy_data["total_in_category"] = Decimal(0.0)

        # Aggregate shopfloor 2 hourly data by period
        rows_shopfloor2_periodically = utilities.aggregate_hourly_data_by_period(
            rows_shopfloor2_hourly,
            reporting_start_datetime_utc,
            reporting_end_datetime_utc,
            period_type,
        )

        for row_shopfloor2_periodically in rows_shopfloor2_periodically:
            current_datetime_local = row_shopfloor2_periodically[0].replace(
                tzinfo=timezone.utc
            ) + timedelta(minutes=timezone_offset)
            if period_type == "hourly":
                current_datetime = current_datetime_local.isoformat()[0:19]
            elif period_type == "daily":
                current_datetime = current_datetime_local.isoformat()[0:10]
            elif period_type == "weekly":
                current_datetime = current_datetime_local.isoformat()[0:10]
            elif period_type == "monthly":
                current_datetime = current_datetime_local.isoformat()[0:7]
            elif period_type == "yearly":
                current_datetime = current_datetime_local.isoformat()[0:4]

            actual_value = row_shopfloor2_periodically[1]

            shopfloor2_energy_data["timestamps"].append(current_datetime)
            shopfloor2_energy_data["values"].append(actual_value)
            if actual_value is not None:
                shopfloor2_energy_data["total_in_category"] += actual_value

        # Calculate difference
        diff = dict()
        diff["values"] = list()
        diff["total_in_category"] = Decimal(0.0)

        # Ensure both shopfloors have the same number of data points
        min_length = min(
            len(shopfloor1_energy_data["values"]), len(shopfloor2_energy_data["values"])
        )
        for i in range(min_length):
            shopfloor1_value = (
                shopfloor1_energy_data["values"][i]
                if i < len(shopfloor1_energy_data["values"])
                else None
            )
            shopfloor2_value = (
                shopfloor2_energy_data["values"][i]
                if i < len(shopfloor2_energy_data["values"])
                else None
            )
            
            # Calculate difference, handling None values
            if shopfloor1_value is None and shopfloor2_value is None:
                diff_value = None
            elif shopfloor1_value is None:
                diff_value = None  # Cannot calculate difference when one value is missing
            elif shopfloor2_value is None:
                diff_value = None  # Cannot calculate difference when one value is missing
            else:
                diff_value = shopfloor1_value - shopfloor2_value
                diff["total_in_category"] += diff_value
                
            diff["values"].append(diff_value)

        ################################################################################################################
        # Step 5: construct the report
        ################################################################################################################
        if cursor_system:
            cursor_system.close()
        if cnx_system:
            cnx_system.close()

        if cursor_energy:
            cursor_energy.close()
        if cnx_energy:
            cnx_energy.close()

        if cursor_historical:
            cursor_historical.close()
        if cnx_historical:
            cnx_historical.close()

        result = {
            "shopfloor1": {
                "id": shopfloor1["id"],
                "name": shopfloor1["name"],
            },
            "shopfloor2": {
                "id": shopfloor2["id"],
                "name": shopfloor2["name"],
            },
            "energy_category": {
                "id": energy_category["id"],
                "name": energy_category["name"],
                "unit_of_measure": energy_category["unit_of_measure"],
            },
            "reporting_period1": {
                "total_in_category": shopfloor1_energy_data["total_in_category"],
                "timestamps": shopfloor1_energy_data["timestamps"],
                "values": shopfloor1_energy_data["values"],
            },
            "reporting_period2": {
                "total_in_category": shopfloor2_energy_data["total_in_category"],
                "timestamps": shopfloor2_energy_data["timestamps"],
                "values": shopfloor2_energy_data["values"],
            },
            "diff": {
                "values": diff["values"],
                "total_in_category": diff["total_in_category"],
            },
        }

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result["excel_bytes_base64"] = excelexporters.shopfloorcomparison.export(
                result,
                shopfloor1["name"],
                shopfloor2["name"],
                energy_category["name"],
                reporting_period_start_datetime_local,
                reporting_period_end_datetime_local,
                period_type,
                language,
            )

        resp.text = json.dumps(result)
