import { describe, it, expect } from 'vitest';
import { normalStress, shearStress, strain, youngsModulus, factorOfSafety, hoopStress } from '../structural/stress';

describe('normalStress', () => {
  it('should calculate σ = F/A', () => {
    const result = normalStress(1000, 0.01);
    expect(result.stress).toBeCloseTo(100000, 0);
    expect(result.unit).toBe('Pa');
  });

  it('should handle tensile (positive) force', () => {
    const result = normalStress(5000, 0.005);
    expect(result.stress).toBeCloseTo(1e6, 0);
  });

  it('should handle compressive (negative) force', () => {
    const result = normalStress(-5000, 0.005);
    expect(result.stress).toBeCloseTo(-1e6, 0);
  });

  it('should throw for zero area', () => {
    expect(() => normalStress(100, 0)).toThrow('positive');
  });

  it('should throw for negative area', () => {
    expect(() => normalStress(100, -0.01)).toThrow('positive');
  });
});

describe('shearStress', () => {
  it('should calculate τ = V/A', () => {
    const result = shearStress(500, 0.02);
    expect(result.stress).toBeCloseTo(25000, 0);
    expect(result.unit).toBe('Pa');
  });

  it('should throw for zero area', () => {
    expect(() => shearStress(100, 0)).toThrow('positive');
  });
});

describe('strain', () => {
  it('should calculate ε = ΔL/L', () => {
    const result = strain(0.002, 2.0);
    expect(result.strain).toBeCloseTo(0.001, 6);
    expect(result.unit).toBe('dimensionless');
  });

  it('should handle negative deltaLength (compression)', () => {
    const result = strain(-0.005, 1.0);
    expect(result.strain).toBeCloseTo(-0.005, 6);
  });

  it('should throw for zero original length', () => {
    expect(() => strain(0.001, 0)).toThrow('positive');
  });
});

describe('youngsModulus', () => {
  it('should calculate E = σ/ε', () => {
    // Steel: E ≈ 200 GPa, stress = 200 MPa, strain = 0.001
    const result = youngsModulus(200e6, 0.001);
    expect(result.youngsModulus).toBeCloseTo(200e9, -6);
    expect(result.unit).toBe('Pa');
  });

  it('should throw for zero strain', () => {
    expect(() => youngsModulus(100e6, 0)).toThrow('non-zero');
  });
});

describe('factorOfSafety', () => {
  it('should calculate FoS = σ_ult / σ_work', () => {
    const result = factorOfSafety(400e6, 200e6);
    expect(result.factorOfSafety).toBeCloseTo(2.0, 4);
  });

  it('should handle FoS < 1 (unsafe)', () => {
    const result = factorOfSafety(200e6, 300e6);
    expect(result.factorOfSafety).toBeCloseTo(0.6667, 3);
  });

  it('should throw for zero working stress', () => {
    expect(() => factorOfSafety(400e6, 0)).toThrow('non-zero');
  });

  it('should throw for negative ultimate stress', () => {
    expect(() => factorOfSafety(-100, 50)).toThrow('non-negative');
  });
});

describe('hoopStress', () => {
  it('should calculate hoop stress σ = pR/t', () => {
    // Pressure vessel: p=1 MPa, R=0.5m, t=0.01m
    const result = hoopStress(1e6, 0.5, 0.01);
    expect(result.hoopStress).toBeCloseTo(50e6, 0);
    expect(result.longitudinalStress).toBeCloseTo(25e6, 0);
    expect(result.unit).toBe('Pa');
  });

  it('should have longitudinal = half of hoop', () => {
    const result = hoopStress(2e6, 1.0, 0.02);
    expect(result.longitudinalStress).toBeCloseTo(result.hoopStress / 2, 4);
  });

  it('should throw for negative pressure', () => {
    expect(() => hoopStress(-1, 0.5, 0.01)).toThrow('non-negative');
  });

  it('should throw for zero radius', () => {
    expect(() => hoopStress(1e6, 0, 0.01)).toThrow('positive');
  });

  it('should throw for zero thickness', () => {
    expect(() => hoopStress(1e6, 0.5, 0)).toThrow('positive');
  });
});
