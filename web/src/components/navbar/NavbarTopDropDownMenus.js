import React from 'react';
import PropTypes from 'prop-types';
import NavbarDropdown from './NavbarDropdown';
import NavbarDropdownComponents from './NavbarDropdownComponents';
import {
  // authenticationRoutes,
  // chatRoutes,
  // componentRoutes,
  // ECommerceRoutes,
  // emailRoutes,
  // homeRoutes,
  // pageRoutes,
  // pluginRoutes,
  // utilityRoutes,
  // widgetsRoutes,
  // kanbanRoutes,
  dashboardRoutes,
  spaceRoutes,
  equipmentRoutes,
  meterRoutes,
  tenantRoutes,
  storeRoutes,
  shopfloorRoutes,
  combinedEquipmentRoutes,
  auxiliarySystemRoutes,
  fddRoutes,
  monitoringRoutes,
  advancedReportingRoutes,
  knowledgeBaseRoutes
} from '../../routes';
import { NavItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { breakpoints } from '../../helpers/utils';
import { topNavbarBreakpoint } from '../../config';
import { withTranslation } from 'react-i18next';


const NavbarTopDropDownMenus = ({ setNavbarCollapsed, t }) => {
  // const components = [componentRoutes, pluginRoutes, utilityRoutes];
  // const pages = [pageRoutes, kanbanRoutes, widgetsRoutes, chatRoutes, emailRoutes, ECommerceRoutes];
  const handleSetNavbarCollapsed = () => {
    const windowWidth = window.innerWidth;
    windowWidth < breakpoints[topNavbarBreakpoint] && setNavbarCollapsed(false);
  };

  return (
    <>
      {/*<NavbarDropdown
        title={homeRoutes.name}
        items={homeRoutes.children}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
       <NavbarDropdown title={pageRoutes.name} items={pages} handleSetNavbarCollapsed={handleSetNavbarCollapsed} />
      <NavbarDropdownComponents
        title={componentRoutes.name}
        items={components}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
      <NavbarDropdown
        title={authenticationRoutes.name}
        items={authenticationRoutes.children}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />

      <NavItem onClick={handleSetNavbarCollapsed}>
        <NavLink className="nav-link" to="/documentation">
          Documentation
        </NavLink>
      </NavItem> */}
      <NavItem onClick={handleSetNavbarCollapsed}>
        <NavLink className="nav-link" to={dashboardRoutes.to}>
          {t(dashboardRoutes.name)}
        </NavLink>
      </NavItem>
      <NavbarDropdownComponents
        title={t(spaceRoutes.name)}
        items={[spaceRoutes]}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
      <NavbarDropdownComponents
        title={t(equipmentRoutes.name)}
        items={[equipmentRoutes]}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
      <NavbarDropdownComponents
        title={t(meterRoutes.name)}
        items={[meterRoutes]}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
      <NavbarDropdownComponents
        title={t(tenantRoutes.name)}
        items={[tenantRoutes]}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
      <NavbarDropdownComponents
        title={t(storeRoutes.name)}
        items={[storeRoutes]}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
      <NavbarDropdownComponents
        title={t(shopfloorRoutes.name)}
        items={[shopfloorRoutes]}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
      <NavbarDropdownComponents
        title={t(combinedEquipmentRoutes.name)}
        items={[combinedEquipmentRoutes]}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
      <NavbarDropdownComponents
        title={t(auxiliarySystemRoutes.name)}
        items={[auxiliarySystemRoutes]}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
      <NavbarDropdownComponents
        title={t(fddRoutes.name)}
        items={[fddRoutes]}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
      <NavbarDropdownComponents
        title={t(monitoringRoutes.name)}
        items={[monitoringRoutes]}
        handleSetNavbarCollapsed={handleSetNavbarCollapsed}
      />
      <NavItem onClick={handleSetNavbarCollapsed}>
        <NavLink className="nav-link" to={advancedReportingRoutes.to}>
          {t(advancedReportingRoutes.name)}
        </NavLink>
      </NavItem>
      <NavItem onClick={handleSetNavbarCollapsed}>
        <NavLink className="nav-link" to={knowledgeBaseRoutes.to}>
          {t(knowledgeBaseRoutes.name)}
        </NavLink>
      </NavItem>
    </>
  );
};

NavbarTopDropDownMenus.propTypes = { setNavbarCollapsed: PropTypes.func.isRequired };

export default withTranslation()(NavbarTopDropDownMenus);
