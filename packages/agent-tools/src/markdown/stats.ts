import type { MarkdownStats } from './types';

export function getStats(input: string): MarkdownStats {
  const lines = input.split('\n');
  const text = input.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');

  const headings = (text.match(/^#{1,6}\s+.+$/gm) || []).length;
  const links = (input.match(/\[([^\]]*)\]\(([^)]+)\)/g) || []).length;
  const images = (input.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length;
  const codeBlocks = (input.match(/```/g) || []).length / 2;
  const lists = (text.match(/^[\s]*[-*+]\s+|^[\s]*\d+\.\s+/gm) || []).length;

  const plainText = text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .trim();

  const words = plainText.split(/\s+/).filter((w) => w.length > 0).length;
  const paragraphs = input.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

  return {
    words,
    characters: input.length,
    lines: lines.length,
    paragraphs,
    headings,
    links,
    images,
    codeBlocks: Math.floor(codeBlocks),
    lists,
    sizeBytes: Buffer.byteLength(input, 'utf8'),
  };
}
