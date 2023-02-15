import React, { useState, useContext, useEffect, useRef } from 'react';
import { Row, Col, Card, CardBody, CustomInput } from 'reactstrap';
import { rgbaColor, themeColors, isIterableArray } from '../../../helpers/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  LineController,
  BarController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import AppContext from '../../../context/Context';
import {withTranslation} from "react-i18next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  LineController,
  BarController,
);

const MixedLineChart = ({
  reportingTitle,
  baseTitle,
  labels,
  data,
  options,
  t
}) => {
  const [selectedLabel, setSelectedLabel] = useState('a0');
  const [option, setOption] = useState('0');
  const { isDark } = useContext(AppContext);
  const chartRef = useRef(null);
  const [lineData, setLineData] = useState({
    datasets: [],
  });
  const actual = t('Actual');
  const baseline = t('Baseline');
  const saving = t('Baseline Value - Actual Value');
  useEffect(() => {
    const chart = chartRef.current;
    let label = '';
    if (chart) {
      const ctx = chart.ctx;
      const gradientFill = isDark
        ? ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
        : ctx.createLinearGradient(0, 0, 0, 250);
      gradientFill.addColorStop(0, isDark ? 'rgba(44,123,229, 0.5)' : 'rgba(255, 255, 255, 0.3)');
      gradientFill.addColorStop(1, isDark ? 'transparent' : 'rgba(255, 255, 255, 0)');
      if (options && options.length > 0) {
        label = options[option].label;
      }
      const chartData = {
        datasets: [
          {
            borderWidth: 2,
            data: data['a0'],
            label: label + actual,
            borderColor: rgbaColor(isDark ? themeColors.primary : '#000', 0.8),
            backgroundColor: gradientFill,
            tension: 0.4,
            type: 'line',
          },
          {
            borderWidth: 2,
            data: data['b0'],
            label: label + baseline,
            borderColor: rgbaColor(isDark ? themeColors.primary : '#000', 0.8),
            backgroundColor: gradientFill,
            tension: 0.4,
            type: 'line',
          },
          {
            borderWidth: 2,
            data: data['c0'],
            label: label + saving,
            borderColor: rgbaColor(isDark ? themeColors.primary : '#000', 0.8),
            backgroundColor: rgbaColor(isDark ? themeColors.primary : '#000', 0.2),
            tension: 0.4,
          }
        ],
        labels: labels[selectedLabel],
      };
      setLineData(chartData);
    }
  }, [data, option, labels, options]);

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
      },
      hover: { mode: 'label' },
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
          {isIterableArray(options) &&
            <Col xs="auto" className="d-none d-sm-block">
              <CustomInput
                id="ddd"
                type="select"
                bsSize="sm"
                className="mb-3 shadow"
                value={option}
                onChange={({ target }) => {setOption(target.value.slice(1)); setSelectedLabel(target.value);}}
              >
                {options.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
              </CustomInput>
            </Col>
          }
        </Row>
        <Chart ref={chartRef} data={lineData} options={config.options} width={1618} height={218} type='bar' />
      </CardBody>
    </Card>
  );
};

export default withTranslation()(MixedLineChart);

