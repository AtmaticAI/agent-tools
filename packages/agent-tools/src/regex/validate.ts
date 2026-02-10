import type { RegexValidationResult } from './types';

export function validate(pattern: string, flags?: string): RegexValidationResult {
  try {
    new RegExp(pattern, flags);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: (e as Error).message,
    };
  }
}
