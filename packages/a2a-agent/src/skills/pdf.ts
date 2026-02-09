import { pdf } from '@agent-tools/core';
import type { Skill, TaskInput, Part } from '../types';

export const pdfSkill: Skill = {
  id: 'pdf-operations',
  name: 'PDF Processing',
  description: 'Merge, split, extract, transform, and template PDF documents server-side',
  tags: ['pdf', 'document', 'merge', 'split', 'extract', 'template'],
  examples: [
    'Merge these 3 PDFs into one',
    'Extract pages 5-10',
    'Get text content from page 1',
    'Rotate all pages 90 degrees',
    'Get PDF metadata',
    'Extract a template from this PDF',
    'Generate a PDF from this template',
  ],
  inputModes: ['application/pdf', 'application/octet-stream'],
  outputModes: ['application/pdf', 'application/json', 'text/plain'],
};

export async function handlePdfSkill(input: TaskInput): Promise<Part[]> {
  const { action, data, options = {} } = input;

  switch (action) {
    case 'merge': {
      const files = (data as string[]).map((f) => Buffer.from(f, 'base64'));
      const result = await pdf.merge(files, {
        pageRanges: options.pageRanges as string[],
      });
      return [
        {
          type: 'file',
          file: {
            mimeType: 'application/pdf',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'split': {
      const file = Buffer.from(data as string, 'base64');
      const results = await pdf.split(file, { ranges: options.ranges as string });
      return results.map((r, i) => ({
        type: 'file' as const,
        file: {
          name: `split-${i + 1}.pdf`,
          mimeType: 'application/pdf',
          bytes: Buffer.from(r).toString('base64'),
        },
      }));
    }

    case 'extractPages': {
      const file = Buffer.from(data as string, 'base64');
      const result = await pdf.extractPages(file, options.pageRange as string);
      return [
        {
          type: 'file',
          file: {
            mimeType: 'application/pdf',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'extractText': {
      const file = Buffer.from(data as string, 'base64');
      const result = await pdf.extractText(file, {
        pages: options.pages as number[],
      });
      return [{ type: 'text', text: result }];
    }

    case 'metadata': {
      const file = Buffer.from(data as string, 'base64');
      const result = await pdf.getInfo(file);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'setMetadata': {
      const file = Buffer.from(data as string, 'base64');
      const result = await pdf.setMetadata(file, options.metadata as pdf.PDFMetadata);
      return [
        {
          type: 'file',
          file: {
            mimeType: 'application/pdf',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'rotate': {
      const file = Buffer.from(data as string, 'base64');
      const result = await pdf.rotate(file, {
        degrees: options.degrees as 0 | 90 | 180 | 270,
        pages: options.pages as number[],
      });
      return [
        {
          type: 'file',
          file: {
            mimeType: 'application/pdf',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'compress': {
      const file = Buffer.from(data as string, 'base64');
      const result = await pdf.compress(file, {
        quality: (options.quality as 'low' | 'medium' | 'high') || 'medium',
      });
      return [
        {
          type: 'file',
          file: {
            mimeType: 'application/pdf',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'pageCount': {
      const file = Buffer.from(data as string, 'base64');
      const count = await pdf.getPageCount(file);
      return [{ type: 'data', data: { pageCount: count } }];
    }

    case 'toTemplate': {
      const file = Buffer.from(data as string, 'base64');
      const template = await pdf.pdfToTemplate(file, {
        name: options.name as string | undefined,
        description: options.description as string | undefined,
      });
      return [{ type: 'data', data: template as unknown as Record<string, unknown> }];
    }

    case 'fromTemplate': {
      const template = data as unknown as pdf.PDFTemplate;
      const templateData = (options.data ?? {}) as Record<string, string>;
      const result = await pdf.templateToPdf(template, templateData, {
        missingFieldBehavior: options.missingFieldBehavior as
          | 'leave_placeholder'
          | 'use_default'
          | 'empty_string'
          | undefined,
      });
      return [
        {
          type: 'file',
          file: {
            name: 'generated.pdf',
            mimeType: 'application/pdf',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    case 'readForm': {
      const file = Buffer.from(data as string, 'base64');
      const result = await pdf.readFormFields(file);
      return [{ type: 'data', data: result as unknown as Record<string, unknown> }];
    }

    case 'fillForm': {
      const file = Buffer.from(data as string, 'base64');
      const result = await pdf.fillFormFields(
        file,
        options.data as Record<string, string | boolean>,
        { flatten: options.flatten as boolean | undefined }
      );
      return [
        {
          type: 'file',
          file: {
            name: 'filled.pdf',
            mimeType: 'application/pdf',
            bytes: Buffer.from(result).toString('base64'),
          },
        },
      ];
    }

    default:
      throw new Error(`Unknown PDF action: ${action}`);
  }
}
