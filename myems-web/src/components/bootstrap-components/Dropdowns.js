import React, { Fragment } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import Flex from '../common/Flex';

const dropdownCode = `function dropdownExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
      <DropdownToggle caret className="btn btn-falcon-default">
        Dropdown button
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem header>Header</DropdownItem>
        <DropdownItem>Some Action</DropdownItem>
        <DropdownItem disabled>Action (disabled)</DropdownItem>
        <DropdownItem divider />
        <DropdownItem>Foo Action</DropdownItem>
        <DropdownItem>Bar Action</DropdownItem>
        <DropdownItem>Quo Action</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}`;

const dropdownAlignmentExample = `function dropdownAlignmentExample() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  return (
    <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
      <DropdownToggle className="btn btn-falcon-default" caret>
         This dropdown's menu is aligned
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem header>Header</DropdownItem>
        <DropdownItem disabled>Action</DropdownItem>
        <DropdownItem>Another Action</DropdownItem>
        <DropdownItem divider/>
        <DropdownItem>Another Action</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}`;

const dropdownSizingCode = `function dropdownSizingExample() {
  const [isOpenOne, setIsOpenOne] = useState(false);
  const [isOpenTwo, setIsOpenTwo] = useState(false);
  const [isOpenThree, setIsOpenThree] = useState(false);
  
  return (
    <Fragment>
      <Dropdown group isOpen={isOpenOne} toggle={() => setIsOpenOne(!isOpenOne)}>
        <DropdownToggle caret size="lg" className="btn btn-falcon-default mb-2">
          Dropdown
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem>Some Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Dropdown isOpen={isOpenTwo} toggle={() => setIsOpenTwo(!isOpenTwo)}>
        <DropdownToggle caret className="btn btn-falcon-default mb-2">
          Dropdown
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem>Some Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Dropdown isOpen={isOpenThree} toggle={() => setIsOpenThree(!isOpenThree)}>
        <DropdownToggle caret size="sm" className="btn btn-falcon-default">
          Dropdown
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem>Some Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </Fragment>
  );
}`;

const dropdownDirectionCode = `function dropdownDirectionExample() {
  const [isOpenUp, setIsOpenUp] = useState(false);
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);
  
  return (
    <Flex justify="between">
      <Dropdown direction="right" isOpen={isOpenRight} toggle={() => setIsOpenRight(!isOpenRight)}>
        <DropdownToggle caret className="btn btn-falcon-default">
          Dropright
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem>Some Action</DropdownItem>
        </DropdownMenu>
       </Dropdown>
      <Dropdown direction="up" isOpen={isOpenUp} toggle={() => setIsOpenUp(!isOpenUp)}>
        <DropdownToggle caret className="btn btn-falcon-default mr-2">
          Dropup
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem>Some Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
        <Dropdown direction="left" isOpen={isOpenLeft} toggle={() => setIsOpenLeft(!isOpenLeft)}>
        <DropdownToggle caret className="btn btn-falcon-default mr-2">
          Dropleft
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem>Some Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </Flex>
  );
}`;

const dropdownUncontrolledCode = `<UncontrolledDropdown>
  <DropdownToggle caret>
    Dropdown
  </DropdownToggle>
  <DropdownMenu>
    <DropdownItem header>Header</DropdownItem>
    <DropdownItem disabled>Action</DropdownItem>
    <DropdownItem>Another Action</DropdownItem>
    <DropdownItem divider />
    <DropdownItem>Another Action</DropdownItem>
  </DropdownMenu>
</UncontrolledDropdown>`;

const dropdownProperties = `Dropdown.propTypes = {
  disabled: PropTypes.bool,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
  group: PropTypes.bool,
  isOpen: PropTypes.bool,
  // For Dropdown usage inside a Nav
  nav: PropTypes.bool,
  active: PropTypes.bool,
  // For Dropdown usage inside a Navbar (disables popper)
  inNavbar: PropTypes.bool,
  tag: PropTypes.string, //default: 'div' unless nav=true, then 'li'
  toggle: PropTypes.func,
  setActiveFromChild: PropTypes.bool
};`;

const dropdownToggleProperties = `DropdownToggle.propTypes = {
  caret: PropTypes.bool,
  color: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  'data-toggle': PropTypes.string,
  'aria-haspopup': PropTypes.bool,
  // For DropdownToggle usage inside a Nav
  nav: PropTypes.bool,
  // Defaults to Button component
  tag: PropTypes.any
};`;
const dropdownMenuProperties = `DropdownMenu.propTypes = {
  tag: PropTypes.string,
  children: PropTypes.node.isRequired,
  right: PropTypes.bool,
  flip: PropTypes.bool, //default: true,
  className: PropTypes.string,
  cssModule: PropTypes.object,
  // Custom modifiers that are passed to DropdownMenu.js, see https://popper.js.org/popper-documentation.html#modifiers
  modifiers: PropTypes.object,
  persist: PropTypes.bool, //presist the popper, even when closed. See #779 for reasoning
  // passed to popper, see https://popper.js.org/popper-documentation.html#Popper.Defaults.positionFixed
  positionFixed: PropTypes.bool
};`;

const dropdownItemProperties = `DropdownItem.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  divider: PropTypes.bool,
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  header: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  cssModule: PropTypes.object,
  toggle: PropTypes.bool //default: true
};`;

const Dropdowns = () => (
  <Fragment>
    <PageHeader
      title="Dropdown"
      description="Toggle contextual overlays for displaying lists of links and more with the Falcon dropdown plugin."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/components/dropdowns"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Dropdowns on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card className="mb-3">
      <FalconCardHeader title="Example" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={dropdownCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardBody>
        <FalconEditor code={dropdownProperties} hidePreview />
        <FalconEditor code={dropdownToggleProperties} hidePreview />
        <FalconEditor code={dropdownMenuProperties} hidePreview />
        <FalconEditor code={dropdownItemProperties} hidePreview />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Uncontrolled Dropdown" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={dropdownUncontrolledCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Alignment" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={dropdownAlignmentExample} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Sizing" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={dropdownSizingCode} language="jsx" />
      </CardBody>
    </Card>
    <Card>
      <FalconCardHeader title="Direction" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={dropdownDirectionCode} scope={{ Flex }} language="jsx" />
      </CardBody>
    </Card>
  </Fragment>
);

export default Dropdowns;
