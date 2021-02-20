import React, { Fragment } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';

const embedExampleCode = `<div className="embed-responsive embed-responsive-16by9">
  <iframe 
    className="embed-responsive-item" 
    src="https://www.youtube.com/embed/zpOULjyy-n8?rel=0" 
    allowFullScreen="">
  </iframe>
</div>`;

const Embed = () => (
  <Fragment>
    <PageHeader
      title="Embed"
      description="Create responsive video or slideshow embeds based on the width of the parent by creating an intrinsic ratio that scales on any device."
      className="mb-3"
    />
    <Card>
      <CardHeader>
        <h5 className="mb-2">Example</h5>
        <p className="mb-0">
          Rules are directly applied to <code>&lt;iframe&gt;, </code>
          <code>&lt;embed&gt;, </code>
          <code>&lt;video&gt;, </code>and <code>&lt;object&gt; </code>elements; optionally use an explicit descendant
          class <code>.embed-responsive-item when you want to match the styling for other attributes.</code>
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={embedExampleCode} />
      </CardBody>
    </Card>
  </Fragment>
);

export default Embed;
