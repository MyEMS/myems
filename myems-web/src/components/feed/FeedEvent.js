import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Col, Row, Media, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import Calendar from '../common/Calendar';

const FeedEvent = ({ title, calender, author, regFee, eventImg }) => (
  <Card className="p-0 shadow-none">
    {!!eventImg && <img className="card-img-top" src={eventImg} alt="" />}
    <CardBody className="overflow-hidden">
      <Row className="flex-center">
        <Col>
          <Media className="media">
            <Calendar {...calender} />
            <Media body className="fs--1 ml-2">
              <h5 className="fs-0 text-capitalize">
                <Link to="/pages/event-detail">{title}</Link>
              </h5>
              <p className="mb-0 text-capitalize">
                by <a href="#!">{author}</a>
              </p>
              <span className="fs-0 text-warning font-weight-semi-bold">{regFee}</span>
            </Media>
          </Media>
        </Col>
        <Col md="auto" className="d-none d-md-block">
          <Button color="falcon-default" size="sm" className="px-4">
            Register
          </Button>
        </Col>
      </Row>
    </CardBody>
  </Card>
);

FeedEvent.PropType = {
  title: PropTypes.string.isRequired,
  calender: PropTypes.object.isRequired,
  author: PropTypes.string.isRequired,
  regFee: PropTypes.string.isRequired,
  eventImg: PropTypes.string
};

export default FeedEvent;
