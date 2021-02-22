import React, { useState } from 'react';
import Datetime from 'react-datetime';
import useFakeFetch from '../../hooks/useFakeFetch';
import { Card, CardBody, Col, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import FormGroupSelect from '../common/FormGroupSelect';
import rawTimezones from '../../data/event/timezones';

const EventDetailsForm = () => {
  // Data
  const { loading: loadingTimezones, data } = useFakeFetch(rawTimezones);
  const timezones = data.map(item => ({ value: item.offset, label: `${item.offset} ${item.name}` }));

  // State
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [timezone, setTimezone] = useState('');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    console.log({ title, startDate, startTime, endDate, endTime, deadline, timezone, venue, address });
  };

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Event Details" light={false} />
      <CardBody tag={Form} className="bg-light" onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="title">Event Title</Label>
          <Input id="title" placeholder="Event Title" value={title} onChange={({ target }) => setTitle(target.value)} />
        </FormGroup>
        <Row form>
          <Col sm tag={FormGroup}>
            <Label for="startDate">Start Date</Label>
            <Datetime
              timeFormat={false}
              value={startDate}
              onChange={setStartDate}
              inputProps={{ placeholder: 'd/m/y', id: 'startDate' }}
            />
          </Col>

          <Col sm tag={FormGroup}>
            <Label for="startTime">Start Time</Label>
            <Datetime
              dateFormat={false}
              value={startTime}
              onChange={setStartTime}
              inputProps={{ placeholder: 'H:i', id: 'startTime' }}
            />
          </Col>
        </Row>
        <Row form>
          <Col sm tag={FormGroup}>
            <Label for="endDate">End Date</Label>
            <Datetime
              timeFormat={false}
              value={endDate}
              onChange={setEndDate}
              inputProps={{ placeholder: 'd/m/y', id: 'endDate' }}
            />
          </Col>

          <Col sm tag={FormGroup}>
            <Label for="endTime">End Time</Label>
            <Datetime
              dateFormat={false}
              value={endTime}
              onChange={setEndTime}
              inputProps={{ placeholder: 'H:i', id: 'endTime' }}
            />
          </Col>
        </Row>
        <Row form>
          <Col sm tag={FormGroup}>
            <Label for="deadline">Registration Deadline</Label>
            <Datetime
              timeFormat={false}
              value={deadline}
              onChange={setDeadline}
              inputProps={{ placeholder: 'd/m/y', id: 'deadline' }}
            />
          </Col>

          <Col sm>
            <FormGroupSelect
              id="timezone"
              loading={loadingTimezones}
              onChange={({ target }) => setTimezone(target.value)}
              label="Timezone"
              options={timezones}
              value={timezone}
            />
          </Col>
        </Row>
        <Row form>
          <Col sm tag={FormGroup}>
            <Label for="venue">Venue</Label>
            <Input id="venue" placeholder="Venue" value={venue} onChange={({ target }) => setVenue(target.value)} />
          </Col>

          <Col sm tag={FormGroup}>
            <Label for="address">Address</Label>
            <Input
              id="address"
              placeholder="Address"
              value={address}
              onChange={({ target }) => setAddress(target.value)}
            />
          </Col>
        </Row>

        <Row form>
          <Col sm tag={FormGroup}>
            <Label for="city">City</Label>
            <Input id="city" placeholder="City" value={city} onChange={({ target }) => setCity(target.value)} />
          </Col>

          <Col sm tag={FormGroup}>
            <Label for="state">State</Label>
            <Input id="state" placeholder="State" value={state} onChange={({ target }) => setState(target.value)} />
          </Col>

          <Col sm tag={FormGroup}>
            <Label for="country">Country</Label>
            <Input
              id="country"
              placeholder="Country"
              value={country}
              onChange={({ target }) => setCountry(target.value)}
            />
          </Col>
        </Row>

        <Row form>
          <Col sm>
            <Label for="description">Description</Label>
            <Input
              id="description"
              type="textarea"
              rows={6}
              placeholder="Description"
              value={description}
              onChange={({ target }) => setDescription(target.value)}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default EventDetailsForm;
