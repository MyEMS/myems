import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Collapse, Nav, NavItem, NavLink as BootstrapNavLink } from 'reactstrap';
import AppContext from '../../context/Context';
import NavbarVerticalMenuItem from './NavbarVerticalMenuItem';

const NavbarVerticalMenu = ({ routes, location }) => {
  const [openedIndex, setOpenedIndex] = useState(null);
  const { setShowBurgerMenu } = useContext(AppContext);
  useEffect(() => {
    let openedDropdown = null;
    routes.forEach((route, index) => {
      if (location.pathname.indexOf(route.to) === 0) openedDropdown = index;
    });

    setOpenedIndex(openedDropdown);
    // eslint-disable-next-line
  }, []);

  const toggleOpened = (e, index) => {
    e.preventDefault();
    return setOpenedIndex(openedIndex === index ? null : index);
  };

  return routes.map((route, index) => {
    if (!route.children) {
      return (
        <NavItem key={index}>
          <NavLink className="nav-link" {...route} onClick={() => setShowBurgerMenu(false)}>
            <NavbarVerticalMenuItem route={route} />
          </NavLink>
        </NavItem>
      );
    }

    return (
      <NavItem key={index}>
        <BootstrapNavLink
          onClick={e => toggleOpened(e, index)}
          className="dropdown-indicator cursor-pointer"
          aria-expanded={openedIndex === index}
        >
          <NavbarVerticalMenuItem route={route} />
        </BootstrapNavLink>
        <Collapse isOpen={openedIndex === index}>
          <Nav>
            <NavbarVerticalMenu routes={route.children} location={location} />
          </Nav>
        </Collapse>
      </NavItem>
    );
  });
};

NavbarVerticalMenu.propTypes = {
  routes: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired
};

export default withRouter(NavbarVerticalMenu);
