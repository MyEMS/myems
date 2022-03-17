import React, { Fragment } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

import PageHeader from '../common/PageHeader';
import { Button, Card, CardBody, CardHeader, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import FalconEditor from '../common/FalconEditor';
import purchases from '../../data/dashboard/purchaseList';

const BootstrapTableCode = `function ReactBootstrapTableExample() {
  const columns = [{
    dataField: 'id',
    text: 'Product ID',
    sort: true
  }, {
    dataField: 'product',
    text: 'Product Name',
    sort: true
  }, {
    dataField: 'amount',
    text: 'Product Price',
    sort: true
  }];
  
  const defaultSorted = [{
    dataField: 'name',
    order: 'desc'
  }];
  
  return <BootstrapTable
    bootstrap4
    keyField="id"
    data={ purchases }
    columns={ columns }
    defaultSorted={ defaultSorted } 
  />
}`;

const ReactBootstrapTable2 = () => {
  return (
    <Fragment>
      <PageHeader
        title="React Bootstrap Table2"
        description="Intuitive to use.
        Compatible for Bootstrap 3 and 4.
        Better than legacy react-bootstrap-table!!. It has Rich Functionality - Sortable, Row Selection, Cell Editor, Row Expand, Column Filter Pagination etc. Easy to Configurable and customizable table."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://react-bootstrap-table.github.io/react-bootstrap-table2/"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          react-bootstrap-table2 Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card>
        <CardHeader className="bg-light">
          <h4 className="mb-0">Example</h4>
        </CardHeader>
        <CardBody>
          <Row>
            <Col>
              <FalconEditor code={BootstrapTableCode} scope={{ BootstrapTable, purchases }} language="jsx" />
              {/* <PurchasesTable /> */}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default ReactBootstrapTable2;
