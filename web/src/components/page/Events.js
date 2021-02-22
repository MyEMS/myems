import React from 'react';
import { Alert, Card, CardBody, Col, CustomInput, Form, Row } from 'reactstrap';
import EventSummary from '../event/EventSummary';
import Loader from '../common/Loader';
import FalconCardHeader from '../common/FalconCardHeader';
import useFakeFetch from '../../hooks/useFakeFetch';
import rawEvents from '../../data/event/events';
import eventCategories from '../../data/event/eventCategories';
import createMarkup from '../../helpers/createMarkup';
import { isIterableArray } from '../../helpers/utils';

const Events = () => {
  const { loading, data: events } = useFakeFetch(rawEvents);

  return (
    <Card>
      <FalconCardHeader title="Events">
        {isIterableArray(eventCategories) && (
          <Form inline>
            <CustomInput type="select" id="customSelectCategory" name="customSelectCategory" bsSize="sm">
              {eventCategories.map((option, index) => (
                <option value={index} key={index}>
                  {option}
                </option>
              ))}
            </CustomInput>
          </Form>
        )}
      </FalconCardHeader>
      <CardBody className="fs--1">
        {loading ? (
          <Loader />
        ) : isIterableArray(events) ? (
          <Row>
            {events.map(({ additional, ...rest }, index) => (
              <Col md={6} className="h-100" key={index}>
                <EventSummary divider={events.length !== index + 1} {...rest}>
                  <p className="text-1000 mb-0" dangerouslySetInnerHTML={createMarkup(additional)} />
                </EventSummary>
              </Col>
            ))}
          </Row>
        ) : (
          <Alert color="info" className="mb-0">
            No events found!
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};

export default Events;
