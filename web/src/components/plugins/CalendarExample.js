import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

import PageHeader from '../common/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, CardBody, Row, Col } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const calenderCode = `function fullCalendarExample() {  
  return (
    <FullCalendar
      plugins={[ dayGridPlugin,timeGridPlugin ]}
      initialView="dayGridMonth"
      headerToolbar={ {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      events= 'https://fullcalendar.io/demo-events.json'
    />
  );
}`;
const CalendarExample = () => {
  return (
    <>
      <PageHeader
        title="Full Calendar"
        description="FullCalendar seamlessly integrates with the React JavaScript framework. It provides a component that exactly matches the functionality of FullCalendar’s standard API."
        className="mb-3"
      >
        <Button tag="a" href="https://fullcalendar.io/" target="_blank" color="link" size="sm" className="pl-0">
          FullCalendar Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Row>
        <Col>
          <Card>
            <FalconCardHeader title="FullCalendar example" />
            <CardBody>
              <FalconEditor
                code={calenderCode}
                scope={{ FullCalendar, dayGridPlugin, timeGridPlugin }}
                language="jsx"
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CalendarExample;
