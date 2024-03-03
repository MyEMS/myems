import React, { Component, useEffect, useState } from 'react';
import * as echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/markPoint';
import 'echarts/lib/component/grid';
import 'echarts/lib/component/dataZoom';

export const Charts = props => {
  const pointid = props.pointid;
  const pointname = props.pointname;
  const namewithid = pointname + ' ( ID: ' + pointid + ' )';
  const optionData = props.data;
  const id = 'default-id';

  useEffect(() => {
    if (optionData.timeArr === undefined) {
      optionData.timeArr = [];
      optionData.valueArr = [];
    } else {
      optionData.timeArr = optionData['timeArr'].map(time => {
        return time.replace('T', ' ').replace('Z', '');
      });
      optionData.valueArr = optionData['valueArr'];
    }
    console.log('optionData in charts:' + optionData);
    console.log('pointname in charts:' + pointname);

    const option = {
      textStyle: {
        color: 'rgb(255,255,255,0.9)'
      },
      title: {
        text: namewithid,
        x: 'center',
        textStyle: {
          color: 'rgb(255,255,255,0.9)'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        top: 20,
        right: 50,
        data: ['value'],
        textStyle: {
          color: 'rgb(255,255,255,0.9)'
        }
      },
      xAxis: {
        data: optionData['timeArr']
      },
      yAxis: {
        type: 'value'
      },
      dataZoom: [
        {
          type: 'slider',
          start: 90,
          end: 100
        }
      ],
      series: [
        {
          type: 'line',
          data: optionData['valueArr']
        }
      ]
    };
    const chart = echarts.init(document.getElementById(id));
    chart.clear();
    chart.setOption(option);
  }, []);

  return <div id={id} style={{ height: '500px', marginTop: '30px' }} />;
};
export default Charts;
