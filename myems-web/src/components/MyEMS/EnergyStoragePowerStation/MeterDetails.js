import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const MeterDetails = ({
  id,
  name,
  uuid,
  energy_storage_container,
  run_state_point,
  today_charge_energy_point,
  today_discharge_energy_point,
  total_charge_energy_point,
  total_discharge_energy_point,
  working_status_point,
  grid_connection_status_point,
  device_status_point,
  control_mode_point,
  total_ac_active_power_point,
  total_ac_reactive_power_point,
  total_ac_apparent_power_point,
  total_ac_power_factor_point,
  ac_frequency_point,
  phase_a_active_power_point,
  phase_b_active_power_point,
  phase_c_active_power_point,
  phase_a_reactive_power_point,
  phase_b_reactive_power_point,
  phase_c_reactive_power_point,
  phase_a_apparent_power_point,
  phase_b_apparent_power_point,
  phase_c_apparent_power_point,
  ab_voltage_point,
  bc_voltage_point,
  ca_voltage_point,
  ab_current_point,
  bc_current_point,
  ca_current_point,
  phase_a_voltage_point,
  phase_b_voltage_point,
  phase_c_voltage_point,
  phase_a_current_point,
  phase_b_current_point,
  phase_c_current_point,
  pcs_module_temperature_point,
  pcs_ambient_temperature_point,
  a1_module_temperature_point,
  b1_module_temperature_point,
  c1_module_temperature_point,
  a2_module_temperature_point,
  b2_module_temperature_point,
  c2_module_temperature_point,
  air_inlet_temperature_point,
  air_outlet_temperature_point,
  dc_power_point,
  dc_voltage_point,
  dc_current_point,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
              <CardBody className="bg-light">
                <Table striped className="border-bottom">
                  <thead>
                    <tr>
                      <th>储能电表</th>
                      <th>总有功功率: - kW</th>
                      <th>A相有功功率: - kW</th>
                      <th>B相有功功率: - kW</th>
                      <th>B相有功功率: - W</th>
                      <th>总视在功率: - kVA</th>
                      <th>A相视在功率: - kVA</th>
                      <th>B相视在功率: - kVA</th>
                      <th>C相视在功率: - kVA</th>
                    </tr>
                  </thead>
                </Table>
                <Table striped className="border-bottom">
                  <thead>
                    <tr>
                      <th>储能电表</th>
                      <th>总 kWh</th>
                      <th>尖 kWh</th>
                      <th>峰 kWh</th>
                      <th>平 kWh</th>
                      <th>谷 kWh</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">日正向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <th scope="row">日反向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <th scope="row">累计正向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <th scope="row">累计反向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </Table>
                <Table striped className="border-bottom">
                  <thead>
                    <tr>
                      <th>负载电表</th>
                      <th>总有功功率: - kW</th>
                      <th>A相有功功率: - kW</th>
                      <th>B相有功功率: - kW</th>
                      <th>B相有功功率: - W</th>
                      <th>总视在功率: - kVA</th>
                      <th>A相视在功率: - kVA</th>
                      <th>B相视在功率: - kVA</th>
                      <th>C相视在功率: - kVA</th>
                    </tr>
                  </thead>
                </Table>
                <Table striped className="border-bottom">
                  <thead>
                    <tr>
                      <th>负载电表</th>
                      <th>总 kWh</th>
                      <th>尖 kWh</th>
                      <th>峰 kWh</th>
                      <th>平 kWh</th>
                      <th>谷 kWh</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">日正向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <th scope="row">日反向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <th scope="row">累计正向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <th scope="row">累计反向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </Table>
                <Table striped className="border-bottom">
                  <thead>
                    <tr>
                      <th>电网电表</th>
                      <th>总有功功率: - kW</th>
                      <th>A相有功功率: - kW</th>
                      <th>B相有功功率: - kW</th>
                      <th>B相有功功率: - W</th>
                      <th>总视在功率: - kVA</th>
                      <th>A相视在功率: - kVA</th>
                      <th>B相视在功率: - kVA</th>
                      <th>C相视在功率: - kVA</th>
                    </tr>
                  </thead>
                </Table>
                <Table striped className="border-bottom">
                  <thead>
                    <tr>
                      <th>电网电表</th>
                      <th>总 kWh</th>
                      <th>尖 kWh</th>
                      <th>峰 kWh</th>
                      <th>平 kWh</th>
                      <th>谷 kWh</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">日正向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <th scope="row">日反向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <th scope="row">累计正向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <th scope="row">累计反向总电能</th>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
  );
};

MeterDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  uuid: PropTypes.string.isRequired,
  run_state_point: PropTypes.number,
  today_charge_energy_point: PropTypes.number,
  today_discharge_energy_point: PropTypes.number,
  total_charge_energy_point: PropTypes.number,
  total_discharge_energy_point: PropTypes.number,
  working_status_point: PropTypes.number,
  grid_connection_status_point: PropTypes.number,
  device_status_point: PropTypes.number,
  control_mode_point: PropTypes.number,
  total_ac_active_power_point: PropTypes.number,
  total_ac_reactive_power_point: PropTypes.number,
  total_ac_apparent_power_point: PropTypes.number,
  total_ac_power_factor_point: PropTypes.number,
  ac_frequency_point: PropTypes.number,
  phase_a_active_power_point: PropTypes.number,
  phase_b_active_power_point: PropTypes.number,
  phase_c_active_power_point: PropTypes.number,
  phase_a_reactive_power_point: PropTypes.number,
  phase_b_reactive_power_point: PropTypes.number,
  phase_c_reactive_power_point: PropTypes.number,
  phase_a_apparent_power_point: PropTypes.number,
  phase_b_apparent_power_point: PropTypes.number,
  phase_c_apparent_power_point: PropTypes.number,
  ab_voltage_point: PropTypes.number,
  bc_voltage_point: PropTypes.number,
  ca_voltage_point: PropTypes.number,
  ab_current_point: PropTypes.number,
  bc_current_point: PropTypes.number,
  ca_current_point: PropTypes.number,
  phase_a_voltage_point: PropTypes.number,
  phase_b_voltage_point: PropTypes.number,
  phase_c_voltage_point: PropTypes.number,
  phase_a_current_point: PropTypes.number,
  phase_b_current_point: PropTypes.number,
  phase_c_current_point: PropTypes.number,
  pcs_module_temperature_point: PropTypes.number,
  pcs_ambient_temperature_point: PropTypes.number,
  a1_module_temperature_point: PropTypes.number,
  b1_module_temperature_point: PropTypes.number,
  c1_module_temperature_point: PropTypes.number,
  a2_module_temperature_point: PropTypes.number,
  b2_module_temperature_point: PropTypes.number,
  c2_module_temperature_point: PropTypes.number,
  air_inlet_temperature_point: PropTypes.number,
  air_outlet_temperature_point: PropTypes.number,
  dc_power_point: PropTypes.number,
  dc_voltage_point: PropTypes.number,
  dc_current_point: PropTypes.number,
};

export default withTranslation()(MeterDetails);
