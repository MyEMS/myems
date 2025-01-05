import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const DCDCDetails = ({
  id,
  name,
  state_point,
  module_environmental_temperature_point,
  radiator_temperature_point,
  environmental_temperature_limit_power_point,
  high_voltage_side_positive_bus_voltage_point,
  high_voltage_side_negative_bus_voltage_point,
  high_voltage_side_positive_busbar_voltage_difference_point,
  high_voltage_side_voltage_point,
  low_voltage_side_voltage_point,
  low_voltage_side_current_point,
  low_voltage_side_dc_power_point,
  high_voltage_side_pre_charging_overvoltage_point,
  high_voltage_side_polarity_reverse_connection_point,
  high_voltage_side_short_circuit_point,
  high_voltage_side_unbalanced_busbars_point,
  low_voltage_side_undervoltage_point,
  low_voltage_side_overvoltage_point,
  low_voltage_side_overcurrent_point,
  low_voltage_side_reverse_polarity_connection_point,
  low_insulation_resistance_point,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>{name}</th>
              <th>运行状态: {state_point[0]}</th>
              <th>散热器温度: {radiator_temperature_point[0]} {radiator_temperature_point[1]}</th>
              <th>模块环境温度: {module_environmental_temperature_point[0]} {module_environmental_temperature_point[1]}</th>
              <th>环境温度限额功率: {environmental_temperature_limit_power_point[0]} {environmental_temperature_limit_power_point[1]}</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>高压侧正母线电压: {high_voltage_side_positive_bus_voltage_point[0]} {high_voltage_side_positive_bus_voltage_point[1]}</td>
              <td>高压侧负母线电压: {high_voltage_side_negative_bus_voltage_point[0]} {high_voltage_side_negative_bus_voltage_point[1]}</td>
              <td>高压侧正母线压差: {high_voltage_side_positive_busbar_voltage_difference_point[0]} {high_voltage_side_positive_busbar_voltage_difference_point[1]}</td>
              <td>高压侧电压: {high_voltage_side_voltage_point[0]} {high_voltage_side_voltage_point[1]}</td>
              <td></td>
            </tr>

            <tr>
              <td>低压侧电压: {low_voltage_side_voltage_point[0]} {low_voltage_side_voltage_point[1]}</td>
              <td>低压侧电流: {low_voltage_side_current_point[0]} {low_voltage_side_current_point[1]}</td>
              <td>低压侧直流功率: {low_voltage_side_dc_power_point[0]} {low_voltage_side_dc_power_point[1]}</td>
              <td></td>
              <td></td>
            </tr>

            <tr>
              <td>高压侧预充过压: {high_voltage_side_pre_charging_overvoltage_point[0]} </td>
              <td>高压侧极性反接: {high_voltage_side_polarity_reverse_connection_point[0]} </td>
              <td>高压侧短路: {high_voltage_side_short_circuit_point[0]} </td>
              <td>高压侧正负母线不平衡: {high_voltage_side_unbalanced_busbars_point[0]}</td>
              <td></td>
            </tr>

            <tr>
              <td>低压侧欠压: {low_voltage_side_undervoltage_point[0]} </td>
              <td>低压侧过压: {low_voltage_side_overvoltage_point[0]} </td>
              <td>低压侧过流: {low_voltage_side_overcurrent_point[0]} </td>
              <td>低压侧极性反接: {low_voltage_side_reverse_polarity_connection_point[0]}</td>
              <td>绝缘电阻过低: {low_insulation_resistance_point[0]}</td>
            </tr>
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

DCDCDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  run_state_point: PropTypes.array,
  state_point: PropTypes.array,
  module_environmental_temperature_point: PropTypes.array,
  radiator_temperature_point: PropTypes.array,
  environmental_temperature_limit_power_point: PropTypes.array,
  high_voltage_side_positive_bus_voltage_point: PropTypes.array,
  high_voltage_side_negative_bus_voltage_point: PropTypes.array,
  high_voltage_side_positive_busbar_voltage_difference_point: PropTypes.array,
  high_voltage_side_voltage_point: PropTypes.array,
  low_voltage_side_voltage_point: PropTypes.array,
  low_voltage_side_current_point: PropTypes.array,
  low_voltage_side_dc_power_point: PropTypes.array,
  high_voltage_side_pre_charging_overvoltage_point: PropTypes.array,
  high_voltage_side_polarity_reverse_connection_point: PropTypes.array,
  high_voltage_side_short_circuit_point: PropTypes.array,
  high_voltage_side_unbalanced_busbars_point: PropTypes.array,
  low_voltage_side_undervoltage_point: PropTypes.array,
  low_voltage_side_overvoltage_point: PropTypes.array,
  low_voltage_side_overcurrent_point: PropTypes.array,
  low_voltage_side_reverse_polarity_connection_point: PropTypes.array,
  low_insulation_resistance_point: PropTypes.array,
};

export default withTranslation()(DCDCDetails);
