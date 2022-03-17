import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../LoginForm';

import AuthCardLayout from '../../../layouts/AuthCardLayout';

const Login = () => {
  return (
    <AuthCardLayout
      leftSideContent={
        <Fragment>
          <p>
            Don't have an account?
            <br />
            <Link className="text-white text-underline" to="/authentication/card/register">
              Get started!
            </Link>
          </p>
          <p className="mb-0 mt-4 mt-md-5 fs--1 font-weight-semi-bold text-300">
            Read our{' '}
            <Link className="text-underline text-300" to="#!">
              terms
            </Link>{' '}
            and{' '}
            <Link className="text-underline text-300" to="#!">
              conditions{' '}
            </Link>
          </p>
        </Fragment>
      }
    >
      <h3>Account Login</h3>
      <LoginForm layout="card" hasLabel />
    </AuthCardLayout>
  );
};

export default Login;
