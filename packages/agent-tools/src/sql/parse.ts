import { Parser } from 'node-sql-parser';
import type { SqlDialect, SqlParseResult, SqlValidationResult, SqlStats } from './types';

const parserDialectMap: Record<SqlDialect, string> = {
  mysql: 'MySQL',
  postgresql: 'PostgresQL',
  sqlite: 'SQLite',
  transactsql: 'TransactSQL',
  bigquery: 'BigQuery',
};

export function parse(
  input: string,
  dialect: SqlDialect = 'postgresql'
): SqlParseResult {
  const parser = new Parser();
  const dbType = parserDialectMap[dialect] ?? 'PostgresQL';
  const ast = parser.astify(input, { database: dbType });

  const stmts = Array.isArray(ast) ? ast : [ast];
  const tables = new Set<string>();
  const columns = new Set<string>();

  for (const stmt of stmts) {
    extractTablesAndColumns(stmt, tables, columns);
  }

  return {
    type: stmts[0]?.type ?? 'unknown',
    tables: Array.from(tables),
    columns: Array.from(columns),
    ast,
  };
}

export function validate(
  input: string,
  dialect: SqlDialect = 'postgresql'
): SqlValidationResult {
  const parser = new Parser();
  const dbType = parserDialectMap[dialect] ?? 'PostgresQL';

  try {
    const ast = parser.astify(input, { database: dbType });
    return { valid: true, ast };
  } catch (e) {
    return {
      valid: false,
      error: (e as Error).message,
    };
  }
}

export function getStats(
  input: string,
  dialect: SqlDialect = 'postgresql'
): SqlStats {
  const parser = new Parser();
  const dbType = parserDialectMap[dialect] ?? 'PostgresQL';

  const ast = parser.astify(input, { database: dbType });
  const stmts = Array.isArray(ast) ? ast : [ast];

  const queryTypes: Record<string, number> = {};
  const tables = new Set<string>();
  let joins = 0;

  for (const stmt of stmts) {
    const type = (stmt.type ?? 'unknown').toLowerCase();
    queryTypes[type] = (queryTypes[type] || 0) + 1;
    extractTablesAndColumns(stmt, tables, new Set());

    const stmtStr = JSON.stringify(stmt);
    const joinMatches = stmtStr.match(/"join"/gi);
    if (joinMatches) joins += joinMatches.length;
  }

  const subqueryRegex = /\bSELECT\b/gi;
  const selectMatches = input.match(subqueryRegex);
  const subqueries = Math.max(0, (selectMatches?.length ?? 0) - stmts.filter((s) => s.type === 'select').length);

  return {
    queryCount: stmts.length,
    queryTypes,
    tables: Array.from(tables),
    joins,
    subqueries,
  };
}

function extractTablesAndColumns(
  node: unknown,
  tables: Set<string>,
  columns: Set<string>
): void {
  if (!node || typeof node !== 'object') return;

  const obj = node as Record<string, unknown>;

  if (obj.table && typeof obj.table === 'string') {
    tables.add(obj.table);
  }

  if (obj.from && Array.isArray(obj.from)) {
    for (const item of obj.from) {
      if (item && typeof item === 'object' && 'table' in item) {
        tables.add(String(item.table));
      }
    }
  }

  if (obj.columns && Array.isArray(obj.columns)) {
    for (const col of obj.columns) {
      if (col && typeof col === 'object' && 'expr' in col) {
        const expr = col.expr as Record<string, unknown>;
        if (expr.type === 'column_ref' && typeof expr.column === 'string') {
          columns.add(expr.column);
        }
      }
    }
  }

  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        extractTablesAndColumns(item, tables, columns);
      }
    } else if (typeof value === 'object' && value !== null) {
      extractTablesAndColumns(value, tables, columns);
    }
  }
}
