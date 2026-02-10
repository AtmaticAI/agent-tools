import type { BlendResult } from './types';
import { parseColor, rgbToHex, rgbToHsl } from './parse';

export function blendColors(color1: string, color2: string, ratio: number = 0.5): BlendResult {
  if (ratio < 0 || ratio > 1) {
    throw new Error(`Ratio must be between 0 and 1, got: ${ratio}`);
  }

  const c1 = parseColor(color1);
  const c2 = parseColor(color2);

  const r = Math.round(c1.values.rgb.r * (1 - ratio) + c2.values.rgb.r * ratio);
  const g = Math.round(c1.values.rgb.g * (1 - ratio) + c2.values.rgb.g * ratio);
  const b = Math.round(c1.values.rgb.b * (1 - ratio) + c2.values.rgb.b * ratio);

  const hex = rgbToHex(r, g, b);
  const hsl = rgbToHsl(r, g, b);

  return {
    color: {
      hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      values: {
        rgb: { r, g, b },
        hsl,
      },
    },
    ratio,
  };
}
