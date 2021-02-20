import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, CardBody, Col, DropdownItem, DropdownMenu, DropdownToggle, Row, Dropdown } from 'reactstrap';
import { breakpoints, isIterableArray, routesSlicer } from '../../helpers/utils';
import { topNavbarBreakpoint } from '../../config';
import { withTranslation } from 'react-i18next';

const NavbarDropdownComponents = ({ title, items, right, handleSetNavbarCollapsed, t }) => {
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
        if (windowWidth >= breakpoints[topNavbarBreakpoint]) {
          setDropdownOpen(true);
        }
      }}
      onMouseLeave={() => {
        let windowWidth = window.innerWidth;
        if (windowWidth >= breakpoints[topNavbarBreakpoint]) {
          setDropdownOpen(false);
        }
      }}
    >
      <DropdownToggle nav caret>
        {title}
      </DropdownToggle>
      <DropdownMenu right={right} className="dropdown-menu-card mt-0">
        {isIterableArray(items) && (
          <Card className="navbar-card-components shadow-none">
            <CardBody className="max-h-dropdown scrollbar">
              <div className="nav flex-column">
                {items.map((groupItem, index) => {
                  const NavItemGroup = routesSlicer({
                    routes: groupItem.children,
                    columns: 4
                  });

                  return (
                    <Fragment key={index}>
                      {index !== 0 && (
                        <div className="nav-link pl-0 py-1 text-900 font-weight-bold">{items[index].name}</div>
                      )}
                      <Row className={index + 1 === items.length ? 'mb-0' : 'mb-3'}>
                        {NavItemGroup.map((navItems, i) => {
                          return (
                            <Fragment key={`${index}-${i}`}>
                              <Col xs={6} xl={3}>
                                {navItems.map((navItem, j) => {
                                  return (
                                    <DropdownItem
                                      tag={Link}
                                      to={navItem.to}
                                      key={`${index}-${i}-${j}`}
                                      className="pl-0"
                                      onClick={handleSetNavbarCollapsed}
                                    >
                                      {t(navItem.name)}
                                      {navItem.badge && (
                                        <Badge color={navItem.badge.color || 'soft-success'} pill className="ml-2">
                                          {navItem.badge.text}
                                        </Badge>
                                      )}
                                    </DropdownItem>
                                  );
                                })}
                              </Col>
                            </Fragment>
                          );
                        })}
                      </Row>
                    </Fragment>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

NavbarDropdownComponents.propTypes = {
  title: PropTypes.string.isRequired,
  handleSetNavbarCollapsed: PropTypes.func.isRequired,
  items: PropTypes.array,
  right: PropTypes.bool
};

NavbarDropdownComponents.defaultProps = {
  items: [],
  right: false
};

export default withTranslation()(NavbarDropdownComponents);
