import React from 'react';
import PropTypes from 'prop-types';
import { getGrays, getPosition, isIterableArray, numberFormatter } from '../../../helpers/utils';
import SharePieItem from './SharePieItem';
import { Card, CardBody, Col, Row } from 'reactstrap';
import * as echarts from 'echarts/lib/echarts';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import { PieChart } from 'echarts/charts';
import { useContext } from 'react';
import AppContext from '../../../context/Context';

echarts.use([PieChart]);
const getOption = (data, isDark) => {
  const grays = getGrays(isDark);
  return {
    color: data.map(d => d.color),
    tooltip: {
      trigger: 'item',
      padding: [7, 10],
      backgroundColor: grays.white,
      textStyle: { color: grays.black },
      transitionDuration: 0,
      borderColor: grays['300'],
      borderWidth: 1,
      formatter: function(params) {
        return `<strong>${params.data.name}:</strong> ${params.value} (${params.percent}%)`;
      }
    },
    position(pos, params, dom, rect, size) {
      return getPosition(pos, params, dom, rect, size);
    },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['100%', '87%'],
        avoidLabelOverlap: false,
        emphasis: {
          scale: false
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: isDark ? '#0E1C2F' : '#fff'
        },
        labelLine: { show: false },
        data: data
      }
    ]
  };
};

const SharePie = ({ data, title }) => {
  const { isDark } = useContext(AppContext);
  const totalShare = data.map(d => d.value).reduce((total, currentValue) => total + currentValue, 0);
  return (
    <Card className="h-md-100">
      <CardBody>
        <Row noGutters className="h-100 justify-content-between">
          <Col xs={5} sm={6} className="col-xxl pr-2">
            <h6 className="mt-1">{title}</h6>
            <div className="fs--2 mt-3">
              {isIterableArray(data) &&
                data.map(({ id, ...rest }) => <SharePieItem {...rest} totalShare={totalShare} key={id} />)}
            </div>
          </Col>
          <Col xs="auto">
            <div className="position-relative">
              <ReactEchartsCore
                echarts={echarts}
                option={getOption(data, isDark)}
                style={{ width: '6.625rem', height: '6.625rem' }}
              />
              <div className="absolute-centered font-weight-medium text-dark fs-2">
                {numberFormatter(totalShare, 0)}
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

SharePie.propTypes = { data: PropTypes.array.isRequired };

export default SharePie;
