import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import falcon
import mysql.connector
import simplejson as json
import config
import excelexporters.equipmentcomparison
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
    # Step 2: query the equipment and energy category
    # Step 3: query equipment input category hourly data (pre-aggregated by background service)
    # Step 4: aggregate equipment energy consumption data by period
    # Step 5: query equipment associated points data
    # Step 6: construct the report
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
        # this procedure accepts equipment id or equipment uuid to identify a equipment
        equipment_id1 = req.params.get("equipmentid1")
        equipment_uuid1 = req.params.get("equipmentuuid1")
        equipment_id2 = req.params.get("equipmentid2")
        equipment_uuid2 = req.params.get("equipmentuuid2")
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
        if equipment_id1 is None and equipment_uuid1 is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                description="API.INVALID_EQUIPMENT_ID",
            )

        if equipment_id1 is not None:
            equipment_id1 = str.strip(equipment_id1)
            if not equipment_id1.isdigit() or int(equipment_id1) <= 0:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_EQUIPMENT_ID",
                )

        if equipment_uuid1 is not None:
            regex = re.compile(
                r"^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z",
                re.I,
            )
            match = regex.match(str.strip(equipment_uuid1))
            if not bool(match):
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_EQUIPMENT_UUID",
                )

        if equipment_id2 is None and equipment_uuid2 is None:
            raise falcon.HTTPError(
                status=falcon.HTTP_400,
                title="API.BAD_REQUEST",
                description="API.INVALID_EQUIPMENT_ID",
            )

        if equipment_id2 is not None:
            equipment_id2 = str.strip(equipment_id2)
            if not equipment_id2.isdigit() or int(equipment_id2) <= 0:
                raise falcon.HTTPError(
                    status=falcon.HTTP_400,
                    title="API.BAD_REQUEST",
                    description="API.INVALID_EQUIPMENT_ID",
                )

        if equipment_uuid2 is not None:
            regex = re.compile(
                r"^[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}\Z",
                re.I,
            )
            match = regex.match(str.strip(equipment_uuid2))
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
        # Step 2: query the equipment and energy category
        ################################################################################################################
        cnx_system = mysql.connector.connect(**config.myems_system_db)
        cursor_system = cnx_system.cursor()

        cnx_energy = mysql.connector.connect(**config.myems_energy_db)
        cursor_energy = cnx_energy.cursor()

        cnx_historical = mysql.connector.connect(**config.myems_historical_db)
        cursor_historical = cnx_historical.cursor()

        # Query equipment 1
        if equipment_id1 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_equipments WHERE id = %s ", (equipment_id1,)
            )
            row_equipment1 = cursor_system.fetchone()
        elif equipment_uuid1 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_equipments WHERE uuid = %s ",
                (equipment_uuid1,),
            )
            row_equipment1 = cursor_system.fetchone()

        if row_equipment1 is None:
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

        equipment1 = dict()
        equipment1["id"] = row_equipment1[0]
        equipment1["name"] = row_equipment1[1]

        # Query equipment 2
        if equipment_id2 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_equipments WHERE id = %s ", (equipment_id2,)
            )
            row_equipment2 = cursor_system.fetchone()
        elif equipment_uuid2 is not None:
            cursor_system.execute(
                " SELECT id, name FROM tbl_equipments WHERE uuid = %s ",
                (equipment_uuid2,),
            )
            row_equipment2 = cursor_system.fetchone()

        if row_equipment2 is None:
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

        equipment2 = dict()
        equipment2["id"] = row_equipment2[0]
        equipment2["name"] = row_equipment2[1]

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
        # Step 3: query equipment input category hourly data (pre-aggregated by background service)
        ################################################################################################################
        # Query equipment 1 input category hourly data
        cursor_energy.execute(
            " SELECT start_datetime_utc, actual_value "
            " FROM tbl_equipment_input_category_hourly "
            " WHERE equipment_id = %s "
            "     AND energy_category_id = %s "
            "     AND start_datetime_utc >= %s "
            "     AND start_datetime_utc < %s "
            " ORDER BY start_datetime_utc ",
            (
                equipment1["id"],
                energy_category_id,
                reporting_start_datetime_utc,
                reporting_end_datetime_utc,
            ),
        )
        rows_equipment1_hourly = cursor_energy.fetchall()

        # Query equipment 2 input category hourly data
        cursor_energy.execute(
            " SELECT start_datetime_utc, actual_value "
            " FROM tbl_equipment_input_category_hourly "
            " WHERE equipment_id = %s "
            "     AND energy_category_id = %s "
            "     AND start_datetime_utc >= %s "
            "     AND start_datetime_utc < %s "
            " ORDER BY start_datetime_utc ",
            (
                equipment2["id"],
                energy_category_id,
                reporting_start_datetime_utc,
                reporting_end_datetime_utc,
            ),
        )
        rows_equipment2_hourly = cursor_energy.fetchall()

        ################################################################################################################
        # Step 4: aggregate equipment energy consumption data by period
        ################################################################################################################
        # Aggregate energy consumption for equipment 1
        equipment1_energy_data = dict()
        equipment1_energy_data["timestamps"] = list()
        equipment1_energy_data["values"] = list()
        equipment1_energy_data["total_in_category"] = Decimal(0.0)

        # Aggregate equipment 1 hourly data by period
        rows_equipment1_periodically = utilities.aggregate_hourly_data_by_period(
            rows_equipment1_hourly,
            reporting_start_datetime_utc,
            reporting_end_datetime_utc,
            period_type,
        )

        for row_equipment1_periodically in rows_equipment1_periodically:
            current_datetime_local = row_equipment1_periodically[0].replace(
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

            actual_value = row_equipment1_periodically[1]

            equipment1_energy_data["timestamps"].append(current_datetime)
            equipment1_energy_data["values"].append(actual_value)
            if actual_value is not None:
                equipment1_energy_data["total_in_category"] += actual_value

        # Aggregate energy consumption for equipment 2
        equipment2_energy_data = dict()
        equipment2_energy_data["timestamps"] = list()
        equipment2_energy_data["values"] = list()
        equipment2_energy_data["total_in_category"] = Decimal(0.0)

        # Aggregate equipment 2 hourly data by period
        rows_equipment2_periodically = utilities.aggregate_hourly_data_by_period(
            rows_equipment2_hourly,
            reporting_start_datetime_utc,
            reporting_end_datetime_utc,
            period_type,
        )

        for row_equipment2_periodically in rows_equipment2_periodically:
            current_datetime_local = row_equipment2_periodically[0].replace(
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

            actual_value = row_equipment2_periodically[1]

            equipment2_energy_data["timestamps"].append(current_datetime)
            equipment2_energy_data["values"].append(actual_value)
            if actual_value is not None:
                equipment2_energy_data["total_in_category"] += actual_value

        # Calculate difference
        diff = dict()
        diff["values"] = list()
        diff["total_in_category"] = Decimal(0.0)

        # Ensure both equipments have the same number of data points
        min_length = min(
            len(equipment1_energy_data["values"]), len(equipment2_energy_data["values"])
        )
        for i in range(min_length):
            equipment1_value = (
                equipment1_energy_data["values"][i]
                if i < len(equipment1_energy_data["values"])
                else None
            )
            equipment2_value = (
                equipment2_energy_data["values"][i]
                if i < len(equipment2_energy_data["values"])
                else None
            )
            
            # Calculate difference, handling None values
            if equipment1_value is None and equipment2_value is None:
                diff_value = None
            elif equipment1_value is None:
                diff_value = None  # Cannot calculate difference when one value is missing
            elif equipment2_value is None:
                diff_value = None  # Cannot calculate difference when one value is missing
            else:
                diff_value = equipment1_value - equipment2_value
                diff["total_in_category"] += diff_value
                
            diff["values"].append(diff_value)

        ################################################################################################################
        # Step 5: query equipment associated points data (for detailed parameters)
        ################################################################################################################
        parameters_data1 = dict()
        parameters_data1["names"] = list()
        parameters_data1["timestamps"] = list()
        parameters_data1["values"] = list()

        parameters_data2 = dict()
        parameters_data2["names"] = list()
        parameters_data2["timestamps"] = list()
        parameters_data2["values"] = list()

        if not is_quick_mode:
            # Query points for equipment 1
            cursor_system.execute(
                " SELECT p.id, ep.name, p.units, p.object_type "
                " FROM tbl_equipments e, tbl_equipments_parameters ep, tbl_points p "
                " WHERE e.id = %s AND e.id = ep.equipment_id AND ep.parameter_type = 'point' "
                "       AND ep.point_id = p.id "
                " ORDER BY p.id ",
                (equipment1["id"],),
            )
            rows_points1 = cursor_system.fetchall()

            if rows_points1 is not None and len(rows_points1) > 0:
                for point_row in rows_points1:
                    point_values = []
                    point_timestamps = []

                    if point_row[3] == "ENERGY_VALUE":
                        query = (
                            " SELECT utc_date_time, actual_value "
                            " FROM tbl_energy_value "
                            " WHERE point_id = %s "
                            " AND utc_date_time BETWEEN %s AND %s "
                            " ORDER BY utc_date_time "
                        )
                        cursor_historical.execute(
                            query,
                            (
                                point_row[0],
                                reporting_start_datetime_utc,
                                reporting_end_datetime_utc,
                            ),
                        )
                        rows = cursor_historical.fetchall()

                        if rows is not None and len(rows) > 0:
                            for row in rows:
                                current_datetime_local = row[0].replace(
                                    tzinfo=timezone.utc
                                ) + timedelta(minutes=timezone_offset)
                                current_datetime = current_datetime_local.isoformat()[
                                    0:19
                                ]
                                point_timestamps.append(current_datetime)
                                point_values.append(row[1])
                    elif point_row[3] == "ANALOG_VALUE":
                        query = (
                            " SELECT utc_date_time, actual_value "
                            " FROM tbl_analog_value "
                            " WHERE point_id = %s "
                            " AND utc_date_time BETWEEN %s AND %s "
                            " ORDER BY utc_date_time "
                        )
                        cursor_historical.execute(
                            query,
                            (
                                point_row[0],
                                reporting_start_datetime_utc,
                                reporting_end_datetime_utc,
                            ),
                        )
                        rows = cursor_historical.fetchall()

                        if rows is not None and len(rows) > 0:
                            for row in rows:
                                current_datetime_local = row[0].replace(
                                    tzinfo=timezone.utc
                                ) + timedelta(minutes=timezone_offset)
                                current_datetime = current_datetime_local.isoformat()[
                                    0:19
                                ]
                                point_timestamps.append(current_datetime)
                                point_values.append(row[1])
                    elif point_row[3] == "DIGITAL_VALUE":
                        query = (
                            " SELECT utc_date_time, actual_value "
                            " FROM tbl_digital_value "
                            " WHERE point_id = %s "
                            " AND utc_date_time BETWEEN %s AND %s "
                            " ORDER BY utc_date_time "
                        )
                        cursor_historical.execute(
                            query,
                            (
                                point_row[0],
                                reporting_start_datetime_utc,
                                reporting_end_datetime_utc,
                            ),
                        )
                        rows = cursor_historical.fetchall()

                        if rows is not None and len(rows) > 0:
                            for row in rows:
                                current_datetime_local = row[0].replace(
                                    tzinfo=timezone.utc
                                ) + timedelta(minutes=timezone_offset)
                                current_datetime = current_datetime_local.isoformat()[
                                    0:19
                                ]
                                point_timestamps.append(current_datetime)
                                point_values.append(row[1])

                    parameters_data1["names"].append(
                        equipment1["name"]
                        + " - "
                        + point_row[1]
                        + " ("
                        + point_row[2]
                        + ")"
                    )
                    parameters_data1["timestamps"].append(point_timestamps)
                    parameters_data1["values"].append(point_values)

            # Query points for equipment 2
            cursor_system.execute(
                " SELECT p.id, ep.name, p.units, p.object_type "
                " FROM tbl_equipments e, tbl_equipments_parameters ep, tbl_points p "
                " WHERE e.id = %s AND e.id = ep.equipment_id AND ep.parameter_type = 'point' "
                "       AND ep.point_id = p.id "
                " ORDER BY p.id ",
                (equipment2["id"],),
            )
            rows_points2 = cursor_system.fetchall()

            if rows_points2 is not None and len(rows_points2) > 0:
                for point_row in rows_points2:
                    point_values = []
                    point_timestamps = []

                    if point_row[3] == "ENERGY_VALUE":
                        query = (
                            " SELECT utc_date_time, actual_value "
                            " FROM tbl_energy_value "
                            " WHERE point_id = %s "
                            " AND utc_date_time BETWEEN %s AND %s "
                            " ORDER BY utc_date_time "
                        )
                        cursor_historical.execute(
                            query,
                            (
                                point_row[0],
                                reporting_start_datetime_utc,
                                reporting_end_datetime_utc,
                            ),
                        )
                        rows = cursor_historical.fetchall()

                        if rows is not None and len(rows) > 0:
                            for row in rows:
                                current_datetime_local = row[0].replace(
                                    tzinfo=timezone.utc
                                ) + timedelta(minutes=timezone_offset)
                                current_datetime = current_datetime_local.isoformat()[
                                    0:19
                                ]
                                point_timestamps.append(current_datetime)
                                point_values.append(row[1])
                    elif point_row[3] == "ANALOG_VALUE":
                        query = (
                            " SELECT utc_date_time, actual_value "
                            " FROM tbl_analog_value "
                            " WHERE point_id = %s "
                            " AND utc_date_time BETWEEN %s AND %s "
                            " ORDER BY utc_date_time "
                        )
                        cursor_historical.execute(
                            query,
                            (
                                point_row[0],
                                reporting_start_datetime_utc,
                                reporting_end_datetime_utc,
                            ),
                        )
                        rows = cursor_historical.fetchall()

                        if rows is not None and len(rows) > 0:
                            for row in rows:
                                current_datetime_local = row[0].replace(
                                    tzinfo=timezone.utc
                                ) + timedelta(minutes=timezone_offset)
                                current_datetime = current_datetime_local.isoformat()[
                                    0:19
                                ]
                                point_timestamps.append(current_datetime)
                                point_values.append(row[1])
                    elif point_row[3] == "DIGITAL_VALUE":
                        query = (
                            " SELECT utc_date_time, actual_value "
                            " FROM tbl_digital_value "
                            " WHERE point_id = %s "
                            " AND utc_date_time BETWEEN %s AND %s "
                            " ORDER BY utc_date_time "
                        )
                        cursor_historical.execute(
                            query,
                            (
                                point_row[0],
                                reporting_start_datetime_utc,
                                reporting_end_datetime_utc,
                            ),
                        )
                        rows = cursor_historical.fetchall()

                        if rows is not None and len(rows) > 0:
                            for row in rows:
                                current_datetime_local = row[0].replace(
                                    tzinfo=timezone.utc
                                ) + timedelta(minutes=timezone_offset)
                                current_datetime = current_datetime_local.isoformat()[
                                    0:19
                                ]
                                point_timestamps.append(current_datetime)
                                point_values.append(row[1])

                    parameters_data2["names"].append(
                        equipment2["name"]
                        + " - "
                        + point_row[1]
                        + " ("
                        + point_row[2]
                        + ")"
                    )
                    parameters_data2["timestamps"].append(point_timestamps)
                    parameters_data2["values"].append(point_values)

        ################################################################################################################
        # Step 6: construct the report
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
            "equipment1": {
                "id": equipment1["id"],
                "name": equipment1["name"],
            },
            "equipment2": {
                "id": equipment2["id"],
                "name": equipment2["name"],
            },
            "energy_category": {
                "id": energy_category["id"],
                "name": energy_category["name"],
                "unit_of_measure": energy_category["unit_of_measure"],
            },
            "reporting_period1": {
                "total_in_category": equipment1_energy_data["total_in_category"],
                "timestamps": equipment1_energy_data["timestamps"],
                "values": equipment1_energy_data["values"],
            },
            "reporting_period2": {
                "total_in_category": equipment2_energy_data["total_in_category"],
                "timestamps": equipment2_energy_data["timestamps"],
                "values": equipment2_energy_data["values"],
            },
            "parameters1": {
                "names": parameters_data1["names"],
                "timestamps": parameters_data1["timestamps"],
                "values": parameters_data1["values"],
            },
            "parameters2": {
                "names": parameters_data2["names"],
                "timestamps": parameters_data2["timestamps"],
                "values": parameters_data2["values"],
            },
            "diff": {
                "values": diff["values"],
                "total_in_category": diff["total_in_category"],
            },
        }

        # export result to Excel file and then encode the file to base64 string
        if not is_quick_mode:
            result["excel_bytes_base64"] = excelexporters.equipmentcomparison.export(
                result,
                equipment1["name"],
                equipment2["name"],
                energy_category["name"],
                reporting_period_start_datetime_local,
                reporting_period_end_datetime_local,
                period_type,
                language,
            )

        resp.text = json.dumps(result)
