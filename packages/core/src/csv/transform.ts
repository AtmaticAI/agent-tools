import type { TransformOptions, ParseResult } from './types';
import { parse } from './parse';

export function transform(input: string, options: TransformOptions): string {
  const result = parse(input);
  const transformed = transformData(result, options);
  return toCSV(transformed.data, transformed.headers);
}

export function transformData(
  result: ParseResult,
  options: TransformOptions
): ParseResult {
  let { data, headers } = result;

  if (options.select) {
    headers = options.select.filter((h) => headers.includes(h));
  }

  if (options.exclude) {
    headers = headers.filter((h) => !options.exclude!.includes(h));
  }

  if (options.rename) {
    headers = headers.map((h) => options.rename![h] || h);
  }

  data = data.map((row) => {
    const newRow: Record<string, unknown> = {};

    for (const header of result.headers) {
      if (options.select && !options.select.includes(header)) continue;
      if (options.exclude && options.exclude.includes(header)) continue;

      const newKey = options.rename?.[header] || header;
      newRow[newKey] = row[header];
    }

    if (options.derive) {
      for (const [key, fn] of Object.entries(options.derive)) {
        newRow[key] = fn(row);
      }
    }

    return newRow;
  });

  if (options.derive) {
    headers = [...headers, ...Object.keys(options.derive)];
  }

  return { data, headers, rowCount: data.length, errors: [] };
}

function toCSV(data: Record<string, unknown>[], headers: string[]): string {
  const headerRow = headers.map(escapeCSVField).join(',');
  const dataRows = data.map((row) =>
    headers.map((h) => escapeCSVField(row[h])).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
}

function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function sortData(
  data: Record<string, unknown>[],
  column: string,
  direction: 'asc' | 'desc' = 'asc'
): Record<string, unknown>[] {
  return [...data].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const comparison =
      typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));

    return direction === 'asc' ? comparison : -comparison;
  });
}
