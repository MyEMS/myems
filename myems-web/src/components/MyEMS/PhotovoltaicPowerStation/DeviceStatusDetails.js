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
                <th className="pl-0 pb-0">通信网关</th>
                <th className="pr-0 text-right">{gatewayStatus}正常</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0">PCS</th>
                <th className="pr-0 text-right">{PCSStatus}正常</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0">电池</th>
                <th className="pr-0 text-right ">{BMSStatus}正常</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0 pb-0">空调</th>
                <th className="pr-0 text-right">{HVACStatus}正常</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0 pb-0">电网表</th>
                <th className="pr-0 text-right">{gridMeterStatus}正常</th>
              </tr>
              <tr className="border-bottom">
                <th className="pl-0 pb-0">负载表</th>
                <th className="pr-0 text-right">{loadMeterStatus}正常</th>
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
  gateway_status: PropTypes.number,
  pcs_status: PropTypes.number,
  bms_status: PropTypes.number,
  hvac_status: PropTypes.number,
  grid_meter_status: PropTypes.number,
  load_meter_status: PropTypes.number,
};

export default withTranslation()(DeviceStatusDetails);
