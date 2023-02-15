import React, { useState, useContext, useEffect } from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { CheckPicker } from 'rsuite';
import { rgbaColor, themeColors, isIterableArray, getGrays } from '../../../helpers/utils';
import AppContext from '../../../context/Context';
import moment from 'moment';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/lib/echarts';
import { LineChart } from 'echarts/charts';
import { 
  GridComponent,
  ToolboxComponent, 
  DataZoomComponent,
  MarkLineComponent, 
  MarkPointComponent} from 'echarts/components';

echarts.use([
  LineChart, 
  GridComponent, 
  ToolboxComponent, 
  DataZoomComponent, 
  MarkLineComponent, 
  MarkPointComponent]);

const MultipleLineChart = ({
  reportingTitle,
  baseTitle,
  labels,
  data,
  options
}) => {
  const colors = ['#2c7be5', '#00d27a', '#27bcfd', '#f5803e', '#e63757'];
  const [values, setValues] = useState(['a0']);
  const [oldValues, setOldValues] = useState(['a0']);
  const { isDark } = useContext(AppContext);
  const [nodes, setNodes] = useState([{
    name: options.label,
    borderWidth: 2,
    data: data['a0'],
    type: 'line',
    markPoint: {
      label:{
        color: rgbaColor(isDark ? '#fff' : '#000', 0.8),
      },
      itemStyle: {
        color: colors[0],
      },
      data: [
        {
          type: 'max',
          name: 'Max Value',
        },
        {
          type: 'min',
          name: 'Min Value',
        }
      ]
    },
    markLine: {
      lineStyle: {
        color: colors[0],
      },
      data: [{
          type: 'average',
          name: 'Average Value'
      }],
      label: {
        color: rgbaColor(isDark ? '#fff' : '#000', 0.8),
      },
    },
  }]);
  const [lastMoment, setLastMoment] = useState(moment());
  const [lineLabels, setLinaLabels] = useState([]);

  let handleChange = (arr) => {
    if (arr.length < 1) {
      return ;
    }
    let currentMoment = moment();
    setOldValues(values);
    setValues(arr);
    setLastMoment(currentMoment);
  }

  useEffect(() => {
    let tempNodes = [...nodes];
    let index = values[0];
    if (options[index.slice(1)] && data[index] && tempNodes.length > 0 && tempNodes[0].label === undefined) {
      tempNodes = [];
      tempNodes[0] = {
        data: data[index],
        type: 'line',
        smooth: true,
        name: options[index.slice(1)] ? options[index.slice(1)].label : '',
        lineStyle: {
          color: colors[0],
        },
        itemStyle: {
          color: colors[0],
        },
        markPoint: {
          data: [
           {
              type: 'max',
              name: 'Max Value',
            },
            {
              type: 'min',
              name: 'Min Value',
            }
          ],
          label:{
            color: rgbaColor(isDark ? '#fff' : '#000', 0.8),
          },
          itemStyle: {
            color: colors[0],
          },
        },
        markLine: {
          lineStyle: {
            color: colors[0],
          },
          data: [{
              type: 'average',
              name: 'Average Value'
          }],
          label: {
            color: rgbaColor(isDark ? '#fff' : '#000', 0.8),
          },
        },
      }
    }
    setNodes(tempNodes);
    setLinaLabels(labels[values[0]]);
    setValues(['a0']);
    setOldValues(['a0'])
  }, [data, labels, options]);

  useEffect(() => {
    let tempNodes = [...nodes];
    if (oldValues.length < values.length) {
      let index = values[values.length - 1];
      tempNodes.push({
        data: data[index],
        type: 'line',
        smooth: true,
        name: options[index.slice(1)].label,
        itemStyle: {
          color: colors[index.slice(1) % 5],
        },
        lineStyle: {
          color: colors[index.slice(1) % 5],
        },
        markPoint: {
          data: [
            {
              type: 'max',
              name: 'Max Value',
            },
            {
              type: 'min',
              name: 'Min Value',
            }
          ],
          label:{
            color: rgbaColor(isDark ? '#fff' : '#000', 0.8),
          },
          itemStyle: {
            color: colors[index.slice(1) % 5],
          },
        },
        markLine: {
          lineStyle: {
            color: colors[index.slice(1) % 5],
          },
          label: {
            color: rgbaColor(isDark ? '#fff' : '#000', 0.8),
          },
          data: [
            {
              type: 'average',
              name: 'Average Value'
            }
          ]
        },
      })
    } else {
      let i = 0
      for (; i <= oldValues.length; i++ ) {
        if (i === values.length || oldValues[i] !== values[i]){
          break;
        }
      }
      tempNodes.splice(i, 1);
    }    
    setNodes(tempNodes);
    setLinaLabels(labels[values[0]]);
  }, [lastMoment]);

  let getOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: getGrays(isDark)[100],
        borderColor: getGrays(isDark)[300],
        textStyle: { color: isDark ? themeColors.light : themeColors.dark },
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: lineLabels ? lineLabels : ['0'],
        axisLabel: {
          interval: 'auto',
          textStyle: {
            color: rgbaColor(isDark ? '#fff' : '#000', 0.8),
          },
          rotate:30  
        },
        axisLine:{
          lineStyle:{
            color: rgbaColor(isDark ? '#fff' : '#000', 0.8),
          }
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {show: false},
        axisLabel: {
          textStyle: {
            color: rgbaColor(isDark ? '#fff' : '#000', 0.8),
          }
        },
        axisLine:{
          lineStyle:{
            color: rgbaColor(isDark ? '#fff' : '#000', 0.8),
          }
        }
      },
      series: nodes,
      toolbox: {
        right: 10,
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
        },
        show: false
      },
      dataZoom: [
        {
         
        }
      ],
    };
  }

  return (
    <Card className="mb-3">
      <CardBody className="rounded-soft">
        <Row className="text-white align-items-center no-gutters">
          <Col>
            <h4 className="text-lightSlateGray mb-0">{reportingTitle}</h4>
            <p className="fs--1 font-weight-semi-bold">
              {baseTitle}
            </p>
          </Col>
          {options[0] && isIterableArray(options) &&
            <Col xs="auto" className="d-none d-sm-block">
              <CheckPicker
                data={options}
                value={values}
                appearance="default"
                placeholder="select"
                searchable={false}
                countable={false}
                onSelect={handleChange}
                style={{ width: 224, borderRadius: '.25rem'}}
                />
            </Col>
          }
        </Row>
        <ReactEchartsCore
            echarts={echarts}
            notMerge={true}
            option={getOption()}
            style={{ width: '100%', height: 318 }}
            />
      </CardBody>
    </Card>
  );
};

export default MultipleLineChart;