import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const LoadDetails = ({
  id,
  name,
  total_active_power_point,
  total_reactive_power_point,
  power_consumption_point,
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
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>{name}</th>
              {(total_active_power_point[0] !== null) && (<th>{t('Total Active Power')}: {total_active_power_point[0]} {total_active_power_point[1]}</th>)}
              {(total_reactive_power_point[0] !== null) && (<th>{t('Total Reactive Power')}: {total_reactive_power_point[0]} {total_reactive_power_point[1]}</th>)}
              {(power_consumption_point[0] !== null) && (<th>{t('Power Consumption')}: {power_consumption_point[0]} {power_consumption_point[1]}</th>)}
            </tr>
            <tr>
              {(phase_a_voltage_point[0] !== null) && (<td>{t('Phase A Voltage')}: {phase_a_voltage_point[0]} {phase_a_voltage_point[1]}</td>)}
              {(phase_b_voltage_point[0] !== null) && (<td>{t('Phase B Voltage')}: {phase_b_voltage_point[0]} {phase_b_voltage_point[1]}</td>)}
              {(phase_c_voltage_point[0] !== null) && (<td>{t('Phase C Voltage')}: {phase_c_voltage_point[0]} {phase_c_voltage_point[1]}</td>)}
            </tr>
            <tr>
              {(phase_a_current_point[0] !== null) && (<td>{t('Phase A Current')}: {phase_a_current_point[0]} {phase_a_current_point[1]}</td>)}
              {(phase_b_current_point[0] !== null) && (<td>{t('Phase B Current')}: {phase_b_current_point[0]} {phase_b_current_point[1]}</td>)}
              {(phase_c_current_point[0] !== null) && (<td>{t('Phase C Current')}: {phase_c_current_point[0]} {phase_c_current_point[1]}</td>)}
            </tr>
            <tr>
              {(phase_a_active_power_point[0] !== null) && (<td>{t('Phase A Active Power')}: {phase_a_active_power_point[0]} {phase_a_active_power_point[1]}</td>)}
              {(phase_b_active_power_point[0] !== null) && (<td>{t('Phase B Active Power')}: {phase_b_active_power_point[0]} {phase_b_active_power_point[1]}</td>)}
              {(phase_c_active_power_point[0] !== null) && (<td>{t('Phase C Active Power')}: {phase_c_active_power_point[0]} {phase_c_active_power_point[1]}</td>)}
            </tr>
            <tr>
              {(phase_a_reactive_power_point[0] !== null) && (<td>{t('Phase A Reactive Power')}: {phase_a_reactive_power_point[0]} {phase_a_reactive_power_point[1]}</td>)}
              {(phase_b_reactive_power_point[0] !== null) && (<td>{t('Phase B Reactive Power')}: {phase_b_reactive_power_point[0]} {phase_b_reactive_power_point[1]}</td>)}
              {(phase_c_reactive_power_point[0] !== null) && (<td>{t('Phase C Reactive Power')}: {phase_c_reactive_power_point[0]} {phase_c_reactive_power_point[1]}</td>)}
              {(power_factor_point[0] !== null) && (<td>{t('Power Factor')}: {power_factor_point[0]} {power_factor_point[1]}</td>)}
            </tr>
          </thead>
        </Table>

      </CardBody>
    </Card>
  );
};

LoadDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  total_active_power_point: PropTypes.array,
  total_reactive_power_point: PropTypes.array,
  power_consumption_point: PropTypes.array,
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
};

export default withTranslation()(LoadDetails);
