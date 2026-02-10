import { archive } from '@atmaticai/agent-tools-core';
import type { McpTool } from './index';

export const archiveTools: McpTool[] = [
  {
    name: 'agent_tools_archive_create',
    description:
      'Create a ZIP archive from a list of files. Each file needs a path and base64-encoded content. Returns the archive as base64.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        files: {
          type: 'array',
          description:
            'Array of files to add. Each item: { path: string, content: string (base64) }',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path within archive' },
              content: { type: 'string', description: 'Base64-encoded file content' },
            },
            required: ['path', 'content'],
          },
        },
        compressionLevel: {
          type: 'number',
          description: 'Compression level 0-9 (default: 6)',
        },
      },
      required: ['files'],
    },
    handler: async (args: Record<string, unknown>) => {
      const files = (args.files as { path: string; content: string }[]).map((f) => ({
        path: f.path,
        content: Buffer.from(f.content, 'base64'),
      }));
      const result = await archive.create(files, {
        compressionLevel: args.compressionLevel as number,
      });
      return {
        content: [{ type: 'text' as const, text: Buffer.from(result).toString('base64') }],
      };
    },
  },
  {
    name: 'agent_tools_archive_extract',
    description:
      'Extract files from a ZIP archive. Returns extracted files with paths and base64-encoded content. Input must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: { type: 'string', description: 'Base64-encoded ZIP file' },
        files: {
          type: 'array',
          description: 'Optional list of specific file paths to extract',
          items: { type: 'string' },
        },
      },
      required: ['file'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await archive.extract(buffer, {
        files: args.files as string[],
      });
      const output = result.map((f) => ({
        path: f.path,
        content: f.content.toString('base64'),
        size: f.content.length,
      }));
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(output, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_archive_list',
    description:
      'List contents of a ZIP archive without extracting. Returns file paths, sizes, and modification dates. Input must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: { type: 'string', description: 'Base64-encoded ZIP file' },
      },
      required: ['file'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await archive.list(buffer);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_archive_stats',
    description:
      'Get statistics about a ZIP archive: file count, directory count, total size, compressed size. Input must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: { type: 'string', description: 'Base64-encoded ZIP file' },
      },
      required: ['file'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await archive.getStats(buffer);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
];
