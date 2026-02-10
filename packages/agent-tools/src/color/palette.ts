import type { PaletteOptions, ColorConversionResult } from './types';
import { parseColor, hslToRgb, rgbToHsl, rgbToHex } from './parse';

function hslToConversionResult(h: number, s: number, l: number): ColorConversionResult {
  const normalizedH = ((h % 360) + 360) % 360;
  const rgb = hslToRgb(normalizedH, s, l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hslRecalc = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return {
    hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${hslRecalc.h}, ${hslRecalc.s}%, ${hslRecalc.l}%)`,
    values: {
      rgb,
      hsl: hslRecalc,
    },
  };
}

export function generatePalette(base: string, options: PaletteOptions): ColorConversionResult[] {
  const parsed = parseColor(base);
  const { h, s, l } = parsed.values.hsl;
  const count = options.count ?? 5;

  switch (options.type) {
    case 'complementary': {
      return [
        hslToConversionResult(h, s, l),
        hslToConversionResult(h + 180, s, l),
      ];
    }

    case 'analogous': {
      const results: ColorConversionResult[] = [];
      const spread = 30;
      const step = (spread * 2) / (count - 1);
      for (let i = 0; i < count; i++) {
        const hue = h - spread + step * i;
        results.push(hslToConversionResult(hue, s, l));
      }
      return results;
    }

    case 'triadic': {
      return [
        hslToConversionResult(h, s, l),
        hslToConversionResult(h + 120, s, l),
        hslToConversionResult(h + 240, s, l),
      ];
    }

    case 'shades': {
      const results: ColorConversionResult[] = [];
      const minL = 10;
      const step = (l - minL) / (count - 1);
      for (let i = 0; i < count; i++) {
        const lightness = Math.round(l - step * i);
        results.push(hslToConversionResult(h, s, lightness));
      }
      return results;
    }

    case 'tints': {
      const results: ColorConversionResult[] = [];
      const maxL = 95;
      const step = (maxL - l) / (count - 1);
      for (let i = 0; i < count; i++) {
        const lightness = Math.round(l + step * i);
        results.push(hslToConversionResult(h, s, lightness));
      }
      return results;
    }

    default:
      throw new Error(`Unsupported palette type: ${options.type}`);
  }
}
