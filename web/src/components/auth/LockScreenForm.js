import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button, Col, Form, Input, Row } from 'reactstrap';
import withRedirect from '../../hoc/withRedirect';

const LockScreenForm = ({ setRedirect, setRedirectUrl, ...rest }) => {
  // State
  const [password, setPassword] = useState('');

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    setRedirect(true);
    toast.success(`Logged in as Emma Watson`);
  };

  return (
    <Row tag={Form} noGutters onSubmit={handleSubmit} {...rest}>
      <Col>
        <Input
          className="mr-2"
          placeholder="Password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          type="password"
        />
      </Col>
      <Col xs="auto" className="pl-2">
        <Button color="primary" disabled={!password}>
          Login
        </Button>
      </Col>
    </Row>
  );
};

LockScreenForm.propTypes = {
  setRedirect: PropTypes.func.isRequired,
  setRedirectUrl: PropTypes.func
};

export default withRedirect(LockScreenForm);
