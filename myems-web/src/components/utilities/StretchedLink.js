import React, { Fragment } from 'react';
import { Card, CardHeader, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';
import generic1 from '../../assets/img/generic/1.jpg';

const stretchedLinkCode = `<Fragment>
  <Card style={{width: '18rem'}}>
    <CardImg src={generic1} top />
    <CardBody>
      <CardTitle tag="h5" tag="h5">
        Card title
      </CardTitle>
      <CardText tag="p">
        Some quick example text to build on the card
        title and make up the bulk of the card's
        content.
      </CardText>
      <Button color="primary" size="sm" className="stretched-link">
        Go somewhere
      </Button>
    </CardBody>
  </Card>
</Fragment>`;

const StretchedLink = () => (
  <Fragment>
    <PageHeader
      title="Stretched Link"
      description="Make any HTML element or reactstrap component clickable by “stretching” a nested link via CSS."
      className="mb-3"
    />
    <Card>
      <CardHeader>
        <h5 className="mb-2">Example</h5>
        <p>
          Add <code>.stretched-link </code>to a link to make its containing block clickable via a <code>::after</code>{' '}
          pseudo element. In most cases, this means that an element with <code>position: relative; </code>that contains
          a link with the <code>.stretched-link </code>class is clickable.
        </p>
        <p>
          Cards have <code>position: relative </code>by default in reactstrap, so in this case you can safely add the
          <code>.stretched-link </code>class to a link in the card without any other HTML changes.
        </p>
        <p>
          Multiple links and tap targets are not recommended with stretched links. However, some
          <code> position </code>and <code>z-index </code>styles can help should this be required.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={stretchedLinkCode} language="jsx" scope={{ generic1 }} />
      </CardBody>
    </Card>
  </Fragment>
);

export default StretchedLink;
