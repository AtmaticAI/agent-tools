import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type { XmlFormatOptions } from './types';

export function format(input: string, options: XmlFormatOptions = {}): string {
  const indent = options.indent ?? 2;

  const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    trimValues: true,
    parseAttributeValue: true,
    parseTagValue: true,
  });

  const parsed = parser.parse(input);

  const builder = new XMLBuilder({
    preserveOrder: true,
    ignoreAttributes: false,
    format: true,
    indentBy: ' '.repeat(indent),
    suppressEmptyNode: false,
  });

  return builder.build(parsed) as string;
}

export function minify(input: string): string {
  const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    trimValues: true,
    parseAttributeValue: true,
    parseTagValue: true,
  });

  const parsed = parser.parse(input);

  const builder = new XMLBuilder({
    preserveOrder: true,
    ignoreAttributes: false,
    format: false,
    suppressEmptyNode: false,
  });

  return builder.build(parsed) as string;
}
