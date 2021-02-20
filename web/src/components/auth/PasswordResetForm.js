import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import withRedirect from '../../hoc/withRedirect';
import Label from 'reactstrap/es/Label';
import classNames from 'classnames';

const PasswordResetForm = ({ setRedirect, setRedirectUrl, layout, hasLabel }) => {
  // State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    toast.success('Login with your new password');
    setRedirect(true);
  };

  useEffect(() => {
    setRedirectUrl(`/authentication/${layout}/login`);
  }, [setRedirectUrl, layout]);

  useEffect(() => {
    if (password === '' || confirmPassword === '') return setIsDisabled(true);

    setIsDisabled(password !== confirmPassword);
  }, [password, confirmPassword]);

  return (
    <Form className={classNames('mt-3', { 'text-left': hasLabel })} onSubmit={handleSubmit}>
      <FormGroup>
        {hasLabel && <Label>New Password</Label>}
        <Input
          placeholder={!hasLabel ? 'New Password' : ''}
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          type="password"
        />
      </FormGroup>
      <FormGroup>
        {hasLabel && <Label>Confirm Password</Label>}
        <Input
          placeholder={!hasLabel ? 'Confirm Password' : ''}
          value={confirmPassword}
          onChange={({ target }) => setConfirmPassword(target.value)}
          type="password"
        />
      </FormGroup>
      <Button color="primary" block className="mt-3" disabled={isDisabled}>
        Set password
      </Button>
    </Form>
  );
};

PasswordResetForm.propTypes = {
  setRedirect: PropTypes.func.isRequired,
  setRedirectUrl: PropTypes.func.isRequired,
  layout: PropTypes.string,
  hasLabel: PropTypes.bool
};

PasswordResetForm.defaultProps = { layout: 'basic', hasLabel: false };

export default withRedirect(PasswordResetForm);
