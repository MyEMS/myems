import React, { Fragment } from 'react';
import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import Flex from '../common/Flex';

const basicExampleCode = `<ListGroup>
  <ListGroupItem>
    Cras justo odio
  </ListGroupItem>
  <ListGroupItem>
    Dapibus ac facilisis in
  </ListGroupItem>
  <ListGroupItem>
    Morbi leo risus
  </ListGroupItem>
  <ListGroupItem>
    Porta ac consectetur ac
  </ListGroupItem>
  <ListGroupItem>
    Vestibulum at eros
  </ListGroupItem>
</ListGroup>`;

const activeItemCode = `<ListGroup>
  <ListGroupItem active tag="a" href="#" action>
    Cras justo odio
  </ListGroupItem>
  <ListGroupItem tag="a" href="#" action>
    Dapibus ac facilisis in
  </ListGroupItem>
  <ListGroupItem tag="a" href="#" action>
    Morbi leo risus
  </ListGroupItem>
  <ListGroupItem tag="a" href="#" action>
    Porta ac consectetur ac
  </ListGroupItem>
  <ListGroupItem tag="a" href="#" action>
    Vestibulum at eros
  </ListGroupItem>
</ListGroup>`;

const listGroupWithFlush = `<ListGroup flush>
  <ListGroupItem disabled>
    Cras justo odio
  </ListGroupItem>
  <ListGroupItem>
    Dapibus ac facilisis in
  </ListGroupItem>
  <ListGroupItem>
    Morbi leo risus
  </ListGroupItem>
  <ListGroupItem>
    Porta ac consectetur ac
  </ListGroupItem>
</ListGroup>`;

const listGroupWithBadge = `<ListGroup>
  <ListGroupItem>
    <Flex justify="between" align="center">
      Cras justo odio
      <Badge 
        color={'soft-primary'} 
        pill
      > 14
      </Badge>
    </Flex>
  </ListGroupItem>
  <ListGroupItem>
    <Flex justify="between" align="center">
      Dapibus ac facilisis in
      <Badge 
        color={'soft-primary'} 
        pill
      > 2
      </Badge>
    </Flex>
  </ListGroupItem>
  <ListGroupItem>
    <Flex justify="between" align="center">
      Morbi leo risus
      <Badge 
        color={'soft-primary'} 
        pill
      > 1
      </Badge>
    </Flex>
  </ListGroupItem>
  <ListGroupItem>
    <Flex justify="between" align="center">
      Dapibus ac facilisis in
      <Badge 
        color={'soft-primary'} 
        pill> 9
      </Badge>
    </Flex>
  </ListGroupItem>
</ListGroup>`;

const listGroupBadgeCode = `<ListGroup>
  <ListGroupItem color="primary">
    Cras justo odio
  </ListGroupItem>
  <ListGroupItem color="secondary">
    Dapibus ac facilisis in
  </ListGroupItem>
  <ListGroupItem color="success">
    Morbi leo risus
  </ListGroupItem>
  <ListGroupItem color="danger">
    Porta ac consectetur ac
  </ListGroupItem>
  <ListGroupItem color="warning">
    Cras justo odio
  </ListGroupItem>
  <ListGroupItem color="info">
    Dapibus ac facilisis in
  </ListGroupItem>
  <ListGroupItem color="light">
    Morbi leo risus
  </ListGroupItem>
  <ListGroupItem color="dark">
    Porta ac consectetur ac
  </ListGroupItem>
</ListGroup>`;

const listGroupwithExampleCode = `<ListGroup>
  <ListGroupItem active>
    <ListGroupItemHeading className="text-white">
      List group item heading
    </ListGroupItemHeading>
    <ListGroupItemText>
      Donec id elit non mi porta gravida at
      eget metus.
      Maecenas sed diam eget risus varius
      blandit.
    </ListGroupItemText>
  </ListGroupItem>
  <ListGroupItem>
    <ListGroupItemHeading>
      List group item heading
    </ListGroupItemHeading>
    <ListGroupItemText>
      Donec id elit non mi porta gravida at eget
      metus. Maecenas sed diameget risus varius
      blandit.
    </ListGroupItemText>
  </ListGroupItem>
  <ListGroupItem>
    <ListGroupItemHeading>
      List group item heading
    </ListGroupItemHeading>
    <ListGroupItemText>
      Donec id elit non mi porta gravida at 
      eget metus. Maecenas sed diam eget risus
      varius blandit.
    </ListGroupItemText>
  </ListGroupItem>
</ListGroup>`;

const properties = `ListGroup.propTypes = {
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  // boolean to render list group items edge-to-edge in a parent container
  flush: PropTypes.bool,
  className: PropTypes.string,
  cssModule: PropTypes.object,
}`;

const ListGroups = () => (
  <Fragment>
    <PageHeader
      title="List Group"
      description="List groups are a flexible and powerful component for displaying a series of content. Modify and extend them to support just about any content within."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/components/listgroup"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        List on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Row noGutters className="mb-3">
      <Col lg={6} className="pr-lg-2 mb-3">
        <Card className="h-100 mb-2">
          <FalconCardHeader title="Basic Example" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={basicExampleCode} />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="px-lg-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="Active Item" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={activeItemCode} />
          </CardBody>
        </Card>
      </Col>
      <Col lg={12} className="mb-3">
        <Card className="h-100">
          <FalconCardHeader title="Properties" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={properties} hidePreview />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="pr-lg-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="List group flush" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={listGroupWithFlush} />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="px-lg-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="List group with badge" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={listGroupWithBadge} scope={{ Flex }} language="jsx" />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="pr-lg-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="Contextual classes" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={listGroupBadgeCode} />
          </CardBody>
        </Card>
      </Col>
      <Col lg={6} className="px-lg-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="Custom content" light={false} />
          <CardBody className="bg-light">
            <FalconEditor code={listGroupwithExampleCode} />
          </CardBody>
        </Card>
      </Col>
    </Row>
  </Fragment>
);

export default ListGroups;
