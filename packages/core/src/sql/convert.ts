import { Parser } from 'node-sql-parser';
import type { SqlConvertOptions, SqlDialect } from './types';

const parserDialectMap: Record<SqlDialect, string> = {
  mysql: 'MySQL',
  postgresql: 'PostgresQL',
  sqlite: 'SQLite',
  transactsql: 'TransactSQL',
  bigquery: 'BigQuery',
};

export function convert(
  input: string,
  options: SqlConvertOptions
): string {
  const fromDialect = parserDialectMap[options.from ?? 'postgresql'] ?? 'PostgresQL';
  const toDialect = parserDialectMap[options.to] ?? 'PostgresQL';

  const parser = new Parser();
  const ast = parser.astify(input, { database: fromDialect });
  return parser.sqlify(ast, { database: toDialect });
}
