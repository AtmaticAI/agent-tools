import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { DetailedValidationError, SchemaCoverage, SchemaValidationSummary } from './types';

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

function countSchemaProperties(schema: Record<string, unknown>): {
  totalProperties: number;
  requiredFields: string[];
} {
  const props = schema.properties as Record<string, unknown> | undefined;
  const totalProperties = props ? Object.keys(props).length : 0;
  const requiredFields = (schema.required as string[]) || [];
  return { totalProperties, requiredFields };
}

function buildSuggestion(err: { keyword: string; instancePath: string; params?: Record<string, unknown>; schema?: unknown; data?: unknown }): string {
  const path = err.instancePath || '/';
  switch (err.keyword) {
    case 'type':
      return `Change value at '${path}' from ${typeof err.data} to ${err.schema}`;
    case 'required':
      return `Add missing required field '${(err.params as { missingProperty?: string })?.missingProperty}'`;
    case 'enum':
      return `Change value at '${path}' to one of: ${(err.schema as unknown[])?.join(', ')}`;
    case 'minimum':
      return `Adjust value at '${path}' to be >= ${err.schema}`;
    case 'maximum':
      return `Adjust value at '${path}' to be <= ${err.schema}`;
    case 'pattern':
      return `Change value at '${path}' to match pattern: ${err.schema}`;
    case 'additionalProperties':
      return `Remove unexpected property '${(err.params as { additionalProperty?: string })?.additionalProperty}'`;
    case 'minLength':
      return `Value at '${path}' must have at least ${err.schema} character(s)`;
    case 'maxLength':
      return `Value at '${path}' must have at most ${err.schema} character(s)`;
    case 'minItems':
      return `Array at '${path}' must have at least ${err.schema} item(s)`;
    case 'maxItems':
      return `Array at '${path}' must have at most ${err.schema} item(s)`;
    case 'format':
      return `Value at '${path}' must be a valid ${err.params?.format ?? err.schema}`;
    default:
      return `Fix value at '${path}': ${err.keyword}`;
  }
}

export function validateWithSummary(input: string, schema: string): SchemaValidationSummary {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    return {
      valid: false,
      summary: `Invalid JSON input: ${(error as Error).message}`,
      errorCount: 1,
      errors: [{
        path: '',
        message: `Invalid JSON: ${(error as Error).message}`,
        keyword: 'parse',
        suggestion: 'Fix JSON syntax errors before validating against a schema',
      }],
      coverage: { totalProperties: 0, validProperties: 0, missingRequired: [], extraProperties: [] },
      suggestions: ['Fix JSON syntax errors before validating against a schema'],
    };
  }

  let schemaObj: Record<string, unknown>;
  try {
    schemaObj = JSON.parse(schema);
  } catch (error) {
    return {
      valid: false,
      summary: `Invalid JSON Schema: ${(error as Error).message}`,
      errorCount: 1,
      errors: [{
        path: '',
        message: `Invalid schema: ${(error as Error).message}`,
        keyword: 'schema',
        suggestion: 'Fix the JSON Schema syntax before validating',
      }],
      coverage: { totalProperties: 0, validProperties: 0, missingRequired: [], extraProperties: [] },
      suggestions: ['Fix the JSON Schema syntax before validating'],
    };
  }

  const { totalProperties } = countSchemaProperties(schemaObj);
  const validateFn = ajv.compile(schemaObj);
  const valid = validateFn(parsed);

  if (valid) {
    return {
      valid: true,
      summary: `Validation passed. All ${totalProperties} schema properties satisfied (100%).`,
      errorCount: 0,
      errors: [],
      coverage: {
        totalProperties,
        validProperties: totalProperties,
        missingRequired: [],
        extraProperties: [],
      },
      suggestions: [],
    };
  }

  const ajvErrors = validateFn.errors || [];

  const missingRequired: string[] = [];
  const extraProperties: string[] = [];
  const errors: DetailedValidationError[] = ajvErrors.map((err) => {
    if (err.keyword === 'required') {
      const field = (err.params as { missingProperty?: string })?.missingProperty;
      if (field) missingRequired.push(field);
    }
    if (err.keyword === 'additionalProperties') {
      const prop = (err.params as { additionalProperty?: string })?.additionalProperty;
      if (prop) extraProperties.push(prop);
    }

    return {
      path: err.instancePath || '/',
      message: err.message || 'Unknown validation error',
      keyword: err.keyword,
      expected: err.schema,
      received: err.data,
      suggestion: buildSuggestion({
        keyword: err.keyword,
        instancePath: err.instancePath,
        params: err.params as Record<string, unknown>,
        schema: err.schema,
        data: err.data,
      }),
    };
  });

  const propertyErrorCount = new Set(
    ajvErrors
      .filter((e) => e.keyword !== 'required' && e.keyword !== 'additionalProperties')
      .map((e) => e.instancePath)
  ).size;
  const validProperties = Math.max(0, totalProperties - missingRequired.length - propertyErrorCount);

  const coverage: SchemaCoverage = {
    totalProperties,
    validProperties,
    missingRequired,
    extraProperties,
  };

  const pct = totalProperties > 0 ? Math.round((validProperties / totalProperties) * 100) : 0;
  const parts: string[] = [
    `Validation failed with ${errors.length} error(s).`,
  ];
  if (totalProperties > 0) {
    parts.push(`${validProperties} of ${totalProperties} schema properties satisfied (${pct}%).`);
  }
  if (missingRequired.length > 0) {
    parts.push(`Missing required: ${missingRequired.join(', ')}.`);
  }
  if (extraProperties.length > 0) {
    parts.push(`Unexpected properties: ${extraProperties.join(', ')}.`);
  }

  const suggestions = [...new Set(errors.map((e) => e.suggestion))];

  return {
    valid: false,
    summary: parts.join(' '),
    errorCount: errors.length,
    errors,
    coverage,
    suggestions,
  };
}
