import React, { useEffect } from 'react';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import {v4 as uuid} from 'uuid';
import PropTypes from 'prop-types';

const listItemBorderColor = 'rgba(255, 255, 255, 0.05)';

const RealtimeSensor = ({sensor, pointList, t}) => {
    return (
      <Card className="mb-3 overflow-hidden" style={{ minWidth: '12rem', maxWidth: '25%' }}>
        <CardHeader className="position-relative">
            <h5 className="mb-0">{sensor['name']}</h5>
        </CardHeader>
        <CardBody className="fs--1 position-relative">
          <ListGroup flush className="mt-4">
            <ListGroupItem
              className="bg-transparent d-flex justify-content-between px-0 py-1 font-weight-semi-bold border-top-0"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0">{t('Point')}</p>
              <p className="mb-0">{t('Realtime Value')}</p>
            </ListGroupItem>
            {sensor['point_id_list'].map((key, item) =>
              (<ListGroupItem key={uuid()}
                className="bg-transparent d-flex justify-content-between px-0 py-1"
                style={{ borderColor: listItemBorderColor }}
              >
                <p className="mb-0 ">{sensor['point_name_list'][item]}({sensor['point_unit_list'][item]})</p>
                <p className="mb-0">{pointList[key]}</p>
              </ListGroupItem>
              ))}
          </ListGroup>
        </CardBody>
      </Card>
    );
  }

RealtimeSensor.propTypes = {
  sensor: PropTypes.object,
  pointList: PropTypes.object,
};

export default  withTranslation()(RealtimeSensor);
