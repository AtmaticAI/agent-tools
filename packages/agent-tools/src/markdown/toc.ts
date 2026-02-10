import type { MarkdownTocEntry } from './types';

export function generateToc(input: string): MarkdownTocEntry[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const entries: MarkdownTocEntry[] = [];
  let match;

  while ((match = headingRegex.exec(input)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const slug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    entries.push({ level, text, slug });
  }

  return entries;
}

export function renderToc(entries: MarkdownTocEntry[]): string {
  if (entries.length === 0) return '';

  const minLevel = Math.min(...entries.map((e) => e.level));

  return entries
    .map((entry) => {
      const indent = '  '.repeat(entry.level - minLevel);
      return `${indent}- [${entry.text}](#${entry.slug})`;
    })
    .join('\n');
}
