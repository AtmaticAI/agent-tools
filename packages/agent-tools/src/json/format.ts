import type { FormatOptions, IndentOption } from './types';

function getIndentString(indent: IndentOption): string | number {
  if (indent === 'tab') return '\t';
  return indent;
}

function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj as Record<string, unknown>).sort();

  for (const key of keys) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
  }

  return sorted;
}

export function format(input: string, options: FormatOptions = {}): string {
  const { indent = 2, sortKeys = false } = options;

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    throw new Error(`Invalid JSON: ${(error as Error).message}`);
  }

  if (sortKeys) {
    parsed = sortObjectKeys(parsed);
  }

  const indentValue = getIndentString(indent);
  return JSON.stringify(parsed, null, indentValue);
}

export function minify(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

export function parse(input: string): unknown {
  return JSON.parse(input);
}

export function stringify(value: unknown, options: FormatOptions = {}): string {
  const { indent = 2, sortKeys = false } = options;

  let data = value;
  if (sortKeys) {
    data = sortObjectKeys(value);
  }

  const indentValue = getIndentString(indent);
  return JSON.stringify(data, null, indentValue);
}
