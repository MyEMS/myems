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
import SharePie from '../common/SharePie';
import { getCookieValue, createCookie, checkEmpty,handleApiError } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL, settings } from '../../../config';
import { comparisonTypeOptions } from '../common/ComparisonTypeOptions';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay } from 'date-fns';
import AppContext from '../../../context/Context';
import { Link } from 'react-router-dom';
import blankPage from '../../../assets/img/generic/blank-page.png';

const ChildSpacesTable = loadable(() => import('../common/ChildSpacesTable'));
const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

const periodTypeOptions = [
  { value: 'yearly', label: 'Yearly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' }
];

const SpaceProduction = ({ setRedirect, setRedirectUrl, t }) => {
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
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [comparisonType, setComparisonType] = useState('month-on-month');
  const [periodType, setPeriodType] = useState('daily');
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [basePeriodDateRange, setBasePeriodDateRange] = useState([
    current_moment
      .clone()
      .subtract(7, 'days')
      .subtract(1, 'months')
      .startOf('day')
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
      .subtract(7, 'days')
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
  const [TCEShareData, setTCEShareData] = useState([]);
  const [TCO2EShareData, setTCO2EShareData] = useState([]);

  const [reportingCardSummaryItem, setReportingCardSummaryItem] = useState({});
  const [baseCardSummaryItem, setBaseCardSummaryItem] = useState({});
  const [totalInTCE, setTotalInTCE] = useState({});
  const [totalInTCO2E, setTotalInTCO2E] = useState({});

  const [spaceBaseAndReportingNames, setSpaceBaseAndReportingNames] = useState({ a0: '' });
  const [spaceBaseAndReportingUnits, setSpaceBaseAndReportingUnits] = useState({ a0: '()' });

  const [spaceBaseLabels, setSpaceBaseLabels] = useState({ a0: [] });
  const [spaceBaseData, setSpaceBaseData] = useState({ a0: [] });
  const [spaceBaseSubtotals, setSpaceBaseSubtotals] = useState({ a0: (0).toFixed(2) });

  const [spaceReportingLabels, setSpaceReportingLabels] = useState({ a0: [] });
  const [spaceReportingData, setSpaceReportingData] = useState({ a0: [] });
  const [spaceReportingSubtotals, setSpaceReportingSubtotals] = useState({ a0: (0).toFixed(2) });

  const [spaceReportingRates, setSpaceReportingRates] = useState({ a0: [] });
  const [spaceReportingOptions, setSpaceReportingOptions] = useState([]);

  const [detailedDataTableData, setDetailedDataTableData] = useState([]);
  const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([
    { dataField: 'startdatetime', text: t('Datetime'), sort: true }
  ]);

  const [childSpacesTableData, setChildSpacesTableData] = useState([]);
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
          // enable submit button
          setSubmitButtonDisabled(false);
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
          // select root space name
          setSelectedSpaceName([json[0]].map(o => o.label));
          // select root space ID
          setSelectedSpaceID([json[0]].map(o => o.value));
          // load data with root space ID
          loadData([json[0]].map(o => o.value));
        } else {
          if (handleApiError(json, setRedirect, setRedirectUrl, t, toast)) {return;}
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, [t]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    setSelectedSpaceID(value[value.length - 1]);
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
      if (periodType === 'daily') {
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
    loadData(selectedSpaceID);
  };

  const loadData = spaceID => {
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
    setChildSpacesTableData([]);

    let isResponseOK = false;
    fetch(
      APIBaseURL +
        '/reports/spaceproduction?' +
        'spaceid=' +
        spaceID +
        '&productid=1' +
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
          let cardSummaryItem = {};
          cardSummaryItem['name'] = json['product']['name'];
          cardSummaryItem['unit'] = json['product']['unit'];
          cardSummaryItem['subtotal'] = json['reporting_total_production'];
          setReportingCardSummaryItem(cardSummaryItem);
          cardSummaryItem = {};
          cardSummaryItem['name'] = json['product']['name'];
          cardSummaryItem['unit'] = json['product']['unit'];
          cardSummaryItem['subtotal'] = json['base_total_production'];
          setBaseCardSummaryItem(cardSummaryItem);

          let totalInTCE = {};
          totalInTCE['value'] = json['reporting_period']['total_in_kgce'] / 1000; // convert from kg to t
          totalInTCE['increment_rate'] =
            parseFloat(json['reporting_period']['increment_rate_in_kgce'] * 100).toFixed(2) + '%';
          totalInTCE['value_per_prodution'] = json['reporting_period']['total_in_kgce_per_prodution'] / 1000; // convert from kg to t
          setTotalInTCE(totalInTCE);

          let totalInTCO2E = {};
          totalInTCO2E['value'] = json['reporting_period']['total_in_kgco2e'] / 1000; // convert from kg to t
          totalInTCO2E['increment_rate'] =
            parseFloat(json['reporting_period']['increment_rate_in_kgco2e'] * 100).toFixed(2) + '%';
          totalInTCO2E['value_per_prodution'] = json['reporting_period']['total_in_kgco2e_per_prodution'] / 1000; // convert from kg to t
          setTotalInTCO2E(totalInTCO2E);

          let TCEDataArray = [];
          json['reporting_period']['names'].forEach((currentValue, index) => {
            let TCEDataItem = {};
            TCEDataItem['id'] = index;
            TCEDataItem['name'] = currentValue;
            TCEDataItem['value'] = json['reporting_period']['subtotals_in_kgce'][index] / 1000; // convert from kg to t
            TCEDataItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
            TCEDataArray.push(TCEDataItem);
          });
          setTCEShareData(TCEDataArray);

          let TCO2EDataArray = [];
          json['reporting_period']['names'].forEach((currentValue, index) => {
            let TCO2EDataItem = {};
            TCO2EDataItem['id'] = index;
            TCO2EDataItem['name'] = currentValue;
            TCO2EDataItem['value'] = json['reporting_period']['subtotals_in_kgco2e'][index] / 1000; // convert from kg to t
            TCO2EDataItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
            TCO2EDataArray.push(TCO2EDataItem);
          });
          setTCO2EShareData(TCO2EDataArray);

          let base_timestamps = {};
          [json['base_production']['timestamps']].forEach((currentValue, index) => {
            base_timestamps['a' + index] = currentValue;
          });
          setSpaceBaseLabels(base_timestamps);

          let base_values = {};
          [json['base_production']['values']].forEach((currentValue, index) => {
            base_values['a' + index] = currentValue != null ? currentValue : 0;
          });
          setSpaceBaseData(base_values);

          /*
           * Tip:
           *     base_names === reporting_names
           *     base_units === reporting_units
           * */

          let base_and_reporting_names = {};
          [json['product']['name']].forEach((currentValue, index) => {
            base_and_reporting_names['a' + index] = currentValue;
          });
          setSpaceBaseAndReportingNames(base_and_reporting_names);

          let base_and_reporting_units = {};
          [json['product']['unit']].forEach((currentValue, index) => {
            base_and_reporting_units['a' + index] = '(' + currentValue + ')';
          });
          setSpaceBaseAndReportingUnits(base_and_reporting_units);

          let base_subtotals = {};
          [json['base_total_production']].forEach((currentValue, index) => {
            base_subtotals['a' + index] = currentValue != null ? currentValue.toFixed(2) : 0;
          });
          setSpaceBaseSubtotals(base_subtotals);

          let reporting_timestamps = {};
          [json['reporting_production']['timestamps']].forEach((currentValue, index) => {
            reporting_timestamps['a' + index] = currentValue;
          });
          setSpaceReportingLabels(reporting_timestamps);

          let reporting_values = {};
          [json['reporting_production']['values']].forEach((currentValue, index) => {
            reporting_values['a' + index] = currentValue != null ? currentValue : 0;
          });
          setSpaceReportingData(reporting_values);

          let reporting_subtotals = {};
          [json['reporting_total_production']].forEach((currentValue, index) => {
            reporting_subtotals['a' + index] = currentValue.toFixed(2);
          });
          setSpaceReportingSubtotals(reporting_subtotals);

          let rates = {};
          [json['reporting_production']['rates']].forEach((currentValue, index) => {
            // currentRate.push(currentValue ? parseFloat(currentValue * 100).toFixed(2) : '0.00');
            let currentRate = [];
            currentValue.forEach(rate => {
              currentRate.push(rate != undefined && rate ? parseFloat(rate * 100).toFixed(2) : '0.00');
            });
            rates['a' + index] = currentRate;
          });
          setSpaceReportingRates(rates);

          let options = [];
          [json['product']['name']].forEach((currentValue, index) => {
            let unit = json['product']['unit'];
            options.push({ value: 'a' + index, label: currentValue + ' (' + unit + ')' });
          });
          setSpaceReportingOptions(options);

          if (!isBasePeriodTimestampExists(json['base_period'])) {
            let detailed_value_list = [];
            if (json['reporting_production']['timestamps'].length > 0) {
              json['reporting_production']['timestamps'].forEach((currentTimestamp, timestampIndex) => {
                let detailed_value = {};
                detailed_value['id'] = timestampIndex;
                detailed_value['startdatetime'] = currentTimestamp;
                [json['product']['names']].forEach((currentValue, energyCategoryIndex) => {
                  detailed_value['a' + energyCategoryIndex] = [json['reporting_production']['values']][
                    energyCategoryIndex
                  ][timestampIndex];
                });
                detailed_value_list.push(detailed_value);
              });
            }

            let detailed_value = {};
            detailed_value['id'] = detailed_value_list.length;
            detailed_value['startdatetime'] = t('Subtotal');
            json['reporting_period']['subtotals'].forEach((currentValue, index) => {
              detailed_value['a' + index] = currentValue;
            });
            detailed_value_list.push(detailed_value);
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
                dataField: 'a' + index,
                text: currentValue + ' (' + unit + ')',
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

            detailed_column_list.push({
              dataField: 'a0',
              text: t('Base Period') + ' ' + t('Production') + ' (' + json['product']['unit'] + ')',
              sort: true,
              formatter: function(decimalValue) {
                if (typeof decimalValue === 'number') {
                  return decimalValue.toFixed(2);
                } else {
                  return null;
                }
              }
            });
            json['base_period']['names'].forEach((currentValue, index) => {
              let unit = json['base_period']['units'][index];
              detailed_column_list.push({
                dataField: 'a' + (index * 2 + 1),
                text: t('Base Period') + ' - ' + currentValue + ' (' + unit + ')',
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
                dataField: 'a' + (index * 2 + 2),
                text:
                  t('Base Period') +
                  '-' +
                  t('Per Unit Production') +
                  currentValue +
                  ' (' +
                  unit +
                  '/' +
                  json['product']['unit'] +
                  ')',
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
            detailed_column_list.push({
              dataField: 'b0',
              text: t('Base Period') + ' - ' + t('Production') + ' (' + json['product']['unit'] + ')',
              sort: true,
              formatter: function(decimalValue) {
                if (typeof decimalValue === 'number') {
                  return decimalValue.toFixed(2);
                } else {
                  return null;
                }
              }
            });
            json['reporting_period']['names'].forEach((currentValue, index) => {
              let unit = json['reporting_period']['units'][index];
              detailed_column_list.push({
                dataField: 'b' + (index * 2 + 1),
                text: t('Reporting Period') + ' - ' + currentValue + ' (' + unit + ')',
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
                dataField: 'b' + (index * 2 + 2),
                text:
                  t('Reporting Period') +
                  ' ' +
                  t('Per Unit Production') +
                  currentValue +
                  ' (' +
                  unit +
                  '/' +
                  json['product']['unit'] +
                  ')',
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
                detailed_value['a0'] =
                  index < json['base_period']['timestamps'][0].length ? json['base_production']['values'][index] : null;
                json['base_period']['values'].forEach((currentValue, energyCategoryIndex) => {
                  detailed_value['a' + (energyCategoryIndex * 2 + 1)] =
                    index < json['base_period']['values'][energyCategoryIndex].length
                      ? json['base_period']['values'][energyCategoryIndex][index]
                      : null;
                  detailed_value['a' + (energyCategoryIndex * 2 + 2)] =
                    index < json['base_production']['values'].length &&
                    !Object.is(
                      json['base_period']['values'][energyCategoryIndex][index] /
                        json['base_production']['values'][index],
                      NaN
                    )
                      ? Number(
                          (
                            json['base_period']['values'][energyCategoryIndex][index] /
                            json['base_production']['values'][index]
                          ).toFixed(2)
                        )
                      : 0;
                });
                detailed_value['reportingPeriodDatetime'] =
                  index < json['reporting_period']['timestamps'][0].length
                    ? json['reporting_period']['timestamps'][0][index]
                    : null;
                detailed_value['b0'] =
                  index < json['base_period']['timestamps'][0].length
                    ? json['reporting_production']['values'][index]
                    : null;
                json['reporting_period']['values'].forEach((currentValue, energyCategoryIndex) => {
                  detailed_value['b' + (energyCategoryIndex * 2 + 1)] =
                    index < json['reporting_period']['values'][energyCategoryIndex].length
                      ? json['reporting_period']['values'][energyCategoryIndex][index]
                      : null;
                  detailed_value['b' + (energyCategoryIndex * 2 + 2)] =
                    index < json['reporting_production']['values'].length &&
                    !Object.is(
                      json['reporting_period']['values'][energyCategoryIndex][index] /
                        json['reporting_production']['values'][index],
                      NaN
                    )
                      ? Number(
                          (
                            json['reporting_period']['values'][energyCategoryIndex][index] /
                            json['reporting_production']['values'][index]
                          ).toFixed(2)
                        )
                      : 0;
                });
                detailed_value_list.push(detailed_value);
              }

              let detailed_value = {};
              detailed_value['id'] = detailed_value_list.length;
              detailed_value['basePeriodDatetime'] = t('Subtotal');
              json['base_period']['subtotals'].forEach((currentValue, index) => {
                detailed_value['a' + (index * 2 + 1)] = currentValue;
              });
              detailed_value['a0'] = json['base_total_production'];
              detailed_value['reportingPeriodDatetime'] = t('Subtotal');
              json['reporting_period']['subtotals'].forEach((currentValue, index) => {
                detailed_value['b' + (index * 2 + 1)] = currentValue;
              });
              detailed_value['b0'] = json['reporting_total_production'];
              detailed_value_list.push(detailed_value);
              setTimeout(() => {
                setDetailedDataTableData(detailed_value_list);
              }, 0);
            }
          }
          // setExcelBytesBase64(json['excel_bytes_base64']);

          // enable submit button
          setSubmitButtonDisabled(false);
          // hide spinner
          setSpinnerHidden(true);
          // show export button
          setExportButtonHidden(true);
          // show result data
          setResultDataHidden(false);
        } else {
          if (handleApiError(json, setRedirect, setRedirectUrl, t, toast)) {return;}
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileName = 'SpaceProduction.xlsx';
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
          <BreadcrumbItem>{t('Space Data')}</BreadcrumbItem>
          <BreadcrumbItem active onClick={() => window.location.reload()}>
            <Link to="/space/production">{t('Production')}</Link>
          </BreadcrumbItem>
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
      <div className="blank-page-image-container" style={{ visibility: resultDataHidden ? 'visible' : 'hidden', display: resultDataHidden ? '' : 'none' }}>
        <img className="img-fluid" src={blankPage} alt="" />
      </div>
      <div style={{ visibility: resultDataHidden ? 'hidden' : 'visible', display: resultDataHidden ? 'none' : '' }}>
        <div className="card-deck">
          <CardSummary
            rate={''}
            key={'baseCardSummaryItem'}
            title={t('Base Period Production PRODUCT VALUE UNIT', {
              VALUE: baseCardSummaryItem['name'],
              UNIT: '(' + baseCardSummaryItem['unit'] + ')'
            })}
            color="success"
          >
            {baseCardSummaryItem['subtotal'] && (
              <CountUp
                end={baseCardSummaryItem['subtotal']}
                duration={2}
                prefix=""
                separator=","
                decimal="."
                decimals={2}
              />
            )}
          </CardSummary>
          <CardSummary
            rate={''}
            key={'reportingCardSummaryItem'}
            title={t('Reporting Period Production PRODUCT VALUE UNIT', {
              VALUE: reportingCardSummaryItem['name'],
              UNIT: '(' + reportingCardSummaryItem['unit'] + ')'
            })}
            color="success"
          >
            {reportingCardSummaryItem['subtotal'] && (
              <CountUp
                end={reportingCardSummaryItem['subtotal']}
                duration={2}
                prefix=""
                separator=","
                decimal="."
                decimals={2}
              />
            )}
          </CardSummary>

          {settings.showTCEData ? (
            <CardSummary
              rate={totalInTCE['increment_rate'] || ''}
              title={t('Reporting Period Consumption CATEGORY UNIT', {
                CATEGORY: t('Ton of Standard Coal'),
                UNIT: '(TCE)'
              })}
              color="warning"
              footnote={t('Per Unit Production')}
              footvalue={totalInTCE['value_per_prodution']}
              footunit="(TCE)"
            >
              {totalInTCE['value'] && (
                <CountUp end={totalInTCE['value']} duration={2} prefix="" separator="," decimal="." decimals={2} />
              )}
            </CardSummary>
          ) : (
            <></>
          )}
          <CardSummary
            rate={totalInTCO2E['increment_rate'] || ''}
            title={t('Reporting Period Consumption CATEGORY UNIT', {
              CATEGORY: t('Ton of Carbon Dioxide Emissions'),
              UNIT: '(TCO2E)'
            })}
            color="warning"
            footnote={t('Per Unit Production')}
            footvalue={totalInTCO2E['value_per_prodution']}
            footunit="(TCO2E)"
          >
            {totalInTCO2E['value'] && (
              <CountUp end={totalInTCO2E['value']} duration={2} prefix="" separator="," decimal="." decimals={2} />
            )}
          </CardSummary>
        </div>
        <Row noGutters>
          {settings.showTCEData ? (
            <Col className="mb-3 pr-lg-2 mb-3">
              <SharePie data={TCEShareData} title={t('Ton of Standard Coal by Energy Category')} />
            </Col>
          ) : (
            <></>
          )}
          <Col className="mb-3 pr-lg-2 mb-3">
            <SharePie data={TCO2EShareData} title={t('Ton of Carbon Dioxide Emissions by Energy Category')} />
          </Col>
        </Row>

        <MultiTrendChart
          reportingTitle={{
            name: 'Reporting Period Production PRODUCT VALUE UNIT',
            substitute: ['PRODUCT', 'VALUE', 'UNIT'],
            PRODUCT: spaceBaseAndReportingNames,
            VALUE: spaceReportingSubtotals,
            UNIT: spaceBaseAndReportingUnits
          }}
          baseTitle={{
            name: 'Base Period Production PRODUCT VALUE UNIT',
            substitute: ['PRODUCT', 'VALUE', 'UNIT'],
            PRODUCT: spaceBaseAndReportingNames,
            VALUE: spaceBaseSubtotals,
            UNIT: spaceBaseAndReportingUnits
          }}
          reportingTooltipTitle={{
            name: 'Reporting Period Production PRODUCT VALUE UNIT',
            substitute: ['PRODUCT', 'VALUE', 'UNIT'],
            PRODUCT: spaceBaseAndReportingNames,
            VALUE: null,
            UNIT: spaceBaseAndReportingUnits
          }}
          baseTooltipTitle={{
            name: 'Base Period Production PRODUCT VALUE UNIT',
            substitute: ['PRODUCT', 'VALUE', 'UNIT'],
            PRODUCT: spaceBaseAndReportingNames,
            VALUE: null,
            UNIT: spaceBaseAndReportingUnits
          }}
          reportingLabels={spaceReportingLabels}
          reportingData={spaceReportingData}
          baseLabels={spaceBaseLabels}
          baseData={spaceBaseData}
          rates={spaceReportingRates}
          options={spaceReportingOptions}
        />

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

export default withTranslation()(withRedirect(SpaceProduction));
