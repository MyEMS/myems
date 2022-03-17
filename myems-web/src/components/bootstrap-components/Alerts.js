import React, { Fragment } from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const alertCode = `['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].map((color, index) => (
  <Alert color={color} key={index} >
    This is a {color} alert—check it out!
  </Alert>
))`;

const dismissCode = `function AlertExampleDismissible() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Alert color="info" isOpen={isOpen} toggle={() => setIsOpen(false)}>
      I am an alert and I can be dismissed!
    </Alert>
  );
};`;

const additionalContentCode = `<Alert color="success">
  <h4 className="alert-heading">Well done!</h4>
  <p>
    Aww yeah, you successfully read this important alert message. This example text is going
    to run a bit longer so that you can see how spacing within an alert works with this kind
    of content.
  </p>
  <hr />
  <p className="mb-0">
    Whenever you need to, be sure to use margin utilities to keep things nice and tidy.
  </p>
</Alert>`;

const uncontrolledDismissCode = `function AlertExampleUncontrolled() {
  return (
    <UncontrolledAlert color="danger">
      I am an alert and I can be dismissed!
    </UncontrolledAlert>
  );
}`;

const properties = `Alert.propTypes = {
  className: PropTypes.string,
  closeClassName: PropTypes.string,
  color: PropTypes.string, // default: 'success'
  isOpen: PropTypes.bool,  // default: true
  toggle: PropTypes.func,
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  fade: PropTypes.bool, // default: true
  // Controls the transition of the alert fading in and out
  // See Fade for more details
  transition: PropTypes.shape(Fade.propTypes),
}`;

const Alerts = () => (
  <Fragment>
    <PageHeader
      title="Alerts"
      description="Provide contextual feedback messages for typical user actions with the handful of available and flexible alert messages."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/components/alerts"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Alerts on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card className="mb-3">
      <FalconCardHeader title="Example" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={alertCode} language="jsx" />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Properties" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={properties} language="jsx" hidePreview />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Additional Content" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={additionalContentCode} scope={{ FalconCardHeader }} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Dismissing" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={dismissCode} language="jsx" />
      </CardBody>
    </Card>
    <Card>
      <FalconCardHeader title="Uncontrolled [disable] Alerts" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={uncontrolledDismissCode} language="jsx" />
      </CardBody>
    </Card>
  </Fragment>
);

export default Alerts;
