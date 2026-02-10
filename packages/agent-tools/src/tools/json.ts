import * as json from '../json';

export const jsonTools = [
  {
    name: 'agent_tools_json_format',
    description:
      'Format JSON with configurable indentation. Returns pretty-printed JSON.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The JSON string to format',
        },
        indent: {
          type: 'number',
          enum: [2, 4],
          description: 'Number of spaces for indentation (default: 2)',
        },
        sortKeys: {
          type: 'boolean',
          description: 'Sort object keys alphabetically (default: false)',
        },
      },
      required: ['input'],
    },
    handler: async (args: { input: string; indent?: number; sortKeys?: boolean }) => {
      try {
        const result = json.format(args.input, {
          indent: (args.indent || 2) as 2 | 4,
          sortKeys: args.sortKeys || false,
        });
        return { content: [{ type: 'text' as const, text: result }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_json_validate',
    description:
      'Validate JSON, optionally against a JSON Schema. Returns validation result with errors.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The JSON string to validate',
        },
        schema: {
          type: 'string',
          description: 'Optional JSON Schema to validate against',
        },
      },
      required: ['input'],
    },
    handler: async (args: { input: string; schema?: string }) => {
      const result = json.validate(args.input, args.schema);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_json_query',
    description:
      'Query JSON using JSONPath or JMESPath. Returns the matched values.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The JSON string to query',
        },
        path: {
          type: 'string',
          description: 'The query path (e.g., "$.store.book[*].author")',
        },
        dialect: {
          type: 'string',
          enum: ['jsonpath', 'jmespath'],
          description: 'Query dialect (default: jsonpath)',
        },
      },
      required: ['input', 'path'],
    },
    handler: async (args: { input: string; path: string; dialect?: string }) => {
      const result = json.query(args.input, args.path, {
        dialect: (args.dialect as 'jsonpath' | 'jmespath') || 'jsonpath',
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_json_convert',
    description:
      'Convert between JSON, JSON5, JSONC, YAML, and TOML formats.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The input string to convert',
        },
        from: {
          type: 'string',
          enum: ['json', 'json5', 'jsonc', 'yaml', 'toml'],
          description: 'Source format',
        },
        to: {
          type: 'string',
          enum: ['json', 'json5', 'jsonc', 'yaml', 'toml'],
          description: 'Target format',
        },
      },
      required: ['input', 'from', 'to'],
    },
    handler: async (args: { input: string; from: string; to: string }) => {
      const result = json.convert(args.input, {
        from: args.from as json.ConvertFormat,
        to: args.to as json.ConvertFormat,
      });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_json_diff',
    description:
      'Compare two JSON documents and return the differences as JSON Patch operations.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        a: {
          type: 'string',
          description: 'First JSON document',
        },
        b: {
          type: 'string',
          description: 'Second JSON document',
        },
      },
      required: ['a', 'b'],
    },
    handler: async (args: { a: string; b: string }) => {
      const result = json.diff(args.a, args.b);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_json_minify',
    description: 'Minify JSON by removing all whitespace.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The JSON string to minify',
        },
      },
      required: ['input'],
    },
    handler: async (args: { input: string }) => {
      const result = json.minify(args.input);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_json_stats',
    description:
      'Get statistics about a JSON document (key count, depth, types, size).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The JSON string to analyze',
        },
      },
      required: ['input'],
    },
    handler: async (args: { input: string }) => {
      const result = json.getStats(args.input);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_json_schema_validate',
    description:
      'Validate JSON against a schema with detailed error analysis, coverage stats, and actionable fix suggestions. Returns a comprehensive summary suitable for LLM consumption.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The JSON string to validate',
        },
        schema: {
          type: 'string',
          description: 'The JSON Schema to validate against',
        },
      },
      required: ['input', 'schema'],
    },
    handler: async (args: { input: string; schema: string }) => {
      const result = json.validateWithSummary(args.input, args.schema);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
];
