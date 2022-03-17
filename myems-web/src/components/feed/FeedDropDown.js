import React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FeedDropDown = () => {
  return (
    <UncontrolledDropdown>
      <DropdownToggle color="Secondary" size="sm" className="p-0">
        <FontAwesomeIcon icon="ellipsis-h" />
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem>View</DropdownItem>
        <DropdownItem>Edit</DropdownItem>
        <DropdownItem>Report</DropdownItem>
        <DropdownItem divider />
        <DropdownItem className="text-warning">Archive</DropdownItem>
        <DropdownItem className="text-danger">Delete</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default FeedDropDown;
