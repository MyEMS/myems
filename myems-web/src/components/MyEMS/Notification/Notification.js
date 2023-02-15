import React, { createRef, Fragment, useEffect, useState } from 'react';
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
} from 'reactstrap';
import ButtonIcon from '../../common/ButtonIcon';
import { Link } from 'react-router-dom';
import Badge from 'reactstrap/es/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../../common/FalconCardHeader';
import {v4 as uuid} from 'uuid';
import { getPaginationArray } from '../../../helpers/utils';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import Datetime from 'react-datetime';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import { APIBaseURL } from '../../../config';




const Notification = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
  const [startDatetime, setStartDatetime] = useState(current_moment.clone().subtract(6, 'months'));
  const [endDatetime, setEndDatetime] = useState(current_moment);
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
    if (is_logged_in === null || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      //update expires time of cookies
      createCookie('is_logged_in', true, 1000 * 60 * 10 * 1);
      createCookie('user_name', user_name, 1000 * 60 * 10 * 1);
      createCookie('user_display_name', user_display_name, 1000 * 60 * 10 * 1);
      createCookie('user_uuid', user_uuid, 1000 * 60 * 10 * 1);
      createCookie('token', token, 1000 * 60 * 10 * 1);
      
      let isResponseOK = false;
      if (!fetchSuccess) { 
        fetch(APIBaseURL + '/webmessages?' +
            'startdatetime=' + startDatetime.format('YYYY-MM-DDTHH:mm:ss') +
            '&enddatetime=' + endDatetime.format('YYYY-MM-DDTHH:mm:ss') +
            '&priority=' + priority + 
            '&status=' + status,  {
          method: 'GET',
          headers: {
            "Content-type": "application/json",
            "User-UUID": getCookieValue('user_uuid'),
            "Token": getCookieValue('token')
          },
          body: null,

        }).then(response => {
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        }).then(json => {
          if (isResponseOK) {
            setFetchSuccess(true);

            let notificationList = []

            if (json.length > 0) {
              json.forEach((currentValue, index) => {
                let notification = {}
                notification['id'] = json[index]['id'];
                notification['subject'] = json[index]['subject'];
                notification['created_datetime'] = moment(parseInt(json[index]['created_datetime']))
                    .format("YYYY-MM-DD HH:mm:ss");
                notification['message'] = json[index]['message'];
                notification['status'] = json[index]['status'];
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
  }, );
  // State
  let table = createRef();

  const [isSelected, setIsSelected] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit');
    console.log(startDatetime.format('YYYY-MM-DDTHH:mm:ss'));
    console.log(endDatetime.format('YYYY-MM-DDTHH:mm:ss'));
    console.log(priority)
    console.log(status)

    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide export button
    setExportButtonHidden(true)

    // Reinitialize tables
    setNotifications([]);
    
    let isResponseOK = false;
    fetch(APIBaseURL + '/webmessages?' +
      'startdatetime=' + startDatetime.format('YYYY-MM-DDTHH:mm:ss') +
      '&enddatetime=' + endDatetime.format('YYYY-MM-DDTHH:mm:ss') +
      '&priority=' + priority + 
      '&status=' + status, {
      method: 'GET',
      headers: {
        "Content-type": "application/json",
        "User-UUID": getCookieValue('user_uuid'),
        "Token": getCookieValue('token')
      },
      body: null,

    }).then(response => {
      if (response.ok) {
        isResponseOK = true;
      }
      // enable submit button
      setSubmitButtonDisabled(false);
      // hide spinner
      setSpinnerHidden(true);
      // show export button
      setExportButtonHidden(false)

      return response.json();
    }).then(json => {
      if (isResponseOK) {
        setFetchSuccess(true);
        console.log(json)
        let notificationList = []

        if (json.length > 0) {
          json.forEach((currentValue, index) => {
            let notification = {}
            notification['id'] = currentValue['id'];
            notification['subject'] = currentValue['subject'];
            notification['created_datetime'] = moment(parseInt(currentValue['created_datetime']))
                .format("YYYY-MM-DD HH:mm:ss");
            notification['message'] = currentValue['message'];
            notification['status'] = currentValue['status'];
            notification['url'] = currentValue['url'];

            notificationList.push(notification);
          });
        }
        
        setNotifications(notificationList);
        setSpinnerHidden(true);
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
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

  let onStartDatetimeChange = (newDateTime) => {
    setStartDatetime(newDateTime);
  }

  let onEndDatetimeChange = (newDateTime) => {
    setEndDatetime(newDateTime);
  }

  var getStartDatetime = function (currentDate) {
    return currentDate.isBefore(moment(endDatetime, 'MM/DD/YYYY, hh:mm:ss a'));
  }

  var getEndDatetime = function (currentDate) {
    return currentDate.isAfter(moment(startDatetime, 'MM/DD/YYYY, hh:mm:ss a'));
  }

  const subjectFormatter = (dataField, { url }) => (
    <Fragment>
      <span>{dataField}</span>
    </Fragment>
  );

  const messageFormatter = (dataField,) => (
    <Fragment>
      {dataField}
    </Fragment>
  );

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
        <DropdownItem onClick={() => handledelete(id)} className="text-danger">{t('Notification Delete')}</DropdownItem>
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
      dataField: 'created_datetime',
      text: t('Notification Created Datetime'),
      classes: 'py-2 align-middle',
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
      dataField: 'status',
      text: t('Notification Status'),
      classes: 'py-2 align-middle',
      formatter: statusFormatter,
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
        onChange={() => { }}
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
    selectionRenderer: ({ mode, ...rest }) => <SelectRowInput type={mode} {...rest} />,
    onSelect: onSelect,
    onSelectAll: onSelect
  });

  const handleRead = (id, ) => {
    console.log('Mark As Read: ', id)
    let isResponseOK = false;
    fetch(APIBaseURL + '/webmessages/' + id, {
      method: 'PUT',
      headers: {
        "Content-type": "application/json",
        "User-UUID": getCookieValue('user_uuid'),
        "Token": getCookieValue('token')
      },
      body: JSON.stringify({
        "data": {
          "status": 'read'
        }
      }),
    }).then(response => {
      if (response.ok) {
        isResponseOK = true;
        return null;
      } else {
        return response.json();
      }
    }).then(json => {
      console.log(isResponseOK);
      if (isResponseOK) {
        let isResponseOK = false;
        fetch(APIBaseURL + '/webmessages?' +
            'startdatetime=' + startDatetime.format('YYYY-MM-DDTHH:mm:ss') +
            '&enddatetime=' + endDatetime.format('YYYY-MM-DDTHH:mm:ss'), {
          method: 'GET',
          headers: {
            "Content-type": "application/json",
            "User-UUID": getCookieValue('user_uuid'),
            "Token": getCookieValue('token')
          },
          body: null,

        }).then(response => {
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        }).then(json => {
          if (isResponseOK) {
            console.log(json);
            setFetchSuccess(true);

            let notificationList = []

            if (json.length > 0) {
              json.forEach((currentValue, index) => {
                let notification = {}
                notification['id'] = json[index]['id'];
                notification['subject'] = json[index]['subject'];
                notification['created_datetime'] = moment(parseInt(json[index]['created_datetime']))
                    .format("YYYY-MM-DD HH:mm:ss");
                notification['message'] = json[index]['message'];
                notification['status'] = json[index]['status'];
                notification['url'] = json[index]['url'];

                notificationList.push(notification);
              });
            }

            setNotifications(notificationList);
            setSpinnerHidden(true);
          }
        });
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });
  };

  const handleAcknowledged = (id, ) => {
    console.log('Mark As Acknowledged: ', id)
    let isResponseOK = false;
    fetch(APIBaseURL + '/webmessages/' + id, {
      method: 'PUT',
      headers: {
        "Content-type": "application/json",
        "User-UUID": getCookieValue('user_uuid'),
        "Token": getCookieValue('token')
      },
      body: JSON.stringify({
        "data": {
          "status": 'acknowledged',
          "reply": 'OK'
        }
      }),
    }).then(response => {
      if (response.ok) {
        isResponseOK = true;
        return null;
      } else {
        return response.json();
      }
    }).then(json => {
      console.log(isResponseOK);
      if (isResponseOK) {
        let isResponseOK = false;
        fetch(APIBaseURL + '/webmessages?' +
            'startdatetime=' + startDatetime.format('YYYY-MM-DDTHH:mm:ss') +
            '&enddatetime=' + endDatetime.format('YYYY-MM-DDTHH:mm:ss'), {
          method: 'GET',
          headers: {
            "Content-type": "application/json",
            "User-UUID": getCookieValue('user_uuid'),
            "Token": getCookieValue('token')
          },
          body: null,

        }).then(response => {
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        }).then(json => {
          if (isResponseOK) {
            console.log(json);
            setFetchSuccess(true);

            let notificationList = []

            if (json.length > 0) {
              json.forEach((currentValue, index) => {
                let notification = {}
                notification['id'] = json[index]['id'];
                notification['subject'] = json[index]['subject'];
                notification['created_datetime'] = moment(parseInt(json[index]['created_datetime']))
                    .format("YYYY-MM-DD HH:mm:ss");
                notification['message'] = json[index]['message'];
                notification['status'] = json[index]['status'];
                notification['url'] = json[index]['url'];

                notificationList.push(notification);
              });
            }

            setNotifications(notificationList);
            setSpinnerHidden(true);
          }
        });
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });
  };

  const handledelete = (id, ) => {
    console.log('Delete: ', id)
    let isResponseOK = false;
    fetch(APIBaseURL + '/webmessages/' + id, {
      method: 'DELETE',
      headers: {
        "Content-type": "application/json",
        "User-UUID": getCookieValue('user_uuid'),
        "Token": getCookieValue('token')
      },
      body: null,
    }).then(response => {
      if (response.ok) {
        isResponseOK = true;
        return null;
      } else {
        return response.json();
      }
    }).then(json => {
      console.log(isResponseOK);
      if (isResponseOK) {
        let isResponseOK = false;
        fetch(APIBaseURL + '/webmessages?' +
            'startdatetime=' + startDatetime.format('YYYY-MM-DDTHH:mm:ss') +
            '&enddatetime=' + endDatetime.format('YYYY-MM-DDTHH:mm:ss'), {
          method: 'GET',
          headers: {
            "Content-type": "application/json",
            "User-UUID": getCookieValue('user_uuid'),
            "Token": getCookieValue('token')
          },
          body: null,

        }).then(response => {
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        }).then(json => {
          if (isResponseOK) {
            console.log(json);
            setFetchSuccess(true);

            let notificationList = []

            if (json.length > 0) {
              json.forEach((currentValue, index) => {
                let notification = {}
                notification['id'] = json[index]['id'];
                notification['subject'] = json[index]['subject'];
                notification['created_datetime'] = moment(parseInt(json[index]['created_datetime']))
                    .format("YYYY-MM-DD HH:mm:ss");
                notification['message'] = json[index]['message'];
                notification['status'] = json[index]['status'];
                notification['url'] = json[index]['url'];

                notificationList.push(notification);
              });
            }

            setNotifications(notificationList);
            setSpinnerHidden(true);
          }
        });
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });
  };


  return (
    <Fragment>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col sm={1}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="priority">
                    {t('Notification Priority')}
                  </Label>
                  <CustomInput type="select" id="bulk-select" 
                    value={priority}
                    onChange={({ target }) => {setPriority(target.value);}}>
                    <option value="all" key="all" >{t('View all')}</option>
                    <option value="LOW" key="low" >{t('Notification Low')}</option>
                    <option value="MEDIUM" key="medium" >{t('Notification Medium')}</option>
                    <option value="HIGH" key="high" >{t('Notification High')}</option>
                    <option value="CRITICAL" key="critical" >{t('Notification Critical')}</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm={1}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="status">
                    {t('Notification Status')}
                  </Label>
                  <CustomInput type="select" id="bulk-select"
                    value={status}
                    onChange={({ target }) => {setStatus(target.value);}}>
                    <option value="all" key="all" >{t('View all')}</option>
                    <option value="read" key="read" >{t('Notification Read')}</option>
                    <option value="new" key="unread" >{t('notification_NEW')}</option>
                    <option value="acknowledged" key="acknowledged" >{t('Notification Acknowledged')}</option>
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col sm={2}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="startDatetime">
                    {t('Reporting Period Begins')}
                  </Label>
                  <Datetime id='startDatetime'
                    value={startDatetime}
                    onChange={onStartDatetimeChange}
                    isValidDate={getStartDatetime}
                    closeOnSelect={true} />
                </FormGroup>
              </Col>
              <Col sm={2}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="endDatetime">
                    {t('Reporting Period Ends')}
                  </Label>
                  <Datetime id='endDatetime'
                    value={endDatetime}
                    onChange={onEndDatetimeChange}
                    isValidDate={getEndDatetime}
                    closeOnSelect={true} />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br></br>
                  <Spinner color="primary" hidden={spinnerHidden}  />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br></br>
                  <ButtonGroup id="submit">
                    <Button color="success" disabled={submitButtonDisabled} >{t('Submit')}</Button>
                  </ButtonGroup>
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <Card className="mb-3">
        <Spinner color="primary" hidden={spinnerHidden}  />
        <FalconCardHeader title={t('Notification List')} light={false}>
          {isSelected ? (
            <InputGroup size="sm" className="input-group input-group-sm">
              <CustomInput type="select" id="bulk-select">
                <option>{t('Bulk actions')}</option>
                <option value="MarkAsRead">{t('Notification Mark As Read')}</option>
                <option value="MarkAsAcknowledged">{t('Notification Mark As Acknowledged')}</option>
                <option value="Delete">{t('Notification Delete')}</option>
              </CustomInput>
              <Button color="falcon-default" size="sm" className="ml-2">
              {t('Notification Apply')}
                </Button>
            </InputGroup>
          ) : (
              <Fragment>
                
              </Fragment>
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
                      {getPaginationArray(paginationProps.totalSize, paginationProps.sizePerPage).map(pageNo => (
                        <Button
                          color={paginationProps.page === pageNo ? 'falcon-primary' : 'falcon-default'}
                          size="sm"
                          className="ml-2"
                          onClick={() => paginationProps.onPageChange(pageNo)}
                          key={pageNo}
                        >
                          {pageNo}
                        </Button>
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
