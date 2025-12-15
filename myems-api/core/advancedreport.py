import uuid
from datetime import datetime, timezone, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control
import config


class AdvancedReportCollection:
    """
    Advanced Report Collection Resource

    This class handles CRUD operations for advanced reports collection.
    It provides endpoints for listing all reports and creating new reports.
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """
        Handle GET requests to retrieve all advanced reports

        Returns a list of all advanced reports with their metadata including:
        - Report ID, name, and UUID
        - Expression (JSON configuration)
        - Enabled status
        - Last run and next run datetime (converted to local timezone)
        - Immediate run flag

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        admin_control(req)
        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        # Query to retrieve all reports ordered by ID
        query = (" SELECT id, name, uuid, "
                 "        expression, "
                 "        is_enabled, "
                 "        last_run_datetime_utc, "
                 "        next_run_datetime_utc, "
                 "        is_run_immediately "
                 " FROM tbl_reports "
                 " ORDER BY id ")
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        cnx.close()

        # Calculate timezone offset for datetime conversion
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                # Convert last run datetime from UTC to local timezone
                if isinstance(row[5], datetime):
                    last_run_datetime_local = row[5].replace(tzinfo=timezone.utc) + \
                                              timedelta(minutes=timezone_offset)
                    last_run_datetime = last_run_datetime_local.isoformat()[0:19]
                else:
                    last_run_datetime = None

                # Convert next run datetime from UTC to local timezone
                if isinstance(row[6], datetime):
                    next_run_datetime_local = row[6].replace(tzinfo=timezone.utc) + \
                                              timedelta(minutes=timezone_offset)
                    next_run_datetime = next_run_datetime_local.isoformat()[0:19]
                else:
                    next_run_datetime = None

                # Build result object for each report
                meta_result = {"id": row[0], "name": row[1], "uuid": row[2],
                               "expression": row[3],
                               "is_enabled": bool(row[4]),
                               "last_run_datetime": last_run_datetime,
                               "next_run_datetime": next_run_datetime,
                               "is_run_immediately": bool(row[7]),
                               }
                result.append(meta_result)

        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """
        Handle POST requests to create a new advanced report

        Creates a new advanced report with the provided configuration.
        Validates input data including name, expression (JSON), enabled status,
        next run datetime, and immediate run flag.

        Args:
            req: Falcon request object containing report data
            resp: Falcon response object
        """
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        # Validate report name
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCEDREPORT_NAME')
        name = str.strip(new_values['data']['name'])

        # Validate expression (must be valid JSON)
        if 'expression' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['expression'], str) or \
                len(str.strip(new_values['data']['expression'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION')
        expression = str.strip(new_values['data']['expression'])

        # Validate expression is valid JSON
        try:
            json.loads(expression)
        except json.JSONDecodeError as ex:
            print("Failed to parse JSON")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_JSON_FORMAT')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description=str(ex))

        # Validate enabled status
        if 'is_enabled' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_enabled'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ENABLED')
        is_enabled = new_values['data']['is_enabled']

        # Process next run datetime (optional field)
        next_run_datetime_utc = None
        if 'next_run_datetime' in new_values['data'].keys() and \
                isinstance(new_values['data']['next_run_datetime'], str) and \
                len(str.strip(new_values['data']['next_run_datetime'])) > 0:

            try:
                next_run_datetime_local = datetime.strptime(new_values['data']['next_run_datetime'],
                                                            '%Y-%m-%dT%H:%M:%S')
            except KeyError as ex:         
                print("Failed to Key request") 
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR', description=str(ex))
            except TypeError as ex:
                print("Failed to Type request")
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR', description=str(ex))
            except Exception:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_NEXT_RUN_DATETIME')

            # Convert local datetime to UTC for storage
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            next_run_datetime_utc = \
                next_run_datetime_local.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)

        # Validate immediate run flag
        if 'is_run_immediately' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_run_immediately'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_RUN_IMMEDIATELY')
        is_run_immediately = new_values['data']['is_run_immediately']

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        # Check if report name already exists
        cursor.execute(" SELECT name "
                       " FROM tbl_reports "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ADVANCED_REPORT_NAME_IS_ALREADY_IN_USE')

        # Insert new report into database
        add_row = (" INSERT INTO tbl_reports "
                   "             (name, uuid, expression, is_enabled, next_run_datetime_utc, is_run_immediately) "
                   " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 expression,
                                 is_enabled,
                                 next_run_datetime_utc,
                                 is_run_immediately))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/advancedreports/' + str(new_id)


class AdvancedReportItem:
    """
    Advanced Report Item Resource

    This class handles individual advanced report operations including:
    - Retrieving a specific report by ID
    - Updating an existing report
    - Deleting a report
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Report ID parameter
        """
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """
        Handle GET requests to retrieve a specific advanced report by ID

        Retrieves a single advanced report with all its metadata including:
        - Report ID, name, and UUID
        - Expression (JSON configuration)
        - Enabled status
        - Last run and next run datetime (converted to local timezone)
        - Immediate run flag

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Report ID to retrieve
        """
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        # Query to retrieve specific report by ID
        query = (" SELECT id, name, uuid, "
                 "        expression, "
                 "        is_enabled, "
                 "        last_run_datetime_utc, "
                 "        next_run_datetime_utc, "
                 "        is_run_immediately "
                 " FROM tbl_reports "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        # Calculate timezone offset for datetime conversion
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # Convert last run datetime from UTC to local timezone
        if isinstance(row[5], datetime):
            last_run_datetime_local = row[5].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            last_run_datetime = last_run_datetime_local.isoformat()[0:19]
        else:
            last_run_datetime = None

        # Convert next run datetime from UTC to local timezone
        if isinstance(row[6], datetime):
            next_run_datetime_local = row[6].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            next_run_datetime = next_run_datetime_local.isoformat()[0:19]
        else:
            next_run_datetime = None

        # Build result object
        result = {"id": row[0], "name": row[1], "uuid": row[2],
                  "expression": row[3],
                  "is_enabled": bool(row[4]),
                  "last_run_datetime": last_run_datetime,
                  "next_run_datetime": next_run_datetime,
                  "is_run_immediately": bool(row[7]),
                  }
        resp.text = json.dumps(result)

    @staticmethod
    @user_logger
    def on_delete(req, resp, id_):
        """
        Handle DELETE requests to remove an advanced report

        Deletes the specified advanced report from the database.
        Validates the report ID and checks if the report exists before deletion.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Report ID to delete
        """
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        # Check if report exists before deletion
        cursor.execute(" SELECT id "
                       " FROM tbl_reports "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        # Delete the report
        cursor.execute(" DELETE FROM tbl_reports WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """
        Handle PUT requests to update an existing advanced report

        Updates an existing advanced report with new configuration data.
        Validates input data including name, expression (JSON), enabled status,
        next run datetime, and immediate run flag.

        Args:
            req: Falcon request object containing updated report data
            resp: Falcon response object
            id_: Report ID to update
        """
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        new_values = json.loads(raw_json)

        # Validate report name
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCEDREPORT_NAME')
        name = str.strip(new_values['data']['name'])

        # Validate expression (must be valid JSON)
        if 'expression' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['expression'], str) or \
                len(str.strip(new_values['data']['expression'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION')
        expression = str.strip(new_values['data']['expression'])

        # Validate expression is valid JSON
        try:
            json.loads(expression)
        except json.JSONDecodeError as ex:
            print("Failed to parse JSON")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_JSON_FORMAT')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description=str(ex))

        # Validate enabled status
        if 'is_enabled' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_enabled'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ENABLED')
        is_enabled = new_values['data']['is_enabled']

        # Validate next run datetime (required for updates)
        if 'next_run_datetime' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['next_run_datetime'], str) or \
                len(str.strip(new_values['data']['next_run_datetime'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NEXT_RUN_DATETIME')

        # Calculate timezone offset for datetime conversion
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # Parse and convert next run datetime to UTC
        try:
            next_run_datetime_local = datetime.strptime(new_values['data']['next_run_datetime'], '%Y-%m-%dT%H:%M:%S')
        except KeyError as ex:         
            print("Failed to Key request") 
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR', description=str(ex))
        except TypeError as ex:
            print("Failed to Type request")
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR', description=str(ex))
        except Exception:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NEXT_RUN_DATETIME')

        next_run_datetime_utc = next_run_datetime_local.replace(tzinfo=timezone.utc) \
            - timedelta(minutes=timezone_offset)

        # Validate immediate run flag
        if 'is_run_immediately' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_run_immediately'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_RUN_IMMEDIATELY')
        is_run_immediately = new_values['data']['is_run_immediately']

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        # Check if report exists
        cursor.execute(" SELECT id "
                       " FROM tbl_reports "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        # Check if new name conflicts with existing reports (excluding current report)
        cursor.execute(" SELECT name "
                       " FROM tbl_reports "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ADVANCED_REPORT_NAME_IS_ALREADY_IN_USE')

        # Update the report in database
        update_row = (" UPDATE tbl_reports "
                      " SET name = %s, "
                      "     expression = %s, "
                      "     is_enabled = %s, "
                      "     next_run_datetime_utc = %s, "
                      "     is_run_immediately = %s "
                      " WHERE id = %s ")
        cursor.execute(update_row, (name,
                                    expression,
                                    is_enabled,
                                    next_run_datetime_utc,
                                    is_run_immediately,
                                    id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class AdvancedReportRun:
    """
    Advanced Report Run Resource

    This class handles immediate execution of advanced reports.
    It provides functionality to trigger a report to run immediately
    by setting the is_run_immediately flag.
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Report ID parameter
        """
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """
        Handle PUT requests to trigger immediate execution of a report

        Sets the is_run_immediately flag to true for the specified report,
        which signals the report scheduler to run the report as soon as possible.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Report ID to run immediately
        """
        admin_control(req)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        # Check if report exists
        cursor.execute(" SELECT id "
                       " FROM tbl_reports "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        # Set immediate run flag to true
        update_row = (" UPDATE tbl_reports "
                      " SET is_run_immediately = 1 "
                      " WHERE id = %s ")
        cursor.execute(update_row, (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class AdvancedReportExport:
    """
    Advanced Report Export Resource

    This class handles exporting advanced report configurations.
    It provides functionality to retrieve report data in a format
    suitable for backup or transfer purposes.
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Report ID parameter
        """
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    def on_get(req, resp, id_):
        """
        Handle GET requests to export a specific advanced report configuration

        Retrieves a single advanced report with all its metadata for export purposes.
        Returns the same data as the regular GET endpoint but is specifically
        designed for export/backup functionality.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Report ID to export
        """
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        # Query to retrieve specific report by ID for export
        query = (" SELECT id, name, uuid, "
                 "        expression, "
                 "        is_enabled, "
                 "        last_run_datetime_utc, "
                 "        next_run_datetime_utc, "
                 "        is_run_immediately "
                 " FROM tbl_reports "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        cursor.close()
        cnx.close()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        # Calculate timezone offset for datetime conversion
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # Convert last run datetime from UTC to local timezone
        if isinstance(row[5], datetime):
            last_run_datetime_local = row[5].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            last_run_datetime = last_run_datetime_local.isoformat()[0:19]
        else:
            last_run_datetime = None

        # Convert next run datetime from UTC to local timezone
        if isinstance(row[6], datetime):
            next_run_datetime_local = row[6].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            next_run_datetime = next_run_datetime_local.isoformat()[0:19]
        else:
            next_run_datetime = None

        # Build export result object
        result = {"id": row[0], "name": row[1], "uuid": row[2],
                  "expression": row[3],
                  "is_enabled": bool(row[4]),
                  "last_run_datetime": last_run_datetime,
                  "next_run_datetime": next_run_datetime,
                  "is_run_immediately": bool(row[7]),
                  }
        resp.text = json.dumps(result)


class AdvancedReportImport:
    """
    Advanced Report Import Resource

    This class handles importing advanced report configurations.
    It provides functionality to create new reports from exported
    configuration data or restore reports from backup.
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
        """
        _ = req
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """
        Handle POST requests to import an advanced report configuration

        Creates a new advanced report from imported configuration data.
        Validates input data including name, expression (JSON), enabled status,
        next run datetime, and immediate run flag.

        Args:
            req: Falcon request object containing import data
            resp: Falcon response object
        """
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except UnicodeDecodeError as ex:
            print("Failed to decode request")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_ENCODING')
        except Exception as ex:
            print("Unexpected error reading request stream")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)

        # Validate report name
        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCEDREPORT_NAME')
        name = str.strip(new_values['name'])

        # Validate expression (must be valid JSON)
        if 'expression' not in new_values.keys() or \
                not isinstance(new_values['expression'], str) or \
                len(str.strip(new_values['expression'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION')
        expression = str.strip(new_values['expression'])

        # Validate expression is valid JSON
        try:
            json.loads(expression)
        except json.JSONDecodeError as ex:
            print("Failed to parse JSON")
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_JSON_FORMAT')
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description=str(ex))

        # Validate enabled status
        if 'is_enabled' not in new_values.keys() or \
                not isinstance(new_values['is_enabled'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ENABLED')
        is_enabled = new_values['is_enabled']

        # Process next run datetime (optional field)
        next_run_datetime_utc = None
        if 'next_run_datetime' in new_values.keys() and \
                isinstance(new_values['next_run_datetime'], str) and \
                len(str.strip(new_values['next_run_datetime'])) > 0:

            try:
                next_run_datetime_local = datetime.strptime(new_values['next_run_datetime'],
                                                            '%Y-%m-%dT%H:%M:%S')
            except KeyError as ex:         
                print("Failed to Key request") 
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR', description=str(ex))
            except TypeError as ex:
                print("Failed to Type request")
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.ERROR', description=str(ex))
            except Exception as ex:
                print(str(ex))
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_NEXT_RUN_DATETIME')

            # Convert local datetime to UTC for storage
            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            next_run_datetime_utc = \
                next_run_datetime_local.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)

        # Validate immediate run flag
        if 'is_run_immediately' not in new_values.keys() or \
                not isinstance(new_values['is_run_immediately'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_RUN_IMMEDIATELY')
        is_run_immediately = new_values['is_run_immediately']

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        # Check if report name already exists
        cursor.execute(" SELECT name "
                       " FROM tbl_reports "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ADVANCED_REPORT_NAME_IS_ALREADY_IN_USE')

        # Insert imported report into database
        add_row = (" INSERT INTO tbl_reports "
                   "             (name, uuid, expression, is_enabled, next_run_datetime_utc, is_run_immediately) "
                   " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_row, (name,
                                 str(uuid.uuid4()),
                                 expression,
                                 is_enabled,
                                 next_run_datetime_utc,
                                 is_run_immediately))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/advancedreports/' + str(new_id)


class AdvancedReportClone:
    """
    Advanced Report Clone Resource

    This class handles cloning of existing advanced reports.
    It creates a copy of an existing report with a new name
    and timestamp suffix to avoid naming conflicts.
    """

    def __init__(self):
        pass

    @staticmethod
    def on_options(req, resp, id_):
        """
        Handle OPTIONS request for CORS preflight

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Report ID parameter
        """
        _ = req
        resp.status = falcon.HTTP_200
        _ = id_

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        """
        Handle POST requests to clone an existing advanced report

        Creates a copy of the specified advanced report with a new name
        that includes a timestamp suffix to ensure uniqueness.
        The cloned report inherits all configuration from the original
        except for the name and UUID.

        Args:
            req: Falcon request object
            resp: Falcon response object
            id_: Report ID to clone
        """
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        # Query to retrieve the report to clone
        query = (" SELECT id, name, uuid, "
                 "        expression, "
                 "        is_enabled, "
                 "        last_run_datetime_utc, "
                 "        next_run_datetime_utc, "
                 "        is_run_immediately "
                 " FROM tbl_reports "
                 " WHERE id = %s ")
        cursor.execute(query, (id_,))
        row = cursor.fetchone()
        if row is None:
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        # Calculate timezone offset for datetime conversion
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # Convert last run datetime from UTC to local timezone
        if isinstance(row[5], datetime):
            last_run_datetime_local = row[5].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            last_run_datetime = last_run_datetime_local.isoformat()[0:19]
        else:
            last_run_datetime = None

        # Convert next run datetime from UTC to local timezone
        if isinstance(row[6], datetime):
            next_run_datetime_local = row[6].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            next_run_datetime = next_run_datetime_local.isoformat()[0:19]
        else:
            next_run_datetime = None

        # Build result object for cloning
        result = {"id": row[0], "name": row[1], "uuid": row[2],
                  "expression": row[3],
                  "is_enabled": bool(row[4]),
                  "last_run_datetime": last_run_datetime,
                  "next_run_datetime": next_run_datetime,
                  "is_run_immediately": bool(row[7]),
                  }

        # Calculate timezone offset for new name generation
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        # Generate new name with timestamp suffix
        new_name = (str.strip(result['name']) +
                    (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))

        # Insert cloned report into database
        add_row = (" INSERT INTO tbl_reports "
                   "             (name, uuid, expression, is_enabled, next_run_datetime_utc, is_run_immediately) "
                   " VALUES (%s, %s, %s, %s, %s, %s) ")
        cursor.execute(add_row, (new_name,
                                 str(uuid.uuid4()),
                                 result['expression'],
                                 result['is_enabled'],
                                 result['next_run_datetime'],
                                 result['is_run_immediately']))
        new_id = cursor.lastrowid
        cnx.commit()
        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_201
        resp.location = '/advancedreports/' + str(new_id)
