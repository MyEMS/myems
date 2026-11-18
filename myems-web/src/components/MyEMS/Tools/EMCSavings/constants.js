// Constants and formatting helpers for the EMC (Energy Management Contract)
// calculation tool.
// Pure data plus pure functions: no reactstrap, no i18n and no React, so the
// whole module can be loaded by a plain Node script and reused by the dev-plan
// verification matrix (doc/EMC合同能源管理测算工具开发计划.md section 8).

// Input guards (section 7.3): 16 characters is enough for the 1e12 magnitude
// cap of this tool, and a tighter limit keeps pasted values from overflowing.
export const MAX_INPUT_LENGTH = 16;
export const MAX_ABS_VALUE = 1e12;

export const MIN_CONTRACT_TERM = 1;
export const MAX_CONTRACT_TERM = 30;

// Table row limits (section 5.1.1 / 5.2.2 / 5.2.1).
export const MAX_VARIABLES = 2;
export const MAX_REGRESSION_TERMS = 4;
export const MAX_DIRECT_ROWS = 6;
export const MAX_SHARING_STAGES = 5;
export const MAX_PRICE_SEGMENTS = 4;

// Tolerances in percentage points (section 6.1 / 8.6).
export const PERCENT_SUM_TOLERANCE = 0.01;

// IRR search window (section 7.2): scan [-0.9, 1.0] with a 0.1% step to find
// every sign change, then bisect inside each bracket.
export const IRR_MIN_RATE = -0.9;
export const IRR_MAX_RATE = 1.0;
export const IRR_SCAN_STEP = 0.001;
export const IRR_MAX_BISECTIONS = 100;
export const IRR_TOLERANCE = 1e-12;

export const EM_DASH = '\u2014';

// Standard coal coefficients per GB/T 2589. Electricity uses the equivalent
// value (dang liang zhi) of 0.1229 kgce/kWh; the equivalent value (deng jia zhi)
// of roughly 0.3 kgce/kWh must be typed in by the user instead.
// Reference prices are typical mainland China levels and are only defaults.
export const ENERGY_VARIETIES = [
  {
    id: 'ELECTRICITY',
    nameKey: 'Electricity',
    unit: 'kWh',
    kgcePerUnit: 0.1229,
    referencePrice: 0.8,
  },
  { id: 'RAW_COAL', nameKey: 'Raw Coal', unit: 'kg', kgcePerUnit: 0.7143, referencePrice: 0.7 },
  { id: 'DIESEL', nameKey: 'Diesel', unit: 'kg', kgcePerUnit: 1.33, referencePrice: 8.0 },
  { id: 'GASOLINE', nameKey: 'Gasoline', unit: 'kg', kgcePerUnit: 1.4714, referencePrice: 8.5 },
  {
    id: 'NATURAL_GAS',
    nameKey: 'Natural Gas',
    unit: 'm\u00b3',
    kgcePerUnit: 1.2143,
    referencePrice: 3.0,
  },
  { id: 'HEAT', nameKey: 'Heat', unit: 'GJ', kgcePerUnit: 34.12, referencePrice: 45.0 },
];

// M&V methods, GB/T 28750-2012 clause 6.4 (section 5.1.1).
export const MV_METHODS = [
  { id: 'RATIO', labelKey: 'Ratio Normalization' },
  { id: 'REGRESSION', labelKey: 'Regression Model' },
  { id: 'DIRECT', labelKey: 'Direct Comparison' },
  { id: 'MANUAL', labelKey: 'Simulation Method' },
];

// Contract types, GB/T 24915-2020 annex A / B / C (section 5.2).
export const CONTRACT_MODES = [
  { id: 'SHARING', labelKey: 'Energy Efficiency Sharing' },
  { id: 'GUARANTEED', labelKey: 'Savings Guarantee' },
  { id: 'HOSTING', labelKey: 'Energy Cost Hosting' },
];

// Benefit price basis, GB/T 24915-2020 annex A clause 1.9 (section 5.2.1).
export const PRICE_BASES = [
  { id: 'BASE_YEAR_PRICE', labelKey: 'Baseline Year Price' },
  { id: 'REPORT_YEAR_PRICE', labelKey: 'Reporting Year Price' },
  { id: 'FIXED_PRICE', labelKey: 'Fixed Agreed Price' },
];

// Who funds the retrofit (section 6.5). The SPLIT option label reuses the
// existing investment split key so no extra locale key is needed.
export const INVESTMENT_OWNERS = [
  { id: 'ESCO', labelKey: 'ESCO View' },
  { id: 'CUSTOMER', labelKey: 'Customer View' },
  { id: 'SPLIT', labelKey: 'Investment Split (ESCO Ratio)' },
];

// Display symbol only, no exchange rate is applied (section 13.2 item 2).
export const CURRENCIES = [
  { id: 'CNY', symbol: '\u00a5' },
  { id: 'USD', symbol: '$' },
  { id: 'EUR', symbol: '\u20ac' },
  { id: 'GBP', symbol: '\u00a3' },
];

export const findVariety = id =>
  ENERGY_VARIETIES.find(item => item.id === id) || ENERGY_VARIETIES[0];

export const findCurrency = id => CURRENCIES.find(item => item.id === id) || CURRENCIES[0];

export const currencySymbol = id => findCurrency(id).symbol;

// Outside this range formatNumber switches to exponential notation, the same
// rule as the UnitConverter tool so energy magnitudes read alike everywhere.
const EXPONENTIAL_HIGH = 1e9;
const EXPONENTIAL_LOW = 1e-4;

const trimTrailingZeros = text => {
  const exponentAt = text.indexOf('e');
  const mantissa = exponentAt === -1 ? text : text.slice(0, exponentAt);
  const exponent = exponentAt === -1 ? '' : text.slice(exponentAt);
  if (mantissa.indexOf('.') === -1) return mantissa + exponent;
  return mantissa.replace(/0+$/, '').replace(/\.$/, '') + exponent;
};

// Physical energy values: six significant digits, same rule as the
// UnitConverter tool, but without the scientific notation that toPrecision(6)
// switches to from 1e6 upwards. An EMC baseline is routinely in the 1e6 - 1e8
// range and "1.1e+6 kWh" is not something an auditor copies into a report,
// while "1100000" still pastes into Excel as a number.
export const formatNumber = value => {
  if (!Number.isFinite(value)) return EM_DASH;
  if (value === 0) return '0';
  const magnitude = Math.abs(value);
  if (magnitude >= EXPONENTIAL_HIGH || magnitude < EXPONENTIAL_LOW) {
    return trimTrailingZeros(value.toExponential(5));
  }
  return String(Number(value.toPrecision(6)));
};

// Money uses grouped fixed decimals instead of significant digits: scientific
// notation in a finance table is unreadable and columns must align (7.1).
export const formatMoney = (value, symbol = '') => {
  if (!Number.isFinite(value)) return EM_DASH;
  const negative = value < 0 && Math.abs(value) >= 0.005;
  const abs = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${negative ? '-' : ''}${symbol}${abs}`;
};

export const formatPercent = (value, digits = 1) =>
  Number.isFinite(value) ? `${value.toFixed(digits)}%` : EM_DASH;

// Percent inputs are stored as percent points in the UI and divided here.
export const percentToRatio = value => (Number.isFinite(value) ? value / 100 : null);

// Parse a user typed number. Returns { value } or { error } with one of the
// codes of section 7.2 so the UI can map them onto the locale keys.
export const parseNumber = (raw, options = {}) => {
  const { allowNegative = true, required = true } = options;
  const text = typeof raw === 'string' ? raw.trim() : String(raw == null ? '' : raw);
  if (text === '') return required ? { error: 'empty' } : { value: null };
  const value = Number(text);
  if (!Number.isFinite(value)) return { error: 'nan' };
  if (Math.abs(value) > MAX_ABS_VALUE) return { error: 'tooLarge' };
  if (!allowNegative && value < 0) return { error: 'negative' };
  return { value };
};

// Year / row counts are truncated before use (7.3): a 4.5 year stage boundary
// would render a table row that cannot be labelled.
export const toInteger = raw => {
  const parsed = parseNumber(raw, { allowNegative: false });
  if (parsed.error) return parsed;
  return { value: Math.trunc(parsed.value) };
};

// Weighted average unit price helper (section 5.2.1): shares are percent
// points, the helper returns a plain ratio so it also works when the shares
// only add up to 99.99% within the tolerance.
export const weightedAveragePrice = segments => {
  const usable = (segments || []).filter(
    item => Number.isFinite(item.share) && Number.isFinite(item.price) && item.share > 0
  );
  const total = usable.reduce((sum, item) => sum + item.share, 0);
  if (total <= 0) return null;
  return usable.reduce((sum, item) => sum + item.price * item.share, 0) / total;
};
