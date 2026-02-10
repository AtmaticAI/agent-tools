export type MarkdownConvertFormat = 'html' | 'text' | 'markdown';

export interface MarkdownConvertOptions {
  from: MarkdownConvertFormat;
  to: MarkdownConvertFormat;
  gfm?: boolean;
}

export interface MarkdownTocEntry {
  level: number;
  text: string;
  slug: string;
}

export interface MarkdownLinkInfo {
  text: string;
  href: string;
  line: number;
}

export interface MarkdownStats {
  words: number;
  characters: number;
  lines: number;
  paragraphs: number;
  headings: number;
  links: number;
  images: number;
  codeBlocks: number;
  lists: number;
  sizeBytes: number;
}

export interface MarkdownFormatOptions {
  lineWidth?: number;
  bullet?: '-' | '*' | '+';
  emphasis?: '_' | '*';
  strong?: '__' | '**';
}

export interface MarkdownFrontmatter {
  [key: string]: unknown;
}
