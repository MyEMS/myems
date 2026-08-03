import React, { createRef, Fragment, useContext, useEffect, useState } from 'react';
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
import { toast } from 'react-toastify';
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  Label,
  CustomInput,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  InputGroup,
  UncontrolledDropdown,
  Spinner,
  Breadcrumb,
  BreadcrumbItem
} from 'reactstrap';
import Badge from 'reactstrap/es/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../../common/FalconCardHeader';
import { getPaginationArray } from '../../../helpers/utils';
import { getCookieValue, createCookie, checkEmpty,handleAPIError } from '../../../helpers/utils';
import { Link } from 'react-router-dom';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay } from 'date-fns';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import AppContext from '../../../context/Context';
import { APIBaseURL, settings } from '../../../config';

const Notification = ({ setRedirect, setRedirectUrl, t }) => {
  const { language } = useContext(AppContext);
  let current_moment = moment();
  const [reportingPeriodDateRange, setReportingPeriodDateRange] = useState([
    current_moment.clone().subtract(1, 'months').startOf('day').toDate(),
    current_moment.toDate()
  ]);
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
  const dateRangePickerStyle = { display: 'block', zIndex: 10 };
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');

  const [fetchSuccess, setFetchSuccess] = useState(false);
  //Results
  const [notifications, setNotifications] = useState([]);

  const [spinnerHidden, setSpinnerHidden] = useState(false);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (checkEmpty(is_logged_in) || checkEmpty(token) || checkEmpty(user_uuid) || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      //update expires time of cookies
      createCookie('is_logged_in', true, settings.cookieExpireTime);
      createCookie('user_name', user_name, settings.cookieExpireTime);
      createCookie('user_display_name', user_display_name, settings.cookieExpireTime);
      createCookie('user_uuid', user_uuid, settings.cookieExpireTime);
      createCookie('token', token, settings.cookieExpireTime);

      let isResponseOK = false;
      if (!fetchSuccess) {
        fetch(
          APIBaseURL +
            '/webmessages?' +
            'startdatetime=' +
            moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
            '&enddatetime=' +
            moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
            '&priority=' +
            priority +
            '&status=' +
            status,
          {
            method: 'GET',
            headers: {
              'Content-type': 'application/json',
              'User-UUID': getCookieValue('user_uuid'),
              Token: getCookieValue('token')
            },
            body: null
          }
        )
          .then(response => {
            if (response.ok) {
              isResponseOK = true;
            }
            return response.json();
          })
          .then(json => {
            if (isResponseOK) {
              setFetchSuccess(true);

              let notificationList = [];

              if (json.length > 0) {
                json.forEach((currentValue, index) => {
                  let notification = {};
                  notification['id'] = json[index]['id'];
                  notification['subject'] = json[index]['subject'];
                  notification['message'] = json[index]['message'];
                  notification['created_datetime'] = moment(parseInt(json[index]['created_datetime'])).format(
                    'YYYY-MM-DD HH:mm:ss'
                  );
                  notification['start_datetime'] = json[index]['start_datetime']
                    ? moment(parseInt(json[index]['start_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                    : '';
                  notification['end_datetime'] = json[index]['end_datetime']
                    ? moment(parseInt(json[index]['end_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                    : '';
                  notification['status'] = json[index]['status'];
                  notification['update_datetime'] = json[index]['update_datetime']
                    ? moment(parseInt(json[index]['update_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                    : '';
                  notification['url'] = json[index]['url'];

                  notificationList.push(notification);
                });
              }

              setNotifications(notificationList);
              setSpinnerHidden(true);
            }
          });
      }
    }
  });
  // State
  let table = createRef();

  const [isSelected, setIsSelected] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (!reportingPeriodDateRange[0] || !reportingPeriodDateRange[1]) {
      toast.error(t('Select Date Range'));
      return;
    }
    console.log('handleSubmit');
    console.log(moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss'));
    console.log(moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'));
    console.log(priority);
    console.log(status);

    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide export button
    setExportButtonHidden(true);

    // Reinitialize tables
    setNotifications([]);

    let isResponseOK = false;
    fetch(
      APIBaseURL +
        '/webmessages?' +
        'startdatetime=' +
        moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
        '&enddatetime=' +
        moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
        '&priority=' +
        priority +
        '&status=' +
        status,
      {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': getCookieValue('user_uuid'),
          Token: getCookieValue('token')
        },
        body: null
      }
    )
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        // enable submit button
        setSubmitButtonDisabled(false);
        // hide spinner
        setSpinnerHidden(true);
        // show export button
        setExportButtonHidden(false);

        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          setFetchSuccess(true);
          console.log(json);
          let notificationList = [];

          if (json.length > 0) {
            json.forEach((currentValue, index) => {
              let notification = {};
              notification['id'] = currentValue['id'];
              notification['subject'] = currentValue['subject'];
              notification['created_datetime'] = moment(parseInt(currentValue['created_datetime'])).format(
                'YYYY-MM-DD HH:mm:ss'
              );
              notification['start_datetime'] = currentValue['start_datetime']
                ? moment(parseInt(currentValue['start_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                : '';
              notification['end_datetime'] = currentValue['end_datetime']
                ? moment(parseInt(currentValue['end_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                : '';
              notification['message'] = currentValue['message'];
              notification['status'] = currentValue['status'];
              notification['update_datetime'] = currentValue['update_datetime']
                ? moment(parseInt(currentValue['update_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                : '';
              notification['url'] = currentValue['url'];

              notificationList.push(notification);
            });
          }

          setNotifications(notificationList);
          setSpinnerHidden(true);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleNextPage = ({ page, onPageChange }) => () => {
    onPageChange(page + 1);
  };

  const handlePrevPage = ({ page, onPageChange }) => () => {
    onPageChange(page - 1);
  };

  const onSelect = () => {
    setImmediate(() => {
      setIsSelected(!!table.current.selectionContext.selected.length);
    });
  };

  let onReportingPeriodChange = DateRange => {
    if (DateRange == null) {
      return;
    }
    if (moment(DateRange[1]).format('HH:mm:ss') === '00:00:00') {
      DateRange[1] = endOfDay(DateRange[1]);
    }
    setReportingPeriodDateRange([DateRange[0], DateRange[1]]);
  };

  const subjectFormatter = (dataField, { url }) => (
    <Fragment>
      <span>{dataField}</span>
    </Fragment>
  );

  const messageFormatter = dataField => <Fragment>{dataField}</Fragment>;

  const statusFormatter = status => {
    let color = '';
    let icon = '';
    let text = '';
    switch (status) {
      case 'acknowledged':
        color = 'success';
        icon = 'envelope-open';
        text = t('Notification Acknowledged');
        break;
      case 'read':
        color = 'success';
        icon = 'envelope-open';
        text = t('Notification Read');
        break;
      default:
        color = 'primary';
        icon = 'envelope';
        text = t('Notification Unread');
    }

    return (
      <Badge color={`soft-${color}`} className="rounded-capsule fs--1 d-block">
        {text}
        <FontAwesomeIcon icon={icon} transform="shrink-2" className="ml-1" />
      </Badge>
    );
  };

  const actionFormatter = (dataField, { id }) => (
    // Control your row with this id
    <UncontrolledDropdown>
      <DropdownToggle color="link" size="sm" className="text-600 btn-reveal mr-3">
        <FontAwesomeIcon icon="ellipsis-h" className="fs--1" />
      </DropdownToggle>
      <DropdownMenu right className="border py-2">
        <DropdownItem onClick={() => handleRead(id)}>{t('Notification Mark As Read')}</DropdownItem>
        <DropdownItem onClick={() => handleAcknowledged(id)}>{t('Notification Mark As Acknowledged')}</DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={() => handledelete(id)} className="text-danger">
          {t('Notification Delete')}
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  const columns = [
    {
      dataField: 'subject',
      text: t('Notification Subject'),
      classes: 'py-2 align-middle',
      formatter: subjectFormatter,
      sort: true
    },
    {
      dataField: 'message',
      text: t('Notification Message'),
      classes: 'py-2 align-middle',
      formatter: messageFormatter,
      sort: true
    },
    {
      dataField: 'created_datetime',
      text: t('Notification Created Datetime'),
      classes: 'py-2 align-middle',
      sort: true
    },
    {
      dataField: 'start_datetime',
      text: t('Notification Start Datetime'),
      classes: 'py-2 align-middle',
      sort: true
    },
    {
      dataField: 'end_datetime',
      text: t('Notification End Datetime'),
      classes: 'py-2 align-middle',
      sort: true
    },
    {
      dataField: 'status',
      text: t('Notification Status'),
      classes: 'py-2 align-middle',
      formatter: statusFormatter,
      sort: true
    },
    {
      dataField: 'update_datetime',
      text: t('Notification Update Datetime'),
      classes: 'py-2 align-middle',
      sort: true
    },
    {
      dataField: '',
      text: '',
      classes: 'py-2 align-middle',
      formatter: actionFormatter,
      align: 'right'
    }
  ];

  const options = {
    custom: true,
    sizePerPage: 10,
    totalSize: notifications.length
  };

  const SelectRowInput = ({ indeterminate, rowIndex, ...rest }) => (
    <div className="custom-control custom-checkbox">
      <input
        className="custom-control-input"
        {...rest}
        onChange={() => {}}
        ref={input => {
          if (input) input.indeterminate = indeterminate;
        }}
      />
      <label className="custom-control-label" />
    </div>
  );

  const selectRow = onSelect => ({
    mode: 'checkbox',
    classes: 'py-2 align-middle',
    clickToSelect: false,
    selectionHeaderRenderer: ({ mode, ...rest }) => <SelectRowInput type="checkbox" {...rest} />,
    selectionRenderer: ({ mode, ...rest }) => {
      const { rowKey, ...newRest } = rest;
      return <SelectRowInput type={mode} {...newRest} />;
    },
    onSelect: onSelect,
    onSelectAll: onSelect
  });

  const handleRead = id => {
    console.log('Mark As Read: ', id);
    let isResponseOK = false;
    fetch(APIBaseURL + '/webmessages/' + id, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: JSON.stringify({
        data: {
          status: 'read'
        }
      })
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
          return null;
        } else {
          return response.json();
        }
      })
      .then(json => {
        console.log(isResponseOK);
        if (isResponseOK) {
          let isResponseOK = false;
          fetch(
            APIBaseURL +
              '/webmessages?' +
              'startdatetime=' +
              moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
              '&enddatetime=' +
              moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
              '&priority=' +
              priority +
              '&status=' +
              status,
            {
              method: 'GET',
              headers: {
                'Content-type': 'application/json',
                'User-UUID': getCookieValue('user_uuid'),
                Token: getCookieValue('token')
              },
              body: null
            }
          )
            .then(response => {
              if (response.ok) {
                isResponseOK = true;
              }
              return response.json();
            })
            .then(json => {
              if (isResponseOK) {
                console.log(json);
                setFetchSuccess(true);

                let notificationList = [];

                if (json.length > 0) {
                  json.forEach((currentValue, index) => {
                    let notification = {};
                    notification['id'] = json[index]['id'];
                    notification['subject'] = json[index]['subject'];
                    notification['message'] = json[index]['message'];
                    notification['created_datetime'] = moment(parseInt(json[index]['created_datetime'])).format(
                      'YYYY-MM-DD HH:mm:ss'
                    );
                    notification['start_datetime'] = json[index]['start_datetime']
                      ? moment(parseInt(json[index]['start_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                      : '';
                    notification['end_datetime'] = json[index]['end_datetime']
                      ? moment(parseInt(json[index]['end_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                      : '';
                    notification['status'] = json[index]['status'];
                    notification['update_datetime'] = json[index]['update_datetime']
                      ? moment(parseInt(json[index]['update_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                      : '';
                    notification['url'] = json[index]['url'];

                    notificationList.push(notification);
                  });
                }

                setNotifications(notificationList);
                setSpinnerHidden(true);
              }
            });
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleAcknowledged = id => {
    console.log('Mark As Acknowledged: ', id);
    let isResponseOK = false;
    fetch(APIBaseURL + '/webmessages/' + id, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: JSON.stringify({
        data: {
          status: 'acknowledged',
          reply: 'OK'
        }
      })
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
          return null;
        } else {
          return response.json();
        }
      })
      .then(json => {
        console.log(isResponseOK);
        if (isResponseOK) {
          let isResponseOK = false;
          fetch(
            APIBaseURL +
              '/webmessages?' +
              'startdatetime=' +
              moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
              '&enddatetime=' +
              moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
              '&priority=' +
              priority +
              '&status=' +
              status,
            {
              method: 'GET',
              headers: {
                'Content-type': 'application/json',
                'User-UUID': getCookieValue('user_uuid'),
                Token: getCookieValue('token')
              },
              body: null
            }
          )
            .then(response => {
              if (response.ok) {
                isResponseOK = true;
              }
              return response.json();
            })
            .then(json => {
              if (isResponseOK) {
                console.log(json);
                setFetchSuccess(true);

                let notificationList = [];

                if (json.length > 0) {
                  json.forEach((currentValue, index) => {
                    let notification = {};
                    notification['id'] = json[index]['id'];
                    notification['subject'] = json[index]['subject'];
                    notification['message'] = json[index]['message'];
                    notification['created_datetime'] = moment(parseInt(json[index]['created_datetime'])).format(
                      'YYYY-MM-DD HH:mm:ss'
                    );
                    notification['start_datetime'] = json[index]['start_datetime']
                      ? moment(parseInt(json[index]['start_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                      : '';
                    notification['end_datetime'] = json[index]['end_datetime']
                      ? moment(parseInt(json[index]['end_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                      : '';
                    notification['status'] = json[index]['status'];
                    notification['update_datetime'] = json[index]['update_datetime']
                      ? moment(parseInt(json[index]['update_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                      : '';
                    notification['url'] = json[index]['url'];

                    notificationList.push(notification);
                  });
                }

                setNotifications(notificationList);
                setSpinnerHidden(true);
              }
            });
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handledelete = id => {
    console.log('Delete: ', id);
    let isResponseOK = false;
    fetch(APIBaseURL + '/webmessages/' + id, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
          return null;
        } else {
          return response.json();
        }
      })
      .then(json => {
        console.log(isResponseOK);
        if (isResponseOK) {
          let isResponseOK = false;
          fetch(
            APIBaseURL +
              '/webmessages?' +
              'startdatetime=' +
              moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
              '&enddatetime=' +
              moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
              '&priority=' +
              priority +
              '&status=' +
              status,
            {
              method: 'GET',
              headers: {
                'Content-type': 'application/json',
                'User-UUID': getCookieValue('user_uuid'),
                Token: getCookieValue('token')
              },
              body: null
            }
          )
            .then(response => {
              if (response.ok) {
                isResponseOK = true;
              }
              return response.json();
            })
            .then(json => {
              if (isResponseOK) {
                console.log(json);
                setFetchSuccess(true);

                let notificationList = [];

                if (json.length > 0) {
                  json.forEach((currentValue, index) => {
                    let notification = {};
                    notification['id'] = json[index]['id'];
                    notification['subject'] = json[index]['subject'];
                    notification['message'] = json[index]['message'];
                    notification['created_datetime'] = moment(parseInt(json[index]['created_datetime'])).format(
                      'YYYY-MM-DD HH:mm:ss'
                    );
                    notification['start_datetime'] = json[index]['start_datetime']
                      ? moment(parseInt(json[index]['start_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                      : '';
                    notification['end_datetime'] = json[index]['end_datetime']
                      ? moment(parseInt(json[index]['end_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                      : '';
                    notification['status'] = json[index]['status'];
                    notification['update_datetime'] = json[index]['update_datetime']
                      ? moment(parseInt(json[index]['update_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                      : '';
                    notification['url'] = json[index]['url'];

                    notificationList.push(notification);
                  });
                }

                setNotifications(notificationList);
                setSpinnerHidden(true);
              }
            });
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const batchDelete = () => {
    let rows = table.current.selectionContext.selected;
    if (rows.length <= 0) {
      toast.error(t('Select Row'));
      return;
    }
    fetch(APIBaseURL + '/webmessagesbatch', {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: JSON.stringify({
        ids: rows.join(',')
      })
    })
      .then(response => {
        if (response.ok) {
          loadData(table);
          return null;
        } else {
          let json = response.json();
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const batchRead = () => {
    let rows = table.current.selectionContext.selected;
    if (rows.length <= 0) {
      toast.error(t('Select Row'));
      return;
    }
    fetch(APIBaseURL + '/webmessagesbatch', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: JSON.stringify({
        ids: rows.join(',')
      })
    })
      .then(response => {
        if (response.ok) {
          loadData(table);
          return null;
        } else {
          let json = response.json();
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const loadData = table => {
    if (!reportingPeriodDateRange[0] || !reportingPeriodDateRange[1]) {
      return;
    }
    table.current.selectionContext.selected = [];
    onSelect();
    let isResponseOK = false;
    fetch(
      APIBaseURL +
        '/webmessages?' +
        'startdatetime=' +
        moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
        '&enddatetime=' +
        moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
        '&priority=' +
        priority +
        '&status=' +
        status,
      {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': getCookieValue('user_uuid'),
          Token: getCookieValue('token')
        },
        body: null
      }
    )
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          setFetchSuccess(true);
          let notificationList = [];
          if (json.length > 0) {
            json.forEach((currentValue, index) => {
              let notification = {};
              notification['id'] = json[index]['id'];
              notification['subject'] = json[index]['subject'];
              notification['message'] = json[index]['message'];
              notification['created_datetime'] = moment(parseInt(json[index]['created_datetime'])).format(
                'YYYY-MM-DD HH:mm:ss'
              );
              notification['start_datetime'] = json[index]['start_datetime']
                ? moment(parseInt(json[index]['start_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                : '';
              notification['end_datetime'] = json[index]['end_datetime']
                ? moment(parseInt(json[index]['end_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                : '';
              notification['status'] = json[index]['status'];
              notification['update_datetime'] = json[index]['update_datetime']
                ? moment(parseInt(json[index]['update_datetime'])).format('YYYY-MM-DD HH:mm:ss')
                : '';
              notification['url'] = json[index]['url'];

              notificationList.push(notification);
            });
          }
          setNotifications(notificationList);
          setSpinnerHidden(true);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      });
  };

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/">{t('Home')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>{t('Notification')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col sm={1}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="priority">
                    {t('Notification Priority')}
                  </Label>
                  <CustomInput
                    type="select"
                    id="bulk-select"
                    bsSize="sm"
                    value={priority}
                    onChange={({ target }) => {
                      setPriority(target.value);
                    }}
                  >
                    <option value="all" key="all">
                      {t('View all')}
                    </option>
                    <option value="LOW" key="low">
                      {t('Notification Low')}
                    </option>
                    <option value="MEDIUM" key="medium">
                      {t('Notification Medium')}
                    </option>
                    <option value="HIGH" key="high">
                      {t('Notification High')}
                    </option>
                    <option value="CRITICAL" key="critical">
                      {t('Notification Critical')}
                    </option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm={1}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="status">
                    {t('Notification Status')}
                  </Label>
                  <CustomInput
                    type="select"
                    id="bulk-select"
                    bsSize="sm"
                    value={status}
                    onChange={({ target }) => {
                      setStatus(target.value);
                    }}
                  >
                    <option value="all" key="all">
                      {t('View all')}
                    </option>
                    <option value="read" key="read">
                      {t('Notification Read')}
                    </option>
                    <option value="new" key="unread">
                      {t('Notification New')}
                    </option>
                    <option value="acknowledged" key="acknowledged">
                      {t('Notification Acknowledged')}
                    </option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="reportingPeriodDateRangePicker">
                    {t('Reporting Period')}
                  </Label>
                  <br />
                  <DateRangePickerWrapper
                    id="reportingPeriodDateRangePicker"
                    format="yyyy-MM-dd HH:mm:ss"
                    value={reportingPeriodDateRange}
                    onChange={onReportingPeriodChange}
                    size="sm"
                    style={dateRangePickerStyle}
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
                  <ButtonGroup id="submit">
                    {!submitButtonDisabled && (
                      <Button size="sm" color="success">
                        {t('Submit')}
                      </Button>
                    )}
                  </ButtonGroup>
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <Card className="mb-3">
        <Spinner color="primary" hidden={spinnerHidden} />
        <FalconCardHeader title={t('Notification List')} light={false} titleClass="text-lightSlateGray mb-0">
          {isSelected ? (
            <InputGroup size="sm" className="input-group input-group-sm">
              <Button color="falcon-default" onClick={() => batchRead()} size="sm" className="ml-2">
                {t('Notification Mark As Read')}
              </Button>
              <Button color="falcon-default" onClick={() => batchDelete()} size="sm" className="ml-2">
                {t('Notification Delete')}
              </Button>
            </InputGroup>
          ) : (
            <Fragment />
          )}
        </FalconCardHeader>
        <CardBody className="p-0">
          <PaginationProvider pagination={paginationFactory(options)}>
            {({ paginationProps, paginationTableProps }) => {
              const lastIndex = paginationProps.page * paginationProps.sizePerPage;

              return (
                <Fragment>
                  <div className="table-responsive">
                    <BootstrapTable
                      ref={table}
                      bootstrap4
                      keyField="id"
                      data={notifications}
                      columns={columns}
                      selectRow={selectRow(onSelect)}
                      bordered={false}
                      classes="table-dashboard table-striped table-sm fs--1 border-bottom mb-0 table-dashboard-th-nowrap"
                      rowClasses="btn-reveal-trigger"
                      headerClasses="bg-200 text-900"
                      {...paginationTableProps}
                    />
                  </div>
                  <Row noGutters className="px-1 py-3 flex-center">
                    <Col xs="auto">
                      <Button
                        color="falcon-default"
                        size="sm"
                        onClick={handlePrevPage(paginationProps)}
                        disabled={paginationProps.page === 1}
                      >
                        <FontAwesomeIcon icon="chevron-left" />
                      </Button>
                      {getPaginationArray(paginationProps.totalSize, paginationProps.sizePerPage, paginationProps.page).map(pageNo => (
                        pageNo === 'ellipsis' ? (
                          <span key="ellipsis" className="ml-2 px-2 text-600">...</span>
                        ) : (
                          <Button
                            color={paginationProps.page === pageNo ? 'falcon-primary' : 'falcon-default'}
                            size="sm"
                            className="ml-2"
                            onClick={() => paginationProps.onPageChange(pageNo)}
                            key={pageNo}
                          >
                            {pageNo}
                          </Button>
                        )
                      ))}
                      <Button
                        color="falcon-default"
                        size="sm"
                        className="ml-2"
                        onClick={handleNextPage(paginationProps)}
                        disabled={lastIndex >= paginationProps.totalSize}
                      >
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
    </Fragment>
  );
};

export default withTranslation()(withRedirect(Notification));
