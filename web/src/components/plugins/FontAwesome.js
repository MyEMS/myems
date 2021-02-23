import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';
import FalconCardHeader from '../common/FalconCardHeader';

const FontAwesome = () => (
  <Fragment>
    <PageHeader
      title="React Fontawesome"
      description="Font Awesome 5 React component using SVG with JS"
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://www.npmjs.com/package/@fortawesome/react-fontawesome"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        React Fontawesome on NPM
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card>
      <FalconCardHeader title="Example" />
      <CardBody>
        <FalconEditor
          code={`<FontAwesomeIcon icon="user" transform="grow-12 right-6" className="text-success" />`}
          scope={{ FontAwesomeIcon }}
          language="jsx"
        />
      </CardBody>
    </Card>
  </Fragment>
);

export default FontAwesome;
