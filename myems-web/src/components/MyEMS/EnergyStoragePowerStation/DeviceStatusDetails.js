import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Card, CardBody, Table } from 'reactstrap';

const DeviceStatusDetails = ({
  id,
  isOnline,
  PCSRunState,
  batteryOperatingState,
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
                <th className="pr-0 text-right">{isOnline ? t('Communication Online') : t('Communication Offline')}</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0">{t('PCS')}</th>
                <th className="pr-0 text-right"> {!isOnline ? t('PCS Unknown') :
                        PCSRunState === 'Running'
                        ? t('PCS Running')
                        : PCSRunState === 'Initializing'
                        ? t('PCS Initializing')
                        : PCSRunState === 'Standby'
                        ? t('PCS Standby')
                        : PCSRunState === 'Shutdown'
                        ? t('PCS Shutdown')
                        : PCSRunState === 'Fault'
                        ? t('PCS Fault')
                        : PCSRunState}</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0">{t('BMS')}</th>
                <th className="pr-0 text-right "> {!isOnline ? t('Battery Unknown') :
                        batteryOperatingState === 'Normal'
                        ? t('Battery Normal')
                        : batteryOperatingState === 'Standby'
                        ? t('Battery Standby')
                        : batteryOperatingState === 'ProhibitDisCharging'
                        ? t('Battery Prohibit DisCharging')
                        : batteryOperatingState === 'ProhibitCharging'
                        ? t('Battery Prohibit Charging')
                        : batteryOperatingState === 'Fault'
                        ? t('Battery Fault')
                        : batteryOperatingState === 'Warning'
                        ? t('Battery Warning')
                        : batteryOperatingState === 'Charging'
                        ? t('Battery Charging')
                        : batteryOperatingState === 'Discharging'
                        ? t('Battery Discharging')
                        : batteryOperatingState === 'Idle'
                        ? t('Battery Idle')
                        : batteryOperatingState === 'Reserved'
                        ? t('Battery Reserved')
                        : batteryOperatingState}</th>
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
  isOnline: PropTypes.bool.isRequired,
  PCSRunState: PropTypes.string.isRequired,
  batteryOperatingState: PropTypes.string.isRequired,
};

export default withTranslation()(DeviceStatusDetails);
