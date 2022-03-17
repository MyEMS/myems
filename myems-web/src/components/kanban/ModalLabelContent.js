import React from 'react';
import { Button, Badge, UncontrolledButtonDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap';
import { labels } from '../../data/kanban/kanbanItems';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ModalLabelContent = () => {
  return (
    <>
      {labels.slice(0, 3).map(label => {
        return (
          <Badge className={`badge-soft-${label.type} mr-1 py-2`} key={label.type}>
            {label.text}
          </Badge>
        );
      })}

      <UncontrolledButtonDropdown direction="right">
        <DropdownToggle caret size="sm" color="secondary" className="px-2 fsp-75 bg-400 border-400 dropdown-caret-none">
          <FontAwesomeIcon icon="plus" />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header className="py-0 px-3 mb-0">
            Select Label
          </DropdownItem>
          <DropdownItem divider />
          <div className="px-3">
            {labels.map(label => {
              return (
                <button className={`badge-soft-${label.type} rounded mb-2 dropdown-item`} key={label.type}>
                  {label.text}
                </button>
              );
            })}
          </div>
          <DropdownItem divider />
          <div className="px-3">
            <Button size="sm" block color="outline-secondary" className="border-400">
              Create Label
            </Button>
          </div>
        </DropdownMenu>
      </UncontrolledButtonDropdown>
    </>
  );
};

export default ModalLabelContent;
