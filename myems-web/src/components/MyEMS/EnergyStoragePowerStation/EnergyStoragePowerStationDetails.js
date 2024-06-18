import React, { Fragment, useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  CustomInput,
  CardTitle,
  CardText,
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
import FalconCardHeader from '../../common/FalconCardHeader';
import MultipleLineChart from '../common/MultipleLineChart';
import SectionLineChart from '../common/SectionLineChart';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { APIBaseURL, settings } from '../../../config';
import useInterval from '../../../hooks/useInterval';
import { useLocation } from 'react-router-dom';
import Datetime from 'react-datetime';
import classNames from 'classnames';

const EnergyStoragePowerStationDetails = ({ setRedirect, setRedirectUrl, t }) => {
  const location = useLocation();
  const uuid = location.search.split('=')[1];
  const energyStoragePowerStationUUID = location.search.split('=')[1];

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
  const toggleTabBottom = tab => {
    if (activeTabBottom !== tab) setActiveTabBottom(tab);
  };

  // State
  const [selectedSpaceName, setSelectedSpaceName] = useState(undefined);
  const [selectedSpaceID, setSelectedSpaceID] = useState(undefined);
  const [stationList, setStationList] = useState([]);
  const [filteredStationList, setFilteredStationList] = useState([]);
  const [selectedStation, setSelectedStation] = useState(undefined);
  const [cascaderOptions, setCascaderOptions] = useState(undefined);

  // buttons
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [submitButtonHidden, setSubmitButtonHidden] = useState(true);
  const [spinnerHidden, setSpinnerHidden] = useState(true);
  const [spaceCascaderHidden, setSpaceCascaderHidden] = useState(false);

  //Results
  const [energyStoragePowerStationName, setEnergyStoragePowerStationName] = useState();
  const [energyStoragePowerStationAddress, setEnergyStoragePowerStationAddress] = useState();
  const [energyStoragePowerStationPostalCode, setEnergyStoragePowerStationPostalCode] = useState();
  const [energyStoragePowerStationRatedCapacity, setEnergyStoragePowerStationRatedCapacity] = useState();
  const [energyStoragePowerStationRatedPower, setEnergyStoragePowerStationRatedPower] = useState();
  const [energyStoragePowerStationSVG, setEnergyStoragePowerStationSVG] = useState();


  const [todayChargeEnergyValue, setTodayChargeEnergyValue] = useState();
  const [todayDischargeEnergyValue, setTodayDischargeEnergyValue] = useState();
  const [totalChargeEnergyValue, setTotalChargeEnergyValue] = useState();
  const [totalDischargeEnergyValue, setTotalDischargeEnergyValue] = useState();
  const [totalEfficiency, setTotalEfficiency] = useState();

  const [scheduleXaxisData, setScheduleXaxisData] = useState();
  const [scheduleSeriesName, setScheduleSeriesName] = useState();
  const [scheduleSeriesData, setScheduleSeriesData] = useState();
  const [scheduleMarkAreaData, setScheduleMarkAreaData] = useState();

  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);

  const [PCSParameterLineChartLabels, setPCSParameterLineChartLabels] = useState([]);
  const [PCSParameterLineChartData, setPCSParameterLineChartData] = useState({});
  const [PCSParameterLineChartOptions, setPCSParameterLineChartOptions] = useState([]);

  const [BMSParameterLineChartLabels, setBMSParameterLineChartLabels] = useState([]);
  const [BMSParameterLineChartData, setBMSParameterLineChartData] = useState({});
  const [BMSParameterLineChartOptions, setBMSParameterLineChartOptions] = useState([]);

  useEffect(() => {
    console.log("uuid:");
    console.log(uuid);
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
          console.log(response);
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        })
        .then(json => {
          console.log(json);
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
            setSelectedSpaceID([json[0]].map(o => o.value));
            // get Energy Storage Power Stations by root Space ID
            let isResponseOK = false;
            fetch(APIBaseURL + '/spaces/' + [json[0]].map(o => o.value) + '/energystoragepowerstations', {
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
                  console.log(json);
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
            // end of get Energy Storage Power Stations by root Space ID
          } else {
            toast.error(t(json.description));
          }
        })
        .catch(err => {
          console.log(err);
        });
    } else {
        setSpaceCascaderHidden(true);
        loadData(APIBaseURL + '/reports/energystoragepowerstationdetails?uuid=' + energyStoragePowerStationUUID)
      }
  }, [energyStoragePowerStationUUID]);

  const loadData = url => {
    console.log('url:' + url);
    // disable submit button
    setSubmitButtonDisabled(true);
    // show spinner
    setSpinnerHidden(false);

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
          console.log(json);
          if (uuid !== null && uuid) {
            setFilteredStationList([{ id: json['energy_storage_power_station']['id'], label: json['energy_storage_power_station']['name'] }]);
            setSelectedStation(json['energy_storage_power_station']['id']);
          }
          setEnergyStoragePowerStationName(json['energy_storage_power_station']['name']);
          setEnergyStoragePowerStationAddress(json['energy_storage_power_station']['address']);
          setEnergyStoragePowerStationPostalCode(json['energy_storage_power_station']['postal_code']);
          setEnergyStoragePowerStationRatedCapacity(json['energy_storage_power_station']['rated_capacity']);
          setEnergyStoragePowerStationRatedPower(json['energy_storage_power_station']['rated_power']);
          setEnergyStoragePowerStationSVG({ __html: json['energy_storage_power_station']['svg'] });
          setTodayChargeEnergyValue(json['energy_indicators']['today_charge_energy_value']);
          setTodayDischargeEnergyValue(json['energy_indicators']['today_discharge_energy_value']);
          setTotalChargeEnergyValue(json['energy_indicators']['total_charge_energy_value']);
          setTotalDischargeEnergyValue(json['energy_indicators']['total_discharge_energy_value']);
          if (json['energy_indicators']['total_charge_energy_value'] > 0) {
            setTotalEfficiency((100 * json['energy_indicators']['total_discharge_energy_value'] / json['energy_indicators']['total_charge_energy_value']).toFixed(2))
          } else {
            setTotalEfficiency(0)
          }

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

          // pcs parameters
          timestamps = {};
          json['pcs_parameters']['timestamps'].forEach((currentValue, index) => {
            timestamps['a' + index] = currentValue;
          });
          setPCSParameterLineChartLabels(timestamps);

          values = {};
          json['pcs_parameters']['values'].forEach((currentValue, index) => {
            values['a' + index] = currentValue;
          });
          setPCSParameterLineChartData(values);

          names = [];
          json['pcs_parameters']['names'].forEach((currentValue, index) => {
            names.push({ value: 'a' + index, label: currentValue });
          });
          setPCSParameterLineChartOptions(names);

          // bms parameters
          timestamps = {};
          json['battery_parameters']['timestamps'].forEach((currentValue, index) => {
            timestamps['a' + index] = currentValue;
          });
          setBMSParameterLineChartLabels(timestamps);

          values = {};
          json['battery_parameters']['values'].forEach((currentValue, index) => {
            values['a' + index] = currentValue;
          });
          setBMSParameterLineChartData(values);

          names = [];
          json['battery_parameters']['names'].forEach((currentValue, index) => {
            names.push({ value: 'a' + index, label: currentValue });
          });
          setBMSParameterLineChartOptions(names);

          // enable submit button
          setSubmitButtonDisabled(false);
          // hide spinner
          setSpinnerHidden(true);
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
    setSelectedSpaceID(value[value.length - 1]);

    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + value[value.length - 1] + '/energystoragepowerstations', {
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
          console.log(json);
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
    loadData(APIBaseURL + '/reports/energystoragepowerstationdetails?id=' + selectedStation);
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
          console.log(json);
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
                          <th className="pl-0">今日充电量</th>
                          <th className="pr-0 text-right">{todayChargeEnergyValue} kWh</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0">今日放电量</th>
                          <th className="pr-0 text-right ">{todayDischargeEnergyValue} kWh</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">累计充电量</th>
                          <th className="pr-0 text-right">{totalChargeEnergyValue} kWh</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">累计放电量</th>
                          <th className="pr-0 text-right">{totalDischargeEnergyValue} kWh</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">综合效率</th>
                          <th className="pr-0 text-right">{totalEfficiency}%</th>
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
                          <th className="pl-0">今日成本</th>
                          <th className="pr-0 text-right">0 元</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0">今日收入</th>
                          <th className="pr-0 text-right ">0 元</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">累计成本</th>
                          <th className="pr-0 text-right">0 元</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">累计收入</th>
                          <th className="pr-0 text-right">0 元</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">今日盈利</th>
                          <th className="pr-0 text-right">0 元</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">累计盈利</th>
                          <th className="pr-0 text-right">0 元</th>
                        </tr>
                      </tbody>
                    </Table>
                  </CardBody>
                </Fragment>
              </Card>
            </TabPane>
            {/* <TabPane tabId="3">
              <Card className="mb-3 fs--1">
                <Fragment>
                  <CardBody className="pt-0">
                    <Table borderless className="fs--1 mb-0">
                      <tbody>
                        <tr className="border-bottom">
                          <th className="pl-0">今日充电量</th>
                          <th className="pr-0 text-right">0 kWh</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0">今日放电量</th>
                          <th className="pr-0 text-right ">0 kWh</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">累计充电量</th>
                          <th className="pr-0 text-right">0 kWh</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">累计放电量</th>
                          <th className="pr-0 text-right">0 kWh</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">综合效率</th>
                          <th className="pr-0 text-right">0%</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">放电达成率</th>
                          <th className="pr-0 text-right">0%</th>
                        </tr>
                      </tbody>
                    </Table>
                  </CardBody>
                </Fragment>
              </Card>
            </TabPane> */}
          </TabContent>
        </Col>
        <Col lg="6" className="pr-lg-2" key={uuidv4()}>
          <div dangerouslySetInnerHTML={energyStoragePowerStationSVG} />
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
                <h6>设备状态</h6>
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={classNames({ active: activeTabRight === '2' })}
                onClick={() => {
                  toggleTabRight('2');
                }}
              >
                <h6>电站信息</h6>
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTabRight}>
            <TabPane tabId="1">
              <Card className="mb-3 fs--1">
                <Fragment>
                  <CardBody className="pt-0">
                    <Table borderless className="fs--1 mb-0">
                      <tbody>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">通信网关</th>
                          <th className="pr-0 text-right">正常</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0">1# PCS</th>
                          <th className="pr-0 text-right">正常</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0">1#电池堆</th>
                          <th className="pr-0 text-right ">正常</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">1#空调</th>
                          <th className="pr-0 text-right">正常</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">1#网关表</th>
                          <th className="pr-0 text-right">正常</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">1#用户表</th>
                          <th className="pr-0 text-right">正常</th>
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
                          <th className="pl-0">{t('Name')}</th>
                          <th className="pr-0 text-right">{energyStoragePowerStationName}</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0">{t('Address')}</th>
                          <th className="pr-0 text-right ">{energyStoragePowerStationAddress}</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Postal Code')}</th>
                          <th className="pr-0 text-right">{energyStoragePowerStationPostalCode}</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Rated Capacity')} </th>
                          <th className="pr-0 text-right">{energyStoragePowerStationRatedCapacity} kW</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Rated Power')} </th>
                          <th className="pr-0 text-right">{energyStoragePowerStationRatedPower} kW</th>
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
              toggleTabBottom('1');
            }}
          >
            <h6>{t('Operating Characteristic Curve')}</h6>
          </NavLink>
        </NavItem>
        <NavItem className="cursor-pointer">
          <NavLink
            className={classNames({ active: activeTabBottom === '2' })}
            onClick={() => {
              toggleTabBottom('2');
            }}
          >
            <h6>{t('Strategy Management')}</h6>
          </NavLink>
        </NavItem>
        <NavItem className="cursor-pointer">
          <NavLink
            className={classNames({ active: activeTabBottom === '3' })}
            onClick={() => {
              toggleTabBottom('3');
            }}
          >
            <h6>{t('Fault Alarms')}</h6>
          </NavLink>
        </NavItem>

        <NavItem className="cursor-pointer">
          <NavLink
            className={classNames({ active: activeTabBottom === '4' })}
            onClick={() => {
              toggleTabBottom('4');
            }}
          >
            <h6>PCS</h6>
          </NavLink>
        </NavItem>

        <NavItem className="cursor-pointer">
          <NavLink
            className={classNames({ active: activeTabBottom === '5' })}
            onClick={() => {
              toggleTabBottom('5');
            }}
          >
            <h6>BMS</h6>
          </NavLink>
        </NavItem>

        <NavItem className="cursor-pointer">
          <NavLink
            className={classNames({ active: activeTabBottom === '6' })}
            onClick={() => {
              toggleTabBottom('6');
            }}
          >
            <h6>电表</h6>
          </NavLink>
        </NavItem>

        <NavItem className="cursor-pointer">
          <NavLink
            className={classNames({ active: activeTabBottom === '7' })}
            onClick={() => {
              toggleTabBottom('7');
            }}
          >
            <h6>空调</h6>
          </NavLink>
        </NavItem>

        <NavItem className="cursor-pointer">
          <NavLink
            className={classNames({ active: activeTabBottom === '8' })}
            onClick={() => {
              toggleTabBottom('8');
            }}
          >
            <h6>消防</h6>
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
          <Card className="mb-3 fs--1">
            <CardBody className="bg-light">
              <SectionLineChart
                xaxisData={scheduleXaxisData}
                seriesName={scheduleSeriesName}
                seriesData={scheduleSeriesData}
                markAreaData={scheduleMarkAreaData}
              />
            </CardBody>
          </Card>
        </TabPane>
        <TabPane tabId="3">
          <Card className="mb-3 fs--1">
            <CardBody className="bg-light">
              <Table striped className="border-bottom">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>主题</th>
                    <th>内容</th>
                    <th>创建时间</th>
                    <th>开始时间</th>
                    <th>结束时间</th>
                    <th>状态</th>
                    <th>更新时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">2</th>
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">3</th>
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                  </tr>
                  <tr>
                    <th scope="row">4</th>
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                  </tr>
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </TabPane>
        <TabPane tabId="4">
          <MultipleLineChart
            reportingTitle=""
            baseTitle=""
            labels={PCSParameterLineChartLabels}
            data={PCSParameterLineChartData}
            options={PCSParameterLineChartOptions}
          />
        </TabPane>
        <TabPane tabId="5">
          <MultipleLineChart
            reportingTitle=""
            baseTitle=""
            labels={BMSParameterLineChartLabels}
            data={BMSParameterLineChartData}
            options={BMSParameterLineChartOptions}
          />

        </TabPane>
        <TabPane tabId="6">

        </TabPane>
        <TabPane tabId="7">

        </TabPane>
        <TabPane tabId="8">

        </TabPane>
      </TabContent>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(EnergyStoragePowerStationDetails));
