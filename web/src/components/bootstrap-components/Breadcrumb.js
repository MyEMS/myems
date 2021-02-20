import React, { Fragment } from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const breadcrumbCode = `<div>
  <Breadcrumb>
    <BreadcrumbItem active>Home</BreadcrumbItem>
  </Breadcrumb>
  <Breadcrumb>
    <BreadcrumbItem>
      <a href="#">Home</a>
    </BreadcrumbItem>
    <BreadcrumbItem active>Library</BreadcrumbItem>
  </Breadcrumb>
  <Breadcrumb>
    <BreadcrumbItem>
      <a href="#">Home</a>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <a href="#">Library</a>
    </BreadcrumbItem>
    <BreadcrumbItem active>Data</BreadcrumbItem>
  </Breadcrumb>
</div>
`;

const properties = `Breadcrumb.propTypes = {
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  listTag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  className: PropTypes.string,
  listClassName: PropTypes.string,
  cssModule: PropTypes.object,
  children: PropTypes.node,
  'aria-label': PropTypes.string
};`;

const propertiesItem = `BreadcrumbItem.propTypes = {
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  active: PropTypes.bool,
  className: PropTypes.string,
  cssModule: PropTypes.object,
};`;

const Breadcrumbs = () => (
  <Fragment>
    <PageHeader
      title="Breadcrumb"
      description="Indicate the current page’s location within a navigational hierarchy that automatically adds separators via CSS."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/components/breadcrumbs"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Breadcrumbs on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card className="mb-3">
      <FalconCardHeader title="Example" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={breadcrumbCode} />
      </CardBody>
    </Card>
    <Card>
      <FalconCardHeader title="Properties" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={properties} hidePreview />
        <FalconEditor code={propertiesItem} hidePreview />
      </CardBody>
    </Card>
  </Fragment>
);

export default Breadcrumbs;
