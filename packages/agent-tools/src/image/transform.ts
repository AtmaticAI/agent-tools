import sharp from 'sharp';
import type { CropOptions, RotateOptions } from './types';

export async function crop(
  file: Buffer | Uint8Array,
  options: CropOptions
): Promise<Uint8Array> {
  const result = await sharp(Buffer.from(file))
    .extract({
      left: options.left,
      top: options.top,
      width: options.width,
      height: options.height,
    })
    .toBuffer();

  return new Uint8Array(result);
}

export async function rotate(
  file: Buffer | Uint8Array,
  options: RotateOptions
): Promise<Uint8Array> {
  const result = await sharp(Buffer.from(file))
    .rotate(options.degrees, {
      background: options.background ?? '#ffffff',
    })
    .toBuffer();

  return new Uint8Array(result);
}

export async function flip(file: Buffer | Uint8Array): Promise<Uint8Array> {
  const result = await sharp(Buffer.from(file)).flip().toBuffer();
  return new Uint8Array(result);
}

export async function flop(file: Buffer | Uint8Array): Promise<Uint8Array> {
  const result = await sharp(Buffer.from(file)).flop().toBuffer();
  return new Uint8Array(result);
}

export async function grayscale(file: Buffer | Uint8Array): Promise<Uint8Array> {
  const result = await sharp(Buffer.from(file)).grayscale().toBuffer();
  return new Uint8Array(result);
}

export async function blur(
  file: Buffer | Uint8Array,
  sigma: number = 3
): Promise<Uint8Array> {
  const result = await sharp(Buffer.from(file)).blur(sigma).toBuffer();
  return new Uint8Array(result);
}
