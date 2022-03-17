import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DashBoardDepositStatus = () => {
  return (
    <Card className="bg-light mb-3">
      <CardBody className="p-3">
        <p className="fs--1 mb-0">
          <Link to="#!">
            <FontAwesomeIcon icon="exchange-alt" transform="rotate-90" className="mr-2" />A payout for{' '}
            <strong>$921.42</strong> was deposited 13 days ago
          </Link>
          . Your next deposit is expected on <strong>Tuesday, March 13.</strong>
        </p>
      </CardBody>
    </Card>
  );
};

export default DashBoardDepositStatus;
