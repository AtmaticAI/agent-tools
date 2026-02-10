import { describe, it, expect } from 'vitest';
import { getConstant, listConstants } from '../physics/constants';

describe('getConstant', () => {
  it('should return speed of light', () => {
    const c = getConstant('c');
    expect(c.name).toBe('Speed of Light');
    expect(c.value).toBe(299792458);
    expect(c.unit).toBe('m/s');
    expect(c.symbol).toBe('c');
    expect(c.category).toBe('universal');
  });

  it('should return gravitational constant', () => {
    const G = getConstant('G');
    expect(G.name).toBe('Gravitational Constant');
    expect(G.value).toBeCloseTo(6.67430e-11, 15);
    expect(G.category).toBe('universal');
  });

  it('should return Planck constant', () => {
    const h = getConstant('h');
    expect(h.value).toBeCloseTo(6.62607015e-34, 43);
    expect(h.category).toBe('quantum');
  });

  it('should return Boltzmann constant', () => {
    const k = getConstant('k_B');
    expect(k.value).toBeCloseTo(1.380649e-23, 28);
    expect(k.category).toBe('thermodynamics');
  });

  it('should return elementary charge', () => {
    const e = getConstant('e');
    expect(e.value).toBeCloseTo(1.602176634e-19, 28);
    expect(e.category).toBe('electromagnetic');
  });

  it('should return standard gravity', () => {
    const g = getConstant('g');
    expect(g.value).toBe(9.80665);
  });

  it('should throw for unknown constant', () => {
    expect(() => getConstant('unknown')).toThrow('Unknown constant');
  });

  it('should return a copy, not a reference', () => {
    const c1 = getConstant('c');
    const c2 = getConstant('c');
    expect(c1).toEqual(c2);
    expect(c1).not.toBe(c2);
  });
});

describe('listConstants', () => {
  it('should return all constants when no category', () => {
    const all = listConstants();
    expect(all.length).toBeGreaterThanOrEqual(16);
  });

  it('should filter by category', () => {
    const em = listConstants('electromagnetic');
    expect(em.length).toBeGreaterThan(0);
    expect(em.every((c) => c.category === 'electromagnetic')).toBe(true);
  });

  it('should return empty array for unknown category', () => {
    const result = listConstants('nonexistent');
    expect(result).toEqual([]);
  });

  it('should return universal constants', () => {
    const universal = listConstants('universal');
    const names = universal.map((c) => c.symbol);
    expect(names).toContain('c');
    expect(names).toContain('G');
  });
});
