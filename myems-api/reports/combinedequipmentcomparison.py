import hashlib
import logging
import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import redis
import simplejson as json
import config
import excelexporters.combinedequipmentcomparison
from core import utilities
from core.useractivity import access_control, api_key_control

logger = logging.getLogger(__name__)


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
    # Step 2: query the combined equipment and energy category
    # Step 3: query combined equipment input category hourly data (pre-aggregated by background service)
    # Step 4: aggregate combined equipment energy consumption data by period
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
        # this procedure accepts combined equipment id or combined equipment uuid to identify a combined equipment
        combined_equipment_id1 = req.params.get("combinedequipmentid1")
        combined_equipment_uuid1 = req.params.get("combinedequipmentuuid1")
        combined_equipment_id2 = req.params.get("combinedequipmentid2")
        combined_equipment_uuid2 = req.params.get("combinedequipmentuuid2")
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
        if combined_equipment_id1 is None and combined_equipment_uuid1 is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                description="API.INVALID_COMBINED_EQUIPMENT_ID",
            )

        if combined_equipment_id1 is not None:
            combined_equipment_id1 = str.strip(combined_equipment_id1)
            if not combined_equipment_id1.isdigit() or int(combined_equipment_id1) <= 0:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_COMBINED_EQUIPMENT_ID",
                )

        if combined_equipment_uuid1 is not None:
            regex = re.compile(
                r"^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z",
                re.I,
            )
            match = regex.match(str.strip(combined_equipment_uuid1))
            if not bool(match):
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_COMBINED_EQUIPMENT_UUID",
                )

        if combined_equipment_id2 is None and combined_equipment_uuid2 is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                description="API.INVALID_COMBINED_EQUIPMENT_ID",
            )

        if combined_equipment_id2 is not None:
            combined_equipment_id2 = str.strip(combined_equipment_id2)
            if not combined_equipment_id2.isdigit() or int(combined_equipment_id2) <= 0:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_COMBINED_EQUIPMENT_ID",
                )

        if combined_equipment_uuid2 is not None:
            regex = re.compile(
                r"^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z",
                re.I,
            )
            match = regex.match(str.strip(combined_equipment_uuid2))
            if not bool(match):
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_COMBINED_EQUIPMENT_UUID",
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

        ############################################################################################################
        # Redis cache
        ############################################################################################################
        cache_key = None
        cache_expire = 1800  # 30 minutes
        redis_client = None
        if config.redis.get('is_enabled'):
            try:
                redis_client = redis.Redis(
                    host=config.redis['host'],
                    port=config.redis['port'],
                    password=config.redis.get('password') or None,
                    db=config.redis['db'],
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2
                )
                redis_client.ping()

                # Normalize end datetimes for cache key: set minute/second/microsecond to 0
                reporting_end_datetime_utc_normalized = None
                if reporting_end_datetime_utc is not None:
                    reporting_end_datetime_utc_normalized = reporting_end_datetime_utc.replace(
                        minute=0, second=0, microsecond=0)

                cache_params = {
                    "combinedequipmentid1": combined_equipment_id1,
                    "combinedequipmentuuid1": combined_equipment_uuid1,
                    "combinedequipmentid2": combined_equipment_id2,
                    "combinedequipmentuuid2": combined_equipment_uuid2,
                    "energycategoryid": energy_category_id,
                    "periodtype": period_type,
                    "reporting_start_datetime_utc": reporting_start_datetime_utc.isoformat()
                    if reporting_start_datetime_utc else None,
                    "reporting_end_datetime_utc": reporting_end_datetime_utc_normalized.isoformat()
                    if reporting_end_datetime_utc_normalized else None,
                    "language": language,
                    "quickmode": is_quick_mode,
                }
                cache_params_json = json.dumps(cache_params, sort_keys=True)
                cache_key = 'report:combinedequipmentcomparison:' + \
                    hashlib.sha256(cache_params_json.encode('utf-8')).hexdigest()

                cached_result = redis_client.get(cache_key)
                if cached_result:
                    resp.text = cached_result
                    return
            except Exception:
                redis_client = None

        ################################################################################################################
        # Step 2: query the combined equipment and energy category
        ################################################################################################################
        cnx_system = None
        cnx_energy = None
        cnx_historical = None
        cursor_system = None
        cursor_energy = None
        cursor_historical = None
        try:
            cnx_system = mysql.connector.connect(**config.myems_system_db)
            cnx_energy = mysql.connector.connect(**config.myems_energy_db)
            cnx_historical = mysql.connector.connect(**config.myems_historical_db)
            cursor_system = cnx_system.cursor()
            cursor_energy = cnx_energy.cursor()
            cursor_historical = cnx_historical.cursor()

            # Query combined equipment 1
            if combined_equipment_id1 is not None:
                cursor_system.execute(
                    " SELECT id, name FROM tbl_combined_equipments WHERE id = %s ", (combined_equipment_id1,)
                )
                row_combined_equipment1 = cursor_system.fetchone()
            elif combined_equipment_uuid1 is not None:
                cursor_system.execute(
                    " SELECT id, name FROM tbl_combined_equipments WHERE uuid = %s ",
                    (combined_equipment_uuid1,),
                )
                row_combined_equipment1 = cursor_system.fetchone()

            if row_combined_equipment1 is None:
                raise falcon.HTTPError(
                    status=falcon.HTTP_404,
                    title="API.NOT_FOUND",
                    description="API.COMBINED_EQUIPMENT_NOT_FOUND",
                )

            combined_equipment1 = dict()
            combined_equipment1["id"] = row_combined_equipment1[0]
            combined_equipment1["name"] = row_combined_equipment1[1]

            # Query combined equipment 2
            if combined_equipment_id2 is not None:
                cursor_system.execute(
                    " SELECT id, name FROM tbl_combined_equipments WHERE id = %s ", (combined_equipment_id2,)
                )
                row_combined_equipment2 = cursor_system.fetchone()
            elif combined_equipment_uuid2 is not None:
                cursor_system.execute(
                    " SELECT id, name FROM tbl_combined_equipments WHERE uuid = %s ",
                    (combined_equipment_uuid2,),
                )
                row_combined_equipment2 = cursor_system.fetchone()

            if row_combined_equipment2 is None:
                raise falcon.HTTPError(
                    status=falcon.HTTP_404,
                    title="API.NOT_FOUND",
                    description="API.COMBINED_EQUIPMENT_NOT_FOUND",
                )

            combined_equipment2 = dict()
            combined_equipment2["id"] = row_combined_equipment2[0]
            combined_equipment2["name"] = row_combined_equipment2[1]

            # Query energy category
            cursor_system.execute(
                " SELECT id, name, unit_of_measure FROM tbl_energy_categories WHERE id = %s ",
                (energy_category_id,),
            )
            row_energy_category = cursor_system.fetchone()

            if row_energy_category is None:
                raise falcon.HTTPError(
                    status=falcon.HTTP_404,
                    title="API.NOT_FOUND",
                    description="API.ENERGY_CATEGORY_NOT_FOUND",
                )

            energy_category = dict()
            energy_category["id"] = row_energy_category[0]
            energy_category["name"] = row_energy_category[1]
            energy_category["unit_of_measure"] = row_energy_category[2]

            ############################################################################################################
            # Step 3: query combined equipment input category hourly data (pre-aggregated by background service)
            ############################################################################################################
            # Query combined equipment 1 input category hourly data
            cursor_energy.execute(
                " SELECT start_datetime_utc, actual_value "
                " FROM tbl_combined_equipment_input_category_hourly "
                " WHERE combined_equipment_id = %s "
                "     AND energy_category_id = %s "
                "     AND start_datetime_utc >= %s "
                "     AND start_datetime_utc < %s "
                " ORDER BY start_datetime_utc ",
                (
                    combined_equipment1["id"],
                    energy_category_id,
                    reporting_start_datetime_utc,
                    reporting_end_datetime_utc,
                ),
            )
            rows_combined_equipment1_hourly = cursor_energy.fetchall()

            # Query combined equipment 2 input category hourly data
            cursor_energy.execute(
                " SELECT start_datetime_utc, actual_value "
                " FROM tbl_combined_equipment_input_category_hourly "
                " WHERE combined_equipment_id = %s "
                "     AND energy_category_id = %s "
                "     AND start_datetime_utc >= %s "
                "     AND start_datetime_utc < %s "
                " ORDER BY start_datetime_utc ",
                (
                    combined_equipment2["id"],
                    energy_category_id,
                    reporting_start_datetime_utc,
                    reporting_end_datetime_utc,
                ),
            )
            rows_combined_equipment2_hourly = cursor_energy.fetchall()

            ############################################################################################################
            # Step 4: aggregate combined equipment energy consumption data by period
            ############################################################################################################
            # Aggregate energy consumption for combined equipment 1
            combined_equipment1_energy_data = dict()
            combined_equipment1_energy_data["timestamps"] = list()
            combined_equipment1_energy_data["values"] = list()
            combined_equipment1_energy_data["total_in_category"] = Decimal(0.0)

            # Aggregate combined equipment 1 hourly data by period
            rows_combined_equipment1_periodically = utilities.aggregate_hourly_data_by_period(
                rows_combined_equipment1_hourly,
                reporting_start_datetime_utc,
                reporting_end_datetime_utc,
                period_type,
            )

            for row_combined_equipment1_periodically in rows_combined_equipment1_periodically:
                current_datetime_local = row_combined_equipment1_periodically[0].replace(
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

                actual_value = row_combined_equipment1_periodically[1]

                combined_equipment1_energy_data["timestamps"].append(current_datetime)
                combined_equipment1_energy_data["values"].append(actual_value)
                if actual_value is not None:
                    combined_equipment1_energy_data["total_in_category"] += actual_value

            # Aggregate energy consumption for combined equipment 2
            combined_equipment2_energy_data = dict()
            combined_equipment2_energy_data["timestamps"] = list()
            combined_equipment2_energy_data["values"] = list()
            combined_equipment2_energy_data["total_in_category"] = Decimal(0.0)

            # Aggregate combined equipment 2 hourly data by period
            rows_combined_equipment2_periodically = utilities.aggregate_hourly_data_by_period(
                rows_combined_equipment2_hourly,
                reporting_start_datetime_utc,
                reporting_end_datetime_utc,
                period_type,
            )

            for row_combined_equipment2_periodically in rows_combined_equipment2_periodically:
                current_datetime_local = row_combined_equipment2_periodically[0].replace(
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

                actual_value = row_combined_equipment2_periodically[1]

                combined_equipment2_energy_data["timestamps"].append(current_datetime)
                combined_equipment2_energy_data["values"].append(actual_value)
                if actual_value is not None:
                    combined_equipment2_energy_data["total_in_category"] += actual_value

            # Calculate difference
            diff = dict()
            diff["values"] = list()
            diff["total_in_category"] = Decimal(0.0)

            # Ensure both combined equipments have the same number of data points
            min_length = min(
                len(combined_equipment1_energy_data["values"]), len(combined_equipment2_energy_data["values"])
            )
            for i in range(min_length):
                combined_equipment1_value = (
                    combined_equipment1_energy_data["values"][i]
                    if i < len(combined_equipment1_energy_data["values"])
                    else None
                )
                combined_equipment2_value = (
                    combined_equipment2_energy_data["values"][i]
                    if i < len(combined_equipment2_energy_data["values"])
                    else None
                )

                # Calculate difference, handling None values
                if combined_equipment1_value is None and combined_equipment2_value is None:
                    diff_value = None
                elif combined_equipment1_value is None:
                    diff_value = None  # Cannot calculate difference when one value is missing
                elif combined_equipment2_value is None:
                    diff_value = None  # Cannot calculate difference when one value is missing
                else:
                    diff_value = combined_equipment1_value - combined_equipment2_value
                    diff["total_in_category"] += diff_value

                diff["values"].append(diff_value)

        finally:
            if cursor_system is not None:
                try:
                    cursor_system.close()
                except Exception:
                    pass
            if cursor_energy is not None:
                try:
                    cursor_energy.close()
                except Exception:
                    pass
            if cursor_historical is not None:
                try:
                    cursor_historical.close()
                except Exception:
                    pass
            if cnx_system is not None:
                try:
                    cnx_system.close()
                except Exception:
                    pass
            if cnx_energy is not None:
                try:
                    cnx_energy.close()
                except Exception:
                    pass
            if cnx_historical is not None:
                try:
                    cnx_historical.close()
                except Exception:
                    pass

        ################################################################################################################
        # Step 5: construct the report
        ################################################################################################################
        result = {
            "combined_equipment1": {
                "id": combined_equipment1["id"],
                "name": combined_equipment1["name"],
            },
            "combined_equipment2": {
                "id": combined_equipment2["id"],
                "name": combined_equipment2["name"],
            },
            "energy_category": {
                "id": energy_category["id"],
                "name": energy_category["name"],
                "unit_of_measure": energy_category["unit_of_measure"],
            },
            "reporting_period1": {
                "total_in_category": combined_equipment1_energy_data["total_in_category"],
                "timestamps": combined_equipment1_energy_data["timestamps"],
                "values": combined_equipment1_energy_data["values"],
            },
            "reporting_period2": {
                "total_in_category": combined_equipment2_energy_data["total_in_category"],
                "timestamps": combined_equipment2_energy_data["timestamps"],
                "values": combined_equipment2_energy_data["values"],
            },
            "diff": {
                "values": diff["values"],
                "total_in_category": diff["total_in_category"],
            },
        }

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result["excel_bytes_base64"] = excelexporters.combinedequipmentcomparison.export(
                result,
                combined_equipment1["name"],
                combined_equipment2["name"],
                energy_category["name"],
                reporting_period_start_datetime_local,
                reporting_period_end_datetime_local,
                period_type,
                language,
            )

        resp_text = json.dumps(result)
        resp.text = resp_text

        if config.redis.get('is_enabled') and redis_client is not None and cache_key is not None:
            try:
                redis_client.setex(cache_key, cache_expire, resp_text)
            except Exception:
                logger.warning("Failed to write cache key %s", cache_key, exc_info=True)
