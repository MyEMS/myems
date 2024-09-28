import React, { Fragment, useEffect, useState, useContext } from 'react';
import CountUp from 'react-countup';
import { Col, Row, Spinner, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import EnergyStoragePowerStationTableCard from './EnergyStoragePowerStationTableCard';
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

const Dashboard = ({ setRedirect, setRedirectUrl, t }) => {
  const [isDashboardFetched, setIsDashboardFetched] = useState(false);
  const [isEnergyStoragePowerStationsEnergyFetched, setIsEnergyStoragePowerStationsEnergyFetched] = useState(false);
  const [isEnergyStoragePowerStationsBillingFetched, setIsEnergyStoragePowerStationsBillingFetched] = useState(false);
  const [isEnergyStoragePowerStationsCarbonFetched, setIsEnergyStoragePowerStationsCarbonFetched] = useState(false);

  const [spinnerHidden, setSpinnerHidden] = useState(false);
  const [activeTabLeft, setActiveTabLeft] = useState('1');
  const toggleTabLeft = tab => {
    if (activeTabLeft !== tab) setActiveTabLeft(tab);
  };
  const [activeTabRight, setActiveTabRight] = useState('1');
  const toggleTabRight = tab => {
    if (activeTabRight !== tab) setActiveTabRight(tab);
  };
  const { currency } = useContext(AppContext);

  //Results

  const [energyStoragePowerStationList, setEnergyStoragePowerStationList] = useState([]);
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
  const [carbonLabels, setCarbonLabels] = useState([]);
  const [periodTypes, setPeriodTypes] = useState([{ value: 'a0', label: t('7 Days') }, { value: 'a1', label: t('This Month') }, { value: 'a2', label: t('This Year') }]);
  const [language, setLanguage] = useState(getItemFromStore('myems_web_ui_language', settings.language));
  const [geojson, setGeojson] = useState({});
  const [rootLatitude, setRootLatitude] = useState('');
  const [rootLongitude, setRootLongitude] = useState('');

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

      let isResponseOK = false;
      if (!isDashboardFetched) {
        setIsDashboardFetched(true);
        toast(
          <Fragment>
            {t('Welcome to MyEMS')}
            <br />
            {t('An Industry Leading Open Source Energy Management System')}
          </Fragment>
        );

        fetch(
          APIBaseURL + '/reports/energystoragepowerstationdashboard?useruuid=' + user_uuid,
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
              console.log(json);
              // hide spinner
              setSpinnerHidden(true);

              let energyStoragePowerStationList = [];
              let totalRatedCapacity = 0;
              let totalRatedPower = 0;

              setRootLongitude(json['energy_storage_power_stations'][0]['longitude']);
              setRootLatitude(json['energy_storage_power_stations'][0]['latitude']);
              let geojson = {};
              let geojsonData = [];
              json['energy_storage_power_stations'].forEach((currentValue, index) => {
                let energyStoragePowerStationItem = json['energy_storage_power_stations'][index];
                totalRatedCapacity += energyStoragePowerStationItem['rated_capacity'];
                totalRatedPower += energyStoragePowerStationItem['rated_power'];
                if (energyStoragePowerStationItem['latitude'] && energyStoragePowerStationItem['longitude']) {
                  geojsonData.push({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [energyStoragePowerStationItem['longitude'], energyStoragePowerStationItem['latitude']]
                    },
                    properties: {
                      title: energyStoragePowerStationItem['name'],
                      description: energyStoragePowerStationItem['description'],
                      uuid: energyStoragePowerStationItem['uuid'],
                      url: '/singleenergystoragepowerstation/details'
                    }
                  });
                }
                energyStoragePowerStationItem['nameuuid'] = energyStoragePowerStationItem['name'] + energyStoragePowerStationItem['uuid']
                energyStoragePowerStationList.push(energyStoragePowerStationItem);

              });
              setEnergyStoragePowerStationList(energyStoragePowerStationList);
              setTotalRatedCapacity(totalRatedCapacity);
              setTotalRatedPower(totalRatedPower);
              geojson['type'] = 'FeatureCollection';
              geojson['features'] = geojsonData;
              setGeojson(geojson);

              setTotalCharge(json['total_charge_energy']);

              setTotalDischarge(json['total_discharge_energy']);

              setTotalRevenue(json['total_discharge_billing']);

            }
          });
      }
    }
  });

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

      let isResponseOK = false;
      if (!isEnergyStoragePowerStationsEnergyFetched) {
        setIsEnergyStoragePowerStationsEnergyFetched(true);
        fetch(
          APIBaseURL + '/reports/energystoragepowerstationcollectionenergy?useruuid=' + user_uuid ,
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
              console.log(json);

              setChargeEnergyData({
                "unit": "kWh",
                "station_names_array": json['energy_storage_power_station_names'],
                "subtotals_array": [
                  json['reporting']['charge_7_days']['values_array'],
                  json['reporting']['charge_this_month']['values_array'],
                  json['reporting']['charge_this_year']['values_array']
                ],
              });
              setDischargeEnergyData({
                "unit": "kWh",
                "station_names_array": json['energy_storage_power_station_names'],
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
    }
  });
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

      let isResponseOK = false;
      if (!isEnergyStoragePowerStationsBillingFetched) {
        setIsEnergyStoragePowerStationsBillingFetched(true);
        fetch(
          APIBaseURL + '/reports/energystoragepowerstationcollectionbilling?useruuid=' + user_uuid ,
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
              console.log(json);

              setChargeBillingData({
                "unit": currency,
                "station_names_array": json['energy_storage_power_station_names'],
                "subtotals_array": [
                  json['reporting']['charge_7_days']['values_array'],
                  json['reporting']['charge_this_month']['values_array'],
                  json['reporting']['charge_this_year']['values_array']
                ],
              });
              setDischargeBillingData({
                "unit": currency,
                "station_names_array": json['energy_storage_power_station_names'],
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
    }
  });

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

      let isResponseOK = false;
      if (!isEnergyStoragePowerStationsCarbonFetched) {
        setIsEnergyStoragePowerStationsCarbonFetched(true);
        fetch(
          APIBaseURL + '/reports/energystoragepowerstationcollectioncarbon?useruuid=' + user_uuid ,
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
              console.log(json);

              setChargeCarbonData({
                "unit": "kgCO2",
                "station_names_array": json['energy_storage_power_station_names'],
                "subtotals_array": [
                  json['reporting']['charge_7_days']['values_array'],
                  json['reporting']['charge_this_month']['values_array'],
                  json['reporting']['charge_this_year']['values_array']
                ],
              });
              setDischargeCarbonData({
                "unit": "kgCO2",
                "station_names_array": json['energy_storage_power_station_names'],
                "subtotals_array": [
                  json['reporting']['discharge_7_days']['values_array'],
                  json['reporting']['discharge_this_month']['values_array'],
                  json['reporting']['discharge_this_year']['values_array']
                ]
              });
              setCarbonLabels([
                json['reporting']['charge_7_days']['timestamps_array'][0],
                json['reporting']['charge_this_month']['timestamps_array'][0],
                json['reporting']['charge_this_year']['timestamps_array'][0]
              ]);
            }
          });
      }
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
  }, [setRedirect, setRedirectUrl]);

  useEffect(() => {
    setLanguage(getItemFromStore('myems_web_ui_language'));
  }, [getItemFromStore('myems_web_ui_language')]);

  return (
    <Fragment>
      <div className="card-deck">
        <Spinner color="primary" hidden={spinnerHidden} />
        <Spinner color="secondary" hidden={spinnerHidden} />
        <Spinner color="success" hidden={spinnerHidden} />
        <Spinner color="danger" hidden={spinnerHidden} />
        <Spinner color="warning" hidden={spinnerHidden} />
        <Spinner color="info" hidden={spinnerHidden} />
        <Spinner color="light" hidden={spinnerHidden} />

        <CardSummary rate={''} title={t('Number of Power Stations')} footunit={''} color="powerStation">
          {1 && <CountUp end={energyStoragePowerStationList.length} duration={2} prefix="" separator="," decimal="." decimals={0} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total Rated Power')} footunit={'kW'} color="ratedPower">
          {1 && <CountUp end={totalRatedPower} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total Rated Capacity')} footunit={'kWh'} color="ratedCapacity">
          {1 && <CountUp end={totalRatedCapacity} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total Charge')} footunit={'kWh'} color="electricity">
          {1 && <CountUp end={totalCharge} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total Discharge')} footunit={'kWh'} color="electricity">
          {1 && <CountUp end={totalDischarge} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total Revenue')} footunit={currency} color="income">
          {1 && <CountUp end={totalRevenue} duration={2} prefix="" separator="," decimal="." decimals={2} />}
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
                  <h6>{t('Charge Energy Indicator')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '2' })}
                  onClick={() => {
                    toggleTabLeft('2');
                  }}
                >
                  <h6>{t('Discharge Energy Indicator')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '3' })}
                  onClick={() => {
                    toggleTabLeft('3');
                  }}
                >
                  <h6>{t('Charge Cost Indicator')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '4' })}
                  onClick={() => {
                    toggleTabLeft('4');
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
                    labels={dischargeEnergyLabels}
                    unit={t('Discharge UNIT', { UNIT: dischargeEnergyData['unit'] })}
                    chargeData={dischargeEnergyData}
                    periodTypes={periodTypes}
                  />
                </TabPane>
                <TabPane tabId="3">
                  <StackBarChart
                    labels={chargeBillingLabels}
                    unit={ t('Charge UNIT', { UNIT: chargeBillingData['unit'] })}
                    chargeData={chargeBillingData}
                    periodTypes={periodTypes}
                  />
                </TabPane>
                <TabPane tabId="4">
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

      <EnergyStoragePowerStationTableCard energyStoragePowerStationList={energyStoragePowerStationList} />
    </Fragment>
  );
};

export default withTranslation()(withRedirect(Dashboard));
