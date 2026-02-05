import { XMLValidator } from 'fast-xml-parser';
import type { XmlValidationResult } from './types';

export function validate(input: string): XmlValidationResult {
  const result = XMLValidator.validate(input, {
    allowBooleanAttributes: true,
  });

  if (result === true) {
    return { valid: true, errors: [] };
  }

  return {
    valid: false,
    errors: [
      {
        line: (result as { err: { line: number; msg: string } }).err.line,
        message: (result as { err: { line: number; msg: string } }).err.msg,
      },
    ],
  };
}
