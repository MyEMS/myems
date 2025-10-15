import React, { Fragment, useEffect, useMemo, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { Button, Card, CardBody, Row, Col } from 'reactstrap';
import FalconCardHeader from '../../common/FalconCardHeader';
import { withTranslation } from 'react-i18next';
// Removed react-bootstrap-table2-paginator to avoid page reset flicker
import { getPaginationArray } from '../../../helpers/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const defaultSorted = [
  {
    dataField: 'startdatetime',
    order: 'asc'
  }
];

const DetailedDataTable = ({ title, data, columns, pagesize, t, page: controlledPage, onChangePage }) => {
  // Persist current page to prevent flicker/jumps when parent re-renders
  const [uncontrolledPage, setUncontrolledPage] = useState(1);
  const page = controlledPage ?? uncontrolledPage;
  const setPage = (p) => {
    if (onChangePage) {
      onChangePage(p);
    } else {
      setUncontrolledPage(p);
    }
  };
  const totalSize = data.length;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalSize / pagesize)), [totalSize, pagesize]);
  useEffect(() => {
    if (totalSize > 0) {
      if (page > totalPages) {
        setPage(totalPages);
      }
    }
  }, [totalSize, totalPages, page]);
  const firstIndex = (page - 1) * pagesize;
  const lastIndex = Math.min(firstIndex + pagesize, totalSize);
  const pageData = useMemo(() => data.slice(firstIndex, lastIndex), [data, firstIndex, lastIndex]);
  // Use local calculations; never mutate pagination props
  return (
    <Fragment>
      <Card>
        <FalconCardHeader title={title} className="bg-light" titleClass="text-lightSlateGray mb-0" />
        <CardBody>
          <Row>
            <Col>
              <BootstrapTable
                bootstrap4
                keyField="id"
                data={pageData}
                columns={columns}
                defaultSorted={defaultSorted}
              />
            </Col>
          </Row>
          <Row noGutters className="px-1 py-3 flex-center">
            <Col xs="auto">
              <Button
                color="falcon-default"
                size="sm"
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <FontAwesomeIcon icon="chevron-left" />
              </Button>
              {getPaginationArray(totalSize, pagesize).map(pageNo => (
                <Button
                  color={page === pageNo ? 'falcon-primary' : 'falcon-default'}
                  size="sm"
                  className="ml-2"
                  type="button"
                  onClick={() => setPage(pageNo)}
                  key={pageNo}
                >
                  {pageNo}
                </Button>
              ))}
              <Button
                color="falcon-default"
                size="sm"
                className="ml-2"
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
              >
                <FontAwesomeIcon icon="chevron-right" />
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default withTranslation()(DetailedDataTable);
