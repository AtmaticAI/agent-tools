import sharp from 'sharp';
import type { ResizeOptions } from './types';

export async function resize(
  file: Buffer | Uint8Array,
  options: ResizeOptions
): Promise<Uint8Array> {
  const result = await sharp(Buffer.from(file))
    .resize({
      width: options.width,
      height: options.height,
      fit: options.fit ?? 'inside',
      background: options.background ?? '#ffffff',
    })
    .toBuffer();

  return new Uint8Array(result);
}
