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
import MultiTrendChart from '../common/MultiTrendChart';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL, settings } from '../../../config';
import { periodTypeOptions } from '../common/PeriodTypeOptions';
import { comparisonTypeOptions } from '../common/ComparisonTypeOptions';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay } from 'date-fns';
import AppContext from '../../../context/Context';
import MultipleLineChart from '../common/MultipleLineChart';
import blankPage from '../../../assets/img/generic/blank-page.png';

const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

const ShopfloorLoad = ({ setRedirect, setRedirectUrl, t }) => {
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
  // Query Parameters
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [shopfloorList, setShopfloorList] = useState([]);
  const [selectedShopfloor, setSelectedShopfloor] = useState(undefined);
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
  const [resultDataHidden, setResultDataHidden] = useState(true);

  //Results
  const [cardSummaryList, setCardSummaryList] = useState([]);

  const [shopfloorBaseAndReportingNames, setShopfloorBaseAndReportingNames] = useState({ a0: '' });
  const [shopfloorBaseAndReportingUnits, setShopfloorBaseAndReportingUnits] = useState({ a0: '()' });

  const [shopfloorBaseLabels, setShopfloorBaseLabels] = useState({ a0: [] });
  const [shopfloorBaseData, setShopfloorBaseData] = useState({ a0: [] });

  const [shopfloorReportingLabels, setShopfloorReportingLabels] = useState({ a0: [] });
  const [shopfloorReportingData, setShopfloorReportingData] = useState({ a0: [] });

  const [shopfloorReportingRates, setShopfloorReportingRates] = useState({ a0: [] });
  const [shopfloorReportingOptions, setShopfloorReportingOptions] = useState([]);

  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);

  const [detailedDataTableData, setDetailedDataTableData] = useState([]);
  const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([
    { dataField: 'startdatetime', text: t('Datetime'), sort: true }
  ]);
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
          setSelectedSpaceName([json[0]].map(o => o.label));
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

                setShopfloorList(json[0]);
                if (json[0].length > 0) {
                  setSelectedShopfloor(json[0][0].value);
                  // enable submit button
                  setSubmitButtonDisabled(false);
                } else {
                  setSelectedShopfloor(undefined);
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
          // end of get Shopfloors by root Space ID
        } else {
          toast.error(t(json.description));
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

          setShopfloorList(json[0]);
          if (json[0].length > 0) {
            setSelectedShopfloor(json[0][0].value);
            // enable submit button
            setSubmitButtonDisabled(false);
          } else {
            setSelectedShopfloor(undefined);
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

  const isBasePeriodTimestampExists = base_period_data => {
    const timestamps = base_period_data['timestamps'];

    if (timestamps.length === 0) {
      return false;
    }

    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i].length > 0) {
        return true;
      }
    }
    return false;
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
        '/reports/shopfloorload?' +
        'shopfloorid=' +
        selectedShopfloor +
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
          let cardSummaryArray = [];
          json['reporting_period']['names'].forEach((currentValue, index) => {
            let cardSummaryItem = {};
            cardSummaryItem['name'] = json['reporting_period']['names'][index];
            cardSummaryItem['unit'] = json['reporting_period']['units'][index];
            cardSummaryItem['average'] = json['reporting_period']['averages'][index];
            cardSummaryItem['average_increment_rate'] =
              parseFloat(json['reporting_period']['averages_increment_rate'][index] * 100).toFixed(2) + '%';
            cardSummaryItem['average_per_unit_area'] = json['reporting_period']['averages_per_unit_area'][index];
            cardSummaryItem['maximum'] = json['reporting_period']['maximums'][index];
            cardSummaryItem['maximum_increment_rate'] =
              parseFloat(json['reporting_period']['maximums_increment_rate'][index] * 100).toFixed(2) + '%';
            cardSummaryItem['maximum_per_unit_area'] = json['reporting_period']['maximums_per_unit_area'][index];
            cardSummaryItem['factor'] = json['reporting_period']['factors'][index];
            cardSummaryItem['factor_increment_rate'] =
              parseFloat(json['reporting_period']['factors_increment_rate'][index] * 100).toFixed(2) + '%';
            cardSummaryArray.push(cardSummaryItem);
          });
          setCardSummaryList(cardSummaryArray);

          let base_timestamps = {};
          json['base_period']['timestamps'].forEach((currentValue, index) => {
            base_timestamps['a' + index] = currentValue;
          });
          setShopfloorBaseLabels(base_timestamps);

          let base_values = {};
          json['base_period']['sub_maximums'].forEach((currentValue, index) => {
            base_values['a' + index] = currentValue;
          });
          setShopfloorBaseData(base_values);

          /*
           * Tip:
           *     base_names === reporting_names
           *     base_units === reporting_units
           * */

          let base_and_reporting_names = {};
          json['reporting_period']['names'].forEach((currentValue, index) => {
            base_and_reporting_names['a' + index] = currentValue;
          });
          setShopfloorBaseAndReportingNames(base_and_reporting_names);

          let base_and_reporting_units = {};
          json['reporting_period']['units'].forEach((currentValue, index) => {
            base_and_reporting_units['a' + index] = '(' + currentValue + '/H)';
          });
          setShopfloorBaseAndReportingUnits(base_and_reporting_units);

          let reporting_timestamps = {};
          json['reporting_period']['timestamps'].forEach((currentValue, index) => {
            reporting_timestamps['a' + index] = currentValue;
          });
          setShopfloorReportingLabels(reporting_timestamps);

          let reporting_values = {};
          json['reporting_period']['sub_maximums'].forEach((currentValue, index) => {
            reporting_values['a' + index] = currentValue;
          });
          setShopfloorReportingData(reporting_values);

          let rates = {};
          json['reporting_period']['rates_of_sub_maximums'].forEach((currentValue, index) => {
            let currentRate = [];
            currentValue.forEach(rate => {
              currentRate.push(rate ? parseFloat(rate * 100).toFixed(2) : '0.00');
            });
            rates['a' + index] = currentRate;
          });
          setShopfloorReportingRates(rates);

          let options = [];
          json['reporting_period']['names'].forEach((currentValue, index) => {
            let unit = json['reporting_period']['units'][index];
            options.push({ value: 'a' + index, label: currentValue + ' (' + unit + '/H)' });
          });
          setShopfloorReportingOptions(options);

          let timestamps = {};
          json['parameters']['timestamps'].forEach((currentValue, index) => {
            timestamps['a' + index] = currentValue;
          });
          setParameterLineChartLabels(timestamps);

          let values = {};
          json['parameters']['values'].forEach((currentValue, index) => {
            values['a' + index] = currentValue;
          });
          setParameterLineChartData(values);

          let names = [];
          json['parameters']['names'].forEach((currentValue, index) => {
            names.push({ value: 'a' + index, label: currentValue });
          });
          setParameterLineChartOptions(names);

          if (!isBasePeriodTimestampExists(json['base_period'])) {
            let detailed_value_list = [];
            if (json['reporting_period']['timestamps'].length > 0) {
              json['reporting_period']['timestamps'][0].forEach((currentTimestamp, timestampIndex) => {
                let detailed_value = {};
                detailed_value['id'] = timestampIndex;
                detailed_value['startdatetime'] = currentTimestamp;
                json['reporting_period']['sub_averages'].forEach((currentValue, energyCategoryIndex) => {
                  if (json['reporting_period']['sub_averages'][energyCategoryIndex][timestampIndex] != null) {
                    detailed_value['a' + 2 * energyCategoryIndex] =
                      json['reporting_period']['sub_averages'][energyCategoryIndex][timestampIndex];
                  } else {
                    detailed_value['a' + 2 * energyCategoryIndex] = null;
                  }
                  if (json['reporting_period']['sub_maximums'][energyCategoryIndex][timestampIndex] != null) {
                    detailed_value['a' + (2 * energyCategoryIndex + 1)] =
                      json['reporting_period']['sub_maximums'][energyCategoryIndex][timestampIndex];
                  } else {
                    detailed_value['a' + (2 * energyCategoryIndex + 1)] = null;
                  }
                });
                detailed_value_list.push(detailed_value);
              });
            }
            setTimeout(() => {
              setDetailedDataTableData(detailed_value_list);
            }, 0);

            let detailed_column_list = [];
            detailed_column_list.push({
              dataField: 'startdatetime',
              text: t('Datetime'),
              sort: true
            });
            json['reporting_period']['names'].forEach((currentValue, index) => {
              let unit = json['reporting_period']['units'][index];
              detailed_column_list.push({
                dataField: 'a' + 2 * index,
                text: currentValue + ' ' + t('Average Load') + ' (' + unit + '/H)',
                sort: true,
                formatter: function(decimalValue) {
                  if (typeof decimalValue === 'number') {
                    return decimalValue.toFixed(2);
                  } else {
                    return null;
                  }
                }
              });
              detailed_column_list.push({
                dataField: 'a' + (2 * index + 1),
                text: currentValue + ' ' + t('Maximum Load') + ' (' + unit + '/H)',
                sort: true,
                formatter: function(decimalValue) {
                  if (typeof decimalValue === 'number') {
                    return decimalValue.toFixed(2);
                  } else {
                    return null;
                  }
                }
              });
            });
            setDetailedDataTableColumns(detailed_column_list);
          } else {
            /*
             * Tip:
             *     json['base_period']['names'] ===  json['reporting_period']['names']
             *     json['base_period']['units'] ===  json['reporting_period']['units']
             * */
            let detailed_column_list = [];
            detailed_column_list.push({
              dataField: 'basePeriodDatetime',
              text: t('Base Period') + ' - ' + t('Datetime'),
              sort: true
            });

            json['base_period']['names'].forEach((currentValue, index) => {
              let unit = json['base_period']['units'][index];
              detailed_column_list.push({
                dataField: 'a' + 2 * index,
                text: t('Base Period') + ' - ' + currentValue + ' ' + t('Average Load') + ' (' + unit + '/H)',
                sort: true,
                formatter: function(decimalValue) {
                  if (typeof decimalValue === 'number') {
                    return decimalValue.toFixed(2);
                  } else {
                    return null;
                  }
                }
              });
              detailed_column_list.push({
                dataField: 'a' + (2 * index + 1),
                text: t('Base Period') + ' - ' + currentValue + ' ' + t('Maximum Load') + ' (' + unit + '/H)',
                sort: true,
                formatter: function(decimalValue) {
                  if (typeof decimalValue === 'number') {
                    return decimalValue.toFixed(2);
                  } else {
                    return null;
                  }
                }
              });
            });

            detailed_column_list.push({
              dataField: 'reportingPeriodDatetime',
              text: t('Reporting Period') + ' - ' + t('Datetime'),
              sort: true
            });

            json['reporting_period']['names'].forEach((currentValue, index) => {
              let unit = json['reporting_period']['units'][index];
              detailed_column_list.push({
                dataField: 'b' + 2 * index,
                text: t('Reporting Period') + ' - ' + currentValue + ' ' + t('Average Load') + ' (' + unit + '/H)',
                sort: true,
                formatter: function(decimalValue) {
                  if (typeof decimalValue === 'number') {
                    return decimalValue.toFixed(2);
                  } else {
                    return null;
                  }
                }
              });
              detailed_column_list.push({
                dataField: 'b' + (2 * index + 1),
                text: t('Reporting Period') + ' - ' + currentValue + ' ' + t('Maximum Load') + ' (' + unit + '/H)',
                sort: true,
                formatter: function(decimalValue) {
                  if (typeof decimalValue === 'number') {
                    return decimalValue.toFixed(2);
                  } else {
                    return null;
                  }
                }
              });
            });
            setDetailedDataTableColumns(detailed_column_list);

            let detailed_value_list = [];
            if (json['base_period']['timestamps'].length > 0 || json['reporting_period']['timestamps'].length > 0) {
              const max_timestamps_length =
                json['base_period']['timestamps'][0].length >= json['reporting_period']['timestamps'][0].length
                  ? json['base_period']['timestamps'][0].length
                  : json['reporting_period']['timestamps'][0].length;
              for (let index = 0; index < max_timestamps_length; index++) {
                let detailed_value = {};
                detailed_value['id'] = index;
                detailed_value['basePeriodDatetime'] =
                  index < json['base_period']['timestamps'][0].length
                    ? json['base_period']['timestamps'][0][index]
                    : null;
                json['base_period']['sub_averages'].forEach((currentValue, energyCategoryIndex) => {
                  detailed_value['a' + energyCategoryIndex * 2] =
                    index < json['base_period']['sub_averages'][energyCategoryIndex].length
                      ? json['base_period']['sub_averages'][energyCategoryIndex][index]
                      : null;
                });
                json['base_period']['sub_maximums'].forEach((currentValue, energyCategoryIndex) => {
                  detailed_value['a' + (energyCategoryIndex * 2 + 1)] =
                    index < json['base_period']['sub_maximums'][energyCategoryIndex].length
                      ? json['base_period']['sub_maximums'][energyCategoryIndex][index]
                      : null;
                });
                detailed_value['reportingPeriodDatetime'] =
                  index < json['reporting_period']['timestamps'][0].length
                    ? json['reporting_period']['timestamps'][0][index]
                    : null;
                json['reporting_period']['sub_averages'].forEach((currentValue, energyCategoryIndex) => {
                  detailed_value['b' + energyCategoryIndex * 2] =
                    index < json['reporting_period']['sub_averages'][energyCategoryIndex].length
                      ? json['reporting_period']['sub_averages'][energyCategoryIndex][index]
                      : null;
                });
                json['reporting_period']['sub_maximums'].forEach((currentValue, energyCategoryIndex) => {
                  detailed_value['b' + (energyCategoryIndex * 2 + 1)] =
                    index < json['reporting_period']['sub_maximums'][energyCategoryIndex].length
                      ? json['reporting_period']['sub_maximums'][energyCategoryIndex][index]
                      : null;
                });
                detailed_value_list.push(detailed_value);
              }
              setTimeout(() => {
                setDetailedDataTableData(detailed_value_list);
              }, 0);
            }
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
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileName = 'shopfloorload.xlsx';
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
          <BreadcrumbItem active>{t('Load')}</BreadcrumbItem>
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
                  <Label className={labelClasses} for="shopfloorSelect">
                    {t('Shopfloor')}
                  </Label>
                  <CustomInput
                    type="select"
                    id="shopfloorSelect"
                    name="shopfloorSelect"
                    bsSize="sm"
                    onChange={({ target }) => setSelectedShopfloor(target.value)}
                  >
                    {shopfloorList.map((shopfloor, index) => (
                      <option value={shopfloor.value} key={shopfloor.value}>
                        {shopfloor.label}
                      </option>
                    ))}
                  </CustomInput>
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
        {cardSummaryList.map(cardSummaryItem => (
          <div className="card-deck" key={cardSummaryItem['name']}>
            <CardSummary
              key={cardSummaryItem['name'] + 'average'}
              rate={cardSummaryItem['average_increment_rate']}
              title={t('Reporting Period CATEGORY Average Load UNIT', {
                CATEGORY: cardSummaryItem['name'],
                UNIT: '(' + cardSummaryItem['unit'] + '/H)'
              })}
              color="success"
              footnote={t('Per Unit Area')}
              footvalue={cardSummaryItem['average_per_unit_area']}
              footunit={'(' + cardSummaryItem['unit'] + '/H/M²)'}
            >
              {cardSummaryItem['average'] && (
                <CountUp
                  end={cardSummaryItem['average']}
                  duration={2}
                  prefix=""
                  separator=","
                  decimal="."
                  decimals={2}
                />
              )}
            </CardSummary>
            <CardSummary
              key={cardSummaryItem['name'] + 'maximum'}
              rate={cardSummaryItem['maximum_increment_rate']}
              title={t('Reporting Period CATEGORY Maximum Load UNIT', {
                CATEGORY: cardSummaryItem['name'],
                UNIT: '(' + cardSummaryItem['unit'] + '/H)'
              })}
              color="success"
              footnote={t('Per Unit Area')}
              footvalue={cardSummaryItem['maximum_per_unit_area']}
              footunit={'(' + cardSummaryItem['unit'] + '/H/M²)'}
            >
              {cardSummaryItem['maximum'] && (
                <CountUp
                  end={cardSummaryItem['maximum']}
                  duration={2}
                  prefix=""
                  separator=","
                  decimal="."
                  decimals={2}
                />
              )}
            </CardSummary>
            <CardSummary
              key={cardSummaryItem['name'] + 'factor'}
              rate={cardSummaryItem['factor_increment_rate']}
              title={t('Reporting Period CATEGORY Load Factor', { CATEGORY: cardSummaryItem['name'] })}
              color="success"
              footnote={t('Ratio of Average Load to Maximum Load')}
            >
              {cardSummaryItem['factor'] && (
                <CountUp
                  end={cardSummaryItem['factor']}
                  duration={2}
                  prefix=""
                  separator=","
                  decimal="."
                  decimals={2}
                />
              )}
            </CardSummary>
          </div>
        ))}

        <MultiTrendChart
          reportingTitle={{
            name: 'Reporting Period CATEGORY Maximum Load UNIT',
            substitute: ['CATEGORY', 'UNIT'],
            CATEGORY: shopfloorBaseAndReportingNames,
            UNIT: shopfloorBaseAndReportingUnits
          }}
          baseTitle={{
            name: 'Base Period CATEGORY Maximum Load UNIT',
            substitute: ['CATEGORY', 'UNIT'],
            CATEGORY: shopfloorBaseAndReportingNames,
            UNIT: shopfloorBaseAndReportingUnits
          }}
          reportingTooltipTitle={{
            name: 'Reporting Period CATEGORY Maximum Load UNIT',
            substitute: ['CATEGORY', 'UNIT'],
            CATEGORY: shopfloorBaseAndReportingNames,
            UNIT: shopfloorBaseAndReportingUnits
          }}
          baseTooltipTitle={{
            name: 'Base Period CATEGORY Maximum Load UNIT',
            substitute: ['CATEGORY', 'UNIT'],
            CATEGORY: shopfloorBaseAndReportingNames,
            UNIT: shopfloorBaseAndReportingUnits
          }}
          reportingLabels={shopfloorReportingLabels}
          reportingData={shopfloorReportingData}
          baseLabels={shopfloorBaseLabels}
          baseData={shopfloorBaseData}
          rates={shopfloorReportingRates}
          options={shopfloorReportingOptions}
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

export default withTranslation()(withRedirect(ShopfloorLoad));
