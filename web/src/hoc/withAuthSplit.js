import React, { useState } from 'react';
import Container from 'reactstrap/es/Container';
import Background from '../components/common/Background';
import CardBody from 'reactstrap/es/CardBody';
import CardHeader from 'reactstrap/es/CardHeader';
import { Card, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';

const withAuthSplit = OriginalComponent => {
  const UpdatedComponent = props => {
    // State
    const [bgProps, setBgProps] = useState(null);

    return (
      <Container fluid>
        <Row className="min-vh-100 bg-100">
          <Col xs={6} className="d-none d-lg-block">
            {bgProps && <Background {...bgProps} />}
          </Col>
          <Col sm={10} md={6} className="px-sm-0 align-self-center mx-auto py-5">
            <Row noGutters className="justify-content-center">
              <Col lg={9} xl={8} className="col-xxl-6">
                <Card>
                  <CardHeader className="bg-split-card-header bg-circle-shape text-center p-2">
                    <Link
                      className="text-white text-sans-serif font-weight-extra-bold fs-4 z-index-1 position-relative"
                      to="/"
                    >
                      falcon
                    </Link>
                  </CardHeader>
                  <CardBody className="p-4">
                    <OriginalComponent setBgProps={setBgProps} {...props} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  };

  return UpdatedComponent;
};

export default withAuthSplit;
