import React, { Fragment } from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import Avatar from '../common/Avatar';
import FalconEditor from '../common/FalconEditor';

import user1 from '../../assets/img/team/1.jpg';
import user2 from '../../assets/img/team/2.jpg';
import user3 from '../../assets/img/team/3.jpg';

const circularCode = `<Avatar
  src={user1}
  rounded="circle" 
  size="4xl" 
/>`;

const squareCode = `<Avatar
  src={user2} 
  rounded="0" 
  size="4xl"  
/>`;

const softCode = `<Avatar
  src={user3}
  rounded="soft"
  size="4xl"  
/>`;

const contentCode = `<Avatar
  size="4xl" 
  name="12+"
  isExact
/>`;

const nameCode = `<Avatar
  size="4xl" 
  name="Emma Watson"
/>`;

const emojiCode = `<Avatar
  size="4xl"
  emoji="🎁"
/>`;

const statusCode = `<Row>
  <Col xs="auto">
    <Avatar src={user1} className="status-online" size="4xl"  />
  </Col>
  <Col xs="auto">
    <Avatar src={user1} className="status-offline" size="4xl"  />
  </Col>
  <Col xs="auto">
    <Avatar src={user1} className="status-away" size="4xl"  />
  </Col>
  <Col xs="auto">
    <Avatar src={user1} className="status-do-not-disturb" size="4xl"  />
  </Col>
</Row>`;

const sizesCode = `<Row className="align-items-center" >
  <Col xs="auto">
    <Avatar src={user1} className="" size="5xl" />
  </Col>
  <Col xs="auto">
    <Avatar src={user1} className="" size="4xl" />
  </Col>
  <Col xs="auto">
    <Avatar src={user1} className="" size="3xl" />
  </Col>
  <Col xs="auto">
    <Avatar src={user1} size="2xl" />
  </Col>
  <Col xs="auto">
    <Avatar src={user1} size="xl" />
  </Col>
  <Col xs="auto">
    <Avatar src={user1} size="l" />
  </Col>
   <Col xs="auto">
    <Avatar src={user1} size="m" />
  </Col>
  <Col xs="auto">
    <Avatar src={user1} size="s" />
  </Col>
</Row>`;

const properties = `Avatar.propTypes = {
  size: PropTypes.oneOf(['s', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl']), // default: 'xl'
  rounded: PropTypes.string, // default: 'circle'
  src: PropTypes.string,
  name: PropTypes.string,
  emoji: PropTypes.string, // default: '😊'
  className: PropTypes.string,
  mediaClass: PropTypes.string,
  isExact: PropTypes.bool // default: false
}`;

const Avatars = () => {
  return (
    <Fragment>
      <PageHeader
        title="Avatar"
        description="Use avatar of different shapes and sizes with a single component."
        className="mb-3"
      />
      <Card className="mb-3">
        <FalconCardHeader title="Basic" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={`<Avatar />`} scope={{ Avatar, user1 }} language="jsx" />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Properties" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={properties} scope={{ Avatar }} hidePreview />
        </CardBody>
      </Card>
      <Row noGutters className="mb-3">
        <Col md={4} className="pr-md-2">
          <Card className="h-100">
            <FalconCardHeader title="Circular" light={false} />
            <CardBody className="bg-light">
              <FalconEditor code={circularCode} scope={{ Avatar, user1 }} language="jsx" />
            </CardBody>
          </Card>
        </Col>
        <Col md={4} className="px-md-2">
          <Card className="h-100">
            <FalconCardHeader title="Square" light={false} />
            <CardBody className="bg-light">
              <FalconEditor code={squareCode} scope={{ Avatar, user2 }} language="jsx" />
            </CardBody>
          </Card>
        </Col>
        <Col md={4} className="pl-md-2">
          <Card className="h-100">
            <FalconCardHeader title="Soft" light={false} />
            <CardBody className="bg-light">
              <FalconEditor code={softCode} scope={{ Avatar, user3 }} language="jsx" />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row noGutters className="mb-3">
        <Col md={4} className="pr-md-2">
          <Card className="h-100">
            <FalconCardHeader title="Content" light={false} />
            <CardBody className="bg-light">
              <FalconEditor code={contentCode} scope={{ Avatar, user2 }} />
            </CardBody>
          </Card>
        </Col>
        <Col md={4} className="px-md-2">
          <Card className="h-100">
            <FalconCardHeader title="Name" light={false} />
            <CardBody className="bg-light">
              <FalconEditor code={nameCode} scope={{ Avatar }} />
            </CardBody>
          </Card>
        </Col>
        <Col md={4} className="pl-md-2">
          <Card className="h-100">
            <FalconCardHeader title="Name" light={false} />
            <CardBody className="bg-light">
              <FalconEditor code={emojiCode} scope={{ Avatar }} />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Card className="mb-3">
        <FalconCardHeader title="Status" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={statusCode} scope={{ Avatar, user1 }} language="jsx" />
        </CardBody>
      </Card>
      <Card>
        <FalconCardHeader title="Sizes" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={sizesCode} scope={{ Avatar, user1 }} language="jsx" />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Avatars;
