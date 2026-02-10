import type { CaseType } from './types';

function splitWords(input: string): string[] {
  // Split by camelCase boundaries, spaces, hyphens, underscores
  return input
    // Insert separator before uppercase letters that follow lowercase letters (camelCase boundary)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Insert separator before uppercase letters followed by lowercase (e.g. "HTMLParser" -> "HTML Parser")
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    // Replace hyphens and underscores with spaces
    .replace(/[-_]/g, ' ')
    // Split on whitespace
    .split(/\s+/)
    // Filter out empty strings
    .filter((word) => word.length > 0);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function convertCase(input: string, to: CaseType): string {
  const words = splitWords(input);

  if (words.length === 0) {
    return '';
  }

  switch (to) {
    case 'camel':
      return words
        .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
        .join('');

    case 'pascal':
      return words.map((word) => capitalize(word)).join('');

    case 'snake':
      return words.map((word) => word.toLowerCase()).join('_');

    case 'kebab':
      return words.map((word) => word.toLowerCase()).join('-');

    case 'constant':
      return words.map((word) => word.toUpperCase()).join('_');

    case 'title':
      return words.map((word) => capitalize(word)).join(' ');

    case 'sentence':
      return words
        .map((word, index) => (index === 0 ? capitalize(word) : word.toLowerCase()))
        .join(' ');

    case 'upper':
      return words.map((word) => word.toUpperCase()).join(' ');

    case 'lower':
      return words.map((word) => word.toLowerCase()).join(' ');
  }
}
