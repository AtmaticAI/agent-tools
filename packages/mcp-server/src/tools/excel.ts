import { excel } from '@agent-tools/core';
import type { McpTool } from './index';

export const excelTools: McpTool[] = [
  {
    name: 'agent_tools_excel_parse',
    description:
      'Parse an Excel file (XLSX) into JSON. Returns sheet info, headers, row data, and row count. Input file must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded Excel file',
        },
        sheet: {
          type: 'string',
          description: 'Sheet name or index to parse (default: first sheet)',
        },
        header: {
          type: 'boolean',
          description: 'Whether first row is headers (default: true)',
        },
      },
      required: ['file'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const sheetArg = args.sheet;
      const sheet = sheetArg !== undefined && !isNaN(Number(sheetArg)) ? Number(sheetArg) : (sheetArg as string | undefined);
      const result = await excel.parse(buffer, {
        sheet,
        header: args.header as boolean,
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_excel_convert',
    description:
      'Convert an Excel file to JSON, CSV, or TSV format. Input file must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded Excel file',
        },
        format: {
          type: 'string',
          enum: ['json', 'csv', 'tsv'],
          description: 'Target format',
        },
        sheet: {
          type: 'string',
          description: 'Sheet name or index (default: first sheet)',
        },
        header: {
          type: 'boolean',
          description: 'Whether first row is headers (default: true)',
        },
      },
      required: ['file', 'format'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await excel.convert(buffer, args.format as excel.ExcelConvertFormat, {
        sheet: args.sheet as string | undefined,
        header: args.header as boolean,
      });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_excel_stats',
    description:
      'Get statistics about an Excel file: sheet count, total rows, columns, and sheet details. Input file must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded Excel file',
        },
      },
      required: ['file'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await excel.getStats(buffer);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_excel_sheets',
    description:
      'List all sheets in an Excel file with their names, row counts, and column counts. Input file must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded Excel file',
        },
      },
      required: ['file'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await excel.getSheets(buffer);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_excel_create',
    description:
      'Create an Excel file from JSON data. Returns the file as base64-encoded XLSX.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        data: {
          type: 'string',
          description: 'JSON string of an array of objects to convert to Excel',
        },
        sheetName: {
          type: 'string',
          description: 'Name for the worksheet (default: Sheet1)',
        },
      },
      required: ['data'],
    },
    handler: async (args: Record<string, unknown>) => {
      const data = JSON.parse(args.data as string) as Record<string, unknown>[];
      const result = await excel.createExcel(data, args.sheetName as string);
      return {
        content: [
          {
            type: 'text' as const,
            text: Buffer.from(result).toString('base64'),
          },
        ],
      };
    },
  },
];
