import React, { useState, useContext, useEffect, useRef } from 'react';
import { rgbaColor, themeColors } from '../../../helpers/utils';
import { Card, CardBody } from 'reactstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
} from 'chart.js';
import AppContext from '../../../context/Context';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
);

const BarChart = ({
  labels,
  data,
  compareData,
  title,
  compareTitle,
  footnote,
  footunit,
}) => {

  const { isDark } = useContext(AppContext);
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    datasets: [{
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    }]
  });

  useEffect(() => {
    const chart = chartRef.current;
    let dataArray = [];
    let datasets = [];
    if (chart) {
      const ctx = chart.ctx;
      const gradientFill = isDark
        ? ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
        : ctx.createLinearGradient(0, 0, 0, 250);
      gradientFill.addColorStop(0, isDark ? 'rgba(44,123,229, 0.5)' : 'rgba(255, 255, 255, 0.3)');
      gradientFill.addColorStop(1, isDark ? 'transparent' : 'rgba(255, 255, 255, 0)');
      data.forEach(element => {
        dataArray.push(element['subtotal']);
      });
      datasets.push({
        label: title,
        backgroundColor: '#2c7be5',
        data: dataArray,
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      });
      dataArray = [];
      compareData.forEach(element => {
        dataArray.push(element['subtotal']);
      });
      datasets.push({
        label: compareTitle,
        backgroundColor: '#27bcfd',
        data: dataArray,
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      });
      setChartData({
        labels: labels,
        datasets: datasets
      });
    }
  }, [data, compareData]);

  const config = {
    options: {
      scales: {
        x: {
          display: true,
          ticks: {
            fontColor: rgbaColor('#fff', 0.8),
            fontStyle: 600,
            color: isDark ? themeColors.light : themeColors.dark
          },
        },
        y: {
          display: true,
          gridLines: {
            color: rgbaColor('#000', 0.1)
          },
          type: 'logarithmic',
          ticks: {
            color: isDark ? themeColors.light : themeColors.dark
          }
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              let arr = {};
              if (tooltipItem.dataset.label === title) {
                arr = data[tooltipItem.dataIndex];
              } else {
                arr = compareData[tooltipItem.dataIndex];
              }
              return tooltipItem.dataset.label + ': ' + arr.name + ' ' + arr.subtotal + arr.unit;
            },
            footer: function(tooltipItem) {
              let arr = {};
              if (tooltipItem[0].dataset.label === title) {
                arr = data[tooltipItem[0].dataIndex];
              } else {
                arr = compareData[tooltipItem[0].dataIndex];
              }
              let rate = arr['increment_rate'] ? arr['increment_rate'] + '\n' : '';
              let perUnit_area = Math.round((arr['subtotal_per_unit_area'] + Number.EPSILON) * 100) / 100;
              return rate + footnote + perUnit_area + ': ' + arr['unit'] + footunit;
            }
          }
        },
      }
    }
  };
  return (
    <Card className="mb-3 overflow-hidden">
      <CardBody className="position-relative">
        <Bar ref={chartRef} data={chartData} width={160} height={50}  options={config.options} />
      </CardBody>
    </Card>
  );
};

export default BarChart;