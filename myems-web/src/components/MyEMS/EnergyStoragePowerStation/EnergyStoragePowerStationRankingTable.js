import React, { Fragment, createRef } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';

const columns = [
  {
    dataField: 'name',
    text: '名称',
    classes: 'border-0 align-middle',
    headerClasses: 'border-0',
    sort: false
  },
  {
    dataField: 'value',
    text: '数值',
    classes: 'border-0 align-middle',
    headerClasses: 'border-0',
    sort: true,
  },
  {
    dataField: 'unit',
    text: '单位',
    classes: 'border-0 align-middle',
    headerClasses: 'border-0',
    sort: false,
  },
];

const EnergyStoragePowerStationRankingTable = ({ energyStoragePowerStationList }) => {
  let table = createRef();

  return (
    <Fragment>
      <div className="table-responsive">
        <BootstrapTable
          ref={table}
          bootstrap4
          keyField="id"
          data={energyStoragePowerStationList}
          columns={columns}
          bordered={false}
          classes="table-dashboard table-sm fs--1 border-bottom border-200 mb-0 table-dashboard-th-nowrap"
          rowClasses="btn-reveal-trigger border-top border-200"
          headerClasses="bg-200 text-900 border-y border-200"
        />
      </div>

    </Fragment>
  );
};

export default EnergyStoragePowerStationRankingTable;
