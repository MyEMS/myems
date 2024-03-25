import React, { useState, useContext, useEffect } from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { CheckPicker } from 'rsuite';
import { rgbaColor, themeColors, isIterableArray, getGrays } from '../../../helpers/utils';
import AppContext from '../../../context/Context';

import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/lib/echarts';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  MarkAreaComponent
} from 'echarts/components';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  MarkAreaComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition]);

const SectionLineChart = ({ }) => {

  let getOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        // prettier-ignore
        data: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00']
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} kW'
        },
        axisPointer: {
          snap: true
        }
      },
      series: [
        {
          name: '电池功率',
          type: 'line',
          smooth: true,
          // prettier-ignore
          data: [-30, -28, -25, -26, -27, -30, -50, 0, 0, 0, 38, 39, 0, 0, 0, 75, 80, 70, 60, 60, 60, 0, 0, -40, -40],
          markArea: {
            itemStyle: {
              color: 'rgba(255, 173, 177, 0.4)'
            },
            data: [
              [
                {
                  name: '谷',
                  xAxis: '00:00'
                },
                {
                  xAxis: '07:00'
                }
              ],
              [
                {
                  name: '平',
                  xAxis: '07:00'
                },
                {
                  xAxis: '10:00'
                }
              ],
              [
                {
                  name: '峰',
                  xAxis: '10:00'
                },
                {
                  xAxis: '12:00'
                }
              ],
              [
                {
                  name: '平',
                  xAxis: '12:00'
                },
                {
                  xAxis: '15:00'
                }
              ],
              [
                {
                  name: '峰',
                  xAxis: '15:00'
                },
                {
                  xAxis: '21:00'
                }
              ],
              [
                {
                  name: '平',
                  xAxis: '21:00'
                },
                {
                  xAxis: '23:00'
                }
              ],
              [
                {
                  name: '谷',
                  xAxis: '23:00'
                },
                {
                  xAxis: '24:00'
                }
              ]
            ]
          }
        }
      ]
    }
  };

  return (
    <ReactEchartsCore
          echarts={echarts}
          notMerge={true}
          option={getOption()}
        />
  );
};

export default SectionLineChart;
