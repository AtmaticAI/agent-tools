import type { ColorFormat } from './types';
import { parseColor } from './parse';

export function convertColor(input: string, to: ColorFormat): string {
  const result = parseColor(input);

  switch (to) {
    case 'hex':
      return result.hex;
    case 'rgb':
      return result.rgb;
    case 'hsl':
      return result.hsl;
    default:
      throw new Error(`Unsupported target format: ${to}`);
  }
}
