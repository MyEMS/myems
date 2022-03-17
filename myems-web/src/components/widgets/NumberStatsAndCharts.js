import React from 'react';

import WidgetsSectionTitle from './WidgetsSectionTitle';
import CardSummary from '../dashboard/CardSummary';
import CountUp from 'react-countup';
import { Row, Col } from 'reactstrap';
import WeeklySales from '../dashboard-alt/WeeklySales';
import TotalOrder from '../dashboard-alt/TotalOrder';
import MarketShare from '../dashboard-alt/MarketShare';
import weeklySales from '../../data/dashboard/weeklySales';
import totalOrder from '../../data/dashboard/totalOrder';
import marketShare from '../../data/dashboard/marketShare';
import BandwidthSaved from '../dashboard-alt/BandwidthSaved';
import TopProducts from '../dashboard-alt/TopProducts';
import StorageStatus from '../dashboard-alt/StorageStatus';
import topProducts, { productColors } from '../../data/dashboard/topProducts';
import storageStatus from '../../data/dashboard/storageStatus';
import PaymentsLineChart from '../dashboard/PaymentsLineChart';
import ActiveUsersBarChart from '../dashboard/ActiveUsersBarChart';
import TotalSales from '../dashboard-alt/TotalSales';

const NumberStatsAndCharts = () => (
  <>
    <WidgetsSectionTitle
      title="Number Stats & Charts"
      subtitle="You can easily show your stats content by using these cards."
      className="mb-4 mt-3"
      icon="percentage"
    />
    <div className="card-deck">
      <CardSummary rate="-0.23%" title="Customers" color="warning" linkText="See all">
        58.39k
      </CardSummary>
      <CardSummary rate="0.0%" title="Orders" color="info" linkText="All orders">
        73.46k
      </CardSummary>
      <CardSummary content="43,594" rate="9.54%" title="Revenue" color="success" linkText="Statistics">
        <CountUp end={43594} duration={5} prefix="$" separator="," decimal="." />
      </CardSummary>
    </div>

    <Row noGutters>
      <Col md={6} lg={4} xl={6} className="col-xxl-4 mb-3 pr-md-2">
        <WeeklySales data={weeklySales} />
      </Col>
      <Col md={6} lg={4} xl={6} className="col-xxl-4 mb-3 pl-md-2 pr-lg-2 pr-xl-0 pr-xxl-2">
        <TotalOrder data={totalOrder} />
      </Col>
      <Col md={6} lg={4} xl={6} className="col-xxl-4 pl-lg-2 pl-xl-0 pl-xxl-2 pr-xl-2 pr-xxl-0 mb-3">
        <MarketShare data={marketShare} />
      </Col>
    </Row>
    <Row noGutters>
      <Col lg={4} className="pr-lg-2 mb-3">
        <BandwidthSaved total={38.44} saved={35.75} />
      </Col>
      <Col lg={8} className="pl-lg-2 mb-3">
        <PaymentsLineChart />
        <StorageStatus data={storageStatus} />
      </Col>
    </Row>
    <Row noGutters>
      <Col lg={5} xl={4} className="pr-lg-2 mb-3 mb-lg-0 pr-lg-2">
        <ActiveUsersBarChart />
      </Col>
      <Col lg={7} xl={8} className="pl-lg-2">
        <TopProducts data={topProducts} colors={productColors} className="mb-3" />
        <TotalSales />
      </Col>
    </Row>
  </>
);

export default NumberStatsAndCharts;
