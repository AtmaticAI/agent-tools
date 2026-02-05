import { text } from '@agent-tools/core';

export const textTools = [
  {
    name: 'agent_tools_text_case',
    description:
      'Convert text between case formats: camel, snake, kebab, pascal, title, sentence, upper, lower, constant.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The text to convert',
        },
        to: {
          type: 'string',
          enum: ['camel', 'snake', 'kebab', 'pascal', 'title', 'sentence', 'upper', 'lower', 'constant'],
          description: 'Target case format',
        },
      },
      required: ['input', 'to'],
    },
    handler: async (args: { input: string; to: string }) => {
      try {
        const result = text.convertCase(args.input, args.to as text.CaseType);
        return { content: [{ type: 'text' as const, text: result }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_text_slugify',
    description:
      'Convert text to a URL-friendly slug.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The text to slugify',
        },
        separator: {
          type: 'string',
          description: 'Separator character (default: "-")',
        },
      },
      required: ['input'],
    },
    handler: async (args: { input: string; separator?: string }) => {
      try {
        const result = text.slugify(args.input, args.separator);
        return { content: [{ type: 'text' as const, text: result }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_text_stats',
    description:
      'Get text statistics: character count, word count, sentence count, paragraph count, lines, and reading time.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The text to analyze',
        },
      },
      required: ['input'],
    },
    handler: async (args: { input: string }) => {
      const result = text.getTextStats(args.input);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_text_truncate',
    description:
      'Truncate text to a specified length with word or character boundary.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: {
          type: 'string',
          description: 'The text to truncate',
        },
        length: {
          type: 'number',
          description: 'Maximum length',
        },
        boundary: {
          type: 'string',
          enum: ['character', 'word'],
          description: 'Truncation boundary (default: "word")',
        },
        suffix: {
          type: 'string',
          description: 'Suffix to append (default: "...")',
        },
      },
      required: ['input', 'length'],
    },
    handler: async (args: { input: string; length: number; boundary?: string; suffix?: string }) => {
      try {
        const result = text.truncate(args.input, {
          length: args.length,
          boundary: args.boundary as 'character' | 'word',
          suffix: args.suffix,
        });
        return { content: [{ type: 'text' as const, text: result }] };
      } catch (e) {
        return { isError: true, content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }] };
      }
    },
  },
  {
    name: 'agent_tools_text_lorem',
    description:
      'Generate Lorem Ipsum placeholder text.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        count: {
          type: 'number',
          description: 'Number of units to generate',
        },
        unit: {
          type: 'string',
          enum: ['words', 'sentences', 'paragraphs'],
          description: 'Unit type (default: "words")',
        },
      },
      required: ['count'],
    },
    handler: async (args: { count: number; unit?: string }) => {
      const result = text.generateLorem(args.count, args.unit as 'words' | 'sentences' | 'paragraphs');
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_text_similarity',
    description:
      'Compare two strings and return Levenshtein distance and similarity ratio (0-1).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        a: {
          type: 'string',
          description: 'First string',
        },
        b: {
          type: 'string',
          description: 'Second string',
        },
      },
      required: ['a', 'b'],
    },
    handler: async (args: { a: string; b: string }) => {
      const result = text.similarity(args.a, args.b);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_text_template',
    description:
      'Interpolate variables into a template string using {{key}} syntax. Reports missing keys.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        template: {
          type: 'string',
          description: 'Template string with {{key}} placeholders',
        },
        variables: {
          type: 'object',
          description: 'Key-value pairs for interpolation',
        },
      },
      required: ['template', 'variables'],
    },
    handler: async (args: { template: string; variables: Record<string, string> }) => {
      const result = text.interpolate(args.template, args.variables);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
];
