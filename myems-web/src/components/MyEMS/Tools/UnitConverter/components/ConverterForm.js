import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, InputGroup, InputGroupText, Label } from 'reactstrap';
import { findUnit } from '../units';
import { MAX_INPUT_LENGTH } from '../convert';
import { actionRowStyle, buttonStyle, inputGroupStyle, numberStyle, selectStyle } from '../styles';

// Options are shared by the two unit selects of this form. A unit without a
// labelKey (kWh, MJ, kW, ...) is already unambiguous, so its symbol is enough.
const renderUnitOptions = (units, t) =>
  units.map(unit => (
    <option key={unit.id} value={unit.id}>
      {unit.labelKey ? t(unit.labelKey) : unit.symbol}
    </option>
  ));

// Input area of the energy and power tabs: value + source unit + target unit,
// plus swap and reset. Both tabs render at the same time inside TabPane, so the
// idPrefix keeps the generated input ids unique.
const ConverterForm = ({ t, idPrefix, value, fromId, toId, units, onChange, onSwap, onReset }) => {
  const fromUnit = findUnit(units, fromId);

  return (
    <div>
      <div className="form-group">
        <Label for={`${idPrefix}-value`} className="fs--1 text-800">
          {t('Value')}
        </Label>
        <InputGroup style={inputGroupStyle}>
          <Input
            id={`${idPrefix}-value`}
            type="number"
            step="any"
            inputMode="decimal"
            maxLength={MAX_INPUT_LENGTH}
            className="text-right"
            style={numberStyle}
            value={value}
            onChange={e => onChange('value', e.target.value)}
          />
          <InputGroupText className="text-nowrap">{fromUnit ? fromUnit.symbol : ''}</InputGroupText>
        </InputGroup>
      </div>

      <div className="form-group">
        <Label for={`${idPrefix}-from`} className="fs--1 text-800">
          {t('From Unit')}
        </Label>
        <Input
          id={`${idPrefix}-from`}
          type="select"
          style={selectStyle}
          value={fromId}
          onChange={e => onChange('from', e.target.value)}
        >
          {renderUnitOptions(units, t)}
        </Input>
      </div>

      <div className="form-group">
        <Label for={`${idPrefix}-to`} className="fs--1 text-800">
          {t('To Unit')}
        </Label>
        <Input
          id={`${idPrefix}-to`}
          type="select"
          style={selectStyle}
          value={toId}
          onChange={e => onChange('to', e.target.value)}
        >
          {renderUnitOptions(units, t)}
        </Input>
      </div>

      <div className="d-flex flex-wrap align-items-center" style={actionRowStyle}>
        <Button
          color="soft-secondary"
          size="sm"
          className="mr-2"
          style={buttonStyle}
          onClick={onSwap}
        >
          {t('Swap Units')}
        </Button>
        <Button color="soft-secondary" size="sm" style={buttonStyle} onClick={onReset}>
          {t('Reset')}
        </Button>
      </div>
    </div>
  );
};

ConverterForm.propTypes = {
  t: PropTypes.func.isRequired,
  idPrefix: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  fromId: PropTypes.string.isRequired,
  toId: PropTypes.string.isRequired,
  units: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onSwap: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default ConverterForm;
