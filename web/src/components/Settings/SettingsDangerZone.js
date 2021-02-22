import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';

const SettingsDangerZone = props => (
  <Card {...props}>
    <FalconCardHeader title="Danger Zone" light={false} />
    <CardBody className="bg-light">
      <h5 className="fs-0">Transfer Ownership</h5>
      <p className="fs--1">
        Transfer this account to another user or to an organization where you have the ability to create repositories.
      </p>
      <Button tag={Link} color="falcon-warning" block to="#!">
        Transfer
      </Button>
      <hr className="border border-dashed my-4" />
      <h5 className="fs-0">Delete this account</h5>
      <p className="fs--1">Once you delete a account, there is no going back. Please be certain.</p>
      <Button tag={Link} color="falcon-danger" block to="#!">
        Deactivate Account
      </Button>
    </CardBody>
  </Card>
);

SettingsDangerZone.propTypes = {
  className: PropTypes.string
};

export default SettingsDangerZone;
