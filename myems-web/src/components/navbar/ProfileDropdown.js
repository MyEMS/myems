import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DropdownItem, DropdownMenu, DropdownToggle, Dropdown } from 'reactstrap';
import teamavatar from '../../assets/img/team/avatar.png';
import Avatar from '../common/Avatar';
import { withTranslation } from 'react-i18next';
import { getCookieValue } from '../../helpers/utils';

const ProfileDropdown = ({ t }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(prevState => !prevState);
  const displayName = getCookieValue('user_display_name') || 'User';
  return (
    <Dropdown
      nav
      inNavbar
      isOpen={dropdownOpen}
      toggle={toggle}
      onMouseOver={() => { if(window.innerWidth > 992) setDropdownOpen(true); }}
      onMouseLeave={() => { if(window.innerWidth > 992) setDropdownOpen(false); }}
    >
      <DropdownToggle nav className="pr-0 d-flex flex-center">
        <Avatar src={teamavatar} />
      </DropdownToggle>
      <DropdownMenu right className="dropdown-menu-card">
        <div className="bg-white rounded-soft py-2">
          <DropdownItem header style={{ textTransform: 'none' }}>
            {displayName}
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem href="https://myems.cn">{t('Feedback')}</DropdownItem>
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

export default withTranslation()(ProfileDropdown);
