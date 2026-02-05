export type IndentOption = 2 | 4 | 'tab';

export interface FormatOptions {
  indent?: IndentOption;
  sortKeys?: boolean;
}

export interface ValidationError {
  path: string;
  message: string;
  keyword: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

export type QueryDialect = 'jsonpath' | 'jmespath';

export interface QueryOptions {
  dialect?: QueryDialect;
}

export type ConvertFormat = 'json' | 'json5' | 'jsonc' | 'yaml' | 'toml';

export interface ConvertOptions {
  from: ConvertFormat;
  to: ConvertFormat;
  indent?: IndentOption;
}

export interface DiffOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: unknown;
  from?: string;
}

export interface DiffResult {
  identical: boolean;
  operations: DiffOperation[];
  summary: {
    added: number;
    removed: number;
    changed: number;
  };
}

export interface JsonStats {
  keys: number;
  depth: number;
  arrays: number;
  objects: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  sizeBytes: number;
}

export interface DetailedValidationError {
  path: string;
  message: string;
  keyword: string;
  expected?: unknown;
  received?: unknown;
  suggestion: string;
}

export interface SchemaCoverage {
  totalProperties: number;
  validProperties: number;
  missingRequired: string[];
  extraProperties: string[];
}

export interface SchemaValidationSummary {
  valid: boolean;
  summary: string;
  errorCount: number;
  errors: DetailedValidationError[];
  coverage: SchemaCoverage;
  suggestions: string[];
}
