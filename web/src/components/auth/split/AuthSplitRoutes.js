import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import Login from './Login';
import Logout from './Logout';
import Registration from './Registration';
import ForgetPassword from './ForgetPassword';
import PasswordReset from './PasswordReset';
import ConfirmMail from './ConfirmMail';
import LockScreen from './LockScreen';

const AuthSplitRoutes = ({ match: { url } }) => (
  <Switch>
    <Route path={`${url}/login`} exact component={Login} />
    <Route path={`${url}/logout`} exact component={Logout} />
    <Route path={`${url}/register`} exact component={Registration} />
    <Route path={`${url}/forget-password`} exact component={ForgetPassword} />
    <Route path={`${url}/confirm-mail`} exact component={ConfirmMail} />
    <Route path={`${url}/password-reset`} exact component={PasswordReset} />
    <Route path={`${url}/lock-screen`} exact component={LockScreen} />

    {/*Redirect*/}
    <Redirect to="/errors/404" />
  </Switch>
);
AuthSplitRoutes.propTypes = { match: PropTypes.object.isRequired };

export default AuthSplitRoutes;
