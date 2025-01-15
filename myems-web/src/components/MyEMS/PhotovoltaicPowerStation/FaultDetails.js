import React, { createRef, Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
import { toast } from 'react-toastify';
import {
  Breadcrumb,
  BreadcrumbItem,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  Label,
  CustomInput,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  InputGroup,
  UncontrolledDropdown,
  Spinner
} from 'reactstrap';
import CountUp from 'react-countup';
import CardSummary from '../common/CardSummary';
import ButtonIcon from '../../common/ButtonIcon';
import Badge from 'reactstrap/es/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../../common/FalconCardHeader';
import { getPaginationArray } from '../../../helpers/utils';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { endOfDay } from 'date-fns';
import DateRangePickerWrapper from '../common/DateRangePickerWrapper';
import moment from 'moment';

const FaultDetails = ({
  faults,
  t
}) => {
  // State
  let table = createRef();

  const [isSelected, setIsSelected] = useState(false);
  const handleNextPage = ({ page, onPageChange }) => () => {
    onPageChange(page + 1);
  };

  const handlePrevPage = ({ page, onPageChange }) => () => {
    onPageChange(page - 1);
  };

  const onSelect = () => {
    setImmediate(() => {
      setIsSelected(!!table.current.selectionContext.selected.length);
    });
  };

  const subjectFormatter = (dataField, { url }) => (
    <Fragment>
      <span>{dataField}</span>
    </Fragment>
  );

  const messageFormatter = dataField => <Fragment>{dataField}</Fragment>;

  const statusFormatter = status => {
    let color = '';
    let icon = '';
    let text = '';
    switch (status) {
      case 'acknowledged':
        color = 'success';
        icon = 'envelope-open';
        text = t('Notification Acknowledged');
        break;
      case 'read':
        color = 'success';
        icon = 'envelope-open';
        text = t('Notification Read');
        break;
      default:
        color = 'primary';
        icon = 'envelope';
        text = t('Notification Unread');
    }

    return (
      <Badge color={`soft-${color}`} className="rounded-capsule fs--1 d-block">
        {text}
        <FontAwesomeIcon icon={icon} transform="shrink-2" className="ml-1" />
      </Badge>
    );
  };

  const columns = [
    {
      dataField: 'subject',
      text: t('Notification Subject'),
      classes: 'py-2 align-middle',
      formatter: subjectFormatter,
      sort: true
    },
    {
      dataField: 'message',
      text: t('Notification Message'),
      classes: 'py-2 align-middle',
      formatter: messageFormatter,
      sort: true
    },
    {
      dataField: 'created_datetime',
      text: t('Notification Created Datetime'),
      classes: 'py-2 align-middle',
      sort: true
    },
    {
      dataField: 'status',
      text: t('Notification Status'),
      classes: 'py-2 align-middle',
      formatter: statusFormatter,
      sort: true
    },
    {
      dataField: 'update_datetime',
      text: t('Notification Update Datetime'),
      classes: 'py-2 align-middle',
      sort: true
    },
  ];

  const options = {
    custom: true,
    sizePerPage: 10,
    totalSize: faults.length
  };

  return (
    <PaginationProvider pagination={paginationFactory(options)}>
      {({ paginationProps, paginationTableProps }) => {
        const lastIndex = paginationProps.page * paginationProps.sizePerPage;
        return (
          <Fragment>
            <div className="table-responsive">
              <BootstrapTable
                ref={table}
                bootstrap4
                keyField="id"
                data={faults}
                columns={columns}
                bordered={false}
                classes="table-dashboard table-striped table-sm fs--1 border-bottom mb-0 table-dashboard-th-nowrap"
                rowClasses="btn-reveal-trigger"
                headerClasses="bg-200 text-900"
                {...paginationTableProps}
              />
            </div>
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
  );
};

FaultDetails.propTypes = {
  faults: PropTypes.array,
};

export default withTranslation()(FaultDetails);
