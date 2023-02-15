import React from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';

const ToggleButton = ({ isNavbarVerticalCollapsed, setIsNavbarVerticalCollapsed, t }) => (
  <>
    <UncontrolledTooltip placement="left" target="toggleNavigationTooltip">
      {t('Toggle Navigation')}
    </UncontrolledTooltip>
    <div className="toggle-icon-wrapper">
      <Button
        color="link"
        className="navbar-toggler-humburger-icon navbar-vertical-toggle"
        id="toggleNavigationTooltip"
        onClick={() => {
          document.getElementsByTagName('html')[0].classList.toggle('navbar-vertical-collapsed');
          setIsNavbarVerticalCollapsed(!isNavbarVerticalCollapsed);
        }}
      >
        <span className="navbar-toggle-icon">
          <span className="toggle-line" />
        </span>
      </Button>
    </div>
  </>
);

export default withTranslation()(ToggleButton);
