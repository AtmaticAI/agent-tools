import { describe, it, expect } from 'vitest';
import { waveEquation, dopplerEffect, snellsLaw, thinLens, decibelConversion } from '../physics/waves';

describe('waveEquation', () => {
  it('should solve for speed given frequency and wavelength', () => {
    const result = waveEquation({ frequency: 440, wavelength: 0.78 });
    expect(result.speed).toBeCloseTo(343.2, 1);
    expect(result.period).toBeCloseTo(1 / 440, 6);
  });

  it('should solve for frequency given speed and wavelength', () => {
    const result = waveEquation({ speed: 343, wavelength: 0.78 });
    expect(result.frequency).toBeCloseTo(439.74, 0);
  });

  it('should solve for wavelength given speed and frequency', () => {
    const result = waveEquation({ speed: 343, frequency: 440 });
    expect(result.wavelength).toBeCloseTo(0.78, 1);
  });

  it('should throw with fewer than 2 known values', () => {
    expect(() => waveEquation({ frequency: 440 })).toThrow('Need at least 2');
  });

  it('should throw for zero wavelength', () => {
    expect(() => waveEquation({ speed: 343, wavelength: 0 })).toThrow('cannot be zero');
  });

  it('should throw for zero frequency', () => {
    expect(() => waveEquation({ speed: 343, frequency: 0 })).toThrow('cannot be zero');
  });
});

describe('dopplerEffect', () => {
  it('should calculate higher frequency when approaching', () => {
    const result = dopplerEffect(440, 30, 0, 343, true);
    expect(result.observedFrequency).toBeGreaterThan(440);
  });

  it('should calculate lower frequency when receding', () => {
    const result = dopplerEffect(440, 30, 0, 343, false);
    expect(result.observedFrequency).toBeLessThan(440);
  });

  it('should handle stationary source and moving observer', () => {
    const result = dopplerEffect(440, 0, 30, 343, true);
    expect(result.observedFrequency).toBeGreaterThan(440);
  });

  it('should return same frequency when both stationary', () => {
    const result = dopplerEffect(440, 0, 0, 343, true);
    expect(result.observedFrequency).toBeCloseTo(440, 4);
  });

  it('should throw for source velocity >= medium speed', () => {
    expect(() => dopplerEffect(440, 343, 0, 343, true)).toThrow('less than medium speed');
  });

  it('should throw for non-positive source frequency', () => {
    expect(() => dopplerEffect(0, 30, 0, 343, true)).toThrow('positive');
  });
});

describe('snellsLaw', () => {
  it('should calculate refraction angle (air to glass)', () => {
    const result = snellsLaw(1.0, 1.5, 30);
    expect(result.angle2).toBeCloseTo(19.47, 0);
    expect(result.totalInternalReflection).toBe(false);
    expect(result.criticalAngle).toBeNull();
  });

  it('should detect total internal reflection', () => {
    const result = snellsLaw(1.5, 1.0, 50);
    expect(result.totalInternalReflection).toBe(true);
    expect(result.criticalAngle).toBeCloseTo(41.81, 0);
  });

  it('should calculate critical angle for glass to air', () => {
    const result = snellsLaw(1.5, 1.0, 30);
    expect(result.criticalAngle).not.toBeNull();
    expect(result.criticalAngle!).toBeCloseTo(41.81, 0);
  });

  it('should handle normal incidence (0 degrees)', () => {
    const result = snellsLaw(1.0, 1.5, 0);
    expect(result.angle2).toBeCloseTo(0, 4);
  });

  it('should throw for non-positive refractive index', () => {
    expect(() => snellsLaw(0, 1.5, 30)).toThrow('positive');
  });

  it('should throw for angle out of range', () => {
    expect(() => snellsLaw(1, 1.5, 90)).toThrow('between 0 and 90');
    expect(() => snellsLaw(1, 1.5, -5)).toThrow('between 0 and 90');
  });
});

describe('thinLens', () => {
  it('should solve for image distance', () => {
    const result = thinLens({ focalLength: 0.1, objectDistance: 0.3 });
    expect(result.imageDistance).toBeCloseTo(0.15, 4);
    expect(result.magnification).toBeCloseTo(-0.5, 4);
    expect(result.imageType).toBe('real');
  });

  it('should solve for focal length', () => {
    const result = thinLens({ objectDistance: 0.3, imageDistance: 0.15 });
    expect(result.focalLength).toBeCloseTo(0.1, 4);
  });

  it('should solve for object distance', () => {
    const result = thinLens({ focalLength: 0.1, imageDistance: 0.15 });
    expect(result.objectDistance).toBeCloseTo(0.3, 4);
  });

  it('should detect virtual image (negative image distance)', () => {
    const result = thinLens({ focalLength: 0.2, objectDistance: 0.1 });
    expect(result.imageDistance).toBeLessThan(0);
    expect(result.imageType).toBe('virtual');
  });

  it('should throw with fewer than 2 known values', () => {
    expect(() => thinLens({ focalLength: 0.1 })).toThrow('Need at least 2');
  });
});

describe('decibelConversion', () => {
  it('should calculate 10 dB for 10x intensity', () => {
    const result = decibelConversion(1, 10);
    expect(result.decibels).toBeCloseTo(10, 4);
  });

  it('should calculate 20 dB for 100x intensity', () => {
    const result = decibelConversion(1, 100);
    expect(result.decibels).toBeCloseTo(20, 4);
  });

  it('should calculate negative dB for reduction', () => {
    const result = decibelConversion(100, 10);
    expect(result.decibels).toBeCloseTo(-10, 4);
  });

  it('should return 0 dB for same intensities', () => {
    const result = decibelConversion(5, 5);
    expect(result.decibels).toBeCloseTo(0, 4);
  });

  it('should throw for non-positive intensities', () => {
    expect(() => decibelConversion(0, 10)).toThrow('positive');
    expect(() => decibelConversion(10, 0)).toThrow('positive');
  });
});
