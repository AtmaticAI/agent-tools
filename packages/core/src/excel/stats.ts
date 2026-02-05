import ExcelJS from 'exceljs';
import type { ExcelStats, SheetInfo } from './types';

export async function getStats(file: Buffer | Uint8Array): Promise<ExcelStats> {
  const workbook = new ExcelJS.Workbook();
  // @ts-expect-error - exceljs types incompatible with Node.js 22 Buffer
  await workbook.xlsx.load(Buffer.from(file));

  const sheetDetails: SheetInfo[] = [];
  let totalRows = 0;
  let totalColumns = 0;

  workbook.eachSheet((ws, id) => {
    sheetDetails.push({
      name: ws.name,
      index: id,
      rowCount: ws.rowCount,
      columnCount: ws.columnCount,
    });
    totalRows += ws.rowCount;
    totalColumns = Math.max(totalColumns, ws.columnCount);
  });

  return {
    sheets: sheetDetails.length,
    totalRows,
    totalColumns,
    sheetDetails,
    sizeBytes: file.length,
  };
}
