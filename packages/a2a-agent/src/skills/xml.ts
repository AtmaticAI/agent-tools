import { xml } from '@agent-tools/core';
import type { Skill, TaskInput, Part } from '../types';

export const xmlSkill: Skill = {
  id: 'xml-operations',
  name: 'XML Processing',
  description:
    'Parse, format, minify, validate, query, convert, and analyze XML documents',
  tags: ['xml', 'format', 'validate', 'query', 'convert'],
  examples: [
    'Format this XML with 4-space indent',
    'Validate XML structure',
    'Query elements with path /root/items/item',
    'Convert XML to JSON',
    'Get XML document statistics',
  ],
  inputModes: ['application/xml', 'text/xml', 'text/plain'],
  outputModes: ['application/xml', 'application/json', 'text/plain'],
};

export async function handleXmlSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'parse': {
      const result = xml.parse(data as string, {
        preserveOrder: options.preserveOrder as boolean,
        ignoreAttributes: options.ignoreAttributes as boolean,
        trimValues: options.trimValues as boolean,
      });
      return [{ type: 'data', data: result }];
    }

    case 'format': {
      const result = xml.format(data as string, {
        indent: options.indent as number,
      });
      return [{ type: 'text', text: result }];
    }

    case 'minify': {
      const result = xml.minify(data as string);
      return [{ type: 'text', text: result }];
    }

    case 'validate': {
      const result = xml.validate(data as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'query': {
      const result = xml.query(data as string, options.path as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'convert': {
      const result = xml.convert(
        data as string,
        options.from as xml.XmlConvertFormat,
        options.to as xml.XmlConvertFormat,
      );
      return [{ type: 'text', text: result }];
    }

    case 'stats': {
      const result = xml.getStats(data as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown XML action: ${action}`);
  }
}
