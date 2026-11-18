// Financial evaluation kernel (dev plan 5.3 / 7.2).
// These are general engineering economics formulas: GB/T 24915-2020 and
// GB/T 28750-2012 do not define NPV / IRR / payback / ROI, and the reference
// panel says so (plan 2.5). Pure functions, no React / reactstrap / i18n.

import {
  IRR_MAX_BISECTIONS,
  IRR_MAX_RATE,
  IRR_MIN_RATE,
  IRR_SCAN_STEP,
  IRR_TOLERANCE,
  parseNumber,
} from './constants';

// NPV(i) = SUM NCF_t / (1 + i)^t. A rate at or below -100% is undefined.
export const npv = (rate, cashFlows) => {
  if (!Number.isFinite(rate) || rate <= -1 || !Array.isArray(cashFlows)) return null;
  let total = 0;
  for (let t = 0; t < cashFlows.length; t += 1) {
    const value = cashFlows[t];
    if (!Number.isFinite(value)) return null;
    total += value / Math.pow(1 + rate, t);
  }
  return total;
};

// Bisection inside a bracket that is known to contain a sign change.
const bisectRoot = (cashFlows, low, high) => {
  let lower = low;
  let upper = high;
  let lowerValue = npv(lower, cashFlows);
  for (let iteration = 0; iteration < IRR_MAX_BISECTIONS; iteration += 1) {
    const middle = (lower + upper) / 2;
    const middleValue = npv(middle, cashFlows);
    if (!Number.isFinite(middleValue)) return null;
    if (Math.abs(middleValue) < IRR_TOLERANCE) return middle;
    if (lowerValue * middleValue < 0) {
      upper = middle;
    } else {
      lower = middle;
      lowerValue = middleValue;
    }
  }
  return (lower + upper) / 2;
};

// IRR by scanning [-0.9, 1.0] in 0.1% steps and bisecting every sign change,
// so multiple roots are detected instead of being hidden by a single sweep.
// Returns { value, rootCount, roots }; value is null when nothing crosses zero.
export const irr = cashFlows => {
  const empty = { value: null, rootCount: 0, roots: [] };
  if (!Array.isArray(cashFlows) || cashFlows.length < 2) return empty;
  const roots = [];
  const steps = Math.round((IRR_MAX_RATE - IRR_MIN_RATE) / IRR_SCAN_STEP);
  let previousRate = IRR_MIN_RATE;
  let previousValue = npv(previousRate, cashFlows);
  if (!Number.isFinite(previousValue)) return empty;
  for (let index = 1; index <= steps; index += 1) {
    // Derived from the step count so the grid never drifts by accumulation.
    const rate = IRR_MIN_RATE + index * IRR_SCAN_STEP;
    const value = npv(rate, cashFlows);
    if (!Number.isFinite(value)) return empty;
    if (value === 0) {
      roots.push(rate);
    } else if (previousValue !== 0 && previousValue * value < 0) {
      const root = bisectRoot(cashFlows, previousRate, rate);
      if (root != null) roots.push(root);
    }
    previousRate = rate;
    previousValue = value;
  }
  if (roots.length === 0) return { value: null, rootCount: 0, roots: [] };
  const positive = roots.filter(root => root > 0);
  const value = positive.length > 0 ? Math.min(...positive) : Math.max(...roots);
  return { value, rootCount: roots.length, roots };
};

// Cumulative cash flow, used by both payback helpers.
export const cumulative = cashFlows => {
  let running = 0;
  return (cashFlows || []).map(value => {
    running += value;
    return running;
  });
};

// Payback period by linear interpolation of the cumulative series. Returns null
// when there is no investment to recover or the cumulative never turns
// positive inside the contract term (plan 7.2).
const paybackOf = series => {
  if (!Array.isArray(series) || series.length === 0) return null;
  if (!(series[0] < 0)) return null;
  for (let t = 1; t < series.length; t += 1) {
    if (series[t] >= 0) {
      const previous = series[t - 1];
      const step = series[t] - previous;
      return step === 0 ? t : t - 1 + Math.abs(previous) / step;
    }
  }
  return null;
};

export const paybackStatic = cashFlows => paybackOf(cumulative(cashFlows));

export const paybackDiscounted = (cashFlows, rate) => {
  if (!Number.isFinite(rate) || rate <= -1 || !Array.isArray(cashFlows)) return null;
  const discounted = cashFlows.map((value, t) => value / Math.pow(1 + rate, t));
  return paybackOf(cumulative(discounted));
};

// ROI = (SUM operating NCF - investment) / investment * 100, i.e. net income
// over the total investment (plan 8.3: the gross variant would be meaningless).
export const roi = (cashFlows, investment, operatingStartIndex = 1) => {
  if (!(investment > 0) || !Array.isArray(cashFlows)) return null;
  let operatingSum = 0;
  for (let t = operatingStartIndex; t < cashFlows.length; t += 1) {
    if (Number.isFinite(cashFlows[t])) operatingSum += cashFlows[t];
  }
  return ((operatingSum - investment) / investment) * 100;
};

const readValue = (raw, options = {}) => {
  const parsed = parseNumber(raw, options);
  return parsed.error ? null : parsed.value;
};

// One view (ESCO or customer) of the cash flow statement.
// Every position t = 0..N may be overridden by the user (plan 5.3 / 6.5). An
// override is typed into a cell, so it arrives as a string and goes through
// parseNumber like every other input (plan 7.2); an unreadable cell falls back
// to the derived value and is reported inline instead of failing silently.
const buildOneView = ({
  viewKey,
  investment,
  operating,
  omIncrement,
  constructionYears,
  viewOverrides,
  overrideErrors,
}) => {
  const construction = constructionYears > 0 ? constructionYears : 0;
  const values = [];
  const resolve = (position, computed) => {
    const raw = viewOverrides ? viewOverrides[position] : undefined;
    if (raw === undefined || raw === null || raw === '') return computed;
    const parsed = parseNumber(raw);
    if (parsed.error) {
      overrideErrors[viewKey][position] = parsed.error;
      return computed;
    }
    return parsed.value;
  };
  const constructionAmount = construction > 0 ? -investment / construction : 0;
  for (let index = 0; index < construction; index += 1) {
    values.push(resolve(index, constructionAmount));
  }
  if (construction === 0) values.push(resolve(0, -investment));
  operating.forEach((value, index) => {
    values.push(resolve(values.length, (value || 0) - omIncrement));
  });
  return {
    values,
    investment,
    operatingStartIndex: construction > 0 ? construction : 1,
  };
};

// Assemble both views from the distribution table of tab 2 (plan 5.3).
// `raw` holds the unparsed strings of the finance panel.
export const buildFinancialModel = (raw, context) => {
  const errors = {};
  const term = context.term;
  const rows = context.rows || [];

  const investment = readValue(raw.investment, { allowNegative: false });
  if (investment == null) errors.investment = raw.investment === '' ? 'empty' : 'nan';
  const discountParsed =
    raw.discountRate === '' || raw.discountRate == null
      ? { value: 8 }
      : parseNumber(raw.discountRate);
  if (discountParsed.error) errors.discountRate = discountParsed.error;

  let escoShareRatio = 1;
  if (raw.investmentOwner === 'CUSTOMER') escoShareRatio = 0;
  else if (raw.investmentOwner === 'SPLIT') {
    const split = readValue(raw.investmentSplit);
    if (split == null) errors.investmentSplit = 'empty';
    else if (split < 0 || split > 100) errors.investmentSplit = 'ratioOutOfRange';
    else escoShareRatio = split / 100;
  }

  let constructionYears = 0;
  if (raw.constructionYears !== '' && raw.constructionYears != null) {
    const parsed = parseNumber(raw.constructionYears, { allowNegative: false });
    if (parsed.error) errors.constructionYears = parsed.error;
    else {
      constructionYears = Math.trunc(parsed.value);
      if (constructionYears >= term) errors.constructionYears = 'contractTermInvalid';
    }
  }

  const escoOm =
    raw.escoOm === '' || raw.escoOm == null ? 0 : readValue(raw.escoOm, { allowNegative: false });
  const customerOm =
    raw.customerOm === '' || raw.customerOm == null
      ? 0
      : readValue(raw.customerOm, { allowNegative: false });
  if (escoOm == null) errors.escoOm = 'nan';
  if (customerOm == null) errors.customerOm = 'nan';

  if (Object.keys(errors).length > 0 || investment == null) {
    return { errors, blocked: true, views: null, discountRate: null, term };
  }

  const discountRate = discountParsed.value / 100;
  if (!(discountRate > -0.1) || discountRate >= 1) errors.discountRate = 'ratioOutOfRange';
  if (Object.keys(errors).length > 0) return { errors, blocked: true, views: null, term };

  const totalInvestment = investment;
  const shared = {
    constructionYears,
    overrides: raw.overrides || {},
  };
  // Invalid override cells are collected per view so the panel can mark the
  // exact row instead of showing one anonymous alert.
  const overrideErrors = { esco: {}, customer: {} };
  const escoView = buildOneView({
    ...shared,
    viewKey: 'esco',
    overrideErrors,
    investment: totalInvestment * escoShareRatio,
    operating: rows.map(row => row.escoNet || 0),
    omIncrement: escoOm,
    viewOverrides: shared.overrides.esco,
  });
  const customerView = buildOneView({
    ...shared,
    viewKey: 'customer',
    overrideErrors,
    investment: totalInvestment * (1 - escoShareRatio),
    operating: rows.map(row => row.customerNet || 0),
    omIncrement: customerOm,
    viewOverrides: shared.overrides.customer,
  });

  const summarize = view => {
    const netPresentValue = npv(discountRate, view.values);
    const irrResult = irr(view.values);
    const staticPayback = paybackStatic(view.values);
    const discountedPayback = paybackDiscounted(view.values, discountRate);
    const returnOnInvestment = roi(view.values, view.investment, view.operatingStartIndex);
    return {
      values: view.values,
      investment: view.investment,
      cumulative: cumulative(view.values),
      discounted: view.values.map((value, t) => value / Math.pow(1 + discountRate, t)),
      discountedCumulative: cumulative(
        view.values.map((value, t) => value / Math.pow(1 + discountRate, t))
      ),
      netPresentValue,
      irr: irrResult,
      staticPayback,
      discountedPayback,
      roi: returnOnInvestment,
      annualRoi: returnOnInvestment == null ? null : returnOnInvestment / term,
    };
  };

  return {
    errors,
    blocked: false,
    term,
    discountRate,
    constructionYears,
    overrideErrors,
    views: { esco: summarize(escoView), customer: summarize(customerView) },
  };
};
