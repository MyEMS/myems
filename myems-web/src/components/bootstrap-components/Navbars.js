import React, { Fragment } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const navbarDarkCode = `<Navbar color="dark" light expand="md" className="fs--1 font-weight-semi-bold navbar-standard">
  <NavbarBrand href="/" className="text-white">
    falcon
  </NavbarBrand>
  <Nav className="ml-auto" navbar>
    <NavItem>
      <NavLink href="#!" className="text-white">
        Link
      </NavLink>
    </NavItem>
    <UncontrolledDropdown nav inNavbar>
      <DropdownToggle nav caret className="text-white">
        Dropdown
      </DropdownToggle>
      <DropdownMenu right className="py-0">
        <div className="bg-white py-2 rounded-soft">
          <DropdownItem>Action</DropdownItem>
          <DropdownItem>Another action</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Something else here</DropdownItem>
        </div>
      </DropdownMenu>
    </UncontrolledDropdown>
  </Nav>
</Navbar>`;

const navbarPrimaryCode = `<Navbar color="primary" light expand="md" className="fs--1 font-weight-semi-bold navbar-standard">
  <NavbarBrand href="/" className="text-white">
    falcon
  </NavbarBrand>
  <Nav className="ml-auto" navbar>
    <NavItem>
      <NavLink href="#!" className="text-white">
        Link
      </NavLink>
    </NavItem>
    <UncontrolledDropdown nav inNavbar>
      <DropdownToggle nav caret className="text-white">
        Dropdown
      </DropdownToggle>
      <DropdownMenu right className="py-0">
        <div className="bg-white py-2 rounded-soft">
          <DropdownItem>Action</DropdownItem>
          <DropdownItem>Another action</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Something else here</DropdownItem>
        </div>
      </DropdownMenu>
    </UncontrolledDropdown>
  </Nav>
</Navbar>`;

const navbarTogglerCode = `function NavbarTogglerExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Navbar color="primary" light className="fs--1 font-weight-semi-bold navbar-standard">
      <NavbarBrand href="/" className="mr-auto text-white">
        falcon
      </NavbarBrand>
      <NavbarToggler onClick={() => setIsOpen(!isOpen)} className="mr-2" />
      <Collapse isOpen={isOpen} navbar>
        <Nav navbar>
          <NavItem>
            <NavLink href="#!" className="text-white">
              Link
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#!" className="text-white">
              Another Link
            </NavLink>
          </NavItem>
        </Nav>
      </Collapse>
     </Navbar>
  );
}`;

const propertiesNavbarCode = `Navbar.propTypes = {
  light: PropTypes.bool,
  dark: PropTypes.bool,
  fixed: PropTypes.string,
  color: PropTypes.string,
  role: PropTypes.string,
  expand: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string])
  // pass in custom element to use
}`;

const propertiesNavbar = `NavbarBrand.propTypes = {
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string])
  // pass in custom element to use
}`;

const propertiesNavbarTogglerCode = `NavbarToggler.propTypes = {
  type: PropTypes.string,
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string])
  // pass in custom element to use
}`;

const Navbars = () => {
  return (
    <Fragment>
      <PageHeader
        title="Navbar"
        description="Documentation and examples for Bootstrap’s powerful, responsive navigation header, the navbar. Includes support for branding, navigation, and more, including support for Bootstrap collapse plugin."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://reactstrap.github.io/components/navbar"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          Navs on reactstrap
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card className="mb-3">
        <FalconCardHeader title="Navbar Dark" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={navbarDarkCode} />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Navbar Primary" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={navbarPrimaryCode} />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Navbar Properties" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={propertiesNavbar} hidePreview />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="NavbarBrand Properties" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={propertiesNavbarCode} hidePreview />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Navbar Toggler" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={navbarTogglerCode} language="jsx" />
        </CardBody>
      </Card>
      <Card>
        <FalconCardHeader title="NavbarToggler Properties" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={propertiesNavbarTogglerCode} hidePreview />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Navbars;
