import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.spacecomparison
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
    # Step 2: query the space and energy category
    # Step 3: query space input category hourly data (pre-aggregated by background service)
    # Step 4: aggregate space energy consumption data by period
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
        # this procedure accepts space id or space uuid to identify a space
        space_id1 = req.params.get("spaceid1")
        space_uuid1 = req.params.get("spaceuuid1")
        space_id2 = req.params.get("spaceid2")
        space_uuid2 = req.params.get("spaceuuid2")
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
        if space_id1 is None and space_uuid1 is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                name="API.INVALID_SPACE_ID",
            )

        if space_id1 is not None:
            space_id1 = str.strip(space_id1)
            if not space_id1.isdigit() or int(space_id1) <= 0:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    name="API.INVALID_SPACE_ID",
                )

        if space_uuid1 is not None:
            regex = re.compile(
                r"^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z",
                re.I,
            )
            match = regex.match(str.strip(space_uuid1))
            if not bool(match):
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    name="API.INVALID_SPACE_ID",
                )

        if space_id2 is None and space_uuid2 is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                name="API.INVALID_SPACE_ID",
            )

        if space_id2 is not None:
            space_id2 = str.strip(space_id2)
            if not space_id2.isdigit() or int(space_id2) <= 0:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    name="API.INVALID_SPACE_ID",
                )

        if space_uuid2 is not None:
            regex = re.compile(
                r"^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z",
                re.I,
            )
            match = regex.match(str.strip(space_uuid2))
            if not bool(match):
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    name="API.INVALID_SPACE_ID",
                )

        if energy_category_id is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                name="API.INVALID_ENERGY_CATEGORY_ID",
            )
        else:
            energy_category_id = str.strip(energy_category_id)
            if not energy_category_id.isdigit() or int(energy_category_id) <= 0:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    name="API.INVALID_ENERGY_CATEGORY_ID",
                )

        if period_type is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                name="API.INVALID_PERIOD_TYPE",
            )
        else:
            period_type = str.strip(period_type)
            if period_type not in ["hourly", "daily", "weekly", "monthly", "yearly"]:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    name="API.INVALID_PERIOD_TYPE",
                )

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == "-":
            timezone_offset = -timezone_offset

        if reporting_period_start_datetime_local is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                name="API.INVALID_REPORTING_PERIOD_START_DATETIME",
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
                    name="API.INVALID_REPORTING_PERIOD_START_DATETIME",
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
                name="API.INVALID_REPORTING_PERIOD_END_DATETIME",
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
                    name="API.INVALID_REPORTING_PERIOD_END_DATETIME",
                )
            reporting_end_datetime_utc = reporting_end_datetime_utc.replace(
                tzinfo=timezone.utc
            ) - timedelta(minutes=timezone_offset)

        if reporting_start_datetime_utc >= reporting_end_datetime_utc:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                name="API.INVALID_REPORTING_PERIOD_END_DATETIME",
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
        # Step 2: query the space and energy category
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        # Query space 1
        if space_id1 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_spaces WHERE id = %s ", (space_id1,)
            )
            row_space1 = cursor_system.fetchone()
        elif space_uuid1 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_spaces WHERE uuid = %s ",
                (space_uuid1,),
            )
            row_space1 = cursor_system.fetchone()

        if row_space1 is None:
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
                name="API.SPACE_NOT_FOUND",
            )

        space1 = dict()
        space1["id"] = row_space1[0]
        space1["name"] = row_space1[1]

        # Query space 2
        if space_id2 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_spaces WHERE id = %s ", (space_id2,)
            )
            row_space2 = cursor_system.fetchone()
        elif space_uuid2 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_spaces WHERE uuid = %s ",
                (space_uuid2,),
            )
            row_space2 = cursor_system.fetchone()

        if row_space2 is None:
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
                name="API.SPACE_NOT_FOUND",
            )

        space2 = dict()
        space2["id"] = row_space2[0]
        space2["name"] = row_space2[1]

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
                name="API.ENERGY_CATEGORY_NOT_FOUND",
            )

        energy_category = dict()
        energy_category["id"] = row_energy_category[0]
        energy_category["name"] = row_energy_category[1]
        energy_category["unit_of_measure"] = row_energy_category[2]

        ################################################################################################################
        # Step 3: query space input category hourly data (pre-aggregated by background service)
        ################################################################################################################
        # Query space 1 input category hourly data
        cursor_energy.execute(
            " SELECT start_datetime_utc, actual_value "
            " FROM tbl_space_input_category_hourly "
            " WHERE space_id = %s "
            "     AND energy_category_id = %s "
            "     AND start_datetime_utc >= %s "
            "     AND start_datetime_utc < %s "
            " ORDER BY start_datetime_utc ",
            (
                space1["id"],
                energy_category_id,
                reporting_start_datetime_utc,
                reporting_end_datetime_utc,
            ),
        )
        rows_space1_hourly = cursor_energy.fetchall()

        # Query space 2 input category hourly data
        cursor_energy.execute(
            " SELECT start_datetime_utc, actual_value "
            " FROM tbl_space_input_category_hourly "
            " WHERE space_id = %s "
            "     AND energy_category_id = %s "
            "     AND start_datetime_utc >= %s "
            "     AND start_datetime_utc < %s "
            " ORDER BY start_datetime_utc ",
            (
                space2["id"],
                energy_category_id,
                reporting_start_datetime_utc,
                reporting_end_datetime_utc,
            ),
        )
        rows_space2_hourly = cursor_energy.fetchall()

        ################################################################################################################
        # Step 4: aggregate space energy consumption data by period
        ################################################################################################################
        # Aggregate energy consumption for space 1
        space1_energy_data = dict()
        space1_energy_data["timestamps"] = list()
        space1_energy_data["values"] = list()
        space1_energy_data["total_in_category"] = Decimal(0.0)

        # Aggregate space 1 hourly data by period
        rows_space1_periodically = utilities.aggregate_hourly_data_by_period(
            rows_space1_hourly,
            reporting_start_datetime_utc,
            reporting_end_datetime_utc,
            period_type,
        )

        for row_space1_periodically in rows_space1_periodically:
            current_datetime_local = row_space1_periodically[0].replace(
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

            actual_value = row_space1_periodically[1]

            space1_energy_data["timestamps"].append(current_datetime)
            space1_energy_data["values"].append(actual_value)
            if actual_value is not None:
                space1_energy_data["total_in_category"] += actual_value

        # Aggregate energy consumption for space 2
        space2_energy_data = dict()
        space2_energy_data["timestamps"] = list()
        space2_energy_data["values"] = list()
        space2_energy_data["total_in_category"] = Decimal(0.0)

        # Aggregate space 2 hourly data by period
        rows_space2_periodically = utilities.aggregate_hourly_data_by_period(
            rows_space2_hourly,
            reporting_start_datetime_utc,
            reporting_end_datetime_utc,
            period_type,
        )

        for row_space2_periodically in rows_space2_periodically:
            current_datetime_local = row_space2_periodically[0].replace(
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

            actual_value = row_space2_periodically[1]

            space2_energy_data["timestamps"].append(current_datetime)
            space2_energy_data["values"].append(actual_value)
            if actual_value is not None:
                space2_energy_data["total_in_category"] += actual_value

        # Calculate difference
        diff = dict()
        diff["values"] = list()
        diff["total_in_category"] = Decimal(0.0)

        # Ensure both spaces have the same number of data points
        min_length = min(
            len(space1_energy_data["values"]), len(space2_energy_data["values"])
        )
        for i in range(min_length):
            space1_value = (
                space1_energy_data["values"][i]
                if i < len(space1_energy_data["values"])
                else None
            )
            space2_value = (
                space2_energy_data["values"][i]
                if i < len(space2_energy_data["values"])
                else None
            )
            
            # Calculate difference, handling None values
            if space1_value is None and space2_value is None:
                diff_value = None
            elif space1_value is None:
                diff_value = None  # Cannot calculate difference when one value is missing
            elif space2_value is None:
                diff_value = None  # Cannot calculate difference when one value is missing
            else:
                diff_value = space1_value - space2_value
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
            "space1": {
                "id": space1["id"],
                "name": space1["name"],
            },
            "space2": {
                "id": space2["id"],
                "name": space2["name"],
            },
            "energy_category": {
                "id": energy_category["id"],
                "name": energy_category["name"],
                "unit_of_measure": energy_category["unit_of_measure"],
            },
            "reporting_period1": {
                "total_in_category": space1_energy_data["total_in_category"],
                "timestamps": space1_energy_data["timestamps"],
                "values": space1_energy_data["values"],
            },
            "reporting_period2": {
                "total_in_category": space2_energy_data["total_in_category"],
                "timestamps": space2_energy_data["timestamps"],
                "values": space2_energy_data["values"],
            },
            "diff": {
                "values": diff["values"],
                "total_in_category": diff["total_in_category"],
            },
        }

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result["excel_bytes_base64"] = excelexporters.spacecomparison.export(
                result,
                space1["name"],
                space2["name"],
                energy_category["name"],
                reporting_period_start_datetime_local,
                reporting_period_end_datetime_local,
                period_type,
                language,
            )

        resp.text = json.dumps(result)
