import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { ValidationResult, ValidationError } from './types';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

export function validate(input: string, schema?: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: '',
          message: `Invalid JSON: ${(error as Error).message}`,
          keyword: 'parse',
        },
      ],
    };
  }

  if (!schema) {
    return { valid: true };
  }

  let schemaObj: object;
  try {
    schemaObj = JSON.parse(schema);
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: '',
          message: `Invalid schema: ${(error as Error).message}`,
          keyword: 'schema',
        },
      ],
    };
  }

  const validateFn = ajv.compile(schemaObj);
  const valid = validateFn(parsed);

  if (valid) {
    return { valid: true };
  }

  const errors: ValidationError[] = (validateFn.errors || []).map((err) => ({
    path: err.instancePath || '/',
    message: err.message || 'Unknown validation error',
    keyword: err.keyword,
  }));

  return { valid: false, errors };
}

export function isValidJson(input: string): boolean {
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}
