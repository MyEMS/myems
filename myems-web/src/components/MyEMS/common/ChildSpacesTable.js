import React, { Fragment } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import FalconCardHeader from '../../common/FalconCardHeader';
import { Card, CardBody, Row, Col } from 'reactstrap';
import { withTranslation } from 'react-i18next';

const defaultSorted = [
  {
    dataField: 'name',
    order: 'asc'
  }
];

const ChildSpacesTable = ({ title, data, columns, t }) => {
  return (
    <Fragment>
      <style>{`
        .child-spaces-table-scroll {
          overflow-x: auto;
          overflow-y: visible;
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }
        .child-spaces-table-scroll table {
          min-width: 100%;
        }
        .child-spaces-table-scroll thead th {
          white-space: nowrap;
        }
        .child-spaces-table-scroll thead th:first-child,
        .child-spaces-table-scroll tbody td:first-child {
          position: sticky;
          left: 0;
          white-space: nowrap;
          background-color: #fff;
          box-shadow: 2px 0 6px rgba(0, 0, 0, 0.06);
        }
        .child-spaces-table-scroll thead th:first-child {
          z-index: 3;
        }
        .child-spaces-table-scroll tbody td:first-child {
          z-index: 2;
        }
        .child-spaces-table-scroll .table-striped tbody tr:nth-of-type(odd) td:first-child {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .child-spaces-table-scroll .table-hover tbody tr:hover td:first-child {
          background-color: rgba(0, 0, 0, 0.075);
        }
      `}</style>
      <Card>
        <FalconCardHeader title={title} className="bg-light" titleClass="text-lightSlateGray mb-0" />
        <CardBody>
          <Row>
            <Col style={{ minWidth: 0 }}>
              <div className="child-spaces-table-scroll">
                <BootstrapTable bootstrap4 keyField="id" data={data} columns={columns} defaultSorted={defaultSorted} />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default withTranslation()(ChildSpacesTable);
