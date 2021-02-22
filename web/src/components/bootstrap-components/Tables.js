import React, { Fragment } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';
import FalconCardHeader from '../common/FalconCardHeader';

const basicExampleCode = `<Table>
  <thead>
    <tr>
      <th>#</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Handle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Steven</td>
      <td>Speilberg</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Martin</td>
      <td>Scorsese</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td>James</td>
      <td>Cameron</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</Table>`;

const darkExampleCode = `<Table dark>
  <thead>
    <tr>
      <th>#</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Handle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Client</td>
      <td>Eastwood</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Quentin</td>
      <td>Tarantino</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td>Redley</td>
      <td>Scott</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</Table>`;

const headerDarkCode = `<Table>
  <thead className="thead-dark">
    <tr>
      <th>#</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Handle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Client</td>
      <td>Eastwood</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Quentin</td>
      <td>Tarantino</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td>Redley</td>
      <td>Scott</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</Table>`;
const headerLightCode = `<Table>
  <thead className="thead-light">
    <tr>
      <th>#</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Handle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Client</td>
      <td>Eastwood</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Quentin</td>
      <td>Tarantino</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td>Redley</td>
      <td>Scott</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</Table>`;

const tableStripedCode = `<Table striped>
  <thead>
    <tr>
      <th>#</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Handle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Client</td>
      <td>Eastwood</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Quentin</td>
      <td>Tarantino</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td>Redley</td>
      <td>Scott</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</Table>`;

const tableHoverCode = `<Table hover>
  <thead className="thead-light">
    <tr>
      <th>#</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Handle</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Client</td>
      <td>Eastwood</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Quentin</td>
      <td>Tarantino</td>
      <td>@fat</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td>Redley</td>
      <td>Scott</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</Table>`;

const propertyCode = `Table.propTypes = {
// Pass in a Component to override default element
tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
size: PropTypes.string,
bordered: PropTypes.bool,
borderless: PropTypes.bool,
striped: PropTypes.bool,
dark: PropTypes.bool,
hover: PropTypes.bool,
responsive: PropTypes.bool,
// Custom ref handler that will be assigned to the "ref" of the inner <table> element
innerRef: PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.string,
  PropTypes.object
])
};`;

const Tables = () => {
  return (
    <Fragment>
      <PageHeader
        title="Tables"
        description="Documentation and examples for opt-in styling of tables with Falcon."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://reactstrap.github.io/components/tables"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          Tables on reactstrap
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Row noGutters>
        <Col sm={6} className="pr-sm-2 mb-3">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Example</h5>
            </CardHeader>
            <CardBody className="bg-light">
              <FalconEditor code={basicExampleCode} />
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} className="pl-sm-2 mb-3">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Dark</h5>
            </CardHeader>
            <CardBody className="bg-light">
              <FalconEditor code={darkExampleCode} />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Card className="mb-3">
        <FalconCardHeader title="Property" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={propertyCode} hidePreview />
        </CardBody>
      </Card>
      <Row noGutters>
        <Col sm={6} className="pr-sm-2 mb-3">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Header Dark</h5>
            </CardHeader>
            <CardBody className="bg-light">
              <FalconEditor code={headerDarkCode} />
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} className="pl-sm-2 mb-3">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Header Light</h5>
            </CardHeader>
            <CardBody className="bg-light">
              <FalconEditor code={headerLightCode} />
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} className="pr-sm-2 mb-3">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Table Striped</h5>
            </CardHeader>
            <CardBody className="bg-light">
              <FalconEditor code={tableStripedCode} />
            </CardBody>
          </Card>
        </Col>
        <Col sm={6} className="pl-sm-2 mb-3">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Table Hover</h5>
            </CardHeader>
            <CardBody className="bg-light">
              <FalconEditor code={tableHoverCode} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Tables;
