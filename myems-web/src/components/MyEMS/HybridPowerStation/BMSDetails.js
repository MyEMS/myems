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
  operating_status_point,
  soc_point,
  soh_point,
  total_voltage_point,
  total_current_point,
  maximum_cell_voltage_point,
  minimum_cell_voltage_point,
  maximum_temperature_point,
  minimum_temperature_point,
  average_temperature_point,
  insulation_value_point,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>{name}</th>
              {(operating_status_point[0] !== null) && (<th>Operating Status: {operating_status_point[0]}</th>)}
              {(soc_point[0] !== null) && (<th>SOC: {soc_point[0]}</th>)}
              {(soh_point[0] !== null) && (<th>SOH: {soh_point[0]}</th>)}
            </tr>
          </thead>
        </Table>
        <Table striped >
          <tbody>
            <tr>
              {(total_voltage_point[0] !== null) && (<td>Total Voltage: {total_voltage_point[0]} {total_voltage_point[1]}</td>)}
              {(total_current_point[0] !== null) && (<td>Total Current: {total_current_point[0]}{total_current_point[1]}</td>)}
              {(maximum_cell_voltage_point[0] !== null) && (<td>Maximum Cell Voltage: {maximum_cell_voltage_point[0]} {maximum_cell_voltage_point[1]}</td>)}
              {(minimum_cell_voltage_point[0] !== null) && (<td>Minimum Cell Voltage: {minimum_cell_voltage_point[0]} {minimum_cell_voltage_point[1]}</td>)}
            </tr>
            <tr>
              {(maximum_temperature_point[0] !== null) && (<td>Maximum Temperature: {maximum_temperature_point[0]} {maximum_temperature_point[1]}</td>)}
              {(minimum_temperature_point[0] !== null) && (<td>Minimum Temperature: {minimum_temperature_point[0]}{minimum_temperature_point[1]}</td>)}
              {(average_temperature_point[0] !== null) && (<td>Average Temperature: {average_temperature_point[0]} {average_temperature_point[1]}</td>)}
              {(insulation_value_point[0] !== null) && (<td>Insulation Value: {insulation_value_point[0]} {insulation_value_point[1]}</td>)}
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
  operating_status: PropTypes.array,
  soc: PropTypes.array,
  soh: PropTypes.array,
  total_voltage: PropTypes.array,
  total_current: PropTypes.array,
  maximum_cell_voltage: PropTypes.array,
  minimum_cell_voltage: PropTypes.array,
  maximum_temperature: PropTypes.array,
  minimum_temperature: PropTypes.array,
  average_temperature: PropTypes.array,
  insulation_value: PropTypes.array,
};

export default withTranslation()(BMSDetails);
