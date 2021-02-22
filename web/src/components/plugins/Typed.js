import React, { Fragment } from 'react';
import Typed from 'react-typed';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import PageHeader from '../common/PageHeader';

const typedCode = `<Typed
  strings={['Design', 'Beauty', 'Elegance', 'Perfection']}
  typeSpeed={40}
  backSpeed={50}
  className="font-weight-bold px-2 fs-4 text-success"
  loop
/>`;

const TypedExample = () => (
  <Fragment>
    <PageHeader
      title="React Typed"
      description="This is a react component that wraps up the typed.js. Typed.js is a library that types. Enter in any string, and watch it type at the speed you've set, backspace what it's typed, and begin a new sentence for however many strings you've set."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://github.com/ssbeefeater/react-typed#readme"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        React Typed Documentation
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card>
      <FalconCardHeader title="Example" />
      <CardBody>
        <FalconEditor code={typedCode} scope={{ Typed }} language="jsx" />
      </CardBody>
    </Card>
  </Fragment>
);

export default TypedExample;
