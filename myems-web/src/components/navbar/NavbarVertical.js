import classNames from 'classnames';
import validator from 'validator'; 
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Collapse, Nav, Navbar } from 'reactstrap';
import bgNavbarImg from '../../assets/img/generic/bg-navbar.png';
import wechatQRCode from '../../assets/img/contact/wechat_qr_code.png';
import { APIBaseURL, settings, navbarBreakPoint, topNavbarBreakpoint } from '../../config';
import AppContext from '../../context/Context';
import routes from '../../routes';
import Flex from '../common/Flex';
import Logo from './Logo';
import NavbarTopDropDownMenus from './NavbarTopDropDownMenus';
import NavbarVerticalMenu from './NavbarVerticalMenu';
import ToggleButton from './ToggleButton';
import { withTranslation } from 'react-i18next';
import { createCookie, getCookieValue, checkEmpty } from '../../helpers/utils';
import { toast } from 'react-toastify';
import withRedirect from '../../hoc/withRedirect';

const NavbarVertical = ({ setRedirectUrl, setRedirect, navbarStyle, t }) => {
  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (checkEmpty(is_logged_in) || checkEmpty(token) || checkEmpty(user_uuid) || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      //update expires time of cookies
      createCookie('is_logged_in', true, settings.cookieExpireTime);
      createCookie('user_name', user_name, settings.cookieExpireTime);
      createCookie('user_display_name', user_display_name, settings.cookieExpireTime);
      createCookie('user_uuid', user_uuid, settings.cookieExpireTime);
      createCookie('token', token, settings.cookieExpireTime);
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
  }, [setRedirect, setRedirectUrl]);

  const navBarRef = useRef(null);

  const {
    showBurgerMenu,
    isNavbarVerticalCollapsed,
    setIsNavbarVerticalCollapsed,
    isDark,
    isCombo,
    setShowBurgerMenu,
    setNavbarCollapsed
  } = useContext(AppContext);

  const HTMLClassList = document.getElementsByTagName('html')[0].classList;
  //Control Component did mount and unmounted of hover effect
  if (isNavbarVerticalCollapsed) {
    HTMLClassList.add('navbar-vertical-collapsed');
  }

  const [showRoutes, setShowRoutes] = useState([routes[0]]);

  useEffect(() => {
    if (navigator.userAgent.includes('Windows')) {
      HTMLClassList.add('windows');
    }
    if (navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edg')) {
      HTMLClassList.add('chrome');
    }
    if (navigator.userAgent.includes('Firefox')) {
      HTMLClassList.add('firefox');
    }
    return () => {
      HTMLClassList.remove('navbar-vertical-collapsed-hover');
    };
  }, []);

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
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (checkEmpty(token) || checkEmpty(user_uuid)) return;

    fetch(APIBaseURL + '/menus/web', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      },
      body: null
    })
      .then(response => {
        //console.log(response);
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        //console.log(json);
        if (isResponseOK) {
          let showRoutes = [routes[0]];
          for (let i = 0; i < routes.length; i++) {
            let route = routes[i];
            if (route.to in json && 'children' in route) {
              let showChildren = [];
              for (let j = 0; j < route.children.length; j++) {
                const child = route.children[j];
                if (json[route.to].indexOf(child.to) !== -1) {
                  showChildren.push(child);
                }
              }
              route.children = showChildren;

              showRoutes.push(route);
            } else if (route.to in json) {
              showRoutes.push(route);
            }
          }

          setShowRoutes(showRoutes);
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        console.log(err);
      });
  }, [t]);

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
            href="https://myems.cn/docs/enterprise"
            target="_blank"
            color="primary"
            size="sm"
            block
            className="my-3 btn-purchase"
          >
            {t('Purchase')}
          </Button>
          <div
            className="mt-2 rounded border-0"
            style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.96)',
              boxShadow: isDark
                ? '0 2px 8px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                : '0 2px 8px rgba(17, 24, 39, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(17, 24, 39, 0.08)'}`
            }}
          >
            <div
              className="px-2 pt-2 pb-1"
              style={{
                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(17, 24, 39, 0.08)'}`
              }}
            >
              <div className="d-flex align-items-center justify-content-center">
                <span
                  className={`font-weight-semi-bold small text-uppercase ${isDark ? 'text-white' : 'text-800'}`}
                  style={{ letterSpacing: '0.06em', fontSize: '0.65rem' }}
                >
                  {t('ContactInfo')}
                </span>
              </div>
            </div>
            <div className="px-2 py-2">
              <div className={`small mb-1 ${isDark ? 'text-white-50' : 'text-muted'}`} style={{ lineHeight: 1.35, fontSize: '0.72rem' }}>
                {t('ProductWebsite')}:
                {' '}
                <a className={isDark ? 'text-info' : 'text-primary'} href="https://myems.cn" target="_blank" rel="noopener noreferrer">
                  myems.cn
                </a>
              </div>
              <div className={`small mb-1 ${isDark ? 'text-white-50' : 'text-muted'}`} style={{ lineHeight: 1.35, fontSize: '0.72rem' }}>
                {t('CompanyWebsite')}:
                {' '}
                <a className={isDark ? 'text-info' : 'text-primary'} href="https://hassoft.cn" target="_blank" rel="noopener noreferrer">
                  hassoft.cn
                </a>
              </div>
              <div className={`small mb-0 ${isDark ? 'text-white-50' : 'text-muted'}`} style={{ lineHeight: 1.35, fontSize: '0.72rem' }}>
                {t('SalesPhone')}:
                {' '}
                <a className={isDark ? 'text-white text-decoration-none' : 'text-dark text-decoration-none'} href="tel:+8613011132526">
                  +86 130 1113 2526
                </a>
              </div>
              <div
                className="text-center mt-2 pt-2"
                style={{
                  borderTop: `1px dashed ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(17, 24, 39, 0.1)'}`
                }}
              >
                <div
                  className="d-inline-block rounded p-1 mx-auto"
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.98)' : '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                  }}
                >
                  <img
                    src={wechatQRCode}
                    alt="微信二维码"
                    className="rounded"
                    style={{ maxWidth: 88, width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>
            </div>
          </div>
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