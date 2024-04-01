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
import StackBarChart from './StackBarChart';

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

  const [chargeData, setChargeData] = useState({});
  const [dischargeData, setDischargeData] = useState({});
  const [monthLabels, setMonthLabels] = useState([]);
  const [stations, setStations] = useState([]);
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

              setChargeData({
                "energy_category_names": [
                  "电",
                  "自来水",
                  "中水"
                ],
                "units": [
                  "kWh",
                  "m³",
                  "m³"
                ],
                "station_names_array": [
                  [
                    "市政府",
                    "办公楼",
                    "商场",
                    "酒店",
                    "博物馆",
                    "工厂",
                    "连锁门店",
                    "住宅小区",
                    "医院",
                    "大学",
                    "机场",
                    "火车站",
                    "养殖场",
                    "公寓",
                    "地铁站",
                    "体育场",
                    "公用动力",
                    "数据中心",
                    "调试空间"
                  ],
                  [
                    "市政府",
                    "办公楼",
                    "商场",
                    "酒店",
                    "博物馆",
                    "工厂",
                    "连锁门店",
                    "住宅小区",
                    "医院",
                    "大学",
                    "机场",
                    "火车站",
                    "养殖场",
                    "公寓",
                    "地铁站",
                    "体育场",
                    "公用动力",
                    "数据中心",
                    "调试空间"
                  ],
                  [
                    "市政府",
                    "办公楼",
                    "商场",
                    "酒店",
                    "博物馆",
                    "工厂",
                    "连锁门店",
                    "住宅小区",
                    "医院",
                    "大学",
                    "机场",
                    "火车站",
                    "养殖场",
                    "公寓",
                    "地铁站",
                    "体育场",
                    "公用动力",
                    "数据中心",
                    "调试空间"
                  ]
                ],
                "subtotals_array": [
                  [
                    [
                      249750,
                      270624,
                      272466,
                      4923
                    ],
                    [
                      321643,
                      313145,
                      308747,
                      5850
                    ],
                    [
                      418717.4,
                      560630.81,
                      636595.148,
                      11413.727
                    ],
                    [
                      56443,
                      50486,
                      56289,
                      1025
                    ],
                    [
                      33373,
                      32371,
                      34711,
                      742
                    ],
                    [
                      265079,
                      241453,
                      280577,
                      6303
                    ],
                    [
                      915373,
                      890210,
                      927197,
                      17239
                    ],
                    [
                      298949,
                      295176,
                      295817,
                      5299
                    ],
                    [
                      391019,
                      403682,
                      388199,
                      6822
                    ],
                    [
                      86646,
                      88858,
                      81414,
                      1239
                    ],
                    [
                      56955,
                      54198,
                      53549,
                      856
                    ],
                    [
                      123019,
                      112940,
                      123116,
                      2354
                    ],
                    [
                      262764,
                      261836,
                      254340,
                      4490
                    ],
                    [
                      108901,
                      102409,
                      106710,
                      2036
                    ],
                    [
                      148513,
                      148198,
                      145109,
                      2387
                    ],
                    [
                      310292,
                      322014,
                      331632,
                      5663
                    ],
                    [
                      71470,
                      63270,
                      120189,
                      3689
                    ],
                    [
                      187,
                      173,
                      11712,
                      998
                    ],
                    [
                      8591912.256,
                      9846005.212,
                      10995783.798,
                      217001.644
                    ]
                  ],
                  [
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      119,
                      108,
                      126,
                      2
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      8714,
                      8343,
                      3316,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      265,
                      253,
                      215,
                      3
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      8714,
                      8343,
                      3316,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      17812,
                      17047,
                      6973,
                      5
                    ]
                  ],
                  [
                    [
                      546,
                      597,
                      56,
                      1
                    ],
                    [
                      106,
                      180,
                      91,
                      2
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      47,
                      38,
                      71,
                      3
                    ],
                    [
                      133,
                      137,
                      136,
                      1
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      356,
                      382,
                      431,
                      7
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      41,
                      33,
                      47,
                      1
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      39,
                      34,
                      36,
                      1
                    ],
                    [
                      237,
                      263,
                      316,
                      4
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      2683,
                      2925,
                      2501,
                      42
                    ]
                  ]
                ],
                "subtotals_in_kgce_array": [
                  [
                    98124.849,
                    116774.355,
                    200164.921455,
                    20201.889,
                    12447.231,
                    97589.676,
                    338252.337,
                    110114.643,
                    146335.806,
                    31753.311,
                    20363.634,
                    44455.767,
                    96361.89,
                    39366.888,
                    54637.461,
                    119260.923,
                    31810.014,
                    1607.61,
                    3647036.45793
                  ],
                  [
                    0,
                    30.53,
                    0,
                    0,
                    0,
                    0,
                    1752.078,
                    0,
                    63.296,
                    0,
                    1752.078,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    3597.982
                  ],
                  [
                    1200,
                    379,
                    0,
                    159,
                    407,
                    0,
                    0,
                    0,
                    1176,
                    0,
                    0,
                    122,
                    0,
                    0,
                    110,
                    820,
                    0,
                    0,
                    8151
                  ]
                ],
                "subtotals_in_kgco2e_array": [
                  [
                    740324.064,
                    881029.28,
                    1510187.37488,
                    152417.504,
                    93910.816,
                    736286.336,
                    2552017.632,
                    830783.648,
                    1104062.016,
                    239569.696,
                    153637.824,
                    335406.112,
                    727023.04,
                    297011.968,
                    412224.096,
                    899789.728,
                    239997.504,
                    12128.96,
                    27515852.30048
                  ],
                  [
                    0,
                    323.05,
                    0,
                    0,
                    0,
                    0,
                    18539.43,
                    0,
                    669.76,
                    0,
                    18539.43,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    38071.67
                  ],
                  [
                    1200,
                    379,
                    0,
                    159,
                    407,
                    0,
                    0,
                    0,
                    1176,
                    0,
                    0,
                    122,
                    0,
                    0,
                    110,
                    820,
                    0,
                    0,
                    8151
                  ]
                ]
              });
              setDischargeData({
                "energy_category_names": [
                  "电",
                  "自来水",
                  "中水"
                ],
                "units": [
                  "CNY",
                  "CNY",
                  "CNY"
                ],
                "station_names_array": [
                  [
                    "市政府",
                    "办公楼",
                    "商场",
                    "酒店",
                    "博物馆",
                    "工厂",
                    "连锁门店",
                    "住宅小区",
                    "医院",
                    "大学",
                    "机场",
                    "火车站",
                    "养殖场",
                    "公寓",
                    "地铁站",
                    "体育场",
                    "公用动力",
                    "数据中心",
                    "调试空间"
                  ],
                  [
                    "市政府",
                    "办公楼",
                    "商场",
                    "酒店",
                    "博物馆",
                    "工厂",
                    "连锁门店",
                    "住宅小区",
                    "医院",
                    "大学",
                    "机场",
                    "火车站",
                    "养殖场",
                    "公寓",
                    "地铁站",
                    "体育场",
                    "公用动力",
                    "数据中心",
                    "调试空间"
                  ],
                  [
                    "市政府",
                    "办公楼",
                    "商场",
                    "酒店",
                    "博物馆",
                    "工厂",
                    "连锁门店",
                    "住宅小区",
                    "医院",
                    "大学",
                    "机场",
                    "火车站",
                    "养殖场",
                    "公寓",
                    "地铁站",
                    "体育场",
                    "公用动力",
                    "数据中心",
                    "调试空间"
                  ]
                ],
                "subtotals_array": [
                  [
                    [
                      199985.392,
                      222832.948,
                      218410.682,
                      3744.952
                    ],
                    [
                      250549.443,
                      250673.686,
                      239907.609,
                      4271.963
                    ],
                    [
                      328706.173,
                      432421.104,
                      495966.915,
                      8362.978
                    ],
                    [
                      43370.071,
                      38319.782,
                      41819.126,
                      736.997
                    ],
                    [
                      26496.059,
                      25738.397,
                      26719.486,
                      517.889
                    ],
                    [
                      209925.049,
                      195665.691,
                      220662.618,
                      4790.071
                    ],
                    [
                      716996.345,
                      715531.077,
                      721803.121,
                      12737.348
                    ],
                    [
                      230610.751,
                      233631.109,
                      227333.599,
                      3842.563
                    ],
                    [
                      315134.058,
                      325575.981,
                      308212.776,
                      5132.861
                    ],
                    [
                      71340.001,
                      74672.939,
                      67130.504,
                      976.905
                    ],
                    [
                      47337.487,
                      45985.79,
                      44277.017,
                      683.554
                    ],
                    [
                      96011.335,
                      88874.468,
                      93903.144,
                      1692.438
                    ],
                    [
                      211427.09,
                      216800.376,
                      205333.34,
                      3517.632
                    ],
                    [
                      87166.996,
                      82334.919,
                      83267.862,
                      1525.22
                    ],
                    [
                      116367.094,
                      118208.994,
                      112637.667,
                      1771.979
                    ],
                    [
                      242839.118,
                      258782.26,
                      258410.278,
                      4217.469
                    ],
                    [
                      58061.785,
                      52089.678,
                      97352.278,
                      2748.575
                    ],
                    [
                      139.216,
                      123.441,
                      9738.717,
                      738.781
                    ],
                    [
                      6784310.176,
                      7810058.137,
                      8632843.186,
                      160720.063
                    ]
                  ],
                  [
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      708.05,
                      642.6,
                      749.7,
                      11.9
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      51848.3,
                      49640.85,
                      19730.2,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      1576.75,
                      1505.35,
                      1279.25,
                      17.85
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      51848.3,
                      49640.85,
                      19730.2,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      105981.4,
                      101429.65,
                      41489.35,
                      29.75
                    ]
                  ],
                  [
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ],
                    [
                      0,
                      0,
                      0,
                      0
                    ]
                  ]
                ]
              });
              setMonthLabels([
                "2024-01",
                "2024-02",
                "2024-03",
                "2024-04"
              ]);
              setStations([{ value: 'a1', label: '7 Days' }, { value: 'a2', label: 'One Month' }]);
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
                  <StackBarChart
                    labels={monthLabels}
                    chargeData={chargeData}
                    dischargeData={dischargeData}
                    stations={stations}
                  />
                </TabPane>
                <TabPane tabId="2">
                  <StackBarChart
                    labels={monthLabels}
                    chargeData={chargeData}
                    dischargeData={dischargeData}
                    stations={stations}
                  />
                </TabPane>
                <TabPane tabId="3">
                  <StackBarChart
                    labels={monthLabels}
                    chargeData={chargeData}
                    dischargeData={dischargeData}
                    stations={stations}
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

      <MicrogridTableCard microgridList={microgridList} />
    </Fragment>
  );
};

export default withTranslation()(withRedirect(Dashboard));
