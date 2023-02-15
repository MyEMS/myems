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
import Cascader from 'rc-cascader';
import moment from 'moment';
import loadable from '@loadable/component';
import CardSummary from '../common/CardSummary';
import LineChart from '../common/LineChart';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL } from '../../../config';
import { periodTypeOptions } from '../common/PeriodTypeOptions';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import { endOfDay} from 'date-fns';
import AppContext from '../../../context/Context';
import MultipleLineChart from '../common/MultipleLineChart';

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
  const [meterList, setMeterList] = useState([]);
  const [filteredMeterList, setFilteredMeterList] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState(undefined);
  const [periodType, setPeriodType] = useState('daily');
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
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
            toast.error(t(json.description))
          }
        }).catch(err => {
          console.log(err);
        });
        // end of get Meters by root Space ID
      } else {
        toast.error(t(json.description));
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
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });
  };
  
  const onSearchMeter = ({ target }) => {
    const keyword = target.value.toLowerCase();
    const filteredResult = meterList.filter(
      meter => meter.label.toLowerCase().includes(keyword)
    );
    setFilteredMeterList(keyword.length ? filteredResult : meterList);
    if (filteredResult.length > 0) {
      setSelectedMeter(filteredResult[0].value);
      // enable submit button
      setSubmitButtonDisabled(false);
    } else {
      setSelectedMeter(undefined);
      // disable submit button
      setSubmitButtonDisabled(true);
    };
    let customInputTarget = document.getElementById('meterSelect');
    customInputTarget.value = filteredResult[0].value;
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
    }
  };

  let onReportingPeriodClean = event => {
    setReportingPeriodDateRange([null, null]);
  };

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit');
    console.log(selectedSpaceID);
    console.log(selectedMeter);
    console.log(periodType);
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
    fetch(APIBaseURL + '/reports/metersubmetersbalance?' +
      'meterid=' + selectedMeter +
      '&periodtype=' + periodType +
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
          detailed_value['a0'] = json['reporting_period']['difference_values'][timestampIndex];
          detailed_value_list.push(detailed_value);
        });
        
        let detailed_value = {};
        detailed_value['id'] = detailed_value_list.length;
        detailed_value['startdatetime'] = t('Total');
        detailed_value['a0'] = json['reporting_period']['difference_in_category'];
        detailed_value_list.push(detailed_value);
        setTimeout( () => {
          setDetailedDataTableData(detailed_value_list);
        }, 0)
        
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
                  <Label className={labelClasses} for="meterSelect">
                    {t('Meter')}
                  </Label>
                  <Form inline>
                      <Input placeholder={t('Search')} onChange={onSearchMeter} />
                      <CustomInput type="select" id="meterSelect" name="meterSelect" onChange={({ target }) => setSelectedMeter(target.value)}
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
    </Fragment>
  );
};

export default withTranslation()(withRedirect(MeterSubmetersBalance));
