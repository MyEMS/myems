import React, { Fragment } from 'react';
import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import PageHeader from '../common/PageHeader';
import Flex from '../common/Flex';

const basicFormCode = `<Form>
  <FormGroup>
    <Label for="exampleName">Name</Label>
    <Input type="text" name="name" id="exampleName" placeholder="Name" />
  </FormGroup>
  <FormGroup>
    <Label for="readonly">Read Only</Label>
    <Input type="text" name="readonly" id="readonly" placeholder="Readonly input here..." disabled />
  </FormGroup>
  <FormGroup>
    <Label for="exampleEmail">Read only plain text</Label>
    <Input plaintext value="email@example.com" onChange={() => {}} />
  </FormGroup>
  <FormGroup>
    <Label for="exampleEmail">Email</Label>
    <Input type="email" name="email" id="exampleEmail" placeholder="Email" />
  </FormGroup>
  <FormGroup>
    <Label for="examplePassword">Password</Label>
    <Input type="password" name="password" id="examplePassword" placeholder="Password" />
  </FormGroup>
  <FormGroup className="form-check">
    <Input type="checkbox" name="check" id="exampleCheck" />
    <Label for="exampleCheck" check>
      Checkbox
    </Label>
  </FormGroup>
  <FormGroup className="form-check">
    <Input type="checkbox" name="check" id="exampleCheck1" disabled />
    <Label for="exampleCheck1" check>
      Disabled checkbox
    </Label>
  </FormGroup>
  <FormGroup className="form-check">
  <Input type="radio" name="radio1" defaultChecked />
    <Label check>
      Default Radio
    </Label>
  </FormGroup>
  <FormGroup className="form-check">
   <Input type="radio" name="radio1" disabled /> 
    <Label check>
     Disabled Radio
    </Label>
  </FormGroup>
    <FormGroup>
      <Label for="exampleFile">Example file input</Label>
      <Input type="file" name="file" id="exampleFile" />
     </FormGroup>
  <FormGroup>
    <Label for="exampleSelect">Example Select</Label>
    <Input type="select" name="select" id="exampleSelect">
      <option>1</option>
      <option>2</option>
      <option>3</option>
      <option>4</option>
      <option>5</option>
    </Input>
  </FormGroup>
  <FormGroup>
    <Label for="exampleSelectMulti">Example Multiple Select</Label>
    <Input type="select" name="selectMulti" id="exampleSelectMulti" multiple>
      <option>1</option>
      <option>2</option>
      <option>3</option>
      <option>4</option>
      <option>5</option>
    </Input>
  </FormGroup>
  <FormGroup>
    <Label for="exampleText">Example textarea</Label>
    <Input type="textarea" name="text" id="exampleText" />
  </FormGroup>
  <Button color="primary">Save</Button>
</Form>`;

const inputGroupCode = `function InputGroupExample () {
  const [isOpenOne, setIsOpenOne] = useState(false);
  const [isOpenTwo, setIsOpenTwo] = useState(false);
  
  return (
    <div>
      <InputGroup>
        <InputGroupAddon addonType="prepend">@</InputGroupAddon>
        <Input placeholder="username" />
      </InputGroup>
      <br />
      <InputGroup>
        <Input placeholder="Recipient's username" />
        <InputGroupAddon addonType="append">
          <InputGroupText>@example.com</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <br />
      <Label for="yourVanityURl">Your vanity URL</Label>
      <InputGroup>
        <InputGroupAddon addonType="prepend">https:example.com/users/</InputGroupAddon>
        <Input />
      </InputGroup>
      <br />
      <InputGroup>
        <InputGroupAddon addonType="prepend">$</InputGroupAddon>
        <Input />
        <InputGroupAddon addonType="append">.00</InputGroupAddon>
      </InputGroup>
      <br />
      <InputGroup>
        <InputGroupAddon addonType="prepend">With textarea</InputGroupAddon>
        <Input type="textarea" />
      </InputGroup>
      <br />
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <Input addon type="checkbox" aria-label="Checkbox for following text input" />
          </InputGroupText>
        </InputGroupAddon>
        <Input />
      </InputGroup>
      <br />
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <Input addon type="radio" aria-label="Checkbox for following text input" />
          </InputGroupText>
        </InputGroupAddon>
        <Input />
      </InputGroup>
      <br />
      <InputGroup>
        <InputGroupAddon addonType="prepend">First and last name</InputGroupAddon>
        <Input />
        <Input />
      </InputGroup>
      <br />
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>$</InputGroupText>
          <InputGroupText>0.00</InputGroupText>
        </InputGroupAddon>
        <Input />
      </InputGroup>
      <br />
      <InputGroup>
        <Input />
        <InputGroupAddon addonType="append">
          <InputGroupText>$</InputGroupText>
          <InputGroupText>0.00</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <br />
      <InputGroup>
        <InputGroupButtonDropdown 
          addonType="append"
          isOpen={isOpenOne} 
          toggle={() => setIsOpenOne(!isOpenOne)}
        >
          <DropdownToggle color="primary" caret>
            Dropdown
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Header</DropdownItem>
            <DropdownItem disabled>Action</DropdownItem>
            <DropdownItem>Something else here</DropdownItem>
            <DropdownItem divider />
            <DropdownItem>Separated link</DropdownItem>
          </DropdownMenu>
        </InputGroupButtonDropdown>
        <Input />
      </InputGroup>
      <br />
      <InputGroup>
        <Input />
        <InputGroupButtonDropdown 
          addonType="append" 
          isOpen={isOpenTwo} 
          toggle={() => setIsOpenTwo(!isOpenTwo)}
        >
          <DropdownToggle color="primary" caret>
            Dropdown
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Header</DropdownItem>
            <DropdownItem disabled>Action</DropdownItem>
            <DropdownItem>Something else here</DropdownItem>
            <DropdownItem divider />
            <DropdownItem>Separated link</DropdownItem>
          </DropdownMenu>
        </InputGroupButtonDropdown>
      </InputGroup>
    </div>
  )
}`;

const customCheckboxCode = `<Fragment>
  <CustomInput
    type="checkbox"
    id="customCheck1"
    label="Check this custom checkbox"
    className="mb-0"
    />
  <CustomInput 
    type="checkbox" 
    id="customCheck2" 
    label="Check another custom checkbox" 
  />
</Fragment>
`;
const customRadioCode = `<Fragment>
  <CustomInput
    type="radio"
    id="customRadio1"
    name="customRadio"
    label="Toggle this custom radio"
    className="mb-0"
  />
  <CustomInput
    type="radio"
    id="customRadio2"
    name="customRadio"
    label="Or toggle this other custom radio"
  />
</Fragment>`;

const InlineRadioCode = `<FormGroup>
  <Label for="selectOption">
    Select one option
  </Label>
  <div>
    <CustomInput 
      type="radio" 
      name="exampleCustomInlineRadio" 
      id="exampleCustomInlineRadio" 
      label="Toggle" 
      inline 
    />
    <CustomInput 
      type="radio" 
      name="exampleCustomInlineRadio" 
      id="exampleCustomInlineRadio2" 
      label="and another one" 
      inline 
    />
  </div>
</FormGroup>`;

const disabledInputFieldsCode = `<Fragment>
  <CustomInput
    type="checkbox"
    id="customCheckboxDisabled2"
    label="Check this custom checkbox"
    disabled
  />
  <CustomInput
    type="radio"
    id="customRadioDisabled2"
    name="radioDisabled"
    label="Toggle this custom radio"
    disabled
  />
</Fragment>`;

const customSwitchCode = `<CustomInput
    type="switch"
    id="customSwitch"
    name="customSwitch"
    label="Toggle this custom radio"
  />`;
const customSwitchDisabledCode = `<CustomInput
    type="switch"
    id="customSwitchDisabled2"
    name="customSwitch"
    label="Toggle this custom radio"
    disabled
  />`;
const customSelectCode = `<Fragment>
  <FormGroup>
    <CustomInput 
      type="select" 
      bsSize="lg" 
      defaultValue="1" 
      id="exampleCustomSelect1" 
      name="customSelect"
    >
      <option value="1">One</option>
      <option value="2">Two</option>
      <option value="3">Three</option>
    </CustomInput>
    </FormGroup>
    <FormGroup>
      <CustomInput 
        type="select" 
        id="exampleCustomSelect2" 
        defaultValue="1" 
        name="customSelect"
      >
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option>
      </CustomInput>
    </FormGroup>
    <FormGroup>
      <CustomInput 
        type="select" 
        bsSize="sm" 
        id="exampleCustomSelect3" 
        defaultValue="1" 
        name="customSelect"
      >
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option>
      </CustomInput>
  </FormGroup>
</Fragment>`;

const multipleSelectCode = `<Fragment>
<FormGroup>
  <CustomInput 
    type="select"
    id="exampleCustomMultipleSelect" 
    defaultValue={[1,2]} 
    name="customSelect" 
    multiple
  >
    <option value="1">One</option>
    <option value="2">Two</option>
    <option value="3">Three</option>
    <option value="4">Four</option>
    <option value="5">Five</option>
  </CustomInput>
</FormGroup>
</Fragment>`;

const fileBrowserCode = `<FormGroup>
  <Label for="exampleCustomFileBrowser">
    File Browser
  </Label>
  <CustomInput 
    type="file" 
    id="exampleCustomFileBrowser" 
    name="customFile" 
  />
</FormGroup>`;

const propertiesInput = `Input.propTypes = {
  children: PropTypes.node,
  // type can be things like text, password, (typical input types) as well as select and textarea, providing children as you normally would to those.
  type: PropTypes.string,
  size: PropTypes.string,
  bsSize: PropTypes.string,
  valid: PropTypes.bool, // applied the is-valid class when true, does nothing when false
  invalid: PropTypes.bool, // applied the is-invalid class when true, does nothing when false
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  // ref will only get you a reference to the Input component, use innerRef to get a reference to the DOM input (for things like focus management).
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  plaintext: PropTypes.bool,
  addon: PropTypes.bool,
  className: PropTypes.string,
  cssModule: PropTypes.object,
};`;
const propertiesCustomInput = `CustomInput.propTypes = {
  className: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  type: PropTypes.string.isRequired, // radio, checkbox, select, range.
  label: PropTypes.string, // used for checkbox and radios
  inline: PropTypes.bool,
  valid: PropTypes.bool, // applied the is-valid class when true, does nothing when false
  invalid: PropTypes.bool, // applied the is-invalid class when true, does nothing when false
  bsSize: PropTypes.string,
  cssModule: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array, PropTypes.func]), // for type="select"
  // innerRef would be referenced to select node or input DOM node, depends on type property
  innerRef: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.func,
  ])
};`;
const propertiesForm = `Form.propTypes = {
  children: PropTypes.node,
  inline: PropTypes.bool,
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]), // default: 'form'
  innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  className: PropTypes.string,
  cssModule: PropTypes.object,
};`;
const propertiesFormFeedback = `FormFeedback.propTypes = {
  children: PropTypes.node,
  // Pass in a Component to override default element
  tag: PropTypes.string, // default: 'div'
  className: PropTypes.string,
  cssModule: PropTypes.object,
  valid: PropTypes.bool, // default: undefined
  tooltip: PropTypes.bool
};`;
const propertiesFormGroup = `FormGroup.propTypes = {
  children: PropTypes.node,
  // Applied the row class when true, does nothing when false
  row: PropTypes.bool,
  // Applied the form-check class when true, form-group when false
  check: PropTypes.bool,
  inline: PropTypes.bool,
  // Applied the disabled class when the check and disabled props are true, does nothing when false
  disabled: PropTypes.bool,
  // Pass in a Component to override default element
  tag: PropTypes.string, // default: 'div'
  className: PropTypes.string,
  cssModule: PropTypes.object,
};`;
const propertiesFormText = `FormText.propTypes = {
  children: PropTypes.node,
  inline: PropTypes.bool,
  // Pass in a Component to override default element
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]), // default: 'small'
  color: PropTypes.string, // default: 'muted'
  className: PropTypes.string,
  cssModule: PropTypes.object,
};`;

const propertiesInputGroup = `InputGroup.propTypes = {
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  size: PropTypes.string,
  className: PropTypes.string
};`;

const propertiesInputGroupAddon = `InputGroupAddOn.propTypes = {
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  addonType: PropTypes.oneOf(['prepend', 'append']).isRequired,
  className: PropTypes.string
};`;

const propertiesInputGroupButton = `InputGroupButton.propTypes = {
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  addonType: PropTypes.oneOf(['prepend', 'append']).isRequired,
  children: PropTypes.node,
  groupClassName: PropTypes.string, // only used in shorthand
  groupAttributes: PropTypes.object, // only used in shorthand
  className: PropTypes.string
};`;

const Forms = () => (
  <Fragment>
    <PageHeader
      title="Forms"
      description="Examples and usage guidelines for form control styles, layout options, and custom components for creating a wide variety of forms."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/components/form"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Forms on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card className="mb-3">
      <FalconCardHeader title="Basic Form" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={basicFormCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Properties" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={propertiesInput} hidePreview />
        <FalconEditor code={propertiesCustomInput} hidePreview />
        <FalconEditor code={propertiesForm} hidePreview />
        <FalconEditor code={propertiesFormFeedback} hidePreview />
        <FalconEditor code={propertiesFormGroup} hidePreview />
        <FalconEditor code={propertiesFormGroup} hidePreview />
        <FalconEditor code={propertiesFormText} hidePreview />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Input Group Properties" light={false} />
      <CardBody className="bg-light">
        <code className="bg-dark d-block p-2">
          <pre className="text-300">{propertiesInputGroup}</pre>
        </code>
        <code className="bg-dark d-block p-2">
          <pre className="text-300">{propertiesInputGroupAddon}</pre>
        </code>
        <code className="bg-dark d-block p-2">
          <pre className="text-300">{propertiesInputGroupButton}</pre>
        </code>
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Input Group" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={inputGroupCode} language="jsx" />
      </CardBody>
    </Card>
    <PageHeader
      title="Custom Forms"
      description="For even more customization and cross-browser consistency, use Bootstrap's completely custom form elements to replace the browser defaults."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/components/form#Custom-Inputs"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Custom Forms on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Row noGutters className="mb-3">
      <Col lg={6} className="pr-lg-2 mb-3">
        <Card className="h-100 mb-2">
          <FalconCardHeader title="Checkboxes" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={customCheckboxCode} language="jsx" />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="pl-lg-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="Radios" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={customRadioCode} language="jsx" />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="pr-lg-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="Inline Radios" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={InlineRadioCode} scope={{ Flex }} />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="pl-lg-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="Disabled" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={disabledInputFieldsCode} language="jsx" />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="pr-lg-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="Switches" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={customSwitchCode} />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="pl-lg-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="Disabled Switches" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={customSwitchDisabledCode} language="jsx" />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="pr-lg-2">
        <Card className="h-100">
          <FalconCardHeader title="Custom Select" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={customSelectCode} language="jsx" />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="pl-lg-2">
        <Card className="mb-3">
          <FalconCardHeader title="Multiple Select" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={multipleSelectCode} language="jsx" />
          </CardBody>
        </Card>
        <Card className="">
          <FalconCardHeader title="File Browser" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={fileBrowserCode} language="jsx" />
          </CardBody>
        </Card>
      </Col>
    </Row>
  </Fragment>
);

export default Forms;
