import React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CardDropdown = () => (
  <UncontrolledDropdown className="text-sans-serif btn-reveal-trigger">
    <DropdownToggle color="link" size="sm" className="btn-reveal text-600">
      <FontAwesomeIcon icon="ellipsis-h" className="fs--2" />
    </DropdownToggle>
    <DropdownMenu right className="border py-0">
      <div className="bg-white py-2">
        <DropdownItem>View</DropdownItem>
        <DropdownItem>Export</DropdownItem>
        <DropdownItem divider />
        <DropdownItem className="text-danger">Remove</DropdownItem>
      </div>
    </DropdownMenu>
  </UncontrolledDropdown>
);

export default CardDropdown;
