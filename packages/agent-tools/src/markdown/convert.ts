import { marked } from 'marked';
import TurndownService from 'turndown';
import type { MarkdownConvertOptions } from './types';

export function convert(
  input: string,
  options: MarkdownConvertOptions
): string {
  const { from, to } = options;

  if (from === to) return input;

  if (from === 'markdown' && to === 'html') {
    return markdownToHtml(input, options.gfm);
  }

  if (from === 'html' && to === 'markdown') {
    return htmlToMarkdown(input);
  }

  if (from === 'markdown' && to === 'text') {
    return markdownToText(input);
  }

  if (from === 'html' && to === 'text') {
    return htmlToText(input);
  }

  if (from === 'text' && to === 'markdown') {
    return input;
  }

  if (from === 'text' && to === 'html') {
    return `<p>${input.split('\n\n').join('</p><p>')}</p>`;
  }

  throw new Error(`Unsupported conversion: ${from} -> ${to}`);
}

function markdownToHtml(input: string, gfm = true): string {
  marked.setOptions({ gfm });
  return marked.parse(input) as string;
}

function htmlToMarkdown(input: string): string {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });
  return turndown.turndown(input);
}

function markdownToText(input: string): string {
  const html = markdownToHtml(input);
  return htmlToText(html);
}

function htmlToText(input: string): string {
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
