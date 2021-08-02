import React, {useContext, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import NavbarDropdown from './NavbarDropdown';
import NavbarDropdownComponents from './NavbarDropdownComponents';
// import {
//   // authenticationRoutes,
//   // chatRoutes,
//   // componentRoutes,
//   // ECommerceRoutes,
//   // emailRoutes,
//   // homeRoutes,
//   // pageRoutes,
//   // pluginRoutes,
//   // utilityRoutes,
//   // widgetsRoutes,
//   // kanbanRoutes,
//   dashboardRoutes,
//   spaceRoutes,
//   equipmentRoutes,
//   meterRoutes,
//   tenantRoutes,
//   storeRoutes,
//   shopfloorRoutes,
//   combinedEquipmentRoutes,
//   auxiliarySystemRoutes,
//   fddRoutes,
//   monitoringRoutes,
//   advancedReportingRoutes,
//   knowledgeBaseRoutes
// } from '../../routes';
import routes from '../../routes';
import { NavItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import {breakpoints, createCookie, getCookieValue, getPageName} from '../../helpers/utils';
import {APIBaseURL, navbarBreakPoint, topNavbarBreakpoint} from '../../config';
import AppContext from '../../context/Context';
import { withTranslation } from 'react-i18next';
import withRedirect from "../../hoc/withRedirect";
import {toast} from "react-toastify";


const NavbarTopDropDownMenus = ({ setRedirectUrl, setRedirect, setNavbarCollapsed, setShowBurgerMenu, t }) => {

  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (is_logged_in === null || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      //update expires time of cookies
      createCookie('is_logged_in', true, 1000 * 60 * 60 * 8);
      createCookie('user_name', user_name, 1000 * 60 * 60 * 8);
      createCookie('user_display_name', user_display_name, 1000 * 60 * 60 * 8);
      createCookie('user_uuid', user_uuid, 1000 * 60 * 60 * 8);
      createCookie('token', token, 1000 * 60 * 60 * 8);
    }
  });

  const { isCombo, isTopNav } = useContext(AppContext);
  // const components = [componentRoutes, pluginRoutes, utilityRoutes];
  // const pages = [pageRoutes, kanbanRoutes, widgetsRoutes, chatRoutes, emailRoutes, ECommerceRoutes];
  const handleSetNavbarCollapsed = () => {
    const windowWidth = window.innerWidth;
    isTopNav && !isCombo && windowWidth < breakpoints[topNavbarBreakpoint] && setNavbarCollapsed(false);
    isCombo && windowWidth < breakpoints[navbarBreakPoint] && setShowBurgerMenu(false);
  };
  const isLanding = getPageName('landing');
  const [ viewComponentArr, setViewComponentArr] = useState([routes[0]]);

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/menus/web', {
      method: 'GET',
      headers: {
        "Content-type": "application/json",
        "User-UUID": getCookieValue('user_uuid'),
        "Token": getCookieValue('token')
      },
      body: null,

    }).then(response => {
      //console.log(response);
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
    }).then(json => {
      //console.log(json);
      if (isResponseOK) {
        const selectJson = {...json}
        let newViewComponentArr = [routes[0]];
        for (let i = 0; i < routes.length; i++) {
          const route = routes[i];
          let tempComponent = {... route};
          if(route.to in selectJson && 'children' in route) {
            let tempChild = [];
            for (let j = 0; j < route.children.length; j++) {
              const child = route.children[j];
              if(selectJson[route.to].indexOf(child.to) !== -1) {
                tempChild.push(child);
              }
            }
            tempComponent.children = tempChild;

            newViewComponentArr.push(tempComponent)
          }else if(route.to in selectJson) {
            newViewComponentArr.push(tempComponent)
          }
        }
        setViewComponentArr(newViewComponentArr);
      } else {
        toast.error(json.description);
      }
    }).catch(err => {
      console.log(err);
    });
  }, []);

  return (
    <>
      {viewComponentArr.length !== 0 && viewComponentArr.map(arr =>
        {
          if ('children' in arr) {
            return(
                <NavbarDropdownComponents
                  title={t(arr.name)}
                  items={[arr]}
                  handleSetNavbarCollapsed={handleSetNavbarCollapsed}
                />
            )
          }else {
            return (
              <NavItem onClick={handleSetNavbarCollapsed}>
                <NavLink className="nav-link" to={arr.to}>
                  {t(arr.name)}
                </NavLink>
              </NavItem>
            )
          }
        }
      )}
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
      {/*<NavItem onClick={handleSetNavbarCollapsed}>
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
      </NavItem>*/}
    </>
  );
};

NavbarTopDropDownMenus.propTypes = { setNavbarCollapsed: PropTypes.func.isRequired };

export default withTranslation()(withRedirect(NavbarTopDropDownMenus));
