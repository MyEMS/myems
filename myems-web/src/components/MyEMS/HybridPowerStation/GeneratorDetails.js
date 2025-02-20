import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const GeneratorDetails = ({
  id,
  name,
  operating_status_point,
  power_generation_point,
  phase_a_voltage_point,
  phase_b_voltage_point,
  phase_c_voltage_point,
  phase_a_current_point,
  phase_b_current_point,
  phase_c_current_point,
  phase_a_active_power_point,
  phase_b_active_power_point,
  phase_c_active_power_point,
  phase_a_reactive_power_point,
  phase_b_reactive_power_point,
  phase_c_reactive_power_point,
  power_factor_point,
  genset_active_power_point,
  genset_reactive_power_point,
  genset_frequency_point,
  engine_fuel_level_point,
  engine_oil_pressure_point,
  engine_coolant_temperature_point,
  cumulative_engine_fuel_consumption_point,
  cumulative_fuel_efficiency_point,
  instantaneous_fuel_efficiency_point,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>{name}</th>
              {(operating_status_point[0] !== null) && (<th>{t('Operating Status')}: {operating_status_point[0]}</th>)}
              {(power_generation_point[0] !== null) && (<th>{t('Power Generation')}: {power_generation_point[0]} {power_generation_point[1]}</th>)}
            </tr>
          </thead>

          <tbody>
            <tr>
              {(phase_a_voltage_point[0] !== null) && (<td>{t('Phase A Voltage')}: {phase_a_voltage_point[0]} {phase_a_voltage_point[1]}</td>)}
              {(phase_b_voltage_point[0] !== null) && (<td>{t('Phase B Voltage')}: {phase_b_voltage_point[0]} {phase_b_voltage_point[1]}</td>)}
              {(phase_c_voltage_point[0] !== null) && (<td>{t('Phase C Voltage')}: {phase_c_voltage_point[0]} {phase_c_voltage_point[1]}</td>)}
              {(phase_a_current_point[0] !== null) && (<td>{t('Phase A Current')}: {phase_a_current_point[0]} {phase_a_current_point[1]}</td>)}
              {(phase_b_current_point[0] !== null) && (<td>{t('Phase B Current')}: {phase_b_current_point[0]} {phase_b_current_point[1]}</td>)}
              {(phase_c_current_point[0] !== null) && (<td>{t('Phase C Current')}: {phase_c_current_point[0]} {phase_c_current_point[1]}</td>)}
            </tr>
            <tr>
              {(phase_a_active_power_point[0] !== null) && (<td>{t('Phase A Active Power')}: {phase_a_active_power_point[0]} {phase_a_active_power_point[1]}</td>)}
              {(phase_b_active_power_point[0] !== null) && (<td>{t('Phase B Active Power')}: {phase_b_active_power_point[0]} {phase_b_active_power_point[1]}</td>)}
              {(phase_c_active_power_point[0] !== null) && (<td>{t('Phase C Active Power')}: {phase_c_active_power_point[0]} {phase_c_active_power_point[1]}</td>)}
              {(phase_a_reactive_power_point[0] !== null) && (<td>{t('Phase A Reactive Power')}: {phase_a_reactive_power_point[0]} {phase_a_reactive_power_point[1]}</td>)}
              {(phase_b_reactive_power_point[0] !== null) && (<td>{t('Phase B Reactive Power')}: {phase_b_reactive_power_point[0]} {phase_b_reactive_power_point[1]}</td>)}
              {(phase_c_reactive_power_point[0] !== null) && (<td>{t('Phase C Reactive Power')}: {phase_c_reactive_power_point[0]} {phase_c_reactive_power_point[1]}</td>)}
            </tr>
            <tr>
              {(power_factor_point[0] !== null) && (<td>{t('Power Factor')}: {power_factor_point[0]} {power_factor_point[1]}</td>)}
              {(genset_active_power_point[0] !== null) && (<td>{t('Genset Active Power')}: {genset_active_power_point[0]} {genset_active_power_point[1]}</td>)}
              {(genset_reactive_power_point[0] !== null) && (<td>{t('Genset Reactive Power')}: {genset_reactive_power_point[0]} {genset_reactive_power_point[1]}</td>)}
              {(genset_frequency_point[0] !== null) && (<td>{t('Genset Frequency')}: {genset_frequency_point[0]} {genset_frequency_point[1]}</td>)}
              {(engine_fuel_level_point[0] !== null) && (<td>{t('Engine Fuel Level')}: {engine_fuel_level_point[0]} {engine_fuel_level_point[1]}</td>)}
              {(engine_oil_pressure_point[0] !== null) && (<td>{t('Engine Oil Pressure')}: {engine_oil_pressure_point[0]} {engine_oil_pressure_point[1]}</td>)}
            </tr>
            <tr>
              {(engine_coolant_temperature_point[0] !== null) && (<td>{t('Engine Coolant Temperature')}: {engine_coolant_temperature_point[0]} {engine_coolant_temperature_point[1]}</td>)}
              {(cumulative_engine_fuel_consumption_point[0] !== null) && (<td>{t('Cumulative Engine Fuel Consumption')}: {cumulative_engine_fuel_consumption_point[0]} {cumulative_engine_fuel_consumption_point[1]}</td>)}
              {(cumulative_fuel_efficiency_point[0] !== null) && (<td>{t('Cumulative Fuel Efficiency')}: {cumulative_fuel_efficiency_point[0]} {cumulative_fuel_efficiency_point[1]}</td>)}
              {(instantaneous_fuel_efficiency_point[0] !== null) && (<td>{t('Instantaneous Fuel Efficiency')}: {instantaneous_fuel_efficiency_point[0]} {instantaneous_fuel_efficiency_point[1]}</td>)}
            </tr>
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

GeneratorDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  operating_status_point: PropTypes.array,
  power_generation_point: PropTypes.array,
  phase_a_voltage_point: PropTypes.array,
  phase_b_voltage_point: PropTypes.array,
  phase_c_voltage_point: PropTypes.array,
  phase_a_current_point: PropTypes.array,
  phase_b_current_point: PropTypes.array,
  phase_c_current_point: PropTypes.array,
  phase_a_active_power_point: PropTypes.array,
  phase_b_active_power_point: PropTypes.array,
  phase_c_active_power_point: PropTypes.array,
  phase_a_reactive_power_point: PropTypes.array,
  phase_b_reactive_power_point: PropTypes.array,
  phase_c_reactive_power_point: PropTypes.array,
  power_factor_point: PropTypes.array,
  genset_active_power_point: PropTypes.array,
  genset_reactive_power_point: PropTypes.array,
  genset_frequency_point: PropTypes.array,
  engine_fuel_level_point: PropTypes.array,
  engine_oil_pressure_point: PropTypes.array,
  engine_coolant_temperature_point: PropTypes.array,
  cumulative_engine_fuel_consumption_point: PropTypes.array,
  cumulative_fuel_efficiency_point: PropTypes.array,
  instantaneous_fuel_efficiency_point: PropTypes.array,
};

export default withTranslation()(GeneratorDetails);
