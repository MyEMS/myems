import React, { Fragment, useEffect, useState, useContext } from 'react';
import {
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
import moment from 'moment';
import loadable from '@loadable/component';
import Cascader from 'rc-cascader';
import MultipleLineChart from '../common/MultipleLineChart';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { APIBaseURL, settings } from '../../../config';
import { endOfDay } from 'date-fns';
import AppContext from '../../../context/Context';
import { Link, useLocation } from 'react-router-dom';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import blankPage from '../../../assets/img/generic/blank-page.png';


const DetailedDataTable = loadable(() => import('../common/DetailedDataTable'));

const PhotovoltaicPowerStationReportingParameters = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
  const location = useLocation();
  const uuid = location.search.split('=')[1];

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

  // State
  //Query Form
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [photovoltaicPowerStationList, setPhotovoltaicPowerStationList] = useState([]);
  const [filteredPhotovoltaicPowerStationList, setFilteredPhotovoltaicPowerStationList] = useState([]);
  const [selectedPhotovoltaicPowerStation, setSelectedPhotovoltaicPowerStation] = useState(undefined);

  const [cascaderOptions, setCascaderOptions] = useState(undefined);

  const [reportingPeriodDateRange, setReportingPeriodDateRange] = useState([
    current_moment
      .clone()
      .subtract(1, 'weeks')
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
  const [spaceCascaderHidden, setSpaceCascaderHidden] = useState(false);
  const [resultDataHidden, setResultDataHidden] = useState(true);

  //Results
  const [photovoltaicPowerStationName, setPhotovoltaicPowerStationName] = useState();
  const [photovoltaicPowerStationSerialNumber, setPhotovoltaicPowerStationSerialNumber] = useState();
  const [photovoltaicPowerStationAddress, setPhotovoltaicPowerStationAddress] = useState();
  const [photovoltaicPowerStationPostalCode, setPhotovoltaicPowerStationPostalCode] = useState();
  const [photovoltaicPowerStationRatedCapacity, setPhotovoltaicPowerStationRatedCapacity] = useState();
  const [photovoltaicPowerStationRatedPower, setPhotovoltaicPowerStationRatedPower] = useState();
  const [photovoltaicPowerStationLatitude, setPhotovoltaicPowerStationLatitude] = useState();
  const [photovoltaicPowerStationLongitude, setPhotovoltaicPowerStationLongitude] = useState();

  const [cardSummaryList, setCardSummaryList] = useState([]);
  const [photovoltaicPowerStationBaseLabels, setPhotovoltaicPowerStationBaseLabels] = useState({ a0: [] });
  const [photovoltaicPowerStationBaseData, setPhotovoltaicPowerStationBaseData] = useState({ a0: [] });
  const [photovoltaicPowerStationReportingNames, setPhotovoltaicPowerStationReportingNames] = useState({ a0: '' });
  const [photovoltaicPowerStationReportingUnits, setPhotovoltaicPowerStationReportingUnits] = useState({ a0: '()' });
  const [photovoltaicPowerStationReportingSubtotals, setPhotovoltaicPowerStationReportingSubtotals] = useState({
    a0: (0).toFixed(2)
  });
  const [photovoltaicPowerStationReportingLabels, setPhotovoltaicPowerStationReportingLabels] = useState({ a0: [] });
  const [photovoltaicPowerStationReportingData, setPhotovoltaicPowerStationReportingData] = useState({ a0: [] });
  const [photovoltaicPowerStationReportingOptions, setPhotovoltaicPowerStationReportingOptions] = useState([]);
  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);

  const [detailedDataTableData, setDetailedDataTableData] = useState([]);
  const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([
    { dataField: 'startdatetime', text: t('Datetime'), sort: true }
  ]);

  const [excelBytesBase64, setExcelBytesBase64] = useState(undefined);

  useEffect(() => {
    let isResponseOK = false;
    setSpaceCascaderHidden(false);
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
          setSelectedSpaceName([json[0]].map(o => o.label));
          let selectedSpaceID  = [json[0]].map(o => o.value);
          // get PhotovoltaicPowerStations by root Space ID
          let isResponseOK = false;
          fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/photovoltaicpowerstations', {
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
              }
              return response.json();
            })
            .then(json => {
              if (isResponseOK) {
                json = JSON.parse(
                  JSON.stringify([json])
                    .split('"id":')
                    .join('"value":')
                    .split('"name":')
                    .join('"label":')
                );

                setPhotovoltaicPowerStationList(json[0]);
                setFilteredPhotovoltaicPowerStationList(json[0]);
                if (json[0].length > 0) {
                  setSelectedPhotovoltaicPowerStation(json[0][0].value);
                  // enable submit button
                  setSubmitButtonDisabled(false);
                } else {
                  setSelectedPhotovoltaicPowerStation(undefined);
                  // disable submit button
                  setSubmitButtonDisabled(true);
                }
              } else {
                toast.error(t(json.description));
              }
            })
            .catch(err => {
              console.log(err);
            });
          // end of get PhotovoltaicPowerStations by root Space ID
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const loadData = url => {
    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide result data
    setResultDataHidden(true);

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
      body: null
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {

          setPhotovoltaicPowerStationName(json['photovoltaic_power_station']['name']);
          setPhotovoltaicPowerStationSerialNumber(json['photovoltaic_power_station']['serial_number']);
          setPhotovoltaicPowerStationAddress(json['photovoltaic_power_station']['address']);
          setPhotovoltaicPowerStationPostalCode(json['photovoltaic_power_station']['postal_code']);
          setPhotovoltaicPowerStationRatedCapacity(json['photovoltaic_power_station']['rated_capacity']);
          setPhotovoltaicPowerStationRatedPower(json['photovoltaic_power_station']['rated_power']);
          setPhotovoltaicPowerStationLatitude(json['photovoltaic_power_station']['latitude']);
          setPhotovoltaicPowerStationLongitude(json['photovoltaic_power_station']['longitude']);
          let timestamps = {};
          json['parameters']['timestamps'].forEach((currentValue, index) => {
            timestamps['a' + index] = currentValue;
          });
          setParameterLineChartLabels(timestamps);

          let values = {};
          json['parameters']['values'].forEach((currentValue, index) => {
            values['a' + index] = currentValue;
          });
          setParameterLineChartData(values);

          let names = [];
          json['parameters']['names'].forEach((currentValue, index) => {
            names.push({ value: 'a' + index, label: currentValue });
          });
          setParameterLineChartOptions(names);

          // enable submit button
          setSubmitButtonDisabled(false);
          // hide spinner
          setSpinnerHidden(true);
          // show result data
          setResultDataHidden(false);
        } else {
          toast.error(t(json.description));
          setSpinnerHidden(true);
          setSubmitButtonDisabled(false);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };
  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/photovoltaicpowerstations', {
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
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          json = JSON.parse(
            JSON.stringify([json])
              .split('"id":')
              .join('"value":')
              .split('"name":')
              .join('"label":')
          );

          setPhotovoltaicPowerStationList(json[0]);
          setFilteredPhotovoltaicPowerStationList(json[0]);
          if (json[0].length > 0) {
            setSelectedPhotovoltaicPowerStation(json[0][0].value);
            // enable submit button
            setSubmitButtonDisabled(false);
          } else {
            setSelectedPhotovoltaicPowerStation(undefined);
            // disable submit button
            setSubmitButtonDisabled(true);
          }
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const onSearchPhotovoltaicPowerStation = ({ target }) => {
    const keyword = target.value.toLowerCase();
    const filteredResult = photovoltaicPowerStationList.filter(photovoltaicPowerStation =>
      photovoltaicPowerStation.label.toLowerCase().includes(keyword)
    );
    setFilteredPhotovoltaicPowerStationList(keyword.length ? filteredResult : photovoltaicPowerStationList);
    if (filteredResult.length > 0) {
      setSelectedPhotovoltaicPowerStation(filteredResult[0].value);
      // enable submit button
      setSubmitButtonDisabled(false);
    } else {
      setSelectedPhotovoltaicPowerStation(undefined);
      // disable submit button
      setSubmitButtonDisabled(true);
    }
    let customInputTarget = document.getElementById('photovoltaicPowerStationSelect');
    customInputTarget.value = filteredResult[0].value;
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
    }
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
    let url =
      APIBaseURL +
      '/reports/photovoltaicpowerstationreportingparameters?' +
      'id=' +
      selectedPhotovoltaicPowerStation +
      '&reportingperiodstartdatetime=' +
      moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
      '&reportingperiodenddatetime=' +
      moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
      '&language=' +
      language;
    loadData(url);
  };

  return (
    <Fragment>
      <Card className="bg-light mb-3">
        <CardBody className="p-3">
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col xs={6} sm={3} hidden={spaceCascaderHidden}>
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
                  <Label className={labelClasses} for="photovoltaicPowerStationSelect">
                    {t('Photovoltaic Power Station')}
                  </Label>

                  <Form inline>
                    <CustomInput
                      type="select"
                      id="photovoltaicPowerStationSelect"
                      name="photovoltaicPowerStationSelect"
                      bsSize="sm"
                      onChange={({ target }) => setSelectedPhotovoltaicPowerStation(target.value)}
                    >
                      {filteredPhotovoltaicPowerStationList.map((photovoltaicPowerStation, index) => (
                        <option value={photovoltaicPowerStation.value} key={photovoltaicPowerStation.value}>
                          {photovoltaicPowerStation.label}
                        </option>
                      ))}
                    </CustomInput>
                  </Form>
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
            </Row>
          </Form>
        </CardBody>
      </Card>
      <div  style={{ visibility: resultDataHidden ? 'visible' : 'hidden', display: resultDataHidden ? '': 'none' }}>
          <img className="img-fluid" src={blankPage} alt="" />
      </div>
      <div style={{ visibility: resultDataHidden ? 'hidden' : 'visible', display: resultDataHidden ? 'none': ''  }}>
        <MultipleLineChart
          reportingTitle={t('Operating Characteristic Curve')}
          baseTitle=""
          labels={parameterLineChartLabels}
          data={parameterLineChartData}
          options={parameterLineChartOptions}
        />
      </div>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(PhotovoltaicPowerStationReportingParameters));
