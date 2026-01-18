import React, { Fragment, useEffect, useState, useContext, useCallback } from 'react';
import CountUp from 'react-countup';
import { Col, Row, Spinner, Nav, NavItem, NavLink, TabContent, TabPane, Form, FormGroup, Input, CustomInput } from 'reactstrap';
import Cascader from 'rc-cascader';
import MicrogridTableCard from './MicrogridTableCard';
import CardSummary from '../common/CardSummary';
import { toast } from 'react-toastify';
import { getCookieValue, createCookie, checkEmpty,handleAPIError } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import moment from 'moment';
import { APIBaseURL, settings } from '../../../config';
import { getItemFromStore } from '../../../helpers/utils';
import CustomizeMapBox from '../common/CustomizeMapBox';
import classNames from 'classnames';
import AppContext from '../../../context/Context';
import StackBarChart from './StackBarChart';

const ItemDashboard = ({ setRedirect, setRedirectUrl, t }) => {
  let current_moment = moment();
  const [isDashboardFetched, setIsDashboardFetched] = useState(false);
  const [isMicrogridsEnergyFetched, setIsMicrogridsEnergyFetched] = useState(false);
  const [isMicrogridsBillingFetched, setIsMicrogridsBillingFetched] = useState(false);
  const [isMicrogridsCarbonFetched, setIsMicrogridsCarbonFetched] = useState(false);
  const [isMicrogridsPhotovoltaicFetched, setIsMicrogridsPhotovoltaicFetched] = useState(false);
  const [isMicrogridsEvchargerFetched, setIsMicrogridsEvchargerFetched] = useState(false);
  const [isMicrogridsLoadFetched, setIsMicrogridsLoadFetched] = useState(false);
  const [isMicrogridsGridBuyFetched, setIsMicrogridsGridBuyFetched] = useState(false);
  const [isMicrogridsGridSellFetched, setIsMicrogridsGridSellFetched] = useState(false);
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
    if (activeTabLeft !== tab) {
      setActiveTabLeft(tab);
      // Load data for the selected tab if not already loaded
      const user_uuid = getCookieValue('user_uuid');
      if (tab === '2' && !isMicrogridsBillingFetched) {
        loadBillingData(user_uuid);
      } else if (tab === '3' && !isMicrogridsCarbonFetched) {
        loadCarbonData(user_uuid);
      } else if (tab === '4' && !isMicrogridsPhotovoltaicFetched) {
        loadPhotovoltaicData(user_uuid);
      } else if (tab === '5' && !isMicrogridsEvchargerFetched) {
        loadEvchargerData(user_uuid);
      } else if (tab === '6' && !isMicrogridsLoadFetched) {
        loadLoadData(user_uuid);
      } else if (tab === '7' && !isMicrogridsGridBuyFetched) {
        loadGridBuyData(user_uuid);
      } else if (tab === '8' && !isMicrogridsGridSellFetched) {
        loadGridSellData(user_uuid);
      }
    }
  };
  const [activeTabRight, setActiveTabRight] = useState('1');
  const toggleTabRight = tab => {
    if (activeTabRight !== tab) setActiveTabRight(tab);
  };
  const { currency } = useContext(AppContext);

  // State for space selection
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [filteredMicrogridList, setFilteredMicrogridList] = useState([]);
  const [selectedMicrogrid, setSelectedMicrogrid] = useState(undefined);
  const [cascaderOptions, setCascaderOptions] = useState([]);
  const [spaceCascaderHidden, setSpaceCascaderHidden] = useState(false);

  //Results

  const [microgridList, setMicrogridList] = useState([]);
  const [totalRatedCapacity, setTotalRatedCapacity] = useState({});
  const [totalRatedPower, setTotalRatedPower] = useState({});
  const [totalCharge, setTotalCharge] = useState({});
  const [totalDischarge, setTotalDischarge] = useState({});
  const [totalRevenue, setTotalRevenue] = useState({});
  const [totalPhotovoltaic, setTotalPhotovoltaic] = useState(0);
  const [totalEvcharger, setTotalEvcharger] = useState(0);
  const [totalLoad, setTotalLoad] = useState(0);
  const [totalGridBuy, setTotalGridBuy] = useState(0);
  const [totalGridSell, setTotalGridSell] = useState(0);

  const [chargeEnergyData, setChargeEnergyData] = useState({});
  const [dischargeEnergyData, setDischargeEnergyData] = useState({});
  const [chargeBillingData, setChargeBillingData] = useState({});
  const [dischargeBillingData, setDischargeBillingData] = useState({});
  const [chargeCarbonData, setChargeCarbonData] = useState({});
  const [dischargeCarbonData, setDischargeCarbonData] = useState({});
  const [photovoltaicEnergyData, setPhotovoltaicEnergyData] = useState({});
  const [evchargerEnergyData, setEvchargerEnergyData] = useState({});
  const [loadEnergyData, setLoadEnergyData] = useState({});
  const [gridBuyEnergyData, setGridBuyEnergyData] = useState({});
  const [gridSellEnergyData, setGridSellEnergyData] = useState({});
  const [energyLabels, setEnergyLabels] = useState([]);
  const [billingLabels, setBillingLabels] = useState([]);
  const [carbonLabels, setCarbonLabels] = useState([]);
  const [photovoltaicLabels, setPhotovoltaicLabels] = useState([]);
  const [evchargerLabels, setEvchargerLabels] = useState([]);
  const [loadLabels, setLoadLabels] = useState([]);
  const [gridBuyLabels, setGridBuyLabels] = useState([]);
  const [gridSellLabels, setGridSellLabels] = useState([]);
  const [periodTypes, setPeriodTypes] = useState([
    { value: 'a0', label: t('7 Days') },
    { value: 'a1', label: t('This Month') },
    { value: 'a2', label: t('This Year') }
  ]);
  const [language, setLanguage] = useState(getItemFromStore('myems_web_ui_language', settings.language));
  const [geojson, setGeojson] = useState({});
  const [rootLatitude, setRootLatitude] = useState('');
  const [rootLongitude, setRootLongitude] = useState('');

  // Load space tree and microgrids
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

      setSpaceCascaderHidden(false);
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
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        })
        .then(json => {
          if (isResponseOK) {
            console.log('Spaces tree response:', json);
            // rename keys to match Cascader component requirements
            let convertedJson = JSON.parse(
              JSON.stringify([json])
                .split('"id":')
                .join('"value":')
                .split('"name":')
                .join('"label":')
            );
            console.log('Converted spaces tree:', convertedJson);
            if (convertedJson && Array.isArray(convertedJson) && convertedJson.length > 0 && convertedJson[0]) {
              json = convertedJson;
              setCascaderOptions(json);
              setSelectedSpaceName([json[0]].map(o => o.label));
              let selectedSpaceID = [json[0]].map(o => o.value);
              // get Microgrids by root Space ID
              let isResponseOKMicrogrid = false;
            fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/microgrids', {
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
                  isResponseOKMicrogrid = true;
                }
                return response.json();
              })
              .then(json => {
                if (isResponseOKMicrogrid) {
                  json = JSON.parse(
                    JSON.stringify([json])
                      .split('"id":')
                      .join('"value":')
                      .split('"name":')
                      .join('"label":')
                  );
                  if (json && Array.isArray(json) && json.length > 0 && json[0] && Array.isArray(json[0])) {
                    setMicrogridList(json[0]);
                    setFilteredMicrogridList(json[0]);
                    if (json[0].length > 0 && json[0][0]) {
                      // select the first microgrid
                      let microgridID = json[0][0].value;
                      setSelectedMicrogrid(microgridID);
                      // Reset fetched states to reload data
                      setIsMicrogridsEnergyFetched(false);
                      setIsMicrogridsBillingFetched(false);
                      setIsMicrogridsCarbonFetched(false);
                      // automatically load data for the first microgrid
                      loadMicrogridData(microgridID);
                    } else {
                      setSelectedMicrogrid(undefined);
                    }
                  } else {
                    setMicrogridList([]);
                    setFilteredMicrogridList([]);
                    setSelectedMicrogrid(undefined);
                  }
                } else {
                  if (json && json.description) {
                    handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
                  } else {
                    toast.error(t('Failed to load microgrids'));
                  }
                }
              })
              .catch(err => {
                console.log(err);
                toast.error(t('Failed to load microgrids'));
              });
            } else {
              console.log('No valid space data after conversion');
              if (json && json.description) {
                handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
              } else {
                toast.error(t('No spaces found'));
              }
            }
          } else {
            console.log('Response not OK or invalid format:', json);
            if (json && json.description) {
              handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
            } else {
              toast.error(t('No spaces found'));
            }
          }
        })
        .catch(err => {
          console.log(err);
          toast.error(t('Failed to load spaces'));
        });
    }
  }, []);

  const loadMicrogridData = (microgridID) => {
    let user_uuid = getCookieValue('user_uuid');
    let isResponseOK = false;
    setSpinnerHidden(false);

    // Load dashboard data for selected microgrid
    fetch(
      APIBaseURL +
        '/reports/microgriddashboard?' +
        'useruuid=' +
        user_uuid +
        '&microgridid=' +
        microgridID +
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
          let totalRatedCapacity = 0;
          let totalRatedPower = 0;

          if (json['microgrids'] && json['microgrids'].length > 0) {
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
              microgridItem['nameuuid'] = (microgridItem['name'] || '') + (microgridItem['uuid'] || '');
              microgridList.push(microgridItem);
            });
            setMicrogridList(microgridList);
            setTotalRatedCapacity(totalRatedCapacity);
            setTotalRatedPower(totalRatedPower);
            geojson['type'] = 'FeatureCollection';
            geojson['features'] = geojsonData;
            setGeojson(geojson);
          }

          setTotalCharge(json['total_charge_energy'] || 0);

          setTotalDischarge(json['total_discharge_energy'] || 0);

          setTotalRevenue(json['total_discharge_billing'] || 0);

          setTotalPhotovoltaic(json['total_photovoltaic_energy'] || 0);

          setTotalEvcharger(json['total_evcharger_energy'] || 0);

          setTotalLoad(json['total_load_energy'] || 0);

          setTotalGridBuy(json['total_grid_buy_energy'] || 0);

          setTotalGridSell(json['total_grid_sell_energy'] || 0);
        }
      });
  };

  const onSpaceCascaderChange = (value, selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) return;
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    if (!value || value.length === 0) return;
    let selectedSpaceID = value[value.length - 1];
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/microgrids', {
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
          if (json && Array.isArray(json) && json.length > 0 && json[0] && Array.isArray(json[0])) {
            setMicrogridList(json[0]);
            setFilteredMicrogridList(json[0]);
            if (json[0].length > 0 && json[0][0]) {
              // select the first microgrid
              let microgridID = json[0][0].value;
              setSelectedMicrogrid(microgridID);
              // Reset fetched states to reload data
              setIsMicrogridsEnergyFetched(false);
              setIsMicrogridsBillingFetched(false);
              setIsMicrogridsCarbonFetched(false);
              // automatically load data for the first microgrid
              loadMicrogridData(microgridID);
            } else {
              setSelectedMicrogrid(undefined);
            }
          } else {
            setMicrogridList([]);
            setFilteredMicrogridList([]);
            setSelectedMicrogrid(undefined);
          }
        } else {
          if (json && json.description) {
            handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
          } else {
            toast.error(t('Failed to load microgrids'));
          }
        }
      })
      .catch(err => {
        console.log(err);
        toast.error(t('Failed to load microgrids'));
      });
  };

  const onMicrogridChange = event => {
    let microgridID = event.target.value;
    setSelectedMicrogrid(microgridID);
    // Reset fetched states to reload data
    setIsMicrogridsEnergyFetched(false);
    setIsMicrogridsBillingFetched(false);
    setIsMicrogridsCarbonFetched(false);
    if (microgridID) {
      loadMicrogridData(microgridID);
    }
  };

  // Load functions for each tab (called on demand when tab is activated)
  const loadEnergyDataFunc = useCallback((user_uuid, microgridID) => {
    if (isMicrogridsEnergyFetched) return;
    setIsMicrogridsEnergyFetched(true);
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/microgridsenergy?useruuid=' + user_uuid + '&microgridid=' + microgridID, {
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
          console.log(json);
          setChargeEnergyData({
            unit: 'kWh',
            station_names_array: json['microgrid_names'] || [],
            subtotals_array: [
              json['reporting']['charge_7_days']['values_array'] || [],
              json['reporting']['charge_this_month']['values_array'] || [],
              json['reporting']['charge_this_year']['values_array'] || []
            ]
          });
          setDischargeEnergyData({
            unit: 'kWh',
            station_names_array: json['microgrid_names'] || [],
            subtotals_array: [
              json['reporting']['discharge_7_days']['values_array'] || [],
              json['reporting']['discharge_this_month']['values_array'] || [],
              json['reporting']['discharge_this_year']['values_array'] || []
            ]
          });
          setEnergyLabels([
            json['reporting']['charge_7_days']['timestamps_array'][0] || [],
            json['reporting']['charge_this_month']['timestamps_array'][0] || [],
            json['reporting']['charge_this_year']['timestamps_array'][0] || []
          ]);
        }
      });
  }, [isMicrogridsEnergyFetched]);

  // Load energy data when microgrid is selected (first tab - auto load)
  useEffect(() => {
    if (!selectedMicrogrid) return;
    const user_uuid = getCookieValue('user_uuid');
    loadEnergyDataFunc(user_uuid, selectedMicrogrid);
  }, [selectedMicrogrid, loadEnergyDataFunc]);

  const loadBillingData = useCallback((user_uuid) => {
    if (isMicrogridsBillingFetched || !selectedMicrogrid) return;
    setIsMicrogridsBillingFetched(true);
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/microgridsbilling?useruuid=' + user_uuid + '&microgridid=' + selectedMicrogrid, {
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
          console.log(json);
          setChargeBillingData({
            unit: currency,
            station_names_array: json['microgrid_names'] || [],
            subtotals_array: [
              json['reporting']['charge_7_days']['values_array'] || [],
              json['reporting']['charge_this_month']['values_array'] || [],
              json['reporting']['charge_this_year']['values_array'] || []
            ]
          });
          setDischargeBillingData({
            unit: currency,
            station_names_array: json['microgrid_names'] || [],
            subtotals_array: [
              json['reporting']['discharge_7_days']['values_array'] || [],
              json['reporting']['discharge_this_month']['values_array'] || [],
              json['reporting']['discharge_this_year']['values_array'] || []
            ]
          });
          setBillingLabels([
            json['reporting']['charge_7_days']['timestamps_array'][0] || [],
            json['reporting']['charge_this_month']['timestamps_array'][0] || [],
            json['reporting']['charge_this_year']['timestamps_array'][0] || []
          ]);
        }
      });
  }, [currency, isMicrogridsBillingFetched, selectedMicrogrid]);

  const loadCarbonData = useCallback((user_uuid) => {
    if (isMicrogridsCarbonFetched || !selectedMicrogrid) return;
    setIsMicrogridsCarbonFetched(true);
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/microgridscarbon?useruuid=' + user_uuid + '&microgridid=' + selectedMicrogrid, {
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
          console.log(json);
          setChargeCarbonData({
            unit: 'kgCO2',
            station_names_array: json['microgrid_names'] || [],
            subtotals_array: [
              json['reporting']['charge_7_days']['values_array'] || [],
              json['reporting']['charge_this_month']['values_array'] || [],
              json['reporting']['charge_this_year']['values_array'] || []
            ]
          });
          setDischargeCarbonData({
            unit: 'kgCO2',
            station_names_array: json['microgrid_names'] || [],
            subtotals_array: [
              json['reporting']['discharge_7_days']['values_array'] || [],
              json['reporting']['discharge_this_month']['values_array'] || [],
              json['reporting']['discharge_this_year']['values_array'] || []
            ]
          });
          setCarbonLabels([
            json['reporting']['charge_7_days']['timestamps_array'][0] || [],
            json['reporting']['charge_this_month']['timestamps_array'][0] || [],
            json['reporting']['charge_this_year']['timestamps_array'][0] || []
          ]);
        }
      });
  }, [isMicrogridsCarbonFetched, selectedMicrogrid]);

  const loadPhotovoltaicData = useCallback((user_uuid) => {
    if (isMicrogridsPhotovoltaicFetched || !selectedMicrogrid) return;
    setIsMicrogridsPhotovoltaicFetched(true);
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/microgridphotovoltaic?useruuid=' + user_uuid + '&microgridid=' + selectedMicrogrid, {
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
          console.log(json);
          setPhotovoltaicEnergyData({
            unit: 'kWh',
            station_names_array: json['microgrid_names'] || [],
            subtotals_array: [
              json['reporting']['photovoltaic_7_days']['values_array'] || [],
              json['reporting']['photovoltaic_this_month']['values_array'] || [],
              json['reporting']['photovoltaic_this_year']['values_array'] || []
            ]
          });
          setPhotovoltaicLabels([
            json['reporting']['photovoltaic_7_days']['timestamps_array'][0] || [],
            json['reporting']['photovoltaic_this_month']['timestamps_array'][0] || [],
            json['reporting']['photovoltaic_this_year']['timestamps_array'][0] || []
          ]);
        }
      });
  }, [isMicrogridsPhotovoltaicFetched, selectedMicrogrid]);

  const loadEvchargerData = useCallback((user_uuid) => {
    if (isMicrogridsEvchargerFetched || !selectedMicrogrid) return;
    setIsMicrogridsEvchargerFetched(true);
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/microgridevcharger?useruuid=' + user_uuid + '&microgridid=' + selectedMicrogrid, {
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
          console.log(json);
          setEvchargerEnergyData({
            unit: 'kWh',
            station_names_array: json['microgrid_names'] || [],
            subtotals_array: [
              json['reporting']['evcharger_7_days']['values_array'] || [],
              json['reporting']['evcharger_this_month']['values_array'] || [],
              json['reporting']['evcharger_this_year']['values_array'] || []
            ]
          });
          setEvchargerLabels([
            json['reporting']['evcharger_7_days']['timestamps_array'][0] || [],
            json['reporting']['evcharger_this_month']['timestamps_array'][0] || [],
            json['reporting']['evcharger_this_year']['timestamps_array'][0] || []
          ]);
        }
      });
  }, [isMicrogridsEvchargerFetched, selectedMicrogrid]);

  const loadLoadData = useCallback((user_uuid) => {
    if (isMicrogridsLoadFetched || !selectedMicrogrid) return;
    setIsMicrogridsLoadFetched(true);
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/microgridload?useruuid=' + user_uuid + '&microgridid=' + selectedMicrogrid, {
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
          console.log(json);
          setLoadEnergyData({
            unit: 'kWh',
            station_names_array: json['microgrid_names'] || [],
            subtotals_array: [
              json['reporting']['load_7_days']['values_array'] || [],
              json['reporting']['load_this_month']['values_array'] || [],
              json['reporting']['load_this_year']['values_array'] || []
            ]
          });
          setLoadLabels([
            json['reporting']['load_7_days']['timestamps_array'][0] || [],
            json['reporting']['load_this_month']['timestamps_array'][0] || [],
            json['reporting']['load_this_year']['timestamps_array'][0] || []
          ]);
        }
      });
  }, [isMicrogridsLoadFetched, selectedMicrogrid]);

  const loadGridBuyData = useCallback((user_uuid) => {
    if (isMicrogridsGridBuyFetched || !selectedMicrogrid) return;
    setIsMicrogridsGridBuyFetched(true);
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/microgridgridbuy?useruuid=' + user_uuid + '&microgridid=' + selectedMicrogrid, {
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
          console.log(json);
          setGridBuyEnergyData({
            unit: 'kWh',
            station_names_array: json['microgrid_names'] || [],
            subtotals_array: [
              json['reporting']['grid_buy_7_days']['values_array'] || [],
              json['reporting']['grid_buy_this_month']['values_array'] || [],
              json['reporting']['grid_buy_this_year']['values_array'] || []
            ]
          });
          setGridBuyLabels([
            json['reporting']['grid_buy_7_days']['timestamps_array'][0] || [],
            json['reporting']['grid_buy_this_month']['timestamps_array'][0] || [],
            json['reporting']['grid_buy_this_year']['timestamps_array'][0] || []
          ]);
        }
      });
  }, [isMicrogridsGridBuyFetched, selectedMicrogrid]);

  const loadGridSellData = useCallback((user_uuid) => {
    if (isMicrogridsGridSellFetched || !selectedMicrogrid) return;
    setIsMicrogridsGridSellFetched(true);
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/microgridgridsell?useruuid=' + user_uuid + '&microgridid=' + selectedMicrogrid, {
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
          console.log(json);
          setGridSellEnergyData({
            unit: 'kWh',
            station_names_array: json['microgrid_names'] || [],
            subtotals_array: [
              json['reporting']['grid_sell_7_days']['values_array'] || [],
              json['reporting']['grid_sell_this_month']['values_array'] || [],
              json['reporting']['grid_sell_this_year']['values_array'] || []
            ]
          });
          setGridSellLabels([
            json['reporting']['grid_sell_7_days']['timestamps_array'][0] || [],
            json['reporting']['grid_sell_this_month']['timestamps_array'][0] || [],
            json['reporting']['grid_sell_this_year']['timestamps_array'][0] || []
          ]);
        }
      });
  }, [isMicrogridsGridSellFetched, selectedMicrogrid]);

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
      <Form>
        <Row form>
          <Col xs={6} sm={3} hidden={spaceCascaderHidden}>
            <FormGroup className="form-group">
              {cascaderOptions && cascaderOptions.length > 0 ? (
                <Cascader options={cascaderOptions} onChange={onSpaceCascaderChange} changeOnSelect expandTrigger="hover">
                  <Input bsSize="sm" value={selectedSpaceName || ''} readOnly placeholder={t('Select Space')} />
                </Cascader>
              ) : (
                <Input bsSize="sm" value={t('Loading...')} readOnly disabled />
              )}
            </FormGroup>
          </Col>
          <Col xs="auto">
            <FormGroup>
              <Form inline>
                <CustomInput
                  type="select"
                  id="microgridSelect"
                  name="microgridSelect"
                  bsSize="sm"
                  onChange={onMicrogridChange}
                  value={selectedMicrogrid || ''}
                >
                  <option value="">{t('Select Microgrid')}</option>
                  {filteredMicrogridList.map((microgrid, index) => (
                    <option value={microgrid.value} key={index}>
                      {microgrid.label}
                    </option>
                  ))}
                </CustomInput>
              </Form>
            </FormGroup>
          </Col>
          <Col xs="auto">
            <FormGroup>
              <Spinner color="primary" hidden={spinnerHidden} />
            </FormGroup>
          </Col>
        </Row>
      </Form>
      <div className="card-deck">

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
        <CardSummary rate={''} title={t('Total Photovoltaic Generation')} footunit={'kWh'} color="electricity">
          {1 && <CountUp end={totalPhotovoltaic} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total EV Charger Consumption')} footunit={'kWh'} color="electricity">
          {1 && <CountUp end={totalEvcharger} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total Load Consumption')} footunit={'kWh'} color="electricity">
          {1 && <CountUp end={totalLoad} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total Grid Buy')} footunit={'kWh'} color="electricity">
          {1 && <CountUp end={totalGridBuy} duration={2} prefix="" separator="," decimal="." decimals={2} />}
        </CardSummary>
        <CardSummary rate={''} title={t('Total Grid Sell')} footunit={'kWh'} color="electricity">
          {1 && <CountUp end={totalGridSell} duration={2} prefix="" separator="," decimal="." decimals={2} />}
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
                  <h6>{t('Microgrid Energy')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '2' })}
                  onClick={() => {
                    toggleTabLeft('2');
                  }}
                >
                  <h6>{t('Microgrid Revenue')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '3' })}
                  onClick={() => {
                    toggleTabLeft('3');
                  }}
                >
                  <h6>{t('Microgrid Carbon')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '4' })}
                  onClick={() => {
                    toggleTabLeft('4');
                  }}
                >
                  <h6>{t('Photovoltaic Generation')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '5' })}
                  onClick={() => {
                    toggleTabLeft('5');
                  }}
                >
                  <h6>{t('EV Charger Consumption')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '6' })}
                  onClick={() => {
                    toggleTabLeft('6');
                  }}
                >
                  <h6>{t('Load Consumption')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '7' })}
                  onClick={() => {
                    toggleTabLeft('7');
                  }}
                >
                  <h6>{t('Grid Buy')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '8' })}
                  onClick={() => {
                    toggleTabLeft('8');
                  }}
                >
                  <h6>{t('Grid Sell')}</h6>
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTabLeft}>
              <TabPane tabId="1">
                <StackBarChart
                  labels={energyLabels}
                  chargeData={chargeEnergyData}
                  dischargeData={dischargeEnergyData}
                  periodTypes={periodTypes}
                  chargeLabelPrefix={chargeEnergyData && chargeEnergyData['unit'] ? t('Microgrid Energy') + ' ' + t('Charge UNIT', { UNIT: chargeEnergyData['unit'] }) : undefined}
                  dischargeLabelPrefix={dischargeEnergyData && dischargeEnergyData['unit'] ? t('Microgrid Energy') + ' ' + t('Discharge UNIT', { UNIT: dischargeEnergyData['unit'] }) : undefined}
                />
              </TabPane>
              <TabPane tabId="2">
                <StackBarChart
                  labels={billingLabels}
                  chargeData={chargeBillingData}
                  dischargeData={dischargeBillingData}
                  periodTypes={periodTypes}
                  chargeLabelPrefix={chargeBillingData && chargeBillingData['unit'] ? t('Microgrid Revenue') + ' ' + t('Charge UNIT', { UNIT: chargeBillingData['unit'] }) : undefined}
                  dischargeLabelPrefix={dischargeBillingData && dischargeBillingData['unit'] ? t('Microgrid Revenue') + ' ' + t('Discharge UNIT', { UNIT: dischargeBillingData['unit'] }) : undefined}
                />
              </TabPane>
              <TabPane tabId="3">
                <StackBarChart
                  labels={carbonLabels}
                  chargeData={chargeCarbonData}
                  dischargeData={dischargeCarbonData}
                  periodTypes={periodTypes}
                  chargeLabelPrefix={chargeCarbonData && chargeCarbonData['unit'] ? t('Microgrid Carbon') + ' ' + t('Charge UNIT', { UNIT: chargeCarbonData['unit'] }) : undefined}
                  dischargeLabelPrefix={dischargeCarbonData && dischargeCarbonData['unit'] ? t('Microgrid Carbon') + ' ' + t('Discharge UNIT', { UNIT: dischargeCarbonData['unit'] }) : undefined}
                />
              </TabPane>
              <TabPane tabId="4">
                <StackBarChart
                  labels={photovoltaicLabels}
                  chargeData={photovoltaicEnergyData}
                  dischargeData={{ unit: 'kWh', station_names_array: [], subtotals_array: [] }}
                  periodTypes={periodTypes}
                  chargeLabelPrefix={photovoltaicEnergyData && photovoltaicEnergyData['unit'] ? t('Photovoltaic Generation') + ' ' + photovoltaicEnergyData['unit'] : undefined}
                />
              </TabPane>
              <TabPane tabId="5">
                <StackBarChart
                  labels={evchargerLabels}
                  chargeData={evchargerEnergyData}
                  dischargeData={{ unit: 'kWh', station_names_array: [], subtotals_array: [] }}
                  periodTypes={periodTypes}
                  chargeLabelPrefix={evchargerEnergyData && evchargerEnergyData['unit'] ? t('EV Charger Consumption') + ' ' + evchargerEnergyData['unit'] : undefined}
                />
              </TabPane>
              <TabPane tabId="6">
                <StackBarChart
                  labels={loadLabels}
                  chargeData={loadEnergyData}
                  dischargeData={{ unit: 'kWh', station_names_array: [], subtotals_array: [] }}
                  periodTypes={periodTypes}
                  chargeLabelPrefix={loadEnergyData && loadEnergyData['unit'] ? t('Load Consumption') + ' ' + loadEnergyData['unit'] : undefined}
                />
              </TabPane>
              <TabPane tabId="7">
                <StackBarChart
                  labels={gridBuyLabels}
                  chargeData={gridBuyEnergyData}
                  dischargeData={{ unit: 'kWh', station_names_array: [], subtotals_array: [] }}
                  periodTypes={periodTypes}
                  chargeLabelPrefix={gridBuyEnergyData && gridBuyEnergyData['unit'] ? t('Grid Buy') + ' ' + gridBuyEnergyData['unit'] : undefined}
                />
              </TabPane>
              <TabPane tabId="8">
                <StackBarChart
                  labels={gridSellLabels}
                  chargeData={gridSellEnergyData}
                  dischargeData={{ unit: 'kWh', station_names_array: [], subtotals_array: [] }}
                  periodTypes={periodTypes}
                  chargeLabelPrefix={gridSellEnergyData && gridSellEnergyData['unit'] ? t('Grid Sell') + ' ' + gridSellEnergyData['unit'] : undefined}
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

export default withTranslation()(withRedirect(ItemDashboard));
