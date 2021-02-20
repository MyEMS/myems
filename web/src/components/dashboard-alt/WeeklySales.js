import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Card, CardBody, Col, Row, UncontrolledTooltip } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import Flex from '../common/Flex';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import { themeColors, getPosition, numberFormatter, getGrays } from '../../helpers/utils';

import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import AppContext from '../../context/Context';

const getOption = (data, dataBackground, isDark) => {
  const grays = getGrays(isDark);
  return {
    tooltip: {
      trigger: 'axis',
      padding: [7, 10],
      formatter: '{b1}: {c1}',
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
      data: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
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
        type: 'bar',
        barWidth: '5px',
        barGap: '-100%',
        itemStyle: {
          color: grays['200'],
          barBorderRadius: 10
        },
        data: dataBackground,
        animation: false,
        emphasis: { itemStyle: { color: grays['200'] } }
      },
      {
        type: 'bar',
        barWidth: '5px',
        itemStyle: {
          color: themeColors.primary,
          barBorderRadius: 10
        },
        data: data,
        emphasis: { itemStyle: { color: themeColors.primary } },
        z: 10
      }
    ],
    grid: { right: 5, left: 10, top: 0, bottom: 0 }
  };
};

const WeeklySales = ({ data }) => {
  const { currency, isDark } = useContext(AppContext);
  const total = data.reduce((total, currentValue) => total + currentValue, 0);
  // Max value of data
  const yMax = Math.max(...data);
  const dataBackground = data.map(() => yMax);

  return (
    <Card className="h-md-100">
      <FalconCardHeader
        className="pb-0"
        title={
          <Fragment>
            Weekly Sales{' '}
            <FontAwesomeIcon
              icon={['far', 'question-circle']}
              transform="shrink-1"
              className="text-400"
              id="weeklySalesTooltip"
            />
            <UncontrolledTooltip placement="bottom" target="weeklySalesTooltip">
              Calculated according to last week's sales
            </UncontrolledTooltip>
          </Fragment>
        }
        light={false}
        titleTag="h6"
      />
      <CardBody tag={Flex} align="end">
        <Row className="flex-grow-1">
          <Col>
            <div className="fs-4 font-weight-normal text-sans-serif text-700 line-height-1 mb-1">
              {currency}
              {numberFormatter(total, 0)}
            </div>
            <Badge pill color="soft-success" className="fs--2">
              +3.5%
            </Badge>
          </Col>
          <Col xs="auto" className="pl-0">
            <ReactEchartsCore
              echarts={echarts}
              option={getOption(data, dataBackground, isDark)}
              style={{ width: '8.5rem', height: '100%' }}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

WeeklySales.propTypes = { data: PropTypes.array.isRequired };

export default WeeklySales;
