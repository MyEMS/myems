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
import CountUp from 'react-countup';
import moment from 'moment';
import loadable from '@loadable/component';
import Cascader from 'rc-cascader';
import CardSummary from '../common/CardSummary';
import { getCookieValue, createCookie, checkEmpty,handleAPIError } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL, settings } from '../../../config';
import { periodTypeOptions } from '../common/PeriodTypeOptions';
import MultiTrendChart from '../common/MultiTrendChart';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay } from 'date-fns';
import AppContext from '../../../context/Context';
import blankPage from '../../../assets/img/generic/blank-page.png';

const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

const VirtualMeterComparison = ({ setRedirect, setRedirectUrl, t }) => {
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
  const [selectedSpaceName1, setSelectedSpaceName1] = useState(undefined);
  const [selectedSpaceName2, setSelectedSpaceName2] = useState(undefined);
  const [virtualMeterList1, setVirtualMeterList1] = useState([]);
  const [virtualMeterList2, setVirtualMeterList2] = useState([]);
  const [filteredVirtualMeterList1, setFilteredVirtualMeterList1] = useState([]);
  const [filteredVirtualMeterList2, setFilteredVirtualMeterList2] = useState([]);
  const [selectedVirtualMeter1, setSelectedVirtualMeter1] = useState(undefined);
  const [selectedVirtualMeter2, setSelectedVirtualMeter2] = useState(undefined);
  const [periodType, setPeriodType] = useState('daily');
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [reportingPeriodDateRange, setReportingPeriodDateRange] = useState([
    current_moment
      .clone()
      .startOf('month')
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

  // Buttons state
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);
  const [resultDataHidden, setResultDataHidden] = useState(true);

  // Results state
  const [virtualMeter1, setVirtualMeter1] = useState({
    name: undefined,
    energy_category_id: undefined,
    energy_category_name: undefined,
    unit_of_measure: undefined
  });
  const [virtualMeter2, setVirtualMeter2] = useState({
    name: undefined,
    energy_category_id: undefined,
    energy_category_name: undefined,
    unit_of_measure: undefined
  });
  const [reportingPeriodEnergyConsumptionInCategory1, setReportingPeriodEnergyConsumptionInCategory1] = useState(0);
  const [reportingPeriodEnergyConsumptionInCategory2, setReportingPeriodEnergyConsumptionInCategory2] = useState(0);
  const [reportingPeriodEnergyConsumptionInDifference, setReportingPeriodEnergyConsumptionInDifference] = useState(0);
  const [virtualMeterLineChartData1, setVirtualMeterLineChartData1] = useState({ a0: [] });
  const [virtualMeterLineChartData2, setVirtualMeterLineChartData2] = useState({ a0: [] });
  const [virtualMeterLineChartLabels1, setVirtualMeterLineChartLabels1] = useState({ a0: [] });
  const [virtualMeterLineChartLabels2, setVirtualMeterLineChartLabels2] = useState({ a0: [] });
  const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([
    { dataField: 'startdatetime', text: t('Datetime'), sort: true }
  ]);
  const [detailedDataTableData, setDetailedDataTableData] = useState([]);
  const [excelBytesBase64, setExcelBytesBase64] = useState(undefined);

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
          json = JSON.parse(
            JSON.stringify([json])
              .split('"id":')
              .join('"value":')
              .split('"name":')
              .join('"label":')
          );
          setCascaderOptions(json);
          setSelectedSpaceName1([json[0]].map(o => o.label));
          setSelectedSpaceName2([json[0]].map(o => o.label));
          let selectedSpaceID = [json[0]].map(o => o.value);

          // 获取虚拟表列表（核心修改：接口路径改为虚拟表）
          let isResponseOK = false;
          fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/virtualmeters', {
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

                setVirtualMeterList1(json[0]);
                setVirtualMeterList2(json[0]);
                setFilteredVirtualMeterList1(json[0]);
                setFilteredVirtualMeterList2(json[0]);
                if (json[0].length > 0) {
                  setSelectedVirtualMeter1(json[0][0].value);
                  setSelectedVirtualMeter2(json[0][0].value);
                  setSubmitButtonDisabled(false);
                } else {
                  setSelectedVirtualMeter1(undefined);
                  setSelectedVirtualMeter2(undefined);
                  setSubmitButtonDisabled(true);
                }
              } else {
                handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
              }
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, [t]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange1 = (value, selectedOptions) => {
    setSelectedSpaceName1(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/virtualmeters', {
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

          setVirtualMeterList1(json[0]);
          setFilteredVirtualMeterList1(json[0]);
          if (json[0].length > 0) {
            setSelectedVirtualMeter1(json[0][0].value);
            setSubmitButtonDisabled(false);
          } else {
            setSelectedVirtualMeter1(undefined);
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

  let onSpaceCascaderChange2 = (value, selectedOptions) => {
    setSelectedSpaceName2(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/virtualmeters', {
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

          setVirtualMeterList2(json[0]);
          setFilteredVirtualMeterList2(json[0]);
          if (json[0].length > 0) {
            setSelectedVirtualMeter2(json[0][0].value);
            setSubmitButtonDisabled(false);
          } else {
            setSelectedVirtualMeter2(undefined);
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

  const onSearchVirtualMeter1 = ({ target }) => {
    const keyword = target.value.toLowerCase();
    const filteredResult = virtualMeterList1.filter(meter => meter.label.toLowerCase().includes(keyword));
    setFilteredVirtualMeterList1(keyword.length ? filteredResult : virtualMeterList1);
    if (filteredResult.length > 0) {
      setSelectedVirtualMeter1(filteredResult[0].value);
      setSubmitButtonDisabled(false);
    } else {
      setSelectedVirtualMeter1(undefined);
      setSubmitButtonDisabled(true);
    }
    let customInputTarget = document.getElementById('virtualMeterSelect1');
    customInputTarget.value = filteredResult[0]?.value || '';
  };

  const onSearchVirtualMeter2 = ({ target }) => {
    const keyword = target.value.toLowerCase();
    const filteredResult = virtualMeterList2.filter(meter => meter.label.toLowerCase().includes(keyword));
    setFilteredVirtualMeterList2(keyword.length ? filteredResult : virtualMeterList2);
    if (filteredResult.length > 0) {
      setSelectedVirtualMeter2(filteredResult[0].value);
      setSubmitButtonDisabled(false);
    } else {
      setSelectedVirtualMeter2(undefined);
      setSubmitButtonDisabled(true);
    }
    let customInputTarget = document.getElementById('virtualMeterSelect2');
    customInputTarget.value = filteredResult[0]?.value || '';
  };

  let onReportingPeriodChange = DateRange => {
    if (DateRange == null) {
      setReportingPeriodDateRange([null, null]);
    } else {
      if (moment(DateRange[1]).format('HH:mm:ss') === '00:00:00') {
        DateRange[1] = endOfDay(DateRange[1]);
      }
      setReportingPeriodDateRange([DateRange[0], DateRange[1]]);
      const dateDifferenceInSeconds = moment(DateRange[1]).valueOf() / 1000 - moment(DateRange[0]).valueOf() / 1000;
      if (periodType === 'hourly') {
        if (dateDifferenceInSeconds > 3 * 365 * 24 * 60 * 60) {
          setPeriodType('yearly');
          document.getElementById('periodType').value = 'yearly';
        } else if (dateDifferenceInSeconds > 6 * 30 * 24 * 60 * 60) {
          setPeriodType('monthly');
          document.getElementById('periodType').value = 'monthly';
        } else if (dateDifferenceInSeconds > 30 * 24 * 60 * 60) {
          setPeriodType('daily');
          document.getElementById('periodType').value = 'daily';
        }
      } else if (periodType === 'daily') {
        if (dateDifferenceInSeconds >= 3 * 365 * 24 * 60 * 60) {
          setPeriodType('yearly');
          document.getElementById('periodType').value = 'yearly';
        } else if (dateDifferenceInSeconds >= 6 * 30 * 24 * 60 * 60) {
          setPeriodType('monthly');
          document.getElementById('periodType').value = 'monthly';
        }
      } else if (periodType === 'monthly') {
        if (dateDifferenceInSeconds >= 3 * 365 * 24 * 60 * 60) {
          setPeriodType('yearly');
          document.getElementById('periodType').value = 'yearly';
        }
      }
    }
  };

  let onReportingPeriodClean = event => {
    setReportingPeriodDateRange([null, null]);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitButtonDisabled(true);
    setSpinnerHidden(false);
    setExportButtonHidden(true);
    setResultDataHidden(true);
    setDetailedDataTableData([]);

    let isResponseOK = false;
    fetch(
      APIBaseURL +
        '/reports/virtualmetercomparison?' +
        'virtualmeterid1=' +
        selectedVirtualMeter1 +
        '&virtualmeterid2=' +
        selectedVirtualMeter2 +
        '&periodtype=' +
        periodType +
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
          setVirtualMeter1({
            name: json['virtualmeter1']['name'],
            energy_category_id: json['virtualmeter1']['energy_category_id'],
            energy_category_name: json['virtualmeter1']['energy_category_name'],
            unit_of_measure: json['virtualmeter1']['unit_of_measure']
          });
          setVirtualMeter2({
            name: json['virtualmeter2']['name'],
            energy_category_id: json['virtualmeter2']['energy_category_id'],
            energy_category_name: json['virtualmeter2']['energy_category_name'],
            unit_of_measure: json['virtualmeter2']['unit_of_measure']
          });

          setReportingPeriodEnergyConsumptionInCategory1(json['reporting_period1']['total_in_category']);
          setReportingPeriodEnergyConsumptionInCategory2(json['reporting_period2']['total_in_category']);
          setReportingPeriodEnergyConsumptionInDifference(json['diff']['total_in_category']);

          let timestamps1 = { a0: json['reporting_period1']['timestamps'] };
          setVirtualMeterLineChartLabels1(timestamps1);
          let timestamps2 = { a0: json['reporting_period2']['timestamps'] };
          setVirtualMeterLineChartLabels2(timestamps2);

          let values1 = { a0: [] };
          json['reporting_period1']['values'].forEach((val, idx) => {
            values1['a0'][idx] = val.toFixed(2);
          });
          setVirtualMeterLineChartData1(values1);

          let values2 = { a0: [] };
          json['reporting_period2']['values'].forEach((val, idx) => {
            values2['a0'][idx] = val.toFixed(2);
          });
          setVirtualMeterLineChartData2(values2);

          setDetailedDataTableColumns([
            {
              dataField: 'startdatetime',
              text: t('Datetime'),
              sort: true
            },
            {
              dataField: 'a0',
              text:
                json['virtualmeter1']['name'] +
                json['virtualmeter1']['energy_category_name'] +
                ' (' +
                json['virtualmeter1']['unit_of_measure'] +
                ')',
              sort: true,
              formatter: (val) => val !== undefined ? val.toFixed(2) : null
            },
            {
              dataField: 'a1',
              text:
                json['virtualmeter2']['name'] +
                json['virtualmeter2']['energy_category_name'] +
                ' (' +
                json['virtualmeter2']['unit_of_measure'] +
                ')',
              sort: true,
              formatter: (val) => val !== undefined ? val.toFixed(2) : null
            },
            {
              dataField: 'a2',
              text: t('Reporting Period Difference CATEGORY UNIT', {
                CATEGORY: json['virtualmeter1']['energy_category_name'],
                UNIT: '(' + json['virtualmeter1']['unit_of_measure'] + ')'
              }),
              sort: true,
              formatter: (val) => val !== undefined ? val.toFixed(2) : null
            }
          ]);

          let detailedData = [];
          json['reporting_period1']['timestamps'].forEach((timestamp, idx) => {
            detailedData.push({
              id: idx,
              startdatetime: timestamp,
              a0: json['reporting_period1']['values'][idx],
              a1: json['reporting_period2']['values'][idx],
              a2: json['diff']['values'][idx]
            });
          });
          detailedData.push({
            id: detailedData.length,
            startdatetime: t('Total'),
            a0: json['reporting_period1']['total_in_category'],
            a1: json['reporting_period2']['total_in_category'],
            a2: json['diff']['total_in_category']
          });
          setTimeout(() => {
            setDetailedDataTableData(detailedData);
          }, 0);

          setExcelBytesBase64(json['excel_bytes_base64']);

          setSubmitButtonDisabled(false);
          setSpinnerHidden(true);
          setExportButtonHidden(false);
          setResultDataHidden(false);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
          setSpinnerHidden(true);
          setSubmitButtonDisabled(false);
        }
      })
      .catch(err => {
        console.log(err);
        setSpinnerHidden(true);
        setSubmitButtonDisabled(false);
      });
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileName = 'virtualmetercomparison.xlsx';
    const fileUrl = 'data:' + mimeType + ';base64,' + excelBytesBase64;
    fetch(fileUrl)
      .then(response => response.blob())
      .then(blob => {
        const link = window.document.createElement('a');
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
          <BreadcrumbItem active>{t('Virtual Meter Comparison')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="space1">
                    {t('Space')}1
                  </Label>
                  <br />
                  <Cascader
                    options={cascaderOptions}
                    onChange={onSpaceCascaderChange1}
                    changeOnSelect
                    expandTrigger="hover"
                  >
                    <Input bsSize="sm" value={selectedSpaceName1 || ''} readOnly />
                  </Cascader>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <Label className={labelClasses} for="virtualMeterSelect1">
                    {t('Virtual Meter')}1
                  </Label>
                  <Form inline>
                    <Input placeholder={t('Search')} bsSize="sm" onChange={onSearchVirtualMeter1} />
                    <CustomInput
                      type="select"
                      id="virtualMeterSelect1"
                      name="virtualMeterSelect1"
                      bsSize="sm"
                      onChange={({ target }) => setSelectedVirtualMeter1(target.value)}
                    >
                      {filteredVirtualMeterList1.map((meter, index) => (
                        <option value={meter.value} key={meter.value}>
                          {meter.label}
                        </option>
                      ))}
                    </CustomInput>
                  </Form>
                </FormGroup>
              </Col>
            </Row>
            <Row form>
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="space2">
                    {t('Space')}2
                  </Label>
                  <br />
                  <Cascader
                    options={cascaderOptions}
                    onChange={onSpaceCascaderChange2}
                    changeOnSelect
                    expandTrigger="hover"
                  >
                    <Input value={selectedSpaceName2 || ''} readOnly />
                  </Cascader>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <Label className={labelClasses} for="virtualMeterSelect2">
                    {t('Virtual Meter')}2
                  </Label>
                  <Form inline>
                    <Input placeholder={t('Search')} bsSize="sm" onChange={onSearchVirtualMeter2} />
                    <CustomInput
                      type="select"
                      id="virtualMeterSelect2"
                      name="virtualMeterSelect2"
                      bsSize="sm"
                      onChange={({ target }) => setSelectedVirtualMeter2(target.value)}
                    >
                      {filteredVirtualMeterList2.map((meter, index) => (
                        <option value={meter.value} key={meter.value}>
                          {meter.label}
                        </option>
                      ))}
                    </CustomInput>
                  </Form>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs="auto">
                <FormGroup>
                  <Label className={labelClasses} for="periodType">
                    {t('Period Types')}
                  </Label>
                  <CustomInput
                    type="select"
                    id="periodType"
                    name="periodType"
                    bsSize="sm"
                    defaultValue="daily"
                    onChange={({ target }) => setPeriodType(target.value)}
                  >
                    {periodTypeOptions.map((periodType, index) => (
                      <option value={periodType.value} key={periodType.value}>
                        {t(periodType.label)}
                      </option>
                    ))}
                  </CustomInput>
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
      {/* 空白状态 */}
      <div
        className="blank-page-image-container"
        style={{
          visibility: resultDataHidden ? 'visible' : 'hidden',
          display: resultDataHidden ? '' : 'none'
        }}
      >
        <img className="img-fluid" src={blankPage} alt="" />
      </div>
      <div
        style={{
          visibility: resultDataHidden ? 'hidden' : 'visible',
          display: resultDataHidden ? 'none' : ''
        }}
      >
        <div className="card-deck">
          <CardSummary
            id="cardSummary1"
            title={t('METER CATEGORY VALUE UNIT', {
              METER: virtualMeter1['name'],
              CATEGORY: virtualMeter1['energy_category_name'],
              UNIT: '(' + virtualMeter1['unit_of_measure'] + ')'
            })}
            color="success"
          >
            <CountUp
              end={reportingPeriodEnergyConsumptionInCategory1}
              duration={2}
              prefix=""
              separator=","
              decimals={2}
              decimal="."
            />
          </CardSummary>
          <CardSummary
            id="cardSummary2"
            title={t('METER CATEGORY VALUE UNIT', {
              METER: virtualMeter2['name'],
              CATEGORY: virtualMeter2['energy_category_name'],
              UNIT: '(' + virtualMeter2['unit_of_measure'] + ')'
            })}
            color="success"
          >
            <CountUp
              end={reportingPeriodEnergyConsumptionInCategory2}
              duration={2}
              prefix=""
              separator=","
              decimals={2}
              decimal="."
            />
          </CardSummary>
          <CardSummary
            id="cardSummary3"
            title={t('Reporting Period Difference CATEGORY UNIT', {
              CATEGORY: virtualMeter1['energy_category_name'],
              UNIT: '(' + virtualMeter1['unit_of_measure'] + ')'
            })}
            color="success"
          >
            <CountUp
              end={reportingPeriodEnergyConsumptionInDifference}
              duration={2}
              prefix=""
              separator=","
              decimals={2}
              decimal="."
            />
          </CardSummary>
        </div>

        <MultiTrendChart
          baseTitle={{
            name: 'METER CATEGORY VALUE UNIT',
            substitute: ['METER', 'CATEGORY', 'VALUE', 'UNIT'],
            METER: { a0: virtualMeter1['name'] },
            CATEGORY: { a0: virtualMeter1['energy_category_name'] },
            VALUE: { a0: reportingPeriodEnergyConsumptionInCategory1.toFixed(2) },
            UNIT: { a0: '(' + virtualMeter1['unit_of_measure'] + ')' }
          }}
          reportingTitle={{
            name: 'METER CATEGORY VALUE UNIT',
            substitute: ['METER', 'CATEGORY', 'VALUE', 'UNIT'],
            METER: { a0: virtualMeter2['name'] },
            CATEGORY: { a0: virtualMeter2['energy_category_name'] },
            VALUE: { a0: reportingPeriodEnergyConsumptionInCategory2.toFixed(2) },
            UNIT: { a0: '(' + virtualMeter2['unit_of_measure'] + ')' }
          }}
          baseTooltipTitle={{
            name: 'METER CATEGORY VALUE UNIT',
            substitute: ['METER', 'CATEGORY', 'VALUE', 'UNIT'],
            METER: { a0: virtualMeter1['name'] },
            CATEGORY: { a0: virtualMeter1['energy_category_name'] },
            VALUE: null,
            UNIT: { a0: '(' + virtualMeter1['unit_of_measure'] + ')' }
          }}
          reportingTooltipTitle={{
            name: 'METER CATEGORY VALUE UNIT',
            substitute: ['METER', 'CATEGORY', 'VALUE', 'UNIT'],
            METER: { a0: virtualMeter2['name'] },
            CATEGORY: { a0: virtualMeter2['energy_category_name'] },
            VALUE: null,
            UNIT: { a0: '(' + virtualMeter2['unit_of_measure'] + ')' }
          }}
          baseLabels={virtualMeterLineChartLabels1}
          baseData={virtualMeterLineChartData1}
          reportingLabels={virtualMeterLineChartLabels2}
          reportingData={virtualMeterLineChartData2}
          rates={{ a0: [] }}
        />

        <br />
        <DetailedDataTable
          data={detailedDataTableData}
          title={t('Detailed Data')}
          columns={detailedDataTableColumns}
          pagesize={50}
        />
      </div>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(VirtualMeterComparison));