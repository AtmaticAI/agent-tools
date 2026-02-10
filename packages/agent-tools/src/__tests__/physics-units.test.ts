import { describe, it, expect } from 'vitest';
import { convertPhysicsUnit } from '../physics/units';

describe('convertPhysicsUnit', () => {
  describe('force', () => {
    it('should convert N to lbf', () => {
      const result = convertPhysicsUnit(100, 'n', 'lbf', 'force');
      expect(result.result).toBeCloseTo(22.48, 1);
    });

    it('should convert kN to N', () => {
      const result = convertPhysicsUnit(1, 'kn', 'n', 'force');
      expect(result.result).toBeCloseTo(1000, 0);
    });

    it('should convert kgf to N', () => {
      const result = convertPhysicsUnit(1, 'kgf', 'n', 'force');
      expect(result.result).toBeCloseTo(9.80665, 4);
    });

    it('should be identity for same unit', () => {
      const result = convertPhysicsUnit(42, 'n', 'n', 'force');
      expect(result.result).toBeCloseTo(42, 4);
    });
  });

  describe('energy', () => {
    it('should convert J to cal', () => {
      const result = convertPhysicsUnit(4184, 'j', 'kcal', 'energy');
      expect(result.result).toBeCloseTo(1, 2);
    });

    it('should convert kWh to J', () => {
      const result = convertPhysicsUnit(1, 'kwh', 'j', 'energy');
      expect(result.result).toBeCloseTo(3.6e6, 0);
    });

    it('should convert BTU to J', () => {
      const result = convertPhysicsUnit(1, 'btu', 'j', 'energy');
      expect(result.result).toBeCloseTo(1055.06, 0);
    });

    it('should convert eV to J', () => {
      const result = convertPhysicsUnit(1, 'ev', 'j', 'energy');
      expect(result.result).toBeCloseTo(1.602e-19, 22);
    });
  });

  describe('power', () => {
    it('should convert hp to W', () => {
      const result = convertPhysicsUnit(1, 'hp', 'w', 'power');
      expect(result.result).toBeCloseTo(745.7, 0);
    });

    it('should convert kW to W', () => {
      const result = convertPhysicsUnit(1, 'kw', 'w', 'power');
      expect(result.result).toBeCloseTo(1000, 0);
    });

    it('should convert MW to kW', () => {
      const result = convertPhysicsUnit(1, 'mw', 'kw', 'power');
      expect(result.result).toBeCloseTo(1000, 0);
    });
  });

  describe('pressure', () => {
    it('should convert atm to Pa', () => {
      const result = convertPhysicsUnit(1, 'atm', 'pa', 'pressure');
      expect(result.result).toBeCloseTo(101325, 0);
    });

    it('should convert bar to psi', () => {
      const result = convertPhysicsUnit(1, 'bar', 'psi', 'pressure');
      expect(result.result).toBeCloseTo(14.504, 1);
    });

    it('should convert atm to mmhg', () => {
      const result = convertPhysicsUnit(1, 'atm', 'mmhg', 'pressure');
      expect(result.result).toBeCloseTo(760, 0);
    });
  });

  describe('speed', () => {
    it('should convert m/s to km/h', () => {
      const result = convertPhysicsUnit(1, 'm/s', 'km/h', 'speed');
      expect(result.result).toBeCloseTo(3.6, 4);
    });

    it('should convert mph to m/s', () => {
      const result = convertPhysicsUnit(60, 'mph', 'm/s', 'speed');
      expect(result.result).toBeCloseTo(26.82, 1);
    });

    it('should convert knots to km/h', () => {
      const result = convertPhysicsUnit(1, 'knots', 'km/h', 'speed');
      expect(result.result).toBeCloseTo(1.852, 2);
    });
  });

  describe('errors', () => {
    it('should throw for unknown unit', () => {
      expect(() => convertPhysicsUnit(1, 'unknown', 'n', 'force')).toThrow('Unknown force unit');
    });

    it('should throw for unknown category', () => {
      expect(() => convertPhysicsUnit(1, 'n', 'n', 'unknown' as 'force')).toThrow('Unknown physics unit category');
    });

    it('should be case-insensitive', () => {
      const result = convertPhysicsUnit(1, 'N', 'LBF', 'force');
      expect(result.from).toBe('n');
      expect(result.to).toBe('lbf');
    });

    it('should include category in result', () => {
      const result = convertPhysicsUnit(1, 'pa', 'atm', 'pressure');
      expect(result.category).toBe('pressure');
    });
  });
});
