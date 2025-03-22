import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Badge, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import Flex from '../../common/Flex';
import classNames from 'classnames';
import AppContext, { ProductContext } from '../../../context/Context';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from "echarts"
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
        barWidth: '5px',
        itemStyle: {
          color: themeColors.primary,
        },
        data: values,
        emphasis: { itemStyle: { color: themeColors.primary } },
        z: 10
      }
    ],
    grid: { right: 5, left: 5, top: 0, bottom: 0 }
  };
};

const PhotovoltaicPowerStationListItem = ({
  id,
  uuid,
  files,
  name,
  address,
  postal_code,
  photovoltaicPowerPointValue,
  alarms,
  isOnline,
  invertorRunState,
  times,
  values,
  index,
  t
}) => {
  const { isDark } = useContext(AppContext);

  return (
    <Col xs={12} className={classNames('p-3', { 'bg-100': isDark && index % 2 !== 0 })}>
      <div className="p-1">
        <Row>
          <Col sm={5} md={4}>
            <div className="position-relative h-sm-100">
              <Link className="d-block h-100" to={`/singlephotovoltaicpowerstation/details?uuid=${uuid}`} target="_blank">
                <img
                  alt=""
                  className="img-fluid fit-cover w-sm-100 h-sm-100 rounded absolute-sm-centered"
                  src={files[0]['src']}
                />
              </Link>
              {isOnline && (
                <Badge color="success" pill className="position-absolute t-0 r-0 mr-2 mt-2 fs--2 z-index-2">
                  {invertorRunState === 'Running'
                    ? t('Invertor Running')
                    : invertorRunState === 'Initializing'
                    ? t('Invertor Initializing')
                    : invertorRunState === 'Standby'
                    ? t('Invertor Standby')
                    : invertorRunState === 'Shutdown'
                    ? t('Invertor Shutdown')
                    : invertorRunState === 'Fault'
                    ? t('Invertor Fault')
                    : t('Invertor Unknown')}
                </Badge>
              )}
            </div>
          </Col>
          <Col sm={7} md={8}>
            <Row>
              <Col lg={7}>
                <h5 className="mt-3 mt-sm-0">
                  <Link to={`/singlephotovoltaicpowerstation/details?uuid=${uuid}`} target="_blank">
                    {name}
                  </Link>
                </h5>
                <p className="fs--1 mb-2 mb-md-3">{address}</p>
                <p className="fs--1 mb-2 mb-md-3">{t("Today's Generation")}:{values.reduce(function (x, y) {return x + y; }, 0).toFixed(2)} kWh</p>
              </Col>
              <Col lg={5} tag={Flex} justify="between" column>
                <div>
                  <p className="fs--1 mb-1">
                    {t('Communication Status')}:{' '}
                    <strong className={classNames({ 'text-success': isOnline, 'text-danger': !isOnline })}>
                      {isOnline ? t('Communication Online') : t('Communication Offline')}
                    </strong>
                  </p>
                  <p className="fs--1 mb-1">
                    {t('Invertor Run State')}:{' '}
                    <strong
                      className={classNames({
                        'text-success': invertorRunState === 'Running',
                        'text-danger':
                          invertorRunState === 'Unknown' ||
                          invertorRunState === 'Initializing' ||
                          invertorRunState === 'Standby' ||
                          invertorRunState === 'Shutdown' ||
                          invertorRunState === 'Fault'
                      })}
                    >
                      {invertorRunState === 'Running'
                        ? t('Invertor Running')
                        : invertorRunState === 'Initializing'
                        ? t('Invertor Initializing')
                        : invertorRunState === 'Standby'
                        ? t('Invertor Standby')
                        : invertorRunState === 'Shutdown'
                        ? t('Invertor Shutdown')
                        : invertorRunState === 'Fault'
                        ? t('Invertor Fault')
                        : t('Invertor Unknown')}
                    </strong>
                  </p>
                  <ReactEchartsCore
                  echarts={echarts}
                  option={getOption(times, values, isDark)}
                  style={{ width: '100%', height: '100%' }}
                />
                </div>

              </Col>
            </Row>
          </Col>
        </Row>

      </div>
    </Col>
  );
};

PhotovoltaicPowerStationListItem.propTypes = {
  name: PropTypes.string.isRequired,
  files: PropTypes.array,
  address: PropTypes.string,
  postal_code: PropTypes.string,
  photovoltaicPowerPointValue: PropTypes.number,
  alarms: PropTypes.array,
  isOnline: PropTypes.bool,
  invertorRunState: PropTypes.string,
  times: PropTypes.array,
  values: PropTypes.array,
};

PhotovoltaicPowerStationListItem.defaultProps = { isOnline: false, files: [] };

export default withTranslation()(PhotovoltaicPowerStationListItem);
