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
import MultipleLineChart from '../common/MultipleLineChart';
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

const ShopfloorComparison = ({ setRedirect, setRedirectUrl, t }) => {
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
  const [selectedSpaceName1, setSelectedSpaceName1] = useState(undefined);
  const [selectedSpaceName2, setSelectedSpaceName2] = useState(undefined);
  const [shopfloorList1, setShopfloorList1] = useState([]);
  const [shopfloorList2, setShopfloorList2] = useState([]);
  const [filteredShopfloorList1, setFilteredShopfloorList1] = useState([]);
  const [filteredShopfloorList2, setFilteredShopfloorList2] = useState([]);
  const [selectedShopfloor1, setSelectedShopfloor1] = useState(undefined);
  const [selectedShopfloor2, setSelectedShopfloor2] = useState(undefined);
  const [energyCategoryList, setEnergyCategoryList] = useState([]);
  const [selectedEnergyCategory, setSelectedEnergyCategory] = useState(undefined);
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

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);
  const [resultDataHidden, setResultDataHidden] = useState(true);
  //Results
  const [shopfloor1, setShopfloor1] = useState({
    id: undefined,
    name: undefined
  });
  const [shopfloor2, setShopfloor2] = useState({
    id: undefined,
    name: undefined
  });
  const [energyCategory, setEnergyCategory] = useState({
    id: undefined,
    name: undefined,
    unit_of_measure: undefined
  });
  const [reportingPeriodEnergyConsumptionInCategory1, setReportingPeriodEnergyConsumptionInCategory1] = useState(0);
  const [reportingPeriodEnergyConsumptionInCategory2, setReportingPeriodEnergyConsumptionInCategory2] = useState(0);
  const [reportingPeriodEnergyConsumptionInDifference, setReportingPeriodEnergyConsumptionInDifference] = useState(0);
  const [shopfloorLineChartData1, setShopfloorLineChartData1] = useState({ a0: [] });
  const [shopfloorLineChartData2, setShopfloorLineChartData2] = useState({ a0: [] });
  const [shopfloorLineChartLabels1, setShopfloorLineChartLabels1] = useState({ a0: [] });
  const [shopfloorLineChartLabels2, setShopfloorLineChartLabels2] = useState({ a0: [] });
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
          // rename keys
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
          // get Shopfloors by root Space ID
          let isResponseOK = false;
          fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/shopfloors', {
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

                setShopfloorList1(json[0]);
                setShopfloorList2(json[0]);
                setFilteredShopfloorList1(json[0]);
                setFilteredShopfloorList2(json[0]);
                if (json[0].length > 0) {
                  setSelectedShopfloor1(json[0][0].value);
                  setSelectedShopfloor2(json[0][0].value);
                } else {
                  setSelectedShopfloor1(undefined);
                  setSelectedShopfloor2(undefined);
                }
              } else {
                handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
              }
            })
            .catch(err => {
              console.log(err);
            });
          // end of get Shopfloors by root Space ID
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });

    // Load energy categories
    fetch(APIBaseURL + '/energycategories', {
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
          setEnergyCategoryList(json[0]);
          if (json[0].length > 0) {
            setSelectedEnergyCategory(json[0][0].value);
            // enable submit button
            setSubmitButtonDisabled(false);
          } else {
            setSelectedEnergyCategory(undefined);
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
  }, [t]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange1 = (value, selectedOptions) => {
    setSelectedSpaceName1(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/shopfloors', {
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

          setShopfloorList1(json[0]);
          setFilteredShopfloorList1(json[0]);
          if (json[0].length > 0) {
            setSelectedShopfloor1(json[0][0].value);
            // enable submit button
            setSubmitButtonDisabled(false);
          } else {
            setSelectedShopfloor1(undefined);
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

  let onSpaceCascaderChange2 = (value, selectedOptions) => {
    setSelectedSpaceName2(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/shopfloors', {
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

          setShopfloorList2(json[0]);
          setFilteredShopfloorList2(json[0]);
          if (json[0].length > 0) {
            setSelectedShopfloor2(json[0][0].value);
            // enable submit button
            setSubmitButtonDisabled(false);
          } else {
            setSelectedShopfloor2(undefined);
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

  const onSearchShopfloor1 = ({ target }) => {
    const keyword = target.value.toLowerCase();
    const filteredResult = shopfloorList1.filter(shopfloor => shopfloor.label.toLowerCase().includes(keyword));
    setFilteredShopfloorList1(keyword.length ? filteredResult : shopfloorList1);
    if (filteredResult.length > 0) {
      setSelectedShopfloor1(filteredResult[0].value);
      // enable submit button
      setSubmitButtonDisabled(false);
    } else {
      setSelectedShopfloor1(undefined);
      // disable submit button
      setSubmitButtonDisabled(true);
    }
    let customInputTarget = document.getElementById('shopfloorSelect1');
    customInputTarget.value = filteredResult[0].value;
  };

  const onSearchShopfloor2 = ({ target }) => {
    const keyword = target.value.toLowerCase();
    const filteredResult = shopfloorList2.filter(shopfloor => shopfloor.label.toLowerCase().includes(keyword));
    setFilteredShopfloorList2(keyword.length ? filteredResult : shopfloorList2);
    if (filteredResult.length > 0) {
      setSelectedShopfloor2(filteredResult[0].value);
      // enable submit button
      setSubmitButtonDisabled(false);
    } else {
      setSelectedShopfloor2(undefined);
      // disable submit button
      setSubmitButtonDisabled(true);
    }
    let customInputTarget = document.getElementById('shopfloorSelect2');
    customInputTarget.value = filteredResult[0].value;
  };

  // Callback fired when value changed
  let onReportingPeriodChange = DateRange => {
    if (DateRange == null) {
      setReportingPeriodDateRange([null, null]);
    } else {
      if (moment(DateRange[1]).format('HH:mm:ss') === '00:00:00') {
        // if the user did not change time value, set the default time to the end of day
        DateRange[1] = endOfDay(DateRange[1]);
      }
      setReportingPeriodDateRange([DateRange[0], DateRange[1]]);
      const dateDifferenceInSeconds = moment(DateRange[1]).valueOf() / 1000 - moment(DateRange[0]).valueOf() / 1000;
      if (periodType === 'hourly') {
        if (dateDifferenceInSeconds > 3 * 365 * 24 * 60 * 60) {
          // more than 3 years
          setPeriodType('yearly');
          document.getElementById('periodType').value = 'yearly';
        } else if (dateDifferenceInSeconds > 6 * 30 * 24 * 60 * 60) {
          // more than 6 months
          setPeriodType('monthly');
          document.getElementById('periodType').value = 'monthly';
        } else if (dateDifferenceInSeconds > 30 * 24 * 60 * 60) {
          // more than 30 days
          setPeriodType('daily');
          document.getElementById('periodType').value = 'daily';
        }
      } else if (periodType === 'daily') {
        if (dateDifferenceInSeconds >= 3 * 365 * 24 * 60 * 60) {
          // more than 3 years
          setPeriodType('yearly');
          document.getElementById('periodType').value = 'yearly';
        } else if (dateDifferenceInSeconds >= 6 * 30 * 24 * 60 * 60) {
          // more than 6 months
          setPeriodType('monthly');
          document.getElementById('periodType').value = 'monthly';
        }
      } else if (periodType === 'monthly') {
        if (dateDifferenceInSeconds >= 3 * 365 * 24 * 60 * 60) {
          // more than 3 years
          setPeriodType('yearly');
          document.getElementById('periodType').value = 'yearly';
        }
      }
    }
  };

  // Callback fired when value clean
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

    // Reinitialize tables
    setDetailedDataTableData([]);

    let isResponseOK = false;
    fetch(
      APIBaseURL +
        '/reports/shopfloorcomparison?' +
        'shopfloorid1=' +
        selectedShopfloor1 +
        '&shopfloorid2=' +
        selectedShopfloor2 +
        '&energycategoryid=' +
        selectedEnergyCategory +
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
          setShopfloor1({
            id: json['shopfloor1']['id'],
            name: json['shopfloor1']['name']
          });
          setShopfloor2({
            id: json['shopfloor2']['id'],
            name: json['shopfloor2']['name']
          });
          setEnergyCategory({
            id: json['energy_category']['id'],
            name: json['energy_category']['name'],
            unit_of_measure: json['energy_category']['unit_of_measure']
          });
          setReportingPeriodEnergyConsumptionInCategory1(json['reporting_period1']['total_in_category']);
          setReportingPeriodEnergyConsumptionInCategory2(json['reporting_period2']['total_in_category']);
          setReportingPeriodEnergyConsumptionInDifference(json['diff']['total_in_category']);
          let names1 = [];
          names1.push({ value: 'a0', label: json['energy_category']['name'] });

          let names2 = [];
          names2.push({ value: 'a0', label: json['energy_category']['name'] });

          let timestamps1 = {};
          timestamps1['a0'] = json['reporting_period1']['timestamps'];
          setShopfloorLineChartLabels1(timestamps1);

          let timestamps2 = {};
          timestamps2['a0'] = json['reporting_period2']['timestamps'];
          setShopfloorLineChartLabels2(timestamps2);

          let values1 = { a0: [] };
          json['reporting_period1']['values'].forEach((currentValue, index) => {
            values1['a0'][index] = currentValue === null ? null : currentValue.toFixed(2);
          });
          setShopfloorLineChartData1(values1);

          let values2 = { a0: [] };
          json['reporting_period2']['values'].forEach((currentValue, index) => {
            values2['a0'][index] = currentValue === null ? null : currentValue.toFixed(2);
          });
          setShopfloorLineChartData2(values2);

          setDetailedDataTableColumns([
            {
              dataField: 'startdatetime',
              text: t('Datetime'),
              sort: true
            },
            {
              dataField: 'a0',
              text:
                json['shopfloor1']['name'] +
                ' ' +
                json['energy_category']['name'] +
                ' (' +
                json['energy_category']['unit_of_measure'] +
                ')',
              sort: true,
              formatter: function(decimalValue) {
                if (typeof decimalValue === 'number') {
                  return decimalValue.toFixed(2);
                } else {
                  return null;
                }
              }
            },
            {
              dataField: 'a1',
              text:
                json['shopfloor2']['name'] +
                ' ' +
                json['energy_category']['name'] +
                ' (' +
                json['energy_category']['unit_of_measure'] +
                ')',
              sort: true,
              formatter: function(decimalValue) {
                if (typeof decimalValue === 'number') {
                  return decimalValue.toFixed(2);
                } else {
                  return null;
                }
              }
            },
            {
              dataField: 'a2',
              text: t('Reporting Period Difference CATEGORY UNIT', {
                CATEGORY: json['energy_category']['name'],
                UNIT: '(' + json['energy_category']['unit_of_measure'] + ')'
              }),
              sort: true,
              formatter: function(decimalValue) {
                if (typeof decimalValue === 'number') {
                  return decimalValue.toFixed(2);
                } else {
                  return null;
                }
              }
            }
          ]);

          let detailed_value_list = [];
          json['reporting_period1']['timestamps'].forEach((currentTimestamp, timestampIndex) => {
            let detailed_value = {};
            detailed_value['id'] = timestampIndex;
            detailed_value['startdatetime'] = currentTimestamp;
            detailed_value['a0'] = json['reporting_period1']['values'][timestampIndex];
            detailed_value['a1'] = json['reporting_period2']['values'][timestampIndex];
            detailed_value['a2'] = json['diff']['values'][timestampIndex];
            detailed_value_list.push(detailed_value);
          });

          let detailed_value = {};
          detailed_value['id'] = detailed_value_list.length;
          detailed_value['startdatetime'] = t('Total');
          detailed_value['a0'] = json['reporting_period1']['total_in_category'];
          detailed_value['a1'] = json['reporting_period2']['total_in_category'];
          detailed_value['a2'] = json['diff']['total_in_category'];
          detailed_value_list.push(detailed_value);
          setTimeout(() => {
            setDetailedDataTableData(detailed_value_list);
          }, 0);

          setExcelBytesBase64(json['excel_bytes_base64']);

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
          setSpinnerHidden(true);
          setSubmitButtonDisabled(false);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileName = 'shopfloorcomparison.xlsx';
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
          <BreadcrumbItem>{t('Shopfloor Data')}</BreadcrumbItem>
          <BreadcrumbItem active>{t('Shopfloor Comparison')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="space">
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
                  <Label className={labelClasses} for="shopfloorSelect1">
                    {t('Shopfloor')}1
                  </Label>

                  <Form inline>
                    <Input placeholder={t('Search')} bsSize="sm" onChange={onSearchShopfloor1} />
                    <CustomInput
                      type="select"
                      id="shopfloorSelect1"
                      name="shopfloorSelect1"
                      bsSize="sm"
                      onChange={({ target }) => setSelectedShopfloor1(target.value)}
                    >
                      {filteredShopfloorList1.map((shopfloor, index) => (
                        <option value={shopfloor.value} key={shopfloor.value}>
                          {shopfloor.label}
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
                  <Label className={labelClasses} for="space">
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
                  <Label className={labelClasses} for="shopfloorSelect2">
                    {t('Shopfloor')}2
                  </Label>

                  <Form inline>
                    <Input placeholder={t('Search')} bsSize="sm" onChange={onSearchShopfloor2} />
                    <CustomInput
                      type="select"
                      id="shopfloorSelect2"
                      name="shopfloorSelect2"
                      bsSize="sm"
                      onChange={({ target }) => setSelectedShopfloor2(target.value)}
                    >
                      {filteredShopfloorList2.map((shopfloor, index) => (
                        <option value={shopfloor.value} key={shopfloor.value}>
                          {shopfloor.label}
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
                  <Label className={labelClasses} for="energyCategorySelect">
                    {t('Energy Category')}
                  </Label>
                  <CustomInput
                    type="select"
                    id="energyCategorySelect"
                    name="energyCategorySelect"
                    bsSize="sm"
                    onChange={({ target }) => setSelectedEnergyCategory(target.value)}
                  >
                    {energyCategoryList.map((energyCategory, index) => (
                      <option value={energyCategory.value} key={energyCategory.value}>
                        {energyCategory.label}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
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
      <div className="blank-page-image-container" style={{ visibility: resultDataHidden ? 'visible' : 'hidden', display: resultDataHidden ? '' : 'none' }}>
        <img className="img-fluid" src={blankPage} alt="" />
      </div>
      <div style={{ visibility: resultDataHidden ? 'hidden' : 'visible', display: resultDataHidden ? 'none' : '' }}>
        <div className="card-deck">
          <CardSummary
            id="cardSummary1"
            title={t('SHOPFLOOR CATEGORY VALUE UNIT', {
              SHOPFLOOR: shopfloor1['name'],
              CATEGORY: energyCategory['name'],
              UNIT: '(' + energyCategory['unit_of_measure'] + ')'
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
            title={t('SHOPFLOOR CATEGORY VALUE UNIT', {
              SHOPFLOOR: shopfloor2['name'],
              CATEGORY: energyCategory['name'],
              UNIT: '(' + energyCategory['unit_of_measure'] + ')'
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
              CATEGORY: energyCategory['name'],
              UNIT: '(' + energyCategory['unit_of_measure'] + ')'
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
            name: 'SHOPFLOOR CATEGORY VALUE UNIT',
            substitute: ['SHOPFLOOR', 'CATEGORY', 'VALUE', 'UNIT'],
            SHOPFLOOR: { a0: shopfloor1['name'] },
            CATEGORY: { a0: energyCategory['name'] },
            VALUE: { a0: reportingPeriodEnergyConsumptionInCategory1.toFixed(2) },
            UNIT: { a0: '(' + energyCategory['unit_of_measure'] + ')' }
          }}
          reportingTitle={{
            name: 'SHOPFLOOR CATEGORY VALUE UNIT',
            substitute: ['SHOPFLOOR', 'CATEGORY', 'VALUE', 'UNIT'],
            SHOPFLOOR: { a0: shopfloor2['name'] },
            CATEGORY: { a0: energyCategory['name'] },
            VALUE: { a0: reportingPeriodEnergyConsumptionInCategory2.toFixed(2) },
            UNIT: { a0: '(' + energyCategory['unit_of_measure'] + ')' }
          }}
          baseTooltipTitle={{
            name: 'SHOPFLOOR CATEGORY VALUE UNIT',
            substitute: ['SHOPFLOOR', 'CATEGORY', 'VALUE', 'UNIT'],
            SHOPFLOOR: { a0: shopfloor1['name'] },
            CATEGORY: { a0: energyCategory['name'] },
            VALUE: null,
            UNIT: { a0: '(' + energyCategory['unit_of_measure'] + ')' }
          }}
          reportingTooltipTitle={{
            name: 'SHOPFLOOR CATEGORY VALUE UNIT',
            substitute: ['SHOPFLOOR', 'CATEGORY', 'VALUE', 'UNIT'],
            SHOPFLOOR: { a0: shopfloor2['name'] },
            CATEGORY: { a0: energyCategory['name'] },
            VALUE: null,
            UNIT: { a0: '(' + energyCategory['unit_of_measure'] + ')' }
          }}
          baseLabels={shopfloorLineChartLabels1}
          baseData={shopfloorLineChartData1}
          reportingLabels={shopfloorLineChartLabels2}
          reportingData={shopfloorLineChartData2}
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

export default withTranslation()(withRedirect(ShopfloorComparison));
