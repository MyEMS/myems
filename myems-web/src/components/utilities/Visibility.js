import React, { Fragment } from 'react';
import { Card, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';

const visibleCode = `<Fragment>
  <div className="visible"></div>
  <div className="invisible"></div>
</Fragment>`;

const Visibility = () => (
  <Fragment>
    <PageHeader
      title="Visibility"
      description="Control the visibility, without modifying the display, of elements with visibility utilities."
      className="mb-3"
    />
    <Card>
      <CardBody>
        <p>
          Set the <code>visibility </code>of elements with our visibility utilities. These utility classes do not modify
          the display value at all and do not affect layout – .invisible elements still take up space in the page.
          Content will be hidden both visually and for assistive technology/screen reader users.
        </p>
        <p>
          Apply <code>.visible </code>or <code>.invisible </code>as needed.
        </p>
        <FalconEditor code={visibleCode} hidePreview />
      </CardBody>
    </Card>
  </Fragment>
);

export default Visibility;
