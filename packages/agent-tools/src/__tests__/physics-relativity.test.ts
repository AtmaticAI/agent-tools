import { describe, it, expect } from 'vitest';
import { lorentzFactor, timeDilation, lengthContraction, massEnergy, energyToMass } from '../physics/relativity';

const C = 299792458;

describe('lorentzFactor', () => {
  it('should return gamma = 1 at low velocity', () => {
    const result = lorentzFactor(0);
    expect(result.gamma).toBeCloseTo(1, 10);
    expect(result.beta).toBe(0);
  });

  it('should return gamma ≈ 1.155 at 0.5c', () => {
    const result = lorentzFactor(C * 0.5);
    expect(result.gamma).toBeCloseTo(1.1547, 3);
    expect(result.beta).toBeCloseTo(0.5, 4);
  });

  it('should return gamma ≈ 2.294 at 0.9c', () => {
    const result = lorentzFactor(C * 0.9);
    expect(result.gamma).toBeCloseTo(2.294, 2);
  });

  it('should return gamma ≈ 7.089 at 0.99c', () => {
    const result = lorentzFactor(C * 0.99);
    expect(result.gamma).toBeCloseTo(7.089, 2);
  });

  it('should return correct speed of light value', () => {
    const result = lorentzFactor(100);
    expect(result.speedOfLight).toBe(C);
  });

  it('should throw at speed of light', () => {
    expect(() => lorentzFactor(C)).toThrow('less than the speed of light');
  });

  it('should throw above speed of light', () => {
    expect(() => lorentzFactor(C + 1)).toThrow('less than the speed of light');
  });
});

describe('timeDilation', () => {
  it('should dilate time at 0.5c', () => {
    const result = timeDilation(1, C * 0.5);
    expect(result.dilatedTime).toBeCloseTo(1.1547, 3);
    expect(result.gamma).toBeCloseTo(1.1547, 3);
  });

  it('should return proper time at rest', () => {
    const result = timeDilation(10, 0);
    expect(result.dilatedTime).toBeCloseTo(10, 10);
  });

  it('should significantly dilate at 0.99c', () => {
    const result = timeDilation(1, C * 0.99);
    expect(result.dilatedTime).toBeGreaterThan(7);
  });

  it('should throw for negative proper time', () => {
    expect(() => timeDilation(-1, C * 0.5)).toThrow('non-negative');
  });
});

describe('lengthContraction', () => {
  it('should contract length at 0.5c', () => {
    const result = lengthContraction(1, C * 0.5);
    expect(result.contractedLength).toBeCloseTo(0.866, 2);
  });

  it('should not contract at rest', () => {
    const result = lengthContraction(10, 0);
    expect(result.contractedLength).toBeCloseTo(10, 10);
  });

  it('should significantly contract at 0.99c', () => {
    const result = lengthContraction(1, C * 0.99);
    expect(result.contractedLength).toBeLessThan(0.15);
  });

  it('should throw for negative length', () => {
    expect(() => lengthContraction(-1, C * 0.5)).toThrow('non-negative');
  });
});

describe('massEnergy', () => {
  it('should calculate E = mc² for 1 kg', () => {
    const result = massEnergy(1);
    expect(result.energy).toBeCloseTo(C * C, -5);
    expect(result.unit).toBe('J');
  });

  it('should return zero energy for zero mass', () => {
    const result = massEnergy(0);
    expect(result.energy).toBe(0);
  });

  it('should throw for negative mass', () => {
    expect(() => massEnergy(-1)).toThrow('non-negative');
  });
});

describe('energyToMass', () => {
  it('should convert energy to mass', () => {
    const result = energyToMass(C * C);
    expect(result.mass).toBeCloseTo(1, 4);
    expect(result.unit).toBe('kg');
  });

  it('should return zero mass for zero energy', () => {
    const result = energyToMass(0);
    expect(result.mass).toBe(0);
  });

  it('should throw for negative energy', () => {
    expect(() => energyToMass(-1)).toThrow('non-negative');
  });

  it('should be inverse of massEnergy', () => {
    const me = massEnergy(5);
    const em = energyToMass(me.energy);
    expect(em.mass).toBeCloseTo(5, 4);
  });
});
