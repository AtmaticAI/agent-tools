import * as color from '../../color';
import type { Skill, TaskInput, Part } from '../types';

export const colorSkill: Skill = {
  id: 'color-operations',
  name: 'Color Utilities',
  description:
    'Parse colors, convert formats, check WCAG contrast, generate palettes, blend colors, and identify named colors',
  tags: ['color', 'hex', 'rgb', 'hsl', 'contrast', 'palette', 'wcag'],
  examples: [
    'Parse #FF5733 to all formats',
    'Convert rgb(255,87,51) to HSL',
    'Check contrast ratio between black and white',
    'Generate analogous palette from #3498db',
    'Blend two colors at 50%',
    'Find nearest CSS color name',
  ],
  inputModes: ['application/json', 'text/plain'],
  outputModes: ['application/json', 'text/plain'],
};

export async function handleColorSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'parse': {
      const result = color.parseColor(data as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'convert': {
      const result = color.convertColor(data as string, options.to as color.ColorFormat);
      return [{ type: 'text', text: result }];
    }

    case 'contrast': {
      const { color1, color2 } = data as { color1: string; color2: string };
      const result = color.contrastRatio(color1, color2);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'palette': {
      const result = color.generatePalette(data as string, {
        type: options.type as color.PaletteType,
        count: options.count as number,
      });
      return [{ type: 'data', data: { colors: result } }];
    }

    case 'blend': {
      const { color1, color2 } = data as { color1: string; color2: string };
      const result = color.blendColors(color1, color2, options.ratio as number);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'name': {
      const result = color.colorName(data as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown color action: ${action}`);
  }
}
