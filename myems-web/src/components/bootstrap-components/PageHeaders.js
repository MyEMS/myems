import React, { Fragment } from 'react';
import { Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const pageHeaderCode = `<PageHeader
  title="Page Title"
  description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat, incidunt pariatur a, exercitationem dignissimos ea veniam laboriosam minima cum rerum blanditiis quod maxime eligendi dolore est laudantium commodi assumenda cupiditate."
  className="mb-3"
>
  <Button
    tag="a"
    href="https://reactstrap.github.io"
    target="_blank"
    color="link"
    size="sm"
    className="pl-0"
  >
    Get Started
    <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
  </Button>
</PageHeader>`;

const PageHeaders = () => {
  return (
    <Fragment>
      <PageHeader
        title="Page Header"
        description="These modular elements can be readily used and customized in every layout across pages."
        className="mb-3"
      />
      <Card>
        <FalconCardHeader title="Example" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={pageHeaderCode} scope={{ PageHeader, FontAwesomeIcon }} />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default PageHeaders;
