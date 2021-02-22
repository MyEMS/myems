import React, { Fragment } from 'react';
import ContentWithAsideLayout from '../../layouts/ContentWithAsideLayout';
import EventDetailsForm from '../event/EventDetailsForm';
import EventTicket from '../event/EventTicket';
import EventScheduleForm from '../event/EventScheduleForm';
import EventCustomField from '../event/EventCustomField';
import EventCreateBanner from '../event/EventCreateBanner';
import EventCreateAside from '../event/EventCreateAside';
import EventCreateFooter from '../event/EventCreateFooter';

const EventCreateContent = () => {
  return (
    <Fragment>
      <EventDetailsForm />
      <EventTicket />
      <EventScheduleForm />
      <EventCustomField />
    </Fragment>
  );
};

const EventCreate = () => {
  return (
    <ContentWithAsideLayout banner={<EventCreateBanner />} aside={<EventCreateAside />} footer={<EventCreateFooter />}>
      <EventCreateContent />
    </ContentWithAsideLayout>
  );
};

export default EventCreate;
