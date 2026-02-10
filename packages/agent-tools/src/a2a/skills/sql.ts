import * as sql from '../../sql';
import type { Skill, TaskInput, Part } from '../types';

export const sqlSkill: Skill = {
  id: 'sql-operations',
  name: 'SQL Processing',
  description:
    'Format, minify, parse, validate, convert, and analyze SQL queries',
  tags: ['sql', 'format', 'parse', 'validate', 'convert'],
  examples: [
    'Format this SQL query',
    'Minify SQL by removing whitespace and comments',
    'Parse SQL to extract tables and columns',
    'Validate SQL syntax',
    'Convert SQL between dialects',
    'Get query statistics',
  ],
  inputModes: ['text/plain', 'application/sql'],
  outputModes: ['text/plain', 'application/json'],
};

export async function handleSqlSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'format': {
      const result = sql.format(data as string, {
        dialect: options.dialect as sql.SqlDialect,
        indent: options.indent as number,
        uppercase: options.uppercase as boolean,
        linesBetweenQueries: options.linesBetweenQueries as number,
      });
      return [{ type: 'text', text: result }];
    }

    case 'minify': {
      const result = sql.minify(data as string);
      return [{ type: 'text', text: result }];
    }

    case 'parse': {
      const result = sql.parse(data as string, options.dialect as sql.SqlDialect);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'validate': {
      const result = sql.validate(data as string, options.dialect as sql.SqlDialect);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'convert': {
      const result = sql.convert(data as string, {
        from: options.from as sql.SqlDialect,
        to: options.to as sql.SqlDialect,
      });
      return [{ type: 'text', text: result }];
    }

    case 'stats': {
      const result = sql.getStats(data as string, options.dialect as sql.SqlDialect);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown SQL action: ${action}`);
  }
}
