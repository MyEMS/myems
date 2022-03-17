import React, { Fragment } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';

import generic1 from '../../assets/img/generic/3.jpg';

const figureExampleCode = `<figure className="figure" style={{ maxWidth: '25rem' }}>
  <CardImg src={generic1} alt="Card image cap" />
  <figcaption className="figure-caption">A caption for the above image.</figcaption>
</figure>`;

const Figures = () => {
  return (
    <Fragment>
      <PageHeader
        title="Figures"
        description="Documentation and examples for displaying related images and text with the figure component in reactstrap."
        className="mb-3"
      />
      <Card>
        <CardHeader>
          <p>
            Anytime you need to display a piece of content—like an image with an optional caption, consider using a{' '}
            <code>&lt;figure&gt;</code>
          </p>
          <p>
            Use the included <code>.figure</code>, <code>.figure-img </code>and <code>.figure-caption </code>classes to
            provide some baseline styles for the HTML5 <code>&lt;figure&gt; </code>and <code>&lt;figcaption&gt;</code>{' '}
            elements. Images in figures have no explicit size, so be sure to add the .img-fluid class to your{' '}
            <code>&lt;img&gt; </code>to make it responsive.
          </p>
        </CardHeader>
        <CardBody className="bg-light">
          <FalconEditor code={figureExampleCode} scope={{ generic1 }} language="jsx" />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Figures;
