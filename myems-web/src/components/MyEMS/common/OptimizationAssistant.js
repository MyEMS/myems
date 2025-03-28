import React, { useEffect } from 'react';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import PropTypes from 'prop-types';

const listItemBorderColor = 'rgba(255, 255, 255, 0.05)';

const OptimizationAssistant = ({adviceList, t }) => {
  return (
    <Card className="mb-3 overflow-hidden" style={{ minWidth: '12rem', maxWidth: '25%' }}>
      <CardHeader className="position-relative">
        <h5 className="mb-0">{t('优化助手')}</h5>
      </CardHeader>
      <CardBody className="fs--1 position-relative">
        <ListGroup flush className="mt-4">
          <ListGroupItem
            className="bg-transparent d-flex justify-content-between px-0 py-1 font-weight-semi-bold border-top-0"
            style={{ borderColor: listItemBorderColor }}
          >
          </ListGroupItem>
          {adviceList.map(({ advice, index }) => (
            <ListGroupItem
              key={uuid()}
              className="bg-transparent d-flex justify-content-between px-0 py-1"
              style={{ borderColor: listItemBorderColor }}
            >
              <p className="mb-0 ">
                {advice}
              </p>
            </ListGroupItem>
           ))}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

OptimizationAssistant.propTypes = {
  adviceList: PropTypes.array
};

export default withTranslation()(OptimizationAssistant);
