import { markdown } from '@atmaticai/agent-tools-core';
import type { McpTool } from './index';

export const markdownTools: McpTool[] = [
  {
    name: 'agent_tools_markdown_convert',
    description:
      'Convert between Markdown, HTML, and plain text formats. Supports GitHub Flavored Markdown.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Input text to convert' },
        from: {
          type: 'string',
          enum: ['markdown', 'html', 'text'],
          description: 'Source format',
        },
        to: {
          type: 'string',
          enum: ['markdown', 'html', 'text'],
          description: 'Target format',
        },
        gfm: {
          type: 'boolean',
          description: 'Enable GitHub Flavored Markdown (default: true)',
        },
      },
      required: ['input', 'from', 'to'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = markdown.convert(args.input as string, {
        from: args.from as markdown.MarkdownConvertFormat,
        to: args.to as markdown.MarkdownConvertFormat,
        gfm: args.gfm as boolean,
      });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_markdown_toc',
    description:
      'Generate a table of contents from a Markdown document. Returns structured heading entries with levels and slugs.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Markdown text' },
        render: {
          type: 'boolean',
          description: 'Return rendered Markdown TOC instead of JSON (default: false)',
        },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const entries = markdown.generateToc(args.input as string);
      if (args.render) {
        const rendered = markdown.renderToc(entries);
        return { content: [{ type: 'text' as const, text: rendered }] };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(entries, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_markdown_links',
    description:
      'Extract all links from a Markdown document. Returns link text, URL, and line number for each link.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Markdown text' },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = markdown.extractLinks(args.input as string);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_markdown_frontmatter',
    description:
      'Extract YAML frontmatter from a Markdown document. Parses key-value pairs from the --- delimited header.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Markdown text with frontmatter' },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = markdown.extractFrontmatter(args.input as string);
      return {
        content: [
          {
            type: 'text' as const,
            text: result ? JSON.stringify(result, null, 2) : 'No frontmatter found',
          },
        ],
      };
    },
  },
  {
    name: 'agent_tools_markdown_stats',
    description:
      'Get statistics about a Markdown document: word count, headings, links, images, code blocks, lists, and more.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Markdown text to analyze' },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = markdown.getStats(args.input as string);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
];
