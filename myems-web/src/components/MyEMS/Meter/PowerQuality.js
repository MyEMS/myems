import React, { Fragment, useEffect, useState, useContext } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  Input,
  Label,
  CustomInput,
  Spinner
} from 'reactstrap';
import Cascader from 'rc-cascader';
import moment from 'moment';
import loadable from '@loadable/component';
import { getCookieValue, createCookie, checkEmpty,handleAPIError } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL, settings } from '../../../config';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay } from 'date-fns';
import AppContext from '../../../context/Context';
import MultipleLineChart from '../common/MultipleLineChart';
import blankPage from '../../../assets/img/generic/blank-page.png';

// Detailed data table removed

const PowerQuality = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
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
  }, [setRedirect, setRedirectUrl]);

  // State
  //Query Form
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [meterList, setMeterList] = useState([]);
  const [filteredMeterList, setFilteredMeterList] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState(undefined);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [reportingPeriodDateRange, setReportingPeriodDateRange] = useState([
    current_moment
      .clone()
      .subtract(1, 'day')
      .startOf('day')
      .toDate(),
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
  const { language } = useContext(AppContext);

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);
  const [resultDataHidden, setResultDataHidden] = useState(true);
  //Results
  const [meterLineChartOptions, setMeterLineChartOptions] = useState([]);
  const [meterLineChartData, setMeterLineChartData] = useState({});
  const [meterLineChartLabels, setMeterLineChartLabels] = useState([]);
  // removed operating characteristic curve module
  // detailed data table removed
  const [excelBytesBase64, setExcelBytesBase64] = useState(undefined);
  const [analysisResults, setAnalysisResults] = useState([]);

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/tree', {
      method: 'GET',
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
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          // rename keys
          json = JSON.parse(
            JSON.stringify([json])
              .split('"id":')
              .join('"value":')
              .split('"name":')
              .join('"label":')
          );
          setCascaderOptions(json);
          setSelectedSpaceName([json[0]].map(o => o.label));
          let selectedSpaceID = [json[0]].map(o => o.value);
          // get Meters by root Space ID
          let isResponseOK = false;
          fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/meters', {
            method: 'GET',
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
              }
              return response.json();
            })
            .then(json => {
              if (isResponseOK) {
                json = JSON.parse(
                  JSON.stringify([json])
                    .split('"id":')
                    .join('"value":')
                    .split('"name":')
                    .join('"label":')
                );

                setMeterList(json[0]);
                setFilteredMeterList(json[0]);
                if (json[0].length > 0) {
                  setSelectedMeter(json[0][0].value);
                  // enable submit button
                  setSubmitButtonDisabled(false);
                } else {
                  setSelectedMeter(undefined);
                  // disable submit button
                  setSubmitButtonDisabled(true);
                }
              } else {
                handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
              }
            })
            .catch(err => {
              console.log(err);
            });
          // end of get Meters by root Space ID
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, [t]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/meters', {
      method: 'GET',
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
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          json = JSON.parse(
            JSON.stringify([json])
              .split('"id":')
              .join('"value":')
              .split('"name":')
              .join('"label":')
          );

          setMeterList(json[0]);
          setFilteredMeterList(json[0]);
          if (json[0].length > 0) {
            setSelectedMeter(json[0][0].value);
            // enable submit button
            setSubmitButtonDisabled(false);
          } else {
            setSelectedMeter(undefined);
            // disable submit button
            setSubmitButtonDisabled(true);
          }
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const onSearchMeter = ({ target }) => {
    const keyword = target.value.toLowerCase();
    const filteredResult = meterList.filter(meter => meter.label.toLowerCase().includes(keyword));
    setFilteredMeterList(keyword.length ? filteredResult : meterList);
    if (filteredResult.length > 0) {
      setSelectedMeter(filteredResult[0].value);
      // enable submit button
      setSubmitButtonDisabled(false);
    } else {
      setSelectedMeter(undefined);
      // disable submit button
      setSubmitButtonDisabled(true);
    }
    let customInputTarget = document.getElementById('meterSelect');
    customInputTarget.value = filteredResult[0].value;
  };

  let onReportingPeriodChange = DateRange => {
    if (DateRange == null) {
      setReportingPeriodDateRange([null, null]);
    } else {
      if (moment(DateRange[1]).format('HH:mm:ss') === '00:00:00') {
        // if the user did not change time value, set the default time to the end of day
        DateRange[1] = endOfDay(DateRange[1]);
      }
      setReportingPeriodDateRange([DateRange[0], DateRange[1]]);
    }
  };

  let onReportingPeriodClean = event => {
    setReportingPeriodDateRange([null, null]);
  };

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide export button
    setExportButtonHidden(true);
    // hide result data
    setResultDataHidden(true);

    // detailed data table removed

    let isResponseOK = false;
    fetch(
      APIBaseURL +
        '/reports/powerquality?' +
        'meterid=' +
        selectedMeter +
        '&reportingperiodstartdatetime=' +
        moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
        '&reportingperiodenddatetime=' +
        moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
        '&language=' +
        language,
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
          let names = [];
          json['reporting_period']['names'].forEach((currentValue, index) => {
            names.push({ value: 'a' + index, label: currentValue });
          });
          setMeterLineChartOptions(names);

          let timestamps = {};
          json['reporting_period']['timestamps'].forEach((currentValue, index) => {
            timestamps['a' + index] = currentValue;
          });
          setMeterLineChartLabels(timestamps);

          let values = {};
          json['reporting_period']['values'].forEach((currentValue, index) => {
            values['a' + index] = currentValue;
          });
          setMeterLineChartData(values);

          // drop parameters-based chart parsing

          // detailed data table removed

          setExcelBytesBase64(json['excel_bytes_base64']);

          // analysis results
          setAnalysisResults(Array.isArray(json['analysis']) ? json['analysis'] : []);

          // enable submit button
          setSubmitButtonDisabled(false);
          // hide spinner
          setSpinnerHidden(true);
          // show export button
          setExportButtonHidden(false);
          // show result data
          setResultDataHidden(false);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileName = 'powerquality.xlsx';
    var fileUrl = 'data:' + mimeType + ';base64,' + excelBytesBase64;
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        var link = window.document.createElement('a');
        link.href = window.URL.createObjectURL(blob, { type: mimeType });
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  return (
    <Fragment>
      <div>
        <Breadcrumb>
          <BreadcrumbItem>{t('Meter Data')}</BreadcrumbItem>
          <BreadcrumbItem active>{t('Power Quality')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="space">
                    {t('Space')}
                  </Label>
                  <br />
                  <Cascader
                    options={cascaderOptions}
                    onChange={onSpaceCascaderChange}
                    changeOnSelect
                    expandTrigger="hover"
                  >
                    <Input bsSize="sm" value={selectedSpaceName || ''} readOnly />
                  </Cascader>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <Label className={labelClasses} for="meterSelect">
                    {t('Meter')}
                  </Label>
                  <Form inline>
                    <Input placeholder={t('Search')} bsSize="sm" onChange={onSearchMeter} />
                    <CustomInput
                      type="select"
                      id="meterSelect"
                      name="meterSelect"
                      bsSize="sm"
                      onChange={({ target }) => setSelectedMeter(target.value)}
                    >
                      {filteredMeterList.map((meter, index) => (
                        <option value={meter.value} key={meter.value}>
                          {meter.label}
                        </option>
                      ))}
                    </CustomInput>
                  </Form>
                </FormGroup>
              </Col>
              <Col xs={6} sm={3}>
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
                    onClean={onReportingPeriodClean}
                    locale={dateRangePickerLocale}
                    placeholder={t('Select Date Range')}
                  />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br />
                  <ButtonGroup id="submit">
                    <Button size="sm" color="success" disabled={submitButtonDisabled}>
                      {t('Submit')}
                    </Button>
                  </ButtonGroup>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br />
                  <Spinner color="primary" hidden={spinnerHidden} />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <br />
                <ButtonIcon
                  icon="external-link-alt"
                  transform="shrink-3 down-2"
                  color="falcon-default"
                  size="sm"
                  hidden={exportButtonHidden}
                  onClick={handleExport}
                >
                  {t('Export')}
                </ButtonIcon>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <div className="blank-page-image-container" style={{ visibility: resultDataHidden ? 'visible' : 'hidden', display: resultDataHidden ? '' : 'none' }}>
        <img className="img-fluid" src={blankPage} alt="" />
      </div>
      <div style={{ visibility: resultDataHidden ? 'hidden' : 'visible', display: resultDataHidden ? 'none' : '' }}>
        <MultipleLineChart
          reportingTitle={t('Trend Values')}
          baseTitle
          labels={meterLineChartLabels}
          data={meterLineChartData}
          options={meterLineChartOptions}
        />

        {/* Operating Characteristic Curve removed */}
        {/* Power Quality Analysis Section */}
        {analysisResults.length > 0 && (
          <Card className="mb-3">
            <CardBody className="p-3">
              <h6 className="mb-3">{t('Power Quality')}</h6>
              {analysisResults.map((item, idx) => (
                <div key={idx} className="mb-3">
                  <div className="font-weight-semi-bold">{item.point_name}</div>
                  <div className="text-500 mb-1">
                    {t('Category')}: {t(item.category)}
                    {item.type ? (
                      <>
                        &nbsp; / &nbsp; {t('Type')}: {t(item.type)}
                      </>
                    ) : null}
                    &nbsp; / &nbsp; {t('Unit')}: {item.unit}
                  </div>
                  <Row className="mb-2">
                    {item.limit_pct !== undefined && (
                      <Col xs={6} sm={4} md={3} lg={2} className="mb-2">
                        <div className="text-600">{t('Limit')}</div>
                        <div>{Number(item.limit_pct).toFixed(2)}%</div>
                      </Col>
                    )}
                    {item.limit_normal_hz !== undefined && (
                      <Col xs={6} sm={4} md={3} lg={2} className="mb-2">
                        <div className="text-600">{t('Normal Limit')}</div>
                        <div>{Number(item.limit_normal_hz).toFixed(3)} {t('Hz')}</div>
                      </Col>
                    )}
                    {item.limit_severe_hz !== undefined && (
                      <Col xs={6} sm={4} md={3} lg={2} className="mb-2">
                        <div className="text-600">{t('Severe Limit')}</div>
                        <div>{Number(item.limit_severe_hz).toFixed(3)} {t('Hz')}</div>
                      </Col>
                    )}
                    {item.compliance_pct !== undefined && (
                      <Col xs={6} sm={4} md={3} lg={2} className="mb-2">
                        <div className="text-600">{t('Compliance')}</div>
                        <div>{Number(item.compliance_pct).toFixed(2)}%</div>
                      </Col>
                    )}
                    {item.severe_exceed_count !== undefined && (
                      <Col xs={6} sm={4} md={3} lg={2} className="mb-2">
                        <div className="text-600">{t('Severe Exceed Count')}</div>
                        <div>{item.severe_exceed_count}</div>
                      </Col>
                    )}
                    {item.worst_abs_deviation_pct !== undefined && (
                      <Col xs={6} sm={4} md={3} lg={2} className="mb-2">
                        <div className="text-600">{t('Worst Deviation')}</div>
                        <div>{Number(item.worst_abs_deviation_pct).toFixed(2)}%</div>
                      </Col>
                    )}
                    {item.worst_deviation_hz !== undefined && (
                      <Col xs={6} sm={4} md={3} lg={2} className="mb-2">
                        <div className="text-600">{t('Worst Deviation')}</div>
                        <div>{Number(item.worst_deviation_hz).toFixed(3)} {t('Hz')}</div>
                      </Col>
                    )}
                    {item.worst_unbalance_pct !== undefined && (
                      <Col xs={6} sm={4} md={3} lg={2} className="mb-2">
                        <div className="text-600">{t('Worst Unbalance')}</div>
                        <div>{Number(item.worst_unbalance_pct).toFixed(2)}%</div>
                      </Col>
                    )}
                    {item.worst_time && (
                      <Col xs={12} sm={8} md={6} lg={4} className="mb-2">
                        <div className="text-600">{t('Worst Time')}</div>
                        <div>{item.worst_time}</div>
                      </Col>
                    )}
                  </Row>
                  <Row>
                    {Array.isArray(item.metrics) && item.metrics.map((m, mi) => (
                      <Col xs={6} sm={4} md={3} lg={2} key={mi} className="mb-2">
                        <div className="text-600">{t(m.name)}</div>
                        <div>{typeof m.value === 'number' ? Number(m.value).toFixed(3) : m.value}</div>
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </CardBody>
          </Card>
        )}
        {/* detailed data table removed */}
        <Card className="bg-light mt-3">
          <CardBody className="p-3">
            <div className="text-600 mb-2">{t('About Power Quality')}</div>
            <div className="text-500" style={{ lineHeight: 1.6 }}>{t('PQ.About')}</div>
          </CardBody>
        </Card>
      </div>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(PowerQuality));
