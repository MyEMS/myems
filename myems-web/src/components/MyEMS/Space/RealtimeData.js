import React, { Component } from 'react';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { APIBaseURL } from '../../../config';
import { getCookieValue } from '../../../helpers/utils';
import { toast } from 'react-toastify';

const dividerBorder = '1px solid rgba(0, 0, 0, 0.05)';
const listItemBorderColor = 'rgba(0, 0, 0, 0.05)';

class RealtimeData extends Component {
  _isMounted = false;
  refreshInterval;
  refreshTimeout;
  state = {
    trendLog: [],
    currentEnergyValue: undefined,
    energyValuePointName: undefined,
    pointList: []
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
              currentEnergyValue: currentEnergyValue,
              energyValuePointName: energyValuePointName,
              pointList: pointList
            });
          }
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
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
                currentEnergyValue: currentEnergyValue,
                energyValuePointName: energyValuePointName,
                pointList: pointList
              });
            }
          } else {
            toast.error(t(json.description));
          }
        })
        .catch(err => {
          console.log(err);
        });
    }, (60 + Math.floor(Math.random() * Math.floor(10))) * 1000); // use random interval to avoid paralels requests
  }

  render() {
    const { t, isActive, onClick } = this.props;

    return (
      <Card
        className={`h-100 shadow-sm cursor-pointer ${isActive ? 'border-primary' : 'border-light'}`}
        onClick={onClick}
      >
        <CardHeader className="bg-white border-bottom py-3">
          <h6 className="mb-0">{this.props.sensorName}</h6>
          {this.state.currentEnergyValue && (
            <div className="display-5 font-weight-bold mt-2">
              {this.state.currentEnergyValue}
            </div>
          )}
        </CardHeader>
        <CardBody className="p-3">
          {this.state.energyValuePointName && (
            <p className="pb-2 text-muted small" style={{ borderBottom: dividerBorder }}>
              {t('Trend in the last hour of')} {this.state.energyValuePointName}
            </p>
          )}
          <ListGroup flush className="mt-3">
            <ListGroupItem
              className="bg-transparent d-flex justify-content-between px-0 py-2 font-weight-semibold border-top-0"
              style={{ borderColor: listItemBorderColor }}
            >
              <span className="text-muted">{t('Point')}</span>
              <span className="text-muted">{t('Value')}</span>
            </ListGroupItem>
            {this.state.pointList.map(pointItem => (
              <ListGroupItem
                key={uuid()}
                className="bg-transparent d-flex justify-content-between px-0 py-2"
                style={{ borderColor: listItemBorderColor }}
              >
                <span>{pointItem['name']}</span>
                <span className="font-weight-semibold">{pointItem['value']}</span>
              </ListGroupItem>
            ))}
          </ListGroup>
        </CardBody>
      </Card>
    );
  }
}

export default withTranslation()(RealtimeData);