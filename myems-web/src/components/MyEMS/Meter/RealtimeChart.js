import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import range from 'lodash/range';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import { rgbaColor,handleAPIError  } from '../../../helpers/utils';
import { withTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { APIBaseURL } from '../../../config';
import { getCookieValue, floatFormatter } from '../../../helpers/utils';
import { toast } from 'react-toastify';
import withRedirect from '../../../hoc/withRedirect';
const dividerBorder = '1px solid rgba(255, 255, 255, 0.15)';
const listItemBorderColor = 'rgba(255, 255, 255, 0.05)';

const chartOptions = {
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      display: true,
      stacked: false
    },
    x: {
      stacked: false,
      ticks: {
        display: true,
        maxTicksLimit: 10,
        callback: function(value, index, values) {
          const timeStr = this.chart.data.labels[index];
          if (timeStr) {
            const match = timeStr.match(/\d{2}:\d{2}:\d{2}/);
            return match ? match[0] : '';
          }
          return '';
        }
      },
      categoryPercentage: 1.0,
      gridLines: {
        color: rgbaColor('#fff', 0.1),
        display: true
      }
    }
  }
};

class RealtimeChart extends Component {
  _isMounted = false;
  refreshInterval;
  refreshTimeout;
  state = {
    trendLog: [],
    timestamps: [],
    currentEnergyValue: undefined,
    energyValuePointName: undefined,
    chartData: {
      labels: [],
      datasets: [
        {
          label: '',
          backgroundColor: rgbaColor('#fff', 0.3)
        }
      ]
    },
    pointList: []
  };

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.refreshInterval);
    clearTimeout(this.refreshTimeout);
  }

  componentDidMount() {
    this._isMounted = true;
    const { t, setRedirect, setRedirectUrl  } = this.props;
    // fetch meter realtime data at the first time
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/meterrealtime?meterid=' + this.props.meterId, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {

          let length = json['energy_value']['values'].length;
          let trendLog =
            length > 60 ? json['energy_value']['values'].slice(length - 60, length) : json['energy_value']['values'];
          let timestamps =
            length > 60 ? json['energy_value']['timestamps'].slice(length - 60, length) : json['energy_value']['timestamps'];
          let currentEnergyValue = undefined;
          let energyValuePointName = json['energy_value']['name'];
          let pointList = [];
          let chartData = Object.assign(this.state.chartData);
          chartData.labels = timestamps;
          if (trendLog.length > 0) {
            currentEnergyValue = trendLog[trendLog.length - 1];
          }
          json['parameters']['names'].forEach((currentName, index) => {
            let pointItem = {};
            pointItem['name'] = currentName;
            pointItem['value'] = undefined;
            let currentValues = json['parameters']['values'][index];
            if (currentValues.length > 0) {
              pointItem['value'] = currentValues[currentValues.length - 1];
            }
            pointList.push(pointItem);
          });
          if (this._isMounted) {
            this.setState({
              chartData: chartData,
              trendLog: trendLog,
              timestamps: timestamps,
              currentEnergyValue: currentEnergyValue ? floatFormatter(parseFloat(currentEnergyValue).toFixed(3)) : '',
              energyValuePointName: energyValuePointName,
              pointList: pointList
            });
          }
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
        }
      })
      .catch(err => {
        console.log(err);
      });

    //fetch meter realtime data at regular intervals
    this.refreshInterval = setInterval(() => {
      let isResponseOK = false;
      fetch(APIBaseURL + '/reports/meterrealtime?meterid=' + this.props.meterId, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': getCookieValue('user_uuid'),
          Token: getCookieValue('token')
        },
        body: null
      })
        .then(response => {
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
        })
        .then(json => {
          if (isResponseOK) {

            let trendLog = json['energy_value']['values'];
            let timestamps = json['energy_value']['timestamps'];
            let currentEnergyValue = undefined;
            let energyValuePointName = json['energy_value']['name'];
            let pointList = [];
            if (trendLog.length > 0) {
              currentEnergyValue = trendLog[trendLog.length - 1];
            }
            json['parameters']['names'].forEach((currentName, index) => {
              let pointItem = {};
              pointItem['name'] = currentName;
              pointItem['value'] = undefined;
              let currentValues = json['parameters']['values'][index];
              if (currentValues.length > 0) {
                pointItem['value'] = currentValues[currentValues.length - 1];
              }
              pointList.push(pointItem);
            });
            if (this._isMounted) {
              this.setState({
                trendLog: trendLog,
                timestamps: timestamps,
                currentEnergyValue: currentEnergyValue ? floatFormatter(parseFloat(currentEnergyValue).toFixed(3)) : '',
                energyValuePointName: energyValuePointName,
                pointList: pointList
              });
            }
          } else {
            handleAPIError(json, setRedirect, setRedirectUrl, t, toast)
          }
        })
        .catch(err => {
          console.log(err);
        });
    }, (60 + Math.floor(Math.random() * Math.floor(10))) * 1000); // use random interval to avoid paralels requests
  }

  render() {
    const { t } = this.props;
    const chartData = {
      ...this.state.chartData,
      labels: this.state.timestamps,
      datasets: [
        {
          ...this.state.chartData.datasets[0],
          data: this.state.trendLog
        }
      ]
    };

    return (
      <Card className="h-100 bg-gradient">
        <CardHeader className="bg-transparent">
          <h5 className="text-white">{this.props.meterName}</h5>
          <div className="real-time-user display-4 font-weight-normal text-white">{this.state.currentEnergyValue}</div>
        </CardHeader>
        <CardBody className="text-white fs--1">
          <p className="pb-2" style={{ borderBottom: dividerBorder }}>
            {t('Trend in the last hour of Energy Value Point')} {this.state.energyValuePointName}
          </p>
          <Line data={chartData} options={chartOptions} width={10} height={4} />
          <ListGroup flush className="mt-4">
            <ListGroupItem
              className="bg-transparent d-flex justify-content-between px-0 py-1 font-weight-semi-bold border-top-0"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">{t('Point')}</p>
              <p className="mb-0">{t('Realtime Value')}</p>
            </ListGroupItem>
            {this.state.pointList.map(pointItem => (
              <ListGroupItem
                key={uuid()}
                className="bg-transparent d-flex justify-content-between px-0 py-1"
                style={{ borderColor: listItemBorderColor }}
              >
                <p className="mb-0">{pointItem['name']}</p>
                <p className="mb-0">{pointItem['value']}</p>
              </ListGroupItem>
            ))}
          </ListGroup>
        </CardBody>
      </Card>
    );
  }
}

export default withTranslation()(withRedirect(RealtimeChart));
