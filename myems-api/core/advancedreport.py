import uuid
from datetime import datetime, timezone, timedelta
import falcon
import mysql.connector
import simplejson as json
from core.useractivity import user_logger, admin_control
import config


class AdvancedReportCollection:
    def __init__(self):
        """Initializes AdvancedReportCollection"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp):
        """Handles GET requests"""
        admin_control(req)
        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

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

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        result = list()
        if rows is not None and len(rows) > 0:
            for row in rows:
                if isinstance(row[5], datetime):
                    last_run_datetime_local = row[5].replace(tzinfo=timezone.utc) + \
                                              timedelta(minutes=timezone_offset)
                    last_run_datetime = last_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                else:
                    last_run_datetime = None

                if isinstance(row[6], datetime):
                    next_run_datetime_local = row[6].replace(tzinfo=timezone.utc) + \
                                              timedelta(minutes=timezone_offset)
                    next_run_datetime = next_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
                else:
                    next_run_datetime = None

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
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCEDREPORT_NAME')
        name = str.strip(new_values['data']['name'])

        if 'expression' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['expression'], str) or \
                len(str.strip(new_values['data']['expression'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION')
        expression = str.strip(new_values['data']['expression'])
        # validate expression in json
        try:
            json.loads(expression)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description=str(ex))

        if 'is_enabled' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_enabled'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ENABLED')
        is_enabled = new_values['data']['is_enabled']

        next_run_datetime_utc = None
        if 'next_run_datetime' in new_values['data'].keys() and \
                isinstance(new_values['data']['next_run_datetime'], str) and \
                len(str.strip(new_values['data']['next_run_datetime'])) > 0:

            try:
                next_run_datetime_local = datetime.strptime(new_values['data']['next_run_datetime'],
                                                            '%Y-%m-%dT%H:%M:%S')
            except Exception:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_NEXT_RUN_DATETIME')

            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            next_run_datetime_utc = \
                next_run_datetime_local.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)

        if 'is_run_immediately' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_run_immediately'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_RUN_IMMEDIATELY')
        is_run_immediately = new_values['data']['is_run_immediately']

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_reports "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ADVANCED_REPORT_NAME_IS_ALREADY_IN_USE')

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
    def __init__(self):
        """Initializes ReportItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

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
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if isinstance(row[5], datetime):
            last_run_datetime_local = row[5].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            last_run_datetime = last_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            last_run_datetime = None

        if isinstance(row[6], datetime):
            next_run_datetime_local = row[6].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            next_run_datetime = next_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            next_run_datetime = None

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
        """Handles DELETE requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_reports "
                       " WHERE id = %s ",
                       (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        cursor.execute(" DELETE FROM tbl_reports WHERE id = %s ", (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_204

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        new_values = json.loads(raw_json)
        if 'name' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['name'], str) or \
                len(str.strip(new_values['data']['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCEDREPORT_NAME')
        name = str.strip(new_values['data']['name'])

        if 'expression' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['expression'], str) or \
                len(str.strip(new_values['data']['expression'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION')
        expression = str.strip(new_values['data']['expression'])
        # validate expression in json
        try:
            json.loads(expression)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description=str(ex))

        if 'is_enabled' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_enabled'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ENABLED')
        is_enabled = new_values['data']['is_enabled']

        if 'next_run_datetime' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['next_run_datetime'], str) or \
                len(str.strip(new_values['data']['next_run_datetime'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NEXT_RUN_DATETIME')

        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        try:
            next_run_datetime_local = datetime.strptime(new_values['data']['next_run_datetime'], '%Y-%m-%dT%H:%M:%S')
        except Exception:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_NEXT_RUN_DATETIME')

        next_run_datetime_utc = next_run_datetime_local.replace(tzinfo=timezone.utc) \
            - timedelta(minutes=timezone_offset)

        if 'is_run_immediately' not in new_values['data'].keys() or \
                not isinstance(new_values['data']['is_run_immediately'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_RUN_IMMEDIATELY')
        is_run_immediately = new_values['data']['is_run_immediately']

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_reports "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        cursor.execute(" SELECT name "
                       " FROM tbl_reports "
                       " WHERE name = %s AND id != %s ", (name, id_))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ADVANCED_REPORT_NAME_IS_ALREADY_IN_USE')

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
    def __init__(self):
        """Initializes ReportItem"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_put(req, resp, id_):
        """Handles PUT requests"""
        admin_control(req)

        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT id "
                       " FROM tbl_reports "
                       " WHERE id = %s ", (id_,))
        if cursor.fetchone() is None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                   description='API.ADVANCED_REPORT_NOT_FOUND')

        update_row = (" UPDATE tbl_reports "
                      " SET is_run_immediately = 1 "
                      " WHERE id = %s ")
        cursor.execute(update_row, (id_,))
        cnx.commit()

        cursor.close()
        cnx.close()

        resp.status = falcon.HTTP_200


class AdvancedReportExport:
    def __init__(self):
        """Initializes ReportExport"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    def on_get(req, resp, id_):
        """Handles GET requests"""
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

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
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if isinstance(row[5], datetime):
            last_run_datetime_local = row[5].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            last_run_datetime = last_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            last_run_datetime = None

        if isinstance(row[6], datetime):
            next_run_datetime_local = row[6].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            next_run_datetime = next_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            next_run_datetime = None

        result = {"id": row[0], "name": row[1], "uuid": row[2],
                  "expression": row[3],
                  "is_enabled": bool(row[4]),
                  "last_run_datetime": last_run_datetime,
                  "next_run_datetime": next_run_datetime,
                  "is_run_immediately": bool(row[7]),
                  }
        resp.text = json.dumps(result)


class AdvancedReportImport:
    def __init__(self):
        """Initializes AdvancedReportImport"""
        pass

    @staticmethod
    def on_options(req, resp):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp):
        """Handles POST requests"""
        admin_control(req)
        try:
            raw_json = req.stream.read().decode('utf-8')
        except Exception:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.FAILED_TO_READ_REQUEST_STREAM')

        new_values = json.loads(raw_json)
        if 'name' not in new_values.keys() or \
                not isinstance(new_values['name'], str) or \
                len(str.strip(new_values['name'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCEDREPORT_NAME')
        name = str.strip(new_values['name'])

        if 'expression' not in new_values.keys() or \
                not isinstance(new_values['expression'], str) or \
                len(str.strip(new_values['expression'])) == 0:
            raise falcon.HTTPError(status=falcon.HTTP_400,
                                   title='API.BAD_REQUEST',
                                   description='API.INVALID_EXPRESSION')
        expression = str.strip(new_values['expression'])
        # validate expression in json
        try:
            json.loads(expression)
        except Exception as ex:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST', description=str(ex))

        if 'is_enabled' not in new_values.keys() or \
                not isinstance(new_values['is_enabled'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_ENABLED')
        is_enabled = new_values['is_enabled']

        next_run_datetime_utc = None
        if 'next_run_datetime' in new_values.keys() and \
                isinstance(new_values['next_run_datetime'], str) and \
                len(str.strip(new_values['next_run_datetime'])) > 0:

            try:
                next_run_datetime_local = datetime.strptime(new_values['next_run_datetime'],
                                                            '%Y-%m-%dT%H:%M:%S')
            except Exception as ex:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_NEXT_RUN_DATETIME')

            timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
            if config.utc_offset[0] == '-':
                timezone_offset = -timezone_offset
            next_run_datetime_utc = \
                next_run_datetime_local.replace(tzinfo=timezone.utc) - timedelta(minutes=timezone_offset)

        if 'is_run_immediately' not in new_values.keys() or \
                not isinstance(new_values['is_run_immediately'], bool):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_IS_RUN_IMMEDIATELY')
        is_run_immediately = new_values['is_run_immediately']

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

        cursor.execute(" SELECT name "
                       " FROM tbl_reports "
                       " WHERE name = %s ", (name,))
        if cursor.fetchone() is not None:
            cursor.close()
            cnx.close()
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.ADVANCED_REPORT_NAME_IS_ALREADY_IN_USE')

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
    def __init__(self):
        """Initializes ReportClone"""
        pass

    @staticmethod
    def on_options(req, resp, id_):
        resp.status = falcon.HTTP_200

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        admin_control(req)
        if not id_.isdigit() or int(id_) <= 0:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_ADVANCED_REPORT_ID')

        cnx = mysql.connector.connect(**config.myems_reporting_db)
        cursor = cnx.cursor()

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
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset

        if isinstance(row[5], datetime):
            last_run_datetime_local = row[5].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            last_run_datetime = last_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            last_run_datetime = None

        if isinstance(row[6], datetime):
            next_run_datetime_local = row[6].replace(tzinfo=timezone.utc) + \
                                      timedelta(minutes=timezone_offset)
            next_run_datetime = next_run_datetime_local.strftime('%Y-%m-%dT%H:%M:%S')
        else:
            next_run_datetime = None

        result = {"id": row[0], "name": row[1], "uuid": row[2],
                  "expression": row[3],
                  "is_enabled": bool(row[4]),
                  "last_run_datetime": last_run_datetime,
                  "next_run_datetime": next_run_datetime,
                  "is_run_immediately": bool(row[7]),
                  }
        timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
        if config.utc_offset[0] == '-':
            timezone_offset = -timezone_offset
        new_name = (str.strip(result['name']) +
                    (datetime.utcnow() + timedelta(minutes=timezone_offset)).isoformat(sep='-', timespec='seconds'))
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
        