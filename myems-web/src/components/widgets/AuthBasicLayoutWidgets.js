import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody } from 'reactstrap';

const AuthBasicLayoutWidgets = ({ children, ...rest }) => (
  <Card {...rest}>
    <CardBody className="font-weight-normal p-sm-5 p-4">{children}</CardBody>
  </Card>
);

AuthBasicLayoutWidgets.propTypes = {
  children: PropTypes.element.isRequired
};

export default AuthBasicLayoutWidgets;
