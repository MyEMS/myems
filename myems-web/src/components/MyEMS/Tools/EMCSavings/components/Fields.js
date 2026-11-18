import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, InputGroup, InputGroupText, Label, Table } from 'reactstrap';
import { MAX_INPUT_LENGTH } from '../constants';
import { buttonStyle, inputGroupStyle, numberStyle, selectStyle, tableInputStyle } from '../styles';

// Error code -> locale key. The keys reuse the UnitConverter wording where the
// code already existed there and add the EMC specific ones (dev plan 7.2).
export const ERROR_KEYS = {
  empty: 'Please input a numeric value',
  nan: 'The value must be a number',
  tooLarge: 'The value is too large',
  negative: 'The value must not be negative',
  zeroBase: 'Baseline variable cannot be zero',
  nonPositiveBaseline: 'Adjusted Baseline Is Not Positive',
  noModelTerms: 'Model Has No Variable Terms',
  ratioOutOfRange: 'Sharing ratios must be within 100 percent and cover all years',
  contractTermInvalid: 'Contract term must be an integer between 1 and 30',
  hostingOverBase: 'Hosting fee exceeds baseline energy cost',
};

// An unknown code must never leak the raw code into the UI.
export const errorText = (t, code) => (code ? t(ERROR_KEYS[code] || ERROR_KEYS.nan) : '');

// One labelled numeric input with an optional unit suffix and inline error.
export const LabeledNumber = ({
  t,
  id,
  labelKey,
  value,
  suffix,
  error,
  hint,
  disabled,
  onChange,
}) => (
  <div className="form-group mb-3">
    <Label for={id} className="fs--1 text-800">
      {t(labelKey)}
    </Label>
    <InputGroup style={inputGroupStyle}>
      <Input
        id={id}
        type="number"
        step="any"
        inputMode="decimal"
        maxLength={MAX_INPUT_LENGTH}
        className="text-right"
        style={numberStyle}
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
      />
      {suffix ? <InputGroupText className="text-nowrap">{suffix}</InputGroupText> : null}
    </InputGroup>
    {error ? (
      <div className="text-muted fs--1">{errorText(t, error)}</div>
    ) : hint ? (
      <div className="text-muted fs--1">{hint}</div>
    ) : null}
  </div>
);

LabeledNumber.propTypes = {
  t: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  labelKey: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  suffix: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.node,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

LabeledNumber.defaultProps = {
  suffix: '',
  error: '',
  hint: null,
  disabled: false,
};

// One labelled select. `options` is a list of { id, labelKey } already resolved
// by the caller so the panel decides the wording, not this control.
export const LabeledSelect = ({ t, id, labelKey, value, options, onChange }) => (
  <div className="form-group mb-3">
    <Label for={id} className="fs--1 text-800">
      {t(labelKey)}
    </Label>
    <Input
      id={id}
      type="select"
      style={selectStyle}
      value={value}
      onChange={event => onChange(event.target.value)}
    >
      {options.map(option => (
        <option key={option.id} value={option.id}>
          {option.labelKey ? t(option.labelKey) : option.label}
        </option>
      ))}
    </Input>
  </div>
);

LabeledSelect.propTypes = {
  t: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  labelKey: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

// Editable year by year table: one row per contract year, one editable column
// (dev plan 6.3). `values` and `errors` are flat arrays so the kernel error
// lists ({ year, code }) can be mapped straight onto the rows.
export const YearTable = ({ t, titleKey, labelKey, unit, values, errors, onChange }) => (
  <div className="mb-3">
    <div className="fs--1 text-uppercase text-muted mb-2">{t(titleKey)}</div>
    <Table size="sm" borderless className="mb-0 align-middle">
      <thead className="fs--1 text-uppercase text-muted">
        <tr>
          <th className="border-0">{t('Year')}</th>
          <th className="border-0 text-right">{t(labelKey)}</th>
        </tr>
      </thead>
      <tbody>
        {values.map((value, index) => {
          const year = index + 1;
          const code = errors && errors[index] ? errors[index].code : null;
          return (
            <tr key={`year-${year}`}>
              <td className="text-nowrap align-middle">{year}</td>
              <td style={{ width: '45%' }}>
                <Input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  maxLength={MAX_INPUT_LENGTH}
                  className="text-right"
                  style={tableInputStyle}
                  value={value}
                  aria-label={`${t(labelKey)} ${year}`}
                  onChange={event => onChange(index, event.target.value)}
                />
                {code ? (
                  <div className="text-muted fs--1" style={numberStyle}>
                    {errorText(t, code)}
                    {unit ? ` ${unit}` : ''}
                  </div>
                ) : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  </div>
);

YearTable.propTypes = {
  t: PropTypes.func.isRequired,
  titleKey: PropTypes.string.isRequired,
  labelKey: PropTypes.string.isRequired,
  values: PropTypes.array.isRequired,
  unit: PropTypes.string,
  errors: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

YearTable.defaultProps = { unit: '', errors: null };

// Small editable cell used by the grid table below. Invalid cells are reported
// by the message under the table only: the theme whitelist (plan 10.2) does not
// include a validation state class, and adding one would need a scss build.
const CellInput = ({ value, onChange, label }) => (
  <Input
    type="number"
    step="any"
    inputMode="decimal"
    maxLength={MAX_INPUT_LENGTH}
    className="text-right"
    style={tableInputStyle}
    value={value}
    aria-label={label}
    onChange={event => onChange(event.target.value)}
  />
);

CellInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

// Free text cell (variable name), kept separate so a text field is not parsed
// as a number by the kernel.
const CellText = ({ value, onChange, label }) => (
  <Input
    type="text"
    maxLength={MAX_INPUT_LENGTH}
    style={tableInputStyle}
    value={value}
    aria-label={label}
    onChange={event => onChange(event.target.value)}
  />
);

CellText.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

// Multi column row table with add / remove: normalization variables, regression
// terms, direct comparison conditions, sharing stages, price segments.
export const GridTable = ({
  t,
  titleKey,
  columns,
  rows,
  errors,
  maxRows,
  onChange,
  onAdd,
  onRemove,
}) => (
  <div className="mb-3">
    <div className="d-flex align-items-center">
      <div className="fs--1 text-uppercase text-muted flex-fill">{titleKey ? t(titleKey) : ''}</div>
      <Button
        color="soft-secondary"
        size="sm"
        className="mr-2"
        style={buttonStyle}
        disabled={rows.length >= maxRows}
        onClick={onAdd}
      >
        {t('Add Row')}
      </Button>
      <Button
        color="soft-secondary"
        size="sm"
        style={buttonStyle}
        disabled={rows.length <= 1}
        onClick={() => onRemove(rows.length - 1)}
      >
        {t('Remove Row')}
      </Button>
    </div>
    <Table size="sm" borderless className="mb-0 align-middle">
      <thead className="fs--1 text-uppercase text-muted">
        <tr>
          {columns.map(column => (
            <th key={column.field} className="border-0">
              {t(column.labelKey)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const rowErrors = (errors && errors[index]) || {};
          return (
            <tr key={`${titleKey}-${index}`}>
              {columns.map(column => {
                const label = `${t(column.labelKey)} ${index + 1}`;
                const change = value => onChange(index, column.field, value);
                return (
                  <td key={column.field}>
                    {column.text ? (
                      <CellText value={row[column.field] || ''} onChange={change} label={label} />
                    ) : (
                      <CellInput value={row[column.field] || ''} onChange={change} label={label} />
                    )}
                    {rowErrors[column.field] ? (
                      <div className="text-muted fs--1">
                        {errorText(t, rowErrors[column.field])}
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  </div>
);

GridTable.propTypes = {
  t: PropTypes.func.isRequired,
  titleKey: PropTypes.string,
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  errors: PropTypes.array,
  maxRows: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

GridTable.defaultProps = { titleKey: '', errors: null };
