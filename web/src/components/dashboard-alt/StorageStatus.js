import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Progress, Row } from 'reactstrap';
import Flex from '../common/Flex';
import { isIterableArray } from '../../helpers/utils';
import StorageStatusProgressBar from './StorageStatusProgressBar';
import StorageStatusDot from './StorageStatusDot';

const StorageStatus = ({ data, className }) => {
  const totalStorage = data.map(d => d.size).reduce((total, currentValue) => total + currentValue, 0);
  const freeStorage = data.find(d => d.name === 'Free').size;

  return (
    <Card className={className}>
      <CardBody tag={Flex} align="center">
        <div className="w-100">
          <h6 className="mb-3 text-800">
            Using Storage <strong className="text-dark">{totalStorage - freeStorage} MB </strong>of{' '}
            {Math.round(totalStorage / 1024)} GB
          </h6>
          <Progress multi className="rounded-soft mb-3" style={{ height: 10 }}>
            {isIterableArray(data) &&
              data.map((d, index) => (
                <StorageStatusProgressBar
                  {...d}
                  percentage={(d.size * 100) / totalStorage}
                  isLast={data.length - 1 === index}
                  key={index}
                />
              ))}
          </Progress>
          <Row className="fs--1 font-weight-semi-bold text-500">
            {isIterableArray(data) &&
              data.map((d, index) => (
                <StorageStatusDot {...d} isFirst={index === 0} isLast={data.length - 1 === index} key={index} />
              ))}
          </Row>
        </div>
      </CardBody>
    </Card>
  );
};

StorageStatus.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired
    }).isRequired
  )
};

export default StorageStatus;
