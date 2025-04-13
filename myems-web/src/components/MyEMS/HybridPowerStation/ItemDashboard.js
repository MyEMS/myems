import React, { Fragment, useEffect, useState, useContext } from 'react';
import CountUp from 'react-countup';
import {
  Button,
  ButtonGroup,
  Col,
  CustomInput,
  Form,
  FormGroup,
  Input,
  Row,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';
import Cascader from 'rc-cascader';
import CardSummary from '../common/CardSummary';
import { toast } from 'react-toastify';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { APIBaseURL, settings } from '../../../config';
import { getItemFromStore } from '../../../helpers/utils';
import CustomizeMapBox from '../common/CustomizeMapBox';
import classNames from 'classnames';
import AppContext from '../../../context/Context';
import StackBarChart from './StackBarChart';
import blankPage from '../../../assets/img/generic/blank-page.png';

const ItemDashboard = ({ setRedirect, setRedirectUrl, t }) => {
  const [activeTabLeft, setActiveTabLeft] = useState('1');
  const toggleTabLeft = tab => {
    if (activeTabLeft !== tab) setActiveTabLeft(tab);
  };
  const { currency } = useContext(AppContext);
  // State
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [stationList, setStationList] = useState([]);
  const [filteredStationList, setFilteredStationList] = useState([]);
  const [selectedStation, setSelectedStation] = useState(undefined);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(false);
  const [spaceCascaderHidden, setSpaceCascaderHidden] = useState(false);
  const [resultDataHidden, setResultDataHidden] = useState(true);

  //Results
  const [totalRatedCapacity, setTotalRatedCapacity] = useState({});
  const [totalRatedPower, setTotalRatedPower] = useState({});
  const [totalCharge, setTotalCharge] = useState({});
  const [totalDischarge, setTotalDischarge] = useState({});
  const [totalRevenue, setTotalRevenue] = useState({});

  const [chargeEnergyData, setChargeEnergyData] = useState({});
  const [dischargeEnergyData, setDischargeEnergyData] = useState({});
  const [chargeBillingData, setChargeBillingData] = useState({});
  const [dischargeBillingData, setDischargeBillingData] = useState({});
  const [chargeCarbonData, setChargeCarbonData] = useState({});
  const [dischargeCarbonData, setDischargeCarbonData] = useState({});
  const [chargeEnergyLabels, setChargeEnergyLabels] = useState([]);
  const [dischargeEnergyLabels, setDischargeEnergyLabels] = useState([]);
  const [chargeBillingLabels, setChargeBillingLabels] = useState([]);
  const [dischargeBillingLabels, setDischargeBillingLabels] = useState([]);
  const [chargeCarbonLabels, setChargeCarbonLabels] = useState([]);
  const [dischargeCarbonLabels, setDischargeCarbonLabels] = useState([]);
  const [periodTypes, setPeriodTypes] = useState([{ value: 'a0', label: t('7 Days') }, { value: 'a1', label: t('This Month') }, { value: 'a2', label: t('This Year') }]);
  const [language, setLanguage] = useState(getItemFromStore('myems_web_ui_language', settings.language));
  const [geojson, setGeojson] = useState({});
  const [rootLatitude, setRootLatitude] = useState('');
  const [rootLongitude, setRootLongitude] = useState('');


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
          // hide spinner
          setSpinnerHidden(true);
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
          // get Energy Storage Power Stations by root Space ID
          let isResponseOK = false;
          fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/hybridpowerstations', {
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
                setStationList(json[0]);
                setFilteredStationList(json[0]);
                if (json[0].length > 0) {
                  // select the first station in the list
                  let stationID = json[0][0].value;
                  setSelectedStation(stationID);
                  // enable submit button
                  setSubmitButtonDisabled(false);
                  // show spinner
                  setSpinnerHidden(false);
                  // automatically submit with station
                  loadData(stationID);
                  loadEnergyData(stationID);
                  loadBillingData(stationID);
                  loadCarbonData(stationID);
                } else {
                  setSelectedStation(undefined);
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
          // end of get Energy Storage Power Stations by root Space ID
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const loadData = (stationID) => {

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
      // disable submit button
      setSubmitButtonDisabled(true);
      // show spinner
      setSpinnerHidden(false);
      // hide result data
      setResultDataHidden(true);

      let isResponseOK = false;
      fetch(
        APIBaseURL + '/reports/hybridpowerstationitemdashboard?id=' + stationID,
        {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'User-UUID': getCookieValue('user_uuid'),
            Token: getCookieValue('token')
          },
          body: null
        }
      )
        .then(response => {
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        })
        .then(json => {
          if (isResponseOK) {
            // enable submit button
            setSubmitButtonDisabled(false);
            // hide spinner
            setSpinnerHidden(true);
            // show result data
            setResultDataHidden(false);

            let hybridPowerStation = json['hybrid_power_station'];
            let totalRatedCapacity = hybridPowerStation['rated_capacity'];
            let totalRatedPower = hybridPowerStation['rated_power'];
            setTotalRatedCapacity(totalRatedCapacity);
            setTotalRatedPower(totalRatedPower);

            setRootLongitude(hybridPowerStation['longitude']);
            setRootLatitude(hybridPowerStation['latitude']);
            let geojson = {};
            let geojsonData = [];

            if (hybridPowerStation['latitude'] && hybridPowerStation['longitude']) {
              geojsonData.push({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [hybridPowerStation['longitude'], hybridPowerStation['latitude']]
                },
                properties: {
                  title: hybridPowerStation['name'],
                  description: hybridPowerStation['description'],
                  uuid: hybridPowerStation['uuid'],
                  url: '/singlehybridpowerstation/details'
                }
              });
            }
            hybridPowerStation['nameuuid'] = hybridPowerStation['name'] + hybridPowerStation['uuid'];

            geojson['type'] = 'FeatureCollection';
            geojson['features'] = geojsonData;
            setGeojson(geojson);

            setTotalCharge(json['total_charge_energy']);
            setTotalDischarge(json['total_discharge_energy']);
            setTotalRevenue(json['total_discharge_billing']);
          }
        });
    }
  };

  const loadEnergyData = (stationID) => {
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

      let isResponseOK = false;
      fetch(
        APIBaseURL + '/reports/hybridpowerstationitemenergy?id=' + stationID,
        {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'User-UUID': getCookieValue('user_uuid'),
            Token: getCookieValue('token')
          },
          body: null
        }
      )
        .then(response => {
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        })
        .then(json => {
          if (isResponseOK) {
            setChargeEnergyData({
              "unit": "kWh",
              "station_names_array": [json['hybrid_power_station']['name']],
              "subtotals_array": [
                json['reporting']['charge_7_days']['values_array'],
                json['reporting']['charge_this_month']['values_array'],
                json['reporting']['charge_this_year']['values_array']
              ],
            });
            setDischargeEnergyData({
              "unit": "kWh",
              "station_names_array": [json['hybrid_power_station']['name']],
              "subtotals_array": [
                json['reporting']['discharge_7_days']['values_array'],
                json['reporting']['discharge_this_month']['values_array'],
                json['reporting']['discharge_this_year']['values_array']
              ]
            });
            setChargeEnergyLabels([
              json['reporting']['charge_7_days']['timestamps_array'][0],
              json['reporting']['charge_this_month']['timestamps_array'][0],
              json['reporting']['charge_this_year']['timestamps_array'][0]
            ]);
            setDischargeEnergyLabels([
              json['reporting']['discharge_7_days']['timestamps_array'][0],
              json['reporting']['discharge_this_month']['timestamps_array'][0],
              json['reporting']['discharge_this_year']['timestamps_array'][0]
            ]);
          }
        });
    }
  };

  const loadBillingData = (stationID) => {
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

      let isResponseOK = false;
      fetch(
        APIBaseURL + '/reports/hybridpowerstationitembilling?id=' + stationID,
        {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'User-UUID': getCookieValue('user_uuid'),
            Token: getCookieValue('token')
          },
          body: null
        }
      )
        .then(response => {
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        })
        .then(json => {
          if (isResponseOK) {
            setChargeBillingData({
              "unit": currency,
              "station_names_array": [json['hybrid_power_station']['name']],
              "subtotals_array": [
                json['reporting']['charge_7_days']['values_array'],
                json['reporting']['charge_this_month']['values_array'],
                json['reporting']['charge_this_year']['values_array']
              ],
            });
            setDischargeBillingData({
              "unit": currency,
              "station_names_array": [json['hybrid_power_station']['name']],
              "subtotals_array": [
                json['reporting']['discharge_7_days']['values_array'],
                json['reporting']['discharge_this_month']['values_array'],
                json['reporting']['discharge_this_year']['values_array']
              ]
            });
            setChargeBillingLabels([
              json['reporting']['charge_7_days']['timestamps_array'][0],
              json['reporting']['charge_this_month']['timestamps_array'][0],
              json['reporting']['charge_this_year']['timestamps_array'][0]
            ]);
            setDischargeBillingLabels([
              json['reporting']['discharge_7_days']['timestamps_array'][0],
              json['reporting']['discharge_this_month']['timestamps_array'][0],
              json['reporting']['discharge_this_year']['timestamps_array'][0]
            ]);
          }
        });
    }
  };

  const loadCarbonData = (stationID) => {
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

      let isResponseOK = false;
      fetch(
        APIBaseURL + '/reports/hybridpowerstationitemcarbon?id=' + stationID,
        {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'User-UUID': getCookieValue('user_uuid'),
            Token: getCookieValue('token')
          },
          body: null
        }
      )
        .then(response => {
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        })
        .then(json => {
          if (isResponseOK) {
            setChargeCarbonData({
              "unit": "kgCO2",
              "station_names_array": [json['hybrid_power_station']['name']],
              "subtotals_array": [
                json['reporting']['charge_7_days']['values_array'],
                json['reporting']['charge_this_month']['values_array'],
                json['reporting']['charge_this_year']['values_array']
              ],
            });
            setDischargeCarbonData({
              "unit": "kgCO2",
              "station_names_array": [json['hybrid_power_station']['name']],
              "subtotals_array": [
                json['reporting']['discharge_7_days']['values_array'],
                json['reporting']['discharge_this_month']['values_array'],
                json['reporting']['discharge_this_year']['values_array']
              ]
            });
            setChargeCarbonLabels([
              json['reporting']['charge_7_days']['timestamps_array'][0],
              json['reporting']['charge_this_month']['timestamps_array'][0],
              json['reporting']['charge_this_year']['timestamps_array'][0]]
            );
            setDischargeCarbonLabels([
              json['reporting']['discharge_7_days']['timestamps_array'][0],
              json['reporting']['discharge_this_month']['timestamps_array'][0],
              json['reporting']['discharge_this_year']['timestamps_array'][0]]
            );
          }
        });
    }
  };

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/hybridpowerstations', {
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
          setStationList(json[0]);
          setFilteredStationList(json[0]);
          if (json[0].length > 0) {
            setSelectedStation(json[0][0].value);
            // enable submit button
            setSubmitButtonDisabled(false);
          } else {
            setSelectedStation(undefined);
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

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    // show spinner
    setSpinnerHidden(false);
    loadData(selectedStation);
    loadEnergyData(selectedStation);
    loadBillingData(selectedStation);
    loadCarbonData(selectedStation);
  };

  useEffect(() => {
    let timer = setInterval(() => {
      let is_logged_in = getCookieValue('is_logged_in');
      if (is_logged_in === null || !is_logged_in) {
        setRedirectUrl(`/authentication/basic/login`);
        setRedirect(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [setRedirect, setRedirectUrl]);

  useEffect(() => {
    setLanguage(getItemFromStore('myems_web_ui_language'));
  }, [getItemFromStore('myems_web_ui_language')]);

  return (
    <Fragment>
      <Form onSubmit={handleSubmit}>
        <Row form>
          <Col xs={6} sm={3} hidden={spaceCascaderHidden}>
            <FormGroup className="form-group">
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
              <Form inline>
                <CustomInput
                  type="select"
                  id="stationSelect"
                  name="stationSelect"
                  bsSize="sm"
                  onChange={({ target }) => setSelectedStation(target.value)}
                >
                  {filteredStationList.map((station, index) => (
                    <option value={station.value} key={station.value}>
                      {station.label}
                    </option>
                  ))}
                </CustomInput>
              </Form>
            </FormGroup>
          </Col>
          <Col xs="auto">
            <FormGroup>
              <ButtonGroup id="submit">
                <Button size="sm" color="success" disabled={submitButtonDisabled}>
                  {t('Submit')}
                </Button>
              </ButtonGroup>
            </FormGroup>
          </Col>
          <Col xs="auto">
              <FormGroup>
                <Spinner color="primary" hidden={spinnerHidden} />
              </FormGroup>
          </Col>
        </Row>
      </Form>
      <div  style={{ visibility: resultDataHidden ? 'visible' : 'hidden', display: resultDataHidden ? '': 'none' }}>
          <img className="img-fluid" src={blankPage} alt="" />
      </div>
      <div style={{ visibility: resultDataHidden ? 'hidden' : 'visible', display: resultDataHidden ? 'none': ''  }}>
        <div className="card-deck">
          <CardSummary rate={''} title={t('Total Rated Capacity')} footunit={'MWH'} color="ratedCapacity">
            {1 && <CountUp end={totalRatedCapacity/1000.0} duration={2} prefix="" separator="," decimal="." decimals={3} />}
          </CardSummary>
          <CardSummary rate={''} title={t('Total Rated Power')} footunit={'MW'} color="ratedPower">
            {1 && <CountUp end={totalRatedPower/1000.0} duration={2} prefix="" separator="," decimal="." decimals={3} />}
          </CardSummary>
          <CardSummary rate={''} title={t('Total Charge')} footunit={'MWH'} color="electricity">
            {1 && <CountUp end={totalCharge/1000.0} duration={2} prefix="" separator="," decimal="." decimals={3} />}
          </CardSummary>
          <CardSummary rate={''} title={t('Total Discharge')} footunit={'MWH'} color="electricity">
            {1 && <CountUp end={totalDischarge/1000.0} duration={2} prefix="" separator="," decimal="." decimals={3} />}
          </CardSummary>
          <CardSummary rate={''} title={t('Total Revenue')} footunit={currency} color="income">
            {1 && <CountUp end={totalRevenue} duration={2} prefix="" separator="," decimal="." decimals={0} />}
          </CardSummary>
        </div>

        <Row noGutters>
          <Col lg={6} xl={6} className="mb-3 pr-lg-2">
            <div className="mb-3 card" style={{ height: '100%' }}>
              <Nav tabs>
                <NavItem className="cursor-pointer">
                  <NavLink
                    className={classNames({ active: activeTabLeft === '1' })}
                    onClick={() => {
                      toggleTabLeft('1');
                    }}
                  >
                    <h6>{t('Fuel Indicator')}</h6>
                  </NavLink>
                </NavItem>
                <NavItem className="cursor-pointer">
                  <NavLink
                    className={classNames({ active: activeTabLeft === '2' })}
                    onClick={() => {
                      toggleTabLeft('2');
                    }}
                  >
                    <h6>{t('Charge Energy Indicator')}</h6>
                  </NavLink>
                </NavItem>
                <NavItem className="cursor-pointer">
                  <NavLink
                    className={classNames({ active: activeTabLeft === '3' })}
                    onClick={() => {
                      toggleTabLeft('3');
                    }}
                  >
                    <h6>{t('Discharge Energy Indicator')}</h6>
                  </NavLink>
                </NavItem>
                <NavItem className="cursor-pointer">
                  <NavLink
                    className={classNames({ active: activeTabLeft === '4' })}
                    onClick={() => {
                      toggleTabLeft('4');
                    }}
                  >
                    <h6>{t('Charge Cost Indicator')}</h6>
                  </NavLink>
                </NavItem>
                <NavItem className="cursor-pointer">
                  <NavLink
                    className={classNames({ active: activeTabLeft === '5' })}
                    onClick={() => {
                      toggleTabLeft('5');
                    }}
                  >
                    <h6>{t('Discharge Revenue Indicator')}</h6>
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTabLeft}>
                  <TabPane tabId="1">
                    <StackBarChart
                      labels={chargeEnergyLabels}
                      unit={ t('Charge UNIT', { UNIT: chargeEnergyData['unit'] })}
                      chargeData={chargeEnergyData}
                      periodTypes={periodTypes}
                    />
                  </TabPane>
                  <TabPane tabId="2">
                    <StackBarChart
                      labels={chargeEnergyLabels}
                      unit={ t('Charge UNIT', { UNIT: chargeEnergyData['unit'] })}
                      chargeData={chargeEnergyData}
                      periodTypes={periodTypes}
                    />
                  </TabPane>
                  <TabPane tabId="3">
                    <StackBarChart
                      labels={dischargeEnergyLabels}
                      unit={t('Discharge UNIT', { UNIT: dischargeEnergyData['unit'] })}
                      chargeData={dischargeEnergyData}
                      periodTypes={periodTypes}
                    />
                  </TabPane>
                  <TabPane tabId="4">
                    <StackBarChart
                      labels={chargeBillingLabels}
                      unit={ t('Charge UNIT', { UNIT: chargeBillingData['unit'] })}
                      chargeData={chargeBillingData}
                      periodTypes={periodTypes}
                    />
                  </TabPane>
                  <TabPane tabId="5">
                    <StackBarChart
                      labels={dischargeBillingLabels}
                      unit={t('Discharge UNIT', { UNIT: dischargeBillingData['unit'] })}
                      chargeData={dischargeBillingData}
                      periodTypes={periodTypes}
                    />
                  </TabPane>
                </TabContent>
            </div>
          </Col>
          <Col lg={6} xl={6} className="mb-3 pr-lg-2">
            {settings.showOnlineMap ? (
              <div className="mb-3 card" style={{ height: '100%' }}>
                <CustomizeMapBox
                  Latitude={rootLatitude}
                  Longitude={rootLongitude}
                  Zoom={4}
                  Geojson={geojson['features']}
                />
              </div>
            ) : (
              <></>
            )}
          </Col>

        </Row>
      </div>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(ItemDashboard));
