import { csv } from '@atmaticai/agent-tools-core';
import type { Skill, TaskInput, Part } from '../types';

export const csvSkill: Skill = {
  id: 'csv-operations',
  name: 'CSV Processing',
  description: 'Parse, filter, transform, and export CSV data with type inference',
  tags: ['csv', 'tabular', 'data', 'export', 'filter'],
  examples: [
    'Parse CSV and convert to JSON',
    'Filter rows where status = active',
    'Get column statistics',
    'Export to TSV format',
    'Select specific columns',
  ],
  inputModes: ['text/csv', 'text/plain'],
  outputModes: ['application/json', 'text/csv', 'text/plain'],
};

export async function handleCsvSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'parse': {
      const result = csv.parse(data as string, {
        delimiter: options.delimiter as string,
        header: options.header as boolean,
        skipRows: options.skipRows as number,
      });
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'toJson': {
      const result = csv.toJson(data as string, options.pretty as boolean);
      return [{ type: 'text', text: result }];
    }

    case 'filter': {
      const result = csv.filter(data as string, options.filters as csv.Filter[]);
      return [{ type: 'text', text: result }];
    }

    case 'stats': {
      const result = csv.getStats(data as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'transform': {
      const result = csv.transform(data as string, {
        select: options.select as string[],
        exclude: options.exclude as string[],
        rename: options.rename as Record<string, string>,
      });
      return [{ type: 'text', text: result }];
    }

    case 'export': {
      const result = csv.exportData(data as string, {
        format: options.format as csv.ExportFormat,
        headers: options.headers as boolean,
      });
      return [{ type: 'text', text: result }];
    }

    default:
      throw new Error(`Unknown CSV action: ${action}`);
  }
}
