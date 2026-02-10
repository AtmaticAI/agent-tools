import type {
  NormalStressResult,
  ShearStressResult,
  StrainResult,
  YoungsModulusResult,
  FactorOfSafetyResult,
  HoopStressResult,
} from './types';

/**
 * Normal stress: σ = F / A
 */
export function normalStress(force: number, area: number): NormalStressResult {
  if (area <= 0) throw new Error('Area must be positive');
  const stress = force / area;
  return { force, area, stress, unit: 'Pa' };
}

/**
 * Shear stress: τ = V / A
 */
export function shearStress(force: number, area: number): ShearStressResult {
  if (area <= 0) throw new Error('Area must be positive');
  const stress = force / area;
  return { force, area, stress, unit: 'Pa' };
}

/**
 * Strain: ε = ΔL / L
 */
export function strain(deltaLength: number, originalLength: number): StrainResult {
  if (originalLength <= 0) throw new Error('Original length must be positive');
  const s = deltaLength / originalLength;
  return { deltaLength, originalLength, strain: s, unit: 'dimensionless' };
}

/**
 * Young's modulus: E = σ / ε
 */
export function youngsModulus(stress: number, strainVal: number): YoungsModulusResult {
  if (strainVal === 0) throw new Error('Strain must be non-zero');
  const E = stress / strainVal;
  return { stress, strain: strainVal, youngsModulus: E, unit: 'Pa' };
}

/**
 * Factor of safety: FoS = σ_ultimate / σ_working
 */
export function factorOfSafety(ultimateStress: number, workingStress: number): FactorOfSafetyResult {
  if (workingStress === 0) throw new Error('Working stress must be non-zero');
  if (ultimateStress < 0) throw new Error('Ultimate stress must be non-negative');
  if (workingStress < 0) throw new Error('Working stress must be positive');
  const fos = ultimateStress / workingStress;
  return { ultimateStress, workingStress, factorOfSafety: fos };
}

/**
 * Hoop stress for thin-walled pressure vessels:
 * σ_hoop = pR / t
 * σ_longitudinal = pR / (2t)
 */
export function hoopStress(pressure: number, radius: number, thickness: number): HoopStressResult {
  if (pressure < 0) throw new Error('Pressure must be non-negative');
  if (radius <= 0) throw new Error('Radius must be positive');
  if (thickness <= 0) throw new Error('Thickness must be positive');
  const hoop = (pressure * radius) / thickness;
  const longitudinal = (pressure * radius) / (2 * thickness);
  return { pressure, radius, thickness, hoopStress: hoop, longitudinalStress: longitudinal, unit: 'Pa' };
}
