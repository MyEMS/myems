import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ModalSideContent = () => {
  return (
    <>
      <h6 className="mt-5 mt-lg-0">Add To Card</h6>
      <Nav vertical className="flex-lg-column fs--1">
        <NavItem className="mr-2 mr-lg-0">
          <NavLink href="#" className="nav-link-card-details ">
            <FontAwesomeIcon icon="user" className="mr-2" />
            <span>Members</span>
          </NavLink>
        </NavItem>
        <NavItem className="mr-2 mr-lg-0">
          <NavLink href="#" className="nav-link-card-details ">
            <FontAwesomeIcon icon="tag" className="mr-2" />
            <span>Label</span>
          </NavLink>
        </NavItem>
        <NavItem className="mr-2 mr-lg-0">
          <NavLink href="#" className="nav-link-card-details ">
            <FontAwesomeIcon icon="paperclip" className="mr-2" />
            <span>Attachments</span>
          </NavLink>
        </NavItem>
        <NavItem className="mr-2 mr-lg-0">
          <NavLink href="#" className="nav-link-card-details ">
            <FontAwesomeIcon icon="check" className="mr-2" />
            <span>Checklists</span>
          </NavLink>
        </NavItem>
      </Nav>
      <h6 className="mt-3">Actions</h6>
      <Nav vertical className="flex-lg-column fs--1">
        <NavItem className="mr-2 mr-lg-0">
          <NavLink href="#" className="nav-link-card-details ">
            <FontAwesomeIcon icon="copy" className="mr-2" />
            <span>Copy</span>
          </NavLink>
        </NavItem>
        <NavItem className="mr-2 mr-lg-0">
          <NavLink href="#" className="nav-link-card-details ">
            <FontAwesomeIcon icon="arrow-right" className="mr-2" />
            <span>Move</span>
          </NavLink>
        </NavItem>
        <NavItem className="mr-2 mr-lg-0">
          <NavLink href="#" className="nav-link-card-details ">
            <FontAwesomeIcon icon="trash-alt" className="mr-2" />
            <span>Remove</span>
          </NavLink>
        </NavItem>
      </Nav>
    </>
  );
};

export default ModalSideContent;
