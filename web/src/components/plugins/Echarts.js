import React, { Fragment, useContext } from 'react';
import { Button, Card, CardBody, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import AppContext from '../../context/Context';
import { themeColors, getPosition, getGrays, rgbaColor } from '../../helpers/utils';

const EchartCode = `function echartBarExample() {
    const data = [6000, 10000, 7500, 4000, 3500, 5500, 6000];
    const yMax = Math.max(...data);
    const dataBackground = data.map(() => yMax);

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
  
  return  (
    <ReactEchartsCore
      echarts={echarts}
      option={getOption(data, dataBackground, isDark)}
      style={{ width: '90%', height: '10rem' }}
    />
  )
}`;
const lineChartCode = `function linechartExample(){
      const totalOrderData= [15000, 43400];

      const getOption = (totalOrderData, isDark) => {
        const grays = getGrays(isDark);
        return {
          tooltip: {
            triggerOn: 'mousemove',
            trigger: 'axis',
            padding: [7, 10],
            formatter: '{b0}: {c0}',
            backgroundColor: grays.white,
            borderColor: grays['300'],
            borderWidth: 1,
            transitionDuration: 0,
            position(pos, params, dom, rect, size) {
              return getPosition(pos, params, dom, rect, size);
            },
            textStyle: { color: themeColors.dark }
          },
          xAxis: {
            type: 'category',
            data: ['Week 4', 'Week 5'],
            boundaryGap: false,
            splitLine: { show: false },
            axisLine: {
              show: false,
              lineStyle: {
                color: grays['300'],
                type: 'dashed'
              }
            },
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
            axisPointer: { show: false }
          },
          series: [
            {
              type: 'line',
              lineStyle: {
                color: themeColors.primary,
                width: 3
              },
              itemStyle: {
                color: grays['100'],
                borderColor: themeColors.primary,
                borderWidth: 2
              },
              hoverAnimation: true,
              data: totalOrderData,
              connectNulls: true,
              smooth: 0.6,
              smoothMonotone: 'x',
              symbol: 'circle',
              symbolSize: 8,
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
                      color: rgbaColor(themeColors.primary, 0.25)
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
          grid: { bottom: '2%', top: '0%', right: '10px', left: '10px' }
        };
      };
      return (
        <ReactEchartsCore
          echarts={echarts}
          option={getOption(totalOrderData, isDark)}
          style={{ width: '90%', height: '10rem' }}
        />
      )
};`;
const Echarts = () => {
  const { isDark } = useContext(AppContext);

  return (
    <Fragment>
      <PageHeader
        title="Echarts"
        description="A Declarative Framework for Rapid Construction of Web-based Visualization"
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://echarts.apache.org/en/index.html"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          Echarts Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Row noGutters className="overflow-hidden">
        <Col lg={6} className="pr-lg-2 overflow-hidden">
          <Card className="overflow-hiddem">
            <FalconCardHeader title="Bar chart" />
            <CardBody className=" overflow-hidden">
              <p className="pb-4 font-weight-bold">Weekly Sales</p>
              <FalconEditor
                code={EchartCode}
                scope={{ echarts, ReactEchartsCore, isDark, getGrays, themeColors, getPosition }}
                language="jsx"
              />
            </CardBody>
          </Card>
        </Col>
        <Col lg={6} className="mt-6 mt-lg-0 pl-lg-2 overflow-hidden">
          <Card className="overflow-hiddem">
            <FalconCardHeader title="Line chart" />
            <CardBody className="overflow-hidden">
              <p className="pb-4 font-weight-bold">Total Order</p>
              <FalconEditor
                code={lineChartCode}
                scope={{
                  echarts,
                  ReactEchartsCore,
                  isDark,
                  getGrays,
                  themeColors,
                  getPosition,
                  rgbaColor
                }}
                language="jsx"
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
      {/* <Card className="overflow-hidden">
        <FalconCardHeader title="Bar chart" />
        <CardBody>
          
        </CardBody>
      </Card> */}
    </Fragment>
  );
};

export default Echarts;
