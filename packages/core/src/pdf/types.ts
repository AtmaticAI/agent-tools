export interface MergeOptions {
  pageRanges?: string[];
}

export interface SplitOptions {
  ranges: string;
}

export interface PageRange {
  start: number;
  end: number;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export interface PDFInfo {
  pageCount: number;
  metadata: PDFMetadata;
  encrypted: boolean;
  version: string;
}

export interface CompressOptions {
  quality: 'low' | 'medium' | 'high';
}

export interface ExtractTextOptions {
  pages?: number[];
  preserveLayout?: boolean;
}

export interface PageInfo {
  index: number;
  width: number;
  height: number;
  rotation: number;
}

export interface RotateOptions {
  pages?: number[];
  degrees: 0 | 90 | 180 | 270;
}

export interface WatermarkOptions {
  text?: string;
  opacity?: number;
  rotation?: number;
  position?: 'center' | 'top' | 'bottom';
  fontSize?: number;
  color?: { r: number; g: number; b: number };
}

// --- PDF Template types ---

export interface TemplateColor {
  r: number;
  g: number;
  b: number;
}

export interface TemplateFont {
  name: string;
  size: number;
  weight?: 'normal' | 'bold';
}

export interface TemplateElement {
  type: 'text' | 'placeholder';
  content: string;
  fieldName?: string;
  x: number;
  y: number;
  font?: TemplateFont;
  color?: TemplateColor;
}

export interface TemplatePage {
  width: number;
  height: number;
  elements: TemplateElement[];
}

export interface TemplateField {
  name: string;
  defaultValue: string;
  pages: number[];
}

export interface PDFTemplate {
  version: '1.0';
  metadata: {
    name?: string;
    description?: string;
    createdAt: string;
    sourcePageCount: number;
  };
  pages: TemplatePage[];
  fields: TemplateField[];
  fonts: Record<string, TemplateFont>;
  defaults?: {
    font?: TemplateFont;
    color?: TemplateColor;
    missingFieldBehavior?: 'leave_placeholder' | 'use_default' | 'empty_string';
  };
}

export interface PdfToTemplateOptions {
  name?: string;
  description?: string;
}

export interface TemplateToPdfOptions {
  missingFieldBehavior?: 'leave_placeholder' | 'use_default' | 'empty_string';
}
