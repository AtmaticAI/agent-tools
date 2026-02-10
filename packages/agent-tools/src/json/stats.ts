import type { JsonStats } from './types';

export function getStats(input: string): JsonStats {
  const parsed = JSON.parse(input);

  const stats: JsonStats = {
    keys: 0,
    depth: 0,
    arrays: 0,
    objects: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
    sizeBytes: new TextEncoder().encode(input).length,
  };

  analyzeValue(parsed, stats, 0);

  return stats;
}

function analyzeValue(value: unknown, stats: JsonStats, depth: number): void {
  stats.depth = Math.max(stats.depth, depth);

  if (value === null) {
    stats.nulls++;
    return;
  }

  switch (typeof value) {
    case 'string':
      stats.strings++;
      break;
    case 'number':
      stats.numbers++;
      break;
    case 'boolean':
      stats.booleans++;
      break;
    case 'object':
      if (Array.isArray(value)) {
        stats.arrays++;
        for (const item of value) {
          analyzeValue(item, stats, depth + 1);
        }
      } else {
        stats.objects++;
        const keys = Object.keys(value as object);
        stats.keys += keys.length;
        for (const key of keys) {
          analyzeValue((value as Record<string, unknown>)[key], stats, depth + 1);
        }
      }
      break;
  }
}

export function getSizeInfo(input: string): {
  bytes: number;
  formatted: string;
  minifiedBytes: number;
  savings: number;
} {
  const bytes = new TextEncoder().encode(input).length;
  const minified = JSON.stringify(JSON.parse(input));
  const minifiedBytes = new TextEncoder().encode(minified).length;

  return {
    bytes,
    formatted: formatBytes(bytes),
    minifiedBytes,
    savings: bytes - minifiedBytes,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
