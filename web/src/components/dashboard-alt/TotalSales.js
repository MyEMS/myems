import React, { useContext, useState } from 'react';
import { Card, CardBody, CustomInput } from 'reactstrap';
import PropTypes from 'prop-types';
import echarts from 'echarts/lib/echarts';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import { getPosition, getGrays, themeColors, rgbaColor, isIterableArray, capitalize } from '../../helpers/utils';
import CardDropdown from './CardDropdown';
import FalconCardHeader from '../common/FalconCardHeader';
import Flex from '../common/Flex';
import AppContext from '../../context/Context';

import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';

import { totalSalesByMonth } from '../../data/dashboard/topProducts';

function getFormatter(params) {
  const { name, value } = params[0];
  return `${Object.keys(totalSalesByMonth)[0]} ${name}, ${value}`;
}

const getOption = (month, isDark) => {
  const grays = getGrays(isDark);
  return {
    tooltip: {
      trigger: 'axis',
      padding: [7, 10],
      backgroundColor: grays.white,
      borderColor: grays['300'],
      borderWidth: 1,
      textStyle: { color: themeColors.dark },
      formatter(params) {
        return getFormatter(params);
      },
      transitionDuration: 0,
      position(pos, params, dom, rect, size) {
        return getPosition(pos, params, dom, rect, size);
      }
    },
    xAxis: {
      type: 'category',
      data: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25],
      boundaryGap: false,
      axisPointer: {
        lineStyle: {
          color: grays['300'],
          type: 'dashed'
        }
      },
      splitLine: { show: false },
      axisLine: {
        lineStyle: {
          color: rgbaColor('#000', 0.01),
          type: 'dashed'
        }
      },
      axisTick: { show: false },
      axisLabel: {
        color: grays['400'],
        formatter: function(value) {
          return `${capitalize(month.slice(0, 3))} ${value}`;
        },
        margin: 15
      }
    },
    yAxis: {
      type: 'value',
      axisPointer: { show: false },
      splitLine: {
        lineStyle: {
          color: grays['300'],
          type: 'dashed'
        }
      },
      boundaryGap: false,
      axisLabel: {
        show: true,
        color: grays['400'],
        margin: 15
      },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [
      {
        type: 'line',
        data: totalSalesByMonth[month],
        lineStyle: { color: themeColors.primary },
        itemStyle: {
          color: grays['100'],
          borderColor: themeColors.primary,
          borderWidth: 2
        },
        symbol: 'circle',
        symbolSize: 10,
        smooth: false,
        hoverAnimation: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: rgbaColor(themeColors.primary, 0.2)
              },
              {
                offset: 1,
                color: rgbaColor(themeColors.primary, 0)
              }
            ]
          }
        }
      }
    ],
    animationDuration: 90000,
    grid: { right: '28px', left: '40px', bottom: '15%', top: '5%' }
  };
};

const TotalSales = ({ className }) => {
  const { isDark } = useContext(AppContext);
  const [month, setMonth] = useState('january');

  const months = Object.keys(totalSalesByMonth);

  return (
    <Card className={className}>
      <FalconCardHeader title="Total Sales" light={false} titleTag="h6" className="pb-0">
        <Flex>
          <CustomInput
            type="select"
            id="exampleCustomSelect"
            bsSize="sm"
            className="select-month mr-2"
            value={month}
            onChange={({ target }) => setMonth(target.value)}
          >
            {isIterableArray(months) &&
              months.map((month, index) => (
                <option key={index} value={month}>
                  {capitalize(month)}
                </option>
              ))}
          </CustomInput>
          <CardDropdown />
        </Flex>
      </FalconCardHeader>

      <CardBody className="h-100">
        <ReactEchartsCore echarts={echarts} option={getOption(month, isDark)} style={{ minHeight: '18.75rem' }} />
      </CardBody>
    </Card>
  );
};

TotalSales.propTypes = {
  className: PropTypes.string
};

export default TotalSales;
