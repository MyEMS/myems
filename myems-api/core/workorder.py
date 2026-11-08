from datetime import datetime, timedelta, timezone
import falcon
import mysql.connector
from mysql.connector import IntegrityError
import simplejson as json
from core.useractivity import user_logger, access_control, api_key_control
import config


CATEGORIES = ('repair', 'inspection', 'installation')
PRIORITIES = ('critical', 'high', 'medium', 'low')
STATUSES = ('new', 'assigned', 'in_progress', 'pending_acceptance', 'done', 'cancelled')
OBJECT_TYPES = (
    'SYSTEM', 'SPACE', 'METER', 'TENANT', 'STORE', 'SHOPFLOOR', 'EQUIPMENT',
    'COMBINEDEQUIPMENT', 'MICROGRID', 'ENERGYSTORAGECONTAINER', 'PHOTOVOLTAICPOWERSTATION'
)
# Daily energy-management loop: dispatch, handle, accept.
# assigned and in_progress are both "to handle". Handling finishes in one step.
# The assignee records the result and cannot accept their own work.
# reassign keeps the current status and only replaces the assignee.
ACTIONS = {
    'assign': {'from': ('new',), 'to': 'assigned'},
    'reassign': {'from': ('assigned', 'in_progress'), 'to': None},
    'submit': {'from': ('assigned', 'in_progress'), 'to': 'pending_acceptance'},
    'accept': {'from': ('pending_acceptance',), 'to': 'done'},
    'reject': {'from': ('pending_acceptance',), 'to': 'assigned'},
    'return': {'from': ('assigned',), 'to': 'new'},
    'cancel': {'from': ('new', 'assigned'), 'to': 'cancelled'},
}
HANDLING_STATUSES = ('assigned', 'in_progress')


def _is_api_key_request(req):
    return ('API-KEY' in req.headers and
            isinstance(req.headers['API-KEY'], str) and
            len(str.strip(req.headers['API-KEY'])) > 0)


def _authenticate(req):
    if _is_api_key_request(req):
        api_key_control(req)
    else:
        access_control(req)


def _timezone_offset_minutes():
    timezone_offset = int(config.utc_offset[1:3]) * 60 + int(config.utc_offset[4:6])
    if config.utc_offset[0] == '-':
        timezone_offset = -timezone_offset
    return timezone_offset


def _utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _parse_local_datetime(value, error_description):
    if value is None:
        return None
    if not isinstance(value, str) or len(str.strip(value)) == 0:
        return None
    try:
        local_datetime = datetime.strptime(str.strip(value), '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                               description=error_description)
    return local_datetime - timedelta(minutes=_timezone_offset_minutes())


def _format_local_datetime(utc_datetime):
    if utc_datetime is None:
        return None
    local_datetime = utc_datetime + timedelta(minutes=_timezone_offset_minutes())
    return local_datetime.strftime('%Y-%m-%dT%H:%M:%S')


def _read_data(req):
    try:
        raw_json = req.stream.read().decode('utf-8')
    except UnicodeDecodeError:
        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                               description='API.INVALID_ENCODING')
    except Exception:
        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                               description='API.FAILED_TO_READ_REQUEST_STREAM')
    try:
        payload = json.loads(raw_json)
    except Exception:
        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                               description='API.INVALID_WORK_ORDER_DATA')
    if not isinstance(payload, dict) or not isinstance(payload.get('data'), dict):
        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                               description='API.INVALID_WORK_ORDER_DATA')
    return payload['data']


def _positive_int(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, int) and value > 0:
        return value
    if isinstance(value, str) and value.isdigit() and int(value) > 0:
        return int(value)
    return None


def _get_actor(req):
    """Return the signed-in user. API-key calls act as user 1."""
    if _is_api_key_request(req):
        return {'id': 1, 'is_admin': True, 'is_read_only': False}

    user_uuid = str.strip(req.headers.get('USER-UUID', ''))
    cnx = None
    cursor = None
    try:
        cnx = mysql.connector.connect(**config.myems_user_db)
        try:
            cursor = cnx.cursor()
            cursor.execute(" SELECT id, is_admin, is_read_only "
                           " FROM tbl_users "
                           " WHERE uuid = %s ",
                           (user_uuid,))
            row = cursor.fetchone()
            if row is None:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_USER_PLEASE_RE_LOGIN')
            return {'id': row[0], 'is_admin': bool(row[1]), 'is_read_only': bool(row[2])}
        finally:
            if cursor:
                cursor.close()
    finally:
        if cnx:
            cnx.close()


def _require_writer(req):
    actor = _get_actor(req)
    if actor['is_read_only']:
        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                               description='API.INVALID_PRIVILEGE')
    return actor


def _is_manager(actor):
    return actor['is_admin'] and not actor['is_read_only']


def _can_view(actor, row):
    if _is_manager(actor):
        return True
    return row['creator_user_id'] == actor['id'] or row['assignee_user_id'] == actor['id']


def _allowed_actions(actor, row):
    """Actions this user may take on this work order in its current status."""
    if actor['is_read_only']:
        return []
    status = row['status']
    is_creator = row['creator_user_id'] == actor['id']
    is_assignee = row['assignee_user_id'] is not None and row['assignee_user_id'] == actor['id']
    is_admin = _is_manager(actor)
    actions = []
    if status == 'new' and (is_creator or is_admin):
        actions.extend(['assign', 'cancel'])
    if status in HANDLING_STATUSES:
        if is_assignee or is_admin:
            actions.append('submit')
        if status == 'assigned' and (is_assignee or is_admin):
            actions.append('return')
        if is_creator or is_admin:
            actions.append('reassign')
        if status == 'assigned' and (is_creator or is_admin):
            actions.append('cancel')
    # The assignee cannot review their own work, including an admin who is the assignee.
    if status == 'pending_acceptance' and not is_assignee and (is_admin or is_creator):
        actions.extend(['accept', 'reject'])
    return actions


def _deny_unless_visible(actor, row):
    if not _can_view(actor, row):
        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                               description='API.INVALID_PRIVILEGE')


def _connect_system():
    return mysql.connector.connect(**config.myems_system_db)


def _work_order_dict(row):
    return {
        "id": row['id'],
        "number": row['number'],
        "category": row['category'],
        "title": row['title'],
        "description": row['description'],
        "priority": row['priority'],
        "status": row['status'],
        "belong_to_object_type": row['belong_to_object_type'],
        "belong_to_object_id": row['belong_to_object_id'],
        "source_type": row['source_type'],
        "source_id": row['source_id'],
        "creator_user_id": row['creator_user_id'],
        "assignee_user_id": row['assignee_user_id'],
        "assignee_name": row.get('assignee_name'),
        "scheduled_start_datetime": _format_local_datetime(row['scheduled_start_datetime_utc']),
        "due_datetime": _format_local_datetime(row['due_datetime_utc']),
        "started_datetime": _format_local_datetime(row['started_datetime_utc']),
        "finished_datetime": _format_local_datetime(row['finished_datetime_utc']),
        "created_datetime": _format_local_datetime(row['created_datetime_utc']),
        "update_datetime": _format_local_datetime(row['update_datetime_utc']),
    }


def _log_dict(row):
    return {
        "id": row['id'],
        "user_id": row['user_id'],
        "action": row['action'],
        "from_status": row['from_status'],
        "to_status": row['to_status'],
        "comment": row['comment'],
        "created_datetime": _format_local_datetime(row['created_datetime_utc']),
    }


_WORK_ORDER_SELECT = (
    " SELECT w.id, w.number, w.category, w.title, w.description, w.priority, w.status, "
    "        w.belong_to_object_type, w.belong_to_object_id, w.source_type, w.source_id, "
    "        w.creator_user_id, w.assignee_user_id, "
    "        w.scheduled_start_datetime_utc, w.due_datetime_utc, w.started_datetime_utc, "
    "        w.finished_datetime_utc, w.created_datetime_utc, w.update_datetime_utc "
    " FROM tbl_work_orders w "
)


def _fetch_work_order(cursor, work_order_id):
    cursor.execute(_WORK_ORDER_SELECT + " WHERE w.id = %s ", (work_order_id,))
    return cursor.fetchone()


def _fetch_logs(cursor, work_order_id):
    cursor.execute(
        " SELECT id, user_id, action, from_status, to_status, comment, created_datetime_utc "
        " FROM tbl_work_order_logs "
        " WHERE work_order_id = %s "
        " ORDER BY id ",
        (work_order_id,))
    return [_log_dict(row) for row in cursor.fetchall()]


def _insert_log(cursor, work_order_id, user_id, action, from_status, to_status, comment, utc_now):
    cursor.execute(
        " INSERT INTO tbl_work_order_logs "
        " (work_order_id, user_id, action, from_status, to_status, comment, created_datetime_utc) "
        " VALUES (%s, %s, %s, %s, %s, %s, %s) ",
        (work_order_id, user_id, action, from_status, to_status, comment, utc_now))


def _user_labels(user_ids):
    """Map user id to the name shown in the work order UI."""
    ids = []
    for user_id in user_ids:
        if user_id and user_id not in ids:
            ids.append(user_id)
    if not ids:
        return {}

    cnx = None
    cursor = None
    try:
        cnx = mysql.connector.connect(**config.myems_user_db)
        try:
            cursor = cnx.cursor()
            placeholders = ','.join(['%s'] * len(ids))
            cursor.execute(
                " SELECT id, display_name, name "
                " FROM tbl_users "
                " WHERE id IN (" + placeholders + ") ",
                tuple(ids))
            labels = {}
            for row in cursor.fetchall():
                labels[row[0]] = row[1] if row[1] else row[2]
            return labels
        finally:
            if cursor:
                cursor.close()
    finally:
        if cnx:
            cnx.close()


def _assignable_user(user_id):
    """True when the user exists and is allowed to receive a work order."""
    cnx = None
    cursor = None
    try:
        cnx = mysql.connector.connect(**config.myems_user_db)
        try:
            cursor = cnx.cursor()
            cursor.execute(
                " SELECT id FROM tbl_users WHERE id = %s AND is_read_only = 0 ",
                (user_id,))
            return cursor.fetchone() is not None
        finally:
            if cursor:
                cursor.close()
    finally:
        if cnx:
            cnx.close()


def _attach_people(item, row, labels, actor):
    item['assignee_name'] = labels.get(row['assignee_user_id'])
    item['creator_name'] = labels.get(row['creator_user_id'])
    item['current_user_id'] = actor['id']
    item['allowed_actions'] = _allowed_actions(actor, row)
    return item


def _present_work_order(row, actor, logs=None):
    result = _work_order_dict(row)
    labels = _user_labels([row['assignee_user_id'], row['creator_user_id']])
    _attach_people(result, row, labels, actor)
    if logs is not None:
        result['logs'] = logs
    return result


def _present_work_orders(rows, actor):
    labels = _user_labels(
        [row['assignee_user_id'] for row in rows] + [row['creator_user_id'] for row in rows])
    return [_attach_people(_work_order_dict(row), row, labels, actor) for row in rows]


def _next_number(cursor, utc_now):
    local_now = utc_now + timedelta(minutes=_timezone_offset_minutes())
    prefix = 'WO' + local_now.strftime('%Y%m%d')
    cursor.execute(
        " SELECT number FROM tbl_work_orders "
        " WHERE number LIKE %s "
        " ORDER BY number DESC LIMIT 1 FOR UPDATE ",
        (prefix + '%',))
    row = cursor.fetchone()
    sequence = 1 if row is None else int(row['number'][-4:]) + 1
    if sequence > 9999:
        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                               description='API.FAILED_TO_SAVE_WORK_ORDER')
    return prefix + f'{sequence:04d}'


def _optional_text(data, key):
    value = data.get(key)
    if value is None:
        return None
    if not isinstance(value, str):
        return None
    value = str.strip(value)
    return value if len(value) > 0 else None


def _parse_object(data):
    object_type = data.get('belong_to_object_type')
    object_id = data.get('belong_to_object_id')
    if object_type is None and object_id is None:
        return None, None
    if not isinstance(object_type, str):
        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                               description='API.INVALID_WORK_ORDER_OBJECT')
    object_type = str.strip(object_type).upper()
    parsed_id = _positive_int(object_id)
    if object_type not in OBJECT_TYPES or parsed_id is None:
        raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                               description='API.INVALID_WORK_ORDER_OBJECT')
    return object_type, parsed_id


class WorkOrderCollection:
    """List and create work orders."""

    @staticmethod
    def on_get(req, resp):
        _authenticate(req)
        actor = _get_actor(req)
        category = req.params.get('category')
        status = req.params.get('status', 'all')
        priority = req.params.get('priority', 'all')
        start_datetime_local = req.params.get('startdatetime')
        end_datetime_local = req.params.get('enddatetime')

        if category is None or str.lower(str.strip(category)) not in CATEGORIES:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORK_ORDER_CATEGORY')
        category = str.lower(str.strip(category))

        status = str.lower(str.strip(status)) if status is not None else 'all'
        if status not in STATUSES and status not in ('all', 'handling'):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORK_ORDER_STATUS')

        priority = str.lower(str.strip(priority)) if priority is not None else 'all'
        if priority not in PRIORITIES and priority != 'all':
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORK_ORDER_PRIORITY')

        start_datetime_utc = _parse_local_datetime(start_datetime_local, 'API.INVALID_START_DATETIME_FORMAT')
        end_datetime_utc = _parse_local_datetime(end_datetime_local, 'API.INVALID_END_DATETIME_FORMAT')
        if start_datetime_utc is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_START_DATETIME_FORMAT')
        if end_datetime_utc is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_END_DATETIME_FORMAT')
        if start_datetime_utc >= end_datetime_utc:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.START_DATETIME_MUST_BE_EARLIER_THAN_END_DATETIME')

        where = " WHERE w.category = %s AND w.created_datetime_utc >= %s AND w.created_datetime_utc < %s "
        params = [category, start_datetime_utc, end_datetime_utc]
        if not _is_manager(actor):
            where += " AND (w.creator_user_id = %s OR w.assignee_user_id = %s) "
            params.extend([actor['id'], actor['id']])
        if priority != 'all':
            where += " AND w.priority = %s "
            params.append(priority)

        summary_params = list(params)
        if status == 'handling':
            where_items = where + " AND w.status IN ('assigned', 'in_progress') "
            item_params = params
        elif status != 'all':
            where_items = where + " AND w.status = %s "
            item_params = params + [status]
        else:
            where_items = where
            item_params = params

        cnx = None
        cursor = None
        try:
            cnx = _connect_system()
            try:
                cursor = cnx.cursor(dictionary=True)
                cursor.execute(
                    " SELECT w.status, COUNT(*) AS status_count "
                    " FROM tbl_work_orders w " + where +
                    " GROUP BY w.status ",
                    summary_params)
                summary_rows = cursor.fetchall()
                cursor.execute(
                    _WORK_ORDER_SELECT + where_items + " ORDER BY w.id DESC ",
                    item_params)
                item_rows = cursor.fetchall()
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        statistics = {
            "total": 0, "new": 0, "handling": 0, "pending_acceptance": 0, "in_progress": 0, "done": 0
        }
        for row in summary_rows:
            count = int(row['status_count'])
            statistics['total'] += count
            if row['status'] == 'new':
                statistics['new'] += count
            elif row['status'] in HANDLING_STATUSES:
                statistics['handling'] += count
                statistics['in_progress'] += count
            elif row['status'] == 'pending_acceptance':
                statistics['pending_acceptance'] += count
                statistics['in_progress'] += count
            elif row['status'] == 'done':
                statistics['done'] += count

        resp.text = json.dumps({
            "can_create": not actor['is_read_only'],
            "statistics": statistics,
            "items": _present_work_orders(item_rows, actor)
        })

    @staticmethod
    @user_logger
    def on_post(req, resp):
        _authenticate(req)
        actor = _require_writer(req)
        data = _read_data(req)

        category = data.get('category')
        if not isinstance(category, str) or str.lower(str.strip(category)) not in CATEGORIES:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORK_ORDER_CATEGORY')
        category = str.lower(str.strip(category))

        title = data.get('title')
        if not isinstance(title, str) or len(str.strip(title)) == 0 or len(str.strip(title)) > 255:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORK_ORDER_TITLE')
        title = str.strip(title)

        description = data.get('description')
        if description is None:
            description = ''
        elif not isinstance(description, str):
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORK_ORDER_DATA')
        else:
            description = str.strip(description)

        priority = data.get('priority', 'medium')
        if not isinstance(priority, str) or str.lower(str.strip(priority)) not in PRIORITIES:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORK_ORDER_PRIORITY')
        priority = str.lower(str.strip(priority))

        assignee_user_id = None
        if data.get('assignee_user_id') is not None:
            assignee_user_id = _positive_int(data.get('assignee_user_id'))
            if assignee_user_id is None:
                raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                       description='API.INVALID_WORK_ORDER_ASSIGNEE')

        object_type, object_id = _parse_object(data)
        scheduled_start = _parse_local_datetime(data.get('scheduled_start_datetime'),
                                                'API.INVALID_WORK_ORDER_DATETIME')
        due_datetime = _parse_local_datetime(data.get('due_datetime'), 'API.INVALID_WORK_ORDER_DATETIME')
        comment = _optional_text(data, 'comment')
        utc_now = _utc_now()

        cnx = None
        cursor = None
        work_order_id = None
        try:
            cnx = _connect_system()
            try:
                cursor = cnx.cursor(dictionary=True)
                if assignee_user_id is not None and not _assignable_user(assignee_user_id):
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_WORK_ORDER_ASSIGNEE')
                for _attempt in range(3):
                    try:
                        number = _next_number(cursor, utc_now)
                        cursor.execute(
                            " INSERT INTO tbl_work_orders "
                            " (number, category, title, description, priority, status, "
                            "  belong_to_object_type, belong_to_object_id, source_type, source_id, "
                            "  creator_user_id, assignee_user_id, scheduled_start_datetime_utc, "
                            "  due_datetime_utc, started_datetime_utc, finished_datetime_utc, "
                            "  created_datetime_utc, update_datetime_utc) "
                            " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ",
                            (number, category, title, description, priority, 'new',
                             object_type, object_id, 'manual', None,
                             actor['id'], None, scheduled_start, due_datetime,
                             None, None, utc_now, utc_now))
                        work_order_id = cursor.lastrowid
                        _insert_log(cursor, work_order_id, actor['id'], 'create', None, 'new', comment, utc_now)
                        if assignee_user_id is not None:
                            cursor.execute(
                                " UPDATE tbl_work_orders "
                                " SET status = %s, assignee_user_id = %s, update_datetime_utc = %s "
                                " WHERE id = %s ",
                                ('assigned', assignee_user_id, utc_now, work_order_id))
                            _insert_log(cursor, work_order_id, actor['id'], 'assign', 'new', 'assigned',
                                        None, utc_now)
                        cnx.commit()
                        break
                    except IntegrityError:
                        cnx.rollback()
                        work_order_id = None
                else:
                    raise falcon.HTTPError(status=falcon.HTTP_500, title='API.INTERNAL_SERVER_ERROR',
                                           description='API.FAILED_TO_SAVE_WORK_ORDER')
                created = _fetch_work_order(cursor, work_order_id)
                created_logs = _fetch_logs(cursor, work_order_id)
            finally:
                if cursor:
                    cursor.close()
        except falcon.HTTPError:
            if cnx:
                cnx.rollback()
            raise
        except mysql.connector.Error:
            if cnx:
                cnx.rollback()
            raise falcon.HTTPError(status=falcon.HTTP_500, title='API.INTERNAL_SERVER_ERROR',
                                   description='API.FAILED_TO_SAVE_WORK_ORDER')
        finally:
            if cnx:
                cnx.close()

        result = _present_work_order(created, actor, created_logs)
        resp.status = falcon.HTTP_201
        resp.text = json.dumps(result)


class WorkOrderItem:
    """Read one work order, including its timeline."""

    @staticmethod
    def on_get(req, resp, id_):
        _authenticate(req)
        actor = _get_actor(req)
        work_order_id = _positive_int(id_)
        if work_order_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORK_ORDER_ID')

        cnx = None
        cursor = None
        try:
            cnx = _connect_system()
            try:
                cursor = cnx.cursor(dictionary=True)
                row = _fetch_work_order(cursor, work_order_id)
                if row is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.WORK_ORDER_NOT_FOUND')
                _deny_unless_visible(actor, row)
                logs = _fetch_logs(cursor, work_order_id)
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        resp.text = json.dumps(_present_work_order(row, actor, logs))


class WorkOrderAction:
    """Apply one state transition to a work order."""

    @staticmethod
    @user_logger
    def on_post(req, resp, id_):
        _authenticate(req)
        actor = _require_writer(req)
        work_order_id = _positive_int(id_)
        if work_order_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORK_ORDER_ID')
        data = _read_data(req)
        action = data.get('action')
        if not isinstance(action, str) or str.lower(str.strip(action)) not in ACTIONS:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORK_ORDER_ACTION')
        action = str.lower(str.strip(action))
        comment = _optional_text(data, 'comment')
        assignee_user_id = _positive_int(data.get('assignee_user_id'))
        if action in ('assign', 'reassign') and assignee_user_id is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.INVALID_WORK_ORDER_ASSIGNEE')
        if action == 'submit' and comment is None:
            raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                   description='API.WORK_ORDER_RESULT_REQUIRED')

        utc_now = _utc_now()
        cnx = None
        cursor = None
        try:
            cnx = _connect_system()
            try:
                cursor = cnx.cursor(dictionary=True)
                cursor.execute(_WORK_ORDER_SELECT + " WHERE w.id = %s FOR UPDATE ", (work_order_id,))
                current = cursor.fetchone()
                if current is None:
                    raise falcon.HTTPError(status=falcon.HTTP_404, title='API.NOT_FOUND',
                                           description='API.WORK_ORDER_NOT_FOUND')
                _deny_unless_visible(actor, current)
                rule = ACTIONS[action]
                if current['status'] not in rule['from']:
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_WORK_ORDER_TRANSITION')
                if action not in _allowed_actions(actor, current):
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_PRIVILEGE')
                if action in ('assign', 'reassign') and not _assignable_user(assignee_user_id):
                    raise falcon.HTTPError(status=falcon.HTTP_400, title='API.BAD_REQUEST',
                                           description='API.INVALID_WORK_ORDER_ASSIGNEE')

                next_status = current['status'] if rule['to'] is None else rule['to']
                started = current['started_datetime_utc']
                finished = None
                if action == 'submit' and started is None:
                    started = utc_now
                if action == 'accept':
                    finished = utc_now

                if action == 'assign':
                    cursor.execute(
                        " UPDATE tbl_work_orders "
                        " SET status = %s, assignee_user_id = %s, update_datetime_utc = %s "
                        " WHERE id = %s ",
                        (next_status, assignee_user_id, utc_now, work_order_id))
                elif action == 'reassign':
                    cursor.execute(
                        " UPDATE tbl_work_orders "
                        " SET assignee_user_id = %s, update_datetime_utc = %s "
                        " WHERE id = %s ",
                        (assignee_user_id, utc_now, work_order_id))
                elif action == 'return':
                    cursor.execute(
                        " UPDATE tbl_work_orders "
                        " SET status = %s, assignee_user_id = NULL, update_datetime_utc = %s "
                        " WHERE id = %s ",
                        (next_status, utc_now, work_order_id))
                elif action == 'submit':
                    cursor.execute(
                        " UPDATE tbl_work_orders "
                        " SET status = %s, started_datetime_utc = %s, update_datetime_utc = %s "
                        " WHERE id = %s ",
                        (next_status, started, utc_now, work_order_id))
                elif action == 'accept':
                    cursor.execute(
                        " UPDATE tbl_work_orders "
                        " SET status = %s, finished_datetime_utc = %s, update_datetime_utc = %s "
                        " WHERE id = %s ",
                        (next_status, finished, utc_now, work_order_id))
                else:
                    cursor.execute(
                        " UPDATE tbl_work_orders "
                        " SET status = %s, update_datetime_utc = %s "
                        " WHERE id = %s ",
                        (next_status, utc_now, work_order_id))

                _insert_log(cursor, work_order_id, actor['id'], action, current['status'], next_status,
                            comment, utc_now)
                cnx.commit()
                updated = _fetch_work_order(cursor, work_order_id)
                logs = _fetch_logs(cursor, work_order_id)
                presented = _present_work_order(updated, actor, logs)
            finally:
                if cursor:
                    cursor.close()
        except falcon.HTTPError:
            if cnx:
                cnx.rollback()
            raise
        except mysql.connector.Error:
            if cnx:
                cnx.rollback()
            raise falcon.HTTPError(status=falcon.HTTP_500, title='API.INTERNAL_SERVER_ERROR',
                                   description='API.FAILED_TO_SAVE_WORK_ORDER')
        finally:
            if cnx:
                cnx.close()

        resp.text = json.dumps(presented)


class WorkOrderAssigneeCollection:
    """Users that can be selected as a work order assignee."""

    @staticmethod
    def on_get(req, resp):
        _authenticate(req)
        cnx = None
        cursor = None
        try:
            cnx = mysql.connector.connect(**config.myems_user_db)
            try:
                cursor = cnx.cursor()
                cursor.execute(
                    " SELECT id, name, display_name "
                    " FROM tbl_users "
                    " WHERE is_read_only = 0 "
                    " ORDER BY display_name, name ")
                rows = cursor.fetchall()
            finally:
                if cursor:
                    cursor.close()
        finally:
            if cnx:
                cnx.close()

        result = []
        for row in rows:
            result.append({
                "id": row[0],
                "name": row[1],
                "display_name": row[2] if row[2] else row[1]
            })
        resp.text = json.dumps(result)
