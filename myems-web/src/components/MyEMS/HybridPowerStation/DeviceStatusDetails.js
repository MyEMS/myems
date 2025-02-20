import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const DeviceStatusDetails = ({
  id,
  MCUStatus,
  generatorStatus,
  PCSStatus,
  BMSStatus,
  CMStatus,
  PVStatus,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <Fragment>
        <CardBody className="pt-0">
          <Table borderless className="fs--1 mb-0">
            <tbody>
              <tr className="border-bottom">
                <th className="pl-0 pb-0">MCU</th>
                <th className="pr-0 text-right">{MCUStatus}正常</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0 pb-0">{t('Generator')}</th>
                <th className="pr-0 text-right">{generatorStatus}正常</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0">PCS</th>
                <th className="pr-0 text-right">{PCSStatus}正常</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0">BMS</th>
                <th className="pr-0 text-right ">{BMSStatus}正常</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0 pb-0">CM</th>
                <th className="pr-0 text-right">{CMStatus}正常</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0 pb-0">PV</th>
                <th className="pr-0 text-right">{PVStatus}正常</th>
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
  MCUStatus: PropTypes.number,
  generatorStatus: PropTypes.number,
  PCSStatus: PropTypes.number,
  BMSStatus: PropTypes.number,
  CMStatus: PropTypes.number,
  PVStatus: PropTypes.number,
};

export default withTranslation()(DeviceStatusDetails);
