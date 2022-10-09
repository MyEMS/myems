import React, { useState, useContext, useEffect, useRef } from 'react';
import { Row, Col, Card, CardBody, CustomInput } from 'reactstrap';
import { rgbaColor, themeColors, isIterableArray } from '../../../helpers/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { withTranslation } from 'react-i18next';
import { Chart } from 'react-chartjs-2';
import AppContext from '../../../context/Context';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend
);

const ConsumptionBarChart = ({
  reportingTitle,
  baseTitle,
  reportingLabels,
  baseLabels,
  reportingData,
  baseData,
  options,
  t
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
            label: baseTitle,
            data: baseData[option],
            backgroundColor: '#4463b6',
            stack: "base",
            tension: 0.4,
          },{
            label: reportingTitle,
            data: reportingData[option],
            backgroundColor: '#e87637',
            stack: "reporting",
            tension: 0.4,
          }],
        labels: reportingLabels[selectedLabel],
      };
      setLineData(chartData);
    }
  }, [baseData, reportingData, option, baseLabels, reportingLabels]);

  const config = {
    options: {
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
            xPadding: 20,
            yPadding: 10,
            displayColors: false,
            callbacks: {
            title: function(context){
                if (context[0].datasetIndex) {
                    return `${reportingLabels[selectedLabel][context[0].dataIndex]}`;
                } else {
                    return `${baseLabels[selectedLabel][context[0].dataIndex]}`;
                }
            },    
            label: function(context){
                if (context.datasetIndex) {
                    return `${t('Reporting Period Consumption CATEGORY VALUE UNIT', { 'CATEGORY': options[0].label, 'VALUE': context.raw, 'UNIT': null })}`;
                } else {
                    return `${t('Base Period Consumption CATEGORY VALUE UNIT', { 'CATEGORY': options[0].label, 'VALUE': context.raw, 'UNIT': null })}`;
                }
            }
            }
        },
      },
      interaction: {
        intersect: false,
        mode: 'x',
        },
      scales: {
        x: {
            display: true,
            ticks: {
                fontColor: rgbaColor('#fff', 0.8),
                fontStyle: 600,
                color: isDark ? themeColors.light : themeColors.dark
            },
            stacked: true,
        },
        y: {
            display: true,
            gridLines: {
                color: rgbaColor('#000', 0.1)
            },
            ticks: {
                color: isDark ? themeColors.light : themeColors.dark
            },
            stacked: true,
        },
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
                onChange={({ target }) => {setOption(target.value); setSelectedLabel(target.value); chartRef.current.update();}}
              >
                {options.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
              </CustomInput>
            </Col>
          }
        </Row>
        <Chart ref={chartRef} type="bar" data={lineData} options={config.options} width={1618} height={375} />
      </CardBody> 
    </Card>
  );
};

export default withTranslation()(ConsumptionBarChart);

