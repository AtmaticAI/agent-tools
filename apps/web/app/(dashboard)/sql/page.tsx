'use client';

import { useState, useCallback } from 'react';
import * as sql from '@atmaticai/agent-tools-core/sql';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
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
import { Copy, Download, Trash2, AlertCircle, Database } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard, downloadFile } from '@/lib/utils';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

type Dialect = 'mysql' | 'postgresql' | 'sqlite' | 'transactsql' | 'bigquery';

export default function SqlPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [dialect, setDialect] = useState<Dialect>('postgresql');
  const [convertTo, setConvertTo] = useState<Dialect>('mysql');
  const { containerRef } = useFullscreenContainer();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const handleFormat = useCallback(() => {
    try {
      const result = sql.format(input, { dialect, uppercase: true });
      setOutput(result);
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, dialect, setSidebarCollapsed]);

  const handleMinify = useCallback(() => {
    try {
      const result = sql.minify(input);
      setOutput(result);
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, setSidebarCollapsed]);

  const handleValidate = useCallback(() => {
    try {
      const result = sql.validate(input, dialect);
      setOutput(JSON.stringify(result, null, 2));
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, dialect, setSidebarCollapsed]);

  const handleParse = useCallback(() => {
    try {
      const result = sql.parse(input, dialect);
      setOutput(JSON.stringify(result, null, 2));
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, dialect, setSidebarCollapsed]);

  const handleConvert = useCallback(() => {
    try {
      const result = sql.convert(input, { from: dialect, to: convertTo });
      setOutput(result);
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, dialect, convertTo, setSidebarCollapsed]);

  const handleStats = useCallback(() => {
    try {
      const result = sql.getStats(input, dialect);
      setStats(result as unknown as Record<string, unknown>);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, dialect]);

  return (
    <main className="flex-1 overflow-auto p-6" ref={containerRef}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SQL Studio</h1>
            <p className="text-muted-foreground">
              Format, validate, parse, and convert SQL queries
            </p>
            <ToolEnableToggle toolId="sql" />
          </div>
          <AIIntegrationBadge tool="sql" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Dialect:</span>
                <Select value={dialect} onValueChange={(v) => setDialect(v as Dialect)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                    <SelectItem value="transactsql">TransactSQL</SelectItem>
                    <SelectItem value="bigquery">BigQuery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="SELECT * FROM users WHERE active = true;"
                className="min-h-[300px] font-mono text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleFormat}>Format</Button>
                <Button onClick={handleMinify} variant="outline">Minify</Button>
                <Button onClick={handleValidate} variant="outline">Validate</Button>
                <Button onClick={handleParse} variant="outline">Parse</Button>
                <Button onClick={handleStats} variant="outline">Stats</Button>
                <Button
                  onClick={() => {
                    setInput('');
                    setOutput('');
                    setError('');
                    setStats(null);
                  }}
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">Convert to:</span>
                <Select value={convertTo} onValueChange={(v) => setConvertTo(v as Dialect)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                    <SelectItem value="transactsql">TransactSQL</SelectItem>
                    <SelectItem value="bigquery">BigQuery</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleConvert} variant="outline">Convert</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Output</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    copyToClipboard(output);
                    toast.success('Copied');
                  }}
                  disabled={!output}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadFile(output, 'query.sql', 'text/plain')}
                  disabled={!output}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <FullscreenButton targetRef={containerRef} />
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <ScrollArea className="h-[400px]">
                <pre className="whitespace-pre-wrap font-mono text-sm">{output}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {stats && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>SQL Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                    <div className="text-xs text-muted-foreground">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
