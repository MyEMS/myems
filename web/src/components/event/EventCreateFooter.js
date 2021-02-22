import React from 'react';
import { Button, Card, CardBody, Col, Row } from 'reactstrap';

const EventCreateFooter = () => {
  return (
    <Card className="mt-3">
      <CardBody>
        <Row className="justify-content-between align-items-center">
          <Col md>
            <h5 className="mb-2 mb-md-0">Nice Job! You're almost done</h5>
          </Col>
          <Col xs="auto">
            <Button color="falcon-default" size="sm" className="mr-2">
              Save
            </Button>
            <Button color="falcon-primary" size="sm">
              Make your event live
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default EventCreateFooter;
