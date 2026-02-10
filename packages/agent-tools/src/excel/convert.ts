import ExcelJS from 'exceljs';
import type { ExcelConvertOptions, ExcelConvertFormat } from './types';

export async function convert(
  file: Buffer | Uint8Array,
  format: ExcelConvertFormat,
  options: ExcelConvertOptions = {}
): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  // @ts-expect-error - exceljs types incompatible with Node.js 22 Buffer
  await workbook.xlsx.load(Buffer.from(file));

  const targetSheet =
    typeof options.sheet === 'number'
      ? workbook.worksheets[options.sheet]
      : typeof options.sheet === 'string'
        ? workbook.getWorksheet(options.sheet)
        : workbook.worksheets[0];

  if (!targetSheet) {
    throw new Error('Sheet not found');
  }

  const useHeaders = options.header ?? true;
  const allRows: unknown[][] = [];

  targetSheet.eachRow((row) => {
    const values = row.values as unknown[];
    allRows.push(values.slice(1).map((v) => (v instanceof Date ? v.toISOString() : v)));
  });

  if (allRows.length === 0) return '';

  const headers = useHeaders
    ? allRows[0].map((c, i) => String(c ?? `Column${i + 1}`))
    : allRows[0].map((_, i) => `Column${i + 1}`);
  const dataRows = useHeaders ? allRows.slice(1) : allRows;

  switch (format) {
    case 'json': {
      const records = dataRows.map((row) => {
        const record: Record<string, unknown> = {};
        headers.forEach((h, i) => {
          record[h] = row[i] ?? null;
        });
        return record;
      });
      return JSON.stringify(records, null, 2);
    }
    case 'csv':
      return toDSV(headers, dataRows, ',');
    case 'tsv':
      return toDSV(headers, dataRows, '\t');
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function toDSV(headers: string[], rows: unknown[][], delimiter: string): string {
  const escape = (val: unknown): string => {
    const str = String(val ?? '');
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.map(escape).join(delimiter)];
  for (const row of rows) {
    lines.push(headers.map((_, i) => escape(row[i])).join(delimiter));
  }
  return lines.join('\n');
}

export async function createExcel(
  data: Record<string, unknown>[],
  sheetName = 'Sheet1'
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  if (data.length === 0) {
    const buffer = await workbook.xlsx.writeBuffer();
    return new Uint8Array(buffer);
  }

  const headers = Object.keys(data[0]);
  sheet.addRow(headers);

  for (const record of data) {
    sheet.addRow(headers.map((h) => record[h]));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
