import React, { useState } from 'react';
import HybridPowerStationTable from './HybridPowerStationTable';
import FalconCardHeader from '../../common/FalconCardHeader';
import { Card, CardBody } from 'reactstrap';
import { withTranslation } from 'react-i18next';

const HybridPowerStationTableCard = ({ hybridPowerStationList, t }) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Card className="mb-3">
      <FalconCardHeader title={t("Energy Storage Power Station List")} light={false}>
      </FalconCardHeader>
      <CardBody className="p-0">
        <HybridPowerStationTable setIsSelected={setIsSelected}  hybridPowerStationList={hybridPowerStationList}/>
      </CardBody>
    </Card>
  );
};

export default withTranslation()(HybridPowerStationTableCard);
