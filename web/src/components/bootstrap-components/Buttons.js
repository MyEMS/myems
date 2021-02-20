import React, { Fragment } from 'react';
import { Button, Card, CardHeader, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import ButtonIcon from '../common/ButtonIcon';

const buttonFalconCode = `['primary', 'success', 'info','danger', 'warning'].map((color, index) => (
  <Button color={'falcon-'+color} key={index} className="mr-2" >
    {color}
  </Button>
))`;

const buttonCode = `['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].map((color, index) => (
  <Button color={color} size="sm" key={index} className="mr-2">
    {color}
  </Button>
))`;

const buttonOutlineCode = `['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].map((color, index) => (
  <Button outline color={color} key={index} className="mr-2">
    {color}
  </Button>
))`;

const buttonSizeCode = `<Fragment>
  <Button color="secondary" size="sm" className="mr-2">Small</Button>
  <Button color="secondary" className="mr-2">Regular</Button>
  <Button color="secondary" size="lg" className="mr-2">Large</Button>
</Fragment>`;

const IconButtonCode = `<Fragment>
  <ButtonIcon className="mr-2" color="falcon-default" size="sm" icon="plus" transform="shrink-3">
    Small
  </ButtonIcon>
  <ButtonIcon className="mr-2" color="falcon-default" icon="plus" transform="shrink-3">
    Regular
  </ButtonIcon>
  <ButtonIcon color="falcon-default" size="lg" icon="plus" transform="shrink-3">
    Large
  </ButtonIcon>
  <hr />
  <ButtonIcon color="primary" className="mr-2"  icon="plus" transform="shrink-3">
    Regular
  </ButtonIcon>
  <ButtonIcon outline color="primary"  icon="plus" transform="shrink-3">
    Outline
  </ButtonIcon>
  <hr />
  <ButtonIcon color="primary"  icon="trash" iconAlign="right" transform="shrink-3">
    Delete
  </ButtonIcon>
</Fragment>`;

const capsuleButtonCode = `<Fragment>
  <Button className="mr-2" color="falcon-default" className="rounded-capsule mr-1">
    Example
  </Button>
  <ButtonIcon className="rounded-capsule mr-1" color="falcon-default" icon="align-left" transform="shrink-3">
    Icon Left
  </ButtonIcon>
  <ButtonIcon className="rounded-capsule mr-1" color="falcon-default" icon="align-right" iconAlign="right" transform="shrink-3">
    Icon Right
  </ButtonIcon>
  <Button outline color="primary" className="rounded-capsule mr-1">
    Outline
  </Button>
  <hr />
  <Button color="falcon-default" className="rounded-capsule mr-2" size="sm" >
    Capsule Small
  </Button>
  <Button color="falcon-default" className="rounded-capsule mr-2" >
    Capsule Regular
  </Button>
  <Button color="falcon-default" className="rounded-capsule mr-2" size="lg" >
    Capsule large
  </Button>
</Fragment>`;

const basicExampleCode = `<Fragment>
  <ButtonGroup>
    <Button>Left</Button>
    <Button>Middle</Button>
    <Button>Right</Button>
  </ButtonGroup>
</Fragment>`;

const buttonToolbarCode = `<Fragment>
  <ButtonGroup aria-label="First group" className="mr-2">
    <Button>1</Button>
    <Button>2</Button>
    <Button>3</Button>
    <Button>4</Button>
  </ButtonGroup>
  <ButtonGroup aria-label="Second group" className="mr-2">
    <Button>5</Button>
    <Button>6</Button>
    <Button>7</Button>
  </ButtonGroup>
  <ButtonGroup aria-label="Third group">
    <Button>8</Button>
  </ButtonGroup>
</Fragment>`;

const buttonToolbarWithInputCode = `<Fragment>
  <ButtonToolbar>
    <ButtonGroup>
      <Button>1</Button>
      <Button>2</Button>
      <Button>3</Button>
      <Button className="mr-3">4</Button>
    </ButtonGroup>
    <InputGroup>
      <InputGroupAddon addonType="prepend">@</InputGroupAddon>
      <Input />
    </InputGroup>
   </ButtonToolbar>
  <ButtonToolbar className="justify-content-between mt-3">
    <ButtonGroup>
      <Button>1</Button>
      <Button>2</Button>
      <Button>3</Button>
      <Button className="mr-3">4</Button>
    </ButtonGroup>
    <InputGroup>
      <InputGroupAddon addonType="prepend">@</InputGroupAddon>
      <Input />
    </InputGroup>
  </ButtonToolbar>
</Fragment>`;

const sizingCode = `<Fragment>
  <ButtonGroup size="lg" className="mr-2">
    <Button>Left</Button>
    <Button>Middle</Button>
    <Button>Right</Button>
  </ButtonGroup>
  <ButtonGroup className="mr-2">
    <Button>Left</Button>
    <Button>Middle</Button>
    <Button>Right</Button>
  </ButtonGroup>
  <ButtonGroup size="sm">
    <Button>Left</Button>
    <Button>Middle</Button>
    <Button>Right</Button>
  </ButtonGroup>
</Fragment>
`;

const buttonGroupVerticalCode = `<ButtonGroup vertical>
  <Button>Button</Button>
  <Button>Button</Button>
  <Button>Button</Button>
</ButtonGroup>`;

const buttonGroupVerticalVariationCode = `function buttonGroupVerticalVariationCode() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <ButtonGroup vertical>
      <Button>Button</Button>
      <Button>Button</Button>
      <ButtonDropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
        <DropdownToggle caret>Dropdown</DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Dropdown link</DropdownItem>
          <DropdownItem>Dropdown link</DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
    </ButtonGroup>
  );
};`;

const selectRadioButtonCode = `function SelectButton() {
  const [isSelected, setIsSelected] = useState("");
  
  return (
    <Fragment>
      <ButtonGroup>
        <Button color="primary" active={isSelected === 1} onClick={() => setIsSelected(1)}>
          One
        </Button>
        <Button color="primary" active={isSelected === 2} onClick={() => setIsSelected(2)}>
          Two
        </Button>
        <Button color="primary" active={isSelected === 3} onClick={() => setIsSelected(3)}>
          Three
        </Button>
      </ButtonGroup>
      <p className="mt-1">Selected : {isSelected} </p>
    </Fragment>
  );
};
`;

const multiSelectCheckboxExample = `function multiSelectCheckboxExample() {
  const [checked, setChecked] = useState([1]);
  
  const handleChecked = id => {
    checked.includes(id)
      ? setChecked([...checked.filter(i => i !== id)])
      : setChecked([...checked, id]);
  };
  
  return (
    <Fragment>
      <ButtonGroup>
        <Button
          color="primary"
          onClick={() => handleChecked(1)}
          active={checked.includes(1)}
        >
          One
        </Button>
        <Button
          color="primary"
          onClick={() => handleChecked(2)}
          active={checked.includes(2)}
        >
          Two
        </Button>
        <Button
          color="primary"
          onClick={() => handleChecked(3)}
          active={checked.includes(3)}
        >
          Three
        </Button>
      </ButtonGroup>
      <p>Selected: {JSON.stringify(checked)}</p>
    </Fragment>
  );
};`;

const disabledButtonCode = `<Fragment>
  <Button color="primary" size="lg" className="mr-2 mb-2" disabled>Primary</Button>
  <Button color="secondary" size="lg" className="mr-2 mb-2" disabled>Secondary</Button>
  <Button color="warning" size="lg" className="mr-2 mb-2" disabled>Warning</Button>
  <Button color="danger" size="lg" className="mr-2 mb-2" disabled>Danger</Button>
  <Button color="success" size="lg" className="mr-2 mb-2" disabled>Success</Button>
  <Button color="light" size="lg" className="mr-2 mb-2" disabled>Light</Button>
  <Button color="dark" size="lg" className="mr-2 mb-2" disabled>Dark</Button>
  <Button color="info" size="lg" className="mr-2 mb-2" disabled>Info</Button>
</Fragment>`;

const blockLevelButtonCode = `<Fragment>
  <Button color="primary" size="lg" block>
    Block level button
  </Button>
  <Button color="secondary" size="lg" block>
    Block level button
  </Button>
</Fragment>`;

const buttonFalconPropertiesCode = `Button.propTypes = {
  active: PropTypes.bool,
  'aria-label': PropTypes.string,
  block: PropTypes.bool,
  color: PropTypes.string, // default: 'secondary'
  disabled: PropTypes.bool,
  outline: PropTypes.bool,

  // Pass in a Component to override default button element
  // example: react-router Link
  // default: 'button'
  tag: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
    PropTypes.shape({ $$typeof: PropTypes.symbol, render: PropTypes.func }),
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
      PropTypes.shape({ $$typeof: PropTypes.symbol, render: PropTypes.func }),
    ]))
  ]),

  // ref will only get you a reference to the Button component, use innerRef to get a reference to the DOM element (for things like focus management).
  innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),

  onClick: PropTypes.func,
  size: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  cssModule: PropTypes.object,

  // use close prop for BS4 close icon utility
  close: PropTypes.bool,
}`;

const buttonFalconDefaultPropertiesCode = `Button.defaultProps = {
  color: 'secondary',
  tag: 'button',
}
`;

const buttonIconPropertiesCode = `ButtonIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  iconAlign: PropTypes.oneOf(['left', 'right']), // default: 'left'
  iconClassName: PropTypes.string,
  transform: PropTypes.string
};`;

const Buttons = () => (
  <Fragment>
    <PageHeader
      title="Buttons"
      description="Use Falcon’s custom button styles for actions in forms, dialogs, and more with support for multiple sizes, states, and more."
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
        Buttons on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card className="mb-3">
      <FalconCardHeader title="Falcon Buttons" light={false} />
      <CardBody>
        <FalconEditor code={buttonFalconCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Properties" light={false} />
      <CardBody>
        <FalconEditor code={buttonFalconPropertiesCode} hidePreview />
        <FalconEditor code={buttonFalconDefaultPropertiesCode} hidePreview />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Examples" light={false} />
      <CardBody>
        <FalconEditor code={buttonCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Outline buttons" light={false} />
      <CardBody>
        <FalconEditor code={buttonOutlineCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Button sizes" light={false} />
      <CardBody>
        <FalconEditor code={buttonSizeCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Icon Buttons" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={IconButtonCode} scope={{ FontAwesomeIcon, ButtonIcon }} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Button Icon Properties" light={false} />
      <CardBody>
        <FalconEditor code={buttonIconPropertiesCode} scope={{ ButtonIcon }} hidePreview />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Block level Button" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={blockLevelButtonCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Disabled Button" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={disabledButtonCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Button Capsule" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={capsuleButtonCode} scope={{ FontAwesomeIcon, ButtonIcon }} />
      </CardBody>
    </Card>
    <PageHeader
      title="Button Group"
      description="Group a series of buttons together on a single line with the button group, and super-power them with JavaScript."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/components/button-group"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Buttons on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card className="mb-3">
      <CardHeader>
        <h5>Basic Example</h5>
        <p className="mb-0">
          Wrap a series of buttons with<code>.btn</code> in<code>.btn-group</code>. Add on optional JavaScript radio and
          checkbox style behavior with
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={basicExampleCode} scope={{ ButtonIcon }} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Button Toolbar</h5>
        <p className="mb-0">
          Combine sets of button groups into button toolbars for more complex components. Use utility classes as needed
          to space out groups, buttons, and more.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={buttonToolbarCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Button toolbar with input group</h5>
        <p className="mb-0">
          Feel free to mix input groups with button groups in your toolbars. Similar to the example above, you'll likely
          need some utilities though to space things properly.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={buttonToolbarWithInputCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Sizing</h5>
        <p className="mb-0">
          Insteam of aplying button sizing classes to every button in a group, just add .btn-gorup-* to each .btn-group,
          including each one when nesting multiple groups.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={sizingCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Vertical variation</h5>
        <p className="mb-0">
          Make a set of buttons appear vertically tacked rather than horizontally. Split button dropdowns ae not
          supported here.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={buttonGroupVerticalCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Vertical variation with dropdown</h5>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={buttonGroupVerticalVariationCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Radio Buttons (Stateful Buttons)" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={selectRadioButtonCode} language="jsx" />
      </CardBody>
    </Card>
    <Card>
      <FalconCardHeader title=" Checkbox (Stateful Buttons)" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={multiSelectCheckboxExample} language="jsx" />
      </CardBody>
    </Card>
  </Fragment>
);

export default Buttons;
