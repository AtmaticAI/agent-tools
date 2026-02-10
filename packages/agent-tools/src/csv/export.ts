import type { ExportOptions, ParseResult } from './types';
import { parse } from './parse';

export function exportData(input: string, options: ExportOptions): string {
  const result = parse(input);
  return exportFromData(result, options);
}

export function exportFromData(result: ParseResult, options: ExportOptions): string {
  const { format, headers = true, delimiter } = options;

  switch (format) {
    case 'csv':
      return toCSV(result.data, result.headers, delimiter || ',', headers);
    case 'tsv':
      return toCSV(result.data, result.headers, '\t', headers);
    case 'json':
      return JSON.stringify(result.data, null, 2);
    case 'jsonl':
      return result.data.map((row) => JSON.stringify(row)).join('\n');
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function toCSV(
  data: Record<string, unknown>[],
  headers: string[],
  delimiter: string,
  includeHeaders: boolean
): string {
  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(headers.map((h) => escapeField(h, delimiter)).join(delimiter));
  }

  for (const row of data) {
    lines.push(
      headers.map((h) => escapeField(row[h], delimiter)).join(delimiter)
    );
  }

  return lines.join('\n');
}

function escapeField(value: unknown, delimiter: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);
  const needsQuoting =
    str.includes(delimiter) || str.includes('"') || str.includes('\n');

  if (needsQuoting) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function toJson(input: string, pretty = true): string {
  const result = parse(input);
  return pretty
    ? JSON.stringify(result.data, null, 2)
    : JSON.stringify(result.data);
}

export function toJsonLines(input: string): string {
  const result = parse(input);
  return result.data.map((row) => JSON.stringify(row)).join('\n');
}

export function toArray(input: string): Record<string, unknown>[] {
  const result = parse(input);
  return result.data;
}
