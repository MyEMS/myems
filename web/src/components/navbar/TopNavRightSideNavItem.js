import React, { useContext } from 'react';
import { Nav, NavItem, NavLink, UncontrolledTooltip } from 'reactstrap';
import ProfileDropdown from './ProfileDropdown';
import NotificationDropdown from './NotificationDropdown';
import SettingsAnimatedIcon from './SettingsAnimatedIcon';
import CartNotification from './CartNotification';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import AppContext from '../../context/Context';

const TopNavRightSideNavItem = () => {
  const { isTopNav } = useContext(AppContext);
  return (
    <Nav navbar className="navbar-nav-icons ml-auto flex-row align-items-center">
      <NavItem>
        <SettingsAnimatedIcon />
      </NavItem>
      {isTopNav && (
        <NavItem className={`p-2 px-lg-0 cursor-pointer d-none d-sm-block`}>
          <NavLink tag={Link} to="/changelog" id="changelog">
            <FontAwesomeIcon icon="code-branch" transform="right-6 grow-4" />
          </NavLink>
          <UncontrolledTooltip autohide={false} placement="left" target="changelog">
            Changelog
          </UncontrolledTooltip>
        </NavItem>
      )}
      <CartNotification />
      <NotificationDropdown />
      <ProfileDropdown />
    </Nav>
  );
};

export default TopNavRightSideNavItem;
