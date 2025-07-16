import React, { Fragment, useEffect, useState, useContext, useCallback } from 'react';
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
import MultiTrendChart from '../common/MultiTrendChart';
import MultipleLineChart from '../common/MultipleLineChart';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL, settings } from '../../../config';
import { periodTypeOptions } from '../common/PeriodTypeOptions';
import { comparisonTypeOptions } from '../common/ComparisonTypeOptions';
import { endOfDay } from 'date-fns';
import AppContext from '../../../context/Context';
import { Link, useLocation } from 'react-router-dom';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import blankPage from '../../../assets/img/generic/blank-page.png';

const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

const MeterEnergy = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
  const location = useLocation();
  const uuid = location.search.split('=')[1];
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

  // State
  //Query Form
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [meterList, setMeterList] = useState([]);
  const [filteredMeterList, setFilteredMeterList] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState(undefined);
  const [comparisonType, setComparisonType] = useState('month-on-month');
  const [periodType, setPeriodType] = useState('daily');
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [basePeriodDateRange, setBasePeriodDateRange] = useState([
    current_moment
      .clone()
      .subtract(1, 'months')
      .startOf('month')
      .toDate(),
    current_moment
      .clone()
      .subtract(1, 'months')
      .toDate()
  ]);
  const [basePeriodDateRangePickerDisabled, setBasePeriodDateRangePickerDisabled] = useState(true);
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
  const [spaceCascaderHidden, setSpaceCascaderHidden] = useState(false);
  const [meterSearchHidden, setMeterSearchHidden] = useState(false);
  const [resultDataHidden, setResultDataHidden] = useState(true);
  //Results
  const [meterEnergyCategory, setMeterEnergyCategory] = useState({ name: '', unit: '' });
  const [reportingPeriodEnergyConsumptionInCategory, setReportingPeriodEnergyConsumptionInCategory] = useState(0);
  const [reportingPeriodEnergyConsumptionRate, setReportingPeriodEnergyConsumptionRate] = useState('');
  const [reportingPeriodEnergyConsumptionInTCE, setReportingPeriodEnergyConsumptionInTCE] = useState(0);
  const [reportingPeriodEnergyConsumptionInCO2, setReportingPeriodEnergyConsumptionInCO2] = useState(0);
  const [basePeriodEnergyConsumptionInCategory, setBasePeriodEnergyConsumptionInCategory] = useState(0);
  const [meterBaseLabels, setMeterBaseLabels] = useState({ a0: [] });
  const [meterBaseData, setMeterBaseData] = useState({ a0: [] });
  const [meterReportingRates, setMeterReportingRates] = useState({ a0: [] });
  const [meterReportingLabels, setMeterReportingLabels] = useState({ a0: [] });
  const [meterReportingData, setMeterReportingData] = useState({ a0: [] });
  const [meterReportingOptions, setMeterReportingOptions] = useState([]);
  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([
    { dataField: 'startdatetime', text: t('Datetime'), sort: true }
  ]);
  const [detailedDataTableData, setDetailedDataTableData] = useState([]);
  const [excelBytesBase64, setExcelBytesBase64] = useState(undefined);

  const loadData = useCallback(
    url => {
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
      fetch(url, {
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
            if (uuid !== null && uuid) {
              setFilteredMeterList([{ id: json['meter']['id'], label: json['meter']['name'] }]);
              setSelectedMeter(json['meter']['id']);
            }
            setMeterEnergyCategory({
              name: json['meter']['energy_category_name'],
              unit: json['meter']['unit_of_measure']
            });
            setReportingPeriodEnergyConsumptionRate(
              parseFloat(json['reporting_period']['increment_rate'] * 100).toFixed(2) + '%'
            );
            setReportingPeriodEnergyConsumptionInCategory(json['reporting_period']['total_in_category']);
            setReportingPeriodEnergyConsumptionInTCE(json['reporting_period']['total_in_kgce'] / 1000);
            setReportingPeriodEnergyConsumptionInCO2(json['reporting_period']['total_in_kgco2e'] / 1000);
            setBasePeriodEnergyConsumptionInCategory(json['base_period']['total_in_category']);

            let names = [];
            names.push({ value: 'a0', label: json['meter']['energy_category_name'] });
            setMeterReportingOptions(names);

            let timestamps = {};
            timestamps['a0'] = json['reporting_period']['timestamps'];
            setMeterReportingLabels(timestamps);

            timestamps = {};
            timestamps['a0'] = json['base_period']['timestamps'];
            setMeterBaseLabels(timestamps);

            let rates = [];
            json['reporting_period']['rates'].forEach(rate => {
              rates.push(rate ? parseFloat(rate * 100).toFixed(2) : '0.00');
            });
            setMeterReportingRates({ a0: rates });

            let values = { a0: [] };
            json['reporting_period']['values'].forEach((currentValue, index) => {
              values['a0'][index] = currentValue.toFixed(2);
            });
            setMeterReportingData(values);

            values = { a0: [] };
            json['base_period']['values'].forEach((currentValue, index) => {
              values['a0'][index] = currentValue.toFixed(2);
            });
            setMeterBaseData(values);

            names = [];
            json['parameters']['names'].forEach((currentValue, index) => {
              names.push({ value: 'a' + index, label: currentValue });
            });
            setParameterLineChartOptions(names);

            timestamps = {};
            json['parameters']['timestamps'].forEach((currentValue, index) => {
              timestamps['a' + index] = currentValue;
            });
            setParameterLineChartLabels(timestamps);

            values = {};
            json['parameters']['values'].forEach((currentValue, index) => {
              values['a' + index] = currentValue;
            });
            setParameterLineChartData(values);

            if (comparisonType === 'none-comparison') {
              setDetailedDataTableColumns([
                {
                  dataField: 'startdatetime',
                  text: t('Datetime'),
                  sort: true
                },
                {
                  dataField: 'a0',
                  text: json['meter']['energy_category_name'] + ' (' + json['meter']['unit_of_measure'] + ')',
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
            } else {
              setDetailedDataTableColumns([
                {
                  dataField: 'startdatetime',
                  text: t('Datetime'),
                  sort: true
                },
                {
                  dataField: 'a0',
                  text: t('Base Period Consumption CATEGORY VALUE UNIT', {
                    CATEGORY: json['meter']['energy_category_name'],
                    VALUE: null,
                    UNIT: '(' + json['meter']['unit_of_measure'] + ')'
                  }),
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
                  text: t('Reporting Period Consumption CATEGORY VALUE UNIT', {
                    CATEGORY: json['meter']['energy_category_name'],
                    VALUE: null,
                    UNIT: '(' + json['meter']['unit_of_measure'] + ')'
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
            }

            if (comparisonType === 'none-comparison') {
              let detailed_value_list = [];
              json['reporting_period']['timestamps'].forEach((currentTimestamp, timestampIndex) => {
                let detailed_value = {};
                detailed_value['id'] = timestampIndex;
                detailed_value['startdatetime'] = currentTimestamp;
                detailed_value['a0'] = json['reporting_period']['values'][timestampIndex];
                detailed_value_list.push(detailed_value);
              });

              let detailed_value = {};
              detailed_value['id'] = detailed_value_list.length;
              detailed_value['startdatetime'] = t('Total');
              detailed_value['a0'] = json['reporting_period']['total_in_category'];
              detailed_value_list.push(detailed_value);
              setTimeout(() => {
                setDetailedDataTableData(detailed_value_list);
              }, 0);
            } else {
              let detailed_value_list = [];
              json['reporting_period']['timestamps'].forEach((currentTimestamp, timestampIndex) => {
                let detailed_value = {};
                detailed_value['id'] = timestampIndex;
                detailed_value['startdatetime'] = currentTimestamp;
                detailed_value['a0'] = json['base_period']['values'][timestampIndex];
                detailed_value['a1'] = json['reporting_period']['values'][timestampIndex];
                detailed_value_list.push(detailed_value);
              });

              let detailed_value = {};
              detailed_value['id'] = detailed_value_list.length;
              detailed_value['startdatetime'] = t('Total');
              detailed_value['a0'] = json['base_period']['total_in_category'];
              detailed_value['a1'] = json['reporting_period']['total_in_category'];
              detailed_value_list.push(detailed_value);
              setTimeout(() => {
                setDetailedDataTableData(detailed_value_list);
              }, 0);
            }
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
            toast.error(t(json.description));
            setSpinnerHidden(true);
            setSubmitButtonDisabled(false);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    [
      t,
      uuid,
      comparisonType,
      setSubmitButtonDisabled,
      setSpinnerHidden,
      setExportButtonHidden,
      setResultDataHidden,
      setDetailedDataTableData,
      setFilteredMeterList,
      setSelectedMeter,
      setMeterEnergyCategory,
      setReportingPeriodEnergyConsumptionRate,
      setReportingPeriodEnergyConsumptionInCategory,
      setReportingPeriodEnergyConsumptionInTCE,
      setReportingPeriodEnergyConsumptionInCO2,
      setBasePeriodEnergyConsumptionInCategory,
      setMeterReportingOptions,
      setMeterReportingLabels,
      setMeterBaseLabels,
      setMeterReportingRates,
      setMeterReportingData,
      setMeterBaseData,
      setParameterLineChartOptions,
      setParameterLineChartLabels,
      setParameterLineChartData,
      setDetailedDataTableColumns,
      setExcelBytesBase64
    ]
  );
  useEffect(() => {
    let isResponseOK = false;
    if (uuid === null || !uuid) {
      setSpaceCascaderHidden(false);
      setMeterSearchHidden(false);
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
                  toast.error(t(json.description));
                }
              })
              .catch(err => {
                console.log(err);
              });
            // end of get Meters by root Space ID
          } else {
            toast.error(t(json.description));
          }
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      setSpaceCascaderHidden(true);
      setMeterSearchHidden(true);
      let url =
        APIBaseURL +
        '/reports/meterenergy?' +
        'meteruuid=' +
        uuid +
        '&periodtype=' +
        periodType +
        '&baseperiodstartdatetime=' +
        (basePeriodDateRange[0] != null ? moment(basePeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') : '') +
        '&baseperiodenddatetime=' +
        (basePeriodDateRange[1] != null ? moment(basePeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') : '') +
        '&reportingperiodstartdatetime=' +
        moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
        '&reportingperiodenddatetime=' +
        moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
        '&language=' +
        language;
      loadData(url);
    }
  }, [uuid, periodType, basePeriodDateRange, reportingPeriodDateRange, language, loadData, t]);

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
          toast.error(t(json.description));
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

  let onComparisonTypeChange = ({ target }) => {
    setComparisonType(target.value);
    if (target.value === 'year-over-year') {
      setBasePeriodDateRangePickerDisabled(true);
      setBasePeriodDateRange([
        moment(reportingPeriodDateRange[0])
          .subtract(1, 'years')
          .toDate(),
        moment(reportingPeriodDateRange[1])
          .subtract(1, 'years')
          .toDate()
      ]);
    } else if (target.value === 'month-on-month') {
      setBasePeriodDateRangePickerDisabled(true);
      setBasePeriodDateRange([
        moment(reportingPeriodDateRange[0])
          .subtract(1, 'months')
          .toDate(),
        moment(reportingPeriodDateRange[1])
          .subtract(1, 'months')
          .toDate()
      ]);
    } else if (target.value === 'free-comparison') {
      setBasePeriodDateRangePickerDisabled(false);
      setBasePeriodDateRange([
        moment(reportingPeriodDateRange[0])
          .subtract(1, 'days')
          .toDate(),
        moment(reportingPeriodDateRange[1])
          .subtract(1, 'days')
          .toDate()
      ]);
    } else if (target.value === 'none-comparison') {
      setBasePeriodDateRange([null, null]);
      setBasePeriodDateRangePickerDisabled(true);
    }
  };

  // Callback fired when value changed
  let onBasePeriodChange = DateRange => {
    if (DateRange == null) {
      setBasePeriodDateRange([null, null]);
    } else {
      if (moment(DateRange[1]).format('HH:mm:ss') === '00:00:00') {
        // if the user did not change time value, set the default time to the end of day
        DateRange[1] = endOfDay(DateRange[1]);
      }
      setBasePeriodDateRange([DateRange[0], DateRange[1]]);
    }
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
      if (comparisonType === 'year-over-year') {
        setBasePeriodDateRange([
          moment(DateRange[0])
            .clone()
            .subtract(1, 'years')
            .toDate(),
          moment(DateRange[1])
            .clone()
            .subtract(1, 'years')
            .toDate()
        ]);
      } else if (comparisonType === 'month-on-month') {
        setBasePeriodDateRange([
          moment(DateRange[0])
            .clone()
            .subtract(1, 'months')
            .toDate(),
          moment(DateRange[1])
            .clone()
            .subtract(1, 'months')
            .toDate()
        ]);
      }
    }
  };

  // Callback fired when value clean
  let onBasePeriodClean = event => {
    setBasePeriodDateRange([null, null]);
  };

  // Callback fired when value clean
  let onReportingPeriodClean = event => {
    setReportingPeriodDateRange([null, null]);
  };

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    let url =
      APIBaseURL +
      '/reports/meterenergy?' +
      'meterid=' +
      selectedMeter +
      '&periodtype=' +
      periodType +
      '&baseperiodstartdatetime=' +
      (basePeriodDateRange[0] != null ? moment(basePeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') : '') +
      '&baseperiodenddatetime=' +
      (basePeriodDateRange[1] != null ? moment(basePeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') : '') +
      '&reportingperiodstartdatetime=' +
      moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
      '&reportingperiodenddatetime=' +
      moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
      '&language=' +
      language;
    loadData(url);
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileName = 'meterenergy.xlsx';
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
          <BreadcrumbItem active onClick={() => window.location.reload()}>
            <Link to="/meter/meterenergy">{t('Meter Energy')}</Link>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col xs={6} sm={3} hidden={spaceCascaderHidden}>
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
                    <Input placeholder={t('Search')} bsSize="sm" onChange={onSearchMeter} hidden={meterSearchHidden} />
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
              <Col xs="auto">
                <FormGroup>
                  <Label className={labelClasses} for="comparisonType">
                    {t('Comparison Types')}
                  </Label>
                  <CustomInput
                    type="select"
                    id="comparisonType"
                    name="comparisonType"
                    bsSize="sm"
                    defaultValue="month-on-month"
                    onChange={onComparisonTypeChange}
                  >
                    {comparisonTypeOptions.map((comparisonType, index) => (
                      <option value={comparisonType.value} key={comparisonType.value}>
                        {t(comparisonType.label)}
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
                  <Label className={labelClasses} for="basePeriodDateRangePicker">
                    {t('Base Period')}
                    {t('(Optional)')}
                  </Label>
                  <DateRangePickerWrapper
                    id="basePeriodDateRangePicker"
                    disabled={basePeriodDateRangePickerDisabled}
                    format="yyyy-MM-dd HH:mm:ss"
                    value={basePeriodDateRange}
                    onChange={onBasePeriodChange}
                    size="sm"
                    style={dateRangePickerStyle}
                    onClean={onBasePeriodClean}
                    locale={dateRangePickerLocale}
                    placeholder={t('Select Date Range')}
                  />
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
      <div style={{ visibility: resultDataHidden ? 'visible' : 'hidden', display: resultDataHidden ? '' : 'none' }}>
        <img className="img-fluid" src={blankPage} alt="" />
      </div>
      <div style={{ visibility: resultDataHidden ? 'hidden' : 'visible', display: resultDataHidden ? 'none' : '' }}>
        <div className="card-deck">
          <CardSummary
            rate={reportingPeriodEnergyConsumptionRate}
            title={t('Reporting Period Consumption CATEGORY UNIT', {
              CATEGORY: meterEnergyCategory['name'],
              UNIT: '(' + meterEnergyCategory['unit'] + ')'
            })}
            color="success"
          >
            <CountUp
              end={reportingPeriodEnergyConsumptionInCategory}
              duration={2}
              prefix=""
              separator=","
              decimals={2}
              decimal="."
            />
          </CardSummary>
          <CardSummary
            rate={reportingPeriodEnergyConsumptionRate}
            title={t('Reporting Period Consumption CATEGORY UNIT', {
              CATEGORY: t('Ton of Standard Coal'),
              UNIT: '(TCE)'
            })}
            color="warning"
          >
            <CountUp
              end={reportingPeriodEnergyConsumptionInTCE}
              duration={2}
              prefix=""
              separator=","
              decimal="."
              decimals={2}
            />
          </CardSummary>
          <CardSummary
            rate={reportingPeriodEnergyConsumptionRate}
            title={t('Reporting Period Consumption CATEGORY UNIT', {
              CATEGORY: t('Ton of Carbon Dioxide Emissions'),
              UNIT: '(T)'
            })}
            color="warning"
          >
            <CountUp
              end={reportingPeriodEnergyConsumptionInCO2}
              duration={2}
              prefix=""
              separator=","
              decimal="."
              decimals={2}
            />
          </CardSummary>
        </div>

        <MultiTrendChart
          reportingTitle={{
            name: 'Reporting Period Consumption CATEGORY VALUE UNIT',
            substitute: ['CATEGORY', 'VALUE', 'UNIT'],
            CATEGORY: { a0: meterEnergyCategory['name'] },
            VALUE: { a0: reportingPeriodEnergyConsumptionInCategory.toFixed(2) },
            UNIT: { a0: '(' + meterEnergyCategory['unit'] + ')' }
          }}
          baseTitle={{
            name: 'Base Period Consumption CATEGORY VALUE UNIT',
            substitute: ['CATEGORY', 'VALUE', 'UNIT'],
            CATEGORY: { a0: meterEnergyCategory['name'] },
            VALUE: { a0: basePeriodEnergyConsumptionInCategory.toFixed(2) },
            UNIT: { a0: '(' + meterEnergyCategory['unit'] + ')' }
          }}
          reportingTooltipTitle={{
            name: 'Reporting Period Consumption CATEGORY VALUE UNIT',
            substitute: ['CATEGORY', 'VALUE', 'UNIT'],
            CATEGORY: { a0: meterEnergyCategory['name'] },
            VALUE: null,
            UNIT: { a0: '(' + meterEnergyCategory['unit'] + ')' }
          }}
          baseTooltipTitle={{
            name: 'Base Period Consumption CATEGORY VALUE UNIT',
            substitute: ['CATEGORY', 'VALUE', 'UNIT'],
            CATEGORY: { a0: meterEnergyCategory['name'] },
            VALUE: null,
            UNIT: { a0: '(' + meterEnergyCategory['unit'] + ')' }
          }}
          reportingLabels={meterReportingLabels}
          reportingData={meterReportingData}
          baseLabels={meterBaseLabels}
          baseData={meterBaseData}
          rates={meterReportingRates}
          options={meterReportingOptions}
        />

        <MultipleLineChart
          reportingTitle={t('Operating Characteristic Curve')}
          baseTitle=""
          labels={parameterLineChartLabels}
          data={parameterLineChartData}
          options={parameterLineChartOptions}
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

export default withTranslation()(withRedirect(MeterEnergy));
