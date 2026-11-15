import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'reactstrap';
import { formatNumber } from '../convert';
import { valueCellStyle } from '../styles';

// One factor row per unit: symbol, factor against the dimension base, base name.
const FactorTable = ({ units, baseSymbol }) => (
  <Table size="sm" borderless className="mb-2">
    <tbody>
      {units.map(unit => (
        <tr key={unit.id}>
          <td className="text-nowrap">{unit.symbol}</td>
          <td className="text-right" style={valueCellStyle}>
            {formatNumber(unit.factor)}
          </td>
          <td className="text-muted text-nowrap">{baseSymbol}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);

FactorTable.propTypes = {
  units: PropTypes.array.isRequired,
  baseSymbol: PropTypes.string.isRequired,
};

// Factor list for the spare area under the input form. It is not its own card:
// the parent card already stretches to the result column, and this block sits
// in that leftover space.
const ReferencePanel = ({ t, units, baseSymbol, noteKey }) => (
  <div className="mt-auto pt-3 border-top">
    <div className="fs--1 text-uppercase text-muted mb-2">{t('Reference Constants')}</div>
    <FactorTable units={units} baseSymbol={baseSymbol} />
    <p className="fs--1 text-muted mb-1">{t(noteKey)}</p>
    <p className="fs--1 text-muted mb-0">{t('Values are rounded to 6 significant digits.')}</p>
  </div>
);

ReferencePanel.propTypes = {
  t: PropTypes.func.isRequired,
  units: PropTypes.array.isRequired,
  baseSymbol: PropTypes.string.isRequired,
  noteKey: PropTypes.string.isRequired,
};

export default ReferencePanel;
