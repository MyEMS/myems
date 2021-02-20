import React from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import Logo from '../components/navbar/Logo';
import Section from '../components/common/Section';
import AuthBasicRoutes from '../components/auth/basic/AuthBasicRoutes';

const AuthBasicLayout = () => (
  <Section className="py-0">
    <Row className="flex-center min-vh-100 py-6">
      <Col sm={10} md={8} lg={6} xl={5} className="col-xxl-4">
        <Logo />
        <Card>
          <CardBody className="fs--1 font-weight-normal p-5">
            <AuthBasicRoutes />
          </CardBody>
        </Card>
      </Col>
    </Row>
  </Section>
);

export default AuthBasicLayout;
