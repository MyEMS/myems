import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import FalconCardHeader from '../common/FalconCardHeader';
import CardDropdown from './CardDropdown';
import { Button, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import Flex from '../common/Flex';
import echarts from 'echarts/lib/echarts';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import { getPosition, getGrays } from '../../helpers/utils';
import AppContext from '../../context/Context';

import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';

const getOption = (data, colors, isDark) => {
  const grays = getGrays(isDark);
  return {
    dataset: { source: data },
    tooltip: {
      trigger: 'item',
      padding: [7, 10],
      backgroundColor: grays.white,
      borderColor: grays['300'],
      borderWidth: 1,
      textStyle: { color: grays.dark },
      transitionDuration: 0,
      position(pos, params, dom, rect, size) {
        return getPosition(pos, params, dom, rect, size);
      },
      formatter: function(params) {
        return `<div class="font-weight-semi-bold">${params.seriesName}</div><div class="fs--1 text-600">
        <strong>${params.name}:</strong> ${params.value[params.componentIndex + 1]}
      </div>`;
      }
    },
    legend: {
      data: data[0].slice(1),
      left: 'left',
      itemWidth: 10,
      itemHeight: 10,
      borderRadius: 0,
      icon: 'circle',
      inactiveColor: grays['500'],
      textStyle: { color: grays['1100'] }
    },
    xAxis: {
      type: 'category',
      axisLabel: { color: grays['400'] },
      axisLine: {
        lineStyle: {
          color: grays['300'],
          type: 'dashed'
        }
      },
      axisTick: false,
      boundaryGap: true
    },
    yAxis: {
      axisPointer: { type: 'none' },
      axisTick: 'none',
      splitLine: {
        lineStyle: {
          color: grays['300'],
          type: 'dashed'
        }
      },
      axisLine: { show: false },
      axisLabel: { color: grays['400'] }
    },
    series: data[0].slice(1).map((value, index) => ({
      type: 'bar',
      barWidth: '12%',
      barGap: '30%',
      label: { normal: { show: false } },
      z: 10,
      itemStyle: {
        normal: {
          barBorderRadius: [10, 10, 0, 0],
          color: colors[index]
        }
      }
    })),
    grid: { right: '0', left: '30px', bottom: '10%', top: '20%' }
  };
};

const TopProducts = ({ data, colors, className }) => {
  const { isDark } = useContext(AppContext);

  return (
    <Card className={className}>
      <FalconCardHeader title="Top Products" titleTag="h6" className="py-2">
        <Flex>
          <Button color="link" size="sm" tag={Link} className="mr-2" to="#!">
            View Details
          </Button>
          <CardDropdown />
        </Flex>
      </FalconCardHeader>
      <CardBody className="h-100">
        <ReactEchartsCore
          echarts={echarts}
          option={getOption(data, colors, isDark)}
          style={{ minHeight: '18.75rem' }}
        />
      </CardBody>
    </Card>
  );
};

TopProducts.propTypes = {
  data: PropTypes.array.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string
};

export default TopProducts;
