import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, Row } from 'reactstrap';
import Background from '../components/common/Background';
import Flex from '../components/common/Flex';
import Section from '../components/common/Section';
import AppContext from '../context/Context';

import bgShape from '../assets/img/illustrations/bg-shape.png';
import shape1 from '../assets/img/illustrations/shape-1.png';
import halfCircle from '../assets/img/illustrations/half-circle.png';

const AuthCardLayout = ({ leftSideContent, children }) => {
  const { isDark } = useContext(AppContext);
  return (
    <Section fluid className="py-0">
      <Row noGutters className="min-vh-100 flex-center">
        <Col lg={8} className="col-xxl-5 py-3">
          <img className="bg-auth-circle-shape" src={bgShape} alt="" width="250" />
          <img className="bg-auth-circle-shape-2" src={shape1} alt="" width="150" />
          <Card className="overflow-hidden z-index-1">
            <CardBody className="p-0">
              <Row noGutters className="h-100">
                <Col md={5} className="text-white text-center bg-card-gradient">
                  <div className="position-relative p-4 pt-md-5 pb-md-7">
                    <Background image={halfCircle} className="bg-auth-card-shape" />
                    <div className="z-index-1 position-relative">
                      <Link
                        className="text-white mb-4 text-sans-serif font-weight-extra-bold fs-4 d-inline-block"
                        to="/"
                      >
                        falcon
                      </Link>
                      <p className={isDark ? 'text-800' : 'text-100'}>
                        With the power of Falcon, you can now focus only on functionaries for your digital products,
                        while leaving the UI design on us!
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 mb-4 mt-md-4 mb-md-5">{leftSideContent}</div>
                </Col>
                <Col md={7} tag={Flex} align="center" justify="center">
                  <div className="p-4 p-md-5 flex-grow-1">{children}</div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Section>
  );
};
AuthCardLayout.propTypes = {
  leftSideContent: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired
};

export default AuthCardLayout;
