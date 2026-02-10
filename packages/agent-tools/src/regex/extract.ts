import type { RegexExtractResult, RegexOptions } from './types';
import { buildFlags } from './utils';

export function extract(
  input: string,
  pattern: string,
  options: RegexOptions = {}
): RegexExtractResult {
  const flags = buildFlags({ ...options, global: true });
  const regex = new RegExp(pattern, flags);
  const matches: string[] = [];
  const groups: Record<string, string>[] = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    matches.push(match[0]);
    if (match.groups) {
      groups.push({ ...match.groups });
    }
  }

  return {
    matches,
    groups,
    count: matches.length,
  };
}
