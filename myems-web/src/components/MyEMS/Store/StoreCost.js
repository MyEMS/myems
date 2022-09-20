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
import LineChart from '../common/LineChart';
import SharePie from '../common/SharePie';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL } from '../../../config';
import { periodTypeOptions } from '../common/PeriodTypeOptions';
import { comparisonTypeOptions } from '../common/ComparisonTypeOptions';
import { DateRangePicker } from 'rsuite';
import { endOfDay} from 'date-fns';
import AppContext from '../../../context/Context';

const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

const StoreCost = ({ setRedirect, setRedirectUrl, t }) => {
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
      createCookie('is_logged_in', true, 1000 * 60 * 60 * 8);
      createCookie('user_name', user_name, 1000 * 60 * 60 * 8);
      createCookie('user_display_name', user_display_name, 1000 * 60 * 60 * 8);
      createCookie('user_uuid', user_uuid, 1000 * 60 * 60 * 8);
      createCookie('token', token, 1000 * 60 * 60 * 8);
    }
  });


  // State
  // Query Parameters
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState(undefined);
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
  const [costShareData, setCostShareData] = useState([]);

  const [cardSummaryList, setCardSummaryList] = useState([]);
  const [storeLineChartLabels, setStoreLineChartLabels] = useState([]);
  const [storeLineChartData, setStoreLineChartData] = useState({});
  const [storeLineChartOptions, setStoreLineChartOptions] = useState([]);

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
        // get Stores by root Space ID
        let isResponseOK = false;
        fetch(APIBaseURL + '/spaces/' + [json[0]].map(o => o.value) + '/stores', {
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
            setStoreList(json[0]);
            if (json[0].length > 0) {
              setSelectedStore(json[0][0].value);
              // enable submit button
              setSubmitButtonDisabled(false);
            } else {
              setSelectedStore(undefined);
              // disable submit button
              setSubmitButtonDisabled(true);
            }
          } else {
            toast.error(json.description)
          }
        }).catch(err => {
          console.log(err);
        });
        // end of get Stores by root Space ID
      } else {
        toast.error(json.description);
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
    fetch(APIBaseURL + '/spaces/' + value[value.length - 1] + '/stores', {
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
        setStoreList(json[0]);
        if (json[0].length > 0) {
          setSelectedStore(json[0][0].value);
          // enable submit button
          setSubmitButtonDisabled(false);
        } else {
          setSelectedStore(undefined);
          // disable submit button
          setSubmitButtonDisabled(true);
        }
      } else {
        toast.error(json.description)
      }
    }).catch(err => {
      console.log(err);
    });
  }


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

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit');
    console.log(selectedSpaceID);
    console.log(selectedStore);
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
    fetch(APIBaseURL + '/reports/storecost?' +
      'storeid=' + selectedStore +
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

        let cardSummaryList = []
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let cardSummaryItem = {}
          cardSummaryItem['name'] = json['reporting_period']['names'][index];
          cardSummaryItem['unit'] = json['reporting_period']['units'][index];
          cardSummaryItem['subtotal'] = json['reporting_period']['subtotals'][index];
          cardSummaryItem['increment_rate'] = parseFloat(json['reporting_period']['increment_rates'][index] * 100).toFixed(2) + "%";
          cardSummaryItem['subtotal_per_unit_area'] = json['reporting_period']['subtotals_per_unit_area'][index];
          cardSummaryList.push(cardSummaryItem);
        });
        let cardSummaryItem = {}
        cardSummaryItem['name'] = t('Total');
        cardSummaryItem['unit'] = json['reporting_period']['total_unit'];
        cardSummaryItem['subtotal'] = json['reporting_period']['total'];
        cardSummaryItem['increment_rate'] = parseFloat(json['reporting_period']['total_increment_rate'] * 100).toFixed(2) + "%";
        cardSummaryItem['subtotal_per_unit_area'] = json['reporting_period']['total_per_unit_area'];
        cardSummaryList.push(cardSummaryItem);
        setCardSummaryList(cardSummaryList);

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

        let costDataArray = [];
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let costDataItem = {}
          costDataItem['id'] = index;
          costDataItem['name'] = currentValue;
          costDataItem['value'] = json['reporting_period']['subtotals'][index];
          costDataItem['color'] = "#"+((1<<24)*Math.random()|0).toString(16);
          costDataArray.push(costDataItem);
        });
        setCostShareData(costDataArray);

        let timestamps = {}
        json['reporting_period']['timestamps'].forEach((currentValue, index) => {
          timestamps['a' + index] = currentValue;
        });
        setStoreLineChartLabels(timestamps);

        let values = {}
        json['reporting_period']['values'].forEach((currentValue, index) => {
          values['a' + index] = currentValue;
        });
        setStoreLineChartData(values);
        
        let names = Array();
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let unit = json['reporting_period']['units'][index];
          names.push({ 'value': 'a' + index, 'label': currentValue + ' (' + unit + ')'});
        });
        setStoreLineChartOptions(names);

        timestamps = {}
        json['parameters']['timestamps'].forEach((currentValue, index) => {
          timestamps['a' + index] = currentValue;
        });
        setParameterLineChartLabels(timestamps);

        values = {}
        json['parameters']['values'].forEach((currentValue, index) => {
          values['a' + index] = currentValue;
        });
        setParameterLineChartData(values);
      
        names = Array();
        json['parameters']['names'].forEach((currentValue, index) => {
          if (currentValue.startsWith('TARIFF-')) {
            currentValue = t('Tariff') + currentValue.replace('TARIFF-', '-');
          }
          
          names.push({ 'value': 'a' + index, 'label': currentValue });
        });
        setParameterLineChartOptions(names);

        let detailed_value_list = [];
        if (json['reporting_period']['timestamps'].length > 0) {
          json['reporting_period']['timestamps'][0].forEach((currentTimestamp, timestampIndex) => {
            let detailed_value = {};
            detailed_value['id'] = timestampIndex;
            detailed_value['startdatetime'] = currentTimestamp;
            let total_current_timstamp = 0.0;
            json['reporting_period']['values'].forEach((currentValue, energyCategoryIndex) => {
              detailed_value['a' + energyCategoryIndex] = json['reporting_period']['values'][energyCategoryIndex][timestampIndex];
              total_current_timstamp += json['reporting_period']['values'][energyCategoryIndex][timestampIndex];
            });
            detailed_value['total'] = total_current_timstamp;
            detailed_value_list.push(detailed_value);
          });
        };

        let detailed_value = {};
        detailed_value['id'] = detailed_value_list.length;
        detailed_value['startdatetime'] = t('Subtotal');
        let total_of_subtotals = 0.0;
        json['reporting_period']['subtotals'].forEach((currentValue, index) => {
            detailed_value['a' + index] = currentValue;
            total_of_subtotals += currentValue
          });
        detailed_value['total'] = total_of_subtotals;
        detailed_value_list.push(detailed_value);
        setDetailedDataTableData(detailed_value_list);
        
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
            formatter: function (decimalValue) {
              if (typeof decimalValue === 'number') {
                return decimalValue.toFixed(2);
              } else {
                return null;
              }
            }
          });
        });
        detailed_column_list.push({
          dataField: 'total',
          text: t('Total') + ' (' + json['reporting_period']['total_unit'] + ')',
          sort: true,
          formatter: function (decimalValue) {
            if (typeof decimalValue === 'number') {
              return decimalValue.toFixed(2);
            } else {
              return null;
            }
          }
        });
        setDetailedDataTableColumns(detailed_column_list);
        
        setExcelBytesBase64(json['excel_bytes_base64']);

        // enable submit button
        setSubmitButtonDisabled(false);
        // hide spinner
        setSpinnerHidden(true);
        // show export button
        setExportButtonHidden(false)  
      
      } else {
        toast.error(json.description)
      }
    }).catch(err => {
      console.log(err);
    });
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const fileName = 'storecost.xlsx'
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
          <BreadcrumbItem>{t('Store Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Cost')}</BreadcrumbItem>
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
                  <Label className={labelClasses} for="storeSelect">
                    {t('Store')}
                  </Label>
                  <CustomInput type="select" id="storeSelect" name="storeSelect" onChange={({ target }) => setSelectedStore(target.value)}
                  >
                    {storeList.map((store, index) => (
                      <option value={store.value} key={store.value}>
                        {store.label}
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
                  <DateRangePicker 
                    id='basePeriodDateRangePicker'
                    readOnly={basePeriodDateRangePickerDisabled}
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
                  <DateRangePicker
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
            title={t('Reporting Period Costs CATEGORY UNIT', { 'CATEGORY': cardSummaryItem['name'], 'UNIT': '(' + cardSummaryItem['unit'] + ')' })}
            color="success" 
            footnote={t('Per Unit Area')} 
            footvalue={cardSummaryItem['subtotal_per_unit_area']}
            footunit={"(" + cardSummaryItem['unit'] + "/M²)"} >
            {cardSummaryItem['subtotal'] && <CountUp end={cardSummaryItem['subtotal']} duration={2} prefix="" separator="," decimal="." decimals={2} />}
          </CardSummary>
        ))}
      </div>
      <Row noGutters>
        <Col className="mb-3 pr-lg-2 mb-3">
          <SharePie data={timeOfUseShareData} title={t('Electricity Cost by Time-Of-Use')} />
        </Col>
        <Col className="mb-3 pr-lg-2 mb-3">
          <SharePie data={costShareData} title={t('Costs by Energy Category')} />
        </Col>
      </Row>
      <LineChart reportingTitle={t('Reporting Period Costs CATEGORY VALUE UNIT', { 'CATEGORY': null, 'VALUE': null, 'UNIT': null })}
        baseTitle=''
        labels={storeLineChartLabels}
        data={storeLineChartData}
        options={storeLineChartOptions}>
      </LineChart>

      <LineChart reportingTitle={t('Related Parameters')}
        baseTitle=''
        labels={parameterLineChartLabels}
        data={parameterLineChartData}
        options={parameterLineChartOptions}>
      </LineChart>

      <br />
      <DetailedDataTable data={detailedDataTableData} title={t('Detailed Data')} columns={detailedDataTableColumns} pagesize={50} >
      </DetailedDataTable>

    </Fragment>
  );
};

export default withTranslation()(withRedirect(StoreCost));
