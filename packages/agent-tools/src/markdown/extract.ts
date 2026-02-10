import type { MarkdownLinkInfo, MarkdownFrontmatter } from './types';

export function extractLinks(input: string): MarkdownLinkInfo[] {
  const links: MarkdownLinkInfo[] = [];
  const lines = input.split('\n');
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;

  for (let i = 0; i < lines.length; i++) {
    let match;
    while ((match = linkRegex.exec(lines[i])) !== null) {
      links.push({
        text: match[1],
        href: match[2],
        line: i + 1,
      });
    }
  }

  return links;
}

export function extractFrontmatter(input: string): MarkdownFrontmatter | null {
  const match = input.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return null;

  const frontmatter: MarkdownFrontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value: unknown = line.substring(colonIndex + 1).trim();

    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (!isNaN(Number(value)) && value !== '') value = Number(value);
    else if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s: string) => s.trim().replace(/^['"]|['"]$/g, ''));
    }

    frontmatter[key] = value;
  }

  return frontmatter;
}

export function stripFrontmatter(input: string): string {
  return input.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
}
