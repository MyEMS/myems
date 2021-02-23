import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { CloseButton, Fade } from '../components/common/Toast';

import DashboardLayout from './DashboardLayout';
import ErrorLayout from './ErrorLayout';

import loadable from '@loadable/component';
const AuthBasicLayout = loadable(() => import('./AuthBasicLayout'));
const Landing = loadable(() => import('../components/landing/Landing'));
const WizardLayout = loadable(() => import('../components/auth/wizard/WizardLayout'));
const AuthCardRoutes = loadable(() => import('../components/auth/card/AuthCardRoutes'));
const AuthSplitRoutes = loadable(() => import('../components/auth/split/AuthSplitRoutes'));

const Layout = () => {
  useEffect(() => {
    AuthBasicLayout.preload();
    Landing.preload();
    WizardLayout.preload();
    AuthCardRoutes.preload();
    AuthSplitRoutes.preload();
  }, []);

  return (
    <Router fallback={<span />}>
      <Switch>
        <Route path="/landing" exact component={Landing} />
        <Route path="/authentication/basic" component={AuthBasicLayout} />
        <Route path="/authentication/card" component={AuthCardRoutes} />
        <Route path="/authentication/split" component={AuthSplitRoutes} />
        <Route path="/authentication/wizard" component={WizardLayout} />
        <Route path="/errors" component={ErrorLayout} />
        <Route component={DashboardLayout} />
      </Switch>
      <ToastContainer transition={Fade} closeButton={<CloseButton />} position={toast.POSITION.BOTTOM_LEFT} />
    </Router>
  );
};

export default Layout;
