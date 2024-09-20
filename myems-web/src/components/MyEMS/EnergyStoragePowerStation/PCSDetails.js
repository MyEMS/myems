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
              <th>{name}</th>
              <th>运行状态: {run_state_point}</th>
              <th>并网状态: {grid_connection_status_point}</th>
              <th>设备状态: {device_status_point}</th>
              <th>控制模式: {control_mode_point}</th>
            </tr>
          </thead>
        </Table>
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>电量功率</th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>当日充电量: {today_charge_energy_point} kWh</td>
              <td>总交流有功功率: {total_ac_active_power_point} kW</td>
              <td>A相有功功率: {phase_a_active_power_point} kW</td>
              <td>A相无功功率: {phase_a_reactive_power_point} kvar</td>
              <td>A相视在功率: {phase_a_apparent_power_point} kVA</td>
            </tr>
            <tr>
              <td>当日放电量: {today_discharge_energy_point} kWh</td>
              <td>总交流无功功率: {total_ac_reactive_power_point} kvar</td>
              <td>B相有功功率: {phase_b_active_power_point} kW</td>
              <td>B相无功功率: {phase_b_reactive_power_point} kvar</td>
              <td>B相视在功率: {phase_b_apparent_power_point} kVA</td>
            </tr>
            <tr>
            <td>总充电量: {total_charge_energy_point} kWh</td>
              <td>总交流视在功率: {total_ac_apparent_power_point} kVA</td>
              <td>C相有功功率: {phase_c_active_power_point} kW</td>
              <td>C相无功功率: {phase_c_reactive_power_point} kvar</td>
              <td>C相视在功率: {phase_c_apparent_power_point} kVA</td>
            </tr>
            <tr>
              <td>总放电量: {total_discharge_energy_point} kWh</td>
              <td>总交流功率因数: {total_ac_power_factor_point}</td>
              <td>交流频率: {ac_frequency_point} Hz</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </Table>
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>电压电流</th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AB电压: {ab_voltage_point} V</td>
              <td>AB电流: {ab_current_point} A</td>
              <td>A相电压: {phase_a_voltage_point} V</td>
              <td>A相电流: {phase_a_current_point} A</td>
            </tr>
            <tr>
              <td>BC电压: {bc_voltage_point} V</td>
              <td>BC电流: {bc_current_point} A</td>
              <td>B相电压: {phase_b_voltage_point} V</td>
              <td>B相电流: {phase_b_current_point} A</td>
            </tr>
            <tr>
              <td>CA电压: {ca_voltage_point} V</td>
              <td>CA电流: {ca_current_point} A</td>
              <td>C相电压: {phase_c_voltage_point} V</td>
              <td>C相电流: {phase_c_current_point} A</td>
            </tr>
          </tbody>
        </Table>
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>温度</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A1模块温度: {a1_module_temperature_point} ℃</td>
              <td>A2模块温度: {a2_module_temperature_point} ℃</td>
              <td>进风口温度: {air_inlet_temperature_point} ℃</td>
              <td>PCS模块温度: {pcs_module_temperature_point} ℃</td>
            </tr>
            <tr>
              <td>B1模块温度: {b1_module_temperature_point} ℃</td>
              <td>B2模块温度: {b2_module_temperature_point} ℃</td>
              <td>出风口温度: {air_outlet_temperature_point} ℃</td>
              <td>PCS环境温度: {pcs_ambient_temperature_point} ℃</td>
            </tr>
            <tr>
              <td>C1模块温度: {c1_module_temperature_point} ℃</td>
              <td>C2模块温度: {c2_module_temperature_point} ℃</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </Table>
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>直流</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>直流功率: {dc_power_point} kW</td>
              <td>直流电压: {dc_voltage_point} V</td>
              <td>直流电流: {dc_current_point} A</td>
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
  run_state_point: PropTypes.number,
  today_charge_energy_point: PropTypes.number,
  today_discharge_energy_point: PropTypes.number,
  total_charge_energy_point: PropTypes.number,
  total_discharge_energy_point: PropTypes.number,
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

export default withTranslation()(PCSDetails);
