// Energy savings kernel, GB/T 28750-2012 and GB/T 13234-2018 (dev plan 5.1).
// Pure functions, no React / reactstrap / i18n, so the dev-plan matrix can
// require() this file directly from Node.

import {
  MAX_VARIABLES,
  PERCENT_SUM_TOLERANCE,
  findVariety,
  parseNumber,
  toInteger,
} from './constants';

// GB/T 13234-2018 normalization (backward calibration):
// Eab = Eb * PROD(Pr,k / Pb,k) ^ (1/m). With a single variable the exponent is
// 1, which is the documented implementation choice (plan 5.1.1).
export const normalizedBaseline = (eb, variables) => {
  if (!Number.isFinite(eb) || eb <= 0) return { error: 'negative' };
  if (!variables || variables.length === 0) return { error: 'empty' };
  if (variables.length > MAX_VARIABLES) return { error: 'tooManyVariables' };
  let product = 1;
  for (let index = 0; index < variables.length; index += 1) {
    const item = variables[index];
    if (item.pb === 0) return { error: 'zeroBase' };
    if (!Number.isFinite(item.pb) || !Number.isFinite(item.pr)) return { error: 'nan' };
    const ratio = item.pr / item.pb;
    if (ratio <= 0) return { error: 'negative' };
    product *= ratio;
  }
  return { value: eb * Math.pow(product, 1 / variables.length) };
};

// GB/T 28750-2012 clause 6.4.1 equation (2): f(x) = beta0 + SUM(beta_k * x_k,r).
// The coefficients are typed in by the user: a least squares fit would need a
// matrix dependency, which the zero-new-npm-package rule forbids.
export const regressionBaseline = (beta0, terms) => {
  const model = (terms || []).filter(item => Number.isFinite(item.beta) && Number.isFinite(item.x));
  return { value: beta0 + model.reduce((sum, item) => sum + item.beta * item.x, 0), terms: model };
};

// GB/T 28750-2012 clause 6.4.2 direct comparison: Eab = SUM(Eoff,i * tau_i).
export const directBaseline = rows => {
  const usable = rows || [];
  if (usable.length === 0) return { error: 'empty' };
  let sumWeights = 0;
  let value = 0;
  for (let index = 0; index < usable.length; index += 1) {
    const row = usable[index];
    if (!Number.isFinite(row.eoff) || !Number.isFinite(row.tau)) return { error: 'nan' };
    if (row.eoff < 0 || row.tau < 0) return { error: 'negative' };
    sumWeights += row.tau;
    value += row.eoff * (row.tau / 100);
  }
  // tau is entered in percent points and must add up to 100% (plan 6.1).
  if (Math.abs(sumWeights - 100) > PERCENT_SUM_TOLERANCE) return { error: 'ratioOutOfRange' };
  return { value };
};

// Adjusted baseline with the single point rule of plan 5.1.3: Am is applied
// here, inside Eab, and never added again to Es. For MANUAL the typed value is
// already the adjusted baseline, so Am is ignored for that method.
export const adjustedBaseline = (method, parsed, am) => {
  const adjustment = Number.isFinite(am) ? am : 0;
  if (method === 'MANUAL') {
    if (!Number.isFinite(parsed.manualEab)) return { error: 'empty' };
    return { value: parsed.manualEab, amIgnored: true };
  }
  if (method === 'RATIO') {
    const base = normalizedBaseline(parsed.eb, parsed.variables);
    if (base.error) return base;
    return { value: base.value + adjustment };
  }
  if (method === 'REGRESSION') {
    const base = regressionBaseline(parsed.beta0, parsed.terms);
    if (base.error) return base;
    if (!base.terms || base.terms.length === 0) {
      return { value: base.value + adjustment, note: 'noModelTerms' };
    }
    return { value: base.value + adjustment };
  }
  if (method === 'DIRECT') {
    const base = directBaseline(parsed.directRows);
    if (base.error) return base;
    return { value: base.value + adjustment };
  }
  return { error: 'nan' };
};

// GB/T 28750-2012 clause 6.3 equation (1). Am already lives in Eab, so the
// caller passes Am = 0 here: Es = Eab - Er + 0.
export const energySavings = (eab, er) => eab - er;

// GB/T 13234-2018 savings rate, in percent.
export const savingsRate = (es, eab) => (eab > 0 ? (es / eab) * 100 : null);

// GB/T 2589: kilogram of standard coal per unit, then divided by 1000 for tce.
export const toTce = (es, kgcePerUnit) => (es * kgcePerUnit) / 1000;

export const toCo2 = (es, emissionFactor) => es * emissionFactor;

// Parse every field of tab 1, collect inline errors and the banner code.
// Returns the shape the SavingsPanel renders and the matrix asserts:
// { variety, fieldErrors, banner, note, eab, er, es, rate, tce, co2, blocked }.
export const calculateSavings = raw => {
  const variety = findVariety(raw.varietyId);
  const fieldErrors = { variables: [], terms: [], directRows: [] };
  const values = {};

  const readScalar = (key, options = {}) => {
    const parsed = parseNumber(raw[key], options);
    if (parsed.error) {
      fieldErrors[key] = parsed.error;
      return null;
    }
    values[key] = parsed.value;
    return parsed.value;
  };

  const readRows = (key, specs) => {
    const collected = [];
    (raw[key] || []).forEach((row, index) => {
      const errors = {};
      const value = {};
      specs.forEach(spec => {
        const parsed = parseNumber(row[spec.field], spec.options);
        if (parsed.error) errors[spec.field] = parsed.error;
        else value[spec.field] = parsed.value;
      });
      fieldErrors[key][index] = errors;
      collected.push(value);
    });
    return collected;
  };

  const tableRows = {};
  if (raw.method === 'MANUAL') {
    readScalar('manualEab', { allowNegative: false });
  } else if (raw.method === 'RATIO') {
    readScalar('eb', { allowNegative: false });
    tableRows.variables = readRows('variables', [{ field: 'pb' }, { field: 'pr' }]);
  } else if (raw.method === 'REGRESSION') {
    readScalar('beta0');
    tableRows.terms = readRows('terms', [{ field: 'beta' }, { field: 'x' }]);
  } else if (raw.method === 'DIRECT') {
    tableRows.directRows = readRows('directRows', [
      { field: 'eoff', options: { allowNegative: false } },
      { field: 'tau', options: { allowNegative: false } },
    ]);
  }
  readScalar('er', { allowNegative: false });
  // Am is optional: an empty cell means "no adjustment" (plan 5.5).
  if (raw.am !== '' && raw.am != null) readScalar('am');
  if (raw.reportCo2) readScalar('co2Factor', { allowNegative: false });

  const rowsHaveError = key => fieldErrors[key].some(item => item && Object.keys(item).length > 0);
  const incomplete =
    Object.keys(fieldErrors).some(key => Array.isArray(fieldErrors[key]) && rowsHaveError(key)) ||
    ['eb', 'er', 'am', 'beta0', 'manualEab', 'co2Factor'].some(key => fieldErrors[key] != null);
  if (incomplete) {
    return { variety, fieldErrors, banner: null, note: null, blocked: true };
  }

  const parsed = {
    eb: values.eb,
    manualEab: values.manualEab,
    beta0: values.beta0,
    variables: tableRows.variables || [],
    terms: tableRows.terms || [],
    directRows: tableRows.directRows || [],
  };

  const baseline = adjustedBaseline(raw.method, parsed, values.am == null ? 0 : values.am);
  if (baseline.error) {
    return { variety, fieldErrors, banner: baseline.error, note: null, blocked: true };
  }
  // Plan 5.1.4: a non positive adjusted baseline is a modelling error, not a
  // zero savings result, and the adjusted baseline cells stay empty.
  if (!Number.isFinite(baseline.value) || baseline.value <= 0) {
    return { variety, fieldErrors, banner: 'nonPositiveBaseline', note: null, blocked: true };
  }

  const eab = baseline.value;
  const es = energySavings(eab, values.er);

  return {
    variety,
    fieldErrors,
    banner: null,
    note: baseline.note || null,
    eab,
    er: values.er,
    es,
    rate: savingsRate(es, eab),
    tce: toTce(es, variety.kgcePerUnit),
    co2: raw.reportCo2 ? toCo2(es, values.co2Factor) : null,
    // Negative or zero savings is a valid M&V result but produces no benefit,
    // so tabs 2 and 3 refuse to compute (plan 5.1.4).
    blocked: !(es > 0),
  };
};

// Contract term and other integer fields used by tabs 2 and 3.
export const parseTerm = raw => {
  const parsed = toInteger(raw);
  if (parsed.error) return { error: parsed.error };
  if (!(parsed.value >= 1) || parsed.value > 30) return { error: 'contractTermInvalid' };
  return { value: parsed.value };
};
