import React, { Fragment } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { 
  Button,
  Card, 
  CardBody, 
  Row, 
  Col } from 'reactstrap';
import FalconCardHeader from '../../common/FalconCardHeader';
import { withTranslation } from 'react-i18next';
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator';
import { getPaginationArray } from '../../../helpers/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const defaultSorted = [{
  dataField: 'startdatetime',
  order: 'asc'
}];


const DetailedDataTable = ({ title, data, columns, pagesize, t }) => {

  const options = {
    custom: true,
    sizePerPage: pagesize,
    totalSize: data.length
  };
  const handleNextPage = ({ page, onPageChange }) => () => {
    onPageChange(page + 1);
  };
  
  const handlePrevPage = ({ page, onPageChange }) => () => {
    onPageChange(page - 1);
  };
  return (
    <Fragment>
      <Card>
        <FalconCardHeader title={title} className="bg-light">
          
        </FalconCardHeader>
        <CardBody>
        <PaginationProvider pagination={paginationFactory(options)}>
            {({ paginationProps, paginationTableProps }) => {
              const lastIndex = paginationProps.page * paginationProps.sizePerPage;
              while ((paginationProps.page - 1) * paginationProps.sizePerPage >= paginationProps.totalSize) {
                paginationProps.page = paginationProps.page - 1;
              };
              return (
                <Fragment>
                  <Row>
                    <Col>
                      <BootstrapTable
                        bootstrap4
                        keyField="id"
                        data={data}
                        columns={columns}
                        defaultSorted={defaultSorted}
                        {...paginationTableProps}
                      />
                    </Col>
                  </Row>
                  <Row noGutters className="px-1 py-3 flex-center">
                    <Col xs="auto">
                      <Button
                        color="falcon-default"
                        size="sm"
                        onClick={handlePrevPage(paginationProps)}
                        disabled={paginationProps.page === 1}
                      >
                        <FontAwesomeIcon icon="chevron-left" />
                      </Button>
                      {getPaginationArray(paginationProps.totalSize, paginationProps.sizePerPage).map(pageNo => (
                        <Button
                          color={paginationProps.page === pageNo ? 'falcon-primary' : 'falcon-default'}
                          size="sm"
                          className="ml-2"
                          onClick={() => paginationProps.onPageChange(pageNo)}
                          key={pageNo}
                        >
                          {pageNo}
                        </Button>
                      ))}
                      <Button
                        color="falcon-default"
                        size="sm"
                        className="ml-2"
                        onClick={handleNextPage(paginationProps)}
                        disabled={lastIndex >= paginationProps.totalSize}
                      >
                        <FontAwesomeIcon icon="chevron-right" />
                      </Button>
                    </Col>
                  </Row>
                </Fragment>
              );
            }}
          </PaginationProvider>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default withTranslation()(DetailedDataTable);
