import React, { useState, useContext, useEffect, useRef, Fragment } from 'react';
import { rgbaColor, themeColors, isIterableArray } from '../../../helpers/utils';
import { Row, Col, Card, CardBody, CustomInput } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, LogarithmicScale } from 'chart.js';
import AppContext from '../../../context/Context';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, LogarithmicScale);

const StackBarChart = ({ labels, chargeData, dischargeData, periodTypes, chargeLabelPrefix, dischargeLabelPrefix, t }) => {
  // 冷色调：用于充电数据（蓝色、青色、绿色系）
  const chargeColors = ['#2c7be5', '#00d27a', '#27bcfd', '#0ea5e9', '#14b8a6'];
  // 暖色调：用于放电数据（红色、橙色、黄色、粉色系）
  const dischargeColors = ['#ef4444', '#f97316', '#fbbf24', '#ec4899', '#dc2626'];
  const [option, setOption] = useState('a0');
  const { isDark } = useContext(AppContext);
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    datasets: []
  });

  useEffect(() => {
    const chart = chartRef.current;
    let dataArray = [];
    let index = option.substring(1);
    if (chart) {
      const ctx = chart.ctx;
      const gradientFill = isDark
        ? ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
        : ctx.createLinearGradient(0, 0, 0, 250);
      gradientFill.addColorStop(0, isDark ? 'rgba(44,123,229, 0.5)' : 'rgba(255, 255, 255, 0.3)');
      gradientFill.addColorStop(1, isDark ? 'transparent' : 'rgba(255, 255, 255, 0)');
      if (chargeData['subtotals_array'] !== undefined && chargeData['subtotals_array'].length > 0) {
        chargeData['subtotals_array'][index].forEach((item, itemIndex) => {
          const labelPrefix = chargeLabelPrefix || t('Charge UNIT', { UNIT: chargeData['unit'] });
          const stackLabel = chargeLabelPrefix || t('Charge UNIT', { UNIT: chargeData['unit'] });
          dataArray.push({
            label: chargeData['station_names_array'][itemIndex] + ' ' + labelPrefix,
            stack: stackLabel,
            data: item,
            backgroundColor: chargeColors[itemIndex % 5]
          });
        });
      }
      if (dischargeData['subtotals_array'] !== undefined && dischargeData['subtotals_array'].length > 0) {
        dischargeData['subtotals_array'][index].forEach((item, itemIndex) => {
          const labelPrefix = dischargeLabelPrefix || t('Discharge UNIT', { UNIT: dischargeData['unit'] });
          const stackLabel = dischargeLabelPrefix || t('Discharge UNIT', { UNIT: dischargeData['unit'] });
          dataArray.push({
            label:
              dischargeData['station_names_array'][itemIndex] +
              ' ' +
              labelPrefix,
            stack: stackLabel,
            data: item,
            backgroundColor: dischargeColors[itemIndex % 5]
          });
        });
      }
      setChartData({
        labels: labels[index],
        datasets: dataArray
      });
    }
  }, [labels, chargeData, dischargeData, option, chargeLabelPrefix, dischargeLabelPrefix, t, isDark]);

  const options = {
    scales: {
      x: {
        display: true,
        ticks: {
          fontColor: rgbaColor('#fff', 0.8),
          fontStyle: 600,
          color: isDark ? themeColors.light : themeColors.dark
        },
        stacked: true
      },
      y: {
        display: true,
        gridLines: {
          color: rgbaColor('#000', 0.1)
        },
        ticks: {
          color: isDark ? themeColors.light : themeColors.dark
        },
        stacked: true
      }
    },
    plugins: {
      legend: {
        display: true
      }
    },
    interaction: {
      intersect: false,
      mode: 'x'
    }
  };

  return (
    <Fragment>
      <Card className="mb-3">
        <CardBody className="rounded-soft">
          <Row className="text-white align-items-center no-gutters">
            <Col>
              <h4 className="text-lightSlateGray mb-0" />
            </Col>
            {isIterableArray(periodTypes) && (
              <Col xs="auto" className="d-none d-sm-block">
                <CustomInput
                  id="ddd"
                  type="select"
                  bsSize="sm"
                  className="mb-3 shadow"
                  value={option}
                  onChange={({ target }) => {
                    setOption(target.value);
                  }}
                >
                  {periodTypes.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </CustomInput>
              </Col>
            )}
          </Row>
          <Bar ref={chartRef} data={chartData} width={160} height={80} options={options} />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default withTranslation()(StackBarChart);
