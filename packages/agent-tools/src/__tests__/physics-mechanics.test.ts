import { describe, it, expect } from 'vitest';
import { calculateForce, calculateEnergy, gravitationalForce, calculateMomentum, orbitalMechanics, calculateWork } from '../physics/mechanics';

describe('calculateForce', () => {
  it('should calculate F = ma', () => {
    const result = calculateForce(10, 9.8);
    expect(result.force).toBeCloseTo(98, 4);
    expect(result.unit).toBe('N');
  });

  it('should handle zero mass', () => {
    const result = calculateForce(0, 10);
    expect(result.force).toBe(0);
  });

  it('should handle negative acceleration', () => {
    const result = calculateForce(5, -3);
    expect(result.force).toBeCloseTo(-15, 4);
  });

  it('should throw for negative mass', () => {
    expect(() => calculateForce(-1, 10)).toThrow('non-negative');
  });
});

describe('calculateEnergy', () => {
  it('should calculate kinetic energy', () => {
    const result = calculateEnergy(10, 5);
    expect(result.kineticEnergy).toBeCloseTo(125, 4);
    expect(result.potentialEnergy).toBe(0);
    expect(result.totalEnergy).toBeCloseTo(125, 4);
  });

  it('should calculate potential energy with height', () => {
    const result = calculateEnergy(10, 0, 20);
    expect(result.kineticEnergy).toBe(0);
    expect(result.potentialEnergy).toBeCloseTo(1961.33, 0);
    expect(result.totalEnergy).toBeCloseTo(1961.33, 0);
  });

  it('should sum KE and PE', () => {
    const result = calculateEnergy(10, 5, 10);
    expect(result.totalEnergy).toBeCloseTo(result.kineticEnergy + result.potentialEnergy, 4);
  });

  it('should throw for negative mass', () => {
    expect(() => calculateEnergy(-1, 5)).toThrow('non-negative');
  });
});

describe('gravitationalForce', () => {
  it('should calculate gravitational force between Earth and Moon', () => {
    const result = gravitationalForce(5.972e24, 7.342e22, 3.844e8);
    expect(result.force).toBeCloseTo(1.982e20, -18);
    expect(result.unit).toBe('N');
  });

  it('should throw for zero distance', () => {
    expect(() => gravitationalForce(1, 1, 0)).toThrow('positive');
  });

  it('should throw for negative distance', () => {
    expect(() => gravitationalForce(1, 1, -5)).toThrow('positive');
  });

  it('should throw for negative mass', () => {
    expect(() => gravitationalForce(-1, 1, 1)).toThrow('non-negative');
  });
});

describe('calculateMomentum', () => {
  it('should calculate p = mv', () => {
    const result = calculateMomentum(10, 5);
    expect(result.momentum).toBe(50);
    expect(result.unit).toBe('kg·m/s');
  });

  it('should handle negative velocity', () => {
    const result = calculateMomentum(10, -5);
    expect(result.momentum).toBe(-50);
  });

  it('should throw for negative mass', () => {
    expect(() => calculateMomentum(-1, 5)).toThrow('non-negative');
  });
});

describe('orbitalMechanics', () => {
  it('should calculate orbital and escape velocity for Earth', () => {
    const result = orbitalMechanics(5.972e24, 6.371e6);
    expect(result.orbitalVelocity).toBeCloseTo(7910, -1);
    expect(result.escapeVelocity).toBeCloseTo(11186, -1);
    expect(result.escapeVelocity).toBeCloseTo(result.orbitalVelocity * Math.sqrt(2), 0);
  });

  it('should throw for non-positive radius', () => {
    expect(() => orbitalMechanics(1e24, 0)).toThrow('positive');
    expect(() => orbitalMechanics(1e24, -1)).toThrow('positive');
  });

  it('should throw for negative mass', () => {
    expect(() => orbitalMechanics(-1, 1e6)).toThrow('non-negative');
  });
});

describe('calculateWork', () => {
  it('should calculate work with no angle', () => {
    const result = calculateWork(100, 5);
    expect(result.work).toBeCloseTo(500, 4);
    expect(result.unit).toBe('J');
  });

  it('should calculate work at 60 degrees', () => {
    const result = calculateWork(100, 5, 60);
    expect(result.work).toBeCloseTo(250, 0);
  });

  it('should return zero work at 90 degrees', () => {
    const result = calculateWork(100, 5, 90);
    expect(result.work).toBeCloseTo(0, 4);
  });

  it('should return negative work at 180 degrees', () => {
    const result = calculateWork(100, 5, 180);
    expect(result.work).toBeCloseTo(-500, 0);
  });
});
