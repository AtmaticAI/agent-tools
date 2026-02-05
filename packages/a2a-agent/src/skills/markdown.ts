import { markdown } from '@agent-tools/core';
import type { Skill, TaskInput, Part } from '../types';

export const markdownSkill: Skill = {
  id: 'markdown-operations',
  name: 'Markdown Processing',
  description:
    'Convert, extract table of contents, links, frontmatter, and analyze Markdown documents',
  tags: ['markdown', 'convert', 'html', 'toc', 'extract'],
  examples: [
    'Convert Markdown to HTML',
    'Generate table of contents',
    'Extract all links from Markdown',
    'Parse YAML frontmatter',
    'Get Markdown document statistics',
  ],
  inputModes: ['text/markdown', 'text/html', 'text/plain'],
  outputModes: ['text/html', 'text/markdown', 'text/plain', 'application/json'],
};

export async function handleMarkdownSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'convert': {
      const result = markdown.convert(data as string, {
        from: options.from as markdown.MarkdownConvertFormat,
        to: options.to as markdown.MarkdownConvertFormat,
        gfm: options.gfm as boolean,
      });
      return [{ type: 'text', text: result }];
    }

    case 'toc': {
      const entries = markdown.generateToc(data as string);
      if (options.render) {
        const rendered = markdown.renderToc(entries);
        return [{ type: 'text', text: rendered }];
      }
      return [{ type: 'data', data: { entries } as unknown as Record<string, unknown> }];
    }

    case 'extractLinks': {
      const result = markdown.extractLinks(data as string);
      return [{ type: 'data', data: { links: result } as unknown as Record<string, unknown> }];
    }

    case 'extractFrontmatter': {
      const result = markdown.extractFrontmatter(data as string);
      return [{ type: 'data', data: { frontmatter: result } as unknown as Record<string, unknown> }];
    }

    case 'stats': {
      const result = markdown.getStats(data as string);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown Markdown action: ${action}`);
  }
}
