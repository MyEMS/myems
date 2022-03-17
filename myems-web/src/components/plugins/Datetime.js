import React, { Fragment } from 'react';
import Datetime from 'react-datetime';
import { Button, Card, CardBody, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const timeCode = `function TimePickerExample() {
  const [startTime, setStartTime] = useState(null);
  
  return (
    <Datetime
      dateFormat={false}
      value={startTime}
      onChange={setStartTime}
    />
  );
}`;

const dateCode = `function DatePickerExample() {
  const [startDate, setStartDate] = useState(null);
  
  return (
    <Datetime
      timeFormat={false}
      value={startDate}
      onChange={setStartDate}
    />
  );
}`;

const DatetimeExample = () => (
  <Fragment>
    <PageHeader
      title="React Datetime"
      description="A date and time picker in the same React.js component. It can be used as a datepicker, timepicker or both at the same time. It is highly customizable and it even allows to edit date's milliseconds."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://github.com/YouCanBookMe/react-datetime"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        React Datetime Documentation
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Row>
      <Col>
        <Card>
          <FalconCardHeader title="Time picker example" />
          <CardBody>
            <FalconEditor code={timeCode} scope={{ Datetime }} language="jsx" />
          </CardBody>
        </Card>
      </Col>
      <Col>
        <Card>
          <FalconCardHeader title="Date picker example" />
          <CardBody>
            <FalconEditor code={dateCode} scope={{ Datetime }} language="jsx" />
          </CardBody>
        </Card>
      </Col>
    </Row>
  </Fragment>
);

export default DatetimeExample;
