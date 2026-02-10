import type { TemplateResult } from './types';

export function interpolate(
  template: string,
  variables: Record<string, string>,
): TemplateResult {
  const missingKeys: string[] = [];

  const result = template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
    if (key in variables) {
      return variables[key];
    }
    missingKeys.push(key);
    return match;
  });

  // Deduplicate missing keys while preserving order
  const uniqueMissingKeys = [...new Set(missingKeys)];

  return { result, missingKeys: uniqueMissingKeys };
}
