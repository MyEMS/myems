import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Col, Input, Row, Table } from 'reactstrap';
import {
  EM_DASH,
  INVESTMENT_OWNERS,
  MAX_INPUT_LENGTH,
  currencySymbol,
  formatMoney,
  formatPercent,
} from '../constants';
import {
  actionRowStyle,
  buttonStyle,
  cashFlowRowStyle,
  moneyCellStyle,
  numberStyle,
  scrollableTableStyle,
  tableInputStyle,
} from '../styles';
import { LabeledNumber, LabeledSelect, errorText } from './Fields';

// Metric rows of the comparison table, dev plan 6.6. `get` reads one view so
// the ESCO and the customer column share the same formatting rules.
const METRICS = [
  {
    key: 'npv',
    labelKey: 'NPV (Net Present Value)',
    get: (view, symbol) => formatMoney(view.netPresentValue, symbol),
  },
  {
    key: 'irr',
    labelKey: 'IRR (Internal Rate of Return)',
    get: view => (view.irr.value == null ? EM_DASH : formatPercent(view.irr.value * 100, 2)),
  },
  {
    key: 'staticPayback',
    labelKey: 'Static Payback Period',
    get: view => (view.staticPayback == null ? EM_DASH : view.staticPayback.toFixed(2)),
  },
  {
    key: 'discountedPayback',
    labelKey: 'Discounted Payback Period',
    get: view => (view.discountedPayback == null ? EM_DASH : view.discountedPayback.toFixed(2)),
  },
  {
    key: 'roi',
    labelKey: 'ROI (Return on Investment)',
    get: view => formatPercent(view.roi),
  },
  {
    key: 'annualRoi',
    labelKey: 'Annual Average ROI',
    get: view => formatPercent(view.annualRoi),
  },
];

// One editable net cash flow cell. The override is stored per view and per
// position, everything else is derived from the tab 2 distribution.
const CashFlowInput = ({ label, value, onChange }) => (
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

CashFlowInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const MoneyText = ({ value, symbol }) => (
  <span style={moneyCellStyle}>{formatMoney(value, symbol)}</span>
);

MoneyText.propTypes = {
  value: PropTypes.number,
  symbol: PropTypes.string.isRequired,
};

MoneyText.defaultProps = { value: null };

// Tab 3: financial evaluation from both parties' point of view (dev plan 5.3 /
// 6.5 / 6.6). The cash flows come from tab 2 and may be overridden per year.
const FinancePanel = ({
  t,
  form,
  currency,
  schedule,
  model,
  noSavings,
  onChange,
  onOverrideChange,
  onBring,
  onReset,
  copiedKey,
  onCopy,
}) => {
  const symbol = currencySymbol(currency);
  const errors = (model && model.errors) || {};
  const overrideErrors = (model && model.overrideErrors) || { esco: {}, customer: {} };
  const views = model && model.views ? model.views : null;
  const esco = views ? views.esco : null;
  const customer = views ? views.customer : null;
  const rowCount = esco ? esco.values.length : 0;
  const splitVisible = form.investmentOwner === 'SPLIT';
  const errorKeys = Object.keys(errors).filter(key => typeof errors[key] === 'string');

  const cashFlowBody = (
    <Table size="sm" borderless className="mb-0 align-middle">
      <thead className="fs--1 text-uppercase text-muted sticky-top">
        <tr>
          <th className="border-0">{t('Year')}</th>
          <th className="border-0 text-right">{`${t('ESCO View')} ${t('Net Cash Flow')}`}</th>
          <th className="border-0 text-right">
            {`${t('ESCO View')} ${t('Cumulative Net Cash Flow')}`}
          </th>
          <th className="border-0 text-right">{`${t('Customer View')} ${t('Net Cash Flow')}`}</th>
          <th className="border-0 text-right">
            {`${t('Customer View')} ${t('Cumulative Net Cash Flow')}`}
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rowCount }, (_, index) => {
          const escoOverride = form.overrides.esco[index];
          const customerOverride = form.overrides.customer[index];
          const modified = Boolean(escoOverride || customerOverride);
          return (
            <tr key={`cf-${index}`} className={modified ? 'bg-soft-primary' : undefined}>
              <td className="text-nowrap" style={numberStyle}>
                {index}
              </td>
              <td style={cashFlowRowStyle}>
                <CashFlowInput
                  label={`${t('ESCO View')} ${t('Net Cash Flow')} ${index}`}
                  value={escoOverride === undefined ? '' : escoOverride}
                  onChange={value => onOverrideChange('esco', index, value)}
                />
                <div className="fs--1 text-muted">
                  <MoneyText value={esco.values[index]} symbol={symbol} />
                </div>
                {overrideErrors.esco[index] ? (
                  <div className="text-muted fs--1">{errorText(t, overrideErrors.esco[index])}</div>
                ) : null}
              </td>
              <td style={moneyCellStyle}>{formatMoney(esco.cumulative[index], symbol)}</td>
              <td style={cashFlowRowStyle}>
                <CashFlowInput
                  label={`${t('Customer View')} ${t('Net Cash Flow')} ${index}`}
                  value={customerOverride === undefined ? '' : customerOverride}
                  onChange={value => onOverrideChange('customer', index, value)}
                />
                <div className="fs--1 text-muted">
                  <MoneyText value={customer.values[index]} symbol={symbol} />
                </div>
                {overrideErrors.customer[index] ? (
                  <div className="text-muted fs--1">
                    {errorText(t, overrideErrors.customer[index])}
                  </div>
                ) : null}
              </td>
              <td style={moneyCellStyle}>{formatMoney(customer.cumulative[index], symbol)}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );

  return (
    <Row className="align-items-stretch">
      <Col xs={12} lg={5} className="mb-3 mb-lg-0">
        <LabeledNumber
          t={t}
          id="emc-investment"
          labelKey="Total Investment"
          value={form.investment}
          suffix={symbol}
          error={errors.investment}
          onChange={value => onChange('investment', value)}
        />

        <LabeledSelect
          t={t}
          id="emc-investment-owner"
          labelKey="Investment Owner"
          value={form.investmentOwner}
          options={INVESTMENT_OWNERS.map(item => ({ id: item.id, labelKey: item.labelKey }))}
          onChange={value => onChange('investmentOwner', value)}
        />

        {splitVisible ? (
          <LabeledNumber
            t={t}
            id="emc-investment-split"
            labelKey="Investment Split (ESCO Ratio)"
            value={form.investmentSplit}
            suffix="%"
            error={errors.investmentSplit}
            onChange={value => onChange('investmentSplit', value)}
          />
        ) : null}

        <LabeledNumber
          t={t}
          id="emc-construction-years"
          labelKey="Construction Sharing Years"
          value={form.constructionYears}
          suffix={t('Year')}
          error={errors.constructionYears}
          onChange={value => onChange('constructionYears', value)}
        />

        <LabeledNumber
          t={t}
          id="emc-esco-om"
          labelKey="ESCO Annual O&M Increment"
          value={form.escoOm}
          suffix={`${symbol}/${t('Year')}`}
          error={errors.escoOm}
          onChange={value => onChange('escoOm', value)}
        />

        <LabeledNumber
          t={t}
          id="emc-customer-om"
          labelKey="Customer Annual O&M Increment"
          value={form.customerOm}
          suffix={`${symbol}/${t('Year')}`}
          error={errors.customerOm}
          onChange={value => onChange('customerOm', value)}
        />

        <LabeledNumber
          t={t}
          id="emc-discount-rate"
          labelKey="Discount Rate (i)"
          value={form.discountRate}
          suffix="%"
          error={errors.discountRate}
          hint={t('NPV Formula')}
          onChange={value => onChange('discountRate', value)}
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

            {!schedule || schedule.blocked ? (
              <Alert color="warning" className="mb-0">
                {t('Please input a numeric value')}
              </Alert>
            ) : null}

            {views ? (
              <div>
                <div className="fs--1 text-uppercase text-muted mb-2">{t('Net Cash Flow')}</div>
                {rowCount > 12 ? (
                  <div className="table-responsive" style={scrollableTableStyle}>
                    {cashFlowBody}
                  </div>
                ) : (
                  <div className="table-responsive">{cashFlowBody}</div>
                )}

                <div className="fs--1 text-uppercase text-muted mt-3 mb-2">{t('Result')}</div>
                <Table size="sm" borderless className="mb-0 align-middle">
                  <thead className="fs--1 text-uppercase text-muted">
                    <tr>
                      <th className="border-0">{t('Description')}</th>
                      <th className="border-0 text-right">{t('ESCO View')}</th>
                      <th className="border-0 text-right">{t('Customer View')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {METRICS.map(metric => {
                      const escoText = metric.get(esco, symbol);
                      const customerText = metric.get(customer, symbol);
                      return (
                        <tr key={metric.key}>
                          <td className="text-nowrap">{t(metric.labelKey)}</td>
                          <td className="text-right" style={moneyCellStyle}>
                            {escoText}
                            {metric.key === 'irr' && esco.irr.value == null ? (
                              <div className="fs--1 text-muted">
                                {t('No IRR solution for this cash flow')}
                              </div>
                            ) : null}
                            {metric.key === 'irr' && esco.irr.rootCount > 1 ? (
                              <div className="fs--1 text-muted">
                                {t('Multiple IRR roots exist, prefer NPV')}
                              </div>
                            ) : null}
                            <Button
                              color="soft-secondary"
                              size="sm"
                              className="ml-2"
                              style={buttonStyle}
                              onClick={() =>
                                onCopy({ id: `finance-${metric.key}-esco`, text: escoText })
                              }
                            >
                              {copiedKey === `finance-${metric.key}-esco`
                                ? t('Copied')
                                : t('Copy Value')}
                            </Button>
                          </td>
                          <td className="text-right" style={moneyCellStyle}>
                            {customerText}
                            {metric.key === 'irr' && customer.irr.value == null ? (
                              <div className="fs--1 text-muted">
                                {t('No IRR solution for this cash flow')}
                              </div>
                            ) : null}
                            {metric.key === 'irr' && customer.irr.rootCount > 1 ? (
                              <div className="fs--1 text-muted">
                                {t('Multiple IRR roots exist, prefer NPV')}
                              </div>
                            ) : null}
                            <Button
                              color="soft-secondary"
                              size="sm"
                              className="ml-2"
                              style={buttonStyle}
                              onClick={() =>
                                onCopy({
                                  id: `finance-${metric.key}-customer`,
                                  text: customerText,
                                })
                              }
                            >
                              {copiedKey === `finance-${metric.key}-customer`
                                ? t('Copied')
                                : t('Copy Value')}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td className="text-nowrap">{t('Total Investment')}</td>
                      <td className="text-right" style={moneyCellStyle}>
                        {formatMoney(esco.investment, symbol)}
                      </td>
                      <td className="text-right" style={moneyCellStyle}>
                        {formatMoney(customer.investment, symbol)}
                      </td>
                    </tr>
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

FinancePanel.propTypes = {
  t: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
  schedule: PropTypes.object,
  model: PropTypes.object,
  noSavings: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onOverrideChange: PropTypes.func.isRequired,
  onBring: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  copiedKey: PropTypes.string,
  onCopy: PropTypes.func.isRequired,
};

FinancePanel.defaultProps = { schedule: null, model: null, copiedKey: null };

export default FinancePanel;
