import React from 'react';
import WidgetsSectionTitle from './WidgetsSectionTitle';
import { Row, Col } from 'reactstrap';
import Error404 from '../errors/Error404';
import Error500 from '../errors/Error500';

const Errors = () => (
  <>
    <WidgetsSectionTitle
      icon="exclamation-circle"
      title="Errors"
      subtitle="Display your error pages with awesome cards."
    />
    <Row noGutters>
      <Col lg={6} className="pr-lg-2 mb-3 mb-lg-0">
        <Error404 />
      </Col>
      <Col lg={6} className="pl-lg-2">
        <Error500 />
      </Col>
    </Row>
  </>
);

export default Errors;
