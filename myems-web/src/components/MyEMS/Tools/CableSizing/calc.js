// Generic cable sizing engine. It is standard-agnostic: every numeric model is
// obtained from the passed-in `standard` strategy object (see cableStandards/*).

const round = (value, digits = 2) => {
  const factor = Math.pow(10, digits);
  return Math.round((Number(value) || 0) * factor) / factor;
};

// Continuous load current Ib (A).
export function computeDesignCurrent(params) {
  const { inputMode, phaseType, powerkW, voltageV, powerFactor, designCurrentA } = params;
  if (inputMode === 'current') {
    return Math.max(0, Number(designCurrentA) || 0);
  }
  const pf = Number(powerFactor) > 0 ? Number(powerFactor) : 1;
  const power = Math.max(0, Number(powerkW) || 0) * 1000;
  const voltage = Math.max(1, Number(voltageV) || standard_defaultVoltage(phaseType));
  if (phaseType === 'three') {
    return power / (Math.sqrt(3) * voltage * pf);
  }
  return power / (voltage * pf);
}

function standard_defaultVoltage(phaseType) {
  return phaseType === 'three' ? 380 : 220;
}

// Voltage drop percentage for one candidate section.
export function computeVoltageDropPercent(params) {
  const { standard, current, lengthM, phaseType, voltageV, powerFactor, material, section, insulation } = params;
  const pf = Number(powerFactor) > 0 ? Number(powerFactor) : 1;
  const sinPhi = Math.sqrt(Math.max(0, 1 - pf * pf));
  const tmax = standard.getMaxConductorTempC(insulation);
  const r = standard.getResistanceOhmPerKm(material, section, tmax);
  const x = standard.getReactanceOhmPerKm(section, phaseType);
  const unit = r * pf + x * sinPhi; // ohm/km (per-phase effective)
  const lengthKm = Math.max(0, Number(lengthM) || 0) / 1000;
  const lineFactor = phaseType === 'three' ? Math.sqrt(3) : 2;
  const dU = lineFactor * current * lengthKm * unit;
  const v = Math.max(1, Number(voltageV) || standard_defaultVoltage(phaseType));
  return (dU / v) * 100;
}

// Minimum cross-section meeting the thermal-stability requirement (optional check).
// S >= (Ik * sqrt(t)) / K
export function computeThermalStabilityMinSection(standard, params) {
  const { material, insulation, shortCircuitCurrentA, clearingTimeS } = params;
  const ik = Number(shortCircuitCurrentA) || 0;
  const t = Number(clearingTimeS) || 0;
  if (ik <= 0 || t <= 0) return null;
  const k = standard.getThermalStabilityK(material, insulation);
  return (ik * Math.sqrt(t)) / k;
}

// Main selection: iterate sections ascending, return the first that satisfies all
// enabled checks plus a per-section evaluation trail.
export function selectCable(standard, params) {
  const {
    material,
    insulation,
    method,
    cores,
    ambientTaC,
    circuits,
    soilResistivity,
    phaseType,
    voltageV,
    powerFactor,
    lengthM,
    breakerInA,
    allowedDropPercent,
    enableThermalStability,
    shortCircuitCurrentA,
    clearingTimeS
  } = params;

  const ib = computeDesignCurrent(params);
  const inCurrent = Math.max(0, Number(breakerInA) || 0);

  const kt = standard.getTempCorrectionFactor(insulation, method, ambientTaC);
  const kc = standard.getCoreFactor(cores);
  const kg = standard.getGroupingFactor(circuits);
  const ks = standard.getSoilFactor(method, soilResistivity);
  const correction = kt * kc * kg * ks;

  const minThermalSection = enableThermalStability
    ? computeThermalStabilityMinSection(standard, { material, insulation, shortCircuitCurrentA, clearingTimeS })
    : null;

  const sections = standard.getSections(material, insulation, method);
  const evaluation = [];
  let recommendation = null;

  for (const row of sections) {
    const izCorrected = row.baseAmpacity * correction;
    const ampacityOk = ib > 0 && ib <= izCorrected && (inCurrent === 0 || inCurrent <= izCorrected);
    const dropPercent = computeVoltageDropPercent({
      standard,
      current: ib,
      lengthM,
      phaseType,
      voltageV,
      powerFactor,
      material,
      section: row.section,
      insulation
    });
    const allowed = Number(allowedDropPercent) > 0 ? Number(allowedDropPercent) : standard.defaultAllowedDropPercent.power;
    const dropOk = dropPercent <= allowed;
    const thermalOk = minThermalSection == null ? true : row.section >= minThermalSection;

    const passed = ampacityOk && dropOk && thermalOk;
    evaluation.push({
      section: row.section,
      baseAmpacity: round(row.baseAmpacity, 1),
      izCorrected: round(izCorrected, 1),
      dropPercent: round(dropPercent, 3),
      ampacityOk,
      dropOk,
      thermalOk,
      passed
    });

    if (passed && !recommendation) {
      recommendation = {
        section: row.section,
        izCorrected: round(izCorrected, 1),
        dropPercent: round(dropPercent, 3),
        allowedDropPercent: allowed
      };
    }
  }

  return {
    ib: round(ib, 2),
    breakerInA: inCurrent,
    factors: {
      kt: round(kt, 3),
      kc: round(kc, 3),
      kg: round(kg, 3),
      ks: round(ks, 3),
      total: round(correction, 3)
    },
    minThermalSection: minThermalSection == null ? null : round(minThermalSection, 2),
    allowedDropPercent: Number(allowedDropPercent) > 0 ? Number(allowedDropPercent) : standard.defaultAllowedDropPercent.power,
    recommendation,
    evaluation
  };
}
