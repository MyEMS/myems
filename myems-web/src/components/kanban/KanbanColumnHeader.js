import React from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const KanbanColumnHeder = ({ kanbanColumnItem }) => {
  return (
    <div className="kanban-column-header">
      <h5 className="text-serif fs-0 mb-0">
        {kanbanColumnItem.name} <span className="text-500">({kanbanColumnItem.items.length})</span>
      </h5>
      <UncontrolledDropdown className="text-sans-serif btn-reveal-trigger">
        <DropdownToggle color="reveal" size="sm" className="py-0 px-2">
          <FontAwesomeIcon icon="ellipsis-h" />
        </DropdownToggle>
        <DropdownMenu right className="py-0">
          <DropdownItem>Add Card</DropdownItem>
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem>Copy link</DropdownItem>
          <DropdownItem divider />
          <DropdownItem className="text-danger">Remove</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  );
};

export default KanbanColumnHeder;
