import { format as sqlFormat } from 'sql-formatter';
import type { SqlFormatOptions } from './types';

const dialectMap: Record<string, string> = {
  mysql: 'mysql',
  postgresql: 'postgresql',
  sqlite: 'sqlite',
  transactsql: 'transactsql',
  bigquery: 'bigquery',
};

export function format(input: string, options: SqlFormatOptions = {}): string {
  const language = dialectMap[options.dialect ?? 'postgresql'] ?? 'postgresql';

  return sqlFormat(input, {
    language: language as 'mysql' | 'postgresql' | 'sqlite' | 'transactsql' | 'bigquery',
    tabWidth: options.indent ?? 2,
    useTabs: false,
    keywordCase: options.uppercase !== false ? 'upper' : 'preserve',
    linesBetweenQueries: options.linesBetweenQueries ?? 2,
  });
}

export function minify(input: string): string {
  return input
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([,;()=<>+\-*/])\s*/g, '$1')
    .trim();
}
