import React, { Fragment } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import FalconCardHeader from '../../common/FalconCardHeader';
import { Card, CardBody, Row, Col } from 'reactstrap';
import { withTranslation } from 'react-i18next';


const defaultSorted = [{
  dataField: 'name',
  order: 'asc'
}];

const AssociatedEquipmentTable = ({ title, data, columns, t }) => {
  return (
    <Fragment>
      <Card>
        <FalconCardHeader title={title} className="bg-light">
          
        </FalconCardHeader>
        <CardBody>
          <Row>
            <Col>
              <BootstrapTable
                bootstrap4
                keyField="id"
                data={data}
                columns={columns}
                defaultSorted={defaultSorted}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default withTranslation()(AssociatedEquipmentTable);
