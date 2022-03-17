import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, CardBody } from 'reactstrap';
import Member from '../page/Member';
import FalconCardHeader from '../common/FalconCardHeader';
import people from '../../data/people/people';

const ProfileFooter = () => {
  return (
    <Card className="mt-3">
      <FalconCardHeader title="Followers">
        <Link to="/pages/people" className="text-sans-serif">
          All Members
        </Link>
      </FalconCardHeader>

      <CardBody className="bg-light p-0">
        <Row noGutters className="text-center fs--1">
          {people.slice(0, 12).map((follower, index) => (
            <Col xs="6" md="4" lg="3" className="mb-1 col-xxl-2" key={index}>
              <Member {...follower} />
            </Col>
          ))}
        </Row>
      </CardBody>
    </Card>
  );
};

export default ProfileFooter;
