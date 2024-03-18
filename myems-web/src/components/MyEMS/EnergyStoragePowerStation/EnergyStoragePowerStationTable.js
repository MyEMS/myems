import React, { Fragment, createRef } from 'react';
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
import Badge from 'reactstrap/es/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Row } from 'reactstrap';
import ButtonIcon from '../../common/ButtonIcon';
import { Link } from 'react-router-dom';

const CustomTotal = ({ sizePerPage, totalSize, page, lastIndex }) => (
  <span>
    {(page - 1) * sizePerPage + 1} to {lastIndex > totalSize ? totalSize : lastIndex} of {totalSize} —{' '}
  </span>
);

const customerFormatter = customerName => (
  <Link to="energystoragepowerstation/details" className="font-weight-semi-bold">
    {customerName}
  </Link>
);

const badgeFormatter = status => {
  let color = '';
  let icon = '';
  let text = '';
  switch (status) {
    case 'charging':
      color = 'success';
      icon = 'check';
      text = 'Charging';
      break;
    case 'discharging':
      color = 'success';
      icon = 'check';
      text = 'Discharging';
      break;
    case 'offline':
      color = 'secondary';
      icon = 'ban';
      text = 'Offline';
      break;
    default:
      color = 'warning';
      icon = 'stream';
      text = 'Idling';
  }
  return (
    <Badge color={`soft-${color}`} className="rounded-capsule">
      {text}
      <FontAwesomeIcon icon={icon} transform="shrink-2" className="ml-1" />
    </Badge>
  );
};

const capacityFormatter = amount => <Fragment>{amount} kWh</Fragment>;
const powerFormatter = amount => <Fragment>{amount} kW</Fragment>;

const columns = [
  {
    dataField: 'name',
    text: 'Name',
    formatter: customerFormatter,
    classes: 'border-0 align-middle',
    headerClasses: 'border-0',
    sort: true
  },
  {
    dataField: 'address',
    text: 'Address',
    classes: 'border-0 align-middle',
    headerClasses: 'border-0',
    sort: true
  },
  {
    dataField: 'rated_capacity',
    text: 'Rated Capacity',
    formatter: capacityFormatter,
    classes: 'border-0 align-middle',
    headerClasses: 'border-0',
    sort: true,
  },
  {
    dataField: 'rated_power',
    text: 'Rated Power',
    formatter: powerFormatter,
    classes: 'border-0 align-middle',
    headerClasses: 'border-0',
    sort: true,
  },
  {
    dataField: 'status',
    text: 'Status',
    formatter: badgeFormatter,
    classes: 'border-0 align-middle fs-0',
    headerClasses: 'border-0',
    sort: true,
    align: 'right',
    headerAlign: 'right'
  },
  {
    dataField: 'action',
    classes: 'border-0 align-middle',
    headerClasses: 'border-0',
    text: ''
  }
];

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
  clickToSelect: false,
  selectionHeaderRenderer: ({ mode, ...rest }) => <SelectRowInput type="checkbox" {...rest} />,
  selectionRenderer: ({ mode, ...rest }) => <SelectRowInput type={mode} {...rest} />,
  headerColumnStyle: { border: 0, verticalAlign: 'middle' },
  selectColumnStyle: { border: 0, verticalAlign: 'middle' },
  onSelect: onSelect,
  onSelectAll: onSelect
});


const EnergyStoragePowerStationTable = ({ setIsSelected, energyStoragePowerStationList }) => {
  let table = createRef();
  const handleNextPage = ({ page, onPageChange }) => () => {
    onPageChange(page + 1);
  };

  const handlePrevPage = ({ page, onPageChange }) => () => {
    onPageChange(page - 1);
  };

  const handleViewAll = ({ onSizePerPageChange }, newSizePerPage) => {
    onSizePerPageChange(newSizePerPage, 1);
  };

  const onSelect = () => {
    setImmediate(() => {
      setIsSelected(!!table.current.selectionContext.selected.length);
    });
  };

  const options = {
    custom: true,
    sizePerPage: 6,
    totalSize: energyStoragePowerStationList.length
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
                data={energyStoragePowerStationList}
                columns={columns}
                selectRow={selectRow(onSelect)}
                bordered={false}
                classes="table-dashboard table-sm fs--1 border-bottom border-200 mb-0 table-dashboard-th-nowrap"
                rowClasses="btn-reveal-trigger border-top border-200"
                headerClasses="bg-200 text-900 border-y border-200"
                {...paginationTableProps}
              />
            </div>
            <Row noGutters className="px-1 py-3">
              <Col className="pl-3 fs--1">
                <CustomTotal {...paginationProps} lastIndex={lastIndex} />
                <ButtonIcon
                  color="link"
                  size="sm"
                  icon="chevron-right"
                  iconAlign="right"
                  transform="down-1 shrink-4"
                  className="px-0 font-weight-semi-bold"
                  onClick={() => handleViewAll(paginationProps, energyStoragePowerStationList.length)}
                >
                  view all
                </ButtonIcon>
              </Col>
              <Col xs="auto" className="pr-3">
                <Button
                  color={paginationProps.page === 1 ? 'light' : 'primary'}
                  size="sm"
                  onClick={handlePrevPage(paginationProps)}
                  disabled={paginationProps.page === 1}
                  className="px-4"
                >
                  Previous
                </Button>
                <Button
                  color={lastIndex >= paginationProps.totalSize ? 'light' : 'primary'}
                  size="sm"
                  onClick={handleNextPage(paginationProps)}
                  disabled={lastIndex >= paginationProps.totalSize}
                  className="px-4 ml-2"
                >
                  Next
                </Button>
              </Col>
            </Row>
          </Fragment>
        );
      }}
    </PaginationProvider>
  );
};

export default EnergyStoragePowerStationTable;
