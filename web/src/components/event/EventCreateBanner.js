import React, { Fragment } from 'react';
import { Button, Card, CardBody, CardImg, Col, Input, Label, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import generic13 from '../../assets/img/generic/13.jpg';

const EventCreateBanner = () => (
  <Fragment>
    <Card className="mb-3">
      <CardBody>
        <Row className="justify-content-between align-items-center">
          <Col md>
            <h5 className="mb-2 mb-md-0">Create Event</h5>
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
    <Card className="overflow-hidden mb-3">
      <div className="cover-image overflow-hidden">
        <CardImg top src={generic13} alt="" />
        <Input className="d-none" id="upload-cover-image" type="file" />
        <Label className="cover-image-file-input" htmlFor="upload-cover-image">
          <FontAwesomeIcon icon="camera" className="mr-2" />
          <span>Change cover photo</span>
        </Label>
      </div>
    </Card>
  </Fragment>
);

export default EventCreateBanner;
