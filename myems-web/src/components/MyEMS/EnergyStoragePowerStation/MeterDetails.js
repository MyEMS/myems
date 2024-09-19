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
  total_active_power_point,
  active_power_a_point,
  active_power_b_point,
  active_power_c_point,
  total_reactive_power_point,
  reactive_power_a_point,
  reactive_power_b_point,
  reactive_power_c_point,
  total_apparent_power_point,
  apparent_power_a_point,
  apparent_power_b_point,
  apparent_power_c_point,
  total_power_factor_point,
  active_energy_import_point,
  active_energy_export_point,
  active_energy_net_point,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>{name}</th>
              <th>{t('Total Active Power')}: {total_active_power_point} kW</th>
              <th>{t('Active Power A')}: {active_power_a_point} kW</th>
              <th>{t('Active Power B')}: {active_power_b_point} kW</th>
              <th>{t('Active Power C')}: {active_power_c_point} W</th>
            </tr>
            <tr>
              <th>{t('Total Power Factor')}: {total_power_factor_point}</th>
              <th>{t('Total Reactive Power')}: {total_reactive_power_point} kW</th>
              <th>{t('Reactive Power A')}: {reactive_power_a_point} kW</th>
              <th>{t('Reactive Power B')}: {reactive_power_b_point} kW</th>
              <th>{t('Reactive Power C')}: {reactive_power_c_point} W</th>
            </tr>
            <tr>
              <th>-</th>
              <th>{t('Total Apparent Power')}: {total_apparent_power_point} kW</th>
              <th>{t('Apparent Power A')}: {apparent_power_a_point} kW</th>
              <th>{t('Apparent Power B')}: {apparent_power_b_point} kW</th>
              <th>{t('Apparent Power C')}: {apparent_power_c_point} W</th>
            </tr>
            <tr>
              <th>-</th>
              <th>{t('Active Energy Import')}: {active_energy_import_point} kWh</th>
              <th>{t('Active Energy Export')}: {active_energy_export_point} kWh</th>
              <th>{t('Active Energy Net')}: {active_energy_net_point} kWh</th>
              <th>-</th>
            </tr>
          </thead>
        </Table>

      </CardBody>
    </Card>
  );
};

MeterDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  total_active_power_point: PropTypes.number,
  active_power_a_point: PropTypes.number,
  active_power_b_point: PropTypes.number,
  active_power_c_point: PropTypes.number,
  total_reactive_power_point: PropTypes.number,
  reactive_power_a_point: PropTypes.number,
  reactive_power_b_point: PropTypes.number,
  reactive_power_c_point: PropTypes.number,
  total_apparent_power_point: PropTypes.number,
  apparent_power_a_point: PropTypes.number,
  apparent_power_b_point: PropTypes.number,
  apparent_power_c_point: PropTypes.number,
  total_power_factor_point: PropTypes.number,
  active_energy_import_point: PropTypes.number,
  active_energy_export_point: PropTypes.number,
  active_energy_net_point: PropTypes.number,
};

export default withTranslation()(MeterDetails);
