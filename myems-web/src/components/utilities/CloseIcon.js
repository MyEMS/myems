import React, { Fragment } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';

const closeIconCode = `<button className="close float-none" type="button" aria-label="Close">
  <span aria-hidden="true">×</span>
</button>`;

const CloseIcon = () => (
  <Fragment>
    <PageHeader
      title="Close Icon"
      description="Use a generic close icon for dismissing content like modals and alerts."
      className="mb-3"
    />
    <Card>
      <CardHeader>
        <h5 className="mb-0">Example</h5>
        <p className="mb-0">
          <strong>Be sure to include text for screen readers</strong>, as we’ve done with <code>aria-label.</code>
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={closeIconCode} />
      </CardBody>
    </Card>
  </Fragment>
);

export default CloseIcon;
