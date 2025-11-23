import React, { Component } from 'react';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { Line } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import {
  LineController, LineElement, PointElement,
  LinearScale, Title, Tooltip, Legend, CategoryScale
} from 'chart.js';
import { APIBaseURL } from '../../../config';
import { getCookieValue } from '../../../helpers/utils';
import { toast } from 'react-toastify';

Chart.register(
  LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Title, Tooltip, Legend
);

const dividerBorder = '1px solid rgba(0, 0, 0, 0.05)';
const listItemBorderColor = 'rgba(0, 0, 0, 0.05)';

class RealtimeData extends Component {
  _isMounted = false;
  refreshInterval;
  state = {
    pointList: [],
    trendData: {}
  };

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.refreshInterval);
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchData();

    this.refreshInterval = setInterval(() => {
      this.fetchData();
    }, (60 + Math.floor(Math.random() * Math.floor(10))) * 1000);
  }

  fetchData = async () => {
    try {
      const response = await fetch(
        `${APIBaseURL}/reports/spaceenvironmentmonitor?sensorid=${this.props.sensorId}&timerange=24h`,
        {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'User-UUID': getCookieValue('user_uuid'),
            'Token': getCookieValue('token')
          }
        }
      );

      if (!response.ok) throw new Error('Data fetch failed');
      const json = await response.json();

      const pointList = [];
      const trendData = {};

      if (json['energy_value']) {
        pointList.push({
          name: json['energy_value'].name,
          value: json['energy_value'].values.length > 0
            ? json['energy_value'].values[json['energy_value'].values.length - 1]
            : undefined
        });
        trendData[json['energy_value'].name] = {
          values: json['energy_value'].values,
          timestamps: json['energy_value'].timestamps.map(ts => ts.substring(11, 16))
        };
      }

      json['parameters']['names'].forEach((name, index) => {
        const values = json['parameters']['values'][index];
        const timestamps = json['parameters']['timestamps'][index].map(ts => ts.substring(11, 16));

        pointList.push({
          name,
          value: values.length > 0 ? values[values.length - 1] : undefined
        });

        trendData[name] = { values, timestamps };
      });

      if (this._isMounted) {
        this.setState({ pointList, trendData });
      }
    } catch (err) {
      console.error('Realtime data fetch error:', err);
      toast.error(this.props.t(err.message || 'Data fetch failed'));
    }
  };

  sampleData = (data, maxPoints = 24) => {
    if (data.length <= maxPoints) return data;

    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  };

  renderTrendChart = (name, data) => {
    const colors = ['#36A2EB', '#4BC0C0', '#FF9F40', '#9966FF', '#FF6384', '#00CC99'];
    const colorIndex = Object.keys(this.state.trendData).indexOf(name) % colors.length;

    const sampledValues = this.sampleData(data.values, 24);
    const sampledTimestamps = this.sampleData(data.timestamps, 24);

    return (
      <Line
        data={{
          labels: sampledTimestamps,
          datasets: [{
            label: name,
            data: sampledValues,
            borderColor: colors[colorIndex],
            backgroundColor: `${colors[colorIndex]}20`,
            borderWidth: 2,
            pointRadius: 1.5,
            pointHoverRadius: 3,
            tension: 0.4,
            fill: true
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              titleFont: { size: 10 },
              bodyFont: { size: 10 }
            }
          },
          scales: {
            x: {
              display: false
            },
            y: {
              display: false,
              beginAtZero: false
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        }}
        height={50}
      />
    );
  };

  render() {
    const { t, isActive, onClick } = this.props;

    return (
      <Card
        className={`h-100 shadow-sm cursor-pointer ${isActive ? 'border-primary' : 'border-light'}`}
        onClick={onClick}
      >
        <CardHeader className="bg-white border-bottom py-3">
          <h6 className="mb-0">{this.props.sensorName}</h6>
        </CardHeader>
        <CardBody className="p-2">
          <ListGroup flush className="mt-1">
            <ListGroupItem
              className="bg-transparent font-weight-bold border-top-0 py-1"
              style={{ borderColor: listItemBorderColor }}
            >
              <div className="d-flex justify-content-between">
                <span className="text-muted">{t('Point')}</span>
                <span className="text-muted">{t('Value')}</span>
              </div>
            </ListGroupItem>
            {this.state.pointList.map((item, index) => (
              <ListGroupItem
                key={uuid()}
                className="bg-transparent d-flex flex-column justify-content-between py-1"
                style={{ borderColor: listItemBorderColor }}
              >
                <div className="d-flex justify-content-between align-items-center mb-0">
                  <span>{item.name}</span>
                  <span className="font-weight-bold text-primary">{item.value}</span>
                </div>
                {this.state.trendData[item.name] && (
                  <div className="mt-0">
                    {this.renderTrendChart(item.name, this.state.trendData[item.name])}
                  </div>
                )}
              </ListGroupItem>
            ))}
          </ListGroup>
        </CardBody>
      </Card>
    );
  }
}

export default withTranslation()(RealtimeData);