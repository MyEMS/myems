import React, { Fragment, useEffect, useState } from 'react';
import { Alert, Row, Col, Card, CardBody, Button, ButtonGroup, Form, FormGroup, Label, Spinner } from 'reactstrap';
import Summary from './Summary';
import FalconCardHeader from '../../common/FalconCardHeader';
import moment from 'moment';
import createMarkup from '../../../helpers/createMarkup';
import { isIterableArray } from '../../../helpers/utils';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { APIBaseURL } from '../../../config';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay} from 'date-fns';

const AdvacnedReporting = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
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
    }
  });

  useEffect(() => {
    let timer = setInterval(() => {
      let is_logged_in = getCookieValue('is_logged_in');
      if (is_logged_in === null || !is_logged_in) {
        setRedirectUrl(`/authentication/basic/login`);
        setRedirect(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // State
  // Query Parameters
  const [reportingPeriodDateRange, setReportingPeriodDateRange] = useState([current_moment.clone().startOf('month').toDate(), current_moment.toDate()]);
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
  const dateRangePickerStyle = { display: 'block', zIndex: 10};

  // button
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [spinnerHidden, setSpinnerHidden] = useState(true);

  //Results
  const [reports, setReports] = useState([]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  // Callback fired when value changed
  let onReportingPeriodChange = (DateRange) => {
    if(DateRange == null) {
      setReportingPeriodDateRange([null, null]);
      setSubmitButtonDisabled(true);
    } else {
      if (moment(DateRange[1]).format('HH:mm:ss') == '00:00:00') {
        // if the user did not change time value, set the default time to the end of day
        DateRange[1] = endOfDay(DateRange[1]);
      }
      setReportingPeriodDateRange([DateRange[0], DateRange[1]]);
      setSubmitButtonDisabled(false);
    }
  };

  // Callback fired when value clean
  let onReportingPeriodClean = event => {
    setReportingPeriodDateRange([null, null]);
  };

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit');
    console.log(moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss'));
    console.log(moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'));

    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);

    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/advancedreports?' +
      'reportingperiodstartdatetime=' + moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
      '&reportingperiodenddatetime=' + moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'), {
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
      };
      return response.json();
    }).then(json => {
      if (isResponseOK) {
        console.log(json);
        let reportList = []

        if (json.length > 0) {
          json.forEach((currentValue, index) => {
            let report = {}
            report['id'] = json[index]['id'];
            report['calendar'] = { month: json[index]['create_datetime_local'].substring(5, 7), 
            day: json[index]['create_datetime_local'].substring(8, 10) };
            report['title'] = json[index]['file_name'] + '.' + json[index]['file_type'];
            report['additional'] = t('Created Datetime') + ': ' + json[index]['create_datetime_local']  + '<br/>' +
            t('File Size') + ': ' + (json[index]['file_size_bytes']/(1024*1024)).toFixed(2) + ' MB';
            report['to'] = '#';
            report['file_bytes_base64'] = json[index]['file_bytes_base64'];

            reportList.push(report);
          });
        }
      
        setReports(reportList);

        // enable submit button
        setSubmitButtonDisabled(false);
        // hide spinner
        setSpinnerHidden(true);

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
              <Col xs="auto">
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="reportingPeriodDateRangePicker">{t('Reporting Period')}</Label>
                  <br/>
                  <DateRangePickerWrapper
                    id='reportingPeriodDateRangePicker'
                    format="yyyy-MM-dd HH:mm:ss"
                    value={reportingPeriodDateRange}
                    onChange={onReportingPeriodChange}
                    size="md"
                    style={dateRangePickerStyle}
                    onClean={onReportingPeriodClean}
                    locale={dateRangePickerLocale}
                    placeholder={t("Select Date Range")}
                  />
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
              <Col xs="auto">
                <FormGroup>
                  <br></br>
                  <Spinner color="primary" hidden={spinnerHidden}  />
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <Card>
        <FalconCardHeader title={t('Advanced Reporting')}></FalconCardHeader>
        <CardBody className="fs--1">
          {isIterableArray(reports) ? (
            <Row>
              {reports.map(({ additional, ...rest }, index) => (
                <Col md={6} className="h-100" key={index}>
                  <Summary  divider={reports.length !== index + 1} {...rest}>
                    <p className="text-1000 mb-0" dangerouslySetInnerHTML={createMarkup(additional)} />
                  </Summary>
                </Col>
              ))}
            </Row>
          ) : (
              <Alert color="info" className="mb-0">
                {t('No data found')}
              </Alert>
            )}
        </CardBody>
      </Card>
    </Fragment >
  );
};

export default withTranslation()(withRedirect(AdvacnedReporting));
