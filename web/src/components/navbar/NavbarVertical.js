import React, { useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Nav, Navbar } from 'reactstrap';
import is from 'is_js';
import classNames from 'classnames';
import Logo from './Logo';
import NavbarVerticalMenu from './NavbarVerticalMenu';
import ToggleButton from './ToggleButton';
import AppContext from '../../context/Context';
import Flex from '../common/Flex';
import routes from '../../routes';
import { navbarBreakPoint } from '../../config';

import bgNavbarImg from '../../assets/img/generic/bg-navbar.png';

const NavbarVertical = ({ navbarStyle }) => {
  const navBarRef = useRef(null);

  const { showBurgerMenu, isNavbarVerticalCollapsed, setIsNavbarVerticalCollapsed } = useContext(AppContext);

  const HTMLClassList = document.getElementsByTagName('html')[0].classList;
  //Control Component did mount and unmounted of hover effect
  if (isNavbarVerticalCollapsed) {
    HTMLClassList.add('navbar-vertical-collapsed');
  }

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
          <NavbarVerticalMenu routes={routes} />
        </Nav>
        <div className="settings px-3 px-xl-0">
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
            Purchase
          </Button>
        </div>

        {/* </Scrollbar> */}
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

export default NavbarVertical;
