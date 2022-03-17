import React from 'react';
import ReactEcharts from './react-echart/index';

const Demo1 = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line'
    }
  ]
};

export default function EchartGraph() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <ReactEcharts option={Demo1} notMerge={true} lazyUpdate={true} onChartReady={() => console.log('Chart Ready')} />
    </div>
  );
}
