import { XMLParser } from 'fast-xml-parser';
import type { XmlParseOptions } from './types';

export function parse(
  input: string,
  options: XmlParseOptions = {}
): Record<string, unknown> {
  const parser = new XMLParser({
    preserveOrder: options.preserveOrder ?? false,
    ignoreAttributes: options.ignoreAttributes ?? false,
    trimValues: options.trimValues ?? true,
    parseAttributeValue: true,
    parseTagValue: true,
  });

  return parser.parse(input) as Record<string, unknown>;
}
