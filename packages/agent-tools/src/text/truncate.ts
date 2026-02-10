import type { TruncateOptions } from './types';

export function truncate(input: string, options: TruncateOptions): string {
  const { length, boundary = 'word', suffix = '...' } = options;

  if (input.length <= length) {
    return input;
  }

  const maxContentLength = length - suffix.length;

  if (maxContentLength <= 0) {
    return suffix.slice(0, length);
  }

  if (boundary === 'character') {
    return input.slice(0, maxContentLength) + suffix;
  }

  // Word boundary: find last space before maxContentLength
  const truncated = input.slice(0, maxContentLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex === -1) {
    // No space found, fall back to character boundary
    return truncated + suffix;
  }

  return input.slice(0, lastSpaceIndex) + suffix;
}
