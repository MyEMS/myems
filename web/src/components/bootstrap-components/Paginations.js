import React, { Fragment } from 'react';
import { Button, Card, CardBody, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../common/FalconCardHeader';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';

const paginationWithTextCode = `<Pagination aria-label="Page navigation example">
  <PaginationItem>
    <PaginationLink href="#">
      Previous
    </PaginationLink>
  </PaginationItem>
  <PaginationItem active>
    <PaginationLink href="#">1</PaginationLink>
  </PaginationItem>
  <PaginationItem>
    <PaginationLink href="#">2</PaginationLink>
  </PaginationItem>
  <PaginationItem>
    <PaginationLink href="#">3</PaginationLink>
  </PaginationItem>
  <PaginationItem>
    <PaginationLink href="#">
      Next
    </PaginationLink>
  </PaginationItem>
</Pagination>`;
const paginationWithIconCode = `<Pagination aria-label="Page navigation example">
  <PaginationItem>
    <PaginationLink first href="#" />
  </PaginationItem>
  <PaginationItem active>
    <PaginationLink href="#">1</PaginationLink>
  </PaginationItem>
  <PaginationItem>
    <PaginationLink href="#">2</PaginationLink>
  </PaginationItem>
  <PaginationItem>
    <PaginationLink href="#">3</PaginationLink>
  </PaginationItem>
  <PaginationItem>
    <PaginationLink last href="#"/>
  </PaginationItem>
</Pagination>`;

const sizeExamplePaginationCode = `<Fragment>
  <Pagination size="lg" aria-label="Page navigation example">
    <PaginationItem active>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
  </Pagination>
  <Pagination aria-label="Page navigation example">
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem active>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
  </Pagination>
  <Pagination size="sm" aria-label="Page navigation example">
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem active>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
  </Pagination>
</Fragment>`;

const Paginations = () => {
  return (
    <Fragment>
      <PageHeader
        title="Pagination"
        description="Documentation and examples for showing pagination to indicate a series of related content exists across multiple pages."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://reactstrap.github.io/components/pagination"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          Paginations on reactstrap
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Row noGutters>
        <Col lg={6} className="pr-md-2 mb-3">
          <Card className="h-100">
            <FalconCardHeader title="Example with text" light={false} />
            <CardBody className="bg-light">
              <FalconEditor code={paginationWithTextCode} />
            </CardBody>
          </Card>
        </Col>
        <Col lg={6} className="pl-md-2 mb-3">
          <Card className="h-100">
            <FalconCardHeader title="Example with icon" light={false} />
            <CardBody className="bg-light">
              <FalconEditor code={paginationWithIconCode} />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Card>
        <FalconCardHeader title="Sizing" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={sizeExamplePaginationCode} />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Paginations;
