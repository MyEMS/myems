import React, { useState, useContext, useEffect, useRef } from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { CheckPicker } from 'rsuite';
import { Chart } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { rgbaColor, themeColors, isIterableArray } from '../../../helpers/utils';
import AppContext from '../../../context/Context';
import moment from 'moment';
import { node } from 'prop-types';

ChartJS.register(
  annotationPlugin,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const maxAnnotation1 = {
  type: 'label',
  backgroundColor: 'rgba(245, 245, 245, 0.5)',
  content: (ctx) => 'MAX ' + maxValue(ctx).toFixed(2),
  font: {
    size: 16
  },
  padding: {
    top: 6,
    left: 6,
    right: 6,
    bottom: 6
  },
  position: {
    x: (ctx) => maxIndex(ctx) <= 3 ? 'start' : maxIndex(ctx) >= 10 ? 'end' : 'center',
    y: 'end'
  },
  xValue: (ctx) => maxLabel(ctx),
  yAdjust: 24,
  yValue: (ctx) => maxValue(ctx)
};

function maxValue(ctx) {
  if (ctx.chart.data.datasets.length < 1) {
    return 0.00;
  }
  let max = -9999999999999;
  const dataset = ctx.chart.data.datasets[0];
  dataset.data.forEach(function(el) {
    max = Math.max(max, el);
  });
  return max;
}

function maxIndex(ctx) {
  if (ctx.chart.data.datasets.length < 1) {
    return 0;
  }
  const max = maxValue(ctx);
  const dataset = ctx.chart.data.datasets[0];
  return dataset.data.indexOf(max);
}

function maxLabel(ctx) {
  if (ctx.chart.data.datasets.length < 1) {
    return 0;
  }
  return ctx.chart.data.labels[maxIndex(ctx)];
}

const maxAnnotation2 = {
  type: 'point',
  backgroundColor: 'transparent',
  pointStyle: 'rectRounded',
  radius: 10,
  xValue: (ctx) => maxLabel(ctx),
  yValue: (ctx) => maxValue(ctx)
};

function minValue(ctx) {
  if (ctx.chart.data.datasets.length < 1) {
    return 0.00;
  }
  let min = 999999999999999;
  const dataset = ctx.chart.data.datasets[0];
  dataset.data.forEach(function(el) {
    min = Math.min(min, el);
  });
  return min;
}

function minIndex(ctx) {
  if (ctx.chart.data.datasets.length < 1) {
    return 0;
  }
  const min = minValue(ctx);
  const dataset = ctx.chart.data.datasets[0];
  return dataset.data.indexOf(min);
}

function minLabel(ctx) {
  if (ctx.chart.data.datasets.length < 1) {
    return 0;
  }
  return ctx.chart.data.labels[minIndex(ctx)];
}

const minAnnotation1 = {
  type: 'label',
  backgroundColor: 'rgba(245, 245, 245, 0.5)',
  content: (ctx) => 'MIN ' + minValue(ctx).toFixed(2),
  font: {
    size: 16
  },
  padding: {
    top: 6,
    left: 6,
    right: 6,
    bottom: 6
  },
  position: {
    x: 'start',
    y: 'end'
  },
  xValue: (ctx) => minLabel(ctx),
  yAdjust: -12,
  yValue: (ctx) => minValue(ctx)
};

const minAnnotation2 = {
  type: 'point',
  backgroundColor: 'transparent',
  pointStyle: 'rectRounded',
  radius: 10,
  xValue: (ctx) => minLabel(ctx),
  yValue: (ctx) => minValue(ctx)
};

function average(ctx) {
  if (ctx.chart.data.datasets.length < 1) {
    return 0.00;
  }
  const values = ctx.chart.data.datasets[0].data;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

const annotation = {
  type: 'line',
  borderColor: 'black',
  borderDash: [6, 6],
  borderDashOffset: 0,
  borderWidth: 3,
  label: {
    display: true,
    content: (ctx) => 'Average: ' + average(ctx).toFixed(2),
    position: 'end'
  },
  scaleID: 'y',
  value: (ctx) => average(ctx)
};

const MultipleLineChart = ({
  reportingTitle,
  baseTitle,
  labels,
  data,
  options
}) => {
  const [values, setValues] = useState(['a0']);
  const [oldValues, setOldValues] = useState(['a0']);
  const { isDark } = useContext(AppContext);
  const [nodes, setNodes] = useState([{
    label: options.label,
    borderWidth: 2,
    data: data['a0'],
    borderColor: rgbaColor("#"+((1<<24)*Math.random()|0).toString(16), 0.8),
  }]);
  const [lastMoment, setLastMoment] = useState(moment());
  const chartRef = useRef(null);
  const [lineData, setLineData] = useState({
    datasets: nodes,
  });  

  let handleChange = (arr) => {
    let currentMoment = moment();
    
    setOldValues(values);
    setValues(arr);
    setLastMoment(currentMoment);
    chartRef.current.update();
  }

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      const ctx = chart.ctx;
      const gradientFill = isDark
        ? ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
        : ctx.createLinearGradient(0, 0, 0, 250);
      gradientFill.addColorStop(0, isDark ? 'rgba(44,123,229, 0.5)' : 'rgba(255, 255, 255, 0.3)');
      gradientFill.addColorStop(1, isDark ? 'transparent' : 'rgba(255, 255, 255, 0)');
      let tempNodes = [...nodes];
      if (options[0] && data['a0'] && tempNodes.length > 0 && tempNodes[0].label === undefined) {
        let index = values[0];
        tempNodes[0] = {
          label: options[index.slice(1)].label,
          borderWidth: 2,
          data: data[index],
          borderColor: rgbaColor("#"+((1<<24)*Math.random()|0).toString(16), 0.8),
          tension: 0.4,
        }
      }
      if (oldValues.length < values.length) {
        let index = values[values.length - 1];
        tempNodes.push({
          label: options[index.slice(1)].label,
          borderWidth: 2,
          data: data[index],
          borderColor: rgbaColor("#"+((1<<24)*Math.random()|0).toString(16), 0.8),
          tension: 0.4,
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
      let chartData = {
        datasets: tempNodes,
        labels: labels[values[0]]
      };
      setNodes(tempNodes);
      setLineData(chartData);
    }
  }, [data, labels, values]);

  const config = {
    options: {
      plugins: {
        legend: {
          display: false,
        },
        annotation: {
          annotations: {
            annotation,
            maxAnnotation1,
            maxAnnotation2,
            minAnnotation1,
            minAnnotation2
          }
        }
      },
      hover: { mode: 'label' },
      scales: {
        x: {
            ticks: {
              fontColor: rgbaColor('#789', 0.8),
              fontStyle: 600
            },
            gridLines: {
              color: rgbaColor('#000', 0.1),
              zeroLineColor: rgbaColor('#000', 0.1),
              lineWidth: 1
            }
          },
        y:  {
          display: true,
          gridLines: {
            color: rgbaColor('#000', 0.1)
          }
        }
      }
    }
  };
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
        <Chart type="line" ref={chartRef} data={lineData} options={config.options} width={1618} height={218} />
      </CardBody>
    </Card>
  );
};

export default MultipleLineChart;