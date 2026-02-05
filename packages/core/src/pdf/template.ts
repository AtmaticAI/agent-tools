import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type {
  PDFTemplate,
  TemplatePage,
  TemplateElement,
  TemplateField,
  TemplateFont,
  PdfToTemplateOptions,
  TemplateToPdfOptions,
} from './types';
import { toUint8Array } from './utils';

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

function extractFieldName(content: string): string | undefined {
  const match = content.match(/^\{\{(\w+)\}\}$/);
  return match ? match[1] : undefined;
}

function resolveContent(
  content: string,
  data: Record<string, string>,
  missingFieldBehavior: 'leave_placeholder' | 'use_default' | 'empty_string',
  fields: TemplateField[]
): string {
  return content.replace(PLACEHOLDER_REGEX, (match, fieldName) => {
    if (fieldName in data) {
      return data[fieldName];
    }
    switch (missingFieldBehavior) {
      case 'use_default': {
        const field = fields.find((f) => f.name === fieldName);
        return field?.defaultValue ?? '';
      }
      case 'empty_string':
        return '';
      case 'leave_placeholder':
      default:
        return match;
    }
  });
}

function resolveFont(
  font: TemplateFont | undefined,
  defaults: PDFTemplate['defaults']
): TemplateFont {
  return font ?? defaults?.font ?? { name: 'Helvetica', size: 12 };
}

export async function pdfToTemplate(
  file: Buffer | Uint8Array,
  options: PdfToTemplateOptions = {}
): Promise<PDFTemplate> {
  const fileData = toUint8Array(file);
  const pdfDoc = await PDFDocument.load(fileData, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();
  const pdfPages = pdfDoc.getPages();

  let fullText = '';
  try {
    const pdfParse = await import('pdf-parse');
    const parser = pdfParse.default || pdfParse;
    const parsed = await parser(Buffer.from(fileData));
    fullText = parsed.text;
  } catch {
    fullText = '';
  }

  const textPerPage = pageCount > 0 ? fullText.length / pageCount : 0;
  const fieldsMap = new Map<string, { pages: Set<number>; defaultValue: string }>();
  const fonts: Record<string, TemplateFont> = {};
  const defaultFont: TemplateFont = { name: 'Helvetica', size: 12 };

  fonts['Helvetica-12'] = defaultFont;

  const pages: TemplatePage[] = pdfPages.map((page, pageIndex) => {
    const { width, height } = page.getSize();

    const start = Math.floor(pageIndex * textPerPage);
    const end = Math.floor((pageIndex + 1) * textPerPage);
    const pageText = fullText.slice(start, end).trim();

    const elements: TemplateElement[] = [];

    if (pageText) {
      const lines = pageText.split('\n').filter((l) => l.trim());
      const lineHeight = 14;
      let yPos = height - 40;

      for (const line of lines) {
        const hasPlaceholder = PLACEHOLDER_REGEX.test(line);
        PLACEHOLDER_REGEX.lastIndex = 0;

        const element: TemplateElement = {
          type: hasPlaceholder ? 'placeholder' : 'text',
          content: line.trim(),
          x: 40,
          y: yPos,
          font: defaultFont,
        };

        if (hasPlaceholder) {
          const fieldName = extractFieldName(line.trim());
          if (fieldName) {
            element.fieldName = fieldName;
          }

          let match;
          PLACEHOLDER_REGEX.lastIndex = 0;
          while ((match = PLACEHOLDER_REGEX.exec(line)) !== null) {
            const name = match[1];
            if (!fieldsMap.has(name)) {
              fieldsMap.set(name, { pages: new Set(), defaultValue: '' });
            }
            fieldsMap.get(name)!.pages.add(pageIndex + 1);
          }
        }

        elements.push(element);
        yPos -= lineHeight;
      }
    }

    return { width, height, elements };
  });

  const fields: TemplateField[] = [];
  for (const [name, info] of fieldsMap) {
    fields.push({
      name,
      defaultValue: info.defaultValue,
      pages: [...info.pages].sort((a, b) => a - b),
    });
  }

  return {
    version: '1.0',
    metadata: {
      name: options.name,
      description: options.description,
      createdAt: new Date().toISOString(),
      sourcePageCount: pageCount,
    },
    pages,
    fields,
    fonts,
    defaults: {
      font: defaultFont,
      color: { r: 0, g: 0, b: 0 },
      missingFieldBehavior: 'leave_placeholder',
    },
  };
}

export async function templateToPdf(
  template: PDFTemplate,
  data: Record<string, string> = {},
  options: TemplateToPdfOptions = {}
): Promise<Uint8Array> {
  validateTemplate(template);

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const missingFieldBehavior =
    options.missingFieldBehavior ??
    template.defaults?.missingFieldBehavior ??
    'leave_placeholder';

  const defaultColor = template.defaults?.color ?? { r: 0, g: 0, b: 0 };

  for (const templatePage of template.pages) {
    const page = pdfDoc.addPage([templatePage.width, templatePage.height]);

    for (const element of templatePage.elements) {
      const resolvedFont = resolveFont(element.font, template.defaults);
      const color = element.color ?? defaultColor;
      const pdfFont = resolvedFont.weight === 'bold' ? boldFont : font;
      const fontSize = resolvedFont.size;

      const content =
        element.type === 'placeholder'
          ? resolveContent(element.content, data, missingFieldBehavior, template.fields)
          : element.content;

      page.drawText(content, {
        x: element.x,
        y: element.y,
        size: fontSize,
        font: pdfFont,
        color: rgb(color.r, color.g, color.b),
      });
    }
  }

  return pdfDoc.save();
}

export function validateTemplate(template: PDFTemplate): void {
  if (!template) {
    throw new Error('Template is required');
  }

  if (template.version !== '1.0') {
    throw new Error(`Unsupported template version: ${template.version}`);
  }

  if (!Array.isArray(template.pages) || template.pages.length === 0) {
    throw new Error('Template must have at least one page');
  }

  if (!template.metadata) {
    throw new Error('Template metadata is required');
  }

  if (typeof template.metadata.sourcePageCount !== 'number' || template.metadata.sourcePageCount < 1) {
    throw new Error('Template metadata.sourcePageCount must be a positive number');
  }

  if (!Array.isArray(template.fields)) {
    throw new Error('Template fields must be an array');
  }

  for (const page of template.pages) {
    if (typeof page.width !== 'number' || typeof page.height !== 'number') {
      throw new Error('Each page must have numeric width and height');
    }
    if (!Array.isArray(page.elements)) {
      throw new Error('Each page must have an elements array');
    }
    for (const element of page.elements) {
      if (element.type !== 'text' && element.type !== 'placeholder') {
        throw new Error(`Invalid element type: ${element.type}`);
      }
      if (typeof element.content !== 'string') {
        throw new Error('Element content must be a string');
      }
      if (typeof element.x !== 'number' || typeof element.y !== 'number') {
        throw new Error('Element x and y must be numbers');
      }
    }
  }
}
