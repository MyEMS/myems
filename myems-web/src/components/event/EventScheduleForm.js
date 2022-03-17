import React, { useState } from 'react';
import Datetime from 'react-datetime';
import { Card, CardBody, Col, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';

const EventScheduleForm = () => {
  // State
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Schedule" light={false} />
      <CardBody tag={Form} className="bg-light">
        <Row form>
          <Col xs={12}>
            <FormGroup>
              <Label htmlFor="schedule-title">Title</Label>
              <Input
                value={title}
                onChange={({ target }) => setTitle(target.value)}
                bsSize="sm"
                id="schedule-title"
                placeholder="Title"
              />
            </FormGroup>
          </Col>
          <Col sm={6}>
            <FormGroup>
              <Label htmlFor="schedule-start-date">Start Date</Label>
              <Datetime
                value={startDate}
                timeFormat={false}
                onChange={setStartDate}
                inputProps={{
                  className: 'form-control form-control-sm',
                  placeholder: 'd/m/y',
                  id: 'schedule-start-date'
                }}
              />
            </FormGroup>
          </Col>
          <Col sm={6}>
            <FormGroup>
              <Label htmlFor="schedule-start-time">Start Time</Label>
              <Datetime
                value={startTime}
                dateFormat={false}
                onChange={setStartTime}
                inputProps={{
                  className: 'form-control form-control-sm',
                  placeholder: 'H:i',
                  id: 'schedule-start-time'
                }}
              />
            </FormGroup>
          </Col>
          <Col sm={6}>
            <FormGroup>
              <Label htmlFor="schedule-end-date">End Date</Label>
              <Datetime
                value={endDate}
                timeFormat={false}
                onChange={setEndDate}
                inputProps={{
                  className: 'form-control form-control-sm',
                  placeholder: 'd/m/y',
                  id: 'schedule-end-date'
                }}
              />
            </FormGroup>
          </Col>
          <Col sm={6}>
            <FormGroup>
              <Label htmlFor="schedule-end-time">End Time</Label>
              <Datetime
                value={endTime}
                dateFormat={false}
                onChange={setEndTime}
                inputProps={{
                  className: 'form-control form-control-sm',
                  placeholder: 'H:i',
                  id: 'schedule-end-time'
                }}
              />
            </FormGroup>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default EventScheduleForm;
