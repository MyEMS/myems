// Unit catalogue for the Energy Unit Converter tool.
// Factors convert one unit into the base of its dimension:
//   ENERGY_UNITS -> kilojoule (kJ)
//   POWER_UNITS  -> watt (W)
// `id` is the stable ASCII key used by component state and conversion math,
// `symbol` is display-only, and `labelKey` points to an existing locale key
// when the unit needs a disambiguating name (RT vs RT-JP, PS vs hp, ...).
// Keep the array order: it is also the row order of the result table.

export const ENERGY_UNITS = [
  // 1 W.h = 3.6 kJ by definition.
  { id: 'kWh', symbol: 'kWh', factor: 3600 },
  // MWh is listed explicitly because plant-level monthly totals are reported in it.
  { id: 'MWh', symbol: 'MWh', factor: 3600000 },
  { id: 'MJ', symbol: 'MJ', factor: 1000 },
  { id: 'GJ', symbol: 'GJ', factor: 1000000 },
  // IT calorie (4.1868 kJ), not the 4.184 kJ thermochemical calorie.
  { id: 'kcal', symbol: 'kcal', factor: 4.1868 },
  // GB/T 2589-2020 equivalent value: 1 kgce = 7000 kcal = 29.3076 MJ.
  { id: 'kgce', symbol: 'kgce', factor: 29307.6, labelKey: 'Kilogram of Coal Equivalent (kgce)' },
  { id: 'tce', symbol: 'tce', factor: 29307600, labelKey: 'Ton of Coal Equivalent (tce)' },
];

export const POWER_UNITS = [
  { id: 'W', symbol: 'W', factor: 1 },
  { id: 'kW', symbol: 'kW', factor: 1000 },
  { id: 'MW', symbol: 'MW', factor: 1000000 },
  // US refrigeration ton: 12000 BTU/h, 1 BTU = 1055.05585262 J.
  { id: 'RT', symbol: 'RT', factor: 3516.85284207, labelKey: 'US Refrigeration Ton (RT)' },
  // Japanese refrigeration ton: 3320 kcal/h.
  { id: 'RT_JP', symbol: 'RT-JP', factor: 3861.16, labelKey: 'Japanese Refrigeration Ton (RT-JP)' },
  // Metric horsepower: 75 kgf.m/s.
  { id: 'PS', symbol: 'PS', factor: 735.49875, labelKey: 'Metric Horsepower (PS)' },
  // Mechanical horsepower: 550 ft.lbf/s.
  { id: 'hp', symbol: 'hp', factor: 745.69987158, labelKey: 'Mechanical Horsepower (hp)' },
  { id: 'kcal_h', symbol: 'kcal/h', factor: 1.163 },
  { id: 'BTU_h', symbol: 'BTU/h', factor: 0.29307107017 },
];

// Locale keys of the notes rendered by the reference panel, one per dimension.
// The converter's own remarks (e.g. why the air-conditioning "pi" unit is not
// offered) are covered by these two strings.
export const REFERENCE_NOTES = ['Energy Unit Note', 'Power Unit Note'];

// Energy unit the third tab (power x duration) always starts from.
export const ENERGY_BASE_ID = 'kWh';

export const findUnit = (units, id) => units.find(unit => unit.id === id) || null;
