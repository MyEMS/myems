import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
// import Dashboard from '../components/dashboard/Dashboard';
import Dashboard from '../components/MyEMS/dashboard/Dashboard';
import DashboardAlt from '../components/dashboard-alt/DashboardAlt';
import NavbarTop from '../components/navbar/NavbarTop';
import NavbarVertical from '../components/navbar/NavbarVertical';
import Footer from '../components/footer/Footer';
import loadable from '@loadable/component';
import AppContext from '../context/Context';
import ProductProvider from '../components/e-commerce/ProductProvider';
import SidePanelModal from '../components/side-panel/SidePanelModal';
import { getPageName } from '../helpers/utils';

// const DashboardRoutes = loadable(() => import('./DashboardRoutes'));
const DashboardRoutes = loadable(() => import('./MyEMSRoutes'));

const DashboardLayout = ({ location }) => {
  const { isFluid, isTopNav, navbarStyle } = useContext(AppContext);

  const isKanban = getPageName('kanban');

  useEffect(() => {
    DashboardRoutes.preload();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={isFluid || isKanban ? 'container-fluid' : 'container'}>
      {!isTopNav && <NavbarVertical isKanban={isKanban} navbarStyle={navbarStyle} />}
      <ProductProvider>
        <div className="content">
          <NavbarTop />
          <Switch>
            {/* added one more route to avoid navlink active issue */}
            <Route path="/" exact component={Dashboard} />
            <Route path="/dashboard" exact component={Dashboard} />
            <Route path="/dashboard-alt" exact component={DashboardAlt} />
            <DashboardRoutes />
          </Switch>
          {!isKanban && <Footer />}
        </div>
        <SidePanelModal autoShow={false} path={location.pathname} />
      </ProductProvider>
    </div>
  );
};

DashboardLayout.propTypes = { location: PropTypes.object.isRequired };

export default DashboardLayout;
