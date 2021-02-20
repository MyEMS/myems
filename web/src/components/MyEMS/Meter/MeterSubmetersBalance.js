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
import Loader from '../../common/Loader';
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


const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

const MeterSubmetersBalance = ({ setRedirect, setRedirectUrl, t }) => {
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
  //Query From
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [meterList, setMeterList] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState(undefined);
  const [periodType, setPeriodType] = useState('daily');
  const [reportingPeriodBeginsDatetime, setReportingPeriodBeginsDatetime] = useState(current_moment.clone().startOf('month'));
  const [reportingPeriodEndsDatetime, setReportingPeriodEndsDatetime] = useState(current_moment);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [exportButtonHidden, setExportButtonHidden] = useState(true);

  const [loading, setLoading] = useState(false);
  //Results
  const [meterEnergyCategory, setMeterEnergyCategory] = useState({ 'name': '', 'unit': '' });
  const [reportingPeriodMasterMeterConsumptionInCategory, setReportingPeriodMasterMeterConsumptionInCategory] = useState(0);
  const [reportingPeriodSubmetersConsumptionInCategory, setReportingPeriodSubmetersConsumptionInCategory] = useState(0);
  const [reportingPeriodDifferenceInCategory, setReportingPeriodDifferenceInCategory] = useState(0);
  const [reportingPeriodPercentageDifference, setReportingPeriodPercentageDifference] = useState(0);
  const [meterLineChartOptions, setMeterLineChartOptions] = useState([]);
  const [meterLineChartData, setMeterLineChartData] = useState({});
  const [meterLineChartLabels, setMeterLineChartLabels] = useState([]);
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
        // get Meters by root Space ID
        let isResponseOK = false;
        fetch(APIBaseURL + '/spaces/' + [json[0]].map(o => o.value) + '/meters', {
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
            setMeterList(json[0]);
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
            toast.error(json.description)
          }
        }).catch(err => {
          console.log(err);
        });
        // end of get Meters by root Space ID
      } else {
        toast.error(json.description);
      }
    }).catch(err => {
      console.log(err);
    });

  }, [t,]);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';


  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    setSelectedSpaceID(value[value.length - 1]);

    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + value[value.length - 1] + '/meters', {
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
        setMeterList(json[0]);
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
        toast.error(json.description)
      }
    }).catch(err => {
      console.log(err);
    });
  }

  let onReportingPeriodBeginsDatetimeChange = (newDateTime) => {
    setReportingPeriodBeginsDatetime(newDateTime);
  }

  let onReportingPeriodEndsDatetimeChange = (newDateTime) => {
    setReportingPeriodEndsDatetime(newDateTime);
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
    console.log(selectedMeter);
    console.log(periodType);
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
    fetch(APIBaseURL + '/reports/metersubmetersbalance?' +
      'meterid=' + selectedMeter +
      '&periodtype=' + periodType +
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
        setMeterEnergyCategory({
          'name': json['meter']['energy_category_name'],
          'unit': json['meter']['unit_of_measure']
        });
        
        setReportingPeriodMasterMeterConsumptionInCategory(json['reporting_period']['master_meter_consumption_in_category']);
        setReportingPeriodSubmetersConsumptionInCategory(json['reporting_period']['submeters_consumption_in_category']);
        setReportingPeriodDifferenceInCategory(json['reporting_period']['difference_in_category']);
        setReportingPeriodPercentageDifference(parseFloat((json['reporting_period']['percentage_difference'] * 100).toFixed(2)));

        let names = Array();
        names.push({ 'value': 'a0', 'label': json['meter']['energy_category_name'] });
        setMeterLineChartOptions(names);
        
        let timestamps = {}
        timestamps['a0'] = json['reporting_period']['timestamps'];
        setMeterLineChartLabels(timestamps);

        let values = {'a0':[]}
        json['reporting_period']['difference_values'].forEach((currentValue, index) => {
          values['a0'][index] = currentValue.toFixed(2);
        });
        setMeterLineChartData(values)

        names = Array();
        json['parameters']['names'].forEach((currentValue, index) => {
          names.push({ 'value': 'a' + index, 'label': currentValue });
        });
        setParameterLineChartOptions(names);
        
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

        setDetailedDataTableColumns([{
          dataField: 'startdatetime',
          text: t('Datetime'),
          sort: true
        }, {
          dataField: 'a0',
          text: json['meter']['energy_category_name'] + ' (' + json['meter']['unit_of_measure'] + ')',
          sort: true
        }]);

        let detailed_value_list = [];
        json['reporting_period']['timestamps'].forEach((currentTimestamp, timestampIndex) => {
          let detailed_value = {};
          detailed_value['id'] = timestampIndex;
          detailed_value['startdatetime'] = currentTimestamp;
          detailed_value['a0'] = json['reporting_period']['difference_values'][timestampIndex].toFixed(2);
          detailed_value_list.push(detailed_value);
        });
        
        let detailed_value = {};
        detailed_value['id'] = detailed_value_list.length;
        detailed_value['startdatetime'] = t('Total');
        detailed_value['a0'] = json['reporting_period']['difference_in_category'].toFixed(2);
        detailed_value_list.push(detailed_value);
        setDetailedDataTableData(detailed_value_list);
        
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
    const fileName = 'metersubmetersbalance.xlsx'
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
          <BreadcrumbItem>{t('Meter Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Master Meter Submeters Balance')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form >
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
                  <Label className={labelClasses} for="meterSelect">
                    {t('Meter')}
                  </Label>
                  <CustomInput type="select" id="meterSelect" name="meterSelect" onChange={({ target }) => setSelectedMeter(target.value)}
                  >
                    {meterList.map((meter, index) => (
                      <option value={meter.value} key={meter.value}>
                        {meter.label}
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
      <Fragment>

        <div className="card-deck">

          <CardSummary title={t('Reporting Period Master Meter Consumption CATEGORY UNIT', { 'CATEGORY': meterEnergyCategory['name'], 'UNIT': '(' + meterEnergyCategory['unit'] + ')' })}
            color="success"  >
            <CountUp end={reportingPeriodMasterMeterConsumptionInCategory} duration={2} prefix="" separator="," decimals={2} decimal="." />
          </CardSummary>
          <CardSummary title={t('Reporting Period Submeters Consumption CATEGORY UNIT', { 'CATEGORY': meterEnergyCategory['name'], 'UNIT': '(' + meterEnergyCategory['unit'] + ')' })}
            color="warning" >
            <CountUp end={reportingPeriodSubmetersConsumptionInCategory} duration={2} prefix="" separator="," decimal="." decimals={2} />
          </CardSummary>
          <CardSummary title={t('Reporting Period Difference CATEGORY UNIT', { 'CATEGORY': meterEnergyCategory['name'], 'UNIT': '(' + meterEnergyCategory['unit'] + ')' })}
            color="warning" >
            <CountUp end={reportingPeriodDifferenceInCategory} duration={2} prefix="" separator="," decimal="." decimals={2} />
          </CardSummary>
          <CardSummary title={t('Reporting Period Percentage Difference') + '(%)'}
            color="warning" >
            <CountUp end={reportingPeriodPercentageDifference} duration={2} prefix="" separator="," decimal="." decimals={2} />
          </CardSummary>

        </div>

        <LineChart reportingTitle={t('Reporting Period Difference CATEGORY VALUE UNIT', { 'CATEGORY': meterEnergyCategory['name'], 'VALUE': reportingPeriodDifferenceInCategory.toFixed(2), 'UNIT': '(' + meterEnergyCategory['unit'] + ')' })}
          baseTitle={t('Reporting Period Master Meter Consumption CATEGORY VALUE UNIT', { 'CATEGORY': meterEnergyCategory['name'], 'VALUE': reportingPeriodMasterMeterConsumptionInCategory.toFixed(2), 'UNIT': '(' + meterEnergyCategory['unit'] + ')' }) + ' - ' +
                    t('Reporting Period Submeters Consumption CATEGORY VALUE UNIT', { 'CATEGORY': meterEnergyCategory['name'], 'VALUE': reportingPeriodSubmetersConsumptionInCategory.toFixed(2), 'UNIT': '(' + meterEnergyCategory['unit'] + ')' })}
          labels={meterLineChartLabels}
          data={meterLineChartData}
          options={meterLineChartOptions}>
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
    </Fragment>
  );
};

export default withTranslation()(withRedirect(MeterSubmetersBalance));
