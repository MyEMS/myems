import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Badge, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import Flex from '../../common/Flex';
import classNames from 'classnames';
import AppContext, { ProductContext } from '../../../context/Context';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts';
import { themeColors, getPosition, numberFormatter, getGrays } from '../../../helpers/utils';
import { withTranslation } from 'react-i18next';

const getOption = (times, values, isDark) => {
  const grays = getGrays(isDark);
  return {
    tooltip: {
      trigger: 'axis',
      padding: [7, 10],
      formatter: '{b0}: {c0} kWh',
      backgroundColor: grays.white,
      borderColor: grays['300'],
      borderWidth: 1,
      textStyle: { color: themeColors.dark },
      transitionDuration: 0,
      position(pos, params, dom, rect, size) {
        return getPosition(pos, params, dom, rect, size);
      }
    },
    xAxis: {
      type: 'category',
      data: times,
      boundaryGap: false,
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      axisPointer: { type: 'none' }
    },
    yAxis: {
      type: 'value',
      splitLine: { show: false },
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      axisPointer: { type: 'none' }
    },
    series: [
      {
        type: 'line',
        itemStyle: {
          color: themeColors.primary
        },
        data: values,
        emphasis: { itemStyle: { color: themeColors.primary } },
        z: 10
      }
    ],
    grid: { right: 5, left: 5, top: 0, bottom: 0 }
  };
};

const EnergyStoragePowerStationListItem = ({
  id,
  uuid,
  files,
  name,
  address,
  commissioningDate,
  batteryOperatingState,
  batterySocPointValue,
  batteryPowerPointValue,
  alarms,
  isOnline,
  PCSRunState,
  chargeTimes,
  chargeValues,
  todayTotalCharge,
  dischargeTimes,
  dischargeValues,
  todayTotalDischarge,
  index,
  t
}) => {
  const { isDark } = useContext(AppContext);

  return (
    <Col xs={12} className={classNames('p-3', { 'bg-100': isDark && index % 2 !== 0 })}>
      <div className="p-1">
        <Row>
          <Col sm={4} md={4}>
            <div className="position-relative h-sm-100">
              <Link
                className="d-block h-100"
                to={`/singleenergystoragepowerstation/details?uuid=${uuid}`}
                target="_blank"
              >
                <img
                  alt=""
                  className="img-fluid fit-cover w-sm-100 h-sm-100 rounded absolute-sm-centered"
                  src={files[0]['src']}
                />
              </Link>
              <Badge color="success" pill className="position-absolute t-0 r-0 mr-2 mt-2 fs--2 z-index-2">
                  { !isOnline ? t('Communication Offline') :
                    PCSRunState === 'Running'
                    ? t('PCS Running')
                    : PCSRunState === 'Initializing'
                    ? t('PCS Initializing')
                    : PCSRunState === 'Standby'
                    ? t('PCS Standby')
                    : PCSRunState === 'Shutdown'
                    ? t('PCS Shutdown')
                    : PCSRunState === 'Fault'
                    ? t('PCS Fault')
                    : PCSRunState}
              </Badge>
            </div>
          </Col>
          <Col sm={8} md={8}>
            <Row>
              <Col lg={6}>
                <h5 className="mt-3 mt-sm-0">
                  <Link to={`/singleenergystoragepowerstation/details?uuid=${uuid}`} target="_blank">
                    {name}
                  </Link>
                </h5>
                <p className="fs--1 mb-1">{address}</p>
                <p className="fs--1 mb-1">
                  {t('Commissioning Date')}:{commissioningDate}
                </p>
                <p className="fs--1 mb-1">
                  {t('Battery Power')}:<strong>{batteryPowerPointValue} kW</strong>
                </p>
                <p className="fs--1 mb-1">
                  {t("Today's Charge")}:<strong>{todayTotalCharge} kWh</strong>
                  <ReactEchartsCore
                    echarts={echarts}
                    option={getOption(chargeTimes, chargeValues, isDark)}
                    style={{ width: '100%', height: '50%' }}
                  />
                </p>
              </Col>
              <Col lg={6} tag={Flex} justify="between" column>
                <div>
                  <h4 className="fs-1 fs-md-2 text-warning mb-0">SoC: {batterySocPointValue} %</h4>
                  <p className="fs--1 mb-1">
                    {t('Communication Status')}:{' '}
                    <strong className={classNames({ 'text-success': isOnline, 'text-danger': !isOnline })}>
                      {isOnline ? t('Communication Online') : t('Communication Offline')}
                    </strong>
                  </p>
                  <p className="fs--1 mb-1">
                    {t('Battery Operating State')}:{' '}
                    <strong
                      className={classNames({
                        'text-success':
                          batteryOperatingState === 'Normal' ||
                          batteryOperatingState === 'Standby' ||
                          batteryOperatingState === 'ProhibitDisCharging' ||
                          batteryOperatingState === 'ProhibitCharging',
                        'text-danger':
                          batteryOperatingState === 'Unknown' ||
                          batteryOperatingState === 'Fault' ||
                          batteryOperatingState === 'Warning'
                      })}
                    >
                      {!isOnline ? t('Battery Unknown') :
                        batteryOperatingState === 'Normal'
                        ? t('Battery Normal')
                        : batteryOperatingState === 'Standby'
                        ? t('Battery Standby')
                        : batteryOperatingState === 'ProhibitDisCharging'
                        ? t('Battery Prohibit DisCharging')
                        : batteryOperatingState === 'ProhibitCharging'
                        ? t('Battery Prohibit Charging')
                        : batteryOperatingState === 'Fault'
                        ? t('Battery Fault')
                        : batteryOperatingState === 'Warning'
                        ? t('Battery Warning')
                        : batteryOperatingState === 'Charging'
                        ? t('Battery Charging')
                        : batteryOperatingState === 'Discharging'
                        ? t('Battery Discharging')
                        : batteryOperatingState === 'Idle'
                        ? t('Battery Idle')
                        : batteryOperatingState === 'Reserved'
                        ? t('Battery Reserved')
                        : batteryOperatingState}
                    </strong>
                  </p>
                  <p className="fs--1 mb-1">
                    {t('PCS Run State')}:{' '}
                    <strong
                      className={classNames({
                        'text-success': PCSRunState === 'Running',
                        'text-danger':
                          PCSRunState === 'Unknown' ||
                          PCSRunState === 'Initializing' ||
                          PCSRunState === 'Standby' ||
                          PCSRunState === 'Shutdown' ||
                          PCSRunState === 'Fault'
                      })}
                    >
                      {!isOnline ? t('PCS Unknown') :
                        PCSRunState === 'Running'
                        ? t('PCS Running')
                        : PCSRunState === 'Initializing'
                        ? t('PCS Initializing')
                        : PCSRunState === 'Standby'
                        ? t('PCS Standby')
                        : PCSRunState === 'Shutdown'
                        ? t('PCS Shutdown')
                        : PCSRunState === 'Fault'
                        ? t('PCS Fault')
                        : PCSRunState}
                    </strong>
                  </p>
                  <p className="fs--1 mb-1">
                    {t("Today's Discharge")}:<strong>{todayTotalDischarge} kWh</strong>
                    <ReactEchartsCore
                      echarts={echarts}
                      option={getOption(dischargeTimes, dischargeValues, isDark)}
                      style={{ width: '100%', height: '50%' }}
                    />
                  </p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

EnergyStoragePowerStationListItem.propTypes = {
  name: PropTypes.string.isRequired,
  files: PropTypes.array,
  address: PropTypes.string,
  batteryOperatingState: PropTypes.string,
  batterySocPointValue: PropTypes.number,
  batteryPowerPointValue: PropTypes.number,
  photovoltaicPowerPointValue: PropTypes.number,
  loadPowerPointValue: PropTypes.number,
  gridPowerPointValue: PropTypes.number,
  alarms: PropTypes.array,
  isOnline: PropTypes.bool,
  PCSRunState: PropTypes.string,
  chargeTimes: PropTypes.array,
  chargeValues: PropTypes.array,
  todayTotalCharge: PropTypes.number,
  dischargeTimes: PropTypes.array,
  dischargeValues: PropTypes.array,
  todayTotalDischarge: PropTypes.number
};

EnergyStoragePowerStationListItem.defaultProps = { isOnline: false, files: [] };

export default withTranslation()(EnergyStoragePowerStationListItem);
