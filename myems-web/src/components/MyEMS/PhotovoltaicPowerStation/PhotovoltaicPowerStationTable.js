import React, { Fragment, createRef, useContext } from 'react';
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
import Badge from 'reactstrap/es/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Row } from 'reactstrap';
import ButtonIcon from '../../common/ButtonIcon';
import { Link } from 'react-router-dom';
import AppContext from '../../../context/Context';
import { withTranslation } from 'react-i18next';

const PhotovoltaicPowerStationTable = ({ setIsSelected, photovoltaicPowerStationList, t }) => {
  const { currency } = useContext(AppContext);
  const energyFormatter = amount => <Fragment>{(amount / 1000.0).toFixed(3)} MWH</Fragment>;
  const capacityFormatter = amount => <Fragment>{amount.toFixed(3)} kWh</Fragment>;
  const powerFormatter = amount => <Fragment>{amount.toFixed(3)} kWp</Fragment>;
  const currencyFormatter = amount => (
    <Fragment>
      {amount.toFixed(2)} {currency}
    </Fragment>
  );

  const nameFormatter = nameuuid => (
    <Link
      to={'/singlephotovoltaicpowerstation/details?uuid=' + nameuuid.substring(nameuuid.length - 36, nameuuid.length)}
      className="font-weight-semi-bold"
      target="_blank"
    >
      {nameuuid.substring(0, nameuuid.length - 36)}
    </Link>
  );

  const CustomTotal = ({ sizePerPage, totalSize, page, lastIndex }) => (
    <span>
      {(page - 1) * sizePerPage + 1} to {lastIndex > totalSize ? totalSize : lastIndex} of {totalSize} —{' '}
    </span>
  );

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
    totalSize: photovoltaicPowerStationList.length
  };

  const phaseFormatter = phaseOfLifecycle => {
    let text = '';
    switch (phaseOfLifecycle) {
      case '1use':
        text = t('Use Phase');
        break;
      case '2commissioning':
        text = t('Commissioning Phase');
        break;
      case '3installation':
        text = t('Installation Phase');
        break;
      default:
        text = t('Use Phase');
    }
    return <Fragment>{text}</Fragment>;
  };

  const statusFormatter = status => {
    let color = '';
    let icon = '';
    let text = '';
    switch (status) {
      case 'online':
        color = 'success';
        icon = 'check';
        text = t('Communication Online');
        break;
      case 'offline':
        color = 'secondary';
        icon = 'ban';
        text = t('Communication Offline');
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

  const columns = [
    {
      dataField: 'nameuuid',
      text: t('Name'),
      formatter: nameFormatter,
      classes: 'border-0 align-middle',
      headerClasses: 'border-0',
      sort: true
    },
    {
      dataField: 'address',
      text: t('Address'),
      classes: 'border-0 align-middle',
      headerClasses: 'border-0',
      sort: true
    },
    {
      dataField: 'space_name',
      text: t('Space'),
      classes: 'border-0 align-middle',
      headerClasses: 'border-0',
      sort: true
    },
    {
      dataField: 'subtotal_generation_energy',
      text: t('Total Generation'),
      formatter: energyFormatter,
      classes: 'border-0 align-middle',
      headerClasses: 'border-0',
      sort: true
    },
    {
      dataField: 'subtotal_generation_billing',
      text: t('Total Revenue'),
      formatter: currencyFormatter,
      classes: 'border-0 align-middle',
      headerClasses: 'border-0',
      sort: true
    },
    {
      dataField: 'rated_capacity',
      text: t('Rated Capacity'),
      formatter: capacityFormatter,
      classes: 'border-0 align-middle',
      headerClasses: 'border-0',
      sort: true
    },
    {
      dataField: 'rated_power',
      text: t('Rated Power'),
      formatter: powerFormatter,
      classes: 'border-0 align-middle',
      headerClasses: 'border-0',
      sort: true
    },
    {
      dataField: 'phase_of_lifecycle',
      text: t('Phase of Lifecycle'),
      formatter: phaseFormatter,
      classes: 'border-0 align-middle',
      headerClasses: 'border-0',
      sort: true
    },
    {
      dataField: 'status',
      text: t('Communication Status'),
      formatter: statusFormatter,
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
                data={photovoltaicPowerStationList}
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
                  onClick={() => handleViewAll(paginationProps, photovoltaicPowerStationList.length)}
                >
                  {t('View all')}
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
                  {t('Previous Page')}
                </Button>
                <Button
                  color={lastIndex >= paginationProps.totalSize ? 'light' : 'primary'}
                  size="sm"
                  onClick={handleNextPage(paginationProps)}
                  disabled={lastIndex >= paginationProps.totalSize}
                  className="px-4 ml-2"
                >
                  {t('Next Page')}
                </Button>
              </Col>
            </Row>
          </Fragment>
        );
      }}
    </PaginationProvider>
  );
};

export default withTranslation()(PhotovoltaicPowerStationTable);
