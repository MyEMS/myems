import React from 'react';
import PropTypes from 'prop-types';
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import Datetime from 'react-datetime';

const EducationInput = ({ id, label, type, ...rest }) => (
  <FormGroup className="form-group">
    <Row>
      <Col lg={3} className="text-lg-right">
        <Label className="mb-0" htmlFor={id}>
          {label}
        </Label>
      </Col>
      <Col lg={7}>
        {type === 'datetime' ? <Datetime id={id} {...rest} /> : <Input bsSize="sm" id={id} type={type} {...rest} />}
      </Col>
    </Row>
  </FormGroup>
);

EducationInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string
};

export default EducationInput;
