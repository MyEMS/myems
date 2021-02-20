import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import withRedirect from '../../hoc/withRedirect';

const ForgetPasswordForm = ({ setRedirect, setRedirectUrl, layout }) => {
  // State
  const [email, setEmail] = useState('');

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    if (email) {
      toast.success(`An email is sent to ${email} with password reset link`);
      setRedirect(true);
    }
  };

  useEffect(() => {
    setRedirectUrl(`/authentication/${layout}/confirm-mail`);
  }, [setRedirectUrl, layout]);

  return (
    <Form className="mt-4" onSubmit={handleSubmit}>
      <FormGroup>
        <Input
          className="form-control"
          placeholder="Email address"
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          type="email"
        />
      </FormGroup>
      <FormGroup>
        <Button color="primary" block disabled={!email}>
          Send reset link
        </Button>
      </FormGroup>
      <Link className="fs--1 text-600" to="#!">
        I can't recover my account using this page
        <span className="d-inline-block ml-1">&rarr;</span>
      </Link>
    </Form>
  );
};

ForgetPasswordForm.propTypes = {
  setRedirect: PropTypes.func.isRequired,
  setRedirectUrl: PropTypes.func.isRequired,
  layout: PropTypes.string
};

ForgetPasswordForm.defaultProps = { layout: 'basic' };

export default withRedirect(ForgetPasswordForm);
