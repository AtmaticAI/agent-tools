import type { RegexTestResult, RegexMatch, RegexOptions } from './types';
import { buildFlags } from './utils';

export function test(
  input: string,
  pattern: string,
  options: RegexOptions = {}
): RegexTestResult {
  const flags = buildFlags(options);
  const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
  const results: RegexMatch[] = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    results.push({
      match: match[0],
      index: match.index,
      groups: match.groups ? { ...match.groups } : {},
    });

    if (!flags.includes('g')) break;
  }

  return {
    matches: results.length > 0,
    matchCount: results.length,
    results,
  };
}
