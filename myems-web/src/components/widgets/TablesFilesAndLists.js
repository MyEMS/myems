import React from 'react';
import WidgetsSectionTitle from './WidgetsSectionTitle';
import RecentPurchasesTable from './RecentPuchasesTable';
import Customers from '../e-commerce/Customers';
import { Row, Col } from 'reactstrap';

import products from '../../data/dashboard/products';

import files from '../../data/dashboard/files';
import RunningProjects from '../dashboard-alt/RunningProjects';
import BestSellingProducts from '../dashboard-alt/BestSellingProducts';
import SharedFiles from '../dashboard-alt/SharedFiles';
import Experience from '../experience/Experience';
import experiences from '../../data/experience/experiences';

const TablesFilesAndLists = () => (
  <>
    <WidgetsSectionTitle
      icon="list"
      title="Tables, Files, and Lists"
      subtitle="Falcon's styled components are delicately made for displaying your contents and lists."
      transform="shrink-2"
    />
    <RecentPurchasesTable />
    <Customers />
    <Row noGutters>
      <Col lg={6} className="pr-lg-2 mb-3">
        <RunningProjects projects={products} />
      </Col>
      <Col lg={6} className="pl-lg-2 mb-3">
        <BestSellingProducts products={products} />
      </Col>

      <Col lg={6} className="pr-lg-2 mb-3">
        <SharedFiles files={files} />
      </Col>
      <Col lg={6} className="pl-lg-2 mb-3">
        <Experience experiences={experiences} />
      </Col>
    </Row>
  </>
);

export default TablesFilesAndLists;
