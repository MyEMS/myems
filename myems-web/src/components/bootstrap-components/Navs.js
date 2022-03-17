import React, { Fragment } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const horizontalNavCode = `<Nav>
  <NavItem>
    <NavLink href="#">Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink href="#">Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink href="#">Another Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink disabled href="#">
      Disabled
    </NavLink>
  </NavItem>
</Nav>`;
const verticalNavCode = `<Nav vertical>
  <NavItem>
    <NavLink href="#">Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink href="#">Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink href="#">Another Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink disabled href="#">
      Disabled
    </NavLink>
  </NavItem>
</Nav>`;
const pillsNavCode = `<Nav pills>
  <NavItem>
    <NavLink href="#" active>
      Active
    </NavLink>
  </NavItem>
  <NavItem>
    <NavLink href="#">Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink href="#">Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink disabled href="#">
      Disabled
    </NavLink>
  </NavItem>
</Nav>`;

const fillNavCode = `<Nav pills fill>
  <NavItem>
    <NavLink href="#" active>
      Active
    </NavLink>
  </NavItem>
  <NavItem>
    <NavLink href="#">Longer nav Link</NavLink>
  </NavItem>
  <NavItem>
    <NavLink href="#">Link</NavLink>
  </NavItem>
</Nav>`;

const navProperties = `Nav.propTypes = {
  tabs: PropTypes.bool,
  pills: PropTypes.bool,
  card: PropTypes.bool,
  justified: PropTypes.bool,
  fill: PropTypes.bool,
  vertical: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  horizontal: PropTypes.string,
  navbar: PropTypes.bool,
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string])
  // pass in custom element to use
}`;
const navItemProperties = `NavItem.propTypes = {
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  active: PropTypes.bool,
  // pass in custom element to use
}`;
const navLinkProperties = `NavLink.propTypes = {
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  // pass in custom element to use
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  // ref will only get you a reference to the NavLink component, use innerRef to get a reference to the DOM element (for things like focus management).
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.string])
}`;

const Navs = () => {
  return (
    <Fragment>
      <PageHeader
        title="Navs"
        description="Documentation and examples of how to use Bootstrap’s included navigation components."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://reactstrap.github.io/components/buttons"
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
        <FalconCardHeader title="Horizontal" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={horizontalNavCode} />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Nav Properties" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={navProperties} hidePreview />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="NavItem Properties" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={navItemProperties} hidePreview />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="NavLink Properties" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={navLinkProperties} hidePreview />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Vertical" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={verticalNavCode} />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Pills" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={pillsNavCode} />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Fill and Justify" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={fillNavCode} />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Navs;
