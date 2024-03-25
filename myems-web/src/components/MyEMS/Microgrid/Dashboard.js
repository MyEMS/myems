import React, { Fragment, useEffect, useState, useContext } from 'react';
import CountUp from 'react-countup';
import { Col, Row, Spinner, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import MicrogridTableCard from './MicrogridTableCard';
import MicrogridRankingTable from './MicrogridRankingTable';
import CardSummary from '../common/CardSummary';
import { toast } from 'react-toastify';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import { APIBaseURL, settings } from '../../../config';
import { getItemFromStore } from '../../../helpers/utils';
import CustomizeMapBox from '../common/CustomizeMapBox';
import classNames from 'classnames';
import AppContext from '../../../context/Context';

const Dashboard = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
  const [isFetchDashboard, setIsFetchDashboard] = useState(true);
  const [periodType, setPeriodType] = useState('monthly');
  const [basePeriodBeginsDatetime, setBasePeriodBeginsDatetime] = useState(
    current_moment
      .clone()
      .subtract(1, 'years')
      .startOf('year')
  );
  const [basePeriodEndsDatetime, setBasePeriodEndsDatetime] = useState(current_moment.clone().subtract(1, 'years'));
  const [reportingPeriodBeginsDatetime, setReportingPeriodBeginsDatetime] = useState(
    current_moment.clone().startOf('year')
  );
  const [reportingPeriodEndsDatetime, setReportingPeriodEndsDatetime] = useState(current_moment);
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

  const [microgridList, setMicrogridList] = useState([]);
  const [totalRatedCapacity, setTotalRatedCapacity] = useState({});
  const [totalRatedPower, setTotalRatedPower] = useState({});
  const [chargeRankingList, setChargeRankingList] = useState([]);
  const [totalCharge, setTotalCharge] = useState({});
  const [dischargeRankingList, setDischargeRankingList] = useState([]);
  const [totalDischarge, setTotalDischarge] = useState({});
  const [revenueRankingList, setRevenueRankingList] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState({});

  const [monthLabels, setMonthLabels] = useState([]);
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
      if (isFetchDashboard) {
        setIsFetchDashboard(false);
        toast(
          <Fragment>
            {t('Welcome to MyEMS')}
            <br />
            {t('An Industry Leading Open Source Energy Management System')}
          </Fragment>
        );

        fetch(
          APIBaseURL +
            '/reports/microgriddashboard?' +
            'useruuid=' +
            user_uuid +
            '&periodtype=' +
            periodType +
            '&baseperiodstartdatetime=' +
            (basePeriodBeginsDatetime != null ? basePeriodBeginsDatetime.format('YYYY-MM-DDTHH:mm:ss') : '') +
            '&baseperiodenddatetime=' +
            (basePeriodEndsDatetime != null ? basePeriodEndsDatetime.format('YYYY-MM-DDTHH:mm:ss') : '') +
            '&reportingperiodstartdatetime=' +
            reportingPeriodBeginsDatetime.format('YYYY-MM-DDTHH:mm:ss') +
            '&reportingperiodenddatetime=' +
            reportingPeriodEndsDatetime.format('YYYY-MM-DDTHH:mm:ss'),
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

              let microgridList = [];
              let chargeRankingList = [];
              let dischargeRankingList = [];
              let revenueList = [];
              let totalRatedCapacity = 0;
              let totalRatedPower = 0;

              setRootLongitude(json['microgrids'][0]['longitude']);
              setRootLatitude(json['microgrids'][0]['latitude']);
              let geojson = {};
              let geojsonData = [];
              json['microgrids'].forEach((currentValue, index) => {
                let microgridItem = json['microgrids'][index];
                totalRatedCapacity += microgridItem['rated_capacity'];
                totalRatedPower += microgridItem['rated_power'];
                if (microgridItem['latitude'] && microgridItem['longitude']) {
                  geojsonData.push({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [microgridItem['longitude'], microgridItem['latitude']]
                    },
                    properties: {
                      title: microgridItem['name'],
                      description: microgridItem['description'],
                      uuid: microgridItem['uuid'],
                      url: '/microgrid/details'
                    }
                  });
                }
                microgridItem['nameuuid'] = microgridItem['name'] + microgridItem['uuid']
                microgridList.push(microgridItem);

              });
              setMicrogridList(microgridList);
              setTotalRatedCapacity(totalRatedCapacity);
              setTotalRatedPower(totalRatedPower);
              geojson['type'] = 'FeatureCollection';
              geojson['features'] = geojsonData;
              setGeojson(geojson);

              json['charge_ranking'].forEach((currentValue, index) => {
                // display at most 8 items
                if (index < 9) {
                  let microgridItem = json['charge_ranking'][index];
                  microgridItem['unit'] = 'kWh';
                  chargeRankingList.push(microgridItem);
                }
              });
              setChargeRankingList(chargeRankingList);
              setTotalCharge(json['totalCharge']);

              json['discharge_ranking'].forEach((currentValue, index) => {
                // display at most 8 items
                if (index < 9) {
                  let microgridItem = json['discharge_ranking'][index];
                  microgridItem['unit'] = 'kWh';
                  dischargeRankingList.push(microgridItem);
                }
              });
              setDischargeRankingList(dischargeRankingList);
              setTotalDischarge(json['totalDischarge']);

              json['revenue_ranking'].forEach((currentValue, index) => {
                // display at most 8 items
                if (index < 9) {
                  let microgridItem = json['revenue_ranking'][index];
                  microgridItem['unit'] = currency;
                  revenueList.push(microgridItem);
                }
              });
              setRevenueRankingList(revenueList);
              setTotalRevenue(json['totalRevenue']);
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

        <CardSummary rate={''} title={'Number of Micgrogrids'} footunit={''} color="info">
          {1 && <CountUp end={microgridList.length} duration={2} prefix="" separator="," decimal="." decimals={0} />}
        </CardSummary>
        <CardSummary rate={''} title={'Total Rated Power'} footunit={'kW'} color="info">
          {1 && <CountUp end={totalRatedCapacity} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={'Total Rated Capacity'} footunit={'kWh'} color="info">
          {1 && <CountUp end={totalRatedPower} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={'Total Charge'} footunit={'kWh'} color="warning">
          {1 && <CountUp end={totalCharge} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={'Total Discharge'} footunit={'kWh'} color="warning">
          {1 && <CountUp end={totalDischarge} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={'Total Revenue'} footunit={currency} color="success">
          {1 && <CountUp end={totalRevenue} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
      </div>

      <Row noGutters>
        <Col lg={3} xl={3} className="mb-3 pr-lg-2 mb-3">
          <Nav tabs>
            <NavItem className="cursor-pointer">
              <NavLink
                className={classNames({ active: activeTabLeft === '1' })}
                onClick={() => {
                  toggleTabLeft('1');
                }}
              >
                <h6>Energy</h6>
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={classNames({ active: activeTabLeft === '2' })}
                onClick={() => {
                  toggleTabLeft('2');
                }}
              >
                <h6>Revenue</h6>
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={classNames({ active: activeTabLeft === '3' })}
                onClick={() => {
                  toggleTabLeft('3');
                }}
              >
                <h6>Carbon</h6>
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTabLeft}>
            <TabPane tabId="1">
              <MicrogridRankingTable microgridList={revenueRankingList} />
            </TabPane>
            <TabPane tabId="2">
              <MicrogridRankingTable microgridList={revenueRankingList} />
            </TabPane>
            <TabPane tabId="3">
              <MicrogridRankingTable microgridList={revenueRankingList} />
            </TabPane>
          </TabContent>
        </Col>
        <Col lg={6} xl={6} className="mb-3 pr-lg-2 mb-3">
          {settings.showOnlineMap ? (
            <div className="mb-3 card" style={{ height: '300px' }}>
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
        <Col lg={3} xl={3} className="mb-3 pr-lg-2 mb-3">
          <Nav tabs>
            <NavItem className="cursor-pointer">
              <NavLink
                className={classNames({ active: activeTabRight === '1' })}
                onClick={() => {
                  toggleTabRight('1');
                }}
              >
                <h6>{t('Charge Ranking')}</h6>
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={classNames({ active: activeTabRight === '2' })}
                onClick={() => {
                  toggleTabRight('2');
                }}
              >
                <h6>{t('Discharge Ranking')}</h6>
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={classNames({ active: activeTabRight === '3' })}
                onClick={() => {
                  toggleTabRight('3');
                }}
              >
                <h6>{t('Revenue Ranking')}</h6>
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTabRight}>
            <TabPane tabId="1">
            <MicrogridRankingTable microgridList={chargeRankingList}/>
            </TabPane>
            <TabPane tabId="2">
            <MicrogridRankingTable microgridList={dischargeRankingList}/>
            </TabPane>
            <TabPane tabId="3">
            <MicrogridRankingTable microgridList={dischargeRankingList}/>
            </TabPane>
          </TabContent>
        </Col>
      </Row>

      <MicrogridTableCard microgridList={microgridList} />
    </Fragment>
  );
};

export default withTranslation()(withRedirect(Dashboard));
