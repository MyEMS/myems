import React, { useState } from 'react';
import PhotovoltaicPowerStationTable from './PhotovoltaicPowerStationTable';
import FalconCardHeader from '../../common/FalconCardHeader';
import { Card, CardBody } from 'reactstrap';
import { withTranslation } from 'react-i18next';

const PhotovoltaicPowerStationTableCard = ({ photovoltaicPowerStationList, t }) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Card className="mb-3">
      <FalconCardHeader title={t("Photovoltaic Power Station List")} light={false}>
      </FalconCardHeader>
      <CardBody className="p-0">
        <PhotovoltaicPowerStationTable setIsSelected={setIsSelected}  photovoltaicPowerStationList={photovoltaicPowerStationList}/>
      </CardBody>
    </Card>
  );
};

export default withTranslation()(PhotovoltaicPowerStationTableCard);
