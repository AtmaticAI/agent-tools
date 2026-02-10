import { applyPatch, parsePatch } from 'diff';
import type { PatchOptions } from './types';

export function apply(
  input: string,
  patch: string,
  options: PatchOptions = {}
): string {
  const result = applyPatch(input, patch, {
    fuzzFactor: options.fuzz ?? 0,
  });

  if (result === false) {
    throw new Error('Failed to apply patch: patch does not match the input');
  }

  return result;
}

export function parsePatchFile(patch: string) {
  return parsePatch(patch);
}
