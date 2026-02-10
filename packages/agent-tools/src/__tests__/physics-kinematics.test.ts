import { describe, it, expect } from 'vitest';
import { solveKinematics, projectileMotion, freeFall } from '../physics/kinematics';

describe('solveKinematics', () => {
  it('should solve for displacement given u, a, t', () => {
    const result = solveKinematics({ initialVelocity: 0, acceleration: 10, time: 5 });
    expect(result.displacement).toBeCloseTo(125, 4);
    expect(result.finalVelocity).toBeCloseTo(50, 4);
  });

  it('should solve for final velocity given u, a, t', () => {
    const result = solveKinematics({ initialVelocity: 10, acceleration: 2, time: 5 });
    expect(result.finalVelocity).toBeCloseTo(20, 4);
    expect(result.displacement).toBeCloseTo(75, 4);
  });

  it('should solve for time given u, v, a', () => {
    const result = solveKinematics({ initialVelocity: 0, finalVelocity: 20, acceleration: 5 });
    expect(result.time).toBeCloseTo(4, 4);
    expect(result.displacement).toBeCloseTo(40, 4);
  });

  it('should solve for acceleration given u, v, s', () => {
    const result = solveKinematics({ initialVelocity: 0, finalVelocity: 20, displacement: 100 });
    expect(result.acceleration).toBeCloseTo(2, 4);
  });

  it('should solve for initial velocity given v, a, t', () => {
    const result = solveKinematics({ finalVelocity: 30, acceleration: 5, time: 4 });
    expect(result.initialVelocity).toBeCloseTo(10, 4);
  });

  it('should throw with fewer than 3 known values', () => {
    expect(() => solveKinematics({ initialVelocity: 10, time: 5 })).toThrow('Need at least 3');
  });

  it('should handle zero acceleration (constant velocity)', () => {
    const result = solveKinematics({ initialVelocity: 10, acceleration: 0, time: 5 });
    expect(result.displacement).toBeCloseTo(50, 4);
    expect(result.finalVelocity).toBeCloseTo(10, 4);
  });

  it('should handle deceleration (negative acceleration)', () => {
    const result = solveKinematics({ initialVelocity: 20, acceleration: -4, time: 5 });
    expect(result.finalVelocity).toBeCloseTo(0, 4);
    expect(result.displacement).toBeCloseTo(50, 4);
  });
});

describe('projectileMotion', () => {
  it('should calculate projectile at 45 degrees', () => {
    const result = projectileMotion(100, 45);
    expect(result.range).toBeCloseTo(1019.72, 0);
    expect(result.maxHeight).toBeCloseTo(254.93, 0);
    expect(result.flightTime).toBeCloseTo(14.38, 0);
    expect(result.angle).toBe(45);
  });

  it('should return zero range at 0 degrees', () => {
    const result = projectileMotion(100, 0);
    expect(result.range).toBeCloseTo(0, 4);
    expect(result.maxHeight).toBeCloseTo(0, 4);
    expect(result.flightTime).toBeCloseTo(0, 4);
    expect(result.velocityAtPeak).toBeCloseTo(100, 4);
  });

  it('should return zero horizontal velocity at 90 degrees', () => {
    const result = projectileMotion(100, 90);
    expect(result.velocityAtPeak).toBeCloseTo(0, 4);
    expect(result.maxHeight).toBeGreaterThan(0);
  });

  it('should throw for negative velocity', () => {
    expect(() => projectileMotion(-10, 45)).toThrow('non-negative');
  });

  it('should throw for angle out of range', () => {
    expect(() => projectileMotion(10, 100)).toThrow('between 0 and 90');
    expect(() => projectileMotion(10, -5)).toThrow('between 0 and 90');
  });

  it('should accept custom gravity', () => {
    const earth = projectileMotion(100, 45);
    const moon = projectileMotion(100, 45, 1.62);
    expect(moon.range).toBeGreaterThan(earth.range);
    expect(moon.flightTime).toBeGreaterThan(earth.flightTime);
  });
});

describe('freeFall', () => {
  it('should calculate free fall from 100m', () => {
    const result = freeFall(100);
    expect(result.time).toBeCloseTo(4.515, 2);
    expect(result.finalVelocity).toBeCloseTo(44.27, 1);
  });

  it('should return zero time for zero height', () => {
    const result = freeFall(0);
    expect(result.time).toBe(0);
    expect(result.finalVelocity).toBe(0);
  });

  it('should throw for negative height', () => {
    expect(() => freeFall(-10)).toThrow('non-negative');
  });

  it('should accept custom gravity', () => {
    const result = freeFall(100, 1.62);
    expect(result.time).toBeGreaterThan(freeFall(100).time);
  });
});
