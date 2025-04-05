import React, { Fragment, useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  CustomInput,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Table,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';
import Cascader from 'rc-cascader';
import MultipleLineChart from '../common/MultipleLineChart';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { APIBaseURL, settings } from '../../../config';
import useInterval from '../../../hooks/useInterval';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import { isIterableArray } from '../../../helpers/utils';
import classNames from 'classnames';
import ScheduleDetails from './ScheduleDetails';
import DetailsCard from './DetailsCard';
import DeviceStatusDetails from './DeviceStatusDetails';
import blankPage from '../../../assets/img/generic/blank-page.png';
import PinModal from './PinModal';
import FaultDetails from './FaultDetails';
import CommandDetails from './CommandDetails';


const HybridPowerStationDetails = ({ setRedirect, setRedirectUrl, t }) => {
  const location = useLocation();
  const uuid = location.search.split('=')[1];
  const hybridPowerStationUUID = location.search.split('=')[1];
  const [isOpenPinModal, setIsOpenPinModal] = useState(false);

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

  const [activeTabLeft, setActiveTabLeft] = useState('1');
  const toggleTabLeft = tab => {
    if (activeTabLeft !== tab) setActiveTabLeft(tab);

  };

  const [activeTabRight, setActiveTabRight] = useState('1');
  const toggleTabRight = tab => {
    if (activeTabRight !== tab) setActiveTabRight(tab);
  };

  const [activeTabBottom, setActiveTabBottom] = useState('1');

  // State
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [stationList, setStationList] = useState([]);
  const [filteredStationList, setFilteredStationList] = useState([]);
  const [selectedStation, setSelectedStation] = useState(undefined);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [submitButtonHidden, setSubmitButtonHidden] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [spaceCascaderHidden, setSpaceCascaderHidden] = useState(false);
  const [resultDataHidden, setResultDataHidden] = useState(true);

  //Results
  const [hybridPowerStationName, setHybridPowerStationName] = useState();
  const [hybridPowerStationAddress, setHybridPowerStationAddress] = useState();
  const [hybridPowerStationRatedCapacity, setHybridPowerStationRatedCapacity] = useState();
  const [hybridPowerStationRatedPower, setHybridPowerStationRatedPower] = useState();
  const [hybridPowerStationSVG, setHybridPowerStationSVG] = useState();
  const [gatewayStatus, setGatewayStatus] = useState();
  const [PCSStatus, setPCSStatus] = useState();
  const [BMSStatus, setBMSStatus] = useState();
  const [PVStatus, setPVStatus] = useState();
  const [gridMeterStatus, setGridMeterStatus] = useState();
  const [loadMeterStatus, setLoadMeterStatus] = useState();


  const [todayChargeEnergyValue, setTodayChargeEnergyValue] = useState();
  const [todayDischargeEnergyValue, setTodayDischargeEnergyValue] = useState();
  const [totalChargeEnergyValue, setTotalChargeEnergyValue] = useState();
  const [totalDischargeEnergyValue, setTotalDischargeEnergyValue] = useState();
  const [totalEfficiency, setTotalEfficiency] = useState();

  const [todayChargeRevenueValue, setTodayChargeRevenueValue] = useState();
  const [todayDischargeRevenueValue, setTodayDischargeRevenueValue] = useState();
  const [totalChargeRevenueValue, setTotalChargeRevenueValue] = useState();
  const [totalDischargeRevenueValue, setTotalDischargeRevenueValue] = useState();

  const [scheduleXaxisData, setScheduleXaxisData] = useState();
  const [scheduleSeriesName, setScheduleSeriesName] = useState();
  const [scheduleSeriesData, setScheduleSeriesData] = useState();
  const [scheduleMarkAreaData, setScheduleMarkAreaData] = useState();

  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);

  const [faultDetailsList, setFaultDetailsList] = useState([]);
  const [BMSDetailsList, setBMSDetailsList] = useState([]);
  const [CMDetailsList, setCMDetailsList] = useState([]);
  const [PVDetailsList, setPVDetailsList] = useState([]);
  const [GeneratorDetailsList, setGeneratorDetailsList] = useState([]);
  const [PCSDetailsList, setPCSDetailsList] = useState([]);
  const [loadDetailsList, setLoadDetailsList] = useState([]);
  const [commandDetailsList, setCommandDetailsList] = useState([]);

  useEffect(() => {
    if (uuid === null || !uuid) {
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
            // get hybrid Power Stations by root Space ID
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
                    setSubmitButtonHidden(false);
                  } else {
                    setSelectedStation(undefined);
                    // disable submit button
                    setSubmitButtonDisabled(true);
                    setSubmitButtonHidden(true);
                  }
                } else {
                  toast.error(t(json.description));
                }
              })
              .catch(err => {
                console.log(err);
              });
            // end of get hybrid Power Stations by root Space ID
          } else {
            toast.error(t(json.description));
          }
        })
        .catch(err => {
          console.log(err);
        });
    } else {
        setSpaceCascaderHidden(true);
        loadData(APIBaseURL + '/reports/hybridpowerstationdetails?uuid=' + hybridPowerStationUUID)
      }
  }, [hybridPowerStationUUID]);

  const loadData = url => {
    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);
    // hide result data
    setResultDataHidden(true);

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
          if (uuid !== null && uuid) {
            setFilteredStationList([{ id: json['hybrid_power_station']['id'], label: json['hybrid_power_station']['name'] }]);
            setSelectedStation(json['hybrid_power_station']['id']);
          }
          setHybridPowerStationName(json['hybrid_power_station']['name']);
          setHybridPowerStationAddress(json['hybrid_power_station']['address']);
          setHybridPowerStationRatedCapacity(json['hybrid_power_station']['rated_capacity']);
          setHybridPowerStationRatedPower(json['hybrid_power_station']['rated_power']);
          setHybridPowerStationSVG({ __html: json['hybrid_power_station']['svg'] });

          setTodayChargeEnergyValue(json['energy_indicators']['today_charge_energy_value']);
          setTodayDischargeEnergyValue(json['energy_indicators']['today_discharge_energy_value']);
          setTotalChargeEnergyValue(json['energy_indicators']['total_charge_energy_value']);
          setTotalDischargeEnergyValue(json['energy_indicators']['total_discharge_energy_value']);

          if (json['energy_indicators']['total_charge_energy_value'] > 0) {
            setTotalEfficiency((100 * json['energy_indicators']['total_discharge_energy_value'] / json['energy_indicators']['total_charge_energy_value']).toFixed(2));
          } else {
            setTotalEfficiency(0);
          }

          setTodayChargeRevenueValue(json['revenue_indicators']['today_charge_revenue_value']);
          setTodayDischargeRevenueValue(json['revenue_indicators']['today_discharge_revenue_value']);
          setTotalChargeRevenueValue(json['revenue_indicators']['total_charge_revenue_value']);
          setTotalDischargeRevenueValue(json['revenue_indicators']['total_discharge_revenue_value']);

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
          // enable submit button
          setSubmitButtonDisabled(false);
          // hide spinner
          setSpinnerHidden(true);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

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
            setSubmitButtonHidden(false);
          } else {
            setSelectedStation(undefined);
            // disable submit button
            setSubmitButtonDisabled(true);
            setSubmitButtonHidden(true);
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
    loadData(APIBaseURL + '/reports/hybridpowerstationdetails?id=' + selectedStation);
  };


  const refreshSVGData = () => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/pointrealtime', {
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
          json.forEach(currentPoint => {
            let textElement = document.getElementById('PT' + currentPoint['point_id']);
            if (textElement) {
              textElement.textContent = parseFloat(currentPoint['value']).toFixed(2);
            }
            let circleElement = document.getElementById('CIRCLE' + currentPoint['point_id']);
            if (circleElement) {
              if (currentPoint['value'] > 0) {
                circleElement.className.baseVal = 'flow';
              } else if (currentPoint['value'] < 0) {
                circleElement.className.baseVal = 'flow-reverse';
              } else {
                circleElement.className.baseVal = '';
              }
            }
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  useInterval(() => {
    refreshSVGData();
  }, 1000 * 10);

  // Fault Details
  const fetchFaultDetails = () => {
    let isResponseOK = false;
    let current_moment = moment();

    // Query Parameters
    let priority = 'all';
    let status = 'all';
    let reportingPeriodDateRange = [current_moment.clone().subtract(1, 'weeks').toDate(), current_moment.toDate()]
    // results
    let totalFaultNumber = 0;
    let newFaultNumber = 0;

    fetch(
      APIBaseURL +
        '/webmessages?' +
        'startdatetime=' +
        moment(reportingPeriodDateRange[0]).format('YYYY-MM-DDTHH:mm:ss') +
        '&enddatetime=' +
        moment(reportingPeriodDateRange[1]).format('YYYY-MM-DDTHH:mm:ss') +
        '&priority=' +
        priority +
        '&status=' +
        status,
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
          let faultList = [];
          if (json.length > 0) {
            json.forEach((currentValue, index) => {
              let fault = {};
              fault['id'] = currentValue['id'];
              fault['subject'] = currentValue['subject'];
              fault['message'] = currentValue['message'];
              fault['created_datetime'] = moment(parseInt(currentValue['created_datetime'])).format(
                'YYYY-MM-DD HH:mm:ss'
              );
              fault['status'] = currentValue['status'];
              totalFaultNumber += 1;
              // todo: parse status
              newFaultNumber += 1;

              fault['update_datetime'] = moment(parseInt(currentValue['update_datetime'])).format(
                'YYYY-MM-DD HH:mm:ss'
              );
              fault['url'] = currentValue['url'];

              faultList.push(fault);
            });
            setFaultDetailsList(faultList);
          }
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  // Schedule
  const fetchScheduleDetails = () => {
    let url = APIBaseURL + '/reports/hybridpowerstationdetails/' + selectedStation + '/schedule'
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
          setScheduleXaxisData(['00:00:00', '00:30:00', '01:00:00', '01:30:00', '02:00:00', '02:30:00', '03:00:00', '03:30:00', '04:00:00', '04:30:00', '05:00:00', '05:30:00', '06:00:00', '06:30:00',
          '07:00:00', '07:30:00', '08:00:00', '08:30:00', '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00', '12:00:00', '12:30:00', '13:00:00',  '13:30:00',
          '14:00:00', '14:30:00', '15:00:00', '15:30:00', '16:00:00', '16:30:00', '17:00:00', '17:30:00', '18:00:00', '18:30:00', '19:00:00', '19:30:00', '20:00:00', '20:30:00',
          '21:00:00', '21:30:00', '22:00:00', '22:30:00', '23:00:00', '23:30:00', '23:59:59']);
          setScheduleSeriesName('Power');
          setScheduleSeriesData(json['schedule']['series_data']);
          let schedule_mark_area_data = [];
          json['schedule']['schedule_list'].forEach((schedule_item, index) => {
            schedule_mark_area_data.push([{name: t(schedule_item['peak_type']), xAxis: schedule_item['start_time_of_day']}, {xAxis: schedule_item['end_time_of_day']}])
          });
          setScheduleMarkAreaData(schedule_mark_area_data);

        } else {
          toast.error(t(json.description));

        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  // Generator
  const fetchGeneratorDetails = () => {
    let url = APIBaseURL + '/reports/hybridpowerstationdetails/' + selectedStation + '/generator'
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
          setGeneratorDetailsList(json);
        } else {
          toast.error(t(json.description));

        }
      })
      .catch(err => {
        console.log(err);
      });
  }
  // PCS
  const fetchPCSDetails = () => {
    let url = APIBaseURL + '/reports/hybridpowerstationdetails/' + selectedStation + '/pcs'
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
          setPCSDetailsList(json);
        } else {
          toast.error(t(json.description));

        }
      })
      .catch(err => {
        console.log(err);
      });
  }
  // BMS
  const fetchBMSDetails = () => {
    let url = APIBaseURL + '/reports/hybridpowerstationdetails/' + selectedStation + '/bms'
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
          setBMSDetailsList(json);
        } else {
          toast.error(t(json.description));

        }
      })
      .catch(err => {
        console.log(err);
      });
  }
  // Load
  const fetchLoadDetails = () => {

    let url = APIBaseURL + '/reports/hybridpowerstationdetails/' + selectedStation + '/load'
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
          setLoadDetailsList(json);
        } else {
          toast.error(t(json.description));

        }
      })
      .catch(err => {
        console.log(err);
      });
  }
  // PV
  const fetchPVDetails = () => {
    let url = APIBaseURL + '/reports/hybridpowerstationdetails/' + selectedStation + '/pv'
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
          setPVDetailsList(json);
        } else {
          toast.error(t(json.description));

        }
      })
      .catch(err => {
        console.log(err);
      });
  }
  // Charge Machine
  const fetchCMDetails = () => {
    let url = APIBaseURL + '/reports/hybridpowerstationdetails/' + selectedStation + '/cm'
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
          setCMDetailsList(json);
        } else {
          toast.error(t(json.description));

        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  // Command
  const fetchCommandDetails = () => {
    let url = APIBaseURL + '/reports/hybridpowerstationdetails/' + selectedStation + '/command'
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
          setCommandDetailsList(json);
        } else {
          toast.error(t(json.description));

        }
      })
      .catch(err => {
        console.log(err);
      });
  }

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
                    <option value={station.value} key={index}>
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
                <Button size="sm" color="success" hidden={submitButtonHidden} disabled={submitButtonDisabled}>
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
        <Row noGutters>
          <Col lg="3" className="pr-lg-2">
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
                  className={classNames({ active: activeTabLeft === '2' })}
                  onClick={() => {
                    toggleTabLeft('2');
                  }}
                >
                  <h6>{t('Revenue Indicator')}</h6>
                </NavLink>
              </NavItem>
              {/* <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabLeft === '3' })}
                  onClick={() => {
                    toggleTabLeft('3');
                  }}
                >
                  <h6>{t('Carbon Indicator')}</h6>
                </NavLink>
              </NavItem> */}
            </Nav>
            <TabContent activeTab={activeTabLeft}>
              <TabPane tabId="1">
                <Card className="mb-3 fs--1">
                  <Fragment>
                    <CardBody className="pt-0">
                      <Table borderless className="fs--1 mb-0">
                        <tbody>
                          <tr className="border-bottom">
                            <th className="pl-0">{t("Today's Charge")}</th>
                            <th className="pr-0 text-right">{todayChargeEnergyValue} kWh</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0">{t("Today's Discharge")}</th>
                            <th className="pr-0 text-right ">{todayDischargeEnergyValue} kWh</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t("Total Charge")}</th>
                            <th className="pr-0 text-right">{totalChargeEnergyValue} kWh</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t("Total Discharge")}</th>
                            <th className="pr-0 text-right">{totalDischargeEnergyValue} kWh</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t("Total Efficiency")}</th>
                            <th className="pr-0 text-right">{totalEfficiency}%</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t("Discharge Achievement Rate")}</th>
                            <th className="pr-0 text-right">{ (100 * todayDischargeEnergyValue / hybridPowerStationRatedCapacity).toFixed(2)}%</th>
                          </tr>
                        </tbody>
                      </Table>
                    </CardBody>
                  </Fragment>
                </Card>
              </TabPane>
              <TabPane tabId="2">
              <Card className="mb-3 fs--1">
                  <Fragment>
                    <CardBody className="pt-0">
                      <Table borderless className="fs--1 mb-0">
                        <tbody>
                          <tr className="border-bottom">
                            <th className="pl-0">{t("Today's Cost")}</th>
                            <th className="pr-0 text-right">{todayChargeRevenueValue} $</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0">{t("Today's Income")}</th>
                            <th className="pr-0 text-right ">{todayDischargeRevenueValue} $</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t("Total Cost")}</th>
                            <th className="pr-0 text-right">{totalChargeRevenueValue} $</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t("Total Income")}</th>
                            <th className="pr-0 text-right">{totalDischargeRevenueValue} $</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t("Today's Revenue")}</th>
                            <th className="pr-0 text-right">{(todayDischargeRevenueValue - todayChargeRevenueValue).toFixed(2)} $</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t("Total Revenue")}</th>
                            <th className="pr-0 text-right">{(totalDischargeRevenueValue - totalChargeRevenueValue).toFixed(2)} $</th>
                          </tr>
                        </tbody>
                      </Table>
                    </CardBody>
                  </Fragment>
                </Card>
              </TabPane>
            </TabContent>
          </Col>
          <Col lg="6" className="pr-lg-2" key={uuidv4()}>
            <div dangerouslySetInnerHTML={hybridPowerStationSVG} />
          </Col>
          <Col lg="3" className="pr-lg-2">
            <Nav tabs>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabRight === '1' })}
                  onClick={() => {
                    toggleTabRight('1');
                  }}
                >
                  <h6>{t('Device Status')}</h6>
                </NavLink>
              </NavItem>
              <NavItem className="cursor-pointer">
                <NavLink
                  className={classNames({ active: activeTabRight === '2' })}
                  onClick={() => {
                    toggleTabRight('2');
                  }}
                >
                  <h6>{t("Basic Information")}</h6>
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTabRight}>
              <TabPane tabId="1">
                <DeviceStatusDetails
                  id={selectedStation}
                  gatewayStatus={gatewayStatus}
                  PCSStatus={PCSStatus}
                  BMSStatus={BMSStatus}
                  PVStatus={PVStatus}
                  gridMeterStatus={gridMeterStatus}
                  loadMeterStatus={loadMeterStatus}
                />
              </TabPane>
              <TabPane tabId="2">
                <Card className="mb-3 fs--1">
                  <Fragment>
                    <CardBody className="pt-0">
                      <Table borderless className="fs--1 mb-0">
                        <tbody>
                          <tr className="border-bottom">
                            <th className="pl-0">{t('Name')}</th>
                            <th className="pr-0 text-right">{hybridPowerStationName}</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0">{t('Address')}</th>
                            <th className="pr-0 text-right ">{hybridPowerStationAddress}</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t('Rated Capacity')} </th>
                            <th className="pr-0 text-right">{hybridPowerStationRatedCapacity} kWh</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t('Rated Power')} </th>
                            <th className="pr-0 text-right">{hybridPowerStationRatedPower} kW</th>
                          </tr>
                        </tbody>
                      </Table>
                    </CardBody>
                  </Fragment>
                </Card>
              </TabPane>
            </TabContent>
          </Col>
        </Row>

        <Nav tabs>
          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '1' })}
              onClick={() => {
                setActiveTabBottom('1');
              }}
            >
              <h6>{t('Operating Characteristic Curve')}</h6>
            </NavLink>
          </NavItem>

          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '2' })}
              onClick={() => {
                setActiveTabBottom('2');
                fetchGeneratorDetails()
            }}
            >
              <h6>{t('Generator')}</h6>
            </NavLink>
          </NavItem>

          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '3' })}
              onClick={() => {
                setActiveTabBottom('3');
                fetchPCSDetails()
              }}
            >
              <h6>PCS</h6>
            </NavLink>
          </NavItem>

          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '4' })}
              onClick={() => {
                setActiveTabBottom('4');
                fetchBMSDetails();
              }}
            >
              <h6>BMS</h6>
            </NavLink>
          </NavItem>
          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '5' })}
              onClick={() => {
                setActiveTabBottom('5');
                fetchPVDetails();
              }}
            >
              <h6>{t('PV')}</h6>
            </NavLink>
          </NavItem>

          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '6' })}
              onClick={() => {
                setActiveTabBottom('6');
                fetchCMDetails();
              }}
            >
              <h6>{t('CM')}</h6>
            </NavLink>
          </NavItem>

          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '7' })}
              onClick={() => {
                setActiveTabBottom('7');
                fetchLoadDetails();
              }}
            >
              <h6>{t('Load Meter')}</h6>
            </NavLink>
          </NavItem>

          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '8' })}
              onClick={() => {
                setActiveTabBottom('8');
                fetchScheduleDetails();
              }}
            >
              <h6>{t('Strategy Management')}</h6>
            </NavLink>
          </NavItem>
          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '9' })}
              onClick={() => {
                setActiveTabBottom('9');
                fetchFaultDetails();
              }}
            >
              <h6>{t('Fault Alarms')}</h6>
            </NavLink>
          </NavItem>

          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '10' })}
              onClick={() => {
                let is_pin_valid = getCookieValue('is_pin_valid');
                if (is_pin_valid) {
                  fetchCommandDetails();
                  setActiveTabBottom('10');
                } else {
                  setIsOpenPinModal(true);
                }
              }}
            >
              <h6>{t('Run Commands')}</h6>
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTabBottom}>
          <TabPane tabId="1">
            <MultipleLineChart
              reportingTitle=""
              baseTitle=""
              labels={parameterLineChartLabels}
              data={parameterLineChartData}
              options={parameterLineChartOptions}
            />
          </TabPane>
          <TabPane tabId="2">
            {isIterableArray(GeneratorDetailsList) && GeneratorDetailsList.map(({ id, ...rest }) => <DetailsCard key={id} id={id} {...rest} />) }
          </TabPane>
          <TabPane tabId="3">
            {isIterableArray(PCSDetailsList) && PCSDetailsList.map(({ id, ...rest }) => <DetailsCard key={id} id={id} {...rest} />) }
          </TabPane>
          <TabPane tabId="4">
            {isIterableArray(BMSDetailsList) && BMSDetailsList.map(({ id, ...rest }) => <DetailsCard key={id} id={id} {...rest} />) }
          </TabPane>
          <TabPane tabId="5">
            {isIterableArray(PVDetailsList) && PVDetailsList.map(({ id, ...rest }) => <DetailsCard key={id} id={id} {...rest} />) }
          </TabPane>
          <TabPane tabId="6">
            {isIterableArray(CMDetailsList) && CMDetailsList.map(({ id, ...rest }) => <DetailsCard key={id} id={id} {...rest} />) }
          </TabPane>
          <TabPane tabId="7">
            {isIterableArray(loadDetailsList) && loadDetailsList.map(({ id, ...rest }) => <DetailsCard key={id} id={id} {...rest} />) }
          </TabPane>
          <TabPane tabId="8">
            <ScheduleDetails
                xaxisData={scheduleXaxisData}
                seriesName={scheduleSeriesName}
                seriesData={scheduleSeriesData}
                markAreaData={scheduleMarkAreaData}
            />
          </TabPane>
          <TabPane tabId="9">
            <FaultDetails faults={faultDetailsList} />
          </TabPane>
          <TabPane tabId="10">
            {isIterableArray(commandDetailsList) && commandDetailsList.map(({ id, ...rest }) => <CommandDetails key={id} id={id} { ...rest} />) }
          </TabPane>
        </TabContent>
      </div>

      <PinModal
        isOpenPinModal={isOpenPinModal}
        setIsOpenPinModal={setIsOpenPinModal}
      />
    </Fragment>
  );
};

export default withTranslation()(withRedirect(HybridPowerStationDetails));
