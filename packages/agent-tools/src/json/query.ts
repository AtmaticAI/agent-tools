import { JSONPath } from 'jsonpath-plus';
import jmespath from 'jmespath';
import type { QueryDialect, QueryOptions } from './types';

export function query(
  input: string,
  path: string,
  options: QueryOptions = {}
): unknown {
  const { dialect = 'jsonpath' } = options;

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    throw new Error(`Invalid JSON: ${(error as Error).message}`);
  }

  return queryValue(parsed, path, dialect);
}

export function queryValue(
  data: unknown,
  path: string,
  dialect: QueryDialect = 'jsonpath'
): unknown {
  if (dialect === 'jsonpath') {
    return JSONPath({ path, json: data as object, wrap: false });
  }

  if (dialect === 'jmespath') {
    return jmespath.search(data, path);
  }

  throw new Error(`Unknown query dialect: ${dialect}`);
}

export function queryMultiple(
  input: string,
  paths: string[],
  dialect: QueryDialect = 'jsonpath'
): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    throw new Error(`Invalid JSON: ${(error as Error).message}`);
  }

  const results: Record<string, unknown> = {};
  for (const path of paths) {
    results[path] = queryValue(parsed, path, dialect);
  }

  return results;
}
