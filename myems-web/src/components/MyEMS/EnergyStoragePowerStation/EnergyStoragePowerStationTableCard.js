import React, { useState } from 'react';
import EnergyStoragePowerStationTable from './EnergyStoragePowerStationTable';
import FalconCardHeader from '../../common/FalconCardHeader';
import {Card, CardBody } from 'reactstrap';
import { withTranslation } from 'react-i18next';

const EnergyStoragePowerStationTableCard = ({ energyStoragePowerStationList, t }) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Card className="mb-3">
      <FalconCardHeader title={t("Energy Storage Power Station List")} light={false}>
      </FalconCardHeader>
      <CardBody className="p-0">
        <EnergyStoragePowerStationTable setIsSelected={setIsSelected}  energyStoragePowerStationList={energyStoragePowerStationList}/>
      </CardBody>
    </Card>
  );
};

export default withTranslation()(EnergyStoragePowerStationTableCard);
