import { image } from '@atmaticai/agent-tools-core';
import type { Skill, TaskInput, Part } from '../types';

export const imageSkill: Skill = {
  id: 'image-operations',
  name: 'Image Processing',
  description:
    'Resize, crop, rotate, convert, compress, and analyze images server-side',
  tags: ['image', 'resize', 'crop', 'convert', 'compress', 'metadata'],
  examples: [
    'Resize image to 800x600',
    'Crop image region',
    'Rotate image 90 degrees',
    'Convert PNG to WebP',
    'Compress image with quality 70',
    'Get image metadata',
    'Flip image vertically',
    'Apply grayscale filter',
    'Blur image with sigma 5',
  ],
  inputModes: ['image/png', 'image/jpeg', 'image/webp', 'application/octet-stream'],
  outputModes: ['image/png', 'image/jpeg', 'image/webp', 'application/json'],
};

export async function handleImageSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'resize': {
      const file = Buffer.from(data as string, 'base64');
      const result = await image.resize(file, {
        width: options.width as number,
        height: options.height as number,
        fit: options.fit as image.ResizeOptions['fit'],
        background: options.background as string,
      });
      return [
        {
          type: 'file',
          file: {
            mimeType: (options.outputMimeType as string) ?? 'image/png',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'crop': {
      const file = Buffer.from(data as string, 'base64');
      const result = await image.crop(file, {
        left: options.left as number,
        top: options.top as number,
        width: options.width as number,
        height: options.height as number,
      });
      return [
        {
          type: 'file',
          file: {
            mimeType: (options.outputMimeType as string) ?? 'image/png',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'rotate': {
      const file = Buffer.from(data as string, 'base64');
      const result = await image.rotate(file, {
        degrees: options.degrees as number,
        background: options.background as string,
      });
      return [
        {
          type: 'file',
          file: {
            mimeType: (options.outputMimeType as string) ?? 'image/png',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'convert': {
      const file = Buffer.from(data as string, 'base64');
      const result = await image.convert(file, {
        format: options.format as image.ImageFormat,
        quality: options.quality as number,
      });
      const mimeMap: Record<string, string> = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        tiff: 'image/tiff',
        avif: 'image/avif',
      };
      return [
        {
          type: 'file',
          file: {
            mimeType: mimeMap[options.format as string] ?? 'application/octet-stream',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'compress': {
      const file = Buffer.from(data as string, 'base64');
      const result = await image.compress(file, {
        quality: options.quality as number,
        format: options.format as image.ImageFormat,
      });
      return [
        {
          type: 'file',
          file: {
            mimeType: (options.outputMimeType as string) ?? 'image/jpeg',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'metadata': {
      const file = Buffer.from(data as string, 'base64');
      const result = await image.getMetadata(file);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'stats': {
      const file = Buffer.from(data as string, 'base64');
      const result = await image.getStats(file);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'flip': {
      const file = Buffer.from(data as string, 'base64');
      const result = await image.flip(file);
      return [
        {
          type: 'file',
          file: {
            mimeType: (options.outputMimeType as string) ?? 'image/png',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'flop': {
      const file = Buffer.from(data as string, 'base64');
      const result = await image.flop(file);
      return [
        {
          type: 'file',
          file: {
            mimeType: (options.outputMimeType as string) ?? 'image/png',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'grayscale': {
      const file = Buffer.from(data as string, 'base64');
      const result = await image.grayscale(file);
      return [
        {
          type: 'file',
          file: {
            mimeType: (options.outputMimeType as string) ?? 'image/png',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'blur': {
      const file = Buffer.from(data as string, 'base64');
      const result = await image.blur(file, options.sigma as number);
      return [
        {
          type: 'file',
          file: {
            mimeType: (options.outputMimeType as string) ?? 'image/png',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    default:
      throw new Error(`Unknown Image action: ${action}`);
  }
}
