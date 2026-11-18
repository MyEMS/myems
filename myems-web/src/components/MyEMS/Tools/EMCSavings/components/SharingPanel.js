import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Col, Row, Table } from 'reactstrap';
import {
  CONTRACT_MODES,
  CURRENCIES,
  MAX_PRICE_SEGMENTS,
  MAX_SHARING_STAGES,
  PRICE_BASES,
  currencySymbol,
  findVariety,
  formatMoney,
  formatNumber,
  weightedAveragePrice,
} from '../constants';
import {
  actionRowStyle,
  buttonStyle,
  moneyCellStyle,
  numberStyle,
  scrollableTableStyle,
} from '../styles';
import { GridTable, LabeledNumber, LabeledSelect, YearTable, errorText } from './Fields';

// Allocation columns per contract mode, dev plan 6.4. Four to six money columns
// so the table stays readable without horizontal pagination.
const ALLOC_COLUMNS = {
  SHARING: [
    { field: 'benefit', labelKey: 'Annual Energy Benefit (B_t)' },
    { field: 'escoShare', labelKey: 'ESCO Share' },
    { field: 'customerShare', labelKey: 'Customer Share' },
    { field: 'escoNet', labelKey: 'ESCO Net Benefit' },
    { field: 'customerNet', labelKey: 'Customer Net Benefit' },
  ],
  GUARANTEED: [
    { field: 'serviceFee', labelKey: 'Guarantee Service Fee' },
    { field: 'compensation', labelKey: 'Guarantee Compensation' },
    { field: 'excessShare', labelKey: 'Excess Savings Sharing' },
    { field: 'escoNet', labelKey: 'ESCO Net Benefit' },
    { field: 'customerNet', labelKey: 'Customer Net Benefit' },
  ],
  HOSTING: [
    { field: 'actualCost', labelKey: 'Actual Energy Cost' },
    { field: 'hostingOm', labelKey: 'Hosting O&M Cost' },
    { field: 'amortization', labelKey: 'Retrofit Cost' },
    { field: 'escoNet', labelKey: 'ESCO Net Benefit' },
    { field: 'customerNet', labelKey: 'Customer Net Benefit' },
  ],
};

// Year by year money table. More than 12 rows scroll inside the card instead of
// paginating, so the cumulative columns stay comparable (plan 10.3).
const AllocationTable = ({ t, symbol, columns, rows }) => {
  const body = (
    <Table size="sm" borderless className="mb-0 align-middle">
      <thead className="fs--1 text-uppercase text-muted sticky-top">
        <tr>
          <th className="border-0">{t('Year')}</th>
          {columns.map(column => (
            <th key={column.field} className="border-0 text-right">
              {t(column.labelKey)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={`alloc-${row.year}`}>
            <td className="text-nowrap" style={numberStyle}>
              {row.year}
            </td>
            {columns.map(column => (
              <td key={column.field} style={moneyCellStyle}>
                {formatMoney(row[column.field], symbol)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
  if (rows.length <= 12) return <div className="table-responsive">{body}</div>;
  return (
    <div className="table-responsive" style={scrollableTableStyle}>
      {body}
    </div>
  );
};

AllocationTable.propTypes = {
  t: PropTypes.func.isRequired,
  symbol: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};

// Tab 2: contract mode and benefit distribution, GB/T 24915-2020 annex A/B/C
// (dev plan 5.2 / 6.3 / 6.4).
const SharingPanel = ({
  t,
  form,
  varietyId,
  schedule,
  noSavings,
  onChange,
  onSeriesChange,
  onRowChange,
  onRowAdd,
  onRowRemove,
  onApplyPrice,
  onBring,
  onReset,
  copiedKey,
  onCopy,
}) => {
  const variety = findVariety(varietyId);
  const symbol = currencySymbol(form.currency);
  const errors = (schedule && schedule.errors) || {};
  const unitPriceSuffix = `${symbol}/${variety.unit}`;
  const errorKeys = Object.keys(errors).filter(key => typeof errors[key] === 'string');
  const weightedPrice = weightedAveragePrice(
    (form.priceSegments || []).map(segment => ({
      share: Number(segment.share),
      price: Number(segment.price),
    }))
  );

  const totalRows = [
    {
      id: 'benefit',
      label: t('Total Benefit (Contract Term)'),
      text: schedule ? formatMoney(schedule.totals && schedule.totals.benefit, symbol) : '',
    },
    {
      id: 'esco',
      label: t('ESCO Share'),
      text: schedule ? formatMoney(schedule.totals && schedule.totals.esco, symbol) : '',
    },
    {
      id: 'customer',
      label: t('Customer Share'),
      text: schedule ? formatMoney(schedule.totals && schedule.totals.customer, symbol) : '',
    },
  ];

  return (
    <Row className="align-items-stretch">
      <Col xs={12} lg={5} className="mb-3 mb-lg-0">
        <LabeledSelect
          t={t}
          id="emc-mode"
          labelKey="Contract Mode"
          value={form.mode}
          options={CONTRACT_MODES.map(item => ({ id: item.id, labelKey: item.labelKey }))}
          onChange={value => onChange('mode', value)}
        />

        <LabeledNumber
          t={t}
          id="emc-term"
          labelKey="Contract Term (Years)"
          value={form.term}
          suffix={t('Year')}
          error={errors.term}
          onChange={value => onChange('term', value)}
        />

        <YearTable
          t={t}
          titleKey="Energy Savings (Es)"
          labelKey="Energy Savings (Es)"
          unit={variety.unit}
          values={form.savings}
          errors={errors.savings}
          onChange={onSeriesChange('savings')}
        />

        <LabeledSelect
          t={t}
          id="emc-basis"
          labelKey="Energy Price Basis"
          value={form.basis}
          options={PRICE_BASES.map(item => ({ id: item.id, labelKey: item.labelKey }))}
          onChange={value => onChange('basis', value)}
        />

        <LabeledNumber
          t={t}
          id="emc-price"
          labelKey="Energy Unit Price"
          value={form.price}
          suffix={unitPriceSuffix}
          error={errors.price}
          hint={t('Benefit Formula')}
          onChange={value => onChange('price', value)}
        />

        <div className="d-flex flex-wrap align-items-center mb-3" style={actionRowStyle}>
          <Button
            color="soft-secondary"
            size="sm"
            style={buttonStyle}
            onClick={() => onChange('weightedOpen', !form.weightedOpen)}
          >
            {t('Weighted Average Price')}
          </Button>
        </div>

        {form.weightedOpen ? (
          <div className="mb-3">
            <GridTable
              t={t}
              columns={[
                { field: 'share', labelKey: 'Duration Weight (tau)' },
                { field: 'price', labelKey: 'Energy Unit Price' },
              ]}
              rows={form.priceSegments}
              maxRows={MAX_PRICE_SEGMENTS}
              onChange={onRowChange('priceSegments')}
              onAdd={() => onRowAdd('priceSegments')}
              onRemove={index => onRowRemove('priceSegments', index)}
            />
            <div className="d-flex flex-wrap align-items-center" style={actionRowStyle}>
              <div className="fs--1 text-muted flex-fill">
                {t('Weighted Average Price')}:{' '}
                <span style={numberStyle}>
                  {weightedPrice == null ? '' : `${formatNumber(weightedPrice)} ${unitPriceSuffix}`}
                </span>
              </div>
              <Button
                color="soft-secondary"
                size="sm"
                style={buttonStyle}
                disabled={weightedPrice == null}
                onClick={() => onApplyPrice(weightedPrice)}
              >
                {t('Energy Unit Price')}
              </Button>
            </div>
          </div>
        ) : null}

        {form.basis === 'REPORT_YEAR_PRICE' ? (
          <YearTable
            t={t}
            titleKey="Reporting Year Price"
            labelKey="Energy Unit Price"
            unit={unitPriceSuffix}
            values={form.yearlyPrices}
            errors={null}
            onChange={onSeriesChange('yearlyPrices')}
          />
        ) : null}

        {form.basis !== 'FIXED_PRICE' ? (
          <LabeledNumber
            t={t}
            id="emc-growth"
            labelKey="Annual Price Growth Rate (g)"
            value={form.growth}
            suffix="%"
            error={errors.growth}
            onChange={value => onChange('growth', value)}
          />
        ) : null}

        {form.mode === 'SHARING' ? (
          <div>
            <GridTable
              t={t}
              titleKey="ESCO Sharing Ratio"
              columns={[
                { field: 'start', labelKey: 'Sharing Stage Start Year' },
                { field: 'end', labelKey: 'Sharing Stage End Year' },
                { field: 'ratio', labelKey: 'ESCO Sharing Ratio' },
              ]}
              rows={form.stages}
              maxRows={MAX_SHARING_STAGES}
              onChange={onRowChange('stages')}
              onAdd={() => onRowAdd('stages')}
              onRemove={index => onRowRemove('stages', index)}
            />
            <LabeledNumber
              t={t}
              id="emc-extra-om"
              labelKey="Customer Extra O&M Cost"
              value={form.customerExtraOm}
              suffix={symbol}
              error={errors.customerExtraOm}
              onChange={value => onChange('customerExtraOm', value)}
            />
            <Alert color="light" className="fs--1 mb-3">
              {t('Equipment Transferred Free at Term End')}
            </Alert>
          </div>
        ) : null}

        {form.mode === 'GUARANTEED' ? (
          <div>
            <YearTable
              t={t}
              titleKey="Guaranteed Savings"
              labelKey="Guaranteed Savings"
              unit={variety.unit}
              values={form.guaranteed}
              errors={errors.guaranteed}
              onChange={onSeriesChange('guaranteed')}
            />
            <LabeledNumber
              t={t}
              id="emc-service-price"
              labelKey="Service Unit Price"
              value={form.servicePrice}
              suffix={unitPriceSuffix}
              error={errors.servicePrice}
              onChange={value => onChange('servicePrice', value)}
            />
            <LabeledNumber
              t={t}
              id="emc-excess-ratio"
              labelKey="Excess Savings Share Ratio"
              value={form.excessRatio}
              suffix="%"
              error={errors.excessRatio}
              onChange={value => onChange('excessRatio', value)}
            />
          </div>
        ) : null}

        {form.mode === 'HOSTING' ? (
          <div>
            <LabeledNumber
              t={t}
              id="emc-base-cost"
              labelKey="Baseline Energy Cost (C_base)"
              value={form.baseCost}
              suffix={`${symbol}/${t('Year')}`}
              error={errors.baseCost}
              onChange={value => onChange('baseCost', value)}
            />
            <LabeledNumber
              t={t}
              id="emc-hosting-fee"
              labelKey="Annual Hosting Fee (F)"
              value={form.hostingFee}
              suffix={`${symbol}/${t('Year')}`}
              error={errors.hostingFee}
              onChange={value => onChange('hostingFee', value)}
            />
            <YearTable
              t={t}
              titleKey="Actual Energy Cost"
              labelKey="Actual Energy Cost"
              unit={symbol}
              values={form.actualCosts}
              errors={errors.actualCosts}
              onChange={onSeriesChange('actualCosts')}
            />
            <LabeledNumber
              t={t}
              id="emc-hosting-om"
              labelKey="Hosting O&M Cost"
              value={form.hostingOm}
              suffix={`${symbol}/${t('Year')}`}
              error={errors.hostingOm}
              onChange={value => onChange('hostingOm', value)}
            />
            <LabeledNumber
              t={t}
              id="emc-retrofit-cost"
              labelKey="Retrofit Cost"
              value={form.retrofitCost}
              suffix={symbol}
              error={errors.retrofitCost}
              onChange={value => onChange('retrofitCost', value)}
            />
            <LabeledNumber
              t={t}
              id="emc-amort-years"
              labelKey="Amortization Years"
              value={form.amortYears}
              suffix={t('Year')}
              error={errors.amortYears}
              onChange={value => onChange('amortYears', value)}
            />
          </div>
        ) : null}

        <LabeledSelect
          t={t}
          id="emc-currency"
          labelKey="Currency"
          value={form.currency}
          options={CURRENCIES.map(item => ({ id: item.id, label: `${item.id} (${item.symbol})` }))}
          onChange={value => onChange('currency', value)}
        />

        <div className="d-flex flex-wrap align-items-center" style={actionRowStyle}>
          <Button color="primary" size="sm" className="mr-2" style={buttonStyle} onClick={onBring}>
            {t('Bring Schedule into Finance')}
          </Button>
          <Button color="soft-secondary" size="sm" style={buttonStyle} onClick={onReset}>
            {t('Reset')}
          </Button>
        </div>
      </Col>

      <Col xs={12} lg={7}>
        {noSavings ? (
          <Alert color="warning" className="mt-3 mb-0">
            {t('No energy savings, no benefit to share')}
          </Alert>
        ) : (
          <div className="mt-3">
            {errorKeys.length > 0 ? (
              <Alert color="warning" className="mb-3">
                {errorKeys.map(key => (
                  <div key={key}>{errorText(t, errors[key])}</div>
                ))}
              </Alert>
            ) : null}

            {schedule && schedule.warnings && schedule.warnings.length > 0 ? (
              <Alert color="warning" className="mb-3">
                {schedule.warnings.map(code => (
                  <div key={code}>{errorText(t, code)}</div>
                ))}
              </Alert>
            ) : null}

            {schedule && !schedule.blocked ? (
              <div>
                <div className="fs--1 text-uppercase text-muted mb-2">{t('Result')}</div>
                <AllocationTable
                  t={t}
                  symbol={symbol}
                  columns={ALLOC_COLUMNS[form.mode]}
                  rows={schedule.rows}
                />
                <Table size="sm" borderless className="mt-3 mb-0 align-middle">
                  <tbody>
                    {totalRows.map(row => (
                      <tr key={row.id}>
                        <td className="text-nowrap font-weight-semi-bold">{row.label}</td>
                        <td className="text-right" style={moneyCellStyle}>
                          {row.text}
                        </td>
                        <td className="text-right">
                          <Button
                            color="soft-secondary"
                            size="sm"
                            style={buttonStyle}
                            onClick={() => onCopy({ id: `sharing-${row.id}`, text: row.text })}
                          >
                            {copiedKey === `sharing-${row.id}` ? t('Copied') : t('Copy Value')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : null}
          </div>
        )}
      </Col>
    </Row>
  );
};

SharingPanel.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  varietyId: PropTypes.string.isRequired,
  schedule: PropTypes.object,
  noSavings: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onSeriesChange: PropTypes.func.isRequired,
  onRowChange: PropTypes.func.isRequired,
  onRowAdd: PropTypes.func.isRequired,
  onRowRemove: PropTypes.func.isRequired,
  onApplyPrice: PropTypes.func.isRequired,
  onBring: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  copiedKey: PropTypes.string,
  onCopy: PropTypes.func.isRequired,
};

SharingPanel.defaultProps = { schedule: null, copiedKey: null };

export default SharingPanel;
