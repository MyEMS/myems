import React, { Fragment, useContext } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import AppContext from '../../context/Context';

const NavBarTop = () => {
  const { setIsTopNav } = useContext(AppContext);

  return (
    <Fragment>
      <PageHeader
        title="Navbar Top"
        description="Navbar Top is a different user friendly layout system in Falcon. You can start developing with Navbar Top layout with the starter page."
        className="mb-3"
      >
        <Button onClick={() => setIsTopNav(prevIsTopNav => !prevIsTopNav)} color="link" size="sm" className="pl-0">
          Toggle Navbar Top
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card className="mb-3">
        <FalconCardHeader title="Supported Content" light={false} />
        <CardBody className="bg-light">
          <p>
            {' '}
            Falcon Navbar Top support all of{' '}
            <a href="https://reactstrap.github.io/components/navbar/">Reactstrap Navbar</a> components.{' '}
            <code>Navbar</code>, <code>NavbarToggler</code>, <code>NavbarBrand</code>, <code>Nav</code>,{' '}
            <code>NavbarText</code>, all of those sub-components are used in Navbar Top.
          </p>
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Behaviors" light={false} />
        <CardBody className="bg-light">
          <p>
            {' '}
            Falcon Navbar Top uses <a href="https://reactstrap.github.io/components/navbar/">Reactstrap Navbar</a>{' '}
            responsive behaviors and all other behavior they support. The dropdown menu display onClick by default on
            reactstrap. Falcon navbar top dropdown menu display on hover. To achieve this behavior, we use react{' '}
            <code>onMouseOver</code> Event and <code>onMouseLeave</code> event at{' '}
            <code>src/components/navbar/NavbarDropdown.js</code> jsx tag.
          </p>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default NavBarTop;
