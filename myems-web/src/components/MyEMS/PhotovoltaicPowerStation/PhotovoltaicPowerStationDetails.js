import React, { Fragment, useState, useEffect, useContext } from 'react';
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
import { getCookieValue, createCookie, checkEmpty,handleApiError } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { APIBaseURL, settings } from '../../../config';
import useInterval from '../../../hooks/useInterval';
import { useLocation } from 'react-router-dom';
import AppContext from '../../../context/Context';
import moment from 'moment';
import { isIterableArray } from '../../../helpers/utils';
import classNames from 'classnames';
import InvertorDetails from './InvertorDetails';
import MeterDetails from './MeterDetails';
import DeviceStatusDetails from './DeviceStatusDetails';
import blankPage from '../../../assets/img/generic/blank-page.png';
import FaultDetails from './FaultDetails';

const PhotovoltaicPowerStationDetails = ({ setRedirect, setRedirectUrl, t }) => {
  const location = useLocation();
  const uuid = location.search.split('=')[1];
  const photovoltaicPowerStationUUID = location.search.split('=')[1];
  const { currency } = useContext(AppContext);

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
  const [photovoltaicPowerStationName, setPhotovoltaicPowerStationName] = useState();
  const [photovoltaicPowerStationAddress, setPhotovoltaicPowerStationAddress] = useState();
  const [photovoltaicPowerStationRatedCapacity, setPhotovoltaicPowerStationRatedCapacity] = useState();
  const [photovoltaicPowerStationRatedPower, setPhotovoltaicPowerStationRatedPower] = useState();
  const [photovoltaicPowerStationSVG, setPhotovoltaicPowerStationSVG] = useState();
  const [gatewayStatus, setGatewayStatus] = useState();
  const [invertorStatus, setInvertorStatus] = useState();
  const [gridMeterStatus, setGridMeterStatus] = useState();
  const [loadMeterStatus, setLoadMeterStatus] = useState();

  const [todayGenerationEnergyValue, setTodayGenerationEnergyValue] = useState();
  const [totalGenerationEnergyValue, setTotalGenerationEnergyValue] = useState();
  const [totalEfficiency, setTotalEfficiency] = useState();

  const [todayGenerationRevenueValue, setTodayGenerationRevenueValue] = useState();
  const [totalGenerationRevenueValue, setTotalGenerationRevenueValue] = useState();

  const [parameterLineChartLabels, setParameterLineChartLabels] = useState([]);
  const [parameterLineChartData, setParameterLineChartData] = useState({});
  const [parameterLineChartOptions, setParameterLineChartOptions] = useState([]);

  const [faultDetailsList, setFaultDetailsList] = useState([]);
  const [InvertorDetailsList, setInvertorDetailsList] = useState([]);
  const [meterDetailsList, setMeterDetailsList] = useState([]);

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
            let selectedSpaceID = [json[0]].map(o => o.value);
            // get Photovoltaic  Power Stations by root Space ID
            let isResponseOK = false;
            fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/photovoltaicpowerstations', {
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
                  if (handleApiError(json, setRedirect, setRedirectUrl, t, toast)) {return;}
                }
              })
              .catch(err => {
                console.log(err);
              });
            // end of get Photovoltaic  Power Stations by root Space ID
          } else {
            if (handleApiError(json, setRedirect, setRedirectUrl, t, toast)) {return;}
          }
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      setSpaceCascaderHidden(true);
      loadData(APIBaseURL + '/reports/photovoltaicpowerstationdetails?uuid=' + photovoltaicPowerStationUUID);
    }
  }, [photovoltaicPowerStationUUID]);

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
            setFilteredStationList([
              { id: json['photovoltaic_power_station']['id'], label: json['photovoltaic_power_station']['name'] }
            ]);
            setSelectedStation(json['photovoltaic_power_station']['id']);
          }
          setPhotovoltaicPowerStationName(json['photovoltaic_power_station']['name']);
          setPhotovoltaicPowerStationAddress(json['photovoltaic_power_station']['address']);
          setPhotovoltaicPowerStationRatedCapacity(json['photovoltaic_power_station']['rated_capacity']);
          setPhotovoltaicPowerStationRatedPower(json['photovoltaic_power_station']['rated_power']);
          setPhotovoltaicPowerStationSVG({ __html: json['photovoltaic_power_station']['svg'] });

          if (json['energy_indicators']['today_generation_energy_value'] !== null) {
            setTodayGenerationEnergyValue(json['energy_indicators']['today_generation_energy_value'].toFixed(3));
          }
          if (json['energy_indicators']['total_generation_energy_value'] !== null) {
            setTotalGenerationEnergyValue(json['energy_indicators']['total_generation_energy_value'].toFixed(3));
          }

          if (json['energy_indicators']['performance_ratio'] != null) {
            setTotalEfficiency(json['energy_indicators']['performance_ratio'].toFixed(2));
          } else {
            setTotalEfficiency(0);
          }

          if (json['revenue_indicators']['today_generation_revenue_value'] !== null) {
            setTodayGenerationRevenueValue(json['revenue_indicators']['today_generation_revenue_value'].toFixed(2));
          }
          if (json['revenue_indicators']['total_generation_revenue_value'] !== null) {
            setTotalGenerationRevenueValue(json['revenue_indicators']['total_generation_revenue_value'].toFixed(2));
          }

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
          if (handleApiError(json, setRedirect, setRedirectUrl, t, toast)) {return;}
          // enable submit button
          setSubmitButtonDisabled(false);
          // hide spinner
          setSpinnerHidden(true);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  let onSpaceCascaderChange = (value, selectedOptions) => {
    setSelectedSpaceName(selectedOptions.map(o => o.label).join('/'));
    let selectedSpaceID = value[value.length - 1];
    let isResponseOK = false;
    fetch(APIBaseURL + '/spaces/' + selectedSpaceID + '/photovoltaicpowerstations', {
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
          if (handleApiError(json, setRedirect, setRedirectUrl, t, toast)) {return;}
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    loadData(APIBaseURL + '/reports/photovoltaicpowerstationdetails?id=' + selectedStation);
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
    let reportingPeriodDateRange = [
      current_moment
        .clone()
        .subtract(1, 'weeks')
        .toDate(),
      current_moment.toDate()
    ];
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
          if (handleApiError(json, setRedirect, setRedirectUrl, t, toast)) {return;}
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  // Invertor
  const fetchInvertorDetails = () => {
    let url = APIBaseURL + '/reports/photovoltaicpowerstationdetails/' + selectedStation + '/invertor';
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
          setInvertorDetailsList(json);
        } else {
          if (handleApiError(json, setRedirect, setRedirectUrl, t, toast)) {return;}
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  // Meters
  const fetchMetersDetails = () => {
    let url = APIBaseURL + '/reports/photovoltaicpowerstationdetails/' + selectedStation + '/meter';
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
          setMeterDetailsList(json);
        } else {
          if (handleApiError(json, setRedirect, setRedirectUrl, t, toast)) {return;}
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <Fragment>
      <Form onSubmit={handleSubmit}>
        <Row form>
          <Col xs={6} sm={3} hidden={spaceCascaderHidden}>
            <FormGroup className="form-group">
              <Cascader options={cascaderOptions} onChange={onSpaceCascaderChange} changeOnSelect expandTrigger="hover">
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
      <div className="blank-page-image-container" style={{ visibility: resultDataHidden ? 'visible' : 'hidden', display: resultDataHidden ? '' : 'none' }}>
        <img className="img-fluid" src={blankPage} alt="" />
      </div>
      <div style={{ visibility: resultDataHidden ? 'hidden' : 'visible', display: resultDataHidden ? 'none' : '' }}>
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
                            <th className="pl-0">{t("Today's Generation")}</th>
                            <th className="pr-0 text-right">{todayGenerationEnergyValue} kWh</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t('Total Generation')}</th>
                            <th className="pr-0 text-right">{(totalGenerationEnergyValue / 1000.0).toFixed(3)} MWH</th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t('Total Efficiency')} PR</th>
                            <th className="pr-0 text-right">{totalEfficiency}%</th>
                          </tr>
                          {/* <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t("Disgeneration Achievement Rate")}</th>
                            <th className="pr-0 text-right">{ (100 * todayDisgenerationEnergyValue / photovoltaicPowerStationRatedCapacity).toFixed(2)}%</th>
                          </tr> */}
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
                            <th className="pl-0">{t("Today's Income")}</th>
                            <th className="pr-0 text-right ">
                              {todayGenerationRevenueValue} {currency}
                            </th>
                          </tr>
                          <tr className="border-bottom">
                            <th className="pl-0 pb-0">{t('Total Income')}</th>
                            <th className="pr-0 text-right">
                              {totalGenerationRevenueValue} {currency}
                            </th>
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
            <div dangerouslySetInnerHTML={photovoltaicPowerStationSVG} />
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
                  <h6>{t('Basic Information')}</h6>
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTabRight}>
              <TabPane tabId="1">
                <DeviceStatusDetails
                  id={selectedStation}
                  gatewayStatus={gatewayStatus}
                  invertorStatus={invertorStatus}
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
                            <td className="pl-0">{t('Name')}</td>
                            <td className="pr-0 text-right">{photovoltaicPowerStationName}</td>
                          </tr>
                          <tr className="border-bottom">
                            <td className="pl-0">{t('Address')}</td>
                            <td className="pr-0 text-right ">{photovoltaicPowerStationAddress}</td>
                          </tr>
                          <tr className="border-bottom">
                            <td className="pl-0 pb-0">{t('Rated Capacity')} </td>
                            <td className="pr-0 text-right">{photovoltaicPowerStationRatedCapacity} kWh</td>
                          </tr>
                          <tr className="border-bottom">
                            <td className="pl-0 pb-0">{t('Rated Power')} </td>
                            <td className="pr-0 text-right">{photovoltaicPowerStationRatedPower} kWp</td>
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
                fetchFaultDetails();
              }}
            >
              <h6>{t('Fault Alarms')}</h6>
            </NavLink>
          </NavItem>

          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '3' })}
              onClick={() => {
                setActiveTabBottom('3');
                fetchInvertorDetails();
              }}
            >
              <h6>{t('Invertor')}</h6>
            </NavLink>
          </NavItem>

          <NavItem className="cursor-pointer">
            <NavLink
              className={classNames({ active: activeTabBottom === '4' })}
              onClick={() => {
                setActiveTabBottom('4');
                fetchMetersDetails();
              }}
            >
              <h6>{t('Meter')}</h6>
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
                <FaultDetails faults={faultDetailsList} />
              </CardBody>
            </Card>
          </TabPane>
          <TabPane tabId="3">
            {isIterableArray(InvertorDetailsList) &&
              InvertorDetailsList.map(({ id, ...rest }) => <InvertorDetails {...rest} key={id} />)}
          </TabPane>
          <TabPane tabId="4">
            {isIterableArray(meterDetailsList) &&
              meterDetailsList.map(({ id, ...rest }) => <MeterDetails {...rest} key={id} />)}
          </TabPane>
        </TabContent>
      </div>
    </Fragment>
  );
};

export default withTranslation()(withRedirect(PhotovoltaicPowerStationDetails));
