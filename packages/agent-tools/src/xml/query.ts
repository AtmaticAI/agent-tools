import { XMLParser } from 'fast-xml-parser';
import type { XmlQueryResult } from './types';

export function query(input: string, path: string): XmlQueryResult {
  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
    parseAttributeValue: true,
    parseTagValue: true,
  });

  const parsed = parser.parse(input);
  const segments = path.replace(/^\/+/, '').split('/');
  const matches = resolvePath(parsed, segments);

  return {
    matches,
    count: matches.length,
  };
}

function resolvePath(obj: unknown, segments: string[]): unknown[] {
  if (segments.length === 0) {
    return obj !== undefined ? [obj] : [];
  }

  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return [];
  }

  const [current, ...rest] = segments;

  if (current === '*') {
    const results: unknown[] = [];
    for (const value of Object.values(obj as Record<string, unknown>)) {
      results.push(...resolvePath(value, rest));
    }
    return results;
  }

  const record = obj as Record<string, unknown>;
  if (current in record) {
    const value = record[current];
    if (Array.isArray(value)) {
      if (rest.length === 0) return value;
      const results: unknown[] = [];
      for (const item of value) {
        results.push(...resolvePath(item, rest));
      }
      return results;
    }
    return resolvePath(value, rest);
  }

  return [];
}
