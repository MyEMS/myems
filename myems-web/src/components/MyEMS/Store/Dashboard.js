import React, { Fragment, useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { Col, Row, Spinner } from 'reactstrap';
import Weather from './Weather';
import weather from '../../../data/dashboard/weather';
import WeeklySales from './WeeklySales';
import weeklySales from '../../../data/dashboard/weeklySales';
import BestSellingProducts from './BestSellingProducts';
import products from '../../../data/dashboard/products';
import RecentPurchasesTable from './RecentPuchasesTable';
import ActiveUsersBarChart from './ActiveUsersBarChart';

import CardSummary from '../common/CardSummary';
import LineChart from '../common/LineChart';
import { toast } from 'react-toastify';
import SharePie from '../common/SharePie';
import loadable from '@loadable/component';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import { APIBaseURL, settings } from '../../../config';
import { v4 as uuid } from 'uuid';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart as ChartJS } from 'chart.js';
import BarChart from '../common/BarChart';
import ChartSpacesStackBar from '../common/ChartSpacesStackBar';
import RealtimeSensor from '../common/RealtimeSensor';
import { getItemFromStore } from '../../../helpers/utils';
import CustomizeMapBox from '../common/CustomizeMapBox';

ChartJS.register(annotationPlugin);

const ChildSpacesTable = loadable(() => import('../common/ChildSpacesTable'));

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

  //Results
  const [costShareData, setCostShareData] = useState([]);
  const [timeOfUseShareData, setTimeOfUseShareData] = useState([]);
  const [TCEShareData, setTCEShareData] = useState([]);
  const [TCO2EShareData, setTCO2EShareData] = useState([]);

  const [thisYearBarList, setThisYearBarList] = useState([]);
  const [lastYearBarList, setLastYearBarList] = useState([]);
  const [thisMonthInputCardSummaryList, setThisMonthInputCardSummaryList] = useState([]);
  const [thisMonthCostCardSummaryList, setThisMonthCostCardSummaryList] = useState([]);
  const [barLabels, setBarLabels] = useState([]);
  const [totalInTCE, setTotalInTCE] = useState({});
  const [totalInTCO2E, setTotalInTCO2E] = useState({});

  const [spaceInputLineChartLabels, setSpaceInputLineChartLabels] = useState([]);
  const [spaceInputLineChartData, setSpaceInputLineChartData] = useState({});
  const [spaceInputLineChartOptions, setSpaceInputLineChartOptions] = useState([]);
  const [spaceCostLineChartOptions, setSpaceCostLineChartOptions] = useState([]);
  const [spaceCostLineChartLabels, setSpaceCostLineChartLabels] = useState([]);
  const [spaceCostLineChartData, setSpaceCostLineChartData] = useState({});

  const [detailedDataTableData, setDetailedDataTableData] = useState([]);
  const [detailedDataTableColumns, setDetailedDataTableColumns] = useState([
    { dataField: 'startdatetime', text: t('Datetime'), sort: true }
  ]);

  const [childSpacesTableData, setChildSpacesTableData] = useState([]);
  const [childSpacesTableColumns, setChildSpacesTableColumns] = useState([
    { dataField: 'name', text: t('Child Spaces'), sort: true }
  ]);

  const [childSpacesInputData, setChildSpacesInputData] = useState([]);
  const [childSpacesCostData, setChildSpacesCostData] = useState([]);
  const [monthLabels, setMonthLabels] = useState([]);
  const [language, setLanguage] = useState(getItemFromStore('myems_web_ui_language', settings.language));
  const [geojson, setGeojson] = useState({});
  const [rootLatitude, setRootLatitude] = useState('');
  const [rootLongitude, setRootLongitude] = useState('');

  const [sensor, setSensor] = useState({});
  const [pointList, setPointList] = useState({});

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
            '/reports/storedashboard?' +
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
              let labels = [];
              let thisYearBarList = [];
              let lastYearBarList = [];
              json['reporting_period_input']['names'].forEach((currentValue, index) => {
                let cardSummaryItem = {};
                cardSummaryItem['name'] = json['reporting_period_input']['names'][index];
                cardSummaryItem['unit'] = json['reporting_period_input']['units'][index];
                cardSummaryItem['subtotal'] = json['reporting_period_input']['subtotals'][index];
                cardSummaryItem['increment_rate'] =
                  parseFloat(json['reporting_period_input']['increment_rates'][index] * 100).toFixed(2) + '%';
                cardSummaryItem['subtotal_per_unit_area'] =
                  json['reporting_period_input']['subtotals_per_unit_area'][index];
                labels.push(
                  t('CATEGORY Consumption UNIT', { CATEGORY: null, UNIT: null }) +
                    cardSummaryItem['name'] +
                    cardSummaryItem['unit']
                );
                thisYearBarList.push(cardSummaryItem);
              });

              json['reporting_period_cost']['names'].forEach((currentValue, index) => {
                let cardSummaryItem = {};
                cardSummaryItem['name'] = json['reporting_period_cost']['names'][index];
                cardSummaryItem['unit'] = json['reporting_period_cost']['units'][index];
                cardSummaryItem['subtotal'] = json['reporting_period_cost']['subtotals'][index];
                cardSummaryItem['increment_rate'] =
                  parseFloat(json['reporting_period_cost']['increment_rates'][index] * 100).toFixed(2) + '%';
                cardSummaryItem['subtotal_per_unit_area'] =
                  json['reporting_period_cost']['subtotals_per_unit_area'][index];
                labels.push(
                  t('CATEGORY Costs UNIT', { CATEGORY: null, UNIT: null }) +
                    cardSummaryItem['name'] +
                    cardSummaryItem['unit']
                );
                thisYearBarList.push(cardSummaryItem);
              });
              setBarLabels(labels);
              setThisYearBarList(thisYearBarList);

              json['base_period_input']['names'].forEach((currentValue, index) => {
                let cardSummaryItem = {};
                cardSummaryItem['name'] = json['base_period_input']['names'][index];
                cardSummaryItem['unit'] = json['base_period_input']['units'][index];
                cardSummaryItem['subtotal'] = json['base_period_input']['subtotals'][index];
                cardSummaryItem['increment_rate'] = null;
                cardSummaryItem['subtotal_per_unit_area'] = json['base_period_input']['subtotals_per_unit_area'][index];
                lastYearBarList.push(cardSummaryItem);
              });

              json['base_period_cost']['names'].forEach((currentValue, index) => {
                let cardSummaryItem = {};
                cardSummaryItem['name'] = json['base_period_cost']['names'][index];
                cardSummaryItem['unit'] = json['base_period_cost']['units'][index];
                cardSummaryItem['subtotal'] = json['base_period_cost']['subtotals'][index];
                cardSummaryItem['increment_rate'] = null;
                cardSummaryItem['subtotal_per_unit_area'] = json['base_period_cost']['subtotals_per_unit_area'][index];
                lastYearBarList.push(cardSummaryItem);
              });
              setLastYearBarList(lastYearBarList);

              let timeOfUseArray = [];
              json['reporting_period_input']['energy_category_ids'].forEach((currentValue, index) => {
                if (currentValue === 1) {
                  // energy_category_id 1 electricity
                  let timeOfUseItem = {};
                  timeOfUseItem['id'] = 1;
                  timeOfUseItem['name'] = t('Top-Peak');
                  timeOfUseItem['value'] = json['reporting_period_input']['toppeaks'][index];
                  timeOfUseItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                  timeOfUseArray.push(timeOfUseItem);

                  timeOfUseItem = {};
                  timeOfUseItem['id'] = 2;
                  timeOfUseItem['name'] = t('On-Peak');
                  timeOfUseItem['value'] = json['reporting_period_input']['onpeaks'][index];
                  timeOfUseItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                  timeOfUseArray.push(timeOfUseItem);

                  timeOfUseItem = {};
                  timeOfUseItem['id'] = 3;
                  timeOfUseItem['name'] = t('Mid-Peak');
                  timeOfUseItem['value'] = json['reporting_period_input']['midpeaks'][index];
                  timeOfUseItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                  timeOfUseArray.push(timeOfUseItem);

                  timeOfUseItem = {};
                  timeOfUseItem['id'] = 4;
                  timeOfUseItem['name'] = t('Off-Peak');
                  timeOfUseItem['value'] = json['reporting_period_input']['offpeaks'][index];
                  timeOfUseItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                  timeOfUseArray.push(timeOfUseItem);
                }
              });
              setTimeOfUseShareData(timeOfUseArray);
              let totalInTCE = {};
              totalInTCE['value'] = json['reporting_period_input']['total_in_kgce'] / 1000; // convert from kg to t
              totalInTCE['increment_rate'] =
                parseFloat(json['reporting_period_input']['increment_rate_in_kgce'] * 100).toFixed(2) + '%';
              totalInTCE['value_per_unit_area'] = json['reporting_period_input']['total_in_kgce_per_unit_area'] / 1000; // convert from kg to t
              setTotalInTCE(totalInTCE);

              let costDataArray = [];
              json['reporting_period_cost']['names'].forEach((currentValue, index) => {
                let costDataItem = {};
                costDataItem['id'] = index;
                costDataItem['name'] = currentValue;
                costDataItem['value'] = json['reporting_period_cost']['subtotals'][index];
                costDataItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                costDataArray.push(costDataItem);
              });

              setCostShareData(costDataArray);
              let totalInTCO2E = {};
              totalInTCO2E['value'] = json['reporting_period_input']['total_in_kgco2e'] / 1000; // convert from kg to t
              totalInTCO2E['increment_rate'] =
                parseFloat(json['reporting_period_input']['increment_rate_in_kgco2e'] * 100).toFixed(2) + '%';
              totalInTCO2E['value_per_unit_area'] =
                json['reporting_period_input']['total_in_kgco2e_per_unit_area'] / 1000; // convert from kg to t
              setTotalInTCO2E(totalInTCO2E);

              let TCEDataArray = [];
              json['reporting_period_input']['names'].forEach((currentValue, index) => {
                let TCEDataItem = {};
                TCEDataItem['id'] = index;
                TCEDataItem['name'] = currentValue;
                TCEDataItem['value'] = json['reporting_period_input']['subtotals_in_kgce'][index] / 1000;
                TCEDataItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                TCEDataArray.push(TCEDataItem);
              });
              setTCEShareData(TCEDataArray);

              let TCO2EDataArray = [];
              json['reporting_period_input']['names'].forEach((currentValue, index) => {
                let TCO2EDataItem = {};
                TCO2EDataItem['id'] = index;
                TCO2EDataItem['name'] = currentValue;
                TCO2EDataItem['value'] = json['reporting_period_input']['subtotals_in_kgco2e'][index] / 1000; // convert from kg to t
                TCO2EDataItem['color'] = '#' + (((1 << 24) * Math.random()) | 0).toString(16);
                TCO2EDataArray.push(TCO2EDataItem);
              });
              setTCO2EShareData(TCO2EDataArray);

              let timestamps = {};
              json['reporting_period_input']['timestamps'].forEach((currentValue, index) => {
                timestamps['a' + index] = currentValue;
              });
              setSpaceInputLineChartLabels(timestamps);

              let values = {};
              json['reporting_period_input']['values'].forEach((currentValue, index) => {
                values['a' + index] = currentValue;
              });
              setSpaceInputLineChartData(values);

              let names = [];
              let thisMonthInputArr = [];
              json['reporting_period_input']['names'].forEach((currentValue, index) => {
                let unit = json['reporting_period_input']['units'][index];
                let thisMonthItem = {};
                names.push({ value: 'a' + index, label: currentValue + ' (' + unit + ')' });
                thisMonthItem['name'] = json['reporting_period_input']['names'][index];
                thisMonthItem['unit'] = json['reporting_period_input']['units'][index];
                thisMonthItem['subtotal'] =
                  json['reporting_period_input']['values'][index][
                    json['reporting_period_input']['values'][index].length - 1
                  ];
                thisMonthItem['increment_rate'] =
                  parseFloat(json['reporting_period_input']['increment_rates'][index] * 100).toFixed(2) + '%';
                thisMonthItem['subtotal_per_unit_area'] =
                  json['reporting_period_input']['subtotals_per_unit_area'][index];
                thisMonthInputArr.push(thisMonthItem);
              });
              setSpaceInputLineChartOptions(names);
              setThisMonthInputCardSummaryList(thisMonthInputArr);

              timestamps = {};
              json['reporting_period_cost']['timestamps'].forEach((currentValue, index) => {
                timestamps['a' + index] = currentValue;
              });
              setSpaceCostLineChartLabels(timestamps);

              values = {};
              json['reporting_period_cost']['values'].forEach((currentValue, index) => {
                values['a' + index] = currentValue;
              });
              setSpaceCostLineChartData(values);

              names = [];
              let thisMonthCostArr = [];
              json['reporting_period_cost']['names'].forEach((currentValue, index) => {
                let thisMonthItem = {};
                let unit = json['reporting_period_cost']['units'][index];
                names.push({ value: 'a' + index, label: currentValue + ' (' + unit + ')' });
                thisMonthItem['name'] = json['reporting_period_cost']['names'][index];
                thisMonthItem['unit'] = json['reporting_period_cost']['units'][index];
                thisMonthItem['subtotal'] =
                  json['reporting_period_cost']['values'][index][
                    json['reporting_period_cost']['values'][index].length - 1
                  ];
                thisMonthItem['increment_rate'] =
                  parseFloat(json['reporting_period_cost']['increment_rates'][index] * 100).toFixed(2) + '%';
                thisMonthItem['subtotal_per_unit_area'] =
                  json['reporting_period_cost']['subtotals_per_unit_area'][index];
                thisMonthCostArr.push(thisMonthItem);
              });
              setSpaceCostLineChartOptions(names);
              setThisMonthCostCardSummaryList(thisMonthCostArr);

              let detailed_value_list = [];
              if (json['reporting_period_input']['timestamps'].length > 0) {
                json['reporting_period_input']['timestamps'][0].forEach((currentTimestamp, timestampIndex) => {
                  let detailed_value = {};
                  detailed_value['id'] = timestampIndex;
                  detailed_value['startdatetime'] = currentTimestamp;
                  json['reporting_period_input']['values'].forEach((currentValue, energyCategoryIndex) => {
                    detailed_value['a' + energyCategoryIndex] = json['reporting_period_input']['values'][
                      energyCategoryIndex
                    ][timestampIndex].toFixed(2);
                  });
                  detailed_value_list.push(detailed_value);
                });
              }

              let detailed_value = {};
              detailed_value['id'] = detailed_value_list.length;
              detailed_value['startdatetime'] = t('Subtotal');
              json['reporting_period_input']['subtotals'].forEach((currentValue, index) => {
                detailed_value['a' + index] = currentValue.toFixed(2);
              });
              detailed_value_list.push(detailed_value);
              setTimeout(() => {
                setDetailedDataTableData(detailed_value_list);
              }, 0);

              let detailed_column_list = [];
              detailed_column_list.push({
                dataField: 'startdatetime',
                text: t('Datetime'),
                sort: true
              });
              json['reporting_period_input']['names'].forEach((currentValue, index) => {
                let unit = json['reporting_period_cost']['units'][index];
                detailed_column_list.push({
                  dataField: 'a' + index,
                  text: currentValue + ' (' + unit + ')',
                  sort: true
                });
              });
              setDetailedDataTableColumns(detailed_column_list);

              let child_space_value_list = [];
              if (json['child_space_input']['child_space_names_array'].length > 0) {
                json['child_space_input']['child_space_names_array'][0].forEach((currentSpaceName, spaceIndex) => {
                  let child_space_value = {};
                  child_space_value['id'] = spaceIndex;
                  child_space_value['name'] = currentSpaceName;
                  json['child_space_input']['energy_category_names'].forEach((currentValue, energyCategoryIndex) => {
                    child_space_value['a' + energyCategoryIndex] =
                      json['child_space_input']['subtotals_array'][energyCategoryIndex][spaceIndex];
                    child_space_value['b' + energyCategoryIndex] =
                      json['child_space_cost']['subtotals_array'][energyCategoryIndex][spaceIndex];
                  });
                  child_space_value_list.push(child_space_value);
                });
              }

              setChildSpacesTableData(child_space_value_list);

              let child_space_column_list = [];
              child_space_column_list.push({
                dataField: 'name',
                text: t('Child Spaces'),
                sort: true
              });
              json['child_space_input']['energy_category_names'].forEach((currentValue, index) => {
                let unit = json['child_space_input']['units'][index];
                child_space_column_list.push({
                  dataField: 'a' + index,
                  text: t('CATEGORY Consumption UNIT', { CATEGORY: currentValue, UNIT: '(' + unit + ')' }),
                  sort: true,
                  formatter: function(decimalValue) {
                    if (typeof decimalValue === 'number') {
                      return decimalValue.toFixed(2);
                    } else {
                      return null;
                    }
                  }
                });
              });
              json['child_space_cost']['energy_category_names'].forEach((currentValue, index) => {
                let unit = json['child_space_cost']['units'][index];
                child_space_column_list.push({
                  dataField: 'b' + index,
                  text: t('CATEGORY Costs UNIT', { CATEGORY: currentValue, UNIT: '(' + unit + ')' }),
                  sort: true,
                  formatter: function(decimalValue) {
                    if (typeof decimalValue === 'number') {
                      return decimalValue.toFixed(2);
                    } else {
                      return null;
                    }
                  }
                });
              });

              setChildSpacesTableColumns(child_space_column_list);
              setChildSpacesInputData(json['child_space_input']);
              setChildSpacesCostData(json['child_space_cost']);
              setMonthLabels(json['reporting_period_cost']['timestamps'][0]);
              setSensor(json['sensor']);
              setPointList(json['point']);
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
          console.log(response);
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
            // get Combined Equipments by root Space ID
            let isResponseOK = false;
            fetch(APIBaseURL + '/spaces/' + [json[0]].map(o => o.value) + '/children', {
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
                  setRootLongitude(json[0]['current']['longitude']);
                  setRootLatitude(json[0]['current']['latitude']);
                  let geojson = {};
                  geojson['type'] = 'FeatureCollection';
                  let geojsonData = [];
                  for (const childSpace of json[0]['children']) {
                    if (childSpace['latitude'] && childSpace['longitude']) {
                      geojsonData.push({
                        type: 'Feature',
                        geometry: {
                          type: 'Point',
                          coordinates: [childSpace['longitude'], childSpace['latitude']]
                        },
                        properties: {
                          title: childSpace['label'],
                          description: childSpace['description'],
                          uuid: childSpace['uuid'],
                          url: '/space/energycategory'
                        }
                      });
                    }
                  }
                  geojson['features'] = geojsonData;
                  setGeojson(geojson);
                } else {
                  toast.error(t(json.description));
                }
              })
              .catch(err => {
                console.log(err);
              });
            // end of get Combined Equipments by root Space ID
          } else {
            toast.error(t(json.description));
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [setRedirect, setRedirectUrl, t]);

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
        {thisMonthInputCardSummaryList.map(cardSummaryItem => (
          <CardSummary
            key={uuid()}
            rate={cardSummaryItem['increment_rate']}
            title={t("This Month's Consumption CATEGORY VALUE UNIT", {
              CATEGORY: cardSummaryItem['name'],
              VALUE: null,
              UNIT: '(' + cardSummaryItem['unit'] + ')'
            })}
            color="success"
            footnote={t('Per Unit Area')}
            footvalue={cardSummaryItem['subtotal_per_unit_area']}
            footunit={'(' + cardSummaryItem['unit'] + '/M²)'}
          >
            {cardSummaryItem['subtotal'] && (
              <CountUp
                end={cardSummaryItem['subtotal']}
                duration={2}
                prefix=""
                separator=","
                decimal="."
                decimals={0}
              />
            )}
          </CardSummary>
        ))}
        {thisMonthCostCardSummaryList.map(cardSummaryItem => (
          <CardSummary
            key={uuid()}
            rate={cardSummaryItem['increment_rate']}
            title={t("This Month's Costs CATEGORY VALUE UNIT", {
              CATEGORY: cardSummaryItem['name'],
              VALUE: null,
              UNIT: '(' + cardSummaryItem['unit'] + ')'
            })}
            color="success"
            footnote={t('Per Unit Area')}
            footvalue={cardSummaryItem['subtotal_per_unit_area']}
            footunit={'(' + cardSummaryItem['unit'] + '/M²)'}
          >
            {cardSummaryItem['subtotal'] && (
              <CountUp
                end={cardSummaryItem['subtotal']}
                duration={2}
                prefix=""
                separator=","
                decimal="."
                decimals={0}
              />
            )}
          </CardSummary>
        ))}
      </div>
      <Row noGutters>
        <Col className="mb-3 pr-lg-2">
          <SharePie data={TCEShareData} title={'门店总数'} />
        </Col>
        <Col className="mb-3 pr-lg-2">
          <WeeklySales data={weeklySales} />
        </Col>
        <Col className="mb-3 pr-lg-2">
          <SharePie data={costShareData} title={'节约二氧化碳排放量'} />
        </Col>
        <Col className="mb-3 pr-lg-2">
          <SharePie data={TCEShareData} title={'故障告警统计'} />
        </Col>
        <Col md={6} className="col-xxl-3 mb-3 pl-md-2">
          <Weather data={weather} className="h-md-100" />
        </Col>
      </Row>
      <Row noGutters>
        <Col lg={3} xl={3} className="mb-3 pr-lg-2 mb-3">
          <BestSellingProducts products={products} />
        </Col>
        <Col lg={6} xl={6} className="mb-3 pr-lg-2 mb-3">
          {settings.showOnlineMap ? (
            <div className="mb-3 card" style={{ height: '500px' }}>
              <CustomizeMapBox
                Latitude={rootLatitude}
                Longitude={rootLongitude}
                Zoom={3}
                Geojson={geojson['features']}
              />
            </div>
          ) : (
            <></>
          )}
        </Col>
        <Col lg={3} xl={3} className="mb-3 pr-lg-2 mb-3">
          <ActiveUsersBarChart />
        </Col>
      </Row>
      <div className="card-deck">
        <BarChart
          labels={barLabels}
          data={lastYearBarList}
          compareData={thisYearBarList}
          title={'逐月用电量对比 '}
          compareTitle={t('This Year')}
          footnote={t('Per Unit Area')}
          footunit={'/M²'}
        />
        <LineChart
          reportingTitle={'逐月成本趋势'}
          baseTitle=""
          labels={spaceInputLineChartLabels}
          data={spaceInputLineChartData}
          options={spaceInputLineChartOptions}
        />
      </div>
      <div className="wrapper" />

      <RecentPurchasesTable />
    </Fragment>
  );
};

export default withTranslation()(withRedirect(Dashboard));
