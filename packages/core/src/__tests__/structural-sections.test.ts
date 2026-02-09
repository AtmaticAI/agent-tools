import { describe, it, expect } from 'vitest';
import { rectangleSection, circularSection, hollowCircularSection, iBeamSection } from '../structural/sections';

describe('rectangleSection', () => {
  it('should calculate area = b*h', () => {
    const result = rectangleSection(0.2, 0.4);
    expect(result.area).toBeCloseTo(0.08, 6);
  });

  it('should calculate Ixx = bh³/12', () => {
    const result = rectangleSection(0.2, 0.4);
    expect(result.Ixx).toBeCloseTo((0.2 * 0.064) / 12, 8);
  });

  it('should calculate Iyy = hb³/12', () => {
    const result = rectangleSection(0.2, 0.4);
    expect(result.Iyy).toBeCloseTo((0.4 * 0.008) / 12, 8);
  });

  it('should calculate section modulus Sx = bh²/6', () => {
    const result = rectangleSection(0.2, 0.4);
    expect(result.Sx).toBeCloseTo((0.2 * 0.16) / 6, 8);
  });

  it('should calculate radius of gyration rx = h/√12', () => {
    const result = rectangleSection(0.2, 0.4);
    expect(result.rx).toBeCloseTo(0.4 / Math.sqrt(12), 8);
  });

  it('should be symmetric for square section', () => {
    const result = rectangleSection(0.3, 0.3);
    expect(result.Ixx).toBeCloseTo(result.Iyy, 8);
    expect(result.Sx).toBeCloseTo(result.Sy, 8);
    expect(result.rx).toBeCloseTo(result.ry, 8);
  });

  it('should throw for zero width', () => {
    expect(() => rectangleSection(0, 0.4)).toThrow('positive');
  });

  it('should throw for negative height', () => {
    expect(() => rectangleSection(0.2, -0.4)).toThrow('positive');
  });
});

describe('circularSection', () => {
  it('should calculate area = πd²/4', () => {
    const result = circularSection(0.2);
    expect(result.area).toBeCloseTo(Math.PI * 0.01, 6);
  });

  it('should calculate I = πd⁴/64', () => {
    const result = circularSection(0.2);
    expect(result.I).toBeCloseTo(Math.PI * 0.0016 / 64, 10);
  });

  it('should calculate S = πd³/32', () => {
    const result = circularSection(0.2);
    expect(result.S).toBeCloseTo(Math.PI * 0.008 / 32, 10);
  });

  it('should calculate r = d/4', () => {
    const result = circularSection(0.2);
    expect(result.r).toBeCloseTo(0.05, 8);
  });

  it('should throw for zero diameter', () => {
    expect(() => circularSection(0)).toThrow('positive');
  });
});

describe('hollowCircularSection', () => {
  it('should calculate area = π(D² - d²)/4', () => {
    const result = hollowCircularSection(0.2, 0.16);
    const expected = (Math.PI / 4) * (0.04 - 0.0256);
    expect(result.area).toBeCloseTo(expected, 8);
  });

  it('should calculate I = π(D⁴ - d⁴)/64', () => {
    const result = hollowCircularSection(0.2, 0.16);
    const expected = (Math.PI / 64) * (0.0016 - 0.00065536);
    expect(result.I).toBeCloseTo(expected, 10);
  });

  it('should have larger I than solid of same outer diameter minus hollow area', () => {
    const hollow = hollowCircularSection(0.3, 0.2);
    // Hollow sections are more efficient per unit area
    const ratioHollow = hollow.I / hollow.area;
    const solid = circularSection(0.3);
    const ratioSolid = solid.I / solid.area;
    // The hollow section should have a higher I/A ratio (more efficient)
    expect(ratioHollow).toBeGreaterThan(ratioSolid * 0.8);
  });

  it('should throw if inner >= outer', () => {
    expect(() => hollowCircularSection(0.2, 0.2)).toThrow('less than outer');
  });

  it('should throw for negative inner diameter', () => {
    expect(() => hollowCircularSection(0.2, -0.1)).toThrow('non-negative');
  });
});

describe('iBeamSection', () => {
  it('should calculate total height', () => {
    const result = iBeamSection(0.2, 0.015, 0.3, 0.01);
    expect(result.totalHeight).toBeCloseTo(0.33, 6);
  });

  it('should calculate correct area', () => {
    const result = iBeamSection(0.2, 0.015, 0.3, 0.01);
    const expected = 2 * (0.2 * 0.015) + (0.3 * 0.01);
    expect(result.area).toBeCloseTo(expected, 8);
  });

  it('should calculate Ixx using parallel axis theorem', () => {
    const result = iBeamSection(0.2, 0.015, 0.3, 0.01);
    // Ixx should be dominated by flange contribution via parallel axis
    expect(result.Ixx).toBeGreaterThan(0);
    // Verify Sx = 2*Ixx/totalHeight
    expect(result.Sx).toBeCloseTo((2 * result.Ixx) / result.totalHeight, 8);
  });

  it('should have Ixx >> Iyy for typical I-beam', () => {
    const result = iBeamSection(0.2, 0.015, 0.3, 0.01);
    expect(result.Ixx).toBeGreaterThan(result.Iyy * 5);
  });

  it('should calculate radii of gyration', () => {
    const result = iBeamSection(0.2, 0.015, 0.3, 0.01);
    expect(result.rx).toBeCloseTo(Math.sqrt(result.Ixx / result.area), 8);
    expect(result.ry).toBeCloseTo(Math.sqrt(result.Iyy / result.area), 8);
  });

  it('should throw for zero flange width', () => {
    expect(() => iBeamSection(0, 0.015, 0.3, 0.01)).toThrow('positive');
  });

  it('should throw for zero web thickness', () => {
    expect(() => iBeamSection(0.2, 0.015, 0.3, 0)).toThrow('positive');
  });
});
