import type {
  TerzaghiBearingResult,
  LateralEarthPressureResult,
  SettlementResult,
  FoundationType,
  EarthPressureType,
} from './types';

/**
 * General bearing capacity factors (Meyerhof/Reissner/Vesic formulation).
 * Nq from Reissner (1924), Nc from Prandtl (1921), Nγ from Vesic (1973).
 * These are the most widely used factors in modern geotechnical practice.
 */
function bearingCapacityFactors(frictionAngleDeg: number): { Nc: number; Nq: number; Ngamma: number } {
  const phi = (frictionAngleDeg * Math.PI) / 180;

  // Nq = tan²(45 + φ/2) · e^(π·tanφ)  (Reissner, 1924)
  const tan45half = Math.tan(Math.PI / 4 + phi / 2);
  const Nq = tan45half * tan45half * Math.exp(Math.PI * Math.tan(phi));

  // Nc = (Nq - 1) · cot(φ)  (Prandtl, 1921; for φ > 0)
  let Nc: number;
  if (frictionAngleDeg === 0) {
    Nc = 5.14; // Prandtl's exact value: (2 + π)
  } else {
    Nc = (Nq - 1) / Math.tan(phi);
  }

  // Nγ = 2(Nq + 1)·tan(φ) (Vesic, 1973 approximation)
  const Ngamma = 2 * (Nq + 1) * Math.tan(phi);

  return { Nc, Nq, Ngamma };
}

/**
 * Bearing capacity for shallow foundations using Terzaghi's equation form
 * with Meyerhof/Vesic bearing capacity factors.
 * q_ult = c·Nc·sc + γ·D·Nq + 0.5·γ·B·Nγ·sγ
 * Shape factors: strip (1, 1), square (1.3, 0.8), circular (1.3, 0.6)
 */
export function terzaghiBearing(
  cohesion: number,
  depth: number,
  unitWeight: number,
  frictionAngle: number,
  foundationType: FoundationType
): TerzaghiBearingResult {
  if (cohesion < 0) throw new Error('Cohesion must be non-negative');
  if (depth < 0) throw new Error('Depth must be non-negative');
  if (unitWeight <= 0) throw new Error('Unit weight must be positive');
  if (frictionAngle < 0 || frictionAngle > 50) throw new Error('Friction angle must be between 0 and 50 degrees');

  const { Nc, Nq, Ngamma } = bearingCapacityFactors(frictionAngle);

  let sc: number;
  let sgamma: number;
  switch (foundationType) {
    case 'strip':
      sc = 1.0;
      sgamma = 1.0;
      break;
    case 'square':
      sc = 1.3;
      sgamma = 0.8;
      break;
    case 'circular':
      sc = 1.3;
      sgamma = 0.6;
      break;
    default:
      throw new Error(`Unknown foundation type: ${foundationType}. Use: strip, square, circular`);
  }

  // q_ult = c·Nc·sc + γ·D·Nq + 0.5·γ·B·Nγ·sγ
  // For general formula, B is treated as unit width
  const bearingCapacity = cohesion * Nc * sc + unitWeight * depth * Nq + 0.5 * unitWeight * 1.0 * Ngamma * sgamma;

  return {
    cohesion,
    depth,
    unitWeight,
    frictionAngle,
    foundationType,
    bearingCapacity,
    Nc,
    Nq,
    Ngamma,
    unit: 'Pa',
  };
}

/**
 * Rankine lateral earth pressure.
 * Active: Ka = tan²(45° - φ/2)
 * Passive: Kp = tan²(45° + φ/2)
 * At-rest: K0 = 1 - sin(φ) (Jaky's formula)
 */
export function lateralEarthPressure(
  unitWeight: number,
  height: number,
  frictionAngle: number,
  pressureType: EarthPressureType
): LateralEarthPressureResult {
  if (unitWeight <= 0) throw new Error('Unit weight must be positive');
  if (height <= 0) throw new Error('Height must be positive');
  if (frictionAngle < 0 || frictionAngle > 50) throw new Error('Friction angle must be between 0 and 50 degrees');

  const phi = (frictionAngle * Math.PI) / 180;
  let coefficient: number;

  switch (pressureType) {
    case 'active':
      coefficient = Math.pow(Math.tan(Math.PI / 4 - phi / 2), 2);
      break;
    case 'passive':
      coefficient = Math.pow(Math.tan(Math.PI / 4 + phi / 2), 2);
      break;
    case 'at-rest':
      coefficient = 1 - Math.sin(phi);
      break;
    default:
      throw new Error(`Unknown pressure type: ${pressureType}. Use: active, passive, at-rest`);
  }

  const pressureAtBase = coefficient * unitWeight * height;
  const totalForce = 0.5 * pressureAtBase * height;

  return {
    unitWeight,
    height,
    frictionAngle,
    pressureType,
    coefficient,
    pressureAtBase,
    totalForce,
    pressureUnit: 'Pa',
    forceUnit: 'N/m',
  };
}

/**
 * Elastic settlement: δ = (q · H) / E
 * where q = P / A is the applied stress.
 */
export function settlement(
  load: number,
  area: number,
  elasticModulus: number,
  thickness: number
): SettlementResult {
  if (load < 0) throw new Error('Load must be non-negative');
  if (area <= 0) throw new Error('Area must be positive');
  if (elasticModulus <= 0) throw new Error('Elastic modulus must be positive');
  if (thickness <= 0) throw new Error('Thickness must be positive');

  const stress = load / area;
  const settl = (stress * thickness) / elasticModulus;

  return {
    load,
    area,
    elasticModulus,
    thickness,
    stress,
    settlement: settl,
    unit: 'm',
  };
}
