import type { BeamResult, CantileverResult, BeamLoadType, CantileverLoadType } from './types';

/**
 * Simply supported beam analysis.
 * Returns reactions, max moment, max shear, and max deflection (if E and I provided).
 */
export function simplySupported(
  length: number,
  load: number,
  loadType: BeamLoadType,
  E?: number,
  I?: number,
  loadPosition?: number
): BeamResult {
  if (length <= 0) throw new Error('Length must be positive');
  if (load < 0) throw new Error('Load must be non-negative');

  let reactionLeft: number;
  let reactionRight: number;
  let maxMoment: number;
  let maxShear: number;
  let maxDeflection: number | null = null;

  const L = length;
  const P = load;

  switch (loadType) {
    case 'point-center': {
      reactionLeft = P / 2;
      reactionRight = P / 2;
      maxMoment = (P * L) / 4;
      maxShear = P / 2;
      if (E && I) {
        maxDeflection = (P * L * L * L) / (48 * E * I);
      }
      break;
    }
    case 'point-custom': {
      const a = loadPosition ?? L / 2;
      if (a < 0 || a > L) throw new Error('Load position must be between 0 and length');
      const b = L - a;
      reactionLeft = (P * b) / L;
      reactionRight = (P * a) / L;
      maxMoment = (P * a * b) / L;
      maxShear = Math.max(reactionLeft, reactionRight);
      if (E && I) {
        // Approximate max deflection for off-center load
        maxDeflection = (P * a * b * (a + 2 * b) * Math.sqrt(3 * a * (a + 2 * b))) / (27 * E * I * L);
      }
      break;
    }
    case 'uniform': {
      // w = total load / length (UDL intensity)
      const w = P / L;
      reactionLeft = P / 2;
      reactionRight = P / 2;
      maxMoment = (w * L * L) / 8;
      maxShear = P / 2;
      if (E && I) {
        maxDeflection = (5 * w * L * L * L * L) / (384 * E * I);
      }
      break;
    }
    case 'triangular': {
      // Triangular load from 0 at left to w_max at right, total load = w_max * L / 2 = P
      const wMax = (2 * P) / L;
      reactionLeft = P / 3;
      reactionRight = (2 * P) / 3;
      // Max moment occurs at x = L/√3 from left
      const xMax = L / Math.sqrt(3);
      maxMoment = (wMax * xMax * xMax * xMax) / (6 * L) + reactionLeft * xMax - (wMax * xMax * xMax) / (6 * L);
      // Simplified: M_max = wL²/9√3
      maxMoment = (wMax * L * L) / (9 * Math.sqrt(3));
      maxShear = (2 * P) / 3;
      if (E && I) {
        maxDeflection = (P * L * L * L) / (60 * E * I);
      }
      break;
    }
    default:
      throw new Error(`Unknown load type: ${loadType}. Use: point-center, point-custom, uniform, triangular`);
  }

  return {
    length,
    load,
    loadType,
    reactionLeft,
    reactionRight,
    maxMoment,
    maxShear,
    maxDeflection,
    momentUnit: 'N·m',
    shearUnit: 'N',
    deflectionUnit: maxDeflection !== null ? 'm' : null,
  };
}

/**
 * Cantilever beam analysis.
 * Returns reaction force, reaction moment, max moment, max shear, and max deflection (if E and I provided).
 */
export function cantilever(
  length: number,
  load: number,
  loadType: CantileverLoadType,
  E?: number,
  I?: number,
  loadPosition?: number
): CantileverResult {
  if (length <= 0) throw new Error('Length must be positive');
  if (load < 0) throw new Error('Load must be non-negative');

  let reactionForce: number;
  let reactionMoment: number;
  let maxMoment: number;
  let maxShear: number;
  let maxDeflection: number | null = null;

  const L = length;
  const P = load;

  switch (loadType) {
    case 'point-end': {
      reactionForce = P;
      reactionMoment = P * L;
      maxMoment = P * L;
      maxShear = P;
      if (E && I) {
        maxDeflection = (P * L * L * L) / (3 * E * I);
      }
      break;
    }
    case 'point-custom': {
      const a = loadPosition ?? L;
      if (a < 0 || a > L) throw new Error('Load position must be between 0 and length');
      reactionForce = P;
      reactionMoment = P * a;
      maxMoment = P * a;
      maxShear = P;
      if (E && I) {
        maxDeflection = (P * a * a * (3 * L - a)) / (6 * E * I);
      }
      break;
    }
    case 'uniform': {
      const w = P / L;
      reactionForce = P;
      reactionMoment = (w * L * L) / 2;
      maxMoment = (w * L * L) / 2;
      maxShear = P;
      if (E && I) {
        maxDeflection = (w * L * L * L * L) / (8 * E * I);
      }
      break;
    }
    default:
      throw new Error(`Unknown load type: ${loadType}. Use: point-end, point-custom, uniform`);
  }

  return {
    length,
    load,
    loadType,
    reactionForce,
    reactionMoment,
    maxMoment,
    maxShear,
    maxDeflection,
    momentUnit: 'N·m',
    shearUnit: 'N',
    deflectionUnit: maxDeflection !== null ? 'm' : null,
  };
}
