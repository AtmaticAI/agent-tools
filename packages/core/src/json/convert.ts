import JSON5 from 'json5';
import yaml from 'js-yaml';
import * as TOML from 'smol-toml';
import type { ConvertFormat, ConvertOptions, IndentOption } from './types';

function getIndent(indent: IndentOption = 2): number {
  if (indent === 'tab') return 2;
  return indent;
}

function parseInput(input: string, from: ConvertFormat): unknown {
  switch (from) {
    case 'json':
      return JSON.parse(input);
    case 'json5':
    case 'jsonc':
      return JSON5.parse(input);
    case 'yaml':
      return yaml.load(input);
    case 'toml':
      return TOML.parse(input);
    default:
      throw new Error(`Unsupported input format: ${from}`);
  }
}

function stringifyOutput(
  data: unknown,
  to: ConvertFormat,
  indent: IndentOption = 2
): string {
  const indentNum = getIndent(indent);

  switch (to) {
    case 'json':
      return JSON.stringify(data, null, indentNum);
    case 'json5':
    case 'jsonc':
      return JSON5.stringify(data, null, indentNum);
    case 'yaml':
      return yaml.dump(data, { indent: indentNum, lineWidth: -1 });
    case 'toml':
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        throw new Error('TOML requires a root object');
      }
      return TOML.stringify(data as Record<string, unknown>);
    default:
      throw new Error(`Unsupported output format: ${to}`);
  }
}

export function convert(input: string, options: ConvertOptions): string {
  const { from, to, indent = 2 } = options;

  if (from === to) {
    const parsed = parseInput(input, from);
    return stringifyOutput(parsed, to, indent);
  }

  const parsed = parseInput(input, from);
  return stringifyOutput(parsed, to, indent);
}

export function toJson(input: string, from: ConvertFormat): string {
  return convert(input, { from, to: 'json' });
}

export function fromJson(input: string, to: ConvertFormat): string {
  return convert(input, { from: 'json', to });
}

export function detectFormat(input: string): ConvertFormat | null {
  const trimmed = input.trim();

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      try {
        JSON5.parse(trimmed);
        return 'json5';
      } catch {
        return null;
      }
    }
  }

  if (trimmed.includes(':') && !trimmed.includes('=')) {
    try {
      yaml.load(trimmed);
      return 'yaml';
    } catch {
      return null;
    }
  }

  if (trimmed.includes('=') && (trimmed.includes('[') || trimmed.includes('"'))) {
    try {
      TOML.parse(trimmed);
      return 'toml';
    } catch {
      return null;
    }
  }

  return null;
}
