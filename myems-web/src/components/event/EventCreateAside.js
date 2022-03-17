import React, { useState } from 'react';
import useFakeFetch from '../../hooks/useFakeFetch';
import { Card, CardBody, CustomInput, FormGroup } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import EventCreateSelect from './EventCreateSelect';
import FormGroupSelect from '../common/FormGroupSelect';
import rawOrganizers from '../../data/event/organizers';
import rawSponsors from '../../data/event/sponsors';
import rawEventTypes from '../../data/event/eventTypes';
import rawEventTopics from '../../data/event/eventTopics';
import rawEventTags from '../../data/event/eventTags';

const EventCreateAside = () => {
  // Get Data
  const { loading: loadingOrganizers, data: organizers } = useFakeFetch(rawOrganizers);
  const { loading: loadingSponsors, data: sponsors } = useFakeFetch(rawSponsors);
  const { loading: loadingEventTypes, data: eventTypes } = useFakeFetch(rawEventTypes);
  const { loading: loadingEventTopics, data: eventTopics } = useFakeFetch(rawEventTopics);
  const { loading: loadingEventTags, data: eventTags } = useFakeFetch(rawEventTags);

  // State
  const [organizer, setOrganizer] = useState([]);
  const [sponsor, setSponsor] = useState([]);
  const [eventType, setEventType] = useState('');
  const [eventTopic, setEventTopic] = useState('');
  const [eventTag, setEventTag] = useState([]);
  const [privacy, setPrivacy] = useState('public');
  const [showTicket, setShowTicket] = useState(true);

  return (
    <Card className="mb-3 mb-lg-0">
      <FalconCardHeader title="Other Info" light={false} />
      <CardBody className="bg-light">
        <EventCreateSelect
          loading={loadingOrganizers}
          label="Organizer"
          options={organizers}
          placeholder="Select Organizer..."
          value={organizer}
          onChange={value => setOrganizer(value)}
          closeMenuOnSelect={false}
          isMulti
        />
        <EventCreateSelect
          loading={loadingSponsors}
          label="Sponsors"
          options={sponsors}
          placeholder="Select Sponsors..."
          value={sponsor}
          onChange={value => setSponsor(value)}
          closeMenuOnSelect={false}
          isMulti
        />
        <FormGroupSelect
          loading={loadingEventTypes}
          id="eventType"
          label="Event Type"
          options={eventTypes}
          value={eventType}
          onChange={({ target }) => setEventType(target.value)}
        />
        <FormGroupSelect
          loading={loadingEventTopics}
          id="eventTopics"
          label="Event Topics"
          options={eventTopics}
          value={eventTopic}
          onChange={({ target }) => setEventTopic(target.value)}
        />
        <EventCreateSelect
          loading={loadingEventTags}
          label="Tags"
          options={eventTags}
          value={eventTag}
          onChange={value => setEventTag(value)}
          placeholder="Select Tags..."
          closeMenuOnSelect={false}
          isMulti
        />

        <hr className="border-dashed border-bottom-0" />
        <h6>Listing Privacy</h6>

        <FormGroup
          tag={CustomInput}
          type="radio"
          id="exampleCustomRadio"
          name="customRadio"
          label={<strong>Public page:</strong>}
          value="public"
          checked={privacy === 'public'}
          onChange={({ target }) => setPrivacy(target.value)}
        >
          <small className="form-text mt-0">
            Discoverable by anyone on Falcon, our distribution partners, and search engines.
          </small>
        </FormGroup>

        <FormGroup
          tag={CustomInput}
          type="radio"
          id="exampleCustomRadio2"
          name="customRadio"
          label={<strong>Private page:</strong>}
          value="private"
          checked={privacy === 'private'}
          onChange={({ target }) => setPrivacy(target.value)}
        >
          <small className="form-text mt-0">Accessible only by people you specify.</small>
        </FormGroup>

        <hr className="border-dashed border-bottom-0" />
        <h6>Remaining Tickets</h6>
        <FormGroup className="mb-0">
          <CustomInput
            type="checkbox"
            id="exampleCustomCheckbox"
            label="Show the number of remaining tickets"
            checked={showTicket}
            onChange={({ target }) => setShowTicket(target.checked)}
          />
        </FormGroup>
      </CardBody>
    </Card>
  );
};

export default EventCreateAside;
