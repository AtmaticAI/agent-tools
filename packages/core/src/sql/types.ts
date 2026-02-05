export type SqlDialect = 'mysql' | 'postgresql' | 'sqlite' | 'transactsql' | 'bigquery';

export interface SqlFormatOptions {
  dialect?: SqlDialect;
  indent?: number;
  uppercase?: boolean;
  linesBetweenQueries?: number;
}

export interface SqlValidationResult {
  valid: boolean;
  error?: string;
  ast?: unknown;
}

export interface SqlParseResult {
  type: string;
  tables: string[];
  columns: string[];
  ast: unknown;
}

export interface SqlConvertOptions {
  from?: SqlDialect;
  to: SqlDialect;
}

export interface SqlStats {
  queryCount: number;
  queryTypes: Record<string, number>;
  tables: string[];
  joins: number;
  subqueries: number;
}
