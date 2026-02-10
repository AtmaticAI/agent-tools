import type { ContrastResult } from './types';
import { parseColor } from './parse';

function srgbChannel(c: number): number {
  const normalized = c / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

export function contrastRatio(color1: string, color2: string): ContrastResult {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);

  const l1 = relativeLuminance(c1.values.rgb.r, c1.values.rgb.g, c1.values.rgb.b);
  const l2 = relativeLuminance(c2.values.rgb.r, c2.values.rgb.g, c2.values.rgb.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  const roundedRatio = Math.round(ratio * 100) / 100;

  return {
    ratio: roundedRatio,
    formatted: `${roundedRatio.toFixed(2)}:1`,
    aa: {
      normal: roundedRatio >= 4.5,
      large: roundedRatio >= 3,
    },
    aaa: {
      normal: roundedRatio >= 7,
      large: roundedRatio >= 4.5,
    },
  };
}
