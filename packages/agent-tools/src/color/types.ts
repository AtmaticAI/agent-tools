export type ColorFormat = 'hex' | 'rgb' | 'hsl';

export interface RGB {
  r: number;  // 0-255
  g: number;
  b: number;
}

export interface HSL {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}

export interface ColorConversionResult {
  hex: string;
  rgb: string;
  hsl: string;
  values: {
    rgb: RGB;
    hsl: HSL;
  };
}

export interface ContrastResult {
  ratio: number;
  formatted: string;
  aa: { normal: boolean; large: boolean };
  aaa: { normal: boolean; large: boolean };
}

export type PaletteType = 'complementary' | 'analogous' | 'triadic' | 'shades' | 'tints';

export interface PaletteOptions {
  type: PaletteType;
  count?: number;
}

export interface BlendResult {
  color: ColorConversionResult;
  ratio: number;
}

export interface ColorNameResult {
  name: string;
  exact: boolean;
  hex: string;
}
