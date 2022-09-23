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

const SpaceEfficiency = ({ setRedirect, setRedirectUrl, t }) => {
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
  const [cardSummaryList, setCardSummaryList] = useState([]);
  const [spaceLineChartLabels, setSpaceLineChartLabels] = useState([]);
  const [spaceLineChartData, setSpaceLineChartData] = useState({});
  const [spaceLineChartOptions, setSpaceLineChartOptions] = useState([]);
  
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
        toast.error(t(json.description));
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
    fetch(APIBaseURL + '/reports/spaceefficiency?' +
      'spaceid=' + selectedSpaceID +
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
      }
      return response.json();
    }).then(json => {
      if (isResponseOK) {
        console.log(json)
        let cardSummaryArray = []
        json['reporting_period_efficiency']['names'].forEach((currentValue, index) => {
          let cardSummaryItem = {}
          cardSummaryItem['name'] = json['reporting_period_efficiency']['names'][index];
          cardSummaryItem['unit'] = json['reporting_period_efficiency']['units'][index];
          cardSummaryItem['cumulation'] = json['reporting_period_efficiency']['cumulations'][index];
          cardSummaryItem['increment_rate'] = parseFloat(json['reporting_period_efficiency']['increment_rates'][index] * 100).toFixed(2) + "%";
          cardSummaryArray.push(cardSummaryItem);
        });
        setCardSummaryList(cardSummaryArray);
      
        let timestamps = {}
        json['reporting_period_efficiency']['timestamps'].forEach((currentValue, index) => {
          timestamps['a' + index] = currentValue;
        });
        setSpaceLineChartLabels(timestamps);
        
        let values = {}
        json['reporting_period_efficiency']['values'].forEach((currentValue, index) => {
          values['a' + index] = currentValue;
        });
        setSpaceLineChartData(values);
        
        let names = Array();
        json['reporting_period_efficiency']['names'].forEach((currentValue, index) => {
          let unit = json['reporting_period_efficiency']['units'][index];
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
        if (json['reporting_period_efficiency']['timestamps'].length > 0) {
          json['reporting_period_efficiency']['timestamps'][0].forEach((currentTimestamp, timestampIndex) => {
            let detailed_value = {};
            detailed_value['id'] = timestampIndex;
            detailed_value['startdatetime'] = currentTimestamp;
            json['reporting_period_efficiency']['values'].forEach((currentValue, energyCategoryIndex) => {
              if (json['reporting_period_efficiency']['values'][energyCategoryIndex][timestampIndex] != null) {
                detailed_value['a' + energyCategoryIndex] = json['reporting_period_efficiency']['values'][energyCategoryIndex][timestampIndex];
              } else {
                detailed_value['a' + energyCategoryIndex] = null;
              };
            });
            
            detailed_value_list.push(detailed_value);
          });
        };

        let detailed_value = {};
        detailed_value['id'] = detailed_value_list.length;
        detailed_value['startdatetime'] = t('Subtotal');
        json['reporting_period_efficiency']['cumulations'].forEach((currentValue, index) => {
            if (currentValue != null) {
              detailed_value['a' + index] = currentValue;
            }else {
              detailed_value['a' + index] = null;
            }
          });
        detailed_value_list.push(detailed_value);
        setDetailedDataTableData(detailed_value_list);
        
        let detailed_column_list = [];
        detailed_column_list.push({
          dataField: 'startdatetime',
          text: t('Datetime'),
          sort: true
        })
        json['reporting_period_efficiency']['names'].forEach((currentValue, index) => {
          let unit = json['reporting_period_efficiency']['units'][index];
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
          })
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
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    }); 
  
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const fileName = 'spaceefficiency.xlsx'
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
          <BreadcrumbItem>{t('Space Data')}</BreadcrumbItem><BreadcrumbItem active>{t('Efficiency')}</BreadcrumbItem>
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
            title={t('Reporting Period Cumulative Efficiency NAME UNIT', { 'NAME': cardSummaryItem['name'], 'UNIT': '(' + cardSummaryItem['unit'] + ')' })}
            color="success" 
            >
            {cardSummaryItem['cumulation'] && <CountUp end={cardSummaryItem['cumulation']} duration={2} prefix="" separator="," decimal="." decimals={2} />}
          </CardSummary>
        ))}
      </div>
      <LineChart reportingTitle={t('Reporting Period Cumulative Efficiency VALUE UNIT', { 'VALUE': null, 'UNIT': null })}
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
      
    </Fragment>
  );
};

export default withTranslation()(withRedirect(SpaceEfficiency));
