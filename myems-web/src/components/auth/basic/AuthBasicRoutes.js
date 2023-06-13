import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
// import Login from './Login';
import Login from '../../MyEMS/auth/basic/Login';
// import Logout from './Logout';
import Logout from '../../MyEMS/auth/basic/Logout';
import Registration from './Registration';
// import ForgotPassword from './ForgotPassword';
import PasswordReset from './PasswordReset';
import SentForgotPasswordEmailMessage from '../../MyEMS/auth/basic/SentForgotPasswordEmailMessage';
// import ConfirmMail from './ConfirmMail';
import ConfirmMail from '../../MyEMS/auth/basic/ConfirmMail';
import LockScreen from './LockScreen';
import ChangePassword from '../../MyEMS/auth/basic/ChangePassword';
import SentRegisterEmailMessage from '../../MyEMS/auth/basic/SentRegisterEmailMessage';

const AuthBasicRoutes = ({ match: { url } }) => (
  <Switch>
    <Route path={`${url}/login`} exact component={Login} />
    <Route path={`${url}/logout`} exact component={Logout} />
    <Route path={`${url}/register`} exact component={Registration} />
    <Route path={`${url}/confirm-mail`} exact component={ConfirmMail} />
    <Route path={`${url}/password-reset`} exact component={PasswordReset} />
    <Route path={`${url}/lock-screen`} exact component={LockScreen} />
    <Route path={`${url}/change-password`} exact component={ChangePassword} />
    <Route path={`${url}/sent-register-email`} exact component={SentRegisterEmailMessage} />
    <Route path={`${url}/sent-forgot-email`} exact component={SentForgotPasswordEmailMessage} />

    {/*Redirect*/}
    <Redirect to="/errors/404" />
  </Switch>
);

AuthBasicRoutes.propTypes = { match: PropTypes.object.isRequired };

export default withRouter(AuthBasicRoutes);
