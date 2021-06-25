import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row, UncontrolledTooltip } from 'reactstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DropdownFilter from '../email/inbox/DropdownFilter';
import CalendarEventModal from './CalendarEventModal';
import AddScheduleModal from './AddScheduleModal';
import Flex from '../common/Flex';

import events from '../../data/calendar/events';

const Calendar = () => {
  const calendarRef = useRef();
  const [calendarApi, setCalendarApi] = useState({});
  const [title, setTitle] = useState('');
  const [currentFilter, setCurrentFilter] = useState('Month View');
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenScheduleModal, setIsOpenScheduleModal] = useState(false);
  const [modalEventContent, setModalEventContent] = useState(false);
  const [addScheduleStartDate, setAddScheduleStartDate] = useState();

  const buttonText = {
    today: 'Today',
    month: 'Month view',
    week: 'week',
    day: 'day',
    listWeek: 'list view',
    listYear: 'year'
  };

  const eventTimeFormat = {
    hour: 'numeric',
    minute: '2-digit',
    omitZeroMinute: true,
    meridiem: true
  };

  const viewName = ['Month View', 'Week View', 'Day View', 'List View', 'Year View'];

  const views = {
    week: {
      eventLimit: 3
    }
  };

  const eventList = events.reduce(
    (acc, event) => (event.schedules ? acc.concat(event.schedules.concat(event)) : acc.concat(event)),
    []
  );

  const [initialEvents, setInitialEvents] = useState(eventList);

  useEffect(() => {
    setCalendarApi(calendarRef.current.getApi());
  }, []);

  const handleFilter = filter => {
    setCurrentFilter(filter);
    switch (filter) {
      case 'Month View':
        calendarApi.changeView('dayGridMonth');
        setTitle(calendarApi.getCurrentData().viewTitle);
        break;
      case 'Week View':
        calendarApi.changeView('timeGridWeek');
        setTitle(calendarApi.getCurrentData().viewTitle);
        break;
      case 'Day View':
        calendarApi.changeView('timeGridDay');
        setTitle(calendarApi.getCurrentData().viewTitle);
        break;
      case 'List View':
        calendarApi.changeView('listWeek');
        setTitle(calendarApi.getCurrentData().viewTitle);
        break;
      default:
        calendarApi.changeView('listYear');
        setTitle(calendarApi.getCurrentData().viewTitle);
    }
  };

  const handleEventClick = info => {
    if (info.event.url) {
      window.open(info.event.url);
      info.jsEvent.preventDefault();
    } else {
      setModalEventContent(info);
      setIsOpenModal(true);
    }
  };

  return (
    <>
      <Card className="mb-3">
        <CardHeader>
          <Row noGutters className="align-items-center">
            <Col xs="auto" className="d-flex justify-content-end order-md-1">
              <UncontrolledTooltip placement="bottom" target="previous">
                Previous
              </UncontrolledTooltip>
              <UncontrolledTooltip placement="bottom" target="next">
                Next
              </UncontrolledTooltip>
              <Button
                onClick={() => {
                  calendarApi.prev();
                  setTitle(calendarApi.getCurrentData().viewTitle);
                }}
                color="link"
                className="icon-item icon-item-sm icon-item-hover shadow-none p-0 mr-1 ml-md-2"
                id="previous"
              >
                <FontAwesomeIcon icon="arrow-left" />
              </Button>
              <Button
                onClick={() => {
                  calendarApi.next();
                  setTitle(calendarApi.getCurrentData().viewTitle);
                }}
                color="link"
                className="icon-item icon-item-sm icon-item-hover shadow-none p-0 mr-1"
                id="next"
              >
                <FontAwesomeIcon icon="arrow-right" />
              </Button>
            </Col>
            <Col xs="auto" md="auto" className="order-md-2">
              <h4 className="mb-0 fs-0 fs-sm-1 fs-lg-2 calendar-title">
                {title || `${calendarApi.currentDataManager?.data?.viewTitle}`}
              </h4>
            </Col>
            <Col xs md="auto" tag={Flex} justify="end" className="order-md-3">
              <Button
                size="sm"
                color="falcon-primary"
                onClick={() => {
                  calendarApi.today();
                  setTitle(calendarApi.getCurrentData().viewTitle);
                }}
              >
                Today
              </Button>
            </Col>
            <Col md="auto" className="d-md-none">
              <hr />
            </Col>
            <Col xs="auto" className="d-flex order-md-0">
              <Button color="primary" size="sm" onClick={() => setIsOpenScheduleModal(true)}>
                <FontAwesomeIcon icon="plus" className="mr-1" /> Add Schedule
              </Button>
            </Col>
            <Col className="d-flex justify-content-end order-md-2">
              <DropdownFilter
                className="mr-2"
                filters={viewName}
                currentFilter={currentFilter}
                handleFilter={handleFilter}
                icon="sort"
                right
              />
            </Col>
          </Row>
        </CardHeader>
        <CardBody className="p-0">
          <FullCalendar
            ref={calendarRef}
            headerToolbar={false}
            plugins={[dayGridPlugin, bootstrapPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            themeSystem="bootstrap"
            dayMaxEvents={2}
            height={800}
            stickyHeaderDates={false}
            editable
            selectable
            selectMirror
            select={info => {
              setIsOpenScheduleModal(true);
              setAddScheduleStartDate(info.start);
            }}
            views={views}
            eventTimeFormat={eventTimeFormat}
            eventClick={handleEventClick}
            events={initialEvents}
            buttonText={buttonText}
          />
        </CardBody>
      </Card>

      <AddScheduleModal
        isOpenScheduleModal={isOpenScheduleModal}
        setIsOpenScheduleModal={setIsOpenScheduleModal}
        initialEvents={initialEvents}
        setInitialEvents={setInitialEvents}
        addScheduleStartDate={addScheduleStartDate}
        setAddScheduleStartDate={setAddScheduleStartDate}
      />

      <CalendarEventModal
        isOpenModal={isOpenModal}
        setIsOpenModal={setIsOpenModal}
        modalEventContent={modalEventContent}
      />
    </>
  );
};

export default Calendar;
