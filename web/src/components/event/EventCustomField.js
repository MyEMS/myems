import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Col, CustomInput, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import Datetime from 'react-datetime';
import FalconCardHeader from '../common/FalconCardHeader';
import { isIterableArray } from '../../helpers/utils';
import ButtonIcon from '../common/ButtonIcon';
import FormGroupSelect from '../common/FormGroupSelect';
import createMarkup from '../../helpers/createMarkup';

const CustomField = ({ name, type, options, index }) => {
  switch (type) {
    case 'select':
      return (
        <FormGroup>
          <Label for={`customField${index}`}>{name}</Label>
          <CustomInput type="select" id={`customField${index}`}>
            {isIterableArray(options) &&
              options.map((value, i) => <option value={value} key={i} dangerouslySetInnerHTML={createMarkup(value)} />)}
          </CustomInput>
        </FormGroup>
      );

    case 'checkboxes':
      return (
        <FormGroup>
          <Label>{name}</Label>
          {options.map((option, key) => (
            <CustomInput type="checkbox" id={`customField${index}${key}`} label={option} key={key} />
          ))}
        </FormGroup>
      );

    case 'radio':
      return (
        <FormGroup>
          <Label>{name}</Label>
          {options.map((option, key) => (
            <CustomInput
              type="radio"
              name={`customField${index}`}
              id={`customField${index}${key}`}
              label={option}
              key={key}
            />
          ))}
        </FormGroup>
      );

    case 'textarea':
      return (
        <FormGroup>
          <Label for={`customField${index}`}>{name}</Label>
          <Input type="textarea" rows={5} id={`customField${index}`} />
        </FormGroup>
      );

    case 'date':
      return (
        <FormGroup>
          <Label for={`customField${index}`}>{name}</Label>
          <Datetime timeFormat={false} bsSize="sm" id={`customField${index}`} />
        </FormGroup>
      );

    case 'time':
      return (
        <FormGroup>
          <Label for={`customField${index}`}>{name}</Label>
          <Datetime dateFormat={false} bsSize="sm" id={`customField${index}`} />
        </FormGroup>
      );

    case 'file':
      return (
        <FormGroup>
          <Label for={`customField${index}`}>{name}</Label>
          <CustomInput type="file" id={`customField${index}`} />
        </FormGroup>
      );

    default:
      return (
        <FormGroup>
          <Label for={`customField${index}`}>{name}</Label>
          <Input id={`customField${index}`} type={type} />
        </FormGroup>
      );
  }
};

CustomField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  options: PropTypes.array
};

const EventCustomField = () => {
  // State
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [options, setOptions] = useState('');
  const [hasOptions, setHasOptions] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const types = [
    { label: 'Text', value: 'text' },
    { label: 'Select', value: 'select' },
    { label: 'Checkboxes', value: 'checkboxes' },
    { label: 'Radio', value: 'radio' },
    { label: 'Textarea', value: 'textarea' },
    { label: 'Date', value: 'date' },
    { label: 'Time', value: 'time' },
    { label: 'Url', value: 'url' },
    { label: 'Email', value: 'email' },
    { label: 'Password', value: 'password' },
    { label: 'Number', value: 'number' },
    { label: 'File', value: 'file' }
  ];

  // Handler
  const validateCustomFieldOptions = () => !hasOptions || (hasOptions && options.length);

  const handleSubmit = e => {
    e.preventDefault();
    if (hasOptions) {
      const updatedOptions = options.split(',');
      setCustomFields([...customFields, { name, type, options: updatedOptions }]);
    } else {
      setCustomFields([...customFields, { name, type }]);
    }

    setName('');
    setType('text');
    setOptions('');
    setHasOptions(false);
    setDisabled(true);
  };

  useEffect(() => {
    setHasOptions(type === 'select' || type === 'checkboxes' || type === 'radio');
  }, [type]);

  useEffect(() => {
    setDisabled(!(name.length && validateCustomFieldOptions()));
    // eslint-disable-next-line
  }, [name, options, type]);

  return (
    <Card className="mb-3 mb-lg-0">
      <FalconCardHeader title="Custom Field" light={false} />
      {isIterableArray(customFields) && (
        <CardBody className="bg-200">
          {customFields.map((customField, index) => (
            <CustomField {...customField} index={index} key={index} />
          ))}
        </CardBody>
      )}
      <CardBody tag={Form} className="bg-light" onSubmit={handleSubmit}>
        <Row form>
          <Col sm>
            <FormGroup>
              <Label for="field-name">Name</Label>
              <Input
                value={name}
                onChange={({ target }) => setName(target.value)}
                bsSize="sm"
                id="field-name"
                placeholder="Name"
              />
            </FormGroup>
          </Col>
          <Col sm>
            <FormGroupSelect
              loading={false}
              label="Type"
              options={types}
              value={type}
              type="select"
              onChange={({ target }) => setType(target.value)}
              bsSize="sm"
              id="field-type"
              placeholder="Name"
            />
          </Col>
        </Row>
        {hasOptions && (
          <FormGroup>
            <Label for="field-options">Field Options</Label>
            <Input
              value={options}
              onChange={({ target }) => setOptions(target.value)}
              type="textarea"
              id="field-options"
              placeholder="Field Options"
            />
            <small className="text-warning">*Separate your options with comma</small>
          </FormGroup>
        )}
        <ButtonIcon color="falcon-default" size="sm" icon="plus" disabled={disabled}>
          Add Field
        </ButtonIcon>
      </CardBody>
    </Card>
  );
};

export default EventCustomField;
