import React, { Fragment } from 'react';
import WizardInput from './WizardInput';
import { Col, CustomInput, Row } from 'reactstrap';

const BasicUserForm = ({ register, errors, watch }) => {
  return (
    <Fragment>
      <WizardInput
        label="Name*"
        placeholder="Name"
        name="name"
        id="name"
        innerRef={register({
          required: 'Name is required',
          minLength: {
            value: 2,
            message: 'Min length 2'
          }
        })}
        errors={errors}
      />
      <WizardInput
        label="Email*"
        placeholder="Email"
        id="email"
        name="email"
        innerRef={register({
          required: 'Email is required',
          pattern: {
            value: /[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})/i,
            message: 'Email must be valid'
          }
        })}
        errors={errors}
      />
      <Row form>
        <Col>
          <WizardInput
            type="password"
            label="Password*"
            placeholder="Password"
            id="password"
            name="password"
            innerRef={register({
              required: 'You must specify a password',
              minLength: {
                value: 2,
                message: 'Password must have at least 2 characters'
              }
            })}
            errors={errors}
          />
        </Col>
        <Col>
          <WizardInput
            type="password"
            label="Confirm Password*"
            placeholder="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            innerRef={register({
              validate: value => value === watch('password') || 'The password do not match'
            })}
            errors={errors}
          />
        </Col>
      </Row>
      <WizardInput
        type="checkbox"
        id="agreeToTerms"
        tag={CustomInput}
        label={
          <Fragment>
            I accept the <a href="#!"> terms</a> and <a href="#!"> privacy policy</a>
          </Fragment>
        }
        name="agreeToTerms"
        innerRef={register({
          required: 'You have to agree with us'
        })}
        errors={errors}
      />
    </Fragment>
  );
};

export default BasicUserForm;
