import { describe, it, expect } from 'vitest';
import { ohmsLaw, resistors, coulombsLaw, capacitors, rcCircuit } from '../physics/electricity';

describe('ohmsLaw', () => {
  it('should solve for voltage given current and resistance', () => {
    const result = ohmsLaw({ current: 2, resistance: 5 });
    expect(result.voltage).toBe(10);
    expect(result.power).toBe(20);
  });

  it('should solve for current given voltage and resistance', () => {
    const result = ohmsLaw({ voltage: 12, resistance: 4 });
    expect(result.current).toBe(3);
    expect(result.power).toBe(36);
  });

  it('should solve for resistance given voltage and current', () => {
    const result = ohmsLaw({ voltage: 24, current: 6 });
    expect(result.resistance).toBe(4);
    expect(result.power).toBe(144);
  });

  it('should throw with fewer than 2 known values', () => {
    expect(() => ohmsLaw({ voltage: 12 })).toThrow('Need at least 2');
  });

  it('should throw for zero resistance when solving for current', () => {
    expect(() => ohmsLaw({ voltage: 12, resistance: 0 })).toThrow('Resistance cannot be zero');
  });

  it('should throw for zero current when solving for resistance', () => {
    expect(() => ohmsLaw({ voltage: 12, current: 0 })).toThrow('Current cannot be zero');
  });
});

describe('resistors', () => {
  it('should calculate series resistance', () => {
    const result = resistors([100, 200, 300], 'series');
    expect(result.totalResistance).toBe(600);
    expect(result.unit).toBe('Ω');
  });

  it('should calculate parallel resistance', () => {
    const result = resistors([100, 100], 'parallel');
    expect(result.totalResistance).toBeCloseTo(50, 4);
  });

  it('should handle single resistor in series', () => {
    const result = resistors([470], 'series');
    expect(result.totalResistance).toBe(470);
  });

  it('should throw for empty array', () => {
    expect(() => resistors([], 'series')).toThrow('at least one');
  });

  it('should throw for negative values', () => {
    expect(() => resistors([-100], 'series')).toThrow('non-negative');
  });

  it('should throw for zero in parallel', () => {
    expect(() => resistors([100, 0], 'parallel')).toThrow('zero resistance');
  });
});

describe('coulombsLaw', () => {
  it('should calculate force between two charges', () => {
    const result = coulombsLaw(1e-6, 1e-6, 0.1);
    expect(result.force).toBeCloseTo(0.8988, 2);
    expect(result.unit).toBe('N');
  });

  it('should detect attractive force (opposite charges)', () => {
    const result = coulombsLaw(1e-6, -1e-6, 0.1);
    expect(result.isAttractive).toBe(true);
  });

  it('should detect repulsive force (same charges)', () => {
    const result = coulombsLaw(1e-6, 1e-6, 0.1);
    expect(result.isAttractive).toBe(false);
  });

  it('should throw for zero distance', () => {
    expect(() => coulombsLaw(1e-6, 1e-6, 0)).toThrow('positive');
  });
});

describe('capacitors', () => {
  it('should calculate parallel capacitance', () => {
    const result = capacitors([10e-6, 20e-6, 30e-6], 'parallel');
    expect(result.totalCapacitance).toBeCloseTo(60e-6, 10);
  });

  it('should calculate series capacitance', () => {
    const result = capacitors([10e-6, 10e-6], 'series');
    expect(result.totalCapacitance).toBeCloseTo(5e-6, 10);
  });

  it('should throw for non-positive values', () => {
    expect(() => capacitors([0], 'parallel')).toThrow('positive');
    expect(() => capacitors([-1], 'series')).toThrow('positive');
  });

  it('should throw for empty array', () => {
    expect(() => capacitors([], 'series')).toThrow('at least one');
  });
});

describe('rcCircuit', () => {
  it('should calculate RC time constant', () => {
    const result = rcCircuit(1000, 1e-6);
    expect(result.timeConstant).toBeCloseTo(0.001, 6);
    expect(result.halfLife).toBeCloseTo(0.001 * Math.LN2, 6);
    expect(result.unit).toBe('s');
  });

  it('should throw for non-positive resistance', () => {
    expect(() => rcCircuit(0, 1e-6)).toThrow('positive');
  });

  it('should throw for non-positive capacitance', () => {
    expect(() => rcCircuit(1000, 0)).toThrow('positive');
  });
});
