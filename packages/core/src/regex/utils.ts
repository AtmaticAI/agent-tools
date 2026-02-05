import type { RegexOptions } from './types';

export function buildFlags(options: RegexOptions): string {
  let flags = options.flags ?? '';

  if (options.global && !flags.includes('g')) flags += 'g';
  if (options.caseInsensitive && !flags.includes('i')) flags += 'i';
  if (options.multiline && !flags.includes('m')) flags += 'm';

  return flags;
}
