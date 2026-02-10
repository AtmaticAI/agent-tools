import { csv } from '@atmaticai/agent-tools-core';

export const csvTools = [
  {
    name: 'agent_tools_csv_parse',
    description:
      'Parse CSV data into structured JSON. Auto-detects delimiter if not specified.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The CSV string to parse',
        },
        delimiter: {
          type: 'string',
          description: 'Field delimiter (auto-detected if not specified)',
        },
        header: {
          type: 'boolean',
          description: 'First row contains headers (default: true)',
        },
        skipRows: {
          type: 'number',
          description: 'Number of rows to skip at the beginning',
        },
      },
      required: ['input'],
    },
    handler: async (args: {
      input: string;
      delimiter?: string;
      header?: boolean;
      skipRows?: number;
    }) => {
      const result = csv.parse(args.input, {
        delimiter: args.delimiter,
        header: args.header ?? true,
        skipRows: args.skipRows,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_csv_to_json',
    description: 'Convert CSV to JSON array.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The CSV string to convert',
        },
        pretty: {
          type: 'boolean',
          description: 'Pretty-print output (default: true)',
        },
      },
      required: ['input'],
    },
    handler: async (args: { input: string; pretty?: boolean }) => {
      const result = csv.toJson(args.input, args.pretty ?? true);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_csv_filter',
    description: 'Filter CSV rows based on column conditions.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The CSV string to filter',
        },
        filters: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              column: { type: 'string' },
              operator: {
                type: 'string',
                enum: [
                  'eq',
                  'neq',
                  'gt',
                  'gte',
                  'lt',
                  'lte',
                  'contains',
                  'startsWith',
                  'endsWith',
                  'matches',
                  'isNull',
                  'isNotNull',
                ],
              },
              value: {},
            },
            required: ['column', 'operator'],
          },
          description: 'Array of filter conditions',
        },
      },
      required: ['input', 'filters'],
    },
    handler: async (args: { input: string; filters: csv.Filter[] }) => {
      const result = csv.filter(args.input, args.filters);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_csv_stats',
    description:
      'Get column statistics for CSV data (types, counts, min/max, top values).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The CSV string to analyze',
        },
      },
      required: ['input'],
    },
    handler: async (args: { input: string }) => {
      const result = csv.getStats(args.input);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_csv_transform',
    description:
      'Transform CSV by selecting, renaming, or excluding columns.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The CSV string to transform',
        },
        select: {
          type: 'array',
          items: { type: 'string' },
          description: 'Columns to include',
        },
        exclude: {
          type: 'array',
          items: { type: 'string' },
          description: 'Columns to exclude',
        },
        rename: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description: 'Column rename mapping (oldName: newName)',
        },
      },
      required: ['input'],
    },
    handler: async (args: {
      input: string;
      select?: string[];
      exclude?: string[];
      rename?: Record<string, string>;
    }) => {
      const result = csv.transform(args.input, {
        select: args.select,
        exclude: args.exclude,
        rename: args.rename,
      });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_csv_export',
    description: 'Export CSV to different formats (csv, tsv, json, jsonl).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The CSV string to export',
        },
        format: {
          type: 'string',
          enum: ['csv', 'tsv', 'json', 'jsonl'],
          description: 'Target format',
        },
        headers: {
          type: 'boolean',
          description: 'Include headers in output (default: true)',
        },
      },
      required: ['input', 'format'],
    },
    handler: async (args: {
      input: string;
      format: csv.ExportFormat;
      headers?: boolean;
    }) => {
      const result = csv.exportData(args.input, {
        format: args.format,
        headers: args.headers ?? true,
      });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
];
