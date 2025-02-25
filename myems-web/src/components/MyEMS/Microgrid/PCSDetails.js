import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const PCSDetails = ({
  id,
  name,
  run_state_point,
  today_charge_energy_point,
  today_discharge_energy_point,
  total_charge_energy_point,
  total_discharge_energy_point,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>{name}</th>
              {(run_state_point[0] !== null) && (<th>Run State: {run_state_point[0]}</th>)}

            </tr>
          </thead>
          <tbody>
            <tr>
              {(today_charge_energy_point[0] !== null) && (<td>Today Charge Energy: {today_charge_energy_point[0]} {today_charge_energy_point[1]}</td>)}
            </tr>
            <tr>
              {(today_discharge_energy_point[0] !== null) && (<td>Today Discharge Energy: {today_discharge_energy_point[0]} {today_discharge_energy_point[1]}</td>)}
            </tr>
            <tr>
              {(total_charge_energy_point[0] !== null) && (<td>Total Charge Energy: {total_charge_energy_point[0]} {total_charge_energy_point[1]}</td>)}
            </tr>
            <tr>
              {(total_discharge_energy_point[0] !== null) && (<td>Total Discharge Energy: {total_discharge_energy_point[0]} {total_discharge_energy_point[1]}</td>)}
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

PCSDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  run_state_point: PropTypes.array,
  today_charge_energy_point: PropTypes.array,
  today_discharge_energy_point: PropTypes.array,
  total_charge_energy_point: PropTypes.array,
  total_discharge_energy_point: PropTypes.array,
};

export default withTranslation()(PCSDetails);
