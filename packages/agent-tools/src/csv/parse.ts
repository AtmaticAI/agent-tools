import Papa from 'papaparse';
import type { ParseOptions, ParseResult, ParseError } from './types';

export function parse(input: string, options: ParseOptions = {}): ParseResult {
  const {
    delimiter = ',',
    header = true,
    skipRows = 0,
    trimFields = true,
    dynamicTyping = true,
  } = options;

  let processedInput = input;
  if (skipRows > 0) {
    const lines = input.split('\n');
    processedInput = lines.slice(skipRows).join('\n');
  }

  const result = Papa.parse(processedInput, {
    delimiter,
    header,
    skipEmptyLines: true,
    transformHeader: trimFields ? (h) => h.trim() : undefined,
    transform: trimFields ? (v) => v.trim() : undefined,
    dynamicTyping,
  });

  const errors: ParseError[] = result.errors.map((e) => ({
    row: e.row ?? -1,
    message: e.message,
  }));

  const headers = header
    ? (result.meta.fields || [])
    : Array.from({ length: (result.data[0] as unknown[])?.length || 0 }, (_, i) => `col_${i}`);

  const data = header
    ? (result.data as Record<string, unknown>[])
    : (result.data as unknown[][]).map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      });

  return {
    data,
    headers,
    rowCount: data.length,
    errors,
  };
}

export function parseToArray(input: string, options: ParseOptions = {}): unknown[][] {
  const result = parse(input, { ...options, header: false });
  return result.data.map((row) => Object.values(row));
}

export function detectDelimiter(input: string): string {
  const delimiters = [',', '\t', ';', '|'];
  const firstLine = input.split('\n')[0];

  let maxCount = 0;
  let detected = ',';

  for (const d of delimiters) {
    const count = (firstLine.match(new RegExp(`\\${d}`, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      detected = d;
    }
  }

  return detected;
}

export function getHeaders(input: string, delimiter?: string): string[] {
  const d = delimiter || detectDelimiter(input);
  const firstLine = input.split('\n')[0];
  return Papa.parse(firstLine, { delimiter: d }).data[0] as string[];
}
