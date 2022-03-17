import React from 'react';
import { Card, CardBody } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import { isIterableArray } from '../../helpers/utils';
import EventSummary from '../event/EventSummary';
import FalconCardFooterLink from '../common/FalconCardFooterLink';
import useFakeFetch from '../../hooks/useFakeFetch';
import Loader from '../common/Loader';
import createMarkup from '../../helpers/createMarkup';
import rawEvents from '../../data/event/events';

const resolvedEvents = rawEvents.slice(2);

const FeedInterest = props => {
  const { loading, data: events } = useFakeFetch(resolvedEvents);

  return (
    <Card {...props}>
      <FalconCardHeader title="You may interested" titleTag="h5" />
      <CardBody className="fs--1">
        {loading ? (
          <Loader />
        ) : (
          isIterableArray(events) &&
          events.map(({ id, additional, ...rest }, index) => (
            <EventSummary {...rest} divider={events.length !== index + 1} key={id}>
              <p className="text-1000 mb-0" dangerouslySetInnerHTML={createMarkup(additional)} />
            </EventSummary>
          ))
        )}
      </CardBody>
      <FalconCardFooterLink title="All Events" to="/pages/events" />
    </Card>
  );
};

export default FeedInterest;
