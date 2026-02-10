import sharp from 'sharp';
import type { ConvertOptions, CompressOptions } from './types';

export async function convert(
  file: Buffer | Uint8Array,
  options: ConvertOptions
): Promise<Uint8Array> {
  let pipeline = sharp(Buffer.from(file));

  switch (options.format) {
    case 'png':
      pipeline = pipeline.png();
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: options.quality ?? 80 });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: options.quality ?? 80 });
      break;
    case 'gif':
      pipeline = pipeline.gif();
      break;
    case 'tiff':
      pipeline = pipeline.tiff({ quality: options.quality ?? 80 });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality: options.quality ?? 50 });
      break;
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }

  const result = await pipeline.toBuffer();
  return new Uint8Array(result);
}

export async function compress(
  file: Buffer | Uint8Array,
  options: CompressOptions = {}
): Promise<Uint8Array> {
  const quality = options.quality ?? 70;
  const format = options.format ?? 'jpeg';

  return convert(file, { format, quality });
}
