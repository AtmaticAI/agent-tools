import { describe, it, expect } from 'vitest';
import { simplySupported, cantilever } from '../structural/beams';

describe('simplySupported', () => {
  describe('point-center load', () => {
    it('should calculate reactions = P/2 each', () => {
      const result = simplySupported(10, 1000, 'point-center');
      expect(result.reactionLeft).toBeCloseTo(500, 4);
      expect(result.reactionRight).toBeCloseTo(500, 4);
    });

    it('should calculate max moment = PL/4', () => {
      const result = simplySupported(10, 1000, 'point-center');
      expect(result.maxMoment).toBeCloseTo(2500, 4);
    });

    it('should calculate max shear = P/2', () => {
      const result = simplySupported(10, 1000, 'point-center');
      expect(result.maxShear).toBeCloseTo(500, 4);
    });

    it('should calculate deflection when E and I provided', () => {
      // δ = PL³/(48EI)
      const result = simplySupported(4, 10000, 'point-center', 200e9, 1e-4);
      expect(result.maxDeflection).toBeCloseTo((10000 * 64) / (48 * 200e9 * 1e-4), 8);
      expect(result.deflectionUnit).toBe('m');
    });

    it('should return null deflection without E and I', () => {
      const result = simplySupported(10, 1000, 'point-center');
      expect(result.maxDeflection).toBeNull();
      expect(result.deflectionUnit).toBeNull();
    });
  });

  describe('point-custom load', () => {
    it('should calculate reactions for off-center load', () => {
      // Load at 3m on a 10m beam
      const result = simplySupported(10, 1000, 'point-custom', undefined, undefined, 3);
      expect(result.reactionLeft).toBeCloseTo(700, 4);
      expect(result.reactionRight).toBeCloseTo(300, 4);
    });

    it('should calculate max moment = Pab/L', () => {
      const result = simplySupported(10, 1000, 'point-custom', undefined, undefined, 3);
      expect(result.maxMoment).toBeCloseTo(2100, 4);
    });

    it('should throw for load position outside beam', () => {
      expect(() => simplySupported(10, 1000, 'point-custom', undefined, undefined, 15)).toThrow('between 0 and length');
    });
  });

  describe('uniform load', () => {
    it('should calculate reactions = P/2 each', () => {
      const result = simplySupported(6, 12000, 'uniform');
      expect(result.reactionLeft).toBeCloseTo(6000, 4);
      expect(result.reactionRight).toBeCloseTo(6000, 4);
    });

    it('should calculate max moment = wL²/8', () => {
      // w = P/L = 12000/6 = 2000 N/m, M = 2000*36/8 = 9000
      const result = simplySupported(6, 12000, 'uniform');
      expect(result.maxMoment).toBeCloseTo(9000, 4);
    });

    it('should calculate deflection = 5wL⁴/(384EI)', () => {
      const L = 6;
      const P = 12000;
      const w = P / L;
      const E = 200e9;
      const I = 5e-5;
      const result = simplySupported(L, P, 'uniform', E, I);
      const expected = (5 * w * Math.pow(L, 4)) / (384 * E * I);
      expect(result.maxDeflection).toBeCloseTo(expected, 10);
    });
  });

  describe('triangular load', () => {
    it('should calculate reactions: R_left = P/3, R_right = 2P/3', () => {
      const result = simplySupported(9, 9000, 'triangular');
      expect(result.reactionLeft).toBeCloseTo(3000, 4);
      expect(result.reactionRight).toBeCloseTo(6000, 4);
    });
  });

  it('should throw for zero length', () => {
    expect(() => simplySupported(0, 1000, 'point-center')).toThrow('positive');
  });

  it('should throw for negative load', () => {
    expect(() => simplySupported(10, -100, 'uniform')).toThrow('non-negative');
  });

  it('should throw for unknown load type', () => {
    expect(() => simplySupported(10, 1000, 'invalid' as never)).toThrow('Unknown load type');
  });
});

describe('cantilever', () => {
  describe('point-end load', () => {
    it('should calculate reaction force = P', () => {
      const result = cantilever(5, 2000, 'point-end');
      expect(result.reactionForce).toBeCloseTo(2000, 4);
    });

    it('should calculate reaction moment = PL', () => {
      const result = cantilever(5, 2000, 'point-end');
      expect(result.reactionMoment).toBeCloseTo(10000, 4);
    });

    it('should calculate max moment = PL', () => {
      const result = cantilever(5, 2000, 'point-end');
      expect(result.maxMoment).toBeCloseTo(10000, 4);
    });

    it('should calculate deflection = PL³/(3EI)', () => {
      const result = cantilever(3, 1000, 'point-end', 200e9, 1e-4);
      const expected = (1000 * 27) / (3 * 200e9 * 1e-4);
      expect(result.maxDeflection).toBeCloseTo(expected, 10);
    });
  });

  describe('point-custom load', () => {
    it('should calculate moment for load at custom position', () => {
      const result = cantilever(5, 1000, 'point-custom', undefined, undefined, 3);
      expect(result.reactionMoment).toBeCloseTo(3000, 4);
    });
  });

  describe('uniform load', () => {
    it('should calculate reaction force = P (total load)', () => {
      const result = cantilever(4, 8000, 'uniform');
      expect(result.reactionForce).toBeCloseTo(8000, 4);
    });

    it('should calculate max moment = wL²/2', () => {
      // w = 8000/4 = 2000, M = 2000*16/2 = 16000
      const result = cantilever(4, 8000, 'uniform');
      expect(result.maxMoment).toBeCloseTo(16000, 4);
    });

    it('should calculate deflection = wL⁴/(8EI)', () => {
      const L = 4;
      const P = 8000;
      const w = P / L;
      const E = 200e9;
      const I = 2e-4;
      const result = cantilever(L, P, 'uniform', E, I);
      const expected = (w * Math.pow(L, 4)) / (8 * E * I);
      expect(result.maxDeflection).toBeCloseTo(expected, 10);
    });
  });

  it('should throw for zero length', () => {
    expect(() => cantilever(0, 1000, 'point-end')).toThrow('positive');
  });

  it('should throw for unknown load type', () => {
    expect(() => cantilever(5, 1000, 'invalid' as never)).toThrow('Unknown load type');
  });
});
