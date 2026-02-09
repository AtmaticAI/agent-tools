import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { jsonTools, csvTools, pdfTools, xmlTools, excelTools, imageTools, markdownTools, archiveTools, regexTools, diffTools, sqlTools, cryptoMcpTools, datetimeTools, allTools } from '../tools';

describe('MCP Tools Registration', () => {
  it('should export all tools', () => {
    expect(allTools).toBeDefined();
    expect(allTools.length).toBeGreaterThan(0);
  });

  it('should have JSON tools', () => {
    expect(jsonTools.length).toBeGreaterThan(0);
    const toolNames = jsonTools.map((t) => t.name);
    expect(toolNames).toContain('agent_tools_json_format');
    expect(toolNames).toContain('agent_tools_json_validate');
    expect(toolNames).toContain('agent_tools_json_query');
    expect(toolNames).toContain('agent_tools_json_convert');
    expect(toolNames).toContain('agent_tools_json_diff');
  });

  it('should have CSV tools', () => {
    expect(csvTools.length).toBeGreaterThan(0);
    const toolNames = csvTools.map((t) => t.name);
    expect(toolNames).toContain('agent_tools_csv_parse');
    expect(toolNames).toContain('agent_tools_csv_to_json');
    expect(toolNames).toContain('agent_tools_csv_filter');
    expect(toolNames).toContain('agent_tools_csv_stats');
  });

  it('should have PDF tools', () => {
    expect(pdfTools.length).toBeGreaterThan(0);
    const toolNames = pdfTools.map((t) => t.name);
    expect(toolNames).toContain('agent_tools_pdf_merge');
    expect(toolNames).toContain('agent_tools_pdf_split');
    expect(toolNames).toContain('agent_tools_pdf_extract_text');
    expect(toolNames).toContain('agent_tools_pdf_metadata');
    expect(toolNames).toContain('agent_tools_pdf_to_template');
    expect(toolNames).toContain('agent_tools_pdf_from_template');
    expect(toolNames).toContain('agent_tools_pdf_read_form');
    expect(toolNames).toContain('agent_tools_pdf_fill_form');
  });

  it('all tools should have required properties', () => {
    for (const tool of allTools) {
      expect(tool.name).toBeDefined();
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.handler).toBeDefined();
      expect(typeof tool.handler).toBe('function');
    }
  });
});

describe('JSON MCP Tools', () => {
  const findTool = (name: string) => jsonTools.find((t) => t.name === name)!;

  describe('agent_tools_json_format', () => {
    it('should format JSON with default options', async () => {
      const tool = findTool('agent_tools_json_format');
      const result = await tool.handler({ input: '{"a":1,"b":2}' });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('"a": 1');
    });

    it('should format JSON with custom indent', async () => {
      const tool = findTool('agent_tools_json_format');
      const result = await tool.handler({ input: '{"a":1}', indent: 4 });

      expect(result.content[0].text).toContain('    "a"');
    });

    it('should sort keys when requested', async () => {
      const tool = findTool('agent_tools_json_format');
      const result = await tool.handler({
        input: '{"b":1,"a":2}',
        sortKeys: true
      });

      const parsed = result.content[0].text;
      expect(parsed.indexOf('"a"')).toBeLessThan(parsed.indexOf('"b"'));
    });

    it('should handle invalid JSON', async () => {
      const tool = findTool('agent_tools_json_format');
      const result = await tool.handler({ input: '{invalid}' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error');
    });
  });

  describe('agent_tools_json_validate', () => {
    it('should validate valid JSON', async () => {
      const tool = findTool('agent_tools_json_validate');
      const result = await tool.handler({ input: '{"name":"test"}' });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.valid).toBe(true);
    });

    it('should validate against schema', async () => {
      const tool = findTool('agent_tools_json_validate');
      const schema = JSON.stringify({
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
      });

      const result = await tool.handler({
        input: '{"name":"test"}',
        schema,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.valid).toBe(true);
    });

    it('should report validation errors', async () => {
      const tool = findTool('agent_tools_json_validate');
      const schema = JSON.stringify({
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
      });

      const result = await tool.handler({
        input: '{}',
        schema,
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.valid).toBe(false);
      expect(parsed.errors).toBeDefined();
    });
  });

  describe('agent_tools_json_query', () => {
    it('should query with JSONPath', async () => {
      const tool = findTool('agent_tools_json_query');
      const result = await tool.handler({
        input: '{"store":{"book":[{"author":"John"},{"author":"Jane"}]}}',
        path: '$.store.book[*].author',
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toContain('John');
      expect(parsed).toContain('Jane');
    });

    it('should query with JMESPath', async () => {
      const tool = findTool('agent_tools_json_query');
      const result = await tool.handler({
        input: '{"people":[{"name":"John"},{"name":"Jane"}]}',
        path: 'people[*].name',
        dialect: 'jmespath',
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toContain('John');
    });
  });

  describe('agent_tools_json_convert', () => {
    it('should convert JSON to YAML', async () => {
      const tool = findTool('agent_tools_json_convert');
      const result = await tool.handler({
        input: '{"name":"test","value":42}',
        from: 'json',
        to: 'yaml',
      });

      expect(result.content[0].text).toContain('name: test');
      expect(result.content[0].text).toContain('value: 42');
    });
  });

  describe('agent_tools_json_diff', () => {
    it('should detect identical documents', async () => {
      const tool = findTool('agent_tools_json_diff');
      const result = await tool.handler({
        a: '{"a":1}',
        b: '{"a":1}',
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.identical).toBe(true);
    });

    it('should detect differences', async () => {
      const tool = findTool('agent_tools_json_diff');
      const result = await tool.handler({
        a: '{"a":1}',
        b: '{"a":2,"b":3}',
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.identical).toBe(false);
      expect(parsed.operations.length).toBeGreaterThan(0);
    });
  });
});

describe('CSV MCP Tools', () => {
  const findTool = (name: string) => csvTools.find((t) => t.name === name)!;

  describe('agent_tools_csv_parse', () => {
    it('should parse CSV data', async () => {
      const tool = findTool('agent_tools_csv_parse');
      const result = await tool.handler({
        input: 'name,age\nJohn,30\nJane,25',
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.length).toBe(2);
      expect(parsed.headers).toContain('name');
      expect(parsed.headers).toContain('age');
    });

    it('should detect delimiter', async () => {
      const tool = findTool('agent_tools_csv_parse');
      const result = await tool.handler({
        input: 'name\tage\nJohn\t30',
        delimiter: '\t',
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.data.length).toBe(1);
    });
  });

  describe('agent_tools_csv_to_json', () => {
    it('should convert CSV to JSON', async () => {
      const tool = findTool('agent_tools_csv_to_json');
      const result = await tool.handler({
        input: 'name,age\nJohn,30',
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed[0].name).toBe('John');
      expect(parsed[0].age).toBe(30);
    });
  });

  describe('agent_tools_csv_filter', () => {
    it('should filter rows', async () => {
      const tool = findTool('agent_tools_csv_filter');
      const result = await tool.handler({
        input: 'name,age\nJohn,30\nJane,25\nBob,35',
        filters: [{ column: 'age', operator: 'gt', value: 28 }],
      });

      expect(result.content[0].text).toContain('John');
      expect(result.content[0].text).toContain('Bob');
      expect(result.content[0].text).not.toContain('Jane');
    });
  });

  describe('agent_tools_csv_stats', () => {
    it('should get column statistics', async () => {
      const tool = findTool('agent_tools_csv_stats');
      const result = await tool.handler({
        input: 'name,age\nJohn,30\nJane,25\nBob,35',
      });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.length).toBe(2);

      const ageStats = parsed.find((s: { name: string }) => s.name === 'age');
      expect(ageStats).toBeDefined();
      expect(ageStats.type).toBe('number');
    });
  });
});

describe('PDF Template MCP Tools', () => {
  const findTool = (name: string) => pdfTools.find((t) => t.name === name)!;

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

  describe('agent_tools_pdf_to_template', () => {
    it('should extract template from PDF', async () => {
      const tool = findTool('agent_tools_pdf_to_template');
      const base64Pdf = await createTestPdfBase64(['Hello {{name}}']);

      const result = await tool.handler({ file: base64Pdf });

      const template = JSON.parse(result.content[0].text);
      expect(template.version).toBe('1.0');
      expect(template.pages).toHaveLength(1);
      expect(template.metadata.sourcePageCount).toBe(1);
    });

    it('should accept name and description', async () => {
      const tool = findTool('agent_tools_pdf_to_template');
      const base64Pdf = await createTestPdfBase64(['Test']);

      const result = await tool.handler({
        file: base64Pdf,
        name: 'My Template',
        description: 'A test template',
      });

      const template = JSON.parse(result.content[0].text);
      expect(template.metadata.name).toBe('My Template');
      expect(template.metadata.description).toBe('A test template');
    });
  });

  describe('agent_tools_pdf_from_template', () => {
    it('should generate PDF from template', async () => {
      const tool = findTool('agent_tools_pdf_from_template');

      const template = {
        version: '1.0' as const,
        metadata: { createdAt: new Date().toISOString(), sourcePageCount: 1 },
        pages: [
          {
            width: 612,
            height: 792,
            elements: [
              { type: 'text', content: 'Hello World', x: 40, y: 750 },
            ],
          },
        ],
        fields: [],
        fonts: {},
      };

      const result = await tool.handler({ template });

      expect(result.content[0].text).toBeTruthy();
      const pdfBytes = Buffer.from(result.content[0].text, 'base64');
      const doc = await PDFDocument.load(pdfBytes);
      expect(doc.getPageCount()).toBe(1);
    });

    it('should replace placeholders with data', async () => {
      const tool = findTool('agent_tools_pdf_from_template');

      const template = {
        version: '1.0' as const,
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

      const result = await tool.handler({
        template,
        data: { name: 'John' },
      });

      const pdfBytes = Buffer.from(result.content[0].text, 'base64');
      const doc = await PDFDocument.load(pdfBytes);
      expect(doc.getPageCount()).toBe(1);
    });
  });
});

describe('XML MCP Tools', () => {
  const findTool = (name: string) => xmlTools.find((t) => t.name === name)!;

  describe('agent_tools_xml_parse', () => {
    it('should parse XML into JSON', async () => {
      const tool = findTool('agent_tools_xml_parse');
      const result = await tool.handler({ input: '<root><item>hello</item></root>' });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('root');
      expect(result.content[0].text).toContain('hello');
    });
  });

  describe('agent_tools_xml_format', () => {
    it('should pretty-print XML', async () => {
      const tool = findTool('agent_tools_xml_format');
      const result = await tool.handler({ input: '<root><item>hello</item></root>' });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('<root>');
      expect(result.content[0].text).toContain('<item>');
    });
  });

  describe('agent_tools_xml_validate', () => {
    it('should validate well-formed XML', async () => {
      const tool = findTool('agent_tools_xml_validate');
      const result = await tool.handler({ input: '<root><item>hello</item></root>' });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.valid).toBe(true);
    });
  });

  describe('agent_tools_xml_convert', () => {
    it('should convert XML to JSON', async () => {
      const tool = findTool('agent_tools_xml_convert');
      const result = await tool.handler({
        input: '<root><item>hello</item></root>',
        from: 'xml',
        to: 'json',
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('root');
      expect(result.content[0].text).toContain('hello');
    });
  });
});

describe('Excel MCP Tools', () => {
  it('should have agent_tools_excel_parse tool registered', () => {
    const tool = excelTools.find((t) => t.name === 'agent_tools_excel_parse');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('agent_tools_excel_parse');
    expect(typeof tool!.handler).toBe('function');
  });

  it('should have agent_tools_excel_convert tool registered', () => {
    const tool = excelTools.find((t) => t.name === 'agent_tools_excel_convert');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('agent_tools_excel_convert');
    expect(typeof tool!.handler).toBe('function');
  });

  it('should have agent_tools_excel_stats tool registered', () => {
    const tool = excelTools.find((t) => t.name === 'agent_tools_excel_stats');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('agent_tools_excel_stats');
    expect(typeof tool!.handler).toBe('function');
  });
});

describe('Image MCP Tools', () => {
  it('should have agent_tools_image_resize tool registered', () => {
    const tool = imageTools.find((t) => t.name === 'agent_tools_image_resize');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('agent_tools_image_resize');
    expect(typeof tool!.handler).toBe('function');
  });

  it('should have agent_tools_image_convert tool registered', () => {
    const tool = imageTools.find((t) => t.name === 'agent_tools_image_convert');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('agent_tools_image_convert');
    expect(typeof tool!.handler).toBe('function');
  });

  it('should have agent_tools_image_metadata tool registered', () => {
    const tool = imageTools.find((t) => t.name === 'agent_tools_image_metadata');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('agent_tools_image_metadata');
    expect(typeof tool!.handler).toBe('function');
  });
});

describe('Markdown MCP Tools', () => {
  const findTool = (name: string) => markdownTools.find((t) => t.name === name)!;

  describe('agent_tools_markdown_convert', () => {
    it('should convert markdown to HTML', async () => {
      const tool = findTool('agent_tools_markdown_convert');
      const result = await tool.handler({
        input: '# Hello\n\nWorld',
        from: 'markdown',
        to: 'html',
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Hello');
      expect(result.content[0].text).toContain('World');
    });
  });

  describe('agent_tools_markdown_toc', () => {
    it('should generate a table of contents', async () => {
      const tool = findTool('agent_tools_markdown_toc');
      const result = await tool.handler({ input: '# Title\n## Section\n### Sub' });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.length).toBeGreaterThan(0);
      expect(parsed[0].text).toBe('Title');
    });
  });

  describe('agent_tools_markdown_stats', () => {
    it('should return document statistics', async () => {
      const tool = findTool('agent_tools_markdown_stats');
      const result = await tool.handler({ input: '# Hello\n\nSome text here' });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.words).toBeGreaterThan(0);
    });
  });
});

describe('Archive MCP Tools', () => {
  it('should have agent_tools_archive_create tool registered', () => {
    const tool = archiveTools.find((t) => t.name === 'agent_tools_archive_create');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('agent_tools_archive_create');
    expect(typeof tool!.handler).toBe('function');
  });

  it('should have agent_tools_archive_extract tool registered', () => {
    const tool = archiveTools.find((t) => t.name === 'agent_tools_archive_extract');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('agent_tools_archive_extract');
    expect(typeof tool!.handler).toBe('function');
  });

  it('should have agent_tools_archive_list tool registered', () => {
    const tool = archiveTools.find((t) => t.name === 'agent_tools_archive_list');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('agent_tools_archive_list');
    expect(typeof tool!.handler).toBe('function');
  });
});

describe('Regex MCP Tools', () => {
  const findTool = (name: string) => regexTools.find((t) => t.name === name)!;

  describe('agent_tools_regex_test', () => {
    it('should test regex pattern against input', async () => {
      const tool = findTool('agent_tools_regex_test');
      const result = await tool.handler({ pattern: '\\d+', input: 'abc 123 def 456' });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.matches).toBe(true);
      expect(parsed.matchCount).toBeGreaterThan(0);
    });
  });

  describe('agent_tools_regex_replace', () => {
    it('should replace regex matches', async () => {
      const tool = findTool('agent_tools_regex_replace');
      const result = await tool.handler({
        pattern: '\\d+',
        input: 'abc 123',
        replacement: 'NUM',
      });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.output).toContain('NUM');
    });
  });

  describe('agent_tools_regex_extract', () => {
    it('should extract regex matches', async () => {
      const tool = findTool('agent_tools_regex_extract');
      const result = await tool.handler({ pattern: '(\\d+)', input: 'abc 123 def 456' });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.matches.length).toBeGreaterThan(0);
    });
  });
});

describe('Diff MCP Tools', () => {
  const findTool = (name: string) => diffTools.find((t) => t.name === name)!;

  describe('agent_tools_diff_compare', () => {
    it('should compare two texts and return differences', async () => {
      const tool = findTool('agent_tools_diff_compare');
      const result = await tool.handler({ a: 'hello\nworld', b: 'hello\nearth' });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.changes).toBeDefined();
      expect(parsed.changes.length).toBeGreaterThan(0);
    });
  });

  describe('agent_tools_diff_unified', () => {
    it('should generate unified diff', async () => {
      const tool = findTool('agent_tools_diff_unified');
      const result = await tool.handler({ a: 'hello\nworld', b: 'hello\nearth' });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('---');
      expect(result.content[0].text).toContain('+++');
    });
  });

  describe('agent_tools_diff_apply', () => {
    it('should have the apply tool registered', () => {
      const tool = findTool('agent_tools_diff_apply');
      expect(tool).toBeDefined();
      expect(tool.name).toBe('agent_tools_diff_apply');
      expect(typeof tool.handler).toBe('function');
    });
  });
});

describe('SQL MCP Tools', () => {
  const findTool = (name: string) => sqlTools.find((t) => t.name === name)!;

  describe('agent_tools_sql_format', () => {
    it('should format a SQL query', async () => {
      const tool = findTool('agent_tools_sql_format');
      const result = await tool.handler({
        input: 'SELECT id,name FROM users WHERE age>18 ORDER BY name',
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('SELECT');
      expect(result.content[0].text).toContain('FROM');
      expect(result.content[0].text).toContain('users');
    });
  });

  describe('agent_tools_sql_parse', () => {
    it('should parse a SQL query', async () => {
      const tool = findTool('agent_tools_sql_parse');
      const result = await tool.handler({
        input: 'SELECT id,name FROM users WHERE age>18 ORDER BY name',
      });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.type).toBeDefined();
    });
  });

  describe('agent_tools_sql_validate', () => {
    it('should validate a SQL query', async () => {
      const tool = findTool('agent_tools_sql_validate');
      const result = await tool.handler({
        input: 'SELECT id,name FROM users WHERE age>18 ORDER BY name',
      });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.valid).toBe(true);
    });
  });
});

describe('Crypto MCP Tools', () => {
  const findTool = (name: string) => cryptoMcpTools.find((t) => t.name === name)!;

  describe('agent_tools_crypto_hash', () => {
    it('should hash a string with sha256', async () => {
      const tool = findTool('agent_tools_crypto_hash');
      const result = await tool.handler({ input: 'hello', algorithm: 'sha256' });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.hash).toBeDefined();
      expect(parsed.algorithm).toBe('sha256');
    });
  });

  describe('agent_tools_crypto_encode', () => {
    it('should encode a string to base64', async () => {
      const tool = findTool('agent_tools_crypto_encode');
      const result = await tool.handler({ input: 'hello', format: 'base64' });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('aGVsbG8=');
    });
  });

  describe('agent_tools_crypto_decode', () => {
    it('should decode a base64 string', async () => {
      const tool = findTool('agent_tools_crypto_decode');
      const result = await tool.handler({ input: 'aGVsbG8=', format: 'base64' });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('hello');
    });
  });

  describe('agent_tools_crypto_jwt_decode', () => {
    it('should have the jwt decode tool registered', () => {
      const tool = findTool('agent_tools_crypto_jwt_decode');
      expect(tool).toBeDefined();
      expect(tool.name).toBe('agent_tools_crypto_jwt_decode');
      expect(typeof tool.handler).toBe('function');
    });
  });
});

describe('DateTime MCP Tools', () => {
  const findTool = (name: string) => datetimeTools.find((t) => t.name === name)!;

  describe('agent_tools_datetime_parse', () => {
    it('should parse an ISO date string', async () => {
      const tool = findTool('agent_tools_datetime_parse');
      const result = await tool.handler({ input: '2024-01-15T10:30:00Z' });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.year).toBe(2024);
      expect(parsed.month).toBe(1);
      expect(parsed.day).toBe(15);
    });
  });

  describe('agent_tools_datetime_format', () => {
    it('should format a date with a custom pattern', async () => {
      const tool = findTool('agent_tools_datetime_format');
      const result = await tool.handler({
        input: '2024-01-15T10:30:00Z',
        format: 'yyyy-MM-dd',
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('2024');
      expect(result.content[0].text).toContain('01');
      expect(result.content[0].text).toContain('15');
    });
  });

  describe('agent_tools_datetime_timezone_convert', () => {
    it('should convert between timezones', async () => {
      const tool = findTool('agent_tools_datetime_timezone_convert');
      const result = await tool.handler({
        input: '2024-01-15T10:30:00Z',
        from: 'UTC',
        to: 'America/New_York',
      });

      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toBeDefined();
    });
  });
});
