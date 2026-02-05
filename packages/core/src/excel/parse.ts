import ExcelJS from 'exceljs';
import type { ExcelParseOptions, ExcelParseResult, SheetInfo } from './types';

export async function parse(
  file: Buffer | Uint8Array,
  options: ExcelParseOptions = {}
): Promise<ExcelParseResult> {
  const workbook = new ExcelJS.Workbook();
  // @ts-expect-error - exceljs types incompatible with Node.js 22 Buffer
  await workbook.xlsx.load(Buffer.from(file));

  const sheets: SheetInfo[] = [];
  workbook.eachSheet((ws, id) => {
    sheets.push({
      name: ws.name,
      index: id,
      rowCount: ws.rowCount,
      columnCount: ws.columnCount,
    });
  });

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
  const rows: Record<string, unknown>[] = [];
  let headers: string[] = [];

  targetSheet.eachRow((row, rowNumber) => {
    const values = row.values as unknown[];
    const cells = values.slice(1);

    if (rowNumber === 1 && useHeaders) {
      headers = cells.map((c, i) => String(c ?? `Column${i + 1}`));
      return;
    }

    const record: Record<string, unknown> = {};
    const keys = useHeaders && headers.length > 0 ? headers : cells.map((_, i) => `Column${i + 1}`);

    if (!useHeaders && rowNumber === 1) {
      headers = keys;
    }

    keys.forEach((key, i) => {
      const val = cells[i];
      record[key] = val instanceof Date ? val.toISOString() : (val ?? null);
    });
    rows.push(record);
  });

  return {
    sheets,
    data: rows,
    headers,
    rowCount: rows.length,
  };
}

export async function getSheets(
  file: Buffer | Uint8Array
): Promise<SheetInfo[]> {
  const workbook = new ExcelJS.Workbook();
  // @ts-expect-error - exceljs types incompatible with Node.js 22 Buffer
  await workbook.xlsx.load(Buffer.from(file));

  const sheets: SheetInfo[] = [];
  workbook.eachSheet((ws, id) => {
    sheets.push({
      name: ws.name,
      index: id,
      rowCount: ws.rowCount,
      columnCount: ws.columnCount,
    });
  });

  return sheets;
}
