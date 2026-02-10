import sharp from 'sharp';
import type { ImageMetadata, ImageStats } from './types';

export async function getMetadata(
  file: Buffer | Uint8Array
): Promise<ImageMetadata> {
  const meta = await sharp(Buffer.from(file)).metadata();

  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format ?? 'unknown',
    channels: meta.channels ?? 0,
    space: meta.space ?? 'unknown',
    depth: meta.depth ?? 'unknown',
    density: meta.density,
    hasAlpha: meta.hasAlpha ?? false,
    sizeBytes: file.length,
  };
}

export async function getStats(
  file: Buffer | Uint8Array
): Promise<ImageStats> {
  const meta = await sharp(Buffer.from(file)).metadata();

  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  return {
    width,
    height,
    format: meta.format ?? 'unknown',
    channels: meta.channels ?? 0,
    hasAlpha: meta.hasAlpha ?? false,
    sizeBytes: file.length,
    megapixels: Math.round((width * height) / 10000) / 100,
  };
}
