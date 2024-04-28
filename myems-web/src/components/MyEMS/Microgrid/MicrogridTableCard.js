import React, { useState } from 'react';
import MicrogridTable from './MicrogridTable';
import FalconCardHeader from '../../common/FalconCardHeader';
import { InputGroup, CustomInput, Button, Card, CardBody } from 'reactstrap';
import ButtonIcon from '../../common/ButtonIcon';
import { withTranslation } from 'react-i18next';

const MicrogridTableCard = ({ microgridList, t }) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Card className="mb-3">
      <FalconCardHeader title={t("Microgrid List")} light={false}>
      </FalconCardHeader>
      <CardBody className="p-0">
        <MicrogridTable setIsSelected={setIsSelected}  microgridList={microgridList}/>
      </CardBody>
    </Card>
  );
};

export default withTranslation()(MicrogridTableCard);
