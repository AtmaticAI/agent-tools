import type { ColorNameResult } from './types';
import { parseColor, hexToRgb } from './parse';

const NAMED_COLORS: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#FF0000',
  green: '#008000',
  blue: '#0000FF',
  yellow: '#FFFF00',
  cyan: '#00FFFF',
  magenta: '#FF00FF',
  orange: '#FFA500',
  purple: '#800080',
  pink: '#FFC0CB',
  brown: '#A52A2A',
  gray: '#808080',
  silver: '#C0C0C0',
  maroon: '#800000',
  navy: '#000080',
  teal: '#008080',
  olive: '#808000',
  lime: '#00FF00',
  aqua: '#00FFFF',
  coral: '#FF7F50',
  salmon: '#FA8072',
  gold: '#FFD700',
  khaki: '#F0E68C',
  plum: '#DDA0DD',
  violet: '#EE82EE',
  indigo: '#4B0082',
  beige: '#F5F5DC',
  ivory: '#FFFFF0',
  lavender: '#E6E6FA',
};

function euclideanDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

export function colorName(input: string): ColorNameResult {
  const parsed = parseColor(input);
  const { r, g, b } = parsed.values.rgb;

  let closestName = '';
  let closestHex = '';
  let closestDistance = Infinity;

  for (const [name, hex] of Object.entries(NAMED_COLORS)) {
    const namedRgb = hexToRgb(hex);
    const distance = euclideanDistance(r, g, b, namedRgb.r, namedRgb.g, namedRgb.b);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestName = name;
      closestHex = hex.toLowerCase();
    }
  }

  return {
    name: closestName,
    exact: closestDistance === 0,
    hex: closestHex,
  };
}
