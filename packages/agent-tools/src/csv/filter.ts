import type { Filter, FilterOperator } from './types';
import { parse } from './parse';

export function filter(input: string, filters: Filter[]): string {
  const result = parse(input);
  const filteredData = filterData(result.data, filters);
  return toCSV(filteredData, result.headers);
}

export function filterData(
  data: Record<string, unknown>[],
  filters: Filter[]
): Record<string, unknown>[] {
  return data.filter((row) => {
    return filters.every((f) => matchesFilter(row, f));
  });
}

function matchesFilter(row: Record<string, unknown>, filter: Filter): boolean {
  const value = row[filter.column];
  const filterValue = filter.value;

  switch (filter.operator) {
    case 'eq':
      return value === filterValue;
    case 'neq':
      return value !== filterValue;
    case 'gt':
      return Number(value) > Number(filterValue);
    case 'gte':
      return Number(value) >= Number(filterValue);
    case 'lt':
      return Number(value) < Number(filterValue);
    case 'lte':
      return Number(value) <= Number(filterValue);
    case 'contains':
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'startsWith':
      return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
    case 'endsWith':
      return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
    case 'matches':
      return new RegExp(String(filterValue), 'i').test(String(value));
    case 'isNull':
      return value === null || value === undefined || value === '';
    case 'isNotNull':
      return value !== null && value !== undefined && value !== '';
    default:
      return true;
  }
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

export function filterByColumn(
  input: string,
  column: string,
  operator: FilterOperator,
  value?: unknown
): string {
  return filter(input, [{ column, operator, value }]);
}
