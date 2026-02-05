import { color } from '@agent-tools/core';

export const colorTools = [
  {
    name: 'agent_tools_color_parse',
    description:
      'Parse a color string (hex, rgb(), hsl()) and return all format representations.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'Color string to parse (e.g., "#FF5733", "rgb(255,87,51)", "hsl(9,100%,60%)")',
        },
      },
      required: ['input'],
    },
    handler: async (args: { input: string }) => {
      try {
        const result = color.parseColor(args.input);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_color_convert',
    description:
      'Convert a color to a specific format (hex, rgb, hsl).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'Color string to convert',
        },
        to: {
          type: 'string',
          enum: ['hex', 'rgb', 'hsl'],
          description: 'Target color format',
        },
      },
      required: ['input', 'to'],
    },
    handler: async (args: { input: string; to: string }) => {
      try {
        const result = color.convertColor(args.input, args.to as color.ColorFormat);
        return { content: [{ type: 'text' as const, text: result }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_color_contrast',
    description:
      'Calculate WCAG 2.1 contrast ratio between two colors with AA/AAA pass/fail results.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        color1: {
          type: 'string',
          description: 'First color',
        },
        color2: {
          type: 'string',
          description: 'Second color',
        },
      },
      required: ['color1', 'color2'],
    },
    handler: async (args: { color1: string; color2: string }) => {
      try {
        const result = color.contrastRatio(args.color1, args.color2);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_color_palette',
    description:
      'Generate a color palette from a base color: complementary, analogous, triadic, shades, or tints.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        base: {
          type: 'string',
          description: 'Base color string',
        },
        type: {
          type: 'string',
          enum: ['complementary', 'analogous', 'triadic', 'shades', 'tints'],
          description: 'Palette generation strategy',
        },
        count: {
          type: 'number',
          description: 'Number of colors to generate (default: 5, ignored for complementary/triadic)',
        },
      },
      required: ['base', 'type'],
    },
    handler: async (args: { base: string; type: string; count?: number }) => {
      try {
        const result = color.generatePalette(args.base, {
          type: args.type as color.PaletteType,
          count: args.count,
        });
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_color_blend',
    description:
      'Blend two colors together at a given ratio.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        color1: {
          type: 'string',
          description: 'First color',
        },
        color2: {
          type: 'string',
          description: 'Second color',
        },
        ratio: {
          type: 'number',
          description: 'Blend ratio 0-1 (0 = all color1, 1 = all color2, default: 0.5)',
        },
      },
      required: ['color1', 'color2'],
    },
    handler: async (args: { color1: string; color2: string; ratio?: number }) => {
      try {
        const result = color.blendColors(args.color1, args.color2, args.ratio);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_color_name',
    description:
      'Find the nearest CSS named color for a given color input.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'Color string to identify',
        },
      },
      required: ['input'],
    },
    handler: async (args: { input: string }) => {
      try {
        const result = color.colorName(args.input);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
];
