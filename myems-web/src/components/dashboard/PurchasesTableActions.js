import React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PurchasesTableActions = () => (
  <UncontrolledDropdown>
    <DropdownToggle color="link" size="sm" className="text-600 btn-reveal">
      <FontAwesomeIcon icon="ellipsis-h" className="fs--1" />
    </DropdownToggle>
    <DropdownMenu right className="border py-2">
      <DropdownItem>View</DropdownItem>
      <DropdownItem>Edit</DropdownItem>
      <DropdownItem>Refund</DropdownItem>
      <DropdownItem divider />
      <DropdownItem className="text-warning">Archive</DropdownItem>
      <DropdownItem className="text-danger">Delete</DropdownItem>
    </DropdownMenu>
  </UncontrolledDropdown>
);

export default PurchasesTableActions;
