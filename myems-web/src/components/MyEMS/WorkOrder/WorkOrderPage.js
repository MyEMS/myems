import React, { Fragment, useEffect, useState } from 'react';
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
import { toast } from 'react-toastify';
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  CustomInput,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CountUp from 'react-countup';
import moment from 'moment';
import { endOfDay } from 'date-fns';
import { DatePicker } from 'rsuite';
import { withTranslation } from 'react-i18next';
import CardSummary from '../common/CardSummary';
import FalconCardHeader from '../../common/FalconCardHeader';
import ButtonIcon from '../../common/ButtonIcon';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import withRedirect from '../../../hoc/withRedirect';
import { APIBaseURL, settings } from '../../../config';
import { createCookie, getCookieValue, getPaginationArray, handleAPIError } from '../../../helpers/utils';

const STATUS_COLOR = {
  new: 'primary',
  assigned: 'warning',
  in_progress: 'warning',
  pending_acceptance: 'secondary',
  done: 'success',
  cancelled: 'secondary'
};

const PRIORITY_COLOR = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'secondary'
};

const OBJECT_TYPES = [
  { value: 'EQUIPMENT', labelKey: 'Work Order Object Equipment' },
  { value: 'COMBINEDEQUIPMENT', labelKey: 'Work Order Object Combined Equipment' },
  { value: 'SPACE', labelKey: 'Work Order Object Space' },
  { value: 'METER', labelKey: 'Work Order Object Meter' },
  { value: 'TENANT', labelKey: 'Work Order Object Tenant' },
  { value: 'STORE', labelKey: 'Work Order Object Store' },
  { value: 'SHOPFLOOR', labelKey: 'Work Order Object Shopfloor' },
  { value: 'MICROGRID', labelKey: 'Work Order Object Microgrid' },
  { value: 'ENERGYSTORAGECONTAINER', labelKey: 'Work Order Object Energy Storage Container' },
  { value: 'PHOTOVOLTAICPOWERSTATION', labelKey: 'Work Order Object Photovoltaic Power Station' },
  { value: 'SYSTEM', labelKey: 'Work Order Object System' }
];

const emptyStatistics = {
  total: 0, new: 0, handling: 0, pending_acceptance: 0, in_progress: 0, done: 0
};

const FINISH_LABEL = {
  repair: 'Work Order Finish Repair',
  inspection: 'Work Order Finish Inspection',
  installation: 'Work Order Finish Installation'
};

const RESULT_LABEL = {
  repair: 'Work Order Repair Result',
  inspection: 'Work Order Inspection Result',
  installation: 'Work Order Installation Result'
};

const authHeaders = () => ({
  'Content-type': 'application/json',
  'User-UUID': getCookieValue('user_uuid'),
  Token: getCookieValue('token')
});

const currentUserIsAssignee = workOrder => {
  if (!workOrder || workOrder.assignee_user_id == null) {
    return false;
  }
  if (workOrder.current_user_id != null) {
    return Number(workOrder.assignee_user_id) === Number(workOrder.current_user_id);
  }
  const assigneeName = workOrder.assignee_name;
  if (!assigneeName) {
    return false;
  }
  const displayName = getCookieValue('user_display_name');
  const userName = getCookieValue('user_name');
  return assigneeName === displayName || assigneeName === userName;
};

const defaultDueDatetime = () => moment().add(7, 'days').toDate();

const WorkOrderPage = ({ category, titleKey, setRedirect, setRedirectUrl, t }) => {
  const currentMoment = moment();
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [reportingPeriodDateRange, setReportingPeriodDateRange] = useState([
    currentMoment.clone().startOf('month').toDate(),
    currentMoment.toDate()
  ]);
  const [workOrders, setWorkOrders] = useState([]);
  const [statistics, setStatistics] = useState(emptyStatistics);
  const [canCreateWorkOrder, setCanCreateWorkOrder] = useState(false);
  const [users, setUsers] = useState([]);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [actionComment, setActionComment] = useState('');
  const [assignUserId, setAssignUserId] = useState('');
  const [actionDisabled, setActionDisabled] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigneeUserId: '',
    dueDatetime: defaultDueDatetime(),
    objectType: '',
    objectId: ''
  });

  const dateRangePickerLocale = {
    sunday: t('sunday'),
    monday: t('monday'),
    tuesday: t('tuesday'),
    wednesday: t('wednesday'),
    thursday: t('thursday'),
    friday: t('friday'),
    saturday: t('saturday'),
    ok: t('ok'),
    today: t('today'),
    yesterday: t('yesterday'),
    hours: t('hours'),
    minutes: t('minutes'),
    seconds: t('seconds'),
    last7Days: t('last7Days'),
    formattedMonthPattern: 'yyyy-MM-dd'
  };

  useEffect(() => {
    let isLoggedIn = getCookieValue('is_logged_in');
    let userName = getCookieValue('user_name');
    let userDisplayName = getCookieValue('user_display_name');
    let userUuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (isLoggedIn === null || !isLoggedIn) {
      setRedirectUrl('/authentication/basic/login');
      setRedirect(true);
    } else {
      createCookie('is_logged_in', true, settings.cookieExpireTime);
      createCookie('user_name', userName, settings.cookieExpireTime);
      createCookie('user_display_name', userDisplayName, settings.cookieExpireTime);
      createCookie('user_uuid', userUuid, settings.cookieExpireTime);
      createCookie('token', token, settings.cookieExpireTime);
    }
  });

  const statusText = value => {
    switch (value) {
      case 'new':
        return t('Work Order New');
      case 'assigned':
      case 'in_progress':
        return t('Work Order Handling');
      case 'pending_acceptance':
        return t('Work Order Pending Acceptance');
      case 'done':
        return t('Work Order Done');
      case 'cancelled':
        return t('Work Order Cancelled');
      default:
        return value;
    }
  };

  const priorityText = value => {
    switch (value) {
      case 'critical':
        return t('Work Order Critical');
      case 'high':
        return t('Work Order High');
      case 'medium':
        return t('Work Order Medium');
      case 'low':
        return t('Work Order Low');
      default:
        return value;
    }
  };

  const actionText = value => {
    switch (value) {
      case 'create':
        return t('Work Order Action Create');
      case 'assign':
        return t('Work Order Action Assign');
      case 'reassign':
        return t('Work Order Action Reassign');
      case 'start':
        return t('Work Order Action Start');
      case 'submit':
        return t(FINISH_LABEL[category] || 'Work Order Finish Repair');
      case 'accept':
        return t('Work Order Action Accept');
      case 'reject':
        return t('Work Order Action Reject');
      case 'return':
        return t('Work Order Action Return');
      case 'cancel':
        return t('Work Order Action Cancel');
      default:
        return value;
    }
  };

  const formatDateTime = value => {
    if (!value) {
      return '';
    }
    return moment(value).format('YYYY-MM-DD HH:mm:ss');
  };

  const queryString = (range = reportingPeriodDateRange) => {
    const start = range[0] ? moment(range[0]).format('YYYY-MM-DDTHH:mm:ss') : '';
    const end = range[1] ? moment(range[1]).format('YYYY-MM-DDTHH:mm:ss') : '';
    return (
      'category=' + category +
      '&startdatetime=' + start +
      '&enddatetime=' + end +
      '&priority=' + priority +
      '&status=' + status
    );
  };

  const loadWorkOrders = (range = reportingPeriodDateRange) => {
    if (!range[0] || !range[1]) {
      return;
    }
    setSubmitButtonDisabled(true);
    setSpinnerHidden(false);
    let isResponseOK = false;
    fetch(APIBaseURL + '/workorders?' + queryString(range), {
      method: 'GET',
      headers: authHeaders(),
      body: null
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        setSubmitButtonDisabled(false);
        setSpinnerHidden(true);
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          setWorkOrders(json.items || []);
          setStatistics(json.statistics || emptyStatistics);
          setCanCreateWorkOrder(json.can_create === true);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
        }
      })
      .catch(err => {
        setSubmitButtonDisabled(false);
        setSpinnerHidden(true);
        console.log(err);
      });
  };

  const loadUsers = () => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/workorders/assignees', {
      method: 'GET',
      headers: authHeaders(),
      body: null
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          setUsers(json || []);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  useEffect(() => {
    loadUsers();
    loadWorkOrders();
    // Load the current month once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const openDetail = id => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/workorders/' + id, {
      method: 'GET',
      headers: authHeaders(),
      body: null
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          setDetail(json);
          setActionComment('');
          setAssignUserId(json.assignee_user_id ? String(json.assignee_user_id) : '');
          setDetailOpen(true);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const runAction = action => {
    if (!detail) {
      return;
    }
    if ((action === 'assign' || action === 'reassign') && !assignUserId) {
      toast.error(t('API.INVALID_WORK_ORDER_ASSIGNEE'));
      return;
    }
    if (action === 'submit' && !actionComment.trim()) {
      toast.error(t('API.WORK_ORDER_RESULT_REQUIRED'));
      return;
    }
    if ((action === 'accept' || action === 'reject') && currentUserIsAssignee(detail)) {
      return;
    }
    setActionDisabled(true);
    const data = { action: action };
    if (actionComment.trim()) {
      data.comment = actionComment.trim();
    }
    if (action === 'assign' || action === 'reassign') {
      data.assignee_user_id = parseInt(assignUserId, 10);
    }
    let isResponseOK = false;
    fetch(APIBaseURL + '/workorders/' + detail.id + '/actions', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ data: data })
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        setActionDisabled(false);
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          setDetail(json);
          setActionComment('');
          loadWorkOrders();
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
        }
      })
      .catch(err => {
        setActionDisabled(false);
        console.log(err);
      });
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      priority: 'medium',
      assigneeUserId: '',
      dueDatetime: defaultDueDatetime(),
      objectType: '',
      objectId: ''
    });
  };

  const submitCreate = event => {
    event.preventDefault();
    if (!form.title.trim() || !form.priority) {
      return;
    }
    if ((form.objectType && !form.objectId.trim()) || (!form.objectType && form.objectId.trim()) ||
        (form.objectId.trim() && !/^[1-9]\d*$/.test(form.objectId.trim()))) {
      return;
    }
    const data = {
      category: category,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority
    };
    if (form.assigneeUserId) {
      data.assignee_user_id = parseInt(form.assigneeUserId, 10);
    }
    if (form.dueDatetime) {
      data.due_datetime = moment(form.dueDatetime).format('YYYY-MM-DDTHH:mm:ss');
    }
    if (form.objectType && form.objectId) {
      data.belong_to_object_type = form.objectType;
      data.belong_to_object_id = parseInt(form.objectId, 10);
    }
    setActionDisabled(true);
    let isResponseOK = false;
    fetch(APIBaseURL + '/workorders', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ data: data })
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        setActionDisabled(false);
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          setCreateOpen(false);
          resetForm();
          const range = [reportingPeriodDateRange[0], reportingPeriodDateRange[1]];
          const inclusiveEnd = moment().add(1, 'seconds').toDate();
          if (!range[1] || moment(range[1]).isBefore(inclusiveEnd)) {
            range[1] = inclusiveEnd;
            setReportingPeriodDateRange(range);
          }
          loadWorkOrders(range);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
        }
      })
      .catch(err => {
        setActionDisabled(false);
        console.log(err);
      });
  };

  const onReportingPeriodChange = dateRange => {
    if (dateRange == null) {
      setReportingPeriodDateRange([null, null]);
    } else {
      if (moment(dateRange[1]).format('HH:mm:ss') === '00:00:00') {
        dateRange[1] = endOfDay(dateRange[1]);
      }
      setReportingPeriodDateRange([dateRange[0], dateRange[1]]);
    }
  };

  const statusFormatter = value => (
    <Badge color={`soft-${STATUS_COLOR[value] || 'secondary'}`} className="rounded-capsule fs--1">
      {statusText(value)}
    </Badge>
  );

  const priorityFormatter = value => (
    <Badge color={`soft-${PRIORITY_COLOR[value] || 'secondary'}`} className="rounded-capsule fs--1">
      {priorityText(value)}
    </Badge>
  );

  const columns = [
    {
      dataField: 'number',
      text: t('Work Order Number'),
      classes: 'py-2 align-middle',
      formatter: (number, row) => (
        <Button color="link" size="sm" className="p-0 align-baseline" onClick={() => openDetail(row.id)}>
          {number}
        </Button>
      ),
      sort: true
    },
    {
      dataField: 'title',
      text: t('Work Order Title'),
      classes: 'py-2 align-middle',
      sort: true
    },
    {
      dataField: 'priority',
      text: t('Work Order Priority'),
      classes: 'py-2 align-middle',
      formatter: priorityFormatter,
      sort: true
    },
    {
      dataField: 'status',
      text: t('Work Order Status'),
      classes: 'py-2 align-middle',
      formatter: statusFormatter,
      sort: true
    },
    {
      dataField: 'creator_name',
      text: t('Work Order Creator'),
      classes: 'py-2 align-middle',
      sort: true
    },
    {
      dataField: 'assignee_name',
      text: t('Work Order Assignee'),
      classes: 'py-2 align-middle',
      formatter: value => value || t('Work Order No Assignee'),
      sort: true
    },
    {
      dataField: 'created_datetime',
      text: t('Work Order Created Datetime'),
      classes: 'py-2 align-middle',
      formatter: formatDateTime,
      sort: true
    },
    {
      dataField: 'id',
      text: '',
      classes: 'py-2 align-middle',
      align: 'right',
      formatter: id => (
        <Button color="falcon-default" size="sm" onClick={() => openDetail(id)}>
          {t('Work Order Detail')}
        </Button>
      )
    }
  ];

  const options = {
    custom: true,
    sizePerPage: 10,
    totalSize: workOrders.length
  };

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';
  const objectIdText = form.objectId.trim();
  const objectPairStarted = Boolean(form.objectType) || objectIdText !== '';
  const objectIdInvalid = objectIdText !== '' && !/^[1-9]\d*$/.test(objectIdText);
  const objectPairIncomplete = objectPairStarted && (!form.objectType || objectIdText === '' || objectIdInvalid);
  const canCreate = form.title.trim() !== '' && form.priority !== '' && !objectPairIncomplete && !actionDisabled;
  const fieldLabel = (text, required) => (
    <Label>
      {text}
      {required
        ? <span className="text-danger ml-1" aria-hidden="true">*</span>
        : <span className="text-500 font-weight-normal ml-1">{t('Work Order Optional')}</span>}
    </Label>
  );
  const userOptions = users.map(user => (
    <option value={user.id} key={user.id}>
      {user.display_name || user.name}
    </option>
  ));

  const detailActions = () => {
    if (!detail) {
      return null;
    }
    const allowed = new Set(detail.allowed_actions || []);
    if (currentUserIsAssignee(detail)) {
      allowed.delete('accept');
      allowed.delete('reject');
    }
    if (allowed.size === 0) {
      return null;
    }
    const needsAssignee = allowed.has('assign') || allowed.has('reassign');
    return (
      <Fragment>
        {needsAssignee && (
          <CustomInput
            type="select"
            id="assignUser"
            bsSize="sm"
            className="mb-2"
            value={assignUserId}
            onChange={({ target }) => setAssignUserId(target.value)}
          >
            <option value="">{t('Select User')}</option>
            {userOptions}
          </CustomInput>
        )}
        {allowed.has('assign') && (
          <Button size="sm" color="primary" className="mr-2" disabled={actionDisabled}
            onClick={() => runAction('assign')}>
            {t('Work Order Assign')}
          </Button>
        )}
        {allowed.has('submit') && (
          <Button size="sm" color="primary" className="mr-2" disabled={actionDisabled}
            onClick={() => runAction('submit')}>
            {t(FINISH_LABEL[category] || 'Work Order Finish Repair')}
          </Button>
        )}
        {allowed.has('accept') && (
          <Button size="sm" color="success" className="mr-2" disabled={actionDisabled}
            onClick={() => runAction('accept')}>
            {t('Work Order Accept')}
          </Button>
        )}
        {allowed.has('reassign') && (
          <Button size="sm" color="falcon-default" className="mr-2" disabled={actionDisabled}
            onClick={() => runAction('reassign')}>
            {t('Work Order Reassign')}
          </Button>
        )}
        {allowed.has('reject') && (
          <Button size="sm" color="secondary" className="mr-2" disabled={actionDisabled}
            onClick={() => runAction('reject')}>
            {t('Work Order Reject')}
          </Button>
        )}
        {allowed.has('return') && (
          <Button size="sm" color="secondary" className="mr-2" disabled={actionDisabled}
            onClick={() => runAction('return')}>
            {t('Work Order Return')}
          </Button>
        )}
        {allowed.has('cancel') && (
          <Button size="sm" color="danger" disabled={actionDisabled} onClick={() => runAction('cancel')}>
            {t('Work Order Cancel')}
          </Button>
        )}
      </Fragment>
    );
  };

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Work Order')}</BreadcrumbItem>
          <BreadcrumbItem active>{t(titleKey)}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={event => { event.preventDefault(); loadWorkOrders(); }}>
            <Row form>
              <Col sm={2}>
                <FormGroup>
                  <Label className={labelClasses}>{t('Work Order Priority')}</Label>
                  <CustomInput type="select" id="priority" bsSize="sm" value={priority}
                    onChange={({ target }) => setPriority(target.value)}>
                    <option value="all">{t('View all')}</option>
                    <option value="low">{t('Work Order Low')}</option>
                    <option value="medium">{t('Work Order Medium')}</option>
                    <option value="high">{t('Work Order High')}</option>
                    <option value="critical">{t('Work Order Critical')}</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm={2}>
                <FormGroup>
                  <Label className={labelClasses}>{t('Work Order Status')}</Label>
                  <CustomInput type="select" id="status" bsSize="sm" value={status}
                    onChange={({ target }) => setStatus(target.value)}>
                    <option value="all">{t('View all')}</option>
                    <option value="new">{t('Work Order New')}</option>
                    <option value="handling">{t('Work Order Handling')}</option>
                    <option value="pending_acceptance">{t('Work Order Pending Acceptance')}</option>
                    <option value="done">{t('Work Order Done')}</option>
                    <option value="cancelled">{t('Work Order Cancelled')}</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs={6} sm={4}>
                <FormGroup>
                  <Label className={labelClasses}>{t('Reporting Period')}</Label>
                  <br />
                  <DateRangePickerWrapper
                    id="workOrderDateRange"
                    format="yyyy-MM-dd HH:mm:ss"
                    value={reportingPeriodDateRange}
                    onChange={onReportingPeriodChange}
                    size="sm"
                    style={{ display: 'block', zIndex: 10 }}
                    onClean={() => setReportingPeriodDateRange([null, null])}
                    locale={dateRangePickerLocale}
                    placeholder={t('Select Date Range')}
                  />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br />
                  <Spinner color="primary" hidden={spinnerHidden} />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br />
                  <ButtonGroup>
                    <Button size="sm" color="success" disabled={submitButtonDisabled}>{t('Work Order Query')}</Button>
                  </ButtonGroup>
                </FormGroup>
              </Col>
              {canCreateWorkOrder && (
                <Col xs="auto">
                  <FormGroup>
                    <br />
                    <ButtonIcon type="button" icon="plus" transform="shrink-3 down-2" color="falcon-default" size="sm"
                      onClick={() => { resetForm(); setCreateOpen(true); }}>
                      {t('Work Order Create')}
                    </ButtonIcon>
                  </FormGroup>
                </Col>
              )}
            </Row>
          </Form>
        </CardBody>
      </Card>
      <div className="card-deck">
        <CardSummary rate="" title={t('Number of Work Orders to Dispatch')} footunit="" color="info">
          <CountUp end={statistics.new || 0} duration={1} separator="," decimals={0} />
        </CardSummary>
        <CardSummary rate="" title={t('Number of Work Orders to Handle')} footunit="" color="warning">
          <CountUp end={statistics.handling || 0} duration={1} separator="," decimals={0} />
        </CardSummary>
        <CardSummary rate="" title={t('Number of Work Orders to Accept')} footunit="" color="primary">
          <CountUp end={statistics.pending_acceptance || 0} duration={1} separator="," decimals={0} />
        </CardSummary>
        <CardSummary rate="" title={t('Work Order Done')} footunit="" color="success">
          <CountUp end={statistics.done || 0} duration={1} separator="," decimals={0} />
        </CardSummary>
      </div>
      <Card className="mb-3">
        <FalconCardHeader title={t(titleKey)} light={false} titleClass="text-lightSlateGray mb-0" />
        <CardBody className="p-0">
          <PaginationProvider pagination={paginationFactory(options)}>
            {({ paginationProps, paginationTableProps }) => {
              const lastIndex = paginationProps.page * paginationProps.sizePerPage;
              return (
                <Fragment>
                  <div className="table-responsive">
                    <BootstrapTable
                      bootstrap4
                      keyField="id"
                      data={workOrders}
                      columns={columns}
                      bordered={false}
                      classes="table-dashboard table-striped table-sm fs--1 border-bottom mb-0 table-dashboard-th-nowrap"
                      rowClasses="btn-reveal-trigger"
                      headerClasses="bg-200 text-900"
                      {...paginationTableProps}
                    />
                  </div>
                  <Row noGutters className="px-1 py-3 flex-center">
                    <Col xs="auto">
                      <Button color="falcon-default" size="sm" onClick={() => paginationProps.onPageChange(paginationProps.page - 1)}
                        disabled={paginationProps.page === 1}>
                        <FontAwesomeIcon icon="chevron-left" />
                      </Button>
                      {getPaginationArray(paginationProps.totalSize, paginationProps.sizePerPage).map(pageNo => (
                        <Button color={paginationProps.page === pageNo ? 'falcon-primary' : 'falcon-default'}
                          size="sm" className="ml-2" onClick={() => paginationProps.onPageChange(pageNo)} key={pageNo}>
                          {pageNo}
                        </Button>
                      ))}
                      <Button color="falcon-default" size="sm" className="ml-2"
                        onClick={() => paginationProps.onPageChange(paginationProps.page + 1)}
                        disabled={lastIndex >= paginationProps.totalSize}>
                        <FontAwesomeIcon icon="chevron-right" />
                      </Button>
                    </Col>
                  </Row>
                </Fragment>
              );
            }}
          </PaginationProvider>
        </CardBody>
      </Card>

      <Modal isOpen={createOpen} toggle={() => setCreateOpen(false)} centered>
        <Form onSubmit={submitCreate}>
          <ModalHeader toggle={() => setCreateOpen(false)}>{t('Work Order Create')}</ModalHeader>
          <ModalBody>
            <FormGroup>
              {fieldLabel(t('Work Order Title'), true)}
              <Input bsSize="sm" value={form.title} maxLength={255} required
                onChange={({ target }) => setForm({ ...form, title: target.value })} />
            </FormGroup>
            <FormGroup>
              {fieldLabel(t('Work Order Description'), false)}
              <Input type="textarea" bsSize="sm" rows={3} value={form.description}
                onChange={({ target }) => setForm({ ...form, description: target.value })} />
            </FormGroup>
            <FormGroup>
              {fieldLabel(t('Work Order Priority'), true)}
              <CustomInput type="select" id="createPriority" bsSize="sm" value={form.priority} required
                onChange={({ target }) => setForm({ ...form, priority: target.value })}>
                <option value="low">{t('Work Order Low')}</option>
                <option value="medium">{t('Work Order Medium')}</option>
                <option value="high">{t('Work Order High')}</option>
                <option value="critical">{t('Work Order Critical')}</option>
              </CustomInput>
            </FormGroup>
            <FormGroup>
              {fieldLabel(t('Work Order Assignee'), false)}
              <CustomInput type="select" id="createAssignee" bsSize="sm" value={form.assigneeUserId}
                onChange={({ target }) => setForm({ ...form, assigneeUserId: target.value })}>
                <option value="">{t('Work Order No Assignee')}</option>
                {userOptions}
              </CustomInput>
            </FormGroup>
            <FormGroup>
              {fieldLabel(t('Work Order Due Datetime'), false)}
              <DatePicker
                format="yyyy-MM-dd HH:mm:ss"
                value={form.dueDatetime}
                onChange={date => setForm({ ...form, dueDatetime: date })}
                size="sm"
                block
                cleanable={false}
                preventOverflow
                container={() => document.body}
                menuStyle={{ zIndex: 2000 }}
                locale={dateRangePickerLocale}
                placeholder={t('Select Date Range')}
              />
            </FormGroup>
            <Row form>
              <Col sm={7}>
                <FormGroup>
                  {fieldLabel(t('Work Order Object Type'), objectPairStarted)}
                  <CustomInput type="select" id="createObjectType" bsSize="sm" value={form.objectType}
                    required={objectPairStarted}
                    onChange={({ target }) => setForm({ ...form, objectType: target.value })}>
                    <option value="">{t('Work Order No Object')}</option>
                    {OBJECT_TYPES.map(objectType => (
                      <option value={objectType.value} key={objectType.value}>{t(objectType.labelKey)}</option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm={5}>
                <FormGroup>
                  {fieldLabel(t('Work Order Object Id'), objectPairStarted)}
                  <Input bsSize="sm" value={form.objectId} required={objectPairStarted}
                    invalid={objectIdInvalid}
                    onChange={({ target }) => setForm({ ...form, objectId: target.value })} />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" size="sm" onClick={() => setCreateOpen(false)}>{t('Cancel')}</Button>
            <Button color="primary" size="sm" type="submit" disabled={!canCreate}>{t('Submit')}</Button>
          </ModalFooter>
        </Form>
      </Modal>

      <Modal isOpen={detailOpen} toggle={() => setDetailOpen(false)} size="lg" centered>
        <ModalHeader toggle={() => setDetailOpen(false)}>
          {detail ? detail.number + ' ' + detail.title : t('Work Order Detail')}
        </ModalHeader>
        <ModalBody>
          {detail && (
            <Fragment>
              <Row className="mb-3">
                <Col sm={3}><strong>{t('Work Order Status')}</strong><div>{statusText(detail.status)}</div></Col>
                <Col sm={3}><strong>{t('Work Order Priority')}</strong><div>{priorityText(detail.priority)}</div></Col>
                <Col sm={3}><strong>{t('Work Order Creator')}</strong><div>{detail.creator_name || ''}</div></Col>
                <Col sm={3}>
                  <strong>{t('Work Order Assignee')}</strong>
                  <div>{detail.assignee_name || t('Work Order No Assignee')}</div>
                </Col>
              </Row>
              <p style={{ whiteSpace: 'pre-wrap' }}>{detail.description}</p>
              <Row className="mb-3 fs--1 text-600">
                <Col sm={6}>{t('Work Order Created Datetime')}: {formatDateTime(detail.created_datetime)}</Col>
                <Col sm={6}>{t('Work Order Due Datetime')}: {formatDateTime(detail.due_datetime)}</Col>
              </Row>
              <h6 className="text-lightSlateGray">{t('Work Order Timeline')}</h6>
              <ul className="list-unstyled fs--1">
                {(detail.logs || []).map(log => (
                  <li key={log.id} className="mb-2">
                    <span className="text-600">{formatDateTime(log.created_datetime)}</span>
                    {' '}{actionText(log.action)}
                    {log.from_status ? ' ' + statusText(log.from_status) + ' → ' + statusText(log.to_status) : ''}
                    {log.comment ? ' — ' + log.comment : ''}
                  </li>
                ))}
              </ul>
              {detailActions() && (
                <FormGroup className="mb-2">
                  <Label>
                    {t((detail.allowed_actions || []).includes('submit')
                      ? (RESULT_LABEL[category] || 'Work Order Repair Result')
                      : 'Work Order Comment')}
                    {(detail.allowed_actions || []).includes('submit')
                      ? <span className="text-danger ml-1" aria-hidden="true">*</span>
                      : null}
                  </Label>
                  <Input type="textarea" bsSize="sm" rows={2} value={actionComment}
                    onChange={({ target }) => setActionComment(target.value)} />
                </FormGroup>
              )}
              {detailActions()}
            </Fragment>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" size="sm" onClick={() => setDetailOpen(false)}>{t('Close')}</Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(WorkOrderPage));
