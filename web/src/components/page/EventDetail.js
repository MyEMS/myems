import React, { Fragment, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Element, scroller } from 'react-scroll';
import { Button, Card, CardBody, CardImg, Col, Media, Row } from 'reactstrap';
import ContentWithAsideLayout from '../../layouts/ContentWithAsideLayout';
import GoogleMap from '../map/GoogleMap';
import IconGroup from '../common/icon/IconGroup';
import Calendar from '../common/Calendar';
import ButtonIcon from '../common/ButtonIcon';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconCardFooterLink from '../common/FalconCardFooterLink';
import rawEvents from '../../data/event/events';
import iconList from '../../data/footer/iconList';
import EventSummary from '../event/EventSummary';
import createMarkup from '../../helpers/createMarkup';
import { isIterableArray } from '../../helpers/utils';
import generic13 from '../../assets/img/generic/13.jpg';
import Loader from '../common/Loader';
import useFakeFetch from '../../hooks/useFakeFetch';
import AppContext from '../../context/Context';

const EventDetailContent = () => {
  const { isDark } = useContext(AppContext);

  return (
    <Card>
      <CardBody>
        <h5 className="fs-0 mb-3">New Year's Eve on the Waterfront</h5>
        <p>
          Boston Harbor Now in partnership with the Friends of Christopher Columbus Park, the Wharf District Council and
          the City of Boston is proud to announce the New Year's Eve Midnight Harbor Fireworks! This beloved nearly
          40-year old tradition is made possible by the generous support of local waterfront organizations and
          businesses and the support of the City of Boston and the Office of Mayor Marty Walsh.
        </p>
        <p>
          Join us as we ring in the New Year with a dazzling display over Boston Harbor. Public viewing is free and
          available from the Harborwalk of these suggested viewing locations:
        </p>
        <ul>
          <li>Christopher Columbus Park, North End</li>
          <li>Fan Pier, Seaport District</li>
          <li>East Boston Harborwalk</li>
        </ul>
        <p>The show will begin promptly at midnight.</p>
        <p>
          Register here for a reminder and updates about the harbor fireworks and other waterfront public programs as
          they become available. Be the first to be notified for popular waterfront New Year's Eve public activities.
        </p>
        <h5 className="fs-0 mt-5 mb-2">Tags</h5>
        <Link className="badge border text-600 mr-1" to="#!">
          Things To Do In Brooklyn, NY
        </Link>
        <Link className="badge border text-600 mr-1" to="#!">
          Party
        </Link>
        <Link className="badge border text-600 mr-1" to="#!">
          Music
        </Link>
        <h5 className="fs-0 mt-5 mb-2">Share with friends</h5>
        <IconGroup icons={iconList} />
        <Element name="event-map">
          <GoogleMap
            initialCenter={{
              lat: 48.8583736,
              lng: 2.2922926
            }}
            mapStyle={isDark ? 'Midnight' : 'Default'}
            className="min-vh-50 rounded-soft mt-5"
          >
            <h5>Eiffel Tower</h5>
            <p>
              Gustave Eiffel's iconic, wrought-iron 1889 tower,
              <br /> with steps and elevators to observation decks.
            </p>
          </GoogleMap>
        </Element>
      </CardBody>
    </Card>
  );
};

export const EventDetailBanner = () => (
  <Card className="mb-3">
    <CardImg top src={generic13} alt="Card image" />
    <CardBody>
      <Row className="justify-content-between align-items-center">
        <Col>
          <Media>
            <Calendar day="31" month="Dec" />
            <Media body className="fs--1 ml-2">
              <h5 className="fs-0">FREE New Year's Eve Midnight Harbor Fireworks</h5>
              <p className="mb-0">
                by <Link to="#!">Boston Harbor Now</Link>
              </p>
              <span className="fs-0 text-warning font-weight-semi-bold">$49.99 – $89.99</span>
            </Media>
          </Media>
        </Col>
        <Col md="auto" className="mt-4 mt-md-0">
          <ButtonIcon color="falcon-default" size="sm" className="mr-2" icon="heart" iconClassName="text-danger">
            235
          </ButtonIcon>
          <ButtonIcon color="falcon-default" size="sm" className="mr-2" icon="share-alt">
            Share
          </ButtonIcon>
          <Button color="falcon-primary" size="sm" className="px-4 px-sm-5">
            Register
          </Button>
        </Col>
      </Row>
    </CardBody>
  </Card>
);

const EventDetailAside = () => {
  const { loading, data: events } = useFakeFetch(rawEvents.slice(2));

  const scrollToEventMap = e => {
    e.preventDefault();
    scroller.scrollTo('event-map', {
      smooth: true
    });
  };

  return (
    <Fragment>
      <Card className="mb-3 fs--1">
        <CardBody>
          <h6>Date And Time</h6>
          <p className="mb-1">
            Mon, Dec 31, 2018, 11:59 PM – <br />
            Tue, Jan 1, 2019, 12:19 AM EST
          </p>
          <Link to="#!">Add to Calendar</Link>
          <h6 className="mt-4">Location</h6>
          <div className="mb-1">
            Boston Harborwalk
            <br />
            Christopher Columbus Park
            <br />
            Boston, MA 02109
            <br />
            United States
          </div>
          <Link to="#!" onClick={scrollToEventMap}>
            View Map
          </Link>
          <h6 className="mt-4">Refund Policy</h6>
          <p className="fs--1 mb-0">No Refunds</p>
        </CardBody>
      </Card>
      {isIterableArray(events) && (
        <Card className="mb-3 mb-lg-0">
          <FalconCardHeader title="Events you may like" />
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
      )}
    </Fragment>
  );
};

const EventDetail = () => (
  <ContentWithAsideLayout banner={<EventDetailBanner />} aside={<EventDetailAside />}>
    <EventDetailContent />
  </ContentWithAsideLayout>
);

export default EventDetail;
