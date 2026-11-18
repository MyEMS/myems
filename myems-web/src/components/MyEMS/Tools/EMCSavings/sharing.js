// Benefit distribution kernel, GB/T 24915-2020 annex A / B / C (dev plan 5.2).
// Pure functions, no React / reactstrap / i18n.

import {
  MAX_CONTRACT_TERM,
  MAX_SHARING_STAGES,
  MIN_CONTRACT_TERM,
  parseNumber,
  toInteger,
} from './constants';

// price_t per the basis selected from GB/T 24915-2020 annex A clause 1.9.
// FIXED_PRICE ignores the growth rate by definition (plan 5.2.1).
export const resolveYearPrice = (basis, basePrice, growth, year, yearlyPrices) => {
  if (basis === 'FIXED_PRICE') return basePrice;
  if (basis === 'REPORT_YEAR_PRICE') {
    const typed = yearlyPrices && yearlyPrices[year - 1];
    if (Number.isFinite(typed)) return typed;
  }
  return basePrice * Math.pow(1 + (Number.isFinite(growth) ? growth : 0), year - 1);
};

// B_t = Es_t * price_t.
export const annualBenefit = (savings, price) => savings * price;

// ESCO share of a year, from the segmented ratio table. Returns null when no
// stage covers the year, which the caller reports as ratioOutOfRange.
export const stageRatioOf = (year, stages) => {
  const stage = (stages || []).find(
    item =>
      Number.isFinite(item.start) &&
      Number.isFinite(item.end) &&
      year >= item.start &&
      year <= item.end
  );
  return stage ? stage.ratio / 100 : null;
};

// The panel keeps the stage table as strings, the kernel parses them first so a
// "1" typed in a cell behaves exactly like the number 1 (plan 7.3). Invalid
// cells stay undefined and are rejected by validateStages below.
const readStages = stages =>
  (stages || []).map(stage => ({
    start: toInteger(stage && stage.start).value,
    end: toInteger(stage && stage.end).value,
    ratio: parseNumber(stage && stage.ratio, { allowNegative: false }).value,
  }));

// Stages must be within the ESCO range, must not overlap and must cover every
// contract year without a gap (plan 5.2.2 / 8.6).
export const validateStages = (stages, term) => {
  if (!stages || stages.length === 0 || stages.length > MAX_SHARING_STAGES)
    return 'ratioOutOfRange';
  const covered = new Array(term + 1).fill(0);
  for (let index = 0; index < stages.length; index += 1) {
    const stage = stages[index];
    if (
      !Number.isFinite(stage.start) ||
      !Number.isFinite(stage.end) ||
      !Number.isFinite(stage.ratio)
    ) {
      return 'ratioOutOfRange';
    }
    if (stage.start < 1 || stage.end < stage.start || stage.end > term) return 'ratioOutOfRange';
    if (stage.ratio < 0 || stage.ratio > 100) return 'ratioOutOfRange';
    for (let year = stage.start; year <= stage.end; year += 1) covered[year] += 1;
  }
  for (let year = 1; year <= term; year += 1) {
    if (covered[year] !== 1) return 'ratioOutOfRange';
  }
  return null;
};

// Straight line retrofit cost amortization (plan 5.2.4): the automatic variant
// is used, amortYears = 0 disables amortization.
export const amortizationOf = (retrofitCost, amortYears, year) => {
  if (!(retrofitCost > 0) || !(amortYears > 0) || year > amortYears) return 0;
  return retrofitCost / amortYears;
};

// Parse a per-year list, padded / truncated to the contract term.
const readYearList = (list, term, options = {}) => {
  const rows = [];
  const errors = [];
  for (let year = 1; year <= term; year += 1) {
    const parsed = parseNumber(list ? list[year - 1] : '', options);
    if (parsed.error) {
      errors.push({ year, code: parsed.error });
      rows.push(null);
    } else {
      rows.push(parsed.value);
    }
  }
  return { rows, errors };
};

const readOptional = value => {
  const parsed = parseNumber(value);
  return parsed.error ? null : parsed.value;
};

// Build the year by year distribution table for the selected contract mode.
// Returns { term, rows, totals, errors, warnings, blocked }.
export const buildSchedule = raw => {
  const errors = {};
  const warnings = [];

  const termParsed = toInteger(raw.term);
  if (termParsed.error) {
    errors.term = termParsed.error;
    return { errors, warnings, blocked: true, rows: [], term: 0 };
  }
  const term = termParsed.value;
  if (term < MIN_CONTRACT_TERM || term > MAX_CONTRACT_TERM) {
    errors.term = 'contractTermInvalid';
    return { errors, warnings, blocked: true, rows: [], term: 0 };
  }

  const savings = readYearList(raw.savings, term, { allowNegative: false });
  if (savings.errors.length > 0) {
    errors.savings = savings.errors;
    return { errors, warnings, blocked: true, rows: [], term };
  }

  const priceParsed = parseNumber(raw.price, { allowNegative: false });
  if (priceParsed.error) {
    errors.price = priceParsed.error;
    return { errors, warnings, blocked: true, rows: [], term };
  }
  const growthParsed =
    raw.growth === '' || raw.growth == null ? { value: 0 } : parseNumber(raw.growth);
  if (growthParsed.error) {
    errors.growth = growthParsed.error;
    return { errors, warnings, blocked: true, rows: [], term };
  }
  const growth = growthParsed.value / 100;
  if (Math.abs(growth) > 0.5) {
    errors.growth = 'ratioOutOfRange';
    return { errors, warnings, blocked: true, rows: [], term };
  }

  const yearlyPrices = (raw.yearlyPrices || []).map(readOptional);
  const priceOf = year =>
    resolveYearPrice(raw.basis, priceParsed.value, growth, year, yearlyPrices);

  const rows = [];
  let totalBenefit = 0;
  let totalEsco = 0;
  let totalCustomer = 0;

  if (raw.mode === 'SHARING') {
    const stages = readStages(raw.stages);
    const stagesError = validateStages(stages, term);
    if (stagesError) {
      errors.stages = stagesError;
      return { errors, warnings, blocked: true, rows: [], term };
    }
    const extraP =
      raw.customerExtraOm === '' || raw.customerExtraOm == null
        ? { value: 0 }
        : parseNumber(raw.customerExtraOm, { allowNegative: false });
    if (extraP.error) {
      errors.customerExtraOm = extraP.error;
      return { errors, warnings, blocked: true, rows: [], term };
    }
    for (let year = 1; year <= term; year += 1) {
      const es = savings.rows[year - 1];
      const price = priceOf(year);
      const benefit = annualBenefit(es, price);
      const ratio = stageRatioOf(year, stages);
      const escoShare = benefit * ratio;
      // Subtraction, not benefit * (1 - ratio): see plan 7.1, the multiplication
      // leaves a binary tail and breaks ESCO + Customer = Benefit.
      const customerShare = benefit - escoShare;
      totalBenefit += benefit;
      totalEsco += escoShare;
      totalCustomer += customerShare;
      rows.push({
        year,
        es,
        price,
        stageRatio: ratio * 100,
        benefit,
        escoShare,
        customerShare,
        extraOm: extraP.value,
        escoNet: escoShare,
        customerNet: customerShare - extraP.value,
      });
    }
  } else if (raw.mode === 'GUARANTEED') {
    const guaranteed = readYearList(raw.guaranteed, term, { allowNegative: false });
    if (guaranteed.errors.length > 0) {
      errors.guaranteed = guaranteed.errors;
      return { errors, warnings, blocked: true, rows: [], term };
    }
    const serviceParsed = parseNumber(raw.servicePrice, { allowNegative: false });
    if (serviceParsed.error) {
      errors.servicePrice = serviceParsed.error;
      return { errors, warnings, blocked: true, rows: [], term };
    }
    const excessParsed =
      raw.excessRatio === '' || raw.excessRatio == null
        ? { value: 50 }
        : parseNumber(raw.excessRatio, { allowNegative: false });
    if (excessParsed.error) {
      errors.excessRatio = excessParsed.error;
      return { errors, warnings, blocked: true, rows: [], term };
    }
    if (excessParsed.value > 100) {
      errors.excessRatio = 'ratioOutOfRange';
      return { errors, warnings, blocked: true, rows: [], term };
    }
    const excessRatio = excessParsed.value / 100;
    for (let year = 1; year <= term; year += 1) {
      const actual = savings.rows[year - 1];
      const guaranteedValue = guaranteed.rows[year - 1];
      const price = priceOf(year);
      const benefit = annualBenefit(actual, price);
      const serviceFee = annualBenefit(Math.min(actual, guaranteedValue), serviceParsed.value);
      const compensation = annualBenefit(
        Math.max(0, guaranteedValue - actual),
        serviceParsed.value
      );
      const excessShare = annualBenefit(
        Math.max(0, actual - guaranteedValue) * excessRatio,
        serviceParsed.value
      );
      const escoNet = serviceFee - compensation + excessShare;
      // Customer net = benefit - service fee + compensation - excess share, and
      // escoNet + customerNet = benefit holds without a rounding tail.
      const customerNet = benefit - serviceFee + compensation - excessShare;
      totalBenefit += benefit;
      totalEsco += escoNet;
      totalCustomer += customerNet;
      rows.push({
        year,
        es: actual,
        price,
        benefit,
        guaranteed: guaranteedValue,
        serviceFee,
        compensation,
        excessShare,
        escoNet,
        customerNet,
      });
    }
  } else if (raw.mode === 'HOSTING') {
    const baseParsed = parseNumber(raw.baseCost, { allowNegative: false });
    const feeParsed = parseNumber(raw.hostingFee, { allowNegative: false });
    if (baseParsed.error || feeParsed.error) {
      if (baseParsed.error) errors.baseCost = baseParsed.error;
      if (feeParsed.error) errors.hostingFee = feeParsed.error;
      return { errors, warnings, blocked: true, rows: [], term };
    }
    if (feeParsed.value > baseParsed.value) warnings.push('hostingOverBase');
    const omParsed =
      raw.hostingOm === '' || raw.hostingOm == null
        ? { value: 0 }
        : parseNumber(raw.hostingOm, { allowNegative: false });
    const retrofitParsed =
      raw.retrofitCost === '' || raw.retrofitCost == null
        ? { value: 0 }
        : parseNumber(raw.retrofitCost, { allowNegative: false });
    const amortYearsParsed =
      raw.amortYears === '' || raw.amortYears == null ? { value: 0 } : toInteger(raw.amortYears);
    if (omParsed.error) errors.hostingOm = omParsed.error;
    if (retrofitParsed.error) errors.retrofitCost = retrofitParsed.error;
    if (amortYearsParsed.error) errors.amortYears = amortYearsParsed.error;
    if (Object.keys(errors).length > 0) {
      return { errors, warnings, blocked: true, rows: [], term };
    }
    const actual = readYearList(raw.actualCosts, term, { allowNegative: false });
    if (actual.errors.length > 0) {
      errors.actualCosts = actual.errors;
      return { errors, warnings, blocked: true, rows: [], term };
    }
    for (let year = 1; year <= term; year += 1) {
      const amortization = amortizationOf(retrofitParsed.value, amortYearsParsed.value, year);
      const actualCost = actual.rows[year - 1];
      const customerNet = baseParsed.value - feeParsed.value;
      const escoNet = feeParsed.value - (actualCost + omParsed.value + amortization);
      totalCustomer += customerNet;
      totalEsco += escoNet;
      rows.push({
        year,
        baseCost: baseParsed.value,
        hostingFee: feeParsed.value,
        actualCost,
        hostingOm: omParsed.value,
        amortization,
        customerNet,
        escoNet,
      });
    }
  } else {
    errors.mode = 'nan';
    return { errors, warnings, blocked: true, rows: [], term };
  }

  return {
    term,
    rows,
    warnings,
    errors,
    blocked: false,
    totals: {
      benefit: totalBenefit,
      esco: totalEsco,
      customer: totalCustomer,
    },
  };
};
