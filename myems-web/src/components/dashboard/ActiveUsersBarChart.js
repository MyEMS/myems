import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import range from 'lodash/range';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem, CardFooter } from 'reactstrap';
import { rgbaColor } from '../../helpers/utils';
import { activeUserHistory } from '../../data/dashboard/activeUsers';

const dividerBorder = '1px solid rgba(255, 255, 255, 0.15)';
const listItemBorderColor = 'rgba(255, 255, 255, 0.05)';

const chartOptions = {
  legend: { display: false },
  scales: {
    yAxes: [
      {
        display: false,
        stacked: true
      }
    ],
    xAxes: [
      {
        stacked: false,
        ticks: { display: false },
        barPercentage: 0.9,
        categoryPercentage: 1.0,
        gridLines: {
          color: rgbaColor('#fff', 0.1),
          display: false
        }
      }
    ]
  }
};

class ActiveUsersBarChart extends Component {
  _isMounted = false;
  refreshInterval;
  refreshTimeout;
  state = {
    activeUserHistory,
    currentActiveUser: activeUserHistory[activeUserHistory.length - 1],
    chartData: {
      labels: range(1, 26),
      datasets: [
        {
          label: 'Users',
          backgroundColor: rgbaColor('#fff', 0.3),
          data: []
        }
      ]
    }
  };

  simulateActiveUsers = () => {
    this.refreshInterval = setInterval(() => {
      const currentActiveUser = Math.floor(Math.random() * (120 - 60) + 60);
      const activeUserHistory = [...this.state.activeUserHistory];
      activeUserHistory.shift();
      if (this._isMounted) {
        this.setState({ activeUserHistory }, () => {
          this.refreshTimeout = setTimeout(() => {
            const activeUserHistory = [...this.state.activeUserHistory];
            activeUserHistory.push(currentActiveUser);
            if (this._isMounted) {
              this.setState({ activeUserHistory, currentActiveUser });
            }
          }, 500);
        });
      }
    }, 2000);
  };

  componentDidMount() {
    this._isMounted = true;
    this.simulateActiveUsers();
  }

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.refreshInterval);
    clearTimeout(this.refreshTimeout);
  }

  render() {
    const chartData = {
      ...this.state.chartData,
      datasets: [
        {
          ...this.state.chartData.datasets[0],
          data: this.state.activeUserHistory
        }
      ]
    };

    return (
      <Card className="h-100 bg-gradient">
        <CardHeader className="bg-transparent">
          <h5 className="text-white">Active users right now</h5>
          <div className="real-time-user display-1 font-weight-normal text-white">{this.state.currentActiveUser}</div>
        </CardHeader>
        <CardBody className="text-white fs--1">
          <p className="pb-2" style={{ borderBottom: dividerBorder }}>
            Page views per second
          </p>
          <Bar data={chartData} options={chartOptions} width={10} height={4} />
          <ListGroup flush className="mt-4">
            <ListGroupItem
              className="bg-transparent d-flex justify-content-between px-0 py-1 font-weight-semi-bold border-top-0"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">Top Active Pages</p>
              <p className="mb-0">Active Users</p>
            </ListGroupItem>
            <ListGroupItem
              className="bg-transparent d-flex justify-content-between px-0 py-1"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">/bootstrap-themes/</p>
              <p className="mb-0">3</p>
            </ListGroupItem>
            <ListGroupItem
              className="bg-transparent d-flex justify-content-between px-0 py-1"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">/tags/html5/</p>
              <p className="mb-0">3</p>
            </ListGroupItem>
            <ListGroupItem
              className="bg-transparent d-xxl-flex justify-content-between px-0 py-1 d-none"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">/</p>
              <p className="mb-0">2</p>
            </ListGroupItem>
            <ListGroupItem
              className="bg-transparent d-xxl-flex justify-content-between px-0 py-1 d-none"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">/preview/falcon/dashboard/</p>
              <p className="mb-0">2</p>
            </ListGroupItem>
            <ListGroupItem
              className="bg-transparent d-flex justify-content-between px-0 py-1"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">/100-best-themes...all-time/</p>
              <p className="mb-0">1</p>
            </ListGroupItem>
          </ListGroup>
        </CardBody>
        <CardFooter className="text-right bg-transparent" style={{ borderTop: dividerBorder }}>
          <Link className="text-white" to="#!">
            Real-time report
            <FontAwesomeIcon icon="chevron-right" transform="down-1" className="ml-1 fs--1" />
          </Link>
        </CardFooter>
      </Card>
    );
  }
}

export default ActiveUsersBarChart;
