import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardBody, Collapse, Table } from 'reactstrap';
import { REFERENCE_NOTES } from '../units';
import { formatNumber } from '../convert';
import { buttonStyle, valueCellStyle } from '../styles';

// One factor row per unit: symbol, factor against the dimension base, base name.
const FactorTable = ({ units, baseSymbol }) => (
  <Table size="sm" borderless className="mb-3">
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

// Collapsible reference block: the factors used by the converter plus the two
// notes that explain the chosen conversion basis (kgce equivalent value, IT
// calorie, RT / RT-JP and PS / hp differences).
const ReferencePanel = ({ t, energyUnits, powerUnits }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-3">
      <CardBody className="p-3">
        <Button
          color="link"
          size="sm"
          className="px-0 fs--1 text-800 font-weight-semi-bold"
          style={buttonStyle}
          onClick={() => setIsOpen(!isOpen)}
        >
          {t('Reference Constants')}
        </Button>
        <Collapse isOpen={isOpen}>
          <div className="fs--1 text-uppercase text-muted mb-1 mt-2">{t('Energy Conversion')}</div>
          <FactorTable units={energyUnits} baseSymbol="kJ" />
          <div className="fs--1 text-uppercase text-muted mb-1">{t('Power Conversion')}</div>
          <FactorTable units={powerUnits} baseSymbol="W" />
          {REFERENCE_NOTES.map(key => (
            <p key={key} className="fs--1 text-muted mb-1">
              {t(key)}
            </p>
          ))}
          <p className="fs--1 text-muted mb-0">
            {t('Values are rounded to 6 significant digits.')}
          </p>
        </Collapse>
      </CardBody>
    </Card>
  );
};

ReferencePanel.propTypes = {
  t: PropTypes.func.isRequired,
  energyUnits: PropTypes.array.isRequired,
  powerUnits: PropTypes.array.isRequired,
};

export default ReferencePanel;
