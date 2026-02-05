export interface ExcelParseOptions {
  sheet?: string | number;
  header?: boolean;
  range?: string;
}

export interface ExcelParseResult {
  sheets: SheetInfo[];
  data: Record<string, unknown>[];
  headers: string[];
  rowCount: number;
}

export interface SheetInfo {
  name: string;
  index: number;
  rowCount: number;
  columnCount: number;
}

export interface ExcelExportOptions {
  sheetName?: string;
  headers?: boolean;
}

export interface ExcelStats {
  sheets: number;
  totalRows: number;
  totalColumns: number;
  sheetDetails: SheetInfo[];
  sizeBytes: number;
}

export interface ExcelConvertOptions {
  sheet?: string | number;
  header?: boolean;
}

export type ExcelConvertFormat = 'json' | 'csv' | 'tsv';
