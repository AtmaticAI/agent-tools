'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Download, Archive, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

interface ArchiveEntry {
  path: string;
  size: number;
  compressedSize?: number;
  isDirectory: boolean;
  modified?: string;
}

export default function ArchivePage() {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [fileName, setFileName] = useState('');
  const [rawBase64, setRawBase64] = useState('');
  const { containerRef, contentRef } = useFullscreenContainer();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      setRawBase64(base64);

      try {
        const listRes = await fetch('/api/archive/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64 }),
        });
        const listData = await listRes.json();
        setEntries(listData.entries || []);

        const statsRes = await fetch('/api/archive/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64 }),
        });
        const statsData = await statsRes.json();
        setStats(statsData);
        setSidebarCollapsed(true);
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    [setSidebarCollapsed]
  );

  const handleExtractAll = useCallback(async () => {
    if (!rawBase64) return;
    try {
      const res = await fetch('/api/archive/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: rawBase64 }),
      });
      const data = await res.json();
      toast.success(`Extracted ${data.files?.length ?? 0} files`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, [rawBase64]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <main className="flex-1 overflow-auto p-6" ref={containerRef}>
      <div ref={contentRef}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Archive Manager</h1>
            <p className="text-muted-foreground">
              Create, extract, and inspect ZIP archives
            </p>
            <ToolEnableToggle toolId="archive" />
          </div>
          <AIIntegrationBadge tool="archive" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Archive</CardTitle>
            <CardDescription>Upload a .zip file to inspect or extract</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50">
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {fileName || 'Click to upload .zip file'}
              </span>
              <input type="file" accept=".zip" className="hidden" onChange={handleFileUpload} />
            </label>
          </CardContent>
        </Card>

        {stats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archive Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {['fileCount', 'directoryCount', 'totalSize', 'compressedSize'].map((key) => (
                  <div key={key} className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">
                      {key.includes('Size')
                        ? formatSize(stats[key] as number)
                        : String(stats[key])}
                    </div>
                    <div className="text-xs text-muted-foreground">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {entries.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Contents ({entries.length} entries)
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExtractAll}>
                  <Download className="mr-1 h-4 w-4" />
                  Extract All
                </Button>
                <FullscreenButton />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-1 text-left">Path</th>
                      <th className="px-2 py-1 text-right">Size</th>
                      <th className="px-2 py-1 text-right">Compressed</th>
                      <th className="px-2 py-1 text-left">Modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-2 py-1 font-mono text-xs">
                          {entry.isDirectory ? '📁 ' : '📄 '}
                          {entry.path}
                        </td>
                        <td className="px-2 py-1 text-right text-xs">{formatSize(entry.size)}</td>
                        <td className="px-2 py-1 text-right text-xs">
                          {entry.compressedSize ? formatSize(entry.compressedSize) : '-'}
                        </td>
                        <td className="px-2 py-1 text-xs text-muted-foreground">
                          {entry.modified ? new Date(entry.modified).toLocaleDateString() : '-'}
                        </td>
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
