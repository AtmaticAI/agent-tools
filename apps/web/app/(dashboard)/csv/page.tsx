'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import * as csv from '@agent-tools/core/csv';
import type { Filter } from '@agent-tools/core/csv';
import { filterData } from '@agent-tools/core/csv';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Copy, Download, Upload, Table2, FileSpreadsheet, FileText, ExternalLink } from 'lucide-react';
import { cn, copyToClipboard, downloadFile } from '@/lib/utils';
import { FilterPanel } from '@/components/csv/FilterPanel';
import { exportToExcel, exportToPDF, openInGoogleSheets } from '@/lib/csv-export';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

export default function CsvPage() {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<csv.ParseResult | null>(null);
  const [stats, setStats] = useState<csv.ColumnStats[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<csv.ExportFormat>('json');
  const [filters, setFilters] = useState<Filter[]>([]);

  const { containerRef, isFullscreen } = useFullscreenContainer();
  const { setSidebarCollapsed } = useUIStore();

  // Auto-collapse sidebar when data is parsed
  useEffect(() => {
    if (parsedData) {
      setSidebarCollapsed(true);
    }
  }, [parsedData, setSidebarCollapsed]);

  // Apply filters to get filtered data
  const filteredData = useMemo(() => {
    if (!parsedData) return null;
    if (filters.length === 0) return parsedData;

    const filtered = filterData(parsedData.data, filters);
    return {
      ...parsedData,
      data: filtered,
      rowCount: filtered.length,
    };
  }, [parsedData, filters]);

  const handleParse = useCallback(() => {
    try {
      const result = csv.parse(input);
      setParsedData(result);
      setStats(csv.getStatsFromData(result));
      setError(null);
      toast.success(`Parsed ${result.rowCount} rows`);
    } catch (err) {
      setError((err as Error).message);
      toast.error('Parse failed');
    }
  }, [input]);

  const handleExport = useCallback(() => {
    if (!filteredData) return;

    try {
      const exported = csv.exportFromData(filteredData, {
        format: exportFormat,
        headers: true,
      });

      const ext = exportFormat === 'jsonl' ? 'jsonl' : exportFormat;
      const mime =
        exportFormat === 'json' || exportFormat === 'jsonl'
          ? 'application/json'
          : 'text/csv';

      downloadFile(exported, `data.${ext}`, mime);
      toast.success('Downloaded');
    } catch {
      toast.error('Export failed');
    }
  }, [filteredData, exportFormat]);

  const handleCopyJson = useCallback(async () => {
    if (!filteredData) return;
    const jsonStr = JSON.stringify(filteredData.data, null, 2);
    await copyToClipboard(jsonStr);
    toast.success('Copied as JSON');
  }, [filteredData]);

  const handleExportExcel = useCallback(async () => {
    if (!filteredData) return;
    try {
      await exportToExcel(filteredData, 'data.xlsx');
      toast.success('Exported to Excel');
    } catch {
      toast.error('Excel export failed');
    }
  }, [filteredData]);

  const handleExportPDF = useCallback(async () => {
    if (!filteredData) return;
    try {
      await exportToPDF(filteredData, 'data.pdf');
      toast.success('Exported to PDF');
    } catch {
      toast.error('PDF export failed');
    }
  }, [filteredData]);

  const handleOpenGoogleSheets = useCallback(async () => {
    if (!filteredData) return;
    try {
      await openInGoogleSheets(filteredData);
      toast.success('Data copied! Paste into Google Sheets');
    } catch {
      toast.error('Failed to open Google Sheets');
    }
  }, [filteredData]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">CSV Viewer</h1>
          <p className="text-muted-foreground">
            Parse, filter, transform, and export CSV data
          </p>
          <ToolEnableToggle toolId="csv" />
        </div>
        <AIIntegrationBadge tool="csv" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Input</CardTitle>
            <CardDescription>Paste CSV or upload a file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="relative">
                <label>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
              </Button>
              <Button onClick={handleParse}>Parse</Button>
            </div>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="name,email,age
John,john@example.com,30
Jane,jane@example.com,25"
              className="h-[300px] font-mono text-sm resize-none"
            />

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </CardContent>
        </Card>

        <div
          ref={containerRef}
          className={cn(
            'lg:col-span-2',
            isFullscreen && 'bg-background p-6 h-screen'
          )}
        >
          <Card className={cn(isFullscreen && 'h-full flex flex-col')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Data View</CardTitle>
                  {filteredData && (
                    <CardDescription>
                      {filteredData.rowCount} rows × {filteredData.headers.length} columns
                      {filters.length > 0 && parsedData && filteredData.rowCount !== parsedData.rowCount && (
                        <span className="text-muted-foreground"> (filtered from {parsedData.rowCount})</span>
                      )}
                    </CardDescription>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {filteredData && (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleCopyJson}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy JSON
                      </Button>
                      <Select
                        value={exportFormat}
                        onValueChange={(v) => setExportFormat(v as csv.ExportFormat)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="tsv">TSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="jsonl">JSONL</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportExcel}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Excel
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportPDF}>
                        <FileText className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleOpenGoogleSheets}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Google Sheets
                      </Button>
                      <Separator orientation="vertical" className="h-6" />
                    </>
                  )}
                  <FullscreenButton targetRef={containerRef} variant="ghost" />
                </div>
              </div>
            </CardHeader>
            <CardContent className={cn('space-y-4', isFullscreen && 'flex-1')}>
              {parsedData && (
                <FilterPanel
                  columns={parsedData.headers}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              )}
              {filteredData ? (
                <ScrollArea className={cn(
                  'rounded-md border',
                  isFullscreen ? 'h-[calc(100vh-280px)]' : 'h-[500px]'
                )}>
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="w-12 border-b border-r px-3 py-2 text-left font-medium text-muted-foreground">
                        #
                      </th>
                      {filteredData.headers.map((header) => (
                        <th
                          key={header}
                          className="border-b border-r px-3 py-2 text-left font-medium"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.data.slice(0, 100).map((row, i) => (
                      <tr key={i} className="hover:bg-muted/50">
                        <td className="border-b border-r px-3 py-2 text-muted-foreground">
                          {i + 1}
                        </td>
                        {filteredData.headers.map((header) => (
                          <td
                            key={header}
                            className="border-b border-r px-3 py-2 font-mono"
                          >
                            {String(row[header] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredData.rowCount > 100 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Showing first 100 of {filteredData.rowCount} rows
                  </div>
                )}
              </ScrollArea>
            ) : (
              <div className="flex h-[500px] items-center justify-center rounded-md border bg-muted/50">
                <div className="text-center text-muted-foreground">
                  <Table2 className="mx-auto mb-2 h-8 w-8" />
                  <p>Parse CSV to see data</p>
                </div>
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      </div>

      {stats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Column Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((col) => (
                <div key={col.name} className="rounded-lg border p-4">
                  <div className="font-medium">{col.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Type: {col.type}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Count: </span>
                      {col.count}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nulls: </span>
                      {col.nullCount}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unique: </span>
                      {col.uniqueCount}
                    </div>
                    {col.type === 'number' && col.mean !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Mean: </span>
                        {col.mean.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
