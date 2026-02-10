import { describe, it, expect } from 'vitest';
import { terzaghiBearing, lateralEarthPressure, settlement } from '../structural/soils';

describe('terzaghiBearing', () => {
  it('should calculate bearing capacity for strip foundation', () => {
    // Cohesion = 20 kPa, depth = 1m, γ = 18 kN/m³, φ = 30°
    const result = terzaghiBearing(20000, 1, 18000, 30, 'strip');
    expect(result.bearingCapacity).toBeGreaterThan(0);
    expect(result.Nc).toBeGreaterThan(0);
    expect(result.Nq).toBeGreaterThan(0);
    expect(result.Ngamma).toBeGreaterThan(0);
    expect(result.unit).toBe('Pa');
  });

  it('should give higher capacity for square than strip', () => {
    const strip = terzaghiBearing(20000, 1, 18000, 30, 'strip');
    const square = terzaghiBearing(20000, 1, 18000, 30, 'square');
    expect(square.bearingCapacity).toBeGreaterThan(strip.bearingCapacity);
  });

  it('should handle purely cohesive soil (φ = 0)', () => {
    const result = terzaghiBearing(50000, 1.5, 18000, 0, 'strip');
    expect(result.Nc).toBeCloseTo(5.14, 1); // Prandtl's value (2 + π)
    expect(result.Ngamma).toBeCloseTo(0, 4);
    expect(result.bearingCapacity).toBeGreaterThan(0);
  });

  it('should increase capacity with depth', () => {
    const shallow = terzaghiBearing(20000, 0.5, 18000, 30, 'strip');
    const deep = terzaghiBearing(20000, 2.0, 18000, 30, 'strip');
    expect(deep.bearingCapacity).toBeGreaterThan(shallow.bearingCapacity);
  });

  it('should increase capacity with friction angle', () => {
    const low = terzaghiBearing(20000, 1, 18000, 10, 'strip');
    const high = terzaghiBearing(20000, 1, 18000, 40, 'strip');
    expect(high.bearingCapacity).toBeGreaterThan(low.bearingCapacity);
  });

  it('should throw for negative cohesion', () => {
    expect(() => terzaghiBearing(-1, 1, 18000, 30, 'strip')).toThrow('non-negative');
  });

  it('should throw for friction angle > 50', () => {
    expect(() => terzaghiBearing(20000, 1, 18000, 55, 'strip')).toThrow('between 0 and 50');
  });

  it('should throw for unknown foundation type', () => {
    expect(() => terzaghiBearing(20000, 1, 18000, 30, 'invalid' as never)).toThrow('Unknown foundation type');
  });
});

describe('lateralEarthPressure', () => {
  it('should calculate active earth pressure (Ka)', () => {
    // γ = 18 kN/m³, H = 5m, φ = 30°
    // Ka = tan²(45° - 15°) = tan²(30°) = 1/3
    const result = lateralEarthPressure(18000, 5, 30, 'active');
    expect(result.coefficient).toBeCloseTo(1 / 3, 3);
    expect(result.pressureAtBase).toBeCloseTo(18000 * 5 / 3, 0);
    expect(result.totalForce).toBeCloseTo(0.5 * result.pressureAtBase * 5, 0);
  });

  it('should calculate passive earth pressure (Kp)', () => {
    // Kp = tan²(45° + 15°) = tan²(60°) = 3
    const result = lateralEarthPressure(18000, 5, 30, 'passive');
    expect(result.coefficient).toBeCloseTo(3.0, 3);
  });

  it('should calculate at-rest earth pressure (K0)', () => {
    // K0 = 1 - sin(30°) = 0.5
    const result = lateralEarthPressure(18000, 5, 30, 'at-rest');
    expect(result.coefficient).toBeCloseTo(0.5, 3);
  });

  it('should satisfy Ka < K0 < Kp', () => {
    const active = lateralEarthPressure(18000, 5, 30, 'active');
    const atRest = lateralEarthPressure(18000, 5, 30, 'at-rest');
    const passive = lateralEarthPressure(18000, 5, 30, 'passive');
    expect(active.coefficient).toBeLessThan(atRest.coefficient);
    expect(atRest.coefficient).toBeLessThan(passive.coefficient);
  });

  it('should have Ka * Kp = 1 (Rankine)', () => {
    const active = lateralEarthPressure(18000, 5, 30, 'active');
    const passive = lateralEarthPressure(18000, 5, 30, 'passive');
    expect(active.coefficient * passive.coefficient).toBeCloseTo(1.0, 3);
  });

  it('should calculate total force = 0.5 * p_base * H', () => {
    const result = lateralEarthPressure(18000, 5, 30, 'active');
    expect(result.totalForce).toBeCloseTo(0.5 * result.pressureAtBase * 5, 4);
  });

  it('should throw for negative friction angle', () => {
    expect(() => lateralEarthPressure(18000, 5, -5, 'active')).toThrow('between 0 and 50');
  });

  it('should throw for unknown pressure type', () => {
    expect(() => lateralEarthPressure(18000, 5, 30, 'invalid' as never)).toThrow('Unknown pressure type');
  });
});

describe('settlement', () => {
  it('should calculate elastic settlement δ = qH/E', () => {
    // P = 100 kN, A = 1 m², E = 30 MPa, H = 2m
    // q = 100000 Pa, δ = 100000*2/30e6
    const result = settlement(100000, 1, 30e6, 2);
    expect(result.stress).toBeCloseTo(100000, 4);
    expect(result.settlement).toBeCloseTo(100000 * 2 / 30e6, 8);
    expect(result.unit).toBe('m');
  });

  it('should double settlement with double load', () => {
    const s1 = settlement(50000, 1, 30e6, 2);
    const s2 = settlement(100000, 1, 30e6, 2);
    expect(s2.settlement).toBeCloseTo(2 * s1.settlement, 8);
  });

  it('should return zero settlement for zero load', () => {
    const result = settlement(0, 1, 30e6, 2);
    expect(result.settlement).toBe(0);
  });

  it('should throw for zero area', () => {
    expect(() => settlement(100000, 0, 30e6, 2)).toThrow('positive');
  });

  it('should throw for zero elastic modulus', () => {
    expect(() => settlement(100000, 1, 0, 2)).toThrow('positive');
  });

  it('should throw for zero thickness', () => {
    expect(() => settlement(100000, 1, 30e6, 0)).toThrow('positive');
  });
});
