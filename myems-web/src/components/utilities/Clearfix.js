import React, { Fragment } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';

const clearfixCode = `<div className="clearfix">...</div>`;

const clearfixButtonCode = `<div className="bg-info clearfix">
  <button className="btn btn-secondary float-left" type="button">Example Button floated left</button>
  <button className="btn btn-secondary float-right" type="button">Example Button floated right</button>
</div>`;

const Clearfix = () => (
  <Fragment>
    <PageHeader
      title="Clearfix"
      description="Quickly and easily clear floated content within a container by adding a clearfix utility."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/utilities/clearfix"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Clearfix on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card>
      <CardBody>
        <p>Easily clear floats by adding .clearfix to the parent element. Can also be used as a mixin.</p>
        <FalconEditor code={clearfixCode} hidePreview />
        <p className="mt-4">
          The following example shows how the clearfix can be used. Without the clearfix the wrapping div would not span
          around the buttons which would cause a broken layout.
        </p>
        <FalconEditor code={clearfixButtonCode} />
      </CardBody>
    </Card>
  </Fragment>
);

export default Clearfix;
