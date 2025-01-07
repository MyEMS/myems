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
              {(run_state_point[0 ] !== null) && (<th>运行状态: {run_state_point[0]}</th>)}
              {(grid_connection_status_point[0 ] !== null) && (<th>并网状态: {grid_connection_status_point[0]}</th>)}
              {(device_status_point[0 ] !== null) && (<th>设备状态: {device_status_point[0]}</th>)}
              {(control_mode_point[0 ] !== null) && (<th>控制模式: {control_mode_point[0]}</th>)}
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
              {(today_charge_energy_point[0 ] !== null) && (<td>当日充电量: {today_charge_energy_point[0]} {today_charge_energy_point[1]}</td>)}
              {(total_ac_active_power_point[0 ] !== null) && (<td>总交流有功功率: {total_ac_active_power_point[0]} {total_ac_active_power_point[1]}</td>)}
              {(phase_a_active_power_point[0 ] !== null) && (<td>A相有功功率: {phase_a_active_power_point[0]} {phase_a_active_power_point[1]}</td>)}
              {(phase_a_reactive_power_point[0 ] !== null) && (<td>A相无功功率: {phase_a_reactive_power_point[0]} {phase_a_reactive_power_point[1]}</td>)}
              {(phase_a_apparent_power_point[0 ] !== null) && (<td>A相视在功率: {phase_a_apparent_power_point[0]} {phase_a_apparent_power_point[1]}</td>)}
            </tr>
            <tr>
              {(today_discharge_energy_point[0 ] !== null) && (<td>当日放电量: {today_discharge_energy_point[0]} {today_discharge_energy_point[1]}</td>)}
              {(total_ac_reactive_power_point[0 ] !== null) && (<td>总交流无功功率: {total_ac_reactive_power_point[0]} {total_ac_reactive_power_point[1]}</td>)}
              {(phase_b_active_power_point[0 ] !== null) && (<td>B相有功功率: {phase_b_active_power_point[0]} {phase_b_active_power_point[1]}</td>)}
              {(phase_b_reactive_power_point[0 ] !== null) && (<td>B相无功功率: {phase_b_reactive_power_point[0]} {phase_b_reactive_power_point[1]}</td>)}
              {(phase_b_apparent_power_point[0 ] !== null) && (<td>B相视在功率: {phase_b_apparent_power_point[0]} {phase_b_apparent_power_point[1]}</td>)}
            </tr>
            <tr>
              {(total_charge_energy_point[0 ] !== null) && (<td>总充电量: {total_charge_energy_point[0]} {total_charge_energy_point[1]}</td>)}
              {(total_ac_apparent_power_point[0 ] !== null) && (<td>总交流视在功率: {total_ac_apparent_power_point[0]} {total_ac_apparent_power_point[1]}</td>)}
              {(phase_c_active_power_point[0 ] !== null) && (<td>C相有功功率: {phase_c_active_power_point[0]} {phase_c_active_power_point[1]}</td>)}
              {(phase_c_reactive_power_point[0 ] !== null) && (<td>C相无功功率: {phase_c_reactive_power_point[0]} {phase_c_reactive_power_point[1]}</td>)}
              {(phase_c_apparent_power_point[0 ] !== null) && (<td>C相视在功率: {phase_c_apparent_power_point[0]} {phase_c_apparent_power_point[1]}</td>)}
            </tr>
            <tr>
              {(total_discharge_energy_point[0 ] !== null) && (<td>总放电量: {total_discharge_energy_point[0]} {total_discharge_energy_point[1]}</td>)}
              {(total_ac_power_factor_point[0 ] !== null) && (<td>总交流功率因数: {total_ac_power_factor_point[0]}</td>)}
              {(ac_frequency_point[0 ] !== null) && (<td>交流频率: {ac_frequency_point[0]} {ac_frequency_point[1]}</td>)}
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
              {(ab_voltage_point[0 ] !== null) && (<td>AB电压: {ab_voltage_point[0]} {ab_voltage_point[1]}</td>)}
              {(ab_current_point[0 ] !== null) && (<td>AB电流: {ab_current_point[0]} {ab_current_point[1]}</td>)}
              {(phase_a_voltage_point[0 ] !== null) && (<td>A相电压: {phase_a_voltage_point[0]} {phase_a_voltage_point[1]}</td>)}
              {(phase_a_current_point[0 ] !== null) && (<td>A相电流: {phase_a_current_point[0]} {phase_a_current_point[1]}</td>)}
            </tr>
            <tr>
              {(bc_voltage_point[0 ] !== null) && (<td>BC电压: {bc_voltage_point[0]} {bc_voltage_point[1]}</td>)}
              {(bc_current_point[0 ] !== null) && (<td>BC电流: {bc_current_point[0]} {bc_current_point[1]}</td>)}
              {(phase_b_voltage_point[0 ] !== null) && (<td>B相电压: {phase_b_voltage_point[0]} {phase_b_voltage_point[1]}</td>)}
              {(phase_b_current_point[0 ] !== null) && (<td>B相电流: {phase_b_current_point[0]} {phase_b_current_point[1]}</td>)}
            </tr>
            <tr>
              {(ca_voltage_point[0 ] !== null) && (<td>CA电压: {ca_voltage_point[0]} {ca_voltage_point[1]}</td>)}
              {(ca_current_point[0 ] !== null) && (<td>CA电流: {ca_current_point[0]} {ca_current_point[1]}</td>)}
              {(phase_c_voltage_point[0 ] !== null) && (<td>C相电压: {phase_c_voltage_point[0]} {phase_c_voltage_point[1]}</td>)}
              {(phase_c_current_point[0 ] !== null) && (<td>C相电流: {phase_c_current_point[0]} {phase_c_current_point[1]}</td>)}
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
              {(a1_module_temperature_point[0 ] !== null) && (<td>A1模块温度: {a1_module_temperature_point[0]} {a1_module_temperature_point[1]}</td>)}
              {(a2_module_temperature_point[0 ] !== null) && (<td>A2模块温度: {a2_module_temperature_point[0]} {a2_module_temperature_point[1]}</td>)}
              {(air_inlet_temperature_point[0 ] !== null) && (<td>进风口温度: {air_inlet_temperature_point[0]} {air_inlet_temperature_point[1]}</td>)}
              {(pcs_module_temperature_point[0 ] !== null) && (<td>PCS模块温度: {pcs_module_temperature_point[0]} {pcs_module_temperature_point[1]}</td>)}
            </tr>
            <tr>
              {(b1_module_temperature_point[0 ] !== null) && (<td>B1模块温度: {b1_module_temperature_point[0]} {b1_module_temperature_point[1]}</td>)}
              {(b2_module_temperature_point[0 ] !== null) && (<td>B2模块温度: {b2_module_temperature_point[0]} {b2_module_temperature_point[1]}</td>)}
              {(air_outlet_temperature_point[0 ] !== null) && (<td>出风口温度: {air_outlet_temperature_point[0]} {air_outlet_temperature_point[1]}</td>)}
              {(pcs_ambient_temperature_point[0 ] !== null) && (<td>PCS环境温度: {pcs_ambient_temperature_point[0]} {pcs_ambient_temperature_point[1]}</td>)}
            </tr>
            <tr>
              {(c1_module_temperature_point[0 ] !== null) && (<td>C1模块温度: {c1_module_temperature_point[0]} {c1_module_temperature_point[1]}</td>)}
              {(c2_module_temperature_point[0 ] !== null) && (<td>C2模块温度: {c2_module_temperature_point[0]} {c2_module_temperature_point[1]}</td>)}
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
              {(dc_power_point[0 ] !== null) && (<td>直流功率: {dc_power_point[0]} {dc_power_point[1]}</td>)}
              {(dc_voltage_point[0 ] !== null) && (<td>直流电压: {dc_voltage_point[0]} {dc_voltage_point[1]}</td>)}
              {(dc_current_point[0 ] !== null) && (<td>直流电流: {dc_current_point[0]} {dc_current_point[1]}</td>)}
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
  grid_connection_status_point: PropTypes.array,
  device_status_point: PropTypes.array,
  control_mode_point: PropTypes.array,
  total_ac_active_power_point: PropTypes.array,
  total_ac_reactive_power_point: PropTypes.array,
  total_ac_apparent_power_point: PropTypes.array,
  total_ac_power_factor_point: PropTypes.array,
  ac_frequency_point: PropTypes.array,
  phase_a_active_power_point: PropTypes.array,
  phase_b_active_power_point: PropTypes.array,
  phase_c_active_power_point: PropTypes.array,
  phase_a_reactive_power_point: PropTypes.array,
  phase_b_reactive_power_point: PropTypes.array,
  phase_c_reactive_power_point: PropTypes.array,
  phase_a_apparent_power_point: PropTypes.array,
  phase_b_apparent_power_point: PropTypes.array,
  phase_c_apparent_power_point: PropTypes.array,
  ab_voltage_point: PropTypes.array,
  bc_voltage_point: PropTypes.array,
  ca_voltage_point: PropTypes.array,
  ab_current_point: PropTypes.array,
  bc_current_point: PropTypes.array,
  ca_current_point: PropTypes.array,
  phase_a_voltage_point: PropTypes.array,
  phase_b_voltage_point: PropTypes.array,
  phase_c_voltage_point: PropTypes.array,
  phase_a_current_point: PropTypes.array,
  phase_b_current_point: PropTypes.array,
  phase_c_current_point: PropTypes.array,
  pcs_module_temperature_point: PropTypes.array,
  pcs_ambient_temperature_point: PropTypes.array,
  a1_module_temperature_point: PropTypes.array,
  b1_module_temperature_point: PropTypes.array,
  c1_module_temperature_point: PropTypes.array,
  a2_module_temperature_point: PropTypes.array,
  b2_module_temperature_point: PropTypes.array,
  c2_module_temperature_point: PropTypes.array,
  air_inlet_temperature_point: PropTypes.array,
  air_outlet_temperature_point: PropTypes.array,
  dc_power_point: PropTypes.array,
  dc_voltage_point: PropTypes.array,
  dc_current_point: PropTypes.array,
};

export default withTranslation()(PCSDetails);
