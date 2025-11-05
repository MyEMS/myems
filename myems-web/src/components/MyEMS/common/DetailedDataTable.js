import React, { Fragment, useEffect, useMemo, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { Button, Card, CardBody, Row, Col, Input } from 'reactstrap';
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
  const [ellipsisInput, setEllipsisInput] = useState({ show: false, index: -1, min: 0, max: 0 });
  
  useEffect(() => {
    if (!controlledPage) {
      setUncontrolledPage(1);
    }
  }, [data, controlledPage]);
  
  useEffect(() => {
    if (totalSize > 0) {
      if (page > totalPages) {
        setPage(totalPages);
      }
    }
    setEllipsisInput({ show: false, index: -1, min: 0, max: 0 });
  }, [totalSize, totalPages, page]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ellipsisInput.show && !event.target.closest('.ellipsis-input-container')) {
        setEllipsisInput({ show: false, index: -1, min: 0, max: 0 });
      }
    };
    if (ellipsisInput.show) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [ellipsisInput.show]);
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
                title={t ? t('Previous Page') : 'Previous Page'}
              >
                <FontAwesomeIcon icon="chevron-left" />
              </Button>
              {getPaginationArray(totalSize, pagesize, page).map((item, index, array) => {
                if (item === 'ellipsis') {
                  const prevItem = index > 0 ? array[index - 1] : null;
                  const nextItem = index < array.length - 1 ? array[index + 1] : null;
                  let minPage = 2;
                  let maxPage = totalPages - 1;
                  
                  if (prevItem !== null && typeof prevItem === 'number') {
                    minPage = prevItem + 1;
                  }
                  if (nextItem !== null && typeof nextItem === 'number') {
                    maxPage = nextItem - 1;
                  }

                  const isActive = ellipsisInput.show && ellipsisInput.index === index;

                  return (
                    <div key={`ellipsis-${index}`} className="d-inline-block ml-2 ellipsis-input-container" style={{ position: 'relative' }}>
                      {isActive ? (
                        <Input
                          type="number"
                          min={minPage}
                          max={maxPage}
                          className="d-inline-block"
                          style={{ width: '60px', height: '31px', padding: '2px 8px', fontSize: '0.875rem' }}
                          autoFocus
                          onBlur={() => {
                            setEllipsisInput({ show: false, index: -1, min: 0, max: 0 });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value >= minPage && value <= maxPage) {
                                setPage(value);
                                setEllipsisInput({ show: false, index: -1, min: 0, max: 0 });
                              }
                            } else if (e.key === 'Escape') {
                              setEllipsisInput({ show: false, index: -1, min: 0, max: 0 });
                            }
                          }}
                        />
                      ) : (
                        <Button
                          color="falcon-default"
                          size="sm"
                          type="button"
                          onClick={() => setEllipsisInput({ show: true, index, min: minPage, max: maxPage })}
                          style={{ cursor: 'pointer' }}
                        >
                          ...
                        </Button>
                      )}
                    </div>
                  );
                }
                return (
                  <Button
                    color={page === item ? 'falcon-primary' : 'falcon-default'}
                    size="sm"
                    className="ml-2"
                    type="button"
                    onClick={() => setPage(item)}
                    key={item}
                  >
                    {item}
                  </Button>
                );
              })}
              <Button
                color="falcon-default"
                size="sm"
                className="ml-2"
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                title={t ? t('Next Page') : 'Next Page'}
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
