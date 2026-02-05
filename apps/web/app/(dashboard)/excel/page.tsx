'use client';

import { useState, useCallback } from 'react';
import * as excel from '@agent-tools/core/excel';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard, downloadFile } from '@/lib/utils';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

export default function ExcelPage() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sheets, setSheets] = useState<{ name: string; index: number; rowCount: number; columnCount: number }[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [fileName, setFileName] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'tsv'>('csv');
  const [rawFile, setRawFile] = useState<ArrayBuffer | null>(null);
  const { containerRef, contentRef } = useFullscreenContainer();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);

      const buffer = await file.arrayBuffer();
      setRawFile(buffer);
      const uint8 = new Uint8Array(buffer);

      try {
        const result = await excel.parse(uint8);
        setData(result.data);
        setHeaders(result.headers);
        setSheets(result.sheets);

        const statsResult = await excel.getStats(uint8);
        setStats(statsResult as unknown as Record<string, unknown>);

        setSidebarCollapsed(true);
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    [setSidebarCollapsed]
  );

  const handleExport = useCallback(async () => {
    if (!rawFile) return;
    try {
      const result = await excel.convert(new Uint8Array(rawFile), exportFormat);
      const ext = exportFormat === 'json' ? 'json' : exportFormat;
      downloadFile(result, `export.${ext}`, 'text/plain');
      toast.success(`Exported as ${exportFormat.toUpperCase()}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, [rawFile, exportFormat]);

  return (
    <main className="flex-1 overflow-auto p-6" ref={containerRef}>
      <div ref={contentRef}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Excel Viewer</h1>
            <p className="text-muted-foreground">
              Parse, view, and convert Excel spreadsheets
            </p>
            <ToolEnableToggle toolId="excel" />
          </div>
          <AIIntegrationBadge tool="excel" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Excel File</CardTitle>
            <CardDescription>
              Drop an .xlsx file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50">
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {fileName || 'Click to upload .xlsx file'}
              </span>
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </CardContent>
        </Card>

        {stats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">{sheets.length}</div>
                  <div className="text-xs text-muted-foreground">Sheets</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">{data.length}</div>
                  <div className="text-xs text-muted-foreground">Rows</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">{headers.length}</div>
                  <div className="text-xs text-muted-foreground">Columns</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">
                    {sheets.map((s) => s.name).join(', ')}
                  </div>
                  <div className="text-xs text-muted-foreground">Sheet Names</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {data.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  Showing {Math.min(data.length, 100)} of {data.length} rows
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as 'json' | 'csv' | 'tsv')}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="tsv">TSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="mr-1 h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    copyToClipboard(JSON.stringify(data, null, 2));
                    toast.success('Copied as JSON');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <FullscreenButton />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-1 text-left text-xs text-muted-foreground">#</th>
                      {headers.map((h) => (
                        <th key={h} className="px-2 py-1 text-left text-xs font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 100).map((row, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-2 py-1 text-xs text-muted-foreground">{i + 1}</td>
                        {headers.map((h) => (
                          <td key={h} className="px-2 py-1 font-mono text-xs">
                            {String(row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
