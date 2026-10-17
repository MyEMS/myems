import gbData from './data/ampacityGB.json';

// China national standard (GB/T 16895.15 / GB 50217) implementation.
// This module owns all GB-specific numbers and models so that other
// standards (IEC, NEC, ...) can be added later without touching the UI
// or the generic calculation orchestration in ../calc.js.
const GB = {
  id: 'GB',

  getName: t => t('Standard GB'),

  // Enumerations exposed to the UI (values are i18n keys via getName/t()).
  materials: [
    { value: 'copper', labelKey: 'Copper' },
    { value: 'aluminium', labelKey: 'Aluminium' }
  ],

  insulations: [
    { value: 'PVC', labelKey: 'PVC', maxTempC: gbData.maxConductorTempC.PVC },
    { value: 'XLPE', labelKey: 'XLPE', maxTempC: gbData.maxConductorTempC.XLPE }
  ],

  // Installation methods. Each has a base derating applied to the free-air table.
  installMethods: [
    { value: 'air', labelKey: 'Method In Free Air', baseFactor: 1.0 },
    { value: 'conduit', labelKey: 'Method In Conduit', baseFactor: 0.7 },
    { value: 'buried', labelKey: 'Method Direct Buried', baseFactor: 0.95 }
  ],

  coresOptions: [
    { value: 2, labelKey: '2 Cores' },
    { value: 3, labelKey: '3 Cores' },
    { value: 4, labelKey: '4 Cores' },
    { value: 5, labelKey: '5 Cores' }
  ],

  // Default allowed voltage drop percentages (lighting / power), configurable in UI.
  defaultAllowedDropPercent: { lighting: 3, power: 5 },

  defaultVoltageV: { single: 220, three: 380 },

  // Reference ambient temperature (C) per installation method.
  getReferenceAmbientC(method) {
    return gbData.referenceAmbientC[method] != null ? gbData.referenceAmbientC[method] : 30;
  },

  // Maximum conductor temperature (C) for the insulation type.
  getMaxConductorTempC(insulation) {
    return gbData.maxConductorTempC[insulation] != null ? gbData.maxConductorTempC[insulation] : 70;
  },

  _methodConfig(method) {
    return this.installMethods.find(m => m.value === method) || this.installMethods[0];
  },

  // Return [{ section, baseAmpacity }] sorted by ascending section.
  getSections(material, insulation, method) {
    const mat = gbData.materials[material];
    if (!mat || !mat.airAmpacity) {
      console.warn(`Invalid material or missing ampacity data: ${material}`);
      return [];
    }
    const airAmpacity = mat.airAmpacity;
    const table = airAmpacity[insulation] || airAmpacity.PVC;
    if (!table) {
      console.warn(`No ampacity table found for material=${material}, insulation=${insulation}`);
      return [];
    }
    const baseFactor = this._methodConfig(method).baseFactor;
    return gbData.sections_mm2.map((section, i) => ({
      section,
      baseAmpacity: table[i] * baseFactor
    }));
  },

  // Temperature correction factor: sqrt((Tmax - Ta) / (Tmax - Tref)).
  getTempCorrectionFactor(insulation, method, ambientTaC) {
    const tmax = this.getMaxConductorTempC(insulation);
    const tref = this.getReferenceAmbientC(method);
    if (tmax - ambientTaC <= 0) return 0;
    return Math.sqrt((tmax - ambientTaC) / (tmax - tref));
  },

  // Core-count derating (relative to a 4-core cable base).
  getCoreFactor(cores) {
    const factors = { 2: 1.1, 3: 1.05, 4: 1.0, 5: 0.95 };
    return factors[cores] != null ? factors[cores] : 1.0;
  },

  // Grouping (parallel circuits) derating factor.
  getGroupingFactor(circuits) {
    const n = Math.max(1, parseInt(circuits, 10) || 1);
    if (n === 1) return 1.0;
    if (n === 2) return 0.85;
    if (n === 3) return 0.82;
    if (n === 4) return 0.8;
    if (n === 5) return 0.79;
    if (n === 6) return 0.78;
    if (n <= 9) return 0.76;
    return 0.75;
  },

  // Soil thermal resistivity correction (direct buried only), default 1.0.
  getSoilFactor(method, soilResistivity) {
    if (method !== 'buried') return 1.0;
    const r = Number(soilResistivity);
    if (!r || r <= 0) return 1.0;
    // Representative correction for resistivity 2.5 K.m/W nominal.
    return Math.sqrt(2.5 / r);
  },

  // Conductor resistance (ohm/km) at the operating temperature.
  getResistanceOhmPerKm(material, section, tempC) {
    const mat = gbData.materials[material] || gbData.materials.copper;
    const r20 = (mat.resistivity20Ohmmmm2PerM * 1000) / section;
    return r20 * (1 + mat.tempCoefficientPerC * (tempC - 20));
  },

  // Representative per-length reactance (ohm/km) for LV cables.
  getReactanceOhmPerKm() {
    return 0.08;
  },

  // Thermal stability constant K (A*s^0.5 / mm2).
  getThermalStabilityK(material, insulation) {
    const mat = gbData.materials[material] || gbData.materials.copper;
    return mat.thermalStabilityK[insulation] || mat.thermalStabilityK.PVC;
  },

  checks: ['ampacity', 'voltageDrop', 'thermalStability']
};

export default GB;
