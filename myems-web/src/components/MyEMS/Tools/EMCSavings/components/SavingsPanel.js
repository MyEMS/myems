import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Col, Input, Label, Row, Table } from 'reactstrap';
import {
  ENERGY_VARIETIES,
  MAX_DIRECT_ROWS,
  MAX_REGRESSION_TERMS,
  MAX_VARIABLES,
  MV_METHODS,
  EM_DASH,
  findVariety,
  formatNumber,
  formatPercent,
} from '../constants';
import { actionRowStyle, buttonStyle, heroValueStyle, valueCellStyle } from '../styles';
import { GridTable, LabeledNumber, LabeledSelect, errorText } from './Fields';

// Tab 1: measurement and verification of the energy savings, GB/T 28750-2012
// (dev plan 5.1 / 6.1 / 6.2). The component is dumb: every value is a string
// held by the container and the numbers are recomputed by savings.js.
const SavingsPanel = ({
  t,
  form,
  result,
  onChange,
  onRowChange,
  onRowAdd,
  onRowRemove,
  onBring,
  onReset,
  copiedKey,
  onCopy,
}) => {
  const variety = findVariety(form.varietyId);
  const errors = (result && result.fieldErrors) || {};
  const isManual = form.method === 'MANUAL';

  const varietyOptions = ENERGY_VARIETIES.map(item => ({ id: item.id, labelKey: item.nameKey }));

  // Result rows follow plan 6.2: the text is what the copy button writes to the
  // clipboard, so display, clipboard and matrix expectation stay identical (7.1).
  const rows = [
    {
      id: 'eab',
      label: t('Adjusted Baseline (Eab)'),
      text: result && result.eab != null ? formatNumber(result.eab) : EM_DASH,
      unit: variety.unit,
    },
    {
      id: 'es',
      label: t('Energy Savings (Es)'),
      text: result && Number.isFinite(result.es) ? formatNumber(result.es) : EM_DASH,
      unit: variety.unit,
    },
    {
      id: 'tce',
      label: t('Energy Savings (tce)'),
      text: result && Number.isFinite(result.tce) ? formatNumber(result.tce) : EM_DASH,
      unit: 'tce',
    },
    {
      id: 'rate',
      label: t('Energy Savings Rate (R)'),
      text: result && Number.isFinite(result.rate) ? formatPercent(result.rate) : EM_DASH,
      unit: '',
    },
    {
      id: 'coal',
      label: t('Standard Coal Factor'),
      text: formatNumber(variety.kgcePerUnit),
      unit: `kgce/${variety.unit}`,
    },
  ];
  if (form.reportCo2) {
    rows.push({
      id: 'co2',
      label: t('CO2 Emission Reduction'),
      text: result && Number.isFinite(result.co2) ? formatNumber(result.co2) : EM_DASH,
      unit: 'tCO2e',
    });
  }

  return (
    <Row className="align-items-stretch">
      {/* Input column, same 5 / 7 split as the other tools (plan 10.3). */}
      <Col xs={12} lg={5} className="mb-3 mb-lg-0">
        <LabeledSelect
          t={t}
          id="emc-variety"
          labelKey="Energy Category"
          value={form.varietyId}
          options={varietyOptions}
          onChange={value => onChange('varietyId', value)}
        />

        <div className="form-group mb-3">
          <div className="fs--1 text-800 mb-2">{t('M&V Method')}</div>
          {/* reactstrap gives radio and checkbox inputs the Bootstrap class
              form-check-input, which is absolutely positioned with a negative
              left gutter, so each control needs its own form-check wrapper
              (form-check-inline keeps the methods on one wrapping row). */}
          <div className="d-flex flex-wrap" style={actionRowStyle}>
            {MV_METHODS.map(method => {
              const methodInputId = `emc-mv-method-${method.id}`;
              return (
                <div className="form-check form-check-inline mb-0" key={method.id}>
                  <Input
                    type="radio"
                    id={methodInputId}
                    name="emc-mv-method"
                    value={method.id}
                    checked={form.method === method.id}
                    onChange={() => onChange('method', method.id)}
                  />
                  <Label className="form-check-label fs--1" for={methodInputId}>
                    {t(method.labelKey)}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {form.method === 'RATIO' ? (
          <div>
            <LabeledNumber
              t={t}
              id="emc-eb"
              labelKey="Baseline Energy Consumption (Eb)"
              value={form.eb}
              suffix={variety.unit}
              error={errors.eb}
              onChange={value => onChange('eb', value)}
            />
            <GridTable
              t={t}
              titleKey="Variable Name"
              columns={[
                { field: 'name', labelKey: 'Variable Name', text: true },
                { field: 'pb', labelKey: 'Variable Baseline Value (Pb)' },
                { field: 'pr', labelKey: 'Variable Reporting Value (Pr)' },
              ]}
              rows={form.variables}
              errors={errors.variables}
              maxRows={MAX_VARIABLES}
              onChange={onRowChange('variables')}
              onAdd={() => onRowAdd('variables')}
              onRemove={index => onRowRemove('variables', index)}
            />
          </div>
        ) : null}

        {form.method === 'REGRESSION' ? (
          <div>
            <LabeledNumber
              t={t}
              id="emc-beta0"
              labelKey="Regression Intercept (beta0)"
              value={form.beta0}
              suffix={variety.unit}
              error={errors.beta0}
              onChange={value => onChange('beta0', value)}
            />
            <GridTable
              t={t}
              titleKey="Regression Coefficient (beta_k)"
              columns={[
                { field: 'beta', labelKey: 'Regression Coefficient (beta_k)' },
                { field: 'x', labelKey: 'Variable Reporting Value (Pr)' },
              ]}
              rows={form.terms}
              errors={errors.terms}
              maxRows={MAX_REGRESSION_TERMS}
              onChange={onRowChange('terms')}
              onAdd={() => onRowAdd('terms')}
              onRemove={index => onRowRemove('terms', index)}
            />
          </div>
        ) : null}

        {form.method === 'DIRECT' ? (
          <GridTable
            t={t}
            titleKey="Off-State Energy (Eoff)"
            columns={[
              { field: 'eoff', labelKey: 'Off-State Energy (Eoff)' },
              { field: 'tau', labelKey: 'Duration Weight (tau)' },
            ]}
            rows={form.directRows}
            errors={errors.directRows}
            maxRows={MAX_DIRECT_ROWS}
            onChange={onRowChange('directRows')}
            onAdd={() => onRowAdd('directRows')}
            onRemove={index => onRowRemove('directRows', index)}
          />
        ) : null}

        {isManual ? (
          <LabeledNumber
            t={t}
            id="emc-manual-eab"
            labelKey="Adjusted Baseline (Eab)"
            value={form.manualEab}
            suffix={variety.unit}
            error={errors.manualEab}
            hint={t('Adjustment Am Note')}
            onChange={value => onChange('manualEab', value)}
          />
        ) : (
          <LabeledNumber
            t={t}
            id="emc-am"
            labelKey="Baseline Adjustment (Am)"
            value={form.am}
            suffix={variety.unit}
            error={errors.am}
            hint={t('Adjustment Am Note')}
            onChange={value => onChange('am', value)}
          />
        )}

        <LabeledNumber
          t={t}
          id="emc-er"
          labelKey="Reporting Period Energy (Er)"
          value={form.er}
          suffix={variety.unit}
          error={errors.er}
          onChange={value => onChange('er', value)}
        />

        <div className="form-group form-check mb-3">
          <Input
            type="checkbox"
            id="emc-report-co2-input"
            name="emc-report-co2"
            checked={Boolean(form.reportCo2)}
            onChange={() => onChange('reportCo2', !form.reportCo2)}
          />
          <Label className="form-check-label fs--1 text-800" for="emc-report-co2-input">
            {t('Report CO2 Reduction')}
          </Label>
        </div>

        {form.reportCo2 ? (
          <LabeledNumber
            t={t}
            id="emc-co2-factor"
            labelKey="CO2 Emission Factor"
            value={form.co2Factor}
            suffix="tCO2e"
            error={errors.co2Factor}
            onChange={value => onChange('co2Factor', value)}
          />
        ) : null}

        <div className="d-flex flex-wrap align-items-center" style={actionRowStyle}>
          <Button color="primary" size="sm" className="mr-2" style={buttonStyle} onClick={onBring}>
            {t('Bring Savings into Sharing')}
          </Button>
          <Button color="soft-secondary" size="sm" style={buttonStyle} onClick={onReset}>
            {t('Reset')}
          </Button>
        </div>
      </Col>

      {/* Result column: banner first, then the headline savings and the table. */}
      <Col xs={12} lg={7}>
        {result && result.banner ? (
          <Alert color="warning" className="mt-3 mb-0">
            {errorText(t, result.banner)}
          </Alert>
        ) : null}
        {result && result.note ? (
          <Alert color="info" className="mt-3 mb-0">
            {errorText(t, result.note)}
          </Alert>
        ) : null}

        <div className="bg-soft-primary rounded-soft p-3 mb-3">
          <div className="fs--1 text-uppercase text-muted mb-1">{t('Energy Savings (Es)')}</div>
          <div
            className="fs-2 font-weight-semi-bold text-primary text-break"
            style={heroValueStyle}
          >
            {result && Number.isFinite(result.es)
              ? `${formatNumber(result.es)} ${variety.unit}`
              : EM_DASH}
          </div>
          <div className="fs--1 text-muted mt-1">
            {t('Energy Savings Rate (R)')}:{' '}
            {result && Number.isFinite(result.rate) ? formatPercent(result.rate) : EM_DASH}
          </div>
        </div>

        <div className="fs--1 text-uppercase text-muted mb-2">{t('Result')}</div>
        <div className="table-responsive">
          <Table size="sm" borderless className="mb-0 align-middle">
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td className="text-nowrap">{row.label}</td>
                  <td className="text-right" style={valueCellStyle}>
                    {row.text}
                    <span className="text-muted ml-2">{row.unit}</span>
                  </td>
                  <td className="text-right">
                    <Button
                      color="soft-secondary"
                      size="sm"
                      style={buttonStyle}
                      onClick={() => onCopy({ id: `savings-${row.id}`, text: row.text })}
                    >
                      {copiedKey === `savings-${row.id}` ? t('Copied') : t('Copy Value')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {result && Number.isFinite(result.es) && result.blocked ? (
          <Alert color="warning" className="mb-0">
            {t('No energy savings, no benefit to share')}
          </Alert>
        ) : null}
      </Col>
    </Row>
  );
};

SavingsPanel.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  result: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onRowChange: PropTypes.func.isRequired,
  onRowAdd: PropTypes.func.isRequired,
  onRowRemove: PropTypes.func.isRequired,
  onBring: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  copiedKey: PropTypes.string,
  onCopy: PropTypes.func.isRequired,
};

SavingsPanel.defaultProps = { result: null, copiedKey: null };

export default SavingsPanel;
