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
  communication_status_with_pcs_point,
  communication_status_with_ems_point,
  grid_status_point,
  total_voltage_point,
  total_current_point,
  soh_point,
  charging_power_limit_point,
  discharge_limit_power_point,
  rechargeable_capacity_point,
  dischargeable_capacity_point,
  average_temperature_point,
  average_voltage_point,
  insulation_value_point,
  positive_insulation_value_point,
  negative_insulation_value_point,
  maximum_temperature_point,
  maximum_temperature_battery_cell_point,
  minimum_temperature_point,
  minimum_temperature_battery_cell_point,
  maximum_voltage_point,
  maximum_voltage_battery_cell_point,
  minimum_voltage_point,
  minimum_voltage_battery_cell_point,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>{name}</th>
              <th>充放电状态: {battery_state_point}</th>
              <th>运行状态: -</th>
              <th>与PCS通信: {communication_status_with_pcs_point}</th>
              <th>与EMS通信: {communication_status_with_ems_point}</th>
              <th>并网状态: {grid_status_point}</th>
            </tr>
          </thead>
        </Table>
        <Table striped >
          <tbody>
            <tr>
              <td>总电压: {total_voltage_point} V</td>
              <td>SOC: {soc_point} %</td>
              <td>充电限制功率: {charging_power_limit_point} kW</td>
              <td>可充电量: {rechargeable_capacity_point} kWh</td>
              <td>平均温度: {average_temperature_point} ℃</td>
            </tr>
            <tr>
              <td>总电流: {total_current_point} A</td>
              <td>SOH: {soh_point} %</td>
              <td>放电限制功率: {discharge_limit_power_point}</td>
              <td>可放电量: {dischargeable_capacity_point} kWh</td>
              <td>平均电压: {average_voltage_point} V</td>
            </tr>
          </tbody>
        </Table>
        <Table striped className="border-bottom">
          <tbody>
            <tr>
              <td>绝缘值: {insulation_value_point} kΩ</td>
              <td>最高温度: {maximum_temperature_point} | {maximum_temperature_battery_cell_point} #</td>
              <td>最高电压: {maximum_voltage_point} V | {maximum_voltage_battery_cell_point} #</td>
            </tr>
            <tr>
              <td>正极绝缘值: {positive_insulation_value_point} kΩ</td>
              <td>最低温度: {minimum_temperature_point} ℃ | {minimum_temperature_battery_cell_point} #</td>
              <td>最低电压: {minimum_voltage_point} V | {minimum_voltage_battery_cell_point} #</td>
            </tr>
            <tr>
              <td>负极绝缘值: {negative_insulation_value_point} kΩ</td>
              <td></td>
              <td></td>
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
  battery_state_point: PropTypes.number,
  soc_point: PropTypes.number,
  power_point: PropTypes.number,
  charge_meter: PropTypes.number,
  discharge_meter: PropTypes.number,
  communication_status_with_pcs_point: PropTypes.number,
  communication_status_with_ems_point: PropTypes.number,
  grid_status_point: PropTypes.number,
  total_voltage_point: PropTypes.number,
  total_current_point: PropTypes.number,
  soh_point: PropTypes.number,
  charging_power_limit_point: PropTypes.number,
  discharge_limit_power_point: PropTypes.number,
  rechargeable_capacity_point: PropTypes.number,
  dischargeable_capacity_point: PropTypes.number,
  average_temperature_point: PropTypes.number,
  average_voltage_point: PropTypes.number,
  insulation_value_point: PropTypes.number,
  positive_insulation_value_point: PropTypes.number,
  negative_insulation_value_point: PropTypes.number,
  maximum_temperature_point: PropTypes.number,
  maximum_temperature_battery_cell_point: PropTypes.number,
  minimum_temperature_point: PropTypes.number,
  minimum_temperature_battery_cell_point: PropTypes.number,
  maximum_voltage_point: PropTypes.number,
  maximum_voltage_battery_cell_point: PropTypes.number,
  minimum_voltage_point: PropTypes.number,
  minimum_voltage_battery_cell_point: PropTypes.number,
};

export default withTranslation()(BMSDetails);
