import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import editing from '../../assets/img/illustrations/4.png';

const Starter = () => (
  <Card>
    <CardBody className="overflow-hidden p-lg-6">
      <Row className="align-items-center justify-content-between">
        <Col lg={6}>
          <img src={editing} className="img-fluid" alt="" />
        </Col>
        <Col lg={6} className="pl-lg-4 my-5 text-center text-lg-left">
          <h3>Edit me!</h3>
          <p className="lead">Create Something Beautiful.</p>
          <Link className="btn btn-falcon-primary" to="/documentation">
            Getting started
          </Link>
        </Col>
      </Row>
    </CardBody>
  </Card>
);

export default Starter;
