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
          background-color: var(--light) !important;
        }
        .child-spaces-table-scroll thead th:first-child,
        .child-spaces-table-scroll tbody td:first-child {
          position: sticky;
          left: 0;
          white-space: nowrap;
          background-clip: padding-box;
          box-shadow: 2px 0 6px rgba(0, 0, 0, 0.18);
        }
        .child-spaces-table-scroll thead th:first-child {
          z-index: 3;
          background-color: var(--light) !important;
        }
        .child-spaces-table-scroll tbody td {
          background-color: var(--white) !important;
        }
        .child-spaces-table-scroll tbody td:first-child {
          z-index: 2;
          background-color: var(--white) !important;
        }
        .child-spaces-table-scroll tbody tr:nth-of-type(even) td,
        .child-spaces-table-scroll tbody tr:nth-of-type(even) td:first-child {
          background-color: var(--light) !important;
        }
        .child-spaces-table-scroll tbody tr:hover td,
        .child-spaces-table-scroll tbody tr:hover td:first-child {
          background-image: linear-gradient(rgba(44, 123, 229, 0.12), rgba(44, 123, 229, 0.12));
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
