import React, { Fragment } from 'react';
import {
  Nav,
  UncontrolledDropdown,
  Media,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
  Input
} from 'reactstrap';
import PropTypes from 'prop-types';
import Avatar from '../common/Avatar';
import { Link } from 'react-router-dom';
import Flex from '../common/Flex';

const GroupMember = ({ avatarSize, showMembers, users, isShowMemberFixed, addMember, isTooltip, className }) => {
  return (
    <Nav className={`avatar-group mb-0 align-items-center ${className}`}>
      {users.slice(0, showMembers).map((user, index) => {
        return (
          <UncontrolledDropdown nav key={index}>
            <DropdownToggle nav caret={false} className={index > 0 ? 'ml-n1 p-0' : 'p-0'} id={`user-${user.id}`}>
              <Avatar src={user.avatar.src} size={avatarSize} />
            </DropdownToggle>
            <DropdownMenu className="dropdown-md px-0 py-3">
              <Media className="align-items-center px-3">
                <Avatar src={user.avatar.src} className="mr-2" size="2xl" />
                <Media body>
                  <h6 className="mb-0">
                    <Link className="text-900 stretched-link" to="/pages/profile">
                      {user.name}
                    </Link>
                  </h6>
                  <p className="fs--2 mb-0">{user.role}</p>
                </Media>
              </Media>
              <DropdownItem divider />
              <DropdownItem>Member Rule</DropdownItem>
              <DropdownItem className="text-danger">Remove Member</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        );
      })}
      {!isShowMemberFixed && (
        <UncontrolledDropdown nav>
          <DropdownToggle nav caret={false} className="ml-n1 p-0">
            {!addMember ? (
              <Avatar name={`${users.length - showMembers}+`} size={avatarSize} isExact mediaClass="avatar-button" />
            ) : (
              <Avatar icon="plus" size={avatarSize} mediaClass="avatar-button" />
            )}
          </DropdownToggle>
          <DropdownMenu className="dropdown-md">
            <h6 className="dropdown-header py-0 px-3 mb-0">{!addMember ? 'Board Members' : 'Select Member'}</h6>
            <DropdownItem divider />
            {!addMember ? (
              <Flex className="px-3">
                {users.map(user => (
                  <Link className="text-900 " to="/pages/profile" key={user.id} id={`Tooltip-${user.id}`}>
                    <Avatar src={user.avatar.src} className="mr-2" size="xl" />
                    <UncontrolledTooltip placement="top" target={`Tooltip-${user.id}`}>
                      {user.name}
                    </UncontrolledTooltip>
                  </Link>
                ))}
              </Flex>
            ) : (
              <Fragment>
                <form className="px-3 mb-2">
                  <Input placeholder="Search team member" bsSize="sm" />
                </form>
                <ul className="list-unstyled">
                  {users.map(user => (
                    <li key={user.id}>
                      <Media
                        tag="a"
                        className="align-items-center px-3 py-1 text-decoration-none"
                        href={`pages/profile`}
                      >
                        <Avatar src={user.avatar.src} className="mr-2" size={avatarSize} />
                        <Media body>
                          <h6 className="mb-0">{user.name}</h6>
                        </Media>
                      </Media>
                    </li>
                  ))}
                </ul>
              </Fragment>
            )}
          </DropdownMenu>
        </UncontrolledDropdown>
      )}
    </Nav>
  );
};

GroupMember.propTypes = {
  avatarSize: PropTypes.string.isRequired,
  showMembers: PropTypes.number,
  users: PropTypes.array.isRequired,
  isShowMemberFixed: PropTypes.bool,
  addMember: PropTypes.bool,
  isTooltip: PropTypes.bool,
  GroupMemberClassName: PropTypes.string
};

GroupMember.defaultProps = {
  isShowMemberFixed: false,
  addMember: false
};

export default GroupMember;
