import React from 'react';
import partnerList from '../../data/partner/partnerList';
import Section from '../common/Section';
import { Row, Col } from 'reactstrap';

const Partner = props => (
  <Col xs={3} sm="auto" className="my-1 my-sm-3 px-card">
    <img className="landing-cta-img" {...props} alt="Partner" />
  </Col>
);

const Partners = () => {
  return (
    <Section bg="light" className="py-3 shadow-sm">
      <Row className="flex-center">
        {partnerList.map((partner, index) => (
          <Partner key={index} {...partner} />
        ))}
      </Row>
    </Section>
  );
};

export default Partners;
