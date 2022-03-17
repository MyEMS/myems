import React from 'react';
import { Row, Col, Button } from 'reactstrap';
import bg2 from '../../assets/img/generic/bg-2.jpg';
import Section from '../common/Section';

const Cta = () => (
  <Section overlay image={bg2} position="center top">
    <Row className="justify-content-center text-center">
      <Col lg={8}>
        <p className="fs-3 fs-sm-4 text-white">
          Join our community of 20,000+ developers and content creators on their mission to build better sites and apps.
        </p>
        <Button color="outline-light" size="lg" className="border-2x rounded-pill mt-4 fs-0 py-2" type="button">
          Start your webapp
        </Button>
      </Col>
    </Row>
  </Section>
);

export default Cta;
