import { archive } from '@atmaticai/agent-tools-core';
import type { Skill, TaskInput, Part } from '../types';

export const archiveSkill: Skill = {
  id: 'archive-operations',
  name: 'Archive Processing',
  description:
    'Create, extract, list contents, and analyze ZIP and TAR archives',
  tags: ['archive', 'zip', 'tar', 'compress', 'extract'],
  examples: [
    'Create a ZIP archive from files',
    'Extract all files from an archive',
    'List contents of a ZIP file',
    'Get archive statistics',
  ],
  inputModes: ['application/zip', 'application/octet-stream'],
  outputModes: ['application/zip', 'application/json'],
};

export async function handleArchiveSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'create': {
      const files = (data as { path: string; content: string }[]).map((f) => ({
        path: f.path,
        content: Buffer.from(f.content, 'base64'),
      }));
      const result = await archive.create(files, {
        format: options.format as archive.ArchiveFormat,
        compressionLevel: options.compressionLevel as number,
      });
      return [
        {
          type: 'file',
          file: {
            name: (options.fileName as string) ?? 'archive.zip',
            mimeType: 'application/zip',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'extract': {
      const file = Buffer.from(data as string, 'base64');
      const results = await archive.extract(file, {
        files: options.files as string[],
      });
      return results.map((f) => ({
        type: 'file' as const,
        file: {
          name: f.path,
          mimeType: 'application/octet-stream',
          bytes: Buffer.from(f.content).toString('base64'),
        },
      }));
    }

    case 'list': {
      const file = Buffer.from(data as string, 'base64');
      const result = await archive.list(file);
      return [{ type: 'data', data: { entries: result } as unknown as Record<string, unknown> }];
    }

    case 'stats': {
      const file = Buffer.from(data as string, 'base64');
      const result = await archive.getStats(file);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    default:
      throw new Error(`Unknown Archive action: ${action}`);
  }
}
