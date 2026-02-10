import { math } from '@atmaticai/agent-tools-core';

export const mathTools = [
  {
    name: 'agent_tools_math_convert',
    description:
      'Convert between units of measurement (length, weight, temperature, data).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        value: {
          type: 'number',
          description: 'The numeric value to convert',
        },
        from: {
          type: 'string',
          description: 'Source unit (e.g., "km", "lb", "celsius", "gb")',
        },
        to: {
          type: 'string',
          description: 'Target unit (e.g., "mi", "kg", "fahrenheit", "mb")',
        },
        category: {
          type: 'string',
          enum: ['length', 'weight', 'temperature', 'data'],
          description: 'Unit category',
        },
      },
      required: ['value', 'from', 'to', 'category'],
    },
    handler: async (args: { value: number; from: string; to: string; category: string }) => {
      try {
        const result = math.convertUnit(args.value, args.from, args.to, args.category as math.UnitCategory);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_math_base',
    description:
      'Convert numbers between binary, octal, decimal, and hexadecimal bases.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The number string to convert',
        },
        fromBase: {
          type: 'string',
          enum: ['binary', 'octal', 'decimal', 'hex'],
          description: 'Source number base',
        },
      },
      required: ['input', 'fromBase'],
    },
    handler: async (args: { input: string; fromBase: string }) => {
      try {
        const result = math.convertBase(args.input, args.fromBase as math.NumberBase);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_math_statistics',
    description:
      'Calculate statistics for a set of numbers: mean, median, mode, std deviation, percentiles.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        numbers: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of numbers to analyze',
        },
      },
      required: ['numbers'],
    },
    handler: async (args: { numbers: number[] }) => {
      try {
        const result = math.calculateStats(args.numbers);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_math_format',
    description:
      'Format a number with locale-aware formatting, currency, or percentage display.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        value: {
          type: 'number',
          description: 'The number to format',
        },
        locale: {
          type: 'string',
          description: 'Locale string (default: "en-US")',
        },
        style: {
          type: 'string',
          enum: ['decimal', 'currency', 'percent'],
          description: 'Format style (default: "decimal")',
        },
        currency: {
          type: 'string',
          description: 'Currency code when style is "currency" (e.g., "USD")',
        },
        minimumFractionDigits: {
          type: 'number',
          description: 'Minimum decimal places',
        },
        maximumFractionDigits: {
          type: 'number',
          description: 'Maximum decimal places',
        },
      },
      required: ['value'],
    },
    handler: async (args: { value: number; locale?: string; style?: string; currency?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }) => {
      try {
        const result = math.formatNumber(args.value, {
          locale: args.locale,
          style: args.style as 'decimal' | 'currency' | 'percent',
          currency: args.currency,
          minimumFractionDigits: args.minimumFractionDigits,
          maximumFractionDigits: args.maximumFractionDigits,
        });
        return { content: [{ type: 'text' as const, text: result }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_math_percentage',
    description:
      'Calculate percentages: what percentage a value is of a total, or percentage change between two values.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string',
          enum: ['of', 'change'],
          description: '"of" for value/total percentage, "change" for percentage change from/to',
        },
        value: {
          type: 'number',
          description: 'The value (or "from" value for change)',
        },
        total: {
          type: 'number',
          description: 'The total (or "to" value for change)',
        },
      },
      required: ['action', 'value', 'total'],
    },
    handler: async (args: { action: string; value: number; total: number }) => {
      try {
        if (args.action === 'change') {
          const result = math.percentageChange(args.value, args.total);
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
          };
        }
        const result = math.percentage(args.value, args.total);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
];
