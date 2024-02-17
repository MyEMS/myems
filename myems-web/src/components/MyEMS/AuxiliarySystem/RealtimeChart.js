import React, { Component } from 'react';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import {v4 as uuid} from 'uuid';
import { APIBaseURL } from '../../../config';
import { getCookieValue } from '../../../helpers/utils';
import { toast } from 'react-toastify';

const listItemBorderColor = 'rgba(255, 255, 255, 0.05)';

class RealtimeChart extends Component {
  _isMounted = false;
  refreshInterval;
  refreshTimeout;
  state = {
    pointList: [],
  };

  componentWillUnmount() {
    this._isMounted = false;
    clearInterval(this.refreshInterval);
    clearTimeout(this.refreshTimeout);
  }

  componentDidMount() {
    console.log(this.props);
    const { t } = this.props;
    this._isMounted = true;
    // fetch realtime data at the first time
    let isResponseOK = false;
    if (this.props.distributionSystemID != undefined) {
      fetch(
        APIBaseURL +
          '/reports/distributionsystem?distributionsystemid=' +
          this.props.distributionSystemID, {
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
          console.log(json);
          let pointList = [];
            json.forEach((currentCircuit, circuitIndex) => {
              json[circuitIndex]['points'].forEach((currentPoint, pointIndex) => {
                let pointItem = {}
                pointItem['circuit'] = currentCircuit['name'];
                pointItem['point'] = currentPoint['name'];
                pointItem['value'] = currentPoint['value'];
                pointItem['units'] = currentPoint['units'];
                pointList.push(pointItem);
              });
            });
          if (this._isMounted) {
            this.setState({
              pointList: pointList,
            });
          }
        } else {
          toast.error(t(json.description))
        }
      }).catch(err => {
        console.log(err);
      });
    };

    //fetch realtime data at regular intervals
    this.refreshInterval = setInterval(() => {
      let isResponseOK = false;
      if (typeof this.props.distributionSystemID !== 'undefined') {
        fetch(
          APIBaseURL +
            '/reports/distributionsystem?distributionsystemid=' +
            this.props.distributionSystemID, {
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
            console.log(json);
            let pointList = [];
            json.forEach((currentCircuit, circuitIndex) => {
              json[circuitIndex]['points'].forEach((currentPoint, pointIndex) => {
                let pointItem = {}
                pointItem['circuit'] = currentCircuit['name'];
                pointItem['point'] = currentPoint['name'];
                pointItem['value'] = currentPoint['value'];
                pointItem['units'] = currentPoint['units'];
                pointList.push(pointItem);
              });
            });

            if (this._isMounted) {
              this.setState({
                pointList: pointList,
              });
            }
          } else {
            toast.error(t(json.description))
          }
        }).catch(err => {
          console.log(err);
        });
      }
    }, (60 + Math.floor(Math.random() * Math.floor(10))) * 1000); // use random interval to avoid paralels requests
  }

  render() {
    const { t } = this.props;

    return (
      <Card className="h-100 bg-gradient">
        <CardBody className="text-white fs--1">
          <ListGroup flush className="mt-4">

            <ListGroupItem
              className="bg-transparent d-flex justify-content-between px-0 py-1 font-weight-semi-bold border-top-0"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">{t('Circuit')}</p>
              <p className="mb-0">{t('Point')}</p>
              <p className="mb-0">{t('Realtime Value')}</p>
              <p className="mb-0">{t('Unit')}</p>
            </ListGroupItem>
            {this.state.pointList.map(pointItem => (
              <ListGroupItem key={uuid()}
                className="bg-transparent d-flex justify-content-between px-0 py-1"
                style={{ borderColor: listItemBorderColor }}
              >
                <p className="mb-0">{pointItem['circuit']}</p>
                <p className="mb-0 ">{pointItem['point']}</p>
                <p className="mb-0">{pointItem['value']}</p>
                <p className="mb-0">{pointItem['units']}</p>
              </ListGroupItem>
            ))}
          </ListGroup>
        </CardBody>
      </Card>
    );
  }
}

export default  withTranslation()(RealtimeChart);
