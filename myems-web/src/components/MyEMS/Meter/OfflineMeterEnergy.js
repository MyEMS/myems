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
  Spinner,
} from 'reactstrap';
import CountUp from 'react-countup';
import moment from 'moment';
import loadable from '@loadable/component';
import Cascader from 'rc-cascader';
import CardSummary from '../common/CardSummary';
import MultiTrendChart from '../common/MultiTrendChart';
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

const OfflineMeterEnergy = ({ setRedirect, setRedirectUrl, t }) => {
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
  //Query Form
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [offlineMeterList, setOfflineMeterList] = useState([]);
  const [selectedOfflineMeter, setSelectedOfflineMeter] = useState(undefined);
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
  const [offlineMeterEnergyCategory, setOfflineMeterEnergyCategory] = useState({ 'name': '', 'unit': '' });
  const [reportingPeriodEnergyConsumptionInCategory, setReportingPeriodEnergyConsumptionInCategory] = useState(0);
  const [reportingPeriodEnergyConsumptionRate, setReportingPeriodEnergyConsumptionRate] = useState('');
  const [reportingPeriodEnergyConsumptionInTCE, setReportingPeriodEnergyConsumptionInTCE] = useState(0);
  const [reportingPeriodEnergyConsumptionInCO2, setReportingPeriodEnergyConsumptionInCO2] = useState(0);

  const [offlineMeterBaseAndReportingNames, setOfflineMeterBaseAndReportingNames] = useState({"a0":""});
  const [offlineMeterBaseAndReportingUnits, setOfflineMeterBaseAndReportingUnits] = useState({"a0":"()"});

  const [offlineMeterBaseLabels, setOfflineMeterBaseLabels] = useState({"a0": []});
  const [offlineMeterBaseData, setOfflineMeterBaseData] = useState({"a0": []});
  const [offlineMeterBaseSubtotals, setOfflineMeterBaseSubtotals] = useState({"a0": (0).toFixed(2)});

  const [offlineMeterReportingLabels, setOfflineMeterReportingLabels] = useState({"a0": []});
  const [offlineMeterReportingData, setOfflineMeterReportingData] = useState({"a0": []});
  const [offlineMeterReportingSubtotals, setOfflineMeterReportingSubtotals] = useState({"a0": (0).toFixed(2)});

  const [offlineMeterReportingRates, setOfflineMeterReportingRates] = useState({"a0": []});
  const [offlineMeterReportingOptions, setOfflineMeterReportingOptions] = useState([]);

  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([{dataField: 'startdatetime', text: t('Datetime'), sort: true}]);
  const [detailedDataTableData, setDetailedDataTableData] = useState([]);
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
        // get Offline Meters by root Space ID
        let isResponseOK = false;
        fetch(APIBaseURL + '/spaces/' + [json[0]].map(o => o.value) + '/offlinemeters', {
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
            setOfflineMeterList(json[0]);
            if (json[0].length > 0) {
              setSelectedOfflineMeter(json[0][0].value);
              // enable submit button
              setSubmitButtonDisabled(false);
            } else {
              setSelectedOfflineMeter(undefined);
              // disable submit button
              setSubmitButtonDisabled(true);
            }
          } else {
            toast.error(t(json.description))
          }
        }).catch(err => {
          console.log(err);
        });
        // end of get Offline Meters by root Space ID
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });

  }, [t, ]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';


  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    setSelectedSpaceID(value[value.length - 1]);

    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + value[value.length - 1] + '/offlinemeters', {
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
        setOfflineMeterList(json[0]);
        if (json[0].length > 0) {
          setSelectedOfflineMeter(json[0][0].value);
          // enable submit button
          setSubmitButtonDisabled(false);
        } else {
          setSelectedOfflineMeter(undefined);
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

  let onBasePeriodClean = event => {
    setBasePeriodDateRange([null, null]);
  };

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
    console.log(selectedOfflineMeter);
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
    fetch(APIBaseURL + '/reports/offlinemeterenergy?' +
      'offlinemeterid=' + selectedOfflineMeter +
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
        console.log(json)
        setOfflineMeterEnergyCategory({
          'name': json['offline_meter']['energy_category_name'],
          'unit': json['offline_meter']['unit_of_measure']
        });
        setReportingPeriodEnergyConsumptionRate(parseFloat(json['reporting_period']['increment_rate']*100).toFixed(2) + "%");
        setReportingPeriodEnergyConsumptionInCategory(json['reporting_period']['total_in_category']);
        setReportingPeriodEnergyConsumptionInTCE(json['reporting_period']['total_in_kgce'] / 1000);
        setReportingPeriodEnergyConsumptionInCO2(json['reporting_period']['total_in_kgco2e'] / 1000);

        let base_timestamps = {}
        base_timestamps['a0'] = json['base_period']['timestamps'];
        setOfflineMeterBaseLabels(base_timestamps)

        let base_values = {}
        base_values['a0'] = json['base_period']['values'];
        setOfflineMeterBaseData(base_values)

        let base_and_reporting_names = {}
        base_and_reporting_names['a0'] = json['offline_meter']['energy_category_name'];
        setOfflineMeterBaseAndReportingNames(base_and_reporting_names)

        let base_and_reporting_units = {}
        base_and_reporting_units['a0'] = "(" + json['offline_meter']['unit_of_measure'] + ")";
        setOfflineMeterBaseAndReportingUnits(base_and_reporting_units)

        let base_subtotals = {}
        base_subtotals['a0'] = json['base_period']['total_in_category'];
        setOfflineMeterBaseSubtotals(base_subtotals)

        let reporting_timestamps = {}
        reporting_timestamps['a0'] = json['reporting_period']['timestamps']
        setOfflineMeterReportingLabels(reporting_timestamps);

        let reporting_values = {}
        reporting_values['a0'] = json['reporting_period']['values'];
        setOfflineMeterReportingData(reporting_values);

        let reporting_subtotals = {}
        reporting_subtotals['a0'] = json['reporting_period']['total_in_category'];
        setOfflineMeterReportingSubtotals(reporting_subtotals);

        let rates = {}
        rates['a0'] = [];
        json['reporting_period']['rates'].forEach((currentValue, index) => {
          rates['a0'].push(currentValue ? parseFloat(currentValue * 100).toFixed(2) : '0.00');
        });
        setOfflineMeterReportingRates(rates)

        let options = Array();
        options.push({'value': 'a0', 'label': json['offline_meter']['energy_category_name'] + ' (' + json['offline_meter']['unit_of_measure'] + ')'})
        setOfflineMeterReportingOptions(options);

        let names = Array();
        json['parameters']['names'].forEach((currentValue, index) => {
          
          names.push({ 'value': 'a' + index, 'label': currentValue });
        });
        setParameterLineChartOptions(names);

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

        if(!isBasePeriodTimestampExists(json['base_period'])) {
          setDetailedDataTableColumns([{
            dataField: 'startdatetime',
            text: t('Datetime'),
            sort: true
          }, {
            dataField: 'a0',
            text: json['offline_meter']['energy_category_name'] + ' (' + json['offline_meter']['unit_of_measure'] + ')',
            sort: true,
            formatter: function (decimalValue) {
              if (typeof decimalValue === 'number') {
                return decimalValue.toFixed(2);
              } else {
                return null;
              }
            }
          }]);

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
          }, 0)
        }else {
          setDetailedDataTableColumns([{
            dataField: 'basePeriodDatetime',
            text: t('Base Period') + ' - ' + t('Datetime'),
            sort: true
          }, {
            dataField: 'a0',
            text: t('Base Period') + ' - ' + json['offline_meter']['energy_category_name'] + ' (' + json['offline_meter']['unit_of_measure'] + ')',
            sort: true,
            formatter: function (decimalValue) {
              if (typeof decimalValue === 'number') {
                return decimalValue.toFixed(2);
              } else {
                return null;
              }
            }
          }, {
            dataField: 'reportingPeriodDatetime',
            text: t('Reporting Period') + ' - ' + t('Datetime'),
            sort: true
          }, {
            dataField: 'b0',
            text: t('Reporting Period') + ' - ' + json['offline_meter']['energy_category_name'] + ' (' + json['offline_meter']['unit_of_measure'] + ')',
            sort: true,
            formatter: function (decimalValue) {
              if (typeof decimalValue === 'number') {
                return decimalValue.toFixed(2);
              } else {
                return null;
              }
            }
          }]);

          let detailed_value_list = [];
          const max_timestamps_length = json['base_period']['timestamps'].length >= json['reporting_period']['timestamps'].length?
                json['base_period']['timestamps'].length : json['reporting_period']['timestamps'].length;

          for (let index = 0; index < max_timestamps_length; index++) {
            let detailed_value = {};
            detailed_value['id'] = index;
            detailed_value['basePeriodDatetime'] = null;
            detailed_value['a0'] = null;
            detailed_value['reportingPeriodDatetime'] = null;
            detailed_value['a0'] = null;
            if (index < json['base_period']['timestamps'].length) {
              detailed_value['basePeriodDatetime'] = json['base_period']['timestamps'][index];
              detailed_value['a0'] = json['base_period']['values'][index];
            }

            if (index < json['reporting_period']['timestamps'].length) {
              detailed_value['reportingPeriodDatetime'] = json['reporting_period']['timestamps'][index];
              detailed_value['b0'] = json['reporting_period']['values'][index];
            }
            detailed_value_list.push(detailed_value);
          }

          let detailed_value = {};
          detailed_value['id'] = detailed_value_list.length;
          detailed_value['basePeriodDatetime'] = t('Total');
          detailed_value['a0'] = json['base_period']['total_in_category'];
          detailed_value['reportingPeriodDatetime'] = t('Total');
          detailed_value['b0'] = json['reporting_period']['total_in_category'];
          detailed_value_list.push(detailed_value);
          setTimeout(() => {
            setDetailedDataTableData(detailed_value_list);
          }, 0)
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
    const fileName = 'offlinemeterenergy.xlsx'
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
          <BreadcrumbItem>{t('Meter Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Offline Meter Energy')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form >
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
                  <Label className={labelClasses} for="offlineMeterSelect">
                    {t('Offline Meter')}
                  </Label>
                  <CustomInput type="select" id="offlineMeterSelect" name="offlineMeterSelect" onChange={({ target }) => setSelectedOfflineMeter(target.value)}
                  >
                    {offlineMeterList.map((offlineMeter, index) => (
                      <option value={offlineMeter.value} key={offlineMeter.value}>
                        {offlineMeter.label}
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
        <CardSummary rate={reportingPeriodEnergyConsumptionRate} title={t('Reporting Period Consumption CATEGORY UNIT', { 'CATEGORY': offlineMeterEnergyCategory['name'], 'UNIT': '(' + offlineMeterEnergyCategory['unit'] + ')' })}
          color="success"  >
          <CountUp end={reportingPeriodEnergyConsumptionInCategory} duration={2} prefix="" separator="," decimals={2} decimal="." />
        </CardSummary>
        <CardSummary rate={reportingPeriodEnergyConsumptionRate} title={t('Reporting Period Consumption CATEGORY UNIT', { 'CATEGORY': t('Ton of Standard Coal'), 'UNIT': '(TCE)' })}
          color="warning" >
          <CountUp end={reportingPeriodEnergyConsumptionInTCE} duration={2} prefix="" separator="," decimal="." decimals={2} />
        </CardSummary>
        <CardSummary rate={reportingPeriodEnergyConsumptionRate} title={t('Reporting Period Consumption CATEGORY UNIT', { 'CATEGORY': t('Ton of Carbon Dioxide Emissions'), 'UNIT': '(T)' })}
          color="warning" >
          <CountUp end={reportingPeriodEnergyConsumptionInCO2} duration={2} prefix="" separator="," decimal="." decimals={2} />
        </CardSummary>
      </div>

      <MultiTrendChart reportingTitle = {{"name": "Reporting Period Consumption CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": offlineMeterBaseAndReportingNames, "VALUE": offlineMeterReportingSubtotals, "UNIT": offlineMeterBaseAndReportingUnits}}
        baseTitle = {{"name": "Base Period Consumption CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": offlineMeterBaseAndReportingNames, "VALUE": offlineMeterBaseSubtotals, "UNIT": offlineMeterBaseAndReportingUnits}}
        reportingTooltipTitle = {{"name": "Reporting Period Consumption CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": offlineMeterBaseAndReportingNames, "VALUE": null, "UNIT": offlineMeterBaseAndReportingUnits}}
        baseTooltipTitle = {{"name": "Base Period Consumption CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": offlineMeterBaseAndReportingNames, "VALUE": null, "UNIT": offlineMeterBaseAndReportingUnits}}
        reportingLabels={offlineMeterReportingLabels}
        reportingData={offlineMeterReportingData}
        baseLabels={offlineMeterBaseLabels}
        baseData={offlineMeterBaseData}
        rates={offlineMeterReportingRates}
        options={offlineMeterReportingOptions}>
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

export default withTranslation()(withRedirect(OfflineMeterEnergy));
