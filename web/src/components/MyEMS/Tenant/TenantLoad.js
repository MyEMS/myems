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
  Spinner,
} from 'reactstrap';
import CountUp from 'react-countup';
import Datetime from 'react-datetime';
import moment from 'moment';
import loadable from '@loadable/component';
import Cascader from 'rc-cascader';
import CardSummary from '../common/CardSummary';
import LineChart from '../common/LineChart';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL } from '../../../config';
import { periodTypeOptions } from '../common/PeriodTypeOptions';
import { comparisonTypeOptions } from '../common/ComparisonTypeOptions';


const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

const TenantLoad = ({ setRedirect, setRedirectUrl, t }) => {
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
  const [tenantList, setTenantList] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(undefined);
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
  const [cardSummaryList, setCardSummaryList] = useState([]);
  const [tenantLineChartLabels, setTenantLineChartLabels] = useState([]);
  const [tenantLineChartData, setTenantLineChartData] = useState({});
  const [tenantLineChartOptions, setTenantLineChartOptions] = useState([]);
  
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
            toast.error(json.description)
          }
        }).catch(err => {
          console.log(err);
        });
        // end of get Tenants by root Space ID
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
    console.log(selectedTenant);
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
    
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/tenantload?' +
      'tenantid=' + selectedTenant +
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
      };
      return response.json();
    }).then(json => {
      if (isResponseOK) {
        console.log(json)
 
        let cardSummaryArray = []
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let cardSummaryItem = {}
          cardSummaryItem['name'] = json['reporting_period']['names'][index];
          cardSummaryItem['unit'] = json['reporting_period']['units'][index];
          cardSummaryItem['average'] = json['reporting_period']['averages'][index];
          cardSummaryItem['average_increment_rate'] = parseFloat(json['reporting_period']['averages_increment_rate'][index] * 100).toFixed(2) + "%";
          cardSummaryItem['average_per_unit_area'] = json['reporting_period']['averages_per_unit_area'][index];
          cardSummaryItem['maximum'] = json['reporting_period']['maximums'][index];
          cardSummaryItem['maximum_increment_rate'] = parseFloat(json['reporting_period']['maximums_increment_rate'][index] * 100).toFixed(2) + "%";
          cardSummaryItem['maximum_per_unit_area'] = json['reporting_period']['maximums_per_unit_area'][index];
          cardSummaryItem['factor'] = json['reporting_period']['factors'][index];
          cardSummaryItem['factor_increment_rate'] = parseFloat(json['reporting_period']['factors_increment_rate'][index] * 100).toFixed(2) + "%";
          cardSummaryArray.push(cardSummaryItem);
        });
        setCardSummaryList(cardSummaryArray);

        let timestamps = {}
        json['reporting_period']['timestamps'].forEach((currentValue, index) => {
          timestamps['a' + index] = currentValue;
        });
        setTenantLineChartLabels(timestamps);
        
        let values = {}
        json['reporting_period']['sub_maximums'].forEach((currentValue, index) => {
          values['a' + index] = currentValue;
        });
        setTenantLineChartData(values);
        
        let names = Array();
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let unit = json['reporting_period']['units'][index];
          names.push({ 'value': 'a' + index, 'label': currentValue + ' (' + unit + '/H)'});
        });
        setTenantLineChartOptions(names);
      
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
            json['reporting_period']['sub_averages'].forEach((currentValue, energyCategoryIndex) => {
              if (json['reporting_period']['sub_averages'][energyCategoryIndex][timestampIndex] != null) {
                detailed_value['a' + 2 * energyCategoryIndex] = json['reporting_period']['sub_averages'][energyCategoryIndex][timestampIndex].toFixed(2);
              } else {
                detailed_value['a' + 2 * energyCategoryIndex] = '';
              };  
            
              if (json['reporting_period']['sub_maximums'][energyCategoryIndex][timestampIndex] != null) {
                detailed_value['a' + (2 * energyCategoryIndex + 1)] = json['reporting_period']['sub_maximums'][energyCategoryIndex][timestampIndex].toFixed(2);
              } else {
                detailed_value['a' + (2 * energyCategoryIndex + 1)] = '';
              };            
            });
            detailed_value_list.push(detailed_value);
          });
        };

        setDetailedDataTableData(detailed_value_list);
        
        let detailed_column_list = [];
        detailed_column_list.push({
          dataField: 'startdatetime',
          text: t('Datetime'),
          sort: true
        })
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let unit = json['reporting_period']['units'][index];
          detailed_column_list.push({
            dataField: 'a' + 2 * index,
            text: currentValue + ' ' + t('Average Load') + ' (' + unit + '/H)',
            sort: true
          });
          detailed_column_list.push({
            dataField: 'a' + (2 * index + 1),
            text: currentValue + ' ' + t('Maximum Load') + ' (' + unit + '/H)',
            sort: true
          });
        });
        setDetailedDataTableColumns(detailed_column_list);
        
        setExcelBytesBase64(json['excel_bytes_base64']);

        // enable submit button
        setSubmitButtonDisabled(false);
        // hide spinner
        setSpinnerHidden(true);
        // show export buttion
        setExportButtonHidden(false);
        
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
    const fileName = 'tenantload.xlsx'
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
          <BreadcrumbItem>{t('Tenant Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Load')}</BreadcrumbItem>
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
      {cardSummaryList.map(cardSummaryItem => (
        <div className="card-deck" key={cardSummaryItem['name']}>
          <CardSummary key={cardSummaryItem['name'] + 'average'}
            rate={cardSummaryItem['average_increment_rate']}
            title={t('Reporting Period CATEGORY Average Load UNIT', { 'CATEGORY': cardSummaryItem['name'], 'UNIT': '(' + cardSummaryItem['unit'] + '/H)' })}
            color="success" 
            footnote={t('Per Unit Area')} 
            footvalue={cardSummaryItem['average_per_unit_area']}
            footunit={"(" + cardSummaryItem['unit'] + "/H/M²)"} >
            {cardSummaryItem['average'] && <CountUp end={cardSummaryItem['average']} duration={2} prefix="" separator="," decimal="." decimals={2} />}
          </CardSummary>
          <CardSummary key={cardSummaryItem['name'] + 'maximum'}
            rate={cardSummaryItem['maximum_increment_rate']}
            title={t('Reporting Period CATEGORY Maximum Load UNIT', { 'CATEGORY': cardSummaryItem['name'], 'UNIT': '(' + cardSummaryItem['unit'] + '/H)' })}
            color="success" 
            footnote={t('Per Unit Area')} 
            footvalue={cardSummaryItem['maximum_per_unit_area']}
            footunit={"(" + cardSummaryItem['unit'] + "/H/M²)"} >
            {cardSummaryItem['maximum'] && <CountUp end={cardSummaryItem['maximum']} duration={2} prefix="" separator="," decimal="." decimals={2} />}
          </CardSummary>
          <CardSummary key={cardSummaryItem['name'] + 'factor'}
            rate={cardSummaryItem['factor_increment_rate']}
            title={t('Reporting Period CATEGORY Load Factor', { 'CATEGORY': cardSummaryItem['name'] })}
            color="success" 
            footnote={t('Ratio of Average Load to Maximum Load')} >
            {cardSummaryItem['factor'] && <CountUp end={cardSummaryItem['factor']} duration={2} prefix="" separator="," decimal="." decimals={2} />}
          </CardSummary>
        </div>
      ))}
      <LineChart reportingTitle={t('Reporting Period CATEGORY Maximum Load UNIT', { 'CATEGORY': null, 'UNIT': null })}
        baseTitle=''
        labels={tenantLineChartLabels}
        data={tenantLineChartData}
        options={tenantLineChartOptions}>
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

export default withTranslation()(withRedirect(TenantLoad));
