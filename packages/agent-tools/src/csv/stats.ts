import type { ColumnStats, ParseResult } from './types';
import { parse } from './parse';

export function getStats(input: string): ColumnStats[] {
  const result = parse(input);
  return getStatsFromData(result);
}

export function getStatsFromData(result: ParseResult): ColumnStats[] {
  const { data, headers } = result;

  return headers.map((header) => {
    const values = data.map((row) => row[header]);
    return analyzeColumn(header, values);
  });
}

function analyzeColumn(name: string, values: unknown[]): ColumnStats {
  const nonNullValues = values.filter(
    (v) => v !== null && v !== undefined && v !== ''
  );

  const nullCount = values.length - nonNullValues.length;
  const type = detectType(nonNullValues);

  const stats: ColumnStats = {
    name,
    type,
    count: values.length,
    nullCount,
    uniqueCount: new Set(nonNullValues.map(String)).size,
  };

  if (type === 'number') {
    const numbers = nonNullValues.map(Number).filter((n) => !isNaN(n));
    if (numbers.length > 0) {
      stats.min = Math.min(...numbers);
      stats.max = Math.max(...numbers);
      stats.sum = numbers.reduce((a, b) => a + b, 0);
      stats.mean = stats.sum / numbers.length;
    }
  } else if (type === 'string' || type === 'date') {
    const sorted = [...nonNullValues].map(String).sort();
    if (sorted.length > 0) {
      stats.min = sorted[0];
      stats.max = sorted[sorted.length - 1];
    }
  }

  stats.topValues = getTopValues(nonNullValues, 5);

  return stats;
}

function detectType(
  values: unknown[]
): 'string' | 'number' | 'boolean' | 'date' | 'mixed' | 'empty' {
  if (values.length === 0) return 'empty';

  const types = new Set<string>();

  for (const value of values) {
    if (typeof value === 'number' || !isNaN(Number(value))) {
      types.add('number');
    } else if (typeof value === 'boolean' || value === 'true' || value === 'false') {
      types.add('boolean');
    } else if (isDateLike(String(value))) {
      types.add('date');
    } else {
      types.add('string');
    }
  }

  if (types.size === 1) {
    return types.values().next().value as 'string' | 'number' | 'boolean' | 'date';
  }

  if (types.size === 2 && types.has('number') && types.has('string')) {
    const numberRatio =
      values.filter((v) => !isNaN(Number(v))).length / values.length;
    if (numberRatio > 0.9) return 'number';
  }

  return 'mixed';
}

function isDateLike(value: string): boolean {
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
  ];
  return datePatterns.some((p) => p.test(value));
}

function getTopValues(
  values: unknown[],
  limit: number
): { value: unknown; count: number }[] {
  const counts = new Map<string, { value: unknown; count: number }>();

  for (const value of values) {
    const key = String(value);
    const existing = counts.get(key);
    if (existing) {
      existing.count++;
    } else {
      counts.set(key, { value, count: 1 });
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getColumnStats(input: string, column: string): ColumnStats | null {
  const stats = getStats(input);
  return stats.find((s) => s.name === column) || null;
}
