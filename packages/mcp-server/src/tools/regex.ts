import { regex } from '@atmaticai/agent-tools-core';
import type { McpTool } from './index';

export const regexTools: McpTool[] = [
  {
    name: 'agent_tools_regex_test',
    description:
      'Test a regex pattern against input text. Returns all matches with positions and named groups.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Text to search' },
        pattern: { type: 'string', description: 'Regular expression pattern' },
        flags: {
          type: 'string',
          description: 'Regex flags (e.g., "gi" for global case-insensitive)',
        },
        caseInsensitive: {
          type: 'boolean',
          description: 'Case-insensitive matching (default: false)',
        },
        multiline: {
          type: 'boolean',
          description: 'Multiline mode (default: false)',
        },
      },
      required: ['input', 'pattern'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = regex.test(args.input as string, args.pattern as string, {
        flags: args.flags as string,
        caseInsensitive: args.caseInsensitive as boolean,
        multiline: args.multiline as boolean,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_regex_replace',
    description:
      'Replace matches of a regex pattern in text. Supports backreferences ($1, $2) and named groups ($<name>).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Text to process' },
        pattern: { type: 'string', description: 'Regular expression pattern' },
        replacement: {
          type: 'string',
          description: 'Replacement string (supports $1, $<name> backreferences)',
        },
        flags: { type: 'string', description: 'Regex flags' },
        global: {
          type: 'boolean',
          description: 'Replace all matches (default: true)',
        },
      },
      required: ['input', 'pattern', 'replacement'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = regex.replace(
        args.input as string,
        args.pattern as string,
        args.replacement as string,
        {
          flags: args.flags as string,
          global: args.global as boolean,
        }
      );
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_regex_extract',
    description:
      'Extract all matches of a regex pattern from text. Returns matched strings and named groups.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Text to search' },
        pattern: { type: 'string', description: 'Regular expression pattern' },
        flags: { type: 'string', description: 'Regex flags' },
        caseInsensitive: {
          type: 'boolean',
          description: 'Case-insensitive matching',
        },
      },
      required: ['input', 'pattern'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = regex.extract(args.input as string, args.pattern as string, {
        flags: args.flags as string,
        caseInsensitive: args.caseInsensitive as boolean,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_regex_validate',
    description:
      'Validate a regex pattern for syntax correctness. Returns whether the pattern is valid with error details.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pattern: { type: 'string', description: 'Regular expression pattern to validate' },
        flags: { type: 'string', description: 'Optional regex flags to validate' },
      },
      required: ['pattern'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = regex.validate(args.pattern as string, args.flags as string);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
];
