// Pure conversion helpers for the Energy Unit Converter tool.
// No UI or i18n dependencies so this module stays unit-testable and reusable.
// Every conversion goes through the dimension base (kJ / W), which is the only
// place factors are applied, so adding a unit only needs a factor in units.js.
import { ENERGY_UNITS, ENERGY_BASE_ID, POWER_UNITS, findUnit } from './units';

// Rejected above this length so a pasted value cannot overflow the input row.
export const MAX_INPUT_LENGTH = 32;

// Rejected above this magnitude: beyond 1e15 six significant digits no longer
// say anything useful and the result table would only show an exponent.
export const MAX_ABS_VALUE = 1e15;

// Outside this range the formatter switches to exponential notation.
const EXPONENTIAL_HIGH = 1e9;
const EXPONENTIAL_LOW = 1e-4;

export const toBase = (value, unit) => value * unit.factor;

export const convert = (value, fromUnit, toUnit) => toBase(value, fromUnit) / toUnit.factor;

// Convert a value between two unit ids of the same dimension.
// Returns null when either id is unknown so the UI can degrade silently.
export const convertBetween = (value, fromId, toId, units) => {
  const fromUnit = findUnit(units, fromId);
  const toUnit = findUnit(units, toId);
  if (!fromUnit || !toUnit) return null;
  return convert(value, fromUnit, toUnit);
};

// Convert a value into every unit of the list, preserving the list order.
// Each row keeps the id and symbol so the table needs no further lookups.
export const convertAll = (value, fromId, units) => {
  const fromUnit = findUnit(units, fromId);
  if (!fromUnit) return null;
  return units.map(unit => ({
    id: unit.id,
    symbol: unit.symbol,
    value: convert(value, fromUnit, unit),
  }));
};

// Power x duration -> energy. Power is normalised to kW first so the product
// with hours lands directly in kWh; the caller converts it to other units.
export const energyFromPower = (powerValue, powerUnitId, hours) => {
  const powerUnit = findUnit(POWER_UNITS, powerUnitId);
  if (!powerUnit) return null;
  return (toBase(powerValue, powerUnit) / 1000) * hours;
};

// Ready-to-render rows for the third tab.
export const convertAllFromPower = (powerValue, powerUnitId, hours) => {
  const energyKWh = energyFromPower(powerValue, powerUnitId, hours);
  if (energyKWh == null) return null;
  return convertAll(energyKWh, ENERGY_BASE_ID, ENERGY_UNITS);
};

// Trim the trailing zeros (and a bare trailing dot) of toPrecision/toExponential
// output while keeping any exponent suffix untouched.
const trimTrailingZeros = text => {
  const exponentAt = text.indexOf('e');
  const mantissa = exponentAt === -1 ? text : text.slice(0, exponentAt);
  const exponent = exponentAt === -1 ? '' : text.slice(exponentAt);
  if (mantissa.indexOf('.') === -1) return mantissa + exponent;
  return mantissa.replace(/0+$/, '').replace(/\.$/, '') + exponent;
};

// Six significant digits, trailing zeros trimmed, no thousands separator, so
// the table cell, the copied text and the dev-plan matrix always show the same
// string. `-0` is normalised to `0`.
export const formatNumber = value => {
  if (!Number.isFinite(value)) return '\u2014';
  if (value === 0) return '0';
  const magnitude = Math.abs(value);
  const text =
    magnitude >= EXPONENTIAL_HIGH || magnitude < EXPONENTIAL_LOW
      ? value.toExponential(5)
      : value.toPrecision(6);
  return trimTrailingZeros(text);
};

// Parse a user-typed number. Non-numeric and non-finite input is reported
// instead of silently becoming 0, so the result area can show a hint.
// Returns { value } or { error: 'empty' | 'nan' | 'tooLarge' }.
export const parseInput = raw => {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (text === '') return { error: 'empty' };
  const value = Number(text);
  if (!Number.isFinite(value)) return { error: 'nan' };
  if (Math.abs(value) > MAX_ABS_VALUE) return { error: 'tooLarge' };
  return { value };
};

// Duration shares the numeric rules but must not be negative; 0 is valid and
// yields 0 kWh instead of an error.
// Returns { value } or { error: 'empty' | 'nan' | 'tooLarge' | 'durationInvalid' }.
export const parseDuration = raw => {
  const parsed = parseInput(raw);
  if (parsed.error) return parsed;
  if (parsed.value < 0) return { error: 'durationInvalid' };
  return parsed;
};
