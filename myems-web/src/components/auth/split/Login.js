import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Flex from '../../common/Flex';
import LoginForm from '../LoginForm';
import withAuthSplit from '../../../hoc/withAuthSplit';

import bgImg from '../../../assets/img/generic/14.jpg';

const Login = ({ setBgProps }) => {
  useEffect(() => setBgProps({ image: bgImg, position: '50% 20%' }), [setBgProps]);

  return (
    <Fragment>
      <Flex align="center" justify="between">
        <h3>Login</h3>
        <p className="mb-0 fs--1">
          <span className="font-weight-semi-bold">New User? </span>
          <Link to="/authentication/split/register">Create account</Link>
        </p>
      </Flex>
      <LoginForm layout="split" hasLabel />
    </Fragment>
  );
};

Login.propTypes = { setBgProps: PropTypes.func.isRequired };

export default withAuthSplit(Login);
