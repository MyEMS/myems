import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const PVDetails = ({
  id,
  name,
  operating_status_point,
  active_power_point,
  reactive_power_point,
  daily_power_generation_point,
  total_power_generation_point,
  ambient_temperature_point,
  core_heatsink_temperature_point,
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
            </tr>
          </thead>
          <tbody>
            <tr>
              {(active_power_point[0] !== null) && (<td>{t('Active Power')}: {active_power_point[0]} {active_power_point[1]}</td>)}
              {(reactive_power_point[0] !== null) && (<td>{t('Reactive Power')}: {reactive_power_point[0]} {reactive_power_point[1]}</td>)}
              {(daily_power_generation_point[0] !== null) && (<td>{t('Daily Power Generation')}: {daily_power_generation_point[0]} {daily_power_generation_point[1]}</td>)}
              {(total_power_generation_point[0] !== null) && (<td>{t('Total Power Generation')}: {total_power_generation_point[0]} {total_power_generation_point[1]}</td>)}
            </tr>
            <tr>
              {(ambient_temperature_point[0] !== null) && (<td>{t('Ambient Temperature')}: {ambient_temperature_point[0]} {ambient_temperature_point[1]}</td>)}
              {(core_heatsink_temperature_point[0] !== null) && (<td>{t('Core Heatsink Temperature')}: {core_heatsink_temperature_point[0]} {core_heatsink_temperature_point[1]}</td>)}
            </tr>
          </tbody>
        </Table>

      </CardBody>
    </Card>
  );
};

PVDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  operating_status_point: PropTypes.array,
  active_power_point: PropTypes.array,
  reactive_power_point: PropTypes.array,
  daily_power_generation_point: PropTypes.array,
  total_power_generation_point: PropTypes.array,
  ambient_temperature_point: PropTypes.array,
  core_heatsink_temperature_point: PropTypes.array,
};

export default withTranslation()(PVDetails);
