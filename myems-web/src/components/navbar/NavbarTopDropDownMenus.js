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
      createCookie('is_logged_in', true, 1000 * 60 * 10 * 1);
      createCookie('user_name', user_name, 1000 * 60 * 10 * 1);
      createCookie('user_display_name', user_display_name, 1000 * 60 * 10 * 1);
      createCookie('user_uuid', user_uuid, 1000 * 60 * 10 * 1);
      createCookie('token', token, 1000 * 60 * 10 * 1);
    }
  });

  useEffect(() => {
    let timer = setInterval(() => {
      let is_logged_in = getCookieValue('is_logged_in');
      if (is_logged_in === null || !is_logged_in) {
        setRedirectUrl(`/authentication/basic/login`);
        setRedirect(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [])

  const { isCombo, isTopNav } = useContext(AppContext);
  // const components = [componentRoutes, pluginRoutes, utilityRoutes];
  // const pages = [pageRoutes, kanbanRoutes, widgetsRoutes, chatRoutes, emailRoutes, ECommerceRoutes];
  const handleSetNavbarCollapsed = () => {
    const windowWidth = window.innerWidth;
    isTopNav && !isCombo && windowWidth < breakpoints[topNavbarBreakpoint] && setNavbarCollapsed(false);
    isCombo && windowWidth < breakpoints[navbarBreakPoint] && setShowBurgerMenu(false);
  };
  const isLanding = getPageName('landing');
  const [ showRoutes, setShowRoutes] = useState([routes[0]]);

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
        let showRoutes = [routes[0]];
        for (let i = 0; i < routes.length; i++) {
          let route = routes[i];
          if(route.to in json && 'children' in route) {
            let showChildren = [];
            for (let j = 0; j < route.children.length; j++) {
              const child = route.children[j];
              if(json[route.to].indexOf(child.to) !== -1) {
                showChildren.push(child);
              }
            }
            route.children = showChildren;

            showRoutes.push(route)
          }else if(route.to in json) {
            showRoutes.push(route)
          }
        }
        setShowRoutes(showRoutes);
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });
  }, []);

  return (
    <>
      {showRoutes.map(route =>
        {
          if ('children' in route) {
            return(
                <NavbarDropdownComponents
                  key={route.name}
                  title={t(route.name)}
                  items={[route]}
                  handleSetNavbarCollapsed={handleSetNavbarCollapsed}
                />
            )
          } else {
            return (
              <NavItem onClick={handleSetNavbarCollapsed} key={route.name}>
                <NavLink className="nav-link" to={route.to}>
                  {t(route.name)}
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
    </>
  );
};

NavbarTopDropDownMenus.propTypes = { setNavbarCollapsed: PropTypes.func.isRequired };

export default withTranslation()(withRedirect(NavbarTopDropDownMenus));
