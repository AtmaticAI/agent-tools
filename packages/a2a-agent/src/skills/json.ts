import { json } from '@atmaticai/agent-tools-core';
import type { Skill, TaskInput, Part } from '../types';

export const jsonSkill: Skill = {
  id: 'json-operations',
  name: 'JSON Processing',
  description:
    'Format, validate, query, convert, and diff JSON documents with guaranteed correctness',
  tags: ['json', 'format', 'validate', 'transform', 'query'],
  examples: [
    'Format this JSON with 2-space indent',
    'Validate against JSON Schema',
    'Convert JSON to YAML',
    'Query with JSONPath: $.store.book[*].author',
    'Compare two JSON documents',
    'Validate with detailed schema coverage and fix suggestions',
  ],
  inputModes: ['application/json', 'text/plain'],
  outputModes: ['application/json', 'text/plain'],
};

export async function handleJsonSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'format': {
      const result = json.format(data as string, {
        indent: (options.indent as 2 | 4) || 2,
        sortKeys: options.sortKeys as boolean,
      });
      return [{ type: 'text', text: result }];
    }

    case 'minify': {
      const result = json.minify(data as string);
      return [{ type: 'text', text: result }];
    }

    case 'validate': {
      const result = json.validate(data as string, options.schema as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'query': {
      const result = json.query(data as string, options.path as string, {
        dialect: options.dialect as 'jsonpath' | 'jmespath',
      });
      return [{ type: 'data', data: { result } }];
    }

    case 'convert': {
      const result = json.convert(data as string, {
        from: options.from as json.ConvertFormat,
        to: options.to as json.ConvertFormat,
      });
      return [{ type: 'text', text: result }];
    }

    case 'diff': {
      const { a, b } = data as { a: string; b: string };
      const result = json.diff(a, b);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'stats': {
      const result = json.getStats(data as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'schemaValidate': {
      const result = json.validateWithSummary(data as string, options.schema as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown JSON action: ${action}`);
  }
}
