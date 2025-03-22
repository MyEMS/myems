import React from 'react';

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

const SectionLineChart = ({ xaxisData, seriesName, seriesData, markAreaData}) => {

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
        data: xaxisData
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
          name: seriesName,
          type: 'line',
          smooth: false,
          step: 'step',
          data: seriesData,
          markArea: {
            itemStyle: {
              color: 'rgba(255, 173, 177, 0.4)'
            },
            data: markAreaData
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
