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
import MultipleLineChart from '../common/MultipleLineChart';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import ButtonIcon from '../../common/ButtonIcon';
import { APIBaseURL, settings } from '../../../config';
import { periodTypeOptions } from '../common/PeriodTypeOptions';
import { comparisonTypeOptions } from '../common/ComparisonTypeOptions';
import { endOfDay} from 'date-fns';
import AppContext from '../../../context/Context';
import {Link, useLocation} from 'react-router-dom';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';

const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

const EnergyStoragePowerStationReporting = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
  const location = useLocation();
  const uuid = location.search.split('=')[1];

  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (checkEmpty(is_logged_in) || checkEmpty(token)|| checkEmpty(user_uuid) || !is_logged_in) {
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
    if (uuid === null || !uuid ){
      setSpaceCascaderHidden(false);
      setEnergyStoragePowerStationSearchHidden(false);
    } else {
      setSpaceCascaderHidden(true);
      setEnergyStoragePowerStationSearchHidden(true);
    }
  });

  // State
  //Query Form
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [energyStoragePowerStationList, setEnergyStoragePowerStationList] = useState([]);
  const [filteredEnergyStoragePowerStationList, setFilteredEnergyStoragePowerStationList] = useState([]);
  const [selectedEnergyStoragePowerStation, setSelectedEnergyStoragePowerStation] = useState(undefined);
  const [comparisonType, setComparisonType] = useState('month-on-month');
  const [periodType, setPeriodType] = useState('daily');
  const [cascaderOptions, setCascaderOptions] = useState(undefined);
  const [basePeriodDateRange, setBasePeriodDateRange] = useState([current_moment.clone().subtract(1, 'weeks').subtract(1, 'months').toDate(), current_moment.clone().subtract(1, 'months').toDate()]);
  const [basePeriodDateRangePickerDisabled, setBasePeriodDateRangePickerDisabled] = useState(true);
  const [reportingPeriodDateRange, setReportingPeriodDateRange] = useState([current_moment.clone().subtract(1, 'weeks').toDate(), current_moment.toDate()]);
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
  const [spaceCascaderHidden, setSpaceCascaderHidden] = useState(false);
  const [energyStoragePowerStationSearchHidden, setEnergyStoragePowerStationSearchHidden] = useState(false);
  //Results
  const [energyStoragePowerStationName, setEnergyStoragePowerStationName] = useState();
  const [energyStoragePowerStationSerialNumber, setEnergyStoragePowerStationSerialNumber] = useState();
  const [energyStoragePowerStationAddress, setEnergyStoragePowerStationAddress] = useState();
  const [energyStoragePowerStationPostalCode, setEnergyStoragePowerStationPostalCode] = useState();
  const [energyStoragePowerStationCapacity, setEnergyStoragePowerStationCapacity] = useState();
  const [energyStoragePowerStationLatitude, setEnergyStoragePowerStationLatitude] = useState();
  const [energyStoragePowerStationLongitude, setEnergyStoragePowerStationLongitude] = useState();
  const [energyStoragePowerStationSVG, setEnergyStoragePowerStationSVG] = useState();

  const [cardSummaryList, setCardSummaryList] = useState([]);
  const [energyStoragePowerStationBaseLabels, setEnergyStoragePowerStationBaseLabels] = useState({'a0': []});
  const [energyStoragePowerStationBaseData, setEnergyStoragePowerStationBaseData] = useState({'a0': []});
  const [energyStoragePowerStationReportingNames, setEnergyStoragePowerStationReportingNames] = useState({"a0":""});
  const [energyStoragePowerStationReportingUnits, setEnergyStoragePowerStationReportingUnits] = useState({"a0":"()"});
  const [energyStoragePowerStationReportingSubtotals, setEnergyStoragePowerStationReportingSubtotals] = useState({"a0": (0).toFixed(2)});
  const [energyStoragePowerStationReportingLabels, setEnergyStoragePowerStationReportingLabels] = useState({"a0": []});
  const [energyStoragePowerStationReportingData, setEnergyStoragePowerStationReportingData] = useState({"a0": []});
  const [energyStoragePowerStationReportingOptions, setEnergyStoragePowerStationReportingOptions] = useState([]);
  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);
  const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([{dataField: 'startdatetime', text: t('Datetime'), sort: true}]);
  const [detailedDataTableData, setDetailedDataTableData] = useState([]);
  const [excelBytesBase64, setExcelBytesBase64] = useState(undefined);

  useEffect(() => {
    let isResponseOK = false;
    if (uuid === null || !uuid ){
      fetch(
        APIBaseURL +
        '/spaces/tree', {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': getCookieValue('user_uuid'),
          Token: getCookieValue('token')
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
          // get EnergyStoragePowerStations by root Space ID
          let isResponseOK = false;
          fetch(
            APIBaseURL +
            '/spaces/' +
            [json[0]].map(o => o.value) +
            '/energystoragepowerstations', {
            method: 'GET',
            headers: {
              'Content-type': 'application/json',
              'User-UUID': getCookieValue('user_uuid'),
              Token: getCookieValue('token')
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
              setEnergyStoragePowerStationList(json[0]);
              setFilteredEnergyStoragePowerStationList(json[0]);
              if (json[0].length > 0) {
                setSelectedEnergyStoragePowerStation(json[0][0].value);
                // enable submit button
                setSubmitButtonDisabled(false);
              } else {
                setSelectedEnergyStoragePowerStation(undefined);
                // disable submit button
                setSubmitButtonDisabled(true);
              }
            } else {
              toast.error(t(json.description))
            }
          }).catch(err => {
            console.log(err);
          });
          // end of get EnergyStoragePowerStations by root Space ID
        } else {
          toast.error(t(json.description));
        }
      }).catch(err => {
        console.log(err);
      });
    } else {
      let url = APIBaseURL + '/reports/energystoragepowerstationreporting?' +
        'uuid=' + uuid +
        '&periodtype=' + periodType +
        '&baseperiodstartdatetime=' + (basePeriodDateRange[0] != null ? moment(basePeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') : '') +
        '&baseperiodenddatetime=' + (basePeriodDateRange[1] != null ? moment(basePeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') : '') +
        '&reportingperiodstartdatetime=' + moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
        '&reportingperiodenddatetime=' + moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
        '&language=' + language;
      loadData(url);
    }
  }, []);

  const loadData = (url) => {
    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide export button
    setExportButtonHidden(true)

    // Reinitialize tables
    setDetailedDataTableData([]);

    let isResponseOK = false;
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null,

    }).then(response => {
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
    }).then(json => {
      if (isResponseOK) {
        console.log(json);
        if(uuid !== null && uuid) {
          setFilteredEnergyStoragePowerStationList([{'id': json['energy_storage_power_station']['id'], 'label': json['energy_storage_power_station']['name']}]);
          setSelectedEnergyStoragePowerStation(json['energy_storage_power_station']['id']);
        }
        setEnergyStoragePowerStationName(json['energy_storage_power_station']['name']);
        setEnergyStoragePowerStationSerialNumber(json['energy_storage_power_station']['serial_number']);
        setEnergyStoragePowerStationAddress(json['energy_storage_power_station']['address']);
        setEnergyStoragePowerStationPostalCode(json['energy_storage_power_station']['postal_code']);
        setEnergyStoragePowerStationCapacity(json['energy_storage_power_station']['capacity']);
        setEnergyStoragePowerStationLatitude(json['energy_storage_power_station']['latitude']);
        setEnergyStoragePowerStationLongitude(json['energy_storage_power_station']['longitude']);
        setEnergyStoragePowerStationSVG({__html: json['energy_storage_power_station']['svg']});
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

        let cardSummaryArray = []
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let cardSummaryItem = {};
          cardSummaryItem['name'] = json['reporting_period']['names'][index];
          cardSummaryItem['unit'] = json['reporting_period']['units'][index];
          cardSummaryItem['subtotal'] = json['reporting_period']['subtotals'][index];
          cardSummaryItem['increment_rate'] = parseFloat(json['reporting_period']['increment_rates'][index] * 100).toFixed(2) + "%";

          cardSummaryArray.push(cardSummaryItem);
        });
        setCardSummaryList(cardSummaryArray);


        let base_and_reporting_names = {}
        json['reporting_period']['names'].forEach((currentValue, index) => {
          base_and_reporting_names['a' + index] = currentValue;
        });
        setEnergyStoragePowerStationReportingNames(base_and_reporting_names)

        let base_and_reporting_units = {}
        json['reporting_period']['units'].forEach((currentValue, index) => {
          base_and_reporting_units['a' + index] = "("+currentValue+")";
        });
        setEnergyStoragePowerStationReportingUnits(base_and_reporting_units)


        let reporting_timestamps = {}
        json['reporting_period']['timestamps'].forEach((currentValue, index) => {
          reporting_timestamps['a' + index] = currentValue;
        });
        setEnergyStoragePowerStationReportingLabels(reporting_timestamps);

        let reporting_values = {}
        json['reporting_period']['values'].forEach((currentValue, index) => {
          reporting_values['a' + index] = currentValue;
        });
        console.log(reporting_values);
        setEnergyStoragePowerStationReportingData(reporting_values);

        let reporting_subtotals = {}
        json['reporting_period']['subtotals'].forEach((currentValue, index) => {
          reporting_subtotals['a' + index] = currentValue.toFixed(2);
        });
        setEnergyStoragePowerStationReportingSubtotals(reporting_subtotals);

        let options = Array();
        json['reporting_period']['names'].forEach((currentValue, index) => {
          let unit = json['reporting_period']['units'][index];
          options.push({ 'value': 'a' + index, 'label': currentValue + ' (' + unit + ')'});
        });
        setEnergyStoragePowerStationReportingOptions(options);
        setExcelBytesBase64(json['excel_bytes_base64']);

        // enable submit button
        setSubmitButtonDisabled(false);
        // hide spinner
        setSpinnerHidden(true);
        // show export button
        setExportButtonHidden(false);
      } else {
        toast.error(t(json.description))
        setSpinnerHidden(true);
        setSubmitButtonDisabled(false);
      }
    })
    .catch(err => {
      console.log(err);
    });
  }
  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    setSelectedSpaceID(value[value.length - 1]);

    let isResponseOK = false;
    fetch(
      APIBaseURL +
      '/spaces/' +
      value[value.length - 1] +
      '/energystoragepowerstations', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
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
        setEnergyStoragePowerStationList(json[0]);
        setFilteredEnergyStoragePowerStationList(json[0]);
        if (json[0].length > 0) {
          setSelectedEnergyStoragePowerStation(json[0][0].value);
          // enable submit button
          setSubmitButtonDisabled(false);
        } else {
          setSelectedEnergyStoragePowerStation(undefined);
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

  const onSearchEnergyStoragePowerStation = ({ target }) => {
    const keyword = target.value.toLowerCase();
    const filteredResult = energyStoragePowerStationList.filter(
      energyStoragePowerStation => energyStoragePowerStation.label.toLowerCase().includes(keyword)
    );
    setFilteredEnergyStoragePowerStationList(keyword.length ? filteredResult : energyStoragePowerStationList);
    if (filteredResult.length > 0) {
      setSelectedEnergyStoragePowerStation(filteredResult[0].value);
      // enable submit button
      setSubmitButtonDisabled(false);
    } else {
      setSelectedEnergyStoragePowerStation(undefined);
      // disable submit button
      setSubmitButtonDisabled(true);
    };
    let customInputTarget = document.getElementById('icrogridSelect');
    customInputTarget.value = filteredResult[0].value;
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
      setBasePeriodDateRange([moment(reportingPeriodDateRange[0]).subtract(1, 'days').toDate(),
        moment(reportingPeriodDateRange[1]).subtract(1, 'days').toDate()]);
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
    console.log(selectedEnergyStoragePowerStation);
    console.log(comparisonType);
    console.log(periodType);
    console.log(basePeriodDateRange[0] != null ? moment(basePeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') : null)
    console.log(basePeriodDateRange[1] != null ? moment(basePeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') : null)
    console.log(moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss'))
    console.log(moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss'));

    let url = APIBaseURL + '/reports/energystoragepowerstationreporting?' +
      'id=' + selectedEnergyStoragePowerStation +
      '&periodtype=' + periodType +
      '&baseperiodstartdatetime=' + (basePeriodDateRange[0] != null ? moment(basePeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') : '') +
      '&baseperiodenddatetime=' + (basePeriodDateRange[1] != null ? moment(basePeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') : '') +
      '&reportingperiodstartdatetime=' + moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
      '&reportingperiodenddatetime=' + moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
      '&language=' + language;
    loadData(url);
  };

  const handleExport = e => {
    e.preventDefault();
    const mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const fileName = 'energyStoragePowerStationreproting.xlsx'
    var fileUrl = "data:" + mimeType + ";base64," + excelBytesBase64;
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
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form >
              <Col xs={6} sm={3} hidden={spaceCascaderHidden}>
                <FormGroup className="form-group" >
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
                  <Label className={labelClasses} for="energyStoragePowerStationSelect">
                    {t('Energy Storage Power Station')}
                  </Label>

                  <Form inline>
                      <Input placeholder={t('Search')} onChange={onSearchEnergyStoragePowerStation} hidden={energyStoragePowerStationSearchHidden} />
                      <CustomInput type="select" id="energyStoragePowerStationSelect" name="energyStoragePowerStationSelect" onChange={({ target }) => setSelectedEnergyStoragePowerStation(target.value)}
                      >
                        {filteredEnergyStoragePowerStationList.map((energyStoragePowerStation, index) => (
                          <option value={energyStoragePowerStation.value} key={energyStoragePowerStation.value}>
                            {energyStoragePowerStation.label}
                          </option>
                        ))}
                      </CustomInput>
                  </Form>

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
                    placeholder={t('Select Date Range')}
                   />
                </FormGroup>
              </Col>
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="reportingPeriodDateRangePicker">{t('Reporting Period')}</Label>
                  <br/>
                  <DateRangePickerWrapper
                    id="reportingPeriodDateRangePicker"
                    format="yyyy-MM-dd HH:mm:ss"
                    value={reportingPeriodDateRange}
                    onChange={onReportingPeriodChange}
                    size="md"
                    style={dateRangePickerStyle}
                    onClean={onReportingPeriodClean}
                    locale={dateRangePickerLocale}
                    placeholder={t('Select Date Range')}
                  />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br/>
                  <ButtonGroup id="submit">
                    <Button color="success" disabled={submitButtonDisabled} >{t('Submit')}</Button>
                  </ButtonGroup>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup>
                  <br />
                  <Spinner color="primary" hidden={spinnerHidden}  />
                </FormGroup>
              </Col>
              <Col xs="auto">
                  <br />
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
              title={cardSummaryItem['name'] + '(' + cardSummaryItem['unit'] + ')' }
              color="success" >
              {cardSummaryItem['subtotal'] && <CountUp end={cardSummaryItem['subtotal']} duration={2} prefix="" separator="," decimal="." decimals={2} />}
            </CardSummary>
        ))}
      </div>
      <MultiTrendChart reportingTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": energyStoragePowerStationReportingNames, "VALUE": energyStoragePowerStationReportingSubtotals, "UNIT": energyStoragePowerStationReportingUnits}}
        baseTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": {"a0":""}, "VALUE": {"a0": (0).toFixed(2)}, "UNIT": {"a0":"()"}}}
        reportingTooltipTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": {"a0":""}, "VALUE": null, "UNIT": {"a0":"()"}}}
        baseTooltipTitle = {{"name": "CATEGORY VALUE UNIT", "substitute": ["CATEGORY", "VALUE", "UNIT"], "CATEGORY": {"a0":""}, "VALUE": null, "UNIT": {"a0":"()"}}}
        reportingLabels={energyStoragePowerStationReportingLabels}
        reportingData={energyStoragePowerStationReportingData}
        baseLabels={energyStoragePowerStationReportingLabels}
        baseData={energyStoragePowerStationReportingData}
        rates={{"a0": []}}
        options={energyStoragePowerStationReportingOptions}>
      </MultiTrendChart>
      <MultipleLineChart reportingTitle={t('Operating Characteristic Curve')}
            baseTitle=''
            labels={parameterLineChartLabels}
            data={parameterLineChartData}
            options={parameterLineChartOptions}>
      </MultipleLineChart>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(EnergyStoragePowerStationReporting));
