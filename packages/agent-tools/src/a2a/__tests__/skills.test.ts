import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { handleSkill } from '../skills';
import { handleJsonSkill } from '../skills/json';
import { handleCsvSkill } from '../skills/csv';
import { handlePdfSkill } from '../skills/pdf';
import { handleXmlSkill } from '../skills/xml';
import { handleExcelSkill } from '../skills/excel';
import { handleImageSkill } from '../skills/image';
import { handleMarkdownSkill } from '../skills/markdown';
import { handleArchiveSkill } from '../skills/archive';
import { handleRegexSkill } from '../skills/regex';
import { handleDiffSkill } from '../skills/diff';
import { handleSqlSkill } from '../skills/sql';
import { handleCryptoSkill } from '../skills/crypto';
import { handleDatetimeSkill } from '../skills/datetime';

describe('Skill Handlers', () => {
  describe('handleSkill', () => {
    it('should route to json skill', async () => {
      const result = await handleSkill('json-operations', {
        action: 'format',
        data: '{"a":1}',
      });

      expect(result).toBeDefined();
      expect(result[0].type).toBe('text');
    });

    it('should route to csv skill', async () => {
      const result = await handleSkill('csv-operations', {
        action: 'parse',
        data: 'a,b\n1,2',
      });

      expect(result).toBeDefined();
      expect(result[0].type).toBe('data');
    });

    it('should throw for unknown skill', async () => {
      await expect(
        handleSkill('unknown-skill', { action: 'test' })
      ).rejects.toThrow('Unknown skill');
    });
  });
});

describe('JSON Skill Handler', () => {
  describe('format action', () => {
    it('should format JSON', async () => {
      const result = await handleJsonSkill({
        action: 'format',
        data: '{"b":2,"a":1}',
      });

      expect(result[0].type).toBe('text');
      expect(result[0].text).toContain('"b": 2');
    });

    it('should sort keys when requested', async () => {
      const result = await handleJsonSkill({
        action: 'format',
        data: '{"b":2,"a":1}',
        options: { sortKeys: true },
      });

      const text = result[0].text as string;
      expect(text.indexOf('"a"')).toBeLessThan(text.indexOf('"b"'));
    });
  });

  describe('minify action', () => {
    it('should minify JSON', async () => {
      const result = await handleJsonSkill({
        action: 'minify',
        data: '{\n  "a": 1\n}',
      });

      expect(result[0].text).toBe('{"a":1}');
    });
  });

  describe('validate action', () => {
    it('should validate JSON', async () => {
      const result = await handleJsonSkill({
        action: 'validate',
        data: '{"a":1}',
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toEqual({ valid: true });
    });

    it('should validate against schema', async () => {
      const result = await handleJsonSkill({
        action: 'validate',
        data: '{"name":"test"}',
        options: {
          schema: JSON.stringify({
            type: 'object',
            properties: { name: { type: 'string' } },
            required: ['name'],
          }),
        },
      });

      expect(result[0].data).toMatchObject({ valid: true });
    });
  });

  describe('query action', () => {
    it('should query with JSONPath', async () => {
      const result = await handleJsonSkill({
        action: 'query',
        data: '{"users":[{"name":"John"},{"name":"Jane"}]}',
        options: { path: '$.users[*].name' },
      });

      expect(result[0].data.result).toContain('John');
      expect(result[0].data.result).toContain('Jane');
    });
  });

  describe('convert action', () => {
    it('should convert to YAML', async () => {
      const result = await handleJsonSkill({
        action: 'convert',
        data: '{"name":"test"}',
        options: { from: 'json', to: 'yaml' },
      });

      expect(result[0].text).toContain('name: test');
    });
  });

  describe('diff action', () => {
    it('should diff two documents', async () => {
      const result = await handleJsonSkill({
        action: 'diff',
        data: { a: '{"x":1}', b: '{"x":2}' },
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data.identical).toBe(false);
    });
  });

  describe('stats action', () => {
    it('should return statistics', async () => {
      const result = await handleJsonSkill({
        action: 'stats',
        data: '{"a":1,"b":[1,2,3]}',
      });

      expect(result[0].data.keys).toBe(2);
      expect(result[0].data.arrays).toBe(1);
    });
  });

  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handleJsonSkill({ action: 'unknown', data: '{}' })
      ).rejects.toThrow('Unknown JSON action');
    });
  });
});

describe('CSV Skill Handler', () => {
  describe('parse action', () => {
    it('should parse CSV', async () => {
      const result = await handleCsvSkill({
        action: 'parse',
        data: 'name,age\nJohn,30\nJane,25',
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data.data.length).toBe(2);
      expect(result[0].data.headers).toContain('name');
    });
  });

  describe('toJson action', () => {
    it('should convert to JSON', async () => {
      const result = await handleCsvSkill({
        action: 'toJson',
        data: 'name,age\nJohn,30',
      });

      expect(result[0].type).toBe('text');
      expect(result[0].text).toContain('John');
    });
  });

  describe('filter action', () => {
    it('should filter rows', async () => {
      const result = await handleCsvSkill({
        action: 'filter',
        data: 'name,age\nJohn,30\nJane,25',
        options: {
          filters: [{ column: 'age', operator: 'gt', value: 28 }],
        },
      });

      expect(result[0].text).toContain('John');
      expect(result[0].text).not.toContain('Jane');
    });
  });

  describe('stats action', () => {
    it('should return column statistics', async () => {
      const result = await handleCsvSkill({
        action: 'stats',
        data: 'name,age\nJohn,30\nJane,25',
      });

      expect(result[0].data.length).toBe(2);
    });
  });

  describe('transform action', () => {
    it('should transform columns', async () => {
      const result = await handleCsvSkill({
        action: 'transform',
        data: 'name,age,city\nJohn,30,NYC',
        options: {
          select: ['name', 'city'],
        },
      });

      expect(result[0].text).toContain('name');
      expect(result[0].text).toContain('city');
      expect(result[0].text).not.toContain('age');
    });
  });

  describe('export action', () => {
    it('should export to TSV', async () => {
      const result = await handleCsvSkill({
        action: 'export',
        data: 'name,age\nJohn,30',
        options: { format: 'tsv' },
      });

      expect(result[0].text).toContain('\t');
    });
  });
});

describe('PDF Skill Handler', () => {
  async function createTestPdfBase64(texts: string[]): Promise<string> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([612, 792]);
    let y = 750;
    for (const text of texts) {
      page.drawText(text, { x: 40, y, size: 12, font });
      y -= 20;
    }
    const bytes = await doc.save();
    return Buffer.from(bytes).toString('base64');
  }

  describe('toTemplate action', () => {
    it('should extract template from PDF', async () => {
      const base64Pdf = await createTestPdfBase64(['Hello {{name}}']);

      const result = await handlePdfSkill({
        action: 'toTemplate',
        data: base64Pdf,
        options: { name: 'Test Template' },
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data.version).toBe('1.0');
      expect(result[0].data.metadata.name).toBe('Test Template');
    });
  });

  describe('fromTemplate action', () => {
    it('should generate PDF from template', async () => {
      const template = {
        version: '1.0',
        metadata: { createdAt: new Date().toISOString(), sourcePageCount: 1 },
        pages: [
          {
            width: 612,
            height: 792,
            elements: [
              { type: 'placeholder', content: '{{name}}', fieldName: 'name', x: 40, y: 750 },
            ],
          },
        ],
        fields: [{ name: 'name', defaultValue: '', pages: [1] }],
        fonts: {},
      };

      const result = await handlePdfSkill({
        action: 'fromTemplate',
        data: template,
        options: { data: { name: 'John Doe' } },
      });

      expect(result[0].type).toBe('file');
      expect(result[0].file.mimeType).toBe('application/pdf');
      expect(result[0].file.bytes).toBeTruthy();

      const pdfBytes = Buffer.from(result[0].file.bytes, 'base64');
      const doc = await PDFDocument.load(pdfBytes);
      expect(doc.getPageCount()).toBe(1);
    });
  });

  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handlePdfSkill({ action: 'unknown', data: '' })
      ).rejects.toThrow('Unknown PDF action');
    });
  });
});

describe('XML Skill Handler', () => {
  describe('format action', () => {
    it('should format XML', async () => {
      const result = await handleXmlSkill({
        action: 'format',
        data: '<root><item>hello</item></root>',
      });

      expect(result[0].type).toBe('text');
      expect(result[0].text).toContain('<root>');
      expect(result[0].text).toContain('<item>');
    });
  });

  describe('parse action', () => {
    it('should parse XML to data', async () => {
      const result = await handleXmlSkill({
        action: 'parse',
        data: '<root><item>hello</item></root>',
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('validate action', () => {
    it('should validate XML', async () => {
      const result = await handleXmlSkill({
        action: 'validate',
        data: '<root><item>hello</item></root>',
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handleXmlSkill({ action: 'unknown', data: '' })
      ).rejects.toThrow('Unknown XML action');
    });
  });
});

describe('Excel Skill Handler', () => {
  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handleExcelSkill({ action: 'unknown', data: '' })
      ).rejects.toThrow('Unknown Excel action');
    });
  });
});

describe('Image Skill Handler', () => {
  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handleImageSkill({ action: 'unknown', data: '' })
      ).rejects.toThrow('Unknown Image action');
    });
  });
});

describe('Markdown Skill Handler', () => {
  describe('convert action', () => {
    it('should convert markdown to HTML', async () => {
      const result = await handleMarkdownSkill({
        action: 'convert',
        data: '# Hello\n\nWorld',
        options: { from: 'markdown', to: 'html' },
      });

      expect(result[0].type).toBe('text');
      expect(result[0].text).toContain('Hello');
      expect(result[0].text).toContain('World');
    });
  });

  describe('toc action', () => {
    it('should generate table of contents', async () => {
      const result = await handleMarkdownSkill({
        action: 'toc',
        data: '# Title\n## Section\n### Sub',
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data.entries).toBeDefined();
      expect((result[0].data.entries as unknown[]).length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('stats action', () => {
    it('should return markdown statistics', async () => {
      const result = await handleMarkdownSkill({
        action: 'stats',
        data: '# Hello\n\nSome text here',
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handleMarkdownSkill({ action: 'unknown', data: '' })
      ).rejects.toThrow('Unknown Markdown action');
    });
  });
});

describe('Archive Skill Handler', () => {
  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handleArchiveSkill({ action: 'unknown', data: '' })
      ).rejects.toThrow('Unknown Archive action');
    });
  });
});

describe('Regex Skill Handler', () => {
  describe('test action', () => {
    it('should test regex pattern against input', async () => {
      const result = await handleRegexSkill({
        action: 'test',
        data: 'abc 123 def 456',
        options: { pattern: '\\d+' },
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('replace action', () => {
    it('should replace matched patterns', async () => {
      const result = await handleRegexSkill({
        action: 'replace',
        data: 'abc 123',
        options: { pattern: '\\d+', replacement: 'NUM' },
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('extract action', () => {
    it('should extract matches from input', async () => {
      const result = await handleRegexSkill({
        action: 'extract',
        data: 'abc 123 def 456',
        options: { pattern: '(\\d+)' },
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handleRegexSkill({ action: 'unknown', data: '' })
      ).rejects.toThrow('Unknown Regex action');
    });
  });
});

describe('Diff Skill Handler', () => {
  describe('compare action', () => {
    it('should compare two texts', async () => {
      const result = await handleDiffSkill({
        action: 'compare',
        data: { a: 'hello\nworld', b: 'hello\nearth' },
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('unified action', () => {
    it('should generate unified diff', async () => {
      const result = await handleDiffSkill({
        action: 'unified',
        data: { a: 'hello\nworld', b: 'hello\nearth' },
      });

      expect(result[0].type).toBe('text');
      expect(result[0].text).toBeDefined();
    });
  });

  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handleDiffSkill({ action: 'unknown', data: '' })
      ).rejects.toThrow('Unknown Diff action');
    });
  });
});

describe('SQL Skill Handler', () => {
  describe('format action', () => {
    it('should format SQL query', async () => {
      const result = await handleSqlSkill({
        action: 'format',
        data: 'SELECT id,name FROM users WHERE age>18',
      });

      expect(result[0].type).toBe('text');
      expect(result[0].text).toContain('SELECT');
      expect(result[0].text).toContain('FROM');
    });
  });

  describe('validate action', () => {
    it('should validate SQL query', async () => {
      const result = await handleSqlSkill({
        action: 'validate',
        data: 'SELECT id,name FROM users WHERE age>18',
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('parse action', () => {
    it('should parse SQL query', async () => {
      const result = await handleSqlSkill({
        action: 'parse',
        data: 'SELECT id,name FROM users WHERE age>18',
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handleSqlSkill({ action: 'unknown', data: '' })
      ).rejects.toThrow('Unknown SQL action');
    });
  });
});

describe('Crypto Skill Handler', () => {
  describe('hash action', () => {
    it('should hash with sha256', async () => {
      const result = await handleCryptoSkill({
        action: 'hash',
        data: 'hello',
        options: { algorithm: 'sha256' },
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('encode action', () => {
    it('should encode to base64', async () => {
      const result = await handleCryptoSkill({
        action: 'encode',
        data: 'hello',
        options: { format: 'base64' },
      });

      expect(result[0].type).toBe('text');
      expect(result[0].text).toBe('aGVsbG8=');
    });
  });

  describe('decode action', () => {
    it('should decode from base64', async () => {
      const result = await handleCryptoSkill({
        action: 'decode',
        data: 'aGVsbG8=',
        options: { format: 'base64' },
      });

      expect(result[0].type).toBe('text');
      expect(result[0].text).toBe('hello');
    });
  });

  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handleCryptoSkill({ action: 'unknown', data: '' })
      ).rejects.toThrow('Unknown Crypto action');
    });
  });
});

describe('DateTime Skill Handler', () => {
  describe('parse action', () => {
    it('should parse a date string', async () => {
      const result = await handleDatetimeSkill({
        action: 'parse',
        data: '2024-01-15T10:30:00Z',
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('format action', () => {
    it('should format a date string', async () => {
      const result = await handleDatetimeSkill({
        action: 'format',
        data: '2024-01-15T10:30:00Z',
        options: { format: 'YYYY-MM-DD' },
      });

      expect(result[0].type).toBe('text');
      expect(result[0].text).toContain('2024');
    });
  });

  describe('convertTimezone action', () => {
    it('should convert between timezones', async () => {
      const result = await handleDatetimeSkill({
        action: 'convertTimezone',
        data: '2024-01-15T10:30:00Z',
        options: { from: 'UTC', to: 'America/New_York' },
      });

      expect(result[0].type).toBe('data');
      expect(result[0].data).toBeDefined();
    });
  });

  describe('unknown action', () => {
    it('should throw for unknown action', async () => {
      await expect(
        handleDatetimeSkill({ action: 'unknown', data: '' })
      ).rejects.toThrow('Unknown DateTime action');
    });
  });
});
