import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import type { XmlConvertFormat } from './types';

export function convert(
  input: string,
  from: XmlConvertFormat,
  to: XmlConvertFormat
): string {
  if (from === to) return input;

  if (from === 'xml' && to === 'json') {
    const parser = new XMLParser({
      ignoreAttributes: false,
      trimValues: true,
      parseAttributeValue: true,
      parseTagValue: true,
    });
    return JSON.stringify(parser.parse(input), null, 2);
  }

  if (from === 'json' && to === 'xml') {
    const data = JSON.parse(input);
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      indentBy: '  ',
      suppressEmptyNode: false,
    });
    return builder.build(data) as string;
  }

  throw new Error(`Unsupported conversion: ${from} -> ${to}`);
}
