import * as diff from '../diff';
import type { McpTool } from './index';

export const diffTools: McpTool[] = [
  {
    name: 'agent_tools_diff_compare',
    description:
      'Compare two texts and return their differences. Supports line, word, and character-level diffing.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        a: { type: 'string', description: 'First text (original)' },
        b: { type: 'string', description: 'Second text (modified)' },
        type: {
          type: 'string',
          enum: ['line', 'word', 'char'],
          description: 'Diff granularity (default: line)',
        },
        ignoreWhitespace: {
          type: 'boolean',
          description: 'Ignore whitespace differences (default: false)',
        },
      },
      required: ['a', 'b'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = diff.compare(args.a as string, args.b as string, {
        type: args.type as diff.DiffType,
        ignoreWhitespace: args.ignoreWhitespace as boolean,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_diff_unified',
    description:
      'Generate a unified diff (patch format) between two texts. Compatible with git diff output.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        a: { type: 'string', description: 'Original text' },
        b: { type: 'string', description: 'Modified text' },
        fromFile: {
          type: 'string',
          description: 'Original file name (default: "a")',
        },
        toFile: {
          type: 'string',
          description: 'Modified file name (default: "b")',
        },
        context: {
          type: 'number',
          description: 'Number of context lines (default: 3)',
        },
      },
      required: ['a', 'b'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = diff.unifiedDiff(args.a as string, args.b as string, {
        fromFile: args.fromFile as string,
        toFile: args.toFile as string,
        context: args.context as number,
      });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_diff_apply',
    description:
      'Apply a unified diff patch to a text. Use to transform text using a previously generated patch.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Original text' },
        patch: { type: 'string', description: 'Unified diff patch to apply' },
        fuzz: {
          type: 'number',
          description: 'Fuzz factor for approximate matching (default: 0)',
        },
      },
      required: ['input', 'patch'],
    },
    handler: async (args: Record<string, unknown>) => {
      try {
        const result = diff.apply(args.input as string, args.patch as string, {
          fuzz: args.fuzz as number,
        });
        return { content: [{ type: 'text' as const, text: result }] };
      } catch (e) {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }],
        };
      }
    },
  },
];
