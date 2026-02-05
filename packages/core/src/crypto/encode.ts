import type { EncodingFormat } from './types';

export function encode(input: string, format: EncodingFormat): string {
  switch (format) {
    case 'base64':
      return Buffer.from(input).toString('base64');
    case 'hex':
      return Buffer.from(input).toString('hex');
    case 'url':
      return encodeURIComponent(input);
    case 'html':
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    default:
      throw new Error(`Unsupported encoding format: ${format}`);
  }
}

export function decode(input: string, format: EncodingFormat): string {
  switch (format) {
    case 'base64':
      return Buffer.from(input, 'base64').toString('utf8');
    case 'hex':
      return Buffer.from(input, 'hex').toString('utf8');
    case 'url':
      return decodeURIComponent(input);
    case 'html':
      return input
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&gt;/g, '>')
        .replace(/&lt;/g, '<')
        .replace(/&amp;/g, '&');
    default:
      throw new Error(`Unsupported encoding format: ${format}`);
  }
}
