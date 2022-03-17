import React, { createRef, Fragment, useState } from 'react';
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
import {
  Button,
  Card,
  CardBody,
  Col,
  CustomInput,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  InputGroup,
  Row,
  UncontrolledDropdown
} from 'reactstrap';
import ButtonIcon from '../common/ButtonIcon';
import { Link } from 'react-router-dom';
import Badge from 'reactstrap/es/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../common/FalconCardHeader';
import orders from '../../data/e-commerce/orders';
import { getPaginationArray } from '../../helpers/utils';

const orderFormatter = (dataField, { id, name, email }: row) => (
  <Fragment>
    <Link to="/e-commerce/order-details">
      <strong>#{id}</strong>
    </Link>{' '}
    by <strong>{name}</strong>
    <br />
    <a href={`mailto:${email}`}>{email}</a>
  </Fragment>
);

const shippingFormatter = (address, { shippingType }: row) => (
  <Fragment>
    {address}
    <p className="mb-0 text-500">{shippingType}</p>
  </Fragment>
);

const badgeFormatter = status => {
  let color = '';
  let icon = '';
  let text = '';
  switch (status) {
    case 'success':
      color = 'success';
      icon = 'check';
      text = 'Completed';
      break;
    case 'hold':
      color = 'secondary';
      icon = 'ban';
      text = 'On hold';
      break;
    case 'processing':
      color = 'primary';
      icon = 'redo';
      text = 'Processing';
      break;
    case 'pending':
      color = 'warning';
      icon = 'stream';
      text = 'Pending';
      break;
    default:
      color = 'warning';
      icon = 'stream';
      text = 'Pending';
  }

  return (
    <Badge color={`soft-${color}`} className="rounded-capsule fs--1 d-block">
      {text}
      <FontAwesomeIcon icon={icon} transform="shrink-2" className="ml-1" />
    </Badge>
  );
};

const amountFormatter = amount => {
  return (
    <Fragment>
      {'$'}
      {amount}
    </Fragment>
  );
};

const actionFormatter = (dataField, { id }: row) => (
  // Control your row with this id
  <UncontrolledDropdown>
    <DropdownToggle color="link" size="sm" className="text-600 btn-reveal mr-3">
      <FontAwesomeIcon icon="ellipsis-h" className="fs--1" />
    </DropdownToggle>
    <DropdownMenu right className="border py-2">
      <DropdownItem onClick={() => console.log('Completed: ', id)}>Completed</DropdownItem>
      <DropdownItem onClick={() => console.log('Processing: ', id)}>Processing</DropdownItem>
      <DropdownItem onClick={() => console.log('On hold: ', id)}>On hold</DropdownItem>
      <DropdownItem onClick={() => console.log('Pending: ', id)}>Pending</DropdownItem>
      <DropdownItem divider />
      <DropdownItem onClick={() => console.log('Delete: ', id)} className="text-danger">
        Delete
      </DropdownItem>
    </DropdownMenu>
  </UncontrolledDropdown>
);

const columns = [
  {
    dataField: 'id',
    text: 'Order',
    classes: 'py-2 align-middle',
    formatter: orderFormatter,
    sort: true
  },
  {
    dataField: 'date',
    text: 'Date',
    classes: 'py-2 align-middle',
    sort: true
  },
  {
    dataField: 'address',
    text: 'Ship to',
    classes: 'py-2 align-middle',
    formatter: shippingFormatter,
    sort: true
  },
  {
    dataField: 'status',
    text: 'Status',
    classes: 'py-2 align-middle',
    formatter: badgeFormatter,
    sort: true
  },
  {
    dataField: 'amount',
    text: 'Amount',
    classes: 'py-2 align-middle',
    formatter: amountFormatter,
    sort: true,
    align: 'right',
    headerAlign: 'right'
  },
  {
    dataField: '',
    text: '',
    classes: 'py-2 align-middle',
    formatter: actionFormatter,
    align: 'right'
  }
];

const options = {
  custom: true,
  sizePerPage: 10,
  totalSize: orders.length
};

const SelectRowInput = ({ indeterminate, rowIndex, ...rest }) => (
  <div className="custom-control custom-checkbox">
    <input
      className="custom-control-input"
      {...rest}
      onChange={() => {}}
      ref={input => {
        if (input) input.indeterminate = indeterminate;
      }}
    />
    <label className="custom-control-label" />
  </div>
);

const selectRow = onSelect => ({
  mode: 'checkbox',
  classes: 'py-2 align-middle',
  clickToSelect: false,
  selectionHeaderRenderer: ({ mode, ...rest }) => <SelectRowInput type="checkbox" {...rest} />,
  selectionRenderer: ({ mode, ...rest }) => <SelectRowInput type={mode} {...rest} />,
  onSelect: onSelect,
  onSelectAll: onSelect
});

const Orders = () => {
  let table = createRef();
  // State
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

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Orders" light={false}>
        {isSelected ? (
          <InputGroup size="sm" className="input-group input-group-sm">
            <CustomInput type="select" id="bulk-select">
              <option>Bulk actions</option>
              <option value="Refund">Refund</option>
              <option value="Delete">Delete</option>
              <option value="Archive">Archive</option>
            </CustomInput>
            <Button color="falcon-default" size="sm" className="ml-2">
              Apply
            </Button>
          </InputGroup>
        ) : (
          <Fragment>
            <ButtonIcon icon="plus" transform="shrink-3 down-2" color="falcon-default" size="sm">
              New
            </ButtonIcon>
            <ButtonIcon icon="filter" transform="shrink-3 down-2" color="falcon-default" size="sm" className="mx-2">
              Filter
            </ButtonIcon>
            <ButtonIcon icon="external-link-alt" transform="shrink-3 down-2" color="falcon-default" size="sm">
              Export
            </ButtonIcon>
          </Fragment>
        )}
      </FalconCardHeader>
      <CardBody className="p-0">
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
                    data={orders}
                    columns={columns}
                    selectRow={selectRow(onSelect)}
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
      </CardBody>
    </Card>
  );
};

export default Orders;
