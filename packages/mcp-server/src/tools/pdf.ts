import { pdf } from '@agent-tools/core';

export const pdfTools = [
  {
    name: 'agent_tools_pdf_merge',
    description:
      'Merge multiple PDF files into one. Files should be base64 encoded.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of base64-encoded PDF files',
        },
        pageRanges: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Optional page ranges for each file (e.g., ["1-3", "all", "5,7-10"])',
        },
      },
      required: ['files'],
    },
    handler: async (args: { files: string[]; pageRanges?: string[] }) => {
      const buffers = args.files.map((f) => Buffer.from(f, 'base64'));
      const result = await pdf.merge(buffers, { pageRanges: args.pageRanges });
      return {
        content: [
          {
            type: 'text' as const,
            text: Buffer.from(result).toString('base64'),
          },
        ],
      };
    },
  },
  {
    name: 'agent_tools_pdf_split',
    description:
      'Split a PDF into multiple documents based on page ranges. Returns array of base64 PDFs.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded PDF file',
        },
        ranges: {
          type: 'string',
          description:
            'Comma-separated page ranges (e.g., "1-3,4-6,7-10")',
        },
      },
      required: ['file', 'ranges'],
    },
    handler: async (args: { file: string; ranges: string }) => {
      const buffer = Buffer.from(args.file, 'base64');
      const results = await pdf.split(buffer, { ranges: args.ranges });
      const base64Results = results.map((r) => Buffer.from(r).toString('base64'));
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(base64Results),
          },
        ],
      };
    },
  },
  {
    name: 'agent_tools_pdf_extract_pages',
    description:
      'Extract specific pages from a PDF. Returns base64-encoded PDF.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded PDF file',
        },
        pageRange: {
          type: 'string',
          description: 'Pages to extract (e.g., "1,3,5-10")',
        },
      },
      required: ['file', 'pageRange'],
    },
    handler: async (args: { file: string; pageRange: string }) => {
      const buffer = Buffer.from(args.file, 'base64');
      const result = await pdf.extractPages(buffer, args.pageRange);
      return {
        content: [
          {
            type: 'text' as const,
            text: Buffer.from(result).toString('base64'),
          },
        ],
      };
    },
  },
  {
    name: 'agent_tools_pdf_extract_text',
    description: 'Extract text content from a PDF.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded PDF file',
        },
        pages: {
          type: 'array',
          items: { type: 'number' },
          description: 'Optional specific pages to extract text from',
        },
      },
      required: ['file'],
    },
    handler: async (args: { file: string; pages?: number[] }) => {
      const buffer = Buffer.from(args.file, 'base64');
      const result = await pdf.extractText(buffer, { pages: args.pages });
      return { content: [{ type: 'text' as const, text: result }] };
    },
  },
  {
    name: 'agent_tools_pdf_metadata',
    description: 'Get metadata from a PDF (title, author, page count, etc.).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded PDF file',
        },
      },
      required: ['file'],
    },
    handler: async (args: { file: string }) => {
      const buffer = Buffer.from(args.file, 'base64');
      const result = await pdf.getInfo(buffer);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  },
  {
    name: 'agent_tools_pdf_set_metadata',
    description: 'Set metadata on a PDF. Returns modified base64-encoded PDF.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded PDF file',
        },
        metadata: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            author: { type: 'string' },
            subject: { type: 'string' },
            keywords: { type: 'array', items: { type: 'string' } },
          },
          description: 'Metadata to set',
        },
      },
      required: ['file', 'metadata'],
    },
    handler: async (args: { file: string; metadata: pdf.PDFMetadata }) => {
      const buffer = Buffer.from(args.file, 'base64');
      const result = await pdf.setMetadata(buffer, args.metadata);
      return {
        content: [
          {
            type: 'text' as const,
            text: Buffer.from(result).toString('base64'),
          },
        ],
      };
    },
  },
  {
    name: 'agent_tools_pdf_rotate',
    description: 'Rotate pages in a PDF. Returns base64-encoded PDF.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded PDF file',
        },
        degrees: {
          type: 'number',
          enum: [90, 180, 270],
          description: 'Rotation angle',
        },
        pages: {
          type: 'array',
          items: { type: 'number' },
          description: 'Pages to rotate (all pages if not specified)',
        },
      },
      required: ['file', 'degrees'],
    },
    handler: async (args: { file: string; degrees: number; pages?: number[] }) => {
      const buffer = Buffer.from(args.file, 'base64');
      const result = await pdf.rotate(buffer, {
        degrees: args.degrees as 0 | 90 | 180 | 270,
        pages: args.pages,
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: Buffer.from(result).toString('base64'),
          },
        ],
      };
    },
  },
  {
    name: 'agent_tools_pdf_compress',
    description:
      'Compress a PDF to reduce file size. Returns base64-encoded PDF.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded PDF file',
        },
        quality: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Compression quality (default: medium)',
        },
      },
      required: ['file'],
    },
    handler: async (args: { file: string; quality?: string }) => {
      const buffer = Buffer.from(args.file, 'base64');
      const result = await pdf.compress(buffer, {
        quality: (args.quality || 'medium') as 'low' | 'medium' | 'high',
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: Buffer.from(result).toString('base64'),
          },
        ],
      };
    },
  },
  {
    name: 'agent_tools_pdf_page_count',
    description: 'Get the number of pages in a PDF.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded PDF file',
        },
      },
      required: ['file'],
    },
    handler: async (args: { file: string }) => {
      const buffer = Buffer.from(args.file, 'base64');
      const count = await pdf.getPageCount(buffer);
      return {
        content: [{ type: 'text' as const, text: String(count) }],
      };
    },
  },
  {
    name: 'agent_tools_pdf_to_template',
    description:
      'Extract a reusable JSON template from a PDF, detecting {{placeholder}} fields. Returns template JSON.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded PDF file',
        },
        name: {
          type: 'string',
          description: 'Optional template name',
        },
        description: {
          type: 'string',
          description: 'Optional template description',
        },
      },
      required: ['file'],
    },
    handler: async (args: { file: string; name?: string; description?: string }) => {
      const buffer = Buffer.from(args.file, 'base64');
      const template = await pdf.pdfToTemplate(buffer, {
        name: args.name,
        description: args.description,
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(template, null, 2),
          },
        ],
      };
    },
  },
  {
    name: 'agent_tools_pdf_from_template',
    description:
      'Generate a PDF from a template JSON and data JSON, replacing placeholders with values. Returns base64-encoded PDF.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        template: {
          type: 'object',
          description: 'PDF template JSON object',
        },
        data: {
          type: 'object',
          description: 'Key-value pairs for placeholder replacement',
        },
        missingFieldBehavior: {
          type: 'string',
          enum: ['leave_placeholder', 'use_default', 'empty_string'],
          description:
            'How to handle missing fields (default: leave_placeholder)',
        },
      },
      required: ['template'],
    },
    handler: async (args: {
      template: pdf.PDFTemplate;
      data?: Record<string, string>;
      missingFieldBehavior?: string;
    }) => {
      const result = await pdf.templateToPdf(args.template, args.data ?? {}, {
        missingFieldBehavior: args.missingFieldBehavior as
          | 'leave_placeholder'
          | 'use_default'
          | 'empty_string'
          | undefined,
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: Buffer.from(result).toString('base64'),
          },
        ],
      };
    },
  },
  {
    name: 'agent_tools_pdf_read_form',
    description:
      'Read AcroForm fields from a fillable PDF. Returns field names, types, current values, and options.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded PDF file',
        },
      },
      required: ['file'],
    },
    handler: async (args: { file: string }) => {
      const buffer = Buffer.from(args.file, 'base64');
      const result = await pdf.readFormFields(buffer);
      return {
        content: [
          { type: 'text' as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    },
  },
  {
    name: 'agent_tools_pdf_fill_form',
    description:
      'Fill AcroForm fields in a fillable PDF with provided data. Returns base64-encoded filled PDF.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file: {
          type: 'string',
          description: 'Base64-encoded PDF file',
        },
        data: {
          type: 'object',
          description:
            'Key-value pairs mapping field names to values (string for text/radio/dropdown, boolean for checkbox)',
        },
        flatten: {
          type: 'boolean',
          description:
            'If true, flatten the form fields making them non-editable (default: false)',
        },
      },
      required: ['file', 'data'],
    },
    handler: async (args: {
      file: string;
      data: Record<string, string | boolean>;
      flatten?: boolean;
    }) => {
      const buffer = Buffer.from(args.file, 'base64');
      const result = await pdf.fillFormFields(buffer, args.data, {
        flatten: args.flatten,
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: Buffer.from(result).toString('base64'),
          },
        ],
      };
    },
  },
];
