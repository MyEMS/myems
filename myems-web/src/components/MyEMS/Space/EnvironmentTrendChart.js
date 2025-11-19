import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import { Line } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import {
  LineController, LineElement, PointElement,
  LinearScale, Title, Tooltip, Legend, CategoryScale
} from 'chart.js';

Chart.register(
  LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Title, Tooltip, Legend
);

const EnvironmentTrendChart = ({ sensorId, sensorName, apiBaseUrl, token, userUuid, isActive }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  const formatTimeLabel = (timestamp) => {
    if (!timestamp) return '';
    return timestamp.substring(11, 16);
  };

  useEffect(() => {
    if (!sensorId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiBaseUrl}/reports/spaceenvironmentmonitor?sensorid=${sensorId}&timerange=24h`,
          {
            method: 'GET',
            headers: {
              'Content-type': 'application/json',
              'User-UUID': userUuid,
              Token: token
            }
          }
        );

        if (!response.ok) throw new Error('Data fetch failed');
        const data = await response.json();

        const datasets = [];
        const colors = ['#36A2EB', '#4BC0C0', '#FF9F40', '#9966FF', '#FF6384', '#00CC99'];

        if (data.energy_value && data.energy_value.values.length > 0) {
          datasets.push({
            label: data.energy_value.name,
            data: data.energy_value.values,
            borderColor: colors[0],
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            borderWidth: 2,
            pointRadius: 1,
            tension: 0.3,
            fill: true
          });
        }

        if (data.parameters && data.parameters.names.length > 0) {
          data.parameters.names.forEach((name, index) => {
            if (data.parameters.values[index].length > 0) {
              datasets.push({
                label: name,
                data: data.parameters.values[index],
                borderColor: colors[(index % colors.length) + 1],
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 1,
                tension: 0.3,
                fill: false
              });
            }
          });
        }

        let labels = [];
        if (data.energy_value && data.energy_value.timestamps.length > 0) {
          labels = data.energy_value.timestamps.map(formatTimeLabel);
        } else if (data.parameters.timestamps[0] && data.parameters.timestamps[0].length > 0) {
          labels = data.parameters.timestamps[0].map(formatTimeLabel);
        }

        if (labels.length > 24) {
          const step = Math.ceil(labels.length / 24);
          const sampledLabels = [];
          const sampledDatasets = datasets.map(() => []);

          labels.forEach((label, i) => {
            if (i % step === 0) {
              sampledLabels.push(label);
              datasets.forEach((_, j) => {
                sampledDatasets[j].push(datasets[j].data[i]);
              });
            }
          });

          setChartData({ labels: sampledLabels, datasets: sampledDatasets.map((data, j) => ({...datasets[j], data})) });
        } else {
          setChartData({ labels, datasets });
        }
      } catch (err) {
        console.error('Trend chart data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sensorId, apiBaseUrl, token, userUuid]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#6c757d',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      },
      title: {
        display: true,
        text: `${sensorName}`,
        color: '#495057',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#6c757d',
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        type: 'category'
      },
      y: {
        ticks: {
          color: '#6c757d'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        beginAtZero: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <Card className={`shadow-sm border ${isActive ? 'border-primary' : ''}`}>
      <CardHeader className="bg-white border-bottom py-3">
        <h5 className="mb-0">{sensorName}</h5>
      </CardHeader>
      <CardBody style={{ height: '400px', padding: '1rem' }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </CardBody>
    </Card>
  );
};

export default EnvironmentTrendChart;