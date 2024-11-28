import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const InvertorDetails = ({
  id,
  name,
  model,
  serial_number,
  invertor_state,
  communication_state,
  total_energy,
  today_energy,
  efficiency,
  temperature,
  power_factor,
  active_power,
  reactive_power,
  frequency,
  uab,
  ubc,
  uca,
  ua,
  ub,
  uc,
  ia,
  ib,
  ic,
  pv1_u,
  pv1_i,
  pv2_u,
  pv2_i,
  pv3_u,
  pv3_i,
  pv4_u,
  pv4_i,
  pv5_u,
  pv5_i,
  pv6_u,
  pv6_i,
  pv7_u,
  pv7_i,
  pv8_u,
  pv8_i,
  pv9_u,
  pv9_i,
  pv10_u,
  pv10_i,
  pv11_u,
  pv11_i,
  pv12_u,
  pv12_i,
  pv13_u,
  pv13_i,
  pv14_u,
  pv14_i,
  pv15_u,
  pv15_i,
  pv16_u,
  pv16_i,
  pv17_u,
  pv17_i,
  pv18_u,
  pv18_i,
  pv19_u,
  pv19_i,
  pv20_u,
  pv20_i,
  pv21_u,
  pv21_i,
  pv22_u,
  pv22_i,
  pv23_u,
  pv23_i,
  pv24_u,
  pv24_i,
  pv25_u,
  pv25_i,
  pv26_u,
  pv26_i,
  pv27_u,
  pv27_i,
  pv28_u,
  pv28_i,
  mppt_total_energy,
  mppt_power,
  mppt_1_energy,
  mppt_2_energy,
  mppt_3_energy,
  mppt_4_energy,
  mppt_5_energy,
  mppt_6_energy,
  mppt_7_energy,
  mppt_8_energy,
  mppt_9_energy,
  mppt_10_energy,
  startup_time,
  shutdown_time,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <thead>
            <tr>
                <td>{t('MODEL')}: {model} </td>
                <td>{t('SERIAL_NUMBER')}: {serial_number} </td>
                <td>{t('INVERTOR_STATE')}: {invertor_state} </td>
                <td>{t('COMMUNICATION_STATE')}: {communication_state} </td>
                <td>{t('TOTAL_ENERGY')}: {total_energy} </td>
            </tr>
          </thead>
          <tbody>
            <tr>
                <td>{t('TODAY_ENERGY')}: {today_energy} </td>
                <td>{t('EFFICIENCY')}: {efficiency} </td>
                <td>{t('TEMPERATURE')}: {temperature} </td>
                <td>{t('POWER_FACTOR')}: {power_factor} </td>
                <td>{t('ACTIVE_POWER')}: {active_power} </td>
            </tr>
            <tr>
                <td>{t('REACTIVE_POWER')}: {reactive_power} </td>
                <td>{t('FREQUENCY')}: {frequency} </td>
                <td>{t('UAB')}: {uab} </td>
                <td>{t('UBC')}: {ubc} </td>
                <td>{t('UCA')}: {uca} </td>
            </tr>
            <tr>
                <td>{t('UA')}: {ua} </td>
                <td>{t('UB')}: {ub} </td>
                <td>{t('UC')}: {uc} </td>
                <td>{t('IA')}: {ia} </td>
                <td>{t('IB')}: {ib} </td>
            </tr>
            <tr>
                <td>{t('IC')}: {ic} </td>
                <td>{t('PV1_U')}: {pv1_u} </td>
                <td>{t('PV1_I')}: {pv1_i} </td>
                <td>{t('PV2_U')}: {pv2_u} </td>
                <td>{t('PV2_I')}: {pv2_i} </td>
            </tr>
            <tr>
                <td>{t('PV3_U')}: {pv3_u} </td>
                <td>{t('PV3_I')}: {pv3_i} </td>
                <td>{t('PV4_U')}: {pv4_u} </td>
                <td>{t('PV4_I')}: {pv4_i} </td>
                <td>{t('PV5_U')}: {pv5_u} </td>
            </tr>
            <tr>
                <td>{t('PV5_I')}: {pv5_i} </td>
                <td>{t('PV6_U')}: {pv6_u} </td>
                <td>{t('PV6_I')}: {pv6_i} </td>
                <td>{t('PV7_U')}: {pv7_u} </td>
                <td>{t('PV7_I')}: {pv7_i} </td>
            </tr>
            <tr>
                <td>{t('PV8_U')}: {pv8_u} </td>
                <td>{t('PV8_I')}: {pv8_i} </td>
                <td>{t('PV9_U')}: {pv9_u} </td>
                <td>{t('PV9_I')}: {pv9_i} </td>
                <td>{t('PV10_U')}: {pv10_u} </td>
            </tr>
            <tr>
                <td>{t('PV10_I')}: {pv10_i} </td>
                <td>{t('PV11_U')}: {pv11_u} </td>
                <td>{t('PV11_I')}: {pv11_i} </td>
                <td>{t('PV12_U')}: {pv12_u} </td>
                <td>{t('PV12_I')}: {pv12_i} </td>
            </tr>
            <tr>
                <td>{t('PV13_U')}: {pv13_u} </td>
                <td>{t('PV13_I')}: {pv13_i} </td>
                <td>{t('PV14_U')}: {pv14_u} </td>
                <td>{t('PV14_I')}: {pv14_i} </td>
                <td>{t('PV15_U')}: {pv15_u} </td>
            </tr>
            <tr>
                <td>{t('PV15_I')}: {pv15_i} </td>
                <td>{t('PV16_U')}: {pv16_u} </td>
                <td>{t('PV16_I')}: {pv16_i} </td>
                <td>{t('PV17_U')}: {pv17_u} </td>
                <td>{t('PV17_I')}: {pv17_i} </td>
            </tr>
            <tr>
                <td>{t('PV18_U')}: {pv18_u} </td>
                <td>{t('PV18_I')}: {pv18_i} </td>
                <td>{t('PV19_U')}: {pv19_u} </td>
                <td>{t('PV19_I')}: {pv19_i} </td>
                <td>{t('PV20_U')}: {pv20_u} </td>
            </tr>
            <tr>
                <td>{t('PV20_I')}: {pv20_i} </td>
                <td>{t('PV21_U')}: {pv21_u} </td>
                <td>{t('PV21_I')}: {pv21_i} </td>
                <td>{t('PV22_U')}: {pv22_u} </td>
                <td>{t('PV22_I')}: {pv22_i} </td>
            </tr>
            <tr>
                <td>{t('PV23_U')}: {pv23_u} </td>
                <td>{t('PV23_I')}: {pv23_i} </td>
                <td>{t('PV24_U')}: {pv24_u} </td>
                <td>{t('PV24_I')}: {pv24_i} </td>
                <td>{t('PV25_U')}: {pv25_u} </td>
            </tr>
            <tr>
                <td>{t('PV25_I')}: {pv25_i} </td>
                <td>{t('PV26_U')}: {pv26_u} </td>
                <td>{t('PV26_I')}: {pv26_i} </td>
                <td>{t('PV27_U')}: {pv27_u} </td>
                <td>{t('PV27_I')}: {pv27_i} </td>
            </tr>
            <tr>
                <td>{t('PV28_U')}: {pv28_u} </td>
                <td>{t('PV28_I')}: {pv28_i} </td>
                <td>{t('MPPT_TOTAL_ENERGY')}: {mppt_total_energy} </td>
                <td>{t('MPPT_POWER')}: {mppt_power} </td>
                <td>{t('MPPT_1_ENERGY')}: {mppt_1_energy} </td>
            </tr>
            <tr>
                <td>{t('MPPT_2_ENERGY')}: {mppt_2_energy} </td>
                <td>{t('MPPT_3_ENERGY')}: {mppt_3_energy} </td>
                <td>{t('MPPT_4_ENERGY')}: {mppt_4_energy} </td>
                <td>{t('MPPT_5_ENERGY')}: {mppt_5_energy} </td>
                <td>{t('MPPT_6_ENERGY')}: {mppt_6_energy} </td>
            </tr>
            <tr>
                <td>{t('MPPT_7_ENERGY')}: {mppt_7_energy} </td>
                <td>{t('MPPT_8_ENERGY')}: {mppt_8_energy} </td>
                <td>{t('MPPT_9_ENERGY')}: {mppt_9_energy} </td>
                <td>{t('MPPT_10_ENERGY')}: {mppt_10_energy} </td>
            </tr>
            <tr>
                <td>{t('STARTUP_TIME')}: {startup_time} </td>
                <td>{t('SHUTDOWN_TIME')}: {shutdown_time} </td>
            </tr>
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

InvertorDetails.propTypes = {
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
  Invertor_module_temperature_point: PropTypes.number,
  Invertor_ambient_temperature_point: PropTypes.number,
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

export default withTranslation()(InvertorDetails);
