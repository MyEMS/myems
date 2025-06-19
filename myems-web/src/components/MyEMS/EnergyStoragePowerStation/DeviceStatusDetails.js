import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Card, CardBody, Table } from 'reactstrap';

const DeviceStatusDetails = ({
  id,
  gatewayStatus,
  PCSStatus,
  BMSStatus,
  HVACStatus,
  gridMeterStatus,
  loadMeterStatus,
  t
}) => {
  return (
    <Card className="mb-3 fs--1">
      <Fragment>
        <CardBody className="pt-0">
          <Table borderless className="fs--1 mb-0">
            <tbody>
              <tr className="border-bottom">
                <th className="pl-0 pb-0">{t('Gateway')}</th>
                <th className="pr-0 text-right">{gatewayStatus}</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0">{t('PCS')}</th>
                <th className="pr-0 text-right">{PCSStatus}</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0">{t('BMS')}</th>
                <th className="pr-0 text-right ">{BMSStatus}</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0 pb-0">{t('HVAC')}</th>
                <th className="pr-0 text-right">{HVACStatus}</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0 pb-0">{t('Grid Meter')}</th>
                <th className="pr-0 text-right">{gridMeterStatus}</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0 pb-0">{t('Load Meter')}</th>
                <th className="pr-0 text-right">{loadMeterStatus}</th>
              </tr>
            </tbody>
          </Table>
        </CardBody>
      </Fragment>
    </Card>
  );
};

DeviceStatusDetails.propTypes = {
  id: PropTypes.number.isRequired,
  gateway_status: PropTypes.string.isRequired,
  pcs_status: PropTypes.string.isRequired,
  bms_status: PropTypes.string.isRequired,
  hvac_status: PropTypes.string.isRequired,
  grid_meter_status: PropTypes.string.isRequired,
  load_meter_status: PropTypes.string.isRequired
};

export default withTranslation()(DeviceStatusDetails);
