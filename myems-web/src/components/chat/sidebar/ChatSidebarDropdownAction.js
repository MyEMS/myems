import React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ChatSidebarDropdownAction = () => (
  <UncontrolledButtonDropdown
    className="dropdown-active-trigger position-absolute b-0 r-0 hover-actions"
    onClick={e => e.stopPropagation()}
  >
    <DropdownToggle color="link" className="text-400 p-0 fs-0">
      <FontAwesomeIcon icon="cog" transform="shrink-3 down-4" />
    </DropdownToggle>
    <DropdownMenu className="py-2 rounded-soft border">
      <DropdownItem className="cursor-pointer">Mute</DropdownItem>
      <DropdownItem divider />
      <DropdownItem className="cursor-pointer">Archive</DropdownItem>
      <DropdownItem className="cursor-pointer">Delete</DropdownItem>
      <DropdownItem divider />
      <DropdownItem className="cursor-pointer">Mark as Unread</DropdownItem>
      <DropdownItem className="cursor-pointer">Something 's Wrong</DropdownItem>
      <DropdownItem className="cursor-pointer">Ignore Messages</DropdownItem>
      <DropdownItem className="cursor-pointer">Block Messages</DropdownItem>
    </DropdownMenu>
  </UncontrolledButtonDropdown>
);

export default ChatSidebarDropdownAction;
