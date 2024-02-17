import React, { Component } from 'react';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import {v4 as uuid} from 'uuid';
import { APIBaseURL } from '../../../config';
import { getCookieValue } from '../../../helpers/utils';
import { toast } from 'react-toastify';


const dividerBorder = '1px solid rgba(255, 255, 255, 0.15)';
const listItemBorderColor = 'rgba(255, 255, 255, 0.05)';


class RealtimeData extends Component {
  _isMounted = false;
  refreshInterval;
  refreshTimeout;
  state = {
    trendLog: [],
    currentEnergyValue: undefined,
    energyValuePointName: undefined,
    pointList: [],
  };

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.refreshInterval);
    clearTimeout(this.refreshTimeout);
  }

  componentDidMount() {
    this._isMounted = true;
    const { t } = this.props;
    // fetch meter realtime data at the first time
    let isResponseOK = false;
    fetch(APIBaseURL + '/reports/spaceenvironmentmonitor?sensorid=' + this.props.sensorId, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null,

    }).then(response => {
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
    }).then(json => {
      if (isResponseOK) {
        let length = json['energy_value']['values'].length;
        let trendLog = length > 60 ? json['energy_value']['values'].slice(length - 60, length)
            : json['energy_value']['values'];
        let currentEnergyValue = undefined;
        let energyValuePointName = json['energy_value']['name'];
        let pointList = [];
        if (trendLog.length > 0) {
          currentEnergyValue = trendLog[trendLog.length - 1];
        }
        json['parameters']['names'].forEach((currentName, index) => {
          let pointItem = {}
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
            currentEnergyValue: currentEnergyValue,
            energyValuePointName: energyValuePointName,
            pointList: pointList,
          });
        }
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });

    //fetch meter realtime data at regular intervals
    this.refreshInterval = setInterval(() => {
      let isResponseOK = false;
      fetch(APIBaseURL + '/reports/spaceenvironmentmonitor?sensorid=' + this.props.sensorId, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          'User-UUID': getCookieValue('user_uuid'),
          Token: getCookieValue('token')
        },
        body: null,

      }).then(response => {
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      }).then(json => {
        if (isResponseOK) {
          let trendLog = json['energy_value']['values'];
          let currentEnergyValue = undefined;
          let energyValuePointName = json['energy_value']['name'];
          let pointList = [];
          if (trendLog.length > 0) {
            currentEnergyValue = trendLog[trendLog.length - 1];
          }
          json['parameters']['names'].forEach((currentName, index) => {
            let pointItem = {}
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
              currentEnergyValue: currentEnergyValue,
              energyValuePointName: energyValuePointName,
              pointList: pointList,
            });
          }
        } else {
          toast.error(t(json.description))
        }
      }).catch(err => {
        console.log(err);
      });
    }, (60 + Math.floor(Math.random() * Math.floor(10))) * 1000); // use random interval to avoid paralels requests
  }

  render() {
    const { t } = this.props;

    return (
      <Card className="mb-3 overflow-hidden" style={{ minWidth: '12rem', maxWidth: '25%' }}>
        <CardHeader className="bg-transparent position-relative">
          <h5>{this.props.sensorName}</h5>
          <div className="real-time-user display-4 font-weight-normal"
           style={{display:!this.state.currentEnergyValue ? "none" : "inline"}}>{this.state.currentEnergyValue}</div>
        </CardHeader>
        <CardBody className="fs--1 position-relative">
          <p className="pb-2" style={{ borderBottom: dividerBorder, display:!this.state.energyValuePointName ? "none" : "inline" }}>
            {t('Trend in the last hour of Energy Value Point')} {this.state.energyValuePointName}
          </p>
          <ListGroup flush className="mt-4">
            <ListGroupItem
              className="bg-transparent d-flex justify-content-between px-0 py-1 font-weight-semi-bold border-top-0"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">{t('Operating Characteristic Curve')}</p>
              <p className="mb-0">{t('Realtime Value')}</p>
            </ListGroupItem>
            {this.state.pointList.map(pointItem => (
              <ListGroupItem key={uuid()}
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

export default  withTranslation()(RealtimeData);
