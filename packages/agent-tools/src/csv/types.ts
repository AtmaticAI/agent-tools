export interface ParseOptions {
  delimiter?: string;
  header?: boolean;
  skipRows?: number;
  trimFields?: boolean;
  dynamicTyping?: boolean;
}

export interface ParseResult {
  data: Record<string, unknown>[];
  headers: string[];
  rowCount: number;
  errors: ParseError[];
}

export interface ParseError {
  row: number;
  message: string;
}

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'matches'
  | 'isNull'
  | 'isNotNull';

export interface Filter {
  column: string;
  operator: FilterOperator;
  value?: unknown;
}

export interface ColumnStats {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'mixed' | 'empty';
  count: number;
  nullCount: number;
  uniqueCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  sum?: number;
  topValues?: { value: unknown; count: number }[];
}

export interface TransformOptions {
  rename?: Record<string, string>;
  select?: string[];
  exclude?: string[];
  derive?: Record<string, (row: Record<string, unknown>) => unknown>;
}

export type ExportFormat = 'csv' | 'json' | 'jsonl' | 'tsv';

export interface ExportOptions {
  format: ExportFormat;
  headers?: boolean;
  delimiter?: string;
}
