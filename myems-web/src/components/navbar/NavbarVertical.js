import classNames from 'classnames';
import is from 'is_js';
import PropTypes from 'prop-types';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Button, Collapse, Nav, Navbar, NavItem} from 'reactstrap';
import bgNavbarImg from '../../assets/img/generic/bg-navbar.png';
import {APIBaseURL, navbarBreakPoint, topNavbarBreakpoint} from '../../config';
import AppContext from '../../context/Context';
import routes from '../../routes';
import Flex from '../common/Flex';
import Logo from './Logo';
import NavbarTopDropDownMenus from './NavbarTopDropDownMenus';
import NavbarVerticalMenu from './NavbarVerticalMenu';
import ToggleButton from './ToggleButton';
import { withTranslation } from 'react-i18next';
import {createCookie, getCookieValue} from "../../helpers/utils";
import {toast} from "react-toastify";
import withRedirect from "../../hoc/withRedirect";

const NavbarVertical = ({ setRedirectUrl, setRedirect, navbarStyle, t }) => {

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
  }, []);

  const navBarRef = useRef(null);

  const {
    showBurgerMenu,
    isNavbarVerticalCollapsed,
    setIsNavbarVerticalCollapsed,
    isCombo,
    setShowBurgerMenu,
    setNavbarCollapsed
  } = useContext(AppContext);

  const HTMLClassList = document.getElementsByTagName('html')[0].classList;
  //Control Component did mount and unmounted of hover effect
  if (isNavbarVerticalCollapsed) {
    HTMLClassList.add('navbar-vertical-collapsed');
  }

  const [ showRoutes, setShowRoutes] = useState([routes[0]]);

  useEffect(() => {
    if (is.windows()) {
      HTMLClassList.add('windows');
    }
    if (is.chrome()) {
      HTMLClassList.add('chrome');
    }
    if (is.firefox()) {
      HTMLClassList.add('firefox');
    }
    return () => {
      HTMLClassList.remove('navbar-vertical-collapsed-hover');
    };
  }, [isNavbarVerticalCollapsed, HTMLClassList]);

  //Control mouseEnter event
  let time = null;
  const handleMouseEnter = () => {
    if (isNavbarVerticalCollapsed) {
      time = setTimeout(() => {
        HTMLClassList.add('navbar-vertical-collapsed-hover');
      }, 100);
    }
  };

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
  }, [ ]);

  return (
    <Navbar
      expand={navbarBreakPoint}
      className={classNames('navbar-vertical navbar-glass', {
        [`navbar-${navbarStyle}`]: navbarStyle !== 'transparent'
      })}
      light
    >
      <Flex align="center">
        <ToggleButton
          isNavbarVerticalCollapsed={isNavbarVerticalCollapsed}
          setIsNavbarVerticalCollapsed={setIsNavbarVerticalCollapsed}
        />
        <Logo at="navbar-vertical" width={40} />
      </Flex>

      <Collapse
        navbar
        isOpen={showBurgerMenu}
        className="scrollbar"
        innerRef={navBarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => {
          clearTimeout(time);
          HTMLClassList.remove('navbar-vertical-collapsed-hover');
        }}
        style={
          navbarStyle === 'vibrant' && {
            backgroundImage: `linear-gradient(-45deg, rgba(0, 160, 255, 0.86), #0048a2),url(${bgNavbarImg})`
          }
        }
      >
        <Nav navbar vertical>
          <NavbarVerticalMenu routes={showRoutes} />
        </Nav>
        <div className="settings px-3 px-xl-0">
          {isCombo && (
            <div className={`d-${topNavbarBreakpoint}-none`}>
              <div className="navbar-vertical-divider">
                <hr className="navbar-vertical-hr my-2" />
              </div>
              <Nav navbar>
                <NavbarTopDropDownMenus setNavbarCollapsed={setNavbarCollapsed} setShowBurgerMenu={setShowBurgerMenu} />
              </Nav>
            </div>
          )}
          <div className="navbar-vertical-divider">
            <hr className="navbar-vertical-hr my-2" />
          </div>
          <Button
            tag={'a'}
            href="https://myems.io"
            target="_blank"
            color="primary"
            size="sm"
            block
            className="my-3 btn-purchase"
          >
            {t('Purchase')}
          </Button>
        </div>
      </Collapse>
    </Navbar>
  );
};

NavbarVertical.protoTypes = {
  navbarStyle: PropTypes.string
};

NavbarVertical.defaultProps = {
  navbarStyle: 'transparent'
};

export default withTranslation()(withRedirect(NavbarVertical));
