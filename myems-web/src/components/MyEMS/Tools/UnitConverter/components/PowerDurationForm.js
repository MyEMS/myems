import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, InputGroup, InputGroupText, Label } from 'reactstrap';
import { MAX_INPUT_LENGTH } from '../convert';
import { actionRowStyle, buttonStyle, inputGroupStyle, numberStyle, selectStyle } from '../styles';

const renderUnitOptions = (units, t) =>
  units.map(unit => (
    <option key={unit.id} value={unit.id}>
      {unit.labelKey ? t(unit.labelKey) : unit.symbol}
    </option>
  ));

// Input area of the third tab: power value + power unit + duration in hours.
// There is no target unit select: the result table always shows every energy
// unit and highlights kWh, so only reset is offered here.
const PowerDurationForm = ({ t, power, powerUnitId, hours, units, onChange, onReset }) => (
  <div>
    <div className="form-group">
      <Label for="duration-power" className="fs--1 text-800">
        {t('Value')}
      </Label>
      <InputGroup style={inputGroupStyle}>
        <Input
          id="duration-power"
          type="number"
          step="any"
          inputMode="decimal"
          maxLength={MAX_INPUT_LENGTH}
          className="text-right"
          style={numberStyle}
          value={power}
          onChange={e => onChange('power', e.target.value)}
        />
      </InputGroup>
    </div>

    <div className="form-group">
      <Label for="duration-power-unit" className="fs--1 text-800">
        {t('Unit')}
      </Label>
      <Input
        id="duration-power-unit"
        type="select"
        style={selectStyle}
        value={powerUnitId}
        onChange={e => onChange('powerUnit', e.target.value)}
      >
        {renderUnitOptions(units, t)}
      </Input>
    </div>

    <div className="form-group">
      <Label for="duration-hours" className="fs--1 text-800">
        {t('Duration (Hours)')}
      </Label>
      <InputGroup style={inputGroupStyle}>
        <Input
          id="duration-hours"
          type="number"
          step="any"
          inputMode="decimal"
          maxLength={MAX_INPUT_LENGTH}
          className="text-right"
          style={numberStyle}
          value={hours}
          onChange={e => onChange('hours', e.target.value)}
        />
        <InputGroupText className="text-nowrap">h</InputGroupText>
      </InputGroup>
    </div>

    <div className="d-flex flex-wrap align-items-center" style={actionRowStyle}>
      <Button color="soft-secondary" size="sm" style={buttonStyle} onClick={onReset}>
        {t('Reset')}
      </Button>
    </div>
  </div>
);

PowerDurationForm.propTypes = {
  t: PropTypes.func.isRequired,
  power: PropTypes.string.isRequired,
  powerUnitId: PropTypes.string.isRequired,
  hours: PropTypes.string.isRequired,
  units: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default PowerDurationForm;
