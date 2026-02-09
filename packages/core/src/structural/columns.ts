import type { EndCondition, EulerBucklingResult, SlendernessRatioResult, ColumnClassification } from './types';

const K_FACTORS: Record<EndCondition, number> = {
  'pinned-pinned': 1.0,
  'fixed-free': 2.0,
  'fixed-pinned': 0.7,
  'fixed-fixed': 0.5,
};

/**
 * Euler's critical buckling load: Pcr = π²EI / Le²
 * Le = K * L (effective length)
 */
export function eulerBuckling(
  E: number,
  I: number,
  length: number,
  endCondition: EndCondition
): EulerBucklingResult {
  if (E <= 0) throw new Error('Elastic modulus must be positive');
  if (I <= 0) throw new Error('Moment of inertia must be positive');
  if (length <= 0) throw new Error('Length must be positive');

  const K = K_FACTORS[endCondition];
  if (K === undefined) {
    throw new Error(`Unknown end condition: ${endCondition}. Use: pinned-pinned, fixed-free, fixed-pinned, fixed-fixed`);
  }

  const Le = K * length;
  const Pcr = (Math.PI * Math.PI * E * I) / (Le * Le);

  return {
    elasticModulus: E,
    momentOfInertia: I,
    length,
    endCondition,
    effectiveLengthFactor: K,
    effectiveLength: Le,
    criticalLoad: Pcr,
    unit: 'N',
  };
}

/**
 * Slenderness ratio: λ = Le / r
 * Classification: short (< 30), intermediate (30-120), long (> 120)
 */
export function slendernessRatio(
  effectiveLength: number,
  radiusOfGyration: number
): SlendernessRatioResult {
  if (effectiveLength <= 0) throw new Error('Effective length must be positive');
  if (radiusOfGyration <= 0) throw new Error('Radius of gyration must be positive');

  const ratio = effectiveLength / radiusOfGyration;

  let classification: ColumnClassification;
  if (ratio < 30) {
    classification = 'short';
  } else if (ratio <= 120) {
    classification = 'intermediate';
  } else {
    classification = 'long';
  }

  return {
    effectiveLength,
    radiusOfGyration,
    slendernessRatio: ratio,
    classification,
  };
}
