export function slugify(input: string, separator: string = '-'): string {
  return input
    // Convert to lowercase
    .toLowerCase()
    // Replace non-alphanumeric chars with separator
    .replace(/[^a-z0-9]+/g, separator)
    // Collapse multiple separators
    .replace(new RegExp(`${escapeRegExp(separator)}+`, 'g'), separator)
    // Trim separators from ends
    .replace(new RegExp(`^${escapeRegExp(separator)}|${escapeRegExp(separator)}$`, 'g'), '');
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
