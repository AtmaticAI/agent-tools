import { excel } from '@agent-tools/core';
import type { Skill, TaskInput, Part } from '../types';

export const excelSkill: Skill = {
  id: 'excel-operations',
  name: 'Excel Processing',
  description:
    'Parse, convert, analyze, and create Excel spreadsheets server-side',
  tags: ['excel', 'spreadsheet', 'xlsx', 'convert', 'data'],
  examples: [
    'Parse this Excel file to JSON',
    'Convert Excel sheet to CSV',
    'Get spreadsheet statistics',
    'List all sheets in a workbook',
    'Create an Excel file from JSON data',
  ],
  inputModes: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream',
  ],
  outputModes: ['application/json', 'text/csv', 'application/octet-stream'],
};

export async function handleExcelSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'parse': {
      const file = Buffer.from(data as string, 'base64');
      const result = await excel.parse(file, {
        sheet: options.sheet as string | number,
        header: options.header as boolean,
      });
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'convert': {
      const file = Buffer.from(data as string, 'base64');
      const result = await excel.convert(file, options.format as excel.ExcelConvertFormat, {
        sheet: options.sheet as string | number,
        header: options.header as boolean,
      });
      return [{ type: 'text', text: result }];
    }

    case 'stats': {
      const file = Buffer.from(data as string, 'base64');
      const result = await excel.getStats(file);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'getSheets': {
      const file = Buffer.from(data as string, 'base64');
      const result = await excel.getSheets(file);
      return [{ type: 'data', data: { sheets: result } }];
    }

    case 'create': {
      const records = data as Record<string, unknown>[];
      const result = await excel.createExcel(records, options.sheetName as string);
      return [
        {
          type: 'file',
          file: {
            name: (options.fileName as string) ?? 'output.xlsx',
            mimeType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    default:
      throw new Error(`Unknown Excel action: ${action}`);
  }
}
