import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import WizardLayout from './WizardLayout';

const AuthWizardRoutes = ({ match: { url } }) => (
  <Switch>
    <Route path={`${url}/wizard`} exact component={WizardLayout} />

    {/*Redirect*/}
    <Redirect to="/errors/404" />
  </Switch>
);

AuthWizardRoutes.propTypes = { match: PropTypes.object.isRequired };

export default withRouter(AuthWizardRoutes);
