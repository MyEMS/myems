import React, { Fragment, useEffect, useState, useContext } from 'react';
import CountUp from 'react-countup';
import { Col, Row, Spinner, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import PhotovoltaicPowerStationTableCard from './PhotovoltaicPowerStationTableCard';
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
  const [isPhotovoltaicPowerStationsEnergyFetched, setIsPhotovoltaicPowerStationsEnergyFetched] = useState(false);
  const [isPhotovoltaicPowerStationsBillingFetched, setIsPhotovoltaicPowerStationsBillingFetched] = useState(false);
  const [isPhotovoltaicPowerStationsCarbonFetched, setIsPhotovoltaicPowerStationsCarbonFetched] = useState(false);

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

  const [photovoltaicPowerStationList, setPhotovoltaicPowerStationList] = useState([]);
  const [totalRatedCapacity, setTotalRatedCapacity] = useState({});
  const [totalRatedPower, setTotalRatedPower] = useState({});
  const [totalGeneration, setTotalGeneration] = useState({});
  const [totalRevenue, setTotalRevenue] = useState({});

  const [generationEnergyData, setGenerationEnergyData] = useState({});
  const [generationBillingData, setGenerationBillingData] = useState({});
  const [generationCarbonData, setGenerationCarbonData] = useState({});
  const [generationEnergyLabels, setGenerationEnergyLabels] = useState([]);
  const [generationBillingLabels, setGenerationBillingLabels] = useState([]);
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
          APIBaseURL + '/reports/photovoltaicpowerstationdashboard?useruuid=' + user_uuid,
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

              let photovoltaicPowerStationList = [];
              let totalRatedCapacity = 0;
              let totalRatedPower = 0;

              setRootLongitude(json['photovoltaic_power_stations'][0]['longitude']);
              setRootLatitude(json['photovoltaic_power_stations'][0]['latitude']);
              let geojson = {};
              let geojsonData = [];
              json['photovoltaic_power_stations'].forEach((currentValue, index) => {
                let photovoltaicPowerStationItem = json['photovoltaic_power_stations'][index];
                totalRatedCapacity += photovoltaicPowerStationItem['rated_capacity'];
                totalRatedPower += photovoltaicPowerStationItem['rated_power'];
                if (photovoltaicPowerStationItem['latitude'] && photovoltaicPowerStationItem['longitude']) {
                  geojsonData.push({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [photovoltaicPowerStationItem['longitude'], photovoltaicPowerStationItem['latitude']]
                    },
                    properties: {
                      title: photovoltaicPowerStationItem['name'],
                      description: photovoltaicPowerStationItem['description'],
                      uuid: photovoltaicPowerStationItem['uuid'],
                      url: '/singlephotovoltaicpowerstation/details'
                    }
                  });
                }
                photovoltaicPowerStationItem['nameuuid'] = photovoltaicPowerStationItem['name'] + photovoltaicPowerStationItem['uuid']
                photovoltaicPowerStationList.push(photovoltaicPowerStationItem);

              });
              setPhotovoltaicPowerStationList(photovoltaicPowerStationList);
              setTotalRatedCapacity(totalRatedCapacity);
              setTotalRatedPower(totalRatedPower);
              geojson['type'] = 'FeatureCollection';
              geojson['features'] = geojsonData;
              setGeojson(geojson);
              console.log(geojson);
              setTotalGeneration(json['total_generation_energy']);

              setTotalRevenue(json['total_generation_billing']);

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
      if (!isPhotovoltaicPowerStationsEnergyFetched) {
        setIsPhotovoltaicPowerStationsEnergyFetched(true);
        fetch(
          APIBaseURL + '/reports/photovoltaicpowerstationcollectionenergy?useruuid=' + user_uuid ,
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

              setGenerationEnergyData({
                "unit": "kWh",
                "station_names_array": json['photovoltaic_power_station_names'],
                "subtotals_array": [
                  json['reporting']['generation_7_days']['values_array'],
                  json['reporting']['generation_this_month']['values_array'],
                  json['reporting']['generation_this_year']['values_array']
                ],
              });
              setGenerationEnergyLabels([
                json['reporting']['generation_7_days']['timestamps_array'][0],
                json['reporting']['generation_this_month']['timestamps_array'][0],
                json['reporting']['generation_this_year']['timestamps_array'][0]
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
      if (!isPhotovoltaicPowerStationsBillingFetched) {
        setIsPhotovoltaicPowerStationsBillingFetched(true);
        fetch(
          APIBaseURL + '/reports/photovoltaicpowerstationcollectionbilling?useruuid=' + user_uuid ,
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

              setGenerationBillingData({
                "unit": currency,
                "station_names_array": json['photovoltaic_power_station_names'],
                "subtotals_array": [
                  json['reporting']['generation_7_days']['values_array'],
                  json['reporting']['generation_this_month']['values_array'],
                  json['reporting']['generation_this_year']['values_array']
                ],
              });
              setGenerationBillingLabels([
                json['reporting']['generation_7_days']['timestamps_array'][0],
                json['reporting']['generation_this_month']['timestamps_array'][0],
                json['reporting']['generation_this_year']['timestamps_array'][0]
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
      if (!isPhotovoltaicPowerStationsCarbonFetched) {
        setIsPhotovoltaicPowerStationsCarbonFetched(true);
        fetch(
          APIBaseURL + '/reports/photovoltaicpowerstationcollectioncarbon?useruuid=' + user_uuid ,
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

              setGenerationCarbonData({
                "unit": "kgCO2",
                "station_names_array": json['photovoltaic_power_station_names'],
                "subtotals_array": [
                  json['reporting']['generation_7_days']['values_array'],
                  json['reporting']['generation_this_month']['values_array'],
                  json['reporting']['generation_this_year']['values_array']
                ],
              });
              setCarbonLabels([
                json['reporting']['generation_7_days']['timestamps_array'][0],
                json['reporting']['generation_this_month']['timestamps_array'][0],
                json['reporting']['generation_this_year']['timestamps_array'][0]
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
          {1 && <CountUp end={photovoltaicPowerStationList.length} duration={2} prefix="" separator="," decimal="." decimals={0} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total Rated Power')} footunit={'kWp'} color="ratedPower">
          {1 && <CountUp end={totalRatedPower} duration={2} prefix="" separator="," decimal="." decimals={3} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total Rated Capacity')} footunit={'kWh'} color="ratedCapacity">
          {1 && <CountUp end={totalRatedCapacity} duration={2} prefix="" separator="," decimal="." decimals={3} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total Generation')} footunit={'MWH'} color="electricity">
          {1 && <CountUp end={totalGeneration / 1000.0} duration={2} prefix="" separator="," decimal="." decimals={3} />}
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
                  <h6>{t('Energy Indicator')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '3' })}
                  onClick={() => {
                    toggleTabLeft('3');
                  }}
                >
                  <h6>{t('Revenue Indicator')}</h6>
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTabLeft}>
                <TabPane tabId="1">
                  <StackBarChart
                    labels={generationEnergyLabels}
                    unit={ t('Generation UNIT', { UNIT: generationEnergyData['unit'] })}
                    generationData={generationEnergyData}
                    periodTypes={periodTypes}
                  />
                </TabPane>
                <TabPane tabId="3">
                  <StackBarChart
                    labels={generationBillingLabels}
                    unit={ t('Generation UNIT', { UNIT: generationBillingData['unit'] })}
                    generationData={generationBillingData}
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
                Zoom={8}
                Geojson={geojson['features']}
              />
            </div>
          ) : (
            <></>
          )}
        </Col>
      </Row>

      <PhotovoltaicPowerStationTableCard photovoltaicPowerStationList={photovoltaicPowerStationList} />
    </Fragment>
  );
};

export default withTranslation()(withRedirect(Dashboard));
