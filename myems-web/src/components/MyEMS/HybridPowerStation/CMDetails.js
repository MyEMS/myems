import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const CMDetails = ({
  id,
  name,
  operating_status_point,
  power_point,
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
              </tr>
          </thead>
          <tbody>
            <tr>
              {(power_point[0 ] !== null) && (<td>{t('Power')}: {power_point[0]} {power_point[1]}</td>)}
            </tr>
          </tbody>
        </Table>

      </CardBody>
    </Card>
  );
};

CMDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  operating_status_point: PropTypes.array,
  power_point: PropTypes.array,
};

export default withTranslation()(CMDetails);
