import { xml } from '@atmaticai/agent-tools-core';
import type { McpTool } from './index';

export const xmlTools: McpTool[] = [
  {
    name: 'agent_tools_xml_parse',
    description:
      'Parse XML string into a JSON object representation. Supports attributes, nested elements, and text nodes.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'XML string to parse' },
        ignoreAttributes: {
          type: 'boolean',
          description: 'Whether to ignore XML attributes (default: false)',
        },
        trimValues: {
          type: 'boolean',
          description: 'Whether to trim text values (default: true)',
        },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = xml.parse(args.input as string, {
        ignoreAttributes: args.ignoreAttributes as boolean,
        trimValues: args.trimValues as boolean,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_xml_format',
    description:
      'Pretty-print XML with configurable indentation. Reformats XML to be human-readable.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'XML string to format' },
        indent: {
          type: 'number',
          description: 'Number of spaces for indentation (default: 2)',
        },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = xml.format(args.input as string, {
        indent: (args.indent as number) || 2,
      });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_xml_minify',
    description: 'Minify XML by removing unnecessary whitespace and formatting.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'XML string to minify' },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = xml.minify(args.input as string);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_xml_validate',
    description:
      'Validate XML syntax. Returns whether the XML is well-formed with error details if invalid.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'XML string to validate' },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = xml.validate(args.input as string);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_xml_query',
    description:
      'Query XML using a simplified path expression (e.g., "root/items/item"). Returns matching nodes.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'XML string to query' },
        path: {
          type: 'string',
          description: 'Path expression (e.g., "catalog/book/title")',
        },
      },
      required: ['input', 'path'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = xml.query(args.input as string, args.path as string);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_xml_convert',
    description: 'Convert between XML and JSON formats.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'Input string to convert' },
        from: {
          type: 'string',
          enum: ['xml', 'json'],
          description: 'Source format',
        },
        to: {
          type: 'string',
          enum: ['xml', 'json'],
          description: 'Target format',
        },
      },
      required: ['input', 'from', 'to'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = xml.convert(
        args.input as string,
        args.from as xml.XmlConvertFormat,
        args.to as xml.XmlConvertFormat
      );
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_xml_stats',
    description:
      'Get statistics about an XML document: element count, attribute count, text nodes, depth, and size.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'XML string to analyze' },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = xml.getStats(args.input as string);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
];
