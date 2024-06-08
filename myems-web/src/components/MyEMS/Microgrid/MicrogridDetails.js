import React, { Fragment, useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Col,
  CustomInput,
  CardTitle,
  CardText,
  Form,
  FormGroup,
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
import FalconCardHeader from '../../common/FalconCardHeader';
import MultipleLineChart from '../common/MultipleLineChart';
import SectionLineChart from '../common/SectionLineChart';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { APIBaseURL, settings } from '../../../config';
import useInterval from '../../../hooks/useInterval';
import { useLocation } from 'react-router-dom';
import Datetime from 'react-datetime';
import classNames from 'classnames';

const MicrogridDetails = ({ setRedirect, setRedirectUrl, t }) => {
  const location = useLocation();
  const microgridUUID = location.search.split('=')[1];

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

  //Results

  const [microgridName, setMicrogridName] = useState();
  const [microgridSerialNumber, setMicrogridSerialNumber] = useState();
  const [microgridAddress, setMicrogridAddress] = useState();
  const [microgridPostalCode, setMicrogridPostalCode] = useState();
  const [microgridRatedCapacity, setMicrogridRatedCapacity] = useState();
  const [microgridRatedPower, setMicrogridRatedPower] = useState();
  const [microgridLatitude, setMicrogridLatitude] = useState();
  const [microgridLongitude, setMicrogridLongitude] = useState();
  const [microgridSVG, setMicrogridSVG] = useState();

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

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/microgriddetails?uuid=' + microgridUUID, {
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
          setMicrogridName(json['microgrid']['name']);
          setMicrogridSerialNumber(json['microgrid']['serial_number']);
          setMicrogridAddress(json['microgrid']['address']);
          setMicrogridPostalCode(json['microgrid']['postal_code']);
          setMicrogridRatedCapacity(json['microgrid']['rated_capacity']);
          setMicrogridRatedPower(json['microgrid']['rated_power']);
          setMicrogridLatitude(json['microgrid']['latitude']);
          setMicrogridLongitude(json['microgrid']['longitude']);
          setMicrogridSVG({ __html: json['microgrid']['svg'] });
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

        }
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

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
            <NavItem className="cursor-pointer">
              <NavLink
                className={classNames({ active: activeTabLeft === '3' })}
                onClick={() => {
                  toggleTabLeft('3');
                }}
              >
                <h6>{t('Carbon Indicator')}</h6>
              </NavLink>
            </NavItem>
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
                          <th className="pl-0 pb-0">{t('Total Charge')}</th>
                          <th className="pr-0 text-right">{totalChargeEnergyValue} kWh</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Total Discharge')}</th>
                          <th className="pr-0 text-right">{totalDischargeEnergyValue} kWh</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Efficiency')}</th>
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
                          <th className="pl-0">{t('Today\'s Cost')}</th>
                          <th className="pr-0 text-right">900.00 </th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0">{t('Total Cost')}</th>
                          <th className="pr-0 text-right ">90000.00</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Today\'s Revenue')}</th>
                          <th className="pr-0 text-right">1000.00</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Total Revenue')}</th>
                          <th className="pr-0 text-right">100000.00</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Today\'s Profit')}</th>
                          <th className="pr-0 text-right">100.00</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Total Profit')}</th>
                          <th className="pr-0 text-right">10000.00</th>
                        </tr>
                      </tbody>
                    </Table>
                  </CardBody>
                </Fragment>
              </Card>
            </TabPane>
            <TabPane tabId="3">
              <Card className="mb-3 fs--1">
                <Fragment>
                  <CardBody className="pt-0">
                    <Table borderless className="fs--1 mb-0">
                      <tbody>
                        <tr className="border-bottom">
                          <th className="pl-0">{t('Today\'s Cost')}</th>
                          <th className="pr-0 text-right">900.00 </th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0">{t('Total Cost')}</th>
                          <th className="pr-0 text-right ">90000.00</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Today\'s Revenue')}</th>
                          <th className="pr-0 text-right">1000.00</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Total Revenue')}</th>
                          <th className="pr-0 text-right">100000.00</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Today\'s Profit')}</th>
                          <th className="pr-0 text-right">100.00</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Total Profit')}</th>
                          <th className="pr-0 text-right">10000.00</th>
                        </tr>
                      </tbody>
                    </Table>
                  </CardBody>
                </Fragment>
              </Card>
            </TabPane>
          </TabContent>
        </Col>
        <Col lg="6" className="pr-lg-2" key={uuid()}>
          <div dangerouslySetInnerHTML={microgridSVG} />
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
                 <h6>{t('Devices')}</h6>
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={classNames({ active: activeTabRight === '2' })}
                onClick={() => {
                  toggleTabRight('2');
                }}
              >
                <h6>{t('General')}</h6>
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
                          <th className="pl-0 pb-0">Communication Gateway</th>
                          <th className="pr-0 text-right">Normal</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0">1# PCS</th>
                          <th className="pr-0 text-right">Normal</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0">1# Battery</th>
                          <th className="pr-0 text-right ">Normal</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">1# HVAC</th>
                          <th className="pr-0 text-right">Normal</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">1# Grid Meter</th>
                          <th className="pr-0 text-right">Normal</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">1# Load Meter</th>
                          <th className="pr-0 text-right">Normal</th>
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
                          <th className="pr-0 text-right">{microgridName}</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0">{t('Address')}</th>
                          <th className="pr-0 text-right ">{microgridAddress}</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Postal Code')}</th>
                          <th className="pr-0 text-right">{microgridPostalCode}</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Rated Capacity')} </th>
                          <th className="pr-0 text-right">{microgridRatedCapacity} kWh</th>
                        </tr>
                        <tr className="border-bottom">
                          <th className="pl-0 pb-0">{t('Rated Power')} </th>
                          <th className="pr-0 text-right">{microgridRatedPower} kW</th>
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
            <h6>PV</h6>
          </NavLink>
        </NavItem>

        <NavItem className="cursor-pointer">
          <NavLink
            className={classNames({ active: activeTabBottom === '7' })}
            onClick={() => {
              toggleTabBottom('7');
            }}
          >
            <h6>EV Charger</h6>
          </NavLink>
        </NavItem>

        <NavItem className="cursor-pointer">
          <NavLink
            className={classNames({ active: activeTabBottom === '8' })}
            onClick={() => {
              toggleTabBottom('8');
            }}
          >
            <h6>Heat Pump</h6>
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
                    <th>{t('Subject')}</th>
                    <th>{t('Datetime')}</th>
                    <th>{t('Start Datetime')}</th>
                    <th>{t('End Datetime')}</th>
                    <th>{t('Content')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Update Datetime')}</th>
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
          <Card className="mb-3 fs--1">
            <CardBody className="bg-light">
              <Table striped className="border-bottom">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('Subject')}</th>
                    <th>{t('Datetime')}</th>
                    <th>{t('Start Datetime')}</th>
                    <th>{t('End Datetime')}</th>
                    <th>{t('Content')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Update Datetime')}</th>
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
        <TabPane tabId="5">
          <Card className="mb-3 fs--1">
            <CardBody className="bg-light">
              <Table striped className="border-bottom">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('Subject')}</th>
                    <th>{t('Datetime')}</th>
                    <th>{t('Start Datetime')}</th>
                    <th>{t('End Datetime')}</th>
                    <th>{t('Content')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Update Datetime')}</th>
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
        <TabPane tabId="6">
          <Card className="mb-3 fs--1">
            <CardBody className="bg-light">
              <Table striped className="border-bottom">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('Subject')}</th>
                    <th>{t('Datetime')}</th>
                    <th>{t('Start Datetime')}</th>
                    <th>{t('End Datetime')}</th>
                    <th>{t('Content')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Update Datetime')}</th>
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
        <TabPane tabId="7">
          <Card className="mb-3 fs--1">
            <CardBody className="bg-light">
              <Table striped className="border-bottom">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('Subject')}</th>
                    <th>{t('Datetime')}</th>
                    <th>{t('Start Datetime')}</th>
                    <th>{t('End Datetime')}</th>
                    <th>{t('Content')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Update Datetime')}</th>
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
        <TabPane tabId="8">
          <Card className="mb-3 fs--1">
            <CardBody className="bg-light">
              <Table striped className="border-bottom">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('Subject')}</th>
                    <th>{t('Datetime')}</th>
                    <th>{t('Start Datetime')}</th>
                    <th>{t('End Datetime')}</th>
                    <th>{t('Content')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Update Datetime')}</th>
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
      </TabContent>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(MicrogridDetails));
