import { describe, it, expect } from 'vitest';
import { idealGasLaw, heatTransfer, thermalExpansion, carnotEfficiency } from '../physics/thermodynamics';

describe('idealGasLaw', () => {
  it('should solve for pressure', () => {
    const result = idealGasLaw({ volume: 0.022414, moles: 1, temperature: 273.15 });
    expect(result.pressure).toBeCloseTo(101325, -2);
  });

  it('should solve for volume', () => {
    const result = idealGasLaw({ pressure: 101325, moles: 1, temperature: 273.15 });
    expect(result.volume).toBeCloseTo(0.02241, 3);
  });

  it('should solve for moles', () => {
    const result = idealGasLaw({ pressure: 101325, volume: 0.0224, temperature: 273.15 });
    expect(result.moles).toBeCloseTo(1, 1);
  });

  it('should solve for temperature', () => {
    const result = idealGasLaw({ pressure: 101325, volume: 0.0224, moles: 1 });
    expect(result.temperature).toBeCloseTo(273.01, 0);
  });

  it('should throw with fewer than 3 known values', () => {
    expect(() => idealGasLaw({ pressure: 101325, volume: 0.0224 })).toThrow('Need at least 3');
  });
});

describe('heatTransfer', () => {
  it('should calculate Q = mcΔT', () => {
    const result = heatTransfer(1, 4186, 10);
    expect(result.heat).toBeCloseTo(41860, 0);
    expect(result.unit).toBe('J');
  });

  it('should handle negative temperature change (cooling)', () => {
    const result = heatTransfer(1, 4186, -5);
    expect(result.heat).toBeCloseTo(-20930, 0);
  });

  it('should return zero heat for zero mass', () => {
    const result = heatTransfer(0, 4186, 10);
    expect(result.heat).toBe(0);
  });

  it('should throw for negative mass', () => {
    expect(() => heatTransfer(-1, 4186, 10)).toThrow('non-negative');
  });

  it('should throw for non-positive specific heat', () => {
    expect(() => heatTransfer(1, 0, 10)).toThrow('positive');
  });
});

describe('thermalExpansion', () => {
  it('should calculate linear expansion', () => {
    const result = thermalExpansion(1, 12e-6, 100);
    expect(result.expansion).toBeCloseTo(0.0012, 6);
    expect(result.finalLength).toBeCloseTo(1.0012, 6);
  });

  it('should handle contraction (negative temp change)', () => {
    const result = thermalExpansion(1, 12e-6, -100);
    expect(result.expansion).toBeLessThan(0);
    expect(result.finalLength).toBeLessThan(1);
  });

  it('should return zero expansion for zero temp change', () => {
    const result = thermalExpansion(1, 12e-6, 0);
    expect(result.expansion).toBe(0);
    expect(result.finalLength).toBe(1);
  });

  it('should throw for negative length', () => {
    expect(() => thermalExpansion(-1, 12e-6, 100)).toThrow('non-negative');
  });
});

describe('carnotEfficiency', () => {
  it('should calculate Carnot efficiency', () => {
    const result = carnotEfficiency(600, 300);
    expect(result.efficiency).toBeCloseTo(0.5, 4);
    expect(result.efficiencyPercent).toBe('50.00%');
  });

  it('should approach 100% for very cold reservoir', () => {
    const result = carnotEfficiency(1000, 1);
    expect(result.efficiency).toBeCloseTo(0.999, 3);
  });

  it('should approach 0% for similar temperatures', () => {
    const result = carnotEfficiency(301, 300);
    expect(result.efficiency).toBeLessThan(0.01);
  });

  it('should throw for non-positive temperatures', () => {
    expect(() => carnotEfficiency(0, 300)).toThrow('positive');
    expect(() => carnotEfficiency(600, 0)).toThrow('positive');
  });

  it('should throw when cold >= hot', () => {
    expect(() => carnotEfficiency(300, 300)).toThrow('greater than');
    expect(() => carnotEfficiency(300, 600)).toThrow('greater than');
  });
});
