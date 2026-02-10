import { describe, it, expect } from 'vitest';
import { eulerBuckling, slendernessRatio } from '../structural/columns';

describe('eulerBuckling', () => {
  it('should calculate critical load for pinned-pinned column', () => {
    // Pcr = π²EI / L² for K=1
    const E = 200e9;
    const I = 1e-4;
    const L = 5;
    const result = eulerBuckling(E, I, L, 'pinned-pinned');
    const expected = (Math.PI * Math.PI * E * I) / (L * L);
    expect(result.criticalLoad).toBeCloseTo(expected, 0);
    expect(result.effectiveLengthFactor).toBe(1.0);
    expect(result.effectiveLength).toBe(5);
    expect(result.unit).toBe('N');
  });

  it('should calculate for fixed-free column (K=2)', () => {
    const E = 200e9;
    const I = 1e-4;
    const L = 5;
    const result = eulerBuckling(E, I, L, 'fixed-free');
    const Le = 2 * L;
    const expected = (Math.PI * Math.PI * E * I) / (Le * Le);
    expect(result.criticalLoad).toBeCloseTo(expected, 0);
    expect(result.effectiveLengthFactor).toBe(2.0);
    expect(result.effectiveLength).toBe(10);
  });

  it('should calculate for fixed-pinned column (K=0.7)', () => {
    const E = 200e9;
    const I = 1e-4;
    const L = 5;
    const result = eulerBuckling(E, I, L, 'fixed-pinned');
    expect(result.effectiveLengthFactor).toBe(0.7);
    expect(result.effectiveLength).toBeCloseTo(3.5, 4);
  });

  it('should calculate for fixed-fixed column (K=0.5)', () => {
    const E = 200e9;
    const I = 1e-4;
    const L = 5;
    const result = eulerBuckling(E, I, L, 'fixed-fixed');
    expect(result.effectiveLengthFactor).toBe(0.5);
    expect(result.effectiveLength).toBeCloseTo(2.5, 4);
  });

  it('fixed-fixed should have highest critical load', () => {
    const E = 200e9;
    const I = 1e-4;
    const L = 5;
    const ff = eulerBuckling(E, I, L, 'fixed-fixed');
    const pp = eulerBuckling(E, I, L, 'pinned-pinned');
    const freeEnd = eulerBuckling(E, I, L, 'fixed-free');
    expect(ff.criticalLoad).toBeGreaterThan(pp.criticalLoad);
    expect(pp.criticalLoad).toBeGreaterThan(freeEnd.criticalLoad);
  });

  it('should throw for zero E', () => {
    expect(() => eulerBuckling(0, 1e-4, 5, 'pinned-pinned')).toThrow('positive');
  });

  it('should throw for zero I', () => {
    expect(() => eulerBuckling(200e9, 0, 5, 'pinned-pinned')).toThrow('positive');
  });

  it('should throw for zero length', () => {
    expect(() => eulerBuckling(200e9, 1e-4, 0, 'pinned-pinned')).toThrow('positive');
  });

  it('should throw for unknown end condition', () => {
    expect(() => eulerBuckling(200e9, 1e-4, 5, 'invalid' as never)).toThrow('Unknown end condition');
  });
});

describe('slendernessRatio', () => {
  it('should calculate slenderness ratio = Le/r', () => {
    const result = slendernessRatio(5, 0.05);
    expect(result.slendernessRatio).toBeCloseTo(100, 4);
  });

  it('should classify short column (ratio < 30)', () => {
    const result = slendernessRatio(1, 0.1);
    expect(result.slendernessRatio).toBe(10);
    expect(result.classification).toBe('short');
  });

  it('should classify intermediate column (30-120)', () => {
    const result = slendernessRatio(5, 0.05);
    expect(result.slendernessRatio).toBe(100);
    expect(result.classification).toBe('intermediate');
  });

  it('should classify long column (> 120)', () => {
    const result = slendernessRatio(10, 0.05);
    expect(result.slendernessRatio).toBe(200);
    expect(result.classification).toBe('long');
  });

  it('should classify boundary at 30 as intermediate', () => {
    const result = slendernessRatio(3, 0.1);
    expect(result.slendernessRatio).toBe(30);
    expect(result.classification).toBe('intermediate');
  });

  it('should classify boundary at 120 as intermediate', () => {
    const result = slendernessRatio(12, 0.1);
    expect(result.slendernessRatio).toBe(120);
    expect(result.classification).toBe('intermediate');
  });

  it('should throw for zero effective length', () => {
    expect(() => slendernessRatio(0, 0.05)).toThrow('positive');
  });

  it('should throw for zero radius of gyration', () => {
    expect(() => slendernessRatio(5, 0)).toThrow('positive');
  });
});
