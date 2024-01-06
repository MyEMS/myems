import React, { useState, useContext, useEffect, useRef } from 'react';
import { Row, Col, Card, CardBody, CustomInput } from 'reactstrap';
import { rgbaColor, themeColors, isIterableArray } from '../../../helpers/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import AppContext from '../../../context/Context';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const LineChart = ({
  reportingTitle,
  baseTitle,
  labels,
  data,
  options
}) => {
  const [selectedLabel, setSelectedLabel] = useState('a0');
  const [option, setOption] = useState('a0');
  const { isDark } = useContext(AppContext);
  const chartRef = useRef(null);
  const [lineData, setLineData] = useState({
    datasets: [],
  });
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      const ctx = chart.ctx;
      const gradientFill = isDark
        ? ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
        : ctx.createLinearGradient(0, 0, 0, 250);
      gradientFill.addColorStop(0, isDark ? 'rgba(44,123,229, 0.5)' : 'rgba(255, 255, 255, 0.3)');
      gradientFill.addColorStop(1, isDark ? 'transparent' : 'rgba(255, 255, 255, 0)');

      const chartData = {
        datasets: [{
            borderWidth: 2,
            data: data[option],
            borderColor: rgbaColor(isDark ? themeColors.primary : '#000', 0.8),
            backgroundColor: gradientFill,
            tension: 0.4,
          }],
        labels: labels[selectedLabel],
      };
      setLineData(chartData);
    }
  }, [data, option, labels]);

  const config = {
    options: {
      plugins: {
        legend: {
          display: false,
        }
      },
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
        y: {
          display: true,
          gridLines: {
            color: rgbaColor('#000', 0.1)
          }
        },
      },
      tooltips: {
        mode: 'x-axis',
        xPadding: 20,
        yPadding: 10,
        displayColors: false,
        callbacks: {
          label: tooltipItem => `${labels[selectedLabel][tooltipItem.index]} - ${tooltipItem.yLabel}`,
          title: () => null
        }
      },
      hover: { mode: 'label' },
    }
  };

  return (
    <Card className="mb-3">
      <CardBody className="rounded-soft">
        <Row className="text-white align-items-center no-gutters">
          <Col>
            <h6>{reportingTitle}</h6>
            <p className="fs--1 font-weight-semi-bold">
              {baseTitle}
            </p>
          </Col>
          {isIterableArray(options) &&
            <Col xs="auto" className="d-none d-sm-block">
              <CustomInput
                id="ddd"
                type="select"
                bsSize="sm"
                className="mb-3 shadow"
                value={option}
                onChange={({ target }) => {setOption(target.value); setSelectedLabel(target.value);}}
              >
                {options.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
              </CustomInput>
            </Col>
          }
        </Row>
        <Chart ref={chartRef} type="line" data={lineData} options={config.options} width={1618} height={218} />
      </CardBody>
    </Card>
  );
};

export default LineChart;

