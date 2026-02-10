import * as sql from '../sql';
import type { McpTool } from './index';

export const sqlTools: McpTool[] = [
  {
    name: 'agent_tools_sql_format',
    description:
      'Format SQL queries with configurable dialect, indentation, and keyword casing. Supports MySQL, PostgreSQL, SQLite, TransactSQL, BigQuery.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'SQL query to format' },
        dialect: {
          type: 'string',
          enum: ['mysql', 'postgresql', 'sqlite', 'transactsql', 'bigquery'],
          description: 'SQL dialect (default: postgresql)',
        },
        indent: {
          type: 'number',
          description: 'Indentation spaces (default: 2)',
        },
        uppercase: {
          type: 'boolean',
          description: 'Uppercase SQL keywords (default: true)',
        },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = sql.format(args.input as string, {
        dialect: args.dialect as sql.SqlDialect,
        indent: args.indent as number,
        uppercase: args.uppercase as boolean,
      });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_sql_minify',
    description: 'Minify SQL by removing comments and excess whitespace.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'SQL query to minify' },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = sql.minify(args.input as string);
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_sql_parse',
    description:
      'Parse a SQL query into an AST. Returns query type, referenced tables, and columns.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'SQL query to parse' },
        dialect: {
          type: 'string',
          enum: ['mysql', 'postgresql', 'sqlite', 'transactsql', 'bigquery'],
          description: 'SQL dialect (default: postgresql)',
        },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = sql.parse(args.input as string, args.dialect as sql.SqlDialect);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_sql_validate',
    description:
      'Validate SQL syntax. Returns whether the query is syntactically correct with error details.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'SQL query to validate' },
        dialect: {
          type: 'string',
          enum: ['mysql', 'postgresql', 'sqlite', 'transactsql', 'bigquery'],
          description: 'SQL dialect (default: postgresql)',
        },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = sql.validate(args.input as string, args.dialect as sql.SqlDialect);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_sql_convert',
    description:
      'Convert SQL between dialects (MySQL, PostgreSQL, SQLite, TransactSQL, BigQuery).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'SQL query to convert' },
        from: {
          type: 'string',
          enum: ['mysql', 'postgresql', 'sqlite', 'transactsql', 'bigquery'],
          description: 'Source dialect',
        },
        to: {
          type: 'string',
          enum: ['mysql', 'postgresql', 'sqlite', 'transactsql', 'bigquery'],
          description: 'Target dialect',
        },
      },
      required: ['input', 'to'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = sql.convert(args.input as string, {
        from: args.from as sql.SqlDialect,
        to: args.to as sql.SqlDialect,
      });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_sql_stats',
    description:
      'Analyze SQL queries. Returns query count, types, referenced tables, joins, and subqueries.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        input: { type: 'string', description: 'SQL queries to analyze' },
        dialect: {
          type: 'string',
          enum: ['mysql', 'postgresql', 'sqlite', 'transactsql', 'bigquery'],
          description: 'SQL dialect (default: postgresql)',
        },
      },
      required: ['input'],
    },
    handler: async (args: Record<string, unknown>) => {
      const result = sql.getStats(args.input as string, args.dialect as sql.SqlDialect);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
];
