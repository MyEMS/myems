import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Input, Label } from 'reactstrap';

const FormGroupInput = ({ id, label, ...rest }) => (
  <FormGroup>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} {...rest} />
  </FormGroup>
);

FormGroupInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  ...Input.propTypes
};

export default FormGroupInput;
