import React from 'react';
import PropTypes from 'prop-types';
import { CardBody, Card, CardHeader } from 'reactstrap';
import { Link } from 'react-router-dom';
import Flex from '../common/Flex';

const AuthSplitLayoutWidgets = ({ children, className }) => (
  <Card className={className}>
    <CardHeader className="bg-split-card-header bg-circle-shape text-center p-2">
      <Link className="text-white text-sans-serif font-weight-extra-bold fs-4 z-index-1 position-relative" to="/">
        falcon
      </Link>
    </CardHeader>
    <CardBody>
      <Flex align="center" justify="between">
        <h3>Login</h3>
        <p className="mb-0 fs--1">
          <span className="font-weight-semi-bold">New User? </span>
          <Link to="/authentication/split/register">Create account</Link>
        </p>
      </Flex>
      {children}
    </CardBody>
  </Card>
);

AuthSplitLayoutWidgets.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default AuthSplitLayoutWidgets;
