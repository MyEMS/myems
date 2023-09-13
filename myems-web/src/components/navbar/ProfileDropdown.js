import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DropdownItem, DropdownMenu, DropdownToggle, Dropdown } from 'reactstrap';
import teamavatar from '../../assets/img/team/avatar.png';
import Avatar from '../common/Avatar';
import { withTranslation } from 'react-i18next';


const ProfileDropdown = ({ t }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(prevState => !prevState);
  return (
    <Dropdown
      nav
      inNavbar
      isOpen={dropdownOpen}
      toggle={toggle}
      onMouseOver={() => {
        let windowWidth = window.innerWidth;
        windowWidth > 992 && setDropdownOpen(true);
      }}
      onMouseLeave={() => {
        let windowWidth = window.innerWidth;
        windowWidth > 992 && setDropdownOpen(false);
      }}
    >
      <DropdownToggle nav className="pr-0">
        <Avatar src={teamavatar} />
        {/* <Avatar /> */}
      </DropdownToggle>
      <DropdownMenu right className="dropdown-menu-card">
        <div className="bg-white rounded-soft py-2">
          {/* <DropdownItem className="font-weight-bold text-warning" href="#!">
            <FontAwesomeIcon icon="crown" className="mr-1" />
            <span>Go Pro</span>
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem href="#!">Set status</DropdownItem>
          <DropdownItem tag={Link} to="/pages/profile">
            Profile &amp; account
          </DropdownItem> */}
          <DropdownItem href="https://myems.io">{t('Feedback')}</DropdownItem>
          <DropdownItem divider />
          <DropdownItem tag={Link} to="/authentication/basic/change-password">
            {t('Change Password')}
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem tag={Link} to="/authentication/basic/logout">
            {t('Logout')}
          </DropdownItem>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default  withTranslation()(ProfileDropdown);
