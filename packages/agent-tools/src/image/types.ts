export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'gif' | 'tiff' | 'avif';

export interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: string;
}

export interface CropOptions {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CompressOptions {
  quality?: number;
  format?: ImageFormat;
}

export interface ConvertOptions {
  format: ImageFormat;
  quality?: number;
}

export interface RotateOptions {
  degrees: number;
  background?: string;
}

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  channels: number;
  space: string;
  depth: string;
  density?: number;
  hasAlpha: boolean;
  sizeBytes: number;
}

export interface ImageStats {
  width: number;
  height: number;
  format: string;
  channels: number;
  hasAlpha: boolean;
  sizeBytes: number;
  megapixels: number;
}
