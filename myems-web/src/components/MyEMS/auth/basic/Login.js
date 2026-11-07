import React, { Fragment } from 'react';
import LoginForm from '../LoginForm';
import { withTranslation } from 'react-i18next';

const Login = ({ t }) => (
  <Fragment>
    <h4 className="mb-4 font-weight-semi-bold">{t('Log in')}</h4>
    <LoginForm />
  </Fragment>
);

export default withTranslation()(Login);
