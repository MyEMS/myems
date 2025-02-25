import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const BMSDetails = ({
  id,
  name,
  battery_state_point,
  soc_point,
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
              {(battery_state_point[0] !== null) && (<th>Battery State: {battery_state_point[0]}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              {(soc_point[0] !== null) && (<td>SOC: {soc_point[0]}{soc_point[1]}</td>)}
              {(power_point[0] !== null) && (<td>Power: {power_point[0]} {power_point[1]}</td>)}
            </tr>
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

BMSDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  battery_state_point: PropTypes.array,
  soc_point: PropTypes.array,
  power_point: PropTypes.array,
};

export default withTranslation()(BMSDetails);
