import React, { Fragment, useEffect, useState } from 'react';
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
import Datetime from 'react-datetime';
import moment from 'moment';
import Cascader from 'rc-cascader';
import CardSummary from '../common/CardSummary';
import LineChart from '../common/LineChart';
import SharePie from '../common/SharePie';
import loadable from '@loadable/component';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL } from '../../../config';
import { periodTypeOptions } from '../common/PeriodTypeOptions';
import { comparisonTypeOptions } from '../common/ComparisonTypeOptions';


const ChildSpacesTable = loadable(() => import('../common/ChildSpacesTable'));
const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

const SpaceCost = ({ setRedirect, setRedirectUrl, t }) => {
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

  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [comparisonType, setComparisonType] = useState('month-on-month');
  const [periodType, setPeriodType] = useState('daily');
  const [basePeriodBeginsDatetime, setBasePeriodBeginsDatetime] = useState(current_moment.clone().subtract(1, 'months').startOf('month'));
  const [basePeriodEndsDatetime, setBasePeriodEndsDatetime] = useState(current_moment.clone().subtract(1, 'months'));
  const [basePeriodBeginsDatetimeDisabled, setBasePeriodBeginsDatetimeDisabled] = useState(true);
  const [basePeriodEndsDatetimeDisabled, setBasePeriodEndsDatetimeDisabled] = useState(true);
  const [reportingPeriodBeginsDatetime, setReportingPeriodBeginsDatetime] = useState(current_moment.clone().startOf('month'));
  const [reportingPeriodEndsDatetime, setReportingPeriodEndsDatetime] = useState(current_moment);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  
  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);
  
  //Results
  const [timeOfUseShareData, setTimeOfUseShareData] = useState([]);
  const [costShareData, setCostShareData] = useState([]);

  const [cardSummaryList, setCardSummaryList] = useState([]);
  const [spaceLineChartLabels, setSpaceLineChartLabels] = useState([]);
  const [spaceLineChartData, setSpaceLineChartData] = useState({});
  const [spaceLineChartOptions, setSpaceLineChartOptions] = useState([]);
  
  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);
  
  const [detailedDataTableData, setDetailedDataTableData] = useState([]);
  const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([{dataField: 'startdatetime', text: t('Datetime'), sort: true}]);
  
  const [childSpacesTableData, setChildSpacesTableData] = useState([]);
  const [childSpacesTableColumns, setChildSpacesTableColumns] = useState([{dataField: 'name', text: t('Child Spaces'), sort: true }]);
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
        // enable submit button
        setSubmitButtonDisabled(false);
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
      } else {
        toast.error(json.description);
      }
    }).catch(err => {
      console.log(err);
    });

  }, []);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    console.log(value, selectedOptions);
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    setSelectedSpaceID(value[value.length - 1]);
  }


  let onComparisonTypeChange = ({ target }) => {
    console.log(target.value);
    setComparisonType(target.value);
    if (target.value === 'year-over-year') {
      setBasePeriodBeginsDatetimeDisabled(true);
      setBasePeriodEndsDatetimeDisabled(true);
      setBasePeriodBeginsDatetime(moment(reportingPeriodBeginsDatetime).subtract(1, 'years'));
      setBasePeriodEndsDatetime(moment(reportingPeriodEndsDatetime).subtract(1, 'years'));
    } else if (target.value === 'month-on-month') {
      setBasePeriodBeginsDatetimeDisabled(true);
      setBasePeriodEndsDatetimeDisabled(true);
      setBasePeriodBeginsDatetime(moment(reportingPeriodBeginsDatetime).subtract(1, 'months'));
      setBasePeriodEndsDatetime(moment(reportingPeriodEndsDatetime).subtract(1, 'months'));
    } else if (target.value === 'free-comparison') {
      setBasePeriodBeginsDatetimeDisabled(false);
      setBasePeriodEndsDatetimeDisabled(false);
    } else if (target.value === 'none-comparison') {
      setBasePeriodBeginsDatetime(undefined);
      setBasePeriodEndsDatetime(undefined);
      setBasePeriodBeginsDatetimeDisabled(true);
      setBasePeriodEndsDatetimeDisabled(true);
    }
  }

  let onBasePeriodBeginsDatetimeChange = (newDateTime) => {
    setBasePeriodBeginsDatetime(newDateTime);
  }

  let onBasePeriodEndsDatetimeChange = (newDateTime) => {
    setBasePeriodEndsDatetime(newDateTime);
  }

  let onReportingPeriodBeginsDatetimeChange = (newDateTime) => {
    setReportingPeriodBeginsDatetime(newDateTime);
    if (comparisonType === 'year-over-year') {
      setBasePeriodBeginsDatetime(newDateTime.clone().subtract(1, 'years'));
    } else if (comparisonType === 'month-on-month') {
      setBasePeriodBeginsDatetime(newDateTime.clone().subtract(1, 'months'));
    }
  }

  let onReportingPeriodEndsDatetimeChange = (newDateTime) => {
    setReportingPeriodEndsDatetime(newDateTime);
    if (comparisonType === 'year-over-year') {
      setBasePeriodEndsDatetime(newDateTime.clone().subtract(1, 'years'));
    } else if (comparisonType === 'month-on-month') {
      setBasePeriodEndsDatetime(newDateTime.clone().subtract(1, 'months'));
    }
  }

  var getValidBasePeriodBeginsDatetimes = function (currentDate) {
    return currentDate.isBefore(moment(basePeriodEndsDatetime, 'MM/DD/YYYY, hh:mm:ss a'));
  }

  var getValidBasePeriodEndsDatetimes = function (currentDate) {
    return currentDate.isAfter(moment(basePeriodBeginsDatetime, 'MM/DD/YYYY, hh:mm:ss a'));
  }

  var getValidReportingPeriodBeginsDatetimes = function (currentDate) {
    return currentDate.isBefore(moment(reportingPeriodEndsDatetime, 'MM/DD/YYYY, hh:mm:ss a'));
  }

  var getValidReportingPeriodEndsDatetimes = function (currentDate) {
    return currentDate.isAfter(moment(reportingPeriodBeginsDatetime, 'MM/DD/YYYY, hh:mm:ss a'));
  }

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit');
    console.log(selectedSpaceID);
    console.log(comparisonType);
    console.log(periodType);
    console.log(basePeriodBeginsDatetime != null ? basePeriodBeginsDatetime.format('YYYY-MM-DDTHH:mm:ss') : undefined);
    console.log(basePeriodEndsDatetime != null ? basePeriodEndsDatetime.format('YYYY-MM-DDTHH:mm:ss') : undefined);
    console.log(reportingPeriodBeginsDatetime.format('YYYY-MM-DDTHH:mm:ss'));
    console.log(reportingPeriodEndsDatetime.format('YYYY-MM-DDTHH:mm:ss'));
    
    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide export buttion
    setExportButtonHidden(true)

    // Reinitialize tables
    setDetailedDataTableData([]);
    setChildSpacesTableData([]);

    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/spacecost?' +
      'spaceid=' + selectedSpaceID +
      '&periodtype=' + periodType +
      '&baseperiodstartdatetime=' + (basePeriodBeginsDatetime != null ? basePeriodBeginsDatetime.format('YYYY-MM-DDTHH:mm:ss') : '') +
      '&baseperiodenddatetime=' + (basePeriodEndsDatetime != null ? basePeriodEndsDatetime.format('YYYY-MM-DDTHH:mm:ss') : '') +
      '&reportingperiodstartdatetime=' + reportingPeriodBeginsDatetime.format('YYYY-MM-DDTHH:mm:ss') +
      '&reportingperiodenddatetime=' + reportingPeriodEndsDatetime.format('YYYY-MM-DDTHH:mm:ss'), {
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
          if(currentValue == 1) {
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
        setSpaceLineChartLabels(timestamps);

        let values = {}
        json['reporting_period']['values'].forEach((currentValue, index) => {
          values['a' + index] = currentValue;
        });
        setSpaceLineChartData(values);
        
        let names = Array();
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let unit = json['reporting_period']['units'][index];
          names.push({ 'value': 'a' + index, 'label': currentValue + ' (' + unit + ')'});
        });
        setSpaceLineChartOptions(names);

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
              detailed_value['a' + energyCategoryIndex] = json['reporting_period']['values'][energyCategoryIndex][timestampIndex].toFixed(2);
              total_current_timstamp += json['reporting_period']['values'][energyCategoryIndex][timestampIndex];
            });
            detailed_value['total'] = total_current_timstamp.toFixed(2);
            detailed_value_list.push(detailed_value);
          });
        };

        let detailed_value = {};
        detailed_value['id'] = detailed_value_list.length;
        detailed_value['startdatetime'] = t('Subtotal');
        let total_of_subtotals = 0.0;
        json['reporting_period']['subtotals'].forEach((currentValue, index) => {
            detailed_value['a' + index] = currentValue.toFixed(2);
            total_of_subtotals += currentValue
          });
        detailed_value['total'] = total_of_subtotals.toFixed(2);
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
            sort: true
          });
        });
        detailed_column_list.push({
          dataField: 'total',
          text: t('Total') + ' (' + json['reporting_period']['total_unit'] + ')',
          sort: true
        });
        setDetailedDataTableColumns(detailed_column_list);

        let child_space_value_list = [];
        if (json['child_space']['child_space_names_array'].length > 0) {
          json['child_space']['child_space_names_array'][0].forEach((currentSpaceName, spaceIndex) => {
            let child_space_value = {};
            child_space_value['id'] = spaceIndex;
            child_space_value['name'] = currentSpaceName;
            let total = 0.0;
            json['child_space']['energy_category_names'].forEach((currentValue, energyCategoryIndex) => {
              child_space_value['a' + energyCategoryIndex] = json['child_space']['subtotals_array'][energyCategoryIndex][spaceIndex].toFixed(2);
              total += json['child_space']['subtotals_array'][energyCategoryIndex][spaceIndex]
            });
            child_space_value['total'] = total.toFixed(2);
            child_space_value_list.push(child_space_value);
          });
        };

        setChildSpacesTableData(child_space_value_list);

        let child_space_column_list = [];
        child_space_column_list.push({
          dataField: 'name',
          text: t('Child Spaces'),
          sort: true
        });
        json['child_space']['energy_category_names'].forEach((currentValue, index) => {
          let unit = json['child_space']['units'][index];
          child_space_column_list.push({
            dataField: 'a' + index,
            text: currentValue + ' (' + unit + ')',
            sort: true
          });
        });
        child_space_column_list.push({
          dataField: 'total',
          text: t('Total') + ' (' + json['child_space']['total_unit'] + ')',
          sort: true
        });

        setChildSpacesTableColumns(child_space_column_list);
        
        setExcelBytesBase64(json['excel_bytes_base64']);

        // enable submit button
        setSubmitButtonDisabled(false);
        // hide spinner
        setSpinnerHidden(true);
        // show export buttion
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
    const fileName = 'spacecost.xlsx'
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
          <BreadcrumbItem>{t('Space Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Cost')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col xs="auto">
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
              <Col xs="auto">
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="basePeriodBeginsDatetime">
                    {t('Base Period Begins')}{t('(Optional)')}
                  </Label>
                  <Datetime id='basePeriodBeginsDatetime'
                    value={basePeriodBeginsDatetime}
                    inputProps={{ disabled: basePeriodBeginsDatetimeDisabled }}
                    onChange={onBasePeriodBeginsDatetimeChange}
                    isValidDate={getValidBasePeriodBeginsDatetimes}
                    closeOnSelect={true} />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="basePeriodEndsDatetime">
                    {t('Base Period Ends')}{t('(Optional)')}
                  </Label>
                  <Datetime id='basePeriodEndsDatetime'
                    value={basePeriodEndsDatetime}
                    inputProps={{ disabled: basePeriodEndsDatetimeDisabled }}
                    onChange={onBasePeriodEndsDatetimeChange}
                    isValidDate={getValidBasePeriodEndsDatetimes}
                    closeOnSelect={true} />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="reportingPeriodBeginsDatetime">
                    {t('Reporting Period Begins')}
                  </Label>
                  <Datetime id='reportingPeriodBeginsDatetime'
                    value={reportingPeriodBeginsDatetime}
                    onChange={onReportingPeriodBeginsDatetimeChange}
                    isValidDate={getValidReportingPeriodBeginsDatetimes}
                    closeOnSelect={true} />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="reportingPeriodEndsDatetime">
                    {t('Reporting Period Ends')}
                  </Label>
                  <Datetime id='reportingPeriodEndsDatetime'
                    value={reportingPeriodEndsDatetime}
                    onChange={onReportingPeriodEndsDatetimeChange}
                    isValidDate={getValidReportingPeriodEndsDatetimes}
                    closeOnSelect={true} />
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
        labels={spaceLineChartLabels}
        data={spaceLineChartData}
        options={spaceLineChartOptions}>
      </LineChart>

      <LineChart reportingTitle={t('Related Parameters')}
        baseTitle=''
        labels={parameterLineChartLabels}
        data={parameterLineChartData}
        options={parameterLineChartOptions}>
      </LineChart>
      <DetailedDataTable data={detailedDataTableData} title={t('Detailed Data')} columns={detailedDataTableColumns} pagesize={50} >
      </DetailedDataTable>
      <br />
      <ChildSpacesTable data={childSpacesTableData} title={t('Child Spaces Data')} columns={childSpacesTableColumns}>
      </ChildSpacesTable>

    </Fragment>
  );
};

export default withTranslation()(withRedirect(SpaceCost));
