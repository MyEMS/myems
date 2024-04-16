import React, { useState } from 'react';
import EnergyStoragePowerStationTable from './EnergyStoragePowerStationTable';
import FalconCardHeader from '../../common/FalconCardHeader';
import { InputGroup, CustomInput, Button, Card, CardBody } from 'reactstrap';
import ButtonIcon from '../../common/ButtonIcon';

const EnergyStoragePowerStationTableCard = ({ energyStoragePowerStationList, t }) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Card className="mb-3">
      <FalconCardHeader title="储能电站列表" light={false}>
        {isSelected ? (
          <InputGroup size="sm" className="input-group input-group-sm">
            <CustomInput
              type="select"
              id="bulk-select"
              bsSize="sm">
              <option>Bulk actions</option>
              <option value="Refund">Refund</option>
              <option value="Delete">Delete</option>
              <option value="Archive">Archive</option>
            </CustomInput>
            <Button color="falcon-default" size="sm" className="ml-2">
              Apply
            </Button>
          </InputGroup>
        ) : (
          <>
            {/* <ButtonIcon icon="plus" transform="shrink-3 down-2" color="falcon-default" size="sm">
              New
            </ButtonIcon>
            <ButtonIcon icon="filter" transform="shrink-3 down-2" color="falcon-default" size="sm" className="mx-2">
              Filter
            </ButtonIcon>
            <ButtonIcon icon="external-link-alt" transform="shrink-3 down-2" color="falcon-default" size="sm">
              Export
            </ButtonIcon> */}
          </>
        )}
      </FalconCardHeader>
      <CardBody className="p-0">
        <EnergyStoragePowerStationTable setIsSelected={setIsSelected}  energyStoragePowerStationList={energyStoragePowerStationList}/>
      </CardBody>
    </Card>
  );
};

export default EnergyStoragePowerStationTableCard;
