import React, { Fragment } from 'react';
import { Col, Row } from 'reactstrap';
import Weather from './Weather';
import StorageStatus from './StorageStatus';
import SpaceWarning from './SpaceWarning';
import WeeklySales from './WeeklySales';
import TotalOrder from './TotalOrder';
import MarketShare from './MarketShare';
import BestSellingProducts from './BestSellingProducts';
import RunningProjects from './RunningProjects';
import SharedFiles from './SharedFiles';
import ActiveUsers from './ActiveUsers';
import BandwidthSaved from './BandwidthSaved';
import TopProducts from './TopProducts';
import TotalSales from './TotalSales';

import weeklySales from '../../data/dashboard/weeklySales';
import totalOrder from '../../data/dashboard/totalOrder';
import marketShare from '../../data/dashboard/marketShare';
import weather from '../../data/dashboard/weather';
import storageStatus from '../../data/dashboard/storageStatus';
import products from '../../data/dashboard/products';
import files from '../../data/dashboard/files';
import users from '../../data/dashboard/users';
import topProducts, { productColors } from '../../data/dashboard/topProducts';

const DashboardAlt = () => {
  const resolveUsers = users.slice(0, 5);
  return (
    <Fragment>
      <Row noGutters>
        <Col md={6} className="col-xxl-3 mb-3 pr-md-2">
          <WeeklySales data={weeklySales} />
        </Col>
        <Col md={6} className="col-xxl-3 mb-3 pl-md-2 pr-xxl-2">
          <TotalOrder data={totalOrder} />
        </Col>
        <Col md={6} className="col-xxl-3 mb-3 pr-md-2 pl-xxl-2">
          <MarketShare data={marketShare} />
        </Col>
        <Col md={6} className="col-xxl-3 mb-3 pl-md-2">
          <Weather data={weather} className="h-md-100" />
        </Col>
      </Row>

      <Row noGutters>
        <Col lg={6} className="mb-3 pr-lg-2 mb-3">
          <RunningProjects projects={products} />
        </Col>
        <Col lg={6} className="mb-3 pl-lg-2 mb-3">
          <TotalSales className="h-lg-100" />
        </Col>
      </Row>

      <Row noGutters>
        <Col lg={6} xl={7} className="col-xxl-8 pr-lg-2 mb-3">
          <StorageStatus data={storageStatus} className="h-lg-100" />
        </Col>
        <Col lg={6} xl={5} className="col-xxl-4 mb-3 pl-lg-2">
          <SpaceWarning />
        </Col>
      </Row>

      <Row noGutters>
        <Col lg={7} xl={8} className="mb-3 pr-lg-2 mb-3">
          <BestSellingProducts products={products} />
        </Col>
        <Col lg={5} xl={4} className="mb-3 pl-lg-2">
          <SharedFiles files={files} />
        </Col>
      </Row>

      <Row noGutters>
        <Col sm={6} className="col-xxl-3 pr-sm-2 mb-3 mb-xxl-0">
          <ActiveUsers users={resolveUsers} />
        </Col>
        <Col sm={6} className="col-xxl-3 pl-sm-2 order-xxl-1 mb-xxl-0  mb-3">
          <BandwidthSaved total={38.44} saved={35.75} />
        </Col>
        <Col className="col-xxl-6 px-xxl-2">
          <TopProducts data={topProducts} colors={productColors} className="h-100" />
        </Col>
      </Row>
    </Fragment>
  );
};

export default DashboardAlt;
