import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const PVDetails = ({
  id,
  name,
  power_point,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>{name}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {(power_point[0] !== null) && (<td>Power: {power_point[0]} {power_point[1]}</td>)}
            </tr>
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

PVDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  power_point: PropTypes.array,
};

export default withTranslation()(PVDetails);
