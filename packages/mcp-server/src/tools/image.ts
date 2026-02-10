import { image } from '@atmaticai/agent-tools-core';
import type { McpTool } from './index';

export const imageTools: McpTool[] = [
  {
    name: 'agent_tools_image_resize',
    description:
      'Resize an image to specified dimensions. Supports fit modes: cover, contain, fill, inside, outside. Input must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: { type: 'string', description: 'Base64-encoded image file' },
        width: { type: 'number', description: 'Target width in pixels' },
        height: { type: 'number', description: 'Target height in pixels' },
        fit: {
          type: 'string',
          enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
          description: 'How to fit the image (default: inside)',
        },
      },
      required: ['file'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await image.resize(buffer, {
        width: args.width as number,
        height: args.height as number,
        fit: args.fit as image.ResizeOptions['fit'],
      });
      return {
        content: [{ type: 'text' as const, text: Buffer.from(result).toString('base64') }],
      };
    },
  },
  {
    name: 'agent_tools_image_crop',
    description: 'Crop an image to a specified rectangle. Input must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: { type: 'string', description: 'Base64-encoded image file' },
        left: { type: 'number', description: 'Left offset in pixels' },
        top: { type: 'number', description: 'Top offset in pixels' },
        width: { type: 'number', description: 'Crop width in pixels' },
        height: { type: 'number', description: 'Crop height in pixels' },
      },
      required: ['file', 'left', 'top', 'width', 'height'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await image.crop(buffer, {
        left: args.left as number,
        top: args.top as number,
        width: args.width as number,
        height: args.height as number,
      });
      return {
        content: [{ type: 'text' as const, text: Buffer.from(result).toString('base64') }],
      };
    },
  },
  {
    name: 'agent_tools_image_convert',
    description:
      'Convert an image to a different format: png, jpeg, webp, gif, tiff, avif. Input must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: { type: 'string', description: 'Base64-encoded image file' },
        format: {
          type: 'string',
          enum: ['png', 'jpeg', 'webp', 'gif', 'tiff', 'avif'],
          description: 'Target image format',
        },
        quality: {
          type: 'number',
          description: 'Quality for lossy formats 1-100 (default: 80)',
        },
      },
      required: ['file', 'format'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await image.convert(buffer, {
        format: args.format as image.ImageFormat,
        quality: args.quality as number,
      });
      return {
        content: [{ type: 'text' as const, text: Buffer.from(result).toString('base64') }],
      };
    },
  },
  {
    name: 'agent_tools_image_compress',
    description:
      'Compress an image to reduce file size. Input must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: { type: 'string', description: 'Base64-encoded image file' },
        quality: {
          type: 'number',
          description: 'Compression quality 1-100 (default: 70)',
        },
        format: {
          type: 'string',
          enum: ['png', 'jpeg', 'webp', 'gif', 'tiff', 'avif'],
          description: 'Output format (default: jpeg)',
        },
      },
      required: ['file'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await image.compress(buffer, {
        quality: args.quality as number,
        format: args.format as image.ImageFormat,
      });
      return {
        content: [{ type: 'text' as const, text: Buffer.from(result).toString('base64') }],
      };
    },
  },
  {
    name: 'agent_tools_image_rotate',
    description: 'Rotate an image by a specified number of degrees. Input must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: { type: 'string', description: 'Base64-encoded image file' },
        degrees: { type: 'number', description: 'Rotation angle in degrees' },
      },
      required: ['file', 'degrees'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await image.rotate(buffer, {
        degrees: args.degrees as number,
      });
      return {
        content: [{ type: 'text' as const, text: Buffer.from(result).toString('base64') }],
      };
    },
  },
  {
    name: 'agent_tools_image_metadata',
    description:
      'Get metadata from an image: dimensions, format, channels, color space, DPI, alpha channel. Input must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: { type: 'string', description: 'Base64-encoded image file' },
      },
      required: ['file'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await image.getMetadata(buffer);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_image_grayscale',
    description: 'Convert an image to grayscale. Input must be base64-encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: { type: 'string', description: 'Base64-encoded image file' },
      },
      required: ['file'],
    },
    handler: async (args: Record<string, unknown>) => {
      const buffer = Buffer.from(args.file as string, 'base64');
      const result = await image.grayscale(buffer);
      return {
        content: [{ type: 'text' as const, text: Buffer.from(result).toString('base64') }],
      };
    },
  },
];
