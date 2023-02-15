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
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL } from '../../../config';
import { periodTypeOptions } from '../common/PeriodTypeOptions';
import { comparisonTypeOptions } from '../common/ComparisonTypeOptions';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay} from 'date-fns';
import AppContext from '../../../context/Context';
import MultipleLineChart from '../common/MultipleLineChart';

const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

const TenantEnergyCategory = ({ setRedirect, setRedirectUrl, t }) => {
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
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [tenantList, setTenantList] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(undefined);
  const [comparisonType, setComparisonType] = useState('month-on-month');
  const [periodType, setPeriodType] = useState('daily');
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [basePeriodDateRange, setBasePeriodDateRange] = useState([current_moment.clone().subtract(1, 'months').startOf('month').toDate(), current_moment.clone().subtract(1, 'months').toDate()]);
  const [basePeriodDateRangePickerDisabled, setBasePeriodDateRangePickerDisabled] = useState(true);
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
  const { language } = useContext(AppContext);

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);

  //Results
  const [timeOfUseShareData, setTimeOfUseShareData] = useState([]);
  const [TCEShareData, setTCEShareData] = useState([]);
  const [TCO2EShareData, setTCO2EShareData] = useState([]);

  const [cardSummaryList, setCardSummaryList] = useState([]);
  const [totalInTCE, setTotalInTCE] = useState({});
  const [totalInTCO2E, setTotalInTCO2E] = useState({});

  const [tenantBaseAndReportingNames, setTenantBaseAndReportingNames] = useState({"a0":""});
  const [tenantBaseAndReportingUnits, setTenantBaseAndReportingUnits] = useState({"a0":"()"});

  const [tenantBaseLabels, setTenantBaseLabels] = useState({"a0": []});
  const [tenantBaseData, setTenantBaseData] = useState({"a0": []});
  const [tenantBaseSubtotals, setTenantBaseSubtotals] = useState({"a0": (0).toFixed(2)});

  const [tenantReportingLabels, setTenantReportingLabels] = useState({"a0": []});
  const [tenantReportingData, setTenantReportingData] = useState({"a0": []});
  const [tenantReportingSubtotals, setTenantReportingSubtotals] = useState({"a0": (0).toFixed(2)});

  const [tenantReportingRates, setTenantReportingRates] = useState({"a0": []});
  const [tenantReportingOptions, setTenantReportingOptions] = useState([]);
  
  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);

  const [detailedDataTableData, setDetailedDataTableData] = useState([]);
  const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([{dataField: 'startdatetime', text: t('Datetime'), sort: true}]);
  const [excelBytesBase64, setExcelBytesBase64] = useState(undefined);
  
  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/tree', {
      method: 'GET',
      headers: {
        "Content-type": "application/json",
        "User-UUID": getCookieValue('user_uuid'),
        "Token": getCookieValue('token')
      },
      body: null,

    }).then(response => {
      console.log(response);
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
    }).then(json => {
      console.log(json);
      if (isResponseOK) {
        // rename keys 
        json = JSON.parse(JSON.stringify([json]).split('"id":').join('"value":').split('"name":').join('"label":'));
        setCascaderOptions(json);
        setSelectedSpaceName([json[0]].map(o => o.label));
        setSelectedSpaceID([json[0]].map(o => o.value));
        // get Tenants by root Space ID
        let isResponseOK = false;
        fetch(APIBaseURL + '/spaces/' + [json[0]].map(o => o.value) + '/tenants', {
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
            json = JSON.parse(JSON.stringify([json]).split('"id":').join('"value":').split('"name":').join('"label":'));
            console.log(json);
            setTenantList(json[0]);
            if (json[0].length > 0) {
              setSelectedTenant(json[0][0].value);
              // enable submit button
              setSubmitButtonDisabled(false);
            } else {
              setSelectedTenant(undefined);
              // disable submit button
              setSubmitButtonDisabled(true);
            }
          } else {
            toast.error(t(json.description))
          }
        }).catch(err => {
          console.log(err);
        });
        // end of get Tenants by root Space ID
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });

  }, []);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    setSelectedSpaceID(value[value.length - 1]);

    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + value[value.length - 1] + '/tenants', {
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
        json = JSON.parse(JSON.stringify([json]).split('"id":').join('"value":').split('"name":').join('"label":'));
        console.log(json)
        setTenantList(json[0]);
        if (json[0].length > 0) {
          setSelectedTenant(json[0][0].value);
          // enable submit button
          setSubmitButtonDisabled(false);
        } else {
          setSelectedTenant(undefined);
          // disable submit button
          setSubmitButtonDisabled(true);
        }
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });
  };

  let onComparisonTypeChange = ({ target }) => {
    console.log(target.value);
    setComparisonType(target.value);
    if (target.value === 'year-over-year') {
      setBasePeriodDateRangePickerDisabled(true);
      setBasePeriodDateRange([moment(reportingPeriodDateRange[0]).subtract(1, 'years').toDate(),
        moment(reportingPeriodDateRange[1]).subtract(1, 'years').toDate()]);
    } else if (target.value === 'month-on-month') {
      setBasePeriodDateRangePickerDisabled(true);
      setBasePeriodDateRange([moment(reportingPeriodDateRange[0]).subtract(1, 'months').toDate(),
        moment(reportingPeriodDateRange[1]).subtract(1, 'months').toDate()]);
    } else if (target.value === 'free-comparison') {
      setBasePeriodDateRangePickerDisabled(false);
    } else if (target.value === 'none-comparison') {
      setBasePeriodDateRange([null, null]);
      setBasePeriodDateRangePickerDisabled(true);
    }
  };

  // Callback fired when value changed
  let onBasePeriodChange = (DateRange) => {
    if(DateRange == null) {
      setBasePeriodDateRange([null, null]);
    } else {
      if (moment(DateRange[1]).format('HH:mm:ss') == '00:00:00') {
        // if the user did not change time value, set the default time to the end of day
        DateRange[1] = endOfDay(DateRange[1]);
      }
      setBasePeriodDateRange([DateRange[0], DateRange[1]]);
    }
  };

  // Callback fired when value changed
  let onReportingPeriodChange = (DateRange) => {
    if(DateRange == null) {
      setReportingPeriodDateRange([null, null]);
    } else {
      if (moment(DateRange[1]).format('HH:mm:ss') == '00:00:00') {
        // if the user did not change time value, set the default time to the end of day
        DateRange[1] = endOfDay(DateRange[1]);
      }
      setReportingPeriodDateRange([DateRange[0], DateRange[1]]);
      if (comparisonType === 'year-over-year') {
        setBasePeriodDateRange([moment(DateRange[0]).clone().subtract(1, 'years').toDate(), moment(DateRange[1]).clone().subtract(1, 'years').toDate()]);
      } else if (comparisonType === 'month-on-month') {
        setBasePeriodDateRange([moment(DateRange[0]).clone().subtract(1, 'months').toDate(), moment(DateRange[1]).clone().subtract(1, 'months').toDate()]);
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

  const isBasePeriodTimestampExists = (base_period_data) => {
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
    console.log('handleSubmit');
    console.log(selectedSpaceID);
    console.log(selectedTenant);
    console.log(comparisonType);
    console.log(periodType);
    console.log(basePeriodDateRange[0] != null ? moment(basePeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') : null)
    console.log(basePeriodDateRange[1] != null ? moment(basePeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') : null)
    console.log(moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss'))
    console.log(moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'));
    
    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide export button
    setExportButtonHidden(true)

    // Reinitialize tables
    setDetailedDataTableData([]);
    
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/tenantenergycategory?' +
      'tenantid=' + selectedTenant +
      '&periodtype=' + periodType +
      '&baseperiodstartdatetime=' + (basePeriodDateRange[0] != null ? moment(basePeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') : '') +
      '&baseperiodenddatetime=' + (basePeriodDateRange[1] != null ? moment(basePeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') : '') +
      '&reportingperiodstartdatetime=' + moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
      '&reportingperiodenddatetime=' + moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') + 
      '&language=' + language, {
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

        let cardSummaryArray = []
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let cardSummaryItem = {}
          cardSummaryItem['name'] = json['reporting_period']['names'][index];
          cardSummaryItem['unit'] = json['reporting_period']['units'][index];
          cardSummaryItem['subtotal'] = json['reporting_period']['subtotals'][index];
          cardSummaryItem['increment_rate'] = parseFloat(json['reporting_period']['increment_rates'][index] * 100).toFixed(2) + "%";
          cardSummaryItem['subtotal_per_unit_area'] = json['reporting_period']['subtotals_per_unit_area'][index];
          cardSummaryArray.push(cardSummaryItem);
        });
        setCardSummaryList(cardSummaryArray);
        
        let timeOfUseArray = [];
        json['reporting_period']['energy_category_ids'].forEach((currentValue, index) => {
          if(currentValue === 1) {
            // energy_category_id 1 electricity
            let timeOfUseItem = {}
            timeOfUseItem['id'] = 1;
            timeOfUseItem['name'] =  t('Top-Peak');
            timeOfUseItem['value'] = json['reporting_period']['toppeaks'][index];
            timeOfUseItem['color'] = "#"+((1<<24)*Math.random()|0).toString(16);
            timeOfUseArray.push(timeOfUseItem);
            
            timeOfUseItem = {}
            timeOfUseItem['id'] = 2;
            timeOfUseItem['name'] =  t('On-Peak');
            timeOfUseItem['value'] = json['reporting_period']['onpeaks'][index];
            timeOfUseItem['color'] = "#"+((1<<24)*Math.random()|0).toString(16);
            timeOfUseArray.push(timeOfUseItem);

            timeOfUseItem = {}
            timeOfUseItem['id'] = 3;
            timeOfUseItem['name'] =  t('Mid-Peak');
            timeOfUseItem['value'] = json['reporting_period']['midpeaks'][index];
            timeOfUseItem['color'] = "#"+((1<<24)*Math.random()|0).toString(16);
            timeOfUseArray.push(timeOfUseItem);

            timeOfUseItem = {}
            timeOfUseItem['id'] = 4;
            timeOfUseItem['name'] =  t('Off-Peak');
            timeOfUseItem['value'] = json['reporting_period']['offpeaks'][index];
            timeOfUseItem['color'] = "#"+((1<<24)*Math.random()|0).toString(16);
            timeOfUseArray.push(timeOfUseItem);
          }
        });
        setTimeOfUseShareData(timeOfUseArray);

        
        let totalInTCE = {}; 
        totalInTCE['value'] = json['reporting_period']['total_in_kgce'] / 1000; // convert from kg to t
        totalInTCE['increment_rate'] = parseFloat(json['reporting_period']['increment_rate_in_kgce'] * 100).toFixed(2) + "%";
        totalInTCE['value_per_unit_area'] = json['reporting_period']['total_in_kgce_per_unit_area'] / 1000; // convert from kg to t
        setTotalInTCE(totalInTCE);

        let totalInTCO2E = {}; 
        totalInTCO2E['value'] = json['reporting_period']['total_in_kgco2e'] / 1000; // convert from kg to t
        totalInTCO2E['increment_rate'] = parseFloat(json['reporting_period']['increment_rate_in_kgco2e'] * 100).toFixed(2) + "%";
        totalInTCO2E['value_per_unit_area'] = json['reporting_period']['total_in_kgco2e_per_unit_area'] / 1000; // convert from kg to t
        setTotalInTCO2E(totalInTCO2E);

        let TCEDataArray = [];
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let TCEDataItem = {}
          TCEDataItem['id'] = index;
          TCEDataItem['name'] = currentValue;
          TCEDataItem['value'] = json['reporting_period']['subtotals_in_kgce'][index] / 1000; // convert from kg to t
          TCEDataItem['color'] = "#"+((1<<24)*Math.random()|0).toString(16);
          TCEDataArray.push(TCEDataItem);
        });
        setTCEShareData(TCEDataArray);

        let TCO2EDataArray = [];
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let TCO2EDataItem = {}
          TCO2EDataItem['id'] = index;
          TCO2EDataItem['name'] = currentValue;
          TCO2EDataItem['value'] = json['reporting_period']['subtotals_in_kgco2e'][index] / 1000; // convert from kg to t
          TCO2EDataItem['color'] = "#"+((1<<24)*Math.random()|0).toString(16);
          TCO2EDataArray.push(TCO2EDataItem);
        });
        setTCO2EShareData(TCO2EDataArray);

        let base_timestamps = {}
        json['base_period']['timestamps'].forEach((currentValue, index) => {
          base_timestamps['a' + index] = currentValue;
        });
        setTenantBaseLabels(base_timestamps)

        let base_values = {}
        json['base_period']['values'].forEach((currentValue, index) => {
          base_values['a' + index] = currentValue;
        });
        setTenantBaseData(base_values)

        /*
        * Tip:
        *     base_names === reporting_names
        *     base_units === reporting_units
        * */

        let base_and_reporting_names = {}
        json['reporting_period']['names'].forEach((currentValue, index) => {
          base_and_reporting_names['a' + index] = currentValue;
        });
        setTenantBaseAndReportingNames(base_and_reporting_names)

        let base_and_reporting_units = {}
        json['reporting_period']['units'].forEach((currentValue, index) => {
          base_and_reporting_units['a' + index] = "("+currentValue+")";
        });
        setTenantBaseAndReportingUnits(base_and_reporting_units)

        let base_subtotals = {}
        json['base_period']['subtotals'].forEach((currentValue, index) => {
          base_subtotals['a' + index] = currentValue.toFixed(2);
        });
        setTenantBaseSubtotals(base_subtotals)

        let reporting_timestamps = {}
        json['reporting_period']['timestamps'].forEach((currentValue, index) => {
          reporting_timestamps['a' + index] = currentValue;
        });
        setTenantReportingLabels(reporting_timestamps);

        let reporting_values = {}
        json['reporting_period']['values'].forEach((currentValue, index) => {
          reporting_values['a' + index] = currentValue;
        });
        setTenantReportingData(reporting_values);

        let reporting_subtotals = {}
        json['reporting_period']['subtotals'].forEach((currentValue, index) => {
          reporting_subtotals['a' + index] = currentValue.toFixed(2);
        });
        setTenantReportingSubtotals(reporting_subtotals);

        let rates = {}
        json['reporting_period']['rates'].forEach((currentValue, index) => {
          let currentRate = Array();
          currentValue.forEach((rate) => {
            currentRate.push(rate ? parseFloat(rate * 100).toFixed(2) : '0.00');
          });
          rates['a' + index] = currentRate;
        });
        setTenantReportingRates(rates)

        let options = Array();
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let unit = json['reporting_period']['units'][index];
          options.push({ 'value': 'a' + index, 'label': currentValue + ' (' + unit + ')'});
        });
        setTenantReportingOptions(options);

        let timestamps = {}
        json['parameters']['timestamps'].forEach((currentValue, index) => {
          timestamps['a' + index] = currentValue;
        });
        setParameterLineChartLabels(timestamps);

        let values = {}
        json['parameters']['values'].forEach((currentValue, index) => {
          values['a' + index] = currentValue;
        });
        setParameterLineChartData(values);
      
        let names = Array();
        json['parameters']['names'].forEach((currentValue, index) => {
          
          names.push({ 'value': 'a' + index, 'label': currentValue });
        });
        setParameterLineChartOptions(names);

        if(!isBasePeriodTimestampExists(json['base_period'])) {
          let detailed_value_list = [];
          if (json['reporting_period']['timestamps'].length > 0) {
            json['reporting_period']['timestamps'][0].forEach((currentTimestamp, timestampIndex) => {
              let detailed_value = {};
              detailed_value['id'] = timestampIndex;
              detailed_value['startdatetime'] = currentTimestamp;
              json['reporting_period']['values'].forEach((currentValue, energyCategoryIndex) => {
                detailed_value['a' + energyCategoryIndex] = json['reporting_period']['values'][energyCategoryIndex][timestampIndex];
              });
              detailed_value_list.push(detailed_value);
            });
          }
          ;

          let detailed_value = {};
          detailed_value['id'] = detailed_value_list.length;
          detailed_value['startdatetime'] = t('Subtotal');
          json['reporting_period']['subtotals'].forEach((currentValue, index) => {
            detailed_value['a' + index] = currentValue;
          });
          detailed_value_list.push(detailed_value);
          setTimeout(() => {
            setDetailedDataTableData(detailed_value_list);
          }, 0)

          let detailed_column_list = [];
          detailed_column_list.push({
            dataField: 'startdatetime',
            text: t('Datetime'),
            sort: true
          })
          json['reporting_period']['names'].forEach((currentValue, index) => {
            let unit = json['reporting_period']['units'][index];
            detailed_column_list.push({
              dataField: 'a' + index,
              text: currentValue + ' (' + unit + ')',
              sort: true,
              formatter: function (decimalValue) {
                if (typeof decimalValue === 'number') {
                  return decimalValue.toFixed(2);
                } else {
                  return null;
                }
              }
            });
          });
          setDetailedDataTableColumns(detailed_column_list);
        }else {
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
          })

          json['base_period']['names'].forEach((currentValue, index) => {
            let unit = json['base_period']['units'][index];
            detailed_column_list.push({
              dataField: 'a' + index,
              text: t('Base Period') + ' - ' + currentValue + ' (' + unit + ')',
              sort: true,
              formatter: function (decimalValue) {
                if (typeof decimalValue === 'number') {
                  return decimalValue.toFixed(2);
                } else {
                  return null;
                }
              }
            })
          });

          detailed_column_list.push({
            dataField: 'reportingPeriodDatetime',
            text: t('Reporting Period') + ' - ' + t('Datetime'),
            sort: true
          })

          json['reporting_period']['names'].forEach((currentValue, index) => {
            let unit = json['reporting_period']['units'][index];
            detailed_column_list.push({
              dataField: 'b' + index,
              text: t('Reporting Period') + ' - ' + currentValue + ' (' + unit + ')',
              sort: true,
              formatter: function (decimalValue) {
                if (typeof decimalValue === 'number') {
                  return decimalValue.toFixed(2);
                } else {
                  return null;
                }
              }
            })
          });
          setDetailedDataTableColumns(detailed_column_list);

          let detailed_value_list = [];
          if (json['base_period']['timestamps'].length > 0 || json['reporting_period']['timestamps'].length > 0) {
            const max_timestamps_length = json['base_period']['timestamps'][0].length >= json['reporting_period']['timestamps'][0].length?
                json['base_period']['timestamps'][0].length : json['reporting_period']['timestamps'][0].length;
            for (let index = 0; index < max_timestamps_length; index++) {
              let detailed_value = {};
              detailed_value['id'] = index;
              detailed_value['basePeriodDatetime'] = index < json['base_period']['timestamps'][0].length? json['base_period']['timestamps'][0][index] : null;
              json['base_period']['values'].forEach((currentValue, energyCategoryIndex) => {
                detailed_value['a' + energyCategoryIndex] = index < json['base_period']['values'][energyCategoryIndex].length? json['base_period']['values'][energyCategoryIndex][index] : null;
              });
              detailed_value['reportingPeriodDatetime'] = index < json['reporting_period']['timestamps'][0].length? json['reporting_period']['timestamps'][0][index] : null;
              json['reporting_period']['values'].forEach((currentValue, energyCategoryIndex) => {
                detailed_value['b' + energyCategoryIndex] = index < json['reporting_period']['values'][energyCategoryIndex].length? json['reporting_period']['values'][energyCategoryIndex][index] : null;
              });
              detailed_value_list.push(detailed_value);
            }

            let detailed_value = {};
            detailed_value['id'] = detailed_value_list.length;
            detailed_value['basePeriodDatetime'] = t('Subtotal');
            json['base_period']['subtotals'].forEach((currentValue, index) => {
              detailed_value['a' + index] = currentValue;
            });
            detailed_value['reportingPeriodDatetime'] = t('Subtotal');
            json['reporting_period']['subtotals'].forEach((currentValue, index) => {
              detailed_value['b' + index] = currentValue;
            });
            detailed_value_list.push(detailed_value);
            setTimeout( () => {
              setDetailedDataTableData(detailed_value_list);
            }, 0)
          }

        }
        
        setExcelBytesBase64(json['excel_bytes_base64']);

        // enable submit button
        setSubmitButtonDisabled(false);
        // hide spinner
        setSpinnerHidden(true);
        // show export button
        setExportButtonHidden(false);

      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const fileName = 'tenantenergycategory.xlsx'
    var fileUrl = "data:" + mimeType + ";base64," + excelBytesBase64;
    fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
            var link = window.document.createElement("a");
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
          <BreadcrumbItem>{t('Tenant Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Energy Category Data')}</BreadcrumbItem>
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
                  <Cascader options={cascaderOptions}
                    onChange={onSpaceCascaderChange}
                    changeOnSelect
                    expandTrigger="hover">
                    <Input value={selectedSpaceName || ''} readOnly />
                  </Cascader>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <Label className={labelClasses} for="tenantSelect">
                    {t('Tenant')}
                  </Label>
                  <CustomInput type="select" id="tenantSelect" name="tenantSelect" onChange={({ target }) => setSelectedTenant(target.value)}
                  >
                    {tenantList.map((tenant, index) => (
                      <option value={tenant.value} key={tenant.value}>
                        {tenant.label}
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
                  <CustomInput type="select" id="comparisonType" name="comparisonType"
                    defaultValue="month-on-month"
                    onChange={onComparisonTypeChange}
                  >
                    {comparisonTypeOptions.map((comparisonType, index) => (
                      <option value={comparisonType.value} key={comparisonType.value} >
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
                  <CustomInput type="select" id="periodType" name="periodType" defaultValue="daily" onChange={({ target }) => setPeriodType(target.value)}
                  >
                    {periodTypeOptions.map((periodType, index) => (
                      <option value={periodType.value} key={periodType.value} >
                        {t(periodType.label)}
                      </option>
                    ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="basePeriodDateRangePicker">{t('Base Period')}{t('(Optional)')}</Label>
                  <DateRangePickerWrapper 
                    id='basePeriodDateRangePicker'
                    disabled={basePeriodDateRangePickerDisabled}
                    format="yyyy-MM-dd HH:mm:ss"
                    value={basePeriodDateRange}
                    onChange={onBasePeriodChange}
                    size="md"
                    style={dateRangePickerStyle}
                    onClean={onBasePeriodClean}
                    locale={dateRangePickerLocale}
                    placeholder={t("Select Date Range")}
                   />
                </FormGroup>
              </Col>
              <Col xs={6} sm={3}>
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
              <Col xs="auto">
                  <br></br>
                  <ButtonIcon icon="external-link-alt" transform="shrink-3 down-2" color="falcon-default" 
                  hidden={exportButtonHidden}
                  onClick={handleExport} >
                    {t('Export')}
                  </ButtonIcon>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
      <div className="card-deck">
        {cardSummaryList.map(cardSummaryItem => (
          <CardSummary key={cardSummaryItem['name']}
            rate={cardSummaryItem['increment_rate']}
            title={t('Reporting Period Consumption CATEGORY UNIT', { 'CATEGORY': cardSummaryItem['name'], 'UNIT': '(' + cardSummaryItem['unit'] + ')' })}
            color="success" 
            footnote={t('Per Unit Area')} 
            footvalue={cardSummaryItem['subtotal_per_unit_area']}
            footunit={"(" + cardSummaryItem['unit'] + "/M²)"} >
            {cardSummaryItem['subtotal'] && <CountUp end={cardSummaryItem['subtotal']} duration={2} prefix="" separator="," decimal="." decimals={2} />}
          </CardSummary>
        ))}
       
        <CardSummary 
          rate={totalInTCE['increment_rate'] || ''} 
          title={t('Reporting Period Consumption CATEGORY UNIT', { 'CATEGORY': t('Ton of Standard Coal'), 'UNIT': '(TCE)' })}
          color="warning" 
          footnote={t('Per Unit Area')} 
          footvalue={totalInTCE['value_per_unit_area']} 
          footunit="(TCE/M²)">
          {totalInTCE['value'] && <CountUp end={totalInTCE['value']} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary 
          rate={totalInTCO2E['increment_rate'] || ''} 
          title={t('Reporting Period Consumption CATEGORY UNIT', { 'CATEGORY': t('Ton of Carbon Dioxide Emissions'), 'UNIT': '(TCO2E)' })}
          color="warning" 
          footnote={t('Per Unit Area')} 
          footvalue={totalInTCO2E['value_per_unit_area']} 
          footunit="(TCO2E/M²)">
          {totalInTCO2E['value'] && <CountUp end={totalInTCO2E['value']} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
      </div>
      <Row noGutters>
        <Col className="mb-3 pr-lg-2 mb-3">
          <SharePie data={timeOfUseShareData} title={t('Electricity Consumption by Time-Of-Use')} />
        </Col>
        <Col className="mb-3 pr-lg-2 mb-3">
          <SharePie data={TCEShareData} title={t('Ton of Standard Coal by Energy Category')} />
        </Col>
        <Col className="mb-3 pr-lg-2 mb-3">
          <SharePie data={TCO2EShareData} title={t('Ton of Carbon Dioxide Emissions by Energy Category')} />
        </Col>
      </Row>

      <MultiTrendChart reportingTitle = {{"name": "Reporting Period Consumption CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": tenantBaseAndReportingNames, "VALUE": tenantReportingSubtotals, "UNIT": tenantBaseAndReportingUnits}}
        baseTitle = {{"name": "Base Period Consumption CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": tenantBaseAndReportingNames, "VALUE": tenantBaseSubtotals, "UNIT": tenantBaseAndReportingUnits}}
        reportingTooltipTitle = {{"name": "Reporting Period Consumption CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": tenantBaseAndReportingNames, "VALUE": null, "UNIT": tenantBaseAndReportingUnits}}
        baseTooltipTitle = {{"name": "Base Period Consumption CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": tenantBaseAndReportingNames, "VALUE": null, "UNIT": tenantBaseAndReportingUnits}}
        reportingLabels={tenantReportingLabels}
        reportingData={tenantReportingData}
        baseLabels={tenantBaseLabels}
        baseData={tenantBaseData}
        rates={tenantReportingRates}
        options={tenantReportingOptions}>
      </MultiTrendChart>

      <MultipleLineChart reportingTitle={t('Related Parameters')}
        baseTitle=''
        labels={parameterLineChartLabels}
        data={parameterLineChartData}
        options={parameterLineChartOptions}>
      </MultipleLineChart>
      <br />
      <DetailedDataTable data={detailedDataTableData} title={t('Detailed Data')} columns={detailedDataTableColumns} pagesize={50} >
      </DetailedDataTable>

    </Fragment>
  );
};

export default withTranslation()(withRedirect(TenantEnergyCategory));
